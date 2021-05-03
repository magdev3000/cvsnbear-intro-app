export default {
  init(sdkId){
    /* eslint-disable */
    (function(root){
      root._tt_config = true;
      root._taq = root._taq || [];
      var ta = document.createElement('script');
      ta.type = 'text/javascript';
      ta.async = true;
      ta.src = document.location.protocol + '//' + 'static.bytedance/com/pixel/sdk.js?sdkid=' + sdkId;
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(ta,s);
    })(window);
  },
  addToCart(product){
    console.log('add to cart: report to tiktok');
  }
};
