/* eslint-disable radix */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-alert */
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
import MenuIcon from './MenuIcon';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage';
import SeeMore from 'react-native-see-more-inline';
import firebase from 'react-native-firebase';
import {BASE_URL} from '../Component/ApiClient';
import {hp, wp} from '../Component/hightWidthRatio';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob'
class CartPlaceScreen extends Component {
  constructor(props) {
    super(props);
    (this.CartListCall = this.CartListCall.bind(this)),
      (this.PlaceOderCall = this.PlaceOderCall.bind(this)),
      (this.AddFavourite = this.AddFavourite.bind(this));
    this.state = {
      NoData: '',
      spinner: false,
      ButtomTab: false,
      block_id: '',
      quantity: '0',
      total_price: '0',
      userAccessToken: '',
      userNo: '',
      itemOfProduct: '',
      currentQuantity: '',
      totalPrice: '',
      favourite: '',
      totalDataLength: '',
      CartListProduct:[],
      fcmToken: '',
      pickedImage: require('../images/default_user.png'),
      avatar: '',
      redIcon: require('../images/Heart_icon.png'),
      whiteIcon: require('../images/dislike.png'),
      baseUrl: `${BASE_URL}`,
      defaultProfile:'https://miro.medium.com/max/790/1*reXbWdk_3cew69RuAUbVzg.png'
    };
  }

  showLoading() {
    this.setState({spinner: true});
  }

  hideLoading() {
    this.setState({spinner: false});
  }

  GotoNextScreen(item) {
    this.props.navigation.navigate('CartViewScreen');
  }

  PlaceODerCallMethode() {
    this.PlaceOderCall();
  }

  actionOnRow(item) {}

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

