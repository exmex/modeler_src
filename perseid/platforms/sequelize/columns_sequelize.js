import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import ButtonEditLarge from "../../components/button_edit_large";
import CheckboxCustom from "../../components/checkbox_custom";
import CheckboxSwitch from "../../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import DetailPanel from "../../components/detail_panel";
import Helpers from "../../helpers/helpers";
import SequelizeHelpers from "./helpers_sequelize";
import Sortable from "react-sortablejs";
import { TEST_ID } from "common";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import arrayMove from "array-move";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchTable } from "../../actions/tables";
import { getHistoryContext } from "../../helpers/history/history";
import { withRouter } from "react-router-dom";

class ColumnsSequelize extends Component {
  renderDataTypesSequelize(fn, colDatatype) {
    return (
      <select value={colDatatype} onChange={fn}>
        {SequelizeHelpers.makeDatatypesSequelize()}
        {this.props.renderCustomDatatypes()}
      </select>
    );
  }

  renderColumnsCaption() {
    return (
      <div
        className={
          "dRowForm dRowForm" + this.props.type + " im-cols-header-fixed"
        }
      >
        <div />
        <div className=" im-mw-sm">Name</div>
        <div>Datatype</div>
        <div>Param</div>
        <div className="im-align-center">{this.props.localization.L_PK}</div>
        <div className="im-align-center">{this.props.localization.L_NN}</div>
        <div />
        <div />
      </div>
    );
  }

  renderCols(table) {
    if (!table) {
      return <></>;
    }
    if (this.props.showOnlyActiveColumn) {
      const fullColumnData = _.find(table.cols, [
        "id",
        this.props.match.params.cid
      ]);
      return this.renderColumn(fullColumnData, table);
    } else {
      return table.cols.map((col) => {
        return this.renderColumn(col, table);
      });
    }
  }

