import { NOTE, OTHER_OBJECT, TABLE } from "../components/url_navigation";
import React, { Component } from "react";

import ObjLink from "../components/obj_link";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

class LineObjects extends Component {
  getObjectWithObjectType(id) {
    let item = this.props.tables[id];
    if (item) {
      return { item, objectType: TABLE };
    }
    item = this.props.notes[id];
    if (item) {
      return { item, objectType: NOTE };
    }
    item = this.props.otherObjects[id];
    if (item) {
      return { item, objectType: OTHER_OBJECT };
    }
    return undefined;
  }

  render() {
    const parentWithObjectType = this.getObjectWithObjectType(
      this.props.lines[this.props.match.params.lid].parent
    );
    const childWithObjectType = this.getObjectWithObjectType(
      this.props.lines[this.props.match.params.lid].child
    );
    if (parentWithObjectType && childWithObjectType) {
      return (
        <div className="im-relations-grid">
          <ObjLink caption="Source" linkedItem={parentWithObjectType} />
          <ObjLink caption="Target" linkedItem={childWithObjectType} />
        </div>
      );
    }
    return <></>;
  }
}

function mapStateToProps(state) {
  return {
    lines: state.lines,
    tables: state.tables,
    notes: state.notes,
    otherObjects: state.otherObjects
  };
}

export default withRouter(connect(mapStateToProps)(LineObjects));
