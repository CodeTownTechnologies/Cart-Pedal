/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import AppConst from '../Component/AppConst';
import AppImageSlider from '../Component/AppImageSlider';
import Colors from '../Component/Colors';
import {lessRoundBlackIcon, addRoundBlackIcon} from '../Component/Images';
import Collapsible from 'react-native-collapsible';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';
import resp from 'rn-responsive-font';
import Modal from 'react-native-modal';
import {BASE_URL} from '../Component/ApiClient';
const screenWidth = Dimensions.get('screen').width;

export default class CartDetailsScreen extends React.Component {
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
        seller_id: '',
        isModalVisible: false,
        fcmToken: '',
        imageList: [{uri: this.props.route.params.imageURL}],
        itemOfProduct: '',
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
      this.setState({itemOfProduct: this.props.route.params.whole_data});
      this.setState({product_id: this.props.route.params.whole_data.id});
      this.setState({name: this.props.route.params.whole_data.name});
      this.setState({seller_id: this.props.route.params.seller_id});
      this.setState({price: this.props.route.params.whole_data.price});
      this.setState({
        currentQuantity: this.props.route.params.whole_data.quantity,
      });
      if (userId) {
        this.setState({userNo: userId});
        let price_items = this.state.price * this.state.currentQuantity;
        let finalPrice = (Math.round(price_items * 100) / 100).toFixed(2);
        this.setState({totalPrice: finalPrice});
      } else {
      }
    });

    AsyncStorage.getItem('@user_name').then((userName) => {
      if (userName) {
        this.setState({userName: JSON.parse(userName)});
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

  onImageClick(item) {
    if (this.doubleClick) {
      let imageArr = [];
      imageArr.push(item);
      this.props.navigation.navigate('ProductDetailImageFullView', {
        images: imageArr,
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
        <Image style={styles.imageView} source={item} />
      </TouchableOpacity>
    );
  }

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
          this.props.navigation.navigate('CartScreen');
        } else {
          console.log(responseData.message);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .done();
  }
  singleProductPlaceOrder = () => {
    let formData = new FormData();
    formData.append('user_id', this.state.userNo);
    formData.append('seller_id', this.state.seller_id);
    formData.append('type', 0);
    var PalceOderUrl = `${BASE_URL}api-product/place-order`;
    fetch(PalceOderUrl, {
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
        if (responseData.code == '200 ') {
          alert('Order is placed successfully');
          this.props.navigation.navigate('CartScreen');
        } else {
        }
      })
      .catch((error) => {
        this.hideLoading();
        console.error(error);
      })
      .done();
  };

  OpenDeleteModalBox() {
    this.setState({isModalVisible: !this.state.isModalVisible});
  }

  closeModal = () => {
    this.setState({isModalVisible: false});
  };

  removeProductCall() {
    this.setState({isModalVisible: false});
    let formData = new FormData();
    formData.append('user_id', this.state.userNo);
    formData.append('product_id', this.state.product_id);
    formData.append('seller_id', this.state.seller_id);
    var RemoveCartListURL = `${BASE_URL}api-product/remove-cart-item`;
    fetch(RemoveCartListURL, {
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
          Toast.show(responseData.message);
          this.props.navigation.navigate('CartScreen');
        } else {
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .done();
  }

  render() {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={'#fff'} />
        <View style={[styles.container, {backgroundColor: '#e3e3e3'}]}>
          <TouchableOpacity
            style={styles.editImageBox}
            onPress={() => this.props.navigation.goBack()}>
            <Image
              style={styles.editImage}
              source={require('../images/back_blck_icon.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.DeleteButtonContainer}
            onPress={() => {
              this.OpenDeleteModalBox();
            }}>
            <Image
              source={require('../images/delete_icon.png')}
              style={styles.deleteButtonStyle}
            />
          </TouchableOpacity>
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
                {this.state.price},
              </Text>
              <Text style={styles.detailTextStyle}>
                Bunch Price {this.state.price} x {this.state.currentQuantity} ={' '}
                {AppConst.rupeeSym}
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
                Quantity{' '}
              </Text>
              <TouchableOpacity onPress={this.lessTheQuantity}>
                <Image style={styles.addLessIcon} source={lessRoundBlackIcon} />
              </TouchableOpacity>
              <Text style={styles.detailTextStyle}>
                {' '}
                {this.state.currentQuantity}
              </Text>
              <TouchableOpacity onPress={this.addTheQuantity}>
                <Image style={styles.addLessIcon} source={addRoundBlackIcon} />
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
              <View style={{height: 50, backgroundColor: '#fff'}}>
                {this.state.itemOfProduct.description ? (
                  <Text style={{color: 'black', marginLeft: 30, marginTop: 2}}>
                    {this.state.itemOfProduct.description}
                  </Text>
                ) : (
                  <Text style={{color: 'black', marginLeft: 30, marginTop: 2}}>
                    {'No Description Available'}
                  </Text>
                )}
              </View>
            </Collapsible>

            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                style={[styles.bottomButtonStyle, {backgroundColor: 'white'}]}
                onPress={() => {
                  this.AddToCart();
                }}>
                <Text style={styles.bottomButtonTextStyle}>
                  {AppConst.btnTitleUpdateToCart}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bottomButtonStyle,
                  {backgroundColor: Colors.themeRed},
                ]}
                onPress={this.singleProductPlaceOrder}>
                <Text style={[styles.bottomButtonTextStyle, {color: 'white'}]}>
                  {AppConst.btnTitleBuyNow}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
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
                <Text style={styles.DeleteStutsStyle}>Remove Product</Text>
              </View>
              <Text style={styles.DeleteStutsDiscraptionStyle}>
                Are you sure you want to remove this Product?
              </Text>
              <View style={styles.DeleteButton2Container}>
                <View style={styles.EmptyButtonCOntainer} />
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
      </SafeAreaView>
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
  editImageBox: {
    top: 10,
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 150,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 10,
    zIndex: 1,
  },
  editImage: {
    width: 20,
    height: 20,
  },
  DeleteButtonContainer: {
    position: 'absolute',
    top: 10,
    zIndex: 2,
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: resp(2),
    width: resp(30),
    height: resp(30),
    borderRadius: resp(50),
    backgroundColor: 'white',
    right: 10,
  },
  deleteButtonStyle: {
    marginLeft: resp(1),

    color: '#F01738',
    width: resp(30),
    height: resp(30),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
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
  CloseButtonStyle: {
    alignSelf: 'flex-end',
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
  DeleteStutsDiscraptionStyle: {
    marginTop: resp(10),
    textAlign: 'center',
    color: '#7F7F7F',
    width: resp(207),
    fontSize: resp(14),
  },
  DeleteButton2Container: {
    height: resp(50),
    marginTop: resp(20),

    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  EmptyButtonCOntainer: {
    flex: 0.2,
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
    position: 'absolute',
    start: 150,
    top: 30,
    fontSize: resp(20),
  },
  LogoIconStyle: {
    margin: 5,
    height: 30,
    width: 30,
  },
  detailTextStyle: {
    fontSize: 15,
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
