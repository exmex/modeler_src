import {
  ColumnIterator,
  DiagramItemIterator,
  IndexColIterator,
  IndexIterator,
  KeyColIterator,
  KeyIterator,
  LineEndpointFinder,
  RelationEndpointFinder,
  RootObjectIterator,
  TableColFinder
} from "./model-integration-check-util";
import {
  DiagramItemsAutoExpandMissingPropertyProblem,
  DiagramItemsMissingNoteProblem,
  DiagramItemsMissingOtherObjectProblem,
  DiagramItemsMissingTableProblem,
  DiagramItemsResizedMissingPropertyProblem,
  FKColumnWithoutRelationProblem,
  IndexColReferenceProblem,
  KeyColReferenceProblem,
  LineEndpointReferenceProblem,
  LineGenerateProblem,
  ModelWriteFileParamProblem,
  NoteLineReferenceProblem,
  OtherObjectGenerateCustomCodeProblem,
  OtherObjectGenerateProblem,
  OtherObjectLineReferenceProblem,
  ProjectAuthorNameProblem,
  ProjectCardinalityProblem,
  ProjectCompanyDetailsProblem,
  ProjectCompanyUrlProblem,
  ProjectCurrentDisplayModeProblem,
  ProjectDescriptionProblem,
  ProjectEmbeddedInParentsProblem,
  ProjectEstimatedSizeProblem,
  ProjectJsonCodeSettingsProblem,
  ProjectSchemaContainerProblem,
  RelationCardinalityTypeProblem,
  RelationGenerateCustomCodeProblem,
  RelationGenerateProblem,
  RelationKeyCompatibilityProblem,
  RelationTableReferenceProblem,
  TableEstimatedSizeProblem,
  TableGenerateCustomCodeProblem,
  TableGenerateProblem,
  TableLineReferenceProblem,
  TableRelationReferenceProblem
} from "./model-integration-check-problems";

import JsonSchemaHelpers from "../../platforms/jsonschema/helpers_jsonschema";
import _ from "lodash";

export class Rule {
  apply(model) {
    // Intentionally empty
  }
}
export class KeyColReferenceRule extends Rule {
  apply(model) {
    const keyCols = new KeyColIterator(
      new KeyIterator(new RootObjectIterator(model, "tables"))
    ).iterate();
    return keyCols
      .filter(
        (keyColTuple) =>
          !new TableColFinder(
            keyColTuple.table,
            keyColTuple.keycol.colid
          ).find()
      )
      .map(
        (keyColTuple) =>
          new KeyColReferenceProblem(
            keyColTuple.table.id,
            keyColTuple.key.id,
            keyColTuple.keycol.id
          )
      );
  }
}

export class IndexColReferenceRule extends Rule {
  apply(model) {
    const indexCols = new IndexColIterator(
      new IndexIterator(new RootObjectIterator(model, "tables"))
    ).iterate();
    return indexCols
      .filter(
        (indexColTuple) =>
          !new TableColFinder(
            indexColTuple.table,
            indexColTuple.keycol.colid
          ).find()
      )
      .map(
        (indexColTuple) =>
          new IndexColReferenceProblem(
            indexColTuple.table.id,
            indexColTuple.key.id,
            indexColTuple.keycol.id
          )
      );
  }
}

export class LineEndpointReferenceRule extends Rule {
  apply(model) {
    const lines = new RootObjectIterator(model, "lines").iterate();
    return lines
      .filter((line) => {
        const parent = new LineEndpointFinder(model, line.parent).find();
        const child = new LineEndpointFinder(model, line.child).find();
        const parentBacklink =
          parent &&
          parent.lines &&
          parent.lines.find((lineid) => line.id === lineid);
        const childBacklink =
          child &&
          child.lines &&
          child.lines.find((lineid) => line.id === lineid);

        return !parent || !child || !parentBacklink || !childBacklink;
      })
      .map((line) => new LineEndpointReferenceProblem(line.id));
  }
}

export class TableLineReferenceRule extends Rule {
  apply(model) {
    const tables = new RootObjectIterator(model, "tables").iterate();
    return tables
      .map((table) =>
        !table.lines
          ? []
          : table.lines
              .filter((lineid) => {
                const line = model.lines[lineid];
                const backRef =
                  line && (line.parent === table.id || line.child === table.id);
                return !(line && backRef);
              })
              .map((lineid) => new TableLineReferenceProblem(table.id, lineid))
      )
      .reduce((r, i) => [...r, ...i], []);
  }
}

