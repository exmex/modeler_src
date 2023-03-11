import React, { Component } from "react";
import {
  clearUnsavedChangesModalAction,
  executeUnsavedChangesModalAction,
  toggleUnsavedChangesModal
} from "../../actions/ui";
import { finishTransaction, startTransaction } from "../../actions/undoredo";
import { saveModel, updateModelProperty } from "../../actions/model";

import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import { IPCContext } from "../../helpers/ipc/ipc";
import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { clearBackupModel } from "../../actions/settings";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { withRouter } from "react-router";

const ipcRenderer = window?.ipcRenderer;

class ModalUnsavedChanges extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.pressContinueDiscard = this.pressContinueDiscard.bind(this);
    this.pressContinueSave = this.pressContinueSave.bind(this);
  }

  async pressContinueDiscard() {
    const posponedAction = this.props.unsavedChangesModalAction;
    this.closeModal();
    await this.props.clearBackupModel();
    await this.props.updateModelProperty(this.props.modelId, false, "isDirty");

    await this.props.executeUnsavedChangesModalAction(
      posponedAction,
      new IPCContext(posponedAction.ipcAction),
      getHistoryContext(this.props.history, this.props.match)
    );
  }

  pressContinueSave() {
    const posponedAction = this.props.unsavedChangesModalAction;

    this.props.saveModel(ipcRenderer, false, async (cancelled) => {
      if (cancelled === false) {
        this.closeModal();

        await this.props.executeUnsavedChangesModalAction(
          posponedAction,
          new IPCContext(posponedAction.ipcAction),
          getHistoryContext(this.props.history, this.props.match)
        );
      }
    });
  }

  closeModal() {
    this.props.clearUnsavedChangesModalAction();
    if (this.props.unsavedChangesModalIsDisplayed === true) {
      this.props.toggleUnsavedChangesModal();
    }
  }

  render() {
    const cancelButtonCaption = this.props.cancelButtonCaption
      ? this.props.cancelButtonCaption
      : "Close";
    return this.props.unsavedChangesModalIsDisplayed === true ? (
      <CSSTransition
        in={this.props.unsavedChangesModalIsDisplayed}
        key="confirmUnsavedChanges"
        classNames="fade"
        unmountOnExit
        timeout={{ enter: 500, exit: 100 }}
      >
        <div className="modal-wrapper">
          <Draggable handle=".modal-header">
            <div
              className="modal modal-confirm"
              data-testid={TEST_ID.MODALS.UNSAVED_CHANGES}
            >
              <div className="modal-header">Unsaved changes detected</div>
              <div className="modal-content-confirm">
                {"Unsaved changes detected in project '"}
                <b>{this.props.name}</b>
                {"'."}
                <br />
                <br />
                {"To save changes, click Save changes and continue "}
                <br /> {"or click Close and save the project manually."}
              </div>
              <div className="modal-footer">
                <button
                  className="im-btn-default im-margin-right"
                  onClick={this.closeModal}
                >
                  {cancelButtonCaption}
                </button>

                <button
                  className="im-btn-default im-margin-right"
                  onClick={this.pressContinueDiscard}
                  data-testid={
                    TEST_ID.MODAL_UNSAVED_CHANGES.DISCARD_CHANGES_AND_CONTINUE
                  }
                >
                  Discard changes and continue
                </button>
                <button
                  className="im-btn-default"
                  onClick={this.pressContinueSave}
                >
                  Save changes and continue
                </button>
              </div>
            </div>
          </Draggable>
        </div>
      </CSSTransition>
    ) : (
      ""
    );
  }
}

function mapStateToProps(state) {
  return {
    unsavedChangesModalIsDisplayed: state.ui.unsavedChangesModalIsDisplayed,
    unsavedChangesModalAction: state.ui.unsavedChangesModalAction,
    name: state.model.name,
    modelId: state.model.id
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleUnsavedChangesModal,
        executeUnsavedChangesModalAction,
        clearBackupModel,
        clearUnsavedChangesModalAction,
        finishTransaction,
        startTransaction,
        saveModel,
        updateModelProperty
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalUnsavedChanges)
);
