import {
  USER_SIGNUP_OTP_START,
  USER_SIGNUP_OTP_SUCCESS,
  USER_SIGNUP_OTP_ERROR,
  USER_SIGNUP_OTP_UPDATE_PROPS,
} from '../actions/index.actions';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  otpData: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case USER_SIGNUP_OTP_START:
      return {
        ...state,
        isLoading: true,
      };
    case USER_SIGNUP_OTP_SUCCESS:
      return {
        ...state,
        otpData: action.payload,
        isLoading: false,
      };
    case USER_SIGNUP_OTP_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: true,
      };
    case USER_SIGNUP_OTP_UPDATE_PROPS:
      return {
        ...state,
        [action.payload.prop]: action.payload.value,
      };
    default:
      return state;
  }
}
