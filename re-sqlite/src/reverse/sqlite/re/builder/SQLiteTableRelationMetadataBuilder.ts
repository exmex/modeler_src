import { KnownIdRegistry, WarningsProvider } from "re";
import {
  SQLiteIndexColumnMetadata,
  SQLiteIndexMetadata
} from "../../model/metadata/SQLiteIndexMetadata";
import {
  SQLiteTableMetadata,
  SQLiteTablesMetadata
} from "../../model/metadata/SQLiteTableMetadata";

import { JSONRE } from "re-json";
import { SQLiteColumnMetadata } from "../../model/metadata/SQLiteColumnMetadata";
import { SQLiteConstraintMetadata } from "../../model/metadata/SQLiteConstraintMetadata";
import { SQLiteFKRE } from "../SQLiteFKRE";
import { SQLiteIndexRE } from "../SQLiteIndexRE";
import { SQLiteTableRE } from "../SQLiteTableRE";
import { SQLiteTableRow } from "../SQLiteTableRow";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

const sqliteParser: any = require("sqlite-parser");

export class SQLiteTableRelationMetadataBuilder {
  constructor(
    private tableRE: SQLiteTableRE,
    private fkRE: SQLiteFKRE,
    private indexRE: SQLiteIndexRE,
    private jsonRE: JSONRE,
    private warningsProvider: WarningsProvider,
    private knownIdRegistry: KnownIdRegistry
  ) {}

  public async build(): Promise<SQLiteTablesMetadata> {
    let tables: SQLiteTablesMetadata = {};
    tables = await this.reverseTables(tables);
    tables = await this.reverseFK(tables);
    tables = await this.reverseIndexes(tables);
    tables = await this.reverseJSON(tables);
    return tables;
  }

  private async reverseFK(
    tables: SQLiteTablesMetadata
  ): Promise<SQLiteTablesMetadata> {
    Object.keys(tables)
      .map((key) => tables[key])
      .forEach(async (table) => {
        const newFkConstraints = await this.processTable(table.name);
        newFkConstraints.forEach((fk) => table.constraints.push(fk));
      });

    return tables;
  }

  private async reverseTables(
    tables: SQLiteTablesMetadata
  ): Promise<SQLiteTablesMetadata> {
    const rows = await this.tableRE.reverse();
    rows.forEach(async (row) => {
      if (!this.isSystemTable(row)) {
        try {
          const createTableAST = sqliteParser(row._code);
          const columns = createTableAST.statement[0].definition
            .filter((i: any) => i.variant === "column")
            .map((col: any): SQLiteColumnMetadata => {
              const originalTableColumn = this.knownIdRegistry.getTableColumn(
                undefined,
                row._name,
                undefined,
                col.name
              );
              const id = originalTableColumn?.id ?? uuidv4();
              return {
                collation: col.definition.find(
                  (def: any) =>
                    def.type === "constraint" && def.variant === "collate"
                )?.collate.collate[0].name,
                datatype: col.datatype?.variant?.toUpperCase() ?? "",
                defaultvalue: col.definition.find(
                  (def: any) =>
                    def.type === "constraint" && def.variant === "default"
                )?.value.value,
                id,
                json: col.datatype?.variant === "text",
                name: col.name,
                nn:
                  !!col.definition.find(
                    (def: any) =>
                      def.type === "constraint" && def.variant === "not null"
                  ) ||
                  !!col.definition.find(
                    (def: any) =>
                      def.type === "constraint" && def.variant === "primary key"
                  ),
                pk: !!col.definition.find(
                  (def: any) =>
                    def.type === "constraint" && def.variant === "primary key"
                ),
                fk: false,
                autoincrement: !!col.definition.find(
                  (def: any) =>
                    def.type === "constraint" &&
                    def.variant === "primary key" &&
                    def.autoIncrement
                ),
                comment: originalTableColumn?.comment ?? "",
                data: originalTableColumn?.data ?? "",
                estimatedSize: originalTableColumn?.estimatedSize ?? ""
              };
            });

          const name = row._name;
          const originalTable = this.knownIdRegistry.getTable(
            undefined,
            name,
            undefined
          );

          const table: SQLiteTableMetadata = {
            id: originalTable?.id ?? uuidv4(),
            name,
            embeddable: false,
            columns,
            indexes: [],
            withoutrowid: !!createTableAST.statement[0].optimization?.find(
              (opt: any) =>
                opt.type === "optimization" && opt.value === "without rowid"
            ),
            constraints: [
              ...this.columnKey(createTableAST, "primary key", "p", row._name),
              ...this.columnKey(createTableAST, "unique", "u", row._name)
            ],
            estimatedSize: originalTable?.estimatedSize ?? "",
            desc: originalTable?.desc ?? "",
            visible: originalTable?.visible ?? true,
            strict: false
          };
          tables[table.name] = table;
        } catch (err) {
          this.warningsProvider.addWarning(
            `Object ${row._name} has been skipped because parsing failed:\n${row._code}`
          );
        }
      }
    });
    return tables;
  }

