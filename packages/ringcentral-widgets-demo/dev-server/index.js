import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { createPhone } from './Phone';
import App from './containers/App';
import RcIcon from './Icon.svg';
import apiConfig from './api-config';
import brandConfig from './brandConfig';
import version from './version';
import prefix from './prefix';

const phone = createPhone({
  apiConfig, brandConfig, prefix, version
});
/* eslint-disable no-underscore-dangle */
const store = createStore(phone.reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
/* eslint-disable no-underscore-dangle */
phone.setStore(store);

window.phone = phone;

ReactDOM.render(
  <App
    phone={phone}
    icon={RcIcon}
  />,
  document.querySelector('div#viewport'),
);
