/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  BackHandler,
} from 'react-native';
import resp from 'rn-responsive-font';
import AsyncStorage from '@react-native-community/async-storage';
import {signin} from '../../redux/actions';
import {connect} from 'react-redux';
import {BASE_URL} from '../Component/ApiClient';
console.disableYellowBox = true;

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      phone_number: '',
      password: '',
      fcmtoken: '',
      baseUrl: `${BASE_URL}`,
    };
  }

  showLoading() {
    this.setState({loading: true});
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }
  componentDidMount() {
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmtoken: JSON.parse(token)});
      }
    });
  }

  handleBackButtonClick() {
    if (this.props.navigation.isFocused()) {
      BackHandler.exitApp();
      return true;
    } else {
      this.props.navigation.goBack(null);
      return true;
    }
  }
  hideLoading() {
    this.setState({loading: false});
  }

  CheckTextInput = () => {
    if (this.state.phone_number === '') {
      // eslint-disable-next-line no-alert
      alert('Please Enter Phone Number ');
    } else if (this.state.password === '') {
      // eslint-disable-next-line no-alert
      alert('Please Enter Password');
    } else {
      this.setState({callUpdate: true}, () => {
        this.props.signin(
          this.state.phone_number,
          this.state.password,
          this.state.fcmtoken,
        );
      });
    }
  };

  componentDidUpdate() {
    if (this.props.success && this.state.callUpdate) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({callUpdate: false}, () => {
        this.LoginOrNot();
        this.setState({phone_number: '', password: ''});
      });
    }
  }
  UNSAFE_componentWillMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  LoginOrNot = async () => {
    await AsyncStorage.setItem('@is_login', '1').then((succc) => {
      this.SaveLoginUserData(this.props.data);
    });
  };

  async SaveLoginUserData(responseData) {
    const {params} = this.props.route;
    let access_token = 'Bearer ' + responseData.data.access_token;
    let username = responseData.data.fullname;
    await AsyncStorage.setItem(
      '@user_id',
      JSON.stringify(responseData.data.userid),
    ).then((succ) => {
      AsyncStorage.setItem('@access_token', JSON.stringify(access_token)).then(
        (succID) => {
          AsyncStorage.setItem(
            '@fcmtoken',
            JSON.stringify(responseData.data.device_token),
          ).then((succToken) => {
            AsyncStorage.setItem('@user_name', JSON.stringify(username)).then(
              (suuc) => {
                if (params) {
                  const {initialPage, parameters} = params;
                  this.props.navigation.navigate(initialPage, parameters);
                } else {
                  this.props.navigation.navigate('DashBoardScreen');
                }
              },
            );
          });
        },
      );
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container2}>
            <Image
              source={require('../images/logo_cart_paddle.png')}
              style={styles.ImageView}
            />
            <Text style={styles.CartTextStyle}>Cartpedal</Text>
            <View style={styles.box} />
            <Text style={styles.UserName}>Phone Number</Text>
            <View style={styles.inputView}>
              <View style={{flexDirection: 'row', marginLeft: 15}} />

              <TextInput
                placeholder=""
                placeholderTextColor="#000"
                underlineColorAndroid="transparent"
                keyboardType={'numeric'}
                style={styles.input}
                maxLength={10}
                onChangeText={(phone_number) => this.setState({phone_number})}
              />
            </View>
            <Text style={styles.UserName}>Password</Text>
            <View style={styles.inputView}>
              <View style={{flexDirection: 'row', marginLeft: 10}} />

              <TextInput
                placeholder=""
                placeholderTextColor="#000"
                underlineColorAndroid="transparent"
                style={styles.input}
                secureTextEntry={true}
                onChangeText={(password) => this.setState({password})}
              />
            </View>
            <TouchableOpacity>
              <Text
                style={styles.forgetButton}
                onPress={() => {
                  this.props.navigation.navigate('ForgotPasswordScreen');
                }}>
                Forgot Password ?
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.loginButtonStyle}
              activeOpacity={0.2}
              onPress={() => {
                this.CheckTextInput();
              }}>
              <Text style={styles.buttonWhiteTextStyle}>Sign in</Text>
            </TouchableOpacity>
            {this.props.isLoading && (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#F01738" />
              </View>
            )}
            <View style={styles.horizontal}>
              <View style={styles.hairline} />
              <Text style={styles.OrText}>or</Text>
              <View style={styles.hairline} />
            </View>
            <TouchableOpacity
              style={styles.SignUPText}
              onPress={() => {
                this.props.navigation.navigate('PhoneScreen');
              }}>
              <Text style={styles.color}>Sign Up</Text>
            </TouchableOpacity>

            <Text style={styles.account}>Don't have an account ?</Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  container2: {
    height: 780,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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

  box: {
    marginTop: 60,
    height: resp(40),
    width: resp(40),
  },
  CartTextStyle: {
    marginTop: resp(0),
    fontSize: resp(30),
    color: '#000',
    fontWeight: 'bold',
  },
  buttonWhiteTextStyle: {
    textAlign: 'center',
    fontSize: resp(16),
    color: 'white',
    alignContent: 'center',
  },
  ImageView: {
    height: resp(100),
    width: resp(100),
    backgroundColor: 'white',
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: resp(80),
  },
  OrText: {
    fontFamily: 'AvenirNext-Bold',
    color: 'red',
    fontSize: 14,
    paddingHorizontal: 5,
    alignSelf: 'center',
  },
  hairline: {
    backgroundColor: '#A2A2A2',
    height: 1,
    width: 165,
  },
  UserName: {
    color: 'gray',
    width: resp(350),
    fontSize: resp(12),
    textAlign: 'left',
  },
  forgetButton: {
    color: 'black',
    width: resp(380),
    height: resp(50),
    marginRight: resp(20),
    textAlign: 'right',
  },
  SignUPText: {
    color: 'red',
    marginTop: 10,
    position: 'absolute', //Here is the trick
    bottom: 30,
  },
  color: {
    color: 'red',
  },
  account: {
    color: 'gray',
    marginTop: 10,
    position: 'absolute', //Here is the trick
    bottom: 10,
  },
  input: {
    color: 'black',
    width: 300,
    height: 50,
    padding: 10,
    textAlign: 'left',
  },

  inputView: {
    width: '90%',
    marginBottom: 15,
    alignSelf: 'center',
    borderColor: '#f2000c',
    borderBottomWidth: 1,
  },
  loginButtonStyle: {
    marginTop: 10,
    width: resp(350),
    height: resp(50),
    padding: 10,
    backgroundColor: '#f2000c',
    borderRadius: 40,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
});

function mapStateToProps(state) {
  const {isLoading, data, success} = state.signinReducer;
  return {
    isLoading,
    data,
    success,
  };
}

export default connect(mapStateToProps, {signin})(LoginScreen);
