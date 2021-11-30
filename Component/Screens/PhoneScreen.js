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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import resp from 'rn-responsive-font';
import CheckBox from 'react-native-check-box';
console.disableYellowBox = true;
import {signUp} from '../../redux/actions';
import {connect} from 'react-redux';
import {BASE_URL} from '../Component/ApiClient';
class PhoneScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phone_number: '',
      isChecked: '',
      fcmToken: '',
      callUpdate: false,
      baseUrl: `${BASE_URL}`,
    };
  }

  componentDidMount() {
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmToken: JSON.parse(token)});
      }
    });
  }

  CheckTextInput = () => {
    if (this.state.phone_number === '') {
      alert('Please Enter Mobile Number');
    } else if (this.state.phone_number.length != '10') {
      alert('Please Enter Valid Mobile Number');
    } else if (this.state.isChecked === false || this.state.isChecked === '') {
      alert('Please select the Terms and condition');
    } else {
      this.setState({callUpdate: true}, () => {
        this.props
          .signUp(this.state.phone_number)
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
      });
    }
  };

  componentDidUpdate() {
    // if (this.props.success && !this.props.error && this.state.callUpdate) {
    //   this.setState({callUpdate: false}, () => {
    //     this.props.navigation.navigate('SignUPWithOtpScreen', {
    //       mobile: this.props.data.data.mobile,
    //       otp: this.props.data.data.otp,
    //     });
    //   });
    // }
  }

  render() {
    if (this.props.success && !this.props.error && this.state.callUpdate) {
      this.setState({callUpdate: false}, () => {
        this.props.navigation.navigate('SignUPWithOtpScreen', {
          mobile: this.props.data.data.mobile,
          otp: this.props.data.data.otp,
        });
      });
    }
    return (
      <ScrollView style={{flex: 1, backgroundColor: '#fff'}}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View
              style={{
                flex: 0.34,
                backgroundColor: '#F01738',
                flexDirection: 'row',
              }}>
              <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                <Image
                  source={require('../images/back_white.png')}
                  style={styles.MenuHomeIconStyle}
                />
              </TouchableOpacity>
            </View>

            <View style={{flex: 0.33, backgroundColor: '#F01738'}} />

            <View style={{flex: 0.33, backgroundColor: '#F01738'}} />
          </View>

          <View style={styles.logoContainer}>
            <Image
              source={require('../images/logo_cart_paddle.png')}
              style={styles.ImageView}
            />
            <Text style={styles.CartTextStyle}>Cartpedal</Text>
          </View>

          <View style={styles.container3}>
            <View style={styles.PhoneBox}>
              <Text style={styles.UserName}>Phone Number</Text>
              <View style={styles.inputView}>
                <View style={{flexDirection: 'row', marginLeft: 15}} />

                <TextInput
                  placeholder=""
                  placeholderTextColor="#000"
                  underlineColorAndroid="transparent"
                  style={styles.input}
                  keyboardType={'numeric'}
                  maxLength={10}
                  onChangeText={(phone_number) => this.setState({phone_number})}
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
                <Text style={styles.buttonWhiteTextStyle}>Submit</Text>
              </TouchableOpacity>
              {this.props.isLoading && (
                <View style={styles.loading}>
                  <ActivityIndicator size="large" color="#F01738" />
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: '#F01738',
  },

  CartTextStyle: {
    width: resp(204),
    height: resp(44),
    marginLeft: resp(20),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: resp(5),
    fontSize: resp(37),
    color: '#fff',
    fontWeight: 'bold',
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
  container3: {
    flex: 0.6,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
  },
  PhoneBox: {
    margin: resp(40),
  },
  logoContainer: {
    flex: 0.2,
    marginBottom: resp(60),
  },

  headerContainer: {
    flexDirection: 'row',
    flex: 0.2,
    backgroundColor: 'white',
  },
  MenuHomeIconStyle: {
    marginLeft: resp(10),
    marginTop: resp(20),
    height: resp(30),
    width: resp(26),
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  buttonWhiteTextStyle: {
    textAlign: 'center',
    fontSize: resp(16),
    color: 'white',
    alignContent: 'center',
  },
  ImageView: {
    height: resp(97.73),
    width: resp(93.75),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  UserName: {
    color: 'black',
    width: resp(340),
    fontSize: resp(12),
    textAlign: 'left',
    opacity: 0.5,
  },

  input: {
    color: 'black',
    height: 50,
    padding: 5,
    textAlign: 'left',
  },
  inputView: {
    marginBottom: 15,
    width: resp(350),
    borderColor: '#F01738',
    borderBottomWidth: 1,
  },
  loginButtonStyle: {
    marginTop: 10,
    width: resp(350),
    height: resp(50),
    padding: 10,
    backgroundColor: '#F01738',
    borderRadius: 40,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
});

function mapStateToProps(state) {
  const {isLoading, data, success, error} = state.SignUpReducer;
  return {
    isLoading,
    data,
    success,
    error,
  };
}

export default connect(mapStateToProps, {signUp})(PhoneScreen);
