/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-did-mount-set-state */

import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {WebView} from 'react-native-webview';
import resp from 'rn-responsive-font';
export default class MyWebComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      link: 'https://cartpedal.com/page/privacy',
    };
  }
  componentDidMount() {
    if (this.props.route.params.screenSide == 'Signup') {
      this.setState({link: 'https://cartpedal.com/page/terms-condition'});
    }
    if (this.props.route.params.screenSide == 'Signup1') {
      this.setState({link: 'https://cartpedal.com/page/privacy'});
    }
  }
  render() {
    return (
      <View style={{flex: 1}}>
        <View style={styles.headerView}>
          <View style={styles.BackButtonContainer}>
            <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
              <Image
                source={require('../images/back_blck_icon.png')}
                style={styles.backButtonStyle}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.TitleContainer}>
            <Image
              source={require('../images/logo_cart_paddle.png')}
              style={styles.LogoIconStyle}
            />
            <TouchableOpacity
              style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={styles.TitleStyle}>Cartpedal</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.SearchContainer}
            onPress={() => {}}></TouchableOpacity>
        </View>
        <WebView source={{uri: this.state.link}} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerView: {
    flex: 0.1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 20,
    marginTop: Platform.OS === 'android' ? 0 : 24,
  },
  BackButtonContainer: {
    flex: 0.2,
    marginLeft: 10,
    backgroundColor: 'white',
  },
  backButtonStyle: {
    margin: 10,
    height: 20,
    width: 20,
  },
  TitleContainer: {
    flexDirection: 'row',
    flex: 0.6,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  LogoIconStyle: {
    margin: 5,
    height: 30,
    width: 30,
  },
  TitleStyle: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: resp(20),
    textAlign: 'center',
  },
  SearchContainer: {
    flex: 0.2,
    backgroundColor: '#fff',
  },
  SearchIconStyle: {
    margin: 5,
    marginRight: 20,
    height: 25,
    width: 25,
    alignSelf: 'flex-end',
  },
});
