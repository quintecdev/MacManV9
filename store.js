import {createStore, combineReducers} from 'redux';
import SettingsReducer from './reducers/SettingsReducer';
import TechnicianReducer from './reducers/TechnicianReducer';
import AppTextViewReducer from './reducers/AppTextViewReducer';
import JobOrderReportReducer from './reducers/JobOrderReportReducer';
import RealTimeDataReducer from './reducers/RealTimeDataReducer';
import LoginReducer from './reducers/LoginReducer';
import CurrentPageReducer from './reducers/CurrentPageReducer';
import PageVisitReducer from './reducers/PageVisitReducer';
import VersionReducer from './reducers/VersionReducer';
import AlertPopUpReducer from './reducers/AlertPopUpReducer';
import IntetnetConnectionReducer from './reducers/IntetnetConnectionReducer';
import BottomDrawerOpenReducer from './reducers/BottomDrawerOpenReducer';
import NotificationJobReducer from './reducers/NotificationJobReducer';

const store = createStore(
  combineReducers({
    LoginReducer,
    SettingsReducer,
    TechnicianReducer,
    AppTextViewReducer,
    JobOrderReportReducer,
    RealTimeDataReducer,
    CurrentPageReducer,
    PageVisitReducer,
    VersionReducer,
    AlertPopUpReducer,
    IntetnetConnectionReducer,
    BottomDrawerOpenReducer,
    NotificationJobReducer,
  }),
);

export default store;
