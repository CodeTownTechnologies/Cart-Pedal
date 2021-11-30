import {
  USER_SIGNUP_CONF_START,
  USER_SIGNUP_CONF_SUCCESS,
  USER_SIGNUP_CONF_ERROR,
  USER_SIGNUP_CONF_UPDATE_PROPS,
} from '../actions/index.actions';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case USER_SIGNUP_CONF_START:
      return {
        ...state,
        isLoading: true,
      };
    case USER_SIGNUP_CONF_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
      };
    case USER_SIGNUP_CONF_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: true,
      };
    case USER_SIGNUP_CONF_UPDATE_PROPS:
      return {
        ...state,
        [action.payload.prop]: action.payload.value,
      };
    default:
      return state;
  }
}
