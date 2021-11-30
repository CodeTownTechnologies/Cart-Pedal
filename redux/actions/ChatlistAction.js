import {
  CHAT_LIST_START,
  CHAT_LIST_SUCCESS,
  CHAT_LIST_ERROR,
  TOGGLE_CHAT,
} from './index.actions';
import AsyncStorage from '@react-native-community/async-storage';
import {API_URL} from '../../Config';
import {Platform} from 'react-native';

export const ChatlistAction = (userId, userAccesstoken) => {
  return async (dispatch) => {
    dispatch({type: CHAT_LIST_START});
    var urlprofile = `${API_URL}api-message/chat-list?user_id=${userId}`;
    const fcmToken = await AsyncStorage.getItem('@fcmtoken');
    const token = fcmToken ? JSON.parse(fcmToken) : '1111';
    fetch(urlprofile, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: token,
        device_type: Platform.OS,
        Authorization: JSON.parse(userAccesstoken),
      },
    })
      .then((response) => response.json())
      .then(async (responseData) => {
        console.log(JSON.stringify(responseData, null, 2));
        if (responseData.code == '200') {
          dispatch({
            type: CHAT_LIST_SUCCESS,
            payload: responseData.data,
          });
          return Promise.resolve(responseData.data);
        } else {
          dispatch({
            type: CHAT_LIST_ERROR,
            payload: responseData,
          });
          return Promise.reject(responseData);
        }
      })
      .catch((error) => {
        console.log(error);
        dispatch({
          type: CHAT_LIST_ERROR,
          payload: error,
        });
      });
  };
};

export const toggleChatting = (chatting, chattingUserId) => ({
  type: TOGGLE_CHAT,
  payload: {
    chatting,
    chattingUserId,
  },
});
