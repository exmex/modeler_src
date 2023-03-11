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
import { getGraphQlDefineStatement } from "./generator_graphql";
import { getHistoryContext } from "../../helpers/history/history";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/hljs";
import tomorrowNightBright from "react-syntax-highlighter/dist/esm/styles/hljs/tomorrow-night-bright";
import { updateTableProperty } from "../../actions/tables";
import { withRouter } from "react-router-dom";

const ItemSql = ({ sql }) => {
  return <div>{sql}</div>;
};
class GraphQlTable extends Component {
  getGraphQl() {
    if (this.activeTable.embeddable === false) {
      return (
        <div>
          <pre className="script">
            <SyntaxHighlighter
              language="graphql"
              style={
                this.props.settings.theme === "im-dark"
                  ? tomorrowNightBright
                  : tomorrow
              }
              customStyle={{
                backgroundColor: "transparent"
              }}
            >
              {this.code}
            </SyntaxHighlighter>
          </pre>
        </div>
      );
    } else {
      return (
        <div>
          <div className="im-message">
            <br />
            This document is embeddable,
            <br />
            no validation or createCollection script is available.
          </div>
        </div>
      );
    }
  }

  get activeTable() {
    return this.props.tables[this.props.match.params.id];
  }

  get code() {
    return getGraphQlDefineStatement(
      this.activeTable,
      "'",
      this.props.tables,
      this.props.otherObjects,
      this.props.relations,
      "",
      {
        previewObject: true
      }
    );
  }
  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.GRAPHQL_TABLE__UPDATE_TABLE_PROPERTY
    );
    try {
      await this.props.updateTableProperty(
        this.props.match.params.id,
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
        <CollapsiblePanel
          panelKey="pTableGraphQlDefine"
          panelTitle="Define"
          panelIsExpanded={this.props.panelsExpanded.pTableGraphQlDefine}
        >
          <div>
            <ItemSql sql={this.getGraphQl()} />
            <div className="im-code-actions">
              <CheckboxSwitch
                label={this.props.localization.TEXTS.GENERATE}
                checked={Helpers.gch(this.activeTable.generate !== false)}
                onChange={this.handleCheckboxChange.bind(this, "generate")}
              />
              <ButtonCustom
                type="default"
                size="sm"
                caption={this.props.localization.TEXTS.COPY_TO_CLIPBOARD}
                onClick={() => copyToClipboard(this.code)}
              />
            </div>
          </div>
        </CollapsiblePanel>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    otherObjects: state.otherObjects,
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
        updateTableProperty,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(GraphQlTable)
);
