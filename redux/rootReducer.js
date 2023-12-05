import { combineReducers } from 'redux';
import userReducer from './userReducer';

const rootReducer = combineReducers({
  user: userReducer, // Replace with your actual reducer
  // Add other reducers as needed
});

export default rootReducer;
