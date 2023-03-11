import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSubMenu,
  ContextMenuWrapper
} from "../../components/common/context_menu";
import {
  DROPDOWN_MENU,
  DROPDOWN_MENU_SOURCE,
  closeDropDownMenu,
  setForcedRender
} from "../../actions/ui";
import {
  KeyTypeNames,
  KeyTypes
} from "../../platforms/jsonschema/class_column_jsonschema";
import { ModelTypes, TEST_ID } from "common";
import React, { Component } from "react";
import {
  addDatatypeColTable,
  addToJsonSchema,
  addToRootJsonSchema,
  convertJsonItemToGlobalDef,
  createIntermediaryKeyTable,
  deleteColumnById,
  deleteComplex,
  deleteTable,
  fetchTableAndCatalog,
  getKeyTypeByColumnType
} from "../../actions/tables";
import {
  finishTransaction,
  getCurrentHistoryTransaction,
  startTransaction
} from "../../actions/undoredo";

import JsonSchemaHelpers from "../../platforms/jsonschema/helpers_jsonschema";
import { TableObjectTypesJson } from "../../platforms/jsonschema/class_table_jsonschema";
import UIHelpers from "../../helpers/ui_helpers";
import { UndoRedoDef } from "../../helpers/history/undo_redo_transaction_defs";
import _ from "lodash";
import { bindActionCreators } from "redux";
import { buildDetailFromParameters } from "../../platforms/jsonschema/detection/detail_builder";
import { clearSelection } from "../../actions/selections";
import { connect } from "react-redux";
import { getHistoryContext } from "../../helpers/history/history";
import onClickOutside from "react-onclickoutside";
import { v4 as uuidv4 } from "uuid";
import { withRouter } from "react-router-dom";

const NEW_PROPERTY_NAME = "property";

class ColumnDropDown extends Component {
  isDiagramSource = () =>
    this.props.dropDownMenu &&
    this.props.dropDownMenu.source === DROPDOWN_MENU_SOURCE.DIAGRAM;

  isDropDownVisible = () =>
    this.props.dropDownMenu &&
    this.props.dropDownMenu.type === DROPDOWN_MENU.COLUMN;

  handleClickOutside = (evt) => {
    if (this.isDropDownVisible()) {
      this.props.closeDropDownMenu();
    }
  };

