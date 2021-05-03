export default {
  init(taglId) {
    /* eslint-disable */
    !function(e) {
      if(!window.pintrk) {
        window.pintrk = function() {
          window.pintrk.queue.push(Array.prototype.slice.call(arguments))
        };
        var n=window.pintrk;
        n.queue=[];
        n.version="3.0";
        var t = document.createElement("script");
        // t.async=!0;
        t.src=e;
        var r = document.getElementsByTagName("script")[0];

        // console.log('object :', r.parentNode , r.parentNode.insertBefore(t,r))
      }}("https://s.pinimg.com/ct/core.js");

    pintrk('load', taglId);
    pintrk('page');    
  },

  addToCart(product) {
    pintrk('track', 'AddToCart', product
        // {
        //     value: 100,
        //     order_quantity: 1,
        //     currency: 'USD'
        // }
    );
  },
}
