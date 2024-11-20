import actionsConstants from '../constants/actionsConstants';

export const actionSetLoading = (loading) => ({
  type: actionsConstants.ACTION_SET_LOADING,
  payload: {loading},
});

export const actionSetRefreshing = (refresh) => ({
  type: actionsConstants.ACTION_SET_REFRESH,
  payload: {refresh},
});
export const actionSetRefreshingPage = (refreshPage) => ({
  type: actionsConstants.ACTION_SET_REFRESH_PAGE,
  payload: {refreshPage},
});

