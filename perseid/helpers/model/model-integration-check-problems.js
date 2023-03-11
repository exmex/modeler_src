import { v4 as uuid } from "uuid";

export class Problem {
  getTitle() {
    return "Problem";
  }

  fix(model) {
    // intentionally empty
  }

  removeKeyCol(model, tableid, keyid, keycolid) {
    const newModel = { ...model };
    newModel.tables[tableid].keys = newModel.tables[tableid].keys.map((key) =>
      key.id === keyid
        ? { ...key, cols: key.cols.filter((keycol) => keycol.id !== keycolid) }
        : key
    );
    return newModel;
  }

  removeIndexCol(model, tableid, indexid, indexcolid) {
    const newModel = { ...model };
    newModel.tables[tableid].indexes = newModel.tables[tableid].indexes.map(
      (index) =>
        index.id === indexid
          ? {
              ...index,
              cols: index.cols.filter((indexcol) => indexcol.id !== indexcolid)
            }
          : index
    );
    return model;
  }

  removeLine(model, lineid) {
    const newModel = { ...model };
    const newLines = Object.keys(newModel.lines)
      .map((key) => newModel.lines[key])
      .filter((line) => line.id !== lineid);
    newModel.lines = newLines.reduce((r, i) => {
      r[i.id] = i;
      return r;
    }, {});

    Object.keys(newModel.tables)
      .map((key) => newModel.tables[key])
      .forEach((table) => {
        table.lines = table.lines.filter((line) => line !== lineid);
      });
    Object.keys(newModel.notes)
      .map((key) => newModel.notes[key])
      .forEach((note) => {
        note.lines = note.lines.filter((line) => line !== lineid);
      });
    Object.keys(newModel.otherObjects)
      .map((key) => newModel.otherObjects[key])
      .forEach((otherObject) => {
        otherObject.lines = otherObject.lines.filter((line) => line !== lineid);
      });
    return newModel;
  }

  removeRelation(model, relationid) {
    const newModel = { ...model };
    const newRelations = Object.keys(newModel.relations)
      .map((key) => newModel.relations[key])
      .filter((rel) => rel.id !== relationid);
    newModel.relations = newRelations.reduce((r, i) => {
      r[i.id] = i;
      return r;
    }, {});

    Object.keys(newModel.tables)
      .map((key) => newModel.tables[key])
      .forEach((table) => {
        table.relations = table.relations.filter((rel) => rel !== relationid);
      });
    return newModel;
  }

  removeLineFromOtherObject(model, otherobjectid, lineid) {
    const newModel = { ...model };
    newModel.otherObjects[otherobjectid].lines = newModel.otherObjects[
      otherobjectid
    ].lines.filter((line) => line !== lineid);
    return newModel;
  }

  removeLineFromTable(model, tableid, lineid) {
    const newModel = { ...model };
    newModel.tables[tableid].lines = newModel.tables[tableid].lines.filter(
      (line) => line !== lineid
    );
    return newModel;
  }

  removeLineFromNote(model, noteid, lineid) {
    const newModel = { ...model };
    newModel.notes[noteid].lines = newModel.notes[noteid].lines.filter(
      (line) => line !== lineid
    );
    return newModel;
  }

  removeRelationFromTable(model, tableid, relationid) {
    const newModel = { ...model };
    newModel.tables[tableid].relations = newModel.tables[
      tableid
    ].relations.filter((relation) => relation !== relationid);
    return newModel;
  }
}

export class RelationKeyCompatibilityProblem extends Problem {
  constructor(relationid) {
    super();
    this.relationid = relationid;
  }

  getTitle() {
    return "Relation Key Compatibility Problem";
  }

  fix(model) {
    return this.removeRelation(model, this.relationid);
  }
}

export class LineEndpointReferenceProblem extends Problem {
  constructor(lineid) {
    super();
    this.lineid = lineid;
  }

  getTitle() {
    return "Line Endpoint Reference Problem";
  }

  fix(model) {
    return this.removeLine(model, this.lineid);
  }
}

export class RelationTableReferenceProblem extends Problem {
  constructor(relationid) {
    super();
    this.relationid = relationid;
  }

  getTitle() {
    return "Relation Table Reference Problem";
  }

  fix(model) {
    return this.removeRelation(model, this.relationid);
  }
}

