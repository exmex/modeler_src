import {
  getCardinality,
  getObjectLinesForReport
} from "../../reports/report_all_platforms";

import ReportHelpers from "../../helpers/report_helpers";
import _ from "lodash";

/* tables */
export const getMongooseTableDetailForReport = (
  table,
  tables,
  relations,
  lines,
  otherObjects
) => {
  if (table !== null) {
    var code = '<div id="detail-itm-' + table.id + '" class="mm-detail">';
    code += ReportHelpers.getImportantCaptionAndValueWrapper(
      "Name",
      table.name
    );
    code += ReportHelpers.getLongCaptionAndValueWrapper(
      "Description",
      table.desc
    );
    if (table.embeddable !== true) {
      code += getTableProps(table, tables);
    }

    code += ReportHelpers.getCssWrapperStart("mm-subsection");
    code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Properties");

    if (table.embeddable !== true) {
      code += ReportHelpers.getCssWrapperStart("mm-d-g-5");
      code += ReportHelpers.getColumnHeadersForReport([
        "Name",
        "Data type",
        "Param",
        "Key",
        "Not Null"
      ]);
      code += getColumnInfoForReport(table, tables, otherObjects);
      code += ReportHelpers.getCssWrapperEnd("mm-d-g-5");
    } else {
      code += ReportHelpers.getCssWrapperStart("mm-d-g-4");
      code += ReportHelpers.getColumnHeadersForReport([
        "Name",
        "Data type",
        "Array",
        "Not Null"
      ]);
      code += getTypesColumnInfoForReport(table, tables, otherObjects);
      code += ReportHelpers.getCssWrapperEnd("mm-d-g-4");
    }

    code += ReportHelpers.getCssWrapperEnd("mm-subsection");
    code += getMongooseTableIndexesForReport(table.indexes, table.cols);
    if (table.embeddable !== true) {
      code += getMongooseTableKeysForReport(table.keys, table.cols);
    }
    code += getMongooseTableRelationsForReport(
      table.relations,
      tables,
      relations
    );
    code += getObjectLinesForReport(table.lines, lines);

    code += "</div>";
    return code;
  }
};

export const getMongooseRelationDetailForReport = (relation, tables) => {
  if (relation !== null) {
    var code = '<div id="detail-itm-' + relation.id + '" class="mm-detail">';
    code += ReportHelpers.getImportantCaptionAndValueWrapper(
      "Name",
      relation.name
    );
    code += ReportHelpers.getLongCaptionAndValueWrapper(
      "Description",
      relation.desc
    );

    code += ReportHelpers.getCssWrapperStart("mm-subsection");
    code += ReportHelpers.getCssWrapperStart("mm-d-g-3");

    code += ReportHelpers.getColumnHeadersForReport([
      "Name",
      "Source",
      "Target"
    ]);

    code += ReportHelpers.getCssWrapperStart("mm-d-g-c-m-3");
    code += ReportHelpers.getCssAndContentWrapper("mm-spacer-xs", "");
    code += ReportHelpers.getCssWrapperEnd("mm-d-g-c-m-3");

    code += ReportHelpers.getFirstValueDivWrapper(
      `<a href="index.html?page=References&item=itm-${relation.id}">${relation.name}</a>`
    );
    code += ReportHelpers.getValueDivWrapper(
      `<a href="index.html?page=${
        tables[relation.parent].embeddable ? "Types" : "Schemas"
      }&item=itm-${relation.parent}">${tables[relation.parent].name}</a>`
    );
    code += ReportHelpers.getValueDivWrapper(
      `<a href="index.html?page=${
        tables[relation.child].embeddable ? "Types" : "Schemas"
      }&item=itm-${relation.child}">${tables[relation.child].name}</a>`
    );
    code += getCardinality(relation);
    code += ReportHelpers.getCssWrapperEnd("mm-d-g-3");
    code += ReportHelpers.getCssWrapperEnd("mm-subsection");

    code += getMongooseRelationKeysForReport(
      relation,
      tables[relation.parent],
      tables[relation.child]
    );

    code += getRelProps(relation);

    code += "</div>";

    return code;
  }
};

