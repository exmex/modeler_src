export const FETCH_COLLAPSED_TREE_ITEMS = "fetch_collapsed_tree_items";

export function fetchCollapsedTreeItems(treeItems) {
  return {
    type: FETCH_COLLAPSED_TREE_ITEMS,
    payload: treeItems
  };
}
