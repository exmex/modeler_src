import _ from "lodash";
import { createSelector } from "reselect";

const restore = (state) => state.restore;

export const getUnsavedModels = createSelector([restore], (unsavedModels) => {
  return _.filter(
    unsavedModels,
    (unsavedModel) => unsavedModel.brokenApp === true
  );
});
