import {
  ColumnIterator,
  IndexColIterator,
  IndexIterator,
  KeyIterator,
  RootObjectIterator
} from "./model-integration-check-util";
import {
  ColumnPlatformPropertyProblem,
  ColumnRefPropertyProblem,
  CreateNestedTableCopyProblem,
  DiagramTypePlatformPropertyProblem,
  DomainConstraintPlatformPropertyProblem,
  DomainPlatformPropertyProblem,
  EliminateNestedDiagramItemsProblem,
  IndexColumnPlatformPropertyProblem,
  IndexPlatformPropertyProblem,
  JSONRemovalProblem,
  JsonCodeSettingsProblem,
  KeyPlatformPropertyProblem,
  MissingOrderProblem,
  ModelAutoGenerationPropertyProblem,
  ModelPlatformPropertyProblem,
  ModelerSchemaPropertiesExtraProblem,
  ModelerSchemaPropertiesMissingProblem,
  OtherObjectGraphicsRemovalProblem,
  OtherObjectPlatformPropertyProblem,
  ProjectDefaultEngineProblem,
  SQLSettingsIncludeGeneratednamesProblem,
  SQLSettingsProblem,
  TableEngineProblem,
  TableNoPrimaryKeyProblem,
  TablePlatformPropertyProblem
} from "./model-integration-check-platform-problems";
import { ModelTypes, getSubschema, pathToString } from "common";

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
      case "MSSQL":
        return "mssql";
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

