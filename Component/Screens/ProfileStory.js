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
} from 'react-native';
import resp from 'rn-responsive-font';
import {SliderBox} from 'react-native-image-slider-box';
import moment from 'moment';

class ProfileStory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: moment(this.props.route.params.time * 1000).fromNow(),
      avatar: '',
      defaultavatar: require('../images/default_user.png'),
      images: [this.props.route.params.storyImages],
      nameStory: this.props.route.params.name,
    };
  }
  componentDidMount() {
    let item = this.props.route.params.images;
    this.setState({avatar: item});
  }
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{flexDirection: 'row'}}>
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
                this.state.avatar == ''
                  ? this.state.defaultavatar
                  : {uri: this.state.avatar}
              }
            />
          </View>
          <View>
            <View style={{width: 300}}>
              <Text style={styles.username}>{this.state.nameStory}</Text>
            </View>
            <Text style={{marginLeft: 8, marginTop: 5, fontSize: 12}}>
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
  CloseButtonContainerStyles: {
    marginTop: resp(30),
    marginRight: resp(70),
    flex: 0.01,
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
    fontSize: resp(15),
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
    marginTop: resp(100),
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '99%',
    height: resp(500),
  },
});

export default ProfileStory;
