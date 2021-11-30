import {
  CHAT_LIST_START,
  CHAT_LIST_SUCCESS,
  CHAT_LIST_ERROR,
  TOGGLE_CHAT,
} from '../actions/index.actions';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: [],
  errorMessage: '',
  chatting: false,
  chattingUserId: undefined,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case CHAT_LIST_START:
      return {
        ...state,
        isLoading: true,
      };
    case CHAT_LIST_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
        error: false,
      };
    case CHAT_LIST_ERROR:
      return {
        ...state,
        errorMessage: action.payload.message,
        isLoading: false,
        error: true,
      };
    case TOGGLE_CHAT:
      const {chattingUserId, chatting} = action.payload;
      return {
        ...state,
        chatting,
        chattingUserId,
      };
    default:
      return state;
  }
}
