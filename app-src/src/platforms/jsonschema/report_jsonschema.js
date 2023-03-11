import Helpers from "../../helpers/helpers";
import JsonSchemaHelpers from "./helpers_jsonschema";
import React from "react";
import ReactDOMServer from "react-dom/server";
import ReportHelpers from "../../helpers/report_helpers";
import _ from "lodash";
import { getObjectLinesForReport } from "../../reports/report_all_platforms";
import json5 from "json5";
import { v4 as uuidv4 } from "uuid";

/* tables */
const getOwnerCol = (catalogColumns, tables, table) => {
  var col1 = undefined;
  const item = catalogColumns.tableToCol[table.id];
  if (item) {
    col1 = _.find(tables[item.parentTableId]?.cols, ["id", item.parentColId]);
  }
  return col1;
};

export const getNestedObjectsForReport = (tables, catalogColumns) => {
  let nestedObjects = [];
  var i = -1;
  _.map(
    _.filter(tables, function (o) {
      return (
        !JsonSchemaHelpers.isSchema(o) &&
        !JsonSchemaHelpers.isRef(o) &&
        !JsonSchemaHelpers.isDef(o)
      );
    }),
    (table) => {
      i++;
      let tableId = table.id;
      let objectName = table.name;
      const col = getOwnerCol(catalogColumns, tables, table);

      if (col) {
        if (col.name.length > 0) {
          objectName = col.name;
        } else {
          objectName = "(No name)";
        }
      }
      nestedObjects.push({ id: tableId, name: objectName });
    }
  );
  return _.mapKeys(nestedObjects, "id");
};

export const getJsonSchemaTableDetailForReport = (
  table,
  tables,
  lines,
  strictJsonFormat,
  catalogColumns
) => {
  if (table !== null) {
    var code = '<div id="detail-itm-' + table.id + '" class="mm-detail">';

    const col = getOwnerCol(catalogColumns, tables, table);

    if (col) {
      code += ReportHelpers.getImportantCaptionAndValueWrapper(
        "Name",
        col.name
      );
      code += ReportHelpers.getLongCaptionAndValueWrapper(
        "Description",
        col.desc
      );

      code += getColProps(col, 4, tables, catalogColumns);
    } else {
      code += ReportHelpers.getImportantCaptionAndValueWrapper(
        "Name",
        table.name
      );
      code += ReportHelpers.getLongCaptionAndValueWrapper(
        "Description",
        table.desc
      );
    }

    code += getTableProps(table, tables);

    code += getObjectLinesForReport(table.lines, lines);

    if (_.size(table.cols) > 0) {
      code += "<div><div class='dCols dCols-report'>";
      let colDetails = ReactDOMServer.renderToString(
        getTableColsReport(
          table.id,
          table,
          tables,
          strictJsonFormat,
          catalogColumns
        )
      );
      code += colDetails;
      code += "</div></div>";
    }
    code += "</div>";
    return code;
  }
};

const getTableProps = (table, tables) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [...otherOptions];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Ref URL", table.refUrl)
  ];
  if (!!table.specification && table.specification  !== "{}") {
    otherOptions = [
      ...otherOptions,
      ReportHelpers.getCaptionAndValueWrapper(
        "Specification",
        ReactDOMServer.renderToString(getColSpec(table))
      )
    ];
  }
  code += ReportHelpers.getPropValuesVerticalForReport(otherOptions, true);
  return code;
};

const getColProps = (col, colspan, tables, catalogColumns) => {
  var code = "";
  var otherOptions = [];
  const colDataType = JsonSchemaHelpers.getColDataType(
    col,
    tables,
    false,
    catalogColumns
  );

  if (colDataType !== "" && colDataType !== "-") {
    otherOptions = [
      ...otherOptions,
      ReportHelpers.getCaptionAndValueWrapper("Type", colDataType)
    ];
  }
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Ref", col.ref)
  ];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Description", col.comment)
  ];
  if (!!col.specification && col.specification  !== "{}") {
    otherOptions = [
      ...otherOptions,
      ReportHelpers.getCaptionAndValueWrapper(
        "Specification",
        ReactDOMServer.renderToString(getColSpec(col))
      )
    ];
  }

  if (otherOptions !== []) {
    code += ReportHelpers.getColPropValuesForReport(
      otherOptions,
      true,
      colspan
    );
  }
  return code;
};

const getTableColsReport = (
  mainTableId,
  table,
  tables,
  strictJsonFormat,
  catalogColumns
) => {
  try {
    var i = -1;
    return _.map(table.cols, (col) => {
      i++;
      var colToDisplay;
      var nnToDisplay = col.nn ? "Required" : "";

      var embeddedTable = _.find(tables, ["id", col.datatype]);
      var embeddedGraphics;
      var colNameDisplayed = <></>;

      embeddedGraphics = (
        <div
          className={"im-embedded  im-embedded-thin"}
          style={{ gridColumn: "span 6" }}
        >
          <div
            style={{
              borderLeft: "1px dashed transparent"
            }}
          >
            {getTableColsReport(
              mainTableId,
              embeddedTable,
              tables,
              strictJsonFormat,
              catalogColumns
            )}
          </div>
        </div>
      );

      colToDisplay = (
        <>
          {JsonSchemaHelpers.renderDataTypeIcon(col, tables, catalogColumns)}
          {JsonSchemaHelpers.getColDataType(
            col,
            tables,
            false,
            catalogColumns.colToTable
          )}
        </>
      );

      colNameDisplayed = JsonSchemaHelpers.getColNameJsonSchema(
        col,
        i,
        tables[table.id]?.objectType,
        tables
      );

      return (
        <div key={uuidv4()} className={"dRow dRow-thin im-t-r"}>
          <div className="dCol im-t-c"></div>
          <div className="dCol im-t-c">{colNameDisplayed}</div>
          <div className="dCol im-t-c im-mini im-col-object-name">
            {colToDisplay}
          </div>
          <div className="dCol im-t-c im-mini">{nnToDisplay}</div>
          <div className="dCol im-t-c im-mini">
            <span className="tree__prop__comment">{col.comment}</span>
          </div>
          <div className="dCol im-t-c im-mini">{getColSpec(col)}</div>
          {embeddedGraphics}
        </div>
      );
      // }
    });
  } catch (e) {
    //console.log("error", e, " ", e.message);
    return;
  }
};

const getColSpec = (column) => {
  if (!!column.specification  && column.specification  !== "{}") {
    try {
      let specObj = json5.parse(column.specification);
      let filteredSpecObj = _.omit(specObj, ["description", "$schema"]);

      let specToShow = [];
      _.forOwn(filteredSpecObj, function (value, key) {
        specToShow.push(
          <div key={uuidv4()} className="tree__flex__rows">
            <span className="tree__prop__key">{key}: </span>
            <span
              className="tree__prop__value"
              title={Helpers.getEmptyObjectOrValue(value, false)}
            >
              {Helpers.getEmptyObjectOrValue(value, false)}
            </span>
          </div>
        );
      });

      return (
        <div className="tree__spec">
          {filteredSpecObj && <div>{specToShow}</div>}
          {specObj.$schema && (
            <div
              title={specObj.$schema}
              key={uuidv4()}
              className="tree__flex__rows"
            >
              <span className="tree__prop__key">$schema: </span>
              <span className="tree__prop__value">
                {JsonSchemaHelpers.getSchemaShortName(specObj.$schema)}
              </span>
            </div>
          )}
        </div>
      );
    } catch (e) {
      console.log(e.message);
      return <div className="tree__spec">{column.specification}</div>;
    }
  }
};
