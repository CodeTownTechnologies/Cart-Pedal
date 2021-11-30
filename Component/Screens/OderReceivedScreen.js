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
  Dimensions,
  Platform,
} from 'react-native';
import resp from 'rn-responsive-font';
import CustomMenuIcon from './CustomMenuIcon';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage';
import SeeMore from 'react-native-see-more-inline';
import firebase from 'react-native-firebase';
import {BASE_URL} from '../Component/ApiClient';
import {wp, hp} from '../Component/hightWidthRatio';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob'
let width = Dimensions.get('window').width;

class CartPlaceScreen extends Component {
  constructor(props) {
    super(props);
    (this.CartListCall = this.CartListCall.bind(this)),
      (this.AddFavourite = this.AddFavourite.bind(this));
    this.AskForStautsCall = this.AskForStautsCall.bind(this);
    this.state = {
      OderRecevieProduct: '',
      spinner: false,
      userAccessToken: '',
      userNo: '',
      favourite: '',
      ButtomTab: false,
      NoData: '',
      quantity: '',
      Oder_id: '',
      block_id: '',
      total_price: '',
      fcmToken: '',
      redIcon: require('../images/Heart_icon.png'),
      whiteIcon: require('../images/dislike.png'),
      pickedImage: require('../images/default_user.png'),
      avatar: '',
      acceptText: 'Accepted',
      defaultProfile:'https://miro.medium.com/max/790/1*reXbWdk_3cew69RuAUbVzg.png'
    };
  }

  showLoading() {
    this.setState({spinner: true});
  }

  hideLoading() {
    this.setState({spinner: false});
  }

