import React, { Component } from "react";
import { finishTransaction, startTransaction, undo } from "../actions/undoredo";

import { CirclePicker as ColorPickerPanel } from "react-color";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { updateLineProperty } from "../actions/lines";
import { withRouter } from "react-router-dom";

class LineGraphics extends Component {
  async handleChangeLineColor(obj) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.LINE_GRAPHICS__UPDATE_LINE_PROPERTY_LINE_COLOR
    );
    try {
      this.props.updateLineProperty(
        this.props.match.params.lid,
        obj.hex,
        "lineColor"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleChangeLineLineGraphics(event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.LINE_GRAPHICS__UPDATE_LINE_PROPERTY_LINEGRAPHICS
    );
    try {
      await this.props.updateLineProperty(
        this.props.match.params.lid,
        value,
        "linegraphics"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    if (!this.props.match.params.lid || this.props.match.params.lid === null) {
      return null;
    }

    if (this.props.lines[this.props.match.params.lid] === undefined) {
      return null;
    }

    return (
      <div>
        <div className="im-properties-grid">
          <div>Line color: </div>
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
              ]}
              enableAlpha={false}
              color={this.props.lines[this.props.match.params.lid].lineColor}
              onChange={this.handleChangeLineColor.bind(this)}
            />
          </div>

          <div>Line mode:</div>
          <select
            value={this.props.lines[this.props.match.params.lid].linegraphics}
            onChange={this.handleChangeLineLineGraphics.bind(this)}
          >
            <option value="basic">Basic</option>
            <option value="detailed">Detailed (Header to header)</option>
            <option value="default">Inherited (From project settings)</option>
          </select>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    lines: state.lines
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateLineProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(LineGraphics)
);
