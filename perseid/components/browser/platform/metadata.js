import { DISCLOSURE, ORDER, VISIBILITY } from "../tree/definitions";
import { ModelObjectProperties, ModelTypes } from "../../../enums/enums";

import { OtherObjectTypes } from "../../../classes/class_other_object";
import _ from "lodash";
import { graphQLMetadata } from "./graphql/graphqlMetadata";
import {
  jsonSchemaMetadata,
  openAPIMetadata
} from "./jsonSchema/jsonSchemaMetadata";
import { logicalMetadata } from "./logicalMetadata/logicalMetadata";
import { mongoDbMetadata } from "./mongodb/mongodbMetadata";
import { mongooseMetadata } from "./mongoose/mongooseMetadata";
import { mysqlFamilyMetadata } from "./mysql_family/mysqlFamilyMetadata";
import { pgMetadata } from "./pg/pgMetadata";
import { sequelizeMetadata } from "./sequelize/sequelizeMetadata";
import { sqliteMetadata } from "./sqlite/sqliteMetadata";

export function lineIdGroup() {
  return {
    defaultDisclosure: DISCLOSURE.CLOSE,
    defaultVisibility: VISIBILITY.HIDE,
    getObjects: (model, objOwner) =>
      _.filter(
        _.map(objOwner.lines, (lineId) => model.lines[lineId]),
        (item) => !!item
      ),
    label: "L_LINES",
    ...ModelObjectProperties.LINE
  };
}

export function relationIdGroup() {
  return {
    defaultDisclosure: DISCLOSURE.CLOSE,
    defaultVisibility: VISIBILITY.HIDE,
    getObjects: (model, objOwner) =>
      _.filter(
        _.map(objOwner.relations, (relationId) => model.relations[relationId]),
        (item) => !!item
      ),
    label: "L_RELATIONS",
    ...ModelObjectProperties.RELATION
  };
}

export function columnGroup() {
  return {
    defaultDisclosure: DISCLOSURE.CLOSE,
    defaultVisibility: VISIBILITY.HIDE,
    order: ORDER.DEFAULT,
    hasContextMenu: false,
    hasEditAction: false,
    getObjects: (model, objOwner) =>
      _.filter(
        objOwner.cols,
        (col) => col.isHidden === undefined || !col.isHidden
      ),
    label: "L_COLUMNS",
    ...ModelObjectProperties.COLUMN
  };
}

export function indexesGroup() {
  return {
    defaultDisclosure: DISCLOSURE.CLOSE,
    defaultVisibility: VISIBILITY.HIDE,
    getObjects: (model, objOwner) => objOwner.indexes,
    hasContextMenu: false,
    hasEditAction: false,
    label: "L_INDEXES",
    ...ModelObjectProperties.INDEX
  };
}

export function keyGroup() {
  return {
    defaultDisclosure: DISCLOSURE.CLOSE,
    defaultVisibility: VISIBILITY.HIDE,
    getObjects: (model, objOwner) => objOwner.keys,
    hasContextMenu: false,
    hasEditAction: false,
    label: "L_KEYS",
    ...ModelObjectProperties.KEY
  };
}

export const tableGroups = {
  columns: columnGroup(),
  indexes: indexesGroup(),
  keys: keyGroup(),
  relations: relationIdGroup(),
  lines: lineIdGroup()
};

export const jsonGroups = {
  columns: columnGroup(),
  lines: lineIdGroup()
};

export const noteGroup = {
  notes: {
    getObjects: (model, objOwner) => _.values(model.notes),
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_NOTES",
    ...ModelObjectProperties.NOTE
  }
};

export const otherObjectGroup = {
  others: {
    getObjects: (model, objOwner) =>
      _.filter(model.otherObjects, (item) => item.type === "Other"),
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_OTHERS",
    ...ModelObjectProperties.OTHER_OBJECT,
    propertyName: "others"
  }
};

export const triggerGroup = {
  triggers: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.otherObjects,
        (item) => item.type === OtherObjectTypes.Trigger
      ),
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_TRIGGERS",
    ...ModelObjectProperties.OTHER_OBJECT,
    propertyName: "triggers"
  }
};

export const sequenceGroup = {
  sequences: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.otherObjects,
        (item) => item.type === OtherObjectTypes.Sequence
      ),
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_SEQUENCES",
    ...ModelObjectProperties.OTHER_OBJECT,
    propertyName: "sequences"
  }
};

export const policyGroup = {
  policies: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.otherObjects,
        (item) => item.type === OtherObjectTypes.Policy
      ),
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_POLICIES",
    ...ModelObjectProperties.OTHER_OBJECT,
    propertyName: "policies"
  }
};