  private isSystemTable(row: SQLiteTableRow) {
    return row._name === "sqlite_sequence";
  }

  private convertAction(action: string): string {
    switch (action) {
      case "NO ACTION":
        return "a";
      case "SET NULL":
        return "n";
      case "CASCADE":
        return "c";
      default:
        return "r";
    }
  }

  private async processTable(
    tableName: string
  ): Promise<SQLiteConstraintMetadata[]> {
    const fks: SQLiteConstraintMetadata[] = [];
    const rows = await this.fkRE.reverse(tableName);
    let id = -1;
    let con: SQLiteConstraintMetadata;
    rows.forEach((row: any) => {
      if (id !== row.id) {
        const foreignTable = row.table ? row.table : tableName;
        const name = `${foreignTable}_${tableName}`;
        const originalRelation = this.knownIdRegistry.getRelation(
          undefined,
          foreignTable,
          undefined,
          undefined,
          tableName,
          undefined,
          name
        );
        con = {
          id: originalRelation?.id ?? uuidv4(),
          table: tableName,
          name,
          type: "f",
          columns: [],
          foreigntable: foreignTable,
          foreigncolumns: [],
          definition: ``,
          updatetype: this.convertAction(row.on_update),
          deletetype: this.convertAction(row.on_delete),
          c_cch: originalRelation?.c_cch ?? "",
          c_cp: originalRelation?.c_cp ?? "",
          desc: originalRelation?.desc ?? ""
        };
        id = row.id;
        fks.push(con);
      }
      con.columns.push(row.from);
      if (row.to) {
        con.foreigncolumns.push(row.to);
      }
    });
    return fks;
  }

  private columnKey(
    createTableAST: any,
    keyName: string,
    keyCode: string,
    tableName: string
  ) {
    return createTableAST.statement[0].definition
      .filter(
        (d: any) =>
          !!d.definition.find(
            (id: any) => id.type === "constraint" && id.variant === keyName
          )
      )
      .map((def: any, index: number) => {
        const keyType =
          keyCode === "p" ? "Primary key" : `${tableName}_key_${index + 1}`;
        const coldefname = def.definition.find(
          (id: any) => id.type === "constraint"
        );
        const defname = def.variant === "constraint" ? def.name : undefined;
        const name = coldefname?.name ?? defname ?? keyType;
        const columns = def.columns?.map((cc: any) => cc.name) ?? [def.name];
        return {
          id: this.knownIdRegistry.getTableKeyIdByColumns(
            undefined,
            tableName,
            undefined,
            columns,
            true
          ),
          table: tableName,
          name,
          type: keyCode,
          columns,
          foreigntable: ``,
          foreigncolumns: [] as string[],
          definition: ``,
          updatetype: ``,
          deletetype: ``
        };
      });
  }

