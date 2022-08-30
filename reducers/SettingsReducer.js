import actionsConstants from "../constants/actionsConstants"

const settings={
    isLoading:false,
    refresh: false
}

export default (state=settings,action)=>{
    switch(action.type){
        case actionsConstants.ACTION_SET_LOADING:
            return{
                ...state,
                isLoading:action.payload.loading
            }
            case actionsConstants.ACTION_SET_REFRESH:
            return{
                ...state,
                refresh:!state.refresh
            }
            default: return state
    }
}