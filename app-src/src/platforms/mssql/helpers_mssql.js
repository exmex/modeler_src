import _ from "lodash";

const getBytesLength = (value) => {
  const multiByteChars = encodeURIComponent(value).match(/%[89ABab]/g);
  const multiByteCharsLength = multiByteChars ? multiByteChars.length : 0;
  return value ? value.length + multiByteCharsLength : 0;
};

export const shortenUnicodeString = (value, maxLengthInBytes) => {
  if (maxLengthInBytes <= 0) {
    return value;
  }
  const totalBytes = getBytesLength(value);
  let cutBytes = 0;
  let index = value.length;
  while (totalBytes - cutBytes > maxLengthInBytes) {
    const bytesOnIndex = getBytesLength(value[index - 1]);
    cutBytes += bytesOnIndex;
    index--;
  }
  return value.substr(0, index);
};

const MAX_BYTE_LENGTH = 64;
const SEPARATOR = "_";

const makeObjectName = (name1, name2, label) => {
  let overhead = 0;

  let name1chars = getBytesLength(name1);
  let name2chars = name2?.length > 0 ? getBytesLength(name2) : 0;
  if (name2chars > 0) {
    overhead++;
  }
  if (label) {
    overhead += getBytesLength(label) + 1;
  }

  const availchars = MAX_BYTE_LENGTH - 1 - overhead;

  while (name1chars + name2chars > availchars) {
    if (name1chars > name2chars) {
      name1chars--;
    } else {
      name2chars--;
    }
  }

  const name1final = shortenUnicodeString(name1, name1chars);
  const name2final =
    name2?.length > 0
      ? `${SEPARATOR}${shortenUnicodeString(name2, name2chars)}`
      : "";
  const labelfinal = label?.length > 0 ? `${SEPARATOR}${label}` : "";

  return `${name1final}${name2final}${labelfinal}`;
};

const makeUniqueObjectName = (name1, name2, label, existingNames) => {
  let currentSuffix = label;
  let index = 1;
  while (true) {
    const key = makeObjectName(name1, name2, currentSuffix);
    if (!existingNames?.[key]) {
      return key;
    }
    currentSuffix = `${label}${index}`;
    index++;
  }
};

