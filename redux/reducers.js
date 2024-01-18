import { SET_HAS_UNSAVED_CHANGES_EXPORT, SET_VIEW_PROFILE_CHANGES, SET_ABOUT_ME_CHANGES, SET_SAVE_CHANGES } from "./actions";

const editProfileState = {
  hasUnsavedChangesExportVal: false,
  viewProfileChangesVal: false,
  aboutMeChangesVal: false,
  saveChangesVal: false,
}

export function editProfileReducer(state = editProfileState, action) {
  switch (action.type) {
    case SET_HAS_UNSAVED_CHANGES_EXPORT:
      return {
        ...state,
        hasUnsavedChangesExportVal: action.payload
      }
    case SET_VIEW_PROFILE_CHANGES:
      return {
        ...state,
        viewProfileChangesVal: action.payload
      }
    case SET_ABOUT_ME_CHANGES:
      return {
        ...state,
        aboutMeChangesVal: action.payload
      }
    case SET_SAVE_CHANGES:
      return {
        ...state,
        saveChangesVal: action.payload
      }
    default:
      return state;
  }
}