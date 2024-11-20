import actionsConstants from '../constants/actionsConstants';

const initialState = {
  JobOrderReportData: {},
//   JobOrderReportVisit: false,
};

export default (state = initialState, action) => {
  console.log({action});
  switch (action.type) {
    case actionsConstants.ACTION_SET_JOB_ORDER_REPORT:
      return {
        ...state,
        JobOrderReportData: action.payload.jobOrderReport,
      };
    // case actionsConstants.ACTION_SET_JOB_ORDER_REPORT_VISIT:
    //   return {
    //     ...state,
    //     JobOrderReportVisit: action.payload.JobOrderReportVisit,
    //   };
    default:
      return state;
  }
};
