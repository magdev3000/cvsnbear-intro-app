export default function getFrameHeight(settings, product, scale = 1, isMobile) {
  // const { settings, product } = this.props;
  let iframeHeight = 70;
  //check if the layout is only button
  if(!settings.design_settings.show_product_image &&
    !settings.design_settings.show_quantity &&
    !settings.design_settings.show_product_name &&
    !settings.design_settings.show_variants){ //only button
      iframeHeight = 50;
  } 
  

  if (isMobile) {
    let viewBloctProduct = false;

    if (
      settings.design_settings.show_product_image ||
      settings.design_settings.show_product_name ||
      settings.design_settings.show_price
    ) {
      viewBloctProduct = true;
      if (settings.design_settings.show_product_image) {
        iframeHeight += 45;
      } else if (
        settings.design_settings.show_product_name &&
        settings.design_settings.show_price
      ) {
        iframeHeight += 37;
      } else if(!(!settings.design_settings.show_product_image &&
        !settings.design_settings.show_quantity &&
        !settings.design_settings.show_product_name &&
        !settings.design_settings.show_variants)){
        iframeHeight += 18;
      }
    }

    if (settings.design_settings.show_variants && product.variants.length > 1) {
      iframeHeight += 37;
    }

    if (viewBloctProduct && settings.design_settings.show_variants) {
      if (product.variants.length > 1) {
        iframeHeight += 8;
      }
    } else if (settings.design_settings.show_variants) {
      iframeHeight += 7;
    }
  }

  // console.log(`settings: ${JSON.stringify(settings)}`);

  if (settings.urgency) {
    if (settings.urgency.show_bar) {
      if(!isNaN(settings.urgency.text_size)){
        iframeHeight += parseInt(settings.urgency.text_size) + 12;
      } else {
        iframeHeight += 24;
      }
    }
  }
  // console.log(`iframe height return value is: ${iframeHeight * scale}`);
  return iframeHeight * scale;
}
