import actionsConstants from '../constants/actionsConstants';

export const actionSetJobOrderReportVisit = (JobOrderReportVisit) => ({
  type: actionsConstants.ACTION_SET_JOB_ORDER_REPORT_VISIT,
  payload: {JobOrderReportVisit},
});
export const actionSetSupCheckListNotification = (
  ChecklistNotifactionCount,
) => ({
  type: actionsConstants.ACTION_SUP_CHECKLIST_NOTIFICATION,
  payload: {ChecklistNotifactionCount},
});
export const actionSetEmergencyJoblistNotificationCount = (
  EmergencyJoblistNotifactionCount,
) => ({
  type: actionsConstants.ACTION_SET_EMERGENCY_JOBLIST_COUNT,
  payload: {EmergencyJoblistNotifactionCount},
});
export const actionSetEmergencyJoblistNotificationBgStatus = (
  EmergencyJoblistNotifactionBgStatus,
) => ({
  type: actionsConstants.ACTION_SET_BREAKDOWN_NOTIFICATION_BG_STATUS,
  payload: {EmergencyJoblistNotifactionBgStatus},
});
export const actionSetEmergencyJobListShow = (showEmergencyJobList)=>({
  type:actionsConstants.ACTION_SET_EMERGENCYJOBLIST_SHOW,
  payload:{showEmergencyJobList}
})
