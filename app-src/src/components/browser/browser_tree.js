import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List
} from "react-virtualized";
import React, { Component } from "react";
import { getActiveItemInfo, getFilteredSelections } from "./tree/selections";

import { BrowserListItem } from "./browser_row";
import { ObjectType } from "../../enums/enums";
import { buildInstancePathId } from "./tree/definitions";
import { getHistoryContext } from "../../helpers/history/history";
import { getInputList } from "./tree/loader";
import { keyDown } from "./actions/keys";
import { locationChange } from "./tree/location";
import { navigateByObjectType } from "../url_navigation";

const VIRTUAL_ROW_PREFIX = "vr";
const NO_FOCUSED_INDEX = -1;
const DEFAULT_PAGE_SIZE = 1;

class BrowserTree extends Component {
  constructor(props) {
    super(props);

    this.renderRow = this.renderRow.bind(this);
    this.focusAndCalcPageSize = this.focusAndCalcPageSize.bind(this);
    this.toggleDisclosure = this.toggleDisclosure.bind(this);
    this.toggleSelection = this.toggleSelection.bind(this);
    this.clickObject = this.clickObject.bind(this);
    this.doubleClickObject = this.doubleClickObject.bind(this);
    this.editObject = this.editObject.bind(this);
    this.showObjectContextMenu = this.showObjectContextMenu.bind(this);
    this.toggleObjectVisibility = this.toggleObjectVisibility.bind(this);
    this.keyDown = this.keyDown.bind(this);
    this.navigateToIndex = this.navigateToIndex.bind(this);

    this.scrollInfo = {
      scrollToIndex: NO_FOCUSED_INDEX,
      refocus: false,
      pageSize: DEFAULT_PAGE_SIZE
    };

    this.focused = {
      instancePathId: undefined,
      index: undefined,
      objectId: undefined,
      objectType: undefined
    };

    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 100
    });

    this.ref = React.createRef();
    this.items = [];
    this.filteredSelections = {};
  }

  componentDidMount() {
    this.loadItems(this.props, {
      isForcedRenderChange: true,
      isSelectionChange: false,
      isSearchTermChange: false,
      isBrowserDisclosureChange: false,
      isFocusObjectChange: false
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const forceFocusObject =
      nextProps.location !== this.props.location
        ? locationChange(nextProps.location, this.focused)
        : undefined;

    const isForcedRenderChange =
      nextProps?.forcedRender.id !== this.props.forcedRender?.id;
    const isSearchTermChange = nextProps?.searchTerm !== this.props.searchTerm;
    const isBrowserSettingsChange =
      nextProps?.isBrowserSettingsChange !== this.props.isBrowserSettingsChange;
    const isBrowserDisclosureChange =
      nextProps?.browserDisclosure !== this.props.browserDisclosure;
    const isSelectionChange = nextProps?.selections !== this.props.selections;
    const isFocusObjectChange = !!forceFocusObject;

    if (isFocusObjectChange) {
      this.forceFocusAfterLocationChange(forceFocusObject);
    }

    const result =
      isForcedRenderChange ||
      isSearchTermChange ||
      isBrowserDisclosureChange ||
      isFocusObjectChange ||
      isBrowserSettingsChange;
    if (result) {
      this.loadItems(nextProps, {
        isForcedRenderChange,
        isSelectionChange,
        isSearchTermChange,
        isBrowserDisclosureChange,
        isFocusObjectChange
      });
    }
    return result;
  }

  forceFocusAfterLocationChange(forceFocusObject) {
    const isSameObject =
      this.focused.objectId === forceFocusObject.objectId &&
      this.focused.objectType === forceFocusObject.objectType;
    if (isSameObject) {
      return;
    }
    this.focused = {
      instancePathId: undefined,
      index: undefined,
      objectId: forceFocusObject.objectId,
      objectType: forceFocusObject.objectType
    };
  }

  loadItems(
    nextProps,
    {
      isForcedRenderChange,
      isSelectionChange,
      isSearchTermChange,
      isBrowserDisclosureChange,
      isFocusObjectChange
    }
  ) {
    const state = nextProps.modelState;

    if (
      isForcedRenderChange ||
      isBrowserDisclosureChange ||
      isSearchTermChange
    ) {
      this.items = !state.model?.type
        ? []
        : getInputList(state, {
            type: state.model.type,
            browserSettings: nextProps.browserSettings,
            browserDisclosure: nextProps.browserDisclosure,
            selections: nextProps.selections,
            searchTerm: nextProps.searchTerm,
            profile: state.profile
          });
    }
    if (
      isForcedRenderChange ||
      isBrowserDisclosureChange ||
      isSelectionChange
    ) {
      this.filteredSelections = getFilteredSelections(this.items);
    }
    if (
      isFocusObjectChange ||
      isForcedRenderChange ||
      isBrowserDisclosureChange ||
      isSelectionChange ||
      isSearchTermChange
    ) {
      this.activeItemInfo = getActiveItemInfo(
        this.activeItemInfo,
        this.items,
        this.focused
      );
      this.updateFocus(nextProps);
    }
    this.ref.current?.forceUpdateGrid();
  }

  getParent(item) {
    return item?.source?.propertyObjectType === ObjectType.COLUMN ||
      item?.source?.propertyObjectType === ObjectType.INDEX ||
      item?.source?.propertyObjectType === ObjectType.KEY
      ? item.instancePath?.[item.instancePath.length - 3]?.object
      : undefined;
  }

  navigateToIndex(index, ctrlMetaKey) {
    const item = this.items?.[index];
    this.changeFocusAfterNavigation(item, index);

    if (item?.source) {
      navigateByObjectType(
        getHistoryContext(this.props.history, this.props.match),
        item.source.propertyObjectType,
        item.object,
        this.getParent(item)
      );
    }

    this.props.processSelection(item, ctrlMetaKey);
  }

  changeFocusAfterNavigation(item, index) {
    this.focused = {
      instancePathId: buildInstancePathId(item.instancePath),
      index,
      objectId: item.object?.id,
      objectType:
        item?.source?.propertyObjectType ||
        item?.groupSource?.propertyObjectType
    };
  }

  updateFocus(nextProps) {
    const shouldScroll =
      nextProps.location !== this.props.location && !!this.activeItemInfo;
    this.scrollInfo = {
      ...this.scrollInfo,
      scrollToIndex: shouldScroll
        ? this.activeItemInfo.index
        : NO_FOCUSED_INDEX,
      refocus: shouldScroll
        ? document.activeElement?.id?.startsWith(VIRTUAL_ROW_PREFIX)
        : false
    };
  }

  toggleDisclosure(event) {
    const item = this.items[event.target.dataset.index];
    this.props.toggleDisclosure(this.props.browserDisclosure, item);
  }

  toggleSelection(event) {
    const item = this.items[event.target.dataset.index];
    this.props.toggleSelection(event.target.checked, item);
  }

  clickObject(event) {
    const index = event.target.dataset.index;
    this.props.click(
      { items: this.items, index },
      { ctrlMetaKey: event.ctrlKey || event.metaKey },
      this.navigateToIndex
    );
  }

  editObject(event) {
    const index = event.target.dataset.index;
    this.props.editObject(
      {
        items: this.items,
        index
      },
      this.navigateToIndex
    );
  }

  showObjectContextMenu(event) {
    event.stopPropagation();
    event.preventDefault();

    const index = event.target.dataset.index;
    const item = this.items[index];
    this.props.showObjectContextMenu(
      {
        item,
        index
      },
      { x: event.clientX, y: event.clientY },
      this.filteredSelections,
      this.navigateToIndex
    );
  }

  doubleClickObject(event) {
    this.editObject(event);
  }

  toggleObjectVisibility(event) {
    const item = this.items[event.target.dataset.index];
    this.props.toggleObjectVisibility(
      getHistoryContext(this.props.history, this.props.match),
      item.object.id,
      item.source.propertyObjectType
    );
  }

  buildVirtualRowId(index) {
    return VIRTUAL_ROW_PREFIX + index;
  }

  renderRow({ index, key, style, parent }) {
    const item = this.items[index];
    return (
      <CellMeasurer
        key={key}
        cache={this.cache}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        <div
          id={this.buildVirtualRowId(index)}
          key={key}
          style={style}
          onKeyDown={this.keyDown}
          tabIndex={0}
        >
          <BrowserListItem
            index={index}
            item={item}
            localization={this.props.localization}
            toggleDisclosure={this.toggleDisclosure}
            toggleSelection={this.toggleSelection}
            clickObject={this.clickObject}
            doubleClickObject={this.doubleClickObject}
            editObject={this.editObject}
            showObjectContextMenu={this.showObjectContextMenu}
            toggleObjectVisibility={this.toggleObjectVisibility}
            isMainDiagram={this.props.activeDiagramObject?.main}
          />
        </div>
      </CellMeasurer>
    );
  }

  keyDown(event) {
    event.preventDefault();
    event.stopPropagation();

    keyDown(
      this.props.dispatch,
      {
        ctrlMetaKey: event.ctrlKey || event.metaKey,
        keyCode: event.keyCode,
        key: event.key,
        charCode: String.fromCharCode(event.which).toLowerCase()
      },
      {
        activeItemInfo: this.activeItemInfo,
        items: this.items,
        filteredSelections: this.filteredSelections
      },
      {
        pageSize: this.pageSize,
        elementClientRect: event.target.getBoundingClientRect()
      },
      this.navigateToIndex
    );
  }

  focusAndCalcPageSize({ startIndex, stopIndex }) {
    if (this.scrollInfo.refocus && !!this.activeItemInfo) {
      document
        .getElementById(this.buildVirtualRowId(this.activeItemInfo.index))
        ?.focus();
    }
    this.pageSize = stopIndex - startIndex + 1;
  }

  render() {
    if (this.items?.length < 1 && this.props.searchTerm?.length > 0) {
      return (
        <div className="aside-right-message">
          No matches found. <br />
        </div>
      );
    } else {
      return (
        <AutoSizer>
          {({ width, height }) => {
            return (
              <List
                ref={this.ref}
                width={width}
                height={height}
                deferredMeasurementCache={this.cache}
                rowHeight={this.cache.rowHeight}
                rowRenderer={this.renderRow}
                rowCount={this.items.length}
                overscanRowCount={10}
                scrollToIndex={this.scrollInfo.scrollToIndex}
                onRowsRendered={this.focusAndCalcPageSize}
              />
            );
          }}
        </AutoSizer>
      );
    }
  }
}

export default BrowserTree;
