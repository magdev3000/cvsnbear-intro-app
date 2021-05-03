require("isomorphic-fetch");
const _ = require("lodash");
const Amplitude = require("amplitude");
const axios = require("axios");
const sendgridClient = require("@sendgrid/client");

const sendEmail = require("./lib/sendEmail");
const config = require("./config");
const Shop = require("./db/models/Shop");
const Settings = require("./db/models/Settings");

const { tunnelUrl, apiVersion, amplitudeApiKey, dev, sendgridApiKey } = config;

let amplitude;
try {
  amplitude = new Amplitude(amplitudeApiKey);
} catch (err) {
  console.log(err.message);
}
sendgridClient.setApiKey(sendgridApiKey);

async function processShopUpdate(ctx) {
  try {
    const shopifyDomain = ctx.state.webhook.domain;
    const shopInformation = ctx.request.body;
    reportEvent(shopifyDomain, "server-process_subscription_update");
    console.log(`shop update webhook: ${JSON.stringify(ctx.state.webhook)}`);
    if (shopifyDomain && shopInformation) {
      const shop = await Shop.findOne({ shopify_domain: shopifyDomain });
      if (!shop) {
        reportEvent(shopifyDomain, "error", {
          value: "shop_not_found_process_update_shop"
        });
        ctx.status = 404;
        return;
      }

      shop.shopInformation = shopInformation;
      let savedShop = await shop.save();

      if (savedShop) {
        console.log(`succesfully saved shop information1`);
      }
    }
  } catch (err) {
    console.debug(
      `faced an error when updating shop info for: ${shopifyDomain}, error: ${error}`
    );
    reportEvent(shop, "error", {
      value: "processSubscriptionUpdate",
      message: error.message
    });
    ctx.status = 500;
    ctx.res.end(
      JSON.stringify({
        message: `couldn't process shop update webhook: ${shopifyDomain}`,
        error
      })
    );
  }
}

async function uninstallShop(ctx) {
  try {
    const shop = ctx.header["x-shopify-shop-domain"];
    let shopEmailAddress;
    const queriedShop = await Shop.findOne({
      shopify_domain: shop
    });
    if (queriedShop) {
      if (queriedShop.shopInformation) {
        shopEmailAddress = queriedShop.shopInformation.email;
        addSubscriberToUninstalledList(shopEmailAddress);
      }
    }

    console.debug(`❌ deleting shop: ${shop}`);
    Shop.deleteOne({
      shopify_domain: shop
    }).then(data => {
      console.debug(
        `❌ deleting settings for shop: ${shop}, data: ${JSON.stringify(data)}`
      );
      Settings.deleteOne({
        shopify_domain: shop
      }).then(data => {
        console.debug(
          `🙌 succesfuly uninstalled trust badge app for ${shop}, data: ${JSON.stringify(
            data
          )}`
        );
        reportEvent(shop, "uninstall");

        ctx.status = 200;
        ctx.res.end(
          JSON.stringify({
            status: `succesfully deleted widget for shop: ${shop}`
          })
        );
      });
    });
  } catch (error) {
    console.debug(
      `faced an error when uninstalling app from: ${shop}, error: ${error}`
    );
    reportEvent(shop, "error", { value: "uninstall", message: error.message });
    ctx.status = 500;
    ctx.res.end(
      JSON.stringify({
        message: `couldn't uninstall: ${shop}`,
        error: error
      })
    );
  }
}

