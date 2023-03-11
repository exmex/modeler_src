import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import _ from "lodash";
import { createSelector } from "reselect";

const allTables = (state) => state.tables;

export const getGraphicsTablesList = createSelector(
  [allTables],
  (allTables) => {
    let tableGraphicsArray = {};

    _.map(allTables, (table) => {
      let desiredColsProp = [];
      _.map(table.cols, (col) => {
        desiredColsProp = [
          ...desiredColsProp,
          {
            id: col.id,
            name: col.name,
            datatype: col.datatype,
            data: col.data,
            param: col.param,
            pk: col.pk,
            fk: col.fk,
            nn: col.nn,
            list: col.list,
            isHidden: col.isHidden,
            isArrayItemNn: col.isArrayItemNn
          }
        ];
      });

      tableGraphicsArray = {
        ...tableGraphicsArray,
        [table.id]: {
          id: table.id,
          name: table.name,
          embeddable: table.embeddable,
          visible: table.visible,
          x: table.x,
          y: table.y,
          gHeight: table.gHeight,
          gWidth: table.gWidth,
          desc: table.desc,
          color: table.color,
          background: table.background,
          resized: table.resized,
          cols: desiredColsProp,
          relations: table.relations,
          lines: table.lines,
          keys: table.keys,
          indexes: table.indexes,
          objectType: table.objectType
        }
      };
    });

    return {
      tableGraphicsArray
    };
  }
);

export const getEmbeddableWithColsList = createSelector(
  [allTables],
  (allTables) => {
    let tableEmbeddableWithColsArray = {};

    _.map(allTables, (table) => {
      //table = _.unset(table, "keys");
      let desiredColsProp = [];
      _.map(table.cols, (col) => {
        desiredColsProp = [
          ...desiredColsProp,
          {
            id: col.id,
            name: col.name,
            datatype: col.datatype,
            list: col.list
          }
        ];
      });
      if (table.embeddable === true) {
        tableEmbeddableWithColsArray = {
          ...tableEmbeddableWithColsArray,
          [table.id]: {
            id: table.id,
            name: table.name,
            embeddable: table.embeddable,
            cols: desiredColsProp,
            objectType: table.objectType
            //relations: table.relations,
            //keys: table.keys
          }
        };
      }
    });

    tableEmbeddableWithColsArray = _.sortBy(tableEmbeddableWithColsArray, [
      "name"
    ]);

    return {
      tableEmbeddableWithColsArray
    };
  }
);

export const getRootJsonSchemaTableList = createSelector(
  [allTables],
  (allTables) => {
    let rootJsonSchemaArray = {};

    let rootTables = _.filter(allTables, function (o) {
      return (
        JsonSchemaHelpers.isSchema(o) ||
        JsonSchemaHelpers.isDef(o) ||
        JsonSchemaHelpers.isRef(o)
      );
    });

    _.map(rootTables, (table) => {
      let desiredColsProp = [];
      _.map(table.cols, (col) => {
        desiredColsProp = [
          ...desiredColsProp,
          {
            id: col.id,
            name: col.name,
            datatype: col.datatype,
            nn: col.nn
          }
        ];
      });

      rootJsonSchemaArray = {
        ...rootJsonSchemaArray,
        [table.id]: {
          id: table.id,
          name: table.name,
          embeddable: table.embeddable,
          visible: table.visible,
          cols: desiredColsProp,
          objectType: table.objectType
        }
      };
    });

    return {
      rootJsonSchemaArray
    };
  }
);
