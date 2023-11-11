import { SET_BREAK_CONTINUE } from "./actions";

const settingsState = {
  continueVal: false,
}

export function settingsReducer(state = settingsState, action) {
  switch (action.type) {
    case SET_BREAK_CONTINUE:
      return {
        ...state,
        continueVal: action.payload
      };
  }
}