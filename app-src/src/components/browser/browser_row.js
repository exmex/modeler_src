import React, { Component } from "react";

import CheckboxCustom from "../checkbox_custom";

const { buildInstancePathId } = require("./tree/definitions");

const INDENT_SIZE = 20;

const NO_ICON = "";
const COLLAPSIBLE_ICON_FIRST_LEVEL = "br-icon-collapsible-lg";
const COLLAPSIBLE_ICON_NESTED = "br-icon-collapsible-md";
const COLLAPSED_ICON_CLASSNAME = "im-icon-Collapse16 im-normal";
const DOT_HORIZONTAL_ICON_CLASSNAME = " im-icon-DotsHorizontal16";
const EDIT_ICON_CLASSNAME = " im-icon-Edit16";
const EXPANDED_ICON_CLASSNAME = "im-icon-Collapse16 br-rotate";
const HIDDEN_ICON_CLASSNAME = " im-icon-Hidden16";
const NOT_IN_DIAGRAM_ICON_CLASSNAME = " im-icon-NotInDiagram";
const SHOWN_ICON_CLASSNAME = " im-icon-Visibility16";

const BROWSER_BUTTON_CLASSNAME = " br-btn";
const BROWSER_GROUP_CAPTION_CLASSNAME = "br-group-caption ";
const BROWSER_GROUP_ROOT_CAPTION_CLASSNAME = "br-group-root-caption ";
const BROWSER_EXPANDER_CLASSNAME = "br-expander";
const BROWSER_ITEM_CLASSNAME = "br-item";
const BROWSER_ROW_CLASSNAME = "br-row";
const BROWSER_ROW_GROUP_CLASSNAME = "br-row-group";
const BROWSER_ROW_GROUP_FIRST_LEVEL_CLASSNAME = "br-row-group-first-level";
const BROWSER_ROW_GROUP_FOCUSED = "br-row-group-focused";
const BROWSER_ROW_SELECTED = "br-row-selected";
const BROWSER_ROW_FOCUSED = "br-row-focused";
const BROWSER_OBJECT_CAPTION_CLASSNAME = "br-object-caption";

const BROWSER_DISABLED_CLASSNAME = "br-disabled";
const BROWSER_CURSOR_CLASSNAME = " br-cursor";
const BROWSER_MIN_INDENT = "br-min-indent";
const BROWSER_COUNTER = "br-cnt";
const BROWSER_ROOT_INDENT = "br-root-indent";
const BROWSER_CHECKBOX = "br-chk";
const BROWSER_SELECTION_CHECKBOX = "br-selection-chk";
const BROWSER_SEARCH_COUNT = "br-search-cnt";

class BrowserRow extends Component {
  isDisabled() {
    return this.props.item.onDiagram === false;
  }

  disabledClassName() {
    return this.isDisabled() ? ` ${BROWSER_DISABLED_CLASSNAME}` : ``;
  }

  getIndentStyle() {
    return {
      display: "inline-block",
      width: `${this.getIndentSize()}px`
    };
  }

  getIndentSize() {
    const MOVE_ITEM_TO_LEFT_BORDER = -2;
    return INDENT_SIZE * (this.props.item.offset + MOVE_ITEM_TO_LEFT_BORDER);
  }

  isRootObject() {
    return this.getIndentSize() === 0;
  }

  getGroupCaptionStyle() {
    return this.props.item.offset === 1
      ? BROWSER_GROUP_ROOT_CAPTION_CLASSNAME
      : BROWSER_GROUP_CAPTION_CLASSNAME;
  }

  getRowClassName() {
    if (this.props.item.isActive) {
      return BROWSER_ROW_FOCUSED + this.disabledClassName();
    } else {
      return BROWSER_ROW_CLASSNAME + this.disabledClassName();
    }
  }

  renderItemDetails() {
    return <div className={BROWSER_MIN_INDENT}></div>;
  }

  render() {
    return (
      <div className={this.getRowClassName()}>
        <span className={BROWSER_ITEM_CLASSNAME}>
          <span style={this.getIndentStyle()}></span>
          {this.renderItemDetails()}
        </span>
      </div>
    );
  }
}

class GroupBrowserRow extends BrowserRow {
  renderItemDetails() {
    return (
      <>
        {this.renderDisclosure()}
        {this.renderCaption()}
      </>
    );
  }

  getRowClassName() {
    const browserRowGroup =
      this.props.item.offset === 1
        ? BROWSER_ROW_GROUP_FIRST_LEVEL_CLASSNAME
        : BROWSER_ROW_GROUP_CLASSNAME;
    if (this.props.item.isActive) {
      return BROWSER_ROW_GROUP_FOCUSED + this.disabledClassName();
    } else {
      return browserRowGroup + this.disabledClassName();
    }
  }

