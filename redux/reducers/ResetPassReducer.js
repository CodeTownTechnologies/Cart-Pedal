import {
  RESET_PASSWORD_START,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
} from '../actions/index.actions';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case RESET_PASSWORD_START:
      return {
        ...state,
        isLoading: true,
      };
    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        data: action.payload,
        success: true,
        isLoading: false,
      };
    case RESET_PASSWORD_ERROR:
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
