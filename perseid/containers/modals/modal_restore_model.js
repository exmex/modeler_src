import React, { Component } from "react";
import { clearBackupModel, restoreBackupModel } from "../../actions/settings";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import { ModelTypesForHumans } from "../../enums/enums";
import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { toggleRestoreModelModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalRestoreModel extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.pressContinueDiscard = this.pressContinueDiscard.bind(this);
    this.pressContinueRestore = this.pressContinueRestore.bind(this);
  }

  async pressContinueDiscard() {
    this.closeModal();
    await this.props.clearBackupModel();
  }

  async pressContinueRestore() {
    this.closeModal();
    await this.props.restoreBackupModel(
      getHistoryContext(this.props.history, this.props.match)
    );
  }

  closeModal() {
    if (this.props.restoreModelModalIsDisplayed === true) {
      this.props.toggleRestoreModelModal();
    }
  }

  render() {
    return this.props.restoreModelModalIsDisplayed === true ? (
      <CSSTransition
        in={this.props.restoreModelModalIsDisplayed}
        key="confirmRestoreModel"
        classNames="fade"
        unmountOnExit
        timeout={{ enter: 500, exit: 100 }}
      >
        <div className="modal-wrapper">
          <Draggable handle=".modal-header">
            <div
              className="modal modal-confirm"
              data-testid={TEST_ID.MODALS.RESTORE_MODEL}
            >
              <div className="modal-header">Unsaved changes detected</div>
              <div className="modal-content-confirm">
                {"Unsaved changes detected in project '"}
                <b>{this.props.unsavedModel.model.name}</b>' (
                {ModelTypesForHumans[this.props.unsavedModel.model.type]}){"."}
                <br />
                Project saved at{" "}
                <b>{this.props.unsavedModel.model.lastSaved}</b>
                <br />
                Backup saved at:{" "}
                <b>{this.props.unsavedModel.model.lastSavedBackup}</b>
                <br />
                <br />
                {"To restore changes, click Restore changes and continue "}
                <br /> {"or click Discard changes and continue."}
              </div>
              <div className="modal-footer">
                <button
                  className="im-btn-default im-margin-right"
                  onClick={this.pressContinueDiscard}
                  data-testid={
                    TEST_ID.MODAL_RESTORE_MODEL.DISCARD_CHANGES_AND_CONTINUE
                  }
                >
                  Discard changes and continue
                </button>
                <button
                  className="im-btn-default"
                  onClick={this.pressContinueRestore}
                >
                  Restore changes and continue
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
    restoreModelModalIsDisplayed: state.ui.restoreModelModalIsDisplayed,
    unsavedModel: state.settings.unsavedModel
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleRestoreModelModal,
        restoreBackupModel,
        clearBackupModel,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalRestoreModel)
);
