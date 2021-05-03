const mongoose = require('mongoose');

const Shop = mongoose.Schema({
  shopify_domain: String,
  accessToken: String,
  isActive: { type: Boolean, default: false },
  shopInformation: Object,
  subscriptionEmail: String,
}, {timestamps: true});

module.exports = mongoose.model('Shop', Shop);
