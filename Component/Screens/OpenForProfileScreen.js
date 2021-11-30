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
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import resp from 'rn-responsive-font';
import Toast from 'react-native-simple-toast';
import CustomMenuIcon from './CustomMenuIcon';
import {SliderBox} from 'react-native-image-slider-box';
import AsyncStorage from '@react-native-community/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import SeeMore from 'react-native-see-more-inline';
import firebase from 'react-native-firebase';
import FastImage from 'react-native-fast-image';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob'
console.disableYellowBox = true;
import {BASE_URL} from '../Component/ApiClient';
let width = Dimensions.get('window').width;

class OpenForProfileScreen extends Component {
  constructor(props) {
    super(props);
    (this.UserProfileCall = this.UserProfileCall.bind(this)),
      (this.AddFavourite = this.AddFavourite.bind(this));
    this.state = {
      isModalVisible: false,
      userNo: '',
      profileID: '',
      spinner: false,
      NoData: false,
      about: '',
      block_id: '',
      userAccessToken: '',
      fcmToken: '',
      wholeData: '',
      avatar: '',
      favourite: '',
      redIcon: require('../images/Heart_icon.png'),
      whiteIcon: require('../images/dislike.png'),
      pickedImage: require('../images/default_user.png'),
      ProfileData: '',
      baseUrl: `${BASE_URL}`,
      images: [require('../images/placeholder-image-2.png')],
      name: '',
      defaultProfile:'https://miro.medium.com/max/790/1*reXbWdk_3cew69RuAUbVzg.png'
    };
  }

  showLoading() {
    this.setState({spinner: true});
  }

  hideLoading() {
    this.setState({spinner: false});
  }

