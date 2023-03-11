import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";
import {
  getSequelizeAssociation,
  getSequelizeDefineStatement
} from "./generator_sequelize";

import ButtonCustom from "../../components/button_custom";
import CheckboxSwitch from "../../components/checkbox_switch";
import CollapsiblePanel from "../../components/collapsible_panel";
import Helpers from "../../helpers/helpers";
import SyntaxHighlighter from "react-syntax-highlighter";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { copyToClipboard } from "../../helpers/clipboard";
import { getHistoryContext } from "../../helpers/history/history";
import js_beautify from "js-beautify";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/hljs";
import tomorrowNightBright from "react-syntax-highlighter/dist/esm/styles/hljs/tomorrow-night-bright";
import { updateTableProperty } from "../../actions/tables";
import { withRouter } from "react-router-dom";

class SequelizeTable extends Component {
  constructor(props) {
    super(props);
    this.getSequelizeAssociationsForTable =
      this.getSequelizeAssociationsForTable.bind(this);
  }

  getSequelizeAssociationsForTable(table, quotations, generatorOptions) {
    return _.map(table.relations, (relation) => {
      var r = this.props.relations[relation];

      if (table.name === this.props.tables[r.parent].name) {
        if (r) {
          return getSequelizeAssociation(
            r,
            this.props.tables[r.child],
            this.props.tables[r.parent],
            quotations,
            "has",
            generatorOptions
          );
        }
      }

      if (table.name === this.props.tables[r.child].name) {
        if (r) {
          return getSequelizeAssociation(
            r,
            this.props.tables[r.child],
            this.props.tables[r.parent],
            quotations,
            "belongs",
            generatorOptions
          );
        }
      }
    });
  }

  getCode() {
    const generatorOptions = { previewObject: true };
    var code = getSequelizeDefineStatement(
      this.getActiveTable(),
      "'",
      generatorOptions
    );

    code += this.getSequelizeAssociationsForTable(
      this.getActiveTable(),
      "'",
      generatorOptions
    );

    if (
      this.getActiveTable().generateCustomCode === true &&
      generatorOptions.previewObject === false
    ) {
      this.getActiveTable().customCode &&
        (code += this.getActiveTable().customCode + "\n\n");
    }

    return js_beautify(code, {
      indent_size: 2,
      preserve_newlines: true,
      keep_array_indentation: true
    });
  }

  getSequelize() {
    return (
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
    );
  }

  getActiveTable() {
    return this.props.tables[this.props.match.params.id];
  }

  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.SEQUELIZE_TABLE__UPDATE_TABLE_PROPERTY
    );
    await this.props.updateTableProperty(
      this.props.match.params.id,
      checked,
      propName
    );
    await this.props.finishTransaction();
  }

  render() {
    return (
      <div>
        <CollapsiblePanel
          panelKey="pTableSequelizeDefine"
          panelTitle="Define"
          panelIsExpanded={this.props.panelsExpanded.pTableSequelizeDefine}
        >
          <div>
            <pre className="script">{this.getSequelize()}</pre>

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
                onClick={() => copyToClipboard(this.getCode())}
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
  connect(mapStateToProps, mapDispatchToProps)(SequelizeTable)
);
