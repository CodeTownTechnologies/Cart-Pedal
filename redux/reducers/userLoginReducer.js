import {
  USER_SIGNIN_START,
  USER_SIGNIN_SUCCESS,
  USER_SIGNIN_ERROR,
  USER_SIGNIN_UPDATE_PROPS,
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
    case USER_SIGNIN_START:
      return {
        ...state,
        isLoading: true,
      };
    case USER_SIGNIN_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
      };
    case USER_SIGNIN_ERROR:
      return {
        ...state,
        errorMessage: action.payload.message,
        isLoading: false,
        error: true,
        success: false,
      };
    case USER_SIGNIN_UPDATE_PROPS:
      return {
        ...state,
        [action.payload.prop]: action.payload.value,
      };
    default:
      return state;
  }
}
