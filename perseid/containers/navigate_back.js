import React, { Component } from "react";

import { TEST_ID } from "common";
import { connect } from "react-redux";
import { navigateToDiagramUrl } from "../components/url_navigation";
import { withRouter } from "react-router-dom";

class NavigateBack extends Component {
  async navigateToActiveProject() {
    if (this.props.id) {
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
    }
    this.props.history.push("/models");
  }

  render() {
    return (
      <div>
        <div>
          {this.props.name ? (
            <div
              className="im-back"
              onClick={this.navigateToActiveProject.bind(this)}
            >
              <button className="im-btn-square">
                <i className="im-align-self-center im-icon-16 im-icon-ArrowLeft16" />{" "}
                <div
                  className="im-align-self-center im-"
                  data-testid={TEST_ID.BACK_TO_ACTIVE_PROJECT}
                >
                  Back to active {this.props.localization.L_MODEL}
                  {": "}
                  {this.props.name}
                  {""}
                </div>
              </button>
            </div>
          ) : (
            ""
          )}
        </div>
        {this.props.name ? <div className="im-full-page-margin" /> : ""}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    localization: state.localization,
    id: state.model.id,
    activeDiagram: state.model.activeDiagram,
    name: state.model.name
  };
}

export default withRouter(connect(mapStateToProps)(NavigateBack));
