import { Component } from "react";
import ERDDiagramDisplayToolbarContainer from "./erd_diagram_display_toolbar_container";
import JsonSchemaHelpers from "../../../platforms/jsonschema/helpers_jsonschema";
import PerseidDisplayToolbarContainer from "./treediagram_display_toolbar_container";
import React from "react";
import { getActiveDiagramObject } from "../../../selectors/selector_diagram";
import { connect } from "react-redux";

class DisplayToolbarContainer extends Component {
  constructor(toolbarOptions) {
    super();
    this.toolbarOptions = toolbarOptions;
  }

  render() {
    const isERDDiagram = this.props.activeDiagramObject?.type === "erd";
    const isPerseid = JsonSchemaHelpers.isPerseidModelType(this.props.type);
    return (
      <>
        {isPerseid && (
          <PerseidDisplayToolbarContainer
            toolbarOptions={this.props.toolbarOptions}
          />
        )}
        {isERDDiagram && (
          <ERDDiagramDisplayToolbarContainer
            toolbarOptions={this.props.toolbarOptions}
          />
        )}
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeDiagramObject: getActiveDiagramObject(state),
    type: state.model.type
  };
}

export default connect(mapStateToProps)(DisplayToolbarContainer);
