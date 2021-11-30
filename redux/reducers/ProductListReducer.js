import {
  GET_PRODUCT_START,
  GET_PRODUCT_SUCCESS,
  GET_PRODUCT_ERROR,
  GET_PRODUCT_UPDATE_PROPS,
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
    case GET_PRODUCT_START:
      return {
        ...state,
        isLoading: true,
      };
    case GET_PRODUCT_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        success: true,
        error: false,
      };
    case GET_PRODUCT_ERROR:
      return {
        ...state,
        errorMessage: action.payload.message,
        isLoading: false,
        error: true,
      };
    case GET_PRODUCT_UPDATE_PROPS:
      return {
        ...state,
        [action.payload.prop]: action.payload.value,
      };
    default:
      return state;
  }
}
