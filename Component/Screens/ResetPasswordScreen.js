/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable no-alert */
/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import resp from 'rn-responsive-font';
console.disableYellowBox = true;
import {connect} from 'react-redux';
import {resetPass} from '../../redux/actions';
import {BASE_URL} from '../Component/ApiClient';
var otp;

class ResetPasswordScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      new_password: '',
      confirm_password: '',
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
    const {navigation} = this.props;
    otp = this.props.route.params.otp;
  }

  CheckTextInput = () => {
    if (this.state.new_password === '') {
      alert('Please Enter Password');
    } else if (this.state.new_password != this.state.confirm_password) {
      alert('Not Match Password');
    } else {
      this.setState({callUpdate: true}, () => {
        this.props.resetPass(this.state.new_password, otp);
      });
    }
  };

  componentDidUpdate() {
    if (this.props.success && this.state.callUpdate) {
      this.setState({callUpdate: false}, () => {
        this.props.navigation.replace('LoginScreen');
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.headerView}>
          <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
            <Image
              source={require('../images/back_icon.png')}
              style={styles.MenuHomeIconStyle}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.MainContainer}>
          <Text style={styles.HeadingText}>Reset Password ?</Text>

          <View style={styles.box} />
          <Text style={styles.UserName}>New Password</Text>
          <View style={styles.inputView1}>
            <View style={{flexDirection: 'row', marginLeft: 15}} />

            <TextInput
              placeholder=""
              placeholderTextColor="#000"
              underlineColorAndroid="transparent"
              style={styles.input}
              secureTextEntry={true}
              onChangeText={(confirm_password) =>
                this.setState({confirm_password})
              }
            />
          </View>
          <Text style={styles.UserName}>Conform Password</Text>
          <View style={styles.inputView1}>
            <View style={{flexDirection: 'row', marginLeft: 15}} />

            <TextInput
              placeholder=""
              placeholderTextColor="#000"
              underlineColorAndroid="transparent"
              style={styles.input}
              secureTextEntry={true}
              onChangeText={(new_password) => this.setState({new_password})}
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
  UserName: {
    color: 'gray',
    width: resp(350),
    fontSize: resp(12),
    textAlign: 'left',
  },
  HeadingText: {
    color: 'black',
    width: resp(355),
    fontSize: resp(30),
    fontWeight: 'bold',
    textAlign: 'left',
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
  MainContainer: {
    flex: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  MenuHomeIconStyle: {
    height: 30,
    width: 30,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
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
  input: {
    color: 'black',
    width: 300,
    height: 50,
    padding: 10,
    textAlign: 'left',
  },
  inputView1: {
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
  const {isLoading, data, success} = state.ResetPassReducer;
  return {
    isLoading,
    data,
    success,
  };
}

export default connect(mapStateToProps, {resetPass})(ResetPasswordScreen);
