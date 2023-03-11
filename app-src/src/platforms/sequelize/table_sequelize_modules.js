import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";
import {
  getSequelizeModulesAssociation,
  getSequelizeModulesAssociationBegin,
  getSequelizeModulesAssociationEnd,
  getSequelizeModulesDefineStatement
} from "./sequelize_modules_generator";

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

class SequelizeModulesTable extends Component {
  constructor(props) {
    super(props);
    this.getSequelizeAssociationsForTable =
      this.getSequelizeAssociationsForTable.bind(this);
  }

  getSequelizeAssociationsForTable(table, quotations, generatorOptions) {
    var toReturn = "";
    var relCnt = _.size(table.relations);
    var tmpScriptsArray = [];

    if (table.generate === true || generatorOptions.previewObject === true) {
      if (relCnt > 0) {
        _.map(table.relations, (relation) => {
          var r = this.props.relations[relation];

          if (table.name === this.props.tables[r.parent].name) {
            if (r) {
              tmpScriptsArray = [
                ...tmpScriptsArray,
                getSequelizeModulesAssociation(
                  r,
                  this.props.tables[r.child],
                  this.props.tables[r.parent],
                  "'",
                  "has",
                  generatorOptions
                )
              ];
            }
          }

          if (table.name === this.props.tables[r.child].name) {
            if (r) {
              tmpScriptsArray = [
                ...tmpScriptsArray,
                getSequelizeModulesAssociation(
                  r,
                  this.props.tables[r.child],
                  this.props.tables[r.parent],
                  "'",
                  "belongs",
                  generatorOptions
                )
              ];
            }
          }
        });
      }
      var cnt = 0;
      tmpScriptsArray = _.compact(tmpScriptsArray);
      var finalSize = _.size(tmpScriptsArray);
      if (finalSize > 0) {
        toReturn += getSequelizeModulesAssociationBegin(table.name);
      }
      for (var tmpScript of tmpScriptsArray) {
        cnt++;
        if (tmpScript !== "") {
          toReturn += tmpScript;
          if (cnt !== finalSize) {
            //toReturn += ",";
          }
        }
      }
      if (finalSize > 0) {
        toReturn += getSequelizeModulesAssociationEnd(table.afterScript);
      }
      toReturn += "return " + _.upperFirst(table.name) + ";\r\n};\r\n";
    }
    return toReturn;
  }

  getCode() {
    const generatorOptions = { previewObject: true };
    var code = js_beautify(
      getSequelizeModulesDefineStatement(
        this.getActiveTable(),
        "'",
        generatorOptions
      ),
      {
        indent_size: 2,
        preserve_newlines: true,
        keep_array_indentation: true
      }
    );
    code += "\n\n";
    code += js_beautify(
      this.getSequelizeAssociationsForTable(
        this.getActiveTable(),
        "'",
        generatorOptions
      ),
      {
        indent_size: 2,
        preserve_newlines: true,
        keep_array_indentation: true
      }
    );
    return code;
  }

  renderCode() {
    return (
      <div>
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
      </div>
    );
  }

  getActiveTable() {
    return this.props.tables[this.props.match.params.id];
  }

  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.SEQUELIZE_MODULES_TABLE__UPDATE_TABLE_PROPERTY
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
          panelKey="pTableSequelizeModuleDefine"
          panelTitle="Define"
          panelIsExpanded={
            this.props.panelsExpanded.pTableSequelizeModuleDefine
          }
        >
          <div>
            <pre className="script">{this.renderCode()}</pre>
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
  connect(mapStateToProps, mapDispatchToProps)(SequelizeModulesTable)
);
