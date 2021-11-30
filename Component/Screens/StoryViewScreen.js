/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-alert */
import React, {Component} from 'react';
console.disableYellowBox = true;

import {
  StyleSheet,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import resp from 'rn-responsive-font';
import {SliderBox} from 'react-native-image-slider-box';
import moment from 'moment';
import DocumentPicker from 'react-native-document-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {DocumentDirectoryPath, readFile} from 'react-native-fs';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-community/async-storage';
import {Icon} from 'native-base';
import {BASE_URL} from '../Component/ApiClient';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
const audioRecorderPlayer = new AudioRecorderPlayer();
import {
  locationPermission,
  recordingPermissions,
} from '../Component/Permissions';
class StoryViewScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: '',
      avatar: null,
      userId: '',
      imageshow: true,
      fcmtoken: '',
      userAccessToken: '',
      ReplyMessage: '',
      message: '',
      height: 40,
      open: false,
      position: '',
      storyid: '',
      ownUserID: '',
      imageView: '',
      storyLength: '',
      leftcount: 1,
      defaultavatar: require('../images/default_user.png'),
      images: '',
      visibleReply: true,
      nameStory: '',
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmtoken: JSON.parse(token)});
        let storyArr = this.props.route.params.storyArray;
        let position = this.props.route.params.position;
        this.setState({position: position});
        this.setState({storyLength: storyArr.length});
      }
    });
    AsyncStorage.getItem('@user_id').then((userId) => {
      if (userId) {
        this.setState({userId: userId});
        console.log('Edit user id Dhasbord ====' + this.state.userId);
        this.storyData();
      }
    });
    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        this.setState({userAccessToken: accessToken});

        this.viewStory();
      }
    });
  }
  storyData = () => {
    let item = this.props.route.params.storyArray[this.state.position].avatar;
    this.setState({avatar: item});
    let name = this.props.route.params.storyArray[this.state.position].name;
    this.setState({nameStory: name});
    let imageArr = [];
    let storyID;
    let time;
    let storyImage = this.props.route.params.storyArray[this.state.position]
      .stories;
    storyID = storyImage[0].stid;
    storyImage.map((item) => {
      imageArr.push(item.image);
      time = item.time;
    });
    this.setState({storyid: storyID});
    this.setState({images: imageArr});
    let timeID = moment(time * 1000).fromNow();
    this.setState({currentTime: timeID});
  };

  onChangeText = (text) => {
    this.setState({message: text});
  };

  sendMessage = () => {
    this.setState({message: '', height: 40});
    var raw = JSON.stringify({
      user_id: this.state.userId,
      type: '0',
      toid: this.props.route.params.userid,
      msg_type: 'text',
      body: this.state.message,
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
          this.setState({visibleReply: true});
        } else {
          console.log('logged user stories' + JSON.stringify(responseData));
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  selectOneFile1 = () => {
    try {
      const res = DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
      }).then(async (data) => {
        const base64 = await readFile(data.uri, 'base64');
        const newData = {
          path: `${data.uri}.${data.type.split[1]}`,
          data: base64,
        };
        this.sendAudio(newData);
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
  };

  uploadFileApi = (datas) => {
    let type = '0';
    this.setState({open: false});
    var data = {
      user_id: this.state.userId,
      toid: this.props.route.params.userid,
      msg_type: 'file',
      reply_id: 0,
      type: type,
      body: datas.type,
      upload: [
        {
          path: `${datas.path}.${datas.type.split('/')[1]}`,
          caption: '',
          data: datas.data,
        },
      ],
    };

    fetch(`${BASE_URL}api-message/sent-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        device_id: '1234',
        device_token: '1111',
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code === 200) {
          alert('Message sent succesfully');
        } else {
          console.log('logged user stories' + JSON.stringify(responseData));
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  selectOneFile = () => {
    try {
      const res = DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      }).then(async (data) => {
        this.setState({open: false});
        const base64string = await readFile(data.uri, 'base64');
        const newData = {
          path: data.uri,
          data: base64string,
          type: data.type,
        };
        this.uploadFileApi(newData);
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        alert('Canceled from single doc picker');
      } else {
        throw err;
      }
    }
  };

  locationPicker = async () => {
    try {
      this.setState({open: false});
      await locationPermission();
      Geolocation.getCurrentPosition(
        (info) => {
          const location = {
            latitude: info.coords.latitude,
            longitude: info.coords.longitude,
          };
          this.sendLocation(location);
        },
        (err) => {
          alert(err.message);
        },
        {enableHighAccuracy: false, timeout: 20000, maximumAge: 10000},
      );
    } catch (error) {
      console.log(error, 'I am here ');
    }
  };

  sendContact = (contact) => {
    let type;
    if (this.props.route.params.groupId !== 0) {
      type = '1';
    } else {
      type = '0';
    }
    this.setState({open: false});
    var raw = JSON.stringify({
      user_id: this.state.userId,
      toid: this.props.route.params.userid,
      msg_type: 'contact',
      type: type,
      body: JSON.stringify(contact),
      reply_id: '0',
      upload: [],
    });
    fetch(`${BASE_URL}api-message/sent-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        device_id: '1234',
        device_token: this.state.fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: raw,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code === 200) {
          this.getConversationList();
        } else {
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  contactPicker = async () => {
    this.setState({open: false});
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    ).then(() => {
      this.props.navigation.navigate('ContactsListScreen', {
        sendContact: this.sendContact,
      });
    });
  };

  videoPicker = async () => {
    ImagePicker.openPicker({
      mediaType: 'video',
    }).then(async (response) => {
      if (response.didCancel) {
      } else if (response.error) {
      } else if (response.customButton) {
      } else {
        this.props.navigation.navigate('VideoProcessScreen', {
          uri: response.path,
          sendVideo: this.sendVideo,
        });
      }
    });
  };

  sendVideo = async (data) => {
    let type = '0';
    await this.setState({open: false});
    var data = {
      user_id: this.state.userId,
      toid: this.props.route.params.userid,
      msg_type: 'video',
      reply_id: 0,
      type: type,
      body: '',
      upload: [
        {
          path: data.path,
          caption: '',
          data: data.data,
        },
      ],
    };

    fetch(`${BASE_URL}api-message/sent-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code === 200) {
          this.setState({});
          alert('Message sent succesfully');
        } else {
        }
      })
      .catch((error) => {});
  };

  imagepicker = () => {
    ImagePicker.openPicker({
      cropping: true,
      includeBase64: true,
      compressImageQuality: 0.4,
    }).then(async (response) => {
      console.log('pickimage==', response);
      this.setState({imageshow: false});
      this.setState({imageView: response});
    });
  };

  uploadImage = (datas) => {
    let type = '0';
    this.setState({open: false});
    var data = {
      user_id: this.state.userId,
      toid: this.props.route.params.userid,
      msg_type: 'image',
      type: type,
      reply_id: '0',
      body: 'sfsdfsdfd dsfsdfs',
      upload: [
        {
          fileName: datas.fileName,
          fileSize: datas.fileSize,
          height: datas.height,
          isVertical: datas.isVertical,
          originalRotation: datas.originalRotation,
          path: datas.path,
          type: datas.type,
          caption: this.state.caption,
          uri: '',
          width: datas.width,
          data: datas.data,
        },
      ],
    };

    axios(`${BASE_URL}api-message/sent-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      data,
    })
      .then((responseData) => {
        if (responseData.data.code === 200) {
          this.setState({visibleReply: true});
          alert('Message sent succesfully');
          this.setState({caption: ''});
        } else {
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  startRecording = async () => {
    await recordingPermissions();
    audioRecorderPlayer.addRecordBackListener(() => {
      return;
    });
  };

  createTwoButtonAlert = () => {
    if (this.state.recording) {
      Alert.alert(
        'Audio Record',
        'Do you want to send this Audio?',
        [
          {
            text: 'No',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => {
              this.onStopRecord();
            },
          },
        ],
        {cancelable: false},
      );
    }
  };

  sendAudio = (data) => {
    let type = '0';
    this.setState({open: false});
    var data = {
      user_id: this.state.userId,
      toid: this.props.route.params.userid,
      msg_type: 'audio',
      type: type,
      reply_id: 0,
      body: '',
      upload: [
        {
          path: data.path,
          caption: '',
          data: data.data,
        },
      ],
    };

    fetch(`${BASE_URL}api-message/sent-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code === 200) {
          this.setState({visibleReply: true});
        } else {
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    const base64string = await readFile(result, 'base64');
    const data = {
      data: base64string,
      path: result,
    };
    this.sendAudio(data);
  };

  sendImage = async () => {
    this.setState({imageshow: true});
    let response = this.state.imageView;
    this.uploadImage(response);
    if (response.didCancel) {
    } else {
      const source = {uri: response.path};
      this.setState({
        avatarSource: source,
      });
    }
  };

  launchCamera = async () => {
    this.setState({message: ''});
    ImagePicker.openCamera({
      cropping: true,
      includeBase64: true,
    }).then(async (response) => {
      console.log('image data', response);
      this.setState({imageshow: false});
      this.setState({imageView: response});
    });
  };

  viewStory = () => {
    let formData = new FormData();

    formData.append('user_id', this.state.userId);
    formData.append('story_id', this.state.storyid);
    var viewStory = `${BASE_URL}api-user/view-story`;
    fetch(viewStory, {
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
        } else {
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  };

  onSwipeLeft(gestureState) {
    let leftcount = this.state.leftcount;
    this.setState({leftcount: leftcount + 1});
    let itemVariable = this.props.route.params.storyArray[this.state.position]
      .stories.length;

    if (
      this.state.position !== this.state.storyLength - 1 &&
      itemVariable == leftcount
    ) {
      this.setState({position: this.state.position + 1}, () => {
        this.setState({leftcount: 1});
        this.storyData();
      });
    }
  }

  onSwipeRight(gestureState) {
    let leftcount = this.state.leftcount;
    this.setState({leftcount: leftcount - 1});
    let itemVariable = this.props.route.params.storyArray[this.state.position]
      .stories.length;

    if (this.state.position != 0 && leftcount == 1) {
      this.setState({position: this.state.position - 1}, () => {
        this.setState({leftcount: 1});
        this.storyData();
      });
    }
  }

  onSwipe(gestureName) {
    const {SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT} = swipeDirections;
    this.setState({gestureName: gestureName});
    switch (gestureName) {
      case SWIPE_UP:
        this.setState({backgroundColor: 'red'});
        break;
      case SWIPE_DOWN:
        this.setState({backgroundColor: 'green'});
        break;
      case SWIPE_LEFT:
        this.setState({backgroundColor: 'blue'});
        break;
      case SWIPE_RIGHT:
        this.setState({backgroundColor: 'yellow'});
        break;
    }
  }

  onSwipeUp() {
    this.props.navigation.goBack();
  }

  render() {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };

    return (
      <SafeAreaView style={styles.container}>
        <GestureRecognizer
          onSwipe={(direction, state) => this.onSwipe(direction)}
          onSwipeUp={(state) => this.onSwipeUp()}
          onSwipeLeft={(state) => this.onSwipeLeft(state)}
          onSwipeRight={(state) => this.onSwipeRight(state)}
          config={config}
          style={{
            flex: 1,
          }}>
          {this.state.imageshow ? (
            <>
              <View style={{flexDirection: 'row', marginBottom: 10}}>
                <View style={styles.BackButtonContainer}>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.goBack()}>
                    <Image
                      source={require('../images/back_blck_icon.png')}
                      style={styles.backButtonStyle}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.CloseButtonContainerStyles}>
                  <Image
                    style={styles.CloseButtonViewStyles}
                    source={
                      this.state.avatar == null
                        ? this.state.defaultavatar
                        : {uri: this.state.avatar}
                    }
                  />
                </View>
                <View style={{flexDirection: 'column'}}>
                  <View style={{width: 300}}>
                    <Text style={styles.username}>{this.state.nameStory}</Text>
                  </View>
                  <Text style={{marginTop: 5, fontSize: 12}}>
                    {this.state.currentTime}
                  </Text>
                </View>
              </View>

              <View style={styles.ImageContainer}>
                <SliderBox
                  images={this.state.images}
                  style={styles.sliderImageStyle}
                />
              </View>

              {this.state.open && (
                <View
                  style={{
                    width: '90%',
                    height: '25%',
                    backgroundColor: '#FFFFFF',
                    alignSelf: 'center',
                    borderRadius: 10,
                    justifyContent: 'space-around',
                    padding: 20,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}>
                    <View>
                      <TouchableOpacity
                        style={{justifyContent: 'center', alignItems: 'center'}}
                        onPress={() => this.selectOneFile()}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#ffebe6',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Image
                            source={require('../images/docs.png')}
                            // resizeMode="center"
                            style={{width: 15, height: 20, alignSelf: 'center'}}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#2B2B2B',
                            textAlign: 'center',
                          }}>
                          Document
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View>
                      <TouchableOpacity onPress={() => this.videoPicker()}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#e7f0fe',
                            justifyContent: 'center',
                          }}>
                          <Icon
                            name="videocam"
                            type="Ionicons"
                            style={{
                              fontSize: 18,
                              alignSelf: 'center',
                              color: '#4086F4',
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#2B2B2B',
                            textAlign: 'center',
                          }}>
                          Video
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View>
                      <TouchableOpacity onPress={() => this.imagepicker()}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#e6fef6',
                            justifyContent: 'center',
                          }}>
                          <Image
                            source={require('../images/gal.png')}
                            // resizeMode="center"
                            style={{width: 20, height: 15, alignSelf: 'center'}}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#2B2B2B',
                            textAlign: 'center',
                          }}>
                          Photo
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}>
                    <View style={{marginLeft: 10}}>
                      <TouchableOpacity onPress={() => this.selectOneFile1()}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#fffae6',
                            justifyContent: 'center',
                          }}>
                          <Image
                            source={require('../images/audioo.png')}
                            // resizeMode="center"
                            style={{alignSelf: 'center', width: 15, height: 15}}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#2B2B2B',
                            textAlign: 'center',
                          }}>
                          Audio
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View
                      style={{justifyContent: 'center', alignItems: 'center'}}>
                      <TouchableOpacity
                        onPress={() => this.locationPicker()}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: '#e6fef6',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Image
                          source={require('../images/loc.png')}
                          style={{alignSelf: 'center', width: 15, height: 20}}
                        />
                      </TouchableOpacity>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#2B2B2B',
                          textAlign: 'center',
                        }}>
                        Location
                      </Text>
                    </View>
                    <View>
                      <TouchableOpacity onPress={() => this.contactPicker()}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#e7f0fe',
                            justifyContent: 'center',
                          }}>
                          <Image
                            source={require('../images/folw.png')}
                            style={{alignSelf: 'center', width: 15, height: 20}}
                          />
                        </View>
                        <Text style={{fontSize: 12, color: '#2B2B2B'}}>
                          Contact
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
              {this.state.visibleReply ? (
                <View style={styles.reply}>
                  <View style={{flexDirection: 'column'}}>
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({visibleReply: false});
                      }}>
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Image
                          source={require('../images/reply.png')}
                          style={{width: 30, height: 30}}
                        />
                      </View>
                      <Text style={{marginTop: 2}}>REPLY</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    marginBottom: 10,
                    marginTop: 25,
                    borderRadius: 25,
                    position: 'absolute',
                    bottom: 20,
                    alignSelf: 'center',
                    backgroundColor: '#F1F0F2',
                  }}>
                  <TextInput
                    onChangeText={(text) => this.onChangeText(text)}
                    multiline={true}
                    value={this.state.message}
                    ref={(ref) => (this.inputRef = ref)}
                    onContentSizeChange={(event) => {
                      this.setState({
                        height: event.nativeEvent.contentSize.height,
                      });
                    }}
                    placeholder="Type a message…"
                    style={{
                      margin: 10,
                      backgroundColor: '#FFFFFF',
                      color: '#0000008A',
                      borderRadius: 35,
                      width: '60%',
                      height: this.state.height,
                      fontSize: 12,
                      paddingLeft: 10,
                      borderWidth: 0,
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                  />
                  <View
                    style={{
                      backgroundColor: '#FFFFFF',
                      alignSelf: 'center',
                      height: this.state.height,
                      width: '20%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 10,
                      borderWidth: 0,
                      marginLeft: -10,
                      borderTopRightRadius: this.state.showRelymsg ? 0 : 15,
                      borderBottomRightRadius: 15,
                      paddingBottom: 4,
                      marginBottom: 12,
                    }}>
                    <View style={{flexDirection: 'row'}}>
                      <Icon
                        onPress={() => {
                          this.setState({open: !this.state.open});
                          this.setState({editMode: !this.state.editMode});
                          this.setState({message: ''});
                        }}
                        name="attachment"
                        type="MaterialIcons"
                        style={{color: '#0000008A', marginRight: 8}}
                      />
                      {!this.state.message.length > 0 ? (
                        <Icon
                          onPress={() => {
                            this.launchCamera();
                          }}
                          name="photo-camera"
                          type="MaterialIcons"
                          style={{color: '#0000008A', marginRight: 8}}
                        />
                      ) : null}
                    </View>
                  </View>
                  <View
                    style={{
                      alignSelf: 'flex-end',
                      width: this.state.recording ? 60 : 40,
                      height: this.state.recording ? 60 : 40,
                      margin: this.state.recording ? 0 : 10,
                      borderRadius: this.state.recording ? 30 : 20,
                      backgroundColor: 'red',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
                      onLongPress={() => {
                        this.startRecording();
                        this.setState({recording: true});
                      }}
                      onPressOut={() => {
                        this.createTwoButtonAlert();
                        this.setState({recording: false});
                      }}
                      onPress={() => {
                        this.sendMessage();
                      }}>
                      {this.state.message === '' ? (
                        <Icon
                          name="mic"
                          type="Feather"
                          style={{
                            color: '#FFFFFF',
                            fontSize: 18,
                            alignSelf: 'center',
                          }}
                        />
                      ) : (
                        <Icon
                          name="arrowright"
                          type="AntDesign"
                          style={{
                            fontSize: 20,
                            color: '#FFFFFF',
                            alignSelf: 'center',
                          }}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={{flex: 1, backgroundColor: 'black'}}>
              <ScrollView>
                <View>
                  <Image
                    source={{uri: this.state.imageView.path}}
                    style={{width: 500, height: 600}}
                  />
                  <View style={{flexDirection: 'row'}}>
                    <TextInput
                      placeholder="Type a caption...."
                      style={{
                        backgroundColor: '#fff',
                        marginTop: 15,
                        width: '90%',
                      }}
                      onChangeText={(text) => {
                        this.setState({caption: text});
                      }}
                    />
                    <View
                      style={{
                        backgroundColor: 'red',
                        marginTop: 15,
                        justifyContent: 'center',
                        alignContent: 'center',
                        width: '10%',
                      }}>
                      <Icon
                        name="arrowright"
                        type="AntDesign"
                        onPress={() => {
                          this.sendImage();
                        }}
                        style={{
                          fontSize: 20,
                          color: '#FFFFFF',
                          alignSelf: 'center',
                        }}
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          )}
        </GestureRecognizer>
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  reply: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 45,
  },
  CloseButtonContainerStyles: {
    marginTop: resp(30),
    marginRight: resp(70),
    flex: 0.1,
    width: '20%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  backButtonStyle: {
    margin: 10,
    height: 20,
    width: 20,
  },
  BackButtonContainer: {
    marginTop: 40,
    marginLeft: 10,
    backgroundColor: 'white',
  },
  username: {
    marginTop: 35,
    marginLeft: 2,
    fontSize: 15,
    fontWeight: 'bold',
  },
  CloseButtonViewStyles: {
    marginLeft: resp(2),
    width: resp(60),
    height: resp(60),
    borderWidth: 2,
    borderRadius: 5,
    borderColor: '#F01738',
  },
  ImageContainer: {
    flex: 0.75,
  },
  sliderImageStyle: {
    marginTop: resp(10),
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '99%',
    height: resp(500),
  },
});
export default StoryViewScreen;
