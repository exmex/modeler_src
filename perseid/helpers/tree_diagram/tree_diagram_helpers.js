import { FETCH_COLLAPSED_TREE_ITEMS } from "../../actions/collapsed_tree_items";
import UIHelpers from "../ui_helpers";
import _ from "lodash";

const TreeDiagramHelpers = {
  setChildrenVisibilityToExpanded(subId) {
    var element = document.getElementById(subId);
    if (element) {
      element.classList.add("im-display-inline-block");
      element.classList.remove("im-display-none");
    }
    var iconElement = document.getElementById("icon_" + subId);
    if (iconElement) {
      iconElement.classList.remove("im-icon-PlusCircle16");
      iconElement.classList.add("im-icon-MinusCircle16");
    }
  },

  toggleChildrenVisibility(subId) {
    var element = document.getElementById(subId);
    if (element) {
      element.classList.toggle("im-display-inline-block");
      element.classList.toggle("im-display-none");
    }
    var iconElement = document.getElementById("icon_" + subId);
    if (iconElement) {
      iconElement.classList.toggle("im-icon-PlusCircle16");
      iconElement.classList.toggle("im-icon-MinusCircle16");
    }
  },

  expandAllChildNodes(itemId, zoom) {
    const subId = itemId.replace("item", "sub");
    const selectorSourceElement = document.querySelector(`#${subId}`);
    this.setChildrenVisibilityToExpanded(subId);
    TreeDiagramHelpers.keepPositionAfterExpandCollapse(itemId, zoom);
    var nodes;
    if (selectorSourceElement !== null && selectorSourceElement !== undefined) {
      nodes = selectorSourceElement.querySelectorAll(".tree__item__sub");
    } else {
      nodes = document.querySelectorAll(".tree__item__sub");
    }
    nodes.forEach((node) => {
      this.setChildrenVisibilityToExpanded(node.id);
    });
  },

  expandOrCollapseChildNodes(
    itemId,
    shouldProcessAllChildren,
    zoom,
    shouldExpand
  ) {
    const styleToCheck = shouldExpand
      ? "im-display-none"
      : "im-display-inline-block";
    const subId = itemId.replace("item", "sub");
    const selectorSourceElement = document.querySelector(`#${subId}`);

    if (selectorSourceElement?.classList.contains(styleToCheck)) {
      this.toggleChildrenVisibility(subId);
      TreeDiagramHelpers.keepPositionAfterExpandCollapse(itemId, zoom);
      if (shouldProcessAllChildren) {
        this.expandOrCollapseNodes(
          ".tree__item__sub",
          selectorSourceElement,
          shouldExpand
        );
      }
    }
  },

  prepareParentsToExpand(itemId, selectors) {
    var currentElement = document.querySelector(`#${itemId}`);

    if (currentElement) {
      const parentElement = currentElement.closest(`.tree__item__sub`);

      if (parentElement) {
        const leftElementId = parentElement.id.replace("sub", "item");

        let other = this.prepareParentsToExpand(leftElementId, selectors);
        selectors.push(leftElementId);
        selectors = [...selectors, leftElementId];
        selectors = [...selectors, other];
      }
    }
    return selectors;
  },

  expandParentNodes(itemId, zoom) {
    const selectors = this.prepareParentsToExpand(itemId, []);
    if (_.size(selectors) > 0) {
      selectors.forEach((item) => {
        let itemIdSelector = `#${item}`;
        let domItem = document.querySelector(itemIdSelector);

        if (domItem) {
          this.expandOrCollapseChildNodes(domItem.id, false, zoom, true);
        }
      });
    }
  },

  expandOrCollapseNodes(selector, selectorSource, shouldExpand) {
    const styleToCheck = shouldExpand
      ? "im-display-none"
      : "im-display-inline-block";
    var nodes;
    if (
      selectorSource !== null &&
      selectorSource !== undefined &&
      selector !== "#"
    ) {
      nodes = selectorSource.querySelectorAll(selector);
    } else {
      nodes = document.querySelectorAll(selector);
    }
    nodes.forEach((node) => {
      if (node.classList.contains(styleToCheck)) {
        this.toggleChildrenVisibility(node.id);
      }
    });
  },

  getCollapsedNodes() {
    var collapsedNodes = [];
    var domElements = document.querySelectorAll(
      ".tree__item__sub.im-display-none"
    );
    if (domElements) {
      domElements.forEach((domElement) => {
        collapsedNodes.push(domElement.id);
      });
    }
    return collapsedNodes;
  },

  collapseNodesFromArray(collapsedNodesArr) {
    if (_.size(collapsedNodesArr) > 0) {
      _.each(collapsedNodesArr, (item) => {
        TreeDiagramHelpers.expandOrCollapseNodes(`#${item}`, document, false);
      });
    }
  },

  getLeftElement(currentItemId, isUpperSibling) {
    const currentElement = document.querySelector(`#${currentItemId}`);
    const currentElementDataTableId =
      currentElement.getAttribute("data-table-id");
    const parentElement = currentElement.closest(`.tree__item__sub`);
    if (parentElement) {
      const leftElementId = parentElement.id.replace("sub", "item");
      const leftElement = document.querySelector(`#${leftElementId}`);
      if (leftElement) {
        const children = Array.from(
          leftElement.nextElementSibling.querySelectorAll(
            `[data-table-id='${currentElementDataTableId}']`
          )
        );

        const positionOfCurrent = children.indexOf(currentElement);
        return isUpperSibling
          ? children[positionOfCurrent - 1]
          : children[positionOfCurrent + 1];
      }
    }
  },

  findItemInTreeDiagramAndScrollToPosition(itemId, zoom) {
    var mainArea = document.getElementById("main-area");
    var mainAreaBox = mainArea.getBoundingClientRect();
    var canvas = document.getElementById("canvas");
    var element = document.getElementById(itemId);
    var objGraphics = element.getBoundingClientRect();
    var currentScroll = UIHelpers.getCurrentScroll();
    const distanceFromSearchField = 80;
    const leftMargin = 40;

    if (objGraphics) {
      var x = objGraphics.x * zoom,
        y = objGraphics.y * zoom;

      canvas.focus();

      mainArea.scrollTo(
        Math.round(currentScroll.x + x - mainAreaBox.left - leftMargin),
        Math.round(
          currentScroll.y + y - mainAreaBox.top - distanceFromSearchField
        )
      );
    }
  },

  focusFindOnDiagramInput() {
    var findOnDigramInputElement = document.querySelector("#findOnDigramInput");

    findOnDigramInputElement.focus();
  },

  keepPositionAfterExpandCollapse(itemId, zoom) {
    var mainArea = document.getElementById("main-area");
    var mainAreaBox = mainArea.getBoundingClientRect();
    var canvas = document.getElementById("canvas");
    var element = document.getElementById(itemId);
    var objGraphics = element.getBoundingClientRect();
    var currentScroll = UIHelpers.getCurrentScroll();
    const distanceFromSearchField = 80;

    if (objGraphics) {
      var y = objGraphics.y * zoom;

      canvas.focus();

      mainArea.scrollTo(
        Math.round(currentScroll.x),
        Math.round(
          currentScroll.y + y - mainAreaBox.top - distanceFromSearchField
        )
      );
    }
  },

  scrollToPosition(itemId, zoom, direction) {
    var mainArea = document.getElementById("main-area");
    var mainAreaBox = mainArea.getBoundingClientRect();
    var canvas = document.getElementById("canvas");
    var element = document.getElementById(itemId);

    var objGraphics = element.getBoundingClientRect();
    var currentScroll = UIHelpers.getCurrentScroll();
    const distanceFromSearchField = 80;
    const leftMargin = 40;

    if (objGraphics) {
      var x = objGraphics.x * zoom,
        y = objGraphics.y * zoom,
        w = objGraphics.width * zoom,
        h = objGraphics.height * zoom;

      canvas.focus();

      if (direction === "right") {
        let yPosition = currentScroll.y;
        if (
          y < currentScroll.y + mainAreaBox.top ||
          y > currentScroll.y + mainAreaBox.height + mainAreaBox.top
        ) {
          yPosition = Math.round(
            currentScroll.y + y - mainAreaBox.top - distanceFromSearchField
          );
        }
        mainArea.scrollTo(
          Math.round(
            currentScroll.x + leftMargin + x - mainAreaBox.width + 2 * w
          ),
          yPosition
        );
      } else if (direction === "left") {
        let yPosition = currentScroll.y;
        if (
          y < currentScroll.y + mainAreaBox.top ||
          y > currentScroll.y + mainAreaBox.height + mainAreaBox.top
        ) {
          yPosition = Math.round(
            currentScroll.y + y - mainAreaBox.top - distanceFromSearchField
          );
        }
        mainArea.scrollTo(
          Math.round(
            currentScroll.x - mainAreaBox.left - leftMargin + x - 2 * w
          ),
          yPosition
        );
      } else if (direction === "up") {
        mainArea.scrollTo(
          Math.round(currentScroll.x),
          Math.round(currentScroll.y - mainAreaBox.top + y - 2 * h)
        );
      } else if (direction === "down") {
        mainArea.scrollTo(
          Math.round(currentScroll.x),
          Math.round(currentScroll.y + y - mainAreaBox.height + 2 * h)
        );
      }
    }
  }
};
export default TreeDiagramHelpers;
