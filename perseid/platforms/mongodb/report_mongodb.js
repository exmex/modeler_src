import {
  getCardinality,
  getObjectLinesForReport
} from "../../reports/report_all_platforms";

import ReportHelpers from "../../helpers/report_helpers";
import _ from "lodash";
import { getMongoDbCreateIndexStatement } from "./generator_mongodb";

/* tables */
export const getMongoDbTableDetailForReport = (
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
    } else {
      code += getDocumentProps(table, tables);
    }

    code += ReportHelpers.getCssWrapperStart("mm-subsection");
    code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Fields");
    code += ReportHelpers.getCssWrapperStart("mm-d-g-5");

    code += ReportHelpers.getColumnHeadersForReport([
      "Name",
      "Data type",
      "Array",
      "Key",
      "Required"
    ]);

    code += getColumnInfoForReport(table.cols, tables);
    code += ReportHelpers.getCssWrapperEnd("mm-d-g-5");
    code += ReportHelpers.getCssWrapperEnd("mm-subsection");

    code += getMongoDbCollectionIndexesForReport(table);

    code += getMongoDbTableRelationsForReport(
      table.relations,
      tables,
      relations
    );
    code += getObjectLinesForReport(table.lines, lines);

    code += "</div>";
    return code;
  }
};

const getMongoDbCollectionIndexesForReport = (table) => {
  var code = "";
  code += ReportHelpers.getCssWrapperStart("mm-subsection");
  code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Indexes");
  if (_.size(table.indexes) < 1) {
    return "";
  }

  for (var ix of table.indexes) {
    code += ReportHelpers.getFirstValueDivWrapper(ix.name);
    code += ReportHelpers.getCssWrapperStart("mm-d-hor");

    code += ReportHelpers.getCaptionAndValueWrapper(
      "Create statement",
      ReportHelpers.addPreWrapperForReport(
        getMongoDbCreateIndexStatement(ix, table.name)
      )
    );
    code += ReportHelpers.getCssWrapperEnd("mm-d-hor");
  }

  code += ReportHelpers.getCssWrapperEnd("mm-subsection");
  return code;
};

export const getMongoDbRelationDetailForReport = (relation, tables) => {
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
        tables[relation.parent].embeddable ? "Documents" : "Collections"
      }&item=itm-${relation.parent}">${tables[relation.parent].name}</a>`
    );
    code += ReportHelpers.getValueDivWrapper(
      `<a href="index.html?page=${
        tables[relation.child].embeddable ? "Documents" : "Collections"
      }&item=itm-${relation.child}">${tables[relation.child].name}</a>`
    );
    code += getCardinality(relation);
    code += ReportHelpers.getCssWrapperEnd("mm-d-g-3");
    code += ReportHelpers.getCssWrapperEnd("mm-subsection");
    code += getRelProps(relation);

    code += "</div>";

    return code;
  }
};

const getMongoDbTableRelationsForReport = (
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
        tables[r.parent].embeddable ? "Documents" : "Collections"
      }&item=itm-${r.parent}">${tables[r.parent].name}</a>`
    );
    code += ReportHelpers.getValueDivWrapper(
      `<a href="index.html?page=${
        tables[r.child].embeddable ? "Documents" : "Collections"
      }&item=itm-${r.child}">${tables[r.child].name}</a>`
    );
  }

  code += ReportHelpers.getCssWrapperEnd("mm-d-g-3");
  code += ReportHelpers.getCssWrapperEnd("mm-subsection");

  return code;
};

const getColumnInfoForReport = (tblCols, tables) => {
  if (tblCols.length === 0) {
    return "";
  }
  var code = "";
  for (var col of tblCols) {
    code += ReportHelpers.getCssWrapperStart("mm-d-g-c-m-5");
    code += ReportHelpers.getCssAndContentWrapper("mm-spacer-xs", "");
    code += ReportHelpers.getCssWrapperEnd("mm-d-g-c-m-5");
    code += ReportHelpers.getFirstValueDivWrapper(col.name);
    code += ReportHelpers.getValueDivWrapper(
      getColDatatype(col.datatype, tables)
    );
    code += ReportHelpers.getValueDivWrapper(col.list);
    code += ReportHelpers.getValueDivWrapper(col.pk);
    code += ReportHelpers.getValueDivWrapper(col.nn);

    code += getColProps(col);
  }

  return code;
};

const getColDatatype = (datatype, tables) => {
  let tbl = _.find(tables, ["id", datatype]);
  if (tbl) {
    return `<a href='index.html?page=${
      tbl.embeddable ? "Documents" : "Collections"
    }&item=itm-${tbl.id}'>${tbl.name}</a>`;
  } else {
    return datatype;
  }
};

const getDocumentProps = (table, tables) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Validation", table.validation)
  ];
  code += ReportHelpers.getPropValuesVerticalForReport(otherOptions, true);
  return code;
};

const getTableProps = (table, tables) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Caped", table.caped)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Table size", table.size)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Table max", table.max)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Auto index id", table.autoIndexId)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Validation level",
      table.validationLevel
    )
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper(
      "Validation action",
      table.validationAction
    )
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Validation", table.validation)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Collation", table.collation)
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

const getColProps = (col) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Pattern", col.pattern)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Validation", col.validation)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Enum", col.enum)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Any type restrictions", col.any)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Description", col.comment)
  ];

  code += ReportHelpers.getColPropValuesForReport(otherOptions, true, 5);
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
