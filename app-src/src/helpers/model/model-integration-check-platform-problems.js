import {
  DefaultMySqlFamilySqlSettings,
  DefaultSqlSettings,
  DefaultSqlSettingsMSSQL,
  DefaultSqlSettingsPG,
  INCLUDE_GENERATED_NAMES_ALWAYS
} from "../../generator/sql-model-to-lines/model_to_lines";

import { ClassDiagramItem } from "../../classes/class_diagram_item";
import LogicalHelpers from "../../platforms/logical/helpers_logical";
import { ModelTypes } from "../../enums/enums";
import MySQLFamilyHelpers from "../../platforms/mysql_family/helpers_mysql_family";
import PGHelpers from "../../platforms/pg/helpers_pg";
import { Problem } from "./model-integration-check-problems";
import SQLiteHelpers from "../../platforms/sqlite/helpers_sqlite";
import _ from "lodash";
import { getDefaultDataType } from "../../actions/tables";
import { getOrderedObjectsReset } from "../../selectors/selector_order";
import { v4 as uuid } from "uuid";

export class EliminateNestedDiagramItemsProblem extends Problem {
  constructor(diagramItemsToRemove) {
    super();
    this.diagramItemsToRemove = diagramItemsToRemove;
  }

  getTitle() {
    return `Remove diagram nested tables and its lines problem`;
  }

  updateDiagram(diagram) {
    const diagramItemsToRemove = this.diagramItemsToRemove[diagram.id];
    return diagramItemsToRemove
      ? {
          ...diagram,
          diagramItems: _.reduce(
            diagram.diagramItems,
            (r, diagramItem) => {
              if (
                diagramItemsToRemove.includes(diagramItem.referencedItemId) &&
                !diagram.main
              ) {
                return r;
              }
              return { ...r, [diagramItem.referencedItemId]: diagramItem };
            },
            {}
          )
        }
      : diagram;
  }

  fix(model) {
    try {
      const mainDiagram = _.find(model.diagrams, (diagram) => diagram.main);
      const tablesToHide = this.diagramItemsToRemove[mainDiagram.id];
      const relationsIdToRemove = _.reduce(
        model.tables,
        (r, table) => {
          if (tablesToHide.includes(table.id)) {
            return [...r, ...table.relations];
          }
          return r;
        },
        []
      );

      const linesIdToRemove = _.reduce(
        model.tables,
        (r, table) => {
          if (tablesToHide.includes(table.id)) {
            return [...r, ...table.lines];
          }
          return r;
        },
        []
      );

      const linesWithoutLinesToTableToRemove = _.reduce(
        model.lines,
        (r, i) => {
          if (!linesIdToRemove.includes(i.id)) {
            r[i.id] = i;
          }
          return r;
        },
        {}
      );
      const relationsWithoutLinesToTableToRemove = _.reduce(
        model.relations,
        (r, i) => {
          if (!relationsIdToRemove.includes(i.id)) {
            r[i.id] = i;
          }
          return r;
        },
        {}
      );

      const otherObjectsWithoutLinks = _.reduce(
        model.otherObjects,
        (r, i) => ({
          ...r,
          [i.id]: {
            ...i,
            lines: _.filter(
              i.lines,
              (lineId) => !linesIdToRemove.includes(lineId)
            )
          }
        }),
        {}
      );
      const notesWithoutLinks = _.reduce(
        model.notes,
        (r, i) => ({
          ...r,
          [i.id]: {
            ...i,
            lines: _.filter(
              i.lines,
              (lineId) => !linesIdToRemove.includes(lineId)
            )
          }
        }),
        {}
      );

      return {
        ...model,
        tables: _.reduce(
          model.tables,
          (r, table) => ({
            ...r,
            [table.id]: {
              ...table,
              cols: _.map(table.cols, (col) => {
                const isRemoved = !!_.find(
                  relationsIdToRemove,
                  (relationId) => {
                    return !!_.find(
                      model.relations[relationId].cols,
                      (relCol) => {
                        return relCol.childcol === col.id;
                      }
                    );
                  }
                );
                if (isRemoved) {
                  col.fk = false;
                }
                return col;
              }),
              visible: table.embeddable ? false : table.visible,
              lines: _.filter(
                table.lines,
                (lineId) => !linesIdToRemove.includes(lineId)
              ),
              relations: _.filter(
                table.relations,
                (relationId) => !relationsIdToRemove.includes(relationId)
              )
            }
          }),
          {}
        ),
        diagrams: {
          ..._.reduce(
            model.diagrams,
            (r, diagram) => ({
              ...r,
              [diagram.id]: this.updateDiagram(diagram)
            }),
            {}
          )
        },
        lines: linesWithoutLinesToTableToRemove,
        relations: relationsWithoutLinesToTableToRemove,
        otherObjects: otherObjectsWithoutLinks,
        notes: notesWithoutLinks
      };
    } catch (e) {
      return model;
    }
  }
}

