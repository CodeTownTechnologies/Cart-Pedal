import React, {useState, useRef, useEffect, Component} from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ImageEditor
} from 'react-native';
import moment from 'moment';
//import * as Permissions from "expo-permissions";
// import { Camera, AUDIO_RECORDING } from "expo-camera";
// import { Video } from "expo-av";
import { Spinner  } from 'native-base';
import {RNCamera} from 'react-native-camera';
import Video from 'react-native-video';
import ImagePicker from 'react-native-image-crop-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs'
const WINDOW_HEIGHT = Dimensions.get('window').height;
const closeButtonSize = Math.floor(WINDOW_HEIGHT * 0.04);
const captureSize = Math.floor(WINDOW_HEIGHT * 0.09);
export default class PostScreen extends Component {
  constructor(...props) {
    super(...props);
    this.state = {
      cameraType: RNCamera.Constants.Type.back,
      isVideoRecording: false,
      videoSource: null,
      isCameraReady: true,
      recordedData: null,
    //  isPreview: false,
      cameraRef: this.camera,
      video: null,
      videos: null,
      videoStart: false,
      loading:false
     // maxLength:30
    };
  }

  onCameraReady = () => {
    this.setState({
      isCameraReady: true,
    });
  };
  //  takePicture = async () => {
  //   if (this.camera) {
  //     const options = { quality: 0.5, base64: true, skipProcessing: true };
  //     const data = await this.camera.takePictureAsync(options);
  //     const source = data.uri;
  //     if (source) {
  //       await this.camera.pausePreview();
  //       setIsPreview(true);
  //       console.log("picture source", source);
  //     }
  //   }
  // };
  recording = async () => {
    this.setState({button:true});
    if (this.camera) {
      try {
        const options = {
          quality: 2,
          videoBitrate: 8000000,
          maxDuration: 30
        };
        const videoRecordPromise = this.camera.recordAsync(options);
        if (videoRecordPromise) {
          this.setState({isVideoRecording: true});
          this.startTimer();
          this.setState({
            isRecording: true,
            recorded: false,
            recordedData: null,
            time: 0,
          });
          const data = await videoRecordPromise;
          let base64Img = data.uri;
          console.log('data',data);
          const source = data.uri;
          if (source) {
            this.setState({loading:true})
            const base64Data= await RNFS.readFile( base64Img, 'base64' );
            
              const data = {
                path: base64Img,
                data: base64Data,
              };
              this.props.route.params.sendVideo(data);
              this.props.navigation.goBack();
       
           // this.setState({videoSource: source});
           // this.setState({isPreview: true});
          //  this.props.navigation.navigate('UploadPost', {source: source});
          }
        }
      } catch (error) {
        console.warn(error);
      }
    }
  };
  stopVideoRecording = () => {
    this.setState({button:false});
    if (this.camera) {
      this.setState({
        isVideoRecording: false,
      });
      this.camera.stopRecording();
    }
  };
  switchCamera = () => {
    this.state.cameraType === RNCamera.Constants.Type.back
      ? this.setState({cameraType: RNCamera.Constants.Type.front})
      : this.setState({cameraType: RNCamera.Constants.Type.back});
  };

  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      let image={
        path:data.uri,
        data:data.base64
      }
      this.props.route.params.openImage(image);
      this.props.navigation.goBack();
    }
  };

  pickVideoWithGallery(cropping, mediaType = 'video') {
    ImagePicker.openPicker({
      cropping: cropping,
     durationLimit:30,
      includeExif: true,
      mediaType,
    
    }).then((video) => {
      // const source = video.uri;
      console.log('video source', video.path);
     // this.setState({videoSource: video.path});
      // this.setState({isPreview: true});
    this.props.navigation.navigate('UploadPost', {source: video.path});
    });
    // .catch((e) => alert(e));
  }
  renderVideoPlayer = (video) => (
    <Video
      source={{uri: this.state.videoSource, uri: video.uri}}
      shouldPlay={true}
      style={styles.media}
      resizeMode="cover"
      rate={1.0}
      playInBackground={false}
      volume={1.0}
    />
  );
  renderVideoRecordIndicator = () => (
    <View style={styles.recordIndicatorContainer}>
      <View style={styles.recordDot} />
      <Text style={styles.recordTitle}>{this.renderTimer()}</Text>
    </View>
  );
  videoStartControl = () => {
    this.setState({
      videoStart: !this.state.videoStart,
    });
    // this.state.videoStart
    // ?this.recordVideo(): this.stopVideoRecording()
    this.state.videoStart ? this.stopVideoRecording() : this.recordVideo();
  };

  renderCaptureControl = () => (
    <View style={styles.control}>
     {this.state.button ? ( 
     <TouchableOpacity
    disabled={!this.state.isCameraReady}
    onPress={this.stopVideoRecording}
      style={[styles.buttonContainer, styles.buttonStopContainer, this.props.style]}>
      <View  style={styles.buttonStop}></View>
     </TouchableOpacity>):
(!this.state.loading?<TouchableOpacity
  onPress={this.takePicture}
   onLongPress={this.recording}  
   delayLongPress={200}
   style={[styles.buttonContainer, this.props.style]}>
        <View style={styles.circleInside}></View>
      </TouchableOpacity>:
      <View style={{justifyContent: 'center', alignItems: 'center', }}>
      <Spinner color={"red"} />
</View>
      )}
      <TouchableOpacity
        disabled={!this.state.isCameraReady}
        onPress={this.switchCamera}>
        {/* <Text style={styles.text}>{'Flip'}</Text> */}
        <Ionicons name="camera-reverse-outline" size={30} color={'white'} />
      </TouchableOpacity>

    </View>
  );
  
  startTimer = () => {
    this.timer = setInterval(() => {
      const time = this.state.time + 1;
      this.setState({time});
      if (this.state.maxLength > 0 && time >= this.state.maxLength) {
       this.stopCapture();
  
      }
    }, 1000);
  };

  stopTimer = () => {
    if (this.timer) clearInterval(this.timer);
  };

  convertTimeString = (time) => {
    return moment().startOf('day').seconds(time).format('mm:ss');
  };

  renderTimer() {
    const {isRecording, time, recorded} = this.state;
    return (
      <View>
        {(recorded || isRecording) && (
          <Text style={this.props.durationTextStyle}>
            <Text style={styles.recordDot}></Text>{' '}
            {this.convertTimeString(time)}
          </Text>
        )}
      </View>
    );
  }
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <RNCamera
          ref={(ref) => {
            this.camera = ref;
          }}
          style={styles.container}
          type={this.state.cameraType}
          onCameraReady={this.onCameraReady}
  
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio recording',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          
          onMountError={(error) => {
            console.log('cammera error', error);
          }}
        />
        <View style={styles.container}>
          {this.state.isVideoRecording && this.renderVideoRecordIndicator()}
          {/* {this.state.videoSource && this.renderVideoPlayer()} */}
          {/* {this.state.isPreview && this.renderCancelPreviewButton()} */}
          {!this.state.videoSource &&
           // !this.state.isPreview &&
            this.renderCaptureControl()}
          {this.state.video ? null : null}
          {/* {this.state.videos
            ? this.state.videos.map((i) => (
                <View key={i.uri}>{this.renderAsset(i)}</View>
              ))
            : null} */}
        </View>
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: 35,
    left: 15,
    height: closeButtonSize,
    width: closeButtonSize,
    borderRadius: Math.floor(closeButtonSize / 2),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c4c5c4',
    opacity: 0.8,
    zIndex: 2,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  closeCross: {
    width: '100%',
    height: 2,
    backgroundColor: 'black',
  },
  control: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: 38,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capture: {
    backgroundColor: '#f5f6f5',
    borderRadius: 2,
    height: captureSize,
    width: captureSize,
    borderRadius: Math.floor(captureSize / 2),
    marginHorizontal: 50,
  },
  recordIndicatorContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 25,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    opacity: 0.7,
  },
  recordTitle: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  recordDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
    backgroundColor: 'red',
    marginHorizontal: 5,
  },
  buttonContainer: {
    width: 70,
    height: 75,
    borderRadius: 40,
    backgroundColor: '#D91E18',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: 'white',
    marginHorizontal:46
    },
    circleInside: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D91E18',
    },
    buttonStopContainer: {
    backgroundColor: 'transparent',
    },
    buttonStop: {
    backgroundColor: '#D91E18',
    width: 30,
    height: 30,
    borderRadius: 3,
    },
  Pickerbutton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    height: 50,
    width: 50,
    marginHorizontal: 3,
    borderWidth: 2,
    borderColor: 'white',
  },
});