  renderColumn(col, table) {
    return (
      <div key={col.id}>
        <div className={"dRowForm dRowForm" + this.props.type}>
          <div className=" im-pointer" />
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            className={" im-mw-sm col_" + col.id}
            type="text"
            value={Helpers.gv(col.name)}
            onChange={this.props.handleTextChange.bind(this, col.id, "name")}
            data-testid={TEST_ID.COLUMNS.NAME}
          />
          {/*<input className={" im-mw-sm col_"+col.id} type="text" defaultvalue={Helpers.gv(col.name)} onBlur={this.handleTextChange.bind(this, col.id,"name")} /> */}

          {this.renderDataTypesSequelize(
            this.props.handleChangeDatatype.bind(this, col.id),
            col.datatype
          )}

          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            type="text"
            size="2"
            value={Helpers.gv(col.param)}
            onChange={this.props.handleTextChange.bind(this, col.id, "param")}
          />

          <CheckboxCustom
            checked={Helpers.gch(col.pk)}
            onChange={this.props.handlePkCheck.bind(this, col.id)}
            label=""
          />

          <CheckboxCustom
            checked={Helpers.gch(col.nn)}
            onChange={this.props.handleCheckboxChange.bind(this, col.id, "nn")}
            label=""
          />

          <div className="handle im-icon-16">&#xe95f;</div>

          {col.fk ? (
            <div className="im-icon-sm-disabled">
              <i className="im-disabled im-icon-Trash16 im-icon-16" />
            </div>
          ) : (
            <div
              className=" im-pointer im-icon-sm"
              onClick={this.props.deleteCol.bind(this, table.id, col.id)}
            >
              <i className="im-icon-Trash16 im-icon-16" />
            </div>
          )}

          <DetailPanel
            panelIsExpanded={
              this.props.match.params.cid &&
              col.id === this.props.match.params.cid
                ? "false"
                : true
            }
            colspan="9"
          >
            <div
              id={"f_" + col.id}
              className={"im-properties-grid f_" + col.id}
              ref={"f_" + col.id}
            >
              <div>Enum/Range:</div>
              <div className="im-grid-right-icon">
                <DebounceInput
                  element="textarea"
                  minLength={1}
                  debounceTimeout={300}
                  className="im-textarea"
                  value={Helpers.gv(col.enumrange)}
                  onChange={this.props.handleTextChange.bind(
                    this,
                    col.id,
                    "enumrange"
                  )}
                />
                <ButtonEditLarge
                  onClick={this.props.openInLargeWindow.bind(
                    this,
                    col,
                    "enumrange",
                    "Enum/Range"
                  )}
                />
              </div>
              <div>Validation:</div>
              <div className="im-grid-right-icon">
                <DebounceInput
                  element="textarea"
                  minLength={1}
                  debounceTimeout={300}
                  className="im-textarea"
                  value={Helpers.gv(col.validation)}
                  onChange={this.props.handleTextChange.bind(
                    this,
                    col.id,
                    "validation"
                  )}
                />
                <ButtonEditLarge
                  onClick={this.props.openInLargeWindow.bind(
                    this,
                    col,
                    "validation",
                    "Validation"
                  )}
                />
              </div>
              <div>Comment:</div>
              <div className="im-grid-right-icon">
                <DebounceInput
                  element="textarea"
                  minLength={1}
                  debounceTimeout={300}
                  className="im-textarea"
                  value={Helpers.gv(col.comment)}
                  onChange={this.props.handleTextChange.bind(
                    this,
                    col.id,
                    "comment"
                  )}
                />
                <ButtonEditLarge
                  onClick={this.props.openInLargeWindow.bind(
                    this,
                    col,
                    "comment",
                    "Description"
                  )}
                />
              </div>
              <div>Sample data:</div>
              <div className="im-grid-right-icon">
                <DebounceInput
                  minLength={1}
                  debounceTimeout={300}
                  type="text"
                  value={Helpers.gv(col.data)}
                  onChange={this.props.handleTextChange.bind(
                    this,
                    col.id,
                    "data"
                  )}
                />
                <ButtonEditLarge
                  onClick={this.props.openInLargeWindow.bind(
                    this,
                    col,
                    "data",
                    "Sample data"
                  )}
                />
              </div>
              <div>Estimated size:</div>
              <div className="im-grid-right-icon">
                <DebounceInput
                  minLength={1}
                  debounceTimeout={300}
                  type="text"
                  value={Helpers.gv(col.estimatedSize)}
                  onChange={this.props.handleTextChange.bind(
                    this,
                    col.id,
                    "estimatedSize"
                  )}
                />
                <div />
              </div>
              <div>Default value:</div>
              <div className="im-grid-right-icon">
                <DebounceInput
                  minLength={1}
                  debounceTimeout={300}
                  type="text"
                  value={Helpers.gv(col.defaultvalue)}
                  onChange={this.props.handleTextChange.bind(
                    this,
                    col.id,
                    "defaultvalue"
                  )}
                />
                <ButtonEditLarge
                  onClick={this.props.openInLargeWindow.bind(
                    this,
                    col,
                    "defaultvalue",
                    "Default value"
                  )}
                />
              </div>

              <div />
              <CheckboxSwitch
                label="Unique"
                checked={Helpers.gch(col.unique)}
                onChange={this.props.handleUniqueCheck.bind(this, col.id)}
              />
              <div>Unique name:</div>
              <div className="im-grid-right-icon">
                <DebounceInput
                  minLength={1}
                  debounceTimeout={300}
                  type="text"
                  value={Helpers.gv(col.uniqueName)}
                  onChange={this.props.handleChangeUniqueName.bind(
                    this,
                    col.id,
                    "uniqueName"
                  )}
                />
                <div />
              </div>
              <div />
              <CheckboxSwitch
                label="Autoincrement"
                checked={Helpers.gch(col.autoinc)}
                onChange={this.props.handleCheckboxChange.bind(
                  this,
                  col.id,
                  "autoinc"
                )}
              />
              <div />
              <CheckboxSwitch
                label="Unsigned"
                checked={Helpers.gch(col.unsigned)}
                onChange={this.props.handleCheckboxChange.bind(
                  this,
                  col.id,
                  "unsigned"
                )}
              />
              <div />
              <CheckboxSwitch
                label="Binary"
                checked={Helpers.gch(col.binary)}
                onChange={this.props.handleCheckboxChange.bind(
                  this,
                  col.id,
                  "binary"
                )}
              />
              <div />
              <CheckboxSwitch
                label="Zerofill"
                checked={Helpers.gch(col.zerofill)}
                onChange={this.props.handleCheckboxChange.bind(
                  this,
                  col.id,
                  "zerofill"
                )}
              />
            </div>
          </DetailPanel>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="im-items-grid">
        {this.renderColumnsCaption()}
        <Sortable
          options={{
            handle: ".handle",
            animation: 150,
            easing: "easeOutBounce",
            dragoverBubble: true
          }}
          onChange={async (order, sortable, evt) => {
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;
            await this.props.startTransaction(
              getHistoryContext(this.props.history, this.props.match),
              UndoRedoDef.COLUMNS_SEQUELIZE__COLS_REORDER
            );
            try {
              var newSort = arrayMove(
                this.props.tables[this.props.passedTableId].cols,
                oldIndex,
                newIndex
              );
              var newTable = Object.assign(
                {},
                this.props.tables[this.props.passedTableId]
              );
              newTable.cols = newSort;
              await this.props.fetchTable(newTable);
            } finally {
              await this.props.finishTransaction();
            }
          }}
        >
          {this.renderCols(this.props.tables[this.props.passedTableId])}
        </Sortable>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    type: state.model.type,
    localization: state.localization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        fetchTable,
        finishTransaction,
        startTransaction
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ColumnsSequelize)
);
