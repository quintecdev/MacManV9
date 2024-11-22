import actionsConstants from '../constants/actionsConstants';

export const actionSetEmergencyJoblistNotificationCountUpdate = (
  EmergencyJoblistNotifactionCountUpdate,
) => ({
  type: actionsConstants.ACTION_SET_EMERGENCY_JOBLIST_COUNT_UPDATE,
  payload: {EmergencyJoblistNotifactionCountUpdate},
});
