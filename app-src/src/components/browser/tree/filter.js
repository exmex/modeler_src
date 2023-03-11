import _ from "lodash";

export const filterChildrenBySearchTerm = (node, searchTerm) => {
  const filteredChildren = _.filter(node.children, (child) =>
    isVisible(child, searchTerm)
  );
  node.children = filteredChildren;
  if (searchTerm && !anyParentMatchesFilter(node, searchTerm)) {
    node.filteredCount = filteredChildren.length;
  }
  return node;
};

const anyParentMatchesFilter = (node, searchTerm) => {
  return !!_.find(node.instancePath, (part) => matchesFilter(part, searchTerm));
};

const isRootGroup = (node) => {
  return node.offset === 1;
};

const isVisible = (node, searchTerm) => {
  const nodeWithFilteredChildren = filterChildrenBySearchTerm(node, searchTerm);
  return (
    hasChildren(nodeWithFilteredChildren) ||
    matchesFilter(node, searchTerm) ||
    anyParentMatchesFilter(node, searchTerm)
  );
};

const hasChildren = (node) => {
  return node.children.length > 0;
};

const matchesFilter = (node, searchTerm) => {
  return getObjectName(node)?.includes(searchTerm.toLowerCase());
};

const getObjectName = (node) => {
  return node?.object?.name?.toLowerCase();
};
