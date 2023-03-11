import {
  MSSQLTableMetadata,
  MSSQLTablesMetadata
} from "../../model/metadata/MSSQLTableMetadata";

import { JSONRE } from "re-json";
import { KnownIdRegistry } from "re";
import { MSSQLCheckConstraintRE } from "../MSSQLCheckConstraintRE";
import { MSSQLColumnMetadata } from "../../model/metadata/MSSQLColumnMetadata";
import { MSSQLColumnRE } from "../MSSQLColumnRE";
import { MSSQLForeignKeyConstraintMetadata } from "../../model/metadata/MSSQLForeignKeyConstraintMetadata";
import { MSSQLForeignKeyConstraintRE } from "../MSSQLForeignKeyConstraintRE";
import { MSSQLIndexMetadata } from "../../model/metadata/MSSQLIndexMetadata";
import { MSSQLIndexRE } from "../MSSQLIndexRE";
import { MSSQLKeyConstraintMetadata } from "../../model/metadata/MSSQLKeyConstraintMetadata";
import { MSSQLKeyConstraintRE } from "../MSSQLKeyConstraintRE";
import { MSSQLTableRE } from "../MSSQLTableRE";
import { v4 as uuidv4 } from "uuid";

export class MSSQLTableRelationMetadataBuilder {
  constructor(
    private tableRE: MSSQLTableRE,
    private columnRE: MSSQLColumnRE,
    private keyConstraintRE: MSSQLKeyConstraintRE,
    private checkConstraintRE: MSSQLCheckConstraintRE,
    private foreignKeyConstraintRE: MSSQLForeignKeyConstraintRE,
    private indexRE: MSSQLIndexRE,
    private jsonRE: JSONRE,
    private knownIdRegistry: KnownIdRegistry
  ) {}

  public async build(): Promise<MSSQLTablesMetadata> {
    let tables: MSSQLTablesMetadata = {};
    tables = await this.reverseTables(tables);
    tables = await this.reverseColumns(tables);
    tables = await this.reverseKeyConstraints(tables);
    tables = await this.reverseCheckConstraints(tables);
    tables = await this.reverseForeignKeyConstraints(tables);
    tables = await this.reverseIndexes(tables);
    //tables = await this.reverseJSON(tables);
    return tables;
  }

  private async reverseTables(
    tables: MSSQLTablesMetadata
  ): Promise<MSSQLTablesMetadata> {
    const rows = await this.tableRE.reverse();
    rows.forEach((row) => {
      const schema = row._schema;
      const name = row._table;
      const originalTable = this.knownIdRegistry.getTable(
        schema,
        name,
        "table"
      );
      const id = originalTable?.id ?? uuidv4();
      const table: MSSQLTableMetadata = {
        id,
        name,
        embeddable: false,
        comment: row._comment,
        columns: [],
        indexes: new Map(),
        keyConstraints: new Map(),
        foreignKeyConstraints: new Map(),
        checkConstraints: [],
        schema,
        objectType: "table",
        estimatedSize: originalTable?.estimatedSize ?? "",
        visible: originalTable?.visible ?? true
      };
      tables[`${schema}.${name}`] = table;
    });
    return tables;
  }

  private async reverseColumns(
    tables: MSSQLTablesMetadata
  ): Promise<MSSQLTablesMetadata> {
    const rows = await this.columnRE.reverse();
    rows.forEach((row) => {
      const name = row._name;
      const originalTableColumn = this.knownIdRegistry.getTableColumn(
        row._schema,
        row._table,
        "table",
        name
      );
      const id = originalTableColumn?.id ?? uuidv4();
      const column: MSSQLColumnMetadata = {
        id,
        name: row._name,
        collation: row._collation_name,
        comment: row._comment,
        datatype: row._rawtype,
        datatypeSchema: row._rawtype_schema,
        defaultvalue: row._defaultvalue,
        identity: row._is_identity
          ? {
              seed_value: row._identity_seed_value,
              increment_value: row._identity_increment_value
            }
          : undefined,
        definition: row._definition,
        isPersisted: row._is_persisted,
        nn: row._is_nullable === false,
        pk: false,
        generated: false,
        json: false,
        data: originalTableColumn?.data ?? "",
        estimatedSize: originalTableColumn?.estimatedSize ?? "",
        param: row._param ?? "",
        isNotForReplication: row._is_not_for_replication
      };
      tables[`${row._schema}.${row._table}`].columns.push(column);
    });
    return tables;
  }

