import actionsConstants from "../constants/actionsConstants";

export const actionSetJobOrderReport=(jobOrderReport)=>({
    type:actionsConstants.ACTION_SET_JOB_ORDER_REPORT,
    payload:{jobOrderReport}
})