import {
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
  zoomFit
} from "../helpers/zoom/zoom-visible";
import React, { Component } from "react";
import { setZoom, toggleFeedbackModal } from "../actions/ui";

import Helpers from "../helpers/helpers";
import { ModelTypesForHumans } from "../enums/enums";
import { TEST_ID } from "common";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { navigateToDiagramUrl } from "./url_navigation";
import { withRouter } from "react-router-dom";

class Footer extends Component {
  changeZoom(value) {
    this.props.setZoom(value, true);
  }

  zoomMinus() {
    if (this.props.zoom > MIN_ZOOM) {
      this.changeZoom(this.props.zoom - ZOOM_STEP);
    }
  }

  zoomPlus() {
    if (this.props.zoom < MAX_ZOOM) {
      this.changeZoom(this.props.zoom + ZOOM_STEP);
    }
  }

  getModelInfo() {
    return (
      <div tabIndex={4} className="im-footer-wrapper">
        <div className="footer-item">
          <div className="footer-item-text">
            {this.props.isDirty ? (
              <span
                className="im-modified"
                data-testid={TEST_ID.FOOTER.UNSAVED}
              >
                UNSAVED
              </span>
            ) : (
              ""
            )}
            {_.upperFirst(this.props.localization.L_MODEL)} name:{" "}
            {this.props.name}
          </div>
        </div>

        <div className="footer-item">
          <div className="footer-item-text">
            {"| Type: " + ModelTypesForHumans[this.props.type] + " "}
            {this.props.lastSaved
              ? `| Last saved: ${Helpers.formatDate(this.props.lastSaved)}`
              : ""}
          </div>
        </div>

        <div className="footer-item footer-item-spacer">
          <div className="footer-item-text footer-item-max-length">
            {this.props.filePath ? "| File path: " + this.props.filePath : ""}
          </div>
        </div>
      </div>
    );
  }

  getNotificationsCount() {
    let cnt = _.size(this.props.notifications);
    if (cnt > 0) {
      return ": " + cnt;
    }
    return "";
  }

  navigateToActiveProject() {
    let location = this.props.location.pathname;
    if (this.props.id && location.includes("/notifications")) {
      const mid = this.props.id;
      const did = this.props.activeDiagram;
      if (mid && did) {
        navigateToDiagramUrl(
          this.props.match.url,
          this.props.history,
          mid,
          did
        );
        return;
      }
    } else {
      this.props.history.push("/notifications");
      this.hideNotificationBox();
    }
  }

  hideNotificationBox() {
    var panel = document.getElementById("im-notification-box");
    if (panel) {
      panel.classList.remove("im-notification-box-autohide");
      panel.classList.remove("im-notification-box-manualhide");
      panel.classList.add("im-notification-box-hidden");
    }
  }

  render() {
    var bg =
      "linear-gradient(90deg, rgb(76, 175, 80), purple, red, orange, #2196f3 )";
    if (this.props.color !== "transparent") {
      bg = this.props.color;
    }
    return (
      <div className="app-footer" style={{ background: bg }}>
        {this.props.name ? (
          this.getModelInfo()
        ) : (
          <div className="footer-item footer-item-spacer">
            <div className="footer-item-text">
              Create new or open existing {this.props.localization.L_MODEL} to
              get started.
            </div>
          </div>
        )}

        <div className="footer-item-flex im-footer-flex">
          <div
            className="footer-item-link"
            onClick={this.props.zoomFit.bind(this, { maxZoom: 1.6 })}
          >
            <i className="im-icon im-icon-ZoomFit" />
          </div>
          <div className="footer-item-link" onClick={this.zoomMinus.bind(this)}>
            <i className="im-icon im-icon-MinusCircle16" />
          </div>
          <div className="footer-item-text-centered">
            Zoom: {Math.round(this.props.zoom * 100)} %
          </div>
          <div className="footer-item-link" onClick={this.zoomPlus.bind(this)}>
            <i className="im-icon im-icon-PlusCircle16" />
          </div>
        </div>

        <div
          className="footer-item-link"
          onClick={this.props.toggleFeedbackModal.bind(this)}
        >
          Feedback
        </div>

        <div className="footer-item">
          <div
            className="footer-item-link"
            onClick={this.navigateToActiveProject.bind(this)}
            data-testid={TEST_ID.FOOTER.NOTIFICATIONS}
          >
            <i className="far fa-comment-alt" /> Notifications
            {this.getNotificationsCount()}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    zoom: state.ui.zoom,
    localization: state.localization,
    notifications: state.notifications,
    isDirty: state.model.isDirty,
    name: state.model.name,
    type: state.model.type,
    lastSaved: state.model.lastSaved,
    filePath: state.model.filePath,
    id: state.model.id,
    activeDiagram: state.model.activeDiagram,
    color: state.model.color
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        zoomFit,
        setZoom,
        toggleFeedbackModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Footer));
