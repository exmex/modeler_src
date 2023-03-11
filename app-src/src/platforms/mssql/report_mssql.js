import {
  getCardinality,
  getObjectLinesForReport
} from "../../reports/report_all_platforms";

import ReportHelpers from "../../helpers/report_helpers";
import _ from "lodash";

/* tables */
export const getMSSQLTableDetailForReport = (
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
    if (table.objectType === "table") {
      code += getTableProps(table, tables);
    }

    code += ReportHelpers.getCssWrapperStart("mm-subsection");
    code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Columns");

    if (table.objectType && table.objectType === "table") {
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
      code += getJsonColumnInfoForReport(table, tables, otherObjects);
      code += ReportHelpers.getCssWrapperEnd("mm-d-g-4");
    }

    code += ReportHelpers.getCssWrapperEnd("mm-subsection");
    code += getMSSQLTableIndexesForReport(table.indexes, table.cols);
    if (table.objectType && table.objectType === "table") {
      code += getMSSQLTableKeysForReport(table.keys, table.cols);
    }
    code += getMSSQLTableRelationsForReport(table.relations, tables, relations);
    code += getObjectLinesForReport(table.lines, lines);

    code += "</div>";
    return code;
  }
};

export const getMSSQLRelationDetailForReport = (relation, tables) => {
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

    code += getMSSQLRelationKeysForReport(
      relation,
      tables[relation.parent],
      tables[relation.child]
    );

    code += getRelProps(relation);

    code += "</div>";

    return code;
  }
};

export const getMSSQLSequence = (otherObject, colspan) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Start with",
      otherObject.mssql?.sequence?.start
    )
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Increment by",
      otherObject.mssql?.sequence?.increment
    )
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Min",
      otherObject.mssql?.sequence?.minValue
    )
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Max",
      otherObject.mssql?.sequence?.maxValue
    )
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Cache",
      otherObject.mssql?.sequence?.cache
    )
  ];

  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Cycle",
      otherObject.mssql?.sequence?.isCycling
    )
  ];
  code += ReportHelpers.getColPropValuesForReport(otherOptions, true, colspan);
  return code;
};

export const getMSSQLUserDataType = (otherObject, colspan) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Base type",
      otherObject.mssql?.udt?.baseType
    )
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Params",
      otherObject.mssql?.udt?.params
    )
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "External name",
      otherObject.mssql?.udt?.externalName
    )
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "As table",
      otherObject.mssql?.udt?.asTable
    )
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Not null",
      otherObject.mssql?.udt?.isNotNull
    )
  ];
  code += ReportHelpers.getColPropValuesForReport(otherOptions, true, colspan);
  return code;
};

