import {
  GET_RECENT_START,
  GET_RECENT_SUCCESS,
  GET_RECENT_ERROR,
} from './index.actions';
import {API_URL} from '../../Config';
import AsyncStorage from '@react-native-community/async-storage';
import {Platform} from 'react-native';

export const RecentDataAction = (userId, userAccessToken, newContacts) => {
  return async (dispatch) => {
    dispatch({type: GET_RECENT_START});
    let formData = new FormData();
    formData.append('user_id', userId);
    formData.append('type', 0);
    formData.append('public', 0);
    formData.append('contact', newContacts);
    var RecentShare = `${API_URL}api-user/recent-share`;
    const fcmToken = await AsyncStorage.getItem('@fcmtoken');
    console.log('response');
    const token = fcmToken ? JSON.parse(fcmToken) : '1111';
    fetch(RecentShare, {
      method: 'Post',
      headers: new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '1111',
        device_token: token,
        device_type: Platform.OS,
        Authorization: JSON.parse(userAccessToken),
      }),
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          dispatch({
            type: GET_RECENT_SUCCESS,
            payload: responseData.data,
          });
          return Promise.resolve(responseData.data);
        } else {
          dispatch({
            type: GET_RECENT_ERROR,
            payload: responseData,
          });
          return Promise.reject(responseData);
        }
      })
      .catch((error) => {
        dispatch({
          type: GET_RECENT_ERROR,
          payload: error,
        });
      })
      .done();
  };
};
