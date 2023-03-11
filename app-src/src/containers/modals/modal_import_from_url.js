import { IPCContext, createImportFromUrlAction } from "../../helpers/ipc/ipc";
import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";
import {
  setDiagramLoading,
  setUnsavedChangesModalAction,
  toggleImportFromUrlModal,
  toggleUnsavedChangesModal
} from "../../actions/ui";

import { CSSTransition } from "react-transition-group";
import { DebounceInput } from "react-debounce-input";
import Draggable from "react-draggable";
import { TEST_ID } from "common";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { provideModel } from "../../actions/model";
import { withRouter } from "react-router-dom";

class ModalImportFromUrl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: ""
    };
    this.escFunction = this.escFunction.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  async escFunction(event) {
    if (event.keyCode === 27) {
      if (this.props.importFromUrlModalIsDisplayed === true) {
        this.props.toggleImportFromUrlModal();
      }
    }
  }

  handleChangeUrl(event) {
    this.setState({ url: event.target.value });
  }

  onCloseButtonClicked() {
    this.setState({ url: "" });
    this.props.toggleImportFromUrlModal();
  }

  async importFromUrl() {
    const historyContext = getHistoryContext(
      this.props.history,
      this.props.match
    );
    await this.props.startTransaction(
      historyContext,
      UndoRedoDef.MODELS_IMPORT_MODEL_FROM_URL
    );
    try {
      await this.props.setDiagramLoading(true);
      await this.props.toggleImportFromUrlModal();
      await this.props.provideModel(
        historyContext,
        this.props.isDirty,
        new IPCContext(createImportFromUrlAction()),
        { urlPath: this.state.url, autolayout: true, cancelable: true }
      );
    } finally {
      await this.props.finishTransaction(true);
    }
  }

  isValid() {
    try {
      return !!new URL(this.state.url);
    } catch {
      return false;
    }
  }

  render() {
    if (this.props.importFromUrlModalIsDisplayed === true) {
      var disabledButton = !this.isValid();
      var buttonStyle = !this.isValid()
        ? "im-btn-default im-disabled"
        : "im-btn-default";
      return (
        <CSSTransition
          in={this.props.importFromUrlModalIsDisplayed}
          key="ModalImportFromUrl"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <div className="modal-wrapper">
            <Draggable handle=".modal-header">
              <div
                className="modal modal-confirm"
                data-testid={TEST_ID.MODALS.IMPORT_FROM_URL}
              >
                <div className="modal-header">
                  Import a GraphQL schema from URL path
                </div>
                <div className="modal-content-confirm">
                  <div>
                    <div className="im-properties-grid">
                      <div className="im-align-self-center">URL path:</div>
                      <DebounceInput
                        autoFocus
                        minLength={1}
                        debounceTimeout={300}
                        type="text"
                        value={this.state.url}
                        onChange={this.handleChangeUrl.bind(this)}
                        placeholder={"https://www.yourdomain.com/graphql"}
                      />
                      <div></div>
                      <div className="im-input-tip im-mt">
                        Specify GraphQL endpoint.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="im-btn-default im-margin-right"
                    onClick={this.onCloseButtonClicked.bind(this)}
                  >
                    Close
                  </button>
                  <button
                    id="btn-create-new-project"
                    className={buttonStyle}
                    onClick={this.importFromUrl.bind(this)}
                    disabled={disabledButton}
                  >
                    Import
                  </button>
                </div>
              </div>
            </Draggable>
          </div>
        </CSSTransition>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    importFromUrlModalIsDisplayed: state.ui.importFromUrlModalIsDisplayed,
    isDirty: state.model.isDirty
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleImportFromUrlModal,
        toggleUnsavedChangesModal,
        setUnsavedChangesModalAction,
        provideModel,
        setDiagramLoading,
        startTransaction,
        finishTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalImportFromUrl)
);
