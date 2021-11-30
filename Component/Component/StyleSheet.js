import {StyleSheet, Dimensions} from 'react-native';

const window = Dimensions.get('window');

export default StyleSheet.create({
  cardView: {
    paddingTop: 5,
    marginStart: 10,
    marginEnd: 10,
    marginBottom: 5,
    backgroundColor: 'white',
    padding: 10,
    elevation: 3,
  },
  appHeader: {
    width: window.width,
    height: 60,
    flexDirection: 'row',
    padding: 10,
    elevation: 4,
  },
});
