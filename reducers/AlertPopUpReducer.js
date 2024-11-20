import actionsConstants from '../constants/actionsConstants';

const initialState = {
    AlertPopUp: false,
    AlertPopUpTwo:{
      visible:false,
      title:'',
      body:'',
      type:''
    }
};

export default (state = initialState, action) => {
  console.log({action});
  switch (action.type) {
    case actionsConstants.ACTION_SET_ALERT_POPUP:
      return {
        ...state,
        AlertPopUp: action.payload.AlertPopUp,
      };
      case actionsConstants.ACTION_SET_ALERT_POPUP_TWO:
        return {
          ...state,
          AlertPopUpTwo: action.payload.AlertPopUpTwo,
        };
    default:
      return state;
  }
};
