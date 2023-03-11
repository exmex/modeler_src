import React, { Component } from "react";

import { bindActionCreators } from "redux";
import { cancel } from "../actions/ui";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class LoadingMini extends Component {
  render() {
    return (
      <div
        className={
          this.props.diagramLoading === true
            ? "im-loading-mini im-loading-visible"
            : "im-loading-mini im-loading-hidden"
        }
      >
        <div className="im-loader" />
        <div className="im-loader-outer" />
        <div className="im-loader-inner" />
        {this.props.activeTask && (
          <>
            <div className="im-loader-caption">
              {this.props.activeTask.caption}
            </div>
            <button
              id="btn-cancel"
              className="im-btn-default im-loader-cancel"
              onClick={this.props.cancel.bind(
                this,
                { token: this.props.activeTask.token },
                ipcRenderer
              )}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeTask: state.ui.activeTask,
    diagramLoading: state.ui.diagramLoading,
  };
}

function mapDispatchToProps(dispatch) {
  return { ...bindActionCreators({ cancel }, dispatch), dispatch };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(LoadingMini)
);