const getMongooseRelationKeysForReport = (
  relation,
  parentTable,
  childTable
) => {
  var code = "";
  code += ReportHelpers.getCssWrapperStart("mm-subsection");
  code += ReportHelpers.getCssAndContentWrapper(
    "mm-subtitle",
    "Key and properties"
  );

  for (var key of parentTable.keys) {
    if (relation.parent_key === key.id) {
      code += ReportHelpers.getCssWrapperStart("mm-d-g-3");
      code += ReportHelpers.getColumnHeadersForReport([
        "Key name",
        "Property in " + parentTable.name,
        "Property in " + childTable.name
      ]);

      var i = 0;
      for (var relationColItem of relation.cols) {
        if (i === 0) {
          code += ReportHelpers.getFirstValueDivWrapper(key.name);
        } else {
          code += ReportHelpers.getFirstValueDivWrapper("");
        }
        code += ReportHelpers.getValueDivWrapper(
          getColumnName(parentTable.cols, relationColItem.parentcol)
        );
        code += ReportHelpers.getValueDivWrapper(
          getColumnName(childTable.cols, relationColItem.childcol)
        );
        i++;
      }

      code += ReportHelpers.getCssWrapperEnd("mm-d-g-3");
    }
  }

  code += ReportHelpers.getCssWrapperEnd("mm-subsection");
  return code;
};

const getMongooseTableKeysForReport = (tableKeys, tableCols) => {
  if (tableKeys.length === 0) {
    return "";
  }
  var code = "";
  code += ReportHelpers.getCssWrapperStart("mm-subsection");
  code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Keys");

  for (var key of tableKeys) {
    code += ReportHelpers.getFirstValueDivWrapper(key.name);
    code += ReportHelpers.getCssWrapperStart("mm-d-hor");
    for (var keycol of key.cols) {
      code += ReportHelpers.getCaptionAndValueWrapper(
        "Property in " + key.name,
        getColumnName(tableCols, keycol.colid)
      );
    }
    code += ReportHelpers.getCssWrapperEnd("mm-d-hor");
  }

  code += ReportHelpers.getCssWrapperEnd("mm-subsection");
  return code;
};

const getMongooseTableIndexesForReport = (tableIndexes, tableCols) => {
  if (tableIndexes.length === 0) {
    return "";
  }
  var code = "";
  code += ReportHelpers.getCssWrapperStart("mm-subsection");
  code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Indexes");

  for (var ix of tableIndexes) {
    code += ReportHelpers.getFirstValueDivWrapper(ix.name);
    code += ReportHelpers.getCssWrapperStart("mm-d-hor");
    for (var ixcol of ix.cols) {
      code += ReportHelpers.getCaptionAndValueWrapper(
        "Property name",
        getColumnName(tableCols, ixcol.colid)
      );
    }

    code += ReportHelpers.getCaptionAndValueWrapper("Using", ix.using);
    code += ReportHelpers.getCaptionAndValueWrapper("Algorithm", ix.algorithm);
    code += ReportHelpers.getCaptionAndValueWrapper(
      "Lock Option",
      ix.lockoption
    );
    code += ReportHelpers.getCaptionAndValueWrapper("Unique", ix.unique);
    code += ReportHelpers.getCaptionAndValueWrapper("Fulltext", ix.fulltext);
    code += ReportHelpers.getCssWrapperEnd("mm-d-hor");
  }

  code += ReportHelpers.getCssWrapperEnd("mm-subsection");
  return code;
};

const getMongooseTableRelationsForReport = (
  tableRelations,
  tables,
  relations
) => {
  if (tableRelations.length === 0) {
    return "";
  }
  var code = "";
  code += ReportHelpers.getCssWrapperStart("mm-subsection");
  code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "References");
  code += ReportHelpers.getCssWrapperStart("mm-d-g-3");

  code += ReportHelpers.getColumnHeadersForReport(["Name", "Source", "Target"]);

  for (var rel of tableRelations) {
    let r = relations[rel];
    code += ReportHelpers.getCssWrapperStart("mm-d-g-c-m-3");
    code += ReportHelpers.getCssAndContentWrapper("mm-spacer-xs", "");
    code += ReportHelpers.getCssWrapperEnd("mm-d-g-c-m-3");

    code += ReportHelpers.getFirstValueDivWrapper(
      `<a href="index.html?page=References&item=itm-${rel}">${r.name}</a>`
    );
    code += ReportHelpers.getValueDivWrapper(
      `<a href="index.html?page=${
        tables[r.parent].embeddable ? "Types" : "Schemas"
      }&item=itm-${r.parent}">${tables[r.parent].name}</a>`
    );
    code += ReportHelpers.getValueDivWrapper(
      `<a href="index.html?page=${
        tables[r.child].embeddable ? "Types" : "Schemas"
      }&item=itm-${r.child}">${tables[r.child].name}</a>`
    );
  }

  code += ReportHelpers.getCssWrapperEnd("mm-d-g-3");
  code += ReportHelpers.getCssWrapperEnd("mm-subsection");

  return code;
};

