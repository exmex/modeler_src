import {
  Column,
  Index,
  IndexCol,
  Key,
  ModelObjects,
  Relation,
  RelationCol,
  Relations,
  Table,
  Tables
} from "common";
import {
  DependenciesRegistry,
  KnownIdRegistry,
  ModelPartProvider,
  ReverseOptions,
  WarningsProvider
} from "re";
import {
  MSSQLTableMetadata,
  MSSQLTablesMetadata
} from "../metadata/MSSQLTableMetadata";

import { MSSQLColumnMetadata } from "../metadata/MSSQLColumnMetadata";
import { MSSQLForeignKeyConstraintMetadata } from "../metadata/MSSQLForeignKeyConstraintMetadata";
import { MSSQLIndexMetadata } from "../metadata/MSSQLIndexMetadata";
import { MSSQLKeyConstraintMetadata } from "../metadata/MSSQLKeyConstraintMetadata";
import { MSSQLQuotation } from "../../../../db/mssql/mssql-quotation";
import { MSSQLTableRelationMetadataBuilder } from "../../re/builder/MSSQLTableRelationMetadataBuilder";
import { MSSQLUserDefinedTypeRegistry } from "../../MSSQLUserDefinedTypeRegistry";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

export class MSSQLTablesRelationsProvider
  implements ModelPartProvider<ModelObjects>
{
  constructor(
    private tableRelationMetadataBuilder: MSSQLTableRelationMetadataBuilder,
    private quotation: MSSQLQuotation,
    private userDefinedTypeRegistry: MSSQLUserDefinedTypeRegistry,
    private dependenciesRegistry: DependenciesRegistry,
    private reverseOptions: ReverseOptions,
    private warningsProvider: WarningsProvider,
    private knownIdRegistry: KnownIdRegistry
  ) {}

  public async provide(): Promise<ModelObjects> {
    const tablesMetadata = await this.tableRelationMetadataBuilder.build();
    return Promise.resolve(this.convertMetadata(tablesMetadata));
  }

  private convertMetadata(tablesMetadata: MSSQLTablesMetadata): ModelObjects {
    const tables = this.convertTablesMetadata(tablesMetadata);
    const relations = this.convertRelationsMetadata(tablesMetadata);
    return { tables, relations, otherObjects: {}, order: [] };
  }

  private findTable(
    tablesMetadata: MSSQLTablesMetadata,
    schema: string,
    name: string
  ): MSSQLTableMetadata | undefined {
    const tables = Object.keys(tablesMetadata).map(
      (key) => tablesMetadata[key]
    );
    return tables.find(
      (currentTable): boolean =>
        name === currentTable.name && schema === currentTable.schema
    );
  }

  private convertRelationsMetadata(
    tablesMetadata: MSSQLTablesMetadata
  ): Relations {
    const tables = Object.keys(tablesMetadata).map(
      (key) => tablesMetadata[key]
    );

    const findKey = (
      keyTable: MSSQLTableMetadata,
      cols: string[]
    ): MSSQLKeyConstraintMetadata | undefined => {
      return Array.from(keyTable.keyConstraints.values()).find(
        (currentConstraint: MSSQLKeyConstraintMetadata): boolean => {
          return (
            currentConstraint.columns.length > 0 &&
            currentConstraint.columns.length === cols.length &&
            currentConstraint.columns.filter((constraintColumn) =>
              cols.find((col) => col === constraintColumn)
            ).length === cols.length
          );
        }
      );
    };

    const findColumnById = (
      columnTable: MSSQLTableMetadata,
      column: string
    ): MSSQLColumnMetadata | undefined => {
      return columnTable.columns.find((col) => col.name === column);
    };

    const createRelationCols = (
      parentTable: MSSQLTableMetadata,
      childTable: MSSQLTableMetadata,
      con: MSSQLForeignKeyConstraintMetadata
    ): RelationCol[] => {
      return con.columns.map((concolchildname, concolindex) => {
        const parentcol = findColumnById(
          parentTable,
          con.foreigncolumns[concolindex]
        );
        const childcol = findColumnById(childTable, concolchildname);
        if (parentcol && childcol) {
          const id = this.knownIdRegistry.getRelationColumnId(
            parentTable.schema,
            parentTable.name,
            "table",
            childTable.schema,
            childTable.name,
            "table",
            con.name,
            parentcol.name,
            childcol.name
          );
          return {
            id,
            parentcol: parentcol.id,
            childcol: childcol.id
          };
        }
        throw new Error(
          `Missing column: ${con.foreigncolumns[concolindex]}-${concolchildname}`
        );
      });
    };

    const type2Text = (type: string): string => {
      switch (type) {
        case "NO_ACTION":
          return "No action";
        case "CASCADE":
          return "Cascade";
        case "SET_NULL":
          return "Set null";
        case "SET_DEFAULT":
          return "Set default";
        default:
          return "na";
      }
    };

    const getMandatoryChild = (
      table: MSSQLTableMetadata,
      con: MSSQLForeignKeyConstraintMetadata
    ): boolean => {
      return con.columns.reduce<boolean>(
        (r, i) => r && !!table.columns.find((col) => col.name === i)?.nn,
        true
      );
    };

    const getMandatoryParent = (
      table: MSSQLTableMetadata,
      con: MSSQLForeignKeyConstraintMetadata
    ): boolean => {
      return con.foreigncolumns.reduce<boolean>(
        (r, i) => r && !!table.columns.find((col) => col.name === i)?.nn,
        true
      );
    };

    const getCardinalityChild = (
      childTable: MSSQLTableMetadata,
      con: MSSQLForeignKeyConstraintMetadata
    ): boolean => {
      return !!Array.from(childTable.keyConstraints.values())
        .filter(
          (anyConstraint) =>
            anyConstraint.isPrimaryKey || anyConstraint.isUnique
        )
        .find((uniqueConstraint) =>
          uniqueConstraint.columns.reduce<boolean>(
            (r, i, index) => r && i === con.columns[index],
            true
          )
        );
    };

    const createRelation = (
      con: MSSQLForeignKeyConstraintMetadata
    ): Relation | undefined => {
      const childTable = this.findTable(tablesMetadata, con.schema, con.table);
      const parentTable = this.findTable(
        tablesMetadata,
        con.foreignschema,
        con.foreigntable
      );
      if (childTable && parentTable) {
        const parentKey = findKey(parentTable, con.foreigncolumns);
        const mandatoryParent = getMandatoryParent(parentTable, con);
        const mandatoryChild = getMandatoryChild(childTable, con);
        const cardinalityChild = getCardinalityChild(childTable, con);

        const ri_pd = type2Text(con.deletetype);
        const ri_pu = type2Text(con.updatetype);

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
            desc: con.comment ?? "",
            parent_key: parentKey.id,
            ...(ri_pd ? { ri_pd } : {}),
            ...(ri_pu ? { ri_pu } : {}),
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
      (res: Relations, tableMetadata: MSSQLTableMetadata): Relations => ({
        ...res,
        ...Array.from(tableMetadata.foreignKeyConstraints.values())
          .filter(
            (constraint) =>
              this.findTable(
                tablesMetadata,
                constraint.schema,
                constraint.table
              ) &&
              this.findTable(
                tablesMetadata,
                constraint.foreignschema,
                constraint.foreigntable
              )
          )
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

  private convertTablesMetadata(tablesMetadata: MSSQLTablesMetadata): Tables {
    return Object.keys(tablesMetadata)
      .map((key) => tablesMetadata[key])
      .map((item): Table => {
        return this.convertTable(item, tablesMetadata);
      })
      .reduce<Tables>((result, item) => ({ ...result, [item.id]: item }), {});
  }

  private convertTable(
    item: MSSQLTableMetadata,
    tablesMetadata: MSSQLTablesMetadata
  ): Table {
    return {
      ...this.getDefaultTableProperties(item),
      id: item.id,
      name: item.name,
      visible: true,
      desc: item.comment ? item.comment : "",
      cols: this.convertColumnsMetadata(item),
      relations: this.getTableRelations(tablesMetadata, item),
      keys: this.convertConstraintsMetadata(item, tablesMetadata),
      indexes: this.convertIndexesMetadata(item),
      afterScript: this.getTableAfterScript(item),
      estimatedSize: item.estimatedSize,
      mssql: {
        schema: item.schema
      }
    };
  }

  private convertIndexWith(index: MSSQLIndexMetadata): any {
    const resultArr = [];
    if (
      index.spatial?.tessellationScheme === "GEOMETRY_GRID" ||
      index.spatial?.tessellationScheme === "GEOMETRY_AUTO_GRID"
    ) {
      resultArr.push(
        `BOUNDING_BOX=(${index.spatial.boundingBoxXmin},${index.spatial.boundingBoxYmin},${index.spatial.boundingBoxXmax},${index.spatial.boundingBoxYmax})`
      );
    }

    if (
      index.spatial?.tessellationScheme === "GEOMETRY_GRID" ||
      index.spatial?.tessellationScheme === "GEOGRAPHY_GRID"
    ) {
      const gridsParam = [];
      if (index.spatial.level1Grid !== "MEDIUM") {
        gridsParam.push(`LEVEL_1=${index.spatial.level1Grid}`);
      }

      if (index.spatial.level2Grid !== "MEDIUM") {
        gridsParam.push(`LEVEL_2=${index.spatial.level2Grid}`);
      }

      if (index.spatial.level3Grid !== "MEDIUM") {
        gridsParam.push(`LEVEL_3=${index.spatial.level3Grid}`);
      }

      if (index.spatial.level4Grid !== "MEDIUM") {
        gridsParam.push(`LEVEL_4=${index.spatial.level4Grid}`);
      }

      if (!_.isEmpty(gridsParam)) {
        resultArr.push(`GRIDS=(${gridsParam.join(",")})`);
      }
    }

    if (
      index.spatial?.tessellationScheme === "GEOMETRY_GRID" &&
      index.spatial?.cellsPerObject !== 16
    ) {
      resultArr.push(`CELLS_PER_OBJECT=${index.spatial?.cellsPerObject}`);
    }

    if (
      index.spatial?.tessellationScheme === "GEOMETRY_AUTO_GRID" &&
      index.spatial?.cellsPerObject !== 8
    ) {
      resultArr.push(`CELLS_PER_OBJECT=${index.spatial?.cellsPerObject}`);
    }

    if (
      index.spatial?.tessellationScheme === "GEOGRAPHY_GRID" &&
      index.spatial?.cellsPerObject !== 16
    ) {
      resultArr.push(`CELLS_PER_OBJECT=${index.spatial?.cellsPerObject}`);
    }

    if (
      index.spatial?.tessellationScheme === "GEOGRAPHY_AUTO_GRID" &&
      index.spatial?.cellsPerObject !== 12
    ) {
      resultArr.push(`CELLS_PER_OBJECT=${index.spatial?.cellsPerObject}`);
    }

    if (index.with.fillFactor > 0) {
      resultArr.push(`FILLFACTOR=${index.with.fillFactor}`);
    }

    if (index.with.ignoreDupKey) {
      resultArr.push("IGNORE_DUP_KEY=ON");
    }

    if (index.with.noRecompute) {
      resultArr.push("STATISTICS_NORECOMPUTE=ON");
    }

    if (!index.with.allowRowLocks) {
      resultArr.push("IGNORE_DUP_KEY=OFF");
    }

    if (!index.with.allowPageLocks) {
      resultArr.push("ALLOW_PAGE_LOCKS=OFF");
    }

    const withClause = resultArr.join(",");
    if (!_.isEmpty(withClause)) {
      return { with: withClause };
    }

    return {};
  }

  private convertIndexUsing(index: MSSQLIndexMetadata): any {
    if (!!index.spatial?.tessellationScheme) {
      return { using: index.spatial?.tessellationScheme };
    }
    return {};
  }

  private convertIndexesMetadata(item: MSSQLTableMetadata): Index[] {
    return Array.from(item.indexes.values()).map((index): Index => {
      const cols = index.columns
        .filter(
          (indexcolumn) =>
            !!item.columns.find((c) => c.name === indexcolumn.name)
        )
        .map((indexcolumn): IndexCol => {
          const col = item.columns.find((c) => c.name === indexcolumn.name);
          const id = col
            ? this.knownIdRegistry.getTableIndexColumnId(
                item.schema,
                item.name,
                "table",
                index.name,
                col.name
              )
            : uuidv4();
          return {
            id,
            colid: col ? col.id : "",
            mssql: {
              desc: indexcolumn.desc
            }
          };
        });
      return {
        id: index.id,
        fulltext: false,
        unique: index.unique,

        name: index.name,
        lockoption: "na",
        cols,
        mssql: {
          type: index.type,
          clustered: index.clustered,
          primaryxml: index.primaryxml,
          desc: index.comment,
          onFilegroup: index.ds,
          where: index.where,
          keyIndex: undefined,
          order: "",
          pathXMLIndex: index.pathXMLIndex,
          using: undefined,
          ...this.convertIndexWith(index),
          ...this.convertIndexUsing(index)
        },
        algorithm: "na"
      };
    });
  }

  private getTableAfterScript(item: MSSQLTableMetadata): string {
    const constraintDefinition = item.checkConstraints
      .filter((con) => !con.column)
      .map(
        (con) =>
          `ALTER TABLE ${this.quotation.quoteIdentifier(
            item.schema,
            false
          )}.${this.quotation.quoteIdentifier(
            item.name,
            false
          )} ADD CONSTRAINT ${this.quotation.quoteIdentifier(
            con.name,
            false
          )} CHECK ${con.definition.trim()};`
      );
    const constraintComments = item.checkConstraints
      .filter((con): boolean => !!con.comment)
      .map(
        (con) =>
          `EXEC sys.sp_addextendedproperty 'MS_Description', N'${con.comment.replace(
            new RegExp(/'/, "g"),
            "''"
          )}', 'schema', N'${item.schema}', 'table', N'${
            item.name
          }', 'constraint', N'${con.name}';\nGO\n`
      );
    return `${constraintDefinition.concat(constraintComments).join("\n")}`;
  }

  private convertConstraintsMetadata(
    item: MSSQLTableMetadata,
    tablesMetadata: MSSQLTablesMetadata
  ): Key[] {
    const constraints = Array.from(item.keyConstraints.values()).filter(
      (con) => con.isPrimaryKey || con.isUnique
    );
    const result = constraints.map((con): Key => {
      return {
        id: con.id,
        isPk: con.isPrimaryKey,
        name: con.name,
        cols: con.columns
          .filter(
            (columnName) =>
              columnName != "NULL" &&
              !!item.columns.find((col) => col.name === columnName)
          )
          .map((columnName) => {
            const col = item.columns.find((c) => c.name === columnName);
            const id = this.knownIdRegistry.getTableKeyColumnId(
              con.schema,
              con.table,
              "table",
              con.name,
              col.name,
              con.isPrimaryKey
            );
            return {
              id,
              colid: col ? col.id : ""
            };
          }),
        mssql: { clustered: con.clustered }
      };
    });

    if (!result.find((key) => key.isPk)) {
      const defaultKeyName = `${item.name}_pkey`;
      const id = this.knownIdRegistry.getTableKeyId(
        item.schema,
        item.name,
        "table",
        defaultKeyName,
        true
      );
      result.push({
        id,
        isPk: true,
        name: defaultKeyName,
        cols: [],
        mssql: { clustered: true }
      });
    }
    return result;
  }

  private getTableRelations(
    tablesMetadata: MSSQLTablesMetadata,
    checkedTable: MSSQLTableMetadata
  ): string[] {
    const checkParentChild = (
      currentConstraint: MSSQLForeignKeyConstraintMetadata
    ) =>
      currentConstraint.foreigntable === checkedTable.name ||
      currentConstraint.table === checkedTable.name;
    const checkParentChildExistance = (
      currentTable: MSSQLTableMetadata
    ): string[] => {
      return Array.from(currentTable.foreignKeyConstraints.values())
        .filter((currentConstraint) => checkParentChild(currentConstraint))
        .map((con) => con.id);
    };
    return Object.keys(tablesMetadata)
      .map((key) => tablesMetadata[key])
      .reduce<string[]>((r, i) => [...r, ...checkParentChildExistance(i)], []);
  }

  private getFK(
    tableMetadata: MSSQLTableMetadata,
    colname: string
  ): MSSQLForeignKeyConstraintMetadata | undefined {
    return Array.from(tableMetadata.foreignKeyConstraints.values()).find((c) =>
      c.columns.find((concolname) => concolname === colname)
    );
  }

  private getTypeName(
    tableMetadata: MSSQLTableMetadata,
    columnMetadata: MSSQLColumnMetadata
  ): { datatype: string; isUserDataType: boolean } {
    const userTypeId = this.userDefinedTypeRegistry.find({
      scope: columnMetadata.datatypeSchema,
      name: columnMetadata.datatype
    });
    if (userTypeId) {
      return { datatype: userTypeId, isUserDataType: true };
    }

    return { datatype: columnMetadata.datatype, isUserDataType: false };
  }

  private getDefaultValue(
    tableMetadata: MSSQLTableMetadata,
    columnMetadata: MSSQLColumnMetadata,
    datatype: string
  ) {
    return columnMetadata.generated ? `` : columnMetadata.defaultvalue;
  }

  private convertColumnsMetadata(tableMetadata: MSSQLTableMetadata): Column[] {
    return Array.from(tableMetadata.columns.values()).map(
      (columnMetadata): Column => {
        const rel = this.getFK(tableMetadata, columnMetadata.name);
        const datatypeWrapper = this.getTypeName(tableMetadata, columnMetadata);
        const defaultvalue = this.getDefaultValue(
          tableMetadata,
          columnMetadata,
          datatypeWrapper.datatype
        );
        return {
          ...this.getDefaultColumnProperties(),
          id: columnMetadata.id,
          name: columnMetadata.name,
          datatype: datatypeWrapper.datatype,
          param: !!columnMetadata.param ? columnMetadata.param : undefined,
          pk: this.isPK(tableMetadata, columnMetadata),
          nn: columnMetadata.nn,
          ...this.defaultEmptyString("comment", columnMetadata.comment),
          ...this.defaultEmptyString("defaultvalue", defaultvalue),
          collation:
            columnMetadata.collation !== "default"
              ? columnMetadata.collation
              : ``,
          ...this.skipFalse("fk", !!rel),
          after: this.getColumnAfter(tableMetadata, columnMetadata),
          mssql: {
            computed:
              columnMetadata.definition +
              (columnMetadata.isPersisted ? ` PERSISTED` : ``)
          },
          list: undefined,
          json: columnMetadata.json,
          data: columnMetadata.data,
          estimatedSize: columnMetadata.estimatedSize
        };
      }
    );
  }
  private isPK(item: MSSQLTableMetadata, col: MSSQLColumnMetadata): boolean {
    const pkCons = Array.from(item.keyConstraints.values()).filter(
      (currentConstraints) =>
        currentConstraints.isPrimaryKey &&
        currentConstraints.columns.find((concol) => concol === col.name)
    );
    return pkCons.length !== 0;
  }

  private getColumnAfter(
    item: MSSQLTableMetadata,
    col: MSSQLColumnMetadata
  ): string {
    const definitions = [];

    if (col.identity) {
      definitions.push(
        `IDENTITY(${col.identity.seed_value},${col.identity.increment_value})`
      );
    }
    if (col.generated) {
      definitions.push(`GENERATED ALWAYS AS ${col.defaultvalue} STORED`);
    }

    if (col.isNotForReplication) {
      definitions.push(`NOT FOR REPLICATION`);
    }

    const checkConstraintDefinitions = item.checkConstraints
      .filter((con) => col.name === con.column)
      .map(
        (con) =>
          `CONSTRAINT ${this.quotation.quoteIdentifier(
            con.name,
            false
          )} CHECK ${con.definition}`
      );

    return [...definitions, ...checkConstraintDefinitions].join(" ");
  }

  private getDefaultColumnProperties(): any {
    return {
      data: ""
    };
  }

  private getDefaultTableProperties(item: MSSQLTableMetadata): any {
    return {
      lines: [],
      embeddable: item.embeddable,
      objectType: item.objectType,
      generate: true,
      generateCustomCode: true
    };
  }

  private skipEmptyString(name: string, value: any): any {
    if (value === "" || value === undefined || value === null) {
      return {};
    } else {
      return { [name]: value };
    }
  }

  private defaultEmptyString(name: string, value: any): any {
    if (value === undefined || value === null) {
      return { [name]: "" };
    } else {
      return { [name]: value };
    }
  }

  private skipFalse(name: string, value: any): any {
    if (value === false) {
      return {};
    } else {
      return { [name]: value };
    }
  }

  private skipEmptyArray(name: string, value: any): any {
    if (_.isArray(value) && _.isEmpty(value)) {
      return {};
    } else {
      return { [name]: value };
    }
  }
}