export class NoteLineReferenceRule extends Rule {
  apply(model) {
    const notes = new RootObjectIterator(model, "notes").iterate();
    return notes
      .map((note) =>
        !note.lines
          ? []
          : note.lines
              .filter((lineid) => {
                const line = model.lines[lineid];
                const backRef =
                  line && (line.parent === note.id || line.child === note.id);
                return !(line && backRef);
              })
              .map((lineid) => new NoteLineReferenceProblem(note.id, lineid))
      )
      .reduce((r, i) => [...r, ...i], []);
  }
}

export class OtherObjectLineReferenceRule extends Rule {
  apply(model) {
    const otherObjects = new RootObjectIterator(
      model,
      "otherObjects"
    ).iterate();
    return otherObjects
      .map((otherObject) =>
        !otherObject.lines
          ? []
          : otherObject.lines
              .filter((lineid) => {
                const line = model.lines[lineid];
                const backRef =
                  line &&
                  (line.parent === otherObject.id ||
                    line.child === otherObject.id);
                return !(line && backRef);
              })
              .map(
                (lineid) =>
                  new OtherObjectLineReferenceProblem(otherObject.id, lineid)
              )
      )
      .reduce((r, i) => [...r, ...i], []);
  }
}

export class RelationTableReferenceRule extends Rule {
  apply(model) {
    const relations = new RootObjectIterator(model, "relations").iterate();
    return relations
      .filter((relation) => {
        const parent = new RelationEndpointFinder(
          model,
          relation.parent
        ).find();
        const child = new RelationEndpointFinder(model, relation.child).find();
        const parentBacklink =
          parent && parent.relations.find((relid) => relation.id === relid);
        const childBacklink =
          child && child.relations.find((relid) => relation.id === relid);

        return !parent || !child || !parentBacklink || !childBacklink;
      })
      .map((relation) => new RelationTableReferenceProblem(relation.id));
  }
}

export class RelationKeyCompatibilityRule extends Rule {
  apply(model) {
    const relations = new RootObjectIterator(model, "relations").iterate();

    return relations
      .filter((relation) => {
        const correctPairs = _.filter(
          relation.cols,
          (relationcol) =>
            !!new TableColFinder(
              model.tables[relation.parent],
              relationcol.parentcol
            ).find() &&
            !!new TableColFinder(
              model.tables[relation.child],
              relationcol.childcol
            ).find()
        );
        const relationKey =
          model.tables[relation.parent] &&
          _.find(
            model.tables[relation.parent].keys,
            (key) => relation.parent_key === key.id
          );

        function isParentTypeInterface() {
          return model.tables[relation.parent].objectType === "interface";
        }

        return (
          !relationKey ||
          (!isParentTypeInterface() &&
            relationKey &&
            (relationKey.cols.length !== relation.cols.length ||
              relation.cols.length !== correctPairs.length))
        );
      })
      .map((relation) => new RelationKeyCompatibilityProblem(relation.id));
  }
}

export class TableRelationReferenceRule extends Rule {
  apply(model) {
    const tables = new RootObjectIterator(model, "tables").iterate();
    return tables
      .map((table) =>
        table.relations
          .filter((relationid) => {
            const relation = model.relations[relationid];
            const backRef =
              relation &&
              (relation.parent === table.id || relation.child === table.id);
            return !(relation && backRef);
          })
          .map(
            (relationid) =>
              new TableRelationReferenceProblem(table.id, relationid)
          )
      )
      .reduce((r, i) => [...r, ...i], []);
  }
}

export class TableGenerateRule extends Rule {
  apply(model) {
    const tables = new RootObjectIterator(model, "tables").iterate();
    return tables
      .filter((table) => table.generate === undefined)
      .map((table) => new TableGenerateProblem(table.id));
  }
}

export class TableEstimatedSizeRule extends Rule {
  apply(model) {
    const tables = new RootObjectIterator(model, "tables").iterate();
    return tables
      .filter((table) => table.estimatedSize === undefined)
      .map((table) => new TableEstimatedSizeProblem(table.id));
  }
}

export class ModelWriteFileParamRule extends Rule {
  apply(model) {
    return model.model.writeFileParam === undefined
      ? [new ModelWriteFileParamProblem()]
      : [];
  }
}

