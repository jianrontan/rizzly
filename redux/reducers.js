import { SET_HAS_UNSAVED_CHANGES_EXPORT } from "./actions";

const editProfileState = {
  hasUnsavedChangesExportVal: false,
}

export function editProfileReducer(state = editProfileState, action) {
  switch (action.type) {
    case SET_HAS_UNSAVED_CHANGES_EXPORT:
      return {
        ...state,
        hasUnsavedChangesExportVal: action.payload
      }
    default:
      return state;
  }
}