export class JsonCodeSettingsProblem extends Problem {
  getTitle() {
    return `Missing Json Code Settings`;
  }

  fix(model) {
    return {
      ...model,
      model: {
        ...model.model,
        jsonCodeSettings: {
          strict: false,
          definitionKeyName: "bySchema",
          format: "json"
        }
      }
    };
  }
}
export class TablePlatformPropertyProblem extends Problem {
  constructor(tableId, property) {
    super();
    this.tableId = tableId;
    this.property = property;
  }

  getTitle() {
    return `Table Platform Property Problem - ${this.property}`;
  }

  fix(model) {
    return {
      ...model,
      tables: {
        ...model.tables,
        [this.tableId]: {
          ...model.tables[this.tableId],
          [this.property]: {}
        }
      }
    };
  }
}

export class DiagramTypePlatformPropertyProblem extends Problem {
  constructor(diagramIds) {
    super();
    this.diagramIds = diagramIds;
  }

  getTitle() {
    return `Diagram Type Platform Property Problem`;
  }

  fix(model) {
    return {
      ...model,
      diagrams: {
        ...model.diagrams,
        ..._.reduce(
          this.diagramIds,
          (r, diagramId) => ({
            ...r,
            [diagramId]: { ...model.diagrams[diagramId], type: "erd" }
          }),
          {}
        )
      }
    };
  }
}

export class ModelAutoGenerationPropertyProblem extends Problem {
  getTitle() {
    return `Model Auto Generation Property Problem`;
  }

  fix(model) {
    return {
      ...model,
      model: {
        ...model.model,
        nameAutoGeneration: {
          keys: false,
          indexes: false,
          relations: false
        }
      }
    };
  }
}

export class OtherObjectPlatformPropertyProblem extends Problem {
  constructor(otherObjectId, property) {
    super();
    this.otherObjectId = otherObjectId;
    this.property = property;
  }

  getTitle() {
    return `Other Object Platform Property Problem - ${this.property}`;
  }

  fix(model) {
    return {
      ...model,
      otherObjects: {
        ...model.otherObjects,
        [this.otherObjectId]: {
          ...model.otherObjects[this.otherObjectId],
          [this.property]: {}
        }
      }
    };
  }
}

export class DomainPlatformPropertyProblem extends Problem {
  constructor(otherObjectId, property) {
    super();
    this.otherObjectId = otherObjectId;
    this.property = property;
  }

  getTitle() {
    return `Domain Platform Property Problem - ${this.property}`;
  }

  fix(model) {
    return {
      ...model,
      otherObjects: {
        ...model.otherObjects,
        [this.otherObjectId]: {
          ...model.otherObjects[this.otherObjectId],
          [this.property]: { domain: {} }
        }
      }
    };
  }
}

export class DomainConstraintPlatformPropertyProblem extends Problem {
  constructor(otherObjectId, property) {
    super();
    this.otherObjectId = otherObjectId;
    this.property = property;
  }

  getTitle() {
    return `Domain Constraint Platform Property Problem - ${this.property}`;
  }

  fix(model) {
    const domain = model.otherObjects[this.otherObjectId][this.property].domain;
    const newConstraint = {
      id: uuid(),
      name: domain.constraint_name ? domain.constraint_name : ``,
      constraint_def: domain.constraint ? domain.constraint : ``
    };

    const modifiedDomain = Object.assign(
      {},
      model.otherObjects[this.otherObjectId][this.property].domain
    );
    delete modifiedDomain.constraint_name;
    delete modifiedDomain.constraint;

    return {
      ...model,
      otherObjects: {
        ...model.otherObjects,
        [this.otherObjectId]: {
          ...model.otherObjects[this.otherObjectId],
          [this.property]: {
            ...model.otherObjects[this.otherObjectId][this.property],
            domain: {
              ...modifiedDomain,
              constraints: [newConstraint]
            }
          }
        }
      }
    };
  }
}

