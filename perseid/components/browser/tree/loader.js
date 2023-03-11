import {
  DISCLOSURE,
  ORDER,
  buildGroupPathId,
  buildInstancePathId
} from "./definitions";

import _ from "lodash";
import { filterChildrenBySearchTerm } from "./filter";
import { getBrowserTreeMetadataByPlatform } from "../platform/metadata";
import { getCurrentDisclosure } from "../actions/disclosure";
import { getPlatformProperty } from "../../../enums/enums";
import { getVisibleGroups } from "./visibility";

const createGroupNode = (
  { model, selections, platformBrowserSettings },
  { parentObject, groupSource },
  { offset, groupPath, instancePath, onDiagram }
) => {
  let objectNodes = [];
  const objects = groupSource.getObjects(model, parentObject) || [];
  const orderedObjects =
    groupSource.order === ORDER.DEFAULT
      ? objects
      : _.orderBy(
          objects,
          [(it) => it["onDiagram"] === true, (it) => it["name"]?.toLowerCase()],
          ["desc", "asc"]
        );

  objectNodes = createGroupNodeOpened(
    { objects: orderedObjects, groupSource },
    { model, selections, platformBrowserSettings },
    { offset, groupPath, instancePath, onDiagram }
  );

  return {
    groupSource,
    children: objectNodes,
    offset: offset,
    count: groupSource.isCountHidden ? undefined : objects.length,
    groupPath,
    instancePath,
    onDiagram
  };
};

export const createNode = (
  { model, selections, platformBrowserSettings },
  { object, groupSource },
  { offset, groupPath, instancePath, onDiagram }
) => {
  const forwardedOnDiagram = object.onDiagram === false ? false : onDiagram;
  const visibleGroups = getVisibleGroups(
    buildGroupPathId(groupPath),
    groupSource,
    platformBrowserSettings
  );
  const groups = getNodeChildren(
    visibleGroups,
    { model, selections, platformBrowserSettings },
    { groupSource, object },
    { offset, groupPath, instancePath, onDiagram: forwardedOnDiagram }
  );
  return {
    source: groupSource,
    object,
    children: groups,
    offset,
    selected: selections[object.id] || false,
    groupPath,
    instancePath,
    onDiagram: forwardedOnDiagram
  };
};

export const treeToList = (node, hasRoot) => {
  if (!node) {
    return [];
  }
  return _.reduce(
    node.children,
    (list, treeNode) => {
      list.push(...treeToList(treeNode, true));
      return list;
    },
    hasRoot ? [node] : []
  );
};

const getNodeChildren = (
  visibleGroups,
  { model, selections, platformBrowserSettings },
  { object, groupSource },
  { offset, groupPath, instancePath, onDiagram }
) => {
  return _.map(visibleGroups, (group) => {
    return createGroupNode(
      { model, selections, platformBrowserSettings },
      { parentObject: object, groupSource: group },
      {
        offset: offset + 1,
        groupPath: [...groupPath, group],
        instancePath: [...instancePath, { group, groupSource }],
        onDiagram
      }
    );
  });
};

const createTree = (
  rootBrowserTreeMetadata,
  model,
  { selections, platformBrowserSettings }
) => {
  return rootBrowserTreeMetadata
    ? createNode(
        {
          model,
          selections,
          platformBrowserSettings
        },
        { object: model, groupSource: rootBrowserTreeMetadata },
        {
          offset: 0,
          groupPath: [rootBrowserTreeMetadata],
          instancePath: [
            { object: model, groupSource: rootBrowserTreeMetadata }
          ],
          onDiagram: true
        }
      )
    : undefined;
};

const updateDislosure = (node, browserDisclosure) => {
  const instancePathId = buildInstancePathId(node.instancePath);
  const disclosure = getCurrentDisclosure(
    browserDisclosure,
    node.groupSource || node.source,
    instancePathId
  );
  node.disclosure = disclosure;

  if (disclosure === DISCLOSURE.CLOSE) {
    node.children = [];
  } else {
    node.children = _.map(node.children, (childNode) =>
      updateDislosure(childNode, browserDisclosure)
    );
  }
  return node;
};

export const getInputList = (
  state,
  { type, browserSettings, browserDisclosure, selections, searchTerm }
) => {
  const rootBrowserTreeMetadata = getBrowserTreeMetadataByPlatform(type);
  const platformProperty = getPlatformProperty(type);
  const platformBrowserSettings = browserSettings?.[platformProperty] || {};

  const tree = createTree(rootBrowserTreeMetadata, state, {
    platformBrowserSettings,
    selections
  });

  const filteredTree = searchTerm
    ? filterChildrenBySearchTerm(tree, searchTerm)
    : tree;

  const dislosuredTree = updateDislosure(filteredTree, browserDisclosure);

  return treeToList(dislosuredTree);
};

function createGroupNodeOpened(
  { objects, groupSource },
  { model, selections, platformBrowserSettings },
  { offset, groupPath, instancePath, onDiagram }
) {
  return _.map(objects, (object) => {
    return createNode(
      { model, selections, platformBrowserSettings },
      { object, groupSource },
      {
        offset: offset + 1,
        groupPath,
        instancePath: [...instancePath, { object, groupSource }],
        onDiagram
      }
    );
  });
}
