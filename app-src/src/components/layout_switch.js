import { Route, Switch } from "react-router-dom";

import Layout from "./layout";
import React from "react";

const LayoutSwitch = () => (
  <Switch>
    <Route path="/notifications" component={Layout} />
    <Route path="/config" component={Layout} />
    <Route path="/models" component={Layout} />
    <Route path="/connections" component={Layout} />
    <Route path="/connections-update" component={Layout} />
    <Route path="/account" component={Layout} />

    <Route
      path="/model/:mid/diagram/:did/item/:id/ix/:iid"
      component={Layout}
    />
    <Route
      path="/model/:mid/diagram/:did/emb/:id/col/:cid"
      component={Layout}
    />
    <Route
      path="/model/:mid/diagram/:did/item/:id/col/:cid"
      component={Layout}
    />
    <Route path="/model/:mid/diagram/:did/emb/:id" component={Layout} />
    <Route path="/model/:mid/diagram/:did/item/:id" component={Layout} />

    <Route path="/model/:mid/diagram/:did/relation/:rid" component={Layout} />
    <Route path="/model/:mid/diagram/:did/line/:lid" component={Layout} />
    <Route path="/model/:mid/diagram/:did/note/:nid" component={Layout} />
    <Route path="/model/:mid/diagram/:did/other/:oid" component={Layout} />
    <Route path="/model/:mid/diagram/:did/project/:pid" component={Layout} />
    <Route path="/model/:mid/diagram/:did" component={Layout} />

    <Route path="/" strict component={Layout} />
  </Switch>
);

export default LayoutSwitch;