  GotoNextScreen(item) {}
  actionOnRow(item) {}

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
        console.log(' id from login  user id ====' + this.state.userNo);
        this.CartListCall();
      } else {
        console.log('else is executed');
        this.hideLoading();
      }
    });
  }

  addQuantity = (data) => {
    let cart_quantity = 0;
    let total_price = 0;
    data.map((item) => {
      console.log(item.cartitem);
      cart_quantity = cart_quantity + item.cartitem;
      total_price = total_price + item.cartvalue;
    });
    this.setState({quantity: cart_quantity});
    this.setState({total_price: total_price});
  };

  ListEmpty = () => {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{marginTop: 120}}>
          {this.state.NoData ? 'No Record' : null}{' '}
        </Text>
      </View>
    );
  };

  CartListCall() {
    let userAccessToken, fcmToken, userNo;
    AsyncStorage.getItem('@access_token').then((accessToken) => {
      userAccessToken = accessToken;
      AsyncStorage.getItem('@fcmtoken').then((token) => {
        fcmToken = token;
        AsyncStorage.getItem('@user_id').then((userId) => {
          userNo = userId;
          let formData = new FormData();
          formData.append('user_id', userNo);
          formData.append('type', 2);
          var CartList = `${BASE_URL}api-product/cart-list`;
          fetch(CartList, {
            method: 'Post',
            headers: new Headers({
              'Content-Type': 'multipart/form-data',
              device_id: '1111',
              device_token: fcmToken,
              device_type: Platform.OS,
              Authorization: JSON.parse(userAccessToken),
            }),
            body: formData,
          })
            .then((response) => response.json())
            .then((responseData) => {
              this.hideLoading();
              if (responseData.code == '200') {
                if (responseData.data[0].avatar == null) {
                  this.setState({avatar: ''});
                } else {
                  this.setState({avatar: responseData.data[0].avatar});
                }
                if (
                  responseData.data !== undefined &&
                  responseData.data.length > 0
                ) {
                  this.setState({ButtomTab: true});
                  this.setState({OderRecevieProduct: responseData.data});
                  this.addQuantity(responseData.data);
                  this.setState({block_id: responseData.data[0].id});
                  this.setState({Oder_id: responseData.data[0].orderid});
                } else {
                }
              } else {
                this.setState({NoData: true});
              }
            })
            .catch((error) => {
              this.hideLoading();
              console.error(error);
            })
            .done();
        });
      });
    });
  }

  AskForStautsCall(orderID, blockID) {
    this.showLoading();
    let formData = new FormData();
    formData.append('user_id', this.state.userNo);
    formData.append('type', 1);
    formData.append('order_id', orderID);
    formData.append('block_id', blockID);
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
          setTimeout(() => alert('Order has been accepted'), 10);
        } else {
          setTimeout(() => alert(responseData.message), 10);
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  }

  AddFavourite(block_id) {
    this.showLoading();
    let id = this.state.userNo;
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
          this.CartListCall();
        } else {
          this.setState({NoData: true});
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  }

  async SaveLoginUserData(responseData) {
    await AsyncStorage.setItem('@user_id', responseData.data.userid.toString());
    await AsyncStorage.setItem(
      '@access_token',
      responseData.data.access_token.toString(),
    );
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

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Spinner
          visible={this.state.spinner}
          color="#F01738"
          textStyle={styles.spinnerTextStyle}
        />

        <View style={styles.MainContentBox}>
          <View style={styles.hairline} />

          <FlatList
            style={{flex: 0.85}}
            data={this.state.OderRecevieProduct}
            initialNumToRender={20}
            keyExtractor={(item, index) => index}
            renderItem={({item}) => {
              return (
                <View>
                  {item.products[0] ? (
                    <TouchableOpacity
                      style={styles.itemBox}
                      onPress={() => {
                        this.props.navigation.navigate(
                          'OrderRecievedViewScreen',
                          {
                            order_id: item.orderid,
                          },
                        );
                      }}>
                      <View style={styles.box}>
                        <View style={styles.ProfileImageContainer}>
                          <TouchableOpacity>
                            <Image
                              source={
                                item.avatar == null
                                  ? this.state.pickedImage
                                  : {uri: item.avatar}
                              }
                              style={styles.ProfileImageViewStyle}
                            />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.ProfileInfoContainer}>
                          <Text style={styles.PersonNameStyle}>
                            {item.name}
                          </Text>
                          <View style={{width: wp(520)}}>
                            {item.about ? (
                              <SeeMore
                                style={styles.ProfileDescription}
                                numberOfLines={2}
                                linkColor="red"
                                seeMoreText="read more"
                                seeLessText="read less">
                                {item.about.substring(0, 55) + '...'}
                              </SeeMore>
                            ) : null}
                            <Text style={{color: 'grey', marginBottom: 10}}>
                              Order id:{item.orderid} {item.date},{item.time}
                            </Text>
                          </View>
                        </View>
                        <View style={{width: width - 160}}>
                          <View style={styles.ListMenuContainer}>
                            <TouchableOpacity
                              style={styles.messageButtonContainer}
                              onPress={() => {
                                console.log('id of user', item.id);
                                this.props.navigation.navigate(
                                  'ChatDetailScreen',
                                  {
                                    userid: item.id,
                                    username: item.name,
                                    userabout: item.about,
                                    useravatar: item.avatar,
                                    groupexit: false,
                                    groupId: '0',
                                    msg_type: '0',
                                    userphone: item.mobile,
                                    membersCount: 1,
                                  },
                                );
                              }}>
                              <Image
                                source={require('../images/message_icon.png')}
                                style={styles.messageButtonStyle}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {
                                this.AddFavourite(item.id);
                              }}
                              style={styles.messageButtonContainer}>
                              <Image
                                source={
                                  item.favourite == 1
                                    ? this.state.redIcon
                                    : this.state.whiteIcon
                                }
                                style={[
                                  styles.heartButtonStyle,
                                  {
                                    width:
                                      item.favourite == 1 ? resp(11) : resp(18),
                                    height:
                                      item.favourite == 1 ? resp(9) : resp(18),
                                    marginTop:
                                      item.favourite == 1 ? resp(4) : resp(0),
                                  },
                                ]}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.ViewButtonContainer}
                              onPress={() => {
                                this.props.navigation.navigate(
                                  'OrderRecievedViewScreen',
                                  {
                                    order_id: item.orderid,
                                  },
                                );
                              }}>
                              <Text style={styles.viewButtonStyle}>
                                View All
                              </Text>
                            </TouchableOpacity>
                            <CustomMenuIcon
                              menutext="Menu"
                              menustyle={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 4,
                                flexDirection: 'row',
                              }}
                              textStyle={{
                                color: 'white',
                              }}
                              option1Click={() => {
                                let name = 'OderPlacedViewScreen';
                                let image;
                                item.products[0].image?
                                image= item.products[0].image
                                :image=this.state.defaultProfile
                                this.link(item.id, name, item.orderid,image);
                              }}
                              option2Click={() => {
                                let name = 'OderPlacedViewScreen';
                                let image;
                                item.products[0].image?
                                image= item.products[0].image
                                :image=this.state.defaultProfile
                                this.forwardlink(item.id, name, item.orderid,image);
                              }}
                            />
                          </View>
                        </View>
                      </View>
                      <View style={styles.columnView}>
                        <View
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                          }}>
                          <View style={styles.ImageContainer}>
                            <Image
                              source={{uri: item.products[0].image}}
                              style={{
                                width: wp(90),
                                height: hp(130),
                                borderRadius: 5,
                              }}
                            />
                            <Text style={styles.itemNameStyle}>
                              {item.products[0].name}
                            </Text>
                            <Text style={styles.itemPriceStyle}>
                              {'\u20B9'}
                              {item.products[0].price}
                            </Text>
                          </View>
                          {item.products[1] ? (
                            <View style={styles.ImageContainer}>
                              <Image
                                source={{uri: item.products[1].image}}
                                style={{
                                  width: wp(90),
                                  height: hp(130),
                                  borderRadius: 5,
                                }}
                              />
                              <Text style={styles.itemNameStyle}>
                                {item.products[1].name}
                              </Text>
                              <Text style={styles.itemPriceStyle}>
                                {'\u20B9'}
                                {item.products[1].price}
                              </Text>
                            </View>
                          ) : null}
                          {item.products[2] ? (
                            <View style={styles.ImageContainer}>
                              <Image
                                source={{uri: item.products[2].image}}
                                style={{
                                  width: wp(90),
                                  height: hp(130),
                                  borderRadius: 5,
                                }}
                              />
                              <Text style={styles.itemNameStyle}>
                                {item.products[2].name}
                              </Text>
                              <Text style={styles.itemPriceStyle}>
                                {'\u20B9'}
                                {item.products[2].price}
                              </Text>
                            </View>
                          ) : null}
                          {item.products[3] ? (
                            <View style={styles.ImageContainer}>
                              <Image
                                source={{uri: item.products[3].image}}
                                style={{
                                  width: wp(90),
                                  height: hp(130),
                                  borderRadius: 5,
                                }}
                              />
                              <Text style={styles.itemNameStyle}>
                                {item.products[3].name}
                              </Text>
                              <Text style={styles.itemPriceStyle}>
                                {'\u20B9'}
                                {item.products[3].price}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                      <View style={styles.ItemCountContainer}>
                        <View style={styles.CartValueContainer}>
                          <View style={styles.CartItemContainer}>
                            <Text style={styles.CartItemTextStyle}>
                              Cart Item
                            </Text>
                            <Text style={styles.CartValueTextStyle}>
                              {item.cartitem}
                            </Text>
                          </View>
                          <View style={styles.CartItemContainer}>
                            <Text style={styles.CartItemTextStyle}>
                              Cart Value
                            </Text>
                            <Text style={styles.CartValueTextStyle}>
                              {item.cartvalue}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.PlacedHolderButtonContainer}>
                          <TouchableOpacity
                            onPress={() => {
                              this.AskForStautsCall(item.orderid, item.id);
                            }}>
                            <View style={styles.PlacedButtonStyle}>
                              <Text style={styles.PlaceHolderTextStyle}>
                                {this.state.acceptText}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.hairline} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            }}
            ListEmptyComponent={this.ListEmpty}
          />
          {this.state.ButtomTab === true ? (
            <View style={styles.BottomContainer}>
              <View style={styles.BottomQuanitityContainer}>
                <Text style={styles.OderTextStyle}>Total Order Quanitity</Text>
                <Text style={styles.OderTextNumberStyle}>
                  {this.state.quantity}
                </Text>
              </View>
              <View style={styles.BottomValueContainer}>
                <Text style={styles.OderValueTextStyle}>Total Order Value</Text>
                <Text style={styles.OderValueTextNumberStyle}>
                  {'\u20B9'}
                  {this.state.total_price}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F6F9FE',
  },
  Profile2Container: {
    color: '#fff',
    flexDirection: 'row',
  },
  ProfileContainer: {
    height: resp(414),
    color: 'red',
    flexDirection: 'row',
  },

  PersonNameStyle: {
    marginTop: resp(10),
    color: '#000',
    fontWeight: 'bold',
  },

  ProfileDescription: {
    marginRight: resp(-2),
    width: resp(260),
    height: resp(50),
    color: '#7F7F7F',
    fontSize: resp(12),
  },

  Profile2ImageContainer: {
    margin: resp(10),
    flexDirection: 'column',
    flex: 0.2,
    width: resp(70),
    height: resp(70),
  },

  ProfileImageContainer: {
    flexDirection: 'column',
    width: wp(60),
    height: hp(60),
  },

  spinnerTextStyle: {
    color: '#F01738',
  },

  box: {
    marginTop: resp(5),
    width: width,
    height: hp(75),
    backgroundColor: 'white',
    flexDirection: 'row',

    elevation: 0,
  },

  ItemCountContainer: {
    marginLeft: wp(20),

    width: wp(415),
    height: hp(80),
    flexDirection: 'row',
    elevation: 0,
  },

  CartItemContainer: {
    flex: 0.5,
    height: hp(22),
    width: wp(130),
    margin: resp(5),
    flexDirection: 'row',
  },

  PlacedButtonStyle: {
    marginLeft: resp(40),
    height: 40,
    width: wp(130),
    marginTop: resp(20),
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

  PlaceHolderTextStyle2: {
    marginTop: resp(20),
    alignSelf: 'center',
    height: resp(18),
    fontWeight: 'bold',
    fontSize: 15,
    color: '#2B2B2B',
  },

  CartItemTextStyle: {
    width: resp(80),
    height: resp(18),
    fontSize: 15,
    color: '#2B2B2B',
  },

  CartValueTextStyle: {
    marginLeft: resp(20),
    width: resp(50),
    height: resp(18),
    fontWeight: 'bold',
    fontSize: 15,
    color: '#2B2B2B',
  },

  CartValueContainer: {
    margin: resp(5),
    width: resp(150),
    height: resp(65),
    flex: 0.5,
    flexDirection: 'column',

    elevation: 0,
  },

  PlacedHolderButtonContainer: {
    marginBottom: resp(20),
    margin: resp(5),
    width: wp(150),
    height: hp(70),
    flex: 0.7,
    flexDirection: 'column',

    elevation: 0,
  },

  itemBox: {
    height: resp(410),
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

  Profile2ImageViewStyle: {
    margin: resp(10),
    width: wp(70),
    height: hp(70),
    borderRadius: resp(10),
  },
  ProfileImageViewStyle: {
    marginLeft: resp(5),
    marginTop: wp(15),
    width: wp(50),
    height: hp(50),
    // justifyContent:'center',
    // alignItems:'center',
    borderRadius: resp(8),
  },
  MenuIconStyle: {
    marginTop: resp(4),
    width: wp(3.44),
    height: hp(15.33),
  },
  horizontalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(2),
  },
  ColumView: {
    flexDirection: 'column',
  },

  RecentViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: resp(2),
    height: hp(35),
    backgroundColor: '#F1F0F2',
    width: '100%',
  },
  RecentTextStyle: {
    fontSize: resp(14),
    marginTop: resp(30),
    marginLeft: wp(10),
    height: hp(50),
    color: '#8E8E8E',
  },
  margintop: {
    marginTop: '10',
  },
  ImageViewStyle: {
    margin: resp(8),
    width: wp(55),
    height: hp(55),
    borderWidth: 2,
    borderColor: '#F01738',
  },
  hairline: {
    backgroundColor: '#C8C7CC80',
    height: 2,
    width: '100%',
  },
  headerBox: {
    width: '100%',
    flex: 0.1,
    color: 'black',
  },
  MainContentBox: {
    flex: 1,
  },
  rowGray: {
    color: 'black',
    width: '100%',
    height: 50,
  },
  TabBox: {
    flex: 0.1,
    color: '#000',
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
    marginTop: 0,
    marginLeft: 10,
    textAlign: 'center',
  },
  ImageContainer: {
    flexDirection: 'column',
    width: wp(95),
    marginTop: wp(10),
    height: hp(160),
    marginLeft: resp(2),
    borderRadius: resp(5),
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
    bottom: 20,
  },

  StatusAddLargeStyle: {
    marginTop: resp(-20),
    marginLeft: resp(60),
    width: wp(30),
    height: hp(30),

    position: 'absolute', //Here is the trick
    bottom: 0,
  },
  Profile2InfoContainer: {
    color: '#fff',
    margin: resp(10),
    marginTop: resp(20),
    flexDirection: 'column',
    flex: 0.6,
    width: wp(70),
    height: hp(70),
  },
  ProfileInfoContainer: {
    // margin: resp(15),
    marginTop: wp(15),
    flexDirection: 'column',
    width: wp(70),
    height: hp(70),
  },

  RiyaMenuContainer: {
    margin: resp(15),
    marginTop: resp(20),
    flexDirection: 'row',
    flex: 0.2,
    width: resp(80),
    height: resp(70),
  },
  ListMenuContainer: {
    // marginTop: hp(20),
    // marginLeft:wp(20),
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    height: resp(40),
  },
  openButtonStyle: {
    color: '#06BE7E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: resp(10),
  },
  viewButtonStyle: {
    color: '#000',
    // marginRight: -20,
    fontSize: resp(14),
    flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
    marginBottom: 4,
    marginLeft: wp(2),
    marginRight: wp(5),
  },

  openButtonContainer: {
    width: resp(60),
    height: resp(24),
    borderRadius: resp(20),
    backgroundColor: '#e6f7f2',
  },
  messageButtonContainer: {
    margin: resp(5),
    marginTop: resp(5),
    width: resp(18),
    height: resp(18),
    borderRadius: resp(50),
    backgroundColor: '#ebced7',
  },
  messageButtonStyle: {
    marginTop: resp(5),
    color: '#F01738',
    width: resp(8),
    height: resp(8),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
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
  ViewButtonContainer: {
    backgroundColor: '#fff',
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
  bottomVideoTextStyle: {
    color: '#887F82',
    fontSize: resp(8),
    marginRight: 10,
    marginTop: 3,
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
  bottomNotificationTextStyle: {
    color: '#887F82',
    fontSize: resp(8),
    marginLeft: 10,
    marginTop: 3,
    textAlign: 'center',
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
    elevation: 20,
    shadowColor: 'grey',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', //Here is the trick
    bottom: 0,
  },
  columnView: {
    flexDirection: 'row',
    width: '100%',
    marginTop: hp(5),
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
  itemNameStyle: {
    color: '#887F82',
    fontSize: resp(12),
    marginLeft: resp(15),
  },
  itemPriceStyle: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: resp(17),
    fontSize: resp(12),
    alignItems: 'center',
  },
  BottomContainer: {
    flex: 0.15,
    width: '100%',
    flexDirection: 'row',
    margin: resp(2),
  },
  BottomQuanitityContainer: {
    flex: 0.5,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  BottomValueContainer: {
    flex: 0.5,
    flexDirection: 'column',
    backgroundColor: '#F01738',
  },

  OderTextStyle: {
    color: '#7F7F7F',
    marginTop: resp(10),
    marginLeft: resp(7),
    fontSize: resp(12),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  OderTextNumberStyle: {
    color: '#F01738',
    marginLeft: resp(7),
    fontSize: resp(16),
    fontWeight: 'bold',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  OderValueTextStyle: {
    color: '#FFFFFF',
    marginTop: resp(10),
    marginLeft: resp(7),
    fontSize: resp(12),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  OderValueTextNumberStyle: {
    color: '#FFFFFF',
    marginLeft: resp(7),
    fontSize: resp(20),
    fontWeight: 'bold',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
});
export default CartPlaceScreen;