const MSSQLHelpers = {  

  getMSSQLDefaultEmbeddableType() {
    return `string`;
  },

  getMSSQLDefaultType() {
    return `int`;
  },

  getJSONType() {
    return `json`;
  },

  getMSSQLKeyType() {
    return "int";
  },

  getMSSQLDataTypes() {
    return [
      `int`,
      `bigint`,
      `numeric`,
      `bit`,
      `smallint`,
      `decimal`,
      `smallmoney`,
      `tinyint`,
      `money`,
      `float`,
      `real`,
      `date`,
      `datetimeoffset`,
      `datetime2`,
      `smalldatetime`,
      `datetime`,
      `time`,
      `char`,
      `varchar`,
      `text`,
      `nchar`,
      `nvarchar`,
      `ntext`,
      `binary`,
      `varbinary`,
      `image`,
      `cursor`,
      `rowversion`,
      `hierarchyid`,
      `uniqueidentifier`,
      `sql_variant`,
      `xml`,
      `geometry`,
      `geography`
    ];
  },

  convertToId(currentId, customDataTypes) {
    var datatypes = this.getMSSQLDataTypes();
    var toReturn;

    if (datatypes.includes(currentId)) {
      toReturn = currentId;
    } else if (customDataTypes.includes(currentId)) {
      toReturn = currentId;
    } else {
      toReturn = MSSQLHelpers.getMSSQLDefaultType();
    }
    return toReturn;
  },

  makeDatatypesMSSQL() {
    var datatypesx = this.getMSSQLDataTypes();
    datatypesx = datatypesx.sort();

    return _.map(datatypesx, (obj) => {
      return (
        <option key={obj} value={obj}>
          {obj}
        </option>
      );
    });
  },
  makeUniquePKName(tableName, keyNames) {
    return makeUniqueObjectName(tableName, undefined, "pkey", keyNames);
  },
  makeUniqueAKName(tableName, colNames, keyNames) {
    return makeUniqueObjectName(
      tableName,
      colNames.join(SEPARATOR),
      "key",
      keyNames
    );
  },
  makeKeyName(key, table, tables) {
    if (key.isPk) {
      return MSSQLHelpers.makeUniquePKName(
        table.name,
        MSSQLHelpers.getAllKeysByNames(tables, [key.id])
      );
    } else {
      return MSSQLHelpers.makeUniqueAKName(
        table.name,
        _.map(MSSQLHelpers.getKeyColObjects(table, key), (col) => col?.name ?? ""),
        MSSQLHelpers.getAllKeysByNames(tables, [key.id])
      );
    }
  },
  makeUniqueRelationName(tableName, colNames, relationNames) {
    return makeUniqueObjectName(
      tableName,
      colNames.join(SEPARATOR),
      "fkey",
      relationNames
    );
  },
  makeUniqueIndexName(tableName, colNames, indexNames) {
    return makeUniqueObjectName(
      tableName,
      colNames.join(SEPARATOR),
      "idx",
      indexNames
    );
  },
  makeRelationName(relation, tables, relations) {
    return MSSQLHelpers.makeUniqueRelationName(
      tables[relation.child].name,
      _.map(
        MSSQLHelpers.getRelationTargetColObjects(tables, relation),
        (col) => col?.name ?? ""
      ),
      MSSQLHelpers.getAllRelationsByNames(relations, [relation.id])
    );
  },
  makeIndexName(index, table, tables) {
    return MSSQLHelpers.makeUniqueIndexName(
      table.name,
      _.map(
        MSSQLHelpers.getIndexColObjects(table, index),
        (col) => col?.name ?? ""
      ),
      MSSQLHelpers.getAllIndexesByNames(tables, [index.id])
    );
  },
  getKeyColObjects(table, key) {
    return _.map(key.cols, (keyCol) =>
      _.find(table.cols, (col) => col.id === keyCol.colid)
    );
  },
  getIndexColObjects(table, index) {
    return _.map(index.cols, (indexCol) =>
      _.find(table.cols, (col) => col.id === indexCol.colid)
    );
  },
  getRelationTargetColObjects(tables, relation) {
    const table = tables[relation.child];
    return _.map(relation.cols, (relationCol) =>
      _.find(table.cols, (col) => relationCol.childcol === col.id)
    );
  },
  getAllKeysByNames(tables, keyIdsToSkip) {
    const allKeyNames = {};
    _.forEach(tables, (table) => {
      _.forEach(table.keys, (key) => {
        if (!keyIdsToSkip?.includes(key.id)) {
          allKeyNames[key.name] = key;
        }
      });
    });
    return allKeyNames;
  },
  getAllIndexesByNames(tables, indexIdsToSkip) {
    const allIndexNames = {};
    _.forEach(tables, (table) => {
      _.forEach(table.indexes, (index) => {
        if (!indexIdsToSkip?.includes(index.id)) {
          allIndexNames[index.name] = index;
        }
      });
    });
    return allIndexNames;
  },
  getAllRelationsByNames(relations, relationIdsToSkip) {
    const allRelationNames = {};
    _.forEach(relations, (relation) => {
      if (!relationIdsToSkip?.includes(relation.id)) {
        allRelationNames[relation.name] = relation;
      }
    });
    return allRelationNames;
  },
  getTableIndex(table) {
    const tableIndexes = {};
    _.forEach(table.indexes, (index) => {
      tableIndexes[index.id] = index;
    });

    return tableIndexes;
  },
  getTableIndexWithColumn(table, column) {
    const tableIndexes = {};
    _.forEach(table.indexes, (index) => {
      if (_.find(index.cols, (indexcol) => indexcol.colid === column.id)) {
        tableIndexes[index.id] = index;
      }
    });
    return tableIndexes;
  },
  getTableKey(table) {
    const tableKeys = {};
    _.forEach(table.keys, (key) => {
      tableKeys[key.id] = key;
    });

    return tableKeys;
  },
  getTableKeyWithColumn(table, column) {
    const tableKeys = {};
    _.forEach(table.keys, (key) => {
      if (_.find(key.cols, (keycol) => keycol.colid === column.id)) {
        tableKeys[key.id] = key;
      }
    });
    return tableKeys;
  },
  getTableRelation(relations, tables) {
    const tableRelations = {};
    _.forEach(tables, (table) => {
      _.forEach(table.relations, (relationId) => {
        const relation = relations[relationId];
        if (relation?.child === table.id) {
          tableRelations[relationId] = relation;
        }
      });
    });
    return tableRelations;
  },
  getTableRelationWithColumn(relations, tables, column) {
    const tableRelations = {};
    _.forEach(tables, (table) => {
      _.forEach(table.relations, (relationId) => {
        const relation = relations[relationId];
        if (_.find(relation.cols, (relCol) => relCol.childcol === column.id)) {
          tableRelations[relationId] = relation;
        }
      });
    });
    return tableRelations;
  }
};
export default MSSQLHelpers;