  getDisclosureClassName() {
    const disclosureIconClassName = !this.props.item.disclosure
      ? EXPANDED_ICON_CLASSNAME
      : COLLAPSED_ICON_CLASSNAME;

    const disclosureIconSizeClassName =
      this.props.item.offset === 1
        ? COLLAPSIBLE_ICON_FIRST_LEVEL
        : COLLAPSIBLE_ICON_NESTED;

    return `${disclosureIconClassName} ${BROWSER_EXPANDER_CLASSNAME}${this.disabledClassName()} ${disclosureIconSizeClassName}`;
  }

  renderCaption() {
    const countText = this.props.item.filteredCount ? (
      <span
        onClick={this.props.clickObject}
        data-index={this.props.index}
        className={BROWSER_COUNTER}
      >
        (
        <span
          onClick={this.props.clickObject}
          data-index={this.props.index}
          className={BROWSER_SEARCH_COUNT}
        >
          {this.props.item.filteredCount}
        </span>
        <span onClick={this.props.clickObject} data-index={this.props.index}>
          {` of ${this.props.item.count}`}
        </span>
        )
      </span>
    ) : (
      <span
        onClick={this.props.clickObject}
        data-index={this.props.index}
        className={BROWSER_COUNTER}
      >
        ({this.props.item.count})
      </span>
    );
    const noCountText = ``;
    const counterText = this.props.item.count ? countText : noCountText;
    return (
      <>
        <div
          key={buildInstancePathId(this.props.item.instancePath)}
          className={this.getGroupCaptionStyle() + this.disabledClassName()}
          onClick={this.props.clickObject}
          data-index={this.props.index}
        >
          {this.props.localization[this.props.item.groupSource.label]}
          <span
            onClick={this.props.clickObject}
            data-index={this.props.index}
            className={BROWSER_COUNTER}
          >
            {counterText}
          </span>
        </div>
      </>
    );
  }

  renderDisclosure() {
    return (
      <div
        key={buildInstancePathId(this.props.item.instancePath)}
        className={this.getDisclosureClassName()}
        onClick={this.props.clickObject}
        data-index={this.props.index}
      />
    );
  }
}

class ObjectBrowserRow extends BrowserRow {
  getRowClassName() {
    if (this.props.item.isActive) {
      return BROWSER_ROW_FOCUSED + this.disabledClassName();
    } else if (this.props.item.selected) {
      return BROWSER_ROW_SELECTED + this.disabledClassName();
    } else {
      return BROWSER_ROW_CLASSNAME + this.disabledClassName();
    }
  }

  renderBeforeCaptionComponents() {
    return <></>;
  }

  renderAfterCaptionComponents() {
    return <></>;
  }

  getMainDiagramIconControlledVisibilityClassName() {
    if (this.props.item.object.onDiagram === undefined) {
      return NO_ICON;
    }
    return this.props.item.object.visible === true
      ? SHOWN_ICON_CLASSNAME
      : HIDDEN_ICON_CLASSNAME;
  }

  getMainDiagramIconUncontrolledVisibilityClassName() {
    return this.props.item.object.onDiagram === false
      ? NOT_IN_DIAGRAM_ICON_CLASSNAME
      : NO_ICON;
  }

  isObjectVisible() {
    return (
      (this.props.isMainDiagram && this.props.item.object.visible) ||
      (!this.props.isMainDiagram && this.props.item.object.onDiagram === true)
    );
  }

  visibilityIcon() {
    const mainDiagramIcon =
      this.props.item.source.hasVisibilityControl === true
        ? this.getMainDiagramIconControlledVisibilityClassName()
        : this.getMainDiagramIconUncontrolledVisibilityClassName();

    const otherDiagramIcon =
      this.props.item.object.onDiagram === false
        ? NOT_IN_DIAGRAM_ICON_CLASSNAME
        : NO_ICON;

    return this.props.isMainDiagram ? mainDiagramIcon : otherDiagramIcon;
  }

  renderItemDetails() {
    return (
      <>
        {this.renderBeforeCaptionComponents()}
        <span
          className={
            BROWSER_OBJECT_CAPTION_CLASSNAME + this.disabledClassName()
          }
          onClick={this.props.clickObject}
          onContextMenu={this.props.showObjectContextMenu}
          onDoubleClick={this.props.doubleClickObject}
          data-index={this.props.index}
        >
          {this.props.item?.object?.name}
        </span>
        {this.renderAfterCaptionComponents()}
      </>
    );
  }
}

