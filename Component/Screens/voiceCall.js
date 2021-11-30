/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */
import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  SafeAreaView,
} from 'react-native';
import RtcEngine from 'react-native-agora';
import firebase from 'react-native-firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {BASE_URL} from '../Component/ApiClient';

class VoiceCall extends Component {
  _engine;
  constructor(props) {
    super(props);
    this.state = {
      appId: 'b1ff97b3e47244eaa4c0177359705c0f',
      channelName: this.props.route.params.channel,
      token: this.props.route.params.token,
      joinSucceed: false,
      peerIds: [],
      uid: Math.floor(Math.random() * 100), //Generate a UID for local user
      Password: '', //Channel Name for the current session
      vidMute: false, //State variable for Video Mute
      audMute: false,
      color: false, //State variable for storing success
      fcmToken: '',
      userAccessToken: '',
    };
    if (Platform.OS === 'android') {
      this.requestCameraAndAudioPermission().then(() => {
        console.log('requested!');
      });
    }
  }

  componentDidMount = async () => {
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmToken: token});
      }
    });
    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        this.setState({userAccessToken: accessToken});
      }
    });
    const {calling, receiving} = this.props.route.params;
    this._engine = await RtcEngine.create(this.state.appId);
    // Enable the video module.
    await this._engine.enableVideo();
    await this._engine.enableAudio();

    this._engine.addListener('UserJoined', (uid, elapsed) => {
      const {peerIds} = this.state;
      if (peerIds.indexOf(uid) === -1) {
        this.setState({
          peerIds: [...peerIds, uid],
        });
      }
    });

    this._engine.addListener('UserOffline', async (uid, reason) => {
      const {peerIds} = this.state;
      await this.setState({
        // Remove peer ID from state array
        peerIds: peerIds.filter((id) => id !== uid),
      });
      if (this.state.peerIds.length === 0) {
        this.endCall();
      }
    });

    this._engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.log('JoinChannelSuccess', channel, uid, elapsed);
      this.setState({
        joinSucceed: true,
      });
    });

    if (calling && !receiving) {
      await this._engine?.joinChannel(
        this.state.token,
        this.state.channelName,
        null,
        0,
      );
      this.requestCallNotification();
      this._engine?.muteLocalVideoStream(true);
      this._engine?.setEnableSpeakerphone(false);
    }

    this.listener1 = firebase.notifications().onNotification((notification) => {
      if (notification.data.type === '2') {
        this.endCall();
      }
    });

    this.listener2 = firebase.messaging().onMessage((m) => {
      if (m.data.type === '2') {
        this.endCall();
      }
    });
  };

  requestCameraAndAudioPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      if (
        granted['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.CAMERA'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('You can use the cameras & mic');
      } else {
        console.log('Permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  componentWillUnmount() {
    this.listener1();
    this.listener2();
  }

  acceptCall = () => {
    this._engine?.joinChannel(
      this.state.token,
      this.state.channelName,
      null,
      0,
    );
    this._engine?.muteLocalVideoStream(true);
    this._engine?.setEnableSpeakerphone(false);
  };

  sendNotification = async () => {
    const headers = new Headers({
      'Content-Type': 'multipart/form-data',
      device_id: '1111',
      device_token: this.state.fcmToken,
      device_type: Platform.OS,
      Authorization: JSON.parse(this.state.userAccessToken),
    });
    try {
      let formData = new FormData();
      formData.append('user_id', this.props.route.params.toid);
      formData.append('toid', this.props.route.params.fromid);
      formData.append('calltype', 0);
      formData.append('type', 2);
      formData.append('token', this.state.token);
      formData.append('channel', this.state.channelName);
      var RecentShare = `${BASE_URL}api-user/call-notification`;
      const response2 = await fetch(RecentShare, {
        method: 'Post',
        headers,
        body: formData,
      });
      await response2.json();
    } catch (error) {
      console.log(error);
    }
  };

  requestCallNotification = async () => {
    try {
      const headers = new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '1111',
        device_token: this.state.fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      });
      let formData = new FormData();
      formData.append('user_id', this.props.route.params.fromid);
      formData.append('toid', this.props.route.params.toid);
      formData.append('calltype', 0);
      formData.append('type', 0);
      formData.append('token', this.state.token);
      formData.append('channel', this.state.channelName);
      var RecentShare = `${BASE_URL}api-user/call-notification`;
      const response2 = await fetch(RecentShare, {
        method: 'Post',
        headers,
        body: formData,
      });
      const result2 = await response2.json();
    } catch (error) {
      console.log(error);
    }
  };

  rejectCall = async () => {
    await this.sendNotification();
    this.setState({color: true});
    this.setState(
      {
        peerIds: [],
        joinSucceed: false,
      },
      () => {
        this.props.navigation.goBack();
      },
    );
  };

  endCall = async () => {
    this.setState({color: true});
    await this._engine?.leaveChannel();
    this.setState(
      {
        peerIds: [],
        joinSucceed: false,
      },
      () => {
        this.props.navigation.goBack();
      },
    );
  };

  async toggleAudio() {
    let mute = this.state.audMute;
    console.log('Audio toggle', mute);
    await this._engine?.muteLocalAudioStream(!mute);

    this.setState({
      audMute: !mute,
    });
  }

  toggleVideo() {
    let mute = this.state.vidMute;
    this.setState({
      vidMute: !mute,
    });
    this._engine?.setEnableSpeakerphone(!this.state.vidMute);
  }

  videoView() {
    const {calling, receiving} = this.props.route.params;
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.max}>
          {
            <View style={styles.max}>
              {!this.state.joinSucceed ? (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: 'black',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={
                      this.props.route.params.useravatar
                        ? {
                            uri: this.props.route.params.useravatar,
                          }
                        : require('../images/default_user.png')
                    }
                    style={{width: 220, height: 220}}
                  />
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: 'black',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={
                      this.props.route.params.useravatar
                        ? {uri: this.props.route.params.useravatar}
                        : require('../images/default_user.png')
                    }
                    style={{width: 220, height: 220}}></Image>
                </View>
              )}
            </View>
          }
          {!calling && receiving && !this.state.joinSucceed ? (
            <View
              style={{
                width: '100%',
                position: 'absolute',
                bottom: '12%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: '12%',
              }}>
              <TouchableOpacity
                onPress={this.acceptCall}
                style={{
                  height: 80,
                  width: 80,
                  borderRadius: 40,
                  backgroundColor: 'green',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Icon name="call" style={{color: 'white', fontSize: 48}} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.rejectCall}
                style={{
                  height: 80,
                  width: 80,
                  borderRadius: 40,
                  backgroundColor: 'red',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Icon name="call-end" style={{color: 'white', fontSize: 48}} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonBar}>
              <Icon.Button
                style={styles.iconStyle}
                backgroundColor="#0093E9"
                name={this.state.audMute ? 'mic-off' : 'mic'}
                onPress={() => this.toggleAudio()}
              />
              <Icon.Button
                style={styles.iconStyle}
                backgroundColor="#0093E9"
                name="call-end"
                color={this.state.color ? 'red' : 'white'}
                onPress={() => this.endCall()}
              />
              <Icon.Button
                style={styles.iconStyle}
                backgroundColor="#0093E9"
                name={!this.state.vidMute ? 'volume-mute' : 'volume-up'}
                onPress={() => this.toggleVideo()}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }
  render() {
    return this.videoView();
  }
}
export default VoiceCall;

let dimensions = {
  //get dimensions of the device to use in view styles
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

const styles = StyleSheet.create({
  max: {
    flex: 1,
  },
  buttonHolder: {
    height: 100,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0093E9',
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
  },
  fullView: {
    width: dimensions.width,
    height: dimensions.height,
    position: 'absolute',
    zIndex: -1,
  },
  halfViewRow: {
    flex: 1 / 2,
    flexDirection: 'row',
  },
  full: {
    top: 0,
    flex: 1,
    // width: dimensions.width,
    // height: dimensions.height ,
    zIndex: -1,
    // position:'absolute'
  },
  half: {
    flex: 1 / 2,
  },
  localVideoStyle: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 100,
  },
  noUserText: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#0093E9',
  },
  buttonBar: {
    height: 50,
    backgroundColor: '#0093E9',
    display: 'flex',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },
  iconStyle: {
    fontSize: 34,
    paddingTop: 15,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 15,
    borderRadius: 0,
  },
});
