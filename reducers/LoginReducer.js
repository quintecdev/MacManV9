import actionsConstants from '../constants/actionsConstants';

const initialState = {
  loggedUser: null,
  loginStatus: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case actionsConstants.ACTION_SET_LOGGED_DATA:
      return {
        ...state,
        loggedUser: action.payload.loggedUser,
      };
    case actionsConstants.ACTION_SET_LOGIN_STATUS:
      return {
        ...state,
        loginStatus: action.payload.loginStatus,
      };
    default:
      return state;
  }
};
