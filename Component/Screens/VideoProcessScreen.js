import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
// import {Trimmer, VideoPlayer} from 'react-native-video-processing';
import {readFile} from 'react-native-fs';
import Video from 'react-native-video-controls';
function pad(num) {
  return ('0' + num).slice(-2);
}

function mmss(secs) {
  var minutes = Math.floor(secs / 60);
  secs = secs % 60;

  return `${pad(minutes)}:${pad(secs)}`;
  // return pad(hours)+":"+pad(minutes)+":"+pad(secs); for old browsers
}

export class VideoProcessScreen extends React.Component {
  state = {
    uri: this.props.route.params.uri,
    trackStart: 0,
    trackEnd: 0,
  };

  trimVideo = async () => {
    const {trackStart, trackEnd} = this.state;
    const options = {
      startTime: trackStart,
      endTime: trackEnd,
    };
    try {
      const newSource = await this.videoPlayerRef.trim(options);
      await this.setState({uri: newSource});
    } catch (error) {
      console.log(error);
    }
  };

  getVideoInfo = async () => {
    try {
      const info = await this.videoPlayerRef.getVideoInfo();
      console.log(info, 'INFO');
      return info;
    } catch (error) {
      return null;
    }
  };

  getInfo = async () => {
    try {
      console.log(`file://${this.state.uri}`);
      const result = await readFile(`file://${this.state.uri}`, 'base64');
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  componentDidMount = async () => {
    const info = await this.getVideoInfo();
    if (info) {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({trackEnd: info.duration});
    }
  };

  sendVideo = async () => {
    const {trackStart, trackEnd} = this.state;
    if (trackEnd - trackStart > 20) {
      alert("you can't send video of duration more than 20 seconds");
      return;
    } else {
      try {
        await this.trimVideo();
        console.log(this.state.uri, 'AFter trimmign');
        const result = await readFile(`file://${this.state.uri}`, 'base64');
        const data = {
          path: this.state.uri,
          data: result,
        };
        this.props.route.params.sendVideo(data);
        this.props.navigation.goBack();
      } catch (error) {
        console.log(error);
      }
    }
  };

  render() {
    const {uri} = this.state;

    return (
      <View style={{flex: 1}}>
        {/* <VideoPlayer
          ref={(ref) => (this.videoPlayerRef = ref)}
          play={false}
          replay={false} // should player play video again if it's ended
          source={uri}
          playerWidth={0} // iOS only
          playerHeight={0} // iOS only
          style={{width: '0%', height: 0}}
          resizeMode={VideoPlayer.Constants.resizeMode.CONTAIN}
          onChange={({nativeEvent}) => console.log({nativeEvent})} // get Current time on every second
        /> */}

        <Video
          paused={true}
          source={{uri}} // Can be a URL or a local file.
          ref={(ref) => {
            this.player = ref;
          }} // Store reference
          onBuffer={this.onBuffer} // Callback when remote video is buffering
          onError={this.videoError} // Callback when video cannot be loaded
          style={styles.backgroundVideo}
        />

        {/* <Trimmer
          source={uri}
          height={100}
          width={100}
          themeColor={'white'}
          thumbWidth={10}
          trackerColor={'green'}
          onChange={(e) => {
            this.setState({
              trackStart: parseInt(e.startTime * 1000),
              trackEnd: parseInt(e.endTime * 1000),
            });
          }}
        /> */}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text>{mmss(this.state.trackStart)}</Text>
          <Text>{mmss(this.state.trackEnd)}</Text>
        </View>

        {/* <Button title="trim video" onPress={() => this.trimVideo()} /> */}
        <Button title="send video" onPress={() => this.sendVideo()} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  backgroundVideo: {
    height: 300,
    width: '100%',
    resizeMode: 'contain',
  },
});
