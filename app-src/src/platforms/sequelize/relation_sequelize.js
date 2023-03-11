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
import { getHistoryContext } from "../../helpers/history/history";
import { getSequelizeAssociation } from "./generator_sequelize";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/hljs";
import tomorrowNightBright from "react-syntax-highlighter/dist/esm/styles/hljs/tomorrow-night-bright";
import { updateRelationProperty } from "../../actions/relations";
import { withRouter } from "react-router-dom";

class SequelizeRelation extends Component {
  getSequelize() {
    return (
      <CollapsiblePanel
        panelKey="pRelationSqlCreate"
        panelTitle="Creation script"
        panelIsExpanded={this.props.panelsExpanded.pRelationSqlCreate}
      >
        <pre className="script">
          <SyntaxHighlighter
            language="javascript"
            style={
              this.props.settings.theme === "im-dark"
                ? tomorrowNightBright
                : tomorrow
            }
            customStyle={{
              backgroundColor: "transparent"
            }}
          >
            {this.getCode()}
          </SyntaxHighlighter>
        </pre>
      </CollapsiblePanel>
    );
  }

  getActiveRelation() {
    return this.props.relations[this.props.match.params.rid];
  }

  getCode() {
    return getSequelizeAssociation(
      this.getActiveRelation(),
      this.props.tables[this.getActiveRelation().child],
      this.props.tables[this.getActiveRelation().parent],
      "'",
      "both",
      { previewObject: true }
    );
  }

  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.SEQUELIZE_RELATION__UPDATE_RELATION_PROPERTY
    );
    try {
      await this.props.updateRelationProperty(
        this.props.match.params.rid,
        checked,
        propName
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  render() {
    return (
      <div>
        {this.getSequelize()}
        <div className="im-code-actions">
          <CheckboxSwitch
            label={this.props.localization.TEXTS.GENERATE}
            checked={Helpers.gch(this.getActiveRelation().generate !== false)}
            onChange={this.handleCheckboxChange.bind(this, "generate")}
          />
          <ButtonCustom
            type="default"
            size="sm"
            caption={this.props.localization.TEXTS.COPY_TO_CLIPBOARD}
            onClick={() => copyToClipboard(this.getCode())}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    relations: state.relations,
    panelsExpanded: state.ui.panelsExpanded,
    settings: state.settings,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        updateRelationProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SequelizeRelation)
);
