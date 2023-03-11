import React, { Component } from "react";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "../actions/undoredo";

import CheckboxSwitch from "../components/checkbox_switch";
import { CirclePicker as ColorPickerPanel } from "react-color";
import { ModelTypes } from "common";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getActiveDiagramObject } from "../selectors/selector_diagram";
import { getHistoryContext } from "../helpers/history/history";
import { switchLockDimensions } from "../actions/diagram_manipulation";
import { updateDiagramItemProperty } from "../actions/diagrams";
import { withRouter } from "react-router-dom";

const PALETTE = [
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
class TableGraphics extends Component {
  async handleTextColorChange(obj) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TABLE_GRAPHICS__UPDATE_DIAGRAM_ITEM_PROPERTY_COLOR
    );
    try {
      await this.props.updateDiagramItemProperty(
        this.props.match.params.did,
        this.props.match.params.id,
        obj.hex,
        "color"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleBackgroundChange(obj) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TABLE_GRAPHICS__UPDATE_DIAGRAM_ITEM_PROPERTY_BACKGROUND
    );
    try {
      await this.props.updateDiagramItemProperty(
        this.props.match.params.did,
        this.props.match.params.id,
        obj.hex,
        "background"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async switchLockDimensions(event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TABLE_GRAPHICS__UPDATE_DIAGRAM_ITEM_PROPERTY_BOOLEAN
    );
    try {
      await this.props.switchLockDimensions(
        [this.props.match.params.id],
        !checked
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleAutoExpand(event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TABLE_GRAPHICS__UPDATE_DIAGRAM_ITEM_PROPERTY_COLOR
    );
    try {
      await this.props.updateDiagramItemProperty(
        this.props.match.params.did,
        this.props.match.params.id,
        checked,
        "autoExpand"
      );

      getCurrentHistoryTransaction().addResizeRequest({
        operation: "autoExpandSwitch",
        domToModel: true,
        possibleHeightChange: true,
        objects: [this.props.match.params.id]
      });
    } finally {
      await this.props.finishTransaction();
    }
  }

  activeTable() {
    return this.props.activeDiagramObject.diagramItems[
      this.props.match.params.id
    ];
  }

  render() {
    return (
      <div>
        <div className="im-properties-grid">
          <div>Text color: </div>
          <div className="im-color-picker">
            <ColorPickerPanel
              width={"100%"}
              circleSize={20}
              circleSpacing={5}
              colors={PALETTE}
              enableAlpha={false}
              color={this.activeTable().color}
              onChange={this.handleTextColorChange.bind(this)}
            />
          </div>

          <div>Background: </div>
          <div className="im-color-picker">
            <ColorPickerPanel
              width={"100%"}
              circleSize={20}
              circleSpacing={5}
              colors={PALETTE}
              enableAlpha={false}
              color={this.activeTable().background}
              onChange={this.handleBackgroundChange.bind(this)}
            />
          </div>

          <div />
          <CheckboxSwitch
            label="Lock dimensions"
            checked={this.activeTable().resized}
            onChange={this.switchLockDimensions.bind(this)}
          />
          {this.props.type !== ModelTypes.MONGODB &&
            this.props.type !== ModelTypes.MONGOOSE && (
              <>
                <div />
                <CheckboxSwitch
                  hidden={!this.activeTable().resized}
                  label="Auto expand"
                  checked={this.activeTable().autoExpand}
                  onChange={this.handleAutoExpand.bind(this)}
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
    type: state.model.type
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateDiagramItemProperty,
        finishTransaction,
        startTransaction,
        switchLockDimensions
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TableGraphics)
);
