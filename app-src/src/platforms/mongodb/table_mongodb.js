import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";
import {
  getMongoDbCreateIndexesStatement,
  getMongoDbDefineStatement
} from "./generator_mongodb";

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
import js_beautify from "js-beautify";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/hljs";
import tomorrowNightBright from "react-syntax-highlighter/dist/esm/styles/hljs/tomorrow-night-bright";
import { updateTableProperty } from "../../actions/tables";
import { withRouter } from "react-router-dom";

const ItemSql = ({ sql }) => {
  return <div>{sql}</div>;
};
class MongoDbTable extends Component {
  getMongoDb(code) {
    if (this.getActiveTable().embeddable === false) {
      return (
        <div>
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
              {code}
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

  getMongoDbIndexes() {
    return (
      <div>
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
            {this.getIndexes()}
          </SyntaxHighlighter>
        </pre>
      </div>
    );
  }

  getActiveTable() {
    return this.props.tables[this.props.match.params.id];
  }

  getCode() {
    return js_beautify(
      getMongoDbDefineStatement(
        this.getActiveTable(),
        "'",
        this.props.tables,
        "",
        {
          previewObject: true
        }
      ),
      {
        indent_size: 2,
        preserve_newlines: true,
        keep_array_indentation: true
      }
    );
  }

  getIndexes() {
    return js_beautify(
      getMongoDbCreateIndexesStatement(this.getActiveTable()),
      {
        indent_size: 2,
        preserve_newlines: true,
        keep_array_indentation: true
      }
    );
  }

  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.MONGODB__UPDATE_TABLE_PROPERTY_BOOLEAN
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
    const code = this.getCode();
    return (
      <div>
        <CollapsiblePanel
          panelKey="pTableSqlCreate"
          panelTitle="Create collection and indexes"
          panelIsExpanded={this.props.panelsExpanded.pTableSqlCreate}
        >
          <div>
            <ItemSql sql={this.getMongoDb(code)} />
            <div className="im-code-actions">
              <CheckboxSwitch
                label={this.props.localization.TEXTS.GENERATE}
                checked={Helpers.gch(this.getActiveTable().generate !== false)}
                onChange={this.handleCheckboxChange.bind(this, "generate")}
              />
              <ButtonCustom
                type="default"
                size="sm"
                caption={this.props.localization.TEXTS.COPY_TO_CLIPBOARD}
                onClick={() => copyToClipboard(code)}
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
  connect(mapStateToProps, mapDispatchToProps)(MongoDbTable)
);
