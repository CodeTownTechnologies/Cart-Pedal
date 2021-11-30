/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
console.disableYellowBox = true;

import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import resp from 'rn-responsive-font';
import Toast from 'react-native-simple-toast';
import CustomMenuIcon from './CustomMenuIcon';
import {SliderBox} from 'react-native-image-slider-box';
import MenuIcon from './MenuIcon';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage';
import SeeMore from 'react-native-see-more-inline';
import firebase from 'react-native-firebase';
import {BASE_URL} from '../Component/ApiClient';
import {wp, hp} from '../Component/hightWidthRatio';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob'
class OrderRecievedViewScreen extends Component {
  constructor(props) {
    super(props);
    (this.CartListCall = this.CartListCall.bind(this)),
      (this.UserProfileCall = this.UserProfileCall.bind(this)),
      (this.AddFavourite = this.AddFavourite.bind(this));
    this.state = {
      OderPlaceProduct: '',
      NoData: '',
      spinner: false,
      ProfileData: '',
      userAccessToken: '',
      fcmToken: '',
      favourite: '',
      redIcon: require('../images/Heart_icon.png'),
      whiteIcon: require('../images/dislike.png'),
      avatar: '',
      pickedImage: require('../images/default_user.png'),
      baseUrl: `${BASE_URL}`,
      images: [require('../images/placeholder-image-2.png')],
      defaultProfile:'https://miro.medium.com/max/790/1*reXbWdk_3cew69RuAUbVzg.png',
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
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmToken: token});
        //  this.setState({OderPlaceProduct: this.props.route.params.wholeData});
      }
    });
    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        this.setState({userAccessToken: accessToken});
      }
    });
    AsyncStorage.getItem('@user_id').then((userId) => {
      if (userId) {
        this.setState({userNo: userId});
        this.CartListCall();
        //  this.UserProfileCall();
      } else {
        this.hideLoading();
      }
    });
  }
  ListEmpty = () => {
    return (
      <View style={styles.container}>
        <Text
          style={{
            margin: resp(170),
          }}>
          {this.state.NoData ? 'No Record' : null}{' '}
        </Text>
      </View>
    );
  };

  AddFavourite() {
    this.showLoading();
    let id = this.state.userNo;
    let block_id = this.state.block_id;
    let formData = new FormData();
    formData.append('user_id', id);
    formData.append('block_id', block_id);
    formData.append('type', 2);
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
          this.UserProfileCall(this.state.ProfileData.block_id);
        } else {
          this.setState({NoData: true});
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  }

  base64ImageConvetor=async(links,imagelink)=>{
    this.showLoading();
    RNFetchBlob.fetch('GET', `${imagelink}`)
    .then(resp => {
       
      let base64image = resp.data;
      this.onShare(links,'data:image/png;base64,' + base64image);
    })
    .catch(err =>console.log('error',err));
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
        if (result.activityType) {
        } else {
        }
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {
      alert(error.message);
    }
  };

  link = async (id, name, orderID,Imagelink) => {
    const link = new firebase.links.DynamicLink(
      `https://cartpedal.page.link?id=in.cartpedal&page=${name}&profileId=${id}&OrderId=${orderID}`,
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

  forwardlink = async (userid, name, orderID,Imagelink) => {
    const link = new firebase.links.DynamicLink(
      `https://cartpedal.page.link?id=in.cartpedal&page=${name}&profileId=${userid}&OrderId=${orderID}`,
      'https://cartpedal.page.link',
    ).android
      .setPackageName('in.cartpedal')
      .ios.setBundleId('com.ios.cartpadle')
      .ios.setAppStoreId('1539321365');

    firebase
      .links()
      .createShortDynamicLink(link)
      .then((url) => {
        console.log('the url', url);
        //  this.sendMessage(url,userid);
        AsyncStorage.getItem('@Phonecontacts').then((NumberFormat) => {
          if (NumberFormat) {
            let numID = JSON.parse(NumberFormat);
            //   this.setState({PhoneNumber:numID})
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

  CartListCall() {
    let formData = new FormData();
    formData.append('user_id', this.state.userNo);
    formData.append('type', 2);
    formData.append('order_id', this.props.route.params.order_id);
    console.log('form data==' + JSON.stringify(formData));
    var CartList = 'https://www.cartpedal.com/api-product/cart-list';
    fetch(CartList, {
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
        if (responseData.code == '200') {
          this.UserProfileCall(responseData.data[0].id);
          this.setState({OderPlaceProduct: responseData.data[0].products});
        } else {
          this.setState({NoData: true});
        }
        console.log('response',responseData);
      })
      .catch((error) => {
        // this.hideLoading();
        console.error(error);
      })
      .done();
  }


  AskForStautsCall(blockID,orderID ) {
    this.showLoading();
    let formData = new FormData();
    formData.append('user_id', this.state.userNo);
    formData.append('type', 1);
    formData.append('order_id', orderID);
    formData.append('block_id', blockID);
    console.log(JSON.stringify(formData));
    var AskForStautsURL = `${BASE_URL}api-product/order-status`;
    fetch(AskForStautsURL, {
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
        console.log(responseData);
        if (responseData.code == '200') {
          alert('Order has been accepted');
        } else {
          alert(responseData.message);
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  }

  UserProfileCall(profile_id) {
    let formData = new FormData();
    formData.append('user_id', +this.state.userNo);
    formData.append('profile_id', profile_id);
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
        if (responseData.code == '200') {
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
          this.setState({avatar: responseData.data[0].avatar});
          this.setState({ProfileData: responseData.data[0]});
          this.setState({about: responseData.data[0].about});
          this.setState({block_id: responseData.data[0].id});
          this.setState({favourite: responseData.data[0].favourite});
          if (responseData.data[0].avatar == null) {
            this.setState({avatar: ''});
          } else {
            this.setState({avatar: responseData.data[0].avatar});
          }
        } else {
        }
        this.hideLoading();
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  }

  actionOnRow(item) {}

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
          <View style={styles.SearchContainer} />
        </View>

        <View style={styles.MainContentBox}>
          <ScrollView>
            <View style={styles.sliderImageContainer}>
              <SliderBox
                images={this.state.images}
                style={styles.sliderImageStyle}
              />

              <View style={styles.RiyaImageContainer}>
                <TouchableOpacity>
                  <Image
                    source={
                      this.state.avatar == ''
                        ? this.state.pickedImage
                        : {uri: this.state.avatar}
                    }
                    style={styles.RiyaImageViewStyle}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.ProfileInfoContainer}>
              <View style={styles.PersonInfoContainer}>
                <Text style={styles.PersonNameStyle}>
                  {this.state.ProfileData.name}
                </Text>
                <View style={{marginLeft: 25, marginTop: 5}}>
                  {this.state.ProfileData.about ? (
                    <SeeMore
                      style={styles.ProfileDescription}
                      numberOfLines={2}
                      linkColor="red"
                      seeMoreText="read more"
                      seeLessText="read less">
                      {this.state.ProfileData.about}
                    </SeeMore>
                  ) : null}
                </View>
              </View>
              <View style={styles.ListMenuContainer}>
                <TouchableOpacity
                  style={styles.messageButtonContainer}
                  onPress={() => {
                    this.props.navigation.navigate('ChatDetailScreen', {
                      userid: this.state.ProfileData.block_id,
                      userabout: this.state.ProfileData.about,
                      username: this.state.ProfileData.name,
                      useravatar: this.state.avatar,
                      groupexit: false,
                      groupId: 0,
                      msg_type: '0',
                      membersCount:2,
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

                <View style={styles.MenuStyleContanier}>
                  <MenuIcon
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
                      Toast.show('CLicked Block', Toast.LONG);
                    }}
                    option2Click={() => {
                      let name = 'OderPlacedViewScreen';
                      let image;
                      this.state.avatar == ''
                        ? image=this.state.defaultProfile
                        :image= this.state.avatar
                      this.link(
                        this.state.ProfileData.block_id,
                        name,
                        this.props.route.params.order_id,
                        image
                      );
                    }}
                    option3Click={() => {
                      let name = 'OderPlacedViewScreen';
                      let image;
                      this.state.avatar == ''
                        ? image=this.state.defaultProfile
                        :image= this.state.avatar
                      this.forwardlink(
                        this.state.ProfileData.block_id,
                        name,
                        this.props.route.params.order_id,
                        image
                      );
                    }}
                  />
                </View>
              </View>
            </View>
            <TouchableOpacity
                            onPress={() => {
                              this.AskForStautsCall(this.state.ProfileData.id, this.props.route.params.order_id);
                            }}>
                            <View style={styles.PlacedButtonStyle}>
                              <Text style={styles.PlaceHolderTextStyle}>
                                Accepted
                              </Text>
                            </View>
                          </TouchableOpacity>
            <View style={styles.horizontalLine}>
              <View style={styles.hairline} />
            </View>
            <FlatList
              style={{flex: 1}}
              data={this.state.OderPlaceProduct}
              keyExtractor={({item, index}) => index}
              numColumns={1}
              renderItem={({item}) => {
                return (
                  <View style={styles.listItem}>
                    <Image source={{uri: item.image}} style={styles.image} />

                    <View style={styles.columnStyele}>
                      <Text style={styles.itemNameStyle}>{item.name}</Text>

                      <Text style={styles.SubTitlePoductNameSytle}>
                        {item.category}
                      </Text>

                      <View style={styles.itemPriceContainer}>
                        <Text style={styles.itemPriceStyle}>
                          {'\u20B9'} {item.price}
                        </Text>
                        <Text style={styles.QtyStyle}>Qty:{item.quantity}</Text>
                        {item.unit ? (
                          <Text style={styles.QtyStyle}>{item.unit}</Text>
                        ) : null}
                        {item.detailone ? (
                          <Text style={styles.QtyStyle}>{item.detailone}</Text>
                        ) : null}
                        {item.detailtwo ? (
                          <Text style={styles.QtyStyle}>{item.detailtwo}</Text>
                        ) : null}
                        {item.description ? (
                          <Text style={styles.QtyStyleDescrp}>
                            {item.description}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <View style={styles.MenuStyleContanier}>
                      <CustomMenuIcon
                        menutext="Menu"
                        menustyle={{
                          position: 'absolute',
                          right: -5,
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                        }}
                        textStyle={{
                          color: 'white',
                        }}
                        option1Click={() => {
                          let name = 'OderPlacedViewScreen';
                          let image;
                          item.image?
                          image=item.image
                          :image=this.state.defaultProfile
                          this.link(
                            this.state.ProfileData.block_id,
                            name,
                            this.props.route.params.order_id,
                            image
                          );
                        }}
                        option2Click={() => {
                          let name = 'OderPlacedViewScreen';
                          let image;
                          item.image?
                          image=item.image
                          :image=this.state.defaultProfile
                          this.forwardlink(
                            this.state.ProfileData.block_id,
                            name,
                            this.props.route.params.order_id,
                            image
                          );
                        }}
                      />
                    </View>
                  </View>
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
                source={require('../images/cart_bag_active_icon.png')}
                style={styles.styleChartTab}
              />
              <Text style={styles.bottomActiveTextStyle}>Cart</Text>
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
  PlacedButtonStyle: {
    marginLeft: resp(10),
    
    height: 40,
    width: wp(130),
    backgroundColor: '#FFCF33',
  },

  PlaceHolderTextStyle: {
    marginTop: resp(10),
    alignSelf: 'center',
    height: resp(25),
    fontWeight: 'bold',
    fontSize: 15,
    color: '#2B2B2B',
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
  TitleContainer: {
    flexDirection: 'row',
    flex: 0.6,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  MenuStyleContanier: {
    marginRight: 15,
    height: resp(30),
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
  ProfileDescription: {
    width: resp(200),
    height: resp(50),

    color: '#7F7F7F',
    fontSize: resp(12),
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
  messageButtonContainer: {
    margin: resp(5),
    marginTop: resp(5),
    width: resp(15),
    height: resp(15),
    borderRadius: resp(50),
    backgroundColor: '#ebced7',
  },
  spinnerTextStyle: {
    color: '#F01738',
  },
  MainContentBox: {
    flex: 1,
    flexDirection: 'column',
  },
  heartButtonStyle: {
    marginTop: resp(4),
    color: '#F01738',
    width: resp(10),
    height: resp(8),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  TabBox: {
    flex: 0.1,
    color: '#000',
  },
  tabStyle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 60,
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
  StyleSettingTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnStyele: {
    width: '45%',
    marginLeft: resp(10),
    flexDirection: 'column',
    marginTop: resp(20),
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
  FloatingActionStyle: {
    marginTop: 5,
    width: 50,
    height: 50,
    position: 'absolute', //Here is the trick
    bottom: 0,
    right: 20,
  },
  bottomActiveTextStyle: {
    color: '#FB3954',
    fontSize: resp(10),

    marginLeft: resp(5),
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
    bottom: -20,
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
    marginTop: resp(-20),
    marginLeft: resp(80),
    width: resp(30),
    height: resp(30),
    position: 'absolute', //Here is the trick
    bottom: 0,
  },
  sliderMenuContainer: {
    marginTop: resp(20),
    marginRight: resp(-15),
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: resp(20),
    backgroundColor: '#9da1a3',
  },
  sliderMenuContainer2: {
    flex: 0.2,
    marginTop: resp(0),

    backgroundColor: 'red',
  },
  moreWhiteIconStyle: {
    marginTop: resp(7),
    marginLeft: resp(12),
    color: '#fff',
    width: resp(3.44),
    height: resp(15.33),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ProfileInfoContainer: {
    flexDirection: 'row',
    width: resp(375),
    height: resp(100),

    color: '#fff',
  },
  PersonInfoContainer: {
    flex: 0.89,
    flexDirection: 'column',
    marginTop: resp(20),

    height: resp(66),
  },
  PersonNameStyle: {
    marginLeft: resp(25),
    fontSize: resp(16),
    width: '100%',
    height: resp(20),
    color: '#2B2B2B',
    fontWeight: 'bold',
  },
  PersonDescriptionStyle: {
    marginTop: resp(-2),
    marginLeft: resp(10),
    fontSize: resp(12),
    width: resp(450),
    height: 'auto',
    color: '#7F7F7F',
  },
  TotalBox: {
    flexDirection: 'row',
    width: '100%',
    height: resp(70),
  },
  TotalProfileViewContainer: {
    marginLeft: resp(90),
    flexDirection: 'column',
    width: resp(110),
    height: resp(80),
  },
  TotalProductViewContainer: {
    marginRight: resp(80),
    flexDirection: 'column',
    width: resp(120),
    height: resp(100),
  },
  TotalProfileTextStyle: {
    height: resp(25),
    marginLeft: resp(38),
    width: resp(35),
    height: resp(25),
    fontSize: resp(20),
    fontWeight: 'bold',
  },
  TotalProfileViewTextStyle: {
    margin: resp(5),
    width: resp(100),
    height: resp(35),
    fontSize: resp(12),
    color: '#7F7F7F',
  },
  TotalProductViewTextStyle: {
    margin: resp(5),
    marginLeft: resp(10),
    width: resp(120),
    height: resp(35),
    fontSize: resp(12),
    color: '#7F7F7F',
  },
  horizontalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: resp(2),
  },
  hairline: {
    backgroundColor: '#C8C7CC80',
    height: 5,
    width: '100%',
  },
  storyItemBox: {
    height: resp(90),
    backgroundColor: 'white',
    flexDirection: 'column',
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 1,
      width: 5,
    },
    elevation: 2,
  },
  columnView: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ImageViewStyle: {
    margin: resp(8),
    width: resp(55),
    height: resp(55),
    borderWidth: 2,
    borderColor: '#F01738',
  },
  StatusAddStyle: {
    marginRight: resp(-50),
    marginTop: -10,
    width: 20,
    height: 20,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute', //Here is the trick
    bottom: 25,
  },
  storyTextView: {
    color: '#887F82',
    fontSize: resp(10),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  GridViewContainer: {
    flex: 1,

    margin: 0,
  },
  image: {
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    margin: 0,
    borderRadius: 10,
    width: resp(164),
    height: resp(196),
  },
  listItem: {
    marginTop: resp(20),
    width: '100%',
    marginLeft: resp(20),
    flexDirection: 'row',
    margin: resp(0),

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
    color: '#2B2B2B',
    marginLeft: resp(15),
    fontSize: resp(14),
    fontWeight: 'bold',
  },
  itemPriceStyle: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: resp(7),
    fontSize: resp(14),
    fontWeight: 'bold',
  },
  itemPriceContainer: {
    color: '#2B2B2B',
    marginLeft: resp(10),
    marginTop: resp(5),
    flexDirection: 'column',
    fontWeight: 'bold',
  },
  SubTitlePoductNameSytle: {
    marginLeft: resp(15),
    marginTop: resp(5),
    flexDirection: 'column',
    fontWeight: 'bold',
    fontSize: resp(14),
  },
  QtyStyle: {
    marginLeft: resp(3),
    marginTop: resp(5),
    flexDirection: 'column',
    fontWeight: 'bold',
    fontSize: resp(14),
  },
  QtyStyleDescrp: {
    marginLeft: resp(3),
    marginTop: resp(5),
    flexDirection: 'column',
    fontWeight: 'bold',
    fontSize: resp(14),
    marginBottom: 10,
  },
  box: {
    width: resp(200),
    height: resp(25),

    backgroundColor: 'white',
    flexDirection: 'column',
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 2,
      width: 5,
    },
    elevation: 0,
  },
  priceContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  ListMenuContainer: {
    marginTop: resp(20),
    marginLeft: resp(0),
    flexDirection: 'row',
    flex: 0.19,

    width: resp(0),
    height: resp(45),
  },
  eyeButtonContainer: {
    flex: 0.2,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: resp(50),
    height: resp(30),
    borderRadius: resp(50),
    backgroundColor: 'white',
  },
  eyeButtonStyle: {
    marginTop: resp(0),
    width: resp(18),
    height: resp(11.17),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewTextStyle: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: resp(30),
    height: resp(24),
    backgroundColor: '#fff',
  },
});
export default OrderRecievedViewScreen;
