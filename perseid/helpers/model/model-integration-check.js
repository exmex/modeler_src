import {
  ColumnPlatformPropertyRule,
  DomainConstraintPlatformPropertyRule,
  DomainPlatformPropertyRule,
  IndexColumnPlatformPropertyRule,
  IndexPlatformPropertyRule,
  JsonCodeSettingsRule,
  MissingOrderRule,
  ModelAutoGenerationPropertyRule,
  ModelPlatformPropertyRule,
  OtherObjectPlatformPropertyRule,
  SQLSettingsIncludeGeneratedNamesRule,
  SQLSettingsRule,
  TableNoPrimaryKeyRule,
  TablePlatformPropertyRule
} from "./model-integration-check-platform-rules";
import {
  DiagramItemsAutoExpandMissingPropertyRule,
  DiagramItemsResizedMissingPropertyRule,
  FKColumnWithoutRelationRule,
  IndexColReferenceRule,
  KeyColReferenceRule,
  LineEndpointReferenceRule,
  LineGenerateRule,
  ModelWriteFileParamRule,
  NoteLineReferenceRule,
  NoteMainDiagramRule,
  OtherObjectGenerateCustomCodeRule,
  OtherObjectGenerateRule,
  OtherObjectLineReferenceRule,
  OtherObjectMainDiagramRule,
  ProjectCardinalityRule,
  ProjectDescriptionRule,
  ProjectEmbeddedInParentsRule,
  ProjectSchemaContainerRule,
  RelationCardinalityTypeRule,
  RelationGenerateCustomCodeRule,
  RelationGenerateRule,
  RelationKeyCompatibilityRule,
  RelationTableReferenceRule,
  TableEstimatedSizeRule,
  TableGenerateCustomCodeRule,
  TableGenerateRule,
  TableLineReferenceRule,
  TableMainDiagramRule,
  TableRelationReferenceRule
} from "./model-integration-check-rules";

import { ModelTypes } from "../../enums/enums";

export class ModelIntegrationCheckBuilder {
  constructor(model) {
    this.model = model;
  }

  build() {
    return new ModelIntegrationCheck(this.model, [
      new ProjectDescriptionRule(),
      new KeyColReferenceRule(),
      new IndexColReferenceRule(),
      new LineEndpointReferenceRule(),
      new TableLineReferenceRule(),
      new NoteLineReferenceRule(),
      new OtherObjectLineReferenceRule(),
      new RelationTableReferenceRule(),
      new TableRelationReferenceRule(),
      new RelationKeyCompatibilityRule(),
      new FKColumnWithoutRelationRule(),
      new DiagramItemsAutoExpandMissingPropertyRule(),
      new DiagramItemsResizedMissingPropertyRule(),
      new TableMainDiagramRule(),
      new NoteMainDiagramRule(),
      new OtherObjectMainDiagramRule(),
      new TableGenerateRule(),
      new TableEstimatedSizeRule(),
      new ModelWriteFileParamRule(),
      new RelationGenerateRule(),
      new LineGenerateRule(),
      new OtherObjectGenerateRule(),
      new TableGenerateCustomCodeRule(),
      new RelationGenerateCustomCodeRule(),
      new OtherObjectGenerateCustomCodeRule(),
      new TablePlatformPropertyRule([ModelTypes.PG, ModelTypes.SQLITE]),
      new ModelAutoGenerationPropertyRule([ModelTypes.PG]),
      new ColumnPlatformPropertyRule([ModelTypes.PG, ModelTypes.SQLITE]),
      new IndexPlatformPropertyRule([ModelTypes.PG, ModelTypes.SQLITE]),
      new IndexColumnPlatformPropertyRule([ModelTypes.PG, ModelTypes.SQLITE]),
      new ModelPlatformPropertyRule([ModelTypes.PG]),
      new OtherObjectPlatformPropertyRule([ModelTypes.PG]),
      new DomainPlatformPropertyRule([ModelTypes.PG]),
      new DomainConstraintPlatformPropertyRule([ModelTypes.PG]),
      new ProjectSchemaContainerRule(),
      new ProjectEmbeddedInParentsRule(),
      new JsonCodeSettingsRule([
        ModelTypes.JSONSCHEMA,
        ModelTypes.FULLJSON,
        ModelTypes.OPENAPI
      ]),
      new SQLSettingsRule([
        ModelTypes.PG,
        ModelTypes.SQLITE,
        ModelTypes.MYSQL,
        ModelTypes.MARIADB
      ]),
      new SQLSettingsIncludeGeneratedNamesRule([ModelTypes.PG]),
      new MissingOrderRule([
        ModelTypes.PG,
        ModelTypes.SQLITE,
        ModelTypes.MYSQL,
        ModelTypes.MARIADB
      ]),
      new RelationCardinalityTypeRule(),
      new ProjectCardinalityRule(),
      new TableNoPrimaryKeyRule([
        ModelTypes.PG,
        ModelTypes.SQLITE,
        ModelTypes.MYSQL,
        ModelTypes.MARIADB,
        ModelTypes.GRAPHQL,
        ModelTypes.JSON,
        ModelTypes.MARIADB,
        ModelTypes.MONGODB,
        ModelTypes.MONGOOSE,
        ModelTypes.MYSQL,
        ModelTypes.SEQUELIZE,
        ModelTypes.SQLITE,
        ModelTypes.LOGICAL
      ])
    ]);
  }
}
export class ModelIntegrationCheck {
  constructor(model, rules) {
    this.model = model;
    this.rules = rules;
  }

  check() {
    return this.rules
      .map((rule) => {
        try {
          return rule.apply(this.model);
        } catch (e) {
          console.log(e);
          return [];
        }
      })
      .reduce((r, i) => [...r, ...i], []);
  }

  fix(checkResults) {
    if (checkResults.length > 0) {
      if (process.env.NODE_ENV !== "test") {
        console.log(`Total model problems: ${checkResults.length}`);
      }
    }
    return checkResults.reduce((result, item) => {
      if (process.env.NODE_ENV !== "test") {
        console.log(`\t${item.getTitle()}`);
      }
      return item.fix(result);
    }, this.model);
  }
}
