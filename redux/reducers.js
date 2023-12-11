import { SET_CURRENT_ORIENTATION, SET_INITIAL_ORIENTATION, SET_CURRENT_IMAGE, SET_INITIAL_IMAGE } from "./actions";

const editProfileState = {
  currentOrientationVal: null,
  initialOrientationVal: null,
  currentImageVal: [],
  initialImageVal: [],
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
    default:
      return state;
  }
}