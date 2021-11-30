/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';
import resp from 'rn-responsive-font';

class Contactus extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  showLoading() {
    this.setState({loading: true});
  }

  hideLoading() {
    this.setState({loading: false});
  }

  static navigationOptions = {
    title: 'AppInfo',
  };

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

        <View style={styles.container}>
          <Image
            source={require('../images/logo_cart_paddle.png')}
            style={styles.ImageView}
          />
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text style={styles.CartTextStyle}>Cartpedal</Text>
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: 250,
              marginTop: 25,
            }}>
            <Text
              style={{textAlign: 'center', fontSize: 15, fontWeight: 'bold'}}>
              Please Contact us for any query & complain at Cartpedal@gmail.com
            </Text>
          </View>
        </View>
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  ImageView: {
    height: 150,
    width: 150,
    backgroundColor: 'transparent',
  },
  CartTextStyle: {
    textAlign: 'center',
    marginTop: resp(3),
    fontSize: resp(40),
    color: '#000',
    fontWeight: 'bold',
    height: resp(60),
    width: resp(250),
  },
  loading: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Contactus;
