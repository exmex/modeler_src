import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../actions/undoredo";

import ButtonCustom from "../components/button_custom";
import CheckboxSwitch from "../components/checkbox_switch";
import CollapsiblePanel from "../components/collapsible_panel";
import Helpers from "../helpers/helpers";
import { UndoRedoDef } from "../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { copyToClipboard } from "../helpers/clipboard";
import { getHistoryContext } from "../helpers/history/history";
import { updateTableProperty } from "../actions/tables";
import { withRouter } from "react-router-dom";

const ItemSql = ({ sql }) => {
  return (
    <div>
      <pre className="script">{sql}</pre>
    </div>
  );
};

class TableStatements extends Component {
  isSelectVisible() {
    return this.getActiveTable().objectType !== "composite";
  }

  getActiveTable() {
    return this.props.tables[this.props.match.params.id];
  }

  createSQL() {
    return this.props.generateCreateTableSQL(
      this.props.sqlSettings,
      this.props,
      this.getActiveTable(),
      this.props.defaultGeneratorOptions
    );
  }

  selectSQL() {
    return this.props.generateSelectTableSQL(
      this.props.sqlSettings,
      this.props,
      this.getActiveTable()
    );
  }

  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.TABLE_STATEMENTS__UPDATE_TABLE_PROPERTY
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
          panelKey="pTableSqlCreate"
          panelTitle="Create"
          panelIsExpanded={this.props.panelsExpanded.pTableSqlCreate}
        >
          <div>
            <ItemSql sql={this.createSQL()} />
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
                onClick={() => copyToClipboard(this.createSQL())}
              />
            </div>
          </div>
        </CollapsiblePanel>
        {this.isSelectVisible() ? (
          <CollapsiblePanel
            panelKey="pTableSqlSelect"
            panelTitle="Select statement"
            panelIsExpanded={this.props.panelsExpanded.pTableSqlSelect}
          >
            <div>
              <ItemSql sql={this.selectSQL()} />
              <div className="im-code-actions">
                <div />
                <ButtonCustom
                  type="default"
                  size="sm"
                  caption={this.props.localization.TEXTS.COPY_TO_CLIPBOARD}
                  onClick={() => copyToClipboard(this.selectSQL())}
                />
              </div>
            </div>
          </CollapsiblePanel>
        ) : (
          <></>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    otherObjects: state.otherObjects,
    panelsExpanded: state.ui.panelsExpanded,
    sqlSettings: state.model.sqlSettings,
    localization: state.localization,
    model: state.model
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
  connect(mapStateToProps, mapDispatchToProps)(TableStatements)
);
