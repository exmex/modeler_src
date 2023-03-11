import {
  ACTION_OPEN_FROM_URL,
  setUnsavedChangesModalAction,
  toggleOpenFromUrlModal,
  toggleUnsavedChangesModal
} from "../actions/ui";
import { IPCContext, createOpenFromUrlAction } from "../helpers/ipc/ipc";
import React, { Component } from "react";
import { getHistoryContext, getHistoryState } from "../helpers/history/history";

import { ModelTypesForHumans } from "../enums/enums";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { openFromUrl } from "../actions/model";
import { withRouter } from "react-router-dom";

class ModelsSamples extends Component {
  constructor(props) {
    super(props);
    this.getSamplesList = this.getSamplesList.bind(this);
    this.openFromUrl = this.openFromUrl.bind(this);
  }

  async openFromUrl(sampleUrl) {
    const parameters = { urlPath: sampleUrl };
    const ipcAction = createOpenFromUrlAction();
    if (this.props.isDirty === true) {
      await this.props.setUnsavedChangesModalAction({
        name: ACTION_OPEN_FROM_URL,
        parameters,
        historyState: getHistoryState(this.props.match),
        ipcAction
      });
      await this.props.toggleUnsavedChangesModal();
    } else {
      await this.props.openFromUrl(
        getHistoryContext(this.props.history, this.props.match),
        new IPCContext(ipcAction),
        parameters,
        () => {}
      );
    }
  }

  getSamplesList() {
    var sortedSamples = _.orderBy(this.props.modelsSamples, ["name"], ["desc"]);

    if (this.props.searchTerm) {
      sortedSamples = sortedSamples.filter(
        (t) =>
          t.name.toLowerCase().includes(this.props.searchTerm.toLowerCase()) ||
          ModelTypesForHumans[t.type]
            ?.toLowerCase()
            .includes(this.props.searchTerm.toLowerCase())
      );
    }

    if (_.size(sortedSamples) < 1) {
      return (
        <div className="im-message im-padding-md">
          No matches. Try to redefine the search term.
        </div>
      );
    }

    return _.map(sortedSamples, (sample) => {
      return (
        <div key={sample.id} className="im-grid-row">
          <div className="im-box-sample-title">
            <div
              className="im-box-name  im-pointer"
              onClick={this.openFromUrl.bind(this, sample.url)}
            >
              {sample.name}
            </div>

            <div className="im-box-type">
              {ModelTypesForHumans[sample.type]}
            </div>
          </div>
          <div className="im-box-text">
            {sample.description}
            <br />
            {sample.articleLink}
          </div>

          <div className="im-box-btn">
            <div
              className="im-link"
              onClick={this.openFromUrl.bind(this, sample.url)}
            >
              Load example
            </div>
          </div>
        </div>
      );
    });
  }

  render() {
    if (_.size(this.props.modelsSamples) < 1) {
      return <div />;
    }

    return (
      <div key={"modelsSamplesKey"}>
        <div className="im-flex-box-items">{this.getSamplesList()}</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    modelsSamples: state.modelsSamples,
    localization: state.localization,
    isDirty: state.model.isDirty
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        openFromUrl,
        setUnsavedChangesModalAction,
        toggleUnsavedChangesModal,
        toggleOpenFromUrlModal
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModelsSamples)
);
