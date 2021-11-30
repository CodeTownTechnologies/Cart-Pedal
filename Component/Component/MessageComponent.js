/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import Hyperlink from 'react-native-hyperlink';
import {useNavigation} from '@react-navigation/native';
import ProgressCircle from 'react-native-progress-circle';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {RectButton} from 'react-native-gesture-handler';
import Lightbox from 'react-native-lightbox';
import VideoPlayer from 'react-native-video-player';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {Icon} from 'native-base';
import Slider from 'react-native-slider';
import {downloadFile, DocumentDirectoryPath} from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import ImageModal from 'react-native-image-modal';
import {IsFileExist, saveFileInCache} from '../utils/FilesCaching';
import Highlighter from 'react-native-highlight-words';
import FastImage from 'react-native-fast-image';

const audioRecorderPlayer = new AudioRecorderPlayer();

const initialize = (sending) => {
  if (sending) {
    return true;
  } else {
    return false;
  }
};

export const MessageComponent = ({
  message,
  selectedMode,
  forwardMessageIds,
  toggleSelectedMode,
  appendMessages,
  removeMessages,
  copyText,
  replyMessage,
  setAudioId,
  playingAudioId,
  FILES,
  updateFilesArray,
  scrollToID,
  scrollMessageId,
  setScrollMessageUndefined,
  messageIdList,
  membersCount,
  startMessageCaller,
  searchText,
  swipeToShowReply,
}) => {
  const swiper = useRef();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(initialize(message.sending));
  const [pause, setpause] = useState(false);
  const [audio1, setAudio1] = useState({
    playing: false,
    duration: 0,
    current: 0,
  });
  const [opacity, setOpacity] = useState(0);
  const [download, setDownload] = useState({downloaded: false, percentage: 0});

  const renderLeftActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 51],
      outputRange: [-50, 0, 1],
    });
    return (
      <Animated.View style={{transform: [{translateX: trans}], width: 50}}>
        <RectButton style={styles.replyAction}>
          <Icon type="MaterialIcons" name="reply" />
          <Text>Reply</Text>
        </RectButton>
      </Animated.View>
    );
  };

  const onLoadStart = () => {
    setOpacity(1);
  };

  const onLoad = () => {
    setOpacity(0);
  };

  const onBuffer = ({isBuffering}) => {
    setOpacity(isBuffering ? 1 : 0);
  };

  const onStartPlay1 = async (uri) => {
    await audioRecorderPlayer.startPlayer(uri);
    setAudio1({...audio1, playing: true});

    audioRecorderPlayer.addPlayBackListener(async (e) => {
      setAudio1((p) => ({
        playing: p.playing,
        current: e.current_position,
        duration: e.duration,
      }));
      if (e.current_position === e.duration) {
        setAudio1((p) => ({
          duration: p.duration,
          current: p.current,
          playing: false,
        }));
        await audioRecorderPlayer.stopPlayer();
        await audioRecorderPlayer.removePlayBackListener();
      }
      return;
    });
  };

  const onPausePlay1 = async () => {
    await audioRecorderPlayer.pausePlayer();
    setAudio1((p) => ({
      current: p.current,
      duration: p.duration,
      playing: false,
    }));
    setpause(true);
  };

  const onPlay = async (uri, messageId) => {
    setAudioId(messageId);
    await audioRecorderPlayer.stopPlayer();
    await audioRecorderPlayer.removePlayBackListener();
    setAudio1((p) => ({
      current: 0,
      duration: 0,
      playing: false,
    }));
    onStartPlay1(uri);
  };

  const onResume = async () => {
    await audioRecorderPlayer.resumePlayer();
    setAudio1((p) => ({
      current: p.current,
      duration: p.duration,
      playing: true,
    }));
    setpause(false);
  };

  const trackDownloadProgress = (e) => {
    setDownload({
      downloaded: true,
      percentage: e.bytesWritten / e.contentLength,
    });
  };

  const downloadAndOpenDocument = async (uri) => {
    if (!uri.includes('http')) {
      FileViewer.open(uri);
    } else {
      const parts = uri.split('/');
      const fileName = parts[parts.length - 1];
      downloadFile({
        fromUrl: uri,
        toFile: `${DocumentDirectoryPath}/${fileName}`,
        progress: trackDownloadProgress,
        begin: () => {},
      }).promise.then((res) => {
        setDownload({downloaded: false, percentage: 1});
        saveFileInCache(uri, `${DocumentDirectoryPath}/${fileName}`);
        updateFilesArray({
          uri,
          localPath: `${DocumentDirectoryPath}/${fileName}`,
        });
        FileViewer.open(`${DocumentDirectoryPath}/${fileName}`, {
          showOpenWithDialog: true,
        });
        setTimeout(() => setDownload({downloaded: false, percentage: 0}), 2000);
      });
    }
  };

  useEffect(() => {
    return async () => {
      await audioRecorderPlayer.stopPlayer();
      await audioRecorderPlayer.removePlayBackListener();
    };
  }, []);

  useEffect(() => {
    if (message.sending) {
      setOpacity(1);
      setSending(true);
    } else {
      setOpacity(0);
      setSending(false);
    }
  }, [message]);

  useEffect(() => {
    if (scrollMessageId === message.id) {
      setTimeout(() => setScrollMessageUndefined(), 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollMessageId]);

  useEffect(() => {
    if (message.id) {
      const length =
        message.isread === null ? 0 : message.isread.split(',').length;
      if (length !== membersCount && !messageIdList.includes(message.id)) {
        startMessageCaller(message.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, messageIdList]);

  const inList = useMemo(() => {
    return forwardMessageIds.indexOf(message.id) !== -1;
  }, [forwardMessageIds, message.id]);

  const navigation = useNavigation();

  let content = null;

  const {msg_type} = message;

  if (msg_type === 'accept') {
    if (message.tmsg !== '') {
      content = (
        <TouchableOpacity
          onPress={() => {
            const split = message.tmsg.split(' ');
            navigation.navigate('OrderRecievedViewScreen', {
              order_id: split[split.length - 4],
            });
          }}
          style={{
            alignSelf: 'flex-start',
            marginVertical: 10,
          }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              elevation: 5,
              width: '70%',
            }}>
            {message.tname ? (
              <View style={{marginLeft: 5, marginRight: 5, marginTop: 5}}>
                <Text style={{color: '#1EA81D', fontSize: 15}}>
                  {message.tname}
                </Text>
              </View>
            ) : null}
            <View
              style={{
                borderWidth: message.reply_msg ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg ? (
                <Text
                  style={{
                    margin: 10,
                    color: 'red',
                    fontSize: 15,
                  }}>
                  {message.reply_msg.rmsg}
                </Text>
              ) : (
                <Hyperlink
                  linkDefault={true}
                  linkStyle={{color: '#2980b9', fontSize: 20}}>
                  <Text
                    style={{
                      margin: 10,
                      color: 'black',
                      fontSize: 12,
                    }}>
                    {message.tmsg}
                  </Text>
                </Hyperlink>
              )}
              {message.reply_msg ? (
                <View style={{backgroundColor: '#fff'}}>
                  <Text
                    style={{
                      marginLeft: 5,
                      marginTop: 8,
                      fontSize: 15,
                      marginRight: 5,
                      color: 'black',
                    }}>
                    {' '}
                    {message.tmsg}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                marginRight: 10,
                marginTop: 5,
                alignSelf: 'flex-start',
              }}>
              {message.time}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    if (message.fmsg !== '') {
      content = (
        <TouchableOpacity
          onPress={() => {
            const split = message.fmsg.split(' ');
            navigation.navigate('OrderRecievedViewScreen', {
              order_id: split[split.length - 4],
            });
          }}
          style={{alignSelf: 'flex-end', marginVertical: 10}}>
          <View
            style={{
              backgroundColor: 'red',
              borderRadius: 8,
              elevation: 5,
              width: '70%',
            }}>
            <View
              style={{
                borderWidth: message.reply_msg ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg ? (
                <Text
                  style={{
                    margin: 10,
                    color: '#fff',
                    fontSize: 15,
                  }}>
                  {message.reply_msg.rmsg}
                </Text>
              ) : (
                <Hyperlink
                  linkDefault={true}
                  linkStyle={{color: '#2980b9', fontSize: 20}}>
                  <Text
                    highlight={'searchText'}
                    style={{
                      margin: 10,
                      color: '#fff',
                      fontSize: 15,
                    }}>
                    {message.fmsg}
                  </Text>
                </Hyperlink>
              )}
              {message.reply_msg ? (
                <View style={{backgroundColor: '#fff'}}>
                  <Text
                    style={{
                      marginLeft: 5,
                      marginTop: 8,
                      fontSize: 15,
                      marginRight: 5,
                      color: 'black',
                    }}>
                    {' '}
                    {message.fmsg}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {message.time}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color:
                    message.isread.split(',').length > 1 ||
                    messageIdList.includes(message.id)
                      ? '#34B7F1'
                      : 'grey',
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      );
    }
  }
  if (msg_type === 'ask_status') {
    if (message.tmsg !== '') {
      content = (
        <TouchableOpacity
          onPress={() => {
            const split = message.tmsg.split(' ');
            navigation.navigate('OderPlacedViewScreen', {
              order_id: split[split.length - 1],
            });
          }}
          style={{
            alignSelf: 'flex-start',
            marginVertical: 10,
          }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              elevation: 5,
              width: '70%',
            }}>
            {message.tname ? (
              <View style={{marginLeft: 5, marginRight: 5, marginTop: 5}}>
                <Text style={{color: '#1EA81D', fontSize: 15}}>
                  {message.tname}
                </Text>
              </View>
            ) : null}
            <View
              style={{
                borderWidth: message.reply_msg ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg != '' ? (
                <Text
                  style={{
                    margin: 10,
                    color: 'red',
                    fontSize: 15,
                  }}>
                  {message.reply_msg.rmsg}
                </Text>
              ) : (
                <Text
                  style={{
                    margin: 10,
                    color: 'black',
                    fontSize: 12,
                  }}>
                  {message.tmsg}
                </Text>
              )}
              {message.reply_msg ? (
                <View style={{backgroundColor: '#fff'}}>
                  <Text
                    style={{
                      marginLeft: 5,
                      marginTop: 8,
                      fontSize: 15,
                      marginRight: 5,
                      color: 'black',
                    }}>
                    {' '}
                    {message.tmsg}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                marginRight: 10,
                marginTop: 5,
                alignSelf: 'flex-start',
              }}>
              {message.time}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    if (message.fmsg !== '') {
      content = (
        <TouchableOpacity
          onPress={() => {
            const split = message.fmsg.split(' ');
            navigation.navigate('OderPlacedViewScreen', {
              order_id: split[split.length - 1],
            });
          }}
          style={{alignSelf: 'flex-end', marginVertical: 10}}>
          <View
            style={{
              backgroundColor: 'red',
              borderRadius: 8,
              elevation: 5,
              width: '70%',
            }}>
            <View
              style={{
                borderWidth: message.reply_msg ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg ? (
                <Text
                  style={{
                    margin: 10,
                    color: '#fff',
                    fontSize: 15,
                  }}>
                  {message.reply_msg.rmsg}
                </Text>
              ) : (
                <Text
                  style={{
                    margin: 10,
                    color: '#fff',
                    fontSize: 15,
                  }}>
                  {message.fmsg}
                </Text>
              )}
              {message.reply_msg ? (
                <View style={{backgroundColor: '#fff'}}>
                  <Text
                    style={{
                      marginLeft: 5,
                      marginTop: 8,
                      fontSize: 15,
                      marginRight: 5,
                      color: 'black',
                    }}>
                    {' '}
                    {message.fmsg}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {message.time}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color:
                    (message.isread !== null &&
                      message.isread.split(',').length === membersCount) ||
                    messageIdList.includes(message.id)
                      ? '#34B7F1'
                      : 'grey',
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      );
    }
  }
  if (msg_type === 'text') {
    if (message.tmsg !== '') {
      content = (
        <View
          style={{
            alignSelf: 'flex-start',
            marginVertical: 10,
          }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              elevation: 5,
              width: '70%',
            }}>
            {message.tname ? (
              <View style={{marginLeft: 5, marginRight: 5, marginTop: 5}}>
                <Text style={{color: '#1EA81D', fontSize: 15}}>
                  {message.tname}
                </Text>
              </View>
            ) : null}
            <View
              style={{
                borderWidth:
                  message.reply_msg && message.reply_msg.length > 0 ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg != '' ? (
                message.reply_msg.msg_type == 'text' ? (
                  <Text
                    onPress={() => scrollToID(message.reply_id)}
                    style={{
                      margin: 10,
                      color: 'red',
                      fontSize: 15,
                    }}>
                    {message.reply_msg.rmsg}
                  </Text>
                ) : message.reply_msg.msg_type == 'contact' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: 'red',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />
                    <Text
                      style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                      Contact
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.msg_type == 'location' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: 'red',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                      Location
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.rimage ? (
                  message.reply_msg.msg_type == 'image' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}>
                      <Image
                        source={{uri: message.reply_msg.rimage.attach}}
                        style={{width: 100, height: 80}}
                      />
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'audio' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: 'red'}}>
                        Voice message
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'video' ? (
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: 'red'}}>
                        {'  Video'}
                      </Text>
                    </View>
                  ) : message.reply_msg.msg_type == 'file' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                        Document
                      </Text>
                    </TouchableOpacity>
                  ) : null
                ) : null
              ) : (
                <Hyperlink
                  linkDefault={true}
                  linkStyle={{color: '#2980b9', fontSize: 20}}>
                  <Highlighter
                    style={{
                      margin: 10,
                      color: 'black',
                      fontSize: 12,
                      textDecorationLine: message.tmsg.includes('http')
                        ? 'underline'
                        : 'none',
                    }}
                    highlightStyle={{backgroundColor: 'yellow', color: 'black'}}
                    searchWords={[searchText.trim()]}
                    textToHighlight={message.tmsg}
                  />
                  {/* <Text
                    style={{
                      margin: 10,
                      color: 'black',
                      fontSize: 12,
                      textDecorationLine: message.tmsg.includes('http')
                        ? 'underline'
                        : 'none',
                    }}>
                    {message.tmsg}
                  </Text> */}
                </Hyperlink>
              )}
              {message.reply_msg ? (
                <View style={{backgroundColor: '#fff'}}>
                  <Text
                    style={{
                      marginLeft: 5,
                      marginTop: 8,
                      fontSize: 15,
                      marginRight: 5,
                      color: 'black',
                    }}>
                    {' '}
                    {message.tmsg}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                marginRight: 10,
                marginTop: 5,
                alignSelf: 'flex-start',
              }}>
              {message.time}
            </Text>
          </View>
        </View>
      );
    }
    if (message.fmsg !== '') {
      // console.log(message.reply_msg);
      content = (
        <View style={{alignSelf: 'flex-end', marginVertical: 10}}>
          <View
            style={{
              backgroundColor: 'red',
              borderRadius: 8,
              elevation: 5,
              width: '70%',
            }}>
            <View
              style={{
                borderWidth:
                  message.reply_msg && message.reply_msg.length > 0 ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg ? (
                message.reply_msg.msg_type == 'text' ? (
                  <Text
                    onPress={() => scrollToID(message.reply_id)}
                    style={{
                      margin: 10,
                      color: '#fff',
                      fontSize: 15,
                    }}>
                    {message.reply_msg.rmsg}
                  </Text>
                ) : message.reply_msg.msg_type == 'contact' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: '#fff',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                      Contact
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.msg_type == 'location' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: '#fff',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                      Location
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.rimage ? (
                  message.reply_msg.msg_type == 'image' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}>
                      <Image
                        source={{uri: message.reply_msg.rimage.attach}}
                        style={{width: 100, height: 80}}
                      />
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'audio' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: '#fff'}}>
                        Voice message
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'video' ? (
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                          marginLeft: 5,
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 8}}>
                        Video
                      </Text>
                    </View>
                  ) : message.reply_msg.msg_type == 'file' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                        Document
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'location' ? (
                    <TouchableOpacity
                      style={{
                        marginLeft: 10,
                        marginTop: 5,
                        marginRight: 10,
                        flexDirection: 'row',
                      }}>
                      <Icon
                        name="location"
                        type="Feather"
                        style={{
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                        Location
                      </Text>
                    </TouchableOpacity>
                  ) : null
                ) : null
              ) : (
                <Hyperlink
                  linkDefault={true}
                  linkStyle={{color: 'white', fontSize: 20}}>
                  {/* <Text
                    style={{
                      margin: 10,
                      color: '#fff',
                      fontSize: 15,
                      textDecorationLine: message.fmsg.includes('http')
                        ? 'underline'
                        : 'none',
                    }}>
                    {message.fmsg}
                  </Text> */}
                  <Highlighter
                    style={{
                      margin: 10,
                      color: '#fff',
                      fontSize: 15,
                      textDecorationLine: message.fmsg.includes('http')
                        ? 'underline'
                        : 'none',
                    }}
                    highlightStyle={{backgroundColor: 'yellow', color: 'black'}}
                    searchWords={[searchText.trim()]}
                    textToHighlight={message.fmsg}
                  />
                </Hyperlink>
              )}
              {message.reply_msg ? (
                <View style={{backgroundColor: '#fff'}}>
                  <Text
                    style={{
                      marginLeft: 5,
                      marginTop: 8,
                      fontSize: 15,
                      marginRight: 5,
                      color: 'black',
                    }}>
                    {' '}
                    {message.fmsg}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {message.time}
              {/* {moment(message.time).format('hh:mm')} */}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color:
                    (message.isread !== null &&
                      message.isread.split(',').length === membersCount) ||
                    messageIdList.includes(message.id)
                      ? '#34B7F1'
                      : 'grey',
                }}
              />
            )}
          </View>
        </View>
      );
    }
  }
  if (msg_type === 'link') {
    if (message.tmsg !== '') {
      let page='';
      const split1 = message.tmsg.split('&');
      if (split1.length > 1) {
           page = split1[1].split('=')[1];
      }
      content = (
        <View
          style={{
            alignSelf: 'flex-start',
            marginVertical: 10,
          }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              elevation: 5,
              width: '70%',
            }}>
            <View style={{borderWidth: 0, borderColor: '#fff'}}>
              <Hyperlink
                linkDefault
                linkStyle={{color: '#2980b9', fontSize: 20}}>
               <Image  source={page!=''?{uri:page}:require('../images/placeholder-image.png')} style={{width:'100%',height:200}}/>
                <Text
                  style={{
                    margin: 10,
                    color: '#2B2B2B',
                    fontSize: 12,
                    textDecorationLine: message.tmsg.includes('http')
                      ? 'underline'
                      : 'none',
                  }}>
                  {message.tmsg}
                </Text>
              </Hyperlink>
            </View>
          </View>

          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                marginRight: 10,
                marginTop: 5,
                alignSelf: 'flex-start',
              }}>
              {message.time}
            </Text>
          </View>
        </View>
      );
    }
    if (message.fmsg !== '') {
    let page='';
      const split1 = message.fmsg.split('&');
      if (split1.length > 1) {
           page = split1[1].split('=')[1];
      }
      content = (
        <View style={{alignSelf: 'flex-end', marginVertical:10}}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 8,
              elevation: 5,
              width: '70%',
            }}>
            <View style={{borderWidth: 0, borderColor: '#fff'}}>
              {message.reply_msg ? (
                <Text
                  style={{
                    margin: 10,
                    color: '#fff',
                    fontSize: 12,
                  }}>
                  {message.reply_msg.rmsg}
                </Text>
              ) : (
                <Hyperlink
                  linkDefault
                  linkStyle={{color: '#2980b9', fontSize: 20}}>
                    <Image source={page!=''?{uri:page}:require('../images/placeholder-image.png')} style={{width:'100%',height:200}}/>
                  <Text
                    style={{
                      margin: 10,
                      color: '#fff',
                      fontSize: 12,
                      textDecorationLine: message.tmsg.includes('http')
                        ? 'underline'
                        : 'none',
                    }}>
                    {message.fmsg}
                  </Text>
                </Hyperlink>
              )}
              {message.reply_msg ? (
                <View style={{backgroundColor: '#fff'}}>
                  <Text
                    style={{
                      marginLeft: 5,
                      marginTop: 8,
                      fontSize: 16,
                      color: 'black',
                    }}>
                    {' '}
                    {message.fmsg}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {message.time}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color:
                    (message.isread !== null &&
                      message.isread.split(',').length === membersCount) ||
                    messageIdList.includes(message.id)
                      ? '#34B7F1'
                      : 'grey',
                }}
              />
            )}
          </View>
        </View>
      );
    }
  }

  if (msg_type === 'contact') {
    if (message.tmsg !== '') {
      const contact = JSON.parse(JSON.parse(message.tmsg));
      content = (
        <View
          style={{
            alignSelf: 'flex-start',
            marginVertical: 10,
          }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              width: '80%',
              elevation: 5,
            }}>
            {message.tname ? (
              <View style={{marginLeft: 5, marginRight: 5, marginTop: 5}}>
                <Text style={{color: '#1EA81D', fontSize: 15}}>
                  {message.tname}
                </Text>
              </View>
            ) : null}
            <View
              style={{
                borderWidth:
                  message.reply_msg && message.reply_msg.length > 0 ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg != '' ? (
                message.reply_msg.msg_type == 'text' ? (
                  <Text
                    onPress={() => scrollToID(message.reply_id)}
                    style={{
                      margin: 10,
                      color: 'red',
                      fontSize: 15,
                    }}>
                    {message.reply_msg.rmsg}
                  </Text>
                ) : message.reply_msg.msg_type == 'contact' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: 'red',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />
                    <Text
                      style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                      Contact
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.msg_type == 'location' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: 'red',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                      Location
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.rimage ? (
                  message.reply_msg.msg_type == 'image' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}>
                      <Image
                        source={{uri: message.reply_msg.rimage.attach}}
                        style={{width: 100, height: 80}}
                      />
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'audio' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: 'red'}}>
                        Voice message
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'video' ? (
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: 'red'}}>
                        Voice message
                      </Text>
                    </View>
                  ) : message.reply_msg.msg_type == 'file' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                        Document
                      </Text>
                    </TouchableOpacity>
                  ) : null
                ) : null
              ) : null}
            </View>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                // elevation: 5,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
              }}>
              <Image
                source={
                  contact.hasThumbnail
                    ? {uri: contact.thumbnailPath}
                    : require('../images/default_user.png')
                }
                style={styles.Styleimage}
              />
              <View style={{paddingHorizontal: 16, alignSelf: 'flex-start'}}>
                <Text
                  onPress={() => navigation.navigate('ViewContact', {contact})}
                  style={{
                    color: '#2980b9',
                    fontSize: 20,
                  }}>
                  {contact.givenName + ' ' + contact.familyName}
                </Text>
                {contact.phoneNumbers &&
                  contact.phoneNumbers.map((i) => (
                    <Text
                      style={{
                        color: '#2B2B2B',
                        fontSize: 12,
                      }}>
                      {i.number}
                    </Text>
                  ))}
              </View>
            </View>
          </View>
          <Text
            style={{
              color: '#524D4D',
              fontSize: 10,
              marginRight: 10,
              marginTop: 5,
              alignSelf: 'flex-start',
            }}>
            {message.time}
          </Text>
        </View>
      );
    }
    if (message.fmsg !== '') {
      let contact = null;
      if (sending) {
        contact = JSON.parse(message.fmsg);
      } else {
        contact = JSON.parse(message.fmsg);
        if (typeof contact === 'string') {
          contact = JSON.parse(contact);
        }
      }

      content = (
        <View style={{alignSelf: 'flex-end', marginVertical: 10}}>
          <View
            style={
              message.reply_msg
                ? {
                    backgroundColor: 'red',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    elevation: 5,
                  }
                : {
                    height: 0,
                  }
            }>
            <View
              style={{
                borderWidth:
                  message.reply_msg && message.reply_msg.length > 0 ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg ? (
                message.reply_msg.msg_type == 'text' ? (
                  <Text
                    onPress={() => scrollToID(message.reply_id)}
                    style={{
                      margin: 10,
                      color: '#fff',
                      fontSize: 15,
                    }}>
                    {message.reply_msg.rmsg}
                  </Text>
                ) : message.reply_msg.msg_type == 'contact' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: '#fff',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                      Contact
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.msg_type == 'location' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: '#fff',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                      Location
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.rimage ? (
                  message.reply_msg.msg_type == 'image' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}>
                      <Image
                        source={{uri: message.reply_msg.rimage.attach}}
                        style={{width: 100, height: 80}}
                      />
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'audio' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: '#fff'}}>
                        Voice message
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'video' ? (
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                          marginLeft: 5,
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 8}}>
                        Video
                      </Text>
                    </View>
                  ) : message.reply_msg.msg_type == 'file' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                        Document
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'location' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
                      style={{
                        marginLeft: 10,
                        marginTop: 5,
                        marginRight: 10,
                        flexDirection: 'row',
                      }}>
                      <Icon
                        name="location"
                        type="Feather"
                        style={{
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                        Location
                      </Text>
                    </TouchableOpacity>
                  ) : null
                ) : null
              ) : null}
            </View>
          </View>

          <View
            style={{
              backgroundColor: message.reply_msg ? 'white' : 'red',
              borderRadius: 8,
              borderTopLeftRadius: message.reply_msg ? 0 : 8,
              borderTopRightRadius: message.reply_msg ? 0 : 8,
              elevation: 5,
              width: '80%',
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
            }}>
            <Image
              source={
                contact.hasThumbnail
                  ? {uri: contact.thumbnailPath}
                  : require('../images/default_user.png')
              }
              style={styles.Styleimage}
            />
            <View style={{paddingHorizontal: 16, alignSelf: 'flex-start'}}>
              <Text
                onPress={() => navigation.navigate('ViewContact', {contact})}
                style={{
                  color: message.reply_msg ? '#2980b9' : '#fff',
                  fontSize: 20,
                }}>
                {contact.givenName + ' ' + contact.familyName}
              </Text>
              {contact.phoneNumbers &&
                contact.phoneNumbers.map((i) => (
                  <Text
                    style={{
                      color: message.reply_msg ? 'black' : '#fff',
                      fontSize: 12,
                    }}>
                    {i.number}
                  </Text>
                ))}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {message.time}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color:
                    (message.isread !== null &&
                      message.isread.split(',').length === membersCount) ||
                    messageIdList.includes(message.id)
                      ? '#34B7F1'
                      : 'grey',
                }}
              />
            )}
          </View>
        </View>
      );
    }
  }

  if (msg_type === 'media' || msg_type === 'image') {
    if (message.tattach !== null && message.tattach !== '') {
      let Component = null;
      if (selectedMode) {
        Component = Image;
      } else {
        Component = ImageModal;
      }
      content = (
        <View style={{alignSelf: 'flex-start', marginVertical: 10}}>
          <View
            style={{
              borderRadius: 8,
              elevation: 5,
              width: '70%',
              backgroundColor: '#fff',
            }}>
            {message.tname ? (
              <View style={{marginLeft: 5, marginRight: 5, marginTop: 5}}>
                <Text style={{color: '#1EA81D', fontSize: 15}}>
                  {message.tname}
                </Text>
              </View>
            ) : null}

            <View
              style={{
                borderWidth:
                  message.reply_msg && message.reply_msg.length > 0 ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg != '' ? (
                message.reply_msg.msg_type == 'text' ? (
                  <Text
                    onPress={() => scrollToID(message.reply_id)}
                    style={{
                      margin: 10,
                      color: 'red',
                      fontSize: 15,
                    }}>
                    {message.reply_msg.rmsg}
                  </Text>
                ) : message.reply_msg.msg_type == 'contact' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: 'red',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />
                    <Text
                      style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                      Contact
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.msg_type == 'location' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: 'red',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                      Location
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.rimage ? (
                  message.reply_msg.msg_type == 'image' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}>
                      <Image
                        source={{uri: message.reply_msg.rimage.attach}}
                        style={{width: 100, height: 80}}
                      />
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'audio' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: 'red'}}>
                        Voice message
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'video' ? (
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: 'red'}}>
                        Voice message
                      </Text>
                    </View>
                  ) : message.reply_msg.msg_type == 'file' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                        Document
                      </Text>
                    </TouchableOpacity>
                  ) : null
                ) : null
              ) : null}
              {message.reply_msg ? (
                <View style={{backgroundColor: '#fff'}}>
                  {message.tmsg != '' ? (
                    <Text
                      style={{
                        marginLeft: 5,
                        marginTop: 8,
                        fontSize: 15,
                        marginRight: 5,
                        color: 'black',
                      }}>
                      {message.tmsg}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>

            <View
              style={{
                borderWidth: 5,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                borderColor: '#fff',
                borderBottomLeftRadius: message.tattach.caption !== '' ? 8 : 7,
                borderBottomRightRadius: message.tattach.caption !== '' ? 8 : 7,
              }}>
              <Component
                onLongPressOriginImage={() => {
                  if (!selectedMode) {
                    toggleSelectedMode();
                    appendMessages(message.id, message.msg_type, false);
                    replyMessage({
                      text: message,
                    });
                    if (message.msg_type === 'text') {
                      copyText({
                        id: message.id,
                        text: message.fmsg !== '' ? message.fmsg : message.tmsg,
                      });
                    }
                  }
                }}
                style={{
                  height: 200,
                  borderRadius: 8,
                  width: 200,
                  alignSelf: 'center',
                }}
                resizeMode="contain"
                imageBackgroundColor="transparent"
                loadingStyle={{size: 'large', color: 'gray'}}
                source={{uri: message.tattach.attach}}
                disabled={selectedMode}
              />
            </View>
            {message.tattach.caption !== '' ? (
              <View
                style={{
                  backgroundColor: '#fff',
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                }}>
                <Text
                  style={{
                    marginLeft: 5,
                    marginTop: 8,
                    fontSize: 16,
                    color: 'black',
                    marginBottom: 5,
                  }}>
                  {message.tattach.caption}
                </Text>
              </View>
            ) : null}
          </View>
          <Text
            style={{
              color: '#524D4D',
              fontSize: 10,
              marginLeft: 10,
              marginTop: 5,
              alignSelf: 'flex-start',
            }}>
            {message.time}
          </Text>
        </View>
      );
    }
    if (message.fattach !== null && message.fattach !== '') {
      let Component = null;
      if (selectedMode) {
        Component = Image;
      } else {
        Component = ImageModal;
      }
      content = (
        <View
          style={{
            alignSelf: 'flex-end',
            marginVertical: 10,
          }}>
          <View
            style={
              message.reply_msg
                ? {
                    backgroundColor: 'red',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    elevation: 5,
                  }
                : {
                    height: 0,
                  }
            }>
            <View
              style={{
                borderWidth:
                  message.reply_msg && message.reply_msg.length > 0 ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg ? (
                message.reply_msg.msg_type == 'text' ? (
                  <Text
                    onPress={() => scrollToID(message.reply_id)}
                    style={{
                      margin: 10,
                      color: '#fff',
                      fontSize: 15,
                    }}>
                    {message.reply_msg.rmsg}
                  </Text>
                ) : message.reply_msg.msg_type == 'contact' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: '#fff',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                      Contact
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.msg_type == 'location' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: '#fff',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                      Location
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.rimage ? (
                  message.reply_msg.msg_type == 'image' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}>
                      <Image
                        source={{uri: message.reply_msg.rimage.attach}}
                        style={{width: 100, height: 80}}
                      />
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'audio' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: '#fff'}}>
                        Voice message
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'video' ? (
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                          marginLeft: 5,
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 8}}>
                        Video
                      </Text>
                    </View>
                  ) : message.reply_msg.msg_type == 'file' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                        Document
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'location' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
                      style={{
                        marginLeft: 10,
                        marginTop: 5,
                        marginRight: 10,
                        flexDirection: 'row',
                      }}>
                      <Icon
                        name="location"
                        type="Feather"
                        style={{
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                        Location
                      </Text>
                    </TouchableOpacity>
                  ) : null
                ) : null
              ) : (
                <Hyperlink
                  linkDefault={true}
                  linkStyle={{color: 'white', fontSize: 20}}>
                  <Text
                    style={{
                      margin: 10,
                      color: '#fff',
                      fontSize: 15,
                      textDecorationLine: message.fmsg.includes('http')
                        ? 'underline'
                        : 'none',
                    }}>
                    {message.fmsg}
                  </Text>
                </Hyperlink>
              )}
              {message.reply_msg ? (
                <View style={{backgroundColor: '#fff'}}>
                  {message.fmsg ? (
                    <Text
                      style={{
                        marginLeft: 5,
                        marginTop: 8,
                        fontSize: 15,
                        marginRight: 5,
                        color: 'black',
                      }}>
                      {message.fmsg}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
          <View
            style={{
              borderWidth: 5,
              borderColor: '#fff',
              borderBottomLeftRadius: message.fattach.caption !== '' ? 8 : 0,
            }}>
            <Component
              onLongPressOriginImage={() => {
                if (!selectedMode) {
                  toggleSelectedMode();
                  appendMessages(message.id, message.msg_type, true);
                  replyMessage({
                    text: message,
                  });
                  if (message.msg_type === 'text') {
                    copyText({
                      id: message.id,
                      text: message.fmsg !== '' ? message.fmsg : message.tmsg,
                    });
                  }
                }
              }}
              loading={sending}
              style={{
                height: 200,
                borderRadius: 8,
                width: 200,
                alignSelf: 'center',
              }}
              resizeMode="contain"
              imageBackgroundColor="transparent"
              loadingStyle={{size: 'large', color: 'gray'}}
              source={{uri: message.fattach.attach}}
            />
          </View>
          {message.fattach.caption !== '' ? (
            <View
              style={{
                backgroundColor: '#fff',
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
              }}>
              <Hyperlink
                linkDefault={true}
                linkStyle={{color: '#2980b9', fontSize: 20}}>
                <Text
                  style={{
                    marginLeft: 5,
                    marginTop: 8,
                    fontSize: 16,
                    color: 'black',
                    marginBottom: 5,
                    textDecorationLine: message.tmsg.includes('http')
                      ? 'underline'
                      : 'none',
                  }}>
                  {message.fattach.caption}
                </Text>
              </Hyperlink>
            </View>
          ) : null}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {message.time}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color:
                    (message.isread !== null &&
                      message.isread.split(',').length === membersCount) ||
                    messageIdList.includes(message.id)
                      ? '#34B7F1'
                      : 'grey',
                }}
              />
            )}
          </View>
        </View>
      );
    }
  }

  if (msg_type === 'video') {
    if (message.tattach !== null && message.tattach !== '') {
      content = (
        <View style={{alignSelf: 'flex-start', marginVertical: 10}}>
          <View
            style={{
              borderRadius: 8,
              elevation: 5,
              width: '70%',
              backgroundColor: '#fff',
            }}>
            {message.tname ? (
              <View style={{marginLeft: 5, marginRight: 5, marginTop: 5}}>
                <Text style={{color: '#1EA81D', fontSize: 15}}>
                  {message.tname}
                </Text>
              </View>
            ) : null}
            <View
              style={{
                borderWidth:
                  message.reply_msg && message.reply_msg.length > 0 ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg != '' ? (
                message.reply_msg.msg_type == 'text' ? (
                  <Text
                    onPress={() => scrollToID(message.reply_id)}
                    style={{
                      margin: 10,
                      color: 'red',
                      fontSize: 15,
                    }}>
                    {message.reply_msg.rmsg}
                  </Text>
                ) : message.reply_msg.msg_type == 'contact' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: 'red',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />
                    <Text
                      style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                      Contact
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.msg_type == 'location' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: 'red',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                      Location
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.rimage ? (
                  message.reply_msg.msg_type == 'image' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}>
                      <Image
                        source={{uri: message.reply_msg.rimage.attach}}
                        style={{width: 100, height: 80}}
                      />
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'audio' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: 'red'}}>
                        Voice message
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'video' ? (
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: 'red'}}>
                        Voice message
                      </Text>
                    </View>
                  ) : message.reply_msg.msg_type == 'file' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                        Document
                      </Text>
                    </TouchableOpacity>
                  ) : null
                ) : null
              ) : null}
              {message.reply_msg ? (
                <View style={{backgroundColor: '#fff'}}>
                  {message.tmsg != '' ? (
                    <Text
                      style={{
                        marginLeft: 5,
                        marginTop: 8,
                        fontSize: 15,
                        marginRight: 5,
                        color: 'black',
                      }}>
                      {message.tmsg}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
            <View>
              <VideoPlayer
                video={{uri: message.tattach.attach}}
                videoHeight={800}
                videoWidth={800}
                resizeMode="cover"
                onBuffer={onBuffer}
                onLoadStart={onLoadStart}
                onLoad={onLoad}
                disableControlsAutoHide={true}
              />
              <ActivityIndicator
                animating
                size="large"
                color={'red'}
                style={[
                  {
                    zIndex: -5,
                    position: 'absolute',
                    top: 70,
                    left: 70,
                    right: 70,
                    height: 50,
                  },
                  {opacity},
                ]}
              />
            </View>
          </View>
          <Text
            style={{
              color: '#524D4D',
              fontSize: 10,
              marginLeft: 10,
              marginTop: 5,
              alignSelf: 'flex-start',
            }}>
            {message.time}
          </Text>
        </View>
      );
    }
    if (message.fattach !== null && message.fattach !== '') {
      content = (
        <View style={{alignSelf: 'flex-end', marginVertical: 10}}>
          <View
            style={{
              borderRadius: 8,
              elevation: 5,
              width: '70%',
            }}
          />
          <View
            style={
              message.reply_msg
                ? {
                    backgroundColor: 'red',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    elevation: 5,
                  }
                : {
                    height: 0,
                  }
            }>
            <View
              style={{
                borderWidth:
                  message.reply_msg && message.reply_msg.length > 0 ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg ? (
                message.reply_msg.msg_type == 'text' ? (
                  <Text
                    onPress={() => scrollToID(message.reply_id)}
                    style={{
                      margin: 10,
                      color: '#fff',
                      fontSize: 15,
                    }}>
                    {message.reply_msg.rmsg}
                  </Text>
                ) : message.reply_msg.msg_type == 'contact' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: '#fff',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                      Contact
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.msg_type == 'location' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: '#fff',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                      Location
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.rimage ? (
                  message.reply_msg.msg_type == 'image' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}>
                      <Image
                        source={{uri: message.reply_msg.rimage.attach}}
                        style={{width: 100, height: 80}}
                      />
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'audio' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: '#fff'}}>
                        Voice message
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'video' ? (
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                          marginLeft: 5,
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 8}}>
                        Video
                      </Text>
                    </View>
                  ) : message.reply_msg.msg_type == 'file' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                        Document
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'location' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
                      style={{
                        marginLeft: 10,
                        marginTop: 5,
                        marginRight: 10,
                        flexDirection: 'row',
                      }}>
                      <Icon
                        name="location"
                        type="Feather"
                        style={{
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                        Location
                      </Text>
                    </TouchableOpacity>
                  ) : null
                ) : null
              ) : null}
            </View>
          </View>
          <View>
            <VideoPlayer
              video={{uri: message.fattach.attach}}
              videoHeight={800}
              videoWidth={800}
              resizeMode="cover"
              onBuffer={onBuffer}
              onLoadStart={onLoadStart}
              onLoad={onLoad}
              disableControlsAutoHide={true}
              disableFullscreen={false}
            />
            <ActivityIndicator
              animating
              size="large"
              color={'red'}
              style={[
                {
                  zIndex: sending ? 10 : -5,
                  position: 'absolute',
                  top: 70,
                  left: 70,
                  right: 70,
                  height: 50,
                },
                {opacity},
              ]}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {message.time}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color:
                    (message.isread !== null &&
                      message.isread.split(',').length === membersCount) ||
                    messageIdList.includes(message.id)
                      ? '#34B7F1'
                      : 'grey',
                }}
              />
            )}
          </View>
        </View>
      );
    }
  }

  if (msg_type === 'audio') {
    if (message.tattach !== null && message.tattach !== '') {
      content = (
        <View
          style={{
            alignSelf: 'flex-start',
            marginVertical: 10,
          }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              width: '80%',
              elevation: 5,
            }}>
            {message.tname ? (
              <View style={{marginLeft: 5, marginRight: 5, marginTop: 5}}>
                <Text style={{color: '#1EA81D', fontSize: 15}}>
                  {message.tname}
                </Text>
              </View>
            ) : null}
            <View
              style={{
                borderWidth:
                  message.reply_msg && message.reply_msg.length > 0 ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg != '' ? (
                message.reply_msg.msg_type == 'text' ? (
                  <Text
                    onPress={() => scrollToID(message.reply_id)}
                    style={{
                      margin: 10,
                      color: 'red',
                      fontSize: 15,
                    }}>
                    {message.reply_msg.rmsg}
                  </Text>
                ) : message.reply_msg.msg_type == 'contact' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: 'red',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />
                    <Text
                      style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                      Contact
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.msg_type == 'location' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: 'red',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                      Location
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.rimage ? (
                  message.reply_msg.msg_type == 'image' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}>
                      <Image
                        source={{uri: message.reply_msg.rimage.attach}}
                        style={{width: 100, height: 80}}
                      />
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'audio' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: 'red'}}>
                        Voice message
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'video' ? (
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: 'red'}}>
                        Voice message
                      </Text>
                    </View>
                  ) : message.reply_msg.msg_type == 'file' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                        Document
                      </Text>
                    </TouchableOpacity>
                  ) : null
                ) : null
              ) : null}
              {message.reply_msg ? (
                <View style={{backgroundColor: '#fff'}}>
                  {message.tmsg != '' ? (
                    <Text
                      style={{
                        marginLeft: 5,
                        marginTop: 8,
                        fontSize: 15,
                        marginRight: 5,
                        color: 'black',
                      }}>
                      {message.tmsg}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                // elevation: 5,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
              }}>
              <Icon
                onPress={() => {
                  if (audio1.playing && playingAudioId === message.id) {
                    onPausePlay1();
                  } else {
                    if (pause) {
                      onResume();
                    } else {
                      onPlay(message.tattach.attach, message.id);
                    }
                  }
                }}
                name={
                  audio1.playing && playingAudioId === message.id
                    ? 'pause'
                    : 'play'
                }
                style={{color: 'grey'}}
              />
              <View
                style={{
                  paddingHorizontal: 16,
                  width: '70%',
                  alignSelf: 'flex-start',
                }}>
                <Slider
                  value={
                    playingAudioId === message.id
                      ? audio1.duration === 0
                        ? 0
                        : audio1.current / audio1.duration
                      : 0
                  }
                  thumbStyle={{width: 10, height: 10}}
                />
                <Text style={{fontSize: 12, color: 'black', marginTop: -12}}>
                  {playingAudioId === message.id
                    ? audioRecorderPlayer.mmssss(audio1.current).slice(0, -3)
                    : '00:00'}
                </Text>
              </View>
            </View>
          </View>
          <Text
            style={{
              color: '#524D4D',
              fontSize: 10,
              marginRight: 10,
              marginTop: 5,
              alignSelf: 'flex-start',
            }}>
            {message.time}
          </Text>
        </View>
      );
    }
    if (message.fattach !== null && message.fattach !== '') {
      content = (
        <View style={{alignSelf: 'flex-end', marginVertical: 10}}>
          <View
            style={
              message.reply_msg
                ? {
                    backgroundColor: 'red',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    elevation: 5,
                  }
                : {
                    height: 0,
                  }
            }>
            <View
              style={{
                borderWidth:
                  message.reply_msg && message.reply_msg.length > 0 ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg ? (
                message.reply_msg.msg_type == 'text' ? (
                  <Text
                    onPress={() => scrollToID(message.reply_id)}
                    style={{
                      margin: 10,
                      color: '#fff',
                      fontSize: 15,
                    }}>
                    {message.reply_msg.rmsg}
                  </Text>
                ) : message.reply_msg.msg_type == 'contact' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: '#fff',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                      Contact
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.msg_type == 'location' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: '#fff',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                      Location
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.rimage ? (
                  message.reply_msg.msg_type == 'image' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}>
                      <Image
                        source={{uri: message.reply_msg.rimage.attach}}
                        style={{width: 100, height: 80}}
                      />
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'audio' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: '#fff'}}>
                        Voice message
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'video' ? (
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                          marginLeft: 5,
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 8}}>
                        Video
                      </Text>
                    </View>
                  ) : message.reply_msg.msg_type == 'file' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                        Document
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'location' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
                      style={{
                        marginLeft: 10,
                        marginTop: 5,
                        marginRight: 10,
                        flexDirection: 'row',
                      }}>
                      <Icon
                        name="location"
                        type="Feather"
                        style={{
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                        Location
                      </Text>
                    </TouchableOpacity>
                  ) : null
                ) : null
              ) : null}
            </View>
          </View>
          <View
            style={{
              backgroundColor: message.reply_msg ? 'white' : 'red',
              borderRadius: 8,
              borderTopLeftRadius: message.reply_msg ? 0 : 8,
              borderTopRightRadius: message.reply_msg ? 0 : 8,
              elevation: 5,
              width: '80%',
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
            }}>
            {sending ? (
              <ActivityIndicator
                animating
                size="large"
                color={message.reply_msg ? 'grey' : 'white'}
              />
            ) : (
              <Icon
                onPress={() => {
                  if (audio1.playing && playingAudioId === message.id) {
                    onPausePlay1();
                  } else {
                    if (pause) {
                      onResume();
                    } else {
                      onPlay(message.fattach.attach, message.id);
                    }
                  }
                }}
                name={
                  audio1.playing && playingAudioId === message.id
                    ? 'pause'
                    : 'play'
                }
                style={{color: message.reply_msg ? 'grey' : 'white'}}
              />
            )}

            <View
              style={{
                paddingHorizontal: 16,
                width: '70%',
                alignSelf: 'flex-start',
              }}>
              <Slider
                disabled
                value={
                  playingAudioId === message.id
                    ? audio1.duration === 0
                      ? 0
                      : audio1.current / audio1.duration
                    : 0
                }
                minimumTrackTintColor={message.reply_msg ? 'black' : 'white'}
                thumbStyle={{
                  width: 10,
                  height: 10,
                  backgroundColor: message.reply_msg ? 'black' : 'white',
                }}
                onValueChange={(value) => this.setState({value})}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: message.reply_msg ? 'black' : 'white',
                  marginTop: -12,
                }}>
                {playingAudioId === message.id
                  ? audioRecorderPlayer.mmssss(audio1.current).slice(0, -3)
                  : '00:00'}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {message.time}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color:
                    (message.isread !== null &&
                      message.isread.split(',').length === membersCount) ||
                    messageIdList.includes(message.id)
                      ? '#34B7F1'
                      : 'grey',
                }}
              />
            )}
          </View>
        </View>
      );
    }
  }

  if (msg_type === 'file') {
    if (message.tattach !== null && message.tattach !== '') {
      const isFileExist = IsFileExist(FILES, message.tattach.attach);
      content = (
        <View
          style={{
            alignSelf: 'flex-start',
            marginVertical: 10,
          }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              width: '80%',
              elevation: 5,
            }}>
            {message.tname ? (
              <View style={{marginLeft: 5, marginRight: 5, marginTop: 5}}>
                <Text style={{color: '#1EA81D', fontSize: 15}}>
                  {message.tname}
                </Text>
              </View>
            ) : null}
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
              }}>
              <Icon name="document" style={{color: '#2B2B2B'}} />
              <View
                style={{
                  paddingHorizontal: 16,
                  width: '70%',
                  alignSelf: 'flex-start',
                }}>
                <Text
                  onPress={() => {
                    if (isFileExist) {
                      downloadAndOpenDocument(isFileExist.localPath);
                    }
                  }}
                  style={{color: '#2B2B2B'}}>
                  {
                    message.tattach.attach.split('/')[
                      message.tattach.attach.split('/').length - 1
                    ]
                  }
                </Text>
              </View>
              {!isFileExist ? (
                <ProgressCircle
                  percent={download.percentage * 100}
                  radius={18}
                  borderWidth={2}
                  color="red"
                  shadowColor="grey"
                  bgColor="white">
                  {download.percentage !== 1.0 ? (
                    <Icon
                      onPress={() => {
                        downloadAndOpenDocument(message.tattach.attach);
                      }}
                      name="arrow-down"
                      style={{color: 'red', fontSize: 26, fontWeight: 'bold'}}
                    />
                  ) : null}
                </ProgressCircle>
              ) : null}
            </View>
          </View>
          <Text
            style={{
              color: '#524D4D',
              fontSize: 10,
              marginRight: 10,
              marginTop: 5,
              alignSelf: 'flex-start',
            }}>
            {message.time}
          </Text>
        </View>
      );
    }

    if (message.fattach !== null && message.fattach !== '') {
      const isFileExist = IsFileExist(FILES, message.fattach.attach);
      content = (
        <View style={{alignSelf: 'flex-end', marginVertical: 10}}>
          <View
            style={
              message.reply_msg
                ? {
                    backgroundColor: 'red',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    elevation: 5,
                  }
                : {
                    height: 0,
                  }
            }>
            <View
              style={{
                borderWidth:
                  message.reply_msg && message.reply_msg.length > 0 ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg ? (
                message.reply_msg.msg_type == 'text' ? (
                  <Text
                    onPress={() => scrollToID(message.reply_id)}
                    style={{
                      margin: 10,
                      color: '#fff',
                      fontSize: 15,
                    }}>
                    {message.reply_msg.rmsg}
                  </Text>
                ) : message.reply_msg.msg_type == 'contact' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: '#fff',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                      Contact
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.msg_type == 'location' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: '#fff',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                      Location
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.rimage ? (
                  message.reply_msg.msg_type == 'image' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}>
                      <Image
                        source={{uri: message.reply_msg.rimage.attach}}
                        style={{width: 100, height: 80}}
                      />
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'audio' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: '#fff'}}>
                        Voice message
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'video' ? (
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                          marginLeft: 5,
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 8}}>
                        Video
                      </Text>
                    </View>
                  ) : message.reply_msg.msg_type == 'file' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                        Document
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'location' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
                      style={{
                        marginLeft: 10,
                        marginTop: 5,
                        marginRight: 10,
                        flexDirection: 'row',
                      }}>
                      <Icon
                        name="location"
                        type="Feather"
                        style={{
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                        Location
                      </Text>
                    </TouchableOpacity>
                  ) : null
                ) : null
              ) : null}
            </View>
          </View>

          <View
            style={{
              backgroundColor: message.reply_msg ? 'white' : 'red',
              borderRadius: 8,
              borderTopLeftRadius: message.reply_msg ? 0 : 8,
              borderTopRightRadius: message.reply_msg ? 0 : 8,
              elevation: 5,
              width: '80%',
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
            }}>
            {sending ? (
              <ActivityIndicator
                animating
                size="large"
                color={message.reply_msg ? 'grey' : 'white'}
              />
            ) : (
              <Icon
                name="document"
                style={{color: message.reply_msg ? 'grey' : 'white'}}
              />
            )}
            <View
              style={{
                paddingHorizontal: 16,
                width: '70%',
                alignSelf: 'flex-start',
              }}>
              <Text
                onPress={() => {
                  if (
                    !(message.fattach.attach.includes('http') && !isFileExist)
                  ) {
                    downloadAndOpenDocument(message.fattach.attach);
                  }
                }}
                style={{color: message.reply_msg ? 'black' : 'white'}}>
                {
                  message.fattach.attach.split('/')[
                    message.fattach.attach.split('/').length - 1
                  ]
                }
              </Text>
            </View>
            {message.fattach.attach.includes('http') && !isFileExist ? (
              <ProgressCircle
                percent={download.percentage * 100}
                radius={18}
                borderWidth={2}
                color="white"
                shadowColor="#920"
                bgColor="red">
                {download.percentage !== 1 ? (
                  <Icon
                    onPress={() => {
                      downloadAndOpenDocument(message.fattach.attach);
                    }}
                    name="arrow-down"
                    style={{color: 'white', fontSize: 26, fontWeight: 'bold'}}
                  />
                ) : null}
              </ProgressCircle>
            ) : null}
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {message.time}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color:
                    (message.isread !== null &&
                      message.isread.split(',').length === membersCount) ||
                    messageIdList.includes(message.id)
                      ? '#34B7F1'
                      : 'grey',
                }}
              />
            )}
          </View>
        </View>
      );
    }
  }

  if (msg_type === 'location') {
    if (message.tmsg !== '') {
      const {latitude, longitude} = JSON.parse(JSON.parse(message.tmsg));
      let Component = View;
      if (!selectedMode) {
        Component = Lightbox;
      }

      content = (
        <View
          style={{
            alignSelf: 'flex-start',
            marginVertical: 10,
          }}>
          <View
            style={{
              borderRadius: 8,
              elevation: 5,
              width: '70%',
              backgroundColor: '#fff',
            }}>
            {message.tname ? (
              <View style={{marginLeft: 5, marginRight: 5, marginTop: 5}}>
                <Text style={{color: '#1EA81D', fontSize: 15}}>
                  {message.tname}
                </Text>
              </View>
            ) : null}

            <View
              style={{
                borderWidth:
                  message.reply_msg && message.reply_msg.length > 0 ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg != '' ? (
                message.reply_msg.msg_type == 'text' ? (
                  <Text
                    onPress={() => scrollToID(message.reply_id)}
                    style={{
                      margin: 10,
                      color: 'red',
                      fontSize: 15,
                    }}>
                    {message.reply_msg.rmsg}
                  </Text>
                ) : message.reply_msg.msg_type == 'contact' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: 'red',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />
                    <Text
                      style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                      Contact
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.msg_type == 'location' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: 'red',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                      Location
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.rimage ? (
                  message.reply_msg.msg_type == 'image' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}>
                      <Image
                        source={{uri: message.reply_msg.rimage.attach}}
                        style={{width: 100, height: 80}}
                      />
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'audio' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: 'red'}}>
                        Voice message
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'video' ? (
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: 'red'}}>
                        Voice message
                      </Text>
                    </View>
                  ) : message.reply_msg.msg_type == 'file' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: 'red',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: 'red', marginLeft: 5}}>
                        Document
                      </Text>
                    </TouchableOpacity>
                  ) : null
                ) : null
              ) : null}
            </View>

            <Component
              onOpen={() => {
                setOpen(true);
              }}
              onClose={() => setOpen(false)}>
              <View
                style={{
                  borderRadius: 8,
                  elevation: 5,
                  width: open ? '100%' : 200,
                  height: open ? '100%' : 280,
                }}>
                <MapView
                  onPress={() => {
                    if (selectedMode) {
                      if (!inList) {
                        appendMessages(message.id, message.msg_type, false);
                        replyMessage({
                          text: message,
                        });
                        if (message.msg_type === 'text') {
                          copyText({
                            id: message.id,
                            text:
                              message.fmsg !== '' ? message.fmsg : message.tmsg,
                          });
                        }
                      } else {
                        removeMessages(message.id, message.msg_type, false);
                      }
                    }
                  }}
                  onLongPress={() => {
                    if (!selectedMode) {
                      toggleSelectedMode();
                      appendMessages(message.id, message.msg_type, false);
                      replyMessage({
                        text: message,
                      });
                      if (message.msg_type === 'text') {
                        copyText({
                          id: message.id,
                          text:
                            message.fmsg !== '' ? message.fmsg : message.tmsg,
                        });
                      }
                    }
                  }}
                  provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : false} // remove if not using Google Maps
                  style={{
                    flex: 1,
                    ...StyleSheet.absoluteFillObject,
                  }}
                  region={{
                    latitude,
                    longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.0121,
                  }}>
                  <Marker coordinate={{latitude, longitude}} />
                </MapView>
              </View>
            </Component>
          </View>
          <Text
            style={{
              color: '#524D4D',
              fontSize: 10,
              marginRight: 10,
              marginTop: 5,
              alignSelf: 'flex-start',
            }}>
            {message.time}
          </Text>
        </View>
      );
    }
    if (message.fmsg !== '') {
      let location = null;
      if (sending) {
        location = JSON.parse(message.fmsg);
      } else {
        location = JSON.parse(message.fmsg);
      }
      if (typeof location === 'string') {
        location = JSON.parse(location);
      }

      const {latitude, longitude} = location;

      let Component = View;
      if (!selectedMode) {
        Component = Lightbox;
      }

      content = (
        <View style={{alignSelf: 'flex-end', marginVertical: 10}}>
          <View
            style={
              message.reply_msg
                ? {
                    backgroundColor: 'red',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    elevation: 5,
                  }
                : {
                    height: 0,
                  }
            }>
            <View
              style={{
                borderWidth:
                  message.reply_msg && message.reply_msg.length > 0 ? 5 : 0,
                borderColor: '#fff',
              }}>
              {message.reply_msg ? (
                message.reply_msg.msg_type == 'text' ? (
                  <Text
                    onPress={() => scrollToID(message.reply_id)}
                    style={{
                      margin: 10,
                      color: '#fff',
                      fontSize: 15,
                    }}>
                    {message.reply_msg.rmsg}
                  </Text>
                ) : message.reply_msg.msg_type == 'contact' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: '#fff',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                      Contact
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.msg_type == 'location' ? (
                  <TouchableOpacity
                    onPress={() => scrollToID(message.reply_id)}
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
                        color: '#fff',
                        fontSize: 18,
                        alignSelf: 'center',
                      }}
                    />

                    <Text
                      style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                      Location
                    </Text>
                  </TouchableOpacity>
                ) : message.reply_msg.rimage ? (
                  message.reply_msg.msg_type == 'image' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}>
                      <Image
                        source={{uri: message.reply_msg.rimage.attach}}
                        style={{width: 100, height: 80}}
                      />
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'audio' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text style={{marginBottom: 5, color: '#fff'}}>
                        Voice message
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'video' ? (
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                          marginLeft: 5,
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 8}}>
                        Video
                      </Text>
                    </View>
                  ) : message.reply_msg.msg_type == 'file' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
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
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                        Document
                      </Text>
                    </TouchableOpacity>
                  ) : message.reply_msg.msg_type == 'location' ? (
                    <TouchableOpacity
                      onPress={() => scrollToID(message.reply_id)}
                      style={{
                        marginLeft: 10,
                        marginTop: 5,
                        marginRight: 10,
                        flexDirection: 'row',
                      }}>
                      <Icon
                        name="location"
                        type="Feather"
                        style={{
                          color: '#fff',
                          fontSize: 18,
                          alignSelf: 'center',
                        }}
                      />
                      <Text
                        style={{marginBottom: 5, color: '#fff', marginLeft: 5}}>
                        Location
                      </Text>
                    </TouchableOpacity>
                  ) : null
                ) : null
              ) : null}
            </View>
          </View>

          <Component
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}>
            <View
              style={{
                borderRadius: 8,
                elevation: 5,
                width: open ? '100%' : 200,
                height: open ? '100%' : 280,
              }}>
              <MapView
                onPress={() => {
                  if (selectedMode) {
                    if (!inList) {
                      appendMessages(
                        message.id,
                        message.msg_type,
                        message.fmsg !== '',
                      );
                      replyMessage({
                        text: message,
                      });
                      if (message.msg_type === 'text') {
                        copyText({
                          id: message.id,
                          text:
                            message.fmsg !== '' ? message.fmsg : message.tmsg,
                        });
                      }
                    } else {
                      removeMessages(
                        message.id,
                        message.msg_type,
                        message.fmsg !== '',
                      );
                    }
                  }
                }}
                onLongPress={() => {
                  if (!selectedMode) {
                    toggleSelectedMode();
                    appendMessages(
                      message.id,
                      message.msg_type,
                      message.fmsg !== '',
                    );
                    replyMessage({
                      text: message,
                    });
                    if (message.msg_type === 'text') {
                      copyText({
                        id: message.id,
                        text: message.fmsg !== '' ? message.fmsg : message.tmsg,
                      });
                    }
                  }
                }}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : false} // remove if not using Google Maps
                style={{
                  flex: 1,
                  ...StyleSheet.absoluteFillObject,
                }}
                region={{
                  latitude,
                  longitude,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.0121,
                }}>
                <Marker coordinate={{latitude, longitude}} />
              </MapView>
            </View>
          </Component>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {message.time}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color:
                    (message.isread !== null &&
                      message.isread.split(',').length === membersCount) ||
                    messageIdList.includes(message.id)
                      ? '#34B7F1'
                      : 'grey',
                }}
              />
            )}
          </View>
        </View>
      );
    }
  }

  return (
    <Swipeable
      ref={swiper}
      friction={2}
      leftThreshold={20}
      renderLeftActions={renderLeftActions}
      onSwipeableLeftOpen={() => {
        swiper.current.close();
        swipeToShowReply({text: message});
      }}>
      <TouchableOpacity
        activeOpacity={1}
        style={
          inList
            ? {
                backgroundColor: `rgba(0,0,0,0.2)`,
              }
            : {}
        }
        onPress={() => {
          if (selectedMode) {
            if (!inList) {
              appendMessages(
                message.id,
                message.msg_type,
                message.fmsg !== '' || message.fattach !== '',
              );
              replyMessage({
                text: message,
              });
              if (message.msg_type === 'text') {
                copyText({
                  id: message.id,
                  text: message.fmsg !== '' ? message.fmsg : message.tmsg,
                });
              }
            } else {
              removeMessages(
                message.id,
                message.msg_type,
                message.fmsg !== '' || message.fattach !== '',
              );
            }
          }
        }}
        onLongPress={() => {
          if (!selectedMode) {
            toggleSelectedMode();
            appendMessages(
              message.id,
              message.msg_type,
              message.fmsg !== '' || message.fattach !== '',
            );
            replyMessage({
              text: message,
            });
            if (message.msg_type === 'text') {
              copyText({
                id: message.id,
                text: message.fmsg !== '' ? message.fmsg : message.tmsg,
              });
            }
          }
        }}>
        <View
          style={
            message.id === scrollMessageId
              ? {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                }
              : {}
          }>
          {content}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  Styleimage: {
    alignSelf: 'flex-start',
    marginTop: 2,
    width: 60,
    height: 60,
    padding: 15,
  },
  replyAction: {
    flex: 1,
    alignItems: 'center',
    fontSize: 12,
    justifyContent: 'center',
  },
});
