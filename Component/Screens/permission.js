import {Platform} from 'react-native';
import {
  check,
  request,
  requestMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

export default async function requestCameraAndAudioPermission() {
  try {
    const granted = await requestMultiple([
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA,
      Platform.OS === 'android'
        ? PERMISSIONS.IOS.RECORD_AUDIO
        : PERMISSIONS.IOS.CAMERA,
    ]);
    if (
      granted['android.permission.RECORD_AUDIO'] === RESULTS.GRANTED &&
      granted['android.permission.CAMERA'] === RESULTS.GRANTED
    ) {
      console.log('You can use the cameras & mic');
    } else {
      console.log('Permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}

const data = {
  jobTitle: 'Producer',
  emailAddresses: [{label: 'work', email: 'kate-bell@mac.com'}],
  urlAddresses: [{label: 'homepage', url: 'www.icloud.com'}],
  phoneNumbers: [
    {label: 'mobile', number: '(555) 564-8583'},
    {label: 'main', number: '(415) 555-3695'},
  ],
  recordID: '177C371E-701D-42F8-A03B-C61CA31627F6',
  postalAddresses: [
    {
      state: 'CA',
      label: 'work',
      region: 'CA',
      postCode: '94010',
      country: '',
      city: 'Hillsborough',
      street: '165 Davis Street',
    },
  ],
  thumbnailPath: '',
  company: 'Creative Consulting',
  middleName: '',
  imAddresses: [],
  givenName: 'Kate',
  birthday: {day: 20, month: 0, year: 1978},
  hasThumbnail: false,
  familyName: 'Bell',
};
