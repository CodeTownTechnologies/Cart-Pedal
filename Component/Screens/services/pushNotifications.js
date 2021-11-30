// import PushNotification from 'react-native-push-notification';
// import {PushNotificationIOS} from 'react-native';

// const configure = () => {
//   PushNotification.configure({
//     onRegister: function (token) {
//       console.log('the service token');
//     },

//     onNotification: function (notification) {
//       let pars = JSON.parse(notification.data.body);
//       PushNotification.localNotification({
//         autoCancel: true,
//         largeIcon: 'ic_launcher',
//         bigText: pars.msg,
//         color: 'green',
//         vibrate: true,
//         vibration: 300,
//         title: pars.title,
//         message: pars.msg,
//         playSound: true,
//         soundName: 'default',
//         actions: '["Accept", "Reject"]',
//       });
//       notification.finish(PushNotificationIOS.FetchResult.NoData);
//     },

//     permissions: {
//       alert: true,
//       badge: true,
//       sound: true,
//     },

//     popInitialNotification: true,
//     requestPermissions: true,
//   });
// };

// const localNotification = () => {
//   PushNotification.localNotification({
//     autoCancel: true,
//     largeIcon: 'ic_launcher',
//     smallIcon: 'ic_notification',
//     bigText: 'My big text that will be shown when notification is expanded',
//     subText: 'This is a subText',
//     color: 'green',
//     vibrate: true,
//     vibration: 300,
//     title: 'Notification Title',
//     message: 'Notification Message',
//     playSound: true,
//     soundName: 'default',
//     actions: '["Accept", "Reject"]',
//   });
// };

// export {configure, localNotification};
