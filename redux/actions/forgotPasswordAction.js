import {
  FORGOT_PASSWORD_VERIFY_START,
  FORGOT_PASSWORD_VERIFY_SUCCESS,
  FORGOT_PASSWORD_VERIFY_ERROR,
  FORGOT_PASSWORD_VERIFY_PROPS_UPDATE,
  ADD_ERROR,
  FORGOT_PASSWORD_AFTER_OTP_START,
  FORGOT_PASSWORD_AFTER_OTP_SUCCESS,
  FORGOT_PASSWORD_AFTER_OTP_ERROR,
  FORGOT_PASSWORD_AFTER_OTP_PROPS_UPDATE,
  FORGOT_PASSWORD_AFTER_OTP_RESET_STATE,
} from './index.actions';
import getAsyncStorageParameters from '../../src/constants/AsyncStorageHelper';
import Odoo from 'react-native-odoo-promise-based';
import _ from 'lodash';

export const forgotPasswordWithOtp = (email_mobile, isMobile, hashCode) => {
  return async (dispatch) =>
    getAsyncStorageParameters().then(({connection_context, odoo_config}) => {
      var endpoint = '/web/dataset/call_kw';
      var model = 'send.otp';
      var method = 'reset_pwd_with_otp';
      connection_context.user_id = connection_context.uid;
      var mobile = isMobile ? email_mobile : '';
      var email = !isMobile ? email_mobile : '';
      var args = [connection_context, '', mobile, email, '8888'];
      var params = {
        model: model,
        method: method,
        args: args,
        kwargs: {},
      };
      var odoo = new Odoo({});
      _.merge(odoo, odoo_config);
      dispatch({type: FORGOT_PASSWORD_VERIFY_START});
      return odoo
        .rpc_call(endpoint, params)
        .then((response) => {
          if (response.success) {
            if (
              _.get(response, 'data.success') &&
              !_.get(response, 'data.error')
            ) {
              dispatch({
                type: FORGOT_PASSWORD_VERIFY_SUCCESS,
                payload: response.data,
              });
              return Promise.resolve(response.data);
            } else {
              return Promise.reject(response.data.error.data);
            }
          } else {
            return Promise.reject(response.error.data);
          }
        })
        .catch((error) => {
          dispatch({
            type: FORGOT_PASSWORD_VERIFY_ERROR,
            payload: error,
          });
          dispatch({
            type: ADD_ERROR,
            payload: error,
          });
          return Promise.reject(error);
        });
    });
};

export const updateForgotPasswordVerifyProp = ({prop, value}) => ({
  type: FORGOT_PASSWORD_VERIFY_PROPS_UPDATE,
  payload: {prop, value},
});

export const submitNewPasswordAfterOtp = (
  isMobile,
  email_mobile,
  newPassword,
) => {
  return async (dispatch) =>
    getAsyncStorageParameters().then(({connection_context, odoo_config}) => {
      var endpoint = '/web/dataset/call_kw';
      var model = 'res.users';
      var method = 'forgot_pwd';
      // connection_context['user_id'] = connection_context.uid
      var mobile = isMobile ? email_mobile : '';
      var email = !isMobile ? email_mobile : '';
      var type = isMobile ? 'mobile' : 'email';
      var args = [connection_context, type, email, mobile, newPassword];
      var params = {
        model: model,
        method: method,
        args: args,
        kwargs: {},
      };
      var odoo = new Odoo({});
      _.merge(odoo, odoo_config);
      dispatch({type: FORGOT_PASSWORD_AFTER_OTP_START});
      return odoo
        .rpc_call(endpoint, params)
        .then((response) => {
          if (response.success) {
            dispatch({
              type: FORGOT_PASSWORD_AFTER_OTP_SUCCESS,
              payload: response.data,
            });
            return Promise.resolve(response.data);
          } else {
            return Promise.reject(response.error.data);
          }
        })
        .catch((error) => {
          dispatch({
            type: FORGOT_PASSWORD_AFTER_OTP_ERROR,
            payload: error,
          });
          dispatch({
            type: ADD_ERROR,
            payload: error,
          });
          return Promise.reject(error);
        });
    });
};

export const submitNewPasswordAfterOtpProp = ({prop, value}) => ({
  type: FORGOT_PASSWORD_AFTER_OTP_PROPS_UPDATE,
  payload: {prop, value},
});

export const submitNewPasswordAfterOtpResetState = (data) => {
  return async (dispatch) => {
    dispatch({
      type: FORGOT_PASSWORD_AFTER_OTP_RESET_STATE,
      payload: null,
    });
  };
};
