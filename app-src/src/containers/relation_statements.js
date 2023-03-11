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
import { updateRelationProperty } from "../actions/relations";
import { withRouter } from "react-router-dom";

class RelationStatements extends Component {
  async handleCheckboxChange(propName, event) {
    const checked = event.target.checked;
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.RELATION_STATEMENTS__UPDATE_RELATION_PROPERTY
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

  getActiveRelation() {
    return this.props.relations[this.props.match.params.rid];
  }

  getSQL() {
    const sql = this.props.generateRelationSQL(
      this.props.sqlSettings,
      this.props,
      this.getActiveRelation()
    );
    return (
      <>
        <CollapsiblePanel
          panelKey="pRelationSqlCreate"
          panelTitle="Creation script"
          panelIsExpanded={this.props.panelsExpanded.pRelationSqlCreate}
        >
          <div>
            <pre className="script">{sql}</pre>
            <div className="im-code-actions">
              <CheckboxSwitch
                label={this.props.localization.TEXTS.GENERATE}
                checked={Helpers.gch(
                  this.getActiveRelation().generate !== false
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

  render() {
    return <div>{this.getSQL()}</div>;
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    relations: state.relations,
    sqlSettings: state.model.sqlSettings,
    localization: state.localization,
    model: state.model,
    panelsExpanded: state.ui.panelsExpanded
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
  connect(mapStateToProps, mapDispatchToProps)(RelationStatements)
);
