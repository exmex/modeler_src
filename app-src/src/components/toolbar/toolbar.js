import React, { Component } from "react";

import AddToolbarContainer from "./container/add_toolbar_container";
import ConnectionsToolbarContainer from "./container/connections_toolbar_container";
import DisplayToolbarContainer from "./container/display_toolbar_container";
import EditToolbarContainer from "./container/edit_toolbar_container";
import FindToolbarContainer from "./container/find_toolbar_container";
import { ModelTypes } from "common";
import ProjectToolbarContainer from "./container/project_toolbar_container";
import ScriptToolbarContainer from "./container/script_toolbar_container";
import SettingsToolbarContainer from "./container/settings_toolbar_container";
import _ from "lodash";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

class Toolbar extends Component {
  render() {
    const isNotActiveEditableObject =
      ((this.props.type === ModelTypes.MONGODB ||
        this.props.type === ModelTypes.MONGOOSE) &&
        this.props.match.params.cid) ||
      (!this.props.match.params.id &&
        !this.props.match.params.rid &&
        !this.props.match.params.oid &&
        !this.props.match.params.lid &&
        !this.props.match.params.nid &&
        _.size(this.props.selections) < 1);
    const isActiveEditableObject = !isNotActiveEditableObject;

    const selectionExists = _.size(this.props.selections) > 0;
    const multiSelectionExists = _.size(this.props.selections) >= 2;

    const isEnabledToolbarItem = this.props.match.params.mid ? true : false;
    const missingModel = this.props.match.params.mid ? "" : " im-disabled";

    const hideSmall = " im-hide-small";
    const toolbarHeight = { padding: "5px" };

    const toolbarOptions = {
      selectionExists,
      isEnabledToolbarItem,
      missingModel,
      hideSmall,
      multiSelectionExists,
      isNotActiveEditableObject,
      isActiveEditableObject
    };
    return (
      <div tabIndex={0} className="toolbar" style={toolbarHeight}>
        <ConnectionsToolbarContainer />
        <ProjectToolbarContainer />

        <AddToolbarContainer toolbarOptions={toolbarOptions} />
        <EditToolbarContainer toolbarOptions={toolbarOptions} />

        <FindToolbarContainer toolbarOptions={toolbarOptions} />

        <ScriptToolbarContainer toolbarOptions={toolbarOptions} />
        <DisplayToolbarContainer toolbarOptions={toolbarOptions} />
        <div className="toolbar-item-spacer" />
        <SettingsToolbarContainer />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    selections: state.selections,
    type: state.model.type
  };
}

export default withRouter(connect(mapStateToProps)(Toolbar));
