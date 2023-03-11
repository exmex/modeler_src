import React, { Component } from "react";

import NavigateBack from "./navigate_back";
import _ from "lodash";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class ErrorsPage extends Component {
  renderUrlToOpen(urlCaption, urlToOpen, urlIsExternal) {
    if (urlToOpen !== undefined || urlToOpen !== null) {
      return (
        <div>
          <button
            className="im-btn-link im-align-left"
            onClick={
              urlIsExternal === true
                ? this.openExternal.bind(this, urlToOpen)
                : this.openInternal.bind(this, urlToOpen)
            }
          >
            {urlCaption}
          </button>
        </div>
      );
    }
  }

  openExternal(urlToOpen) {
    ipcRenderer?.send("link:openExternal", urlToOpen);
  }

  openInternal(urlToOpen) {
    this.props.history.push(urlToOpen);
  }

  renderNotifications() {
    return _.map(
      _.orderBy(this.props.notifications, ["datesort"], ["desc"]),
      (notification) => {
        if (notification) {
          return (
            <div
              key={notification.id}
              className={"im-grid-row im-notification-" + notification.type}
            >
              <div>
                <i
                  className={
                    "im-icon-16 im-icon-" +
                    _.upperFirst(notification.type) +
                    "16 "
                  }
                />
              </div>

              <div>{notification.date}</div>
              <div className="im-align-left im-notification-word-break">
                {notification.message}
                {this.renderUrlToOpen(
                  notification.urlCaption,
                  notification.urlToOpen,
                  notification.urlIsExternal
                )}
              </div>
              <div className="im-align-left">{notification.model}</div>
            </div>
          );
        }
      }
    );
  }

  renderOverview() {
    if (_.size(this.props.notifications) > 0) {
      return (
        <div className="im-align-center im-padding-md">
          <div className={"im-notification-header"}>
            <div />

            <div>Date</div>
            <div>Notification</div>
            <div>Project name</div>
          </div>
          {this.renderNotifications()}
        </div>
      );
    } else {
      return (
        <div>
          <div className="im-content-spacer-md" />
          <div className="im-content-spacer-md" />
          <div className="im-message">No notification exists.</div>
        </div>
      );
    }
  }

  render() {
    return (
      <div className="im-full-page-scroll">
        <div className="im-full-page-wrapper">
          <NavigateBack />
          <div className="im-header-1 im-align-center">Notifications</div>
          {this.renderOverview()}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    notifications: state.notifications,
  };
}

export default withRouter(connect(mapStateToProps)(ErrorsPage));
