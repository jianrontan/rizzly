export const SET_HAS_UNSAVED_CHANGES_EXPORT = 'SET_HAS_UNSAVED_CHANGES_EXPORT';

export const setHasUnsavedChangesExport = hasUnsavedChangesExportVal => {
  return dispatch => {
    dispatch({
      type: SET_HAS_UNSAVED_CHANGES_EXPORT,
      payload: hasUnsavedChangesExportVal,
    });
  };
};