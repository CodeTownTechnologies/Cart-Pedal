import {
  PROFILE_VIEW_START,
  PROFILE_VIEW_SUCCESS,
  PROFILE_VIEW_ERROR,
  PROFILE_VIEW_UPDATE_PROPS,
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
    case PROFILE_VIEW_START:
      return {
        ...state,
        isLoading: true,
      };
    case PROFILE_VIEW_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
      };
    case PROFILE_VIEW_ERROR:
      return {
        ...state,
        errorMessage: action.payload.message,
        isLoading: false,
        error: true,
      };
    case PROFILE_VIEW_UPDATE_PROPS:
      return {
        ...state,
        [action.payload.prop]: action.payload.value,
      };
    default:
      return state;
  }
}
