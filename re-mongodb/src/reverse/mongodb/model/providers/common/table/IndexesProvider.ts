import { Collection } from "../../../../../../db/mongodb/MongoDBHandledConnection";
import { Index } from "common";
import { v4 as uuidv4 } from "uuid";

const INDENT = "  ";
export class IndexesProvider {
  constructor(private document: Collection) {}

  private getFields(index: any) {
    const fields = JSON.stringify(index.key, null, INDENT);
    return fields === "{}" ? "" : fields;
  }

  private getOptions(index: any) {
    const options = JSON.stringify(
      Object.keys(index).reduce((newObj, key) => {
        if (key !== "v" && key !== "key" && key !== "name")
          newObj[key] = index[key];
        return newObj;
      }, {} as any),
      null,
      INDENT
    );
    return options === "{}" ? "" : options;
  }

  public provide(): Index[] {
    return this.document.indexes.map((index) => {
      const fields = this.getFields(index);
      const options = this.getOptions(index);

      if (fields === "{}") return;
      return {
        name: index.name,
        cols: [],
        algorithm: "na",
        fulltext: false,
        id: uuidv4(),
        lockoption: "na",
        unique: false,
        mongodb: {
          fields,
          options
        }
      };
    });
  }
}
