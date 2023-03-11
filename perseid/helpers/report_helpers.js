import JsonSchemaHelpers from "../platforms/jsonschema/helpers_jsonschema";
import { ModelTypes } from "../enums/enums";
import _ from "lodash";

const ReportHelpers = {
  getImportantCaptionAndValueWrapper: function (caption, value) {
    if (value !== null && value !== "na" && value !== undefined && value !== "")
      return `<div class="mm-d-i"><div class='mm-d-c-i'>${this.highlightDescription(
        caption
      )}</div><div class='mm-d-v-i'>${this.valueToYesNo(value)}</div></div>`;
    else return "";
  },
  getLongCaptionAndValueWrapper: function (caption, value) {
    if (value !== null && value !== "na" && value !== undefined && value !== "")
      return `<div class="mm-d-ver mm-d-i"><div class='mm-d-c-l'>${this.highlightDescription(
        caption
      )}</div><div class='mm-d-v-l'>${this.valueToYesNo(value)}</div></div>`;
    else return "";
  },
  getCaptionAndValueVerticalWrapper: function (caption, value) {
    if (value !== null && value !== "na" && value !== undefined && value !== "")
      return `<div class="mm-d-ver"><div class='mm-d-c'>${this.highlightDescription(
        caption
      )}</div><div class='mm-d-v-l'>${this.valueToYesNo(value)}</div></div>`;
    else return "";
  },
  getCaptionWrapper: function (caption) {
    return `<div class='mm-d-c'>${this.highlightDescription(caption)}: </div>`;
  },
  getValueWrapper: function (value) {
    if (value !== null && value !== "na" && value !== undefined && value !== "")
      return `<div class='mm-d-v'>${this.valueToYesNo(value)}</div>`;
    else return "";
  },
  getFirstValueDivWrapper: function (value) {
    if (value !== null && value !== "na" && value !== undefined && value !== "")
      return `<div class='mm-d-v mm-d-v-s'>${this.valueToYesNo(value)}</div>`;
    else return `<div class='mm-d-v'></div>`;
  },
  getValueDivWrapper: function (value) {
    if (value !== null && value !== "na" && value !== undefined && value !== "")
      return `<div class='mm-d-v'>${this.valueToYesNo(value)}</div>`;
    else return `<div class='mm-d-v'></div>`;
  },
  getCaptionAndValueWrapper: function (caption, value) {
    if (
      value !== null &&
      value !== "na" &&
      value !== undefined &&
      value !== "" &&
      value !== false
    )
      return `<div class='mm-d-c'>${this.highlightDescription(
        caption
      )}</div><div class='mm-d-v'>${this.valueToYesNo(value)}</div>`;
    else return "";
  },
  getSectionWrapperStart: function (sectionTitle) {
    return `<!-- section ${sectionTitle} - start --><div class='mm-section' id='mm-section-${sectionTitle}'>`;
  },
  getSectionWrapperEnd: function (sectionTitle) {
    return `</div> <!--  section ${sectionTitle} - end -->`;
  },
  getCssWrapperStart: function (className) {
    return `<div class='${className}'>`;
  },
  getCssWrapperEnd: function (wrapperTitle) {
    return `</div> <!--  wrapper end ${wrapperTitle} - end -->`;
  },
  getCssAndContentWrapper: function (className, content) {
    return `<div class='${className}'>${content}</div>`;
  },
  valueToYesNo: function (value) {
    if (value === true) {
      return "<span class='mm-yes'>Yes</span>";
    } else if (value === false) {
      return "<span class='mm-no'>-</span>";
    } else {
      return value;
    }
  },
  ordinalityBoolToStringValue: function (value) {
    switch (value) {
      case "true":
      case true:
        return "Mandatory";
      case "false":
      case false:
        return "Optional";
      default:
        return "";
    }
  },
  getColPropValuesForReport: function (array, removeNulls, colCaptionsCount) {
    if (removeNulls === true) {
      array = _.compact(array);
    }
    var cnt = _.size(array);
    var code = "";

    if (cnt > 0) {
      code += ReportHelpers.getCssWrapperStart(
        "mm-d-g-c-m-" + colCaptionsCount
      );
      code += ReportHelpers.getCssWrapperStart("mm-d-hor mm-props");

      for (var obj of array) {
        code += obj;
      }
      code += ReportHelpers.getCssWrapperEnd("mm-d-hor mm-props");
      code += ReportHelpers.getCssWrapperEnd("mm-d-g-c-m-" + colCaptionsCount);
    }
    return code;
  },
  getPropValuesVerticalForReport: function (array, removeNulls) {
    if (removeNulls === true) {
      array = _.compact(array);
    }
    var cnt = _.size(array);
    var code = "";

    if (cnt > 0) {
      code += ReportHelpers.getCssWrapperStart("mm-subsection");
      code += ReportHelpers.getCssAndContentWrapper(
        "mm-subtitle",
        "Properties"
      );
      code += ReportHelpers.getCssWrapperStart("mm-d-hor");

      for (var obj of array) {
        code += obj;
      }

      code += ReportHelpers.getCssWrapperEnd("mm-d-hor");
      code += ReportHelpers.getCssWrapperEnd("mm-subsection");
    }
    return code;
  },
  getColumnHeadersForReport: function (captions) {
    var code = "";
    for (let caption of captions) {
      code += `<div class="mm-d-c">${caption}</div>`;
    }
    return code;
  },
  addPreWrapperForReport: function (value) {
    var code = "";
    if (
      value !== null &&
      value !== "na" &&
      value !== undefined &&
      value !== "" &&
      value !== false
    ) {
      code = `<pre>${value.replace(new RegExp("\\\\n", "g"), "<br />")}</pre>`;
    }
    return code;
  },
  highlightDescription: function (value) {
    if (_.lowerCase(value) === "description") {
      return `<div class='mm-description'>${value}</div>`;
    } else return value;
  },

  getWatermarkFileNameByProduct(productName) {
    switch (productName) {
      case "MeteorModeler":
        return "./assets/watermark-meteor.svg";
      case "PerseidModeler":
        return "./assets/watermark-perseid.svg";
      default:
        return "./assets/watermark-moon.svg";
    }
  },

  replaceResourcesInReports(htmlCode, productName) {
    var doc = document.implementation.createHTMLDocument("");
    doc.open();
    doc.write(htmlCode);
    doc.close();
    var listAk = doc.querySelectorAll(".im-mark-AK");
    listAk.forEach((node) => {
      node.setAttribute("src", "./assets/ak.svg");
    });
    var listPk = doc.querySelectorAll(".im-mark-PK");
    listPk.forEach((node) => {
      node.setAttribute("src", "./assets/pk.svg");
    });
    var listPfk = doc.querySelectorAll(".im-mark-PFK");
    listPfk.forEach((node) => {
      node.setAttribute("src", "./assets/pfk.svg");
    });
    var listFk = doc.querySelectorAll(".im-mark-FK");
    listFk.forEach((node) => {
      node.setAttribute("src", "./assets/fk.svg");
    });
    var listL = doc.querySelectorAll(".im-mark-L");
    listL.forEach((node) => {
      node.setAttribute("src", "./assets/linked.svg");
    });
    var listU = doc.querySelectorAll(".im-mark-U");
    listU.forEach((node) => {
      node.setAttribute("src", "./assets/linked.svg");
    });
    var listC = doc.querySelectorAll(".im-mark-C");
    listC.forEach((node) => {
      node.setAttribute("src", "./assets/linked.svg");
    });
    var listI = doc.querySelectorAll(".im-mark-I");
    listI.forEach((node) => {
      node.setAttribute("src", "./assets/inter.svg");
    });
    var listIX = doc.querySelectorAll(".im-mark-IX");
    listIX.forEach((node) => {
      node.setAttribute("src", "./assets/index.svg");
    });
    var listWatermarks = doc.querySelectorAll(".watermark");
    listWatermarks.forEach((node) => {
      node.setAttribute(
        "href",
        this.getWatermarkFileNameByProduct(productName)
      );
    });
    var transparentRelationsAndLines = doc.querySelectorAll(
      ".im-rel-path, .tree__path, .rbelongs, .rboth"
    );
    transparentRelationsAndLines.forEach((node) => {
      if (
        node.style.stroke === "rgb(238, 238, 238)" ||
        node.style.stroke === "rgb(153, 153, 153)" ||
        node.style.stroke === "rgb(0, 0, 0)" ||
        node.style.stroke === "rgb(102, 102, 102)"
      ) {
        node.classList.add("forcedLineColor");
      }
    });

    var transparentMarkers = doc.querySelectorAll(
      "marker path, marker polygon, marker circle, marker g circle, .im-icon-ExpandCircle16"
    );
    transparentMarkers.forEach((node) => {
      if (
        node.getAttribute("stroke") === "rgb(238, 238, 238)" ||
        node.getAttribute("stroke") === "rgb(153, 153, 153)" ||
        node.getAttribute("stroke") === "rgb(0, 0, 0)" ||
        node.getAttribute("stroke") === "rgb(102, 102, 102)" ||
        node.getAttribute("stroke") === "#000" ||
        node.getAttribute("stroke") === "#eee" ||
        node.style.fill === "rgb(238, 238, 238)" ||
        node.style.fill === "rgb(153, 153, 153)" ||
        node.style.fill === "rgb(51, 51, 51)" ||
        node.style.fill === "rgb(0, 0, 0)" ||
        node.style.fill === "rgb(102, 102, 102)" ||
        node.style.fill === "#000" ||
        node.style.fill === "#eee"
      ) {
        node.classList.add("forcedLineColor");
        node.classList.add("forcedPolygonFill");
      }
    });

    var transparentMiddleCircles = doc.querySelectorAll(".im-icon-FullCircle");
    transparentMiddleCircles.forEach((node) => {
      if (
        node.style.fill === "rgb(238, 238, 238)" ||
        node.style.fill === "rgb(153, 153, 153)" ||
        node.style.fill === "rgb(51, 51, 51)" ||
        node.style.fill === "rgb(0, 0, 0)" ||
        node.style.fill === "rgb(102, 102, 102)" ||
        node.style.fill === "#000" ||
        node.style.fill === "#eee"
      ) {
        node.classList.add("forcedTransparentFill");
      }
    });

    var d = doc.getElementById("diagram");
    return d.outerHTML;
  },
  modifyDiagramForTrial(htmlCode, modelType) {
    var doc = document.implementation.createHTMLDocument("");
    doc.open();
    doc.write(htmlCode);
    doc.close();
    var myNodeList = doc.querySelectorAll(".dCols, .tree__item__named");
    myNodeList = _.shuffle(myNodeList);
    var i = 0;
    if (JsonSchemaHelpers.isPerseidModelType(modelType)) {
      myNodeList.forEach((node) => {
        i++;
        if (i % 4 === 0) {
          node.innerHTML += `<div onmouseover='this.style.opacity=0.95; this.style.top="1px";' onmouseleave='this.style.opacity=1; this.style.top="1px";' style='position:absolute; top:1px; left: 0; right: 0; bottom: 0px; background: rgba(0,0,0,
            ${Math.random() / 10 + 0.8}
            ); color: white; text-align: right; padding: 4px 8px;' onclick="window.open('https://www.datensen.com', '_blank'); event.stopPropagation();" ></div>
            <div onclick="window.open('https://www.datensen.com', '_blank'); event.stopPropagation();" style='display: inline-block;
            font-size: 10px;
            opacity: 1;
            color: white;
            box-shadow: 0 0 3px 0 #333;
            position: absolute;
            left: 0;
            right: 0;
            top: 3px;
            padding: 2px 1px;
            text-align: center;
            text-shadow: 0px 1px 0px #000;'>Trial version</div>
            <div onclick="window.open('https://www.datensen.com', '_blank'); event.stopPropagation();" id='
            ${Math.random()}
            ' style='overflow: hidden; padding-top: 2px; position: absolute; height: 20px; bottom: 1px; left: 0; right: 0; background: rgba(0,0,0,0.95); text-align: center; color: #2196f3'>
            <div style='display: inline-block;
            font-size: 10px;
            color: #2196f3;          
            box-shadow: 0 0 3px 0 #333;
            position: relative;
            bottom: 0;
            border-radius: 10px;'>datensen.com</div>
            </div>
            `;
        }
      });
    } else {
      myNodeList.forEach((node) => {
        i++;
        if (i % 5 === 0) {
          node.innerHTML += `<div onmouseover='this.style.opacity=0.95; this.style.top="23px";' onmouseleave='this.style.opacity=1; this.style.top="0px";' style='position:absolute; top:0; left: 0; right: 0; bottom: 0px; background: rgba(0,0,0,
          ${Math.random() / 10 + 0.8}
          ); color: white; text-align: right; padding: 4px 8px;' onclick="window.open('https://www.datensen.com', '_blank'); event.stopPropagation();" ></div>
          <div onclick="window.open('https://www.datensen.com', '_blank'); event.stopPropagation();" style='display: inline-block;
          background: #cc0000;
          opacity: 1;
          color: white;
          box-shadow: 0 0 3px 0 #333;
          position: absolute;
          right: 11px;
          top: 12px;
          padding: 2px 8px;
          border-radius: 2px;
          border: 1px solid rgba(255,255,255,0.2);
          text-shadow: 0px 1px 0px #000;'>Trial version</div>
          <div onclick="window.open('https://www.datensen.com', '_blank'); event.stopPropagation();" id='
          ${Math.random()}
          ' style='overflow: hidden; padding-top: 2px; position: absolute; height: 20px; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.95); text-align: center; color: #2196f3'>
          <div style='display: inline-block;
          color: #2196f3;          
          box-shadow: 0 0 3px 0 #333;
          position: relative;
          bottom: 0;
          border-radius: 10px;'>www.datensen.com</div>
          </div>
          `;
        }
      });
    }
    var d = doc.getElementById("diagram");
    return d.outerHTML;
  }
};
export default ReportHelpers;