export class TableMainDiagramRule extends Rule {
  apply(model) {
    if (!JsonSchemaHelpers.isPerseidModelType(model.model.type)) {
      const tables = new RootObjectIterator(model, "tables").iterate();
      const mainDiagram = _.find(model.diagrams, ["main", true]);

      if (!mainDiagram) {
        return [];
      }

      return tables
        .filter((table) => mainDiagram.diagramItems[table.id] === undefined)
        .map(
          (table) =>
            new DiagramItemsMissingTableProblem(mainDiagram.id, table.id)
        );
    } else {
      return [];
    }
  }
}

export class NoteMainDiagramRule extends Rule {
  apply(model) {
    if (!JsonSchemaHelpers.isPerseidModelType(model.model.type)) {
      const notes = new RootObjectIterator(model, "notes").iterate();
      const mainDiagram = _.find(model.diagrams, ["main", true]);

      if (!mainDiagram) {
        return [];
      }

      return notes
        .filter((note) => mainDiagram.diagramItems[note.id] === undefined)
        .map(
          (note) => new DiagramItemsMissingNoteProblem(mainDiagram.id, note.id)
        );
    } else {
      return [];
    }
  }
}

export class OtherObjectMainDiagramRule extends Rule {
  apply(model) {
    if (!JsonSchemaHelpers.isPerseidModelType(model.model.type)) {
      const otherObjects = new RootObjectIterator(
        model,
        "otherObjects"
      ).iterate();
      const mainDiagram = _.find(model.diagrams, ["main", true]);

      if (!mainDiagram) {
        return [];
      }

      return otherObjects
        .filter(
          (otherObject) =>
            mainDiagram.diagramItems[otherObject.id] === undefined
        )
        .map(
          (otherObject) =>
            new DiagramItemsMissingOtherObjectProblem(
              mainDiagram.id,
              otherObject.id
            )
        );
    } else {
      return [];
    }
  }
}

export class RelationCardinalityTypeRule extends Rule {
  apply(model) {
    const relations = new RootObjectIterator(model, "relations").iterate();
    return relations
      .filter((relation) => relation.c_ch === undefined)
      .map((relation) => new RelationCardinalityTypeProblem(relation.id));
  }
}

export class RelationGenerateRule extends Rule {
  apply(model) {
    const relations = new RootObjectIterator(model, "relations").iterate();
    return relations
      .filter((relation) => relation.generate === undefined)
      .map((relation) => new RelationGenerateProblem(relation.id));
  }
}

export class LineGenerateRule extends Rule {
  apply(model) {
    const lines = new RootObjectIterator(model, "lines").iterate();
    return lines
      .filter((line) => line.generate === undefined)
      .map((line) => new LineGenerateProblem(line.id));
  }
}
export class OtherObjectGenerateRule extends Rule {
  apply(model) {
    const otherObjects = new RootObjectIterator(
      model,
      "otherObjects"
    ).iterate();
    return otherObjects
      .filter((otherObject) => otherObject.generate === undefined)
      .map((otherObject) => new OtherObjectGenerateProblem(otherObject.id));
  }
}

export class TableGenerateCustomCodeRule extends Rule {
  apply(model) {
    const tables = new RootObjectIterator(model, "tables").iterate();
    return tables
      .filter((table) => table.generateCustomCode === undefined)
      .map((table) => new TableGenerateCustomCodeProblem(table.id));
  }
}

export class OtherObjectGenerateCustomCodeRule extends Rule {
  apply(model) {
    const otherObjects = new RootObjectIterator(
      model,
      "otherObjects"
    ).iterate();
    return otherObjects
      .filter((otherObject) => otherObject.generateCustomCode === undefined)
      .map(
        (otherObject) =>
          new OtherObjectGenerateCustomCodeProblem(otherObject.id)
      );
  }
}
export class RelationGenerateCustomCodeRule extends Rule {
  apply(model) {
    const relations = new RootObjectIterator(model, "relations").iterate();
    return relations
      .filter((relation) => relation.generateCustomCode === undefined)
      .map((relation) => new RelationGenerateCustomCodeProblem(relation.id));
  }
}

export class ProjectDescriptionRule extends Rule {
  apply(model) {
    return model.model.description !== "" &&
      model.model.description !== null &&
      model.model.description !== undefined
      ? [new ProjectDescriptionProblem()]
      : [];
  }
}