async function fetchShopDetailsAndReturnResultToClient(ctx) {
  const shop = await Shop.findOne({
    shopify_domain: ctx.session.shop
  });
  if (shop) {
    // console.debug(`Returning information about shop: ${shop}`)
    ctx.status = 200;
    ctx.res.end(
      JSON.stringify({
        shopInformation: shop.shopInformation
      })
    );
  } else {
    ctx.status = 400;
    reportEvent(ctx.shop, "error", { value: "could not fetch shop details" });
    ctx.res.end(
      JSON.stringify({
        error: `couldn't fetch shop details for ${shop}`
      })
    );
  }

  return;
}
async function fetchShopDetails(ctx) {
  const shopOrigin = ctx.session.shop;
  const accessToken = ctx.session.accessToken;
  // console.debug(`fetching shop info for: ${JSON.stringify(shopOrigin)}`)
  if (!shopOrigin || !accessToken) {
    console.log(
      `Can't fetch shop information because shopOrigin/accessToken params are missing/bad`
    );
    ctx.status = 401;
    return;
  }
  try {
    // console.debug(`>fetchShopDetails: Shop origin: ${shopOrigin}`)
    let response = await fetch(
      `https://${shopOrigin}/admin/api/${apiVersion}/shop.json`,
      {
        credentials: "include",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json"
        }
      }
    );
    let jsonData = await response.json();
    if (!jsonData) {
      // console.debug(`no data was received for: ${shopOrigin}`);
      ctx.status = 401;
      return;
    } else {
      // console.debug(`recieved the following shop information: ${JSON.stringify(jsonData)}`)
      ctx.status = 200;
      return jsonData.shop;
    }
  } catch (error) {
    ctx.status = 400;
    reportEvent(ctx.shop, "error", {
      value: "error when fetching for shop details"
    });
    console.debug(
      `error when fetching for shop: ${shopOrigin}. error information: ${error}`
    );
  }
}

async function disableShop(ctx, shopifyDomain) {
  let shopOrigin;
  if (shopifyDomain) {
    shopOrigin = shopifyDomain;
  } else {
    shopOrigin = ctx.cookies.get("shopOrigin");
  }

  if (!shopOrigin) {
    ctx.status = 403;
    return;
  }
  const shop = await Shop.findOne({ shopify_domain: shopOrigin });
  if (!shop) {
    reportEvent(shopOrigin, "error", { value: "shop_not_found_disable_app" });
    ctx.status = 404;
    return;
  }
  if (!shop.isActive) {
    ctx.status = 400;
    ctx.res.end(JSON.stringify({ message: "the shop is already disabled" }));
    return;
  }

  try {
    let response = await fetch(
      `https://${shopOrigin}/admin/api/${apiVersion}/script_tags.json`,
      {
        credentials: "include",
        headers: {
          "X-Shopify-Access-Token": shop.accessToken,
          "Content-Type": "application/json"
        }
      }
    );
    let jsonData = await response.json();
    if (!jsonData || !Array.isArray(jsonData.script_tags)) {
      ctx.status = 404;
      ctx.res.end(JSON.stringify({ message: "no script tags" }));
      return;
    }
    const cvsnScript = jsonData.script_tags.find(
      item => item.src.indexOf("app=cvsn") > -1
    );
    if (!cvsnScript) {
      ctx.status = 404;
      ctx.res.end(JSON.stringify({ message: "no sticky script tags" }));
      reportEvent(shopOrigin, "error", { value: "server_script_not_found" });
      return;
    }

    response = await fetch(
      `https://${shopOrigin}/admin/api/${apiVersion}/script_tags/${cvsnScript.id}.json`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-Shopify-Access-Token": shop.accessToken,
          "Content-Type": "application/json"
        }
      }
    );
    jsonData = await response.json();
    shop.isActive = false;
    await shop.save();
    reportEvent(shopOrigin, "server_disable_app");
    ctx.status = 200;
    ctx.res.end(JSON.stringify({}));
  } catch (error) {
    console.log("error", error);
    reportEvent(shopOrigin, "error", { value: error.message });
    ctx.status = 400;
    ctx.res.end(JSON.stringify({ message: error.message }));
  }
}

