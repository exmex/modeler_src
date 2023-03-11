import { DependenciesRegistry, SQLHandledConnection } from "re";
import { OtherObjects, Tables } from "common";

import { MSSQLFeatures } from "../../MSSQLFeatures";
import _ from "lodash";

export class MSSQLDependencyResolver {
  constructor(
    private connection: SQLHandledConnection<MSSQLFeatures>,
    private dependencyRegistry: DependenciesRegistry
  ) {}

  async resolve(tables: Tables, otherObjects: OtherObjects) {
    const query = `select
    schema_name(referencing.schema_id) _child_schema,
    referencing.name _child_name, 
    referencing.type_desc _child_type,
    schema_name(referenced.schema_id) _parent_schema, 
    referenced.name _parent_name,
    referenced.type_desc _parent_type
    from sys.sql_expression_dependencies sd
    join sys.all_objects referenced on referenced.object_id  = sd.referenced_id  
    join sys.all_objects referencing on referencing.object_id = sd.referencing_id 
    where referencing.type <> 'C' and referenced.type <> 'C'`;

    const queryResultRaw = await this.connection.query(query, []);
    queryResultRaw.forEach(
      (row: {
        _child_schema: string;
        _child_name: string;
        _child_type: string;
        _parent_schema: string;
        _parent_name: string;
        _parent_type: string;
      }) => {
        const parentId = this.getIdByName(
          tables,
          otherObjects,
          row._parent_schema,
          row._parent_name
        );
        const childId = this.getIdByName(
          tables,
          otherObjects,
          row._child_schema,
          row._child_name
        );
        if (parentId && childId) {
          this.dependencyRegistry.registerDependencies(
            parentId,
            row._parent_name,
            childId,
            row._child_name
          );
        }
      }
    );
  }

  getIdByName(
    tables: Tables,
    otherObjects: OtherObjects,
    schema: string,
    name: string
  ): string | undefined {
    const foundObj =
      _.find(tables, (item) => {
        return item.name === name && item.mssql.schema === schema;
      }) ??
      _.find(otherObjects, (item) => {
        return item.name === name && item.mssql.schema === schema;
      });
    return foundObj?.id;
  }
}
