import React from "react";
import ReactDOM from "react-dom";
import WidgetContainer from "./WidgetContainer";
import classNames from "classnames";
import { defaultSettings } from "../redux/reducers/settings";
import "./style.scss";

const url = "{{__URL__}}";
const shop = "{{__SHOP__}}";

(() => {

  function fetchSettings() {
    return fetch(`${url}settings?shop=${shop}`).then(resp => {
      return resp.json();
    });
  }

  Promise.all([fetchSettings()])
    .then(([settingsData]) => {
      if (!settingsData) {
        return;
      }

      const settingsDataSafe = {
        ...defaultSettings.data,
        ...settingsData,
        general_settings: {
          ...defaultSettings.data.general_settings,
          ...settingsData.general_settings
        },
        design_settings: {
          ...defaultSettings.data.design_settings,
          ...settingsData.design_settings
        },
        advanced: {
          ...defaultSettings.data.advanced,
          ...settingsData.advanced
        }
      };

      const div = document.createElement("div");
      div.setAttribute("id", "cb-app");
      document.body.appendChild(div);

      ReactDOM.render(
        <WidgetContainer
          className={classNames("cb-app-widget")}
          settings={settingsDataSafe}
          isMobile={window.innerWidth <= 767}
        />,
        document.getElementById("cb-app")
      );
    })
    .catch(err => {
      console.log(err);
    });
})();
