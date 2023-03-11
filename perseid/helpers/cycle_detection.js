import _ from "lodash";

/**
 * Checks if table added to model creates a cycle
 *
 * @param {*} tables all tables from store
 * @param {*} addedTable table to add
 * @param {*} mainTableId table that is container for column of added table
 * @returns true if there is a cycle
 */
export function existsTableCycle(tables, addedTable, mainTableId) {
  if (
    _.filter(addedTable.cols, (col) => col.datatype === mainTableId).length > 0
  ) {
    return true;
  }

  return _.reduce(
    addedTable.cols,
    (createsCycle, col) => {
      if (createsCycle === true) {
        return true;
      }
      const datatypeTable = _.find(tables, ["id", col.datatype]);
      if (!!datatypeTable) {
        return existsTableCycle(tables, datatypeTable, mainTableId);
      }
      return false;
    },
    false
  );
}
