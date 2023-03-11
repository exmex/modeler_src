import {
  getCardinality,
  getObjectLinesForReport
} from "../../reports/report_all_platforms";

import ReportHelpers from "../../helpers/report_helpers";
import _ from "lodash";

/* tables */
export const getGraphQlTableDetailForReport = (
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
    code += ReportHelpers.getLongCaptionAndValueWrapper(
      "Directive",
      table.directive
    );

    code += getTableProps(table, tables);

    code += ReportHelpers.getCssWrapperStart("mm-subsection");
    code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Columns");

    code += ReportHelpers.getCssWrapperStart("mm-d-g-4");
    code += ReportHelpers.getColumnHeadersForReport([
      "Name",
      "Data type",
      "Array",
      "Not Null"
    ]);
    code += getColumnInfoForReport(table, tables, otherObjects);
    code += ReportHelpers.getCssWrapperEnd("mm-d-g-4");

    code += ReportHelpers.getCssWrapperEnd("mm-subsection");

    code += getGraphQlTableRelationsForReport(
      table.relations,
      tables,
      relations
    );

    code += getGraphQlTableImplementsForReport(
      table.relations,
      tables,
      relations
    );

    code += getObjectLinesForReport(table.lines, lines);

    code += "</div>";
    return code;
  }
};

const getTableTypeUrlPart = (objectType) => {
  switch (objectType) {
    case "interface":
      return "Interfaces";
    case "input":
      return "Inputs";
    case "union":
      return "Unions";
    default:
      return "Types";
  }
};

export const getGraphQlRelationDetailForReport = (relation, tables) => {
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
      `<a href="index.html?page=${getTableTypeUrlPart(
        tables[relation.parent].objectType
      )}&item=itm-${relation.parent}">${tables[relation.parent].name}</a>`
    );
    code += ReportHelpers.getValueDivWrapper(
      `<a href="index.html?page=${getTableTypeUrlPart(
        tables[relation.child].objectType
      )}&item=itm-${relation.child}">${tables[relation.child].name}</a>`
    );
    code += getCardinality(relation);
    code += ReportHelpers.getCssWrapperEnd("mm-d-g-3");
    code += ReportHelpers.getCssWrapperEnd("mm-subsection");

    code += getRelProps(relation);

    code += "</div>";

    return code;
  }
};

export const getGraphQlImplementsDetailForReport = (relation, tables) => {
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
      `<a href="index.html?page=Implements&item=itm-${relation.id}">${relation.name}</a>`
    );
    code += ReportHelpers.getValueDivWrapper(
      `<a href="index.html?page=${getTableTypeUrlPart(
        tables[relation.parent].objectType
      )}&item=itm-${relation.parent}">${tables[relation.parent].name}</a>`
    );
    code += ReportHelpers.getValueDivWrapper(
      `<a href="index.html?page=${getTableTypeUrlPart(
        tables[relation.child].objectType
      )}&item=itm-${relation.child}">${tables[relation.child].name}</a>`
    );
    code += ReportHelpers.getCssWrapperEnd("mm-d-g-3");
    code += ReportHelpers.getCssWrapperEnd("mm-subsection");

    code += getRelProps(relation);

    code += "</div>";

    return code;
  }
};

const getGraphQlTableRelationsForReport = (
  tableRelations,
  tables,
  relations
) => {
  if (tableRelations.length === 0) {
    return "";
  }

  let hasRelations = false;
  for (let tempRel of tableRelations) {
    let tr = relations[tempRel];
    if (tr.type === "simple") {
      hasRelations = true;
    }
  }
  var code = "";
  if (hasRelations === true) {
    code += ReportHelpers.getCssWrapperStart("mm-subsection");
    code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "References");
    code += ReportHelpers.getCssWrapperStart("mm-d-g-3");

    code += ReportHelpers.getColumnHeadersForReport([
      "Name",
      "Source",
      "Target"
    ]);

    for (var rel of tableRelations) {
      let r = relations[rel];
      if (r.type === "simple") {
        code += ReportHelpers.getCssWrapperStart("mm-d-g-c-m-3");
        code += ReportHelpers.getCssAndContentWrapper("mm-spacer-xs", "");
        code += ReportHelpers.getCssWrapperEnd("mm-d-g-c-m-3");

        code += ReportHelpers.getFirstValueDivWrapper(
          `<a href="index.html?page=References&item=itm-${rel}">${r.name}</a>`
        );
        code += ReportHelpers.getValueDivWrapper(
          `<a href="index.html?page=${getTableTypeUrlPart(
            tables[r.parent].objectType
          )}&item=itm-${r.parent}">${tables[r.parent].name}</a>`
        );
        code += ReportHelpers.getValueDivWrapper(
          `<a href="index.html?page=${getTableTypeUrlPart(
            tables[r.child].objectType
          )}&item=itm-${r.child}">${tables[r.child].name}</a>`
        );
      }
    }

    code += ReportHelpers.getCssWrapperEnd("mm-d-g-3");
    code += ReportHelpers.getCssWrapperEnd("mm-subsection");
  }
  return code;
};

