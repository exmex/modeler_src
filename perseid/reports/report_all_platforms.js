import ReportHelpers from "../helpers/report_helpers";
import UIHelpers from "../helpers/ui_helpers";
import moment from "moment";

export const getObjectLinesForReport = (objectLines, lines) => {
  if (objectLines === undefined || objectLines.length === 0) {
    return "";
  }
  var code = "";
  code += ReportHelpers.getCssWrapperStart("mm-subsection");
  code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Lines");

  for (var line of objectLines) {
    let l = lines[line];
    code += ReportHelpers.getCssAndContentWrapper("mm-spacer-xs", "");

    code += ReportHelpers.getFirstValueDivWrapper(
      `<a href="index.html?page=Lines&item=itm-${line}">${l.name}</a>`
    );
  }
  code += ReportHelpers.getCssWrapperEnd("mm-subsection");
  code += getLineProps(line);

  return code;
};

export const getLineDetailForReport = (line) => {
  if (line !== null) {
    var code = '<div id="detail-itm-' + line.id + '" class="mm-detail">';
    code += ReportHelpers.getImportantCaptionAndValueWrapper(
      "Line name",
      line.name
    );
    code += ReportHelpers.getLongCaptionAndValueWrapper(
      "Description",
      line.desc
    );
    if (line.code !== undefined) {
      code += ReportHelpers.getLongCaptionAndValueWrapper(
        "Code",
        ReportHelpers.addPreWrapperForReport(line.code)
      );
    }
    code += "</div>";

    return code;
  }
};

export const getOtherDetailForReport = (otherObject, lines) => {
  if (otherObject !== null) {
    var code = '<div id="detail-itm-' + otherObject.id + '" class="mm-detail">';
    code += ReportHelpers.getImportantCaptionAndValueWrapper(
      "Name",
      otherObject.name
    );
    code += ReportHelpers.getLongCaptionAndValueWrapper(
      "Type",
      otherObject.type
    );
    code += ReportHelpers.getLongCaptionAndValueWrapper(
      "Description",
      otherObject.desc
    );
    if (
      otherObject.enumValues !== undefined &&
      otherObject.enumValues !== "" &&
      otherObject.enumValues !== null
    ) {
      code += ReportHelpers.getLongCaptionAndValueWrapper(
        "Enum values",
        ReportHelpers.addPreWrapperForReport(otherObject.enumValues)
      );
    }

    if (
      otherObject.code !== undefined &&
      otherObject.code !== "" &&
      otherObject.code !== null
    ) {
      code += ReportHelpers.getLongCaptionAndValueWrapper(
        "Code",
        ReportHelpers.addPreWrapperForReport(otherObject.code)
      );
    }
    code += getObjectLinesForReport(otherObject.lines, lines);
    code += "</div>";

    return code;
  }
};

export const getNoteDetailForReport = (note, lines) => {
  if (note !== null) {
    var code = '<div id="detail-itm-' + note.id + '" class="mm-detail">';
    code += ReportHelpers.getImportantCaptionAndValueWrapper("Name", note.name);
    code += ReportHelpers.getLongCaptionAndValueWrapper("Note", note.desc);
    if (note.code !== undefined && note.code !== "" && note.code !== null) {
      code += ReportHelpers.getLongCaptionAndValueWrapper(
        "Code",
        ReportHelpers.addPreWrapperForReport(note.code)
      );
    }
    if (note.lines) {
      code += getObjectLinesForReport(note.lines, lines);
    }
    code += "</div>";

    return code;
  }
};

export const getLineProps = (line) => {
  var code = "";
  var otherOptions = [];
  otherOptions = [
    ...otherOptions,
    ReportHelpers.getCaptionAndValueWrapper("Description", line.desc)
  ];
  if (line.code !== undefined) {
    otherOptions = [
      ...otherOptions,
      ReportHelpers.getCaptionAndValueWrapper("Code", line.code)
    ];
  }

  code += ReportHelpers.getPropValuesVerticalForReport(otherOptions, true);
  return code;
};

