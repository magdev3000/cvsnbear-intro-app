import App from "next/app";
import Head from "next/head";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/styles.css";
import Cookies from "js-cookie";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { Provider } from "react-redux";
import {
  syncTranslationWithStore,
  loadTranslations,
  setLocale
} from "react-redux-i18n";
import store from "../redux/store";
import Layout from "../containers/Layout";
import translationStrings from "../translations/default";
import getClientLocale from "../lib/getClientLocale";
import * as Sentry from "@sentry/browser";

const client = new ApolloClient({
  fetchOptions: {
    credentials: "include"
  }
});

syncTranslationWithStore(store);
store.dispatch(loadTranslations(translationStrings));
store.dispatch(setLocale(getClientLocale()));

if (!DEV_MODE) {
  Sentry.init({
    dsn: "https://86570f5c3d65477dac8906f8947890ef@sentry.io/1862949"
  });
}

class MyApp extends App {
  constructor(props) {
    super(props);
    this.state = {
      shopOrigin: Cookies.get("shopOrigin"),
      locale: getClientLocale() || "en"
    };
    this.onChangeLocale = this.onChangeLocale.bind(this);
  }

  onChangeLocale(newLocale) {
    if (newLocale) {
      store.dispatch(setLocale(newLocale));
      this.setState({ language: newLocale });
      localStorage.locale = newLocale;
      amplitude.logEvent("click-select_locale", { locale: newLocale });
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <React.Fragment>
        <Head>
          <title>GDPR by Cvsn Bear</title>
          <meta charSet="utf-8" />
          <script
            key="amplitude"
            dangerouslySetInnerHTML={{
              __html: `
                  (function(e,t){var n=e.amplitude||{_q:[],_iq:{}};var r=t.createElement("script");r.type="text/javascript";
                  r.async=true;r.src="https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-3.4.0-min.gz.js";
                  r.onload=function(){e.amplitude.runQueuedFunctions()};var i=t.getElementsByTagName("script")[0];
                  i.parentNode.insertBefore(r,i);function s(e,t){e.prototype[t]=function(){this._q.push([t].concat(Array.prototype.slice.call(arguments,0)));
                  return this}}var o=function(){this._q=[];return this};var a=["add","append","clearAll","prepend","set","setOnce","unset"];
                  for(var u=0;u<a.length;u++){s(o,a[u])}n.Identify=o;var c=function(){this._q=[];return this;
                  };var p=["setProductId","setQuantity","setPrice","setRevenueType","setEventProperties"];
                  for(var l=0;l<p.length;l++){s(c,p[l])}n.Revenue=c;var d=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","setGlobalUserProperties","identify","clearUserProperties","setGroup","logRevenueV2","regenerateDeviceId","logEventWithTimestamp","logEventWithGroups"];
                  function v(e){function t(t){e[t]=function(){e._q.push([t].concat(Array.prototype.slice.call(arguments,0)));
                  }}for(var n=0;n<d.length;n++){t(d[n])}}v(n);n.getInstance=function(e){e=(!e||e.length===0?"$default_instance":e).toLowerCase();
                  if(!n._iq.hasOwnProperty(e)){n._iq[e]={_q:[]};v(n._iq[e])}return n._iq[e]};e.amplitude=n;
                  })(window,document);
                  amplitude.getInstance().init("${AMPLITUDE_API_KEY}");
                  window.logEvent = function logEvent(event, data) {
                    // Wait for the title update (see gatsbyjs/gatsby#2478)
                    setTimeout(() => {
                      amplitude.getInstance().logEvent(event, data);
                    }, 0);
                  }
                        `
            }}
          />
          <script
            key="fb_pixel"
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '482332542336814');
                  fbq('track', 'PageView');`
            }}
          />
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=UA-144121061-1"
          ></script>
          <script
            key="gtag"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'UA-144121061-2');`
            }}
          />
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=AW-742737164"
          ></script>
          <script
            key="googleads"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-742737164');`
            }}
          />
          <script
            key="reddit"
            dangerouslySetInnerHTML={{
              __html: `!function(w,d){if(!w.rdt){
                var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)
                };p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",
                t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}
                (window,document);rdt('init','t2_3kkefkm1');rdt('track', 'PageVisit');`
            }}
          />
        </Head>
        <AppProvider
          shopOrigin={this.state.shopOrigin}
          apiKey={API_KEY}
          forceRedirect={!Boolean(DEBUG_MODE)}
        >
          <ApolloProvider client={client}>
            <Provider store={store}>
              <Layout
                onChangeLocale={this.onChangeLocale}
                locale={this.state.locale || "en"}
              >
                <Component {...pageProps} />
              </Layout>
            </Provider>
          </ApolloProvider>
        </AppProvider>
      </React.Fragment>
    );
  }
}

export default MyApp;