export class ProjectAuthorNameRule extends Rule {
  apply(model) {
    return model.model.authorName === null ||
      model.model.authorName === undefined
      ? [new ProjectAuthorNameProblem()]
      : [];
  }
}

export class ProjectCompanyDetailsRule extends Rule {
  apply(model) {
    return model.model.companyDetails === null ||
      model.model.companyDetails === undefined
      ? [new ProjectCompanyDetailsProblem()]
      : [];
  }
}

export class ProjectCompanyUrlRule extends Rule {
  apply(model) {
    return model.model.companyUrl === null ||
      model.model.companyUrl === undefined
      ? [new ProjectCompanyUrlProblem()]
      : [];
  }
}

export class ProjectEmbeddedInParentsRule extends Rule {
  apply(model) {
    return model.model.embeddedInParentsIsDisplayed === null ||
      model.model.embeddedInParentsIsDisplayed === undefined
      ? [new ProjectEmbeddedInParentsProblem()]
      : [];
  }
}

export class ProjectCurrentDisplayModeRule extends Rule {
  apply(model) {
    return model.model.currentDisplayMode === null ||
      model.model.currentDisplayMode === undefined
      ? [new ProjectCurrentDisplayModeProblem()]
      : [];
  }
}

export class ProjectSchemaContainerRule extends Rule {
  apply(model) {
    return model.model.schemaContainerIsDisplayed === null ||
      model.model.schemaContainerIsDisplayed === undefined
      ? [new ProjectSchemaContainerProblem()]
      : [];
  }
}

export class ProjectJsonCodeSettingsRule extends Rule {
  apply(model) {
    return model.model.jsonCodeSettings === null ||
      model.model.jsonCodeSettings === undefined
      ? [new ProjectJsonCodeSettingsProblem()]
      : [];
  }
}

export class ProjectCardinalityRule extends Rule {
  apply(model) {
    return model.model.cardinalityIsDisplayed === null ||
      model.model.cardinalityIsDisplayed === undefined
      ? [new ProjectCardinalityProblem()]
      : [];
  }
}

export class ProjectEstimatedSizeRule extends Rule {
  apply(model) {
    return model.model.estimatedSizeIsDisplayed === null ||
      model.model.estimatedSizeIsDisplayed === undefined
      ? [new ProjectEstimatedSizeProblem()]
      : [];
  }
}

export class FKColumnWithoutRelationRule extends Rule {
  getColInRelation(model, relations, colid) {
    return relations
      .map((relId) => model.relations[relId])
      .filter((rel) => {
        return (
          !!rel &&
          !!rel.cols &&
          !!rel.cols.find((relcol) => relcol.childcol === colid)
        );
      });
  }

  apply(model) {
    return new ColumnIterator(new RootObjectIterator(model, "tables"))
      .iterate()
      .filter(
        (columnTuple) =>
          columnTuple.col.fk === true &&
          !this.columnInRelationExists(model, columnTuple)
      )
      .map(
        (columnTuple) =>
          new FKColumnWithoutRelationProblem(
            columnTuple.table.id,
            columnTuple.col.id
          )
      );
  }

  columnInRelationExists(model, columnTuple) {
    return (
      this.getColInRelation(
        model,
        columnTuple.table.relations,
        columnTuple.col.id
      ).length > 0
    );
  }
}

export class DiagramItemsAutoExpandMissingPropertyRule extends Rule {
  apply(model) {
    return new DiagramItemIterator(new RootObjectIterator(model, "diagrams"))
      .iterate()
      .filter(
        (diagramItemTuple) =>
          diagramItemTuple.diagramItem.autoExpand === undefined
      )
      .map(
        (diagramItemTuple) =>
          new DiagramItemsAutoExpandMissingPropertyProblem(
            diagramItemTuple.diagram.id,
            diagramItemTuple.diagramItem.referencedItemId
          )
      );
  }
}

export class DiagramItemsResizedMissingPropertyRule extends Rule {
  apply(model) {
    return new DiagramItemIterator(new RootObjectIterator(model, "diagrams"))
      .iterate()
      .filter(
        (diagramItemTuple) => diagramItemTuple.diagramItem.resized === undefined
      )
      .map(
        (diagramItemTuple) =>
          new DiagramItemsResizedMissingPropertyProblem(
            diagramItemTuple.diagram.id,
            diagramItemTuple.diagramItem.referencedItemId
          )
      );
  }
}
