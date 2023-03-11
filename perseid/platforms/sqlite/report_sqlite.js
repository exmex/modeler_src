import {
  getCardinality,
  getObjectLinesForReport
} from "../../reports/report_all_platforms";

import ReportHelpers from "../../helpers/report_helpers";
import _ from "lodash";

/* tables */
export const getSqliteTableDetailForReport = (
  table,
  tables,
  relations,
  lines
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
    code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Columns");

    if (table.embeddable !== true) {
      code += ReportHelpers.getCssWrapperStart("mm-d-g-4");
      code += ReportHelpers.getColumnHeadersForReport([
        "Name",
        "Data type",
        "Key",
        "Not Null"
      ]);
      code += getColumnInfoForReport(table, tables);
      code += ReportHelpers.getCssWrapperEnd("mm-d-g-4");
    } else {
      code += ReportHelpers.getCssWrapperStart("mm-d-g-4");
      code += ReportHelpers.getColumnHeadersForReport([
        "Name",
        "Data type",
        "Array",
        "Not Null"
      ]);
      code += getJsonColumnInfoForReport(table, tables);
      code += ReportHelpers.getCssWrapperEnd("mm-d-g-4");
    }

    code += ReportHelpers.getCssWrapperEnd("mm-subsection");
    code += getSqliteTableIndexesForReport(table.indexes, table.cols);
    if (table.embeddable !== true) {
      code += getSqliteTableKeysForReport(table.keys, table.cols);
    }
    code += getSqliteTableRelationsForReport(
      table.relations,
      tables,
      relations
    );
    code += getObjectLinesForReport(table.lines, lines);

    code += "</div>";
    return code;
  }
};

export const getSqliteRelationDetailForReport = (relation, tables) => {
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
      `<a href="index.html?page=Relationships&item=itm-${relation.id}">${relation.name}</a>`
    );
    code += ReportHelpers.getValueDivWrapper(
      `<a href="index.html?page=Tables&item=itm-${relation.parent}">${
        tables[relation.parent].name
      }</a>`
    );
    code += ReportHelpers.getValueDivWrapper(
      `<a href="index.html?page=Tables&item=itm-${relation.child}">${
        tables[relation.child].name
      }</a>`
    );
    code += getCardinality(relation);
    code += ReportHelpers.getCssWrapperEnd("mm-d-g-3");
    code += ReportHelpers.getCssWrapperEnd("mm-subsection");

    code += getSqliteRelationKeysForReport(
      relation,
      tables[relation.parent],
      tables[relation.child]
    );

    code += getRelProps(relation);

    code += "</div>";

    return code;
  }
};

const getSqliteRelationKeysForReport = (relation, parentTable, childTable) => {
  var code = "";
  code += ReportHelpers.getCssWrapperStart("mm-subsection");
  code += ReportHelpers.getCssAndContentWrapper(
    "mm-subtitle",
    "Key and columns"
  );

  for (var key of parentTable.keys) {
    if (relation.parent_key === key.id) {
      code += ReportHelpers.getCssWrapperStart("mm-d-g-3");
      code += ReportHelpers.getColumnHeadersForReport([
        "Key name",
        "Column in " + parentTable.name,
        "Column in " + childTable.name
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

const getSqliteTableKeysForReport = (tableKeys, tableCols) => {
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
        "Column in " + key.name,
        getColumnName(tableCols, keycol.colid)
      );
    }
    code += ReportHelpers.getCssWrapperEnd("mm-d-hor");
  }

  code += ReportHelpers.getCssWrapperEnd("mm-subsection");
  return code;
};

const getSqliteTableIndexesForReport = (tableIndexes, tableCols) => {
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
      let colProp = "";
      code += ReportHelpers.getCaptionAndValueWrapper(
        "Column name",
        getColumnName(tableCols, ixcol.colid)
      );
      colProp += ReportHelpers.getCssWrapperStart("mm-d-hor");
      colProp += ReportHelpers.getCaptionAndValueWrapper(
        "Descending",
        ixcol.sqlite.desc
      );
      colProp += ReportHelpers.getCaptionAndValueWrapper(
        "Collation",
        ixcol.sqlite.collate
      );
      colProp += ReportHelpers.getCaptionAndValueWrapper(
        "Expression",
        ixcol.sqlite.expression
      );
      colProp += ReportHelpers.getCssWrapperEnd("mm-d-hor");
      code += ReportHelpers.getCaptionAndValueWrapper("", colProp);
    }
    code += ReportHelpers.getCaptionAndValueWrapper("Unique", ix.unique);
    code += ReportHelpers.getCaptionAndValueWrapper(
      "Expression",
      ix.sqlite.expression
    );
    code += ReportHelpers.getCaptionAndValueWrapper(
      "Description",
      ix.sqlite.desc
    );
    code += ReportHelpers.getCssWrapperEnd("mm-d-hor");
  }

  code += ReportHelpers.getCssWrapperEnd("mm-subsection");
  return code;
};