export const getCardinality = (relation) => {
  var code = "";

  code += ReportHelpers.getCaptionWrapper("Cardinality type");
  code += ReportHelpers.getValueDivWrapper(`${_.upperFirst(relation.c_p)} to`);
  code += ReportHelpers.getValueDivWrapper(relation.c_ch);

  code += ReportHelpers.getCaptionWrapper("Ordinality");
  code += ReportHelpers.getValueDivWrapper(
    ReportHelpers.ordinalityBoolToStringValue(relation.c_mp)
  );
  code += ReportHelpers.getValueDivWrapper(
    ReportHelpers.ordinalityBoolToStringValue(relation.c_mch)
  );

  if (relation.c_cch.length > 0 || relation.c_cp.length > 0) {
    code += ReportHelpers.getCaptionWrapper("Caption");
    code += ReportHelpers.getValueDivWrapper(relation.c_cp);
    code += ReportHelpers.getValueDivWrapper(relation.c_cch);
  }
  return code;
};

export const getProjectForReport = (modelObj, diagramObj) => {
  var code = "";
  code += ReportHelpers.getSectionWrapperStart("Project");
  code += ReportHelpers.getCssWrapperStart("mm-fullpage-wrapper");
  code += ReportHelpers.getCssWrapperStart("mm-header-1 mm-align-center");
  code += modelObj.name;
  code += ReportHelpers.getCssWrapperEnd("mm-header-1 mm-align-center");
  code += ReportHelpers.getCssWrapperStart("mm-subsection");
  code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Project");
  code += ReportHelpers.getCaptionAndValueVerticalWrapper(
    "Name",
    modelObj.name
  );
  code += ReportHelpers.getCaptionAndValueVerticalWrapper(
    "Description",
    modelObj.desc
  );
  code += ReportHelpers.getCssWrapperEnd("mm-subsection");
  code += ReportHelpers.getCssWrapperStart("mm-subsection");
  code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Diagram");
  code += ReportHelpers.getCaptionAndValueVerticalWrapper(
    "Name",
    diagramObj.name
  );
  code += ReportHelpers.getCaptionAndValueVerticalWrapper(
    "Description",
    diagramObj.desc
  );
  code += ReportHelpers.getCssWrapperEnd("mm-subsection");

  if (modelObj.beforeScript && modelObj.afterScript) {
    code += ReportHelpers.getCssWrapperStart("mm-subsection");
    code += ReportHelpers.getCssAndContentWrapper(
      "mm-subtitle",
      "Before and After scripts"
    );
    code += ReportHelpers.getCaptionAndValueVerticalWrapper(
      "Before script",
      ReportHelpers.addPreWrapperForReport(modelObj.beforeScript)
    );
    code += ReportHelpers.getCaptionAndValueVerticalWrapper(
      "After script",
      ReportHelpers.addPreWrapperForReport(modelObj.afterScript)
    );
    code += ReportHelpers.getCssWrapperEnd("mm-subsection");
  }
  code += ReportHelpers.getCssWrapperStart("mm-subsection");
  code += ReportHelpers.getCssAndContentWrapper("mm-subtitle", "Report");
  code += ReportHelpers.getCaptionAndValueVerticalWrapper(
    "Generated",
    moment().format("hh:mm:ss |  DD MMMM YYYY")
  );
  code += ReportHelpers.getCssWrapperEnd("mm-subsection");
  code += ReportHelpers.getCssWrapperEnd("mm-fullpage-wrapper");
  code += ReportHelpers.getSectionWrapperEnd("Project");
  return code;
};

export const getDiagramForReport = (outerHtml, activeDiagramObjectId) => {
  var code = "";
  if (outerHtml !== null) {
    code += ReportHelpers.getSectionWrapperStart("Diagrams");
    code += `<div id="detail-itm-${activeDiagramObjectId}" class="main-area">`;
    code += outerHtml;
    code += "</div>";
    code += ReportHelpers.getSectionWrapperEnd("Diagrams");
  }

  return code;
};
