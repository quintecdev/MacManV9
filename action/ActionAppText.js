import actionsConstants from "../constants/actionsConstants";

export const actionSetSelectedLng = (selectedLng)=>({
    type:actionsConstants.ACTION_SET_SELECTED_LNG,
    payload:{selectedLng}
})
export const actionSetAppTextData = (appTextData)=>({
    type:actionsConstants.ACTION_SET_APP_TEXT_DATA,
    payload:{appTextData}
})