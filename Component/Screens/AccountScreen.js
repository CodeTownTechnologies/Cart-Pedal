import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Share,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import resp from 'rn-responsive-font';
import AsyncStorage from '@react-native-community/async-storage';
import {BASE_URL} from '../Component/ApiClient';

class AccountScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      fcmtoken: '',
      userAccessToken: '',
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('@user_id').then((userId) => {
      if (userId) {
        this.setState({userId: userId});
      }
    });
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmtoken: JSON.parse(token)});
      }
    });
    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        this.setState({userAccessToken: accessToken});
      }
    });
  }
  deleteUserApi = () => {
    var urlprofile = `${BASE_URL}api-user/delete-user?user_id=${this.state.userId}`;
    fetch(urlprofile, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          this.props.navigation.navigate('LoginScreen');
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .done();
  };

  createTwoButtonAlert = () =>
    Alert.alert(
      'Delete Account',
      'Are You Sure You Want To Delete Account ?',
      [
        {
          text: 'No',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            this.deleteUserApi();
          },
        },
      ],
      {cancelable: false},
    );

  onShare = async () => {
    try {
      const result = await Share.share({
        message:
          'Lets download cart pedal.Its Best app for show case your product for Buy,Sell,Chat for make your Business Easy. Get it at http://cartpedal.com/ ',
        url: 'http://cartpedal.com/',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
        } else {
        }
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(error.message);
    }
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
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
            <TouchableOpacity
              // eslint-disable-next-line react-native/no-inline-styles
              style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={styles.TitleStyle}>Account </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.SearchContainer} />
        </View>

        <View style={styles.MainContentBox}>
          <ScrollView>
            <TouchableOpacity
              style={styles.Profile2Container}
              onPress={() => {
                this.createTwoButtonAlert();
              }}>
              <View style={styles.Profile2ImageContainer}>
                <TouchableOpacity>
                  <Image
                    source={require('../images/delete_account_icon.png')}
                    style={styles.Profile2ImageViewStyle}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonNameStyle}>Delete my Account</Text>
                <Text style={styles.ProfileDescription} />
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <View style={styles.TabBox}>
          <View style={styles.tabStyle}>
            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('DashBoardScreen');
              }}>
              <Image
                source={require('../images/home_inactive_icon.png')}
                style={styles.StyleHomeTab}
              />
              <Text style={styles.bottomInactiveTextStyle}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('OpenForPublicScreen');
              }}>
              <Image
                source={require('../images/group_inactive_icon.png')}
                style={styles.StyleOpenForPublicTab}
              />
              <Text style={styles.bottomInactiveTextStyle}>
                Open for Public
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('CartScreen');
              }}>
              <Image
                source={require('../images/cart_bag_inactive_icon.png')}
                style={styles.styleChartTab}
              />
              <Text style={styles.bottomInactiveTextStyle}>Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('ChatScreen');
              }}>
              <Image
                source={require('../images/chat_inactive_icon.png')}
                style={styles.StyleChatTab}
              />
              <Text style={styles.bottomInactiveTextStyle}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('SettingScreen');
              }}>
              <Image
                source={require('../images/setting_active_icon.png')}
                style={styles.StyleSettingTab}
              />
              <Text style={styles.bottomActiveTextStyle}>Setting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F6F9FE',
  },

  MainContentBox: {
    flex: 1,
  },

  TabBox: {
    flex: 0.1,
    color: '#000',
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
  LogoIconStyle: {
    margin: 5,
    height: 30,
    width: 30,
  },
  SearchIconStyle: {
    margin: 5,
    marginRight: 20,
    height: 25,
    width: 25,
    alignSelf: 'flex-end',
  },
  Profile2ImageViewStyle: {
    margin: resp(20),
    width: resp(42),
    height: resp(42),
    borderRadius: resp(10),
    borderWidth: 2,
    borderColor: '#F01738',
  },
  TitleContainer: {
    flexDirection: 'row',
    flex: 0.6,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  TitleStyle: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: resp(20),
    textAlign: 'center',
  },
  PersonNameStyle: {
    marginTop: resp(10),
    width: resp(200),
    height: resp(20),
    color: '#000',
    fontWeight: 'bold',
  },
  ProfileDescription: {
    marginRight: resp(-2),
    width: resp(260),
    height: resp(50),
    color: '#7F7F7F',
    fontSize: resp(12),
  },
  Profile2InfoContainer: {
    color: '#fff',
    marginTop: resp(10),
    flexDirection: 'column',
    flex: 0.8,
    width: resp(70),
    height: resp(70),
  },
  Profile2Container: {
    height: resp(70),
    color: '#fff',
    flexDirection: 'row',
  },
  SearchContainer: {
    flex: 0.2,
    backgroundColor: '#fff',
  },

  headerView: {
    flex: 0.1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 5,
  },
  Profile2ImageContainer: {
    margin: resp(0),
    flexDirection: 'column',
    flex: 0.2,
    width: resp(70),
    height: resp(70),
  },
  bottomActiveTextStyle: {
    color: '#FB3954',
    fontSize: resp(10),
    marginTop: 5,
    textAlign: 'center',
  },
  bottomInactiveTextStyle: {
    color: '#887F82',
    fontSize: resp(10),
    marginTop: 3,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  StyleHomeTab: {
    marginTop: 5,
    width: 30,
    height: 28,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  StyleOpenForPublicTab: {
    marginTop: 11,
    marginRight: 10,
    width: 38,
    height: 23,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },

  styleChartTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    marginLeft: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  StyleChatTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  StyleSettingTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabStyle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 60,
    elevation: 20,
    shadowColor: 'grey',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', //Here is the trick
    bottom: 0,
  },
  tabButtonStyle: {
    flex: 0.25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
});
export default AccountScreen;
