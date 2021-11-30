import React, {Component} from 'react';
console.disableYellowBox = true;

import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import resp from 'rn-responsive-font';
import Toast from 'react-native-simple-toast';
import CustomMenuIcon from './CustomMenuIcon';
import Modal from 'react-native-modal';
import MenuIcon from './MenuIcon';
import AsyncStorage from '@react-native-community/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import SeeMore from 'react-native-see-more-inline';
import firebase from 'react-native-firebase';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
let width = Dimensions.get('screen').width;
let height = Dimensions.get('screen').height;
import {BASE_URL} from '../Component/ApiClient';
class CartViewScreen extends Component {
  constructor(props) {
    super(props);
    // this.CartListCall = this.CartListCall.bind(this),
    (this.UserProfileCall = this.UserProfileCall.bind(this)),
      (this.removeProductCall = this.removeProductCall.bind(this));
    this.AddFavourite = this.AddFavourite.bind(this);

    this.state = {
      isModalVisible: false,
      CartListProduct: '',
      userNo: '',
      block_id: '',
      ProfileData: '',
      profileName: '',
      avatar: '',
      products_id: '',
      productID: '',
      sellerID: '',
      Seller_ID: '',
      userAccessToken: '',
      spinner: '',
      favourite: '',
      removeSellerID: '',
      fcmToken: '',
      nameOfuser: '',
      pickedImage: require('../images/default_user.png'),
      about: '',
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

  async componentDidMount() {
    this.showLoading();
    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        this.setState({userAccessToken: accessToken});
        this.setState({removeSellerID: this.props.route.params.id});
      }
    });
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      console.log('Edit user id token=' + token);
      if (token) {
        this.setState({fcmToken: token});
      }
    });
    AsyncStorage.getItem('@user_id').then((userId) => {
      if (userId) {
        this.setState({userNo: userId});
        console.log(' id from login  user id ====' + userId);
        this.CartListCall();
        this.UserProfileCall();
      } else {
        console.log('else is executed');
        this.hideLoading();
      }
    });
  }

  AddFavourite() {
    this.showLoading();
    let id = this.state.userNo;
    let block_id = this.state.removeSellerID;
    let formData = new FormData();

    formData.append('user_id', id);
    formData.append('block_id', block_id);
    formData.append('type', 1);
    console.log('form data==' + JSON.stringify(formData));

    // var CartList = this.state.baseUrl + 'api-product/cart-list'
    var fav = `${BASE_URL}api-user/block-fav-user`;
    console.log('Add product Url:' + fav);
    fetch(fav, {
      method: 'Post',
      headers: new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '1111',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        // Authorization: 'Bearer' + this.state.access_token,
        Authorization: JSON.parse(this.state.userAccessToken),
      }),
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.hideLoading();
        if (responseData.code == '200') {
          //  this.props.navigation.navigate('StoryViewScreen')
          // Toast.show(responseData.message);
          //   this.CartListCall();
          this.UserProfileCall();
        } else {
          // alert(responseData.data);
          // alert(responseData.data.password)
          this.setState({NoData: true});
        }
        // console.log('response object:', responseData)
        // console.log('User user ID==', JSON.stringify(responseData))
      })
      .catch((error) => {
        this.hideLoading();
        console.error(error);
      })
      .done();
  }
  CartListCall() {
    let formData = new FormData();
    formData.append('user_id', this.state.userNo);
    formData.append('type', 0);
    formData.append('order_id', this.props.route.params.order_id);
    console.log('form data==' + JSON.stringify(formData));
    // var CartList = this.state.baseUrl + 'api-product/cart-list'
    var CartList = 'https://www.cartpedal.com/api-product/cart-list';
    console.log('Add product Url:' + CartList);
    console.log('token', this.state.userAccessToken);
    fetch(CartList, {
      method: 'Post',
      headers: new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '1111',
        device_token: this.state.fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
        // Authorization: 'Bearer xriPJWJGsQT-dUgP4qH11EMM357_kEaan7zJ4Vty'
      }),
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        // this.hideLoading();
        if (responseData.code == '200') {
          this.setState({CartListProduct: responseData.data[0].products});
        } else {
          this.setState({NoData: true});
        }
      })
      .catch((error) => {
        // this.hideLoading();
        console.error(error);
      })
      .done();
  }

  removeProductCall() {
    this.setState({isModalVisible: false});
    let formData = new FormData();

    formData.append('user_id', this.state.userNo);
    formData.append('product_id', this.state.productID);
    formData.append('seller_id', this.state.removeSellerID);

    console.log('form data==' + JSON.stringify(formData));

    // var CartList = this.state.baseUrl + 'api-product/cart-list'
    var RemoveCartListURL = `${BASE_URL}api-product/remove-cart-item`;
    console.log('Add product Url:' + RemoveCartListURL);
    fetch(RemoveCartListURL, {
      method: 'Post',
      headers: new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '1111',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        // Authorization: 'Bearer' + this.state.access_token,
        Authorization: JSON.parse(this.state.userAccessToken),
      }),
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.hideLoading();
        if (responseData.code == '200') {
          //  this.props.navigation.navigate('StoryViewScreen')
          // Toast.show(responseData.message);
          // this.setState({CartListProduct:responseData.data})
          let item = this.state.CartListProduct;
          let filterData = item.filter(
            (items) => items.id !== this.state.productID,
          );
          console.log('filterData', filterData);
          this.setState({CartListProduct: filterData});
          // this.props.navigation.navigate('CartScreen')

          // this.SaveProductListData(responseData)
        } else {
          // alert(responseData.data);
          // alert(responseData.data.password)
        }

        console.log('response objectRemoveProduct:', responseData);
        console.log('User user ID==', JSON.stringify(responseData));
        // console.log('access_token ', this.state.access_token)
        //   console.log('User Phone Number==' + formData.phone_number)
      })
      .catch((error) => {
        this.hideLoading();
        console.error(error);
      })

      .done();
  }
  UserProfileCall() {
    let formData = new FormData();

    formData.append('user_id', +this.state.userNo);
    console.log('user id in from Data', this.state.userNo);
    console.log('props id in params', this.props.route.params.id);

    formData.append('profile_id', this.props.route.params.id);
    console.log('form data==' + formData);

    var userProfile = this.state.baseUrl + 'api-user/user-profile';
    console.log('UserProfile Url:' + userProfile);
    fetch(userProfile, {
      method: 'Post',
      headers: {
        'Content-Type': 'multipart/form-data',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.hideLoading();
        if (responseData.code == '200') {
          // Toast.show(responseData.message);

          //   this.setState({CartListProduct:responseData.data});
          console.log('profileData:==', this.state.ProfileData.username);
          this.setState({nameOfuser: responseData.data[0].name});
          console.log('name of user in cart view', responseData.data[0].name);
          this.setState({about: responseData.data[0].about});
          console.log('profileData:==', this.state.about);
          console.log('value', responseData.data[0].id);
          this.setState({block_id: responseData.data[0].id});
          console.log('fevtert========', responseData.data[0].favourite);
          this.setState({favourite: responseData.data[0].favourite});
          if (responseData.data[0].avatar == null) {
            this.setState({avatar: ''});
          } else {
            this.setState({avatar: responseData.data[0].avatar});
          }
        } else {
          // alert(responseData.data);
          console.log(responseData.message);
        }
        //  console.log('response profile data:', JSON.stringify(responseData));
      })
      .catch((error) => {
        this.hideLoading();
        console.error(error);
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
  link = async (id, name, orderID,imagelink) => {
    const link = new firebase.links.DynamicLink(
      `https://cartpedal.page.link?id=in.cartpedal&page=${name}&profileId=${id}&OrderId=${orderID}`,
      'https://cartpedal.page.link?',
    ).android
    .setPackageName('in.cartpedal')
    .ios.setBundleId('com.ios.cartpadle')
    .ios.setAppStoreId('1539321365');

    firebase
      .links()
      .createShortDynamicLink(link)
      .then((url) => {
        this.base64ImageConvetor(url,imagelink);
      });
  };
  forwardlink = async (userid, name, orderID,Imagelink) => {
    const link = new firebase.links.DynamicLink(
      `https://cartpedal.page.link?id=in.cartpedal&page=${name}&profileId=${id}&OrderId=${orderID}`,
      'https://cartpedal.page.link?',
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
              msgids: `http://${url}?&li=${Imagelink}`,
            });
          }
        });
      });
  };
  PlaceOderCall() {
    let formData = new FormData();

    formData.append('user_id', this.state.userNo);
    formData.append('seller_id', {0: '14'});
    console.log('form data==' + JSON.stringify(formData));

    var PalceOderUrl = this.state.baseUrl + 'api-product/place-order';
    // var PalceOderUrl = "https://www.cartpedal.com/frontend/web/api-product/place-order"
    console.log('placeOder:' + PalceOderUrl);
    fetch(PalceOderUrl, {
      method: 'Post',
      headers: new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '11111',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        // Authorization: 'Bearer' + this.state.access_token,
        Authorization: JSON.parse(this.state.userAccessToken),
      }),
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.hideLoading();
        if (responseData.code == '200 ') {
          //  this.props.navigation.navigate('StoryViewScreen')
          // Toast.show(responseData.message);
          // this.setState({CartListProduct:responseData.data})
          // this.SaveProductListData(responseData)
        } else if (responseData.done == '500') {
          //  Toast.show(responseData.message)
        } else {
          // alert(responseData.data);
          // alert(responseData.data.password)
        }

        console.log('response object:', responseData);
        console.log('User user ID==', JSON.stringify(responseData));
        // console.log('access_token ', this.state.access_token)
        //   console.log('User Phone Number==' + formData.phone_number)
      })
      .catch((error) => {
        this.hideLoading();
        console.error(error);
      })

      .done();
  }
  OpenDeleteModalBox(productId) {
    this.setState({productID: productId});
    this.setState({isModalVisible: !this.state.isModalVisible});
  }
  closeModal = () => {
    this.setState({isModalVisible: false});
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Spinner
          visible={this.state.spinner}
          color="#F01738"
          //   textContent={'Loading...'}
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
          <TouchableOpacity
            style={styles.SearchContainer}
            onPress={() => {
              // this.props.navigation.navigate('SearchBarScreen')
            }}>
            {/* <Image
                            source={require('../images/search.png')}
                            style={styles.SearchIconStyle}
                        /> */}
          </TouchableOpacity>
        </View>

        <View style={styles.MainContentBox}>
          <ScrollView>
            <View style={styles.hairline} />
            <View style={styles.Profile2Container}>
              <View style={styles.Profile2ImageContainer}>
                <TouchableOpacity
                  onPress={() => {
                    console.log(
                      'cart list product',
                      this.state.CartListProduct,
                    );
                  }}>
                  <Image
                    source={
                      this.state.avatar == ''
                        ? this.state.pickedImage
                        : {uri: this.state.avatar}
                    }
                    style={styles.Profile2ImageViewStyle}
                  />
                  <Image
                    source={require('../images/status_add_largeicon.png')}
                    style={styles.StatusAddLargeStyle}></Image>
                </TouchableOpacity>
              </View>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonNameStyle}>
                  {this.state.nameOfuser}
                </Text>
                <View style={{width: width * 0.7}}>
                  {this.state.about ? (
                    <Text style={{fontSize: resp(13), color: 'gray'}}>
                      {this.state.about}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.ListMenuContainer}>
                <TouchableOpacity
                  style={styles.messageButtonContainer}
                  onPress={() => {
                    console.log('id of user', this.state.block_id);
                    this.props.navigation.navigate('ChatDetailScreen', {
                      userid: this.state.block_id,
                      username: this.state.nameOfuser,
                      useravatar: this.state.avatar,
                      groupexit: false,
                      groupId: 0,
                    });
                  }}>
                  {/* <View > */}
                  <Image
                    source={require('../images/message_icon.png')}
                    style={styles.messageButtonStyle}></Image>
                  {/* </View> */}
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
                        width: this.state.favourite == 1 ? resp(9) : resp(18),
                        height: this.state.favourite == 1 ? resp(7) : resp(18),
                        marginTop:
                          this.state.favourite == 1 ? resp(3) : resp(0),
                      },
                    ]}></Image>
                </TouchableOpacity>

                <MenuIcon
                  //Menu Text
                  menutext="Menu"
                  //Menu View Style
                  menustyle={{
                    marginRight: 5,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}
                  //Menu Text Style
                  textStyle={{
                    color: 'white',
                  }}
                  //Click functions for the menu items
                  option1Click={() => {
                    Toast.show('CLicked Block', Toast.LONG);
                  }}
                  option2Click={() => {
                    let name = 'CartViewScreen';
                    let image;
                    this.state.avatar == ''
                        ? image=this.state.defaultProfile
                        : image= this.state.avatar
                    this.link(
                      this.props.route.params.id,
                      name,
                      this.props.route.params.order_id,
                      image
                    );
                  }}
                  option3Click={() => {
                    let name = 'CartViewScreen';
                    let image;
                    this.state.avatar == ''
                        ? image=this.state.defaultProfile
                        : image= this.state.avatar
                    this.forwardlink(
                      this.props.route.params.id,
                      name,
                      this.props.route.params.order_id,
                      image
                    );
                    // Toast.show('CLicked Forward Link', Toast.LONG)
                  }}
                />
              </View>
            </View>
            <View style={styles.horizontalLine}>
              <View style={styles.hairline} />
            </View>

            <FlatList
              style={{flex: 1}}
              data={this.state.CartListProduct}
              //  renderItem={({ item }) => <Item item={item} />}
              keyExtractor={(item, index) => index}
              numColumns={2}
              renderItem={({item, index}) => {
                console.log('item of cart view screen', JSON.stringify(item));
                console.log('item of index', index);
                return (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => {
                      this.props.navigation.navigate('CartDetailsScreen', {
                        whole_data: item,
                        seller_id: this.state.removeSellerID,
                        imageURL: item.image,
                      });
                    }}>
                    <Image source={{uri: item.image}} style={styles.image} />
                    {/* {item.image[5]?( <View style={styles.MultipleOptionContainer}>
                                    <Image
                                        source={require('../images/multipleImageIcon.png')}
                                        style={styles.MultipleIconStyle}></Image>
                                </View>):null} */}
                    <View>
                      <Text style={styles.itemNameStyle}>{item.name}</Text>
                    </View>

                    <View style={styles.box}>
                      <View style={styles.itemPriceContainer}>
                        <Text style={styles.itemPriceStyle}>
                          {'\u20B9'} {item.price}
                        </Text>
                      </View>
                      <View>
                        <Text>QTY. {item.quantity}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.DeleteButtonContainer}
                        onPress={() => {
                          this.OpenDeleteModalBox(item.id);
                        }}>
                        <Image
                          source={require('../images/delete_icon.png')}
                          style={styles.deleteButtonStyle}></Image>
                      </TouchableOpacity>

                      <View style={styles.ListMenuContainer2}>
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
                              let name = 'CartViewScreen';
                              let image;
                              item.image == ''
                                  ? image=this.state.defaultProfile
                                  : image= item.image
                              this.link(
                                this.props.route.params.id,
                                name,
                                this.props.route.params.order_id,
                                image
                              );
                            }}
                            option2Click={() => {
                              let name = 'CartViewScreen';
                              let image;
                              item.image == ''
                                  ? image=this.state.defaultProfile
                                  : image= item.image
                              this.forwardlink(
                                this.props.route.params.id,
                                name,
                                this.props.route.params.order_id,
                                image
                              );
                              // Toast.show('CLicked Forward Link', Toast.LONG)

                              // this.props.navigation.navigate('BluetoothDeviceList')
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
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.isModalVisible}
            onRequestClose={() => this.closeModal()}>
            <View style={styles.centeredView}>
              <View style={styles.deletemodalView}>
                <TouchableOpacity
                  style={{alignSelf: 'flex-end'}}
                  onPress={() => {
                    this.closeModal();
                  }}>
                  <Image
                    source={require('../images/modal_close.png')}
                    style={styles.CloseButtonStyle}
                  />
                </TouchableOpacity>

                <View style={styles.DeleteContainer}>
                  {/* <Image
                      source={require('../images/modal_delete.png')}
                      style={styles.DeleteButtonStyle}
                    /> */}
                  <Text style={styles.DeleteStutsStyle}>Remove Product</Text>
                </View>
                <Text style={styles.DeleteStutsDiscraptionStyle}>
                  Are you sure you want to remove this Product?
                </Text>

                <View style={styles.DeleteButton2Container}>
                  <View style={styles.EmptyButtonCOntainer}></View>
                  <TouchableOpacity
                    style={styles.YesButtonContainer}
                    onPress={() => this.removeProductCall()}>
                    <Text style={styles.YesTextStyle}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.NoButtonContainer}
                    onPress={() => this.setState({isModalVisible: false})}>
                    <Text style={styles.NoTextStyle}>NO</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
  headerView: {
    flex: 0.1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 20,
  },
  RiyaMenuContainer: {
    margin: resp(15),
    marginTop: resp(20),
    flexDirection: 'row',
    flex: 0.3,
    width: resp(80),
    height: resp(70),
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
  deletemodalView: {
    margin: 10,
    width: 300,
    height: 220,
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
  DeleteContainer: {
    marginTop: resp(10),
    margin: resp(20),
    flexDirection: 'row',
  },
  spinnerTextStyle: {
    color: '#F01738',
  },
  Profile2ImageContainer: {
    margin: resp(10),
    flexDirection: 'column',
    flex: 0.2,
    width: resp(110),
    height: resp(110),
  },
  ButtonContainer: {
    height: resp(50),
    marginTop: resp(20),
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  NoButtonContainer: {
    flex: 0.4,
    marginRight: resp(20),
    width: resp(95),
    height: resp(40),
    backgroundColor: '#3C404333',
    borderRadius: resp(40),
  },
  NoTextStyle: {
    marginTop: resp(10),
    alignSelf: 'center',
    fontSize: resp(15),
    color: '#7F7F7F',
  },
  modal: {
    backgroundColor: 'blue',
    margin: resp(240), // This is the important style you need to set

    alignSelf: 'center',
    width: resp(300),
    height: resp(220),
    borderRadius: resp(30),
  },
  DeleteStutsDiscraptionStyle: {
    marginTop: resp(10),
    textAlign: 'center',
    color: '#7F7F7F',
    width: resp(207),
    fontSize: resp(14),
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
  YesTextStyle: {
    marginTop: resp(10),
    alignSelf: 'center',
    fontSize: resp(15),
    color: '#FFFFFF',
  },
  YesButtonContainer: {
    flex: 0.4,
    marginHorizontal: resp(10),
    marginLeft: resp(-10),
    width: resp(95),
    height: resp(40),
    backgroundColor: '#06BE7E',
    borderRadius: resp(40),
  },
  CloseButtonStyle: {
    alignSelf: 'flex-end',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  ProfileDescription: {
    marginRight: resp(-2),
    width: resp(260),
    height: resp(50),
    color: '#7F7F7F',
    fontSize: resp(12),
  },
  Profile2ImageViewStyle: {
    marginTop: resp(10),
    width: resp(90),
    height: resp(90),
    borderRadius: resp(10),
  },
  DeleteStutsStyle: {
    fontWeight: 'bold',
    alignSelf: 'center',
    alignContent: 'center',
    alignItems: 'center',
    fontSize: resp(20),
    marginLeft: resp(35),
    color: '#2B2B2B',
  },
  TitleStyle: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: resp(20),
    textAlign: 'center',
  },
  ModalDeleteButtonStyle: {
    alignSelf: 'flex-start',
  },
  SearchContainer: {
    flex: 0.2,
    backgroundColor: '#fff',
  },
  EmptyButtonCOntainer: {
    flex: 0.2,
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
  Profile2InfoContainer: {
    color: '#fff',

    marginTop: resp(20),
    marginLeft: resp(50),
    flexDirection: 'column',
    flex: 0.9,
    width: resp(80),

    height: resp(70),
  },
  SearchIconStyle: {
    margin: 5,
    marginRight: 20,
    height: 25,
    width: 25,
    alignSelf: 'flex-end',
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
    marginTop: 5,
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

  RiyaImageContainer: {
    marginBottom: resp(30),
    margin: resp(10),
    flexDirection: 'column',
    flex: 0.2,
    width: resp(80),
    height: resp(80),
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
    marginLeft: resp(70),
    width: resp(30),
    height: resp(30),

    position: 'absolute', //Here is the trick
    bottom: -10,
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
    marginTop: resp(20),
    marginRight: resp(-15),
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: resp(20),
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
    flexDirection: 'column',
    marginTop: resp(30),
    width: resp(333),
    height: resp(66),
  },
  PersonNameStyle: {
    marginTop: resp(10),
    height: resp(30),
    color: '#000',
    fontWeight: 'bold',
    fontSize: resp(20),
  },
  PersonDescriptionStyle: {
    marginTop: resp(-2),
    marginLeft: resp(20),
    fontSize: resp(12),
    width: resp(334),
    height: resp(44),
    color: '#7F7F7F',
  },
  Profile2Container: {
    backgroundColor: 'white',
    flexDirection: 'row',
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
    marginLeft: resp(5),
    width: resp(13.85),
    height: resp(13.85),
    position: 'absolute', //Here is the trick
    bottom: 0,
    bottom: 60,
    left: 20,
    backgroundColor: '#fff',
  },
  MultipleIconStyle: {
    marginLeft: 0,
    width: resp(13.85),
    height: resp(13.85),
    position: 'absolute', //Here is the trick
    right: 0,
  },
  itemNameStyle: {
    color: '#887F82',
    width: '90%',
    backgroundColor: 'white',
    marginLeft: resp(15),
    fontSize: resp(14),
  },
  itemPriceStyle: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: resp(16),
    fontSize: resp(13),
  },
  itemPriceContainer: {
    flex: 0.7,
    flexDirection: 'row',
  },
  box: {
    width: resp(200),
    height: resp(25),

    backgroundColor: 'white',
    flexDirection: 'row',
  },
  priceContainer: {
    flex: 0.7,
    marginLeft: resp(-5),
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  ListMenuContainer: {
    marginTop: resp(30),
    marginLeft: resp(10),
    flexDirection: 'row',

    flex: 0.4,
    width: resp(0),
    height: resp(45),
  },
  ListMenuContainer2: {
    flexDirection: 'row',
    flex: 0.1,
    backgroundColor: 'white',
    width: resp(0),
  },
  messageButtonContainer: {
    margin: resp(5),
    marginTop: resp(5),
    width: resp(15),
    height: resp(15),
    borderRadius: resp(50),
    backgroundColor: '#ebced7',
  },
  DeleteButtonContainer: {
    flex: 0.2,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: resp(2),
    width: resp(20),
    height: resp(20),
    borderRadius: resp(50),
    backgroundColor: 'white',
  },
  DeleteButton2Container: {
    height: resp(50),
    marginTop: resp(20),

    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
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
  deleteButtonStyle: {
    marginLeft: resp(1),

    color: '#F01738',
    width: resp(20),
    height: resp(20),
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
export default CartViewScreen;