const getGraphQlTableImplementsForReport = (
  tableRelations,
  tables,
  relations
) => {
  if (tableRelations.length === 0) {
    return "";
  }
  let hasRelations = false;
  for (let tempRel of tableRelations) {
    let tr = relations[tempRel];
    if (tr.type === "identifying") {
      hasRelations = true;
    }
  }
  var code = "";
  if (hasRelations === true) {
    code += ReportHelpers.getCssWrapperStart("mm-subsection");
    code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Implements");
    code += ReportHelpers.getCssWrapperStart("mm-d-g-3");

    code += ReportHelpers.getColumnHeadersForReport([
      "Name",
      "Source",
      "Target"
    ]);

    for (var rel of tableRelations) {
      let r = relations[rel];
      if (r.type === "identifying") {
        code += ReportHelpers.getCssWrapperStart("mm-d-g-c-m-3");
        code += ReportHelpers.getCssAndContentWrapper("mm-spacer-xs", "");
        code += ReportHelpers.getCssWrapperEnd("mm-d-g-c-m-3");

        code += ReportHelpers.getFirstValueDivWrapper(
          `<a href="index.html?page=Implements&item=itm-${rel}">${r.name}</a>`
        );
        code += ReportHelpers.getValueDivWrapper(
          `<a href="index.html?page=${getTableTypeUrlPart(
            tables[r.parent].objectType
          )}&item=itm-${r.parent}">${tables[r.parent].name}</a>`
        );
        code += ReportHelpers.getValueDivWrapper(
          `<a href="index.html?page=${getTableTypeUrlPart(
            tables[r.child].objectType
          )}&item=itm-${r.child}">${tables[r.child].name}</a>`
        );
      }
    }

    code += ReportHelpers.getCssWrapperEnd("mm-d-g-3");
    code += ReportHelpers.getCssWrapperEnd("mm-subsection");
  }
  return code;
};

const getColumnInfoForReport = (table, tables, otherObjects) => {
  if (table.cols.length === 0) {
    return "";
  }
  var code = "";
  for (var col of table.cols) {
    if (col.name !== "FakeIdForInternalUse") {
      code += ReportHelpers.getCssWrapperStart("mm-d-g-c-m-4");
      code += ReportHelpers.getCssAndContentWrapper("mm-spacer-xs", "");
      code += ReportHelpers.getCssWrapperEnd("mm-d-g-c-m-4");
      code += ReportHelpers.getFirstValueDivWrapper(col.name);
      code += ReportHelpers.getValueDivWrapper(
        getColDatatype(col.datatype, tables, otherObjects)
      );

      code += ReportHelpers.getValueDivWrapper(col.list);
      code += ReportHelpers.getValueDivWrapper(col.nn);
      code += getColProps(col, 4);
    }
  }

  return code;
};

const getColDatatype = (datatype, tables, otherObjects) => {
  let tbl = _.find(tables, ["id", datatype]);
  let otherObj = _.find(otherObjects, ["id", datatype]);
  if (tbl) {
    return `<a href='index.html?page=${getTableTypeUrlPart(
      tbl.objectType
    )}&item=itm-${tbl.id}'>${tbl.name}</a>`;
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

const getColProps = (col, colspan) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Description", col.comment)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Arguments", col.fieldArguments)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Array item Not Null",
      col.isArrayItemNn
    )
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Directive", col.fieldDirective)
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
