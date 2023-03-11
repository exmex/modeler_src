import React, { Component } from "react";

import { CSSTransition } from "react-transition-group";
import Draggable from "react-draggable";
import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { deleteConnection } from "../../actions/connections";
import isElectron from "is-electron";
import { toggleConfirmDeleteConnection } from "../../actions/ui";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class ConfirmDeleteConnection extends Component {
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
      if (this.props.confirmDeleteConnectionIsDisplayed === true) {
        this.props.toggleConfirmDeleteConnection();
      }
    }
  }

  async removeFromConnectionsList(connectionId) {
    await this.props.deleteConnection(connectionId);
    await this.saveConnectionsToFile(this.props.connections);
  }

  async saveConnectionsToFile(connections) {
    if (isElectron()) {
      ipcRenderer.send("connectionsList:saveConnections", connections);
    }
  }

  async onConfirmClick() {
    if (this.props.activeConnection) {
      await this.removeFromConnectionsList(this.props.activeConnection);
      this.props.toggleConfirmDeleteConnection();
    }
  }

  onShowModalClick() {
    this.props.toggleConfirmDeleteConnection();
  }

  render() {
    var message = "";
    if (
      this.props.confirmDeleteConnectionIsDisplayed === true &&
      this.props.connections[this.props.activeConnection]
    ) {
      message += "Are you sure you want to delete ";
      message +=
        "the '" +
        this.props.connections[this.props.activeConnection].name +
        "' connection?";
    }

    return (
      <CSSTransition
        in={this.props.confirmDeleteConnectionIsDisplayed}
        key="confirmDeleteConnection"
        classNames="fade"
        unmountOnExit
        timeout={{ enter: 500, exit: 100 }}
      >
        <div className="modal-wrapper">
          <Draggable handle=".modal-header">
            <div
              className="modal modal-confirm"
              data-testid={TEST_ID.CONFIRMATIONS.DELETE_CONNECTION}
            >
              <div className="modal-header">Delete</div>
              <div className="modal-content-confirm">{message}</div>
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
  }
}

function mapStateToProps(state) {
  return {
    confirmDeleteConnectionIsDisplayed:
      state.ui.confirmDeleteConnectionIsDisplayed,
    activeConnection: state.activeConnection,
    connections: state.connections
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        toggleConfirmDeleteConnection,
        deleteConnection
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ConfirmDeleteConnection)
);
