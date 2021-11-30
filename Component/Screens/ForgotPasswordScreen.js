/* eslint-disable react/no-did-update-set-state */
/* eslint-disable no-alert */
import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import resp from 'rn-responsive-font';
import {connect} from 'react-redux';
import {forgotPass} from '../../redux/actions';
import {BASE_URL} from '../Component/ApiClient';
console.disableYellowBox = true;

class ForgotPasswordScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phone_number: '',
      baseUrl: `${BASE_URL}`,
      callUpdate: false,
    };
  }

  showLoading() {
    this.setState({loading: true});
  }

  hideLoading() {
    this.setState({loading: false});
  }

  CheckTextInput = () => {
    if (this.state.phone_number === '') {
      alert('Please Enter Mobile Number');
    } else if (this.state.phone_number.length != '10') {
      alert('Please Enter Valid Mobile Number');
    } else {
      this.setState({callUpdate: true}, () =>
        this.props.forgotPass(this.state.phone_number),
      );
    }
  };

  componentDidUpdate() {
    if (this.props.success && this.state.callUpdate) {
      this.setState({callUpdate: false}, () => {
        this.props.navigation.navigate('ForgetOtpScreen', {
          mobile: this.props.data.data.mobile,
          otp: this.props.data.data.otp,
        });
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.headerView}>
            <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
              <Image
                source={require('../images/back_icon.png')}
                style={styles.MenuHomeIconStyle}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.ForgetContainer}>
            <Text style={styles.HeadingText}>Forget Password ?</Text>
            <Text style={styles.forgotDescription}>
              Don't Worry ! just fill your registred phone number
            </Text>
            <Text style={styles.forgotDescription2}>
              and we'll send you a OTP to reset your password.
            </Text>
            <View style={styles.box} />
            <Text style={styles.MobileNumber}>Phone Number</Text>
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
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  box: {
    marginTop: 60,
  },
  buttonWhiteTextStyle: {
    textAlign: 'center',
    fontSize: resp(16),
    color: 'white',
    alignContent: 'center',
  },
  ForgetContainer: {
    flex: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  MobileNumber: {
    color: 'gray',
    width: resp(350),
    fontSize: resp(12),
    textAlign: 'left',
  },
  HeadingText: {
    marginBottom: resp(20),
    color: 'black',
    width: resp(355),
    fontSize: resp(30),
    fontWeight: 'bold',
    textAlign: 'left',
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
  color: {
    color: 'red',
  },
  MenuHomeIconStyle: {
    height: 30,
    width: 30,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  headerView: {
    flex: 0.1,
    margin: resp(20),
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    height: 50,
    backgroundColor: '#fff',
  },

  forgotDescription: {
    color: 'gray',
    marginTop: 20,
    textAlign: 'left',
    width: resp(355),
  },
  forgotDescription2: {
    color: 'gray',
    textAlign: 'left',
    width: resp(355),
  },
  input: {
    color: 'black',
    width: 350,
    height: 50,
    padding: 5,
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
    marginTop: 30,
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
  const {isLoading, data, success} = state.forgotPassReducer;
  return {
    isLoading,
    data,
    success,
  };
}

export default connect(mapStateToProps, {forgotPass})(ForgotPasswordScreen);
