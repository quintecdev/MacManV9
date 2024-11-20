import actionsConstants from '../constants/actionsConstants';

export const actionSetVersion = (appVersion) => ({
  type: actionsConstants.ACTION_SET_APP_VERSION,
  payload: {appVersion},
});
export const actionSetJobDate = (jobDate) => ({
  type: actionsConstants.ACTION_SET_JOB_DATE,
  payload: {jobDate},
});
export const actionSetIsStandByPermission = (IsStandbyPermission) => ({
  type: actionsConstants.ACTION_SET_IS_STAND_BY_PERMISSION,
  payload: {IsStandbyPermission},
});
