import actionsConstants from "../constants/actionsConstants";

export const actionSetLoading = (loading)=>({
    type:actionsConstants.ACTION_SET_LOADING,
    payload:{loading}
})

export const actionSetRefreshing = (refresh)=>({
    type:actionsConstants.ACTION_SET_REFRESH,
    payload:{refresh}
})