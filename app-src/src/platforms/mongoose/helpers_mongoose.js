import React from "react";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";

const MongooseHelpers = {
  getMongooseDefaultEmbeddableType() {
    return "String";
  },

  getMongooseDefaultType() {
    return "String";
  },

  getMongooseHierarchyType() {
    return "Object";
  },

  getMongooseKeyType() {
    return "ObjectId";
  },

  getMongooseDataTypes() {
    return [
      "String",
      "Number",
      "Date",
      "Buffer",
      "Boolean",
      "Mixed",
      "ObjectId",
      "Array",
      "Decimal128",
      "Map"
    ];
  },

  makeDatatypesHierarchy(datatypeId, allTables) {
    const typeName = this.getMongooseHierarchyType();
    const value = allTables[datatypeId]?.embeddable ? datatypeId : typeName;
    return (
      <option key={typeName} value={value}>
        {typeName}
      </option>
    );
  },

  makeDatatypesMongoose() {
    var datatypesx = this.getMongooseDataTypes();
    datatypesx = datatypesx.sort();
    return _.map(datatypesx, (obj) => {
      return (
        <option key={uuidv4()} value={obj}>
          {obj}
        </option>
      );
    });
  },

  convertToId(currentId, customDataTypes) {
    var datatypes = this.getMongooseDataTypes();
    var toReturn;

    if (datatypes.includes(currentId)) {
      toReturn = currentId;
    } else if (customDataTypes.includes(currentId)) {
      toReturn = currentId;
    } else {
      toReturn = "ObjectId";
    }
    return toReturn;
  },

  makeDatatypesMongooseDetailed() {
    var datatypes = [
      ["String", "String"],
      ["Number", "Number"],
      ["Date", "Date"],
      ["Buffer", "Buffer"],
      ["Boolean", "Boolean"],
      ["Mixed", "Schema.Types.Mixed"],
      ["ObjectId", "Schema.Types.ObjectId"],
      ["Array", "Array"],
      ["Decimal128", "Schema.Types.Decimal128"],
      ["Map", "Map"]
    ].sort();

    return _.map(datatypes, (obj) => {
      return (
        <option key={obj[1]} value={obj[1]}>
          {obj[0]}
        </option>
      );
    });
  }
};
export default MongooseHelpers;
