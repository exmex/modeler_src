import _ from "lodash";

export class RootObjectIterator {
  constructor(model, property) {
    this.model = model;
    this.property = property;
  }

  iterate() {
    return this.model[this.property]
      ? Object.keys(this.model[this.property]).map(
          (key) => this.model[this.property][key]
        )
      : [];
  }
}

export class ColumnIterator {
  constructor(tableIterator) {
    this.tableIterator = tableIterator;
  }

  iterate() {
    const tables = this.tableIterator.iterate();
    return tables
      .map((table) => table.cols.map((col) => ({ table, col })))
      .reduce((r, i) => [...r, ...i], []);
  }
}

export class DiagramItemIterator {
  constructor(diagramIterator) {
    this.diagramIterator = diagramIterator;
  }

  iterate() {
    const diagrams = this.diagramIterator.iterate();
    return diagrams
      .map((diagram) =>
        _.map(diagram.diagramItems, (diagramItem) => ({ diagram, diagramItem }))
      )
      .reduce((r, i) => [...r, ...i], []);
  }
}

export class KeyIterator {
  constructor(tableIterator) {
    this.tableIterator = tableIterator;
  }

  iterate() {
    const tables = this.tableIterator.iterate();
    return tables
      .map((table) => table.keys.map((key) => ({ table, key })))
      .reduce((r, i) => [...r, ...i], []);
  }
}

export class IndexIterator {
  constructor(tableIterator) {
    this.tableIterator = tableIterator;
  }

  iterate() {
    const tables = this.tableIterator.iterate();
    return tables
      .map((table) => table.indexes.map((index) => ({ table, key: index })))
      .reduce((r, i) => [...r, ...i], []);
  }
}

export class KeyColIterator {
  constructor(keyIterator) {
    this.keyIterator = keyIterator;
  }

  iterate() {
    const keys = this.keyIterator.iterate();
    return keys
      .map((tableKeyTuple) =>
        tableKeyTuple.key.cols.map((keycol) => ({
          table: tableKeyTuple.table,
          key: tableKeyTuple.key,
          keycol
        }))
      )
      .reduce((r, i) => [...r, ...i], []);
  }
}

export class IndexColIterator {
  constructor(indexIterator) {
    this.indexIterator = indexIterator;
  }

  iterate() {
    const indexes = this.indexIterator.iterate();
    return indexes
      .map((tableIndexTuple) =>
        tableIndexTuple.key.cols.map((indexcol) => ({
          table: tableIndexTuple.table,
          key: tableIndexTuple.key,
          keycol: indexcol
        }))
      )
      .reduce((r, i) => [...r, ...i], []);
  }
}

export class TableColFinder {
  constructor(table, colid) {
    this.table = table;
    this.colid = colid;
  }

  find() {
    return this.table && this.table.cols.find((col) => col.id === this.colid);
  }
}

export class LineEndpointFinder {
  constructor(model, endpointid) {
    this.model = model;
    this.endpointid = endpointid;
  }

  find() {
    if (this.model.otherObjects[this.endpointid]) {
      return this.model.otherObjects[this.endpointid];
    }
    if (this.model.notes[this.endpointid]) {
      return this.model.notes[this.endpointid];
    }
    if (this.model.tables[this.endpointid]) {
      return this.model.tables[this.endpointid];
    }
    return undefined;
  }
}

export class RelationEndpointFinder {
  constructor(model, endpointid) {
    this.model = model;
    this.endpointid = endpointid;
  }

  find() {
    if (this.model.tables[this.endpointid]) {
      return this.model.tables[this.endpointid];
    }
    return undefined;
  }
}
