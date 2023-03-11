import { CodeToSQLModel } from "./code_to_sql_model";
import { EmptyToSQLModel } from "./empty_to_sql_model";
import { RelationToSQLModel } from "./relation_to_sql_model";
import _ from "lodash";

export class Finder {
  constructor(model) {
    this.model = model;
  }

  objectAndTypeById(id) {
    if (this.model.otherObjects[id]) {
      return {
        obj: this.model.otherObjects[id],
        type: "other_object",
        objectType: _.upperFirst(this.model.otherObjects[id].type)
      };
    } else if (this.model.lines[id]) {
      return {
        obj: this.model.lines[id],
        type: "line",
        objectType: "Line"
      };
    } else if (this.model.relations[id]) {
      return {
        obj: this.model.relations[id],
        type: "relation",
        objectType: "Relation"
      };
    } else if (this.model.tables[id]) {
      return {
        obj: this.model.tables[id],
        type: "table",
        objectType: "Table"
      };
    }
    return undefined;
  }

  createToSQLModel(sb, generatorOptions, item, type) {
    if (type?.type === "relation") {
      return new RelationToSQLModel(sb, this, generatorOptions, item);
    }
    if (type?.type === "other_object" || type?.type === "line") {
      return new CodeToSQLModel(sb, this, generatorOptions, item);
    }
    return new EmptyToSQLModel();
  }
}
