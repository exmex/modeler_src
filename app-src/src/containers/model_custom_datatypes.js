import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import Helpers from "../helpers/helpers";
import TagsInput from "react-tagsinput";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import isElectron from "is-electron";
import { updateModelProperty } from "../actions/model";
import { withRouter } from "react-router-dom";

const clipboard = window?.clipboard;

class ModelCustomDataTypes extends Component {
  constructor(props) {
    super(props);
    this.state = { visualTags: true };
  }

  async handleChangeTags(tag) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MODEL_CUSTOM_DATATYPE__UPDATE_MODEL_PROPERTY
    );
    try {
      await this.props.updateModelProperty(
        this.props.match.params.mid,
        tag,
        "customDataTypes"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  addTagsToClipboard() {
    if (isElectron()) {
      clipboard.writeText(
        Helpers.getArraySpaceDelimited(this.props.customDataTypes)
      );
    }
  }

  renderCopyToClipboardButton() {
    if (isElectron()) {
      return (
        <div>
          <div className="im-new-item-wrapper">
            <button
              class="im-btn-default im-btn-sm"
              onClick={() => this.addTagsToClipboard()}
            >
              Copy to clipboard
            </button>
          </div>
        </div>
      );
    }
  }

  /*
  renderCopyToClipboardButton() {
    if (isElectron() === false) {
      return (
        <div>
          <div className="im-new-item-wrapper">
            <button
              className="im-btn-default im-btn-sm"
              onClick={() =>
                this.setState({ visualTags: !this.state.visualTags })
              }
            >
              {this.state.visualTags ? "Show read-only text" : "Show visuals"}
            </button>
          </div>
        </div>
      );
    }
  }
  */

  splitTags(data) {
    return data.split(" ").map((d) => d.trim());
  }

  renderTagsInput() {
    if (this.state.visualTags === true) {
      return (
        <TagsInput
          onlyUnique
          inputProps={{
            placeholder: "Add custom data type"
          }}
          addOnPaste={true}
          value={Helpers.garr(this.props.customDataTypes)}
          onChange={this.handleChangeTags.bind(this)}
        />
      );
    } else {
      return (
        <textarea
          key="tagsDataTypes"
          readOnly={true}
          value={Helpers.getArraySpaceDelimited(this.props.customDataTypes)}
        />
      );
    }
  }

  render() {
    return (
      <div>
        <div className="im-properties-grid">
          <div className="im-align-self-center">Data types:</div>
          {this.renderTagsInput()}
          <div />
          {this.renderCopyToClipboardButton()}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    customDataTypes: state.model.customDataTypes
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateModelProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModelCustomDataTypes)
);
