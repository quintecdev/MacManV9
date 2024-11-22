import actionsConstants from "../constants/actionsConstants";

// export const actionShowTechnicianPopUp = ()=>({
//     type:actionsConstants.ACTION_SHOW_TECHNICIAN_POPUP
// })

// export const actionSetTech = (Technician)=>({
//     type:actionsConstants.ACTION_SET_TECHNICIAN,
//     payload:{Technician}
// })

// used to set techlist in supervisor home
export const actionSetTechList = (TechList)=>({
    type:actionsConstants.ACTION_SET_TECHNICIAN_LIST,
    payload:{TechList}
})