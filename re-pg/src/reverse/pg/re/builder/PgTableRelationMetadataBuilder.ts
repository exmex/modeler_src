import {
  PgTableMetadata,
  PgTablesMetadata
} from "../../model/metadata/PgTableMetadata";

import { ArrayParser } from "../../model/provider/ArrayParser";
import { JSONRE } from "re-json";
import { KnownIdRegistry } from "re";
import { PgColumnMetadata } from "../../model/metadata/PgColumnMetadata";
import { PgColumnRE } from "../PgColumnRE";
import { PgColumnRow } from "../PgColumnRow";
import { PgCompositeTypeRE } from "../PgCompositeTypeRE";
import { PgConstraintMetadata } from "../../model/metadata/PgConstraintMetadata";
import { PgConstraintRE } from "../PgConstraintRE";
import { PgExpressionIndexGenerator } from "./PgExpressionIndexGenerator";
import { PgIndexMetadata } from "../../model/metadata/PgIndexMetadata";
import { PgIndexRE } from "../PgIndexRE";
import { PgPartitionMetadataBuilder } from "./PgPartitionMetadataBuilder";
import { PgTableRE } from "../PgTableRE";
import { PgUserDataTypeRegistry } from "../../PgUserDataTypeRegistry";
import { v4 as uuidv4 } from "uuid";

export class PgTableRelationMetadataBuilder {
  constructor(
    private compositeTypeRE: PgCompositeTypeRE,
    private tableRE: PgTableRE,
    private columnRE: PgColumnRE,
    private constraintRE: PgConstraintRE,
    private indexRE: PgIndexRE,
    private jsonRE: JSONRE,
    private parser: ArrayParser,
    private userDataTypeRegistry: PgUserDataTypeRegistry,
    private expressionIndexGenerator: PgExpressionIndexGenerator,
    private partitionMetadataBuilder: PgPartitionMetadataBuilder,
    private knownIdRegistry: KnownIdRegistry
  ) {}

  public async build(): Promise<PgTablesMetadata> {
    let tables: PgTablesMetadata = {};
    tables = await this.reverseCompositeType(tables);
    tables = await this.reverseTables(tables);
    tables = await this.reverseColumns(tables);
    tables = await this.reverseConstraints(tables);
    tables = await this.reverseIndexes(tables);
    tables = await this.reverseJSON(tables);
    tables = await this.partitionMetadataBuilder.reversePartitions(tables);
    return tables;
  }

  private async reverseCompositeType(
    tables: PgTablesMetadata
  ): Promise<PgTablesMetadata> {
    const rows = await this.compositeTypeRE.reverse();
    rows.forEach((row) => {
      const schema = row._schema;
      const name = row._name;
      const originalTable = this.knownIdRegistry.getTable(
        schema,
        name,
        "composite"
      );
      const id = originalTable?.id ?? uuidv4();

      this.userDataTypeRegistry.register(
        { scope: row._schema, name: row._name },
        id
      );
      const table: PgTableMetadata = {
        id,
        name,
        embeddable: false,
        collation: "",
        comment: row._comment,
        schema,
        inherits: "",
        onCommit: "",
        tablespace: "",
        storageParams: [],
        columns: row._columns.map((col) => {
          const originalTableColumn = this.knownIdRegistry.getTableColumn(
            schema,
            name,
            "composite",
            col.name
          );
          const id = originalTableColumn?.id ?? uuidv4();
          return {
            id,
            name: col.name,
            datatype: col.datatype,
            json: false,
            pk: false,
            collation: "",
            comment: col.comment,
            defaultvalue: "",
            dimensions: 0,
            generated: false,
            generatedIdentity: "",
            nn: false,
            data: originalTableColumn?.data ?? "",
            estimatedSize: originalTableColumn?.estimatedSize ?? ""
          };
        }),
        indexes: [],
        constraints: [],
        partition: "",
        partitions: [],
        partitionNames: [],
        owner: row._owner,
        objectType: "composite",
        rowsecurity: false,
        inheritsArr: [],
        estimatedSize: originalTable?.estimatedSize ?? "",
        visible: originalTable?.visible ?? true
      };
      tables[table.name] = table;
    });
    return tables;
  }

  private async reverseTables(
    tables: PgTablesMetadata
  ): Promise<PgTablesMetadata> {
    const rows = await this.tableRE.reverse();
    rows.forEach((row) => {
      const schema = row._schema;
      const name = row._name;
      const originalTable = this.knownIdRegistry.getTable(
        schema,
        name,
        "table"
      );
      const id = originalTable?.id ?? uuidv4();
      const table: PgTableMetadata = {
        id,
        name,
        embeddable: false,
        collation: row._collation,
        comment: row._comment,
        columns: [],
        indexes: [],
        constraints: [],
        schema,
        inherits: this.parser.parseString(row._inherits),
        inheritsArr: this.parser.parse(row._inherits),
        onCommit: row._onCommit,
        tablespace: row._tablespace,
        storageParams: row._storageparameters ? row._storageparameters : [],
        partition: "",
        partitions: [],
        partitionNames: [],
        owner: row._owner,
        objectType: "table",
        rowsecurity: row._rowsecurity,
        estimatedSize: originalTable?.estimatedSize ?? "",
        visible: originalTable?.visible ?? true
      };
      tables[table.name] = table;
    });
    return tables;
  }