export class ModelPlatformPropertyProblem extends Problem {
  constructor(property) {
    super();
    this.property = property;
  }

  getTitle() {
    return `Model Platform Property Problem - ${this.property}`;
  }

  fix(model) {
    return {
      ...model,
      model: {
        ...model.model,
        [this.property]: {}
      }
    };
  }
}

export class ColumnPlatformPropertyProblem extends Problem {
  constructor(tableId, columnId, property) {
    super();
    this.tableId = tableId;
    this.columnId = columnId;
    this.property = property;
  }

  getTitle() {
    return `Column Platform Property Problem - ${this.property}`;
  }

  fix(model) {
    return {
      ...model,
      tables: {
        ...model.tables,
        [this.tableId]: {
          ...model.tables[this.tableId],
          cols: [
            ...model.tables[this.tableId].cols.map((col) =>
              col.id === this.columnId
                ? {
                    ...col,
                    [this.property]: {}
                  }
                : col
            )
          ]
        }
      }
    };
  }
}

export class KeyPlatformPropertyProblem extends Problem {
  constructor(tableId, keyId, property) {
    super();
    this.tableId = tableId;
    this.keyId = keyId;
    this.property = property;
  }

  getTitle() {
    return `Key Platform Property Problem - ${this.property}`;
  }

  fix(model) {
    return {
      ...model,
      tables: {
        ...model.tables,
        [this.tableId]: {
          ...model.tables[this.tableId],
          keys: [
            ...model.tables[this.tableId].keys.map((key) =>
              key.id === this.keyId ? { ...key, [this.property]: {} } : key
            )
          ]
        }
      }
    };
  }
}

export class IndexPlatformPropertyProblem extends Problem {
  constructor(tableId, indexId, property) {
    super();
    this.tableId = tableId;
    this.indexId = indexId;
    this.property = property;
  }

  getTitle() {
    return `Index Platform Property Problem - ${this.property}`;
  }

  fix(model) {
    return {
      ...model,
      tables: {
        ...model.tables,
        [this.tableId]: {
          ...model.tables[this.tableId],
          indexes: [
            ...model.tables[this.tableId].indexes.map((index) =>
              index.id === this.indexId
                ? { ...index, [this.property]: {} }
                : index
            )
          ]
        }
      }
    };
  }
}

export class IndexColumnPlatformPropertyProblem extends Problem {
  constructor(tableId, indexId, columnId, property) {
    super();
    this.tableId = tableId;
    this.indexId = indexId;
    this.columnId = columnId;
    this.property = property;
  }

  getTitle() {
    return `Index Column Platform Property Problem - ${this.property}`;
  }

  fix(model) {
    return {
      ...model,
      tables: {
        ...model.tables,
        [this.tableId]: {
          ...model.tables[this.tableId],
          indexes: [
            ...model.tables[this.tableId].indexes.map((index) =>
              index.id === this.indexId
                ? {
                    ...index,
                    cols: [
                      ...index.cols.map((indexcol) =>
                        indexcol.colid === this.columnId
                          ? { ...indexcol, [this.property]: {} }
                          : indexcol
                      )
                    ]
                  }
                : index
            )
          ]
        }
      }
    };
  }
}

export class SQLSettingsProblem extends Problem {
  getTitle() {
    return `Missing SQL Settings`;
  }

  getPlatformSettings(model) {
    switch (model.model.type) {
      case ModelTypes.MARIADB:
      case ModelTypes.MYSQL:
        return DefaultMySqlFamilySqlSettings;
      case ModelTypes.MSSQL:
        return DefaultSqlSettingsMSSQL;
      case ModelTypes.PG:
        return DefaultSqlSettingsPG;
      default:
        DefaultSqlSettings;
    }
  }

  fix(model) {
    return {
      ...model,
      model: {
        ...model.model,
        sqlSettings: this.getPlatformSettings(model)
      }
    };
  }
}

export class SQLSettingsIncludeGeneratednamesProblem extends Problem {
  getTitle() {
    return `Missing Include Generated Names Settings`;
  }

