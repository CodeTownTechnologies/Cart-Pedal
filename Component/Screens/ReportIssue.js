/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-alert */
import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  Platform
} from 'react-native';
import resp from 'rn-responsive-font';
import {Picker} from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
let width = Dimensions.get('window').width;
import {BASE_URL} from '../Component/ApiClient';

const placeholder = {
  label: 'Please you category*',
  value: null,
  color: '#9EA0A4',
};

export default class ReportIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comment: '',
      fcmToken: '',
      userId: '',
      userAccessToken: '',
      language: '',
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmToken: JSON.parse(token)});
      }
    });
    AsyncStorage.getItem('@user_id').then((userId) => {
      if (userId) {
        this.setState({userId: userId});
      }
    });
    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        this.setState({userAccessToken: accessToken});
      }
    });
  }

  checkReportIssue = () => {
    if (this.state.language == 'Others') {
      if (this.state.comment !== '') {
        this.SendReportIssue();
      } else {
        alert('Please enter an Additional comments');
      }
    } else {
      this.SendReportIssue();
    }
  };

  SendReportIssue() {
    let formData = new FormData();
    formData.append('user_id', this.state.userId);
    formData.append('reason', this.state.language);
    formData.append('message', this.state.comment);
    var otpUrl = `${BASE_URL}api-user/report-problem`;
    fetch(otpUrl, {
      method: 'Post',
      headers: {
        'Content-Type': 'multipart/form-data',
        device_id: '1234',
        device_token: this.state.fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          alert(responseData.data);
        } else {
          alert(responseData.message);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .done();
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
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
        <View style={{flex: 0.5}}>
          <View style={styles.inputTextView}>
            <Picker
              placeholder={placeholder}
              selectedValue={this.state.language}
              style={{height: 50, width: width - 55}}
              onValueChange={(itemValue, itemIndex) => {
                if (itemValue != '0') {
                  this.setState({language: itemValue});
                } else {
                  alert('Please select correct category');
                }
              }}>
              <Picker.Item label="Please select category *" value="0" />
              <Picker.Item
                label={'Cheating and forgery'}
                value={'Cheating and forgery'}
              />
              <Picker.Item
                label={'Issues related to prices and goods'}
                value={'Issues related to prices and goods'}
              />
              <Picker.Item
                label={'App related issues'}
                value={'App related issues'}
              />
              <Picker.Item label={'Others'} value={'Others'} />
            </Picker>
          </View>
          <View
            style={{
              marginTop: 15,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TextInput
              placeholder="Additional comments"
              multiline={true}
              style={{
                width: 350,
                backgroundColor: '#F4F4F4',
                height: 150,
                textAlignVertical: 'top',
              }}
              onChangeText={(text) => {
                this.setState({comment: text});
              }}
            />
          </View>
          <View>
            <TouchableOpacity
              onPress={() => {
                this.checkReportIssue();
              }}
              style={styles.sendbtn}>
              <Text style={{color: '#fff', fontSize: resp(17)}}>SEND</Text>
            </TouchableOpacity>
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
  sendbtn: {
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
  inputTextView: {
    fontSize: 17,
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 1,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
