/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-did-mount-set-state */
import React, {Component} from 'react';
console.disableYellowBox = true;

import {
  StyleSheet,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Platform
} from 'react-native';
import resp from 'rn-responsive-font';
import {SliderBox} from 'react-native-image-slider-box';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import {BASE_URL} from '../Component/ApiClient';

class UserStoryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: '',
      avatar: null,
      userId: '',
      fcmtoken: '',
      userAccessToken: '',
      ReplyMessage: '',
      storyid: '',
      ownUserID: '',
      defaultavatar: require('../images/default_user.png'),
      images: '',
      visibleReply: true,
      nameStory: this.props.route.params.name,
    };
  }
  componentDidMount() {
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
    let item = this.props.route.params.images;
    this.setState({avatar: item});
    let imageArr = [];
    let storyID;
    let time;
    let storyImage = this.props.route.params.storyImages;
    storyImage.map((item) => {
      imageArr.push(item.image);
      time = item.time;
      storyID = item.stid;
    });
    this.setState({storyid: storyID});
    this.setState({images: imageArr});
    let timeID = moment(time * 1000).fromNow();
    this.setState({currentTime: timeID});
    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        this.setState({userAccessToken: accessToken});
        this.viewStory();
      }
    });
  }

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

  sendMessage = () => {
    this.setState({visibleReply: true});
    alert('message send');
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{flexDirection: 'row', marginBottom: 10}}>
          <View style={styles.BackButtonContainer}>
            <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
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
export default UserStoryPage;
