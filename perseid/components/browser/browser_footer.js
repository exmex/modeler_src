import React, { Component } from "react";

import CheckboxSwitch from "../checkbox_switch";
import Helpers from "../../helpers/helpers";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getActiveDiagramObject } from "../../selectors/selector_diagram";
import { setForcedRender } from "../../actions/ui";
import { updateSettingsProperty } from "../../actions/settings";
import { withRouter } from "react-router-dom";

const SHOW_ITEMS_FROM_MAIN_DIAGRAM = "Show items from Main diagram";
const SHOW_ALL_OBJECTS_IN_LIST_PROPERTY = "showAllObjectsInList";
class BrowserFooter extends Component {
  handleChange(propName, event) {
    this.props.updateSettingsProperty(event.target.checked, propName);
    this.props.setForcedRender({ domToModel: false });
  }

  isMainDiagram() {
    return this.props.activeDiagramObject?.main === true;
  }

  render() {
    return (
      <div>
        <div />
        {!this.isMainDiagram() && (
          <CheckboxSwitch
            label={SHOW_ITEMS_FROM_MAIN_DIAGRAM}
            checked={Helpers.gch(this.props.settings.showAllObjectsInList)}
            onChange={this.handleChange.bind(
              this,
              SHOW_ALL_OBJECTS_IN_LIST_PROPERTY
            )}
          />
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    settings: state.settings,
    activeDiagramObject: getActiveDiagramObject(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateSettingsProperty,
        setForcedRender
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(BrowserFooter)
);
