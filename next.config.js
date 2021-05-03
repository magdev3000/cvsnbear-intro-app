const withCSS = require("@zeit/next-css");
const withSass = require("@zeit/next-sass");
const webpack = require("webpack");

const {
  shopifyApiKey,
  debugMode,
  amplitudeApiKey,
  dev
} = require("./server/config");

function HACK_removeMinimizeOptionFromCssLoaders(config) {
  console.warn(
    "HACK: Removing `minimize` option from `css-loader` entries in Webpack config"
  );
  config.module.rules.forEach(rule => {
    if (Array.isArray(rule.use)) {
      rule.use.forEach(u => {
        if (u.loader === "css-loader" && u.options) {
          delete u.options.minimize;
        }
      });
    }
  });
}

const apiKey = JSON.stringify(shopifyApiKey);
const amplitudeKey = JSON.stringify(amplitudeApiKey);
module.exports = withCSS(
  withSass({
    webpack: (config, { config: { target } }) => {
      HACK_removeMinimizeOptionFromCssLoaders(config);
      const env = {
        API_KEY: apiKey,
        DEBUG_MODE: debugMode,
        AMPLITUDE_API_KEY: amplitudeKey,
        DEV_MODE: dev
      };

      config.module.rules.push({
        test: /\.svg$/,
        exclude: /node_modules/,
        use: {
          loader: "svg-react-loader"
        }
      });

      newEntry = async () => {
        try {
          const entry = await config.entry();
          return {
            ...entry
          };
        } catch (err) {
          return {};
        }
      };

      return {
        ...config,
        entry: newEntry,
        plugins: [...config.plugins, new webpack.DefinePlugin(env)]
      };
    }
  })
);
