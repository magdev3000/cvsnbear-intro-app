const fs = require("fs");
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("koa2-cors");
const next = require("next");
const { default: createShopifyAuth } = require("@shopify/koa-shopify-auth");
const { verifyRequest } = require("@shopify/koa-shopify-auth");
const session = require("koa-session");
const logger = require("koa-logger");
const { default: graphQLProxy } = require("@shopify/koa-shopify-graphql-proxy");
const { ApiVersion } = require("@shopify/koa-shopify-graphql-proxy");
const Router = require("koa-router");
const {
  receiveWebhook,
  registerWebhook
} = require("@shopify/koa-shopify-webhooks");
const url = require("url");
const compression = require("compression");
const koaConnect = require("koa-connect");
const Sentry = require("@sentry/node");

const mongo = require("./server/db/mongo");
const Ctrl = require("./server/controller");
const getThemeColors = require("./server/lib/getThemeColors");
const Shop = require("./server/db/models/Shop");
const Settings = require("./server/db/models/Settings");
const {
    apiVersion,
    dev,
    shopifyApiSecretKey,
    shopifyApiKey,
    port,
    tunnelUrl,
    debugMode
  } = require("./server/config");
const app = next({
  dev
});
const handle = app.getRequestHandler();



app.prepare().then(() => {
  const server = new Koa();
  server.use(koaConnect(compression()));
  server.use(bodyParser());
  server.use(cors());

  server.proxy = true;
  const router = new Router();
  mongo(server);
  server.use(session(server));
  server.keys = [shopifyApiSecretKey];
  if (dev) {
    server.use(logger());
  }

  if (!dev) {
    Sentry.init({
      dsn: "https://4897377b856c4ac2aa70079cde8a616b@sentry.io/1864198"
    });
  }

  server.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      err.status = err.statusCode || err.status || 500;
      ctx.body = err.message;
      Ctrl.reportEvent(ctx.session.shop, "error", err.message);
      ctx.app.emit("error", err, ctx);
    }
  });

  router.get("/script", ctx => {
    const content = fs
      .readFileSync("./static/widget.js")
      .toString()
      .replace("{{__SHOP__}}", ctx.query.shop)
      .replace("{{__URL__}}", tunnelUrl);
    // Ctrl.reportEvent(ctx.query.shop, "shop_script_load");
    ctx.res.setHeader("Content-Type", "application/javascript;charset=utf-8");
    ctx.status = 200;
    ctx.res.end(content);
  });

  router.get("/settings", ctx => {
    ctx.res.setHeader("Content-Type", "application/json;charset=utf-8");
    return Ctrl.getSettings(ctx);
  });

  /* 
  BAD SESSION KILLER
  For cases when shop tries to re-install us.
  ref to solution hack: https://github.com/Shopify/quilt/issues/727
  */
  server.use(async (ctx, next) => {
    if (ctx.request.header.cookie) {
      if (
        (ctx.request.url.split("?")[0] === "/" &&
          ctx.request.querystring.split("&") &&
          ctx.request.querystring.split("&")[0].split("=")[0] === "hmac" &&
          ctx.request.querystring.split("&")[1].split("=")[0] !== "locale") ||
        (ctx.request.url.split("?")[0] === "/auth/callback" &&
          ctx.request.querystring.split("&") &&
          ctx.request.querystring.split("&")[1].split("=")[0] === "hmac")
      ) {
        {
          console.log(
            `Killing bad session: url: ${ctx.request.url}, cookie: ${ctx.request.header.cookie}`
          );
          Ctrl.reportEvent(
            ctx.request.header.cookie.shopOrigin,
            "bad_session_killed",
            { value: "reinstall" }
          );
          ctx.request.header.cookie = ctx.request.header.cookie
            .split(" ")
            .filter(
              item =>
                ["koa:sess", "koa:sess.sig"].indexOf(item.split("=")[0]) === -1
            )
            .join(" ");
        }
      }
    }
    await next();
  });

  router.post("/shops/enable", ctx => {
    ctx.res.setHeader("Content-Type", "application/json;charset=utf-8");
    return Ctrl.enableShop(ctx);
  });

  router.post("/shops/disable", ctx => {
    ctx.res.setHeader("Content-Type", "application/json;charset=utf-8");
    return Ctrl.disableShop(ctx);
  });

  router.post("/settings", ctx => {
    ctx.res.setHeader("Content-Type", "application/json;charset=utf-8");
    return Ctrl.setSettings(ctx);
  });

  router.get("/shop", ctx => {
    ctx.res.setHeader("Content-Type", "application/json;charset=utf-8");
    console.log(JSON.stringify(ctx.session));
    return Ctrl.fetchShopDetailsAndReturnResultToClient(ctx);
  });

  router.post("/add-partner-to-program", ctx => {
    ctx.res.setHeader("Content-Type", "application/json;charset=utf-8");
    return Ctrl.addAffiliateToPartnersProgram(ctx);
  });

  server.use(
    debugMode
      ? async (ctx, _next_) => {
          await _next_();
        }
      : createShopifyAuth({
          apiKey: shopifyApiKey,
          secret: shopifyApiSecretKey,
          accessMode: "offline",
          scopes: [
            "write_script_tags",
            "read_script_tags",
            "read_themes",
            "write_themes"
          ],
          async afterAuth(ctx) {
            const { shop: shopOrigin, accessToken } = ctx.session;
            ctx.cookies.set("shopOrigin", shopOrigin, {
              httpOnly: false
            });

            let redirectUrl = "/";

            let shop = await Shop.findOne({
              shopify_domain: shopOrigin
            });
            if (!shop) {
              const shopInformation = await Ctrl.fetchShopDetails(ctx);
              shop = new Shop({
                shopify_domain: shopOrigin,
                accessToken,
                isActive: false,
                shopInformation
              });
              const savedShop = await shop.save();

              const theme_colors = await getThemeColors({
                shopOrigin,
                apiVersion,
                shop
              });

              await new Settings({
                shopId: savedShop._id,
                shopify_domain: shopOrigin,
                theme_colors
              }).save();
              Ctrl.addNewSubscriberToEmailList(shopInformation);
              Ctrl.reportEvent(
                ctx.session.shop,
                "install",
                shopInformation.plan_name,
                { userProps: { ...shopInformation } }
              );
              const uninstallWebhookRegistration = await registerWebhook({
                topic: "APP_UNINSTALLED",
                address: `${tunnelUrl}webhooks/uninstall`,
                format: "json",
                accessToken,
                shop: shopOrigin,
                apiVersion
              });
              if (uninstallWebhookRegistration.success) {
                console.log("Successfully registered uninstall webhook");
              } else {
                console.log(
                  "Failed to register webhook",
                  uninstallWebhookRegistration.result
                );
              }

              const shopUpdateWebhookRegistration = await registerWebhook({
                topic: "SHOP_UPDATE",
                address: `${tunnelUrl}webhooks/shop-update`,
                format: "json",
                accessToken,
                shop: shopOrigin,
                apiVersion
              });
              if (shopUpdateWebhookRegistration.success) {
                console.log("Successfully registered shop update webhook");
              } else {
                console.log(
                  "Failed to register shop update webhook",
                  shopUpdateWebhookRegistration.result
                );
              }
            } else {
              shop.accessToken = accessToken;
              await shop.save();
            }
            ctx.redirect(redirectUrl);
          }
        })
  );

  /*
  BAD SESSION KILLER
  Case there's a bad session kill it and redirect to auth flow
  */
  server.use(async (ctx, _next_) => {
    const { shop: shopOrigin, accessToken } = ctx.session;

    let queryData = url.parse(ctx.request.url, true);
    const requestPath = ctx.request.url;
    if (
      shopOrigin &&
      queryData.query["shop"] &&
      shopOrigin !== queryData.query["shop"]
    ) {
      if (!requestPath.match(/^\/script|^\/product/g)) {
        console.debug(`🎤 Dropping invalid session`);
        ctx.session.shopOrigin = null;
        ctx.session.accessToken = null;
        Ctrl.reportEvent(shopOrigin, "bad_session_killed", {
          value: "multiple_shops",
          secondShop: queryData.query["shop"]
        });
        ctx.redirect("/auth");
      }
    }
    await _next_();
  });

  server.use(
    graphQLProxy({
      version: ApiVersion.April19
    })
  );

  server.use(
    receiveWebhook({
      path: "/webhooks/customer-data-request",
      secret: shopifyApiSecretKey,
      onReceived(ctx) {
        console.log("received webhook: ", ctx.state.webhook);
        console.log("ctx: ", JSON.stringify(ctx));
        return Ctrl.uninstallShop(ctx);
      }
    })
  );

  server.use(
    receiveWebhook({
      path: "/webhooks/customer-data-erasure",
      secret: shopifyApiSecretKey,
      onReceived(ctx) {
        console.log("received webhook: ", ctx.state.webhook);
        console.log("ctx: ", JSON.stringify(ctx));
        ctx.status(200);
        ctx.res.end("ok");
      }
    })
  );

  server.use(
    receiveWebhook({
      path: "/webhooks/cvsn-shop-redact",
      secret: shopifyApiSecretKey,
      onReceived(ctx) {
        console.log("received webhook: ", ctx.state.webhook);
        console.log("ctx: ", JSON.stringify(ctx));
        ctx.status(200);
        ctx.res.end("ok");
      }
    })
  );

  server.use(
    receiveWebhook({
      path: "/webhooks/uninstall",
      secret: shopifyApiSecretKey,
      async onReceived(ctx) {
        console.log("received webhook: ", ctx.state.webhook);
        console.log("ctx: ", ctx);
        await ShopInstall.updateOne(
          {
            shopify_domain: ctx.state.webhook.domain
          },
          {
            cancelledAt: new Date()
          }
        );
        return Ctrl.uninstallShop(ctx);
      }
    })
  );

  server.use(
    receiveWebhook({
      path: "/webhooks/app-subscriptions-update",
      secret: shopifyApiSecretKey,
      onReceived(ctx) {
        console.log(
          "received webhook app_subscriptions/update: ",
          ctx.state.webhook
        );
        console.log("ctx.request.body: ", ctx.request.body);
        return Ctrl.processSubscriptionUpdate(ctx);
      }
    })
  );

  server.use(
    receiveWebhook({
      path: "/webhooks/shop-update",
      secret: shopifyApiSecretKey,
      onReceived(ctx) {
        return Ctrl.processShopUpdate(ctx);
      }
    })
  );

  router.get(
    "*",
    debugMode
      ? async (ctx, _next_) => {
          await _next_();
        }
      : verifyRequest({}),
    async ctx => {
      await handle(ctx.req, ctx.res);
      ctx.respond = false;
      ctx.res.statusCode = 200;
    }
  );

  server.use(router.allowedMethods());
  server.use(router.routes());

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
