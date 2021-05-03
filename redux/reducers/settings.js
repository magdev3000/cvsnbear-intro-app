export const defaultSettings = {
  saving: false,
  display_saved_notice: false,
  data: {
    bar_tested: false,
    bar_notice_hidden: false,
    general_settings: {
      // button_text: "Buy Now",
      // button_action_click: "go_to_checkout",
      // bar_show_platform: "both",
      // bar_scroll_threshold: 10,
      // show_on_home_page: true
    },
    design_settings: {
      // bar_position: "bottom",
      // bar_alignment: "space-between",
      // show_product_image: true,
      // show_product_name: true,
      // show_variants: true,
      // show_price: true,
      // show_compare_at_price: false,
      // show_quantity: true,
      // show_reviews: false,
      // bar_color: "#263644",
      // bar_text_color: "#ffffff",
      // button_color: "gradient_violet",
      // button_text_color: "#FFFFFF",
      // button_shape: "rounded_rectangle_5",
      // dropdown_bg_color: "#FFFFFF",
      // dropdown_text_color: "#263644",
      // font: "Overpass",
      // padding_top: 0,
      // padding_bottom: 0,
      // padding_left: 0,
      // padding_right: 0
    },
    design_mobile_settings: {
      // bar_position: "bottom",
      // show_product_image: true,
      // show_product_name: true,
      // show_variants: true,
      // show_price: true,
      // show_compare_at_price: false,
      // show_quantity: false,
      // show_reviews: false,
      // bar_color: "#263644",
      // bar_text_color: "#ffffff",
      // button_color: "gradient_violet",
      // button_text_color: "#ffffff",
      // button_shape: "rounded_rectangle_5",
      // dropdown_bg_color: "#ffffff",
      // dropdown_text_color: "#212B36",
      // font: "Overpass",
      // padding_bottom: 0,
      // bar_alignment: "space-between"
    },
  }
};

const reducer = (state = {}, action) => {
  switch (action.type) {
    case "GET_SETTINGS":
      return {
        ...defaultSettings,
        data: {
          ...action.data,
          general_settings: {
            ...defaultSettings.data.general_settings,
            ...action.data.general_settings
          },
          design_settings: {
            ...defaultSettings.data.design_settings,
            ...action.data.design_settings
          },
          design_mobile_settings: Object.assign(
            {},
            defaultSettings.data.design_mobile_settings,
            action.data.design_mobile_settings
              ? action.data.design_mobile_settings
              : action.data.design_settings
          ),
          animation: {
            ...defaultSettings.data.animation,
            ...action.data.animation
          },
          confirmation: {
            ...defaultSettings.data.confirmation,
            ...action.data.confirmation
          },
          urgency: {
            ...defaultSettings.data.urgency,
            ...action.data.urgency
          },
          advanced: {
            ...defaultSettings.data.advanced,
            ...action.data.advanced
          }
        }
      };
    case "SET_SETTINGS":
      return {
        ...state,
        saving: false,
        data: {
          ...state.data,
          ...action.data
        }
      };
    case "SET_SETTINGS_SAVING":
      return {
        ...state,
        saving: action.data
      };
    case "SET_SETTINGS_DISPAY_SAVED_NOTICE":
      return {
        ...state,
        display_saved_notice: action.data
      };
    default:
      return state;
  }
};

export default reducer;