  private async reverseKeyConstraints(
    tables: MSSQLTablesMetadata
  ): Promise<MSSQLTablesMetadata> {
    const rows = await this.keyConstraintRE.reverse();
    rows.forEach((row) => {
      const schema = row._schema_name;
      const table = row._table_name;
      const name = row._constraint_name;

      const tableObj = tables[`${schema}.${table}`];
      if (!!tableObj) {
        const keyConstraintObj = tableObj.keyConstraints.get(name);
        if (!!keyConstraintObj) {
          keyConstraintObj.columns.push(row._column_name);
        } else {
          const originalKeyId = this.knownIdRegistry.getTableKeyId(
            schema,
            table,
            "table",
            name,
            row._is_primary_key
          );

          const id = originalKeyId ?? uuidv4();
          const constraint: MSSQLKeyConstraintMetadata = {
            id,
            name,
            schema,
            table,
            columns: [row._column_name],
            isPrimaryKey: row._is_primary_key,
            isUnique: row._is_unique,
            clustered: row._clustered === "CLUSTERED",
            comment: row._comment
          };
          tableObj.keyConstraints.set(name, constraint);
        }
      }
    });
    return tables;
  }

  private async reverseForeignKeyConstraints(
    tables: MSSQLTablesMetadata
  ): Promise<MSSQLTablesMetadata> {
    const rows = await this.foreignKeyConstraintRE.reverse();
    rows.forEach((row) => {
      const name = row._name;
      const parentSchema = row._parent_schema;
      const parentTable = row._parent_table;
      const childSchema = row._child_schema;
      const childTable = row._child_table;
      const parentColumn = row._parent_column;
      const childColumn = row._child_column;
      const deleteAction = row._delete_action;
      const updateAction = row._update_action;
      const comment = row._comment;

      const tableObj = tables[`${childSchema}.${childTable}`];
      if (!!tableObj) {
        const foreignKeyConstraintObj =
          tableObj.foreignKeyConstraints.get(name);
        if (!!foreignKeyConstraintObj) {
          foreignKeyConstraintObj.columns.push(childColumn);
          foreignKeyConstraintObj.foreigncolumns.push(parentColumn);
        } else {
          const originalKeyId = this.knownIdRegistry.getRelationId(
            parentSchema,
            parentTable,
            "table",
            childSchema,
            childTable,
            "table",
            name
          );

          const id = originalKeyId ?? uuidv4();
          const constraint: MSSQLForeignKeyConstraintMetadata = {
            id,
            name,
            schema: childSchema,
            table: childTable,
            columns: [childColumn],
            foreignschema: parentSchema,
            foreigntable: parentTable,
            foreigncolumns: [parentColumn],
            updatetype: updateAction,
            deletetype: deleteAction,
            c_cp: "",
            c_cch: "",
            comment
          };
          tableObj.foreignKeyConstraints.set(name, constraint);
        }
      }
    });
    return tables;
  }

  private async reverseCheckConstraints(
    tables: MSSQLTablesMetadata
  ): Promise<MSSQLTablesMetadata> {
    const rows = await this.checkConstraintRE.reverse();
    rows.forEach((row) => {
      tables[`${row._schema}.${row._table}`].checkConstraints.push({
        name: row._name,
        schema: row._schema,
        table: row._table,
        column: row._column,
        definition: row._definition,

        comment: row._comment
      });
    });
    return tables;
  }

  private getIndexType(type: string) {
    switch (type) {
      case "NONCLUSTERED COLUMNSTORE":
      case "CLUSTERED COLUMNSTORE":
        return "COLUMN STORED";
      case "XML":
        return "XML";
      case "SPATIAL":
        return "SPATIAL";
      case "FULLTEXT":
        return "FULLTEXT";
      default:
        return "RELATIONAL";
    }
  }