async function enableShop(ctx) {
  const shopOrigin = ctx.cookies.get("shopOrigin");
  if (!shopOrigin) {
    ctx.status = 403;
    return;
  }
  const shop = await Shop.findOne({ shopify_domain: shopOrigin });
  if (!shop) {
    ctx.status = 404;
    reportEvent(shopOrigin, "error", { value: "shop_not_found_enable_app" });
    return;
  }
  if (shop.isActive) {
    ctx.status = 400;
    ctx.res.end(JSON.stringify({ message: "the shop already is enabled" }));
    return;
  }
  const options = {
    method: "POST",
    body: JSON.stringify({
      script_tag: {
        event: "onload",
        src: `${tunnelUrl}script?app=cvsn`
      }
    }),
    credentials: "include",
    headers: {
      "X-Shopify-Access-Token": shop.accessToken,
      "Content-Type": "application/json"
    }
  };
  try {
    const response = await fetch(
      `https://${shopOrigin}/admin/api/${apiVersion}/script_tags.json`,
      options
    );
    await response.json();
    ctx.status = 200;
    shop.isActive = true;
    await shop.save();
    reportEvent(shopOrigin, "server_enable_app");
    ctx.res.end(JSON.stringify({}));
  } catch (error) {
    console.log("error", error);
    reportEvent(shopOrigin, "error", { value: error.message });
    ctx.status = 400;
    ctx.res.end(JSON.stringify({ message: error.message }));
  }
}

async function getSettings(ctx) {
  const shopOrigin = ctx.query.shop || ctx.cookies.get("shopOrigin");
  if (!shopOrigin) {
    ctx.status = 403;
    return;
  }
  const settings = await Settings.findOne({ shopify_domain: shopOrigin });
  const shop = await Shop.findOne({ shopify_domain: shopOrigin });

  if (settings) {
    const plainSettings = settings.toObject();
    if (shop) {
      plainSettings.isActive = shop.isActive;
      if (shop.shopInformation) {
        plainSettings.default_money_format = shop.shopInformation.money_format;
        plainSettings.default_currency = shop.shopInformation.currency;
      }
    }
    ctx.status = 200;
    ctx.res.end(JSON.stringify(plainSettings));
  } else {
    ctx.status = 404;
  }
}

async function setSettings(ctx) {
  const shopOrigin = ctx.cookies.get("shopOrigin");
  if (!shopOrigin) {
    ctx.status = 403;
    return;
  }
  const body = ctx.request.body;
  await Settings.updateOne(
    { shopify_domain: shopOrigin },
    _.omit(body, ["shopId", "shopify_domain"])
  );

  ctx.status = 200;
  ctx.res.end(JSON.stringify({}));
}

async function reportEvent(shopOrigin, eventName, eventValue, additionalProps) {
  if (!eventName) {
    console.debug("reportEvent(): no eventName/shop were provided as input");
    return;
  }

  const userProps =
    additionalProps && additionalProps.userProps
      ? additionalProps.userProps
      : {};
  const eventProps =
    additionalProps && additionalProps.eventProps
      ? additionalProps.eventProps
      : {};

  const data = {
    user_id: shopOrigin || "undefined",
    event_type: eventName,
    event_properties: {
      value: eventValue,
      ...eventProps
    },
    user_properties: {
      appName: "ultimate_sticky_add_to_cart",
      ...userProps
    }
  };
  try {
    amplitude.track(data);
  } catch (error) {
    console.debug(error);
  }

  if (
    (eventName === "install" || eventName === "uninstall") &&
    shopOrigin !== "henry-corners.myshopify.com" &&
    !dev
  ) {
    axios
      .post("https://bishki.netlify.com/.netlify/functions/cb_post_to_slack", {
        appName: "sticky",
        eventName: eventName,
        eventValue: {
          shop: shopOrigin
        }
      })
      .then(function(response) {
        console.log("succesfuly sent message to slack");
      })
      .catch(function(error) {
        console.debug(`error when trying to send pn to slack: ${error}`);
      });
  }
}

