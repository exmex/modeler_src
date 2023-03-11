import { Route, Switch } from "react-router-dom";

import ColumnDetail from "./column_detail";
import DiagramDetail from "./diagram_detail";
import EmbDetail from "./emb_detail";
import LineDetail from "./line_detail";
import ModelDetail from "./model_detail";
import NoteDetail from "./note_detail";
import OtherObjectDetail from "./other_object_detail";
import React from "react";
import RelationDetail from "./relation_detail";
import TableDetail from "./table_detail";

const Main = () => (
  <main>
    <Switch>
      <Route
        path="/model/:mid/diagram/:did/emb/:id/col/:cid"
        component={ColumnDetail}
      />
      <Route
        path="/model/:mid/diagram/:did/item/:id/col/:cid"
        component={ColumnDetail}
      />
      <Route path="/model/:mid/diagram/:did/emb/:id" component={EmbDetail} />
      <Route path="/model/:mid/diagram/:did/item/:id" component={TableDetail} />

      <Route
        path="/model/:mid/diagram/:did/relation/:rid"
        component={RelationDetail}
      />
      <Route path="/model/:mid/diagram/:did/line/:lid" component={LineDetail} />
      <Route path="/model/:mid/diagram/:did/note/:nid" component={NoteDetail} />
      <Route
        path="/model/:mid/diagram/:did/other/:oid"
        component={OtherObjectDetail}
      />
      <Route path="/model/:mid/diagram/:did/project" component={ModelDetail} />
      <Route path="/model/:mid/diagram/:did" component={DiagramDetail} />
      <Route exact path="/" component={ModelDetail} />
    </Switch>
  </main>
);

export default Main;
