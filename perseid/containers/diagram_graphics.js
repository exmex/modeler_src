import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import CheckboxSwitch from "../components/checkbox_switch";
import { CirclePicker as ColorPickerPanel } from "react-color";
import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import { ModelTypes } from "../enums/enums";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getActiveDiagramObject } from "../selectors/selector_diagram";
import { getHistoryContext } from "../helpers/history/history";
import { updateDiagramProperty } from "../actions/diagrams";
import { withRouter } from "react-router-dom";

const PALETTE = [
  "#f9e79f",
  "#fcf3cf",
  "#f6ddcc",
  "#d1f2eb",
  "#d6eaf8",
  "#ebdef0",
  "#fadbd8",
  "#03a9f4",
  "#8bc34a",
  "#f44336",
  "#ff9800",
  "#ffc107",
  "#ffeb3b",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#cddc39",
  "#ff5722",
  "#795548",
  "#607d8b",
  "#ffffff",
  "#f2f2f2",
  "#eeeeee",
  "#cccccc",
  "#999999",
  "#777777",
  "#666666",
  "#585858",
  "#555555",
  "#404040",
  "#333333",
  "#222222",
  "#111111",
  "#000000",
  "red",
  "green",
  "blue",
  "transparent"
];

class DiagramGraphics extends Component {
  async handleColorChange(pName, obj) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.DIAGRAM_GRAPHICS__UPDATE_DIAGRAM_PROPERTY_COLOR
    );
    try {
      await this.props.updateDiagramProperty(
        this.props.match.params.did,
        obj.hex,
        pName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.DIAGRAM_GRAPHICS__UPDATE_DIAGRAM_PROPERTY_BOOLEAN
    );
    try {
      await this.props.updateDiagramProperty(
        this.props.match.params.did,
        checked,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.DIAGRAM_GRAPHICS__UPDATE_DIAGRAM_PROPERTY
    );
    try {
      await this.props.updateDiagramProperty(
        this.props.match.params.did,
        value,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  colorPicker(type) {
    return (
      <div className="im-color-picker">
        <ColorPickerPanel
          width={"100%"}
          circleSize={20}
          circleSpacing={5}
          colors={PALETTE}
          enableAlpha={false}
          color={this.props.activeDiagramObject[type]}
          onChange={this.handleColorChange.bind(this, type)}
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className="im-properties-grid">
          <div>Background: </div>
          {this.colorPicker("background")}

          {!JsonSchemaHelpers.isPerseidModelType(this.props.type) && (
            <>
              <div>
                {_.upperFirst(this.props.localization.L_RELATION)} color:{" "}
              </div>
              {this.colorPicker("lineColor")}

              <div>
                {_.upperFirst(this.props.localization.L_RELATION)} mode:
              </div>
              <select
                value={this.props.activeDiagramObject.linegraphics}
                onChange={this.handleTextChange.bind(this, "linegraphics")}
              >
                <option value="detailed">Detailed (Column to column)</option>
                <option value="basic">Basic</option>
              </select>

              <div />
              <CheckboxSwitch
                label="Keys displayed graphically"
                checked={this.props.activeDiagramObject.keysgraphics}
                onChange={this.handleCheckboxChange.bind(this, "keysgraphics")}
              />
            </>
          )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeDiagramObject: getActiveDiagramObject(state),
    localization: state.localization,
    type: state.model.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateDiagramProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DiagramGraphics)
);