const getMSSQLRelationKeysForReport = (relation, parentTable, childTable) => {
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

const getMSSQLTableKeysForReport = (tableKeys, tableCols) => {
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

const getIndexProperties = (index) => {
  switch (index.mssql.type) {
    case "SPATIAL":
      return getIndexSpatial(index);
    case "XML":
      return getIndexXml(index);
    case "COLUMNSTORE":
      return getIndexColumnstore(index);
    case "FULLTEXT":
      return getIndexFulltext(index);
    case "RELATIONAL":
    default:
      return getIndexRelational(index);
  }
};

const getIndexRelational = (index) => {
  var code = "";
  code += ReportHelpers.getCaptionAndValueWrapper("Unique", index.unique);
  index.mssql?.clustered
    ? (code += ReportHelpers.getCaptionAndValueWrapper(
        "Clustered",
        index.mssql?.clustered
      ))
    : (code += "");
  index.mssql?.where
    ? (code += ReportHelpers.getCaptionAndValueWrapper(
        "Where",
        ReportHelpers.addPreWrapperForReport(index.mssql?.where)
        
      ))
    : (code += "");
  index.mssql?.with
    ? (code += ReportHelpers.getCaptionAndValueWrapper(
        "With",
        ReportHelpers.addPreWrapperForReport(index.mssql?.with)
      ))
    : (code += "");
  index.mssql?.on
    ? (code += ReportHelpers.getCaptionAndValueWrapper("On", ReportHelpers.addPreWrapperForReport(index.mssql?.on)))
    : (code += "");
  return code;
};

const getIndexSpatial = (index) => {
  var code = "";
  index.mssql?.spec
    ? (code += ReportHelpers.getCaptionAndValueWrapper(
        "Code",
        ReportHelpers.addPreWrapperForReport(index.mssql?.spec) 
      ))
    : (code += "");
  return code;
};

const getIndexXml = (index) => {
  var code = "";
  index.mssql?.primaryxml
    ? (code += ReportHelpers.getCaptionAndValueWrapper(
        "Primary",
        index.mssql?.primaryxml
      ))
    : (code += "");
  index.mssql?.spec
    ? (code += ReportHelpers.getCaptionAndValueWrapper(
        "Code",
        ReportHelpers.addPreWrapperForReport(index.mssql?.spec)
      ))
    : "";
  return code;
};

const getIndexFulltext = (index) => {
  var code = "";
  index.mssql?.spec
    ? (code += ReportHelpers.getCaptionAndValueWrapper(
        "Code",
        ReportHelpers.addPreWrapperForReport(index.mssql?.spec)
      ))
    : (code += "");
  return code;
};

const getIndexColumnstore = (index) => {
  var code = "";
  index.mssql?.clustered
    ? (code += ReportHelpers.getCaptionAndValueWrapper(
        "Clustered",
        index.mssql?.clustered
      ))
    : (code += "");
  index.mssql?.spec
    ? (code += ReportHelpers.getCaptionAndValueWrapper(
        "Code",
        ReportHelpers.addPreWrapperForReport(index.mssql?.spec)
      ))
    : (code += "");
  return code;
};

const getMSSQLTableIndexesForReport = (tableIndexes, tableCols) => {
  if (tableIndexes.length === 0) {
    return "";
  }
  var code = "";
  code += ReportHelpers.getCssWrapperStart("mm-subsection");
  code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Indexes");

  for (var ix of tableIndexes) {
    code += ReportHelpers.getFirstValueDivWrapper(ix.name);
    code += ReportHelpers.getCssWrapperStart("mm-d-hor");
    if (ix.mssql?.type === "RELATIONAL") {
      for (var ixcol of ix.cols) {
        let colProp = "";
        code += ReportHelpers.getCaptionAndValueWrapper(
          "Column name",
          getColumnName(tableCols, ixcol.colid)
        );
        colProp += ReportHelpers.getCssWrapperStart("mm-d-hor");
        colProp += ReportHelpers.getCaptionAndValueWrapper(
          "Descending",
          ixcol.mssql?.desc
        );

        colProp += ReportHelpers.getCssWrapperEnd("mm-d-hor");
        code += ReportHelpers.getCaptionAndValueWrapper("", colProp);
      }
    }
    code += getIndexProperties(ix);
    code += ReportHelpers.getCaptionAndValueWrapper(
      "Description",
      ix.mssql?.desc
    );
    code += ReportHelpers.getCssWrapperEnd("mm-d-hor");
  }

  code += ReportHelpers.getCssWrapperEnd("mm-subsection");
  return code;
};

const getMSSQLTableRelationsForReport = (tableRelations, tables, relations) => {
  if (tableRelations.length === 0) {
    return "";
  }
  var code = "";
  code += ReportHelpers.getCssWrapperStart("mm-subsection");
  code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Relations");
  code += ReportHelpers.getCssWrapperStart("mm-d-g-3");

  code += ReportHelpers.getColumnHeadersForReport(["Name", "Parent", "Child"]);

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

const getJsonColumnInfoForReport = (table, tables, otherObjects) => {
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
    code += getJsonColProps(col, 4);
  }

  return code;
};

const getColDatatype = (datatype, tables, otherObjects) => {
  let tbl = _.find(tables, ["id", datatype]);
  let otherObj = _.find(otherObjects, ["id", datatype]);
  if (tbl) {
    if (tbl.objectType === "table") {
      return `<a href='index.html?page=Tables&item=itm-${tbl.id}'>${tbl.name}</a>`;
    } else {
      return `<a href='index.html?page=Json&item=itm-${tbl.id}'>${tbl.name}</a>`;
    }
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
    ReportHelpers.getCaptionAndValueWrapper("Schema", table.mssql?.schema)
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
