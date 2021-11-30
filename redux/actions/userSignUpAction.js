import {
  USER_SIGNUP_START,
  USER_SIGNUP_SUCCESS,
  USER_SIGNUP_ERROR,
  USER_SIGNUP_CONF_START,
  USER_SIGNUP_CONF_SUCCESS,
  USER_SIGNUP_CONF_ERROR,
} from './index.actions';
import AsyncStorage from '@react-native-community/async-storage';
import {API_URL} from '../../Config';
import {Platform} from 'react-native';

export const signUp = (phone) => {
  return async (dispatch) => {
    dispatch({type: USER_SIGNUP_START});
    let formData = new FormData();
    formData.append('mobile', '+91' + phone);
    formData.append('type', '0');
    var otpUrl = `${API_URL}api-user/send-otp`;
    const fcmToken = await AsyncStorage.getItem('@fcmtoken');

    const token = fcmToken ? JSON.parse(fcmToken) : '1111';

    return fetch(otpUrl, {
      method: 'Post',
      headers: {
        'Content-Type': 'multipart/form-data',
        device_id: '1234',
        device_token: token,
        device_type: Platform.OS,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (!responseData.error) {
          dispatch({
            type: USER_SIGNUP_SUCCESS,
            payload: responseData,
          });
          return Promise.resolve(responseData);
        } else {
          dispatch({
            type: USER_SIGNUP_ERROR,
            payload: responseData,
          });
          // eslint-disable-next-line no-alert
          alert(JSON.stringify(responseData.data));
          return Promise.reject(responseData);
        }
        // if (responseData.code == '200') {
        //   dispatch({
        //     type: USER_SIGNUP_SUCCESS,
        //     payload: responseData,
        //   });
        //   return Promise.resolve(responseData);
        // } else {
        //   dispatch({
        //     type: USER_SIGNUP_ERROR,
        //     payload: responseData,
        //   });
        //   // eslint-disable-next-line no-alert
        //   alert(JSON.stringify(responseData.data));
        //   return Promise.reject(responseData);
        // }
      })
      .catch((error) => {
        dispatch({
          type: USER_SIGNUP_ERROR,
          payload: error,
        });
        // return Promise.reject(error)
      })
      .done();
  };
};

export const signUpConf = (name, phone, email, pass) => {
  return async (dispatch) => {
    dispatch({type: USER_SIGNUP_CONF_START});
    let formData = new FormData();
    formData.append('name', name);
    formData.append('mobile', phone);
    formData.append('email', email);
    formData.append('password', pass);
    var otpUrl = `${API_URL}api-user/signup`;
    const fcmToken = await AsyncStorage.getItem('@fcmtoken');

    const token = fcmToken ? JSON.parse(fcmToken) : '1111';
    return fetch(otpUrl, {
      method: 'Post',
      headers: {
        'Content-Type': 'multipart/form-data',
        device_id: '1234',
        device_token: token,
        device_type: Platform.OS,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          dispatch({
            type: USER_SIGNUP_CONF_SUCCESS,
            payload: responseData,
          });
          return Promise.resolve(responseData);
        } else if (responseData.code == '500') {
          if (responseData.data.password) {
            // eslint-disable-next-line no-alert
            alert(responseData.data.password);
          }
          if (responseData.data.mobile) {
            // eslint-disable-next-line no-alert
            alert(responseData.data.mobile);
          }
          if (responseData.data.email) {
            // eslint-disable-next-line no-alert
            alert(responseData.data.email);
          }
          if (responseData.data.username) {
            // eslint-disable-next-line no-alert
            alert(responseData.data.username);
          }
          dispatch({
            type: USER_SIGNUP_CONF_ERROR,
            payload: responseData,
          });
          return Promise.reject(responseData);
        } else {
          dispatch({
            type: USER_SIGNUP_CONF_ERROR,
            payload: responseData,
          });
          return Promise.reject(responseData);
        }
      })
      .catch((error) => {
        dispatch({
          type: USER_SIGNUP_CONF_ERROR,
          payload: error,
        });
      })
      .done();
  };
};
