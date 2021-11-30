import {
  CONVERSION_LIST_START,
  CONVERSION_LIST_SUCCESS,
  CONVERSION_LIST_ERROR,
} from '../actions/index.actions';

const initialState = {
  isLoading: false,
  success: false,
  error: false,
  data: {messages: []},
  dataById: {},
  errorMessage: '',
};

export default function (state = initialState, action) {
  switch (action.type) {
    case CONVERSION_LIST_START:
      return {
        ...state,
        isLoading: true,
      };
    case CONVERSION_LIST_SUCCESS:
      return {
        ...state,
        data: action.payload.data,
        dataById: {...state.dataById, [action.payload.id]: action.payload.data},
        isLoading: false,
        success: true,
        error: false,
      };
    case CONVERSION_LIST_ERROR:
      return {
        ...state,
        errorMessage: action.payload.message,
        isLoading: false,
        error: true,
      };
    case 'CLEAR_CONVERSATION':
      return {
        ...state,
        data: {messages: []},
      };
    default:
      return state;
  }
}
