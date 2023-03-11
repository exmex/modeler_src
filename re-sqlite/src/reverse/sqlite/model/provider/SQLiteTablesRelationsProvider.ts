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
import { KnownIdRegistry, ModelPartProvider, WarningsProvider } from "re";
import {
  SQLiteTableMetadata,
  SQLiteTablesMetadata
} from "../metadata/SQLiteTableMetadata";

import { SQLiteColumnMetadata } from "../metadata/SQLiteColumnMetadata";
import { SQLiteConstraintMetadata } from "../metadata/SQLiteConstraintMetadata";
import { SQLiteQuotation } from "../../../../db/sqlite/sqlite-quotation";
import { SQLiteTableRelationMetadataBuilder } from "../../re/builder/SQLiteTableRelationMetadataBuilder";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

export class SQLiteTablesRelationsProvider
  implements ModelPartProvider<ModelObjects>
{
  constructor(
    private tableRelationMetadataBuilder: SQLiteTableRelationMetadataBuilder,
    private quotation: SQLiteQuotation,
    private warningsProvider: WarningsProvider,
    private knownIdRegistry: KnownIdRegistry
  ) {}

  public async provide(): Promise<ModelObjects> {
    const tablesMetadata = await this.tableRelationMetadataBuilder.build();
    return Promise.resolve(this.convertMetadata(tablesMetadata));
  }

  private convertMetadata(tablesMetadata: SQLiteTablesMetadata): ModelObjects {
    const relations = this.convertRelationsMetadata(tablesMetadata);
    const tables = this.convertTablesMetadata(tablesMetadata);
    return { tables, relations, otherObjects: {}, order: [] };
  }

  private convertRelationsMetadata(
    tablesMetadata: SQLiteTablesMetadata
  ): Relations {
    const tables = Object.keys(tablesMetadata).map(
      (key) => tablesMetadata[key]
    );

    const findTable = (name: string): SQLiteTableMetadata | undefined => {
      return tables.find((currentTable): boolean => name === currentTable.name);
    };

    const findKey = (
      keyTable: SQLiteTableMetadata,
      cols: string[]
    ): SQLiteConstraintMetadata | undefined => {
      if (cols.length === 0) {
        return keyTable.constraints.find(
          (currentConstraint: SQLiteConstraintMetadata): boolean => {
            return currentConstraint.type === "p";
          }
        );
      }
      return keyTable.constraints.find(
        (currentConstraint: SQLiteConstraintMetadata): boolean => {
          return currentConstraint.columns.toString() === cols.toString();
        }
      );
    };

    const findColumnById = (
      columnTable: SQLiteTableMetadata,
      column: string
    ): SQLiteColumnMetadata | undefined => {
      return columnTable.columns.find(
        (col) => col.name.toLocaleLowerCase() === column.toLocaleLowerCase()
      );
    };

    const createRelationCols = (
      parentTable: SQLiteTableMetadata,
      childTable: SQLiteTableMetadata,
      con: SQLiteConstraintMetadata
    ): RelationCol[] => {
      const r: RelationCol[] = [];
      con.columns.forEach((concolchildname, concolindex) => {
        const parentcol = findColumnById(
          parentTable,
          con.foreigncolumns[concolindex]
        );
        const childcol = findColumnById(childTable, concolchildname);
        if (parentcol && childcol) {
          r.push({
            id: this.knownIdRegistry.getRelationColumnId(
              undefined,
              parentTable.name,
              undefined,
              undefined,
              childTable.name,
              undefined,
              con.name,
              parentcol.name,
              childcol.name
            ),
            parentcol: parentcol.id,
            childcol: childcol.id
          });
        }
      });
      return r;
    };

    const type2Text = (type: string): string => {
      switch (type) {
        case "a":
          return "No action";
        case "c":
          return "Cascade";
        case "n":
          return "Set null";
        case "r":
          return "Restrict";
        default:
          return "";
      }
    };

    const getMandatoryChild = (
      table: SQLiteTableMetadata,
      con: SQLiteConstraintMetadata
    ): boolean => {
      return con.columns.reduce<boolean>(
        (r, i) => r && !!table.columns.find((col) => col.name === i)?.nn,
        true
      );
    };

    const getMandatoryParent = (
      table: SQLiteTableMetadata,
      con: SQLiteConstraintMetadata
    ): boolean => {
      return con.foreigncolumns.reduce<boolean>(
        (r, i) => r && !!table.columns.find((col) => col.name === i)?.nn,
        true
      );
    };

    const getCardinalityChild = (
      childTable: SQLiteTableMetadata,
      con: SQLiteConstraintMetadata
    ): boolean => {
      return !!childTable.constraints
        .filter(
          (anyConstraint) =>
            anyConstraint.type === "p" || anyConstraint.type === "u"
        )
        .find((uniqueConstraint) =>
          uniqueConstraint.columns.reduce<boolean>(
            (r, i, index) => r && i === con.columns[index],
            true
          )
        );
    };

    const createRelation = (
      con: SQLiteConstraintMetadata
    ): Relation | undefined => {
      const childTable = findTable(con.table);
      const parentTable = findTable(con.foreigntable);
      if (childTable && parentTable) {
        let parentKey = findKey(parentTable, con.foreigncolumns);
        if (parentKey && con.foreigncolumns.length === 0) {
          con.foreigncolumns = [...parentKey?.columns];
        } else {
          parentKey = this.findOrCreateAKForRelation(
            parentKey,
            parentTable,
            con
          );
        }
        const mandatoryParent = getMandatoryParent(parentTable, con);
        const mandatoryChild = getMandatoryChild(childTable, con);
        const cardinalityChild = getCardinalityChild(childTable, con);

        if (parentKey) {
          return {
            id: con.id,
            type: "identifying",
            cols: createRelationCols(parentTable, childTable, con),
            child: childTable.id,
            parent: parentTable.id,
            c_mp: mandatoryParent.toString(),
            c_mch: mandatoryChild.toString(),
            c_ch: cardinalityChild ? "one" : "many",
            c_p: "one",
            c_cp: con.c_cp,
            c_cch: con.c_cch,
            name: con.name,
            visible: true,
            desc: con.desc,
            parent_key: parentKey.id,
            ri_pd: type2Text(con.deletetype),
            ri_pu: type2Text(con.updatetype),
            generate: true,
            generateCustomCode: true
          };
        }
        this.warningsProvider.addWarning(
          `Relation ${con.name} can't be created because key is missing: ${
            parentTable.name
          }(${con.columns.toString()})`
        );
        return undefined;
      }
      if (!childTable) {
        this.warningsProvider.addWarning(
          `Relation ${con.name} can't be created because child is missing: ${con.table}`
        );
        return undefined;
      }
      this.warningsProvider.addWarning(
        `Relation ${con.name} can't be created because parent is missing: ${con.foreigntable}`
      );
      return undefined;
    };

    return tables.reduce<Relations>(
      (res: Relations, tableMetadata: SQLiteTableMetadata): Relations => ({
        ...res,
        ...tableMetadata.constraints
          .filter((con) => con.type === "f")
          .map((constraint) => createRelation(constraint))
          .filter((relation) => !!relation)
          .reduce<Relations>(
            (relations, relation) =>
              relation
                ? { ...relations, [relation.id]: relation }
                : { ...relations },
            {}
          )
      }),
      {}
    );
  }

  private generateNewAKName(
    constraints: SQLiteConstraintMetadata[],
    table: SQLiteTableMetadata
  ) {
    let i = 1;
    while (true) {
      const name = `${table.name}_ak_${i}`;
      if (!_.find(constraints, (con) => con.name === name)) {
        return name;
      }
    }
  }

  private findOrCreateAKForRelation(
    parentKey: SQLiteConstraintMetadata,
    parentTable: SQLiteTableMetadata,
    con: SQLiteConstraintMetadata
  ) {
    if (!parentKey) {
      const originalParentKeyId = this.knownIdRegistry.getTableKeyIdByColumns(
        undefined,
        parentTable.name,
        undefined,
        con.foreigncolumns,
        true
      );
      if (!!originalParentKeyId) {
        const originalTable = this.knownIdRegistry.getTable(
          undefined,
          parentTable.name,
          undefined
        );
        if (!!originalTable) {
          const originalKey = _.find(
            originalTable.keys,
            (key) => key.id === originalParentKeyId
          );
          parentKey = {
            id: originalKey.id,
            type: "u",
            name: originalKey.name,
            columns: con.foreigncolumns,
            table: parentTable.name,
            foreigntable: "",
            foreigncolumns: [],
            definition: "",
            updatetype: "",
            deletetype: ""
          } as SQLiteConstraintMetadata;
          parentTable.constraints.push(parentKey);
          return parentKey;
        }
      }

      const parentKeyName = this.generateNewAKName(
        parentTable.constraints,
        parentTable
      );

      parentKey = {
        id: uuidv4(),
        type: "u",
        name: parentKeyName,
        columns: con.foreigncolumns,
        table: parentTable.name,
        foreigntable: "",
        foreigncolumns: [],
        definition: "",
        updatetype: "",
        deletetype: ""
      } as SQLiteConstraintMetadata;
      parentTable.constraints.push(parentKey);
    }
    return parentKey;
  }

  private convertTablesMetadata(tablesMetadata: SQLiteTablesMetadata): Tables {
    return Object.keys(tablesMetadata)
      .map((key) => tablesMetadata[key])
      .map((item): Table => {
        return this.convertTable(item, tablesMetadata);
      })
      .reduce<Tables>((result, item) => ({ ...result, [item.id]: item }), {});
  }
  private convertTable(
    item: SQLiteTableMetadata,
    tablesMetadata: SQLiteTablesMetadata
  ): Table {
    return {
      ...this.getDefaultTableProperties(item),
      id: item.id,
      name: item.name,
      visible: true,
      desc: item.desc,
      cols: this.convertColumnsMetadata(item),
      relations: this.getTableRelations(tablesMetadata, item),
      keys: this.convertConstraintsMetadata(item),
      indexes: this.convertIndexesMetadata(item),
      afterScript: this.getTableAfterScript(item),
      estimatedSize: item.estimatedSize,
      sqlite: { withoutrowid: item.withoutrowid, strict: item.strict }
    };
  }

  private convertIndexesMetadata(item: SQLiteTableMetadata): Index[] {
    return item.indexes.map((index): Index => {
      const cols = index.columns.reduce((r, indexcolumn) => {
        const col = item.columns.find((c) => c.name === indexcolumn.name);

        if (col || indexcolumn.expression || indexcolumn.collation) {
          return [
            ...r,
            {
              id: this.knownIdRegistry.getTableIndexColumnId(
                undefined,
                item.name,
                undefined,
                index.name,
                col?.name
              ),
              colid: col?.id,
              sqlite: {
                ...this.defaultEmptyString("collate", indexcolumn.collation),
                ...this.defaultEmptyString(
                  "expression",
                  indexcolumn.expression
                ),
                desc: indexcolumn.desc
              }
            }
          ];
        }
        return r;
      }, []);
      return {
        id: index.id,
        unique: index.unique,
        name: index.name,
        cols,
        sqlite: {
          expression: index.expression
        }
      };
    });
  }

  private getTableAfterScript(item: SQLiteTableMetadata): string {
    const constraintDefinition = item.constraints
      .filter(
        (con) =>
          (con.type === "c" && con.columns.length > 1) || con.type === "x"
      )
      .map(
        (con) =>
          `ALTER TABLE ${this.quotation.quoteIdentifier(
            item.name
          )} ADD CONSTRAINT ${this.quotation.quoteIdentifier(
            con.name
          )} ${con.definition.trim()}; `
      );
    return `${constraintDefinition.join("\n")} `;
  }

  private convertConstraintsMetadata(item: SQLiteTableMetadata): Key[] {
    const constraints = item.constraints.filter(
      (con) => con.type === "p" || con.type === "u"
    );
    const result = constraints.map((con): Key => {
      return {
        id: con.id,
        isPk: con.type === "p",
        name: con.name,
        cols: this.getKeyColumns(con, item, con.id)
      };
    });
    this.addDefaultPrimaryKey(result, item);
    return result;
  }

  private getKeyColumns(
    con: SQLiteConstraintMetadata,
    item: SQLiteTableMetadata,
    keyId: string
  ): KeyCol[] {
    return con.columns
      .filter(
        (columnName) =>
          !!item.columns.find(
            (col) =>
              col.name.toLocaleLowerCase() === columnName.toLocaleLowerCase()
          )
      )
      .map((columnName) => ({
        id: this.knownIdRegistry.getTableKeyColumnIdForKeyId(
          undefined,
          item.name,
          undefined,
          keyId,
          columnName,
          true
        ),
        colid: item.columns.find(
          (col) =>
            col.name.toLocaleLowerCase() === columnName.toLocaleLowerCase()
        )!.id
      }));
  }

  private addDefaultPrimaryKey(result: Key[], item: SQLiteTableMetadata) {
    if (!result.find((key) => key.isPk)) {
      const defaultKeyName = `Primary key`;
      const id = this.knownIdRegistry.getTableKeyIdByColumns(
        undefined,
        item.name,
        undefined,
        [],
        true
      );
      result.push({
        id,
        isPk: true,
        name: defaultKeyName,
        cols: []
      });
    }
  }

  private getTableRelations(
    tablesMetadata: SQLiteTablesMetadata,
    checkedTable: SQLiteTableMetadata
  ): string[] {
    const checkParentChild = (currentConstraint: SQLiteConstraintMetadata) =>
      currentConstraint.type === "f" &&
      (currentConstraint.foreigntable === checkedTable.name ||
        currentConstraint.table === checkedTable.name);
    const checkParentChildExistance = (
      currentTable: SQLiteTableMetadata
    ): string[] => {
      return currentTable.constraints
        .filter((currentConstraint) => checkParentChild(currentConstraint))
        .map((con) => con.id);
    };
    return Object.keys(tablesMetadata)
      .map((key) => tablesMetadata[key])
      .reduce<string[]>((r, i) => [...r, ...checkParentChildExistance(i)], []);
  }

  private getFK(
    tableMetadata: SQLiteTableMetadata,
    colname: string
  ): SQLiteConstraintMetadata | undefined {
    return tableMetadata.constraints
      .filter((c) => c.type === "f")
      .find((c) =>
        c.columns.find(
          (concolname) =>
            concolname.toLocaleLowerCase() === colname.toLocaleLowerCase()
        )
      );
  }

  private convertColumnsMetadata(tableMetadata: SQLiteTableMetadata): Column[] {
    return Array.from(tableMetadata.columns.values()).map(
      (columnMetadata): Column => {
        const rel = this.getFK(tableMetadata, columnMetadata.name);
        return {
          ...this.getDefaultColumnProperties(),
          id: columnMetadata.id,
          name: columnMetadata.name,
          datatype: columnMetadata.datatype,
          param: "",
          pk: this.isPK(tableMetadata, columnMetadata),
          nn: columnMetadata.nn,
          comment: columnMetadata.comment,
          data: columnMetadata.data,
          estimatedSize: columnMetadata.estimatedSize,
          ...this.defaultEmptyString(
            "defaultvalue",
            columnMetadata.defaultvalue
          ),
          collation: columnMetadata.collation,
          fk: !!rel,
          after: this.getColumnAfter(tableMetadata, columnMetadata),
          json: columnMetadata.json,
          sqlite: { autoincrement: columnMetadata.autoincrement }
        };
      }
    );
  }

  private isPK(item: SQLiteTableMetadata, col: SQLiteColumnMetadata): boolean {
    const pkCons = item.constraints.filter(
      (currentConstraints) =>
        currentConstraints.type === "p" &&
        currentConstraints.columns.find(
          (concol) =>
            concol.toLocaleLowerCase() === col.name.toLocaleLowerCase()
        )
    );
    return pkCons.length !== 0;
  }

  private getColumnAfter(
    item: SQLiteTableMetadata,
    col: SQLiteColumnMetadata
  ): string {
    const constraintDefinition = item.constraints
      .filter(
        (con) =>
          con.type === "c" &&
          con.columns.length === 1 &&
          col.name === con.columns[0]
      )
      .map(
        (con) =>
          `CONSTRAINT ${this.quotation.quoteIdentifier(con.name)} ${
            con.definition
          } `
      );
    return constraintDefinition.join("\n");
  }

  private getDefaultColumnProperties(): any {
    return {};
  }

  private getDefaultTableProperties(item: SQLiteTableMetadata): any {
    return {
      lines: [],
      embeddable: item.embeddable,
      generate: true,
      generateCustomCode: true
    };
  }

  private defaultEmptyString(name: string, value: any): any {
    if (value === undefined || value === null) {
      return { [name]: "" };
    } else {
      return { [name]: value };
    }
  }
}
