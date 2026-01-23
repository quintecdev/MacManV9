import actionsConstants from '../constants/actionsConstants';

const initialState = {
  BottomDrawerOpen: false,
};

export default (state = initialState, action) => {
  // console.log({action});
  switch (action.type) {
    case actionsConstants.ACTION_SET_BOTTOM_DRAWER_OPEN:
      return {
        ...state,
        BottomDrawerOpen: action.payload.BottomDrawerOpen,
      };
    default:
      return state;
  }
};
