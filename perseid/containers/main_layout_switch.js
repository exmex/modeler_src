import { Route, Switch } from "react-router-dom";

import Account from "./account";
import AppContainer from "./app_container";
import ConfigPage from "./config_page";
import Connections from "./connections";
import Models from "./models";
import NotificationsPage from "./notifications_page";
import React from "react";

const MainLayoutSwitch = () => (
  <Switch>
    <Route path="/notifications" component={NotificationsPage} />
    <Route path="/config" component={ConfigPage} />
    <Route path="/models" component={Models} />
    <Route path="/connections" component={Connections} />
    <Route path="/account" component={Account} />

    <Route
      path="/model/:mid/diagram/:did/item/:id/ix/:iid"
      component={AppContainer}
    />

    <Route
      path="/model/:mid/diagram/:did/emb/:id/col/:cid"
      component={AppContainer}
    />
    <Route
      path="/model/:mid/diagram/:did/item/:id/col/:cid"
      component={AppContainer}
    />

    <Route path="/model/:mid/diagram/:did/emb/:id" component={AppContainer} />
    <Route path="/model/:mid/diagram/:did/item/:id" component={AppContainer} />

    <Route
      path="/model/:mid/diagram/:did/relation/:rid"
      component={AppContainer}
    />
    <Route path="/model/:mid/diagram/:did/line/:lid" component={AppContainer} />
    <Route path="/model/:mid/diagram/:did/note/:nid" component={AppContainer} />
    <Route
      path="/model/:mid/diagram/:did/other/:oid"
      component={AppContainer}
    />
    <Route
      path="/model/:mid/diagram/:did/project/:pid"
      component={AppContainer}
    />
    <Route path="/model/:mid/diagram/:did" component={AppContainer} />
  </Switch>
);

export default MainLayoutSwitch;
