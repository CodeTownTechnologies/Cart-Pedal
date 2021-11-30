import {Platform} from 'react-native';
import {
  request,
  requestMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

export const recordingPermissions = async () => {
  try {
    const granted = await request(
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
        : PERMISSIONS.IOS.WRITE_EXTERNAL_STORAGE,
    );
    if (granted === RESULTS.GRANTED) {
    } else {
      return;
    }
  } catch (err) {
    console.warn(err);
    return;
  }
  try {
    const granted = await request(
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.RECORD_AUDIO
        : PERMISSIONS.IOS.RECORD_AUDIO,
    );
    if (granted === RESULTS.GRANTED) {
      console.log('You can use the camera');
    } else {
      console.log('permission denied');
      return;
    }
  } catch (err) {
    console.warn(err);
    return;
  }
};

export const locationPermission = async () => {
  try {
    const granted = await requestMultiple([
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION
        : PERMISSIONS.IOS.LOCATION_ALWAYS,
    ]);
    if (Platform.OS === 'android') {
      return (
        granted['android.permission.ACCESS_COARSE_LOCATION'] === 'granted' ||
        granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
      );
    } else {
      return (
        granted['ios.permission.LOCATION_ALWAYS'] === 'granted' ||
        granted['ios.permission.LOCATION_WHEN_IN_USE'] === 'granted'
      );
    }
  } catch (err) {
    return false;
  }
};
