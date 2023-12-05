// import { configureStore, combineReducers, applyMiddleware } from "@reduxjs/toolkit";
// import thunk from "redux-thunk";
// import { settingsReducer } from "./reducers";

// const rootReducer = combineReducers({
//     settingsReducer
// });

// export const Store = configureStore({
//     reducer: rootReducer, 
//     middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
// });

// store.js
import { createStore } from 'redux';
import rootReducer from './rootReducer'; // Adjust the import path

const store = createStore(rootReducer);

export default store;