  private getIndexClustered(type: string) {
    return type.split(" ")?.[0] === "CLUSTERED";
  }

  private async reverseIndexes(
    tables: MSSQLTablesMetadata
  ): Promise<MSSQLTablesMetadata> {
    const rows = await this.indexRE.reverse();
    rows.forEach((row) => {
      const schema = row._schema;
      const table = row._table;
      const name = row._name;
      const type = row._type;
      const column_name = row._column_name;
      const column_desc = row._column_desc;
      const unique = row._unique;
      const comment = row._comment;
      const where = row._where === null ? undefined : row._where;
      const ds = row._ds;
      const is_ds_default = row._ds_is_default;
      const pathXMLIndex =
        row._using_xml_index === null ? undefined : row._using_xml_index;
      const primaryxml =
        row._primaryxml === "PRIMARY_XML"
          ? true
          : row._primaryxml === "SECONDARY_XML"
          ? false
          : undefined;
      const withClause = {
        isPadded: row._is_padded,
        fillFactor: row._fill_factor,
        ignoreDupKey: row._ignore_dup_key,
        noRecompute: row._no_recompute,
        allowRowLocks: row._allow_row_locks,
        allowPageLocks: row._allow_page_locks
      };

      const spatial = {
        tessellationScheme: row._tessellation_scheme,
        boundingBoxXmin: row._bounding_box_xmin,
        boundingBoxYmin: row._bounding_box_ymin,
        boundingBoxXmax: row._bounding_box_xmax,
        boundingBoxYmax: row._bounding_box_ymax,
        level1Grid: row._level_1_grid_desc,
        level2Grid: row._level_2_grid_desc,
        level3Grid: row._level_3_grid_desc,
        level4Grid: row._level_4_grid_desc,
        cellsPerObject: row._cells_per_object
      };

      const indexObj = tables[`${row._schema}.${row._table}`].indexes.get(name);
      if (!!indexObj) {
        const colId =
          this.knownIdRegistry.getTableIndexColumnId(
            schema,
            table,
            "table",
            name,
            column_name
          ) ?? uuidv4();
        indexObj.columns.push({
          id: colId,
          name: column_name,
          desc: column_desc === false ? undefined : column_desc
        });
      } else {
        const id = this.knownIdRegistry.getTableIndexId(
          schema,
          table,
          "table",
          name
        );
        const colId =
          this.knownIdRegistry.getTableIndexColumnId(
            schema,
            table,
            "table",
            name,
            column_name
          ) ?? uuidv4();
        const index: MSSQLIndexMetadata = {
          id,
          name,
          unique: unique,
          columns: [
            {
              id: colId,
              name: column_name,
              desc: column_desc === false ? undefined : column_desc
            }
          ],
          comment: comment,
          type: this.getIndexType(type),
          primaryxml,
          clustered: this.getIndexClustered(type),
          where,
          ds: is_ds_default ? undefined : ds,
          pathXMLIndex,
          with: withClause,
          spatial
        };
        tables[`${row._schema}.${row._table}`].indexes.set(name, index);
      }
    });
    return tables;
  }

  private async reverseJSON(
    tables: MSSQLTablesMetadata
  ): Promise<MSSQLTablesMetadata> {
    const commonTablesMetadata = await this.jsonRE.reverse(tables);

    const jsons = Object.keys(commonTablesMetadata)
      .map((key) => commonTablesMetadata[key])
      .map((common) => {
        const table = new MSSQLTableMetadata(
          common.id,
          common.name,
          common.embeddable,
          "",
          true,
          "",
          "",
          ""
        );
        table.columns = common.columns.map((i) => ({
          id: i.id,
          name: i.name,
          datatype: i.datatype,
          datatypeSchema: "",
          json: i.json,
          collation: "",
          comment: "",
          defaultvalue: "",
          dimensions: 0,
          generated: false,
          generatedIdentity: "",
          nn: false,
          pk: false,
          definition: "",
          isPersisted: false,
          isNotForReplication: false
        }));
        return table;
      })
      .reduce<MSSQLTablesMetadata>((r, i) => ({ ...r, [i.id]: i }), {});
    return { ...tables, ...jsons };
  }
}
