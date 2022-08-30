import actionsConstants from "../constants/actionsConstants"

const initialState = {
    loggedUser:null
}

export default (state=initialState,action)=>{
    switch(action.type){
        case actionsConstants.ACTION_SET_LOGGED_DATA:
            return{
                ...state,
                loggedUser:action.payload.loggedUser
            };
        default:
            return state;
    }
}