  link = async (id, name, orderID,ImageLink) => {
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
        console.log('the url', url);
        this.base64ImageConvetor(url,ImageLink);
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

  async componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      this.CartListCall();
    });
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
        this.CartListCall();
      } else {
        this.hideLoading();
      }
    });
  }

  BottomTab = () => {
    return (
      <View style={styles.container}>
        <Text>{this.state.ButtomTab == false ? '' : null}</Text>
      </View>
    );
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
    let userno, fcmtoken, accesstokenid;
    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        accesstokenid = accessToken;
        AsyncStorage.getItem('@fcmtoken').then((token) => {
          if (token) {
            fcmtoken = token;
            AsyncStorage.getItem('@user_id').then((userId) => {
              if (userId) {
                userno = userId;
                let formData = new FormData();
                formData.append('user_id', userno);
                formData.append('type', 0);
                var CartList = `${BASE_URL}api-product/cart-list`;
                fetch(CartList, {
                  method: 'Post',
                  headers: new Headers({
                    'Content-Type': 'multipart/form-data',
                    device_id: '1111',
                    device_token: fcmtoken,
                    device_type: Platform.OS,
                    Authorization: JSON.parse(accesstokenid),
                  }),
                  body: formData,
                })
                  .then((response) => response.json())
                  .then((responseData) => {
                    if (responseData.code == '200') {
                      if (
                        responseData.data !== undefined &&
                        responseData.data.length > 0
                      ) {
                        this.setState({ButtomTab: true});
                        this.setState({CartListProduct: responseData.data});
                        this.setState({block_id: responseData.data[0].id});
                        this.setState({
                          itemOfProduct: responseData.data[0].products[0].id,
                        });
                        this.setState({
                          currentQuantity:
                            responseData.data[0].products[0].quantity,
                        });
                        this.setState({
                          totalPrice: responseData.data[0].products[0].price,
                        });
                        this.setState({
                          favourite: responseData.data[0].favourite,
                        });
                        this.SaveUserName(responseData);
                        if (responseData.data[0].avatar == null) {
                          this.setState({avatar: ''});
                          this.hideLoading();
                        } else {
                          this.hideLoading();
                        }
                      } else {
                        this.setState({NoData: true});
                        this.setState({CartListProduct: ''});
                        this.hideLoading();
                      }
                      this.setState({
                        totalDataLength: responseData.data.length,
                      });
                      this.addQuantity(responseData.data);
                    } else {
                      this.hideLoading();
                      this.setState({NoData: true});
                    }
                  })
                  .catch((error) => {
                    this.hideLoading();
                    console.error(error);
                  })
                  .done();
              }
            });
          }
        });
      }
    });
  }

  async SaveUserName(responseData) {
    await AsyncStorage.setItem(
      '@user_profileName',
      JSON.stringify(responseData.data[0].username),
    );
  }

  singleProductPlaceOrder = (seller_id) => {
    let formData = new FormData();
    formData.append('user_id', JSON.parse(this.state.userNo));
    formData.append('seller_id', seller_id);
    formData.append('type', 0);
    var PalceOderUrl = this.state.baseUrl + 'api-product/place-order';
    fetch(PalceOderUrl, {
      method: 'Post',
      headers: new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '11111',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      }),
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.hideLoading();
        if (responseData.code == '200 ') {
          let newArr = this.state.CartListProduct.filter(
            (word) => word.id !== seller_id,
          );
          this.setState({CartListProduct: newArr});
          this.addQuantity(newArr);
        } else if (responseData.done == '500') {
        } else {
        }
      })
      .catch((error) => {
        this.hideLoading();
      })

      .done();
  };

  addQuantity = (data) => {
    if (this.state.NoData == false) {
      let cart_quantity = 0;
      let total_price = 0;
      data.map((item) => {
        console.log(item.cartitem);
        cart_quantity = cart_quantity + item.cartitem;
        total_price = total_price + item.cartvalue;
      });
      this.setState({quantity: cart_quantity});
      this.setState({total_price: total_price});
    }
  };

  PlaceOderCall() {
    if (this.state.CartListProduct.length > 0) {
      let itemID = [];
      let productID = [];
      this.state.CartListProduct.forEach((item) => {
        console.log('place order', item);
        item.products.map((itemIDs) => {
          productID.push(itemIDs.id);
        });
        itemID.push(item.id);
      });
      let seller_id = itemID.join(',');
      let products = productID.join(',');
      let formData = new FormData();
      formData.append('user_id', this.state.userNo);
      formData.append('seller_id', parseInt(seller_id));
      formData.append('type', 0);
      formData.append('product_id', parseInt(products));
      formData.append('quantity', this.state.currentQuantity);
      formData.append('price', this.state.totalPrice);
      var PalceOderUrl = this.state.baseUrl + 'api-product/place-order';
      fetch(PalceOderUrl, {
        method: 'Post',
        headers: new Headers({
          'Content-Type': 'multipart/form-data',
          device_id: '11111',
          device_token: this.state.fcmtoken,
          device_type: Platform.OS,
          Authorization: JSON.parse(this.state.userAccessToken),
        }),
        body: formData,
      })
        .then((response) => response.json())
        .then((responseData) => {
          this.hideLoading();
          if (responseData.code == '200 ') {
            this.setState({CartListProduct: ''});
            this.setState({quantity: '0'});
            this.setState({total_price: '0'});
            this.setState({NoData: true});
          } else if (responseData.done == '500') {
          } else {
          }
        })
        .catch((error) => {
          this.hideLoading();
        })
        .done();
    } else {
      alert('No Product Available to place an order');
    }
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
        device_token: this.state.fcmtoken,
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
  }

  _renderItem = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.itemBox}
        onPress={() => {
          console.log('user data from api', item);
          this.props.navigation.navigate('CartViewScreen', {
            id: item.id,
            name: item.name,
            order_id: item.id,
          });
        }}>
        <View>
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
              <Text style={styles.PersonNameStyle}>{item.name}</Text>
              <View style={{width: resp(500)}}>
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
              </View>
            </View>
            <View style={styles.ListMenuContainer}>
              <TouchableOpacity
                style={styles.messageButtonContainer}
                onPress={() => {
                  console.log('id of user', item.id);
                  this.props.navigation.navigate('ChatDetailScreen', {
                    userid: item.id,
                    username: item.name,
                    useravatar: item.avatar,
                    groupexit: false,
                    groupId: '0',
                    msg_type: '0',
                    userphone: item.mobile,
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
                    item.favourite == 1
                      ? this.state.redIcon
                      : this.state.whiteIcon
                  }
                  style={[
                    styles.heartButtonStyle,
                    {
                      width: item.favourite == 1 ? resp(11) : resp(18),
                      height: item.favourite == 1 ? resp(9) : resp(18),
                      marginTop: item.favourite == 1 ? resp(4) : resp(0),
                    },
                  ]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  console.log('user data from api', item);
                  this.props.navigation.navigate('CartViewScreen', {
                    id: item.id,
                    name: item.name,
                    order_id: item.id,
                  });
                }}>
                <View style={styles.ViewButtonContainer}>
                  <Text style={styles.viewButtonStyle}>View All</Text>
                </View>
              </TouchableOpacity>

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
                  let name = 'CartViewScreen';
                  let image;
                  item.products[0].image?
                  image=item.products[0].image
                  :image=this.state.defaultProfile;
                  this.link(item.id, name, item.id,image);
                }}
                option3Click={() => {
                  let name = 'CartViewScreen';
                  let image;
                  item.products[0].image?
                  image=item.products[0].image
                  :image=this.state.defaultProfile;
                  this.forwardlink(item.id, name, item.id,image);
                }}
              />
            </View>
          </View>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.columnView}>
              <View style={styles.ImageContainer}>
                <Image
                  source={{uri: item.products[0].image}}
                  style={{
                    width: 95,
                    height: 133,
                    borderRadius: resp(5),
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
                <View style={styles.ImageContainer1}>
                  <Image
                    source={{uri: item.products[1].image}}
                    style={{
                      width: 95,
                      height: 133,
                      borderRadius: resp(5),
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
                <View style={styles.ImageContainer1}>
                  <Image
                    source={{uri: item.products[2].image}}
                    style={{
                      width: 95,
                      height: 133,
                      borderRadius: resp(5),
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
                <View style={styles.ImageContainer1}>
                  <Image
                    source={{uri: item.products[3].image}}
                    style={{
                      width: 95,
                      height: 133,
                      borderRadius: resp(5),
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
          </ScrollView>
          <View style={styles.ItemCountContainer}>
            <View style={styles.CartValueContainer}>
              <View style={styles.CartItemContainer}>
                <Text style={styles.CartItemTextStyle}>Cart Item</Text>
                <Text style={styles.CartValueTextStyle}>{item.cartitem}</Text>
              </View>
              <View style={styles.CartItemContainer}>
                <Text style={styles.CartItemTextStyle}>Cart Value</Text>
                <Text style={styles.CartValueTextStyle}>{item.cartvalue}</Text>
              </View>
            </View>
            <View style={styles.PlacedHolderButtonContainer}>
              <TouchableOpacity
                style={styles.PlacedButtonStyle}
                onPress={() => {
                  this.singleProductPlaceOrder(
                    item.id,
                    item.products[0].id,
                    item.cartitem,
                    item.products[0].cartprice,
                  );
                }}>
                <Text style={styles.PlaceHolderTextStyle}>Place Order</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.hairline} />
        </View>
      </TouchableOpacity>
    );
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
            data={this.state.CartListProduct}
            keyExtractor={(item) => item.personName}
            renderItem={this._renderItem}
            ListEmptyComponent={this.ListEmpty}
          />
          {this.state.CartListProduct.length>0 ? (
            <View style={styles.BottomContainer}>
              <View style={styles.BottomQuanitityContainer}>
                <Text style={styles.OderTextStyle}>Total Cart Quantity</Text>
                <Text style={styles.OderTextNumberStyle}>
                  {this.state.quantity}
                </Text>
              </View>
              <View style={styles.BottomValueContainer}>
                <Text style={styles.OderValueTextStyle}>Total Cart Value</Text>
                <Text style={styles.OderValueTextNumberStyle}>
                  {'\u20B9'} {this.state.total_price}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.BottomPlaceHolderContainer}
                onPress={() => {
                  this.PlaceODerCallMethode();
                }}>
                <Text style={styles.PlaceHolderTextStyle2}>Place Order</Text>
              </TouchableOpacity>
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
    backgroundColor: '#fff',
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
    width: resp(80),
    height: resp(20),
    color: '#000',
    fontWeight: 'bold',
  },
  ProfileDescription: {
    width: resp(260),
    height: resp(20),
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
    marginTop: hp(10),
    marginRight: wp(10),
    flexDirection: 'column',
    flex: 0.2,
    width: resp(70),
    height: resp(70),
  },
  box: {
    marginTop: resp(5),
    width: resp(415),
    height: resp(75),
    flexDirection: 'row',
    elevation: 0,
  },
  ItemCountContainer: {
    marginTop: resp(2),
    width: wp(415),
    height: hp(75),
    flexDirection: 'row',
    elevation: 0,
  },
  CartItemContainer: {
    flex: 0.8,
    margin: resp(5),
    flexDirection: 'row',
  },
  PlacedButtonStyle: {
    alignSelf: 'flex-end',
    height: resp(40),
    width: resp(130),
    marginTop: resp(25),
    backgroundColor: '#FFCF33',
  },
  spinnerTextStyle: {
    color: '#F01738',
  },
  PlaceHolderTextStyle: {
    marginTop: resp(10),
    alignSelf: 'center',
    lineHeight: 18,
    height: resp(18),
    fontWeight: 'bold',
    fontSize: 15,
    color: '#2B2B2B',
  },
  PlaceHolderTextStyle2: {
    alignSelf: 'center',
    height: resp(18),
    fontWeight: 'bold',
    fontSize: resp(15),
    color: '#2B2B2B',
  },
  CartItemTextStyle: {
    width: resp(80),
    height: resp(18),

    fontSize: resp(15),
    color: '#2B2B2B',
  },
  CartValueTextStyle: {
    marginLeft: resp(20),
    fontWeight: 'bold',
    fontSize: resp(15),
    color: '#2B2B2B',
  },

  CartValueContainer: {
    margin: resp(5),
    marginLeft: resp(15),
    width: resp(150),
    height: resp(70),
    flex: 0.5,
    flexDirection: 'column',
    elevation: 0,
  },
  PlacedHolderButtonContainer: {
    marginBottom: resp(20),
    margin: resp(5),
    width: wp(150),
    height: hp(65),
    flex: 0.4,
    flexDirection: 'column',
    elevation: 0,
  },
  itemBox: {
    flex: 1,
    height: resp(400),
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
    width: resp(70),
    height: resp(70),
    borderRadius: resp(10),
  },
  ProfileImageViewStyle: {
    margin: resp(10),
    width: resp(50),
    height: resp(50),
    borderRadius: resp(8),
  },
  MenuIconStyle: {
    marginTop: resp(4),
    width: resp(3.44),
    height: resp(15.33),
  },
  horizontalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: resp(2),
  },
  ColumView: {
    flexDirection: 'column',
  },

  RecentViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: resp(2),
    height: resp(35),
    backgroundColor: '#F1F0F2',
    width: '100%',
  },
  RecentTextStyle: {
    fontSize: resp(14),
    marginTop: resp(30),
    marginLeft: resp(10),
    height: resp(50),
    color: '#8E8E8E',
  },
  margintop: {
    marginTop: '10',
  },
  ImageViewStyle: {
    margin: resp(8),
    width: resp(55),
    height: resp(55),
    borderWidth: resp(2),
    borderColor: '#F01738',
  },
  hairline: {
    backgroundColor: '#C8C7CC80',
    height: Platform.OS === 'android' ? resp(2) : 0,
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
    height: resp(50),
  },
  TabBox: {
    flex: 0.1,
    color: '#000',
  },
  BackButtonContainer: {
    flex: 0.2,
    marginLeft: resp(10),
    backgroundColor: 'white',
  },
  backButtonStyle: {
    margin: resp(10),
    height: resp(20),
    width: resp(20),
  },
  LogoIconStyle: {
    margin: resp(5),
    height: resp(30),
    width: resp(30),
  },
  SearchIconStyle: {
    margin: resp(5),
    marginRight: resp(20),
    height: resp(25),
    width: resp(25),
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
    elevation: resp(20),
  },

  bottomActiveTextStyle: {
    color: '#FB3954',
    fontSize: resp(10),
    marginTop: 0,
    marginLeft: resp(10),
    textAlign: 'center',
  },
  ImageContainer: {
    flexDirection: 'column',
    width: resp(95),
    marginTop: resp(10),
    height: resp(200),
    marginLeft: resp(5),
    marginRight: resp(5),
    borderRadius: resp(10),
  },
  ImageContainer1: {
    flexDirection: 'column',
    width: resp(95),
    marginTop: resp(10),
    height: resp(200),
    marginRight: resp(5),
    borderRadius: resp(10),
  },
  bottomInactiveTextStyleChart: {
    color: '#887F82',
    fontSize: resp(10),
    marginTop: resp(3),
    marginLeft: resp(8),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  bottomInactiveTextStyle: {
    color: '#887F82',
    fontSize: resp(10),
    marginTop: resp(3),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },

  StyleHomeTab: {
    marginTop: resp(5),
    width: resp(30),
    height: resp(28),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  StatusAddStyle: {
    width: resp(20),
    height: resp(20),
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: resp(20),
  },

  StatusAddLargeStyle: {
    marginTop: resp(-20),
    marginLeft: resp(60),
    width: resp(30),
    height: resp(30),
    position: 'absolute',
    bottom: 0,
  },
  Profile2InfoContainer: {
    color: '#fff',
    margin: resp(10),
    marginTop: resp(20),
    flexDirection: 'column',
    flex: 0.6,
    width: resp(70),

    height: resp(70),
  },
  ProfileInfoContainer: {
    margin: resp(),
    marginTop: resp(10),
    flexDirection: 'column',
    flex: 0.7,
    marginLeft: resp(10),
    width: resp(70),
    height: resp(70),
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
    marginTop: resp(20),
    flexDirection: 'row',
    flex: 0.8,

    width: resp(0),
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
    marginRight: resp(-20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: resp(4),
  },

  openButtonContainer: {
    width: resp(60),
    height: resp(24),
    borderRadius: resp(20),
    backgroundColor: '#e6f7f2',
  },
  messageButtonContainer: {
    margin: resp(5),
    marginTop: resp(1),
    width: resp(18),
    height: resp(18),
    borderRadius: resp(50),
    backgroundColor: '#ebced7',
  },
  messageButtonStyle: {
    marginTop: resp(5),
    color: '#F01738',
    width: resp(9),
    height: resp(9),
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
    width: resp(60),
    height: resp(24),
    backgroundColor: '#fff',
  },

  StyleOpenForPublicTab: {
    marginTop: resp(11),
    marginRight: resp(10),
    width: resp(38),
    height: resp(23),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomVideoTextStyle: {
    color: '#887F82',
    fontSize: resp(8),
    marginRight: resp(10),
    marginTop: resp(3),
    textAlign: 'center',
  },
  styleChartTab: {
    marginTop: resp(9),
    width: resp(30),
    height: resp(30),
    marginLeft: resp(10),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNotificationTextStyle: {
    color: '#887F82',
    fontSize: resp(8),
    marginLeft: resp(10),
    marginTop: resp(3),
    textAlign: 'center',
  },
  StyleChatTab: {
    marginTop: resp(9),
    width: resp(30),
    height: resp(30),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  StyleSettingTab: {
    marginTop: resp(9),
    width: resp(30),
    height: resp(30),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabStyle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: resp(60),

    elevation: resp(20),
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
    justifyContent: 'center',
    alignItems: 'center',
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
    alignSelf: 'flex-start',
  },
  itemPriceStyle: {
    color: '#000',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    fontSize: resp(12),
    alignItems: 'center',
    height: resp(20),
    marginBottom: 8,
  },
  BottomContainer: {
    flex: 0.14,
    width: '100%',
    flexDirection: 'row',
    margin: resp(2),
  },
  BottomQuanitityContainer: {
    flex: 0.33,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  BottomValueContainer: {
    flex: 0.33,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#F01738',
  },
  BottomPlaceHolderContainer: {
    flex: 0.33,
    justifyContent: 'center',
    backgroundColor: '#FFCF33',
  },
  OderTextStyle: {
    color: '#7F7F7F',
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
// export default withNavigation(CartPlaceScreen)
