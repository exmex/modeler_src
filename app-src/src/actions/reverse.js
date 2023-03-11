import { IPCContext, createReverseModelAction } from "../helpers/ipc/ipc";
import { getModelToStore, modernizeModel, provideModel } from "./model";

export function reverseAndUpdateModel(connection, historyContext) {
  return async (dispatch, getState) => {
    const state = getState();
    await dispatch(
      provideModel(
        historyContext,
        getState().isDirty,
        new IPCContext(createReverseModelAction(connection)),
        {
          autolayout: true,
          cancelable: true,
          connection,
          modelToUpdate: modernizeModel(getModelToStore(state), state.profile)
        }
      )
    );
  };
}
