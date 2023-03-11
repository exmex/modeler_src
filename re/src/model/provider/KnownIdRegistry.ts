import {
  Column,
  Diagram,
  DiagramItem,
  Index,
  Key,
  ModelDescription,
  MoonModelerModel,
  Note,
  OtherObject,
  OtherObjectTypes,
  Relation,
  Table
} from "common";

import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

export class KnownIdRegistry {
  public constructor(
    private includeSchema: boolean,
    private caseInsensitive: boolean,
    public originalModel?: MoonModelerModel
  ) {}

  public getTableContainerName(table: Table): string {
    return "";
  }

  public getOtherObjectContainerName(otherObject: OtherObject): string {
    return "";
  }

  protected isEqualContainerName(
    modelContainerName: string,
    containerName: string
  ) {
    return this.includeSchema ? modelContainerName === containerName : true;
  }

  private isEqualName(name1: string, name2: string): boolean {
    if (this.caseInsensitive) {
      return name1?.toLocaleLowerCase() === name2?.toLocaleLowerCase();
    }
    return name1 === name2;
  }

  public getTable(
    containerName: string,
    tableName: string,
    tableType: string
  ): Table {
    return _.find(
      this.originalModel?.tables,
      (table) =>
        this.isEqualName(table.name, tableName) &&
        this.isEqualContainerName(
          this.getTableContainerName(table),
          containerName
        ) &&
        table.objectType === tableType
    );
  }

  public getTableId(
    containerName: string,
    tableName: string,
    tableType: string
  ): string {
    const table = this.getTable(containerName, tableName, tableType);
    return table?.id ?? uuidv4();
  }

  public getTableColumn(
    containerName: string,
    tableName: string,
    tableType: string,
    columnName: string
  ): Column {
    const table = this.getTable(containerName, tableName, tableType);
    return _.find(table?.cols, (col) => this.isEqualName(col.name, columnName));
  }

  public getTableColumnId(
    containerName: string,
    tableName: string,
    tableType: string,
    columnName: string
  ): string {
    const column = this.getTableColumn(
      containerName,
      tableName,
      tableType,
      columnName
    );
    return column?.id ?? uuidv4();
  }

  private getTableKey(
    containerName: string,
    tableName: string,
    tableType: string,
    keyName: string,
    isPk: boolean
  ): Key {
    const table = this.getTable(containerName, tableName, tableType);
    return _.find(
      table?.keys,
      (key) =>
        this.isEqualName(key.name, keyName) ||
        (isPk === true && key.isPk === true)
    );
  }

  public getTableKeyId(
    containerName: string,
    tableName: string,
    tableType: string,
    keyName: string,
    isPk: boolean
  ): string {
    const key = this.getTableKey(
      containerName,
      tableName,
      tableType,
      keyName,
      isPk
    );
    return key?.id ?? uuidv4();
  }

  public getTableKeyColumnIdForKeyId(
    containerName: string,
    tableName: string,
    tableType: string,
    keyId: string,
    columnName: string,
    isCaseInsensitive: boolean
  ) {
    const table = this.getTable(containerName, tableName, tableType);
    const key = _.find(table?.keys, (key) => key.id === keyId);

    const columnKeyCol = _.find(key?.cols, (keycol) => {
      const col = _.find(table.cols, (col) =>
        isCaseInsensitive
          ? col.name.toLocaleLowerCase() === columnName.toLocaleLowerCase()
          : col.name === columnName
      );
      return keycol?.colid === col?.id;
    });
    return columnKeyCol?.id ?? uuidv4();
  }

  public getTableKeyIdByColumns(
    containerName: string,
    tableName: string,
    tableType: string,
    columns: string[],
    isCaseInsensitive: boolean
  ) {
    const table = this.getTable(containerName, tableName, tableType);
    const key = _.find(table?.keys, (key) => {
      if (key.cols.length === columns.length) {
        const m = key.cols.reduce<boolean>((r, keycol, index) => {
          if (!r) {
            return false;
          }
          const ocol = _.find(table.cols, (col) => col.id === keycol.colid);
          const result = isCaseInsensitive
            ? ocol?.name.toLocaleLowerCase() ===
              columns[index].toLocaleLowerCase()
            : ocol?.name === columns[index];
          return result;
        }, true);
        return m;
      }
      return false;
    });
    return key?.id ?? uuidv4();
  }

