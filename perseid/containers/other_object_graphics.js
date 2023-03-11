import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";
import {
  switchLockDimensions,
  updateDiagramItemProperty
} from "../actions/diagrams";

import CheckboxSwitch from "../components/checkbox_switch";
import { CirclePicker as ColorPickerPanel } from "react-color";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { withRouter } from "react-router-dom";

class OtherObjectGraphics extends Component {
  async handleTextColorChange(obj) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_GRAPHICS__UPDATE_DIAGRAM_ITEM_PROPERTY_COLOR
    );
    try {
      await this.props.updateDiagramItemProperty(
        this.props.match.params.did,
        this.props.match.params.oid,
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
      UndoRedoDef.OTHER_OBJECT_GRAPHICS__UPDATE_DIAGRAM_ITEM_PROPERTY_BACKGROUND
    );
    try {
      await this.props.updateDiagramItemProperty(
        this.props.match.params.did,
        this.props.match.params.oid,
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
      UndoRedoDef.OTHER_OBJECT_GRAPHICS__UPDATE_DIAGRAM_ITEM_PROPERTY_BOOLEAN
    );
    try {
      await this.props.switchLockDimensions(
        [this.props.match.params.oid],
        !checked
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    const diagramItem =
      this.props.diagrams[this.props.match.params.did]?.diagramItems[
        this.props.match.params.oid
      ];
    if (!diagramItem) {
      return <></>;
    }
    return (
      <div>
        <div className="im-properties-grid">
          <div>Text color: </div>
          <div className="im-color-picker">
            <ColorPickerPanel
              width={"100%"}
              circleSize={20}
              circleSpacing={5}
              colors={[
                "#000000",
                "#333333",
                "#555555",
                "#777777",
                "#999999",
                "#cccccc",
                "#eeeeee",
                "#ffffff",
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

                "#cddc39"
              ]}
              enableAlpha={false}
              color={diagramItem.color}
              onChange={this.handleTextColorChange.bind(this)}
            />
          </div>

          <div>Background: </div>
          <div className="im-color-picker">
            <ColorPickerPanel
              width={"100%"}
              circleSize={20}
              circleSpacing={5}
              colors={[
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
                "#f2f2f2",
                "#cccccc",
                "#666666",
                "#000000",
                "#ffffff",
                "transparent"
              ]}
              enableAlpha={false}
              color={diagramItem.background}
              onChange={this.handleBackgroundChange.bind(this)}
            />
          </div>
          <div />
          <CheckboxSwitch
            label="Lock dimensions"
            checked={diagramItem.resized}
            onChange={this.switchLockDimensions.bind(this)}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    diagrams: state.diagrams
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateDiagramItemProperty,
        switchLockDimensions,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(OtherObjectGraphics)
);