  fix(model) {
    return {
      ...model,
      model: {
        ...model.model,
        sqlSettings: {
          ...model.model.sqlSettings,
          includeGeneratedNames: INCLUDE_GENERATED_NAMES_ALWAYS
        }
      }
    };
  }
}

export class MissingOrderProblem extends Problem {
  getTitle() {
    return `Missing Order`;
  }

  fix(model) {
    const newOrder = getOrderedObjectsReset(model.model.type)(model).map(
      (item) => item.id
    );
    return {
      ...model,
      order: newOrder
    };
  }
}

export class JSONRemovalProblem extends Problem {
  getTitle() {
    return `JSON Removal`;
  }

  getJSONType(type) {
    switch (type) {
      case ModelTypes.MARIADB:
      case ModelTypes.MYSQL:
        return MySQLFamilyHelpers.getJSONType();
      case ModelTypes.PG:
        return PGHelpers.getJSONType();
      case ModelTypes.SQLITE:
        return SQLiteHelpers.getJSONType();
      case ModelTypes.LOGICAL:
        return LogicalHelpers.getJSONType();
      default:
        getDefaultDataType(type, false);
    }
  }

  fix(model) {
    try {
      const tablesToRemove = _.filter(
        model.tables,
        (table) => table.embeddable
      );
      const relationsToRemove = _.reduce(
        tablesToRemove,
        (r, table) => [...r, ...table.relations],
        []
      );
      const linesToRemove = _.reduce(
        tablesToRemove,
        (r, table) => [...r, ...table.lines],
        []
      );

      const tablesWithoutLinksAndTablesToRemove = _.reduce(
        _.filter(model.tables, (table) => {
          return !_.find(
            tablesToRemove,
            (tableToRemove) => tableToRemove.id === table.id
          );
        }),
        (r, i) => ({
          ...r,
          [i.id]: {
            ...i,
            cols: _.map(i.cols, (col) => {
              if (
                _.find(tablesToRemove, (table) => table.id === col.datatype)
              ) {
                return Object.assign(
                  {},
                  {
                    ...col,
                    datatype: this.getJSONType(model.model.type)
                  }
                );
              }
              return col;
            }),
            lines: _.filter(
              i.lines,
              (lineId) => !linesToRemove.includes(lineId)
            ),
            relations: _.filter(
              i.relations,
              (relationId) => !relationsToRemove.includes(relationId)
            )
          }
        }),
        {}
      );
      const otherObjectsWithoutLinks = _.reduce(
        model.otherObjects,
        (r, i) => ({
          ...r,
          [i.id]: {
            ...i,
            lines: _.filter(
              i.lines,
              (lineId) => !linesToRemove.includes(lineId)
            )
          }
        }),
        {}
      );
      const notesWithoutLinks = _.reduce(
        model.notes,
        (r, i) => ({
          ...r,
          [i.id]: {
            ...i,
            lines: _.filter(
              i.lines,
              (lineId) => !linesToRemove.includes(lineId)
            )
          }
        }),
        {}
      );

      const linesWithoutLinesToTableToRemove = _.reduce(
        model.lines,
        (r, i) => {
          if (!linesToRemove.includes(i.id)) {
            r[i.id] = i;
          }
          return r;
        },
        {}
      );
      const relationsWithoutLinesToTableToRemove = _.reduce(
        model.relations,
        (r, i) => {
          if (!relationsToRemove.includes(i.id)) {
            r[i.id] = i;
          }
          return r;
        },
        {}
      );

      const diagramsWithoutTablesToRemove = _.reduce(
        { ...model.diagrams },
        (r, diagram) => ({
          ...r,
          [diagram.id]: {
            ...diagram,
            diagramItems: _.reduce(
              diagram.diagramItems,
              (r, di) => {
                if (
                  !_.find(
                    tablesToRemove,
                    (tableToRemove) => tableToRemove.id === di.referencedItemId
                  )
                ) {
                  return { ...r, [di.referencedItemId]: di };
                }
                return r;
              },
              {}
            )
          }
        }),
        {}
      );

      const orderWithoutTablesToRemove = _.filter(
        model.order,
        (orderItem) =>
          !_.find(
            tablesToRemove,
            (tableToRemove) => tableToRemove.id === orderItem
          )
      );

      const newModel = Object.assign(
        {},
        {
          ...model,
          tables: tablesWithoutLinksAndTablesToRemove,
          otherObjects: otherObjectsWithoutLinks,
          notes: notesWithoutLinks,
          lines: linesWithoutLinesToTableToRemove,
          relations: relationsWithoutLinesToTableToRemove,
          diagrams: diagramsWithoutTablesToRemove,
          order: orderWithoutTablesToRemove
        }
      );

      return newModel;
    } catch (e) {
      console.log({ e });
    }
    return model;
  }
}

