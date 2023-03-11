import {
  Column,
  Index,
  Key,
  KeyCol,
  ModelObjects,
  Relation,
  RelationCol,
  Relations,
  Table,
  Tables
} from "common";
import {
  CommonColumnLinkReference,
  CommonColumnMetadata,
  CommonColumnReferenceMetadata,
  KnownIdRegistry,
  ModelPartProvider,
  NamesRegistry
} from "re";
import { TableMetadata, TablesMetadata } from "../../metadata/TableMetadata";

import { ColumnsRE } from "../../re/structure/ColumnsRE";
import { ConstraintsRE } from "../../re/structure/ConstraintsRE";
import { IndexMetadata } from "../../metadata/IndexMetadata";
import { IndexRE } from "../../re/structure/IndexRE";
import { JSONRE } from "re-json";
import { KeyMetadata } from "../../metadata/KeyMetadata";
import { MySQLFamilyOrderBuilder } from "./MySQLFamilyOrderBuilder";
import { OtherObjectsProvider } from "./OtherObjectsProvider";
import { RelationMetadata } from "../../metadata/RelationMetadata";
import { TablesRE } from "../../re/structure/TablesRE";
import { table } from "console";

export class ModelObjectsProvider implements ModelPartProvider<ModelObjects> {
  public constructor(
    private tablesRE: TablesRE,
    private columnsRE: ColumnsRE,
    private indexRE: IndexRE,
    private constraintsRE: ConstraintsRE,
    private jsonRE: JSONRE,
    private otherObjectsProvider: OtherObjectsProvider,
    private namesRegistry: NamesRegistry,
    private knownIdRegistry: KnownIdRegistry,
    private orderBuilder: MySQLFamilyOrderBuilder
  ) {}

  public async provide(): Promise<ModelObjects> {
    const tablesMetadata = new Map<string, TableMetadata>();
    const relationsMetadata = new Map<string, RelationMetadata>();

    await this.reverseMetadata(tablesMetadata, relationsMetadata);

    const tablesResult = this.provideTables(tablesMetadata);
    const relationsResult = this.provideRelations(relationsMetadata);

    const otherObjectsResult = await this.otherObjectsProvider.provide();

    Object.keys(tablesResult)
      .map((key) => tablesResult[key])
      .forEach((table) => this.namesRegistry.registerTable(table));
    Object.keys(relationsResult)
      .map((key) => relationsResult[key])
      .forEach((relation) => this.namesRegistry.registerRelation(relation));
    Object.keys(otherObjectsResult)
      .map((key) => otherObjectsResult[key])
      .forEach((otherObject) =>
        this.namesRegistry.registerOtherObject(otherObject)
      );

    const modelWithoutOrder: ModelObjects = {
      relations: relationsResult,
      tables: tablesResult,
      otherObjects: otherObjectsResult,
      order: []
    };

    const order = this.orderBuilder.reorder(modelWithoutOrder);

    return {
      ...modelWithoutOrder,
      order
    };
  }

  private async reverseMetadata(
    tablesMetadata: Map<string, TableMetadata>,
    relationsMetadata: Map<string, RelationMetadata>
  ): Promise<void> {
    await this.tablesRE.reverse(tablesMetadata);
    await this.columnsRE.reverse(tablesMetadata);

    await this.indexRE.reverse(tablesMetadata);
    await this.constraintsRE.reverse(tablesMetadata, relationsMetadata);

    await this.reverseJSON(tablesMetadata);
  }

  private async reverseJSON(
    tablesMetadata: Map<string, TableMetadata>
  ): Promise<void> {
    const commonTablesMetadata = await this.jsonRE.reverse(
      Array.from(tablesMetadata.values()).reduce<TablesMetadata>(
        (r, i) => ({ ...r, [i.id]: i }),
        {}
      )
    );

    Object.keys(commonTablesMetadata)
      .map((key) => commonTablesMetadata[key])
      .map((common) => {
        const tableMetadata = new TableMetadata(
          common.id,
          common.name,
          common.embeddable,
          "",
          true,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          ""
        );
        tableMetadata.columns = common.columns.map(
          (i): CommonColumnMetadata => ({
            id: i.id,
            name: i.name,
            datatype: i.datatype,
            json: i.json,
            collation: "",
            comment: "",
            defaultvalue: "",
            nn: false,
            pk: false,
            after: "",
            autoinc: false,
            charset: "",
            enumSet: "",
            list: false,
            param: "",
            unsigned: false,
            zerofill: false
          })
        );
        return tableMetadata;
      })
      .forEach((t) => {
        tablesMetadata.set(t.id, t);
      });
  }

  private provideRelations(
    relationsMetadata: Map<string, RelationMetadata>
  ): Relations {
    const relationsResult: Relations = {};
    relationsMetadata.forEach((relationMetadata: RelationMetadata): void => {
      const relation = this.createRelation(relationMetadata);
      relationsResult[relationMetadata.id] = relation;
    });
    return relationsResult;
  }

