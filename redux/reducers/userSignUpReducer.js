import {
  USER_SIGNUP_START,
  USER_SIGNUP_SUCCESS,
  USER_SIGNUP_ERROR,
  USER_SIGNUP_UPDATE_PROPS,
} from '../actions/index.actions';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: {},
};
export default function (state = initialState, action) {
  switch (action.type) {
    case USER_SIGNUP_START:
      return {
        ...state,
        isLoading: true,
      };
    case USER_SIGNUP_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
        error: false,
      };
    case USER_SIGNUP_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: true,
      };
    case USER_SIGNUP_UPDATE_PROPS:
      return {
        ...state,
        [action.payload.prop]: action.payload.value,
      };
    default:
      return state;
  }
}