export class OtherObjectGraphicsRemovalProblem extends Problem {
  constructor(otherObjectIds) {
    super();
    this.otherObjectIds = otherObjectIds;
  }

  fix(model) {
    return {
      ...model,
      otherObjects: _.reduce(
        model.otherObjects,
        (r, i) => {
          const updatedOtherObject = this.otherObjectIds.includes(i.id)
            ? _.omit(i, [
                "x",
                "y",
                "gWidth",
                "gHeight",
                "resized",
                "color",
                "background"
              ])
            : i;
          return { ...r, [updatedOtherObject.id]: updatedOtherObject };
        },
        {}
      )
    };
  }
}

export class TableNoPrimaryKeyProblem extends Problem {
  constructor(tableid) {
    super();
    this.tableid = tableid;
  }

  getTitle() {
    return "Table No Primary Key Problem";
  }

  findPk(table) {
    return table.keys.find((key) => key.name === "Primary key");
  }

  makePk(table) {
    const keyWithPrimaryKeyName = this.findPk(table);

    return keyWithPrimaryKeyName
      ? this.replaceOnlyKey(table, keyWithPrimaryKeyName)
      : this.addKey(table);
  }

  replaceOnlyKey(table, keyWithPrimaryKeyName) {
    return table.keys.map((key) =>
      key.id === keyWithPrimaryKeyName.id ? { ...key, isPk: true } : key
    );
  }

  addKey(table) {
    const newKey = {
      id: uuid(),
      name: "Primary key",
      isPk: true,
      cols: []
    };
    return [...table.keys, newKey];
  }

  fix(model) {
    return {
      ...model,
      tables: {
        ...model.tables,
        [this.tableid]: {
          ...model.tables[this.tableid],
          keys: [...this.makePk(model.tables[this.tableid])]
        }
      }
    };
  }
}

export class CreateNestedTableCopyProblem extends Problem {
  constructor(tableColsToCopy) {
    super();
    this.tableColsToCopy = tableColsToCopy;
    this.tablesToRemove = [];
  }

  getTitle() {
    return "Create Nested Table Copy Problem";
  }

  copy(model, table) {
    const newId = uuid();

    const newTable = {
      ...table,
      visible: false,
      id: newId,
      name: this.getObjectType(model),
      cols: _.map(table.cols, (col) => {
        if (model.tables[col.datatype]?.embeddable) {
          this.tablesToRemove.push(col.datatype);
          return {
            ...col,
            datatype: this.copy(model, model.tables[col.datatype])
          };
        }
        return col;
      })
    };
    model.tables[newTable.id] = newTable;
    this.createMainDiagramItem(model, newTable);

    return newId;
  }

  getObjectType(model) {
    return model.model.type === ModelTypes.MONGOOSE ? "Object" : "object";
  }

  createMainDiagramItem(model, newTable) {
    const mainDiagram = _.find(model.diagrams, (diagram) => diagram.main);
    const di = new ClassDiagramItem(newTable.id, 0, 0, 0, 0);
    mainDiagram.diagramItems[di.referencedItemId] = di;
  }

  fix(model) {
    try {
      _.forEach(this.tableColsToCopy, (tableColToCopy) => {
        const col = _.find(
          model.tables[tableColToCopy.table.id].cols,
          (col) => tableColToCopy.col.id == col.id
        );
        this.tablesToRemove.push(col.datatype);
        col.datatype = this.copy(
          model,
          model.tables[tableColToCopy.col.datatype]
        );
      });

      const relationIdsToRemove = _.map(
        _.filter(
          model.relations,
          (relation) =>
            this.tablesToRemove.includes(relation.parent) ||
            this.tablesToRemove.includes(relation.child)
        ),
        (relation) => relation.id
      );

      model.tables = this.removeTablesAndRelationsToRemove(
        model,
        relationIdsToRemove
      );
      model.relations = this.removeRelationsToRemove(
        model,
        relationIdsToRemove
      );
    } catch (e) {
      console.log(e);
    }

    return model;
  }

