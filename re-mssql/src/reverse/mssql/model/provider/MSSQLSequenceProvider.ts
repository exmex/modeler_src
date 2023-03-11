import { MSSQLSequenceMetadata } from "../metadata/MSSQLSequenceMetadata";
import { OtherObject } from "common";
import { SourceProvider } from "./SourceProvider";

export class MSSQLSequenceProvider extends SourceProvider<MSSQLSequenceMetadata> {
  protected createObject(object: MSSQLSequenceMetadata): OtherObject {
    const schema = object._schema;
    const name = object._name;
    const type = "Sequence";
    const start = object._start;
    const increment = object._increment;
    const minValue = object._min;
    const maxValue = object._max;
    const isCycling = object._cycle;
    const cache = object._cache;
    const id = this.knownIdRegistry.getOtherObjectId(schema, name, type);
    return {
      id,
      visible: true,
      name: object._name,
      desc: object._comment ? object._comment : "",
      type,
      code: "",
      lines: [],
      mssql: {
        schema,
        sequence: {
          start,
          increment,
          minValue,
          maxValue,
          isCycling,
          ...(cache === null ? {} : { cache })
        }
      },
      generate: true,
      generateCustomCode: true
    };
  }

  protected getQuery(): string {
    return (
      `select\n` +
      `  SCHEMA_NAME(so.schema_id) _schema,\n` +
      `  so.name _name, \n` +
      `  p.value _comment, \n` +
      `  so.start_value _start,\n` +
      `  so.increment _increment,\n` +
      `  IIF(-9223372036854775808 = so.minimum_value, NULL, so.minimum_value) _min,\n` +
      `  IIF(so.maximum_value = so.maximum_value, NULL, so.maximum_value) _max,\n` +
      `  so.is_cycling _cycle,\n` +
      `  so.cache_size _cache\n` +
      `from sys.sequences so\n` +
      `left join sys.extended_properties p on p.major_id = so.object_id and p.class=1\n;`
    );
  }

  protected getParameters(): any {
    return [];
  }
}
