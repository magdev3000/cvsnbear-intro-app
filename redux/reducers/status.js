const defaultState = {
  loaded: false,
  isActive: false,
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'SET_LOADED':
      return { ...state, loaded: action.data } || {};
    case 'SET_IS_ACTIVE':
      return { ...state, isActive: action.data } || {};
    default:
      return state;
  }
};

export default reducer;