  private provideTables(tablesMetadata: Map<string, TableMetadata>): Tables {
    const tablesResult: Tables = {};
    tablesMetadata.forEach((tableMetadata: TableMetadata): void => {
      const table = this.createTable(tableMetadata);
      this.namesRegistry.registerTable(table);
      tablesResult[tableMetadata.id] = table;
    });
    return tablesResult;
  }

  private createRelation(relationMetadata: RelationMetadata): Relation {
    return {
      c_p: "one",
      c_cp: relationMetadata.c_cp,
      c_cch: relationMetadata.c_cch,
      c_ch: relationMetadata.cardinalityChild,
      c_mch: relationMetadata.mandatoryChild,
      c_mp: relationMetadata.mandatoryParent,
      desc: "",
      type: "identifying",
      visible: true,

      child: relationMetadata.child,
      id: relationMetadata.id,
      name: relationMetadata.name,
      parent: relationMetadata.parent,
      parent_key: relationMetadata.parentKey,

      cols: this.createRelationCols(relationMetadata.cols),
      ri_pd: this.convertOnAction(relationMetadata.onDeleteAction),
      ri_pu: this.convertOnAction(relationMetadata.onUpdateAction),
      generate: true,
      generateCustomCode: true
    };
  }

  private convertOnAction(action: string): string {
    return action
      .toLowerCase()
      .replace(/./, (x: string): string => x.toUpperCase());
  }
  private createRelationCols(
    columnReferences: CommonColumnLinkReference[]
  ): RelationCol[] {
    const result: RelationCol[] = [];
    columnReferences.forEach(
      (columnReference: CommonColumnLinkReference): void => {
        result.push({
          childcol: columnReference.childcol,
          id: columnReference.id,
          parentcol: columnReference.parentcol
        });
      }
    );
    return result;
  }

  private createTable(tableMetadata: TableMetadata): Table {
    return {
      collation: tableMetadata.collation,
      charset: tableMetadata.charset,
      database: tableMetadata.database,
      desc: tableMetadata.comment,
      embeddable: tableMetadata.embeddable,
      id: tableMetadata.id,
      initautoinc: tableMetadata.autoIncrement,
      name: tableMetadata.name,
      relations: tableMetadata.relations,
      rowformat: tableMetadata.rowformat,
      tabletype: tableMetadata.tabletype,

      cols: this.createCols(tableMetadata.columns, tableMetadata),
      indexes: this.createIndexes(tableMetadata.indexes),
      keys: this.createKeys(tableMetadata),
      lines: [],
      visible: tableMetadata.visible,

      afterScript: "",
      generate: true,
      generateCustomCode: true,
      estimatedSize: tableMetadata.estimatedSize
    };
  }
  private createIndexes(indexes: Map<string, IndexMetadata>): Index[] {
    const result: Index[] = [];
    indexes.forEach((index: IndexMetadata): void => {
      result.push({
        cols: this.createKeyCols(index.cols),
        fulltext: index.fulltext,
        id: index.id,
        name: index.name,
        unique: index.unique,

        algorithm: "na",
        lockoption: "na",
        using: index.using
      });
    });
    return result;
  }

  private createKeys(tableMetadata: TableMetadata): Key[] {
    const result: Key[] = [];
    tableMetadata.keys.forEach((key: KeyMetadata): void => {
      result.push({
        cols: this.createKeyCols(key.cols),
        id: key.id,
        isPk: key.isPk,
        name: key.name
      });
    });

    if (!result.find((key) => key.isPk)) {
      const name = "Primary key";
      result.push({
        id: this.knownIdRegistry.getTableKeyId(
          tableMetadata.database,
          tableMetadata.name,
          undefined,
          name,
          true
        ),
        isPk: true,
        name,
        cols: []
      });
    }

    return result;
  }

  private createKeyCols(cols: CommonColumnReferenceMetadata[]): KeyCol[] {
    const result: KeyCol[] = [];
    cols.forEach((col: CommonColumnReferenceMetadata): void => {
      result.push({
        colid: col.colid,
        id: col.id
      });
    });
    return result;
  }

  private createCols(
    columns: CommonColumnMetadata[],
    tableMetadata: TableMetadata
  ): Column[] {
    const result: Column[] = [];
    columns.forEach((column: CommonColumnMetadata): void => {
      result.push({
        after: column.after,
        autoinc: column.autoinc,
        charset: tableMetadata.charset !== column.charset ? column.charset : "",
        collation:
          tableMetadata.collation !== column.collation ? column.collation : "",
        comment: column.comment,
        datatype: column.datatype,
        defaultvalue: column.defaultvalue,
        enum: column.enumSet,
        fk: column.fk,
        id: column.id,
        list: column.list,
        name: column.name,
        nn: column.nn,
        param: column.param,
        pk: column.pk,
        unsigned: column.unsigned,
        zerofill: column.zerofill,
        estimatedSize: column.estimatedSize,
        data: column.data
      });
    });
    return result;
  }
}
