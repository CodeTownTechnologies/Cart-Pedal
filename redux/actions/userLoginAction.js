import {
  USER_SIGNIN_START,
  USER_SIGNIN_SUCCESS,
  USER_SIGNIN_ERROR,
  FORGOT_PASSWORD_START,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_ERROR,
  FORGOT_PASSWORD_OTP_START,
  FORGOT_PASSWORD_OTP_SUCCESS,
  FORGOT_PASSWORD_OTP_ERROR,
  RESET_PASSWORD_START,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
} from './index.actions';
import AsyncStorage from '@react-native-community/async-storage';
import {API_URL} from '../../Config';
import {Platform} from 'react-native';

export const signin = (phone, password) => {
  return async (dispatch) => {
    dispatch({type: USER_SIGNIN_START});
    let formData = new FormData();
    formData.append('identity', '+91' + phone);
    formData.append('password', password);
    var otpUrl = `${API_URL}api-user/login`;
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
        if (responseData.code === 200) {
          dispatch({
            type: USER_SIGNIN_SUCCESS,
            payload: responseData,
          });
          return Promise.resolve(responseData);
        } else {
          // console.log(JSON.stringify(responseData, null, 2));
          dispatch({
            type: USER_SIGNIN_ERROR,
            payload: responseData,
          });
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
          return Promise.reject(responseData);
        }
      })
      .catch((error) => {
        dispatch({
          type: USER_SIGNIN_ERROR,
          payload: error,
        });
        // return Promise.reject(error)
      })
      .done();
  };
};

export const forgotPass = (phone) => {
  return async (dispatch) => {
    dispatch({type: FORGOT_PASSWORD_START});
    let formData = new FormData();
    formData.append('mobile', '+91' + phone);
    var otpUrl = `${API_URL}api-user/forgot-password`;
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
            type: FORGOT_PASSWORD_SUCCESS,
            payload: responseData,
          });
          return Promise.resolve(responseData);
        } else {
          dispatch({
            type: FORGOT_PASSWORD_ERROR,
            payload: responseData,
          });
          // eslint-disable-next-line no-alert
          alert(responseData.data.mobile);
          return Promise.reject(responseData);
        }
      })
      .catch((error) => {
        dispatch({
          type: FORGOT_PASSWORD_ERROR,
          payload: error,
        });
      })
      .done();
  };
};

export const forgotPassOTp = (phone, otp) => {
  return async (dispatch) => {
    dispatch({type: FORGOT_PASSWORD_OTP_START});
    let formData = new FormData();

    formData.append('mobile', phone);
    formData.append('otp', otp);
    var otpUrl = `${API_URL}api-user/verify-otp`;
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
            type: FORGOT_PASSWORD_OTP_SUCCESS,
            payload: responseData,
          });
          return Promise.resolve(responseData);
        } else {
          dispatch({
            type: FORGOT_PASSWORD_OTP_ERROR,
            payload: responseData,
          });
          // eslint-disable-next-line no-alert
          alert(responseData.data.mobile);
          return Promise.reject(responseData);
        }
      })
      .catch((error) => {
        dispatch({
          type: FORGOT_PASSWORD_OTP_ERROR,
          payload: error,
        });
      })
      .done();
  };
};

export const resetPass = (pass, otp) => {
  return async (dispatch) => {
    dispatch({type: RESET_PASSWORD_START});
    let formData = new FormData();
    formData.append('password', pass);
    formData.append('otp', otp);
    var otpUrl = `${API_URL}api-user/reset-password`;
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
            type: RESET_PASSWORD_SUCCESS,
            payload: responseData,
          });
          return Promise.resolve(responseData);
        } else {
          dispatch({
            type: RESET_PASSWORD_ERROR,
            payload: responseData,
          });
          // eslint-disable-next-line no-alert
          alert(responseData.data.password);
          return Promise.reject(responseData);
        }
      })
      .catch((error) => {
        dispatch({
          type: RESET_PASSWORD_ERROR,
          payload: error,
        });
      })
      .done();
  };
};

// const T_149 =
//   'dpXx4N5NSJeVe-A5ZsZ37T:APA91bFnDWIHx3lQPaHDNNaRfx0tCuN0pMPu8W5uo469678TerFiXUdLy09Cos4ab1PqIV3Pav6i7Vso-4LN5QXAc2NBeIGzNlEicv_X8Trj2poXH-enjeflk1jE5qzLlzyPGe7Ut3zW';
// const T_156 =
//   'fGeP6RibTYmVSCQcDvOEaa:APA91bGSegPWl-Mb85nlsaykGIF74a-f9cZMbKWb-uRfj7Llin3W-Hx31i2275ghwXUx4Q0L_9KF1tWueB-m5CaE2MfSAKdCTJAJ6ZvL6LRai9ZKVhXk2yxaAlrBhQsqJ72LiLkNzpEo';
