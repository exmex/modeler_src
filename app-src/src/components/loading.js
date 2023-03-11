import React, { Component } from "react";

import { TEST_ID } from "common";
import { bindActionCreators } from "redux";
import { cancel } from "../actions/ui";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class Loading extends Component {
  getWarnignCancelButton = () => {
    return this.props.activeTask.token ? (
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
    ) : (
      <></>
    );
  };

  getWarningElements = () => {
    return this.props.activeTask.warning ? (
      <div className="im-loader-warning">
        {this.props.activeTask.warning.map((line, index) =>
          this.getWarningRow(index, line)
        )}
      </div>
    ) : (
      <></>
    );
  };

  getWarningRow(index, line) {
    return (
      <div>
        {index === 0 ? <i className="im-icon-Warning16 im-icon-16" /> : <></>}
        {line}
      </div>
    );
  }

  render() {
    return (
      <div
        data-testid={TEST_ID.COMPONENTS.LOADING}
        className={
          this.props.diagramLoading === true
            ? "im-loading im-loading-visible"
            : "im-loading im-loading-hidden"
        }
      >
        <div className="im-loader" />
        <div className="im-loader-outer" />
        <div className="im-loader-inner" />
        {this.props.activeTask ? (
          <>
            <div className="im-loader-caption">
              {this.props.activeTask.caption}
            </div>
            {this.getWarnignCancelButton()}
            {this.getWarningElements()}
          </>
        ) : (
          <></>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    diagramLoading: state.ui.diagramLoading,
    activeTask: state.ui.activeTask
  };
}

function mapDispatchToProps(dispatch) {
  return { ...bindActionCreators({ cancel }, dispatch), dispatch };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Loading)
);
