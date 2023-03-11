import React, { Component } from "react";

import ObjLink from "../components/obj_link";
import { TABLE } from "../components/url_navigation";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

class RelationObjects extends Component {
  render() {
    const relation = this.props.relations[this.props.match.params.rid];
    const parent = this.props.tables[relation.parent];
    const child = this.props.tables[relation.child];
    return (
      <div className="im-relations-grid">
        <ObjLink
          caption="Parent table"
          linkedItem={{ item: parent, objectType: TABLE }}
        />
        <ObjLink
          caption="Child table"
          linkedItem={{ item: child, objectType: TABLE }}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    relations: state.relations,
    tables: state.tables
  };
}

export default withRouter(connect(mapStateToProps)(RelationObjects));