export class TableLineReferenceProblem extends Problem {
  constructor(tableid, lineid) {
    super();
    this.tableid = tableid;
    this.lineid = lineid;
  }

  getTitle() {
    return "Table Line Reference Problem";
  }

  fix(model) {
    return this.removeLineFromTable(model, this.tableid, this.lineid);
  }
}

export class NoteLineReferenceProblem extends Problem {
  constructor(noteid, lineid) {
    super();
    this.noteid = noteid;
    this.lineid = lineid;
  }

  getTitle() {
    return "Note Line Reference Problem";
  }

  fix(model) {
    return this.removeLineFromNote(model, this.noteid, this.lineid);
  }
}

export class OtherObjectLineReferenceProblem extends Problem {
  constructor(otherobjectid, lineid) {
    super();
    this.otherobjectid = otherobjectid;
    this.lineid = lineid;
  }

  getTitle() {
    return "Other Object Line Reference Problem";
  }

  fix(model) {
    return this.removeLineFromOtherObject(
      model,
      this.otherobjectid,
      this.lineid
    );
  }
}

export class TableRelationReferenceProblem extends Problem {
  constructor(tableid, relationid) {
    super();
    this.tableid = tableid;
    this.relationid = relationid;
  }

  getTitle() {
    return "Table Relation Reference Problem";
  }

  fix(model) {
    return this.removeRelationFromTable(model, this.tableid, this.relationid);
  }
}

export class ProjectDescriptionProblem extends Problem {
  getTitle() {
    return "Project Description Problem";
  }

  fix(model) {
    return {
      ...model,
      model: {
        ...model.model,
        description: undefined,
        desc: model.model.description
      }
    };
  }
}

export class ProjectEmbeddedInParentsProblem extends Problem {
  getTitle() {
    return "Project Embedded In Parents Settings Problem";
  }

  fix(model) {
    return {
      ...model,
      model: {
        ...model.model,
        embeddedInParentsIsDisplayed: true
      }
    };
  }
}

export class ProjectSchemaContainerProblem extends Problem {
  getTitle() {
    return "Project Schema Container Settings Problem";
  }

  fix(model) {
    return {
      ...model,
      model: {
        ...model.model,
        schemaContainerIsDisplayed: false
      }
    };
  }
}

export class ProjectJsonCodeSettingsProblem extends Problem {
  getTitle() {
    return "Project Json Code Settings Problem";
  }

  fix(model) {
    return {
      ...model,
      model: {
        ...model.model,
        jsonCodeSettings: {
          strict: true,
          definitionKeyName: "bySchema",
          format: "json"
        }
      }
    };
  }
}

export class ProjectCardinalityProblem extends Problem {
  getTitle() {
    return "Project Cardinality Settings Problem";
  }

  fix(model) {
    return {
      ...model,
      model: {
        ...model.model,
        cardinalityIsDisplayed: false
      }
    };
  }
}

export class ProjectEstimatedSizeProblem extends Problem {
  getTitle() {
    return "Project Estimated Size Settings Problem";
  }

  fix(model) {
    return {
      ...model,
      model: {
        ...model.model,
        estimatedSizeIsDisplayed: false
      }
    };
  }
}

export class TableGenerateProblem extends Problem {
  constructor(tableid) {
    super();
    this.tableid = tableid;
  }

  getTitle() {
    return "Table Missing generate Property Problem";
  }

  fix(model) {
    return {
      ...model,
      tables: {
        ...model.tables,
        [this.tableid]: {
          ...model.tables[this.tableid],
          generate: true
        }
      }
    };
  }
}

export class TableEstimatedSizeProblem extends Problem {
  constructor(tableid) {
    super();
    this.tableid = tableid;
  }

  getTitle() {
    return "Table Missing Estimated Size Property Problem";
  }

  fix(model) {
    return {
      ...model,
      tables: {
        ...model.tables,
        [this.tableid]: {
          ...model.tables[this.tableid],
          estimatedSize: ""
        }
      }
    };
  }
}

export class ModelWriteFileParamProblem extends Problem {
  getTitle() {
    return "Model Missing Write File Param Property Problem";
  }

  fix(model) {
    return {
      ...model,
      model: {
        ...model.model,
        writeFileParam: false
      }
    };
  }
}

export class TableGenerateCustomCodeProblem extends Problem {
  constructor(tableid) {
    super();
    this.tableid = tableid;
  }

  getTitle() {
    return "Table Missing generateCustomCode Property Problem";
  }