  public getTableKeyColumnId(
    containerName: string,
    tableName: string,
    tableType: string,
    keyName: string,
    columnName: string,
    isPk: boolean
  ): string {
    const key = this.getTableKey(
      containerName,
      tableName,
      tableType,
      keyName,
      isPk
    );
    const column = this.getTableColumn(
      containerName,
      tableName,
      tableType,
      columnName
    );

    if (!!key && !!column) {
      const keyColumn = _.find(
        key.cols,
        (keyCol) => keyCol.colid === column.id
      );
      return keyColumn?.id ?? uuidv4();
    }
    return uuidv4();
  }

  private getTableIndex(
    containerName: string,
    tableName: string,
    tableType: string,
    indexName: string
  ): Index {
    const table = this.getTable(containerName, tableName, tableType);
    return _.find(table?.indexes, (index) =>
      this.isEqualName(index.name, indexName)
    );
  }

  public getTableIndexId(
    containerName: string,
    tableName: string,
    tableType: string,
    indexName: string
  ): string {
    const index = this.getTableIndex(
      containerName,
      tableName,
      tableType,
      indexName
    );
    return index?.id ?? uuidv4();
  }

  public getTableIndexColumnId(
    containerName: string,
    tableName: string,
    tableType: string,
    indexName: string,
    columnName: string
  ): string {
    const index = this.getTableIndex(
      containerName,
      tableName,
      tableType,
      indexName
    );
    const column = this.getTableColumn(
      containerName,
      tableName,
      tableType,
      columnName
    );
    if (!!index && !!column) {
      const indexColumn = _.find(
        index.cols,
        (indexCol) => indexCol.colid === column.id
      );
      return indexColumn?.id ?? uuidv4();
    }
    return uuidv4();
  }

  public getRelation(
    parentContainerName: string,
    parentTableName: string,
    parentTableType: string,
    childContainerName: string,
    childTableName: string,
    childTableType: string,
    relationName: string
  ): Relation {
    const parentTable = this.getTable(
      parentContainerName,
      parentTableName,
      parentTableType
    );
    const childTable = this.getTable(
      childContainerName,
      childTableName,
      childTableType
    );
    return _.find(
      this.originalModel?.relations,
      (relation) =>
        relation.name === relationName &&
        relation.parent === parentTable?.id &&
        relation.child === childTable?.id
    );
  }

  public getRelationId(
    parentContainerName: string,
    parentTableName: string,
    parentTableType: string,
    childContainerName: string,
    childTableName: string,
    childTableType: string,
    relationName: string
  ): string {
    const relation = this.getRelation(
      parentContainerName,
      parentTableName,
      parentTableType,
      childContainerName,
      childTableName,
      childTableType,
      relationName
    );
    return relation?.id ?? uuidv4();
  }

  public getRelationColumnId(
    parentContainerName: string,
    parentTableName: string,
    parentTableType: string,
    childContainerName: string,
    childTableName: string,
    childTableType: string,
    relationName: string,
    parentColumnName: string,
    childColumnName: string
  ): string {
    const relation = this.getRelation(
      parentContainerName,
      parentTableName,
      parentTableType,
      childContainerName,
      childTableName,
      childTableType,
      relationName
    );
    if (relation) {
      const parentColId = this.getTableColumnId(
        parentContainerName,
        parentTableName,
        parentTableType,
        parentColumnName
      );
      const childColId = this.getTableColumnId(
        childContainerName,
        childTableName,
        childTableType,
        childColumnName
      );
      const relCol = _.find(
        relation.cols,
        (col) => col.parentcol === parentColId && col.childcol === childColId
      );
      return relCol?.id ?? uuidv4();
    }
    return uuidv4();
  }