  async addKey(
    intermediaryKeyCaption,
    intermediaryKeyType,
    tableId,
    checkExistance
  ) {
    var alreadyExistingKey = _.find(this.props.tables[tableId].cols, [
      "name",
      intermediaryKeyCaption
    ]);
    if (checkExistance && alreadyExistingKey) {
      this.props.closeDropDownMenu();
      return null;
    }
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.COLUMN_DROP_DOWN_ADD_KEY
    );
    try {
      await this.props.createIntermediaryKeyTable(
        getHistoryContext(this.props.history, this.props.match),
        tableId,
        intermediaryKeyCaption, // PROPERTIES | PATTERN PROPERTIES ...
        uuidv4(),
        null,
        intermediaryKeyType // KEYARRAY | KEYOBJECT | KEY
      );
    } finally {
      await this.props.finishTransaction();
    }
    this.props.closeDropDownMenu();
  }

  async addItem(
    columnType,
    objectColumnType,
    intermediaryTableType,
    tableId,
    newPropertyName,
    isUnique
  ) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.COLUMN_DROP_DOWN_ADD_TO_JSON_SCHEMA
    );
    try {
      if (tableId !== undefined) {
        await this.props.addToJsonSchema(
          getHistoryContext(this.props.history, this.props.match),
          columnType,
          objectColumnType,
          tableId,
          intermediaryTableType,
          this.props.match.params.cid,
          newPropertyName,
          isUnique
        );
      } else {
        await this.props.addToRootJsonSchema(
          getHistoryContext(this.props.history, this.props.match),
          columnType,
          this.props.match.params.id,
          newPropertyName
        );
      }
    } finally {
      await this.props.finishTransaction();
    }
    this.props.closeDropDownMenu();
  }

  async addTwoItems(
    columnType,
    objectColumnType,
    intermediaryTableType,
    tableId,
    isUnique
  ) {
    await this.addItem(
      columnType,
      objectColumnType,
      intermediaryTableType,
      tableId,
      NEW_PROPERTY_NAME,
      isUnique
    );
    await this.addItem(
      columnType,
      objectColumnType,
      intermediaryTableType,
      tableId,
      NEW_PROPERTY_NAME,
      isUnique
    );
    this.props.closeDropDownMenu();
  }

  async deleteSimple(tableId) {
    this.props.clearSelection();

    this.props.history.push(
      "/model/" +
        this.props.match.params.mid +
        "/diagram/" +
        this.props.match.params.did
    );

    const historyContext = getHistoryContext(
      this.props.history,
      this.props.match
    );
    await this.props.startTransaction(
      historyContext,
      UndoRedoDef.COLUMN_DROP_DOWN_DELETE
    );
    try {
      await this.props.deleteTable(historyContext, tableId);
    } finally {
      await this.props.finishTransaction();
    }
  }

  async deleteComplexDef(tableId) {
    this.props.clearSelection();

    this.props.history.push(
      "/model/" +
        this.props.match.params.mid +
        "/diagram/" +
        this.props.match.params.did
    );

    const historyContext = getHistoryContext(
      this.props.history,
      this.props.match
    );
    await this.props.startTransaction(
      historyContext,
      UndoRedoDef.COLUMN_DROP_DOWN_DELETE
    );
    try {
      const tableToDelete = this.props.tables[tableId];
      if (tableToDelete) {
        let listOfObjectToDelete = JsonSchemaHelpers.prepareListForDeletion(
          this.props.tables[tableId],
          [],
          this.props.tables
        );
        for (const l of listOfObjectToDelete) {
          if (this.props.tables[l]) {
            await this.props.deleteTable(historyContext, l);
          }
        }
        await this.props.fetchTableAndCatalog(this.props.tables[tableId]);
      }
      await this.props.deleteTable(historyContext, tableId);
    } finally {
      await this.props.finishTransaction();
    }
  }

  async deleteComplex(col_id, tableId, parentTableId) {
    const historyContext = getHistoryContext(
      this.props.history,
      this.props.match
    );
    await this.props.startTransaction(
      historyContext,
      UndoRedoDef.COLUMN_DROP_DOWN_DELETE
    );
    try {
      this.props.clearSelection();
      this.props.history.push(
        "/model/" +
          this.props.match.params.mid +
          "/diagram/" +
          this.props.match.params.did
      );

      let listOfObjectToDelete = [];
      if (JsonSchemaHelpers.isDefOrRef(this.props.tables[tableId]) === false) {
        listOfObjectToDelete = JsonSchemaHelpers.prepareListForDeletion(
          this.props.tables[tableId],
          [tableId],
          this.props.tables
        );
        for (const l of listOfObjectToDelete) {
          await this.props.deleteTable(historyContext, l);
        }
      }

      if (col_id) {
        await this.props.deleteColumnById(parentTableId, col_id);
      }

      getCurrentHistoryTransaction().addResizeRequest({
        operation: "deleteCol",
        domToModel: false
      });
    } finally {
      await this.props.finishTransaction();
    }
    this.props.closeDropDownMenu();
  }

  onShowDropDownClick() {
    this.props.closeDropDownMenu();
  }

  renderContextMenuByObject(col, tableId) {
    if (col) {
      const table = this.props.tables[col.datatype];
      if (!table) {
        return <></>;
      }
      if (JsonSchemaHelpers.isRef(table)) {
        return this.renderContextMenuRef();
      }
      switch (table.objectType) {
        case TableObjectTypesJson.ALLOF:
        case TableObjectTypesJson.ANYOF:
        case TableObjectTypesJson.ONEOF:
          return this.renderContextMenuChoice(col, tableId);
        case TableObjectTypesJson.KEYOBJECT:
        case TableObjectTypesJson.IF:
        case TableObjectTypesJson.THEN:
        case TableObjectTypesJson.ELSE:
        case TableObjectTypesJson.NOT:
          return this.renderContextMenuKeyObjectOrKeyArray(col, tableId);
        case TableObjectTypesJson.OBJECT:
          return this.renderContextMenuObject(
            col.datatype,
            this.props.tables[col.datatype].objectType,
            tableId
          );
        case TableObjectTypesJson.KEYARRAY:
        case TableObjectTypesJson.ARRAY:
          return this.renderContextMenuArray(
            col.datatype,
            this.props.tables[col.datatype].objectType,
            tableId
          );
        case TableObjectTypesJson.MULTI:
        case TableObjectTypesJson.ANY:
          return this.renderContextMenuMulti(
            col.datatype,
            this.props.tables[col.datatype].objectType,
            tableId
          );

        case undefined:
        default:
          return this.renderContextMenuSimple(col.datatype);
      }
    } else {
      const isRootObject = JsonSchemaHelpers.isRootObjectInDiagramTree(
        this.props.tables[this.props.match.params.id]
      );
      const tableObjectType =
        this.props.tables[this.props.match.params.id].objectType;

      if (isRootObject && tableObjectType === TableObjectTypesJson.ARRAY) {
        return this.renderContextMenuArray(this.props.match.params.id);
      } else if (
        isRootObject &&
        tableObjectType === TableObjectTypesJson.OBJECT
      ) {
        return this.renderContextMenuObject(this.props.match.params.id);
      } else if (
        isRootObject &&
        (tableObjectType === TableObjectTypesJson.MULTI ||
          tableObjectType === TableObjectTypesJson.ANY)
      ) {
        return this.renderContextMenuMulti(this.props.match.params.id);
      } else if (isRootObject && tableObjectType === TableObjectTypesJson.REF) {
        return this.renderContextMenuRef();
      } else {
        return this.renderContextMenuSimple(this.props.match.params.id);
      }
    }
  }

  renderContextMenuKeyObjectOrKeyArray(col, tableId) {
    return (
      <>
        {!JsonSchemaHelpers.isReserverdKeyCaption(col.name) && (
          <>
            {this.renderListOfBasicDataTypes(
              KeyTypeNames.PROPERTIES.nameKey,
              "Add " + KeyTypeNames.PROPERTIES.nameSingular,
              this.props.tables[col.datatype].id,
              NEW_PROPERTY_NAME,
              false
            )}
            {this.renderListOfBasicDataTypes(
              KeyTypeNames.PATTERN_PROPERTIES.nameKey,
              "Add " + KeyTypeNames.PATTERN_PROPERTIES.nameSingular,
              this.props.tables[col.datatype].id,
              NEW_PROPERTY_NAME,
              false
            )}

            {this.renderListOfBasicDataTypes(
              KeyTypeNames.DEPENDENT_SCHEMAS.nameKey,
              "Add " + KeyTypeNames.DEPENDENT_SCHEMAS.nameSingular,
              this.props.tables[col.datatype].id,
              NEW_PROPERTY_NAME,
              false
            )}
          </>
        )}

        {this.renderListOfBasicDataTypes(
          this.props.tables[col.datatype].objectType,
          "Add ",
          tableId,
          NEW_PROPERTY_NAME
        )}

        <ContextMenuSeparator />
        {this.renderAddChoice(col.datatype)}
        {this.renderAddCondition(col.datatype)}
        <ContextMenuSeparator />
        {this.renderAddCustomKeyArray(col.datatype)}
        {this.renderAddCustomKeyObject(col.datatype)}
      </>
    );
  }

  renderContextMenuChoice(col, tableId) {
    return (
      <>
        {this.renderListOfBasicDataTypes(
          this.props.tables[col.datatype].objectType,
          "Add ",
          tableId,
          NEW_PROPERTY_NAME,
          false
        )}
        <ContextMenuSeparator />
        {this.renderAddCustomKeyArray(col.datatype)}
        {this.renderAddCustomKeyObject(col.datatype)}
      </>
    );
  }

  renderAddAdditionalProperties(
    internalNestedTableObjectType,
    parentTableId,
    tableId
  ) {
    const additionalProperites = !!_.find(
      this.props.tables[tableId].cols,
      (col) => col.name === KeyTypeNames.ADDITIONAL_PROPERTIES.nameKey
    );
    return !additionalProperites ? (
      <>
        {this.renderListOfBasicDataTypes(
          internalNestedTableObjectType,
          `Add ${KeyTypeNames.ADDITIONAL_PROPERTIES.namePlural}`,
          internalNestedTableObjectType ? parentTableId : undefined,
          KeyTypeNames.ADDITIONAL_PROPERTIES.nameKey,
          true
        )}
      </>
    ) : (
      <></>
    );
  }

  renderAddItems(internalNestedTableObjectType, parentTableId, tableId) {
    const items = !!_.find(
      this.props.tables[tableId].cols,
      (col) => col.name === KeyTypeNames.ITEMS.nameKey
    );
    return !items ? (
      <>
        {this.renderListOfBasicDataTypes(
          internalNestedTableObjectType,
          "Add " + KeyTypeNames.ITEMS.nameSingular,
          internalNestedTableObjectType ? parentTableId : undefined,
          KeyTypeNames.ITEMS.nameKey,
          true
        )}
      </>
    ) : (
      <></>
    );
  }

  renderContextMenuMulti(
    tableId,
    internalNestedTableObjectType,
    parentTableId
  ) {
    return (
      <>
        {this.renderListOfBasicDataTypes(
          KeyTypeNames.PROPERTIES.nameKey,
          "Add " + KeyTypeNames.PROPERTIES.nameSingular,
          tableId,
          NEW_PROPERTY_NAME,
          false
        )}
        {this.renderListOfBasicDataTypes(
          KeyTypeNames.PATTERN_PROPERTIES.nameKey,
          "Add " + KeyTypeNames.PATTERN_PROPERTIES.nameSingular,
          tableId,
          NEW_PROPERTY_NAME,
          false
        )}
        {this.renderAddAdditionalProperties(
          internalNestedTableObjectType,
          parentTableId,
          tableId
        )}
        {this.renderListOfBasicDataTypes(
          KeyTypeNames.DEPENDENT_SCHEMAS.nameKey,
          "Add " + KeyTypeNames.DEPENDENT_SCHEMAS.nameSingular,
          tableId,
          NEW_PROPERTY_NAME,
          false
        )}
        <ContextMenuSeparator />
        {this.renderListOfBasicDataTypes(
          KeyTypeNames.PREFIX_ITEMS.nameKey,
          "Add " + KeyTypeNames.PREFIX_ITEMS.nameSingular,
          tableId,
          NEW_PROPERTY_NAME,
          false
        )}

        {this.renderAddItems(
          internalNestedTableObjectType,
          parentTableId,
          tableId
        )}

        <ContextMenuSeparator />
        {this.renderAddChoice(tableId)}
        {this.renderAddCondition(tableId)}
        <ContextMenuSeparator />
        {this.renderAddCustomKeyArray(tableId)}
        {this.renderAddCustomKeyObject(tableId)}
      </>
    );
  }

  renderContextMenuObject(
    tableId,
    internalNestedTableObjectType,
    parentTableId
  ) {
    return (
      <>
        {this.renderListOfBasicDataTypes(
          KeyTypeNames.PROPERTIES.nameKey,
          "Add " + KeyTypeNames.PROPERTIES.nameSingular,
          tableId,
          NEW_PROPERTY_NAME,
          false
        )}
        {this.renderListOfBasicDataTypes(
          KeyTypeNames.PATTERN_PROPERTIES.nameKey,
          "Add " + KeyTypeNames.PATTERN_PROPERTIES.nameSingular,
          tableId,
          NEW_PROPERTY_NAME,
          false
        )}
        {this.renderAddAdditionalProperties(
          internalNestedTableObjectType,
          parentTableId,
          tableId
        )}
        {this.renderListOfBasicDataTypes(
          KeyTypeNames.DEPENDENT_SCHEMAS.nameKey,
          "Add " + KeyTypeNames.DEPENDENT_SCHEMAS.nameSingular,
          tableId,
          NEW_PROPERTY_NAME,
          false
        )}

        <ContextMenuSeparator />
        {this.renderAddChoice(tableId)}
        {this.renderAddCondition(tableId)}
        <ContextMenuSeparator />
        {this.renderAddCustomKeyArray(tableId)}
        {this.renderAddCustomKeyObject(tableId)}
      </>
    );
  }

  renderContextMenuArray(
    tableId,
    internalNestedTableObjectType,
    parentTableId
  ) {
    return (
      <>
        {this.renderListOfBasicDataTypes(
          KeyTypeNames.PREFIX_ITEMS.nameKey,
          "Add " + KeyTypeNames.PREFIX_ITEMS.nameSingular,
          tableId,
          NEW_PROPERTY_NAME,
          false
        )}
        {this.renderAddItems(
          internalNestedTableObjectType,
          parentTableId,
          tableId
        )}

        <ContextMenuSeparator />
        {this.renderAddChoice(tableId)}
        {this.renderAddCondition(tableId)}
        <ContextMenuSeparator />
        {this.renderAddCustomKeyArray(tableId)}
        {this.renderAddCustomKeyObject(tableId)}
      </>
    );
  }

  renderAddChoice(tableId) {
    return (
      <ContextMenuSubMenu
        subMenuClassName={UIHelpers.setDropDownSubMenuPositionStyle(
          this.props.dropDownMenu?.position?.x,
          200
        )}
        caption="Choice / operator"
      >
        <>{this.renderAddChoiceItems(tableId)}</>
      </ContextMenuSubMenu>
    );
  }

  renderAddChoiceItems(tableId) {
    const keyTypes = [
      KeyTypes.ALLOF,
      KeyTypes.ANYOF,
      KeyTypes.ONEOF,
      KeyTypes.NOT
    ];
    return _.map(keyTypes, (kt) => {
      return this.renderAddChoiceItem(tableId, kt);
    });
  }

  renderAddChoiceItem(tableId, keyType) {
    if (keyType === KeyTypes.NOT) {
      return (
        <ContextMenuItem
          key={uuidv4()}
          fn={() => this.addKey(keyType, keyType, tableId, true)}
          caption={keyType}
        />
      );
    } else {
      return (
        <ContextMenuItem
          key={uuidv4()}
          fn={() =>
            this.addTwoItems(
              TableObjectTypesJson.ANY,
              keyType,
              keyType,
              tableId,
              false
            )
          }
          caption={keyType}
        />
      );
    }
  }

  renderAddCondition(tableId) {
    const nonExisingConditions = _.filter(
      [KeyTypes.IF, KeyTypes.THEN, KeyTypes.ELSE],
      (kt) => {
        const exists = !!_.find(
          this.props.tables[tableId].cols,
          (col) => col.name === kt
        );

        return !exists;
      }
    );
    if (nonExisingConditions.length > 0) {
      return (
        <ContextMenuSubMenu
          subMenuClassName={UIHelpers.setDropDownSubMenuPositionStyle(
            this.props.dropDownMenu?.position?.x,
            200
          )}
          caption="Condition"
        >
          <>{this.renderAddConditionItems(tableId, nonExisingConditions)}</>
        </ContextMenuSubMenu>
      );
    } else {
      return <></>;
    }
  }

  renderAddConditionItems(tableId, nonExisingConditions) {
    return _.map(nonExisingConditions, (kt) => {
      return this.renderAddConditionItem(tableId, kt);
    });
  }

  renderAddConditionItem(tableId, keyType) {
    return (
      <ContextMenuItem
        key={uuidv4()}
        fn={() => this.addKey(keyType, TableObjectTypesJson.ANY, tableId, true)}
        caption={keyType}
      />
    );
  }

  renderAddCustomKeyArray(tableId) {
    return (
      <>
        <ContextMenuItem
          fn={() =>
            this.addKey(
              KeyTypeNames.KEYARRAY.nameKey,
              TableObjectTypesJson.KEYARRAY,
              tableId,
              false
            )
          }
          caption={"Add " + KeyTypeNames.KEYARRAY.nameSingular}
        />
      </>
    );
  }

  renderAddCustomKeyObject(tableId) {
    return (
      <>
        <ContextMenuItem
          fn={() =>
            this.addKey(
              KeyTypeNames.KEYOBJECT.nameKey,
              TableObjectTypesJson.KEYOBJECT,
              tableId,
              false
            )
          }
          caption={"Add " + KeyTypeNames.KEYOBJECT.nameSingular}
        />
      </>
    );
  }

  renderContextMenuSimple(tableId) {
    return (
      <>
        {this.renderAddChoice(tableId)}
        {this.renderAddCondition(tableId)}
        <ContextMenuSeparator />
        {this.renderAddCustomKeyArray(tableId)}
        {this.renderAddCustomKeyObject(tableId)}
      </>
    );
  }

  renderContextMenuRef() {
    return <></>;
  }

  renderBasicDataTypeItem(
    dataTypeName,
    dataType,
    columnType,
    tableId,
    newPropertyName,
    isUnique
  ) {
    return (
      <ContextMenuItem
        key={dataTypeName}
        fn={() =>
          this.addItem(
            dataType,
            columnType,
            getKeyTypeByColumnType(columnType),
            tableId,
            newPropertyName,
            isUnique
          )
        }
        caption={dataTypeName}
      />
    );
  }

  renderBasicDataTypes(columnType, tableId, newPropertyName, isUnique) {
    const basicDataTypes = JsonSchemaHelpers.getJsonSchemaDataTypes(
      this.props.type
    );
    return _.map(basicDataTypes, (basicDataType) => {
      return this.renderBasicDataTypeItem(
        basicDataType[0],
        basicDataType[1],
        columnType,
        tableId,
        newPropertyName,
        isUnique
      );
    });
  }

  renderListOfBasicDataTypes(
    columnType,
    caption,
    tableId,
    newPropertyName,
    isUnique
  ) {
    return (
      <ContextMenuSubMenu
        subMenuClassName={UIHelpers.setDropDownSubMenuPositionStyle(
          this.props.dropDownMenu?.position?.x,
          200
        )}
        caption={caption}
      >
        <>
          {this.renderBasicDataTypes(
            columnType,
            tableId,
            newPropertyName,
            isUnique
          )}
        </>
      </ContextMenuSubMenu>
    );
  }

  async convertToGlobal(col) {
    const historyContext = getHistoryContext(
      this.props.history,
      this.props.match
    );
    await this.props.startTransaction(
      historyContext,
      UndoRedoDef.COLUMN_DROP_DOWN_CONVERT_JSON_TO_GLOBAL_DEF
    );
    try {
      await this.props.convertJsonItemToGlobalDef(col);
    } finally {
      await this.props.finishTransaction();
    }

    this.props.closeDropDownMenu();
  }

  renderMakeGlobal(col) {
    if (col) {
      const internalNestedTableObjectType =
        this.props.tables[col.datatype]?.objectType;
      if (
        !JsonSchemaHelpers.isChoice(internalNestedTableObjectType) &&
        !JsonSchemaHelpers.isCondition(internalNestedTableObjectType) &&
        !JsonSchemaHelpers.isJsonSchemaKey(internalNestedTableObjectType) &&
        !JsonSchemaHelpers.isNot(internalNestedTableObjectType) &&
        !JsonSchemaHelpers.isChoice(internalNestedTableObjectType) &&
        !JsonSchemaHelpers.isCondition(internalNestedTableObjectType) &&
        !JsonSchemaHelpers.isRef(this.props.tables[col.datatype])
      ) {
        return (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              fn={() => this.convertToGlobal(col)}
              caption={"Convert to subschema"}
            />
          </>
        );
      }
    }
  }

  renderDeleteSimple() {
    return (
      this.props.tables[this.props.match.params.id].embeddable === true && (
        <>
          {this.props.tables[this.props.match.params.id].objectType !==
            TableObjectTypesJson.REF && <ContextMenuSeparator />}
          <ContextMenuItem
            fn={this.deleteSimple.bind(this, this.props.match.params.id)}
            icon="Trash16"
            caption="Delete"
          />
        </>
      )
    );
  }

  renderDeleteComplexDef() {
    return (
      this.props.tables[this.props.match.params.id].embeddable === true && (
        <>
          {this.props.tables[this.props.match.params.id].objectType !==
            TableObjectTypesJson.REF && <ContextMenuSeparator />}
          <ContextMenuItem
            fn={this.deleteComplexDef.bind(this, this.props.match.params.id)}
            icon="Trash16"
            caption="Delete"
          />
        </>
      )
    );
  }

  renderDeleteComplex(col) {
    return (
      <>
        {!JsonSchemaHelpers.isRef(this.props.tables[col.datatype]) && (
          <ContextMenuSeparator />
        )}
        <ContextMenuItem
          fn={this.deleteComplex.bind(
            this,
            col.id,
            col.datatype,
            this.props.match.params.id
          )}
          icon="Trash16"
          caption="Delete"
        />
      </>
    );
  }

  renderAddDefinition(tableId) {
    const table = this.props.tables[tableId];
    if (JsonSchemaHelpers.isDef(table) && !this.props.match.params.cid) {
      const rootSchemaTable = JsonSchemaHelpers.getRootSchemaTable(
        this.props.tables
      );
      const definitionKeyName = JsonSchemaHelpers.getDefinitionKeyName(
        rootSchemaTable,
        {
          jsonCodeSettings: this.props.jsonCodeSettings,
          type: this.props.type
        }
      );
      return (
        <>
          <ContextMenuItem
            fn={() =>
              this.addKey(
                definitionKeyName,
                TableObjectTypesJson.KEYOBJECT,
                tableId,
                true
              )
            }
            caption={"Add " + definitionKeyName}
          />
        </>
      );
    }
  }

  async addDataType(tableId, columnId, prop) {
    await this.props.startTransaction(
      getHistoryContext(this.props.history, this.props.match),
      UndoRedoDef.COLUMN_DROP_DOWN_ADD_KEY
    );
    try {
      const datatypeTable = columnId
        ? JsonSchemaHelpers.getDatatypeTableByDatatypeColId(
            this.props.tables,
            this.props.catalogColumns.colToTable,
            columnId
          )
        : this.props.tables[tableId];
      await this.props.addDatatypeColTable(
        getHistoryContext(this.props.history, this.props.match),
        datatypeTable,
        prop.name,
        prop.type
      );
      this.props.closeDropDownMenu();
    } finally {
      await this.props.finishTransaction();
    }
  }

  renderComplexItemsContextMenu({ tableId, columnId, detail }) {
    const complexItems = _.reduce(
      detail.schemasForPath,
      (result, schemaContext) => result ?? schemaContext?.complexItems,
      undefined
    );

    return !!complexItems ? (
      <ContextMenuItem
        key={"items"}
        caption={"Add array item"}
        fn={this.addDataType.bind(this, tableId, columnId, {
          type: "any",
          name: ""
        })}
      />
    ) : (
      <></>
    );
  }

  renderComplexAdditionalItemContextMenu({ tableId, columnId, detail }) {
    return detail.complexAdditionalProperties?.count > 0 ? (
      <ContextMenuItem
        key={"additionalProperty"}
        caption={"Add additional property"}
        fn={this.addDataType.bind(this, tableId, columnId, {
          type: detail.complexAdditionalProperties.type,
          name: ""
        })}
      />
    ) : (
      <></>
    );
  }

  renderComplexPropertiesContextMenu({ tableId, columnId, detail }) {
    const complexProperties = _.reduce(
      detail.schemasForPath,
      (result, schemaContext) => {
        const newProperties = _.filter(
          schemaContext?.complexProperties ?? [],
          (item) =>
            !_.find(result, (resultItem) => resultItem.name === item.name)
        );
        return [...result, ...newProperties];
      },
      []
    );

    return complexProperties?.length > 0 ? (
      <ContextMenuSubMenu
        subMenuClassName={UIHelpers.setDropDownSubMenuPositionStyle(
          this.props.dropDownMenu?.position?.x,
          200
        )}
        caption={"Add property"}
      >
        <>
          {_.map(complexProperties, (property) => (
            <ContextMenuItem
              key={property.name}
              caption={property.name}
              fn={this.addDataType.bind(this, tableId, columnId, property)}
            />
          ))}
        </>
      </ContextMenuSubMenu>
    ) : (
      <></>
    );
  }

  renderSchemaDetectorContextMenu({ detail, tableId, columnId }) {
    const col = JsonSchemaHelpers.getColumnById(
      this.props.tables,
      tableId,
      columnId
    );
    return detail?.hasJSONSchema === false ? (
      <>
        {this.renderComplexPropertiesContextMenu({ detail, tableId, columnId })}
        {this.renderComplexPatternPropertiesContextMenu({
          detail,
          tableId,
          columnId
        })}
        {this.renderComplexItemsContextMenu({ detail, tableId, columnId })}
        {this.renderComplexAdditionalItemContextMenu({
          detail,
          tableId,
          columnId
        })}
        <ContextMenuSeparator />
        {this.renderAddCustomKeyArray(col?.datatype ?? tableId)}
        {this.renderAddCustomKeyObject(col?.datatype ?? tableId)}
      </>
    ) : (
      <></>
    );
  }

  renderComplexPatternPropertiesContextMenu({ detail, tableId, columnId }) {
    const complexPatternProperties = _.reduce(
      detail.schemasForPath,
      (result, schemaContext) => {
        const newProperties = _.filter(
          schemaContext?.complexPatternProperties ?? [],
          (item) =>
            !_.find(result, (resultItem) => resultItem.label === item.label)
        );

        return [...result, ...newProperties];
      },
      []
    );
    return complexPatternProperties?.length > 0 ? (
      <ContextMenuSubMenu
        subMenuClassName={UIHelpers.setDropDownSubMenuPositionStyle(
          this.props.dropDownMenu?.position?.x,
          200
        )}
        caption={"Add pattern property"}
      >
        <>
          {_.map(complexPatternProperties, (property) => (
            <ContextMenuItem
              key={property.label}
              caption={property.label}
              fn={this.addDataType.bind(this, tableId, columnId, property)}
            />
          ))}
        </>
      </ContextMenuSubMenu>
    ) : (
      <></>
    );
  }

  render() {
    if (this.isDropDownVisible() && this.props.match.params.id) {
      const isDef = JsonSchemaHelpers.isDef(
        this.props.tables[this.props.match.params.id]
      );
      const col = this.props.match.params.cid
        ? JsonSchemaHelpers.getColumnById(
            this.props.tables,
            this.props.match.params.id,
            this.props.match.params.cid
          )
        : undefined;
      const detail =
        this.props.type === ModelTypes.OPENAPI &&
        buildDetailFromParameters({
          tableId: this.props.match.params.id,
          columnId: this.props.match.params.cid,
          catalogColumns: this.props.catalogColumns,
          jsonCodeSettings: this.props.jsonCodeSettings,
          tables: this.props.tables,
          type: this.props.type
        });

      const hasJSONSchemaMenu = detail?.hasJSONSchema || !detail;
      return (
        <ContextMenuWrapper
          id="im-dropdown-column"
          top={this.props.dropDownMenu.position.y}
          left={this.props.dropDownMenu.position.x}
          dataTestId={TEST_ID.DROPDOWNS.COLUMN}
        >
          <>
            <ContextMenu>
              {this.renderSchemaDetectorContextMenu({
                detail,
                tableId: this.props.match.params.id,
                columnId: this.props.match.params.cid
              })}
              {hasJSONSchemaMenu &&
                this.renderContextMenuByObject(col, this.props.match.params.id)}
              {this.props.type !== ModelTypes.OPENAPI &&
                hasJSONSchemaMenu &&
                this.renderMakeGlobal(col)}
              {hasJSONSchemaMenu &&
                this.renderAddDefinition(this.props.match.params.id)}
              {this.props.match.params.cid
                ? this.renderDeleteComplex(col)
                : isDef
                ? this.renderDeleteComplexDef()
                : this.renderDeleteSimple()}
            </ContextMenu>
          </>
        </ContextMenuWrapper>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    type: state.model.type,
    tables: state.tables,
    dropDownMenu: state.ui.dropDownMenu,
    jsonCodeSettings: state.model.jsonCodeSettings,
    tableToCol: state.catalogColumns.tableToCol,
    catalogColumns: state.catalogColumns
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(
      {
        addDatatypeColTable,
        closeDropDownMenu,

        deleteColumnById,
        deleteTable,
        addToJsonSchema,
        createIntermediaryKeyTable,
        clearSelection,
        convertJsonItemToGlobalDef,
        addToRootJsonSchema,
        setForcedRender,
        startTransaction,
        finishTransaction,
        deleteComplex,
        fetchTableAndCatalog
      },
      dispatch
    ),
    dispatch
  };
}

var clickOutsideConfig = {
  excludeScrollbar: true
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(onClickOutside(ColumnDropDown, clickOutsideConfig))
);
