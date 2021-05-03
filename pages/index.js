import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { Button, Layout, Card, Label, Icon, Link } from "@shopify/polaris";
import { isEqual, get as getByPath, set as setByPath } from "lodash";
import { I18n } from "react-redux-i18n";
import {
  MobileMajorMonotone,
  DesktopMajorMonotone,
} from "@shopify/polaris-icons";
import FontInput from "../components/form-inputs/FontInput";
import { setSettings } from "../redux/actions";
import TextInput from "../components/form-inputs/TextInput";
import Question from "../components/form-inputs/QuestionMark";
import SelectInput from "../components/form-inputs/SelectInput";
import GroupButtonInput from "../components/form-inputs/GroupButtonInput";
import CheckboxInput from "../components/form-inputs/CheckboxInput";
import RadioSelect from "../components/form-inputs/RadioSelect";
import ColorPickerInput from "../components/form-inputs/ColorPickerInput";
import NumberTwoLabelsInput from "../components/form-inputs/NumberTwoLabelsInput";
import Rectangle from "../components/form-inputs/Rectangle";
import SizeInput from "../components/form-inputs/SizeInput";
import isFirstSession from "../lib/isFirstSession";


class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view_type: "desktop",
    };
    this.defaultScrolY = window.scrollY;
  }

  handleSave = data => {
    this.props.setSettings(data);
    amplitude.logEvent("click_settings_save");
  };

  componentDidMount() {
    if (process.browser) {
      window.scrollTo(0, this.defaultScrolY);
      amplitude.logEvent("page_load", { value: "settings" });
      if (isFirstSession() && gtag && fbq) {
        console.log("sending cvsn event to google & fb");
        gtag("event", "cvsn", {
          send_to: "AW-742737164/LdzpCPWU3LMBEIyKleIC"
        });
        gtag('event','Install_App');
        fbq('trackCustom','Install_App');
        if(rdt){ // send event to reddit
          rdt('track', 'Purchase');
        }
      }
    }
  }

  render() {
    const {
      handleSubmit,
      initialValues,
      valuesForm,
      saving,
      display_saved_notice
    } = this.props;


    const disabledButton = isEqual(initialValues, valuesForm);
    const { view_type } = this.state;
    return (
      <div className="tab-settings">
        <Layout>
          <Layout.Section secondary>
            <Card title={I18n.t("General Settings")} sectioned>
              <div
                style={{
                  display: "flex",
                  marginBottom: "0.4rem",
                  justifyContent: "space-between"
                }}
              >
                <Label>{I18n.t("Dropdown")}</Label>
                <Question
                  content={I18n.t(
                    "Select an option from the list"
                  )}
                />
              </div>
              <Field
                name="general_settings.button_action_click"
                component={SelectInput}
                onChange={value => {
                  this.props.change(
                    "general_settings.button_action_click",
                    value
                  );
                  if (value === "go_to_checkout") {
                    this.props.change(
                      "general_settings.button_text",
                      "Buy Now"
                    );
                  }
                }}
                eventName="click_dropdown"
                className="margin-bottom"
                options={[
                  { label: I18n.t("Go to checkout"), value: "go_to_checkout" },
                  { label: I18n.t("Stay on page"), value: "stay_on_page" },
                  {
                    label: I18n.t("Go to cart page"),
                    value: "go_to_cart_page"
                  }
                ]}
              />
              <Field
                name="general_settings.button_text"
                className="margin-bottom"
                component={TextInput}
                label={I18n.t("Text input")}
                eventName="click_button_text"
              />
              <Field
                name="general_settings.bar_show_platform"
                className="margin-bottom"
                component={RadioSelect}
                label={I18n.t("Radio buttons")}
                eventName="select_bar_show_platform"
                choices={[
                  { label: I18n.t("Desktop only"), value: "desktop" },
                  { label: I18n.t("Mobile only"), value: "mobile" },
                  { label: I18n.t("Both"), value: "both" }
                ]}
              />
              <Field
                name="general_settings.bar_scroll_threshold"
                className="Field-bar-threshold margin-bottom"
                component={NumberTwoLabelsInput}
                label1={I18n.t("NumberTwoLabelsInput")}
                label2={I18n.t("after input")}
                eventName="click_bar_scroll_threshold"
              />
              <div style={{ position: "relative" }}>
                <Field
                  name="general_settings.show_on_home_page"
                  component={CheckboxInput}
                  fullWidth
                  label={I18n.t("Checkbox")}
                />

              </div>
            </Card>

            <Card title={I18n.t("Design Settings")} sectioned>
              <Question
                className="Question-cart-header"
                content={I18n.t(
                  "Switch between Desktop and Mobile to customize your design per each"
                )}
              />
              <GroupButtonInput
                className="margin-bottom Desctop-Mobile"
                input={{
                  value: this.state.view_type,
                  onChange: value => {
                    this.setState({ view_type: value });
                  }
                }}
                fullWidth
                items={[
                  {
                    label: I18n.t("Desktop"),
                    value: "desktop",
                    icon: <Icon source={DesktopMajorMonotone} />,
                    className: "icon-title"
                  },
                  {
                    label: I18n.t("Mobile"),
                    value: "mobile",
                    icon: <Icon source={MobileMajorMonotone} />,
                    className: "icon-title"
                  }
                ]}
                eventName="click_device_type_preview"
              />

              {view_type === "desktop" ? (
                <Field
                  name="design_settings.bar_position"
                  className="margin-bottom"
                  component={GroupButtonInput}
                  label={I18n.t("Bar position")}
                  items={[
                    { label: I18n.t("Top"), value: "top" },
                    { label: I18n.t("Bottom"), value: "bottom" }
                  ]}
                  eventName="click_bar_position"
                />
              ) : (
                <Field
                  name="design_mobile_settings.bar_position"
                  className="margin-bottom"
                  component={GroupButtonInput}
                  label={I18n.t("Bar position")}
                  items={[
                    { label: I18n.t("Top"), value: "top" },
                    { label: I18n.t("Bottom"), value: "bottom" }
                  ]}
                  eventName="click_bar_position"
                />
              )}

              {view_type === "desktop" ? (
                <Field
                  name="design_settings.bar_alignment"
                  className="margin-bottom"
                  component={GroupButtonInput}
                  label={I18n.t("Bar alignment")}
                  items={[
                    {
                      label: "",
                      value: "center",
                      icon: (
                        <div className="btn-icon-center">
                          {" "}
                          <div />
                          <div />{" "}
                        </div>
                      )
                    },
                    {
                      label: "",
                      value: "space-between",
                      icon: (
                        <div className="btn-icon-space-between">
                          {" "}
                          <div />
                          <div />{" "}
                        </div>
                      )
                    }
                  ]}
                  eventName="click_bar_position"
                />
              ) : null}
              
              {view_type === "desktop" ? (
                <Field
                  className="margin-bottom"
                  name="design_settings.bar_color"
                  fullWidth
                  component={ColorPickerInput}
                  label={I18n.t("Color picker with gradients")}
                  eventName="click_bar_color"
                />
              ) : (
                <Field
                  className="margin-bottom"
                  name="design_mobile_settings.bar_color"
                  fullWidth
                  component={ColorPickerInput}
                  label={I18n.t("Color picker with gradients")}
                  eventName="click_bar_color"
                />
              )}
              {view_type === "desktop" ? (
                <Field
                  className="margin-bottom"
                  name="design_settings.bar_text_color"
                  fullWidth
                  component={ColorPickerInput}
                  hideGradient
                  label={I18n.t("Color picker without gradients")}
                  eventName="click_bar_text_color"
                />
              ) : (
                <Field
                  className="margin-bottom"
                  name="design_mobile_settings.bar_text_color"
                  fullWidth
                  component={ColorPickerInput}
                  hideGradient
                  label={I18n.t("Color picker without gradients")}
                  eventName="click_bar_text_color"
                />
              )}
              {view_type === "desktop" ? (
                <Field
                  className="margin-bottom Button-shape"
                  name="design_settings.button_shape"
                  component={GroupButtonInput}
                  label={I18n.t("Button shape")}
                  fullWidth
                  items={[
                    {
                      label: "",
                      value: "rounded_rectangle_10",
                      icon: <Rectangle borderRadius={10} />
                    },
                    {
                      label: "",
                      value: "rounded_rectangle_5",
                      icon: <Rectangle borderRadius={5} />
                    },
                    {
                      label: "",
                      value: "rectangle",
                      icon: <Rectangle borderRadius={0} />
                    }
                  ]}
                  eventName="click_button_shape"
                />
              ) : (
                <Field
                  className="margin-bottom Button-shape"
                  name="design_mobile_settings.button_shape"
                  component={GroupButtonInput}
                  label={I18n.t("Button shape")}
                  fullWidth
                  items={[
                    {
                      label: "",
                      value: "rounded_rectangle_10",
                      icon: <Rectangle borderRadius={10} />
                    },
                    {
                      label: "",
                      value: "rounded_rectangle_5",
                      icon: <Rectangle borderRadius={5} />
                    },
                    {
                      label: "",
                      value: "rectangle",
                      icon: <Rectangle borderRadius={0} />
                    }
                  ]}
                  eventName="click_button_shape"
                />
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "2rem"
                }}
              >
                <div style={{ marginRight: "30px" }}>
                  <Label>{I18n.t("Font")}</Label>
                </div>
                <div style={{ display: "flex", flex: "auto" }}>
                  {view_type === "desktop" ? (
                    <Field
                      name="design_settings.font"
                      label={I18n.t("Font")}
                      component={FontInput}
                      eventName="click_font"
                    />
                  ) : (
                    <Field
                      name="design_mobile_settings.font"
                      label={I18n.t("Font")}
                      component={FontInput}
                      eventName="click_font"
                    />
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  marginBottom: "2rem",
                  justifyContent: "space-between"
                }}
              >
                <Label>{I18n.t("Custom Padding")}</Label>
              </div>
              {view_type === "desktop"
                ? (valuesForm.design_settings &&
                    valuesForm.design_settings.bar_position == "top" && (
                      <Field
                        name="design_settings.padding_top"
                        label={I18n.t("Top")}
                        className="margin-bottom"
                        component={SizeInput}
                      />
                    )) ||
                  null
                : (valuesForm.design_mobile_settings &&
                    valuesForm.design_mobile_settings.bar_position == "top" && (
                      <Field
                        name="design_mobile_settings.padding_top"
                        label={I18n.t("Top")}
                        className="margin-bottom"
                        component={SizeInput}
                      />
                    )) ||
                  null}

              {view_type === "desktop" ? (
                <Field
                  name="design_settings.padding_left"
                  label={I18n.t("Left")}
                  component={SizeInput}
                  className="margin-bottom"
                />
              ) : null}

              {view_type === "desktop" ? (
                <Field
                  name="design_settings.padding_right"
                  label={I18n.t("Right")}
                  component={SizeInput}
                  className="margin-bottom"
                />
              ) : null}

              {view_type === "desktop"
                ? (valuesForm.design_settings &&
                    valuesForm.design_settings.bar_position == "bottom" && (
                      <Field
                        name="design_settings.padding_bottom"
                        label={I18n.t("Bottom")}
                        component={SizeInput}
                        className="margin-bottom"
                      />
                    )) ||
                  null
                : (valuesForm.design_mobile_settings &&
                    valuesForm.design_mobile_settings.bar_position ==
                      "bottom" && (
                      <Field
                        name="design_mobile_settings.padding_bottom"
                        label={I18n.t("Bottom")}
                        component={SizeInput}
                        className="margin-bottom"
                      />
                    )) ||
                  null}
            </Card>
          </Layout.Section>
          <div
            className="Polaris-Layout__Section Preview"
            id="preview-container"
          >
            {/* <BarPreview
              containerPreviewRef={this.containerPreviewRef}
              play_animation={this.state.play_animation}
              isMobile={this.state.view_type === "mobile"}
              complete={this.state.complete}
              forseOutOfStock={this.state.forseOutOfStock}
            /> */}

          </div>
        </Layout>
        <div className="fixed-action-bottom">
          <Button
            primary={!display_saved_notice}
            disabled={disabledButton}
            onClick={handleSubmit(this.handleSave.bind(this))}
            loading={saving}
          >
            {display_saved_notice ? I18n.t("Saved!") : I18n.t("Save")}
          </Button>
        </div>
      </div>
    );
  }
}

const validate = values => {

};

const SettingsForm = reduxForm({
  form: "settings",
  enableReinitialize: true,
  validate
})(Settings);

const mapStateToProps = state => ({
  saving: state.settings.saving || false,
  display_saved_notice: state.settings.display_saved_notice || false,
  settings: state.settings.data || {},
  initialValues: state.settings.data || {},
  valuesForm:
    state.form.settings && state.form.settings.values
      ? state.form.settings.values
      : {}
});

const mapDispatchToProps = {
  setSettings
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsForm);