  fix(model) {
    return {
      ...model,
      tables: {
        ...model.tables,
        [this.tableid]: {
          ...model.tables[this.tableid],
          generateCustomCode: true
        }
      }
    };
  }
}

export class OtherObjectGenerateCustomCodeProblem extends Problem {
  constructor(otherobjectid) {
    super();
    this.otherobjectid = otherobjectid;
  }

  getTitle() {
    return "OtherObject Missing generate Property Problem";
  }

  fix(model) {
    return {
      ...model,
      otherObjects: {
        ...model.otherObjects,
        [this.otherobjectid]: {
          ...model.otherObjects[this.otherobjectid],
          generateCustomCode: true
        }
      }
    };
  }
}

export class RelationGenerateProblem extends Problem {
  constructor(relationid) {
    super();
    this.relationid = relationid;
  }

  getTitle() {
    return "Relation Missing generate Property Problem";
  }

  fix(model) {
    return {
      ...model,
      relations: {
        ...model.relations,
        [this.relationid]: {
          ...model.relations[this.relationid],
          generate: true
        }
      }
    };
  }
}

export class RelationCardinalityTypeProblem extends Problem {
  constructor(relationid) {
    super();
    this.relationid = relationid;
  }

  getTitle() {
    return "Relation Missing cardinality type Property Problem";
  }

  convertCaptionToCardinalityType(caption) {
    return caption === 1 || caption === "1" ? "one" : "many";
  }

  addMissingCardinalityChildCaption(caption) {
    return caption !== undefined ? caption : "";
  }

  fix(model) {
    return {
      ...model,
      relations: {
        ...model.relations,
        [this.relationid]: {
          ...model.relations[this.relationid],
          c_p: "one",
          c_ch: this.convertCaptionToCardinalityType(
            model.relations[this.relationid].c_cch
          ),
          c_cp: "",
          c_cch: this.addMissingCardinalityChildCaption(
            model.relations[this.relationid].c_cch
          )
        }
      }
    };
  }
}

export class RelationGenerateCustomCodeProblem extends Problem {
  constructor(relationid) {
    super();
    this.relationid = relationid;
  }

  getTitle() {
    return "Relation Missing generate Custom Code Property Problem";
  }

  fix(model) {
    return {
      ...model,
      relations: {
        ...model.relations,
        [this.relationid]: {
          ...model.relations[this.relationid],
          generateCustomCode: true
        }
      }
    };
  }
}

export class OtherObjectGenerateProblem extends Problem {
  constructor(otherobjectid) {
    super();
    this.otherobjectid = otherobjectid;
  }

  getTitle() {
    return "OtherObject Missing generate Property Problem";
  }

  fix(model) {
    return {
      ...model,
      otherObjects: {
        ...model.otherObjects,
        [this.otherobjectid]: {
          ...model.otherObjects[this.otherobjectid],
          generate: true
        }
      }
    };
  }
}

export class LineGenerateProblem extends Problem {
  constructor(lineid) {
    super();
    this.lineid = lineid;
  }

  getTitle() {
    return "Line Missing generate Property Problem";
  }

  fix(model) {
    return {
      ...model,
      lines: {
        ...model.lines,
        [this.lineid]: {
          ...model.lines[this.lineid],
          generate: true
        }
      }
    };
  }
}

export class KeyColReferenceProblem extends Problem {
  constructor(tableid, keyid, keycolid) {
    super();
    this.tableid = tableid;
    this.keyid = keyid;
    this.keycolid = keycolid;
  }

  getTitle() {
    return "Key Column Reference Problem";
  }

  fix(model) {
    return this.removeKeyCol(model, this.tableid, this.keyid, this.keycolid);
  }
}

export class IndexColReferenceProblem extends Problem {
  constructor(tableid, indexid, indexcolid) {
    super();
    this.tableid = tableid;
    this.indexid = indexid;
    this.indexcolid = indexcolid;
  }

  getTitle() {
    return "Index Column Reference Problem";
  }

  fix(model) {
    return this.removeIndexCol(
      model,
      this.tableid,
      this.indexid,
      this.indexcolid
    );
  }
}

export class FKColumnWithoutRelationProblem extends Problem {
  constructor(tableid, colid) {
    super();
    this.tableid = tableid;
    this.colid = colid;
  }

  getTitle() {
    return "Column FK Flag Problem";
  }

