import {
  GET_STORIES_START,
  GET_STORIES_SUCCESS,
  GET_STORIES_ERROR,
  GET_LOGGED_STORIES_START,
  GET_LOGGED_STORIES_SUCCESS,
  GET_LOGGED_STORIES_ERROR,
} from './index.actions';
import {API_URL} from '../../Config';
import AsyncStorage from '@react-native-community/async-storage';
import {Platform} from 'react-native';
export const storiesAction = (userId, userAccessToken) => {
  return async (dispatch) => {
    dispatch({type: GET_STORIES_START});
    var urlprofile = `${API_URL}api-user/user-stories?user_id=${userId}&type=0`;
    const fcmToken = await AsyncStorage.getItem('@fcmtoken');

    const token = fcmToken ? JSON.parse(fcmToken) : '1111';
    return fetch(urlprofile, {
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
          let item = [];
          responseData.data.forEach((element) => {
            if (element.stories[0].viewer !== 1) {
              item.unshift(element);
            } else {
              item.push(element);
            }
          });
          dispatch({
            type: GET_STORIES_SUCCESS,
            payload: item,
          });
          return Promise.resolve(responseData);
        } else {
          dispatch({
            type: GET_STORIES_ERROR,
            payload: responseData,
          });
          return Promise.reject(responseData);
        }
      })
      .catch((error) => {
        dispatch({
          type: GET_STORIES_ERROR,
          payload: error,
        });
      })
      .done();
  };
};

export const loggedStoriesAction = (userId, userAccessToken) => {
  return async (dispatch) => {
    dispatch({type: GET_LOGGED_STORIES_START});
    var urlprofile = `${API_URL}api-user/user-stories?user_id=${userId}&type=1`;
    const fcmToken = await AsyncStorage.getItem('@fcmtoken');

    const token = fcmToken ? JSON.parse(fcmToken) : '1111';
    return fetch(urlprofile, {
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
          dispatch({
            type: GET_LOGGED_STORIES_SUCCESS,
            payload: responseData,
          });
          return Promise.resolve(responseData);
        } else {
          dispatch({
            type: GET_LOGGED_STORIES_ERROR,
            payload: responseData,
          });
          return Promise.reject(responseData);
        }
      })
      .catch((error) => {
        dispatch({
          type: GET_LOGGED_STORIES_ERROR,
          payload: error,
        });
      })
      .done();
  };
};