export const rulesGroup = {
  rules: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.otherObjects,
        (item) => item.type === OtherObjectTypes.Rule
      ),
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_RULES",
    ...ModelObjectProperties.OTHER_OBJECT,
    propertyName: "rules"
  }
};

export const procedureGroup = {
  procedures: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.otherObjects,
        (item) => item.type === OtherObjectTypes.Procedure
      ),
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_PROCEDURES",
    ...ModelObjectProperties.OTHER_OBJECT,
    propertyName: "procedures"
  }
};

export const functionGroup = {
  functions: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.otherObjects,
        (item) => item.type === OtherObjectTypes.Function
      ),
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_FUNCTIONS",
    ...ModelObjectProperties.OTHER_OBJECT,
    propertyName: "functions"
  }
};

export const domainGroup = {
  domains: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.otherObjects,
        (item) => item.type === OtherObjectTypes.Domain
      ),
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_DOMAINS",
    ...ModelObjectProperties.OTHER_OBJECT,
    propertyName: "domains"
  }
};

export const typeGroup = {
  types: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.otherObjects,
        (item) => item.type === OtherObjectTypes.TypeOther
      ),
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_TYPE",
    ...ModelObjectProperties.OTHER_OBJECT,
    propertyName: "types"
  }
};

export const enumGroup = {
  enums: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.otherObjects,
        (item) => item.type === OtherObjectTypes.Enum
      ),
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_ENUMS",
    ...ModelObjectProperties.OTHER_OBJECT,
    propertyName: "enums"
  }
};

export const materializedViewGroup = {
  materializedViews: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.otherObjects,
        (item) => item.type === OtherObjectTypes.MaterializedView
      ),
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_MATERIALIZED_VIEWS",
    ...ModelObjectProperties.OTHER_OBJECT,
    propertyName: "materializedViews"
  }
};

export const viewGroup = {
  views: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.otherObjects,
        (item) => item.type === OtherObjectTypes.View
      ),
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_VIEWS",
    ...ModelObjectProperties.OTHER_OBJECT,
    propertyName: "views"
  }
};

export const lineGroup = {
  lines: {
    getObjects: (model, objOwner) => _.values(model.lines),
    focusableItems: true,
    label: "L_LINES",
    ...ModelObjectProperties.LINE
  }
};

export const relationGroup = {
  relations: {
    getObjects: (model, objOwner) => _.values(model.relations),
    focusableItems: true,
    ...ModelObjectProperties.RELATION,
    label: "L_RELATIONS"
  }
};

export const jsonGroup = {
  jsons: {
    getObjects: (model) =>
      _.filter(model.tables, (item) => item.embeddable === true),
    groups: jsonGroups,
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_TABLES_EMBEDDABLE",
    ...ModelObjectProperties.TABLE,
    propertyName: "jsons"
  }
};

export const tableGroup = {
  tables: {
    getObjects: (model, objOwner) =>
      _.filter(
        model.tables,
        (item) =>
          (item.objectType === "table" || !item.objectType) &&
          (item.embeddable === false || !item.embeddable)
      ),
    ...ModelObjectProperties.TABLE,
    groups: tableGroups,
    selectableItems: true,
    focusableItems: true,
    hasVisibilityControl: true,
    label: "L_TABLES"
  }
};

export const modelGroup = {
  project: {
    getObjects: (model, objOwner) => [model.model],
    ...ModelObjectProperties.MODEL,
    focusableItems: true,
    label: "L_MODEL",
    hasContextMenu: false,
    isCountHidden: true
  }
};

export const getBrowserTreeMetadataByPlatform = (type) => {
  switch (type) {
    case ModelTypes.GRAPHQL:
      return graphQLMetadata();
    case ModelTypes.MONGODB:
      return mongoDbMetadata();
    case ModelTypes.MONGOOSE:
      return mongooseMetadata();
    case ModelTypes.MYSQL:
    case ModelTypes.MARIADB:
      return mysqlFamilyMetadata();
    case ModelTypes.PG:
      return pgMetadata();
    case ModelTypes.SQLITE:
      return sqliteMetadata();
    case ModelTypes.SEQUELIZE:
      return sequelizeMetadata();
    case ModelTypes.JSONSCHEMA:
    case ModelTypes.FULLJSON:
      return jsonSchemaMetadata();
    case ModelTypes.OPENAPI:
      return openAPIMetadata();
    case ModelTypes.LOGICAL:
      return logicalMetadata();
    default:
      return undefined;
  }
};
