import JsonSchemaHelpers from "../helpers_jsonschema";
import { TableControlTypesJson } from "../class_table_jsonschema";

export const getPath = (tables, tableToCol, tableId, colId) => {
  const table = tables[tableId];
  if (!colId) {
    return { root: table, path: [] };
  }
  const col = JsonSchemaHelpers.getColumnById(tables, tableId, colId);
  const parentCol = tableToCol[tableId];
  if (col && parentCol && table.nodeType !== TableControlTypesJson.SUBSCHEMA) {
    const path = getPath(
      tables,
      tableToCol,
      parentCol.parentTableId,
      parentCol.parentColId
    );
    return { root: path.root, path: [...path.path, { table, col }] };
  }
  if (!col) {
    return { root: table, path: [] };
  }
  return { root: table, path: [{ table, col }] };
};
