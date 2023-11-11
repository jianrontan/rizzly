export const SET_BREAK_CONTINUE = 'SET_BREAK_CONTINUE';

export const setBreakContinue = continueVal => {
  return dispatch => {
    dispatch({
      type: SET_BREAK_CONTINUE,
      payload: continueVal,
    });
  };
};