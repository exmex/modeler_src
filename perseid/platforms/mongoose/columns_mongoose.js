import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import ButtonEditLarge from "../../components/button_edit_large";
import CheckboxCustom from "../../components/checkbox_custom";
import { DebounceInput } from "react-debounce-input";
import DetailPanel from "../../components/detail_panel";
import Helpers from "../../helpers/helpers";
import MongooseHelpers from "./helpers_mongoose";
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

class ColumnsMongoose extends Component {
  renderDataTypesMongoose(fn, colDatatype) {
    return (
      <select value={colDatatype} onChange={fn}>
        {MongooseHelpers.makeDatatypesMongoose()}
        {this.props.tables[this.props.passedTableId].embeddable === true
          ? this.props.renderEmbeddable(this.props.passedTableId)
          : this.props.renderEmbeddableForSchemas()}
        {this.props.renderEnums()}
        {this.props.renderSchemas()}
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
        <div className="im-align-center">{this.props.localization.L_LIST}</div>
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
    if (col !== undefined) {
      return (
        <div key={col.id}>
          <div className={"dRowForm dRowForm" + this.props.type}>
            <div className=" im-pointer" />

            <DebounceInput
              key={col.id + "name"}
              minLength={1}
              debounceTimeout={300}
              className={" im-mw-sm col_" + col.id}
              type="text"
              value={Helpers.gv(col.name)}
              onChange={this.props.handleTextChange.bind(this, col.id, "name")}
              data-testid={TEST_ID.COLUMNS.NAME}
            />
            {this.renderDataTypesMongoose(
              this.props.handleChangeDatatype.bind(this, col.id),
              col.datatype
            )}

            <CheckboxCustom
              label=""
              checked={Helpers.gch(col.list)}
              onChange={this.props.handleCheckboxChange.bind(
                this,
                col.id,
                "list"
              )}
            />

            <CheckboxCustom
              checked={Helpers.gch(col.pk)}
              onChange={this.props.handlePkCheck.bind(this, col.id)}
              label=""
            />

            <CheckboxCustom
              checked={Helpers.gch(col.nn)}
              onChange={this.props.handleCheckboxChange.bind(
                this,
                col.id,
                "nn"
              )}
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
                <div>Param:</div>
                <div className="im-grid-right-icon">
                  <DebounceInput
                    key={col.id + "n"}
                    minLength={1}
                    debounceTimeout={300}
                    type="text"
                    size="2"
                    value={Helpers.gv(col.param)}
                    onChange={this.props.handleTextChange.bind(
                      this,
                      col.id,
                      "param"
                    )}
                  />
                  <div />
                </div>
                <div>Options:</div>
                <div className="im-grid-right-icon">
                  <DebounceInput
                    element="textarea"
                    minLength={1}
                    debounceTimeout={300}
                    className="im-textarea"
                    value={Helpers.gv(col.options)}
                    onChange={this.props.handleTextChange.bind(
                      this,
                      col.id,
                      "options"
                    )}
                  />
                  <ButtonEditLarge
                    onClick={this.props.openInLargeWindow.bind(
                      this,
                      col,
                      "options",
                      "Options"
                    )}
                  />
                </div>
                {col.datatype === "ObjectId" ? <div>Ref:</div> : ""}
                {col.datatype === "ObjectId" ? (
                  <div className="im-grid-right-icon">
                    <DebounceInput
                      minLength={1}
                      debounceTimeout={300}
                      type="text"
                      value={Helpers.gv(col.ref)}
                      onChange={this.props.handleTextChange.bind(
                        this,
                        col.id,
                        "ref"
                      )}
                    />
                    <div />
                  </div>
                ) : (
                  ""
                )}
                <div>Description:</div>
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
              </div>
            </DetailPanel>
          </div>
        </div>
      );
    } else {
      return <></>;
    }
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
              UndoRedoDef.COLUMNS_MONGOOSE__COLS_REORDER
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
  connect(mapStateToProps, mapDispatchToProps)(ColumnsMongoose)
);
