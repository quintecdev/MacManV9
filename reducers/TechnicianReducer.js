import actionsConstants from "../constants/actionsConstants"

const Technician = {
    showTechnicianPopUp:false,
    // Technician:null,
    TechList:[]
}

export default (state=Technician,action)=>{
    console.log({action})
    switch(action.type){
        case actionsConstants.ACTION_SET_TECHNICIAN:
            return{
                ...state,
                Technician:action.payload.Technician
            }
        case actionsConstants.ACTION_SHOW_TECHNICIAN_POPUP:
            return{
                ...state,
                showTechnicianPopUp:!state.showTechnicianPopUp
            }

        case actionsConstants.ACTION_SET_TECHNICIAN_LIST:
            return{
                ...state,
                TechList:action.payload.TechList
            }
            
            default : return state
    }
}