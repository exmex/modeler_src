import { DEV_DEBUG, isDebug } from "./web_env";
import { applyMiddleware, createStore } from "redux";

import ErrorBoundary from "./containers/error_boundary";
import { Provider } from "react-redux";
import React from "react";
import ReduxPromise from "redux-promise";
import { Router } from "react-router-dom";
import { createHashHistory } from "history";
import reducers from "./reducers";
import thunk from "redux-thunk";

const hashHistory = createHashHistory();
const store = applyMiddleware(thunk, ReduxPromise)(createStore);
export let storeInstance;

export default (props) => {
  storeInstance = isDebug([DEV_DEBUG])
    ? store(
        reducers,
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
          window.__REDUX_DEVTOOLS_EXTENSION__({ trace: true })
      )
    : store(reducers);
  return (
    <Provider store={storeInstance}>
      <Router history={hashHistory}>
        <ErrorBoundary store={storeInstance}>{props.children}</ErrorBoundary>
      </Router>
    </Provider>
  );
};
