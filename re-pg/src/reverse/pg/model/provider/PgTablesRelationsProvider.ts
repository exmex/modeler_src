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
import { PgTableMetadata, PgTablesMetadata } from "../metadata/PgTableMetadata";

import { PgColumnMetadata } from "../metadata/PgColumnMetadata";
import { PgConstraintMetadata } from "../metadata/PgConstraintMetadata";
import { PgIdentifierParser } from "../../../../db/pg/pg-identifier-parser";
import { PgQuotation } from "../../../../db/pg/pg-quotation";
import { PgTableRelationMetadataBuilder } from "../../re/builder/PgTableRelationMetadataBuilder";
import { PgUserDataTypeRegistry } from "../../PgUserDataTypeRegistry";
import { SequenceRegistry } from "../../SequenceRegistry";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

export class PgTablesRelationsProvider
  implements ModelPartProvider<ModelObjects>
{
  constructor(
    private tableRelationMetadataBuilder: PgTableRelationMetadataBuilder,
    private quotation: PgQuotation,
    private identifierParser: PgIdentifierParser,
    private userDataTypeRegistry: PgUserDataTypeRegistry,
    private dependenciesRegistry: DependenciesRegistry,
    private sequenceRegistry: SequenceRegistry,
    private reverseOptions: ReverseOptions,
    private warningsProvider: WarningsProvider,
    private knownIdRegistry: KnownIdRegistry
  ) {}

  public async provide(): Promise<ModelObjects> {
    const tablesMetadata = await this.tableRelationMetadataBuilder.build();
    return Promise.resolve(this.convertMetadata(tablesMetadata));
  }

  private convertMetadata(tablesMetadata: PgTablesMetadata): ModelObjects {
    const tables = this.convertTablesMetadata(tablesMetadata);
    const relations = this.convertRelationsMetadata(tablesMetadata);
    return { tables, relations, otherObjects: {}, order: [] };
  }

  private findTable(
    tablesMetadata: PgTablesMetadata,
    schema: string,
    name: string
  ): PgTableMetadata | undefined {
    const tables = Object.keys(tablesMetadata).map(
      (key) => tablesMetadata[key]
    );
    return tables.find(
      (currentTable): boolean =>
        name === currentTable.name && schema === currentTable.schema
    );
  }

  private convertRelationsMetadata(
    tablesMetadata: PgTablesMetadata
  ): Relations {
    const tables = Object.keys(tablesMetadata).map(
      (key) => tablesMetadata[key]
    );

    const findKey = (
      keyTable: PgTableMetadata,
      cols: string[]
    ): PgConstraintMetadata | undefined => {
      return keyTable.constraints.find(
        (currentConstraint: PgConstraintMetadata): boolean => {
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
      columnTable: PgTableMetadata,
      column: string
    ): PgColumnMetadata | undefined => {
      return columnTable.columns.find((col) => col.name === column);
    };

    const createRelationCols = (
      parentTable: PgTableMetadata,
      childTable: PgTableMetadata,
      con: PgConstraintMetadata
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
        case "a":
          return "No action";
        case "c":
          return "Cascade";
        case "n":
          return "Set null";
        case "r":
          return "Restrict";
        case "d":
          return "Set default";
        default:
          return "na";
      }
    };

    const getMandatoryChild = (
      table: PgTableMetadata,
      con: PgConstraintMetadata
    ): boolean => {
      return con.columns.reduce<boolean>(
        (r, i) => r && !!table.columns.find((col) => col.name === i)?.nn,
        true
      );
    };

    const getMandatoryParent = (
      table: PgTableMetadata,
      con: PgConstraintMetadata
    ): boolean => {
      return con.foreigncolumns.reduce<boolean>(
        (r, i) => r && !!table.columns.find((col) => col.name === i)?.nn,
        true
      );
    };

    const getCardinalityChild = (
      childTable: PgTableMetadata,
      con: PgConstraintMetadata
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

    const getPartitionedTableOfPartition = (
      table: PgTableMetadata | undefined,
      visited: { schema: string; name: string }[]
    ): PgTableMetadata[] => {
      const alreadyVisited = visited.find(
        (item) => item.schema === table.schema && item.name === table.name
      );
      if (alreadyVisited) {
        console.log("Found cycle in partitions detection.");
        return [];
      }
      visited.push({ schema: table.schema, name: table.name });
      if (!table) {
        return [];
      }
      if (table.inheritsArr.length > 0) {
        const foundParentTables = table.inheritsArr
          .map((parentTableName) =>
            this.findTable(tablesMetadata, table.schema, parentTableName)
          )
          .filter((parentTable) => !!parentTable);
        return foundParentTables.reduce<PgTableMetadata[]>(
          (r, parentTable) =>
            parentTable
              ? [...r, ...getPartitionedTableOfPartition(parentTable, visited)]
              : r,
          []
        );
      }
      return [table];
    };

    const createRelation = (
      con: PgConstraintMetadata
    ): Relation | undefined => {
      const childTable = this.findTable(tablesMetadata, con.schema, con.table);
      const parentTable = this.findTable(
        tablesMetadata,
        con.foreignschema,
        con.foreigntable
      );
      if (childTable && parentTable) {
        const parentPartitionTables = getPartitionedTableOfPartition(
          parentTable,
          []
        );
        const childParitionTables = getPartitionedTableOfPartition(
          childTable,
          []
        );
        parentPartitionTables.forEach((parent) => {
          childParitionTables.forEach((child) => {
            this.dependenciesRegistry.registerDependencies(
              parent.id,
              parent.name,
              child.id,
              child.name
            );
          });
        });

        if (this.isPartitionRelation(childTable, parentTable)) {
          return undefined;
        }
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
      (res: Relations, tableMetadata: PgTableMetadata): Relations => ({
        ...res,
        ...tableMetadata.constraints
          .filter((con) => con.type === "f")
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

  private isPartitionRelation(
    childTable?: PgTableMetadata,
    parentTable?: PgTableMetadata
  ) {
    return this.isPartition(childTable) || this.isPartition(parentTable);
  }

  private isPartition(parentTable?: PgTableMetadata) {
    return !!parentTable && parentTable.inheritsArr.length > 0;
  }

  private convertTablesMetadata(tablesMetadata: PgTablesMetadata): Tables {
    return Object.keys(tablesMetadata)
      .map((key) => tablesMetadata[key])
      .map((item): Table => {
        if (item.objectType === "composite") {
          return this.convertCompositeType(item);
        }
        return this.convertTable(item, tablesMetadata);
      })
      .reduce<Tables>((result, item) => ({ ...result, [item.id]: item }), {});
  }

  private convertTable(
    item: PgTableMetadata,
    tablesMetadata: PgTablesMetadata
  ): Table {
    if (item.inheritsArr.length > 0) {
      item.inheritsArr.forEach((parentItem) => {
        const parentTable = this.findTable(
          tablesMetadata,
          item.schema,
          parentItem
        );
        if (parentTable) {
          this.dependenciesRegistry.registerDependencies(
            parentTable.id,
            parentTable.name,
            item.id,
            item.name
          );
        }
      });
    }
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
      pg: {
        ...this.defaultEmptyString("tablespace", item.tablespace),
        ...this.defaultEmptyString("inherits", item.inherits),
        ...this.defaultEmptyString(
          "storageParameters",
          item.storageParams ? item.storageParams.join(",") : ""
        ),
        ...this.defaultEmptyString("partition", item.partition),
        //owner: item.owner,
        rowsecurity: item.rowsecurity,
        ...this.defaultEmptyArray("partitionNames", item.partitionNames),
        schema: this.reverseOptions.includeSchema === true ? item.schema : ``
      }
    };
  }

  private convertCompositeType(item: PgTableMetadata): Table {
    const keyId = this.knownIdRegistry.getTableKeyId(
      item.schema,
      item.name,
      "composite",
      "Primary key",
      true
    );
    return {
      ...this.getDefaultTableProperties(item),
      id: item.id,
      name: item.name,
      visible: true,
      desc: item.comment ? item.comment : "",
      cols: this.convertCompositeColumnsMetadata(item),
      relations: [],
      keys: [
        {
          id: keyId,
          isPk: true,
          name: "Primary key",
          cols: []
        }
      ],
      indexes: [],
      estimatedSize: "",
      pg: {
        ...this.getDefaultTableProperties(item).pg,
        schema: this.reverseOptions.includeSchema === true ? item.schema : ``,
        ...this.defaultEmptyArray("partitionNames", []),
        rowsecurity: false
      }
    };
  }

  private convertIndexesMetadata(item: PgTableMetadata): Index[] {
    return item.indexes.map((index): Index => {
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
            pg: {
              collate:
                indexcolumn.collation !== "default"
                  ? indexcolumn.collation
                  : "",
              desc: indexcolumn.desc,
              nullsLast: indexcolumn.nulls_last,
              ...this.defaultEmptyString("expression", indexcolumn.expression)
            }
          };
        });
      return {
        id: index.id,
        unique: index.unique,
        name: index.name,
        cols,
        pg: {
          desc: index.comment,
          storageParameters: index.storageParameters
            ? index.storageParameters.join(",")
            : "",
          ...this.defaultEmptyString("expression", index.expression),
          ...this.defaultEmptyString("tablespace", index.tablespace)
        },
        algorithm: index.using ? index.using : ""
      };
    });
  }

  private getTableAfterScript(item: PgTableMetadata): string {
    const partitionedTables = item.partitions;
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
          )} ${con.definition.trim()};`
      );
    const constraintComments = item.constraints
      .filter((con): boolean => !!con.comment && con.type !== "f")
      .map(
        (con) =>
          `COMMENT ON CONSTRAINT ${this.quotation.quoteIdentifier(
            con.name
          )} ON ${this.quotation.quoteIdentifier(item.name)} IS '${
            con.comment
          }';`
      );
    return `${constraintDefinition
      .concat(constraintComments)
      .concat(partitionedTables)
      .join("\n")}`;
  }

  private convertConstraintsMetadata(
    item: PgTableMetadata,
    tablesMetadata: PgTablesMetadata
  ): Key[] {
    const constraints = item.constraints.filter(
      (con) => con.type === "p" || con.type === "u"
    );
    const result = constraints.map((con): Key => {
      return {
        id: con.id,
        isPk: con.type === "p",
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
              con.type === "p"
            );
            return {
              id,
              colid: col ? col.id : ""
            };
          })
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
        cols: []
      });
    }
    return result;
  }

  private getTableRelations(
    tablesMetadata: PgTablesMetadata,
    checkedTable: PgTableMetadata
  ): string[] {
    const checkParentChild = (currentConstraint: PgConstraintMetadata) =>
      currentConstraint.type === "f" &&
      (currentConstraint.foreigntable === checkedTable.name ||
        currentConstraint.table === checkedTable.name) &&
      !this.isPartitionRelation(
        this.findTable(
          tablesMetadata,
          currentConstraint.schema,
          currentConstraint.table
        ),
        this.findTable(
          tablesMetadata,
          currentConstraint.foreignschema,
          currentConstraint.foreigntable
        )
      );
    const checkParentChildExistance = (
      currentTable: PgTableMetadata
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
    tableMetadata: PgTableMetadata,
    colname: string
  ): PgConstraintMetadata | undefined {
    return tableMetadata.constraints
      .filter((c) => c.type === "f")
      .find((c) => c.columns.find((concolname) => concolname === colname));
  }

  private getTypeName(
    tableMetadata: PgTableMetadata,
    columnMetadata: PgColumnMetadata
  ): { datatype: string; isUserDataType: boolean } {
    if (this.isSerial(tableMetadata, columnMetadata)) {
      switch (columnMetadata.datatype) {
        case "bigint":
          return { datatype: "bigserial", isUserDataType: false };
        case "integer":
          return { datatype: "serial", isUserDataType: false };
        case "smallint":
          return { datatype: "smallserial", isUserDataType: false };
        default:
          return { datatype: columnMetadata.datatype, isUserDataType: false };
      }
    }

    const lbpos = columnMetadata.datatype.indexOf("(");
    if (lbpos > 0) {
      return {
        datatype: columnMetadata.datatype.split("(")[0].trim(),
        isUserDataType: false
      };
    }
    const datatypename = columnMetadata.datatype.replace("[]", "");
    const parsedId = this.identifierParser.parseIdentifier(
      datatypename,
      tableMetadata.schema
    );
    const userTypeId = this.userDataTypeRegistry.find(parsedId);
    if (userTypeId) {
      return { datatype: userTypeId, isUserDataType: true };
    }
    return { datatype: datatypename, isUserDataType: false };
  }

  private getParamName(datatype: string) {
    const lbpos = datatype.indexOf("(");
    const rbpos = datatype.indexOf(")");

    if (lbpos > 0) {
      return datatype.substring(lbpos + 1, rbpos);
    }
    return "";
  }

  private isSerial(
    tableMetadata: PgTableMetadata,
    columnMetadata: PgColumnMetadata
  ) {
    const quotedSchemaName = this.quotation.quoteIdentifier(
      tableMetadata.schema
    );
    const quotedSequenceName = this.quotation.quoteIdentifier(
      `${tableMetadata.name}_${columnMetadata.name}_seq`
    );
    return (
      columnMetadata.defaultvalue ===
        `nextval('${quotedSequenceName}'::regclass)` ||
      columnMetadata.defaultvalue ===
        `nextval('${quotedSchemaName}.${quotedSequenceName}'::regclass)`
    );
  }

  private getDefaultValue(
    tableMetadata: PgTableMetadata,
    columnMetadata: PgColumnMetadata,
    datatype: string
  ) {
    if (this.isSerial(tableMetadata, columnMetadata)) {
      return ``;
    }

    return columnMetadata.generated ? `` : columnMetadata.defaultvalue;
  }

  private convertCompositeColumnsMetadata(
    tableMetadata: PgTableMetadata
  ): Column[] {
    return Array.from(tableMetadata.columns.values()).map(
      (columnMetadata): Column => {
        const datatypeWrapper = this.getTypeName(tableMetadata, columnMetadata);
        const datatype = datatypeWrapper.datatype;
        if (datatypeWrapper.isUserDataType) {
          this.dependenciesRegistry.registerDependencies(
            datatype,
            columnMetadata.datatype,
            tableMetadata.id,
            tableMetadata.name
          );
        }
        return {
          id: columnMetadata.id,
          pk: false,
          name: columnMetadata.name,
          datatype,
          param: this.getParamName(columnMetadata.datatype),
          nn: false,
          ...this.defaultEmptyString("comment", columnMetadata.comment),
          defaultvalue: "",
          after: "",
          list: columnMetadata.dimensions > 0,
          ...this.skipFalse("json", columnMetadata.json),
          pg: { generatedIdentity: "no" },
          ...this.getDefaultColumnProperties(),
          estimatedSize: columnMetadata.estimatedSize,
          data: columnMetadata.data
        };
      }
    );
  }
  private convertColumnsMetadata(tableMetadata: PgTableMetadata): Column[] {
    return Array.from(tableMetadata.columns.values()).map(
      (columnMetadata): Column => {
        const rel = this.getFK(tableMetadata, columnMetadata.name);
        const datatypeWrapper = this.getTypeName(tableMetadata, columnMetadata);
        if (this.isSerial(tableMetadata, columnMetadata)) {
          this.sequenceRegistry.suppressSequence(
            tableMetadata.schema,
            tableMetadata.name,
            columnMetadata.name
          );
        }
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
          ...this.defaultEmptyString(
            "param",
            this.getParamName(columnMetadata.datatype)
          ),
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
          pg: {
            generatedIdentity: columnMetadata.generatedIdentity,
            generated: columnMetadata.generated
            //...this.skipZero("dimensions", columnMetadata.dimensions)
          },
          list: columnMetadata.dimensions > 0,
          json: columnMetadata.json,
          data: columnMetadata.data,
          estimatedSize: columnMetadata.estimatedSize
        };
      }
    );
  }
  private isPK(item: PgTableMetadata, col: PgColumnMetadata): boolean {
    const pkCons = item.constraints.filter(
      (currentConstraints) =>
        currentConstraints.type === "p" &&
        currentConstraints.columns.find((concol) => concol === col.name)
    );
    return pkCons.length !== 0;
  }

  private getColumnAfter(item: PgTableMetadata, col: PgColumnMetadata): string {
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
          }`
      );

    if (col.generated) {
      constraintDefinition.push(
        `GENERATED ALWAYS AS ${col.defaultvalue} STORED`
      );
    }
    return constraintDefinition.join("\n");
  }

  private getDefaultColumnProperties(): any {
    return {
      data: ""
    };
  }

  private getDefaultTableProperties(item: PgTableMetadata): any {
    return {
      lines: [],
      embeddable: item.embeddable,
      objectType: item.objectType,
      generate: true,
      generateCustomCode: true,
      pg: {
        tablespace: "",
        inherits: "",
        storageParameters: "",
        partition: ""
      }
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

  private defaultEmptyArray(name: string, value: any): any {
    if (value === undefined || value === null) {
      return { [name]: [] };
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
