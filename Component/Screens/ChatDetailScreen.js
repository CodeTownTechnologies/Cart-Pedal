/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-alert */
/* eslint-disable react/no-did-update-set-state */

import React from 'react';
import {Container, Icon, View} from 'native-base';
import Spinner from 'react-native-loading-spinner-overlay';
import Sound from 'react-native-sound';
import MediaMeta from 'react-native-media-meta';
import LottieView from 'lottie-react-native';
import {
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  FlatList,
  TextInput,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import DocumentPicker from 'react-native-document-picker';
import firebase from 'react-native-firebase';

import ImagePicker from 'react-native-image-crop-picker';
import resp from 'rn-responsive-font';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {DocumentDirectoryPath, readFile} from 'react-native-fs';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import ImageModal from 'react-native-image-modal';
import Menu, {MenuItem} from 'react-native-material-menu';
import Clipboard from '@react-native-community/clipboard';
import Toast from 'react-native-simple-toast';
import moment from 'moment';
import {connect} from 'react-redux';
import {
  ConversationListAction,
  toggleChatting,
  clearConversation,
} from '../../redux/actions';
import _ from 'lodash';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
const audioRecorderPlayer = new AudioRecorderPlayer();
import {BASE_URL} from '../Component/ApiClient';
import {MessageComponent} from '../Component/MessageComponent';
import {
  locationPermission,
  recordingPermissions,
} from '../Component/Permissions';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {ListFiles} from '../utils/FilesCaching';
import {API_URL} from '../../Config';
import {Tool, VESDK} from 'react-native-videoeditorsdk';
import Draggable from 'react-native-draggable';

let height = Dimensions.get('window').height;

const tick = new Sound('tick.mp3', Sound.MAIN_BUNDLE, (err) => {
  console.log(err, Platform.OS, 'ZZZZ');
});

const received = new Sound('received.mp3', Sound.MAIN_BUNDLE, (err) => {
  console.log(err, Platform.OS, 'YYYY');
});

function format(time) {
  // Hours, minutes and seconds
  var hrs = ~~(time / 3600);
  var mins = ~~((time % 3600) / 60);
  var secs = ~~time % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  var ret = '';
  if (hrs > 0) {
    ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
  }
  ret += '' + String(mins).padStart(2, '0') + ':' + (secs < 10 ? '0' : '');
  ret += '' + secs;
  return ret;
}

class ChatDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 40,
      open: false,
      message: '',
      chatList: {messages: []},
      ischatList: false,
      fcmToken: '',
      imageshow: true,
      getNotify: '',
      firebaseMsg: '',
      isNotify: false,
      deletemodal: false,
      recievedmsg: '',
      recording: false,
      forwardMessageIds: [],
      forwardMessageTypes: [],
      isFrom: [],
      userAccessToken: '',
      selectedMode: false,
      copyTexts: [],
      replyMessage: '',
      userId: '',
      showfilerply: false,
      page: 1,
      imageView: '',
      editMode: true,
      caption: '',
      recordStart: true,
      borderval: false,
      lengthMesaage: '',
      showRelymsg: false,
      showEveryone: false,
      showimagerply: false,
      showaudiorply: false,
      showvideorply: false,
      showcontactrply: false,
      showlocationmsg: false,
      live: false,
      uploading: false,
      playingAudioId: undefined,
      FILES: [],
      scrollToId: undefined,
      useravatar: this.props.route.params.useravatar,
      username: this.props.route.params.username,
      lastMessageId: undefined,
      messageIdList: [],
      searching: false,
      searchText: '',
      currentSearchIdIndex: undefined,
      currentIdsList: [],
      calling: false,
      locked: false,
      timer: 0,
      bottom: new Animated.Value(0),
      spinValue: new Animated.Value(0),
      progress: new Animated.Value(0),
    };
  }

  makeCurrentIdsList = () => {
    const messageIds = [];
    for (let i = 0; i < this.state.chatList.messages.length; i++) {
      const element = this.state.chatList.messages[i];

      if (
        element.msg_type === 'text' &&
        element.fmsg != '' &&
        element.fmsg
          .toLowerCase()
          .includes(this.state.searchText.toLowerCase().trim())
      ) {
        messageIds.push(element.id);
      }
      if (
        element.msg_type === 'text' &&
        element.tmsg != '' &&
        element.tmsg
          .toLowerCase()
          .includes(this.state.searchText.toLowerCase().trim())
      ) {
        messageIds.push(element.id);
      }
    }

    return messageIds.sort((a, b) => a - b);
  };

  search = async (type) => {
    if (this.state.currentIdsList.length === 0) {
      const messageIds = this.makeCurrentIdsList();
      await this.setState({currentIdsList: messageIds});
    }
    if (type === 'up') {
      if (this.state.currentSearchIdIndex === undefined) {
        if (!(this.state.currentIdsList.length === 0)) {
          await this.setState({
            currentSearchIdIndex: this.state.currentIdsList.length - 1,
          });
          this.scrollToID(
            this.state.currentIdsList[this.state.currentSearchIdIndex],
          );
        }
      } else {
        if (this.state.currentSearchIdIndex === 0) {
          Toast.show('Not Found', 2000);
        } else {
          await this.setState((p) => ({
            currentSearchIdIndex: p.currentSearchIdIndex - 1,
          }));
          this.scrollToID(
            this.state.currentIdsList[this.state.currentSearchIdIndex],
          );
        }
      }
    }
    if (type === 'down') {
      if (this.state.currentSearchIdIndex === undefined) {
        if (!(this.state.currentIdsList.length === 0)) {
          await this.setState({
            currentSearchIdIndex: this.state.currentIdsList.length - 1,
          });
          this.scrollToID(
            this.state.currentIdsList[this.state.currentSearchIdIndex],
          );
        }
      } else {
        if (
          this.state.currentSearchIdIndex + 1 ===
          this.state.currentIdsList.length
        ) {
          Toast.show('Not Found', 2000);
        } else {
          await this.setState((p) => ({
            currentSearchIdIndex: p.currentSearchIdIndex + 1,
          }));
          this.scrollToID(
            this.state.currentIdsList[this.state.currentSearchIdIndex],
          );
        }
      }
    }
  };

  lastMessageCall = async (id) => {
    let formData = new FormData();
    formData.append('msgid', id);
    formData.append('user_id', this.state.userId);
    formData.append('toid', this.props.route.params.userid);
    formData.append('type', this.props.route.params.msg_type);
    formData.append('msg_type', '0');
    const token = this.state.fcmToken != '' ? this.state.fcmToken : '1111';
    fetch(`${API_URL}api-message/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        device_id: '1234',
        device_token: token,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        // console.log(responseData.data);
        if (responseData.code == '200') {
          const readIds = responseData.data.read.split(',');
          if (
            readIds.length === 1 &&
            this.props.route.params.userid == readIds[0]
          ) {
            this.setState((p) => ({
              messageIdList: p.chatList.messages.map((i) => i.id),
              lastMessageId: undefined,
            }));
            clearInterval(this.timer);
            this.timer = undefined;
          }
          if (readIds.length === this.props.route.params.membersCount) {
            this.setState((p) => ({
              messageIdList: p.chatList.messages.map((i) => i.id),
              lastMessageId: undefined,
            }));
            clearInterval(this.timer);
            this.timer = undefined;
          }
        } else {
        }
      })
      .catch((error) => {});
  };

  startMessageCaller = async (id) => {
    await this.setState({lastMessageId: id});
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    if (!this.timer) {
      this.timer = setInterval(() => {
        if (this.state.lastMessageId) {
          this.lastMessageCall(this.state.lastMessageId);
        }
      }, 1000);
    }
  };

  changeProfile = (avatar, name) => {
    this.setState({useravatar: avatar, username: name});
  };

  setAudioId = (id) => {
    this.setState({playingAudioId: id});
  };

  toggleSelectedMode = () => {
    this.setState((p) => ({
      ...p,
      selectedMode: !p.selectedMode,
      forwardMessageIds: [],
    }));
  };

  appendMessages = (messageId, type, isFrom = false) => {
    this.setState((p) => ({
      ...p,
      forwardMessageIds: [...p.forwardMessageIds, messageId],
      forwardMessageTypes: [...p.forwardMessageTypes, type],
      isFrom: [...p.isFrom, isFrom],
    }));
  };

  removeMessages = async (messageId, type, isFrom = false) => {
    await this.setState((p) => ({
      ...p,
      forwardMessageIds: p.forwardMessageIds.filter((i) => i !== messageId),
      forwardMessageTypes: p.forwardMessageTypes.filter((i) => i !== type),
      isFrom: p.isFrom.filter((i) => i !== isFrom),
      copyTexts: p.copyTexts.filter((i) => i.id !== messageId),
    }));
    if (this.state.forwardMessageIds.length === 0) {
      this.setState({selectedMode: false});
    }
  };

  copyText = ({id, text}) => {
    this.setState((p) => ({...p, copyTexts: [...p.copyTexts, {id, text}]}));
  };

  replyTo = (text) => {
    this.setState({showEveryone: true});
    this.setState({replyMessage: text});
  };

  copyToClipboard = () => {
    let message = '';
    let count = 0;
    this.state.copyTexts.map((i, index) => {
      if (index === 0) {
        message = i.text;
        count = count + 1;
      } else {
        message = message + '\n' + i.text;
        count = count + 1;
      }
    });
    Toast.show(`${count} messages copied`, 2000);
    Clipboard.setString(message);
    this.setState({
      selectedMode: false,
      forwardMessageIds: [],
      copyTexts: [],
    });
  };

  updateFilesArray = (file) => {
    this.setState((p) => ({FILES: [...p.FILES, file]}));
  };

  animateAndThenCancel = () => {
    setTimeout(() => this.onCancel(), 2400);
    Animated.parallel([
      Animated.timing(this.state.bottom, {
        toValue: -180,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(this.state.bottom, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }).start();
      }),
      Animated.timing(this.state.progress, {
        toValue: 1,
        duration: Platform.OS === 'android' ? 5000 : 4400,
        useNativeDriver: true,
      }).start(() => {
        this.setState({
          progress: new Animated.Value(0),
        });
        // this.onCancel();
      }),
      Animated.timing(this.state.spinValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start(() => this.setState({spinValue: new Animated.Value(0)})),
    ]);
  };

  componentDidMount = async () => {
    const FILES = await ListFiles();
    this.setState({FILES});
    this.props.toggleChatting(true, this.props.route.params.userid);
    this.requestCameraPermission();
    this.listener1 = firebase.notifications().onNotification((notification) => {
      if (notification.data.type === '') {
        if (
          notification.data.fromid == this.props.route.params.userid ||
          notification.data.groupid == this.props.route.params.userid
        ) {
          this.setState({live: true});
          this.getConversationList();
          setTimeout(
            () => received.play((d) => console.log(d, Platform.OS)),
            1000,
          );
        }
      }
    });

    this.listener2 = firebase.messaging().onMessage((m) => {
      if (m.data.type === '') {
        if (
          m.data.fromid == this.props.route.params.userid ||
          m.data.groupid == this.props.route.params.userid
        ) {
          this.setState({live: true});
          this.getConversationList();
          setTimeout(() => {
            received.play((d) => console.log(d, Platform.OS));
          }, 1000);
        }
      }
    });

    AsyncStorage.getItem('@user_id').then((userId) => {
      if (userId) {
        this.setState({userId: userId});
      }
    });

    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmToken: token});
        this.convertEmoji('128522');
      }
    });

    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        this.setState({userAccessToken: accessToken});
        this.getConversationList();
      }
    });

    AsyncStorage.getItem('@Phonecontacts').then((mobile) => {
      if (mobile) {
        this.setState({PhoneNumber: JSON.parse(mobile)});
      }
    });
  };

  componentWillUnmount() {
    this.props.clearConversation();
    this.props.toggleChatting(false, undefined);
    this.listener1();
    this.listener2();
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  componentWillReceiveProps(nextProps) {
    let equalArray = _.isEqual(
      this.props.conversationData,
      nextProps.conversationData,
    );
    if (!equalArray) {
      this.setState({chatList: nextProps.conversationData});
    }
    if (
      !this.props.isConnected &&
      this.props.dataById[this.props.route.params.userid] !== undefined
    ) {
      this.setState({
        chatList: this.props.dataById[this.props.route.params.userid],
      });
    }
  }

  componentDidUpdate() {
    if (this.props.conversationSuccess && this.state.callUpdate) {
      this.setState({callUpdate: false}, () => {
        this.setState({
          chatList: this.props.conversationData,
          ischatList: true,
        });
      });
    }
  }

  getConversationList = () => {
    this.setState({callUpdate: true}, () => {
      this.props.ConversationListAction(
        this.state.userId,
        this.props.route.params.msg_type,
        this.props.route.params.userid,
        this.state.userAccessToken,
      );
    });
  };

  sendMessage = () => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    let replyID = '0';
    let msg_type = 'text';

    if (this.state.showRelymsg == true && this.state.replyMessage != '') {
      if (
        this.state.replyMessage.text.fmsg ||
        this.state.replyMessage.text.tmsg
      ) {
        replyID = this.state.replyMessage.text.id;
      }
    }
    if (this.state.showimagerply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showaudiorply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showlocationmsg == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showfilerply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showcontactrply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showvideorply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    let type;
    if (this.props.route.params.msg_type == 0) {
      type = '0';
    } else {
      type = '1';
    }

    // this.setState({message: '', height: 40});
    let messageToSent = null;
    if (replyID == '0') {
      messageToSent = {
        ...newMessage,
        msg_type: msg_type,
        fmsg: this.state.message,
        time: moment().format('hh:mm'),
      };
    } else {
      const rmsg =
        this.state.replyMessage.text.tmsg == ''
          ? this.state.replyMessage.text.fmsg
          : this.state.replyMessage.text.tmsg;

      const rimage =
        this.state.replyMessage.text.tattach == ''
          ? this.state.replyMessage.text.fattach
          : this.state.replyMessage.text.tattach;

      messageToSent = {
        ...replyNewMessage,
        msg_type: msg_type,
        fmsg: this.state.message,
        time: moment().format('hh:mm'),
        reply_id: this.state.replyMessage.text.id,
        reply_msg: {
          ...this.state.replyMessage.text,
          rmsg,
          rimage,
        },
      };
    }

    if (this.state.ischatList && this.state.chatList.messages.length > 0) {
      this.setState((p) => ({
        chatList: {
          ...p.chatList,
          messages: [...p.chatList.messages, messageToSent],
        },
        ischatList: true,
      }));
    } else {
      this.setState((p) => ({
        chatList: {
          messages: [p.chatList.messages, messageToSent],
        },
      }));
    }

    var raw = JSON.stringify({
      user_id: this.state.userId,
      toid: this.props.route.params.userid,
      msg_type: msg_type,
      body: this.state.message,
      reply_id: replyID,
      upload: [],
      type: this.props.route.params.msg_type,
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
          const messages = this.state.chatList.messages;
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            id: responseData.data[0].id,
            sending: false,
          };
          this.setState(
            (p) => ({
              chatList: {
                ...p.chatList,
                messages,
              },
              ischatList: true,
            }),
            () => setTimeout(() => tick.play(), 1000),
          );

          // this.startMessageCaller(responseData.data[0].id);

          replyID = '0';
          this.setState({selectedMode: false, forwardMessageIds: []});
          this.setState({
            message: '',
            showRelymsg: false,
            showaudiorply: false,
            showimagerply: false,
            showlocationmsg: false,
            showfilerply: false,
            showcontactrply: false,
            showvideorply: false,
          });
          // this.getConversationList();
        } else {
        }
      })
      .catch((error) => {});
  };

  uploadFileApi = (datas) => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    let type;
    this.setState({open: false});
    if (this.props.route.params.msg_type !== 0) {
      type = '1';
    } else {
      type = '0';
    }

    let replyID = '0';
    if (this.state.showRelymsg == true && this.state.replyMessage != '') {
      if (
        this.state.replyMessage.text.fmsg ||
        this.state.replyMessage.text.tmsg
      ) {
        replyID = this.state.replyMessage.text.id;
      }
    }
    if (this.state.showimagerply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showaudiorply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showlocationmsg == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showfilerply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showcontactrply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showvideorply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    let messageToSent = null;
    if (replyID == '0') {
      messageToSent = {
        ...newMessage,
        msg_type: 'file',
        fmsg: '',
        fattach: {
          ...newMessage.fattach,
          attach: datas.path,
        },
        time: moment().format('hh:mm'),
      };
    } else {
      const rmsg =
        this.state.replyMessage.text.tmsg == ''
          ? this.state.replyMessage.text.fmsg
          : this.state.replyMessage.text.tmsg;

      const rimage =
        this.state.replyMessage.text.tattach == ''
          ? this.state.replyMessage.text.fattach
          : this.state.replyMessage.text.tattach;

      messageToSent = {
        ...replyNewMessage,
        msg_type: 'file',
        fmsg: '',
        fattach: {
          ...newMessage.fattach,
          attach: datas.path,
        },
        time: moment().format('hh:mm'),
        reply_id: this.state.replyMessage.text.id,
        reply_msg: {
          ...this.state.replyMessage.text,
          rmsg,
          rimage,
        },
      };
    }

    if (this.state.ischatList && this.state.chatList.messages.length > 0) {
      this.setState((p) => ({
        chatList: {
          ...p.chatList,
          messages: [...p.chatList.messages, messageToSent],
        },
        ischatList: true,
      }));
    } else {
      this.setState((p) => ({
        chatList: {
          messages: [p.chatList.messages, messageToSent],
        },
      }));
    }

    var data = {
      user_id: this.state.userId,
      toid: this.props.route.params.userid,
      msg_type: 'file',
      reply_id: replyID,
      type: this.props.route.params.msg_type,
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
          const messages = this.state.chatList.messages;
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            id: responseData.data[0].id,
            sending: false,
          };
          this.setState(
            (p) => ({
              chatList: {
                ...p.chatList,
                messages,
              },
              ischatList: true,
              uploading: false,
            }),
            () => setTimeout(() => tick.play(), 1000),
          );
          // this.startMessageCaller(responseData.data[0].id);
          this.setState({selectedMode: false, forwardMessageIds: []});
          this.setState({
            showRelymsg: false,
            showaudiorply: false,
            showimagerply: false,
            showlocationmsg: false,
            showfilerply: false,
            showcontactrply: false,
            showvideorply: false,
          });
        } else {
        }
      })
      .catch((error) => {});
  };

  sendVideo = async (data) => {
    console.log('data',data);
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    let type;
    if(data){
    if (this.props.route.params.msg_type !== 0) {
      type = '1';
    } else {
      type = '0';
    }
    let replyID = '0';
    if (this.state.showRelymsg == true && this.state.replyMessage != '') {
      if (
        this.state.replyMessage.text.fmsg ||
        this.state.replyMessage.text.tmsg
      ) {
        replyID = this.state.replyMessage.text.id;
      }
    }
    if (this.state.showimagerply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showaudiorply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showlocationmsg == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showfilerply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showcontactrply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showvideorply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    await this.setState({open: false});

    let messageToSent = null;
    if (replyID == '0') {
      messageToSent = {
        ...newMessage,
        msg_type: 'video',
        fmsg: '',
        fattach: {...newMessage.fattach, attach: data.path},
        time: moment().format('hh:mm'),
      };
    } else {
      const rmsg =
        this.state.replyMessage.text.tmsg == ''
          ? this.state.replyMessage.text.fmsg
          : this.state.replyMessage.text.tmsg;

      const rimage =
        this.state.replyMessage.text.tattach == ''
          ? this.state.replyMessage.text.fattach
          : this.state.replyMessage.text.tattach;

      messageToSent = {
        ...replyNewMessage,
        msg_type: 'video',
        fmsg: '',
        fattach: {...newMessage.fattach, attach: data.path},
        time: moment().format('hh:mm'),
        reply_id: this.state.replyMessage.text.id,
        reply_msg: {
          ...this.state.replyMessage.text,
          rmsg,
          rimage,
        },
      };
    }

    // const messageToSent = {
    //   ...newMessage,
    //   msg_type: 'video',
    //   fmsg: '',
    //   fattach: {...newMessage.fattach, attach: data.path},
    //   time: moment().format('hh:mm'),
    // };

    if (this.state.ischatList && this.state.chatList.messages.length > 0) {
      this.setState((p) => ({
        chatList: {
          ...p.chatList,
          messages: [...p.chatList.messages, messageToSent],
        },
        ischatList: true,
      }));
    } else {
      this.setState((p) => ({
        chatList: {
          messages: [p.chatList.messages, messageToSent],
        },
      }));
    }
    var data = {
      user_id: this.state.userId,
      toid: this.props.route.params.userid,
      msg_type: 'video',
      reply_id: replyID,
      type: this.props.route.params.msg_type,
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
        device_token: '1111',
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code === 200) {
          // this.getConversationList();
          const messages = this.state.chatList.messages;
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            id: responseData.data[0].id,
            sending: false,
          };
          this.setState(
            (p) => ({
              chatList: {
                ...p.chatList,
                messages,
              },
              ischatList: true,
              uploading: false,
            }),
            () => setTimeout(() => tick.play(), 1000),
          );
          // this.startMessageCaller(responseData.data[0].id);
          this.setState({selectedMode: false, forwardMessageIds: []});
          this.setState({
            showRelymsg: false,
            showaudiorply: false,
            showimagerply: false,
            showlocationmsg: false,
            showfilerply: false,
            showcontactrply: false,
            showvideorply: false,
          });
        } else {
        }
      })
      .catch((error) => {});
    }
  };

  selectOneFile = () => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    try {
      DocumentPicker.pick({
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

  selectOneFile1 = () => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
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
        alert('Canceled from single doc picker');
      } else {
        throw err;
      }
    }
  };

  selectOneFile2 = () => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    try {
      const res = DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      }).then((data) => {});
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        alert('Canceled from single doc picker');
      } else {
        throw err;
      }
    }
  };

  uploadImage = (datas, reply_id) => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    let type;
    this.setState({open: false});
    if (this.props.route.params.msg_type !== 0) {
      type = '1';
    } else {
      type = '0';
    }
    var data = {
      user_id: this.state.userId,
      toid: this.props.route.params.userid,
      msg_type: 'image',
      type: this.props.route.params.msg_type,
      reply_id,
      body: 'sfsdfsdfd dsfsdfs',
      upload: [
        {
          path: datas.path,
          caption: this.state.caption,
          uri: '',
          data: datas.data,
        },
      ],
    };

    axios(`${BASE_URL}api-message/sent-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        device_id: '1234',
        device_token: '1111',
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      data,
    })
      .then((responseData) => {
        if (responseData.data.code === 200) {
          this.setState({caption: ''});
          const messages = this.state.chatList.messages;
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            id: responseData.data.data[0].id,
            sending: false,
          };
          this.setState(
            (p) => ({
              chatList: {
                ...p.chatList,
                messages,
              },
              ischatList: true,
              uploading: false,
            }),
            () => setTimeout(() => tick.play(), 1000),
          );
          // this.startMessageCaller(responseData.data[0].id);
          this.setState({selectedMode: false, forwardMessageIds: []});
          this.setState({
            showRelymsg: false,
            showaudiorply: false,
            showimagerply: false,
            showlocationmsg: false,
            showfilerply: false,
            showcontactrply: false,
            showvideorply: false,
          });
        } else {
        }
      })
      .catch((error) => {});
  };

  openImage=async(response)=>{
    console.log('repsonse',response);
    if(response){
    this.setState({imageshow: false});
    this.setState({imageView: response});
    await this.setState({open: false});
    }
  }

  launchCamera = async () => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    this.setState({message: ''});
    this.props.navigation.navigate('PostScreen',{
      sendVideo:this.sendVideo,
      openImage:this.openImage
    });
  };
   
  sendImage = async () => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    let replyID = '0';
    if (this.state.showRelymsg == true && this.state.replyMessage != '') {
      if (
        this.state.replyMessage.text.fmsg ||
        this.state.replyMessage.text.tmsg
      ) {
        replyID = this.state.replyMessage.text.id;
      }
    }
    if (this.state.showimagerply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showaudiorply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showlocationmsg == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showfilerply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showcontactrply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showvideorply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    this.setState({imageshow: true, uploading: true});
    await this.setState({open: false});
    let response = this.state.imageView;
    let messageToSent = null;
    if (replyID == '0') {
      messageToSent = {
        ...newMessage,
        msg_type: 'image',
        fmsg: '',
        fattach: {
          ...newMessage.fattach,
          attach: response.path,
          caption: this.state.caption,
        },
        time: moment().format('hh:mm'),
      };
    } else {
      const rmsg =
        this.state.replyMessage.text.tmsg == ''
          ? this.state.replyMessage.text.fmsg
          : this.state.replyMessage.text.tmsg;

      const rimage =
        this.state.replyMessage.text.tattach == ''
          ? this.state.replyMessage.text.fattach
          : this.state.replyMessage.text.tattach;

      messageToSent = {
        ...replyNewMessage,
        msg_type: 'image',
        fmsg: '',
        fattach: {
          ...newMessage.fattach,
          attach: response.path,
          caption: this.state.caption,
        },
        time: moment().format('hh:mm'),
        reply_id: this.state.replyMessage.text.id,
        reply_msg: {
          ...this.state.replyMessage.text,
          rmsg,
          rimage,
        },
      };
    }

    if (this.state.ischatList && this.state.chatList.messages.length > 0) {
      this.setState((p) => ({
        chatList: {
          ...p.chatList,
          messages: [...p.chatList.messages, messageToSent],
        },
        ischatList: true,
      }));
    } else {
      this.setState((p) => ({
        chatList: {
          messages: [p.chatList.messages, messageToSent],
        },
      }));
    }
    this.uploadImage(response, replyID);
    if (response.didCancel) {
    } else {
      const source = {uri: response.path};

      this.setState({
        avatarSource: source,
      });
    }
  };

  imagepicker = () => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    ImagePicker.openPicker({
      cropping: true,
      includeBase64: true,
      compressImageQuality: 0.4,
    }).then(async (response) => {
      this.setState({imageshow: false});
      this.setState({imageView: response});
    });
  };

  requestCameraPermission = async () => {
    try {
      const granted = await request(
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
          : PERMISSIONS.IOS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted === RESULTS.GRANTED) {
      } else {
        return;
      }
    } catch (err) {
      console.warn(err);
      return;
    }
  };

  videoPicker = async () => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    ImagePicker.openPicker({
      mediaType: 'video',
    }).then(async (response) => {
      if (response.didCancel) {
      } else if (response.error) {
      } else if (response.customButton) {
      } else {
        const path = Platform.OS === 'ios' ? response.sourceURL : response.path;
        VESDK.openEditor({uri: path}, {tools: [Tool.TRIM]}).then(
          async (result) => {
            if (result) {
              const uri = result.video.replace('file://', '');
              const metadata = await MediaMeta.get(uri);
              // eslint-disable-next-line radix
              if (parseInt(metadata.duration) < 30000) {
                const res = await readFile(result.video, 'base64');
                const data = {
                  path: result.video,
                  data: res,
                };
                this.sendVideo(data);
              } else {
                alert(
                  'You cannot upload video of duration more than 30 seconds',
                );
                this.setState({open: false});
              }
            }
          },
          (error) => {
            alert('video could not be uploaded');
          },
        );
      }
    });
  };

  sendContact = (contact) => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    let type;
    if (this.props.route.params.msg_type !== 0) {
      type = '1';
    } else {
      type = '0';
    }
    let replyID = '0';
    if (this.state.showRelymsg == true && this.state.replyMessage != '') {
      if (
        this.state.replyMessage.text.fmsg ||
        this.state.replyMessage.text.tmsg
      ) {
        replyID = this.state.replyMessage.text.id;
      }
    }
    if (this.state.showimagerply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showaudiorply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showlocationmsg == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showfilerply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showcontactrply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showvideorply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }

    this.setState({open: false});
    var raw = JSON.stringify({
      user_id: this.state.userId,
      toid: this.props.route.params.userid,
      msg_type: 'contact',
      type: this.props.route.params.msg_type,
      body: JSON.stringify(contact),
      reply_id: replyID,
      upload: [],
    });

    let messageToSent = null;
    if (replyID == '0') {
      messageToSent = {
        ...newMessage,
        msg_type: 'contact',
        fmsg: JSON.stringify(contact),
        time: moment().format('hh:mm'),
      };
    } else {
      const rmsg =
        this.state.replyMessage.text.tmsg == ''
          ? this.state.replyMessage.text.fmsg
          : this.state.replyMessage.text.tmsg;

      const rimage =
        this.state.replyMessage.text.tattach == ''
          ? this.state.replyMessage.text.fattach
          : this.state.replyMessage.text.tattach;

      messageToSent = {
        ...replyNewMessage,
        msg_type: 'contact',
        fmsg: JSON.stringify(contact),
        time: moment().format('hh:mm'),
        reply_id: this.state.replyMessage.text.id,
        reply_msg: {
          ...this.state.replyMessage.text,
          rmsg,
          rimage,
        },
      };
    }

    // const messageToSent = {
    //   ...newMessage,
    //   msg_type: 'contact',
    //   fmsg: JSON.stringify(contact),
    //   time: moment().format('hh:mm'),
    // };

    if (this.state.ischatList && this.state.chatList.messages.length > 0) {
      this.setState((p) => ({
        chatList: {
          ...p.chatList,
          messages: [...p.chatList.messages, messageToSent],
        },
        ischatList: true,
      }));
    } else {
      this.setState((p) => ({
        chatList: {
          messages: [p.chatList.messages, messageToSent],
        },
      }));
    }

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
          const messages = this.state.chatList.messages;
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            id: responseData.data[0].id,
            sending: false,
          };
          this.setState(
            (p) => ({
              chatList: {
                ...p.chatList,
                messages,
              },
              ischatList: true,
            }),
            () => setTimeout(() => tick.play(), 1000),
          );

          // this.startMessageCaller(responseData.data[0].id);

          this.setState({selectedMode: false, forwardMessageIds: []});
          this.setState({
            showRelymsg: false,
            showaudiorply: false,
            showimagerply: false,
            showlocationmsg: false,
            showfilerply: false,
            showcontactrply: false,
            showvideorply: false,
          });
        } else {
        }
      })
      .catch((error) => {});
  };

  contactPicker = async () => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    this.setState({open: false});
    const granted = await request(
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.READ_CONTACTS
        : PERMISSIONS.IOS.CONTACTS,
    );
    if (granted === RESULTS.GRANTED) {
      this.props.navigation.navigate('ContactsListScreen', {
        sendContact: this.sendContact,
      });
    } else {
      return;
    }
  };

  sendAudio = (data) => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    let type;
    this.setState({open: false});
    if (this.props.route.params.msg_type !== 0) {
      type = '1';
    } else {
      type = '0';
    }
    let replyID = '0';
    if (this.state.showRelymsg == true && this.state.replyMessage != '') {
      if (
        this.state.replyMessage.text.fmsg ||
        this.state.replyMessage.text.tmsg
      ) {
        replyID = this.state.replyMessage.text.id;
      }
    }
    if (this.state.showimagerply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showaudiorply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showlocationmsg == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showfilerply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showcontactrply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showvideorply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    let messageToSent = null;
    if (replyID == '0') {
      messageToSent = {
        ...newMessage,
        msg_type: 'audio',
        fmsg: '',
        fattach: {...newMessage.fattach, attach: data.path},
        time: moment().format('hh:mm'),
      };
    } else {
      const rmsg =
        this.state.replyMessage.text.tmsg == ''
          ? this.state.replyMessage.text.fmsg
          : this.state.replyMessage.text.tmsg;

      const rimage =
        this.state.replyMessage.text.tattach == ''
          ? this.state.replyMessage.text.fattach
          : this.state.replyMessage.text.tattach;

      messageToSent = {
        ...replyNewMessage,
        msg_type: 'audio',
        fmsg: '',
        fattach: {...newMessage.fattach, attach: data.path},
        time: moment().format('hh:mm'),
        reply_id: this.state.replyMessage.text.id,
        reply_msg: {
          ...this.state.replyMessage.text,
          rmsg,
          rimage,
        },
      };
    }

    // const messageToSent = {
    //   ...newMessage,
    //   msg_type: 'audio',
    //   fmsg: '',
    //   fattach: {...newMessage.fattach, attach: data.path},
    //   time: moment().format('hh:mm'),
    // };

    if (this.state.ischatList && this.state.chatList.messages.length > 0) {
      this.setState((p) => ({
        chatList: {
          ...p.chatList,
          messages: [...p.chatList.messages, messageToSent],
        },
        ischatList: true,
      }));
    } else {
      this.setState((p) => ({
        chatList: {
          messages: [p.chatList.messages, messageToSent],
        },
      }));
    }
    var data = {
      user_id: this.state.userId,
      toid: this.props.route.params.userid,
      msg_type: 'audio',
      type: this.props.route.params.msg_type,
      reply_id: replyID,
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
        device_token: '1111',
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code === 200) {
          const messages = this.state.chatList.messages;
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            id: responseData.data[0].id,
            fattach: responseData.data[0].attach,
            sending: false,
          };
          this.setState(
            (p) => ({
              chatList: {
                ...p.chatList,
                messages,
              },
              ischatList: true,
            }),
            () => setTimeout(() => tick.play(), 1000),
          );

          // this.startMessageCaller(responseData.data[0].id);

          this.setState({selectedMode: false, forwardMessageIds: []});
          this.setState({
            showRelymsg: false,
            showaudiorply: false,
            showimagerply: false,
            showlocationmsg: false,
            showfilerply: false,
            showcontactrply: false,
            showvideorply: false,
          });
        } else {
        }
      })
      .catch((error) => {});
  };

  startRecording = async () => {
    await recordingPermissions();
    const result = await audioRecorderPlayer.startRecorder(
      DocumentDirectoryPath + '/sample.mp4',
    );
    if (this.interval) {
      this.setState({timer: 0});
      clearInterval(this.interval);
      this.interval = null;
    }
    this.interval = setInterval(
      () => this.setState((p) => ({timer: p.timer + 1})),
      1000,
    );
    audioRecorderPlayer.addRecordBackListener((e) => {
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

  onStopRecord = async () => {
    this.setState({timer: 0, locked: false, recording: false});
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    const base64string = await readFile(result, 'base64');
    const data = {
      data: base64string,
      path: result,
    };
    this.sendAudio(data);
  };

  onCancel = async () => {
    this.setState({timer: 0, locked: false, recording: false});
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
  };

  sendLocation = (location) => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    let type;
    if (this.props.route.params.msg_type !== 0) {
      type = '1';
    } else {
      type = '0';
    }
    let replyID = '0';
    if (this.state.showRelymsg == true && this.state.replyMessage != '') {
      if (
        this.state.replyMessage.text.fmsg ||
        this.state.replyMessage.text.tmsg
      ) {
        replyID = this.state.replyMessage.text.id;
      }
    }
    if (this.state.showimagerply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showaudiorply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showlocationmsg == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showfilerply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showcontactrply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }
    if (this.state.showvideorply == true && this.state.replyMessage != '') {
      replyID = this.state.replyMessage.text.id;
    }

    let messageToSent = null;
    if (replyID == '0') {
      messageToSent = {
        ...newMessage,
        msg_type: 'location',
        fmsg: JSON.stringify(location),
        time: moment().format('hh:mm'),
      };
    } else {
      const rmsg =
        this.state.replyMessage.text.tmsg == ''
          ? this.state.replyMessage.text.fmsg
          : this.state.replyMessage.text.tmsg;

      const rimage =
        this.state.replyMessage.text.tattach == ''
          ? this.state.replyMessage.text.fattach
          : this.state.replyMessage.text.tattach;

      messageToSent = {
        ...replyNewMessage,
        msg_type: 'location',
        fmsg: JSON.stringify(location),
        time: moment().format('hh:mm'),
        reply_id: this.state.replyMessage.text.id,
        reply_msg: {
          ...this.state.replyMessage.text,
          rmsg,
          rimage,
        },
      };
    }

    // const messageToSent = {
    //   ...newMessage,
    //   msg_type: 'location',
    //   fmsg: JSON.stringify(location),
    //   time: moment().format('hh:mm'),
    // };

    if (this.state.ischatList && this.state.chatList.messages.length > 0) {
      this.setState((p) => ({
        chatList: {
          ...p.chatList,
          messages: [...p.chatList.messages, messageToSent],
        },
        ischatList: true,
      }));
    } else {
      this.setState((p) => ({
        chatList: {
          messages: [p.chatList.messages, messageToSent],
        },
      }));
    }
    var raw = JSON.stringify({
      user_id: this.state.userId,
      toid: this.props.route.params.userid,
      msg_type: 'location',
      type: this.props.route.params.msg_type,
      body: JSON.stringify(location),
      reply_id: replyID,
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
          const messages = this.state.chatList.messages;
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            id: responseData.data[0].id,
            sending: false,
          };
          this.setState(
            (p) => ({
              chatList: {
                ...p.chatList,
                messages,
              },
              ischatList: true,
            }),
            () => setTimeout(() => tick.play(), 1000),
          );

          // this.startMessageCaller(responseData.data[0].id);

          this.setState({selectedMode: false, forwardMessageIds: []});
          this.setState({
            showRelymsg: false,
            showaudiorply: false,
            showimagerply: false,
            showlocationmsg: false,
            showfilerply: false,
            showcontactrply: false,
            showvideorply: false,
          });
          // this.getConversationList();
        } else {
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  locationPicker = async () => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    try {
      this.setState({open: false});
      const granted = await locationPermission();
      if (granted) {
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
      }
    } catch (error) {
      console.log(error, 'I am here ');
    }
  };

  onChangeText = (text) => {
    this.emojiUnicode(text);
    this.setState({message: text});
  };

  NotificationCallPhone = async (type) => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    if (this.props.route.params.msg_type == '0') {
      const headers = new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '1111',
        device_token: this.state.fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      });
      if (type === 1) {
        try {
          this.setState({calling: true});
          let formData = new FormData();
          formData.append('user_id', this.state.userId);
          formData.append('calling_id', this.props.route.params.userid);
          var RecentShare = `${BASE_URL}api-user/generate-token`;
          const response1 = await fetch(RecentShare, {
            method: 'Post',
            headers: headers,
            body: formData,
          });
          const result1 = await response1.json();
          if (result1.code == '200') {
            this.setState({calling: false});
            this.props.navigation.navigate('VideoCallScreen', {
              fromid: this.state.userId,
              toid: this.props.route.params.userid,
              useravatar: this.props.route.params.useravatar,
              token: result1.data.token,
              channel: result1.data.channel,
              calling: true,
              receiving: false,
            });
          } else {
            alert('something went wrong');
            this.setState({calling: false});
          }
        } catch (error) {
          alert('something went wrong');
          this.setState({calling: false});
        }
      }
      if (type === 0) {
        try {
          this.setState({calling: true});
          let formData = new FormData();
          formData.append('user_id', this.state.userId);
          formData.append('calling_id', this.props.route.params.userid);
          var RecentShare = `${BASE_URL}api-user/generate-token`;
          const response1 = await fetch(RecentShare, {
            method: 'Post',
            headers: headers,
            body: formData,
          });
          const result1 = await response1.json();
          if (result1.code == '200') {
            this.setState({calling: false});
            this.props.navigation.navigate('VoiceCallScreen', {
              fromid: this.state.userId,
              toid: this.props.route.params.userid,
              useravatar: this.props.route.params.useravatar,
              token: result1.data.token,
              channel: result1.data.channel,
              calling: true,
              receiving: false,
            });
          } else {
            alert('something went wrong');
            this.setState({calling: false});
          }
        } catch (error) {
          alert('something went wrong');
          this.setState({calling: false});
        }
      }
    }
    if (this.props.route.params.msg_type == '1') {
      alert('not implemented for group');
    }
  };

  deleteMessages = (type) => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    const {fcmToken, userId, userAccessToken, forwardMessageIds} = this.state;
    const msgids = JSON.stringify(forwardMessageIds);
    const data = new FormData();

    data.append('user_id', userId);
    data.append('msgids', msgids.substring(1, msgids.length - 1));
    data.append('type', type);

    var EditProfileUrl = `${BASE_URL}api-message/delete-message`;

    fetch(EditProfileUrl, {
      method: 'POST',
      headers: {
        device_id: '1234',
        device_token: fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(userAccessToken),
      },
      body: data,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          if (this.state.chatList.messages.length === 1) {
            this.setState({ischatList: false});
          }
          this.setState({
            selectedMode: false,
            showEveryone: false,
            forwardMessageIds: [],
            deletemodal: false,
          });
          this.getConversationList();
        } else {
        }
      })
      .catch((error) => {})
      .finally(() => {});
  };

  clearMessages = () => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    Alert.alert(
      'Clear Chat',
      'Are you sure to clear whole chat ??',
      [
        {
          text: 'No',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            const {
              fcmToken,
              userId,
              userAccessToken,
              forwardMessageIds,
            } = this.state;

            const data = new FormData();

            data.append('user_id', userId);
            data.append('type', this.props.route.params.msg_type);
            data.append('toid', this.props.route.params.userid);
            var EditProfileUrl = `${BASE_URL}api-message/clear-all`;

            fetch(EditProfileUrl, {
              method: 'POST',
              headers: {
                device_id: '1234',
                device_token: fcmToken,
                device_type: Platform.OS,
                Authorization: JSON.parse(userAccessToken),
              },
              body: data,
            })
              .then((response) => response.json())
              .then((responseData) => {
                console.log(JSON.stringify(responseData, null, 2));
                if (responseData.code == '200') {
                  this.setState({chatList: {messages: []}});
                } else {
                }
              })
              .catch((error) => {
                console.log(JSON.stringify(error, null, 2));
              })
              .finally(() => {});
          },
        },
      ],
      {cancelable: false},
    );
  };

  emojiUnicode = (emoji) => {
    var comp;

    if (emoji.length === 1) {
      comp = emoji.charCodeAt(0);
    }
    comp =
      (emoji.charCodeAt(0) - 0xd800) * 0x400 +
      (emoji.charCodeAt(1) - 0xdc00) +
      0x10000;
    if (comp < 0) {
      comp = emoji.charCodeAt(0);
    }

    return comp.toString('16');
  };
  convertEmoji = (text) => {
    return text.replace(/\\u[\dA-F]{4}/gi, function (match) {
      return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
    });
  };

  changeUpdateSettings = (param) => {
    this.setState((p) => ({...p, chatList: {...p.chatList, isupdate: param}}));
  };

  changeMessageSettings = (param) => {
    this.setState((p) => ({...p, chatList: {...p.chatList, msgsend: param}}));
  };

  openProfile = () => {
    if (!this.props.isConnected) {
      alert('It Seems that you are offline');
      return;
    }
    let items = this.props.route.params.useravatar;
    let id = this.props.route.params.userid;
    let name = this.props.route.params.username;
    let about = this.props.route.params.userabout;
    let phone = this.props.route.params.userphone;
    let groupid = this.props.route.params.groupId;

    // console.log(items, '!!!');
    // console.log(id, '!!!');
    // console.log(name, '!!!');
    // console.log(about, '!!!');
    // console.log(phone, '!!!');
    // console.log(groupid, '!!!');

    if (this.props.route.params.msg_type == '1') {
      const {isupdate, msgsend} = this.state.chatList;
      if (this.state.useravatar) {
        this.props.navigation.navigate('GroupProfile', {
          imageURL: this.state.useravatar,
          name: this.state.username,
          about: about,
          phone: phone,
          groupId: groupid,
          changeProfile: this.changeProfile,
          isupdate,
          msgsend,
          changeUpdateSettings: this.changeUpdateSettings,
          changeMessageSettings: this.changeMessageSettings,
        });
      } else {
        this.props.navigation.navigate('GroupProfile', {
          imageURL: '',
          name: this.state.username,
          about: about,
          phone: phone,
          groupId: groupid,
          changeProfile: this.changeProfile,
          isupdate,
          msgsend,
          changeUpdateSettings: this.changeUpdateSettings,
          changeMessageSettings: this.changeMessageSettings,
        });
      }
    } else {
      if (items) {
        this.props.navigation.navigate('ChatProfile', {
          imageURL: items,
          name: name,
          about: about,
          phone: phone,
          userid: id,
        });
      } else {
        this.props.navigation.navigate('ChatProfile', {
          imageURL: '',
          name: name,
          about: about,
          phone: phone,
          userid: id,
        });
      }
    }
  };
  onSlideRight = () => {
    //perform Action on slide success.
  };
  SendReportIssue() {
    let formData = new FormData();
    formData.append('user_id', this.state.userId);
    formData.append('reason', 'Report User');
    formData.append('message', 'Something went wrong with this user');

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
          //   this.props.navigation.navigate('LoginScreen')
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

  swipeToShowReply = (replymsg) => {
    this.setState({replyMessage: replymsg});
    if (replymsg.text.msg_type == 'text') {
      this.setState({showRelymsg: true, borderval: true});
    }
    if (replymsg.text.msg_type == 'location') {
      this.setState({showlocationmsg: true, borderval: true});
    }
    if (replymsg.text.msg_type == 'image') {
      this.setState({showimagerply: true, borderval: true});
    }
    if (replymsg.text.msg_type == 'audio') {
      this.setState({showaudiorply: true, borderval: true});
    }
    if (replymsg.text.msg_type == 'video') {
      this.setState({showvideorply: true, borderval: true});
    }
    if (replymsg.text.msg_type == 'contact') {
      this.setState({showcontactrply: true, borderval: true});
    }
    if (replymsg.text.msg_type == 'file') {
      this.setState({showfilerply: true, borderval: true});
    }
  };

  replytype = () => {
    let replymsg = this.state.replyMessage;
    if (replymsg.text.msg_type == 'text') {
      this.setState({showRelymsg: true, borderval: true});
    }
    if (replymsg.text.msg_type == 'location') {
      this.setState({showlocationmsg: true, borderval: true});
    }
    if (replymsg.text.msg_type == 'image') {
      this.setState({showimagerply: true, borderval: true});
    }
    if (replymsg.text.msg_type == 'audio') {
      this.setState({showaudiorply: true, borderval: true});
    }
    if (replymsg.text.msg_type == 'video') {
      this.setState({showvideorply: true, borderval: true});
    }
    if (replymsg.text.msg_type == 'contact') {
      this.setState({showcontactrply: true, borderval: true});
    }
    if (replymsg.text.msg_type == 'file') {
      this.setState({showfilerply: true, borderval: true});
    }
  };

  scrollToID = (id) => {
    this.setState({scrollToId: id});
    if (this.state.ischatList) {
      const index = this.state.chatList.messages.findIndex((i) => i.id === id);
      if (index > -1) {
        this.scroll.scrollToIndex({index, animated: true});
      }
    }
  };

  setScrollMessageUndefined = () => {
    this.setState({scrollToId: undefined});
  };

  render() {
    const spin = this.state.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    const {searching, forwardMessageTypes, chatList} = this.state;

    const isAllowed =
      chatList.msgsend === undefined ||
      chatList.msgsend == '0' ||
      !!chatList.isAdmin
        ? true
        : false;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{flex: 1}}>
        <SafeAreaView style={{flex: 1}}>
          <Spinner
            visible={
              (this.props.conversationLoading && !this.state.live) ||
              this.state.uploading ||
              this.state.calling
            }
            color="#F01738"
            textStyle={styles.spinnerTextStyle}
          />
          <Container style={{backgroundColor: '#F1F0F2'}}>
            {this.state.imageshow ? (
              <View style={{flex: 1}}>
                <View
                  style={{
                    width: '100%',
                    height: 72,
                    backgroundColor: '#FFFFFF',
                    zIndex: 2,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View style={styles.BackButtonContainer}>
                      <TouchableOpacity
                        onPress={() => {
                          if (this.state.searching) {
                            this.setState({searching: false});
                          } else {
                            this.props.navigation.goBack();
                          }
                        }}>
                        <Image
                          source={require('../images/back_blck_icon.png')}
                          style={styles.backButtonStyle}
                        />
                      </TouchableOpacity>
                    </View>
                    {!searching ? (
                      <>
                        <View style={styles.TitleContainer}>
                          <ImageModal
                            resizeMode="contain"
                            imageBackgroundColor="transparent"
                            source={
                              this.state.useravatar
                                ? {uri: this.state.useravatar}
                                : require('../images/default_user.png')
                            }
                            style={styles.LogoIconStyle}
                          />

                          <TouchableOpacity
                            style={{
                              alignItems: 'center',
                              justifyContent: 'center',
                              paddingLeft: 4,
                            }}
                            onPress={this.openProfile}>
                            <Text
                              style={[
                                styles.TitleStyle,
                                {textAlign: 'left', fontSize: resp(15)},
                              ]}>
                              {this.state.username}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          {this.state.selectedMode ? (
                            <>
                              {this.state.forwardMessageIds.length === 1 ? (
                                <>
                                  <Icon
                                    name="reply"
                                    type="Entypo"
                                    onPress={() => {
                                      this.replytype();
                                    }}
                                    style={{
                                      color: '#2B2B2B',
                                      fontSize: 18,
                                      marginRight: 15,
                                    }}
                                  />
                                  {this.state.isFrom[0] && (
                                    <Icon
                                      name="information-circle-outline"
                                      type="Ionicons"
                                      onPress={async () => {
                                        this.props.navigation.navigate(
                                          'MessageInfoScreen',
                                          {
                                            msg_id: this.state
                                              .forwardMessageIds[0],
                                            user_id: this.state.userId,
                                            role:
                                              this.props.route.params
                                                .msg_type == '1'
                                                ? 'group'
                                                : 'user',
                                          },
                                        );
                                      }}
                                      style={{
                                        color: '#2B2B2B',
                                        fontSize: 24,
                                        marginRight: 15,
                                      }}
                                    />
                                  )}
                                </>
                              ) : null}
                              <Icon
                                name="delete"
                                type="MaterialCommunityIcons"
                                onPress={() => {
                                  this.setState({deletemodal: true});
                                }}
                                style={{
                                  color: '#2B2B2B',
                                  fontSize: 18,
                                  marginRight: 15,
                                }}
                              />
                              {!forwardMessageTypes.some(
                                (item) => item !== 'text',
                              ) ? (
                                <Icon
                                  name="content-copy"
                                  type="MaterialCommunityIcons"
                                  onPress={() => {
                                    this.copyToClipboard();
                                  }}
                                  style={{
                                    color: '#2B2B2B',
                                    fontSize: 18,
                                    marginRight: 15,
                                  }}
                                />
                              ) : null}
                              <Icon
                                name="forward"
                                type="Entypo"
                                onPress={() => {
                                  const msgids = JSON.stringify(
                                    this.state.forwardMessageIds,
                                  );
                                  this.setState({
                                    selectedMode: false,
                                    forwardMessageIds: [],
                                  });
                                  this.props.navigation.navigate(
                                    'ForwardMessageScreen',
                                    {
                                      fcmToken: this.state.fcmToken,
                                      PhoneNumber: this.state.PhoneNumber,
                                      userId: this.state.userId,
                                      userAccessToken: this.state
                                        .userAccessToken,
                                      msgids: msgids.substring(
                                        1,
                                        msgids.length - 1,
                                      ),
                                    },
                                  );
                                }}
                                style={{
                                  color: '#2B2B2B',
                                  fontSize: 18,
                                  marginHorizontal: 10,
                                  marginRight: 15,
                                }}
                              />
                            </>
                          ) : (
                            <>
                              <Icon
                                name="video"
                                onPress={() => {
                                  this.NotificationCallPhone(1);
                                }}
                                type="Feather"
                                style={{
                                  color: '#2B2B2B',
                                  fontSize: 18,
                                  marginRight: 15,
                                }}
                              />
                              <Icon
                                name="phone"
                                type="Feather"
                                onPress={() => {
                                  this.NotificationCallPhone(0);
                                }}
                                style={{
                                  color: '#2B2B2B',
                                  fontSize: 18,
                                  marginHorizontal: 10,
                                  marginRight: 15,
                                }}
                              />

                              <Menu
                                ref={(ref) => (this._menu = ref)}
                                button={
                                  <TouchableOpacity
                                    onPress={() => {
                                      this._menu.show();
                                    }}>
                                    <Icon
                                      name="more-vertical"
                                      type="Feather"
                                      style={{
                                        color: '#2B2B2B',
                                        fontSize: 24,
                                        marginRight: 5,
                                      }}
                                    />
                                  </TouchableOpacity>
                                }>
                                <MenuItem
                                  onPress={() => {
                                    this._menu.hide();
                                    this.openProfile();
                                  }}>
                                  Media,links,and docs
                                </MenuItem>
                                <MenuItem
                                  onPress={() => {
                                    this._menu.hide();
                                    this.setState({searching: true});
                                  }}>
                                  Search
                                </MenuItem>
                                <MenuItem
                                  onPress={() => {
                                    this._menu.hide();
                                    this.clearMessages();
                                  }}>
                                  Clear Chat
                                </MenuItem>
                                <MenuItem
                                  onPress={() => {
                                    this._menu.hide();
                                    this.SendReportIssue();
                                  }}>
                                  Report user
                                </MenuItem>
                              </Menu>
                            </>
                          )}
                        </View>
                      </>
                    ) : (
                      <>
                        <TextInput
                          autoFocus={true}
                          placeholder="Search"
                          onChangeText={(text) =>
                            this.setState({
                              searchText: text,
                              currentIdsList: [],
                              currentSearchIdIndex: undefined,
                            })
                          }
                          value={this.state.searchText}
                          style={{
                            width: '56%',
                            height: 40,
                            borderBottomColor: 'grey',
                            borderBottomWidth: 2,
                            marginLeft: 16,
                          }}
                        />
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Icon
                            name="keyboard-arrow-up"
                            type="MaterialIcons"
                            onPress={() => {
                              this.search('up');
                            }}
                            style={{
                              color: '#2B2B2B',
                              fontSize: 30,
                            }}
                          />
                          <Icon
                            name="keyboard-arrow-down"
                            type="MaterialIcons"
                            onPress={() => {
                              this.search('down');
                            }}
                            style={{
                              color: '#2B2B2B',
                              fontSize: 30,
                              marginHorizontal: 20,
                              marginRight: 15,
                            }}
                          />
                        </View>
                      </>
                    )}
                  </View>
                </View>
                <FlatList
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                  style={{paddingHorizontal: 10, marginTop: '20%', flex: 1}}
                  data={
                    this.state.ischatList ? this.state.chatList.messages : []
                  }
                  ref={(ref) => {
                    this.scroll = ref;
                  }}
                  onContentSizeChange={() =>
                    this.scroll.scrollToEnd({animated: true})
                  }
                  initialNumToRender={
                    this.state.ischatList
                      ? this.state.chatList.messages.length
                      : [].length
                  }
                  renderItem={({item: v, index: i}) => {
                    return (
                      <MessageComponent
                        key={`message-${i}`}
                        message={v}
                        toggleSelectedMode={this.toggleSelectedMode}
                        appendMessages={this.appendMessages}
                        removeMessages={this.removeMessages}
                        selectedMode={this.state.selectedMode}
                        forwardMessageIds={this.state.forwardMessageIds}
                        copyText={this.copyText}
                        replyMessage={this.replyTo}
                        setAudioId={this.setAudioId}
                        playingAudioId={this.state.playingAudioId}
                        FILES={this.state.FILES}
                        updateFilesArray={this.updateFilesArray}
                        scrollToID={this.scrollToID}
                        scrollMessageId={this.state.scrollToId}
                        setScrollMessageUndefined={
                          this.setScrollMessageUndefined
                        }
                        messageIdList={this.state.messageIdList}
                        membersCount={this.props.route.params.membersCount}
                        startMessageCaller={this.startMessageCaller}
                        searchText={this.state.searchText}
                        swipeToShowReply={this.swipeToShowReply}
                      />
                    );
                  }}
                />
                {/* </ScrollView> */}

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
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
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
                              style={{
                                width: 15,
                                height: 20,
                                alignSelf: 'center',
                              }}
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
                        <TouchableOpacity
                          onPress={() => {
                            this.videoPicker();
                          }}>
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
                              style={{
                                width: 20,
                                height: 15,
                                alignSelf: 'center',
                              }}
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
                        <TouchableOpacity
                          onPress={() => {
                            this.selectOneFile1();
                          }}>
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
                              style={{
                                alignSelf: 'center',
                                width: 15,
                                height: 15,
                              }}
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
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
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
                            // resizeMode="center"
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
                        <TouchableOpacity
                          onPress={() => {
                            this.contactPicker();
                          }}>
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
                              // resizeMode="center"
                              style={{
                                alignSelf: 'center',
                                width: 15,
                                height: 20,
                              }}
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
                {(this.props.route.params.groupexit == false ||
                  this.props.route.params.groupexit == undefined) &&
                isAllowed ? (
                  <View>
                    {this.state.showRelymsg == true ? (
                      this.state.replyMessage.text.fmsg !== '' ? (
                        <View
                          style={{
                            width: '80%',
                            backgroundColor: '#e5e5e5',
                            marginHorizontal: 15,
                            height: 'auto',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                          }}>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'red',
                              }}>
                              You
                            </Text>
                            <View>
                              <Icon
                                type="Entypo"
                                name="cross"
                                style={{fontSize: 20, textAlign: 'right'}}
                                onPress={() => {
                                  this.setState({
                                    showRelymsg: false,
                                    selectedMode: false,
                                    forwardMessageIds: [],
                                  });
                                }}
                              />
                            </View>
                            {/* <View style={{borderWidth:1,borderColor:'red'}}></View> */}
                          </View>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              marginRight: 10,
                            }}>
                            <Text style={{marginBottom: 5, color: '#191919'}}>
                              {this.state.replyMessage.text.fmsg}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View
                          style={{
                            width: '80%',
                            backgroundColor: '#e5e5e5',
                            marginHorizontal: 15,
                            height: 'auto',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                          }}>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'green',
                              }}>
                              {this.props.route.params.username}
                            </Text>
                            <View>
                              <Icon
                                type="Entypo"
                                name="cross"
                                style={{fontSize: 20, textAlign: 'right'}}
                                onPress={() => {
                                  this.setState({
                                    showRelymsg: false,
                                    selectedMode: false,
                                    forwardMessageIds: [],
                                  });
                                }}
                              />
                            </View>
                            {/* <View style={{borderWidth:1,borderColor:'red'}}></View> */}
                          </View>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              marginRight: 10,
                            }}>
                            <Text style={{marginBottom: 5, color: '#191919'}}>
                              {this.state.replyMessage.text.tmsg}
                            </Text>
                          </View>
                        </View>
                      )
                    ) : null}
                    {this.state.showimagerply == true ? (
                      this.state.replyMessage.text.fattach != '' ? (
                        <View
                          style={{
                            width: '80%',
                            backgroundColor: '#e5e5e5',
                            marginHorizontal: 15,
                            height: 'auto',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                          }}>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'red',
                              }}>
                              You
                            </Text>
                            <View>
                              <Icon
                                type="Entypo"
                                name="cross"
                                style={{fontSize: 20, textAlign: 'right'}}
                                onPress={() => {
                                  this.setState({
                                    showimagerply: false,
                                    selectedMode: false,
                                    forwardMessageIds: [],
                                  });
                                }}
                              />
                            </View>
                            {/* <View style={{borderWidth:1,borderColor:'red'}}></View> */}
                          </View>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              marginRight: 10,
                              flexDirection: 'row',
                            }}>
                            <Image
                              style={{
                                marginBottom: 5,
                                color: '#191919',
                                width: 40,
                                height: 40,
                                alignSelf: 'flex-end',
                              }}
                              source={{
                                uri: this.state.replyMessage.text.fattach
                                  .attach,
                              }}></Image>
                          </View>
                        </View>
                      ) : this.state.replyMessage.text.tattach != '' ? (
                        <View
                          style={{
                            width: '80%',
                            backgroundColor: '#e5e5e5',
                            marginHorizontal: 15,
                            height: 'auto',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                          }}>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'green',
                              }}>
                              {this.props.route.params.username}
                            </Text>
                            <View>
                              <Icon
                                type="Entypo"
                                name="cross"
                                style={{fontSize: 20, textAlign: 'right'}}
                                onPress={() => {
                                  this.setState({
                                    showimagerply: false,
                                    selectedMode: false,
                                    forwardMessageIds: [],
                                  });
                                }}
                              />
                            </View>
                            {/* <View style={{borderWidth:1,borderColor:'red'}}></View> */}
                          </View>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              marginRight: 10,
                            }}>
                            <Image
                              style={{
                                marginBottom: 5,
                                width: 40,
                                height: 40,
                                alignSelf: 'flex-end',
                              }}
                              source={{
                                uri: this.state.replyMessage.text.tattach
                                  .attach,
                              }}></Image>
                            {/* <Text style={{marginBottom:5,color:'#191919'}}>{this.state.replyMessage.text.tattach.attach}</Text> */}
                          </View>
                        </View>
                      ) : null
                    ) : null}
                    {this.state.showaudiorply == true ? (
                      this.state.replyMessage.text.fattach != '' ? (
                        <View
                          style={{
                            width: '80%',
                            backgroundColor: '#e5e5e5',
                            marginHorizontal: 15,
                            height: 'auto',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                          }}>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'red',
                              }}>
                              You
                            </Text>
                            <View>
                              <Icon
                                type="Entypo"
                                name="cross"
                                style={{fontSize: 20, textAlign: 'right'}}
                                onPress={() => {
                                  this.setState({
                                    showaudiorply: false,
                                    selectedMode: false,
                                    forwardMessageIds: [],
                                  });
                                }}
                              />
                            </View>
                            {/* <View style={{borderWidth:1,borderColor:'red'}}></View> */}
                          </View>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              marginRight: 10,
                              flexDirection: 'row',
                            }}>
                            <Icon
                              name="mic"
                              type="Feather"
                              style={{
                                color: 'black',
                                fontSize: 18,
                                alignSelf: 'center',
                              }}
                            />
                            <Text style={{marginBottom: 5, color: '#191919'}}>
                              Voice message
                            </Text>
                          </View>
                        </View>
                      ) : this.state.replyMessage.text.tattach != '' ? (
                        <View
                          style={{
                            width: '80%',
                            backgroundColor: '#e5e5e5',
                            marginHorizontal: 15,
                            height: 'auto',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                          }}>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'green',
                              }}>
                              {this.props.route.params.username}
                            </Text>
                            <View>
                              <Icon
                                type="Entypo"
                                name="cross"
                                style={{fontSize: 20, textAlign: 'right'}}
                                onPress={() => {
                                  this.setState({
                                    showaudiorply: false,
                                    selectedMode: false,
                                    forwardMessageIds: [],
                                  });
                                }}
                              />
                            </View>
                            {/* <View style={{borderWidth:1,borderColor:'red'}}></View> */}
                          </View>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              marginRight: 10,
                              flexDirection: 'row',
                            }}>
                            <Icon
                              name="mic"
                              type="Feather"
                              style={{
                                color: 'black',
                                fontSize: 18,
                                alignSelf: 'center',
                              }}
                            />
                            <Text style={{marginBottom: 5, color: '#191919'}}>
                              Voice message
                            </Text>
                            {/* <Text style={{marginBottom:5,color:'#191919'}}>{this.state.replyMessage.text.tattach.attach}</Text> */}
                          </View>
                        </View>
                      ) : null
                    ) : null}
                    {this.state.showcontactrply == true ? (
                      this.state.replyMessage.text.fmsg != '' ? (
                        <View
                          style={{
                            width: '80%',
                            backgroundColor: '#e5e5e5',
                            marginHorizontal: 15,
                            height: 'auto',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                          }}>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'red',
                              }}>
                              You
                            </Text>
                            <View>
                              <Icon
                                type="Entypo"
                                name="cross"
                                style={{fontSize: 20, textAlign: 'right'}}
                                onPress={() => {
                                  this.setState({
                                    showcontactrply: false,
                                    selectedMode: false,
                                    forwardMessageIds: [],
                                  });
                                }}
                              />
                            </View>
                            {/* <View style={{borderWidth:1,borderColor:'red'}}></View> */}
                          </View>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              marginRight: 10,
                              flexDirection: 'row',
                            }}>
                            <Icon
                              name="user"
                              type="Feather"
                              style={{
                                color: 'black',
                                fontSize: 18,
                                alignSelf: 'center',
                              }}
                            />
                            <Text
                              style={{
                                marginBottom: 5,
                                color: '#191919',
                                marginLeft: 8,
                              }}>
                              Contact
                            </Text>
                          </View>
                        </View>
                      ) : this.state.replyMessage.text.tattach != '' ? (
                        <View
                          style={{
                            width: '80%',
                            backgroundColor: '#e5e5e5',
                            marginHorizontal: 15,
                            height: 'auto',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                          }}>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'green',
                              }}>
                              {this.props.route.params.username}
                            </Text>
                            <View>
                              <Icon
                                type="Entypo"
                                name="cross"
                                style={{fontSize: 20, textAlign: 'right'}}
                                onPress={() => {
                                  this.setState({
                                    showcontactrply: false,
                                    selectedMode: false,
                                    forwardMessageIds: [],
                                  });
                                }}
                              />
                            </View>
                            {/* <View style={{borderWidth:1,borderColor:'red'}}></View> */}
                          </View>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              marginRight: 10,
                              flexDirection: 'row',
                            }}>
                            <Icon
                              name="user"
                              type="Feather"
                              style={{
                                color: 'black',
                                fontSize: 18,
                                alignSelf: 'center',
                              }}
                            />
                            <Text
                              style={{
                                marginBottom: 5,
                                color: '#191919',
                                marginLeft: 8,
                              }}>
                              Contact
                            </Text>

                            {/* <Text style={{marginBottom:5,color:'#191919'}}>{this.state.replyMessage.text.tattach.attach}</Text> */}
                          </View>
                        </View>
                      ) : null
                    ) : null}
                    {this.state.showfilerply == true ? (
                      this.state.replyMessage.text.fattach != '' ? (
                        <View
                          style={{
                            width: '80%',
                            backgroundColor: '#e5e5e5',
                            marginHorizontal: 15,
                            height: 'auto',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                          }}>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'red',
                              }}>
                              You
                            </Text>
                            <View>
                              <Icon
                                type="Entypo"
                                name="cross"
                                style={{fontSize: 20, textAlign: 'right'}}
                                onPress={() => {
                                  this.setState({
                                    showfilerply: false,
                                    selectedMode: false,
                                    forwardMessageIds: [],
                                  });
                                }}
                              />
                            </View>
                            {/* <View style={{borderWidth:1,borderColor:'red'}}></View> */}
                          </View>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              marginRight: 10,
                              flexDirection: 'row',
                            }}>
                            <Icon
                              name="file"
                              type="Feather"
                              style={{
                                color: 'black',
                                fontSize: 18,
                                alignSelf: 'center',
                              }}
                            />
                            <Text
                              style={{
                                marginBottom: 5,
                                color: '#191919',
                                marginLeft: 5,
                              }}>
                              Document
                            </Text>
                          </View>
                        </View>
                      ) : this.state.replyMessage.text.tattach != '' ? (
                        <View
                          style={{
                            width: '80%',
                            backgroundColor: '#e5e5e5',
                            marginHorizontal: 15,
                            height: 'auto',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                          }}>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'green',
                              }}>
                              {this.props.route.params.username}
                            </Text>
                            <View>
                              <Icon
                                type="Entypo"
                                name="cross"
                                style={{fontSize: 20, textAlign: 'right'}}
                                onPress={() => {
                                  this.setState({
                                    showfilerply: false,
                                    selectedMode: false,
                                    forwardMessageIds: [],
                                  });
                                }}
                              />
                            </View>
                            {/* <View style={{borderWidth:1,borderColor:'red'}}></View> */}
                          </View>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              marginRight: 10,
                              flexDirection: 'row',
                            }}>
                            <Icon
                              name="file"
                              type="Feather"
                              style={{
                                color: 'black',
                                fontSize: 18,
                                alignSelf: 'center',
                              }}
                            />
                            <Text
                              style={{
                                marginBottom: 5,
                                color: '#191919',
                                marginLeft: 5,
                              }}>
                              Document
                            </Text>
                            {/* <Text style={{marginBottom:5,color:'#191919'}}>{this.state.replyMessage.text.tattach.attach}</Text> */}
                          </View>
                        </View>
                      ) : null
                    ) : null}
                    {this.state.showvideorply == true ? (
                      this.state.replyMessage.text.fattach != '' ? (
                        <View
                          style={{
                            width: '80%',
                            backgroundColor: '#e5e5e5',
                            marginHorizontal: 15,
                            height: 'auto',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                          }}>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'red',
                              }}>
                              You
                            </Text>
                            <View>
                              <Icon
                                type="Entypo"
                                name="cross"
                                style={{fontSize: 20, textAlign: 'right'}}
                                onPress={() => {
                                  this.setState({
                                    showfilerply: false,
                                    selectedMode: false,
                                    forwardMessageIds: [],
                                  });
                                }}
                              />
                            </View>
                            {/* <View style={{borderWidth:1,borderColor:'red'}}></View> */}
                          </View>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              marginRight: 10,
                              flexDirection: 'row',
                            }}>
                            <Icon
                              name="video"
                              type="Feather"
                              style={{
                                color: 'black',
                                fontSize: 18,
                                alignSelf: 'center',
                              }}
                            />
                            <Text
                              style={{
                                marginBottom: 5,
                                color: '#191919',
                                marginLeft: 5,
                              }}>
                              Video
                            </Text>
                          </View>
                        </View>
                      ) : this.state.replyMessage.text.tattach != '' ? (
                        <View
                          style={{
                            width: '80%',
                            backgroundColor: '#e5e5e5',
                            marginHorizontal: 15,
                            height: 'auto',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                          }}>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'green',
                              }}>
                              {this.props.route.params.username}
                            </Text>
                            <View>
                              <Icon
                                type="Entypo"
                                name="cross"
                                style={{fontSize: 20, textAlign: 'right'}}
                                onPress={() => {
                                  this.setState({
                                    showfilerply: false,
                                    selectedMode: false,
                                    forwardMessageIds: [],
                                  });
                                }}
                              />
                            </View>
                            {/* <View style={{borderWidth:1,borderColor:'red'}}></View> */}
                          </View>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              marginRight: 10,
                              flexDirection: 'row',
                            }}>
                            <Icon
                              name="video"
                              type="Feather"
                              style={{
                                color: 'black',
                                fontSize: 18,
                                alignSelf: 'center',
                              }}
                            />
                            <Text
                              style={{
                                marginBottom: 5,
                                color: '#191919',
                                marginLeft: 5,
                              }}>
                              Video
                            </Text>
                            {/* <Text style={{marginBottom:5,color:'#191919'}}>{this.state.replyMessage.text.tattach.attach}</Text> */}
                          </View>
                        </View>
                      ) : null
                    ) : null}

                    {this.state.showlocationmsg == true ? (
                      this.state.replyMessage.text.fmsg != '' ? (
                        <View
                          style={{
                            width: '80%',
                            backgroundColor: '#e5e5e5',
                            marginHorizontal: 15,
                            height: 'auto',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                          }}>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'red',
                              }}>
                              You
                            </Text>
                            <View>
                              <Icon
                                type="Entypo"
                                name="cross"
                                style={{fontSize: 20, textAlign: 'right'}}
                                onPress={() => {
                                  this.setState({
                                    showlocationmsg: false,
                                    selectedMode: false,
                                    forwardMessageIds: [],
                                  });
                                }}
                              />
                            </View>
                            {/* <View style={{borderWidth:1,borderColor:'red'}}></View> */}
                          </View>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              marginRight: 10,
                              flexDirection: 'row',
                            }}>
                            <Icon
                              name="location"
                              type="Entypo"
                              style={{
                                color: 'black',
                                fontSize: 18,
                                alignSelf: 'center',
                              }}
                            />
                            <Text
                              style={{
                                marginBottom: 5,
                                color: '#191919',
                                marginLeft: 8,
                              }}>
                              Location
                            </Text>
                          </View>
                        </View>
                      ) : this.state.replyMessage.text.tattach != '' ? (
                        <View
                          style={{
                            width: '80%',
                            backgroundColor: '#e5e5e5',
                            marginHorizontal: 15,
                            height: 'auto',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                          }}>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'green',
                              }}>
                              {this.props.route.params.username}
                            </Text>
                            <View>
                              <Icon
                                type="Entypo"
                                name="cross"
                                style={{fontSize: 20, textAlign: 'right'}}
                                onPress={() => {
                                  this.setState({
                                    showcontactrply: false,
                                    selectedMode: false,
                                    forwardMessageIds: [],
                                  });
                                }}
                              />
                            </View>
                            {/* <View style={{borderWidth:1,borderColor:'red'}}></View> */}
                          </View>
                          <View
                            style={{
                              marginLeft: 10,
                              marginTop: 5,
                              marginRight: 10,
                              flexDirection: 'row',
                            }}>
                            <Icon
                              name="location"
                              type="Entypo"
                              style={{
                                color: 'black',
                                fontSize: 18,
                                alignSelf: 'center',
                              }}
                            />
                            <Text
                              style={{
                                marginBottom: 5,
                                color: '#191919',
                                marginLeft: 8,
                              }}>
                              Location
                            </Text>

                            {/* <Text style={{marginBottom:5,color:'#191919'}}>{this.state.replyMessage.text.tattach.attach}</Text> */}
                          </View>
                        </View>
                      ) : null
                    ) : null}

                    {!searching && (
                      <View
                        style={{
                          flexDirection: 'row',
                          marginBottom: height * 0.001,
                          alignItems: 'center',
                        }}>
                        <LottieView
                          style={{
                            position: 'absolute',
                            width: 36,
                            height: 36,
                            zIndex: 5,
                            left: Platform.OS === 'android' ? 6 : 4,
                            bottom: Platform.OS === 'android' ? 4 : 2,
                          }}
                          progress={this.state.progress}
                          source={require('../lottie/lf30_editor_usyzjoyb.json')}
                        />
                        {this.state.recording ? (
                          <View
                            style={{
                              width: '60%',
                              backgroundColor: '#FFFFFF',
                              color: '#0000008A',
                              height:
                                Platform.OS === 'android'
                                  ? this.state.height
                                  : this.state.height + 20,
                              borderTopLeftRadius: this.state.borderval
                                ? 0
                                : 15,
                              borderBottomLeftRadius: 15,
                              marginLeft: 10,
                              borderRadius: 1,
                              paddingLeft: 10,
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Animated.View
                              style={{
                                zIndex: 10,
                                transform: [{translateY: this.state.bottom}],
                              }}>
                              <Animated.View
                                style={{transform: [{rotate: spin}]}}>
                                <Icon
                                  name="mic"
                                  type="Ionicons"
                                  style={{
                                    color: 'red',
                                    fontSize: 24,
                                  }}
                                />
                              </Animated.View>
                            </Animated.View>
                            <Text style={{marginLeft: 4}}>
                              {format(this.state.timer)}
                            </Text>
                          </View>
                        ) : (
                          <TextInput
                            ref={(ref) => (this.inputRef = ref)}
                            multiline={true}
                            value={this.state.message}
                            onContentSizeChange={(event) => {
                              this.setState({
                                height: event.nativeEvent.contentSize.height,
                              });
                            }}
                            onChangeText={(text) => this.onChangeText(text)}
                            placeholder="Type a message…"
                            editable={this.state.editMode}
                            style={{
                              marginLeft: 10,
                              marginRight: 10,
                              backgroundColor: '#FFFFFF',
                              color: '#0000008A',
                              borderRadius: 1,
                              width: '60%',
                              height:
                                Platform.OS === 'android'
                                  ? this.state.height
                                  : this.state.height + 20,
                              fontSize: 15,
                              paddingLeft: 10,
                              borderWidth: 0,
                              borderTopLeftRadius: this.state.borderval
                                ? 0
                                : 15,
                              borderBottomLeftRadius: 15,
                            }}
                          />
                        )}
                        <View
                          style={{
                            backgroundColor: '#FFFFFF',
                            alignSelf: 'center',
                            height:
                              Platform.OS === 'android'
                                ? this.state.height
                                : this.state.height + 20,
                            width: '20%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 0,
                            marginLeft: -10,
                            borderTopRightRadius: this.state.borderval ? 0 : 15,
                            borderBottomRightRadius: 15,
                            paddingBottom: 4,
                            marginBottom: height * 0.001,
                          }}>
                          <View style={{flexDirection: 'row'}}>
                            {this.state.recording && !this.state.locked ? (
                              <Icon
                                name="chevron-back"
                                type="Ionicons"
                                style={{
                                  fontSize: 24,
                                  alignSelf: 'center',
                                }}
                              />
                            ) : this.state.locked ? (
                              <Text
                                onPress={() => this.animateAndThenCancel()}
                                style={{color: 'red'}}>
                                CANCEL
                              </Text>
                            ) : (
                              <Icon
                                onPress={() => {
                                  this.setState((p) => ({
                                    open: !p.open,
                                    editMode: !p.editMode,
                                    message: '',
                                  }));
                                }}
                                name="attachment"
                                type="MaterialIcons"
                                style={{color: '#0000008A', marginRight: 8}}
                              />
                            )}
                            {!this.state.message.length > 0 &&
                            !this.state.recording ? (
                              <Icon
                                onPress={() => {
                                  this.launchCamera();
                                }}
                                name="photo-camera"
                                type="MaterialIcons"
                                style={{color: '#0000008A', marginRight: 8}}
                              />
                            ) : null}
                            {this.state.recording && !this.state.locked && (
                              <Text
                                style={{
                                  width: 200,
                                  paddingHorizontal: 8,
                                  alignSelf: 'center',
                                }}>
                                Slide to cancel
                              </Text>
                            )}
                          </View>
                        </View>
                        <View>
                          {this.state.recording && !this.state.locked ? (
                            <View
                              style={{
                                position: 'absolute',
                                backgroundColor: 'white',
                                height: 180,
                                width: 60,
                                zIndex: 0,
                                bottom: 8,
                                left: 0,
                                borderRadius: 30,
                                justifyContent: 'space-around',
                                alignItems: 'center',
                              }}>
                              <Icon
                                name="lock-open"
                                type="Ionicons"
                                style={{
                                  fontSize: 26,
                                  alignSelf: 'center',
                                }}
                              />
                              <Icon
                                name="chevron-up"
                                type="Ionicons"
                                style={{
                                  fontSize: 24,
                                  alignSelf: 'center',
                                  marginBottom: 24,
                                }}
                              />
                              <Icon
                                name="chevron-up"
                                type="Ionicons"
                                style={{
                                  color: '#FFFFFF',
                                  fontSize: 18,
                                  alignSelf: 'center',
                                }}
                              />
                            </View>
                          ) : null}
                          <Draggable
                            minX={-100}
                            minY={-100}
                            renderSize={this.state.recording ? 80 : 120}
                            x={0}
                            y={-32}
                            // disabled={!this.state.recording}
                            shouldReverse={true}
                            onRelease={(e, wasDragging) => {
                              // this.animate();
                              // return;
                              if (!wasDragging && this.state.recording) {
                                this.onStopRecord();
                                this.setState({recording: false});
                                return;
                              }
                              if (
                                this.state.recording &&
                                e.nativeEvent.pageX / e.nativeEvent.pageY < 0.4
                              ) {
                                this.animateAndThenCancel();
                                // this.onCancel();
                              }
                              if (
                                this.state.recording &&
                                e.nativeEvent.pageX / e.nativeEvent.pageY > 0.4
                              ) {
                                this.setState({locked: true});
                              }
                              if (
                                !this.state.recording &&
                                this.state.message !== ''
                              ) {
                                this.sendMessage();
                              }
                            }}
                            onLongPress={() => {
                              this.startRecording();
                              this.setState({recording: true});
                            }}
                            onPress={() => {
                              if (this.state.locked) {
                                this.onStopRecord();
                                return;
                              }
                              // if (this.state.message !== '') {
                              //   this.sendMessage();
                              // }
                            }}>
                            <View
                              style={{
                                alignSelf: 'flex-end',
                                width:
                                  this.state.recording && !this.state.locked
                                    ? 60
                                    : 40,
                                height:
                                  this.state.recording && !this.state.locked
                                    ? 60
                                    : 40,
                                margin:
                                  this.state.recording && !this.state.locked
                                    ? 0
                                    : 10,
                                borderRadius:
                                  this.state.recording && !this.state.locked
                                    ? 30
                                    : 20,
                                marginBottom: 8,
                                backgroundColor: 'red',
                                justifyContent: 'center',
                              }}>
                              <View>
                                {this.state.message === '' ? (
                                  <Icon
                                    name={
                                      this.state.locked ? 'arrowright' : 'mic'
                                    }
                                    type={
                                      this.state.locked
                                        ? 'AntDesign'
                                        : 'Feather'
                                    }
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
                              </View>
                            </View>
                          </Draggable>
                        </View>
                      </View>
                    )}
                  </View>
                ) : (
                  <>
                    {!(
                      this.props.route.params.groupexit == false ||
                      this.props.route.params.groupexit == undefined
                    ) && (
                      <Text style={{margin: 10, color: 'red'}}>
                        You can't sent message to this group because you're no
                        longer a Participant
                      </Text>
                    )}
                    {(this.props.route.params.groupexit == false ||
                      this.props.route.params.groupexit == undefined) &&
                      !isAllowed && (
                        <Text style={{margin: 10, color: 'red'}}>
                          You can't sent message to this group because only
                          admin is allowed to send message in this group
                        </Text>
                      )}
                  </>
                )}
              </View>
            ) : (
              <SafeAreaInsetsContext.Consumer>
                {(insets) => (
                  <View style={{flex: 1, backgroundColor: 'black'}}>
                    <ScrollView keyboardShouldPersistTaps="always">
                      <View>
                        <Image
                          source={{uri: this.state.imageView.path}}
                          style={{width: 500, height: height}}
                        />

                        <View
                          style={{
                            flexDirection: 'row',
                            position: 'absolute',
                            bottom:
                              Platform.OS === 'ios'
                                ? height * 0.09 + 12
                                : 0 + 12,
                          }}>
                          <TextInput
                            placeholder="Type a caption...."
                            style={{
                              backgroundColor: '#fff',
                              marginTop: 15,
                              width: '90%',
                              height: 42,
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
              </SafeAreaInsetsContext.Consumer>
            )}
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.deletemodal}
              onRequestClose={() => this.closeModal()}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View>
                    <View>
                      <Text style={{margin: 15, fontSize: 15}}>
                        {'Delete Message ?'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{alignItems: 'flex-end', margin: 10}}
                      onPress={() => {
                        this.deleteMessages('1');
                      }}>
                      <Text style={{color: 'red'}}>DELETE FOR ME</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{alignItems: 'flex-end', margin: 10}}
                      onPress={() => {
                        this.setState({
                          deletemodal: false,
                          selectedMode: false,
                          forwardMessageIds: [],
                          showEveryone: false,
                        });
                      }}>
                      <Text style={{color: 'red'}}>CANCEL</Text>
                    </TouchableOpacity>
                    {this.state.showEveryone ? (
                      <TouchableOpacity
                        style={{alignItems: 'flex-end', margin: 10}}
                        onPress={() => {
                          this.deleteMessages('0');
                        }}>
                        <Text style={{color: 'red'}}>DELETE FOR EVERYONE</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>
            </Modal>
          </Container>
        </SafeAreaView>
      </KeyboardAvoidingView>
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 10,
    width: 300,
    height: 'auto',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 15,
  },
  BackButtonContainer: {
    flex: 0.1,
    marginLeft: 5,
    backgroundColor: 'white',
  },
  backButtonStyle: {
    margin: 10,
    height: 20,
    width: 20,
  },
  TitleContainer: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  LogoIconStyle: {
    margin: 5,
    height: 30,
    width: 30,
    borderRadius: 5,
  },
  TitleStyle: {
    fontWeight: 'bold',
    color: 'black',
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
  TabBox: {
    flex: 0.1,
    color: '#000',
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
  StyleHomeTab: {
    marginTop: 5,
    width: 30,
    height: 28,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActiveTextStyle: {
    color: '#FB3954',
    fontSize: resp(10),
    marginTop: 5,
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
  StyleSettingTab: {
    marginTop: 9,
    width: 30,
    height: 30,
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
  StyleChatTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
function mapStateToProps(state) {
  const {
    data: conversationData,
    dataById,
    success: conversationSuccess,
    isLoading: conversationLoading,
    error: conversationError,
  } = state.ConversationListReducer;
  return {
    conversationData,
    conversationSuccess,
    conversationLoading,
    conversationError,
    dataById,
    isConnected: state.network.isConnected,
  };
}
export default connect(mapStateToProps, {
  ConversationListAction,
  toggleChatting,
  clearConversation,
})(ChatDetailScreen);

const newMessage = {
  fattach: null,
  fmsg: '',
  id: 42,
  isread: null,
  msg_type: '',
  reply_id: 0,
  tattach: '',
  time: moment().format('hh:mm'),
  tmsg: '',
  type: '0',
  sending: true,
};

const replyNewMessage = {
  fattach: null,
  fmsg: '',
  id: 42,
  isread: null,
  msg_type: '',
  reply_id: 0,
  reply_msg: {
    id: 605,
    rmsg: '',
    rimage: null,
    isread: '',
    msg_type: '',
    type: '0',
    reply_id: 0,
  },
  tattach: '',
  time: moment().format('hh:mm'),
  tmsg: '',
  type: '1',
  sending: true,
};

const data = {
  fattach: null,
  id: 42,
  isread: '0',
  tattach: '',
  time: '09:07',
  tmsg: '',
  type: '1',
  sending: true,
  msg_type: 'text',
  fmsg: 'Kejriwal',
  reply_id: 649,
  reply_msg: {
    id: 649,
    fmsg: '',
    fattach: '',
    tmsg: '',
    tattach: {
      ext: 'jpg',
      attach:
        'https://www.cartpedal.com/attachments/attachment_1491621162412.jpg',
      caption: '',
    },
    isread: '160,149',
    msg_type: 'image',
    type: '0',
    reply_id: 0,
    reply_msg: '',
    created_at: 1621162412,
    rowdate: '16-05-2021',
    date: '16-05-2021',
    time: '04:23 pm',
    rmsg: '',
  },
};

const data2 = {
  created_at: 1621265861,
  date: '17-05-2021',
  fattach: null,
  fmsg: 'Kejriwal',
  id: 688,
  isread: '149,160',
  msg_type: 'text',
  reply_id: 649,
  reply_msg: {
    id: 649,
    isread: '160,149',
    msg_type: 'image',
    reply_id: 0,
    rimage: {
      attach:
        'https://www.cartpedal.com/attachments/attachment_1491621162412.jpg',
      caption: '',
      ext: 'jpg',
    },
    rmsg: '',
    type: '0',
  },
  rowdate: '17-05-2021',
  tattach: '',
  time: '09:07 pm',
  tmsg: '',
  type: '1',
};
