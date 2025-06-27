import actionsConstants from '../constants/actionsConstants';

const initialState = {
  JobOrderReportVisit: false,
  ChecklistNotifactionCount: 0,
  EmergencyJoblistNotifactionCount: 0,
  EmergencyJoblistNotifactionBgStatus: {},
  EmergencyJobListToShow:false
};

export default (state = initialState, action) => {
  console.log({action});
  switch (action.type) {
    case actionsConstants.ACTION_SET_JOB_ORDER_REPORT_VISIT:
      return {
        ...state,
        JobOrderReportVisit: action.payload.JobOrderReportVisit,
      };
    case actionsConstants.ACTION_SUP_CHECKLIST_NOTIFICATION:
      return {
        ...state,
        ChecklistNotifactionCount: action.payload.ChecklistNotifactionCount,
      };
    case actionsConstants.ACTION_SET_EMERGENCY_JOBLIST_COUNT:
      return {
        ...state,
        EmergencyJoblistNotifactionCount:
          action.payload.EmergencyJoblistNotifactionCount,
      };
    case actionsConstants.ACTION_SET_BREAKDOWN_NOTIFICATION_BG_STATUS:
      return {
        ...state,
        EmergencyJoblistNotifactionBgStatus:
          action.payload.EmergencyJoblistNotifactionBgStatus,
      };
    case actionsConstants.ACTION_SET_EMERGENCYJOBLIST_SHOW:
      return {
        ...state,
        EmergencyJobListToShow:action.payload.showEmergencyJobList
      };
    default:
      return state;
  }
};