const getColumnInfoForReport = (table, tables, otherObjects) => {
  if (table.cols.length === 0) {
    return "";
  }
  var code = "";
  for (var col of table.cols) {
    code += ReportHelpers.getCssWrapperStart("mm-d-g-c-m-5");
    code += ReportHelpers.getCssAndContentWrapper("mm-spacer-xs", "");
    code += ReportHelpers.getCssWrapperEnd("mm-d-g-c-m-5");
    code += ReportHelpers.getFirstValueDivWrapper(col.name);
    code += ReportHelpers.getValueDivWrapper(
      getColDatatype(col.datatype, tables, otherObjects)
    );
    code += ReportHelpers.getValueDivWrapper(col.param);
    code += ReportHelpers.getValueDivWrapper(col.pk);
    code += ReportHelpers.getValueDivWrapper(col.nn);
    code += getColProps(col, 5);
  }

  return code;
};

const getTypesColumnInfoForReport = (table, tables, otherObjects) => {
  if (table.cols.length === 0) {
    return "";
  }
  var code = "";
  for (var col of table.cols) {
    code += ReportHelpers.getCssWrapperStart("mm-d-g-c-m-4");
    code += ReportHelpers.getCssAndContentWrapper("mm-spacer-xs", "");
    code += ReportHelpers.getCssWrapperEnd("mm-d-g-c-m-4");
    code += ReportHelpers.getFirstValueDivWrapper(col.name);
    code += ReportHelpers.getValueDivWrapper(
      getColDatatype(col.datatype, tables, otherObjects)
    );

    code += ReportHelpers.getValueDivWrapper(col.list);
    code += ReportHelpers.getValueDivWrapper(col.nn);
    code += getTypesColProps(col, 4);
  }

  return code;
};

const getColDatatype = (datatype, tables, otherObjects) => {
  let tbl = _.find(tables, ["id", datatype]);
  let otherObj = _.find(otherObjects, ["id", datatype]);
  if (tbl) {
    return `<a href='index.html?page=${
      tbl.embeddable ? "Types" : "Schemas"
    }&item=itm-${tbl.id}'>${tbl.name}</a>`;
  } else if (otherObj) {
    return `<a href='index.html?page=Other&item=itm-${otherObj.id}'>${otherObj.name}</a>`;
  } else {
    return datatype;
  }
};

const getTableProps = (table, tables) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Schema options", table.others)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Before script",
      ReportHelpers.addPreWrapperForReport(table.beforeScript)
    )
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "After script",
      ReportHelpers.addPreWrapperForReport(table.afterScript)
    )
  ];

  code += ReportHelpers.getPropValuesVerticalForReport(otherOptions, true);
  return code;
};

const getTypesColProps = (col, colspan) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Description", col.comment)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Param", col.param)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Options", col.options)
  ];

  code += ReportHelpers.getColPropValuesForReport(otherOptions, true, colspan);
  return code;
};

const getColProps = (col, colspan) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Array", col.list)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Description", col.comment)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Param", col.param)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Options", col.options)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Ref", col.ref)
  ];

  code += ReportHelpers.getColPropValuesForReport(otherOptions, true, colspan);
  return code;
};

const getRelProps = (rel) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Description", rel.comment)
  ];

  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Code", rel.code)
  ];

  code += ReportHelpers.getPropValuesVerticalForReport(otherOptions, true);
  return code;
};

const getColumnName = (tablecols, col_id) => {
  var code = _.find(tablecols, ["id", col_id]);
  return code.name;
};
