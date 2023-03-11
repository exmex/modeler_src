import { MSSQLRoutineMetadata } from "../metadata/MSSQLRoutineMetadata";
import { OtherObject } from "common";
import { SourceProvider } from "./SourceProvider";

export class MSSQLRoutineProvider extends SourceProvider<MSSQLRoutineMetadata> {
  protected createObject(object: MSSQLRoutineMetadata): OtherObject {
    const schema = object._schema;
    const name = object._name;
    const type =
      object._type === "FN" ||
      object._type === "IF" ||
      object._type === "FS" ||
      object._type === "AF" ||
      object._type === "TF"
        ? "Function"
        : "Procedure";
    const id = this.knownIdRegistry.getOtherObjectId(schema, name, type);
    return {
      id,
      visible: true,
      name,
      desc: object._comment ? object._comment : "",
      type,
      code: object._code,
      lines: [] as string[],
      mssql: { schema },
      generate: true,
      generateCustomCode: true
    };
  }

  protected getQuery(): string {
    return ` SELECT
      SCHEMA_NAME(tb.schema_id) _schema,
      tb.name _name,
      p.value _comment,
      tb.type _type,
      STRING_AGG(CAST(sc.text as nvarchar(MAX)), ', ') _code
    FROM
    sys.objects tb
    JOIN sys.syscomments sc on sc.id = tb.object_id
    LEFT JOIN sys.extended_properties AS p ON p.major_id=sc.id AND p.class=1
    where tb.type in ('FN', 'P', 'IF', 'FS', 'AF', 'X', 'TF', 'PC')
    GROUP BY SCHEMA_NAME(tb.schema_id), tb.name, tb.name, p.value, tb.type, sc.colid
    ORDER BY sc.colid;`;
  }

  protected getParameters(): any {
    return [];
  }
}
