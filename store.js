import { createStore, combineReducers } from "redux";
import SettingsReducer from "./reducers/SettingsReducer";
import TechnicianReducer from "./reducers/TechnicianReducer";
import AppTextViewReducer from "./reducers/AppTextViewReducer";
import JobOrderReportReducer from './reducers/JobOrderReportReducer';
import RealTimeDataReducer from './reducers/RealTimeDataReducer';
import LoginReducer from './reducers/LoginReducer';

const store = createStore(
    combineReducers(
        {
            LoginReducer,
            SettingsReducer,
            TechnicianReducer,
            AppTextViewReducer,
            JobOrderReportReducer,
            RealTimeDataReducer,
        }
        ))

export default store