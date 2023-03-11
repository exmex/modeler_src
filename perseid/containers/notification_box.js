import React, { Component } from "react";

import _ from "lodash";
import { connect } from "react-redux";
import isElectron from "is-electron";
import { withRouter } from "react-router-dom";

const ipcRenderer = window?.ipcRenderer;

class NotificationBox extends Component {
  componentDidUpdate(prevProps) {
    if (
      this.props.notifications !== prevProps.notifications &&
      this.props.notifications !== undefined
    ) {
      this.showNotificationBox();
    }
  }

  showNotificationBox() {
    var panel = document.getElementById("im-notification-box");
    var lastNotification = _.findLast(this.props.notifications);

    if (panel && lastNotification) {
      var notificationStyle =
        lastNotification.autohide === true
          ? "im-notification-box-autohide"
          : "im-notification-box-manualhide";

      panel.classList.add(notificationStyle);
      panel.classList.remove("im-notification-box-hidden");
      setTimeout(() => {
        if (lastNotification.autohide === true) {
          panel.classList.remove("im-notification-box-autohide");
          panel.classList.add("im-notification-box-hidden");
        }
      }, 5000);
    }
  }

  hideNotificationBox(e) {
    e.stopPropagation();
    e.preventDefault();
    var panel = document.getElementById("im-notification-box");

    if (panel) {
      panel.classList.remove("im-notification-box-autohide");
      panel.classList.remove("im-notification-box-manualhide");
      panel.classList.add("im-notification-box-hidden");
    }
  }

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
    if (isElectron()) {
      ipcRenderer.send("link:openExternal", urlToOpen);
    }
  }

  openInternal(urlToOpen) {
    this.props.history.push(urlToOpen);
  }

  render() {
    const lastNotification = _.findLast(this.props.notifications);

    if (lastNotification !== undefined) {
      return (
        <div
          className="im-pointer"
          onClick={(e) => {
            this.hideNotificationBox(e);
            this.props.history.push("/notifications");
          }}
        >
          <div id="im-notification-box">
            <div className="im-notification-title-grid">
              <i
                className={
                  "im-icon-16 im-icon-" +
                  _.upperFirst(lastNotification.type) +
                  "16 "
                }
              />
              <div className="im-notification-box-header">
                {_.upperFirst(lastNotification.type)}
              </div>
              <div
                className="im-box-cross"
                onClick={(e) => this.hideNotificationBox(e)}
              >
                <i className="im-icon-16 im-icon-Cross16" />
              </div>
            </div>
            <div className="im-notification-box-text">
              {lastNotification.message}
              {this.renderUrlToOpen(
                lastNotification.urlCaption,
                lastNotification.urlToOpen,
                lastNotification.urlIsExternal
              )}

              {lastNotification.autohide !== true ? (
                <div
                  className="im-link im-mt"
                  onClick={(e) => this.hideNotificationBox(e)}
                >
                  Close
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return "";
    }
  }
}

function mapStateToProps(state) {
  return {
    notifications: state.notifications,
  };
}

export default withRouter(connect(mapStateToProps)(NotificationBox));
