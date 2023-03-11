import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import { TEST_ID } from "common";
import UIHelpers from "../../helpers/ui_helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { deleteLine } from "../../actions/lines";
import { getHistoryContext } from "../../helpers/history/history";
import { navigateToDiagramUrl } from "../../components/url_navigation";
import { toggleConfirmDeleteLine } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ConfirmDeleteLine extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.escFunction = this.escFunction.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.confirmDeleteLineIsDisplayed === true) {
        this.props.toggleConfirmDeleteLine();
      }
    }
  }

  async onConfirmClick() {
    const lid = this.props.match.params.lid;
    if (this.props.match.params.lid) {
      navigateToDiagramUrl(
        this.props.match.url,
        this.props.history,
        this.props.match.params.mid,
        this.props.match.params.did
      );
      await this.props.startTransaction(
        getHistoryContext(this.props.history, this.props.match),
        UndoRedoDef.CONFIRM_DELETE_LINE__DELETE_LINE
      );
      try {
        await this.props.deleteLine(lid);
      } finally {
        await this.props.finishTransaction();
      }

      this.props.toggleConfirmDeleteLine();
    }
  }

  onShowModalClick() {
    this.props.toggleConfirmDeleteLine();
    UIHelpers.setFocusToCanvasAndKeepScrollPosition();
  }

  render() {
    if (
      this.props.lines[this.props.match.params.lid] &&
      this.props.match.params.lid
    ) {
      return (
        <CSSTransition
          in={this.props.confirmDeleteLineIsDisplayed}
          key="confirmDeleteLine"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <div className="modal-wrapper">
            <Draggable handle=".modal-header">
              <div
                className="modal modal-confirm"
                data-testid={TEST_ID.CONFIRMATIONS.DELETE_LINE}
              >
                <div className="modal-header">
                  Delete {this.props.localization.L_LINE}
                </div>
                <div className="modal-content-confirm">
                  Are you sure you want to delete{" "}
                  {this.props.localization.L_LINE}{" "}
                  <b>"{this.props.lines[this.props.match.params.lid].name}"</b>{" "}
                  ?
                </div>
                <div className="modal-footer">
                  <button
                    className="im-btn-default im-margin-right"
                    onClick={this.onShowModalClick.bind(this)}
                  >
                    Close
                  </button>
                  <button
                    className="im-btn-default"
                    onClick={this.onConfirmClick.bind(this)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Draggable>
          </div>
        </CSSTransition>
      );
    } else {
      return "";
    }
  }
}

function mapStateToProps(state) {
  return {
    lines: state.lines,
    confirmDeleteLineIsDisplayed: state.ui.confirmDeleteLineIsDisplayed,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        deleteLine,
        toggleConfirmDeleteLine,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ConfirmDeleteLine)
);
