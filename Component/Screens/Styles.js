import {StyleSheet, Dimensions} from 'react-native';

let dimensions = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

export default StyleSheet.create({
  max: {
    flex: 1,
  },
  buttonHolder: {
    height: 100,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0093E9',
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
  },
  fullView: {
    width: dimensions.width,
    height: dimensions.height,
    position: 'absolute',
    zIndex: -1,
  },
  halfViewRow: {
    flex: 1 / 2,
    flexDirection: 'row',
  },
  full: {
    top: 0,
    flex: 1,
    zIndex: -1,
  },
  half: {
    flex: 1 / 2,
  },
  localVideoStyle: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 100,
  },
  noUserText: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#0093E9',
  },
  buttonBar: {
    height: 50,
    backgroundColor: '#0093E9',
    display: 'flex',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },
  iconStyle: {
    fontSize: 34,
    paddingTop: 15,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 15,
    borderRadius: 0,
  },
});