  private async reverseIndexes(
    tables: SQLiteTablesMetadata
  ): Promise<SQLiteTablesMetadata> {
    const rows = await this.indexRE.reverse();
    rows.forEach((row) => {
      if (!tables[row._table]) {
        return;
      }
      const indexAST = sqliteParser(row._code);

      const isColumnIndex: boolean = indexAST.statement[0].on.columns.reduce(
        (r: boolean, col: any) =>
          r &&
          (col.type === "identifier" ||
            (col.operator === "collate" &&
              col.expression.type === "identifier") ||
            (col.variant === "order" && col.expression.type === "identifier") ||
            (col.variant === "order" &&
              col.expression.operator === "collate" &&
              col.expression.expression.type === "identifier")),
        true
      );
      const columns = isColumnIndex
        ? indexAST.statement[0].on.columns.reduce(
            (r: SQLiteIndexColumnMetadata[], col: any) => {
              if (col.type === "identifier") {
                return [
                  ...r,
                  {
                    id: this.knownIdRegistry.getTableIndexColumnId(
                      undefined,
                      row._table,
                      undefined,
                      row._name,
                      col.name
                    ),
                    name: col.name,
                    asc: true,
                    desc: false
                  }
                ];
              } else if (
                col.operator === "collate" &&
                col.expression.type === "identifier"
              ) {
                return [
                  ...r,
                  {
                    id: this.knownIdRegistry.getTableIndexColumnId(
                      undefined,
                      row._table,
                      undefined,
                      row._name,
                      col.expression.name
                    ),
                    name: col.expression.name,
                    asc: true,
                    desc: false,
                    collation: col.collate[0].name
                  }
                ];
              } else if (
                col.variant === "order" &&
                col.expression.operator === "collate" &&
                col.expression.expression.type === "identifier"
              ) {
                return [
                  ...r,
                  {
                    id: this.knownIdRegistry.getTableIndexColumnId(
                      undefined,
                      row._table,
                      undefined,
                      row._name,
                      col.expression.expression.name
                    ),
                    name: col.expression.expression.name,
                    asc: col.direction === "asc" ? true : false,
                    desc: col.direction === "desc" ? true : false,
                    collation: col.expression.collate[0].name
                  }
                ];
              } else if (
                col.variant === "order" &&
                col.expression.type === "identifier"
              ) {
                return [
                  ...r,
                  {
                    id: this.knownIdRegistry.getTableIndexColumnId(
                      undefined,
                      row._table,
                      undefined,
                      row._name,
                      col.expression.name
                    ),
                    name: col.expression.name,
                    asc: col.direction === "asc" ? true : false,
                    desc: col.direction === "desc" ? true : false
                  }
                ];
              }
            },
            []
          )
        : [];

      const index: SQLiteIndexMetadata = {
        id: this.knownIdRegistry.getTableIndexId(
          undefined,
          row._table,
          undefined,
          row._name
        ),
        name: row._name,
        unique: !!indexAST.statement[0].unique,
        columns: columns,
        expression: isColumnIndex ? `` : `${row._code};`
      };
      tables[row._table].indexes.push(index);
    });
    return tables;
  }

  private async reverseJSON(
    tables: SQLiteTablesMetadata
  ): Promise<SQLiteTablesMetadata> {
    const commonTablesMetadata = await this.jsonRE.reverse(tables);

    const jsons = Object.keys(commonTablesMetadata)
      .map((key) => commonTablesMetadata[key])
      .map((common) => {
        const table = new SQLiteTableMetadata(
          common.id,
          common.name,
          common.embeddable,
          "",
          true,
          false,
          true,
          ""
        );
        table.columns = common.columns.map((i) => ({
          id: i.id,
          name: i.name,
          datatype: i.datatype,
          json: i.json,
          collation: "",
          comment: "",
          defaultvalue: "",
          nn: false,
          pk: false,
          autoincrement: false,
          data: "",
          estimatedSize: "",
          fk: false
        }));
        return table;
      })
      .reduce<SQLiteTablesMetadata>((r, i) => ({ ...r, [i.id]: i }), {});
    return { ...tables, ...jsons };
  }
}
