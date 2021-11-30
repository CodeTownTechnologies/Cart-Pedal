/* eslint-disable no-alert */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react-native/no-inline-styles */

import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  PermissionsAndroid,
  Dimensions,
  Modal,
  // Share,
  ScrollView,
  Platform,
} from 'react-native';
import resp from 'rn-responsive-font';
import CustomMenuIcon from './CustomMenuIcon';
import MenuIcon from './MenuIcon';
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import firebase from 'react-native-firebase';
import SeeMore from 'react-native-see-more-inline';
import {BackHandler} from 'react-native';
import Contacts from 'react-native-contacts';
import Spinner from 'react-native-loading-spinner-overlay';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob'
import {
  profileView,
  storiesAction,
  loggedStoriesAction,
  RecentDataAction,
  addStoryAction,
} from '../../redux/actions';
import {connect} from 'react-redux';
import {BASE_URL} from '../Component/ApiClient';
import {hp, wp} from '../Component/hightWidthRatio';
import {displayLocalNotification} from '../../PushNotification/DisplayLocalNotification';
import FastImage from 'react-native-fast-image';
import OfflineUserScreen from './OfflineUserScreen';
const width = Dimensions.get('screen').width;
console.disableYellowBox = true;

class DashBoardScreen extends Component {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    (this.RecentUpdateCall = this.RecentUpdateCall.bind(this)),
      (this.ProfileViewCall = this.ProfileViewCall.bind(this)),
      (this.state = {
        userName: '',
        baseUrl: `${BASE_URL}`,
        userId: '',
        spinner: false,
        userAccessToken: '',
        isStoryModalVisible: false,
        phonenumber: '',
        about: '',
        NoData: '',
        userProfileData: '',
        avatar: null,
        user_stories: '',
        fcmtoken: '',
        newContacts: '',
        stories: '',
        newImageArr: [],
        loggeduserstory_avatar: null,
        pickedImage: require('../images/default_user.png'),
        RecentUpdateProduct: '',
        callUpdate: false,
        defaultProfile:'https://miro.medium.com/max/790/1*reXbWdk_3cew69RuAUbVzg.png'
      });
  }

  showLoading() {
    this.setState({spinner: true});
  }

  hideLoading() {
    this.setState({spinner: false});
  }

  actionOnRow(item) {}

  actionOnViewProfile(item) {
    this.props.navigation.navigate('OpenForProfileScreen');
  }

  UNSAFE_componentWillMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  base64ImageConvetor=async(links,imagelink)=>{
    this.showLoading();
    RNFetchBlob.fetch('GET', `${imagelink}`)
    .then(resp => {
       
      let base64image = resp.data;
      this.onShare(links,'data:image/png;base64,' + base64image);
    })
    .catch(err =>console.log('error',err));
  }
  onShare = async (links,imagelink) => {
    try {
      let shareOptions = {
        title: 'GET Product',
        url: imagelink,
        message: `GET Products ${links}`,
      };
      this.hideLoading();
      const result=await Share.open(shareOptions);

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

  link = async (id, name,Imagelink) => {
    const link = new firebase.links.DynamicLink(
      `https://cartpedal.page.link?id=in.cartpedal&page=${name}&profileId=` +
        id,
      'https://cartpedal.page.link',
    ).android
      .setPackageName('in.cartpedal')
      .ios.setBundleId('com.ios.cartpadle')
      .ios.setAppStoreId('1539321365');
    firebase
      .links()
      .createShortDynamicLink(link)
      .then((url) => {
        this.base64ImageConvetor(url,Imagelink);
      });
  };

  forwardlink = async (userid, name,Imagelink) => {
    const link = new firebase.links.DynamicLink(
      `https://cartpedal.page.link?id=in.cartpedal&page=${name}&profileId=${userid}`,
      'https://cartpedal.page.link',
    ).android
      .setPackageName('in.cartpedal')
      .ios.setBundleId('com.ios.cartpadle')
      .ios.setAppStoreId('1539321365');

    firebase
      .links()
      .createShortDynamicLink(link)
      .then((url) => {
        this.props.navigation.navigate('ForwardLinkScreen', {
          fcmToken: this.state.fcmtoken,
          PhoneNumber: this.state.phonenumber,
          userId: this.state.userId,
          userAccessToken: this.state.userAccessToken,
          msgids: `${url}?&li=${Imagelink}`,
        });
      });
  };

  componentWillUnmount() {
    this.listener1();
    this.listener2();
    this.listener3();
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
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

  async requestReadContactsPermission() {
    try {
      const granted = await request(
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.READ_CONTACTS
          : PERMISSIONS.IOS.CONTACTS,
      );
      if (granted === RESULTS.GRANTED) {
        let newArr = [];
        let phoneName = [];
        let sortData;
        Contacts.getAll().then((contacts) => {
          contacts.map((item) => {
            if (
              item.phoneNumbers !== undefined &&
              item.phoneNumbers.length > 0
            ) {
              let obj = {
                phoneNumber: item.phoneNumbers[0].number,
                name: item.givenName + ' ' + item.familyName,
              };
              newArr.push(item.phoneNumbers[0].number);
              phoneName.push(obj);
              sortData = phoneName.sort((a, b) => a.name.localeCompare(b.name));
            }
          });
          this.setState({newContacts: newArr.join(',')});
          this.ContactListall(sortData);
          this.setState({phonenumber: sortData});
          AsyncStorage.setItem('@Phonecontacts', JSON.stringify(sortData));
        });
      } else {
        this.setState({newContacts: ''});
        this.ContactListall([]);
        this.setState({phonenumber: []});
        AsyncStorage.setItem('@Phonecontacts', JSON.stringify([]));
      }
    } catch (err) {
      this.setState({newContacts: ''});
      this.ContactListall([]);
      this.setState({phonenumber: []});
      AsyncStorage.setItem('@Phonecontacts', JSON.stringify([]));
    }
  }

  blockuser = (block_id) => {
    this.showLoading();
    let id = this.state.userId;
    let formData = new FormData();

    formData.append('user_id', id);
    formData.append('block_id', block_id);
    formData.append('type', 0);

    var fav = `${BASE_URL}api-user/block-fav-user`;
    fetch(fav, {
      method: 'Post',
      headers: new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '1111',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      }),
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          // eslint-disable-next-line no-alert
          alert('User is blocked successfully');
          this.ContactListall(this.state.phonenumber);
        } else {
          this.hideLoading();
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .finally(() => this.setState({spinner: false}))
      .done();
  };

  ContactListall(contacts) {
    var EditProfileUrl = `${BASE_URL}api-product/contact-list`;
    fetch(EditProfileUrl, {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: JSON.stringify({
        user_id: this.state.userId,
        type: 0,
        lfor: 0,
        contacts: contacts,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log('contact lusr',responseData);
        if (responseData.code == '200') { 
          let cartPadleContact = [];
          responseData.data.appcontact.map((item) => {
            cartPadleContact.push(item.mobile);
          });
          let commaNumber = cartPadleContact.join(',');
          this.setState({appContacts: cartPadleContact.join(',')});
          this.RecentUpdateCall(commaNumber);
        }
      })
      .catch((error) => {

        console.log('error',error);
        this.hideLoading();
      })
      .finally(() => this.setState({spinner: false}))
      .done();
  }
  requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'App Premission',
          message: 'Chat x App need permission.',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      } else {
      }
    } catch (err) {}
  };

  componentDidMount = async () => {
    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.requestReadContactsPermission();
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
          this.setState({userAccessToken: accessToken}, () => {
            this.showLoading();
            this.ProfileViewCall();
            this.userStories();
            this.loggedUserstory();
          });
        }
      });
    });

    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      firebase.notifications().removeAllDeliveredNotifications();
      const {
        groupid,
        fromid,
        name,
        mobile,
        avatar,
        about,
        msg_type,
        groupname,
        groupavatar,
        member,
        type,
      } = notificationOpen.notification.data;
      if (type === '') {
        this.props.navigation.navigate('ChatDetailScreen', {
          userid: groupid != '0' ? groupid : fromid,
          username: groupname != '' ? groupname : name,
          useravatar: groupavatar != '' ? groupavatar : avatar,
          userabout: about,
          userphone: mobile,
          msg_type: msg_type,
          groupId: groupid != '0' ? groupid : fromid,
          groupexit: false,
          membersCount: !member || member == '' ? 2 : member.split(',').length,
        });
      } else {
        const {
          fromid,
          toid,
          avatar,
          type,
          token,
          channelName,
          calltype,
        } = notificationOpen.notification.data;
        if (type == '0') {
          let screen = null;
          if (calltype == '1') {
            screen = 'VideoCallScreen';
          }
          if (calltype == '0') {
            screen = 'VoiceCallScreen';
          }
          this.props.navigation.navigate(screen, {
            fromid,
            toid,
            useravatar: avatar,
            token,
            channel: channelName,
            calling: false,
            receiving: true,
          });
        }
      }
    }

    this.listener1 = firebase.notifications().onNotification((notification) => {
      if (notification.data.type === '') {
        if (
          this.props.chatting &&
          (notification.data.fromid == this.props.chattingUserId ||
            notification.data.groupid == this.props.chattingUserId)
        ) {
        } else {
          displayLocalNotification(notification);
        }
      } else {
        const {
          fromid,
          toid,
          avatar,
          type,
          token,
          channelName,
          calltype,
        } = notification.data;
        if (type == '0') {
          let screen = null;
          if (calltype == '1') {
            screen = 'VideoCallScreen';
          }
          if (calltype == '0') {
            screen = 'VoiceCallScreen';
          }
          this.props.navigation.navigate(screen, {
            fromid,
            toid,
            useravatar: avatar,
            token,
            channel: channelName,
            calling: false,
            receiving: true,
          });
        }
      }
    });

    this.listener2 = firebase.messaging().onMessage((m) => {
      if (m.data.type === '') {
        if (
          this.props.chatting &&
          (m.data.fromid == this.props.chattingUserId ||
            m.data.groupid == this.props.chattingUserId)
        ) {
        } else {
          displayLocalNotification(m.data);
        }
      } else {
        const {
          fromid,
          toid,
          avatar,
          type,
          token,
          channelName,
          calltype,
        } = m.data;
        if (type == '0') {
          let screen = null;
          if (calltype == '1') {
            screen = 'VideoCallScreen';
          }
          if (calltype == '0') {
            screen = 'VoiceCallScreen';
          }
          this.props.navigation.navigate(screen, {
            fromid,
            toid,
            useravatar: avatar,
            token,
            channel: channelName,
            calling: false,
            receiving: true,
          });
        }
      }
    });

    this.listener3 = firebase
      .notifications()
      .onNotificationOpened(async (m) => {
        firebase.notifications().removeAllDeliveredNotifications();
        const {
          fromid,
          name,
          mobile,
          avatar,
          about,
          msg_type,
          groupid,
          groupname,
          groupavatar,
          member,
          type,
        } = m.notification.data;
        if (type === '') {
          this.props.navigation.navigate('ChatDetailScreen', {
            userid: groupid != '0' ? groupid : fromid,
            username: groupname != '' ? groupname : name,
            useravatar: groupavatar != '' ? groupavatar : avatar,
            userabout: about,
            userphone: mobile,
            msg_type: msg_type,
            groupId: groupid != '0' ? groupid : fromid,
            groupexit: false,
            membersCount:
              !member || member == '' ? 2 : member.split(',').length,
          });
        } else {
          const {
            fromid,
            toid,
            avatar,
            type,
            token,
            channelName,
            calltype,
          } = m.notification.data;
          if (type == '0') {
            let screen = null;
            if (calltype == '1') {
              screen = 'VideoCallScreen';
            }
            if (calltype == '0') {
              screen = 'VoiceCallScreen';
            }
            this.props.navigation.navigate(screen, {
              fromid,
              toid,
              useravatar: avatar,
              token,
              channel: channelName,
              calling: false,
              receiving: true,
            });
          }
        }
      });
  };

  customButton = () => {
    this.setState({isStoryModalVisible: false});
    if (this.state.stories) {
      if (this.state.loggeduserstory_avatar == null) {
        const itemImage1 = null;
        this.props.navigation.navigate('UserStoryPage', {
          images: itemImage1,
          storyImages: this.state.stories,
          name: this.state.userStoryName,
        });
      } else {
        const itemImage = this.state.loggeduserstory_avatar;
        this.props.navigation.navigate('UserStoryPage', {
          images: itemImage,
          storyImages: this.state.stories,
          name: this.state.userStoryName,
        });
      }
    } else {
      alert('No story available');
    }
  };

  customButton = () => {
    this.setState({isStoryModalVisible: false});
    if (JSON.stringify(this.props.loggedStoriesData) != JSON.stringify({})) {
      if (this.props.loggedStoriesData.data[0].stories != JSON.stringify({})) {
        if (this.state.loggeduserstory_avatar == null) {
          const itemImage1 = null;
          this.props.navigation.navigate('UserStoryPage', {
            images: itemImage1,
            storyImages: this.props.loggedStoriesData.data[0].stories,
            name: this.state.userName,
          });
        } else {
          const itemImage = this.state.loggeduserstory_avatar;
          this.props.navigation.navigate('UserStoryPage', {
            images: itemImage,
            storyImages: this.props.loggedStoriesData.data[0].stories,
            name: this.state.userName,
          });
        }
      }
    } else {
      alert('No story available');
    }
  };

  sendMessage = (UrlLink, userID) => {
    var raw = JSON.stringify({
      user_id: this.state.userId,
      toid: userID,
      msg_type: 'text',
      body: UrlLink,
      reply_id: '0',
      upload: [],
    });
    fetch(`${BASE_URL}api-message/sent-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: raw,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code === 200) {
          alert('forward link has been sent');
        }
      })

      .catch((error) => {});
  };
  addStoryApi = (data) => {
    this.setState({addstoryload: true}, () => {
      this.props.addStoryAction(
        this.state.userId,
        this.state.userAccessToken,
        data,
      );
    });
  };

  ListEmpty = () => {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{marginTop: 120}}>No Data Found</Text>
      </View>
    );
  };

  logout = () => {
    fetch(`${BASE_URL}api-user/logout?user_id=${this.state.userId}`, {
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

  RecentUpdateCall(newContacts) {
    this.setState({callUpdate: true}, () => {
      this.props.RecentDataAction(
        this.state.userId,
        this.state.userAccessToken,
        newContacts,
      );
    });
  }

  loggedUserstory = () => {
    this.props.loggedStoriesAction(
      this.state.userId,
      this.state.userAccessToken,
    );
  };

  userStories = () => {
    this.props.storiesAction(this.state.userId, this.state.userAccessToken);
  };

  componentDidUpdate() {
    if (this.props.addStorySuccess && this.state.addstoryload) {
      this.setState({addstoryload: false}, () => {
        this.props.loggedStoriesAction(
          this.state.userId,
          this.state.userAccessToken,
        );
        this.hideLoading();
      });
    }
    if (this.props.recenterror && this.state.callUpdate) {
      this.setState({callUpdate: false, NoData: true}, () => {
        this.hideLoading();
      });
    }
    if (this.props.recentDataSuccess && this.state.callUpdate) {
      this.setState({callUpdate: false, spinner: false});
    }
  }

  ProfileViewCall = () => {
    var urlprofile =
      `${BASE_URL}api-user/view-profile?user_id=` + this.state.userId;
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
          if (responseData.data.name !== null) {
            this.setState({userName: responseData.data.name});
          }
          if (responseData.data.avatar == null) {
            this.setState({avatar: null, loggeduserstory_avatar: null});
          } else {
            this.setState({
              avatar: responseData.data.avatar,
              loggeduserstory_avatar: responseData.data.avatar,
            });
          }
          if (responseData.data.about !== null) {
            this.setState({about: responseData.data.about});
          }
        }
      })
      .catch((error) => {
        console.log(error, 'ERROR');
      })
      .finally(() => this.setState({spinner: false}))
      .done();
  };
  _renderTruncatedFooter = (handlePress) => {
    return (
      <Text style={{color: 'red', marginTop: 5}} onPress={handlePress}>
        Read more
      </Text>
    );
  };
  _renderRevealedFooter = (handlePress) => {
    return (
      <Text style={{color: 'red', marginTop: 5}} onPress={handlePress}>
        Show less
      </Text>
    );
  };

  openStoryModal() {
    this.setState({isStoryModalVisible: !this.state.isStoryModalVisible});
  }

  closeProfileModal = () => {
    this.setState({isStoryModalVisible: false});
  };

  openImageGallery() {
    ImagePicker.openPicker({
      mediaType: "video",
    }).then((image) => {
      this.setState({isStoryModalVisible: !this.state.isStoryModalVisible});
      this.onImagePick(image);
    });
  }
  onImagePick(response) {
    this.showLoading();
    let imgOjc = {
      path: response.path,
      type: response.mime,
      data: response.data,
      fileName: response.modificationDate,
    };
    let imageArray = [];
    imageArray.push(imgOjc);
    this.addStoryApi(imageArray);
  }

  openCamara() {
    ImagePicker.openCamera({
      cropping: true,
      includeBase64: true,
    }).then((image) => {
      this.setState({isStoryModalVisible: !this.state.isStoryModalVisible});
      this.onImagePick(image);
    });
  }

  SendReportIssue() {
    let formData = new FormData();
    formData.append('user_id', this.state.userId);
    formData.append('reason', 'Report post');
    formData.append('message', 'Something went wrong with this post');
    var otpUrl = `${BASE_URL}api-user/report-problem`;
    fetch(otpUrl, {
      method: 'Post',
      headers: {
        'Content-Type': 'multipart/form-data',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
        } else {
        }
      })
      .catch((error) => {})
      .finally(() => this.setState({spinner: false}))
      .done();
  }
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
          <View style={styles.BackButtonContainer}></View>
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
        <Modal
          animationType="slide"
          transparent={true}
          useNativeDriver={true}
          visible={this.state.isStoryModalVisible}
          onRequestClose={() => this.closeProfileModal()}>
          <View style={styles.centeredView}>
            <View style={styles.ProfilemodalViewStyle}>
              <TouchableOpacity
                style={{alignSelf: 'flex-end'}}
                onPress={() => {
                  this.closeProfileModal();
                }}>
                <Image
                  source={require('../images/modal_close.png')}
                  style={styles.CloseButtonStyle}
                />
              </TouchableOpacity>
              <Text style={styles.TitleProfileModalStyle}>Choice Option</Text>
              <TouchableOpacity
                onPress={() => {
                  this.openCamara();
                }}>
                <Text style={styles.OptionsProfileModalStyle}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  this.openImageGallery();
                }}>
                <Text style={styles.Options2ProfileModalStyle}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  this.customButton();
                }}>
                <Text style={styles.Options2ProfileModalStyle}>View Story</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={styles.MainContentBox}>
          <ScrollView>
            <View style={styles.hairline} />
            <View style={{flex: 1, flexDirection: 'row'}}>
              <TouchableOpacity
                style={styles.storyItemBox}
                onPress={() => this.openStoryModal()}>
                <Image
                  source={
                    this.state.loggeduserstory_avatar != null
                      ? {uri: this.state.loggeduserstory_avatar}
                      : this.state.pickedImage
                  }
                  style={styles.ImageViewStyle}
                />
                <Image
                  source={require('../images/status_add_icon.png')}
                  style={styles.StatusAddStyle}
                />
                <Text style={styles.storyTextView}>Your Story</Text>
              </TouchableOpacity>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{flex: 1, flexDirection: 'row'}}
                data={this.props.storiesData}
                // data={[]}
                keyExtractor={(item, index) => {
                  return item.id.toString();
                }}
                renderItem={({item, index}) => {
                  return (
                    <View>
                      <TouchableOpacity
                        style={styles.storyItemBox}
                        onPress={() => {
                          this.props.navigation.navigate('StoryViewScreen', {
                            position: index,
                            images: item.avatar,
                            storyImages: item.stories,
                            name: item.name,
                            userid: item.id,
                            storyArray: this.props.storiesData,
                          });
                        }}>
                        <FastImage
                          source={
                            item.avatar == null
                              ? this.state.pickedImage
                              : {uri: item.avatar}
                          }
                          style={[
                            styles.ImageViewStyleStory,
                            {
                              borderColor:
                                item.stories[0].viewer == 1
                                  ? '#06BE7E'
                                  : '#F01738',
                            },
                          ]}
                        />
                        <Text style={styles.storyTextView}>
                          {item.name.length > 8
                            ? item.name.substring(0, 8) + '..'
                            : item.name}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            </View>
            <View style={styles.hairline} />
            <View style={styles.Profile2Container}>
              <View style={styles.Profile2ImageContainer}>
                <TouchableOpacity
                  onPress={() => {
                    this.props.navigation.navigate('ProfileScreen');
                  }}>
                  <Image
                    source={
                      this.state.avatar != null
                        ? {uri: this.state.avatar}
                        : this.state.pickedImage
                    }
                    style={styles.Profile2ImageViewStyle}
                  />
                  <Image
                    source={require('../images/status_add_largeicon.png')}
                    style={styles.StatusAddLargeStyle}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.Profile2InfoContainer}
                onPress={() => {
                  this.props.navigation.navigate('ProfileScreen');
                }}>
                <Text style={styles.PersonNameStyle}>
                  {this.state.userName}
                </Text>
                <View style={{width: width * 0.7}}>
                  {this.state.about != '' ? (
                    <SeeMore
                      style={styles.ProfileDescription}
                      numberOfLines={3}
                      linkColor="red"
                      seeMoreText="read more"
                      seeLessText="read less">
                      {this.state.about}
                    </SeeMore>
                  ) : null}
                </View>
              </TouchableOpacity>
              <View style={styles.RiyaMenuContainer}>
                <TouchableOpacity
                  style={styles.openButtonContainer}
                  onPress={() => {
                    this.props.navigation.navigate('ProfileScreen');
                  }}>
                  <Text style={styles.openButtonStyle}>Open</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                  <CustomMenuIcon
                    menutext="Menu"
                    textStyle={{
                      color: 'white',
                    }}
                    option1Click={() => {
                      let name = 'OpenForProfileScreen';
                      let image;
                      this.state.avatar != null
                      ? image= this.state.avatar
                      : image=this.state.defaultProfile
                      this.link(this.state.userId, name,image);
                    }}
                    option2Click={() => {
                      let name = 'OpenForProfileScreen';
                      this.forwardlink(this.state.userId, name);
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.RecentViewStyle}>
              <Text style={styles.RecentTextStyle}>RECENT UPDATES</Text>
            </View>
            <FlatList
              style={{flex: 1}}
              data={
                JSON.stringify(this.props.recentData) != JSON.stringify({})
                  ? this.props.recentData
                  : []
              }
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      this.props.navigation.navigate('OpenForProfileScreen', {
                        id: item.id,
                        name: item.name,
                      });
                    }}
                    style={styles.itemBox}>
                    <View style={styles.box}>
                      <View style={styles.ProfileImageContainer}>
                        <TouchableOpacity>
                          <Image
                            source={
                              item.avatar == null
                                ? this.state.pickedImage
                                : {uri: item.avatar}
                            }
                            style={styles.ProfileImageViewStyle}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.ProfileInfoContainer}>
                        <Text style={styles.PersonNameStyle}>{item.name}</Text>
                        <View
                          style={{marginLeft: resp(0), width: width * 0.75}}>
                          {item.about ? (
                            <SeeMore
                              style={styles.ProfileDescription}
                              numberOfLines={2}
                              linkColor="red"
                              seeMoreText="read more"
                              seeLessText="read less">
                              {item.about.substring(0, 50) + '..'}
                            </SeeMore>
                          ) : null}
                        </View>
                      </View>
                      <View style={styles.ListMenuContainer}>
                        <TouchableOpacity
                          style={styles.messageButtonContainer}
                          onPress={() => {
                            this.props.navigation.navigate('ChatDetailScreen', {
                              userid: item.id,
                              username: item.name,
                              userabout: item.about,
                              useravatar: item.avatar,
                              groupexit: false,
                              groupId: '0',
                              msg_type: '0',
                              userphone: item.mobile,
                              membersCount: 1,
                            });
                          }}>
                          <Image
                            source={require('../images/message_icon.png')}
                            style={styles.messageButtonStyle}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.ViewButtonContainer}
                          onPress={() => {
                            this.props.navigation.navigate(
                              'OpenForProfileScreen',
                              {id: item.id, name: item.name},
                            );
                          }}>
                          <Text style={styles.viewButtonStyle}>
                            {'View All'}
                          </Text>
                        </TouchableOpacity>
                        <MenuIcon
                          menutext="Menu"
                          menustyle={{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                          }}
                          textStyle={{
                            color: 'white',
                          }}
                          option1Click={() => {
                            this.blockuser(item.id);
                          }}
                          option2Click={() => {
                            let name = 'OpenForProfileScreen';
                            this.link(item.id, name,item.products[0].image);
                          }}
                          option3Click={() => {
                            let name = 'OpenForProfileScreen';
                            this.forwardlink(item.id, name,item.products[0].image);
                          }}
                          option4Click={() => {
                            this.SendReportIssue();
                          }}
                        />
                      </View>
                    </View>
                    <ScrollView
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}>
                      <View style={styles.columnView}>
                        <View style={styles.ImageContainer}>
                          <FastImage
                            source={
                              item.products[0].image
                                ? {uri: item.products[0].image}
                                : null
                            }
                            style={styles.Image2Container}
                          />
                          {/* <Image
                            source={
                              item.products[0].image
                                ? {uri: item.products[0].image}
                                : null
                            }
                            style={styles.Image2Container}
                          /> */}
                          <Text style={styles.itemNameStyle}>
                            {item.products[0].name}
                          </Text>
                          <Text style={styles.itemPriceStyle}>
                            {'\u20B9'}
                            {item.products[0].price}
                          </Text>
                        </View>
                        {item.products[1] ? (
                          <View style={styles.ImageContainer2}>
                            {/* <Image
                              source={
                                item.products[1].image
                                  ? {uri: item.products[1].image}
                                  : null
                              }
                              style={styles.Image2Container}
                            /> */}
                            <FastImage
                              source={
                                item.products[1].image
                                  ? {uri: item.products[1].image}
                                  : null
                              }
                              style={styles.Image2Container}
                            />
                            <Text style={styles.itemNameStyle}>
                              {item.products[1].name}
                            </Text>
                            <Text style={styles.itemPriceStyle}>
                              {'\u20B9'}
                              {item.products[1].price}
                            </Text>
                          </View>
                        ) : null}
                        {item.products[2] ? (
                          <View style={styles.ImageContainer2}>
                            {/* <Image
                              source={
                                item.products[2].image
                                  ? {uri: item.products[2].image}
                                  : null
                              }
                              style={styles.Image2Container}
                            /> */}
                            <FastImage
                              source={
                                item.products[2].image
                                  ? {uri: item.products[2].image}
                                  : null
                              }
                              style={styles.Image2Container}
                            />
                            <Text style={styles.itemNameStyle}>
                              {item.products[2].name}
                            </Text>
                            <Text style={styles.itemPriceStyle}>
                              {'\u20B9'}
                              {item.products[2].price}
                            </Text>
                          </View>
                        ) : null}
                        {item.products[3] ? (
                          <View style={styles.ImageContainer2}>
                            {/* <Image
                              source={
                                item.products[3].image
                                  ? {uri: item.products[3].image}
                                  : null
                              }
                              style={styles.Image2Container}
                            /> */}
                            <FastImage
                              source={
                                item.products[3].image
                                  ? {uri: item.products[3].image}
                                  : null
                              }
                              style={styles.Image2Container}
                            />
                            <Text style={styles.itemNameStyle}>
                              {item.products[3].name}
                            </Text>
                            <Text style={styles.itemPriceStyle}>
                              {'\u20B9'}
                              {item.products[3].price}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.hairline} />
                    </ScrollView>

                    <View style={styles.hairline} />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={this.ListEmpty}
            />
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
                source={require('../images/home_active_icon.png')}
                style={styles.StyleHomeTab}
              />

              <Text style={styles.bottomActiveTextStyle}>Home</Text>
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
    backgroundColor: '#fff',
  },
  Profile2Container: {
    color: '#fff',
    flexDirection: 'row',
  },
  PersonNameStyle: {
    marginTop: resp(5),
    width: resp(100),
    height: resp(20),
    color: '#000',
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  ProfileDescription: {
    marginTop: 5,

    width: resp(200),
    height: resp(50),
    color: '#7F7F7F',
    fontSize: resp(12),
  },
  Profile2ImageContainer: {
    marginTop: hp(10),
    marginLeft: wp(5),
    flexDirection: 'column',
    flex: 0.2,
    width: resp(70),
    height: resp(70),
  },
  ProfileImageContainer: {
    marginTop: hp(10),
    marginLeft: wp(5),
    flexDirection: 'column',
    flex: 0.2,
    width: wp(70),
    height: hp(70),
  },
  box: {
    marginTop: 5,
    width: resp(415),
    height: resp(75),
    backgroundColor: 'white',
    flexDirection: 'row',
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 2,
      width: 5,
    },
    elevation: 0,
  },
  itemBox: {
    height: hp(290),
    backgroundColor: 'white',
    flexDirection: 'column',
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 1,
      width: 5,
    },
    elevation: 0,
  },
  Profile2ImageViewStyle: {
    width: resp(70),
    height: resp(70),

    borderRadius: resp(10),
  },
  ProfileImageViewStyle: {
    width: wp(50),
    height: hp(50),
    borderRadius: resp(8),
  },
  RecentViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: resp(2),
    height: resp(25),
    backgroundColor: '#F1F0F2',
    width: '100%',
  },
  RecentTextStyle: {
    fontSize: resp(12),
    marginTop: resp(30),
    marginLeft: resp(10),
    height: resp(50),
    color: '#8E8E8E',
  },
  spinnerTextStyle: {
    color: '#F01738',
  },
  Options2ProfileModalStyle: {
    alignContent: 'flex-start',
    marginTop: resp(5),
    color: '#000',
    marginBottom: 10,
    width: resp(207),
    fontSize: resp(16),
  },
  margintop: {
    marginTop: '10',
  },
  ImageViewStyle: {
    margin: resp(6),
    width: resp(55),
    height: resp(55),
    borderWidth: 2,
    borderRadius: 5,
    borderColor: '#F01738',
  },
  ImageViewStyleStory: {
    margin: resp(6),
    width: resp(55),
    height: resp(55),
    borderWidth: 2,
    borderRadius: 5,
  },
  hairline: {
    backgroundColor: '#C8C7CC80',
    height: 2,
    width: '100%',
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
  TitleProfileModalStyle: {
    alignContent: 'flex-start',
    fontWeight: 'bold',
    color: '#000',

    width: resp(207),
    fontSize: resp(16),
  },
  backButtonStyle: {
    margin: 10,
    height: 20,
    width: 80,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
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
  CloseButtonStyle: {
    alignSelf: 'flex-end',
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
  ProfilemodalViewStyle: {
    width: 300,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  bottomActiveTextStyle: {
    color: '#FB3954',
    fontSize: resp(10),
    marginTop: 5,
    textAlign: 'center',
  },

  Image2Container: {
    flexDirection: 'column',
    width: wp(90),
    height: hp(130),
    backgroundColor: 'white',
    marginTop: hp(5),
    borderRadius: resp(5),
  },
  ImageContainer: {
    marginTop: resp(-8),
    flexDirection: 'column',
    width: wp(90),
    height: hp(180),
    backgroundColor: 'white',
    marginRight: resp(3),
    marginBottom: resp(10),
    marginLeft: resp(2),
    borderRadius: resp(5),
  },
  ImageContainer2: {
    marginTop: resp(-8),
    flexDirection: 'column',
    width: wp(90),
    height: hp(180),
    backgroundColor: 'white',
    marginRight: resp(3),
    marginBottom: resp(10),
    borderRadius: resp(5),
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
  OptionsProfileModalStyle: {
    alignContent: 'flex-start',
    marginTop: resp(10),
    color: '#000',
    width: resp(207),
    marginBottom: 10,
    fontSize: resp(16),
  },
  StyleHomeTab: {
    marginTop: resp(5),
    width: resp(30),
    height: resp(28),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  StatusAddStyle: {
    width: resp(20),
    height: resp(20),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: resp(15),
    left: resp(3),
    marginLeft: resp(45),
  },
  StatusAddLargeStyle: {
    marginTop: resp(0),
    marginLeft: resp(50),
    width: resp(25),
    height: resp(25),
    position: 'absolute',
    bottom: resp(-2),
  },
  Profile2InfoContainer: {
    color: '#fff',
    marginTop: resp(8),
    flexDirection: 'column',
    backgroundColor: 'white',
    flex: 0.6,
    width: resp(70),
    height: resp(70),
  },
  ProfileInfoContainer: {
    backgroundColor: 'white',
    marginTop: hp(15),
    flexDirection: 'column',
    flex: 0.7,
    width: wp(70),
    height: hp(50),
  },
  sliderMenuContainer: {
    marginTop: resp(20),
    marginRight: resp(-15),
    position: 'absolute',
    top: 0,
    right: 0,
    width: resp(28),
    height: resp(28),
    borderRadius: resp(20),
    backgroundColor: '#9da1a3',
  },
  RiyaMenuContainer: {
    flex: 0.22,
    marginTop: resp(5),
    flexDirection: 'row',
  },

  ListMenuContainer: {
    marginTop: resp(20),
    flexDirection: 'row',
    flex: 0.47,
    alignContent: 'flex-end',
    justifyContent: 'center',
    width: resp(0),
    height: resp(45),
  },
  openButtonStyle: {
    color: '#06BE7E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: resp(10),
    fontSize: resp(14),
  },
  viewButtonStyle: {
    color: '#000',
    marginRight: resp(-20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: resp(4),
  },

  openButtonContainer: {
    marginRight: 0,
    width: resp(55),
    height: resp(24),
    borderRadius: resp(20),
    backgroundColor: '#e6f7f2',
  },
  messageButtonContainer: {
    marginTop: resp(2),
    width: resp(20),
    height: resp(20),
    borderRadius: resp(50),
    backgroundColor: '#ebced7',
  },
  messageButtonStyle: {
    marginTop: resp(5),
    width: resp(9),
    height: resp(9),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ViewButtonContainer: {
    width: resp(60),
    height: resp(24),
    backgroundColor: '#fff',
  },

  StyleOpenForPublicTab: {
    marginTop: resp(11),
    marginRight: resp(10),
    width: resp(38),
    height: resp(23),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleChartTab: {
    marginTop: resp(9),
    width: resp(30),
    height: resp(30),
    marginLeft: resp(10),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },

  StyleChatTab: {
    marginTop: resp(9),
    width: resp(30),
    height: resp(30),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  StyleSettingTab: {
    marginTop: resp(9),
    width: resp(30),
    height: resp(30),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabStyle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: resp(60),
    elevation: resp(20),
    shadowColor: 'grey',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: resp(0),
  },
  columnView: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonStyle: {
    flex: 0.25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  storyTextView: {
    color: '#887F82',
    fontSize: resp(10),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  itemNameStyle: {
    color: '#887F82',
    width: '100%',
    marginLeft: resp(7),
    fontSize: resp(10),
  },
  itemPriceStyle: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: resp(7),
    fontSize: resp(13),
  },
});

function mapStateToProps(state) {
  const {isLoading, data, success} = state.signinReducer;
  const {data: storiesData, success: storiesSuccess} = state.storiesReducer;
  const {
    data: loggedStoriesData,
    success: loggedStoriesSuccess,
  } = state.loggedStoriesReducer;
  const {
    data: recentData,
    success: recentDataSuccess,
    isLoading: loadingRecentData,
    error: recenterror,
  } = state.RecentDataReducer;
  const {success: addStorySuccess} = state.addStoryReducer;
  const {chatting, chattingUserId} = state.ChatlistReducer;
  const {isConnected} = state.network;
  return {
    isLoading,
    data,
    success,
    storiesData,
    loadingRecentData,
    recenterror,
    storiesSuccess,
    loggedStoriesData,
    loggedStoriesSuccess,
    recentData,
    recentDataSuccess,
    addStorySuccess,
    chatting,
    chattingUserId,
    isConnected,
  };
}

export default connect(mapStateToProps, {
  profileView,
  storiesAction,
  loggedStoriesAction,
  RecentDataAction,
  addStoryAction,
})(DashBoardScreen);
