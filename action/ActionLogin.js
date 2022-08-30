import actionsConstants from "../constants/actionsConstants";

export const actionSetLoginData=(loggedUser)=>({
    type:actionsConstants.ACTION_SET_LOGGED_DATA,
    payload:{loggedUser}
})