  fix(model) {
    return {
      ...model,
      tables: {
        ...model.tables,
        [this.tableid]: {
          ...model.tables[this.tableid],
          cols: [
            ...model.tables[this.tableid].cols.map((col) =>
              col.id === this.colid ? { ...col, fk: false } : { ...col }
            )
          ]
        }
      }
    };
  }
}

export class DiagramItemsAutoExpandMissingPropertyProblem extends Problem {
  constructor(diagramid, diagramitemid) {
    super();
    this.diagramid = diagramid;
    this.diagramitemid = diagramitemid;
  }

  getTitle() {
    return "Missing DiagramItem AutoExpand property";
  }

  fix(model) {
    return {
      ...model,
      diagrams: {
        ...model.diagrams,
        [this.diagramid]: {
          ...model.diagrams[this.diagramid],
          diagramItems: {
            ...model.diagrams[this.diagramid].diagramItems,
            [this.diagramitemid]: {
              ...model.diagrams[this.diagramid].diagramItems[
                this.diagramitemid
              ],
              autoExpand: true
            }
          }
        }
      }
    };
  }
}

export class DiagramItemsResizedMissingPropertyProblem extends Problem {
  constructor(diagramid, diagramitemid) {
    super();
    this.diagramid = diagramid;
    this.diagramitemid = diagramitemid;
  }

  getTitle() {
    return "Missing DiagramItem Resized property";
  }

  fix(model) {
    return {
      ...model,
      diagrams: {
        ...model.diagrams,
        [this.diagramid]: {
          ...model.diagrams[this.diagramid],
          diagramItems: {
            ...model.diagrams[this.diagramid].diagramItems,
            [this.diagramitemid]: {
              ...model.diagrams[this.diagramid].diagramItems[
                this.diagramitemid
              ],
              resized: false
            }
          }
        }
      }
    };
  }
}
export class DiagramItemsMissingTableProblem extends Problem {
  constructor(diagramid, diagramitemid) {
    super();
    this.diagramid = diagramid;
    this.diagramitemid = diagramitemid;
  }

  getTitle() {
    return "Missing DiagramItemTable";
  }

  fix(model) {
    return {
      ...model,
      diagrams: {
        ...model.diagrams,
        [this.diagramid]: {
          ...model.diagrams[this.diagramid],
          diagramItems: {
            ...model.diagrams[this.diagramid].diagramItems,
            [this.diagramitemid]: {
              referencedItemId: this.diagramitemid,
              x: 100,
              y: 100,
              gHeight: 200,
              gWidth: 100,
              color: "#ffffff",
              background: "#03a9f4",
              resized: false,
              autoExpand: true
            }
          }
        }
      }
    };
  }
}

export class DiagramItemsMissingNoteProblem extends Problem {
  constructor(diagramid, diagramitemid) {
    super();
    this.diagramid = diagramid;
    this.diagramitemid = diagramitemid;
  }

  getTitle() {
    return "Missing DiagramItemNote";
  }

  fix(model) {
    return {
      ...model,
      diagrams: {
        ...model.diagrams,
        [this.diagramid]: {
          ...model.diagrams[this.diagramid],
          diagramItems: {
            ...model.diagrams[this.diagramid].diagramItems,
            [this.diagramitemid]: {
              referencedItemId: this.diagramitemid,
              x: 100,
              y: 100,
              gHeight: 60,
              gWidth: 160,
              color: "#333",
              background: "#f9e79f",
              resized: false,
              autoExpand: true
            }
          }
        }
      }
    };
  }
}

export class DiagramItemsMissingOtherObjectProblem extends Problem {
  constructor(diagramid, diagramitemid) {
    super();
    this.diagramid = diagramid;
    this.diagramitemid = diagramitemid;
  }

  getTitle() {
    return "Missing DiagramItemOtherObject";
  }

  fix(model) {
    return {
      ...model,
      diagrams: {
        ...model.diagrams,
        [this.diagramid]: {
          ...model.diagrams[this.diagramid],
          diagramItems: {
            ...model.diagrams[this.diagramid].diagramItems,
            [this.diagramitemid]: {
              referencedItemId: this.diagramitemid,
              x: 100,
              y: 100,
              gHeight: 40,
              gWidth: 120,
              color: "#eee",
              background: "#009688",
              resized: false,
              autoExpand: true
            }
          }
        }
      }
    };
  }
}
