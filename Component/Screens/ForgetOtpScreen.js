/* eslint-disable no-alert */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/no-did-mount-set-state */
import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import resp from 'rn-responsive-font';
import OTPTextView from 'react-native-otp-textinput';
import AsyncStorage from '@react-native-community/async-storage';
import {forgotPassOTp} from '../../redux/actions';
import {connect} from 'react-redux';
import {BASE_URL} from '../Component/ApiClient';
var mobileNumber, otp;

console.disableYellowBox = true;
class ForgetOtpScreen extends Component {
  constructor(props) {
    super(props);
    this.verifyCall = this.verifyCall.bind(this);
    this.state = {
      phone_number: '',
      fcmToken: '',
      otp: '',
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

  componentDidMount() {
    mobileNumber = this.props.route.params.mogile;
    otp = this.props.route.params.otp;
    this.setState({otp: otp});
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmToken: JSON.parse(token)});
      }
    });
  }

  CheckTextInput = () => {
    if (this.state.otpInput === '') {
      alert('Please Enter OTP');
    } else if (this.state.otpInput != this.state.otp) {
      alert('Please Valid OTP');
    } else {
      this.setState({callUpdate: true}, () => {
        this.verifyCall();
      });
    }
  };

  resendopt = () => {
    let formData = new FormData();
    formData.append('mobile', '+91' + mobileNumber);
    formData.append('type', '1');
    var otpUrl = this.state.baseUrl + 'api-user/send-otp';
    fetch(otpUrl, {
      method: 'Post',
      headers: {
        'Content-Type': 'multipart/form-data',
        device_id: '1234',
        device_token: this.state.fcmToken,
        device_type: Platform.OS,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.hideLoading();
        if (responseData.code == '200') {
          this.setState({otp: responseData.data.otp});
        } else {
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  };

  componentDidUpdate() {
    if (this.props.success && this.state.callUpdate) {
      this.setState({callUpdate: false}, () => {
        this.props.navigation.navigate('ResetPasswordScreen', {
          otp: this.props.data.data,
        });
      });
    }
  }

  verifyCall() {
    this.props.forgotPassOTp(mobileNumber, this.state.otp);
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container2}>
            <Text style={styles.HeadingText}>Verifying your mobile number</Text>

            <Text style={styles.forgotDescription}>
              We have sent an otp on your mobile number{' '}
            </Text>
            <Text style={styles.forgotDescription2}>{mobileNumber}</Text>
            <Text style={styles.forgotDescription2}>
              {'OTP:' + this.state.otp}
            </Text>

            <OTPTextView
              handleTextChange={(otp) => this.setState({otpInput: otp})}
              containerStyle={styles.textInputContainer}
              textInputStyle={styles.roundedTextInput}
              inputCount={4}
              color={'white'}
              tintColor="#FB6C6A"
              offTintColor="#BBBCBE"
              inputCellLength={1}
            />

            <View style={styles.horizontal}>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('PhoneScreen');
                }}>
                <Text style={styles.EditPhoneStyle}>Edit Phone Number</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.resendopt}>
                <Text style={styles.ResendOtpStyle}>Resend Otp?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginButtonStyle}
              activeOpacity={0.2}
              onPress={() => {
                this.CheckTextInput();
              }}>
              <Text style={styles.buttonWhiteTextStyle}>Verify</Text>
            </TouchableOpacity>
            {this.props.isLoading && (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#ffff" />
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F01738',
  },
  container2: {
    alignContent: 'center',
    marginTop: 130,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F01738',
  },
  buttonWhiteTextStyle: {
    textAlign: 'center',
    fontSize: resp(16),
    color: '#F01738',
    alignContent: 'center',
  },
  textInputContainer: {
    marginTop: 50,
    marginBottom: 20,
    color: 'white',
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

  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: resp(10),
  },
  EditPhoneStyle: {
    width: resp(150),
    height: resp(30),
    color: '#FFFFFF',
  },
  ResendOtpStyle: {
    width: resp(100),
    height: resp(30),
    color: '#FFFFFF',
  },
  HeadingText: {
    color: 'white',
    width: resp(355),
    fontSize: resp(30),
    fontWeight: 'bold',
    textAlign: 'left',
  },
  forgotDescription: {
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'left',
    width: resp(350),
    opacity: 0.5,
  },
  forgotDescription2: {
    color: '#FFFFFF',
    textAlign: 'left',
    width: resp(350),
    opacity: 0.5,
  },
  input: {
    color: 'black',
    width: 300,
    height: 50,
    padding: 10,
    textAlign: 'left',
  },
  roundedTextInput: {
    borderRadius: 8,
    borderWidth: 2,
  },

  loginButtonStyle: {
    marginTop: 30,
    width: resp(350),
    height: resp(50),
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 40,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
});

// export default ForgetOtpScreen;

function mapStateToProps(state) {
  const {isLoading, data, success} = state.forgotPassOtpReducer;
  return {
    isLoading,
    data,
    success,
  };
}

export default connect(mapStateToProps, {forgotPassOTp})(ForgetOtpScreen);
