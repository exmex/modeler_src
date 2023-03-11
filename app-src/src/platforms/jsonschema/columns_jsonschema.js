import { ModelTypes, TEST_ID } from "common";
import React, { Component } from "react";
import {
  fetchTable,
  fetchTableAndCatalog,
  setDataTypeJsonSchema
} from "../../actions/tables";
import { finishTransaction, startTransaction } from "../../actions/undoredo";

import ColumnsJsonSchemaDetailPanel from "./columns_jsonschema_detail_panel";
import ColumnsJsonSchemaSingle from "./columns_jsonschema_single";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import JsonSchemaHelpers from "./helpers_jsonschema";
import OpenAPIColumnsJSONSchemaSingle from "./open_api/open_api_schema_assistant_container";
import Sortable from "react-sortablejs";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import arrayMove from "array-move";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { toggleTextEditorModal } from "../../actions/ui";
import { withRouter } from "react-router-dom";

class ColumnsJsonSchema extends Component {
  constructor(props) {
    super(props);
    this.renderDataTypesJsonSchema = this.renderDataTypesJsonSchema.bind(this);
  }

  renderDataTypesJsonSchema(colId, colDatatype) {
    const internalDataTypeTable = this.props.tables[colDatatype];
    const internalDataTypeName = internalDataTypeTable?.objectType ?? "";
    if (
      JsonSchemaHelpers.isChoice(internalDataTypeName) ||
      JsonSchemaHelpers.isCondition(internalDataTypeName)
    ) {
      return (
        <select
          value={internalDataTypeName}
          disabled={true}
          className={"im-disabled"}
        >
          <option>{internalDataTypeName}</option>
        </select>
      );
    } else {
      return (
        <select
          value={colDatatype}
          onChange={this.handleChangeDatatype.bind(this, colId, colDatatype)}
        >
          {JsonSchemaHelpers.makeDatatypes(
            colId,
            this.props.tables,
            this.props.catalogColumns.colToTable,
            this.props.type,
            this.props.type === ModelTypes.JSONSCHEMA
          )}
          {this.props.renderCustomDatatypes()}
        </select>
      );
    }
  }

  async handleChangeDatatype(colId, prevDataTypeName, event) {
    const value = event.target.value;
    const historyContext = getHistoryContext(
      this.props.history,
      this.props.match
    );
    await this.props.startTransaction(
      historyContext,
      UndoRedoDef.COLUMNS_JSON_SCHEMA__SET_DATA_TYPE_JSON_SCHEMA
    );
    try {
      await this.props.setDataTypeJsonSchema(
        historyContext,
        colId,
        prevDataTypeName,
        this.props.passedTableId,
        value
      );
    } finally {
      await this.props.finishTransaction();
    }
  }

  renderColumnsCaptions() {
    if (this.props.showOnlyActiveColumn) {
      return (
        <div className={"dRowForm dRowFormJSON im-cols-header-fixed"}>
          <div />
          <div className=" im-mw-sm">Title</div>
        </div>
      );
    } else {
      return (
        <div className={"dRowForm dRowFormJSON im-cols-header-fixed"}>
          <div />
          <div className=" im-mw-sm">Title</div>
          <div>Type</div>
          <div className="im-align-center">{this.props.localization.L_NN}</div>
          <div />
          <div />
        </div>
      );
    }
  }

  renderColumnsCaption() {
    if (
      this.props.passedTableId !== undefined &&
      this.props.tables[this.props.passedTableId].embeddable === true
    ) {
      return (
        <div className={"dRowForm dRowFormJSON im-cols-header-fixed"}>
          <div />
          <div className=" im-mw-sm">Title</div>
          <div>Type</div>
          <div className="im-align-center"></div>
          <div className="im-align-center"></div>

          <div />
          <div />
        </div>
      );
    } else {
      return (
        <div
          className={
            "dRowForm dRowForm" + this.props.type + " im-cols-header-fixed"
          }
        >
          <div />
          <div className=" im-mw-sm">Name</div>
          <div>Datatype</div>
          <div />
          <div />
          <div />
          <div />
        </div>
      );
    }
  }

  renderCols(table) {
    if (!table) {
      return <></>;
    }
    if (table && this.props.match.params.id) {
      let activeColumn = JsonSchemaHelpers.getColumnById(
        this.props.tables,
        this.props.match.params.id,
        this.props.match.params.cid
      );

      if (this.props.showOnlyActiveColumn) {
        return this.renderSingle(activeColumn);
      } else {
        return table.cols.map((col) => {
          return this.renderGrid(col, table);
        });
      }
    }
  }

  renderSingle(col) {
    if (this.props.type === ModelTypes.OPENAPI) {
      return (
        <OpenAPIColumnsJSONSchemaSingle
          col={col}
          handleTextChange={this.props.handleTextChange.bind(this)}
          handleCheckboxChange={this.props.handleCheckboxChange.bind(this)}
          renderCustomDatatypes={this.props.renderCustomDatatypes.bind(this)}
          passedTableId={this.props.passedTableId}
        />
      );
    }
    return (
      <ColumnsJsonSchemaSingle
        col={col}
        handleTextChange={this.props.handleTextChange.bind(this)}
        handleCheckboxChange={this.props.handleCheckboxChange.bind(this)}
        renderCustomDatatypes={this.props.renderCustomDatatypes.bind(this)}
        passedTableId={this.props.passedTableId}
      />
    );
  }

