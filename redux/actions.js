export const SET_HAS_UNSAVED_CHANGES_EXPORT = 'SET_HAS_UNSAVED_CHANGES_EXPORT';
export const SET_VIEW_PROFILE_CHANGES = 'SET_VIEW_PROFILE_CHANGES';
export const SET_ABOUT_ME_CHANGES = 'SET_ABOUT_ME_CHANGES';

export const setHasUnsavedChangesExport = hasUnsavedChangesExportVal => {
  return dispatch => {
    dispatch({
      type: SET_HAS_UNSAVED_CHANGES_EXPORT,
      payload: hasUnsavedChangesExportVal,
    });
  };
};

export const setViewProfileChanges = viewProfileChangesVal => {
  return dispatch => {
    dispatch({
      type: SET_VIEW_PROFILE_CHANGES,
      payload: viewProfileChangesVal,
    });
  };
};

export const setAboutMeChanges = aboutMeChangesVal => {
  return dispatch => {
    dispatch({
      type: SET_ABOUT_ME_CHANGES,
      payload: aboutMeChangesVal,
    });
  };
};