import actionsConstants from '../constants/actionsConstants';

const initialState = {
  EmergencyJoblistNotifactionCountUpdate: false,
};

export default (state = initialState, action) => {
  console.log({action});
  switch (action.type) {
    case actionsConstants.ACTION_SET_EMERGENCY_JOBLIST_COUNT_UPDATE:
      return {
        ...state,
        EmergencyJoblistNotifactionCountUpdate:
          !state.EmergencyJoblistNotifactionCountUpdate,
      };
    default:
      return state;
  }
};
