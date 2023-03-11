import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import ArrowClosedEnd from "../assets/ArrowClosedEnd.svg";
import ArrowEnd from "../assets/ArrowEnd.svg";
import ArrowReversedClosedEnd from "../assets/ArrowReversedClosedEnd.svg";
import Choice from "../components/choice";
import CircleEnd from "../assets/CircleEnd.svg";
import DiamondEnd from "../assets/DiamondEnd.svg";
import DiamondStart from "../assets/DiamondStart.svg";
import Line from "../assets/Line.svg";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { updateLineProperty } from "../actions/lines";
import { withRouter } from "react-router-dom";

class LineMarkers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      availableStartMarkers: [
        { id: "none", text: "Line", icon: Line },
        { id: "arrowStart", text: "Simple arrow", icon: ArrowEnd },
        {
          id: "arrowClosedStart",
          text: "Closed arrow",
          icon: ArrowClosedEnd
        },
        {
          id: "arrowReversedClosedStart",
          text: "Closed reversed arrow",
          icon: ArrowReversedClosedEnd
        },
        { id: "circleStart", text: "Circle", icon: CircleEnd },
        { id: "diamondStart", text: "Diamond", icon: DiamondEnd }
      ],
      availableEndMarkers: [
        { id: "none", text: "Line", icon: Line },
        { id: "arrowEnd", text: "Simple arrow", icon: ArrowEnd },
        {
          id: "arrowClosedEnd",
          text: "Closed arrow",
          icon: ArrowClosedEnd
        },
        {
          id: "arrowReversedClosedEnd",
          text: "Closed reversed arrow",
          icon: ArrowReversedClosedEnd
        },
        { id: "circleEnd", text: "Circle", icon: CircleEnd },
        { id: "diamondEnd", text: "Diamond", icon: DiamondStart }
      ]
    };
  }

  async handleChangeMarkerStart(value) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.LINE_MARKERS__UPDATE_LINE_PROPERTY_MARKER_START
    );
    try {
      await this.props.updateLineProperty(
        this.props.match.params.lid,
        value,
        "markerStart"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleChangeMarkerEnd(value) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.LINE_MARKERS__UPDATE_LINE_PROPERTY_MARKER_END
    );
    try {
      await this.props.updateLineProperty(
        this.props.match.params.lid,
        value,
        "markerEnd"
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
          <div>Start marker: </div>
          <div className="im-line-markers">
            <Choice
              customClassName="im-choice-circle"
              customImgClassName="im-choice-markers"
              onClick={this.handleChangeMarkerStart.bind(this)}
              choices={this.state.availableStartMarkers}
              selectedChoiceId={
                this.props.lines[this.props.match.params.lid].markerStart
              }
            />
          </div>
        </div>
        <div className="im-properties-grid">
          <div>End marker: </div>
          <div className="im-line-markers">
            <Choice
              customClassName="im-choice-circle"
              customImgClassName="im-choice-markers"
              onClick={this.handleChangeMarkerEnd.bind(this)}
              choices={this.state.availableEndMarkers}
              selectedChoiceId={
                this.props.lines[this.props.match.params.lid].markerEnd
              }
            />
          </div>
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
  connect(mapStateToProps, mapDispatchToProps)(LineMarkers)
);
