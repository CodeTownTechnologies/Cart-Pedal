/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppConst from '../Component/AppConst';
import AppImageSlider from '../Component/AppImageSlider';
import Colors from '../Component/Colors';
import {lessRoundBlackIcon, addRoundBlackIcon} from '../Component/Images';
import Collapsible from 'react-native-collapsible';
import AsyncStorage from '@react-native-community/async-storage';
import resp from 'rn-responsive-font';
import GestureRecognizer from 'react-native-swipe-gestures';
import FastImage from 'react-native-fast-image';
import {BASE_URL} from '../Component/ApiClient';
const screenWidth = Dimensions.get('screen').width;

export default class ProductDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    (this.AddCartProductCall = this.AddCartProductCall.bind(this)),
      (this.state = {
        baseUrl: `${BASE_URL}`,
        showFullImageView: false,
        viewMore: false,
        quantity: '',
        userNo: '',
        name: '',
        userName: '',
        currentQuantity: 1,
        userAccessToken: '',
        price: '',
        totalPrice: '',
        product_id: '',
        userNameProduct: '',
        seller_id: '',
        fcmToken: '',
        imageList: [],
        itemOfProduct: '',
        nextId: '',
        previousId: '',
        myText: '',
        bunch: '',
      });
    this.doubleClick = false;
    this.hidden = false;
  }

  componentDidMount() {
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmToken: token});
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
      } else {
      }
    });

    AsyncStorage.getItem('@user_name').then((userName) => {
      if (userName) {
        this.setState({userName: JSON.parse(userName)});
        this.addViewAPI(this.props.route.params.id);
      }
    });
  }

  lessTheQuantity = () => {
    if (this.state.currentQuantity != 1) {
      this.setState({currentQuantity: this.state.currentQuantity - 1}, () => {
        let price_items = this.state.price * this.state.currentQuantity;
        let finalPrice = (Math.round(price_items * 100) / 100).toFixed(2);
        this.setState({totalPrice: finalPrice});
      });
    }
  };

  addTheQuantity = () => {
    if (this.state.currentQuantity != 0) {
      this.setState({currentQuantity: this.state.currentQuantity + 1}, () => {
        let price_items = this.state.price * this.state.currentQuantity;
        let finalPrice = (Math.round(price_items * 100) / 100).toFixed(2);
        this.setState({totalPrice: finalPrice});
      });
    }
  };

  // onSwipeUp() {
  //   this.props.navigation.goBack();
  // }

  onImageClick(item) {
    if (this.doubleClick) {
      let imageArr = [];
      imageArr.push(item);
      this.props.navigation.navigate('ProductDetailImageFullView', {
        images: item,
      });
    } else {
      this.doubleClick = true;
      setTimeout(() => {
        this.doubleClick = false;
      }, 800);
    }
  }

  renderInnerImageList(item) {
    return (
      <TouchableOpacity
        style={{flex: 1}}
        activeOpacity={1}
        onPress={() => this.onImageClick(item)}>
        <FastImage style={styles.imageView} source={{uri: item}} />
      </TouchableOpacity>
    );
  }
  addViewAPI = (id) => {
    let formData = new FormData();
    formData.append('user_id', this.state.userNo);
    formData.append('product_id', id);
    console.log(formData);
    var AddCartProductUrl = `${BASE_URL}api-product/add-views`;
    fetch(AddCartProductUrl, {
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
        // console.log(JSON.stringify(responseData, null, 2));
        if (responseData.code == '200') {
          let nameId = responseData.data.name;
          this.setState({
            userNameProduct: nameId,
            itemOfProduct: responseData.data,
            name: responseData.data.name,
            seller_id: responseData.data.seller_id,
            price: responseData.data.price,
          });
          let imageURl = [];
          let price_items =
            responseData.data.price * this.state.currentQuantity;
          let finalPrice = (Math.round(price_items * 100) / 100).toFixed(2);
          this.setState({totalPrice: finalPrice});
          if (responseData.data.bunch)
            this.setState({bunch: responseData.data.bunch});
          if (responseData.data.image.length > 0) {
            let item = responseData.data.image;
            item.map((items, index) => {
              imageURl.push(items.file_url);
            });
            this.setState({imageList: imageURl});
          }
          this.setState({
            nextId: responseData.data.next,
            previousId: responseData.data.prev,
          });
        } else {
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .done();
  };

  AddToCart() {
    this.AddCartProductCall();
  }

  AddCartProductCall() {
    let formData = new FormData();

    formData.append('user_id', this.state.userNo);
    formData.append('product_id', this.state.itemOfProduct.id);
    formData.append('quantity', this.state.currentQuantity);
    formData.append('price', this.state.price);
    formData.append('seller_id', this.state.seller_id);
    var AddCartProductUrl = `${BASE_URL}api-product/add-cart`;
    fetch(AddCartProductUrl, {
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
          alert('Product is successfully added into the cart');
        } else {
        }
      })
      .catch((error) => {})
      .done();
  }

  singleProductPlaceOrder = () => {
    let formData = new FormData();
    formData.append('user_id', this.state.userNo);
    formData.append('seller_id', this.state.seller_id);
    formData.append('type', 1);
    formData.append('product_id', this.state.itemOfProduct.id);
    formData.append('quantity', this.state.currentQuantity);
    formData.append('price', this.state.price);
    var PalceOderUrl = `${BASE_URL}api-product/place-order`;
    fetch(PalceOderUrl, {
      method: 'Post',
      headers: new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '11111',
        device_token: this.state.fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      }),
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200 ') {
          alert('Order is placed successfully');
        } else {
        }
      })
      .catch((error) => {
        this.hideLoading();
      })

      .done();
  };

  onSwipe = async (direction) => {
    const {previousId, nextId} = this.state;
    if (direction === 'up' && nextId !== '' && nextId !== 0) {
      this.addViewAPI(nextId);
    }
    if (direction === 'down' && previousId !== '' && previousId !== 0) {
      this.addViewAPI(previousId);
    }
  };

  render() {
    return (
      <GestureRecognizer
        style={{flex: 1}}
        onSwipeDown={(state) => this.onSwipe('down')}
        onSwipeUp={(state) => this.onSwipe('up')}>
        <SafeAreaView style={styles.mainContainer}>
          <StatusBar barStyle="dark-content" backgroundColor={'#fff'} />
          <View style={[styles.container, {backgroundColor: '#e3e3e3'}]}>
            <AppImageSlider
              sliderImages={this.state.imageList}
              rendorImages={(item, index) => this.renderInnerImageList(item)}
            />
          </View>
          {!this.state.showFullImageView ? (
            <View
              style={{
                backgroundColor: 'white',
                borderTopStartRadius: 30,
                borderTopEndRadius: 30,
                marginTop: -50,
              }}>
              <View
                style={{
                  height: 7,
                  width: 50,
                  backgroundColor: '#e3e3e3',
                  alignSelf: 'center',
                  marginTop: 10,
                  marginBottom: 20,
                  borderRadius: 4,
                }}
              />

              <View style={{flexDirection: 'row', marginStart: 30}}>
                <Text style={styles.detailTextStyle}>
                  {AppConst.rupeeSym}
                  {this.state.price} ,
                </Text>
                <Text style={styles.detailTextStyle}>
                  {this.state.bunch} Bunch Price {this.state.price} x{' '}
                  {this.state.currentQuantity} = {AppConst.rupeeSym}
                  {this.state.totalPrice}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginStart: 30,
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                <Text style={styles.detailTextStyle}>{this.state.name}</Text>

                <Text style={[styles.detailTextStyle, {marginStart: 10}]}>
                  Quantity
                </Text>
                <TouchableOpacity onPress={this.lessTheQuantity}>
                  <Image
                    style={styles.addLessIcon}
                    source={lessRoundBlackIcon}
                  />
                </TouchableOpacity>
                <Text style={styles.detailTextStyle}>
                  {this.state.currentQuantity}
                </Text>
                <TouchableOpacity onPress={this.addTheQuantity}>
                  <Image
                    style={styles.addLessIcon}
                    source={addRoundBlackIcon}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    this.setState({viewMore: !this.state.viewMore});
                  }}>
                  <Text
                    style={[
                      styles.detailTextStyle,
                      {color: '#FFDF00', marginStart: 10},
                    ]}>
                    {this.state.viewMore ? 'View less' : 'View more'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Collapsible collapsed={!this.state.viewMore}>
                <View style={{height: 'auto', backgroundColor: '#fff'}}>
                  {this.state.itemOfProduct.detailone ? (
                    <Text
                      style={{color: 'black', marginLeft: 30, marginTop: 5}}>
                      {this.state.itemOfProduct.detailone}
                    </Text>
                  ) : null}
                  {this.state.itemOfProduct.detailtwo ? (
                    <Text
                      style={{color: 'black', marginLeft: 30, marginTop: 5}}>
                      {this.state.itemOfProduct.detailtwo}
                    </Text>
                  ) : null}
                  {this.state.itemOfProduct.description ? (
                    <Text
                      style={{
                        color: 'black',
                        marginLeft: 30,
                        marginTop: 5,
                        marginBottom: 5,
                      }}>
                      {this.state.itemOfProduct.description}
                    </Text>
                  ) : null}
                </View>
              </Collapsible>

              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  style={[styles.bottomButtonStyle, {backgroundColor: 'white'}]}
                  onPress={() => {
                    this.AddToCart();
                  }}>
                  <Text style={styles.bottomButtonTextStyle}>
                    {AppConst.btnTitleAddToCart}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.bottomButtonStyle,
                    {backgroundColor: Colors.themeRed},
                  ]}
                  onPress={this.singleProductPlaceOrder}>
                  <Text
                    style={[styles.bottomButtonTextStyle, {color: 'white'}]}>
                    {AppConst.btnTitleBuyNow}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          <TouchableOpacity
            onPress={() => this.props.navigation.goBack()}
            style={{
              position: 'absolute',
              start: 20,
              top: Platform.OS === 'android' ? 30 : 60,
            }}>
            <Image
              source={require('../images/back_blck_icon.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <View style={{position: 'absolute', top: 30, start: 100}}>
            <Text style={styles.TitleStyle}>{this.state.userNameProduct}</Text>
          </View>
        </SafeAreaView>
      </GestureRecognizer>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  bottomButtonStyle: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    elevation: 20,
  },
  bottomButtonTextStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  SearchContainer: {
    flex: 0.2,
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

    alignItems: 'center',
    justifyContent: 'center',
  },
  TitleStyle: {
    color: '#fff',

    fontSize: resp(20),
  },
  LogoIconStyle: {
    margin: 5,
    height: 30,
    width: 30,
  },
  detailTextStyle: {
    fontSize: 15,
    // fontWeight :'bold',
    textAlign: 'center',
  },
  BackButtonContainer: {
    flex: 0.2,
    marginLeft: 10,
  },
  backButtonStyle: {
    margin: 10,
    height: 20,
    width: 20,
  },
  saveCancelButton: {
    fontSize: 17,
    borderBottomWidth: 1,
  },
  headerView: {
    flex: 0.1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    elevation: 20,
  },
  backIcon: {
    height: 20,
    width: 35,
    resizeMode: 'contain',
    tintColor: Colors.themeRed,
  },
  addLessIcon: {
    height: 20,
    width: 20,
    marginStart: 5,
    marginEnd: 5,
    resizeMode: 'contain',
  },
  imageView: {
    flex: 1,
    borderRadius: 5,
    width: screenWidth,
    height: screenWidth,
  },
  inputTextView: {
    fontSize: 17,
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 1,
    marginTop: 10,
  },
});
