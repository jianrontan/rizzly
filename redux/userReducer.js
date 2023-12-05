// userReducer.js
const initialState = {
    id: '',
    name: '',
    birthday: '',
    gender: '',
    orientation: '',
    image: '', // Replace the period with a comma
    // Other user properties
  };
  
  const userReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_USER':
        // Example: Update user data when a 'SET_USER' action is dispatched
        return {
          ...state,
          id: action.payload.id,
          name: action.payload.name,
          birthday: action.payload.birthday,
          gender: action.payload.gender,
          orientation: action.payload.orientation,
          image: action.payload.image,
          // Update other user properties as needed
        };
      case 'UPDATE_PROFILE_PICTURE':
        return {
          ...state,
          image: action.payload.image,
        };
      // Add other cases for different actions
  
      default:
        return state;
    }
  };
  
  export default userReducer;
  