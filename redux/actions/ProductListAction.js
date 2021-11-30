import {
  GET_PRODUCT_START,
  GET_PRODUCT_SUCCESS,
  GET_PRODUCT_ERROR,
} from './index.actions';
import AsyncStorage from '@react-native-community/async-storage';
import {API_URL} from '../../Config';
import {Platform} from 'react-native';
export const productlistAction = (userId, userAccessToken) => {
  return async (dispatch) => {
    dispatch({type: GET_PRODUCT_START});
    var urlProduct = `${API_URL}api-product/product-list?user_id=${userId}&type=2`;
    const fcmToken = await AsyncStorage.getItem('@fcmtoken');

    const token = fcmToken ? JSON.parse(fcmToken) : '1111';
    fetch(urlProduct, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: token,
        device_type: Platform.OS,
        Authorization: JSON.parse(userAccessToken),
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          if (responseData.data !== undefined && responseData.data.length > 0) {
            dispatch({
              type: GET_PRODUCT_SUCCESS,
              payload: responseData.data,
            });
            return Promise.resolve(responseData.data);
          } else {
            dispatch({
              type: GET_PRODUCT_ERROR,
              payload: responseData,
            });
            return Promise.reject(responseData);
          }
        } else {
          dispatch({
            type: GET_PRODUCT_ERROR,
            payload: responseData,
          });
          return Promise.reject(responseData);
        }
      })
      .catch((error) => {
        dispatch({
          type: GET_PRODUCT_ERROR,
          payload: error,
        });
      })
      .done();
  };
};
