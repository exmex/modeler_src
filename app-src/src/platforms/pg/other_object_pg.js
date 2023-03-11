import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";
import {
  generateCreateDomainSQL,
  generateCreateEnumSQL
} from "./generator/generator_sql_pg";

import ButtonCustom from "../../components/button_custom";
import CheckboxSwitch from "../../components/checkbox_switch";
import CollapsiblePanel from "../../components/collapsible_panel";
import Helpers from "../../helpers/helpers";
import SyntaxHighlighter from "react-syntax-highlighter";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { copyToClipboard } from "../../helpers/clipboard";
import { getHistoryContext } from "../../helpers/history/history";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/hljs";
import tomorrowNightBright from "react-syntax-highlighter/dist/esm/styles/hljs/tomorrow-night-bright";
import { updateOtherObjectProperty } from "../../actions/other_objects";
import { withRouter } from "react-router-dom";

class OtherObjectPG extends Component {
  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.OTHER_OBJECT_PG__UPDATE_OBEJCT_OBJECT_PROPERTY_BOOLEAN
    );
    try {
      await this.props.updateOtherObjectProperty(
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
      case "Domain":
        return generateCreateDomainSQL(this.props.sqlSettings, this.props, obj);
      case "Enum":
        return generateCreateEnumSQL(this.props.sqlSettings, this.props, obj);
      default:
        return obj.pg ? obj.code : ``;
    }
  }

  getScript(sql) {
    return (
      <>
        <SyntaxHighlighter
          language="pgsql"
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
              <CheckboxSwitch
                label={this.props.localization.TEXTS.GENERATE}
                checked={Helpers.gch(
                  this.props.otherObjects[this.props.match.params.oid]
                    .generate !== false
                )}
                onChange={this.handleCheckboxChange.bind(this, "generate")}
              />
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
    sqlSettings: state.model.sqlSettings,
    localization: state.localization,
    model: state.model
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
  connect(mapStateToProps, mapDispatchToProps)(OtherObjectPG)
);
