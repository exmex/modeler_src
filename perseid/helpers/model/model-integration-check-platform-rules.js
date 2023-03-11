import {
  ColumnIterator,
  IndexColIterator,
  IndexIterator,
  RootObjectIterator
} from "./model-integration-check-util";
import {
  ColumnPlatformPropertyProblem,
  DomainConstraintPlatformPropertyProblem,
  DomainPlatformPropertyProblem,
  IndexColumnPlatformPropertyProblem,
  IndexPlatformPropertyProblem,
  JsonCodeSettingsProblem,
  MissingOrderProblem,
  ModelAutoGenerationPropertyProblem,
  ModelPlatformPropertyProblem,
  OtherObjectPlatformPropertyProblem,
  SQLSettingsIncludeGeneratednamesProblem,
  SQLSettingsProblem,
  TableNoPrimaryKeyProblem,
  TablePlatformPropertyProblem
} from "./model-integration-check-platform-problems";

import { Rule } from "./model-integration-check-rules";
import _ from "lodash";

class PlatformRule extends Rule {
  constructor(platforms) {
    super();
    this.platforms = platforms;
  }

  apply(model) {
    const type = model.model && model.model.type;
    return this.platforms.includes(type)
      ? this.platformRuleProblems(model)
      : [];
  }

  platformRuleProblems(model) {
    return [];
  }

  getPlatformProperty(type) {
    switch (type) {
      case "PG":
        return "pg";
      case "SQLITE":
        return "sqlite";
      default:
        return undefined;
    }
  }
}

export class OtherObjectPlatformPropertyRule extends PlatformRule {
  platformRuleProblems(model) {
    const type = model.model.type;
    const platformProperty = this.getPlatformProperty(type);
    return new RootObjectIterator(model, "otherObjects")
      .iterate()
      .filter(
        (otherObject) =>
          !!platformProperty && otherObject[platformProperty] === undefined
      )
      .map(
        (otherObject) =>
          new OtherObjectPlatformPropertyProblem(
            otherObject.id,
            platformProperty
          )
      );
  }
}

export class ModelPlatformPropertyRule extends PlatformRule {
  platformRuleProblems(model) {
    const type = model.model.type;
    return model.model[this.getPlatformProperty(type)] === undefined
      ? [new ModelPlatformPropertyProblem(this.getPlatformProperty(type))]
      : [];
  }
}

export class TablePlatformPropertyRule extends PlatformRule {
  platformRuleProblems(model) {
    const type = model.model.type;
    const platformProperty = this.getPlatformProperty(type);
    return new RootObjectIterator(model, "tables")
      .iterate()
      .filter(
        (table) =>
          !!platformProperty &&
          !table.embeddable &&
          table[platformProperty] === undefined
      )
      .map(
        (table) => new TablePlatformPropertyProblem(table.id, platformProperty)
      );
  }
}

export class ModelAutoGenerationPropertyRule extends PlatformRule {
  platformRuleProblems(model) {
    return !model.model.nameAutoGeneration
      ? [new ModelAutoGenerationPropertyProblem()]
      : [];
  }
}

export class ColumnPlatformPropertyRule extends PlatformRule {
  platformRuleProblems(model) {
    const type = model.model.type;
    const platformProperty = this.getPlatformProperty(type);
    return new ColumnIterator(new RootObjectIterator(model, "tables"))
      .iterate()
      .filter(
        (columnTuple) =>
          !!platformProperty &&
          !columnTuple.table.embeddable &&
          columnTuple.col[platformProperty] === undefined
      )
      .map(
        (columnTuple) =>
          new ColumnPlatformPropertyProblem(
            columnTuple.table.id,
            columnTuple.col.id,
            platformProperty
          )
      );
  }
}

export class IndexPlatformPropertyRule extends PlatformRule {
  platformRuleProblems(model) {
    const type = model.model.type;
    const platformProperty = this.getPlatformProperty(type);
    return new IndexIterator(new RootObjectIterator(model, "tables"))
      .iterate()
      .filter(
        (indexTuple) =>
          !!platformProperty && indexTuple.key[platformProperty] === undefined
      )
      .map(
        (indexTuple) =>
          new IndexPlatformPropertyProblem(
            indexTuple.table.id,
            indexTuple.key.id,
            platformProperty
          )
      );
  }
}

export class IndexColumnPlatformPropertyRule extends PlatformRule {
  platformRuleProblems(model) {
    const type = model.model.type;
    const platformProperty = this.getPlatformProperty(type);
    return new IndexColIterator(
      new IndexIterator(new RootObjectIterator(model, "tables"))
    )
      .iterate()
      .filter(
        (indexColTuple) =>
          !!platformProperty &&
          indexColTuple.key[platformProperty] === undefined
      )
      .map(
        (indexColTuple) =>
          new IndexColumnPlatformPropertyProblem(
            indexColTuple.table.id,
            indexColTuple.key.id,
            indexColTuple.keycol.colid,
            platformProperty
          )
      );
  }
}

export class DomainPlatformPropertyRule extends PlatformRule {
  platformRuleProblems(model) {
    const type = model.model.type;
    const platformProperty = this.getPlatformProperty(type);
    return new RootObjectIterator(model, "otherObjects")
      .iterate()
      .filter(
        (otherObject) =>
          !!platformProperty &&
          otherObject.type === "Domain" &&
          otherObject[platformProperty] === undefined
      )
      .map(
        (otherObject) =>
          new DomainPlatformPropertyProblem(otherObject.id, platformProperty)
      );
  }
}

export class DomainConstraintPlatformPropertyRule extends PlatformRule {
  platformRuleProblems(model) {
    const type = model.model.type;
    const platformProperty = this.getPlatformProperty(type);
    return new RootObjectIterator(model, "otherObjects")
      .iterate()
      .filter(
        (otherObject) =>
          !!platformProperty &&
          otherObject.type === "Domain" &&
          otherObject[platformProperty] &&
          (otherObject[platformProperty].domain.constraint_name ||
            otherObject[platformProperty].domain.constraint)
      )
      .map(
        (otherObject) =>
          new DomainConstraintPlatformPropertyProblem(
            otherObject.id,
            platformProperty
          )
      );
  }
}

export class SQLSettingsRule extends PlatformRule {
  platformRuleProblems(model) {
    return model.model.sqlSettings === undefined
      ? [new SQLSettingsProblem()]
      : [];
  }
}

export class SQLSettingsIncludeGeneratedNamesRule extends PlatformRule {
  platformRuleProblems(model) {
    return model.model.sqlSettings.includeGeneratedNames === undefined
      ? [new SQLSettingsIncludeGeneratednamesProblem()]
      : [];
  }
}

export class JsonCodeSettingsRule extends PlatformRule {
  platformRuleProblems(model) {
    return !_.isObject(model.model.jsonCodeSettings)
      ? [new JsonCodeSettingsProblem()]
      : [];
  }
}

export class MissingOrderRule extends PlatformRule {
  platformRuleProblems(model) {
    const count = _.size(model.tables) + _.size(model.otherObjects);
    return count > 0 && (model.order === undefined || model.order === [])
      ? [new MissingOrderProblem()]
      : [];
  }
}

export class TableNoPrimaryKeyRule extends PlatformRule {
  platformRuleProblems(model) {
    const tables = new RootObjectIterator(model, "tables").iterate();
    return tables
      .filter((table) => !table.keys.find((key) => key.isPk))
      .map((table) => new TableNoPrimaryKeyProblem(table.id));
  }
}
