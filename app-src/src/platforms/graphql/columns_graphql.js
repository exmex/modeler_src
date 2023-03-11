import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import ButtonEditLarge from "../../components/button_edit_large";
import CheckboxCustom from "../../components/checkbox_custom";
import CheckboxSwitch from "../../components/checkbox_switch";
import { DebounceInput } from "react-debounce-input";
import DetailPanel from "../../components/detail_panel";
import GraphQlHelpers from "./helpers_graphql";
import Helpers from "../../helpers/helpers";
import Sortable from "react-sortablejs";
import { TEST_ID } from "common";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import arrayMove from "array-move";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchTable } from "../../actions/tables";
import { getHistoryContext } from "../../helpers/history/history";
import { isFieldFromImplements } from "../../actions/platforms/graphql/graphql";
import { withRouter } from "react-router-dom";

class ColumnsGraphQl extends Component {
  constructor(props) {
    super(props);
    this.renderFkColDatatypes = this.renderFkColDatatypes.bind(this);
  }

  renderSelectWithTableName(tableName, cssStyle, isDisabled) {
    return (
      <select
        value={tableName}
        readOnly
        className={cssStyle}
        disabled={isDisabled}
      >
        <option>{tableName}</option>
      </select>
    );
  }

  renderDataTypesGraphQl(fn, colDatatype, cssStyle, isDisabled) {
    return (
      <select
        value={colDatatype}
        onChange={fn}
        className={cssStyle}
        disabled={isDisabled}
      >
        {GraphQlHelpers.makeDatatypesGraphQl()}
        {this.props.renderEmbeddable(this.props.passedTableId)}
        {/*this.props.renderSchemas()*/}
        {this.props.renderOtherObjects("Enum", this.props.localization.L_ENUM)}
        {this.props.renderOtherObjects(
          "Scalar",
          this.props.localization.L_SCALAR
        )}
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
        {/*<div className="im-align-center">{this.props.localization.L_PK}</div>*/}
        <div className="im-align-center">{this.props.localization.L_NN}</div>

        <div />
        <div />
      </div>
    );
  }

  renderColumnsCaptionUnion() {
    return (
      <div
        className={
          "dRowForm dRowForm" + this.props.type + " im-cols-header-fixed"
        }
      >
        <div />
        <div>Type</div>
        <div />
        <div />
      </div>
    );
  }

  renderCols(table) {
    if (!table) {
      return <></>;
    }
    var tableCols = _.reject(table.cols, ["isHidden", true]);
    if (this.props.showOnlyActiveColumn) {
      const fullColumnData = _.find(table.cols, [
        "id",
        this.props.match.params.cid
      ]);
      return this.renderColumn(fullColumnData, table);
    } else {
      return tableCols.map((col) => {
        return this.renderColumn(col, table);
      });
    }
  }

  renderFkColDatatypes(col, cssStyle, isDisabled) {
    if (col.fk) {
      if (
        _.includes(GraphQlHelpers.getGraphQlDataTypes(), col.datatype) !== true
      ) {
        if (this.props.tables[col.datatype]) {
          return this.renderSelectWithTableName(
            this.props.tables[col.datatype].name,
            cssStyle,
            isDisabled
          );
        } else if (this.props.otherObjects[col.datatype]) {
          return this.renderSelectWithTableName(
            this.props.otherObjects[col.datatype].name,
            cssStyle,
            isDisabled
          );
        } else if (
          GraphQlHelpers.convertToId(
            col.datatype,
            Helpers.garr(this.props.customDataTypes)
          )
        ) {
          return this.renderDataTypesGraphQl(
            this.props.handleChangeDatatype.bind(this, col.id),
            col.datatype,
            cssStyle,
            isDisabled
          );
        }
      } else {
        return this.renderDataTypesGraphQl(
          this.props.handleChangeDatatype.bind(this, col.id),
          col.datatype,
          cssStyle,
          isDisabled
        );
      }
    } else {
      return this.renderDataTypesGraphQl(
        this.props.handleChangeDatatype.bind(this, col.id),
        col.datatype,
        cssStyle,
        isDisabled
      );
    }
  }

