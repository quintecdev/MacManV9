import actionsConstants from '../constants/actionsConstants';

const initialState = {
  appVersion: 0,
  jobDate: '',
  IsStandbyPermission: false,
};

export default (state = initialState, action) => {
  // console.log({action});
  switch (action.type) {
    case actionsConstants.ACTION_SET_APP_VERSION:
      return {
        ...state,
        appVersion: action.payload.appVersion,
      };
    case actionsConstants.ACTION_SET_JOB_DATE:
      return {
        ...state,
        jobDate: action.payload.jobDate,
      };
    case actionsConstants.ACTION_SET_IS_STAND_BY_PERMISSION:
      return {
        ...state,
        IsStandbyPermission: action.payload.IsStandbyPermission,
      };
    default:
      return state;
  }
};