  public getOtherObject(
    containerName: string,
    otherObjectName: string,
    otherObjectType: string
  ) {
    return _.find(
      this.originalModel?.otherObjects,
      (otherObject) =>
        this.isEqualName(otherObject.name, otherObjectName) &&
        this.isEqualContainerName(
          this.getOtherObjectContainerName(otherObject),
          containerName
        ) &&
        otherObject.type === otherObjectType
    );
  }

  public getOtherObjectId(
    containerName: string,
    otherObjectName: string,
    otherObjectType: string
  ): string {
    const otherObject = this.getOtherObject(
      containerName,
      otherObjectName,
      otherObjectType
    );
    return otherObject?.id ?? uuidv4();
  }

  public getModelDescription(): ModelDescription {
    return this.originalModel ? this.originalModel.model : undefined;
  }

  public getMainDiagram(): Diagram {
    return _.find(this.originalModel?.diagrams, (diagram) => diagram.main);
  }

  public getNotMainDiagrams(): Diagram[] {
    return _.filter(this.originalModel?.diagrams, (diagram) => !diagram.main);
  }

  public getDiagramItem(
    diagramId: string,
    referencedItemId: string
  ): DiagramItem {
    return this.originalModel?.diagrams[diagramId].diagramItems[
      referencedItemId
    ];
  }

  public getAllDiagramItems(diagramId: string) {
    const diagram = this.originalModel?.diagrams?.[diagramId];
    return _.filter(
      diagram.diagramItems,
      (di) =>
        (diagram.main &&
          (this.originalModel?.tables[di.referencedItemId]?.visible ||
            this.originalModel?.otherObjects[di.referencedItemId]?.visible ||
            this.originalModel?.notes[di.referencedItemId]?.visible)) ||
        !diagram.main
    );
  }

  public getTables(): Table[] {
    return _.map(this.originalModel?.tables, (table) => table);
  }

  public getRelations(): Relation[] {
    return _.map(this.originalModel?.relations, (relation) => relation);
  }

  public getOtherObjects(): OtherObject[] {
    return _.map(
      this.originalModel?.otherObjects,
      (otherObject) => otherObject
    );
  }

  public getNotes(): Note[] {
    return _.map(this.originalModel?.notes, (note) => note);
  }

  public getDomainConstraintId(
    containerName: string,
    domainName: string,
    constraintName: string
  ): string {
    const domain = this.getOtherObject(containerName, domainName, "Domain");
    return (
      _.find(domain?.pg?.domain?.constraints, (con) =>
        this.isEqualName(con.name, constraintName)
      )?.id ?? uuidv4()
    );
  }

  public getPgTrigger(
    containerName: string,
    triggerName: string,
    triggerTablename: string
  ) {
    return _.find(
      this.originalModel?.otherObjects,
      (otherObject) =>
        this.isEqualName(otherObject.name, triggerName) &&
        this.isEqualContainerName(
          this.getOtherObjectContainerName(otherObject),
          containerName
        ) &&
        otherObject.type === OtherObjectTypes.Trigger &&
        this.isEqualName(otherObject?.pg?.trigger?.tablename, triggerTablename)
    );
  }

  public getPgTriggerId(
    containerName: string,
    triggerName: string,
    triggerTablename: string
  ) {
    const trigger = this.getPgTrigger(
      containerName,
      triggerName,
      triggerTablename
    );
    return trigger?.id ?? uuidv4();
  }

  public getMSSQLTrigger(
    containerName: string,
    triggerName: string,
    triggerTablename: string
  ) {
    return _.find(
      this.originalModel?.otherObjects,
      (otherObject) =>
        this.isEqualName(otherObject.name, triggerName) &&
        this.isEqualContainerName(
          this.getOtherObjectContainerName(otherObject),
          containerName
        ) &&
        otherObject.type === OtherObjectTypes.Trigger &&
        this.isEqualName(
          otherObject?.mssql?.trigger?.tablename,
          triggerTablename
        )
    );
  }

  public getMSSQLTriggerId(
    containerName: string,
    triggerName: string,
    triggerTablename: string
  ) {
    const trigger = this.getMSSQLTrigger(
      containerName,
      triggerName,
      triggerTablename
    );
    return trigger?.id ?? uuidv4();
  }
}
