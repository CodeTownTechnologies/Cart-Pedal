/* eslint-disable no-dupe-keys */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  Modal,
  Platform,
} from 'react-native';
import {Container, TabHeading, Tab, Tabs} from 'native-base';
import resp from 'rn-responsive-font';
import GeneralTab from './GeneralTab';
import FavouriteTab from './FavouriteTab';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-community/async-storage';
import Toast from 'react-native-simple-toast';
import Spinner from 'react-native-loading-spinner-overlay';
import {BASE_URL} from '../Component/ApiClient';
import {connect} from 'react-redux';
import OfflineUserScreen from './OfflineUserScreen';
console.disableYellowBox = true;

function Item({item}) {
  return (
    <View style={styles.storyItemBox}>
      <Image source={item.StoryImage} style={styles.ImageViewStyle} />
      <Image source={item.status_add_icon} style={styles.StatusAddStyle} />
      <Text style={styles.storyTextView}>{item.StoryPerson}</Text>
    </View>
  );
}

const options = {
  title: 'Select Option',
  customButtons: [{name: 'fb', title: 'View Story'}],
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

class OpenForPublicScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: '',
      loggeduserstory_avatar: null,
      pickedImage: require('../images/default_user.png'),
      avatar: null,
      user_stories: '',
      userId: '',
      stories: '',
      isStoryModalVisible: false,
      userStoryName: '',
      fcmToken: '',
      userAccessToken: '',
      changeValue: 0,
      refreshing: false,
    };
  }

  showLoading() {
    this.setState({spinner: true});
  }

  updateContent() {
    this.setState({refreshing: true});
    setTimeout(() => {
      this.setState({refreshing: false});
    }, 2000);
  }

  hideLoading() {
    this.setState({spinner: false});
  }

  actionOnRow(item) {}

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

  closeProfileModal = () => {
    this.setState({isStoryModalVisible: false});
  };

  openImageGallery() {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      includeBase64: true,
      compressImageQuality: 0.4,
    }).then((image) => {
      this.setState({isStoryModalVisible: !this.state.isStoryModalVisible});
      this.onImagePick(image);
    });
  }

  onImagePick(response) {
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
      width: 300,
      height: 400,
      cropping: true,
      includeBase64: true,
    }).then((image) => {
      this.setState({isStoryModalVisible: !this.state.isStoryModalVisible});

      this.onImagePick(image);
    });
  }

  coverPhotogallery = () => {
    ImagePicker.showImagePicker(options, (res) => {
      if (res.didCancel) {
      } else if (res.error) {
      } else if (res.customButton) {
        this.customButton();
      } else {
        let imageArr = [];
        imageArr.push(res);
        this.addStoryApi(imageArr);
      }
    });
  };

  addStoryApi = (data) => {
    this.showLoading();
    var otpUrl = `${BASE_URL}api-user/add-story`;
    fetch(`${BASE_URL}api-user/add-story`, {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: this.state.fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: JSON.stringify({
        user_id: this.state.userId,
        upload: data,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.hideLoading();
        if (responseData.code == '200') {
          this.loggedUserstory();
          Toast.show(responseData.message);
        } else {
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  };

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.showLoading();
      AsyncStorage.getItem('@current_usermobile').then((mobile) => {
        if (mobile) {
          this.setState({currentUserMobile: JSON.parse(mobile)});
        }
      });
      AsyncStorage.getItem('@fcmtoken').then((token) => {
        if (token) {
          this.setState({fcmToken: token});
        }
      });
      AsyncStorage.getItem('@user_id').then((userId) => {
        if (userId) {
          this.setState({userId: userId});
        }
      });
      AsyncStorage.getItem('@access_token').then((accessToken) => {
        if (accessToken) {
          this.setState({userAccessToken: accessToken});
          this.userStories();
          this.loggedUserstory();
        }
      });
      AsyncStorage.getItem('@user_name').then((userName) => {
        if (userName) {
          this.setState({userName: JSON.parse(userName)});
        }
      });
    });
  }

  loggedUserstory = () => {
    this.showLoading();
    var urlprofile = `${BASE_URL}api-user/user-stories?user_id=${this.state.userId}&type=1`;
    fetch(urlprofile, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: this.state.fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.hideLoading();
        if (responseData.code == '200') {
          this.hideLoading();
          this.setState({loggeduser_stories: responseData.data[0]});
          this.setState({loggeduserstory_avatar: responseData.data[0].avatar});
          this.setState({stories: responseData.data[0].stories});
          this.setState({userStoryName: responseData.data[0].name});
        } else {
          this.hideLoading();
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  };
  userStories = () => {
    this.showLoading();
    var urlprofile = `${BASE_URL}api-user/user-stories?user_id=${this.state.userId}&type=0`;
    fetch(urlprofile, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: this.state.fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.hideLoading();
        if (responseData.code == '200') {
          this.hideLoading();
          let item = [];
          responseData.data.forEach((element) => {
            if (element.stories[0].viewer !== 1) {
              item.unshift(element);
            } else {
              item.push(element);
            }
          });
          this.setState({user_stories: item});
        } else {
          this.hideLoading();
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  };

  onChangeRefreshTab = (value) => {
    // eslint-disable-next-line no-lone-blocks
    {
      value == 1
        ? this.FavouriteTabDialog.FavouriteListCall()
        : this.imageSelectDialog.ContactListall();
    }
  };

  openStoryModal() {
    this.setState({isStoryModalVisible: !this.state.isStoryModalVisible});
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
          <View style={styles.BackButtonContainer}>
            <TouchableOpacity onPress={() => this.props.navigation.goBack()} />
          </View>
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
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            style={styles.storyItemBox}
            onPress={() => this.openStoryModal()}>
            <Image
              source={
                this.state.loggeduserstory_avatar == null
                  ? this.state.pickedImage
                  : {uri: this.state.loggeduserstory_avatar}
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
            data={this.state.user_stories}
            keyExtractor={(item) => item.id.toString()}
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
                        storyArray: this.state.user_stories,
                      });
                    }}>
                    <Image
                      source={
                        item.avatar == null
                          ? this.state.pickedImage
                          : {uri: item.avatar}
                      }
                      style={[
                        styles.ImageViewStyleStory,
                        {
                          borderColor:
                            item.stories[0].viewer == 1 ? '#06BE7E' : '#F01738',
                        },
                      ]}
                    />
                    <Text style={styles.storyTextView}>
                      {item.name.substring(0, 8) + '..'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>

        <View style={styles.hairline} />
        <View style={styles.MainContentBox}>
          <Container style={{marginTop: resp(0)}}>
            <Tabs
              tabBarUnderlineStyle={{backgroundColor: '#F01738'}}
              tabBarActiveTextColor={'red'}
              tabBarInactiveTextColor="#7F7F7F"
              onChangeTab={(i) => {
                this.onChangeRefreshTab(i.i);
              }}>
              <Tab
                heading={
                  <TabHeading style={{backgroundColor: '#ebced7'}}>
                    <Text style={{fontWeight: 'bold', color: '#F01738'}}>
                      General{' '}
                    </Text>
                  </TabHeading>
                }>
                <GeneralTab
                  ref={(ref) => (this.imageSelectDialog = ref)}
                  navigation={this.props.navigation}
                />
              </Tab>

              <Tab
                heading={
                  <TabHeading style={{backgroundColor: '#e6f7f2'}}>
                    <Text style={{fontWeight: 'bold', color: '#06BE7E'}}>
                      Favourite
                    </Text>
                  </TabHeading>
                }>
                <FavouriteTab
                  ref={(ref) => (this.FavouriteTabDialog = ref)}
                  navigation={this.props.navigation}
                />
              </Tab>
            </Tabs>
            <Modal
              animationType="slide"
              transparent={true}
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

                  <Text style={styles.TitleProfileModalStyle}>
                    Choice Option
                  </Text>
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
                    <Text style={styles.Options2ProfileModalStyle}>
                      Gallery{' '}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      this.customButton();
                    }}>
                    <Text style={styles.Options2ProfileModalStyle}>
                      View Story
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </Container>
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
                source={require('../images/group_active_icon.png')}
                style={styles.StyleOpenForPublicTab}
              />
              <Text style={styles.bottomActiveTextStyle}>Open for Public</Text>
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
    flexDirection: 'column',
    backgroundColor: '#fff',
  },

  storyContainer: {
    flex: 0.17,
    backgroundColor: '#fff',
  },

  itemBox: {
    height: resp(375),
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
  storyItemBox: {
    height: resp(90),
    backgroundColor: 'white',
    flexDirection: 'column',
  },
  ImageViewStyleStory: {
    margin: resp(6),
    width: resp(55),
    height: resp(55),
    borderWidth: 2,
    borderRadius: 5,
  },
  ImageViewStyle: {
    margin: resp(6),
    width: resp(55),
    height: resp(55),
    borderWidth: 2,
    borderRadius: 5,
    borderColor: '#F01738',
  },
  hairline: {
    backgroundColor: '#F1F0F2',
    height: 5,
    width: '100%',
  },
  TitleProfileModalStyle: {
    alignContent: 'flex-start',
    fontWeight: 'bold',
    color: '#000',

    width: resp(207),
    fontSize: resp(16),
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
  MainContentBox: {
    flex: 1,

    backgroundColor: '#fff',
  },
  TabBox: {
    flex: 0.1,
    color: 'black',
  },
  BackButtonContainer: {
    flex: 0.2,
    marginLeft: 10,
    backgroundColor: 'white',
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
  OptionsProfileModalStyle: {
    alignContent: 'flex-start',
    marginTop: resp(30),
    color: '#000',

    width: resp(207),
    fontSize: resp(16),
  },
  Options2ProfileModalStyle: {
    alignContent: 'flex-start',
    marginTop: resp(5),
    color: '#000',

    width: resp(207),
    fontSize: resp(16),
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
  StatusAddStyle: {
    width: 20,
    height: 20,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute', //Here is the trick
    bottom: 22,
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

  styleChartTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    marginLeft: 10,
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
  storyTextView: {
    color: '#887F82',
    fontSize: resp(10),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
});

const mapStateToProps = (state) => {
  return {isConnected: state.network.isConnected};
};

export default connect(mapStateToProps, null)(OpenForPublicScreen);