class SelectableObjectBrowserRow extends ObjectBrowserRow {
  renderBeforeCaptionComponents() {
    return this.isObjectVisible() ? (
      <div className={BROWSER_SELECTION_CHECKBOX}>
        <CheckboxCustom
          className={this.disabledClassName()}
          type="checkbox"
          checked={this.props.item.selected}
          onChange={this.props.toggleSelection}
          data-index={this.props.index}
        />
      </div>
    ) : (
      <span className={BROWSER_CHECKBOX}></span>
    );
  }

  renderAfterCaptionComponents() {
    return (
      <>
        <span
          className={
            BROWSER_BUTTON_CLASSNAME +
            BROWSER_CURSOR_CLASSNAME +
            this.disabledClassName() +
            this.visibilityIcon()
          }
          onClick={this.props.toggleObjectVisibility}
          data-index={this.props.index}
        />
        <span
          className={
            BROWSER_BUTTON_CLASSNAME +
            BROWSER_CURSOR_CLASSNAME +
            DOT_HORIZONTAL_ICON_CLASSNAME +
            this.disabledClassName()
          }
          onClick={this.props.showObjectContextMenu}
          data-index={this.props.index}
        />
      </>
    );
  }
}
class FocusableObjectBrowserRow extends ObjectBrowserRow {
  renderBeforeCaptionComponents() {
    return this.isRootObject() ? (
      <div className={BROWSER_ROOT_INDENT}></div>
    ) : (
      <></>
    );
  }

  hasContextMenu() {
    return (
      this.props.item.source.hasContextMenu === undefined ||
      this.props.item.source.hasContextMenu === true
    );
  }

  hasEditAction() {
    return (
      this.props.item.source.hasEditAction === undefined ||
      this.props.item.source.hasEditAction === true
    );
  }

  renderContextMenuButton() {
    return (
      <span
        className={
          BROWSER_BUTTON_CLASSNAME +
          BROWSER_CURSOR_CLASSNAME +
          DOT_HORIZONTAL_ICON_CLASSNAME +
          this.disabledClassName()
        }
        onClick={this.props.showObjectContextMenu}
        data-index={this.props.index}
      />
    );
  }

  renderEditButton() {
    return (
      <span
        className={
          BROWSER_BUTTON_CLASSNAME +
          BROWSER_CURSOR_CLASSNAME +
          EDIT_ICON_CLASSNAME +
          this.disabledClassName()
        }
        onClick={this.props.editObject}
        data-index={this.props.index}
      />
    );
  }

  renderAfterCaptionComponents() {
    const EDIT_ACTION_BUTTON = this.hasEditAction() ? (
      this.renderEditButton()
    ) : (
      <></>
    );
    const CONTEXT_OR_EDIT_ACTION_BUTTON = this.hasContextMenu()
      ? this.renderContextMenuButton()
      : EDIT_ACTION_BUTTON;
    return (
      <>
        <span
          className={
            BROWSER_BUTTON_CLASSNAME +
            BROWSER_CURSOR_CLASSNAME +
            this.disabledClassName() +
            this.visibilityIcon()
          }
        />
        {CONTEXT_OR_EDIT_ACTION_BUTTON}
      </>
    );
  }
}

export class BrowserListItem extends Component {
  render() {
    if (this.props.item.groupSource) {
      return (
        <GroupBrowserRow
          key={buildInstancePathId(this.props.item.instancePath)}
          index={this.props.index}
          item={this.props.item}
          localization={this.props.localization}
          clickObject={this.props.clickObject}
        />
      );
    } else if (this.props.item.source?.selectableItems) {
      return (
        <SelectableObjectBrowserRow
          key={buildInstancePathId(this.props.item.instancePath)}
          index={this.props.index}
          item={this.props.item}
          toggleSelection={this.props.toggleSelection}
          clickObject={this.props.clickObject}
          showObjectContextMenu={this.props.showObjectContextMenu}
          doubleClickObject={this.props.doubleClickObject}
          toggleObjectVisibility={this.props.toggleObjectVisibility}
          isMainDiagram={this.props.isMainDiagram}
        />
      );
    } else {
      return (
        <FocusableObjectBrowserRow
          key={buildInstancePathId(this.props.item.instancePath)}
          index={this.props.index}
          item={this.props.item}
          clickObject={this.props.clickObject}
          showObjectContextMenu={this.props.showObjectContextMenu}
          doubleClickObject={this.props.doubleClickObject}
          isMainDiagram={this.props.isMainDiagram}
          editObject={this.props.editObject}
        />
      );
    }
  }
}
