import {
  ADD_STORIES_START,
  ADD_STORIES_SUCCESS,
  ADD_STORIES_ERROR,
  ADD_STORIES_UPDATE_PROPS,
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
    case ADD_STORIES_START:
      return {
        ...state,
        isLoading: true,
      };
    case ADD_STORIES_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
      };
    case ADD_STORIES_ERROR:
      return {
        ...state,
        errorMessage: action.payload.message,
        isLoading: false,
        error: true,
      };
    case ADD_STORIES_UPDATE_PROPS:
      return {
        ...state,
        [action.payload.prop]: action.payload.value,
      };
    default:
      return state;
  }
}
