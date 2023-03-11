import {
  INCLUDE_SCHEMA_ALWAYS,
  INCLUDE_SCHEMA_WHEN_DIFFERS
} from "./model_to_lines";

import { ScopeType } from "../model-to-sql-model/sql_model_builder";

export class QualifiedIdentifierToLines {
  constructor(sqlModelToLines, item, defaultContainer) {
    this.sqlModelToLines = sqlModelToLines;
    this.item = item;
    this.identifierSeparator = ".";
    this.defaultContainer = defaultContainer;
    this.filterContainers = this.filterContainers.bind(this);
  }

  isContainer(nestedItem) {
    return nestedItem.scopeType === ScopeType.CONTAINER;
  }

  isAllowedToGenerate(nestedItem) {
    const includeSchemaAlways =
      this.sqlModelToLines.sqlSettings.includeSchema === INCLUDE_SCHEMA_ALWAYS;
    const includeSchemaWhenDiffers =
      this.sqlModelToLines.sqlSettings.includeSchema ===
      INCLUDE_SCHEMA_WHEN_DIFFERS;
    return (
      includeSchemaAlways ||
      (includeSchemaWhenDiffers && nestedItem.value !== this.defaultContainer)
    );
  }

  filterContainers(nestedItem) {
    return (
      (this.isContainer(nestedItem) && this.isAllowedToGenerate(nestedItem)) ||
      !this.isContainer(nestedItem)
    );
  }

  generateLines() {
    this.item.nestedItems.forEach(nestedItem =>
      this.sqlModelToLines.generateLines(nestedItem)
    );
    this.item.lines = [
      this.item.nestedItems
        .filter(this.filterContainers)
        .map(nestedItem => nestedItem.lines.join(this.identifierSeparator))
        .join(this.identifierSeparator)
    ];
    return this.item.lines;
  }
}
