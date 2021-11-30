import {
  GET_RECENT_START,
  GET_RECENT_SUCCESS,
  GET_RECENT_ERROR,
  GET_RECENT_UPDATE_PROPS,
} from '../actions/index.actions';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: {},
  errorMessage: '',
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_RECENT_START:
      return {
        ...state,
        isLoading: true,
      };
    case GET_RECENT_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
      };
    case GET_RECENT_ERROR:
      return {
        ...state,
        errorMessage: action.payload.message,
        isLoading: false,
        error: true,
      };
    case GET_RECENT_UPDATE_PROPS:
      return {
        ...state,
        errorMessage: action.payload.message,
        error: true,
        isLoading: false,
      };
    default:
      return state;
  }
}
