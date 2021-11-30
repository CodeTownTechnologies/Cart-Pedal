/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import resp from 'rn-responsive-font';

let width = Dimensions.get('window').width;
export default class MyWebComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
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
          <TouchableOpacity style={styles.SearchContainer} onPress={() => {}} />
        </View>
        <View style={{flexDirection: 'row', flex: 0.25}}>
          <View
            style={{
              width: resp(width / 2 - 10),
              height: resp(150),
              backgroundColor: '#fff',
              elevation: 5,
              marginTop: 10,
              marginLeft: 8,
              marginRight: 5,
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: resp(18),
                marginTop: 10,
              }}>
              Total Download
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '500',
                fontSize: resp(15),
                marginTop: 20,
              }}>
              1,000
            </Text>
          </View>
          <View
            style={{
              width: resp(width / 2 - 10),
              height: resp(150),
              backgroundColor: '#fff',
              elevation: 5,
              marginTop: 10,
              marginRight: 5,
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: resp(18),
                marginTop: 10,
              }}>
              Total Top User
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '500',
                fontSize: resp(15),
                marginTop: 20,
              }}>
              500
            </Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', flex: 0.25}}>
          <View
            style={{
              width: resp(width / 2 - 10),
              height: resp(150),
              backgroundColor: '#fff',
              elevation: 5,
              marginTop: 10,
              marginLeft: 8,
              marginRight: 5,
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: resp(18),
                marginTop: 10,
              }}>
              Top Seller
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '500',
                fontSize: resp(15),
                marginTop: 20,
              }}>
              Ravi Kant
            </Text>
          </View>
          <View
            style={{
              width: resp(width / 2 - 10),
              height: resp(150),
              backgroundColor: '#fff',
              elevation: 5,
              marginTop: 10,
              marginRight: 5,
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: resp(18),
                marginTop: 10,
              }}>
              Top Purchasers
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '500',
                fontSize: resp(15),
                marginTop: 20,
              }}>
              Bharat Sharma
            </Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', flex: 0.25}}>
          <View
            style={{
              width: resp(width / 2 - 10),
              height: resp(150),
              backgroundColor: '#fff',
              elevation: 5,
              marginTop: 10,
              marginLeft: 8,
              marginRight: 5,
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: resp(18),
                marginTop: 10,
              }}>
              Most viewed product
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '500',
                fontSize: resp(15),
                marginTop: 20,
              }}>
              Denim jeans
            </Text>
          </View>
          <View
            style={{
              width: resp(width / 2 - 10),
              height: resp(150),
              backgroundColor: '#fff',
              elevation: 5,
              marginTop: 10,
              marginRight: 5,
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: resp(18),
                marginTop: 10,
              }}>
              Most ordered product
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '500',
                fontSize: resp(15),
                marginTop: 20,
              }}>
              T-shirt
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
});