  removeRelationsToRemove(model, relationIdsToRemove) {
    return _.reduce(
      _.filter(
        model.relations,
        (relation) => !relationIdsToRemove.includes(relation.id)
      ),
      (r, relation) => ({ ...r, [relation.id]: relation }),
      {}
    );
  }

  removeTablesAndRelationsToRemove(model, relationIdsToRemove) {
    return _.reduce(
      _.filter(
        model.tables,
        (table) => !this.tablesToRemove.includes(table.id)
      ),
      (r, table) => ({
        ...r,
        [table.id]: {
          ...table,
          relations: _.filter(
            table.relations,
            (relation) => !relationIdsToRemove.includes(relation)
          )
        }
      }),
      {}
    );
  }
}

export class ColumnRefPropertyProblem extends Problem {
  constructor(colRefs) {
    super();
    this.colRefs = colRefs;
  }

  getTitle() {
    return "Column Ref Property Problem";
  }

  fix(model) {
    try {
      _.forEach(this.colRefs, (colRef) => {
        model.tables[colRef.table.id].cols = _.map(
          model.tables[colRef.table.id].cols,
          (col) => {
            if (colRef.col.id == col.id) {
              delete col.ref;
              return col;
            }
            return col;
          }
        );
      });
    } catch (e) {
      console.log(e);
    }

    return model;
  }
}

export class ModelerSchemaPropertiesMissingProblem extends Problem {
  constructor(instancePath, value) {
    super();
    this.instancePath = instancePath;
    this.value = value;
  }

  getTitle() {
    return `Missing Property ${this.instancePath.join(".")}`;
  }

  addProperty(instancePath, value, modelNode) {
    let result;
    const [first, ...rest] = instancePath;
    if (_.isEmpty(rest) && !!first) {
      if (_.isArray(modelNode)) {
        const a = [...modelNode];
        a[first] = value;
        result = a;
      } else {
        result = { ...modelNode, [first]: value };
      }
    } else if (!_.isEmpty(rest)) {
      if (_.isArray(modelNode)) {
        const b = [...modelNode];
        b[first] = this.addProperty(rest, value, modelNode[first]);
        result = b;
      } else {
        result = {
          ...modelNode,
          [first]: this.addProperty(rest, value, modelNode[first])
        };
      }
    } else {
      result = {};
    }

    return result;
  }

  fix(model) {
    return this.addProperty(this.instancePath, this.value, model);
  }
}

export class ProjectDefaultEngineProblem extends Problem {
  getTitle() {
    return "Project Default Engine Problem";
  }

  fix(model) {
    return {
      ...model,
      model: {
        ...model.model,
        def_tabletype: ""
      }
    };
  }
}

export class TableEngineProblem extends Problem {
  constructor(tableid) {
    super();
    this.tableid = tableid;
  }

  getTitle() {
    return "Table Engine Property Problem";
  }

  fix(model) {
    return {
      ...model,
      tables: {
        ...model.tables,
        [this.tableid]: {
          ...model.tables[this.tableid],
          tabletype: ""
        }
      }
    };
  }
}

export class ModelerSchemaPropertiesExtraProblem extends Problem {
  constructor(instancePath) {
    super();
    this.instancePath = instancePath;
  }

  getTitle() {
    return `Extra Property ${this.instancePath.join(".")}`;
  }

  removeProperty(instancePath, value, modelNode) {
    const [first, ...rest] = instancePath;
    if (_.isEmpty(rest) && !!first) {
      return _.omit(modelNode, [first]);
    } else if (!_.isEmpty(rest)) {
      if (_.isArray(modelNode)) {
        const d = [...modelNode];
        d[first] = this.removeProperty(rest, value, modelNode[first]);

        return d;
      } else {
        return {
          ...modelNode,
          [first]: this.removeProperty(rest, value, modelNode[first])
        };
      }
    } else {
      return {};
    }
  }

  fix(model) {
    return this.removeProperty(this.instancePath, this.value, model);
  }
}
