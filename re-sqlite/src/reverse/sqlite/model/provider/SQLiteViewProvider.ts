import { OtherObject } from "common";
import { SourceMetadata } from "./SourceMetadata";
import { SourceProvider } from "./SourceProvider";

export class SQLiteViewProvider extends SourceProvider<SourceMetadata> {
  protected createObject(object: SourceMetadata): OtherObject {
    const schema = "";
    const name = object._name;
    const type = "View";
    const id = this.knownIdRegistry.getOtherObjectId(schema, name, type);

    return {
      code: `${object._code};\n`,
      id,
      name: object._name,
      desc: "",
      lines: [],
      type,
      visible: true,
      generate: true,
      generateCustomCode: true
    };
  }

  protected getQuery(): string {
    return `select name _name, sql _code from sqlite_master where type = 'view'`;
  }

  protected getParameters(): any[] {
    return [];
  }
}