  async componentDidMount() {
    this.showLoading();
    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        this.setState({userAccessToken: accessToken});
      }
    });
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmToken: token});
      }
    });
    AsyncStorage.getItem('@user_id').then((userId) => {
      if (userId) {
        this.setState({userNo: userId});
        this.UserProfileCall();
      } else {
        this.hideLoading();
      }
    });
  }

  actionOnRow() {
    this.props.navigation.navigate('ProductDetailScreen');
  }

  AddFavourite() {
    this.showLoading();
    let id = this.state.userNo;
    let block_id = this.state.block_id;
    let formData = new FormData();

    formData.append('user_id', id);
    formData.append('block_id', block_id);
    formData.append('type', 1);
    var fav = `${BASE_URL}api-user/block-fav-user`;
    fetch(fav, {
      method: 'Post',
      headers: new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '1111',
        device_token: this.state.fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      }),
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.hideLoading();
        if (responseData.code == '200') {
          Toast.show(responseData.message);
          this.UserProfileCall();
        } else {
          this.setState({NoData: true});
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
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
        // this.hideLoading();
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // this.hideLoading();
        // dismissed
      }
    } catch (error) {
      // this.hideLoading();
      alert(error.message);
    }
  };
  base64ImageConvetor=async(links,imagelink)=>{
    this.showLoading();
    RNFetchBlob.fetch('GET', `${imagelink}`)
    .then(resp => {
       
      let base64image = resp.data;
      this.onShare(links,'data:image/png;base64,' + base64image);
    })
    .catch(err =>console.log('error',err));
  }

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
      `https://cartpedal.page.link?id=in.cartpedal&page=${name}&profileId=` +
        userid,
      'https://cartpedal.page.link',
    ).android
      .setPackageName('in.cartpedal')
      .ios.setBundleId('com.ios.cartpadle')
      .ios.setAppStoreId('1539321365');

    firebase
      .links()
      .createShortDynamicLink(link)
      .then((url) => {
        AsyncStorage.getItem('@Phonecontacts').then((NumberFormat) => {
          if (NumberFormat) {
            let numID = JSON.parse(NumberFormat);
            this.props.navigation.navigate('ForwardLinkScreen', {
              fcmToken: this.state.fcmToken,
              PhoneNumber: numID,
              userId: this.state.userNo,
              userAccessToken: this.state.userAccessToken,
              msgids: `${url}?&li=${Imagelink}`,
            });
          }
        });
      });
  };
  UserProfileCall() {
    let formData = new FormData();

    formData.append('user_id', +this.state.userNo);
    formData.append('profile_id', this.props.route.params.id);

    var userProfile = this.state.baseUrl + 'api-user/user-profile';
    fetch(userProfile, {
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
        this.hideLoading();
        if (responseData.code == '200') {
          if (responseData.data.length > 0) {
            this.setState({name: responseData.data[0].name});
          }
          if (
            responseData.data[0].covers !== undefined &&
            responseData.data[0].covers.length > 0
          ) {
            let imageArr = [];
            responseData.data[0].covers.map((item) => {
              imageArr.push(item.image);
            });
            this.setState({images: imageArr});
          }
          if (responseData.data[0].about !== null) {
            this.setState({about: responseData.data[0].about});
          }
          if (responseData.data[0].avatar == null) {
            this.setState({avatar: ''});
          } else {
            this.setState({avatar: responseData.data[0].avatar});
          }
          if (
            responseData.data[0].products !== undefined &&
            responseData.data[0].products.length > 0
          ) {
            this.setState({ProfileData: responseData.data[0].products});
            this.setState({wholeData: responseData.data[0]});
          } else {
            this.setState({NoData: true});
            this.setState({ProfileData: ''});
          }

          this.setState({block_id: responseData.data[0].id});
          this.setState({favourite: responseData.data[0].favourite});
        } else {
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  }

  ListEmpty = () => {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{marginTop: 120}}>
          {this.state.NoData ? 'No Record' : null}{' '}
        </Text>
      </View>
    );
  };

  async SaveUserProfileData(responseData) {
    await AsyncStorage.setItem('@user_id', responseData.data.userid.toString());
    await AsyncStorage.setItem(
      '@access_token',
      responseData.data.access_token.toString(),
    );
    await AsyncStorage.setItem('@PofileUser', responseData.data.id.toString());
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Spinner
          visible={this.state.spinner}
          color="#F01738"
          textStyle={styles.spinnerTextStyle}
        />
        <View style={styles.headerView}>
          <View style={styles.BackButtonContainer}>
            <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
              <Image
                source={require('../images/back_blck_icon.png')}
                style={styles.backButtonStyle}
              />
            </TouchableOpacity>
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

        <View style={styles.MainContentBox}>
          <ScrollView>
            <View style={styles.sliderImageContainer}>
              <SliderBox
                images={this.state.images}
                style={styles.sliderImageStyle}
              />
              <TouchableOpacity style={styles.RiyaImageContainer}>
                <Image
                  source={
                    this.state.avatar == ''
                      ? this.state.pickedImage
                      : {uri: this.state.avatar}
                  }
                  style={styles.RiyaImageViewStyle}
                />
                <Image
                  source={require('../images/status_add_largeicon.png')}
                  style={styles.StatusAddLargeStyle}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.ProfileInfoContainer}>
              <Text style={styles.PersonNameStyle}>{this.state.name}</Text>
              <View style={styles.ListMenuContainer2}>
                <TouchableOpacity
                  style={styles.messageButtonContainer}
                  onPress={() => {
                    this.props.navigation.navigate('ChatDetailScreen', {
                      userid: this.state.wholeData.id,
                      username: this.props.route.params.name,
                      userabout: this.state.about,
                      useravatar: this.state.avatar,
                      groupexit: false,
                      groupId: '0',
                      msg_type: '0',
                      userphone: this.state.wholeData.mobile,
                      membersCount: 1,
                    });
                  }}>
                  <Image
                    source={require('../images/message_icon.png')}
                    style={styles.messageButtonStyle}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={this.AddFavourite}
                  style={styles.messageButtonContainer}>
                  <Image
                    source={
                      this.state.favourite == 1
                        ? this.state.redIcon
                        : this.state.whiteIcon
                    }
                    style={[
                      styles.heartButtonStyle,
                      {
                        width: this.state.favourite == 1 ? resp(11) : resp(18),
                        height: this.state.favourite == 1 ? resp(9) : resp(18),
                        marginTop:
                          this.state.favourite == 1 ? resp(4) : resp(-1),
                      },
                    ]}
                  />
                </TouchableOpacity>

                <CustomMenuIcon
                  menutext="Menu"
                  menustyle={{
                    marginRight: 5,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}
                  textStyle={{
                    color: 'white',
                  }}
                  option1Click={() => {
                    let name = 'OpenForProfileScreen';
                    let image;
                    this.state.avatar != null
                    ? image= this.state.avatar
                    : image=this.state.defaultProfile
                    this.link(this.props.route.params.id, name,image);
                  }}
                  option2Click={() => {
                    let name = 'OpenForProfileScreen';
                    let image;
                    this.state.avatar != null
                    ? image= this.state.avatar
                    : image=this.state.defaultProfile
                    this.forwardlink(this.props.route.params.id, name,image);
                  }}
                />
              </View>
            </View>
            <View style={styles.PersonInfoContainer}>
              <View style={styles.card}>
                <View style={{width: width}}>
                  {this.state.about ? (
                    <SeeMore
                      style={styles.PersonDescriptionStyle}
                      numberOfLines={2}
                      linkColor="red"
                      seeMoreText="read more"
                      seeLessText="read less">
                      {this.state.about}
                    </SeeMore>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.horizontalLine}>
              <View style={styles.hairline} />
            </View>

            <FlatList
              style={{flex: 1}}
              data={this.state.ProfileData}
              keyExtractor={(item, index) => index}
              numColumns={2}
              ListEmptyComponent={this.ListEmpty}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => {
                      this.props.navigation.navigate('ProductDetailScreen', {
                        id: item.id,
                      });
                    }}>
                    <FastImage
                      source={
                        item.image[0]
                          ? {uri: item.image[0].image}
                          : this.state.pickedImage
                      }
                      style={styles.image}
                    />
                    {item.image[1] ? (
                      <View style={styles.MultipleOptionContainer}>
                        <Image
                          source={require('../images/multipleImageIcon.png')}
                          style={styles.MultipleIconStyle}
                        />
                      </View>
                    ) : null}
                    <View>
                      <Text style={styles.itemNameStyle}>{item.name}</Text>
                    </View>

                    <View style={styles.box}>
                      <View style={styles.itemPriceContainer}>
                        {item.price != 0 ? (
                          <Text style={styles.itemPriceStyle}>
                            {'\u20B9'} {item.price}
                          </Text>
                        ) : (
                          <TouchableOpacity
                            style={{
                              backgroundColor: '#F01738',
                              width: resp(90),
                              height: 30,
                              marginTop: 3,
                              marginBottom: 5,
                            }}>
                            <Text style={{color: '#fff', textAlign: 'center'}}>
                              Ask For Rate
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.eyeButtonContainer}
                        onPress={() => {
                          this.props.navigation.navigate(
                            'ProductDetailScreen',
                            {
                              id: item.id,
                            },
                          );
                        }}>
                        <Image
                          source={require('../images/shopping-cart-Icon.png')}
                          style={styles.ShopingCartStyle}
                        />
                      </TouchableOpacity>

                      <View style={styles.ListMenuContainer}>
                        <TouchableOpacity>
                          <CustomMenuIcon
                            menutext="Menu"
                            menustyle={{
                              marginRight: 5,
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                            }}
                            textStyle={{
                              color: 'white',
                            }}
                            option1Click={() => {
                              let name = 'ProductDetailScreen';
                              let image;
                              item.image[0]
                          ? image= item.image[0].image
                          : image=this.state.defaultProfile
                              this.link(item.id, name,image);
                            }}
                            option2Click={() => {
                              let name = 'ProductDetailScreen';
                              let image;
                              item.image[0]
                          ? image= item.image[0].image
                          : image=this.state.defaultProfile
                              this.forwardlink(item.id, name,image);
                            }}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
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
    flexDirection: 'column',
    backgroundColor: 'white',
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
  BackButtonContainer: {
    flex: 0.2,
    marginLeft: 10,
    backgroundColor: 'white',
  },
  backButtonStyle: {
    margin: 10,
    height: 20,
    width: 20,
  },
  ListMenuContainer2: {
    flexDirection: 'row',
    flex: 0.2,
    width: resp(0),
    height: resp(30),
  },
  TitleContainer: {
    flexDirection: 'row',
    flex: 0.6,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  LogoIconStyle: {
    margin: 5,
    height: 30,
    width: 30,
  },
  TitleStyle: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: resp(20),
    textAlign: 'center',
  },

  messageButtonContainer: {
    margin: resp(5),
    marginTop: resp(5),
    width: resp(15),
    height: resp(15),
    borderRadius: resp(50),
    backgroundColor: '#ebced7',
  },
  messageButtonStyle: {
    marginTop: resp(4),
    color: '#F01738',
    width: resp(7),
    height: resp(7),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButtonStyle: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
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
  spinnerTextStyle: {
    color: '#F01738',
  },

  card: {
    marginHorizontal: 20,
    borderColor: 'rgba(0,0,0,0)',
    borderWidth: 1,
  },
  MainContentBox: {
    flex: 1,
    flexDirection: 'column',
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
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', //Here is the trick
    bottom: 0,
  },
  loading: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonStyle: {
    flex: 0.25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  StyleSettingTab: {
    marginTop: 9,
    width: 30,
    height: 30,
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

  bottomActiveTextStyle: {
    color: '#FB3954',
    fontSize: resp(10),
    marginTop: 5,
    textAlign: 'center',
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
  sliderImageContainer: {
    width: resp(375),
    height: resp(200),
  },
  sliderImageStyle: {
    width: resp(420),
    height: resp(180),
  },
  RiyaImageContainer: {
    marginBottom: resp(30),
    margin: resp(10),
    flexDirection: 'column',
    flex: 0.2,
    width: resp(80),
    height: resp(80),
    position: 'absolute', //Here is the trick
    bottom: 0,
  },
  RiyaImageViewStyle: {
    margin: resp(10),
    width: resp(90),
    height: resp(90),
    borderRadius: resp(10),
    borderWidth: 2,
    borderColor: '#fff',
  },
  StatusAddLargeStyle: {
    marginLeft: resp(80),
    width: resp(30),
    height: resp(30),
    position: 'absolute',
    bottom: 0,
    top: 72,
  },

  ProfileInfoContainer: {
    flexDirection: 'row',
    width: '100%',
    height: resp(30),
    color: '#fff',
  },
  PersonInfoContainer: {
    flexDirection: 'column',

    width: width,
    backgroundColor: 'white',
    height: resp(66),
  },
  PersonNameStyle: {
    flex: 0.8,
    marginLeft: resp(20),
    fontSize: resp(16),
    width: resp(100),
    height: resp(20),
    color: '#2B2B2B',
    backgroundColor: 'white',
    fontWeight: 'bold',
  },
  PersonDescriptionStyle: {
    marginTop: resp(-2),
    marginLeft: resp(30),
    flexDirection: 'row',
    fontSize: resp(12),
    width: resp(334),
    height: resp(44),
    color: '#7F7F7F',
  },

  horizontalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: resp(2),
  },
  hairline: {
    backgroundColor: '#C8C7CC80',
    height: 2,
    width: '100%',
  },

  ImageViewStyle: {
    margin: resp(8),
    width: resp(55),
    height: resp(55),
    borderWidth: 2,
    borderColor: '#F01738',
  },

  image: {
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    margin: 0,

    borderRadius: 10,
    width: resp(180),
    height: resp(196),
  },
  listItem: {
    marginTop: resp(15),
    width: '50%',
    flexDirection: 'column',
    margin: resp(0),

    backgroundColor: 'white',
    borderRadius: 10,
  },
  MultipleOptionContainer: {
    marginLeft: 20,
    position: 'absolute',
    bottom: 50,
    width: 14,
    height: 14,
    borderRadius: resp(20),
    backgroundColor: '#fff',
  },
  MultipleIconStyle: {
    marginLeft: 20,
    width: resp(13.85),
    height: resp(13.85),
    position: 'absolute', //Here is the trick
    bottom: 0,
    right: 1,
  },
  itemNameStyle: {
    color: '#887F82',
    width: '100%',

    marginLeft: resp(15),
    fontSize: resp(14),
  },
  itemPriceStyle: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: resp(7),
    fontSize: resp(13),
  },
  itemPriceContainer: {
    flex: 0.8,
    marginLeft: resp(15),
    flexDirection: 'row',
  },
  box: {
    width: resp(200),
    height: resp(25),
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  priceContainer: {
    marginLeft: resp(-5),
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  ListMenuContainer: {
    flexDirection: 'row',
    flex: 0.1,
    backgroundColor: 'white',
    width: resp(0),
  },
  eyeButtonContainer: {
    flex: 0.1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: resp(2),
    marginRight: 8,
    width: resp(20),
    height: resp(20),
    borderRadius: resp(50),
    backgroundColor: '#ebced7',
  },
  ShopingCartStyle: {
    marginTop: resp(0),
    width: 10,
    height: 11,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default OpenForProfileScreen;
