export const SET_CURRENT_ORIENTATION = 'SET_CURRENT_ORIENTATION';
export const SET_INITIAL_ORIENTATION = 'SET_INITIAL_ORIENTATION'
export const SET_CURRENT_IMAGE = 'SET_CURRENT_IMAGE';
export const SET_INITIAL_IMAGE = 'SET_INITIAL_IMAGE';
export const SET_HAS_UNSAVED_CHANGES_EXPORT = 'SET_HAS_UNSAVED_CHANGES_EXPORT';
export const SET_VIEW_PROFILE_CHANGES = 'SET_VIEW_PROFILE_CHANGES';
export const SET_ABOUT_ME_CHANGES = 'SET_ABOUT_ME_CHANGES';
export const SET_SAVE_CHANGES = 'SET_SAVE_CHANGES';
export const SET_MATCHES_REDUX = 'SET_MATCHES_REDUX';
export const SET_LIKES = 'SET_LIKES';
export const SET_MATCHES_COUNT = 'SET_MATCHES_COUNT';
export const SET_UNREAD_CHATROOMS_COUNT = 'SET_UNREAD_CHATROOMS_COUNT'

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

export const setSaveChanges = saveChangesVal => {
  return dispatch => {
    dispatch({
      type: SET_SAVE_CHANGES,
      payload: saveChangesVal,
    });
  };
};

export const setMatchesRedux = matchesVal => {
  return dispatch => {
    dispatch({
      type: SET_MATCHES_REDUX,
      payload: matchesVal,
    });
  };
};

export const setLikes = likesVal => {
  return dispatch => {
    dispatch({
      type: SET_LIKES,
      payload: likesVal,
    });
  };
};

export const setMatchesCount = countVal => {
  return dispatch => {
    dispatch({
      type: SET_MATCHES_COUNT,
      payload: countVal,
    });
  };
};

export const setUnreadChatroomsCount = chatVal => {
  console.log(`Dispatching setUnreadChatroomsCount with count: ${chatVal}`);
  return dispatch => {
    dispatch({
      type: SET_UNREAD_CHATROOMS_COUNT,
      payload: chatVal,
    });
  };
};