  renderKeyGrid(col, table) {
    let platformStyle = "dRowForm dRowForm" + this.props.type;
    if (col) {
      return (
        <div key={col.id}>
          <div className={platformStyle}>
            <div className=" im-pointer" />

            <DebounceInput
              placeholder={"name or title"}
              minLength={1}
              debounceTimeout={300}
              type="text"
              className={" im-mw-sm col_" + col.id}
              value={Helpers.gv(col.name)}
              onChange={this.props.handleTextChange.bind(this, col.id, "name")}
              data-testid={TEST_ID.COLUMNS.NAME}
            />

            <DebounceInput
              disabled={true}
              minLength={1}
              debounceTimeout={300}
              type="text"
              className={"im-disabled im-mw-sm col_" + col.id}
              value="Key"
              onChange={() => {}}
            />
            <div className="handle im-icon-16">&#xe95f;</div>

            <div
              className=" im-pointer im-icon-sm"
              onClick={this.props.deleteCol.bind(this, table.id, col.id)}
            >
              <i className="im-icon-Trash16 im-icon-16" />
            </div>

            <ColumnsJsonSchemaDetailPanel
              isCollapsible={true}
              col={col}
              handleTextChange={this.props.handleTextChange.bind(this)}
              handleCheckboxChange={this.props.handleCheckboxChange.bind(this)}
              passedTableId={this.props.passedTableId}
            />
          </div>
        </div>
      );
    }
  }

  renderJsonSchemaGrid(col, table) {
    let platformStyle = "dRowForm dRowForm" + this.props.type;
    if (col) {
      return (
        <div key={col.id}>
          <div className={platformStyle}>
            <div className=" im-pointer" />

            <DebounceInput
              placeholder={"name or title"}
              minLength={1}
              debounceTimeout={300}
              type="text"
              className={" im-mw-sm col_" + col.id}
              value={Helpers.gv(col.name)}
              onChange={this.props.handleTextChange.bind(this, col.id, "name")}
              data-testid={TEST_ID.COLUMNS.NAME}
            />

            {this.renderDataTypesJsonSchema(col.id, col.datatype)}

            <div className="handle im-icon-16">&#xe95f;</div>

            <div
              className=" im-pointer im-icon-sm"
              onClick={this.props.deleteCol.bind(this, table.id, col.id)}
            >
              <i className="im-icon-Trash16 im-icon-16" />
            </div>

            <ColumnsJsonSchemaDetailPanel
              isCollapsible={true}
              col={col}
              handleTextChange={this.props.handleTextChange.bind(this)}
              handleCheckboxChange={this.props.handleCheckboxChange.bind(this)}
              passedTableId={this.props.passedTableId}
            />
          </div>
        </div>
      );
    }
  }

  renderChoiceConditionGrid(col, table) {
    let platformStyle = "dRowForm dRowForm" + this.props.type;
    const internalNestedTableObjectType =
      this.props.tables[col.datatype]?.objectType;
    return (
      <div key={col.id}>
        <div className={platformStyle}>
          <div className=" im-pointer" />
          <DebounceInput
            placeholder={"title"}
            minLength={1}
            debounceTimeout={300}
            type="text"
            className={" im-mw-sm col_" + col.id}
            value={Helpers.gv(col.name)}
            onChange={this.props.handleTextChange.bind(this, col.id, "name")}
            data-testid={TEST_ID.COLUMNS.NAME}
          />

          <DebounceInput
            disabled={true}
            onChange={() => {}}
            minLength={1}
            debounceTimeout={300}
            type="text"
            className={"im-disabled im-mw-sm col_" + col.id}
            value={
              JsonSchemaHelpers.isChoice(internalNestedTableObjectType)
                ? "Choice"
                : "Condition"
            }
          />

          <div className="im-disabled im-icon-16">&#xe95f;</div>

          <div
            className=" im-pointer im-icon-sm"
            onClick={this.props.deleteCol.bind(this, table.id, col.id)}
          >
            <i className="im-icon-Trash16 im-icon-16" />
          </div>

          <ColumnsJsonSchemaDetailPanel
            isCollapsible={true}
            col={col}
            handleTextChange={this.props.handleTextChange.bind(this)}
            handleCheckboxChange={this.props.handleCheckboxChange.bind(this)}
            passedTableId={this.props.passedTableId}
          />
        </div>
      </div>
    );
  }

  renderGrid(col, table) {
    const internalNestedTableObjectType =
      this.props.tables[col.datatype]?.objectType;
    if (
      JsonSchemaHelpers.isChoice(internalNestedTableObjectType) ||
      JsonSchemaHelpers.isCondition(internalNestedTableObjectType)
    ) {
      return this.renderChoiceConditionGrid(col, table);
    } else if (
      JsonSchemaHelpers.isJsonSchemaKey(internalNestedTableObjectType)
    ) {
      return this.renderKeyGrid(col, table);
    } else {
      return this.renderJsonSchemaGrid(col, table);
    }
  }

  isColumnActive(colId) {
    return this.props.match.params.cid && colId === this.props.match.params.cid;
  }

  render() {
    const activeTable = this.props.tables[this.props.passedTableId];
    return (
      <div className="im-items-grid">
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
              UndoRedoDef.COLUMNS_JSONSCHEMA__COLS_REORDER
            );
            try {
              const newSort = arrayMove(activeTable.cols, oldIndex, newIndex);
              const newTable = Object.assign(
                {},
                { ...activeTable, cols: newSort }
              );
              this.props.fetchTable(newTable);
              this.props.fetchTableAndCatalog(activeTable);
            } finally {
              await this.props.finishTransaction();
            }
          }}
        >
          {this.renderCols(activeTable)}
        </Sortable>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    jsonCodeSettings: state.model.jsonCodeSettings,
    tables: state.tables,
    type: state.model.type,
    localization: state.localization,
    catalogColumns: state.catalogColumns
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        fetchTable,
        setDataTypeJsonSchema,
        startTransaction,
        finishTransaction,
        toggleTextEditorModal,
        fetchTableAndCatalog
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ColumnsJsonSchema)
);