  renderColumn(col, table) {
    if (col !== undefined) {
      const shouldBeDisabled = isFieldFromImplements(col, table, this.props);
      const cssDisabledStyle = shouldBeDisabled ? " im-disabled " : "";
      return (
        <div key={col.id}>
          <div className={"dRowForm dRowForm" + this.props.type}>
            <div className=" im-pointer" />

            <DebounceInput
              key={col.id + "name"}
              minLength={1}
              disabled={shouldBeDisabled}
              debounceTimeout={300}
              className={cssDisabledStyle + " im-mw-sm col_" + col.id}
              type="text"
              value={Helpers.gv(col.name)}
              onChange={this.props.handleTextChange.bind(this, col.id, "name")}
              data-testid={TEST_ID.COLUMNS.NAME}
            />
            {this.renderFkColDatatypes(col, cssDisabledStyle, shouldBeDisabled)}

            <CheckboxCustom
              label=""
              className={cssDisabledStyle}
              disabled={shouldBeDisabled}
              checked={Helpers.gch(col.list)}
              onChange={this.props.handleCheckboxChange.bind(
                this,
                col.id,
                "list"
              )}
            />

            <CheckboxCustom
              disabled={shouldBeDisabled}
              className={cssDisabledStyle}
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
                {col.list === true && (
                  <>
                    <div />
                    <CheckboxSwitch
                      label="Array item NN"
                      className={cssDisabledStyle}
                      disabled={shouldBeDisabled}
                      checked={Helpers.gch(col.isArrayItemNn)}
                      onChange={this.props.handleCheckboxChange.bind(
                        this,
                        col.id,
                        "isArrayItemNn"
                      )}
                    />
                  </>
                )}
                <div>Arguments:</div>
                <div className="im-grid-right-icon">
                  <DebounceInput
                    element="textarea"
                    disabled={shouldBeDisabled}
                    minLength={1}
                    debounceTimeout={300}
                    className={cssDisabledStyle + "im-textarea"}
                    value={Helpers.gv(col.fieldArguments)}
                    onChange={this.props.handleTextChange.bind(
                      this,
                      col.id,
                      "fieldArguments"
                    )}
                  />
                  <ButtonEditLarge
                    onClick={this.props.openInLargeWindow.bind(
                      this,
                      col,
                      "fieldArguments",
                      "Arguments"
                    )}
                  />
                </div>
                <div>Directive:</div>
                <div className="im-grid-right-icon">
                  <DebounceInput
                    element="textarea"
                    minLength={1}
                    disabled={shouldBeDisabled}
                    debounceTimeout={300}
                    className={cssDisabledStyle + "im-textarea"}
                    value={Helpers.gv(col.fieldDirective)}
                    onChange={this.props.handleTextChange.bind(
                      this,
                      col.id,
                      "fieldDirective"
                    )}
                  />
                  <ButtonEditLarge
                    onClick={this.props.openInLargeWindow.bind(
                      this,
                      col,
                      "fieldDirective",
                      "Directive"
                    )}
                  />
                </div>
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
                  />{" "}
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

  renderColsUnion(table) {
    if (!table) {
      return <></>;
    }
    var tableCols = _.reject(table.cols, ["isHidden", true]);
    return tableCols.map((col) => {
      return this.renderColumnUnion(col, table);
    });
  }

  renderColumnUnion(col, table) {
    return (
      <div key={col.id}>
        <div className={"dRowForm dRowForm" + this.props.type + "Union"}>
          <div className=" im-pointer" />

          {this.renderFkColDatatypes(col)}
          <div className="handle im-icon-16">&#xe95f;</div>

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
                />{" "}
                <div />
              </div>
            </div>
          </DetailPanel>
        </div>
      </div>
    );
  }

  render() {
    const table = this.props.tables[this.props.match.params.id];
    if (!table) {
      return <></>;
    }
    return (
      <div className="im-items-grid">
        {table.objectType === "union"
          ? this.renderColumnsCaptionUnion()
          : this.renderColumnsCaption()}
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
              UndoRedoDef.COLUMNS_GRAPHQL__COLS_REORDER
            );
            try {
              var newSort = arrayMove(
                this.props.tables[this.props.passedTableId].cols,
                oldIndex + 1,
                newIndex + 1
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
          {table.objectType === "union"
            ? this.renderColsUnion(this.props.tables[this.props.passedTableId])
            : this.renderCols(this.props.tables[this.props.passedTableId])}
        </Sortable>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    relations: state.relations,
    customDataTypes: state.model.customDataTypes,
    type: state.model.type,
    localization: state.localization,
    otherObjects: state.otherObjects
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
  connect(mapStateToProps, mapDispatchToProps)(ColumnsGraphQl)
);
