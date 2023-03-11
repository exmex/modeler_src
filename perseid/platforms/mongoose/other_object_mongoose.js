import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import ButtonCustom from "../../components/button_custom";
import CheckboxSwitch from "../../components/checkbox_switch";
import CollapsiblePanel from "../../components/collapsible_panel";
import Helpers from "../../helpers/helpers";
import SyntaxHighlighter from "react-syntax-highlighter";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { copyToClipboard } from "../../helpers/clipboard";
import { generateEnum } from "./generator_mongoose";
import { getHistoryContext } from "../../helpers/history/history";
import { tomorrow } from "react-syntax-highlighter/dist/styles/hljs";
import tomorrowNightBright from "react-syntax-highlighter/dist/styles/hljs/tomorrow-night-bright";
import { updateOtherObjectProperty } from "../../actions/other_objects";
import { withRouter } from "react-router-dom";

class OtherObjectMongoose extends Component {
  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_MONGOOSE__UPDATE_OTHER_OBJECT_PROPERTY_BOOLEAN
    );
    try {
      this.props.updateOtherObjectProperty(
        this.props.match.params.oid,
        checked,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  getCode() {
    const obj = this.props.otherObjects[this.props.match.params.oid];
    switch (obj.type) {
      case "Enum":
        return generateEnum(obj, false);
      case "Other":
        return obj.code;
      default:
        return obj.code;
    }
  }

  getScript(sql) {
    return (
      <>
        <SyntaxHighlighter
          language="javascript"
          style={
            this.props.settings.theme === "im-dark"
              ? tomorrowNightBright
              : tomorrow
          }
          customStyle={{ backgroundColor: "transparent" }}
        >
          {sql}
        </SyntaxHighlighter>
      </>
    );
  }

  render() {
    const sql = this.getCode();
    return (
      <>
        <CollapsiblePanel
          panelTitle="Define"
          panelKey="pOtherObjectScript"
          panelIsExpanded={this.props.panelsExpanded.pOtherObjectScript}
        >
          <div>
            {this.getScript(sql)}
            <div className="im-code-actions">
              {this.props.otherObjects[this.props.match.params.oid].type !==
              "Enum" ? (
                <CheckboxSwitch
                  label={this.props.localization.TEXTS.GENERATE}
                  checked={Helpers.gch(
                    this.props.otherObjects[this.props.match.params.oid]
                      .generate !== false
                  )}
                  onChange={this.handleCheckboxChange.bind(this, "generate")}
                />
              ) : (
                <div />
              )}
              <ButtonCustom
                type="default"
                size="sm"
                caption={this.props.localization.TEXTS.COPY_TO_CLIPBOARD}
                onClick={() => copyToClipboard(sql)}
              />
            </div>
          </div>
        </CollapsiblePanel>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    otherObjects: state.otherObjects,
    panelsExpanded: state.ui.panelsExpanded,
    settings: state.settings,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateOtherObjectProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(OtherObjectMongoose)
);
