import { IPCContext, createOpenFromUrlAction } from "../../helpers/ipc/ipc";
import React, { Component } from "react";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "../../actions/undoredo";

import { CSSTransition } from "react-transition-group";
import { DebounceInput } from "react-debounce-input";
import Draggable from "react-draggable";
import { TEST_ID } from "common";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { openFromUrl } from "../../actions/model";
import { toggleOpenFromUrlModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ModalOpenFromUrl extends Component {
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
      if (this.props.openFromUrlModalIsDisplayed === true) {
        this.props.toggleOpenFromUrlModal();
      }
    }
  }

  handleChangeUrl(event) {
    this.setState({ url: event.target.value });
  }

  onCloseButtonClicked() {
    this.setState({ url: "" });
    this.props.toggleOpenFromUrlModal();
  }

  async openFromUrl() {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODAL_OPEN_FROM__URL_OPEN_MODEL_FROM_URL
    );
    try {
      await this.props.openFromUrl(
        getCurrentHistoryTransaction().historyContext,
        new IPCContext(createOpenFromUrlAction()),
        { urlPath: this.state.url },
        (loaded) => {
          if (loaded) {
            this.setState({ url: "" });
            this.props.toggleOpenFromUrlModal();
          }
        }
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    if (this.props.openFromUrlModalIsDisplayed === true) {
      var disabledButton =
        this.state.url === "" || _.endsWith(this.state.url, ".dmm") === false
          ? true
          : false;
      var buttonStyle =
        this.state.url === "" || _.endsWith(this.state.url, ".dmm") === false
          ? "im-btn-default im-disabled"
          : "im-btn-default";
      return (
        <CSSTransition
          in={this.props.openFromUrlModalIsDisplayed}
          key="ModalOpenFromUrl"
          classNames="fade"
          unmountOnExit
          timeout={{ enter: 500, exit: 100 }}
        >
          <div className="modal-wrapper">
            <Draggable handle=".modal-header">
              <div
                className="modal modal-confirm"
                data-testid={TEST_ID.MODALS.OPEN_FROM_URL}
              >
                <div className="modal-header">Open a project from URL path</div>
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
                        placeholder={"https://www.yourdomain.com/file.dmm"}
                      />
                      <div></div>
                      <div className="im-input-tip im-mt">
                        Specify website address to your *.dmm project file.
                        <br />
                        Make sure you open files from trusted sources only.
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
                    onClick={this.openFromUrl.bind(this)}
                    disabled={disabledButton}
                  >
                    Open
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
    openFromUrlModalIsDisplayed: state.ui.openFromUrlModalIsDisplayed
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleOpenFromUrlModal,
        openFromUrl,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModalOpenFromUrl)
);
