import actionsConstants from "../constants/actionsConstants";

const initialState = {
    jobListCnt:0,
    chartData:[],
    jobOrderList:[]
};

export default (state=initialState,action) =>{
    console.log("RealTimeDataReducer",{state,action });
    switch(action.type){
        case actionsConstants.ACTION_SET_JOBLISTCNT:
            return{
                ...state,
                jobListCnt:action.payload.jobListCnt,
            };

        case actionsConstants.ACTION_SET_CHART_DATA:
            return{
                ...state,
                chartData:action.payload.chartData,
            };

        case actionsConstants.ACTION_SET_JOB_ORDER_LIST:
			return {
				...state,
				jobOrderList: action.payload.jobOrderList
			};
		default:
			return state;
    }
}