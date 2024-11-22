import actionsConstants from '../constants/actionsConstants';

const initialState = {
  CheckInternetConnection: true,
};

export default (state = initialState, action) => {
  console.log({action});
  switch (action.type) {
    case actionsConstants.ACTION_SET_INTETNET_CONNECTION:
      return {
        ...state,
        CheckInternetConnection: action.payload.CheckInternetConnection,
      };
    default:
      return state;
  }
};
