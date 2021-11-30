import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';

export const hp = (val) => {
  return heightPercentageToDP((val / 667) * 100);
};

export const wp = (val) => {
  return widthPercentageToDP((val / 375) * 100);
};
