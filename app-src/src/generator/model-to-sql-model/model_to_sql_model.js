import { ModelTypes } from "../../enums/enums";
import { ToSQLModel } from "./to_sql_model";
import { getOrderedObjects } from "../../selectors/selector_order";

const KEYWORDS = {
  SET: `SET`,
  CHECK_FUNCTION_BODIES: `check_function_bodies`,
  EQUALS: `=`,
  FALSE: `false`
};

export class ModelToSQLModel extends ToSQLModel {
  convert() {
    return this.sb.statements(
      ...this.initGenerationScript(),
      ...(this.generatorOptions?.onlyActiveDiagram
        ? []
        : [
          this.sb.statement(
            this.sb.code(this.finder.model.model.beforeScript)
          )
        ]),
      ...this.getOrderedModelItemsStatements().reduce(this.removeSubArray, []),
      ...(this.generatorOptions?.onlyActiveDiagram
        ? []
        : [
          this.sb.statement(this.sb.code(this.finder.model.model.afterScript))
        ])
    );
  }

  initGenerationScript() {
    return this.finder.model.model.type === ModelTypes.PG
      ? [
        this.sb.statement(
          this.sb.keyword(KEYWORDS.SET),
          this.sb.literal(KEYWORDS.CHECK_FUNCTION_BODIES),
          this.sb.literal(KEYWORDS.EQUALS),
          this.sb.literal(KEYWORDS.FALSE),
          this.sb.statementDelimiterNewLine()
        )
      ]
      : [];
  }

  isOnDiagram(obj, type) {
    const tables = this.finder.model.diagramTables;
    const otherObjects = this.finder.model.diagramOtherObjects;
    const diagramNotes = this.finder.model.diagramNotes;
    switch (type) {
      case "table":
        return !!tables[obj.id];
      case "other_object":
        return !!otherObjects[obj.id];
      case "relation":
        return !!tables[obj.parent] && !!tables[obj.child];
      case "line":
        return (
          (!!tables[obj.parent] ||
            !!otherObjects[obj.parent] ||
            !!diagramNotes[obj.parent]) &&
          (!!tables[obj.child] ||
            !!otherObjects[obj.child] ||
            !!diagramNotes[obj.child])
        );
      default:
        return false;
    }
  }

  getOrderedModelItemsStatements() {
    const orderedObjects = getOrderedObjects(this.finder.model.model.type)(
      this.finder.model
    );
    const filteredObjects = this.generatorOptions?.onlyActiveDiagram
      ? orderedObjects.filter((item) => {
        const type = this.finder.objectAndTypeById(item.id);
        return this.isOnDiagram(type.obj, type.type);
      })
      : orderedObjects;

    return filteredObjects.map((item) => {
      const type = this.finder.objectAndTypeById(item.id);
      const toSQLModel = this.finder.createToSQLModel(
        this.sb,
        this.generatorOptions,
        item,
        type
      );
      return toSQLModel.convert()?.nestedItems ?? [];
    });
  }

  removeSubArray(r, i) {
    return [...r, ...i];
  }
}
