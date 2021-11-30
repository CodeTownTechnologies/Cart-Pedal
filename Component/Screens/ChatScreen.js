/* eslint-disable react-native/no-inline-styles */
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
  Platform,
  TextInput,
} from 'react-native';
import resp from 'rn-responsive-font';
import Spinner from 'react-native-loading-spinner-overlay';
import moment from 'moment';
import ImageModal from 'react-native-image-modal';
import requestCameraAndAudioPermission from './permission';
import {moreIcon} from '../Component/Images';
import Menu from 'react-native-material-menu';

import {ChatlistAction} from '../../redux/actions';
import AsyncStorage from '@react-native-community/async-storage';
import {Fab, Icon} from 'native-base';
import NetInfo from '@react-native-community/netinfo';
import {connect} from 'react-redux';
import _ from 'lodash';
import {BASE_URL} from '../Component/ApiClient';
import firebase from 'react-native-firebase';

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      name: null,
      chatID: '124568',
      userId: '',
      userAccessToken: '',
      chatList: '',
      ischatList: false,
      spinner: false,
      fcmToken: '',
      PhoneNumber: '',
      mounted: false,
      showSearch: true,
      masterlist: '',
      exit: false,
      list: [],
      Deleteid: '',
      toids: [],
    };
    if (Platform.OS === 'android') {
      requestCameraAndAudioPermission().then((_) => {
        console.log('requested!');
      });
    }
  }
  showLoading() {
    this.setState({spinner: true});
  }

  componentDidMount = () => {
    this.showLoading();
    this.focusListener = this.props.navigation.addListener('focus', () => {
      NetInfo.fetch().then((state) => {
        if (state.isConnected && this.state.mounted) {
          this.getChatList();
        }
      });
    });
    AsyncStorage.getItem('@user_id').then((userId) => {
      if (userId) {
        this.setState({userId: userId});
      }
    });
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmToken: token});
      }
    });
    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        this.setState({userAccessToken: accessToken, mounted: true});
        this.getChatList();
      }
    });
    AsyncStorage.getItem('@Phonecontacts').then((mobile) => {
      if (mobile) {
        this.setState({PhoneNumber: JSON.parse(mobile)});
      }
    });
    this.listener1 = firebase.notifications().onNotification((notification) => {
      if (notification.data.type === '') {
        NetInfo.fetch().then((state) => {
          if (state.isConnected && this.state.mounted) {
            this.getChatList();
          }
        });
      }
    });

    this.listener2 = firebase.messaging().onMessage((m) => {
      if (m.data.type === '') {
        NetInfo.fetch().then((state) => {
          if (state.isConnected && this.state.mounted) {
            this.getChatList();
          }
        });
      }
    });
  };

  showLoading() {
    this.setState({spinner: true});
  }

  hideLoading() {
    this.setState({spinner: false});
  }

  DeleteGroupChat = () => {
    let formData = new FormData();
    formData.append('user_id', this.state.userId);
    formData.append('groupid', this.state.Deleteid);
    var PalceOderUrl = `${BASE_URL}api-message/delete-group`;
    fetch(PalceOderUrl, {
      method: 'Post',
      headers: new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '1234',
        device_token: this.state.fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      }),
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200 ') {
          this.setState({exit: false});
          this.getChatList();
        } else {
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  };
  componentWillReceiveProps(nextProps) {
    let equalArray = _.isEqual(this.props.chatListData, nextProps.chatListData);
    if (!equalArray) {
      this.setState({chatList: nextProps.chatListData, ischatList: true});
    }
    if (!this.props.isConnected) {
      this.setState({
        chatList: this.props.chatListData,
        ischatList: true,
      });
    }
  }
  componentDidUpdate() {
    //  console.log(this.props.chatlistsuccess);
    if (this.props.chatlistsuccess && this.state.callUpdate) {
      this.setState({callUpdate: false}, () => {
        this.setState({chatList: this.props.chatListData, ischatList: true});
        this.hideLoading();
      });
    }
    if (this.props.chatlisterror && this.state.callUpdate) {
      this.setState({callUpdate: false}, () => {
        this.setState({NoData: true, ischatList: false}, () => {
          this.hideLoading();
        });
      });
    }
  }
  getChatList = () => {
    this.setState({callUpdate: true}, () => {
      this.props.ChatlistAction(this.state.userId, this.state.userAccessToken);
    });
  };

  componentWillUnmount() {
    this.listener1();
    this.listener2();
  }

  searchFilterFunction = (text) => {
    if (text) {
      let combineArray = this.state.chatList;
      const newData = combineArray.filter(function (item) {
        const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      this.setState({chatList: newData});
    } else {
      this.setState({chatList: this.state.masterlist});
    }
  };

  render() {
    const funct = this;
    return (
      <SafeAreaView style={styles.container}>
        {this.props.isConnected && (
          <Fab
            onPress={() => {
              this.props.navigation.navigate('NewContactListScreen', {
                userId: this.state.userId,
                PhoneNumber: this.state.PhoneNumber,
                fcmToken: this.state.fcmToken,
                userAccessToken: this.state.userAccessToken,
              });
            }}
            style={{backgroundColor: 'red'}}
            containerStyle={{marginBottom: 64, zIndex: 4}}
            position="bottomRight">
            <Icon type="MaterialCommunityIcons" name="message-text-outline" />
          </Fab>
        )}
        <Spinner
          visible={this.state.spinner}
          color="#F01738"
          textStyle={styles.spinnerTextStyle}
        />
        {this.state.showSearch ? (
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
                <Text style={styles.TitleStyle}>CartPedal</Text>
              </TouchableOpacity>
            </View>
            {!this.state.exit ? (
              <TouchableOpacity
                style={styles.SearchContainer}
                onPress={() => {
                  this.setState({showSearch: false});
                }}>
                <Image
                  source={require('../images/search.png')}
                  style={styles.SearchIconStyle}
                />
              </TouchableOpacity>
            ) : (
              <Icon
                type="MaterialCommunityIcons"
                name="delete"
                style={{fontSize: 25}}
                onPress={this.DeleteGroupChat}
              />
            )}
            {!this.state.exit ? (
              <TouchableOpacity
                onPress={() => {
                  this._menu.show();
                }}>
                <Image source={moreIcon} style={styles.moreMenuIcon} />
              </TouchableOpacity>
            ) : null}

            <Menu ref={(ref) => (this._menu = ref)}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginStart: 10,
                  marginEnd: 10,
                  marginTop: 20,
                  marginBottom: 10,
                }}
                onPress={() => {
                  this._menu.hide();
                  if (this.props.isConnected) {
                    this.props.navigation.navigate('ChatGroupListScreen', {
                      userId: this.state.userId,
                      PhoneNumber: this.state.PhoneNumber,
                      fcmToken: this.state.fcmToken,
                      userAccessToken: this.state.userAccessToken,
                    });
                  }
                }}>
                {'Create New Group'}
              </Text>
              <Text
                style={{
                  marginStart: 10,
                  marginEnd: 10,
                  marginBottom: 20,
                  fontSize: 13,
                }}
                onPress={() => {
                  this._menu.hide();
                  if (this.props.isConnected) {
                    this.props.navigation.navigate('ChatGroupListScreen', {
                      userId: this.state.userId,
                      PhoneNumber: this.state.PhoneNumber,
                      fcmToken: this.state.fcmToken,
                      userAccessToken: this.state.userAccessToken,
                    });
                  }
                }}>
                {'(for your personol use)'}
              </Text>
            </Menu>
          </View>
        ) : (
          <View style={styles.inputViewStyle}>
            <TouchableOpacity
              style={{marginLeft: 2}}
              onPress={() => {
                this.setState({showSearch: true});
              }}>
              <Image
                source={require('../images/back_blck_icon.png')}
                style={styles.backButtonStyle1}
              />
            </TouchableOpacity>
            <View style={{backgroundColor: '#00000008'}}>
              <TextInput
                placeholder="Search"
                placeholderTextColor="#BEBEBE"
                underlineColorAndroid="transparent"
                style={styles.input}
                onChangeText={(text) => {
                  this.searchFilterFunction(text);
                }}
              />
            </View>
          </View>
        )}

        <View style={styles.MainContentBox}>
          <ScrollView>
            <View>
              {this.state.ischatList ? (
                this.state.chatList.map(function (v) {
                  const inList = funct.state.Deleteid;
                  return (
                    <TouchableOpacity
                      onLongPress={() => {
                        funct.setState({exit: v.exit, Deleteid: v.id});
                      }}
                      onPress={() => {
                        funct.props.navigation.navigate('ChatDetailScreen', {
                          userid: v.id,
                          username: v.name,
                          useravatar: v.avatar,
                          userabout: v.about,
                          userphone: v.mobile,
                          msg_type: v.msg_type,
                          groupId: v.id,
                          groupexit: v.lastmsg.group_id !== 0 ? v.exit : '',
                          membersCount:
                            !v.member || v.member == ''
                              ? 1
                              : v.member.split(',').length - 1,
                        });
                      }}>
                      <View
                        style={{
                          alignSelf: 'center',
                          backgroundColor:
                            inList == v.id ? 'lightgrey' : 'white',
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <View style={{padding: 10}}>
                          <ImageModal
                            resizeMode="contain"
                            imageBackgroundColor="transparent"
                            borderRadius={8}
                            style={styles.Styleimage}
                            source={
                              v.avatar
                                ? {uri: v.avatar}
                                : require('../images/default_user.png')
                            }
                          />
                        </View>
                        <View
                          style={{
                            backgroundColor:
                              inList == v.id ? 'lightgrey' : 'white',
                            flexDirection: 'row',
                            width: '84%',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <View>
                            <Text style={styles.PersonNameStyle}>{v.name}</Text>

                            {!v.is_delete
                              ? v.lastmsg?.txt_type === 'text' && (
                                  <Text style={styles.PersonNameStyle1}>
                                    {v.lastmsg?.body}
                                  </Text>
                                )
                              : null}
                            {!v.is_delete
                              ? v.lastmsg?.txt_type === 'ask_status' && (
                                  <Text style={styles.PersonNameStyle1}>
                                    {v.lastmsg?.body}
                                  </Text>
                                )
                              : null}
                            {!v.is_delete
                              ? v.lastmsg?.txt_type === 'accept' && (
                                  <Text style={styles.PersonNameStyle1}>
                                    {v.lastmsg?.body}
                                  </Text>
                                )
                              : null}
                            {!v.is_delete
                              ? v.lastmsg?.txt_type === 'link' && (
                                  <Text style={styles.PersonNameStyle1}>
                                    {v.lastmsg?.body}
                                  </Text>
                                )
                              : null}

                            {!v.is_delete
                              ? v.lastmsg?.txt_type === 'location' && (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <Icon
                                      name="location-pin"
                                      style={{
                                        fontSize: 20,
                                        color: 'grey',
                                        marginLeft: 8,
                                      }}
                                      type="MaterialIcons"
                                    />
                                    <Text
                                      style={[
                                        styles.PersonNameStyle1,
                                        {marginLeft: 4},
                                      ]}>
                                      Location
                                    </Text>
                                  </View>
                                )
                              : null}
                            {!v.is_delete
                              ? v.lastmsg?.txt_type === 'file' && (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <Icon
                                      name="file-document"
                                      style={{
                                        fontSize: 20,
                                        color: 'grey',
                                        marginLeft: 8,
                                      }}
                                      type="MaterialCommunityIcons"
                                    />
                                    <Text
                                      style={[
                                        styles.PersonNameStyle1,
                                        {marginLeft: 4},
                                      ]}>
                                      Document
                                    </Text>
                                  </View>
                                )
                              : null}
                            {!v.is_delete
                              ? v.lastmsg?.txt_type === 'image' && (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <Icon
                                      name="photo"
                                      style={{
                                        fontSize: 20,
                                        color: 'grey',
                                        marginLeft: 8,
                                      }}
                                      type="MaterialIcons"
                                    />
                                    <Text
                                      style={[
                                        styles.PersonNameStyle1,
                                        {marginLeft: 4},
                                      ]}>
                                      Photo
                                    </Text>
                                  </View>
                                )
                              : null}
                            {!v.is_delete
                              ? v.lastmsg?.txt_type === 'video' && (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <Icon
                                      name="videocam"
                                      style={{
                                        fontSize: 20,
                                        color: 'grey',
                                        marginLeft: 8,
                                      }}
                                      type="MaterialIcons"
                                    />
                                    <Text
                                      style={[
                                        styles.PersonNameStyle1,
                                        {marginLeft: 4},
                                      ]}>
                                      Video
                                    </Text>
                                  </View>
                                )
                              : null}
                            {!v.is_delete
                              ? v.lastmsg?.txt_type === 'audio' && (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <Icon
                                      name="headset"
                                      style={{
                                        fontSize: 20,
                                        color: 'grey',
                                        marginLeft: 8,
                                      }}
                                      type="MaterialIcons"
                                    />
                                    <Text
                                      style={[
                                        styles.PersonNameStyle1,
                                        {marginLeft: 4},
                                      ]}>
                                      Audio
                                    </Text>
                                  </View>
                                )
                              : null}
                            {!v.is_delete
                              ? v.lastmsg?.txt_type === 'contact' && (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <Icon
                                      name="person"
                                      style={{
                                        fontSize: 20,
                                        color: 'grey',
                                        marginLeft: 8,
                                      }}
                                      type="MaterialIcons"
                                    />
                                    <Text
                                      style={[
                                        styles.PersonNameStyle1,
                                        {marginLeft: 4},
                                      ]}>
                                      Contact
                                    </Text>
                                  </View>
                                )
                              : null}
                          </View>
                          <View>
                            <Text
                              style={[styles.PersonNameStyle1, {marginTop: 0}]}>
                              {v.date == moment().format('DD-MM-YYYY')
                                ? v.time
                                : v.date}
                            </Text>
                            {v.unread !== '0' && (
                              <View
                                style={{
                                  backgroundColor: 'red',
                                  height: 24,
                                  width: 24,
                                  borderRadius: 12,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginTop: 8,
                                  alignSelf: 'flex-end',
                                  marginRight: '28%',
                                }}>
                                <Text style={{color: 'white'}}>{v.unread}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          borderBottomWidth: 1,
                          color: 'grey',
                        }}
                      />
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View>
                  {this.state.NoData ? (
                    <View
                      style={{
                        marginTop: resp(180),
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text style={{fontWeight: 'bold'}}>No Chat Found</Text>
                    </View>
                  ) : null}
                </View>
              )}
            </View>
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
              <Text style={styles.bottomInactiveTextStyleChart}>Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('ChatScreen');
              }}>
              <Image
                source={require('../images/chat__active_icon.png')}
                style={styles.StyleChatTab}
              />
              <Text style={styles.bottomActiveTextStyle}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('SettingScreen');
              }}>
              <Image
                source={require('../images/setting_inactive_icon.png')}
                style={styles.StyleSettingTab}
              />
              <Text style={styles.bottomInactiveTextStyle}>Setting</Text>
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
  inputViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#fff',
    width: '100%',
    marginTop: resp(20),
    alignContent: 'center',
    alignSelf: 'center',
  },
  MainContentBox: {
    flex: 1,
  },
  backButtonStyle1: {
    margin: 15,
    height: 20,
    width: 20,
  },
  moreMenuIcon: {
    height: 25,
    width: 30,
    resizeMode: 'contain',
  },
  input: {
    color: '#BEBEBE',
    width: resp(339),
    height: 50,
    fontSize: resp(14),
    alignSelf: 'flex-end',
  },
  row: {
    color: '#000',
    width: '100%',
    height: 100,
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
    elevation: 20,
  },

  bottomActiveTextStyle: {
    color: '#FB3954',
    fontSize: resp(10),
    marginTop: 5,
    textAlign: 'center',
  },

  bottomInactiveTextStyleChart: {
    color: '#887F82',
    fontSize: resp(10),
    marginTop: 3,
    marginLeft: 8,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
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
  Styleimage: {
    marginTop: 0,
    width: 60,
    height: 60,
    padding: 15,
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
  bottomVideoTextStyle: {
    color: '#887F82',
    fontSize: resp(8),
    marginRight: 10,
    marginTop: 3,
    textAlign: 'center',
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
  bottomNotificationTextStyle: {
    color: '#887F82',
    fontSize: resp(8),
    marginLeft: 10,
    marginTop: 3,
    textAlign: 'center',
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
  PersonNameStyle: {
    width: resp(100),
    height: resp(20),
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  PersonNameStyle1: {
    width: resp(100),
    height: resp(20),
    color: 'grey',
    marginLeft: 12,
  },
});
function mapStateToProps(state) {
  const {
    data: chatListData,
    success: chatlistsuccess,
    isLoading: loadingChatList,
    error: chatlisterror,
  } = state.ChatlistReducer;
  return {
    chatListData,
    chatlistsuccess,
    loadingChatList,
    chatlisterror,
    isConnected: state.network.isConnected,
  };
}
export default connect(mapStateToProps, {ChatlistAction})(ChatScreen);
