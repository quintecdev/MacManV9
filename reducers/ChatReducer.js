import actionsConstants from '../constants/actionsConstants';

const initialState = {
	ChatRoomList: [],

	
};

export default (state = initialState, action) => {
	// console.log({action });
	switch (action.type) {
		case actionsConstants.ACTION_SET_CHAT_HISTORY:
			return {
				...state,
				ChatRoomList: action.payload.ChatRoomList
			};
		default:
			return state;
	}
};
