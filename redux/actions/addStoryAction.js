import {
  ADD_STORIES_START,
  ADD_STORIES_SUCCESS,
  ADD_STORIES_ERROR,
} from './index.actions';
import AsyncStorage from '@react-native-community/async-storage';
import Toast from 'react-native-simple-toast';
import {API_URL} from '../../Config';
import {Platform} from 'react-native';

export const addStoryAction = (userId, userAccessToken, data) => {
  return async (dispatch) => {
    dispatch({type: ADD_STORIES_START});
    const fcmToken = await AsyncStorage.getItem('@fcmtoken');
    const token = fcmToken ? JSON.parse(fcmToken) : '1111';
    fetch(`${API_URL}api-user/add-story`, {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: token,
        device_type: Platform.OS,
        Authorization: JSON.parse(userAccessToken),
      },
      body: JSON.stringify({
        user_id: userId,
        upload: data,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          console.log('success',responseData);
          Toast.show(responseData.message);
          dispatch({
            type: ADD_STORIES_SUCCESS,
            payload: responseData,
          });
          return Promise.resolve(responseData);
        } else {
          console.log('error',responseData);
          dispatch({
            type: ADD_STORIES_ERROR,
            payload: responseData,
          });
          return Promise.reject(responseData);
        }
      })
      .catch((error) => {
        console.log('error',error);
        dispatch({
          type: ADD_STORIES_ERROR,
          payload: error,
        });
      })
      .done();
  };
};
