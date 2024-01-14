import {
  SET_CURRENT_ORIENTATION,
  SET_INITIAL_ORIENTATION,
  SET_CURRENT_IMAGE,
  SET_INITIAL_IMAGE,
  SET_HAS_UNSAVED_CHANGES_EXPORT,
  SET_MATCHES_REDUX,
  SET_LIKES,
  SET_MATCHES_COUNT,
  SET_UNREAD_CHATS
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
  hasUnreadChats: false, 
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
    case SET_MATCHES_REDUX:
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
    case SET_UNREAD_CHATS:
      return {
        ...state,
        hasUnreadChats: action.payload
      } 
    default:
      return state;
  }
}