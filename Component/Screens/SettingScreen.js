/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-alert */
import React, {Component} from 'react';
console.disableYellowBox = true;

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import resp from 'rn-responsive-font';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage';
import {BASE_URL} from '../Component/ApiClient';
import {resetStore} from '../../redux/actions';
import {connect} from 'react-redux';
import OfflineUserScreen from './OfflineUserScreen';
import {Icon} from 'native-base';

class SettingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      avatar: null,
      fcmtoken: '',
      userId: '',
      spinner: false,
      userAccessToken: '',
      name: '',
      pickedImage: require('../images/default_user.png'),
      about: '',
    };
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.showLoading();
      AsyncStorage.getItem('@fcmtoken').then((token) => {
        if (token) {
          this.setState({fcmtoken: JSON.parse(token)});
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
          this.ProfileViewCall();
        }
      });
    });
  }

  showLoading() {
    this.setState({spinner: true});
  }
  logout = () => {
    fetch(`${BASE_URL}api-user/logout?user_id=${this.state.userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: this.state.fc,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code === 200) {
          AsyncStorage.removeItem('@is_login').then((succ) => {
            this.logOut();
          });
        } else {
          if (responseData.message) alert(responseData.message);
        }
      })

      .catch((error) => {});
  };
  logOut = () => {
    AsyncStorage.removeItem('@user_id').then((succss) => {
      AsyncStorage.removeItem('@access_token').then((resul) => {
        this.props.resetStore();
        this.props.navigation.navigate('LoginScreen');
      });
    });
  };

  onShare = async () => {
    try {
      const result = await Share.share({
        message:
          'Lets download cart pedal.Its Best app for show case your product for Buy,Sell,Chat for make your Business Easy. Get it at https://cartpedal.com/ ',
        url: 'https://cartpedal.com/',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
        } else {
        }
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {
      alert(error.message);
    }
  };

  hideLoading() {
    this.setState({spinner: false});
  }

  ProfileViewCall() {
    let formData = new FormData();
    var urlprofile =
      `${BASE_URL}api-user/view-profile?user_id=` + this.state.userId;
    this.state.userId;
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
        this.hideLoading();
        if (responseData.code == '200') {
          this.setState({userProfileData: responseData.data});
          this.setState({TotalprofileView: responseData.data.profileviews});
          if (responseData.data.avatar == null) {
            this.setState({avatar: null});
          } else {
            this.setState({avatar: responseData.data.avatar});
          }
          if (responseData.data.name !== null) {
            this.setState({name: responseData.data.name});
          }
          if (responseData.data.about !== null) {
            this.setState({about: responseData.data.about});
          }
        } else {
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .done();
  }

  openProfile = () => {
    if (this.state.avatar !== null) {
      this.props.navigation.navigate('SettingFullView', {
        imageURL: this.state.avatar,
        name: this.state.name,
        about: this.state.about,
      });
    } else {
      this.props.navigation.navigate('SettingFullView', {
        imageURL: this.state.avatar,
        name: this.state.name,
        about: this.state.about,
      });
    }
  };

  render() {
    if (!this.props.isConnected) {
      return <OfflineUserScreen />;
    }
    return (
      <SafeAreaView style={styles.container}>
        <Spinner
          visible={this.state.spinner}
          color="#F01738"
          textStyle={styles.spinnerTextStyle}
        />
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
              style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={styles.TitleStyle}>Setting</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.SearchContainer} />
        </View>

        <View style={styles.MainContentBox}>
          <ScrollView>
            <TouchableOpacity
              style={styles.ImageContainer}
              onPress={() => {
                this.openProfile();
              }}>
              <View style={styles.Profile2ImageContainer}>
                <TouchableOpacity
                  onPress={() => {
                    this.openProfile();
                  }}>
                  <Image
                    source={
                      this.state.avatar == null
                        ? this.state.pickedImage
                        : {uri: this.state.avatar}
                    }
                    style={styles.Profile2ImageViewStyle}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonNameStyle}>{this.state.name}</Text>
                <Text style={styles.ProfileDescription}>
                  {this.state.about}
                </Text>
              </View>
              <View style={styles.ArrowContainer}>
                <Image
                  source={require('../images/Right_arrow.png')}
                  style={styles.ArrowStyle}
                />
              </View>
            </TouchableOpacity>
            <View style={styles.hairline} />
            <TouchableOpacity
              style={styles.Profile2Container}
              onPress={() => {
                this.props.navigation.navigate('AccountScreen');
              }}>
              <View style={styles.Profile2ImageContainer}>
                <TouchableOpacity>
                  <Image
                    source={require('../images/account_icon.png')}
                    style={styles.Profile2ImageViewStyle}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonNameStyle}>Account</Text>
                <Text style={styles.ProfileDescription}>Delete my Account</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.Profile2Container}>
              <View style={styles.Profile2ImageContainer}>
                <TouchableOpacity>
                  <Image
                    source={require('../images/product_icon.png')}
                    style={styles.Profile2ImageViewStyle}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.Profile2InfoContainer}
                onPress={() => {
                  this.props.navigation.navigate('ProductListScreen');
                }}>
                <Text style={styles.PersonNameStyle}>Product Master</Text>
                <Text style={styles.ProfileDescription}>Save Your Uploads</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity style={styles.Profile2Container}>
              <View style={styles.Profile2ImageContainer}>
                <TouchableOpacity>
                  <Image
                    source={require('../images/product_icon.png')}
                    style={styles.Profile2ImageViewStyle}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.Profile2InfoContainer}
                onPress={() => {
                  this.props.navigation.navigate('ProductListScreen2');
                }}>
                <Text style={styles.PersonNameStyle}>Hided Products</Text>
                <Text style={styles.ProfileDescription}>
                  Your hided products
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.Profile2Container}
              onPress={() => {
                this.props.navigation.navigate('BackUpChats');
              }}>
              <View style={styles.Profile2ImageContainer}>
                <TouchableOpacity>
                  <Image
                    source={require('../images/chats_icon.png')}
                    style={styles.Profile2ImageViewStyle}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonNameStyle}>Chats</Text>
                <Text style={styles.ProfileDescription}>Delete All chats</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.Profile2Container}
              onPress={() => {
                this.props.navigation.navigate('NotificationsScreen');
              }}>
              <View style={styles.Profile2ImageContainer}>
                <TouchableOpacity>
                  <Image
                    source={require('../images/bell_icon.png')}
                    style={styles.Profile2ImageViewStyle}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonNameStyle}>Notifications</Text>
                <Text style={styles.ProfileDescription}>
                  Notification Tone for message/group
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.Profile2Container}
              onPress={() => {
                this.props.navigation.navigate('ChangePassword');
              }}>
              <View style={styles.Profile2ImageContainer}>
                <TouchableOpacity
                  onPress={() => {
                    this.props.navigation.navigate('ChangePassword');
                  }}>
                  <Image
                    source={require('../images/account_icon.png')}
                    style={styles.Profile2ImageViewStyle}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonNameStyle}>Change Password</Text>
                <Text style={styles.ProfileDescription}>
                  Change your Password
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.Profile2Container}
              onPress={() => {
                this.props.navigation.navigate('HelpScreen');
              }}>
              <View style={styles.Profile2ImageContainer}>
                <TouchableOpacity>
                  <Image
                    source={require('../images/help.png')}
                    style={styles.Profile2ImageViewStyle}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonNameStyle}>Help</Text>
                <Text style={styles.ProfileDescription}>
                  faq, contact us, Privacy policy
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.Profile2Container}
              onPress={this.onShare}>
              <View style={styles.Profile2ImageContainer}>
                <TouchableOpacity onPress={this.onShare}>
                  <Image
                    source={require('../images/contact_icon.png')}
                    style={styles.Profile2ImageViewStyle}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonNameStyle}>Tell a Friend</Text>
                <Text style={styles.ProfileDescription} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.Profile2Container}
              onPress={() => {
                this.props.navigation.navigate('AdminReport');
              }}>
              <View style={styles.Profile2ImageContainer}>
                <TouchableOpacity
                  onPress={() => {
                    this.props.navigation.navigate('AdminReport');
                  }}>
                  <Image
                    source={require('../images/contact_icon.png')}
                    style={styles.Profile2ImageViewStyle}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonNameStyle}>Admin Report</Text>
                <Text style={styles.ProfileDescription} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.Profile2Container}
              onPress={() => {
                this.props.navigation.navigate('ReportIssue');
              }}>
              <View style={styles.Profile2ImageContainer}>
                <TouchableOpacity
                  onPress={() => {
                    this.props.navigation.navigate('ReportIssue');
                  }}>
                  <Image
                    source={require('../images/help.png')}
                    style={styles.Profile2ImageViewStyle}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonNameStyle}>Report an Issue</Text>
                <Text style={styles.ProfileDescription} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.Profile2Container}
              onPress={() => {
                this.props.navigation.navigate('BlockedUsers');
              }}>
              <View
                style={[
                  styles.Profile2ImageContainer,
                  {justifyContent: 'center', alignItems: 'center'},
                ]}>
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    this.props.navigation.navigate('BlockedUsers');
                  }}>
                  <View
                    style={[
                      styles.Profile2ImageViewStyle,
                      {
                        backgroundColor: 'red',
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    ]}>
                    <Icon
                      type="MaterialIcons"
                      name="block"
                      style={{color: 'white'}}
                    />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonNameStyle}>Blocked Users</Text>
                <Text style={styles.ProfileDescription} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.Profile2Container}
              onPress={() => {
                this.logout();
              }}>
              <View style={styles.Profile2ImageContainer}>
                <TouchableOpacity
                  onPress={() => {
                    this.logout();
                  }}>
                  <Image
                    source={require('../images/account_icon.png')}
                    style={styles.Profile2ImageViewStyle}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonNameStyle}>Log Out</Text>
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
  spinnerTextStyle: {
    color: '#F01738',
  },
  hairline: {
    backgroundColor: '#C8C7CC80',
    height: 5,
    width: '100%',
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

    // height: resp(20),
    color: '#000',
    fontSize: resp(15),
    fontWeight: 'bold',
  },

  ArrowContainer: {
    margin: resp(5),
    marginTop: resp(20),
    flexDirection: 'row',
    alignContent: 'flex-end',
    flex: 0.1,
    height: resp(40),
  },
  ArrowStyle: {
    marginTop: resp(15),
    color: '#0000008A',
  },
  ProfileDescription: {
    marginRight: resp(-2),
    width: resp(260),
    height: resp(70),
    color: '#7F7F7F',
    fontSize: resp(12),
  },
  Profile2InfoContainer: {
    color: '#fff',
    marginTop: resp(10),
    flexDirection: 'column',
    flex: 0.8,
    width: resp(70),
    // height: resp(70),
    overflow: 'scroll',
  },
  ImageContainer: {
    height: resp(100),
    color: '#fff',
    flexDirection: 'row',
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
  backButtonStyle: {
    margin: 10,
    height: 20,
    width: 20,
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
    shadowColor: '#ecf6fb',
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
const mapStateToProps = (state) => {
  return {isConnected: state.network.isConnected};
};

export default connect(mapStateToProps, {
  resetStore,
})(SettingScreen);