const getSqliteTableRelationsForReport = (
  tableRelations,
  tables,
  relations
) => {
  if (tableRelations.length === 0) {
    return "";
  }
  var code = "";
  code += ReportHelpers.getCssWrapperStart("mm-subsection");
  code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Relations");
  code += ReportHelpers.getCssWrapperStart("mm-d-g-3");

  code += ReportHelpers.getColumnHeadersForReport(["Name", "Source", "Target"]);

  for (var rel of tableRelations) {
    let r = relations[rel];
    code += ReportHelpers.getCssWrapperStart("mm-d-g-c-m-3");
    code += ReportHelpers.getCssAndContentWrapper("mm-spacer-xs", "");
    code += ReportHelpers.getCssWrapperEnd("mm-d-g-c-m-3");

    code += ReportHelpers.getFirstValueDivWrapper(
      `<a href="index.html?page=Relationships&item=itm-${rel}">${r.name}</a>`
    );
    code += ReportHelpers.getValueDivWrapper(
      `<a href="index.html?page=${
        tables[r.parent].embeddable ? "Json" : "Tables"
      }&item=itm-${r.parent}">${tables[r.parent].name}</a>`
    );
    code += ReportHelpers.getValueDivWrapper(
      `<a href="index.html?page=${
        tables[r.child].embeddable ? "Json" : "Tables"
      }&item=itm-${r.child}">${tables[r.child].name}</a>`
    );
  }

  code += ReportHelpers.getCssWrapperEnd("mm-d-g-3");
  code += ReportHelpers.getCssWrapperEnd("mm-subsection");

  return code;
};

const getColumnInfoForReport = (table, tables) => {
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
      getColDatatype(col.datatype, tables)
    );
    code += ReportHelpers.getValueDivWrapper(col.pk);
    code += ReportHelpers.getValueDivWrapper(col.nn);
    code += getColProps(col, 4);
  }

  return code;
};

const getJsonColumnInfoForReport = (table, tables) => {
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
      getColDatatype(col.datatype, tables)
    );
    code += ReportHelpers.getValueDivWrapper(col.list);
    code += ReportHelpers.getValueDivWrapper(col.nn);
    code += getJsonColProps(col, 4);
  }

  return code;
};

const getColDatatype = (datatype, tables) => {
  let tbl = _.find(tables, ["id", datatype]);
  if (tbl) {
    return `<a href='index.html?page=${
      tbl.embeddable ? "Json" : "Tables"
    }&item=itm-${tbl.id}'>${tbl.name}</a>`;
  } else {
    return datatype;
  }
};

const getTableProps = (table, tables) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Without ROWID",
      table.sqlite?.withoutrowid
    )
  ];
  code += ReportHelpers.getPropValuesVerticalForReport(otherOptions, true);
  return code;
};

const getJsonColProps = (col, colspan) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Description", col.comment)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Default value", col.defaultvalue)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "After script",
      ReportHelpers.addPreWrapperForReport(col.after)
    )
  ];

  code += ReportHelpers.getColPropValuesForReport(otherOptions, true, colspan);
  return code;
};

const getColProps = (col, colspan) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Default value", col.defaultvalue)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Autoincrement",
      col.sqlite?.autoincrement
    )
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Collation", col.collation)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Description", col.comment)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "After script",
      ReportHelpers.addPreWrapperForReport(col.after)
    )
  ];

  code += ReportHelpers.getColPropValuesForReport(otherOptions, true, colspan);
  return code;
};

const getRelProps = (rel) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Rerefential integrity - parent delete",
      rel.ri_pd
    )
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Referential integrity - parent update",
      rel.ri_pu
    )
  ];
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
