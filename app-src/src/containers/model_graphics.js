import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import { CirclePicker as ColorPickerPanel } from "react-color";
import { ModelTypes } from "common";
import UIHelpers from "../helpers/ui_helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { updateModelProperty } from "../actions/model";
import { withRouter } from "react-router-dom";

class ModelGraphics extends Component {
  async handleChangeColor(obj) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_GRAPHICS__UPDATE_MODEL_PROPERTY_COLOR
    );
    try {
      await this.props.updateModelProperty(
        this.props.match.params.mid,
        obj.hex,
        "color"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleDistance(event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_PROPERTIES_VALUES__UPDATE_MODEL_PROPERTY_DISTANCE
    );
    try {
      await this.props.updateModelProperty(
        this.props.match.params.mid,
        value,
        "embeddedDistance"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    return (
      <div>
        <div className="im-properties-grid">
          <div>Footer color: </div>
          <div className="im-color-picker">
            <ColorPickerPanel
              width={"100%"}
              circleSize={20}
              circleSpacing={5}
              colors={[
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
              color={this.props.color}
              onChange={this.handleChangeColor.bind(this)}
            />
          </div>

          {/*(this.props.type === ModelTypes.MONGODB ||
            this.props.type === ModelTypes.MONGOOSE) && (
            <>
              <div>Distance: </div>
              <div>
                <select
                  value={this.props.embeddedDistance}
                  onChange={this.handleDistance.bind(this)}
                >
                  {UIHelpers.makeSelect([80, 100, 120])}
                </select>
              </div>
            </>
            )*/}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    color: state.model.color,
    type: state.model.type,
    embeddedDistance: state.model.embeddedDistance
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateModelProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModelGraphics)
);
