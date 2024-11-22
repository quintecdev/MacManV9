import actionsConstants from '../constants/actionsConstants';

export const actionSetInternetConnection = (CheckInternetConnection) => ({
  type: actionsConstants.ACTION_SET_INTETNET_CONNECTION,
  payload: {CheckInternetConnection},
});
