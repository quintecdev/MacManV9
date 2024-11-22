import actionsConstants from "../constants/actionsConstants";

export const actionSetDrawer=(BottomDrawerOpen)=>({
    type:actionsConstants.ACTION_SET_BOTTOM_DRAWER_OPEN,
    payload:{BottomDrawerOpen}
})