  private async reverseColumns(
    tables: PgTablesMetadata
  ): Promise<PgTablesMetadata> {
    const rows = await this.columnRE.reverse();
    rows.forEach((row) => {
      const generatedIdentity = this.convertGeneratedIdentity(row);
      const name = row._name;
      const originalTableColumn = this.knownIdRegistry.getTableColumn(
        row._schema,
        row._table,
        "table",
        name
      );
      const id = originalTableColumn?.id ?? uuidv4();
      const column: PgColumnMetadata = {
        id,
        name: row._name,
        collation: row._collation,
        comment: row._comment,
        datatype: row._datatype,
        dimensions: row._dimensions,
        defaultvalue: row._defaultvalue,
        nn: row._notnull,
        pk: false,
        generated: row._generated,
        generatedIdentity,
        json: row._datatype === "json" || row._datatype === "jsonb",
        data: originalTableColumn?.data ?? "",
        estimatedSize: originalTableColumn?.estimatedSize ?? ""
      };
      tables[row._table].columns.push(column);
    });
    return tables;
  }

  private convertGeneratedIdentity(row: PgColumnRow): string {
    switch (row._generatedidentity) {
      case "a":
        return "always";
      case "d":
        return "default";
      default:
        return "no";
    }
  }

  private async reverseConstraints(
    tables: PgTablesMetadata
  ): Promise<PgTablesMetadata> {
    const rows = await this.constraintRE.reverse();
    rows.forEach((row) => {
      const schema = row._schema;
      const name = row._constraintname;
      const type = row._constrainttype;
      const table = row._table;

      const originalRelation =
        type === "f"
          ? this.knownIdRegistry.getRelation(
              row._refschema,
              row._reftable,
              "table",
              schema,
              table,
              "table",
              name
            )
          : undefined;
      const originalKeyId =
        type !== "f"
          ? this.knownIdRegistry.getTableKeyId(
              schema,
              table,
              "table",
              name,
              row._constrainttype === "p"
            )
          : undefined;

      const id = originalRelation?.id ?? originalKeyId ?? uuidv4();
      const constraint: PgConstraintMetadata = {
        id,
        name,
        type,
        schema,
        table,
        columns: this.parser.parse(row._columns),
        foreignschema: row._refschema,
        foreigntable: row._reftable,
        foreigncolumns: this.parser.parse(row._refcolumns),
        definition: row._definition,
        updatetype: row._updatetype,
        deletetype: row._deletetype,
        comment: row._comment,
        c_cch: originalRelation?.c_cch ?? "",
        c_cp: originalRelation?.c_cp ?? ""
      };
      tables[row._table].constraints.push(constraint);
    });
    return tables;
  }

  private async reverseIndexes(
    tables: PgTablesMetadata
  ): Promise<PgTablesMetadata> {
    const rows = await this.indexRE.reverse();
    rows.forEach((row) => {
      const isExpression = !!row._index.columns.find(
        (indexCol) => !!indexCol.expression
      );
      const schema = row._index.schema;
      const table = row._table;
      const name = row._index.name;

      const id = this.knownIdRegistry.getTableIndexId(
        schema,
        table,
        "table",
        name
      );

      const index: PgIndexMetadata = {
        id,
        name: row._index.name,
        unique: row._index.unique,
        expression:
          isExpression === true
            ? this.expressionIndexGenerator.generate(
                row._index.schema,
                row._table,
                row._index.expression
              )
            : undefined,
        columns:
          isExpression === false
            ? row._index.columns.map((col) => {
                const id = this.knownIdRegistry.getTableIndexColumnId(
                  schema,
                  table,
                  "table",
                  name,
                  col.name
                );
                return { id, ...col };
              })
            : [],
        tablespace: row._index.tablespace,
        comment: row._index.comment,
        storageParameters: row._index.storageParameters,
        using: row._index.using
      };
      if (
        tables[row._table] &&
        !tables[row._table].constraints.find((c) => c.name === row._index.name)
      ) {
        tables[row._table].indexes.push(index);
      }
    });
    return tables;
  }

  private async reverseJSON(
    tables: PgTablesMetadata
  ): Promise<PgTablesMetadata> {
    const commonTablesMetadata = await this.jsonRE.reverse(tables);

    const jsons = Object.keys(commonTablesMetadata)
      .map((key) => commonTablesMetadata[key])
      .map((common) => {
        const pgTable = new PgTableMetadata(
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
          "",
          false,
          "",
          []
        );
        pgTable.columns = common.columns.map((i) => ({
          id: i.id,
          name: i.name,
          datatype: i.datatype,
          json: i.json,
          collation: "",
          comment: "",
          defaultvalue: "",
          dimensions: 0,
          generated: false,
          generatedIdentity: "",
          nn: false,
          pk: false
        }));
        return pgTable;
      })
      .reduce<PgTablesMetadata>((r, i) => ({ ...r, [i.id]: i }), {});
    return { ...tables, ...jsons };
  }
}
