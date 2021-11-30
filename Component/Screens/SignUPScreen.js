/* eslint-disable eqeqeq */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable no-alert */
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
  Platform,
} from 'react-native';
import resp from 'rn-responsive-font';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-community/async-storage';
import CheckBox from 'react-native-check-box';
import {signUpConf} from '../../redux/actions';
import {connect} from 'react-redux';
import {BASE_URL} from '../Component/ApiClient';
console.disableYellowBox = true;
var mobileNumber;
class SignUPScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      password: '',
      mobile: '',
      email: '',
      fcmToken: '',
      isChecked: '',
      baseUrl: `${BASE_URL}`,
    };
  }

  componentDidMount() {
    mobileNumber = this.props.route.params.mobile;
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmToken: JSON.parse(token)});
      }
    });
  }
  CheckTextInput = () => {
    if (this.state.name === '') {
      alert('Please Enter Name ');
    } else if (this.state.email == '' || this.validate(this.state.email)) {
      alert('Please Enter Email');
    } else if (this.state.password === '') {
      alert('Please Enter Password');
    } else if (this.state.isChecked === false || this.state.isChecked === '') {
      alert('Please select the Terms and condition');
    } else {
      this.setState({callUpdate: true}, () => {
        this.props.signUpConf(
          this.state.name,
          mobileNumber,
          this.state.email,
          this.state.password,
        );
      });
    }
  };

  componentDidUpdate() {
    if (this.props.success && this.state.callUpdate) {
      this.setState({callUpdate: false}, () => {
        this.SignupORNot();
      });
    }
  }

  async SaveLoginUserData(responseData) {
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
                this.props.navigation.navigate('DashBoardScreen');
              },
            );
          });
        },
      );
    });
  }

  validate = (text) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(text) === false) {
      alert('Please Enter validate Email');
      this.setState({email: text});
      return false;
    } else {
      this.setState({email: text});
      console.log('Email is Correct');
    }
  };

  SignupORNot = async () => {
    await AsyncStorage.setItem('@is_login', '1').then((succ) => {
      this.SaveLoginUserData(this.props.data);
    });
  };

  SignUPCall() {}

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container2}>
            <View style={styles.headerView}>
              <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                <Image
                  source={require('../images/back_icon.png')}
                  style={styles.MenuHomeIconStyle}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.HeadingText}>Sign UP</Text>
            <View style={styles.box} />
            <Text style={styles.UserName}>UserName</Text>
            <View style={styles.inputView1}>
              <TextInput
                placeholder=""
                placeholderTextColor="#000"
                underlineColorAndroid="transparent"
                maxLength={25}
                style={styles.input}
                onChangeText={(name) => this.setState({name})}
              />
            </View>
            <Text style={styles.UserName}>Email</Text>
            <View style={styles.inputView1}>
              <TextInput
                placeholder=""
                placeholderTextColor="#000"
                underlineColorAndroid="transparent"
                style={styles.input}
                onChangeText={(email) => this.setState({email})}
              />
            </View>
            <Text style={styles.UserName}>Password</Text>
            <View style={styles.inputView1}>
              <TextInput
                placeholder=""
                placeholderTextColor="#000"
                underlineColorAndroid="transparent"
                style={styles.input}
                secureTextEntry={true}
                onChangeText={(password) => this.setState({password})}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 15,
              }}>
              <CheckBox
                uncheckedCheckBoxColor={'#FB3954'}
                checkedCheckBoxColor={'#FB3954'}
                value={this.state.isChecked}
                onValueChange={() =>
                  this.setState({isChecked: !this.state.isChecked})
                }
                onClick={() => {
                  this.setState({isChecked: !this.state.isChecked}, () => {
                    if (this.state.isChecked == true) {
                    }
                  });
                }}
                isChecked={this.state.isChecked}
              />
              <View>
                <Text
                  style={{
                    marginTop: 5,
                    color: '#06142D',
                    marginHorizontal: 5,
                    borderBottomWidth: 1,
                    borderColor: '#C7E8F2',
                    fontSize: 12,
                  }}>
                  {' '}
                  I Accept
                  <Text
                    onPress={() =>
                      this.props.navigation.navigate('MyWebComponent', {
                        screenSide: 'Signup',
                      })
                    }
                    style={{color: '#FB3954'}}>
                    {' '}
                    Terms & Conditions{' '}
                  </Text>
                  and
                  <Text
                    onPress={() =>
                      this.props.navigation.navigate('MyWebComponent', {
                        screenSide: 'Signup1',
                      })
                    }
                    style={{color: '#FB3954'}}>
                    {' '}
                    Privacy Policy.
                  </Text>
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.loginButtonStyle}
              activeOpacity={0.2}
              onPress={() => {
                this.CheckTextInput();
              }}>
              <Text style={styles.buttonWhiteTextStyle}>Sign Up</Text>
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
                this.props.navigation.navigate('LoginScreen');
              }}>
              <Text style={styles.color}>Sign In</Text>
            </TouchableOpacity>
            <Text style={styles.account}>Already have an account?</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  RadioButtonStyle: {
    marginTop: resp(15),
    marginHorizontal: resp(30),
    marginBottom: resp(-10),
    alignContent: 'center',
    alignSelf: 'center',
  },
  container2: {
    height: resp(780),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  box: {
    marginTop: resp(60),
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
  buttonWhiteTextStyle: {
    textAlign: 'center',
    fontSize: resp(16),
    color: 'white',
    alignContent: 'center',
  },
  headerView: {
    flex: 0.1,
    marginTop: resp(-70),
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    height: resp(50),
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
    fontSize: resp(14),
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
  HeadingText: {
    marginTop: resp(30),
    color: 'black',
    width: resp(355),
    fontSize: resp(30),
    fontWeight: 'bold',
    textAlign: 'left',
  },
  buttonWhiteTextStyle1: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: resp(20),
    color: 'white',
    alignContent: 'center',
  },
  MenuHomeIconStyle: {
    height: resp(30),
    width: resp(30),
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  inputView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: '90%',
    marginTop: 50,
    borderRadius: 10,
    elevation: 20,
    shadowColor: 'grey',
    elevation: 20,
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 1,
  },
  ImageIconStyle: {
    height: resp(25),
    width: resp(25),
    marginLeft: resp(30),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIconStyle: {
    height: resp(15),
    width: resp(15),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },

  forgetButton: {
    color: 'black',
    width: resp(380),
    height: resp(50),
    textAlign: 'right',
  },

  SignUPText: {
    color: 'red',
    marginTop: resp(10),
    position: 'absolute', //Here is the trick
    bottom: resp(30),
  },
  color: {
    color: 'red',
  },
  account: {
    color: 'gray',
    marginTop: resp(10),
    position: 'absolute', //Here is the trick
    bottom: resp(2),
  },
  input: {
    color: 'black',
    width: resp(300),
    height: resp(50),
    padding: resp(10),
    textAlign: 'left',
  },
  CircleFlexDirection: {
    marginRight: resp(10),
    flex: 1,
    alignSelf: 'center',
    flexDirection: 'row',
  },

  inputView1: {
    width: Platform.OS === 'android' ? '90%' : '100%',
    marginBottom: resp(15),
    alignSelf: 'center',
    borderColor: '#F01738',
    borderBottomWidth: 1,
  },
  
  loginButtonStyle: {
    marginTop: resp(10),
    width: resp(350),
    height: resp(50),
    padding: resp(10),
    backgroundColor: '#F01738',
    borderRadius: resp(40),
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
});

function mapStateToProps(state) {
  const {isLoading, data, success} = state.SignUpConfReducer;
  console.log(data);
  return {
    isLoading,
    data,
    success,
  };
}

export default connect(mapStateToProps, {signUpConf})(SignUPScreen);
