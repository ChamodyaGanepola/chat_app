import { combineReducers } from "redux";
import chatReducer from "./chatUserReducer";
import authReducer from "./authReducers"

export const reducers = combineReducers({authReducer, chatReducer})