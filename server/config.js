/* eslint-disable no-process-env */
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  dev: process.env.NODE_ENV !== 'production',
  shopifyApiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
  shopifyApiKey: process.env.SHOPIFY_API_KEY,
  tunnelUrl: process.env.TUNNEL_URL,
  apiVersion: process.env.API_VERSION,
  debugMode: process.env.DEBUG_MODE,
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/shopify-boilerplate-app",
  amplitudeApiKey: process.env.NODE_ENV === 'production' ? process.env.AMPLITUDE_API_KEY : process.env.AMPLITUDE_API_KEY_DEV,
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  sendgridTransactionalApiKey: process.env.SENDGRID_TRANSACTIONAL_API_KEY,
};