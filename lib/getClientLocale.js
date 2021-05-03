export default function getClientLocale() {
  let lang = "en";

  try {
    if (process.browser) {
      if (localStorage) {
        if (localStorage.locale) {
          lang = localStorage.locale;
        } else if (window) {
          const urlParams = new URLSearchParams(decodeURI(window.location));
          let locale = urlParams.get("locale");
          if (locale && locale !== "") {
            if (locale.indexOf("-") !== -1) {
              locale = locale.substring(0, 2);
            }
            localStorage.locale = locale;
            lang = localStorage.locale;
          }
        }
      }
    }
  } catch (e) {
    //do nothing
  }
  return lang;
}
