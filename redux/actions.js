
export function getSettings() {
  return async dispatch => {
    try {
      const data = await fetch("/settings").then(resp => resp.json());
      dispatch({ type: "SET_IS_ACTIVE", data: data.isActive });
      dispatch({
        type: "GET_SETTINGS",
        data: { ...data, isActive: undefined }
      });
      dispatch({ type: "SET_LOADED", data: true });
      return data;
    } catch (error) {
      // TODO: process error
    }
  };
}

export function getShop() {
  return async dispatch => {
    try {
      const data = await fetch("/shop").then(resp => resp.json());
      dispatch({ type: "GET_SHOP", data: data });
      return data;
    } catch (error) {
      // TODO: process error
    }
  };
}

export function setSettings(settings) {
  return async dispatch => {
    try {
      dispatch({ type: "SET_SETTINGS_SAVING", data: true });
      await fetch("/settings", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      }).then(resp => resp.json());
      dispatch({ type: "SET_SETTINGS", data: settings });
      dispatch({ type: "SET_SETTINGS_DISPAY_SAVED_NOTICE", data: true });
      setTimeout(() => {
        dispatch({ type: "SET_SETTINGS_DISPAY_SAVED_NOTICE", data: false });
      }, 2000);
      return settings;
    } catch (error) {
      // TODO: process error
      return settings;
    }
  };
}

export function enableShop() {
  return dispatch => {
    return fetch("/shops/enable", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    })
      .then(resp => resp.json())
      .then(() => {
        dispatch({ type: "SET_IS_ACTIVE", data: true });
      })
      .catch(err => {
        console.log(err);
      });
  };
}

export function disableShop() {
  return dispatch => {
    return fetch("/shops/disable", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    })
      .then(resp => resp.json())
      .then(() => {
        dispatch({ type: "SET_IS_ACTIVE", data: false });
      })
      .catch(err => {
        console.log(err);
      });
  };
}