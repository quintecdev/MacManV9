import actionsConstants from "../constants/actionsConstants"

export const actionSetJobListCnt=(jobListCnt)=>({
    type:actionsConstants.ACTION_SET_JOBLISTCNT,
    payload:{jobListCnt}
})

export const actionSetChartData=(chartData)=>({
    type:actionsConstants.ACTION_SET_CHART_DATA,
    payload:{chartData}
})

export const actionSetJobOrderList=(jobOrderList)=>({
    type:actionsConstants.ACTION_SET_JOB_ORDER_LIST,
    payload:{jobOrderList}
})
