import {
  SET_CURRENT_ORIENTATION,
  SET_INITIAL_ORIENTATION,
  SET_CURRENT_IMAGE,
  SET_INITIAL_IMAGE,
  SET_HAS_UNSAVED_CHANGES_EXPORT,
  SET_VIEW_PROFILE_CHANGES,
  SET_ABOUT_ME_CHANGES,
  SET_SAVE_CHANGES,
  SET_MATCHES_REDUX,
  SET_LIKES,
  SET_MATCHES_COUNT,
  SET_UNREAD_CHATROOMS_COUNT,
  SET_UNITS,
} from "./actions";

const editProfileState = {
  currentOrientationVal: null,
  initialOrientationVal: null,
  currentImageVal: [],
  initialImageVal: [],
  hasUnsavedChangesExportVal: false,
  matchesVal: [],
  likesVal: 0,
  countVal: 0,
  chatVal: 0,
  viewProfileChangesVal: false,
  aboutMeChangesVal: false,
  saveChangesVal: false,
  isMetric: false,
  isMiles: false,
}

export function editProfileReducer(state = editProfileState, action) {
  switch (action.type) {
    case SET_CURRENT_ORIENTATION:
      return {
        ...state,
        currentOrientationVal: action.payload
      };
    case SET_INITIAL_ORIENTATION:
      return {
        ...state,
        initialOrientationVal: action.payload
      };
    case SET_CURRENT_IMAGE:
      return {
        ...state,
        currentImageVal: action.payload
      }
    case SET_INITIAL_IMAGE:
      return {
        ...state,
        initialImageVal: action.payload
      }
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
    case SET_MATCHES_REDUX:
      console.log(action.payload);
      return {
        ...state,
        matchesVal: action.payload
      }
    case SET_LIKES:
      return {
        ...state,
        likesVal: action.payload
      }
    case SET_MATCHES_COUNT:
      return {
        ...state,
        countVal: action.payload
      }
    case SET_UNREAD_CHATROOMS_COUNT:
      console.log(`Updating unreadChatroomsCount to: ${action.payload}`);
      return {
        ...state,
        chatVal: action.payload
      }
    case SET_UNITS:
      return {
        ...state,
        isMetric: action.payload.isMetric,
        isMiles: action.payload.isMiles,
      };
    default:
      return state;
  }
};
