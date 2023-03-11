import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.core.css";
import "react-quill/dist/quill.bubble.css";

import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import { DebounceInput } from "react-debounce-input";
import Helpers from "../helpers/helpers";
import ReactQuill from "react-quill";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../helpers/history/history";
import { updateNoteProperty } from "../actions/notes";
import { withRouter } from "react-router-dom";

class NoteProperties extends Component {
  constructor(props) {
    super(props);
    this.handleChangeDesc = _.debounce(this.handleChangeDesc.bind(this), 400);
  }

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.match.params.nid !== this.props.match.params.nid ||
      (nextProps.match.params.nid === this.props.match.params.nid &&
        nextProps.notes[this.props.match.params.nid].desc !==
          this.props.notes[this.props.match.params.nid].desc)
    );
  }

  async handleTextChange(propName, event) {
    const value = event.target.value;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.NOTE_PROPERTIES__UPDATE_NOTE_PROPERTY
    );
    try {
      await this.props.updateNoteProperty(
        this.props.match.params.nid,
        value,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  async handleChangeDesc(html) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.NOTE_PROPERTIES__UPDATE_NOTE_PROPERTY_HTML
    );
    try {
      await this.props.updateNoteProperty(
        this.props.match.params.nid,
        html,
        "desc"
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    if (!this.props.match.params.nid) {
      return null;
    }

    var modules = {
      history: {
        delay: 500,
        maxStack: 500,
        userOnly: true
      },
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" }
        ],
        ["link", "image"],
        [
          { align: "" },
          { align: "center" },
          { align: "right" },
          { align: "justify" }
        ],
        ["clean"],

        ["undo"],
        ["redo"]
      ],
      clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false
      }
    };

    var formats = [
      "header",
      "font",
      "size",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "bullet",
      "indent",
      "link",
      "image",
      "color",
      "align"
    ];

    return (
      <div key="1">
        <div className="im-properties-grid" key="2">
          <div>Name:</div>
          <DebounceInput
            type="text"
            debounceTimeout={300}
            value={Helpers.gv(
              this.props.notes[this.props.match.params.nid].name
            )}
            onChange={this.handleTextChange.bind(this, "name")}
          />

          <div>Text:</div>

          <ReactQuill
            key={
              "note_" +
              this.props.match.params.nid +
              "_" +
              this.props.parentForm
            }
            className="im-wysiwyg"
            placeholder="Write note..."
            theme="snow"
            value={Helpers.gv(
              this.props.notes[this.props.match.params.nid].desc
            )}
            onChange={this.handleChangeDesc}
            modules={modules}
            formats={formats}
            userOnly={true}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    notes: state.notes
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateNoteProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(NoteProperties)
);
