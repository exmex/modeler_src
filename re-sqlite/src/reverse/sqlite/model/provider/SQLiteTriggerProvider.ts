import { OtherObject } from "common";
import { SourceMetadata } from "./SourceMetadata";
import { SourceProvider } from "./SourceProvider";

export class SQLiteTriggerProvider extends SourceProvider<SourceMetadata> {
  protected createObject(object: SourceMetadata): OtherObject {
    const schema = "";
    const name = object._name;
    const type = "Trigger";
    const id = this.knownIdRegistry.getOtherObjectId(schema, name, type);
    return {
      id,
      visible: true,
      name: object._name,
      desc: "",
      type,
      code: `${object._code};\n`,
      lines: [],
      generate: true,
      generateCustomCode: true
    };
  }

  protected getQuery(): string {
    return `select name _name, sql _code from sqlite_master where type = 'trigger'`;
  }

  protected getParameters(): any {
    return [];
  }
}