export class DiagramTypePlatformPropertyRule extends PlatformRule {
  platformRuleProblems(model) {
    const diagramsWithoutType = new RootObjectIterator(model, "diagrams")
      .iterate()
      .filter((diagram) => diagram.type === undefined)
      .map((diagram) => diagram.id);
    if (diagramsWithoutType.length > 0) {
      return [new DiagramTypePlatformPropertyProblem(diagramsWithoutType)];
    }
    return [];
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

export class KeyPlatformPropertyRule extends PlatformRule {
  platformRuleProblems(model) {
    const type = model.model.type;
    const platformProperty = this.getPlatformProperty(type);
    return new KeyIterator(new RootObjectIterator(model, "tables"))
      .iterate()
      .filter(
        (keyTuple) =>
          !!platformProperty && keyTuple.key[platformProperty] === undefined
      )
      .map(
        (keyTuple) =>
          new KeyPlatformPropertyProblem(
            keyTuple.table.id,
            keyTuple.key.id,
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
    return count > 0 && (model.order === undefined || _.isEmpty(model.order))
      ? [new MissingOrderProblem()]
      : [];
  }
}

export class JSONRemovalRule extends PlatformRule {
  platformRuleProblems(model) {
    const count = _.size(
      _.filter(model.tables, (table) => {
        return table.embeddable;
      })
    );
    return count > 0 ? [new JSONRemovalProblem()] : [];
  }
}

export class OtherObjectGraphicsRemovalRule extends PlatformRule {
  platformRuleProblems(model) {
    const items = _.map(
      _.filter(model.otherObjects, (oo) => {
        return (
          !!oo.x ||
          !!oo.y ||
          !!oo.gHeight ||
          !!oo.gWidth ||
          !!oo.color ||
          !!oo.background ||
          !!oo.resized
        );
      }),
      (item) => item.id
    );

    return items.length > 0
      ? [new OtherObjectGraphicsRemovalProblem(items)]
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

export class TableEngineRule extends PlatformRule {
  platformRuleProblems(model) {
    const tables = new RootObjectIterator(model, "tables").iterate();
    return tables
      .filter((table) => table.tabletype === "na")
      .map((table) => new TableEngineProblem(table.id));
  }
}

export class ProjectDefaultEngineRule extends PlatformRule {
  platformRuleProblems(model) {
    return model.model.def_tabletype === "na"
      ? [new ProjectDefaultEngineProblem()]
      : [];
  }
}

export class CreateNestedTableCopyRule extends PlatformRule {
  getObjectType(model) {
    return model.model.type === ModelTypes.MONGOOSE ? "Object" : "object";
  }

  platformRuleProblems(model) {
    const tables = new RootObjectIterator(model, "tables").iterate();
    const embeddableTables = _.map(
      tables.filter((table) => table.embeddable),
      (table) => table.id
    );

    const tableColsToCopy = _.reduce(
      tables,
      (r, table) => [
        ...r,
        ..._.map(
          _.filter(table.cols, (col) => {
            return (
              !table.embeddable &&
              !!model.tables[col.datatype] &&
              embeddableTables.includes(col.datatype) &&
              ![this.getObjectType(model)].includes(
                model.tables[col.datatype].name
              )
            );
          }),
          (col) => ({ col, table })
        )
      ],
      []
    );

    return tableColsToCopy.length > 0
      ? [new CreateNestedTableCopyProblem(tableColsToCopy)]
      : [];
  }
}

export class EliminateNestedDiagramItemsRule extends PlatformRule {
  platformRuleProblems(model) {
    const tables = new RootObjectIterator(model, "tables").iterate();
    const embeddableIds = _.map(
      tables.filter((table) => table.embeddable),
      (table) => table.id
    );
    const result = _.reduce(
      model.diagrams,
      (r, diagram) => {
        const nestedReferencedIds = _.map(
          _.filter(diagram.diagramItems, (di) => {
            return (
              (!diagram.main && embeddableIds.includes(di.referencedItemId)) ||
              (diagram.main &&
                model.tables[di.referencedItemId]?.visible &&
                model.tables[di.referencedItemId]?.embeddable)
            );
          }),
          (di) => di.referencedItemId
        );
        if (_.size(nestedReferencedIds) > 0) {
          return { ...r, [diagram.id]: nestedReferencedIds };
        }
        return r;
      },
      {}
    );
    if (_.size(result) > 0) {
      return [new EliminateNestedDiagramItemsProblem(result)];
    }
    return [];
  }
}

export class ColumnRefPropertyRule extends PlatformRule {
  platformRuleProblems(model) {
    const tables = new RootObjectIterator(model, "tables").iterate();

    const colRefs = _.reduce(
      tables,
      (r, table) => [
        ...r,
        ..._.map(
          _.filter(table.cols, (col) => {
            return !!col.ref;
          }),
          (col) => ({ col, table })
        )
      ],
      []
    );

    return colRefs.length > 0 ? [new ColumnRefPropertyProblem(colRefs)] : [];
  }
}

export class ModelerSchemaPropertiesRule extends PlatformRule {
  getNodeAttributeProblems(instancePath, modelNode) {}

  isRequired(key, subschema) {
    return subschema?.required?.includes(key) ?? false;
  }

  isPlatformRequired(instancePath, modelType) {
    return getSubschema(pathToString(instancePath))?.["x-platforms"]?.includes(
      modelType
    );
  }

  isSourceModuleDefined(instancePath) {
    return !!getSubschema(pathToString(instancePath))?.["x-source-module"];
  }

  getValue(instancePath) {
    let result = undefined;
    const subschema = getSubschema(pathToString(instancePath));
    if (!!subschema.default) {
      result = subschema.default;
    } else if (subschema.type === "object") {
      result = {};
    } else if (subschema.type === "string") {
      result = "";
    } else if (subschema.type === "boolean") {
      result = false;
    } else if (subschema.type === "number") {
      result = -1;
    } else if (subschema.type === "array") {
      result = [];
    }
    return result;
  }

  getNodeProblems(instancePath, modelNode, modelType) {
    const result = [];
    const nodeSubschema = getSubschema(pathToString(instancePath));

    if (!_.isEmpty(nodeSubschema)) {
      if (nodeSubschema.type === "object" || nodeSubschema.type === "array") {
        const existingModelNodeKeys = _.keys(modelNode);
        result.push(
          ..._.reduce(
            existingModelNodeKeys,
            (r, existingModelNodeKey) => {
              const existingInnerInstancePath = [
                ...instancePath,
                existingModelNodeKey
              ];

              const prop =
                nodeSubschema.type === "array"
                  ? nodeSubschema?.items
                  : nodeSubschema?.properties?.[existingModelNodeKey];

              const existsAsSchemaProperty =
                !!prop &&
                (prop?.["x-platforms"] === undefined ||
                  prop?.["x-platforms"]?.includes(modelType));
              const existsAsSchemaPatternProperty =
                !!nodeSubschema?.patternProperties
                  ? !!_.find(
                      Object.keys(nodeSubschema.patternProperties),
                      (key) => {
                        return !!existingModelNodeKey?.match(new RegExp(key));
                      }
                    )
                  : false;

              const existingInnerModelNode = modelNode[existingModelNodeKey];
              if (
                existingInnerModelNode !== undefined &&
                !this.isSourceModuleDefined([
                  ...instancePath,
                  existingModelNodeKey
                ]) &&
                !existsAsSchemaProperty &&
                !existsAsSchemaPatternProperty
              ) {
                return [
                  ...r,
                  new ModelerSchemaPropertiesExtraProblem([
                    ...instancePath,
                    existingModelNodeKey
                  ])
                ];
              }
              return [
                ...r,
                ...(!this.isSourceModuleDefined([
                  ...instancePath,
                  existingModelNodeKey
                ])
                  ? this.getNodeProblems(
                      existingInnerInstancePath,
                      existingInnerModelNode,
                      modelType
                    )
                  : [])
              ];
            },
            []
          )
        );

        const allSchemaKeys = _.keys(nodeSubschema.properties);
        const onlyRequiredSchemaKeys = _.filter(
          allSchemaKeys,
          (allSchemaKey) => {
            const isRequired =
              this.isRequired(allSchemaKey, nodeSubschema) ||
              this.isPlatformRequired(
                [...instancePath, allSchemaKey],
                modelType
              );
            return (
              !existingModelNodeKeys.includes(allSchemaKey) &&
              isRequired &&
              !this.isSourceModuleDefined([...instancePath, allSchemaKey])
            );
          }
        );

        result.push(
          ..._.reduce(
            onlyRequiredSchemaKeys,
            (r, onlyRequiredSchemaKey) => {
              const value = this.getValue([
                ...instancePath,
                onlyRequiredSchemaKey
              ]);
              if (
                value !== undefined &&
                !this.isSourceModuleDefined([
                  ...instancePath,
                  onlyRequiredSchemaKey
                ])
              ) {
                const innerProblems = this.getNodeProblems(
                  [...instancePath, onlyRequiredSchemaKey],
                  undefined,
                  modelType
                );
                return [
                  ...r,
                  new ModelerSchemaPropertiesMissingProblem(
                    [...instancePath, onlyRequiredSchemaKey],
                    value
                  ),
                  ...innerProblems
                ];
              }
              return r;
            },
            []
          )
        );
      }
    }

    return result;
  }

  platformRuleProblems(model) {
    const problems = this.getNodeProblems([], model, model.model.type);
    return problems;
  }
}
