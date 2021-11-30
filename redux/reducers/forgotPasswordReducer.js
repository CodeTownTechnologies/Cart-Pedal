import {
  FORGOT_PASSWORD_START,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_ERROR,
} from '../actions/index.actions';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: {},
};
export default function (state = initialState, action) {
  switch (action.type) {
    case FORGOT_PASSWORD_START:
      return {
        ...state,
        isLoading: true,
      };
    case FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        data: action.payload,
        success: true,
        isLoading: false,
      };
    case FORGOT_PASSWORD_ERROR:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: true,
      };
    default:
      return state;
  }
}
