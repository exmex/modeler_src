import { KnownIdRegistry, ReverseOptions } from "re";
import { OtherObject, OtherObjectTypes } from "common";

import { MSSQLFeatures } from "../../MSSQLFeatures";
import { MSSQLUserDefinedTypeMetadata } from "../metadata/MSSQLUserDefinedTypeMetadata";
import { MSSQLUserDefinedTypeRegistry } from "../../MSSQLUserDefinedTypeRegistry";
import { SQLHandledConnection } from "re";
import { SourceGenerator } from "../generator/SourceGenerator";
import { SourceMetadata } from "./SourceMetadata";
import { SourceProvider } from "./SourceProvider";

export class MSSQLUserDefinedTypeProvider extends SourceProvider<MSSQLUserDefinedTypeMetadata> {
  public constructor(
    connection: SQLHandledConnection<MSSQLFeatures>,
    generator: SourceGenerator<SourceMetadata>,
    knownIdRegistry: KnownIdRegistry,
    private userDefinedTypeRegistry: MSSQLUserDefinedTypeRegistry,
    private reverseOptions: ReverseOptions
  ) {
    super(connection, generator, knownIdRegistry);
  }

  protected createObject(object: MSSQLUserDefinedTypeMetadata): OtherObject {
    const schema = object._schema;
    const name = object._name;
    const type = OtherObjectTypes.UserDefinedType;
    const id = this.knownIdRegistry.getOtherObjectId(schema, name, type);
    this.userDefinedTypeRegistry.register({ scope: schema, name }, id);
    return {
      id,
      visible: true,
      name: object._name,
      desc: object._comment ? object._comment : "",
      type,
      lines: [] as string[],
      code: "",
      mssql: {
        schema: object._schema,
        udt: {
          isNotNull: !object._is_nullable,
          baseType: object._original_name,
          params: object._params,
          asTable: "",
          externalName: ""
        }
      },
      generate: true,
      generateCustomCode: true
    };
  }

  protected getQuery(): string {
    return `select 
      schema_name(udt.schema_id) _schema,
      udt.name _name, 
      schema_name(st.schema_id) _original_schema,
      st.name _original_name,
            CASE 
              WHEN st.[name] IN ('varchar', 'char', 'varbinary') THEN IIF(st.max_length = -1, 'max', CAST(st.max_length AS VARCHAR(25))) 
              WHEN st.[name] IN ('nvarchar','nchar') THEN IIF(st.max_length = -1, 'max', CAST(st.max_length / 2 AS VARCHAR(25)))      
              WHEN st.[name] IN ('decimal', 'numeric') THEN CAST(st.[precision] AS VARCHAR(25)) + ',' + CAST(st.[scale] AS VARCHAR(25))
              WHEN st.[name] IN ('binary', 'varbinary' ) THEN CAST(st.[max_length] AS VARCHAR(25))
              WHEN st.[name] IN ('datetime2', 'datetimeoffset', 'time' ) THEN CAST(st.[scale] AS VARCHAR(25))
              ELSE null
            END _params,
      udt.is_nullable _is_nullable
      from sys.types udt 
      join sys.types st on udt.system_type_id = st.system_type_id and st.user_type_id = udt.system_type_id and udt.system_type_id <> udt.user_type_id
      where udt.is_user_defined = 1;`;
  }

  protected getParameters(): any {
    return [];
  }
}
