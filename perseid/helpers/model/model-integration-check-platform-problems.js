import {
  DefaultMySqlFamilySqlSettings,
  DefaultSqlSettings,
  INCLUDE_GENERATED_NAMES_ALWAYS
} from "../../generator/sql-model-to-lines/model_to_lines";

import { ModelTypes } from "../../enums/enums";
import { Problem } from "./model-integration-check-problems";
import { getOrderedObjectsReset } from "../../selectors/selector_order";
import { v4 as uuid } from "uuid";

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

  fix(model) {
    return {
      ...model,
      model: {
        ...model.model,
        sqlSettings:
          model.model.type === ModelTypes.MARIADB ||
          model.model.type === ModelTypes.MYSQL
            ? DefaultMySqlFamilySqlSettings
            : DefaultSqlSettings
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
      using: "na",
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
