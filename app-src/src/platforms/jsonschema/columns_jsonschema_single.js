import { ModelTypes, TEST_ID } from "common";
import React, { Component } from "react";
import { finishTransaction, startTransaction } from "../../actions/undoredo";
import {
  setDataTypeJsonSchema,
  updateColumnProperty
} from "../../actions/tables";

import ColumnsJsonSchemaDetailPanel from "./columns_jsonschema_detail_panel";
import { DebounceInput } from "react-debounce-input";
import Helpers from "../../helpers/helpers";
import JsonSchemaHelpers from "./helpers_jsonschema";
import OpenAPISchemaAssistant from "./open_api/open_api_schema_assistant";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import { withRouter } from "react-router";

class ColumnsJsonSchemaSingle extends Component {
  isEditable(colName) {
    return (
      !JsonSchemaHelpers.isChoice(colName) &&
      !JsonSchemaHelpers.isCondition(colName)
    );
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
            this.props.activeDetail?.hasJSONSchema ??
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

  isJSONSchema() {
    return this.props.activeDetail
      ? this.props.activeDetail.hasJSONSchema
      : true;
  }

  renderCommon(col) {
    const internalNestedTableObjectType =
      this.props.tables[col.datatype]?.objectType;
    return (
      <>
        {(!JsonSchemaHelpers.isArrayLike(
          this.props.tables[this.props.match.params.id].objectType
        ) ||
          JsonSchemaHelpers.isJsonSchemaKey(internalNestedTableObjectType)) &&
          this.isEditable(col.name) && (
            <>
              <div>Name:</div>
              <div className="im-grid-right-icon">
                <DebounceInput
                  placeholder={"name"}
                  minLength={1}
                  debounceTimeout={300}
                  type="text"
                  className={" im-mw-sm col_" + col.id}
                  value={Helpers.gv(col.name)}
                  onChange={this.props.handleTextChange.bind(
                    this,
                    col.id,
                    "name"
                  )}
                  data-testid={TEST_ID.COLUMNS.NAME}
                />
              </div>
            </>
          )}
        {!JsonSchemaHelpers.isChoice(internalNestedTableObjectType) &&
          !JsonSchemaHelpers.isCondition(internalNestedTableObjectType) &&
          !JsonSchemaHelpers.isJsonSchemaKey(internalNestedTableObjectType) &&
          !JsonSchemaHelpers.isNot(internalNestedTableObjectType) &&
          this.isJSONSchema() && (
            <>
              <div>Type:</div>
              <div className="im-grid-right-icon">
                {this.renderDataTypesJsonSchema(col.id, col.datatype)}
              </div>
            </>
          )}
      </>
    );
  }

  render() {
    if (this.props.col) {
      const internalNestedTableObjectType =
        this.props.tables[this.props.col.datatype]?.objectType;

      return (
        <div key={this.props.col.id}>
          <div className={"im-properties-grid"}>
            {this.renderCommon(this.props.col)}
            <ColumnsJsonSchemaDetailPanel
              handleTextChange={this.props.handleTextChange.bind(this)}
              handleCheckboxChange={this.props.handleCheckboxChange.bind(this)}
              isCollapsible={false}
              col={this.props.col}
              passedTableId={this.props.passedTableId}
            />
            {JsonSchemaHelpers.isOpenAPIdModelType(this.props.type) &&
              !JsonSchemaHelpers.isKeyArray(internalNestedTableObjectType) && (
                <div className="im-spec-wrapper">
                  <OpenAPISchemaAssistant
                    activeDetail={this.props.activeDetail}
                    activeSpecification={this.props.activeSpecification}
                    col={this.props.col}
                    updateColumnProperty={this.props.updateColumnProperty.bind(
                      this
                    )}
                    newAdditionalProperty={this.props.newAdditionalProperty}
                    deleteProperty={this.props.deleteProperty}
                    changeSpecificationValue={
                      this.props.changeSpecificationValue
                    }
                    changeSpecificationKey={this.props.changeSpecificationKey}
                  />
                </div>
              )}
          </div>
        </div>
      );
    }
    return <></>;
  }
}

function mapStateToProps(state) {
  return {
    tables: state.tables,
    type: state.model.type,
    catalogColumns: state.catalogColumns
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        finishTransaction,
        startTransaction,
        updateColumnProperty,
        setDataTypeJsonSchema
      },
      dispatch
    ),
    dispatch
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ColumnsJsonSchemaSingle)
);
