export const SET_CURRENT_ORIENTATION = 'SET_CURRENT_ORIENTATION';
export const SET_INITIAL_ORIENTATION = 'SET_INITIAL_ORIENTATION'
export const SET_CURRENT_IMAGE = 'SET_CURRENT_IMAGE';
export const SET_INITIAL_IMAGE = 'SET_INITIAL_IMAGE';
export const SET_HAS_UNSAVED_CHANGES_EXPORT = 'SET_HAS_UNSAVED_CHANGES_EXPORT';

export const setCurrentOrientation = currentOrientationVal => {
  return dispatch => {
    dispatch({
      type: SET_CURRENT_ORIENTATION,
      payload: currentOrientationVal,
    });
  };
};

export const setInitialOrientation = initialOrientationVal => {
  return dispatch => {
    dispatch({
      type: SET_INITIAL_ORIENTATION,
      payload: initialOrientationVal,
    });
  };
};

export const setCurrentImage = currentImageVal => {
  return dispatch => {
    dispatch({
      type: SET_CURRENT_IMAGE,
      payload: currentImageVal,
    });
  };
};

export const setInitialImage = initialImageVal => {
  return dispatch => {
    dispatch({
      type: SET_INITIAL_IMAGE,
      payload: initialImageVal,
    });
  };
};

export const setHasUnsavedChangesExport = hasUnsavedChangesExportVal => {
  return dispatch => {
    dispatch({
      type: SET_HAS_UNSAVED_CHANGES_EXPORT,
      payload: hasUnsavedChangesExportVal,
    });
  };
};