// removes the subcriber from the did not review list and moves him to
// the uninstalled emailing list
async function addNewSubscriberToEmailList(shopInfo) {
  if (!shopInfo) {
    return;
  }
  const didNotReviewEmailListId = "6683fa20-3d48-403c-a81a-d9f4e0142cd4";
  const shopCustomFieldId = "e1_T";
  const languageCustomFieldId = "e2_T";
  const shopNameCustomFieldId = "e3_T";
  const myshopifyDomainCustomFieldId = "e4_T";
  const hasTrust = "e6_T";
  const request = {
    method: "PUT",
    url: "/v3/marketing/contacts",
    body: {
      list_ids: [didNotReviewEmailListId],
      contacts: [
        {
          email: shopInfo.email,
          first_name: shopInfo.shop_owner,
          custom_fields: {
            [shopCustomFieldId]: shopInfo.domain,
            [languageCustomFieldId]: shopInfo.primary_locale,
            [shopNameCustomFieldId]: shopInfo.name,
            [myshopifyDomainCustomFieldId]: shopInfo.myshopify_domain,
            [hasTrust]: "yes"
          }
        }
      ]
    }
  };
  sendgridClient
    .request(request)
    .then(async ([response, body]) => {
      console.log(response.statusCode);
      console.log(body);
      return;
    })
    .catch(function(error) {
      console.debug(`error when trying to send email to sendgrid: ${error}`);
      reportEvent(shopInfo.myshopify_domain, "error", error);
      return;
    });
}

async function addSubscriberToUninstalledList(shopEmailAddress) {
  console.log(`removing shopEmailAddress from sendgrid installed list`);
  const uninstalledEmailListId = "d41cb0db-b783-4e19-9ce9-244338a2d26a";
  const didNotReviewEmailListId = "6683fa20-3d48-403c-a81a-d9f4e0142cd4";
  // 1. Search for the shop email in sendgrid
  const getRecipientRequest = {
    method: "POST",
    url: "/v3/marketing/contacts/search",
    body: {
      query: `primary_email LIKE '${shopEmailAddress}%'`
    }
  };
  sendgridClient
    .request(getRecipientRequest)
    .then(([response, body]) => {
      if (body.result.length === 1) {
        // then take the id of that user and remove him from the first list, and add him to the uninstalled list
        let updatedContact = body.result[0];
        updatedContact.list_ids = [uninstalledEmailListId];
        const updateContactRequest = {
          method: "PUT",
          url: "/v3/marketing/contacts",
          body: {
            list_ids: [uninstalledEmailListId],
            contacts: [
              {
                email: updatedContact.email,
                id: updatedContact.id,
                list_ids: [uninstalledEmailListId]
              }
            ]
          }
        };
        sendgridClient
          .request(updateContactRequest)
          .then(async ([response, body]) => {
            const deleteContactFromList = {
              method: "DELETE",
              url: `v3/mc/lists/${didNotReviewEmailListId}/contacts?contact_ids=${updatedContact.id}`
            };
            sendgridClient
              .request(deleteContactFromList)
              .then(async ([response, body]) => {
                return;
              })
              .catch(function(error) {
                console.debug(
                  `error when trying to update sendgrid : ${error}`
                );
                reportEvent(null, "error", `sendgrid error error ${error}`);
                return;
              });
          })
          .catch(function(error) {
            console.debug(`error when trying to update sendgrid: ${error}`);
            reportEvent(null, "error", `sendgrid error error ${error}`);
            return;
          });
      }
    })
    .catch(function(error) {
      console.debug(`error when trying to send email to sendgrid: ${error}`);
      reportEvent(null, "error", `sendgrid error error ${error}`);
      return;
    });
}

async function addAffiliateToPartnersProgram(ctx) {
  // 1. validate the payload
  // 2. trigger the affiliate email
  if (ctx.request.body && ctx.request.body.email) {
    return sendEmail(
      ctx.request.body.email,
      "d-354a000cef1149f8999d35cee9da9f89",
      { app_name: "Ultimate Sticky Add to Cart" }
    ).then(() => {
      ctx.status = 201;
      ctx.res.end(JSON.stringify({ status: "added to mailing list" }));
      return;
    });
  } else {
    ctx.status = 400;
    return;
  }
}

module.exports = {
  enableShop,
  disableShop,
  getSettings,
  setSettings,
  uninstallShop,
  fetchShopDetails,
  fetchShopDetailsAndReturnResultToClient,
  reportEvent,
  addNewSubscriberToEmailList,
  addSubscriberToUninstalledList,
  processShopUpdate,
  addAffiliateToPartnersProgram
};