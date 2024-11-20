import actionsConstants from '../constants/actionsConstants';

const initialState = {
  CheckListNotificationVisit:false,
  CheckActivityListVisit:false
};

export default (state = initialState, action) => {
  console.log({action});
  switch (action.type) {
    case actionsConstants.ACTION_SET_CHECK_LIST_PAGE_NOTIFICATION_VISIT:
      return {
        ...state,
        CheckListNotificationVisit: action.payload.CheckListNotificationVisit,
      };
      case actionsConstants.ACTION_SET_ACTIVITYLISTPAGE_VISIT:
        return {
          ...state,
          CheckActivityListVisit: action.payload.CheckActivityListVisit,
        };
    default:
      return state;
  }
};
