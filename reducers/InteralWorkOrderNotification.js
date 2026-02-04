import actionsConstants from "../constants/actionsConstants";

const initialState = {
    InternalWorkOrderNotifactionCount:0,
};

export default (state=initialState,action) =>{
    // console.log("InteralWorkOrderNotificationReducer",{state,action });
    switch(action.type){
        case actionsConstants.ACTION_SET_INTERNAL_WORKORDER_COUNT:
            return{
                ...state,
                InternalWorkOrderNotifactionCount:action.payload.InternalWorkOrderNotifactionCount,
            };
        default:
            return state;
    }
}