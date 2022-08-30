import actionsConstants from "../constants/actionsConstants";

export const actionSetAppTextData=(appTextData)=>({
    type:actionsConstants.ACTION_SET_APP_TEXT_DATA,
    payload:{appTextData}
})