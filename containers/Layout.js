import {
  Tabs,
  Page,
  SettingToggle,
  Icon,
  Button,
  ButtonGroup,
  Spinner,
  Banner,
} from "@shopify/polaris";
import { connect } from "react-redux";
import {
  CircleTickMajorMonotone,
  CircleAlertMajorMonotone
} from "@shopify/polaris-icons";
import { I18n } from "react-redux-i18n";
import { findIndex } from "lodash";
import { withRouter } from "next/router";
import PropTypes from "prop-types";
import { History } from "@shopify/app-bridge/actions";
import "./Layout.scss";
import {
  getSettings,
  enableShop,
  disableShop,
  getShop
} from "../redux/actions";

import Cookies from "js-cookie";
import { initializeHotjar } from "../lib/hotjar";
import FreshChat from "react-freshchat";
import NoSSR from "react-no-ssr";

import OnboardingWizard from "../components/OnboardingWizard";
import ReviewBar from "../components/ReviewBar";
import LanguagePicker from "../components/LanguagePicker";
import AffiliateModal from "../components/AffiliateModal";
import isFirstSession from "../lib/isFirstSession";

class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasShopInformation: false,
      showAffiliateModal: true,
    };

  }
  static contextTypes = {
    polaris: PropTypes.object
  };

  tabs = [
    {
      id: "",
      content: I18n.t("Settings"),
      accessibilityLabel: "Settings",
      panelID: "settings-content"
    },
  ];

  statusToggle = () => {
    if (this.props.isActive) {
      this.props.disableShop();
    } else {
      this.props.enableShop();
    }
    amplitude.logEvent("click_enable_disable", {
      value: this.props.isActive ? "disable" : "enable"
    });
  };

  handleTabChange = selectedTabIndex => {
    if (!this.tabs[selectedTabIndex]) {
      return;
    }
    const history = History.create(this.context.polaris.appBridge);
    history.dispatch(History.Action.PUSH, `/${this.tabs[selectedTabIndex].id}`);
    this.props.router.push(`/${this.tabs[selectedTabIndex].id}`);
  };

  async componentDidMount() {
    try {
      await this.props.getSettings();
    } catch (e) {
      console.debug(`Couldn't fetch store settings`);
    }

    try {
      await this.props.getShop().then(() => {
        this.setState({ hasShopInformation: true });
      });
    } catch (e) {
      this.setState({ hasShopInformation: false });
      console.debug(`Couldn't fetch store details`);
    }

    if (process.browser) {
      amplitude.getInstance().setUserId(`${Cookies.get("shopOrigin")}`);
      amplitude.setUserProperties({ appName: "cvsn" });
      initializeHotjar(1411551, 6);
    }
  }

  render() {
    const { loaded, fetchDataError, isActive, bar_notice_hidden } = this.props;
    const selected = findIndex(this.tabs, [
      "id",
      this.props.router.pathname.slice(1)
    ]);

    if (!loaded) {
      return (
        <div
          style={{
            textAlign: "center",
            position: "absolute",
            top: "50%",
            left: "50%"
          }}
        >
          <Spinner size="large" color="teal" />
        </div>
      );
    }

    if (fetchDataError) {
      amplitude.logEvent("error", fetchDataError);
      return (
        <div style={{}}>
          <p>
            Looks like we hit a snag. 🤒 Our dev team just got notified about
            it.
            <br /> Please contact us at lynda@cvsnbear.com for immidate
            support
          </p>
        </div>
      );
    }

    let isAffiliateShop = false;

    let affiliateEmail = "";
    if (this.state.hasShopInformation && this.props.shop && this.props.shop.shopInformation) {
      isAffiliateShop =
        this.props.shop.shopInformation.plan_name === "affiliate";
      affiliateEmail = this.props.shop.shopInformation.email;
    }

    

    return (
      <React.Fragment>
        <div className="headerButtonsGroup">
          <ButtonGroup>
            <Button
              external={true}
              url="https://cvsnbear.freshdesk.com/support/solutions/folders/48000432135"
              onClick={() => {
                amplitude.logEvent("click_faq");
              }}
            >
              {I18n.t("FAQ")}
            </Button>
            <Button
              external={true}
              url="https://cvsnbear.freshdesk.com/support/tickets/new"
              onClick={() => {
                amplitude.logEvent("click_help");
              }}
            >
              {I18n.t("Help")}
            </Button>
            {isAffiliateShop && (
              <Button
                external={true}
                url="https://www.cvsnbear.com/partners"
                onClick={() => {
                  amplitude.logEvent("click_partners");
                }}
              >
                {I18n.t("🤑 Partner Program")}
              </Button>
            )}
          </ButtonGroup>
          <LanguagePicker
            onChangeLocale={this.props.onChangeLocale}
            locale={this.props.locale}
          />
        </div>
        <div className="notFullWidthHr"></div>
        <Page>
          
          {/* affiliate components - START */}
          {isAffiliateShop && !localStorage.affiliateModalShown && (
            <AffiliateModal
              isOpen={this.state.showAffiliateModal}
              email={affiliateEmail}
              subscribedToMailingList={false}
              onRequestClose={() => {
                this.setState({ showAffiliateModal: false });
              }}
            />
          )}
          {/* affiliate components - END */}

          {!bar_notice_hidden ? <OnboardingWizard /> : null}
          <div className="headerMainToggleButton">
            <SettingToggle
              action={{
                primary: true,
                content: isActive ? I18n.t("Disable") : I18n.t("Enable"),
                onAction: this.statusToggle
              }}
              enabled={isActive}
            >
              <div className="SettingToggle_Title">
                {isActive ? (
                  <Icon source={CircleTickMajorMonotone} />
                ) : (
                  <Icon source={CircleAlertMajorMonotone} />
                )}
                {I18n.t("{{app_name}} is")}{" "}
                <b className={isActive ? "green" : "red"}>
                  {isActive ? I18n.t("enabled") : I18n.t("disabled")}
                </b>
              </div>

              {!isActive ? (
                <div className="SettingToggle_Description">
                  {I18n.t(
                    "Click Enable to add {{app_name}} to your store"
                  )}
                </div>
              ) : null}
            </SettingToggle>
          </div>
        </Page>
        {!DEV_MODE && (
          <NoSSR>
            {this.state.hasShopInformation && (
              <FreshChat
                token="d8dad34b-6ddb-43b8-922e-65d42473698a"
                siteId="GDPR"
                config={{
                  cssNames: {
                    widget: "customFreshChatCss",
                    modal: "customModalCss"
                  }
                }}
                onInit={widget => {
                  widget.on("widget:opened", function(resp) {
                    amplitude.logEvent("chat_box_opened");
                  });
                  window.fcWidget.on("message:sent", function(resp) {
                    amplitude.logEvent("chat_message_sent");
                  });
                  window.fcWidget.on("message:recieved", function(resp) {
                    amplitude.logEvent("chat_message_recieved");
                  });
                  const shopInformation = this.props.shop.shopInformation;
                  if (shopInformation) {
                    widget.user.setProperties({
                      email: shopInformation.email || null,
                      firstName: shopInformation.shop_owner || null,
                      shop_name: shopInformation.name || null,
                      store_url: shopInformation.domain || null,
                      store_created_at: shopInformation.created_at || null
                    });
                  }
                }}
              />
            )}
          </NoSSR>
        )}
        <Tabs
          tabs={this.tabs}
          selected={selected}
          onSelect={this.handleTabChange}
        >
          {this.props.children}
        </Tabs>
        <ReviewBar />
        <div className="marginBottom"></div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  bar_notice_hidden:
    state.settings.data && state.settings.data.bar_notice_hidden
      ? state.settings.data.bar_notice_hidden
      : false,
  isActive: state.status.isActive || false,
  loaded: state.status.loaded || false,
  shop: state.shop || null,
  settings: state.settings || null
});

const mapDispatchToProps = {
  getSettings,
  enableShop,
  disableShop,
  getShop
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Layout));
