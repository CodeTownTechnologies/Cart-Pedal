import {
  CONVERSION_LIST_START,
  CONVERSION_LIST_SUCCESS,
  CONVERSION_LIST_ERROR,
} from './index.actions';
import AsyncStorage from '@react-native-community/async-storage';
import {API_URL} from '../../Config';
import {Platform} from 'react-native';

export const ConversationListAction = (userID, type, toid, userAccessToken) => {
  return async (dispatch) => {
    dispatch({type: CONVERSION_LIST_START});
    let formData = new FormData();
    formData.append('msgid', '0');
    formData.append('user_id', userID);
    formData.append('toid', toid);
    formData.append('type', type);
    formData.append('msg_type', '0');
    const fcmToken = await AsyncStorage.getItem('@fcmtoken');

    const token = fcmToken ? JSON.parse(fcmToken) : '1111';
    fetch(`${API_URL}api-message/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        device_id: '1234',
        device_token: token,
        device_type: Platform.OS,
        Authorization: JSON.parse(userAccessToken),
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          dispatch({
            type: CONVERSION_LIST_SUCCESS,
            payload: {data: responseData.data, id: toid},
          });
          return Promise.resolve(responseData.data);
        } else {
          dispatch({
            type: CONVERSION_LIST_ERROR,
            payload: responseData,
          });
          return Promise.reject(responseData);
        }
      })
      .catch((error) => {
        dispatch({
          type: CONVERSION_LIST_ERROR,
          payload: error,
        });
      });
  };
};

export const clearConversation = () => {
  return {
    type: 'CLEAR_CONVERSATION',
  };
};
