import React from "react";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import watermarkMeteor from "../assets/watermark-meteor.svg";
import watermarkMoon from "../assets/watermark-moon.svg";
import watermarkPerseid from "../assets/watermark-perseid.svg";

const UIHelpers = {
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  moveUp: function (arr, index) {
    if (index > 0) {
      this.swap(arr, index, index - 1);
    }
  },

  moveDown: function (arr, index) {
    if (index < arr.length - 1) {
      this.swap(arr, index, index + 1);
    }
  },
  swap: function (obj, prop1, prop2) {
    var tmp = obj[prop1];
    obj[prop1] = obj[prop2];
    obj[prop2] = tmp;
  },

  getHeader: function (caption) {
    return (
      <div className="im-keys-grid-header">
        <div />
        <div>{caption}</div>
        <div />
      </div>
    );
  },

  getTabHeadersByModelType(type) {
    if (type === "SEQUELIZE") return "Sequelize";
    else {
      return "SQL";
    }
  },

  makeSelect(arrayOfObjects) {
    return _.map(arrayOfObjects, (obj) => {
      return (
        <option key={obj} value={obj}>
          {obj}
        </option>
      );
    });
  },

  makeSelectArray(arrayOfObjects) {
    return _.map(arrayOfObjects, (obj) => {
      return (
        <option key={obj[0]} value={obj[1]}>
          {obj[0]}
        </option>
      );
    });
  },

  getDropDownElementId(objectType) {
    switch (objectType) {
      case "diagram_item":
        return "im-dropdown-diagram-item";
      case "relation":
        return "im-dropdown-relation";
      case "diagram":
        return "im-dropdown-diagram";
      case "project":
        return "im-dropdown-model";
      case "column":
        return "im-dropdown-column";
      default:
        return "im-dropdown-model";
    }
  },

  returnDropDownHeight(elementName) {
    const dropDownElement = document.getElementById(elementName);

    if (dropDownElement) {
      const boxDropDown = dropDownElement.getBoundingClientRect();
      if (boxDropDown) {
        return boxDropDown.height;
      } else {
        return 0;
      }
    }
  },

  makeTrueFalseSelect() {
    let options = [
      ["Not set", "na"],
      ["True", true],
      ["False", false]
    ];
    return _.map(options, (obj) => {
      return (
        <option key={obj[1]} value={obj[1]}>
          {obj[0]}
        </option>
      );
    });
  },

  setFocusToCanvasAndKeepScrollPosition: function () {
    var mainArea = document.getElementById("main-area");
    var canvas = document.getElementById("canvas");
    if (mainArea) {
      var x = mainArea.scrollLeft,
        y = mainArea.scrollTop;

      canvas.focus();
      mainArea.scrollTo(x, y);
    }
  },

  findItemInDiagramAndScrollToPosition(itemId, zoom) {
    var mainArea = document.getElementById("main-area");
    var canvas = document.getElementById("canvas");
    var objGraphics = document.getElementById(itemId);

    if (objGraphics) {
      var x = objGraphics.offsetLeft * zoom - 200,
        y = objGraphics.offsetTop * zoom - 200;

      canvas.focus();

      mainArea.scrollTo(x, y);
    }
  },

  getCurrentScroll() {
    const mainArea = document.getElementById("main-area");
    if (!mainArea) {
      return { left: 0, top: 0 };
    }
    return {
      x: mainArea.scrollLeft,
      y: mainArea.scrollTop
    };
  },

  scrollToXandY(x, y) {
    var mainArea = document.getElementById("main-area");
    mainArea.scrollTo(x, y);
  },
  syncDiagramAndSVGDimensions(zoom, reportIsRendered) {
    const ratio = 1 / zoom;
    const tempSvg = document.getElementById("svgMain");
    const tempTreeWrapper = document.getElementById("tree__wrapper");
    const tempTreeMiniToolbar = document.getElementById("tree__mini__toolbar");
    const tempDiagram = document.getElementById("diagram");
    if (tempSvg !== null) {
      if (reportIsRendered === true) {
        tempSvg.style.width =
          Math.round(tempDiagram.scrollWidth * ratio) + "px";
        tempSvg.style.height =
          Math.round(tempDiagram.scrollHeight * ratio) + "px";

        if (tempTreeWrapper !== null) {
          tempTreeWrapper.style.width =
            Math.round(tempDiagram.scrollWidth * ratio) + "px";
          tempTreeWrapper.style.height =
            Math.round(tempDiagram.scrollHeight * ratio) + "px";
        }
      } else {
        const scrollarea = document.getElementById("main-area");
        const tempDiagramBox = tempDiagram.getBoundingClientRect();
        tempSvg.style.width =
          Math.round(ratio * (tempDiagramBox.width + scrollarea.scrollLeft)) +
          "px";
        tempSvg.style.height =
          Math.round(ratio * (tempDiagramBox.height + scrollarea.scrollTop)) +
          "px";

        if (tempTreeWrapper !== null) {
          tempTreeWrapper.style.width =
            Math.round(tempDiagram.scrollWidth * ratio) + "px";
          tempTreeWrapper.style.height =
            Math.round(tempDiagram.scrollHeight * ratio) + "px";
        }
        if (tempTreeMiniToolbar !== null) {
          tempTreeMiniToolbar.style.width =
            Math.round(tempDiagram.scrollWidth * ratio) + "px";
        }
      }
    }
  },

  toggleNavArrowsInDiagramTabs() {
    const bottomElement = document.getElementById(
      "scrollingPanelForDiagramTabs"
    );
    const buttonElement = document.getElementById("btn-add-diagram");
    const tabsElement = document.getElementById("tabsPanelForDiagramTabs");
    const scrollingArrows = document.getElementById("scrollingPanelArrows");

    if (bottomElement && buttonElement && tabsElement && scrollingArrows) {
      if (
        bottomElement.clientWidth - buttonElement.clientWidth <
        tabsElement.scrollWidth
      ) {
        scrollingArrows.style.display = "inline-block";
      } else {
        scrollingArrows.style.display = "none";
      }
    }
  },

  async setDimensionsToDom(htmlNodes) {
    if (htmlNodes) {
      for (let htmlNode of htmlNodes) {
        let element = htmlNode;
        let dimensions = htmlNode.getBoundingClientRect();
        element.style.width = Math.round(dimensions.width) + "px";
        element.style.height = Math.round(dimensions.height) + "px";
      }
    }
  },

  async removeDimensionsFromDom(htmlNodes) {
    if (htmlNodes) {
      for (let htmlNode of htmlNodes) {
        htmlNode.style.width = null;
        htmlNode.style.height = null;
      }
    }
  },

  getWatermarkByProduct(productName) {
    switch (productName) {
      case "MeteorModeler":
        return watermarkMeteor;
      case "PerseidModeler":
        return watermarkPerseid;
      default:
        return watermarkMoon;
    }
  },

  renderWatermark(licenseKey, productName) {
    return (
      licenseKey === "" && (
        <image
          className="watermark"
          width="300"
          height="300"
          href={this.getWatermarkByProduct(productName)}
          x="40%"
          y="40%"
        />
      )
    );
  },

  setDropDownSubMenuPositionStyle(xPosition, componentWidth) {
    return xPosition > window.innerWidth - componentWidth - 10
      ? "im-ul-show-left"
      : "im-ul-show-right";
  },

  exportAndSave: function (fileName, data, object) {
    return (
      <a
        download={fileName}
        href={"data:application/octet-stream," + data + ""}
      >
        {object}
      </a>
    );
  }
};
export default UIHelpers;
