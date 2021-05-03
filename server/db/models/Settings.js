const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const Settings = mongoose.Schema({
  shopId: ObjectId,
  shopify_domain: String,
  wizard_app_tested: {
    type: Boolean,
    default: false,
  },
  wizard_notice_hidden: {
    type: Boolean,
    default: false,
  },
  bar_placement_settings: {
    badge_placement_product_page: {
      type: Boolean,
      default: true
    },
    badge_placement_cart_page: {
      type: Boolean,
      default: false
    },
    badge_placement_site_footer: {
      type: Boolean,
      default: false
    },
  },
  animation: {
    animation_type: {
      type: String,
      default: 'none',
    },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Settings', Settings);
