import React, { Component } from "react";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "../../actions/undoredo";

import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import { TEST_ID } from "common";
import UIHelpers from "../../helpers/ui_helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { deleteDiagram } from "../../actions/diagrams";
import { getHistoryContext } from "../../helpers/history/history";
import { navigateToDiagramUrl } from "../../components/url_navigation";
import { showMainDiagram } from "../../actions/model";
import { toggleConfirmDeleteDiagram } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ConfirmDeleteDiagram extends Component {
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
      if (this.props.confirmDeleteDiagramIsDisplayed === true) {
        this.props.toggleConfirmDeleteDiagram();
      }
    }
  }

  async onConfirmClick() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.CONFIRM_DELETE_DIAGRAM__DELETE_DIAGRAM
    );
    try {
      const historyContext = getCurrentHistoryTransaction().historyContext;
      if (historyContext.state.diagramId) {
        navigateToDiagramUrl(
          historyContext.state.url,
          historyContext.history,
          historyContext.state.modelId,
          historyContext.state.diagramId
        );
        await this.props.deleteDiagram(historyContext.state.diagramId);
        await this.props.showMainDiagram(historyContext);
        this.props.toggleConfirmDeleteDiagram();
        UIHelpers.setFocusToCanvasAndKeepScrollPosition();
      }
    } finally {
      await this.props.finishTransaction();
    }
  }

  onShowModalClick() {
    this.props.toggleConfirmDeleteDiagram();
    UIHelpers.setFocusToCanvasAndKeepScrollPosition();
  }

  render() {
    const diagram = this.props.match.params.did
      ? this.props.diagrams[this.props.match.params.did]
      : undefined;

    if (diagram) {
      return (
        <CSSTransition
          in={this.props.confirmDeleteDiagramIsDisplayed}
          key="confirmDeleteDiagram"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <div className="modal-wrapper">
            <Draggable handle=".modal-header">
              <div
                className="modal modal-confirm"
                data-testid={TEST_ID.CONFIRMATIONS.DELETE_DIAGRAM}
              >
                <div className="modal-header">
                  Delete {this.props.localization.L_DIAGRAM}
                </div>
                <div className="modal-content-confirm">
                  Are you sure you want to delete{" "}
                  {this.props.localization.L_DIAGRAM} <b>"{diagram.name}"</b> ?
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
    diagrams: state.diagrams,
    confirmDeleteDiagramIsDisplayed: state.ui.confirmDeleteDiagramIsDisplayed,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        deleteDiagram,
        showMainDiagram,
        toggleConfirmDeleteDiagram,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ConfirmDeleteDiagram)
);
