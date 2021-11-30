/**
 * @format
 */

import {AppRegistry, ToastAndroid, Linking} from 'react-native';
import App from './App';
// import VideoDemo from './VideoDemo';
import {name as appName} from './app.json';

import invokeApp from 'react-native-invoke-app';

AppRegistry.registerComponent(appName, () => App);

const backgroundPush = async (message) => {
  ToastAndroid.show('Hello Headless JS', 2000);
  await Linking.openURL('demo://app/login');
  //   const res = await Linking.canOpenURL('demo://app');
  //   console.log(res);
  //   if (res) {
  //     // Linking.sendIntent('android.intent.action.VIEW', [
  //     //   {'android.provider.extra.APP_PACKAGE': 'in.cartpedal'},
  //     // ]);
  //     await Linking.openURL('demo://app');
  //   }
};

AppRegistry.registerHeadlessTask(
  'RNFirebaseBackgroundMessage',
  () => backgroundPush,
);
