import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { i18nReducer } from 'react-redux-i18n';
import settings from './reducers/settings';
import status from './reducers/status';
import shop from './reducers/shop';

export default combineReducers({
  form: formReducer,
  i18n: i18nReducer,
  status,
  settings,
  shop
});
