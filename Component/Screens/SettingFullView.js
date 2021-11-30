/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Dimensions,
  Modal,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';
import resp from 'rn-responsive-font';
import Spinner from 'react-native-loading-spinner-overlay';
import ImagePicker from 'react-native-image-crop-picker';
const screenWidth = Dimensions.get('screen').width;
import {BASE_URL} from '../Component/ApiClient';

export default class SettingFullView extends React.Component {
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
        fcmToken: '',
        imageList: [],
        itemOfProduct: '',
        about: '',
        isEditModalVisible: false,
        userId: '',
        isProfileModalVisible: false,
        newImageArr: '',
      });
    this.doubleClick = false;
    this.hidden = false;
  }
  componentDidMount() {
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmToken: token});
        let image = this.state.imageList;
        let name = this.props.route.params.name;
        let about = this.props.route.params.about;
        this.setState({name: name});
        this.setState({about: about});
        let propsImage = this.props.route.params.imageURL;
        if (propsImage !== '') {
          console.log();
          let obj = {
            uri: propsImage,
          };
          image.push(obj);
        } else {
          image.push(require('../images/default_user.png'));
        }
        this.setState({imageList: image});
      }
    });

    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        this.setState({userAccessToken: accessToken});
      }
    });

    AsyncStorage.getItem('@user_id').then((userId) => {
      this.setState({userId: userId});
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

  closeModalbox = () => {
    this.setState({isEditModalVisible: false});
  };

  onImageClick(item) {
    if (this.doubleClick) {
      this.props.navigation.navigate('StoryViewScreen', {images: item});
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

  addViewAPI = () => {
    let formData = new FormData();
    formData.append('user_id', this.state.userNo);
    formData.append('product_id', this.state.itemOfProduct.id);
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
        if (responseData.code == '200') {
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
    formData.append('price', this.state.totalPrice);
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
          Toast.show(responseData.message);
        } else {
        }
      })
      .catch((error) => {})
      .done();
  }

  showLoading() {
    this.setState({spinner: true});
  }

  hideLoading() {
    this.setState({spinner: false});
  }

  CheckTextInput = () => {
    if (this.state.Name === '') {
      alert('Please Enter Name ');
    } else if (this.state.About === '') {
      alert('Please Enter About YourSelf');
    } else {
      this.EditProfileCall();
    }
  };

  EditProfileCall = () => {
    this.showLoading();
    let formData = new FormData();
    formData.append('user_id', this.state.userId);
    formData.append('name', this.state.name);
    formData.append('about', this.state.about);
    var EditProfileUrl = `${BASE_URL}api-user/edit-profile`;
    fetch(EditProfileUrl, {
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
          this.setState({isEditModalVisible: false});
          this.props.navigation.goBack();
          this.hideLoading();
        } else {
          this.hideLoading();
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  };

  singleProductPlaceOrder = () => {
    let formData = new FormData();
    formData.append('user_id', this.state.userNo);
    formData.append('seller_id', this.state.seller_id);
    formData.append('type', 1);
    formData.append('product_id', this.state.itemOfProduct.id);
    formData.append('quantity', this.state.currentQuantity);
    formData.append('price', this.state.totalPrice);
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
          Toast.show('Order is placed successfully');
        } else {
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  };

  closeProfileModal = () => {
    this.setState({isProfileModalVisible: false});
  };

  openImageGallery() {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      includeBase64: true,
      compressImageQuality: 0.4,
    }).then((image) => {
      this.setState({isProfileModalVisible: !this.state.isProfileModalVisible});

      this.onImagePick(image);
      console.log('image pic===', image);
    });
  }

  openCamara() {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
      includeBase64: true,
    }).then((image) => {
      this.setState({isProfileModalVisible: !this.state.isProfileModalVisible});

      this.onImagePick(image);
      console.log('pickedImage===', image);
    });
  }

  customButton = () => {
    let item = this.props.route.params.imageURL;
    if (this.props.route.params.imageURL != '') {
      this.props.navigation.navigate('FullViewProfileScreen', {images: item});
      this.setState({isProfileModalVisible: !this.state.isProfileModalVisible});
    } else {
      this.props.navigation.navigate('FullViewProfileScreen', {images: null});
      this.setState({isProfileModalVisible: !this.state.isProfileModalVisible});
    }
  };

  profileModal() {
    this.setState({isProfileModalVisible: !this.state.isProfileModalVisible});
  }

  onImagePick(response) {
    let imgOjc = {
      path: response.path,
      type: response.mime,
      data: response.data,
      fileName: response.modificationDate,
    };
    this.setState({newImageArr: imgOjc});
    this.uploadProfilePic();
  }

  uploadProfilePic = () => {
    this.showLoading();
    var EditProfileUrl = `${BASE_URL}api-user/upload-image`;
    fetch(EditProfileUrl, {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1111',
        device_token: this.state.fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: JSON.stringify({
        user_id: this.state.userId,
        type: 1,
        upload: this.state.newImageArr,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          Toast.show(responseData.message);
          this.props.navigation.goBack();
          this.hideLoading();
        } else {
          this.hideLoading();
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  };

  render() {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={'#fff'} />
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
          <TouchableOpacity
            style={styles.SearchContainer}
            onPress={() => {
              // this.props.navigation.navigate('SearchBarScreen')
            }}
          />
        </View>
        <View style={[styles.container, {backgroundColor: '#e3e3e3'}]}>
          <ScrollView>
            <View style={styles.profilePic}>
              <TouchableOpacity
                style={styles.profilelogo}
                onPress={() => this.profileModal()}>
                <Image
                  source={
                    this.props.route.params.imageURL
                      ? {uri: this.props.route.params.imageURL}
                      : require('../images/default_user.png')
                  }
                  style={{width: 220, height: 220, borderRadius: 15}}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.Name}>
              <View style={{flexDirection: 'row'}}>
                <View style={{marginLeft: 35, marginTop: 5}}>
                  <Text style={{fontSize: 15, color: '#F01738'}}>
                    Your Name
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.EditbuttonContainer}
                  onPress={() => {
                    this.setState({isEditModalVisible: true});
                  }}>
                  <Image
                    source={require('../images/edit-tool_icon.png')}
                    style={styles.EditButtonStyle}
                  />
                </TouchableOpacity>
              </View>
              <View style={{marginLeft: 35, marginTop: 15}}>
                <Text style={{fontSize: 17, color: '#4F4F4F'}}>
                  {this.state.name}
                </Text>
              </View>
            </View>
            <View style={styles.Description}>
              <View style={{flexDirection: 'row'}}>
                <View style={{marginLeft: 35, marginTop: 5}}>
                  <Text style={{fontSize: 15, color: '#F01738'}}>About</Text>
                </View>
                <TouchableOpacity
                  style={styles.EditbuttonContainer1}
                  onPress={() => {
                    this.setState({isEditModalVisible: true});
                  }}>
                  <Image
                    source={require('../images/edit-tool_icon.png')}
                    style={styles.EditButtonStyle}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  marginLeft: 35,
                  marginTop: 15,
                  marginBottom: 10,
                  marginRight: 5,
                }}>
                <Text style={{fontSize: 17, color: '#4F4F4F'}}>
                  {this.state.about}
                </Text>
              </View>
            </View>
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.isEditModalVisible}
              onRequestClose={() => {
                this.closeModalbox();
                // Alert.alert('Modal has been closed.')
              }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <TouchableOpacity
                    style={{alignSelf: 'flex-end'}}
                    onPress={() => {
                      this.closeModalbox();
                    }}>
                    <Image
                      source={require('../images/modal_close.png')}
                      style={styles.CloseButtonStyle}
                    />
                  </TouchableOpacity>

                  <View style={styles.inputView}>
                    <View style={{flexDirection: 'row', marginLeft: 15}} />

                    <TextInput
                      placeholder="Name"
                      placeholderTextColor="#7F7F7F"
                      underlineColorAndroid="transparent"
                      multiline={true}
                      maxLength={25}
                      value={this.state.name}
                      style={styles.input}
                      onChangeText={(Name) => this.setState({name: Name})}
                    />
                  </View>
                  <View style={styles.inputView}>
                    <View style={{flexDirection: 'row', marginLeft: 15}} />

                    <TextInput
                      placeholder="About"
                      placeholderTextColor="#7F7F7F"
                      underlineColorAndroid="transparent"
                      multiline={true}
                      maxLength={100}
                      value={this.state.about}
                      style={styles.input}
                      onChangeText={(About) => this.setState({about: About})}
                    />
                  </View>
                  <View style={styles.ButtonContainer}>
                    {/* <View style={styles.EmptyButtonCOntainer}></View>  */}
                    <TouchableOpacity
                      style={styles.YesButtonContainer}
                      // isVisible={this.state.isEditModalVisible}
                      onPress={this.CheckTextInput}>
                      <Text style={styles.YesTextStyle}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.NoButtonContainer}
                      //  isVisible={this.state.isEditModalVisible}
                      onPress={() =>
                        this.setState({isEditModalVisible: false})
                      }>
                      <Text style={styles.NoTextStyle}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.isProfileModalVisible}
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
                      this.openImageGallery();
                    }}>
                    <Text style={styles.OptionsProfileModalStyle}>
                      {' '}
                      Gallery
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      this.openCamara();
                    }}>
                    <Text style={styles.Options2ProfileModalStyle}>
                      {' '}
                      Camera
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      this.customButton();
                    }}>
                    <Text style={styles.Options2ProfileModalStyle}>
                      {' '}
                      View Profile
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
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
  TitleProfileModalStyle: {
    alignContent: 'flex-start',
    fontWeight: 'bold',
    color: '#000',

    width: resp(207),
    fontSize: resp(16),
  },
  Description: {
    marginTop: 75,
    backgroundColor: '#fff',
    height: 'auto',
  },
  spinnerTextStyle: {
    color: '#F01738',
  },
  EditbuttonContainer: {
    marginTop: 10,
    width: Dimensions.get('window').width - 140,
    borderRadius: resp(50),
  },
  EditbuttonContainer1: {
    marginTop: 10,
    width: Dimensions.get('window').width - 105,
    borderRadius: resp(50),
  },
  EditButtonStyle: {
    marginTop: resp(0),
    color: '#F01738',
    width: resp(15),
    height: resp(15),
    alignSelf: 'flex-end',
  },
  profilelogo: {
    width: 220,
    height: 220,
    borderRadius: 15,
    marginTop: 25,
    marginBottom: 10,
  },
  container: {
    flex: 1,
  },
  Name: {
    marginTop: 45,
    backgroundColor: '#fff',
    height: 75,
    width: Dimensions.get('window').width,
  },
  profilePic: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonStyle: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    elevation: 20,
  },
  inputView: {
    width: '90%',

    alignSelf: 'center',
    borderColor: '#7F7F7F',
    borderBottomWidth: 1,
  },
  input: {
    color: 'black',

    padding: 10,
    textAlign: 'left',
  },

  ButtonContainer: {
    height: resp(50),
    marginTop: resp(20),
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  YesButtonContainer: {
    flex: 0.4,
    marginHorizontal: resp(10),

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
  YesTextStyle: {
    marginTop: resp(10),
    alignSelf: 'center',
    fontSize: resp(15),
    color: '#FFFFFF',
  },
  NoTextStyle: {
    marginTop: resp(10),
    alignSelf: 'center',
    fontSize: resp(15),
    color: '#7F7F7F',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 10,
    width: 300,
    height: 'auto',
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
  bottomButtonTextStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  CloseButtonStyle: {
    alignSelf: 'flex-end',
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
  LogoIconStyle: {
    margin: 5,
    height: 30,
    width: 30,
  },
  detailTextStyle: {
    fontSize: resp(15),
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
    backgroundColor: '#fff',
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
