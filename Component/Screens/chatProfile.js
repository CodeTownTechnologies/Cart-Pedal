/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';
import resp from 'rn-responsive-font';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-crop-picker';
import {downloadFile, DocumentDirectoryPath} from 'react-native-fs';
import ImageModal from 'react-native-image-modal';
import FileViewer from 'react-native-file-viewer';
import {BASE_URL} from '../Component/ApiClient';
import {IsFileExist, ListFiles, saveFileInCache} from '../utils/FilesCaching';

const screenWidth = Dimensions.get('screen').width;
let width = Dimensions.get('window').width;

export default class ChatProfile extends React.Component {
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
        mediaArr: [],
        product_id: '',
        seller_id: '',
        fcmToken: '',
        imageList: [],
        itemOfProduct: '',
        audio1: {playing: false, duration: 0, current: 0},
        about: '',
        isEditModalVisible: false,
        userId: '',
        isProfileModalVisible: false,
        newImageArr: '',
        phone: '',
        downloading: false,
        FILES: [],
      });
    this.doubleClick = false;
    this.hidden = false;
  }
  async componentDidMount() {
    const FILES = await ListFiles();
    this.setState({FILES});
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmToken: token});
        let image = this.state.imageList;
        let name = this.props.route.params.name;
        let about = this.props.route.params.about;
        this.setState({name: name});
        this.setState({about: about});
        this.setState({phone: this.props.route.params.phone});
        let propsImage = this.props.route.params.imageURL;
        if (propsImage !== '') {
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
        this.singleProductPlaceOrder();
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

  downloadAndOpenDocument = async (uri) => {
    if (!uri.includes('http')) {
      FileViewer.open(uri, {
        showOpenWithDialog: true,
      });
    } else {
      const parts = uri.split('/');
      const fileName = parts[parts.length - 1];
      this.setState({downloading: true});
      downloadFile({
        fromUrl: uri,
        toFile: `${DocumentDirectoryPath}/${fileName}`,
      })
        .promise.then(() => {
          saveFileInCache(uri, `${DocumentDirectoryPath}/${fileName}`);
          this.setState((p) => ({
            FILES: [
              ...p.FILES,
              {
                uri,
                localPath: `${DocumentDirectoryPath}/${fileName}`,
              },
            ],
          }));
          FileViewer.open(`${DocumentDirectoryPath}/${fileName}`, {
            showOpenWithDialog: true,
          });
        })
        .catch(() => alert('could not open file'))
        .finally(() => {
          this.setState({downloading: false});
        });
    }
  };

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
          alert(responseData.message);
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
    formData.append('user_id', this.state.userId);
    formData.append('toid', this.props.route.params.userid);
    formData.append('type', '0');

    var PalceOderUrl = `${BASE_URL}api-message/media-list`;
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
          let arr = this.state.mediaArr;
          arr.push(responseData.data);
          this.setState({mediaArr: responseData.data});
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

  filemedia = () => {};

  viewAll = () => {
    this.props.navigation.navigate('ViewAll', {
      items: this.state.mediaArr,
    });
  };

  render() {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={'#fff'} />
        <Spinner
          visible={this.state.spinner || this.state.downloading}
          color="#F01738"
          textStyle={styles.spinnerTextStyle}
        />
        <View style={[styles.container, {backgroundColor: '#e3e3e3'}]}>
          <ScrollView>
            <View style={styles.profilePic}>
              <TouchableOpacity
                style={styles.profilelogo}
                onPress={() => this.profileModal()}>
                <View style={styles.BackButtonContainer}>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.goBack()}>
                    <Icon
                      name="chevron-thin-left"
                      size={25}
                      color="#fff"
                      style={styles.backButtonStyle}
                    />
                  </TouchableOpacity>
                </View>
                <ImageModal
                  resizeMode="contain"
                  imageBackgroundColor="transparent"
                  source={
                    this.props.route.params.imageURL
                      ? {uri: this.props.route.params.imageURL}
                      : require('../images/default_user.png')
                  }
                  style={{width: width, height: 300}}
                />
                <View
                  style={{
                    position: 'absolute',
                    marginTop: 270,
                    marginLeft: 15,
                  }}>
                  <Text
                    style={{color: '#fff', fontSize: 20, fontWeight: 'bold'}}>
                    {this.state.name}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.Name}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{marginLeft: 15, marginTop: 5}}>
                  <Text style={{fontSize: 15, color: '#F01738'}}>
                    Media and docs
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={this.viewAll}
                  style={{marginRight: 15, marginTop: 5}}>
                  <Text style={{fontSize: 15, color: '#F01738'}}>View All</Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  height: 'auto',
                  width: Dimensions.get('window').width,
                }}>
                <ScrollView horizontal={true}>
                  {this.state.mediaArr.map((item) => {
                    const isFileExist = IsFileExist(
                      this.state.FILES,
                      item.attachment,
                    );
                    return (
                      <View style={{flexDirection: 'row'}}>
                        {item.type == 'image' ? (
                          <View
                            style={{
                              borderWidth: 5,
                              flexDirection: 'row',
                              borderTopLeftRadius: 8,
                              borderTopRightRadius: 8,
                              borderColor: '#fff',
                              borderBottomLeftRadius: 0,
                            }}>
                            <ImageModal
                              resizeMode="contain"
                              style={{
                                height: 45,
                                borderRadius: 8,
                                width: 45,
                              }}
                              imageBackgroundColor="transparent"
                              source={{uri: item.attachment}}
                            />
                          </View>
                        ) : item.type == 'audio' ? null : item.type ==
                          'video' ? (
                          <TouchableOpacity
                            onPress={() => {
                              this.downloadAndOpenDocument(
                                isFileExist
                                  ? isFileExist.localPath
                                  : item.attachment,
                              );
                            }}
                            style={{
                              width: 45,
                              height: 45,
                              backgroundColor: 'red',
                              margin: 5,
                              borderRadius: 8,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Feather name="video" color="#fff" size={18} />
                          </TouchableOpacity>
                        ) : item.type == 'file' ? (
                          <TouchableOpacity
                            style={{
                              width: 45,
                              height: 45,
                              backgroundColor: 'red',
                              margin: 5,
                              borderRadius: 8,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                            onPress={() => {
                              this.downloadAndOpenDocument(
                                isFileExist
                                  ? isFileExist.localPath
                                  : item.attachment,
                              );
                            }}>
                            <Feather name="file" color="#fff" size={18} />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
            <View style={styles.Description}>
              <View style={{flexDirection: 'row'}}>
                <View style={{marginLeft: 15, marginTop: 5}}>
                  <Text style={{fontSize: 15, color: '#F01738'}}>
                    About and phone number
                  </Text>
                </View>
              </View>
              <View style={{marginLeft: 17, marginTop: 15, marginRight: 5}}>
                <Text style={{fontSize: 17, color: '#4F4F4F'}}>
                  {this.state.about}
                </Text>
              </View>
              <View
                style={{
                  marginLeft: 17,
                  marginTop: 15,
                  marginBottom: 10,
                  marginRight: 5,
                }}>
                <Text style={{fontSize: 17, color: '#4F4F4F'}}>
                  {this.state.phone}
                </Text>
              </View>
            </View>
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
    marginTop: 15,
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
    width: width,
    height: 220,
    borderRadius: 15,
    marginBottom: 10,
  },
  container: {
    flex: 1,
  },
  Name: {
    marginTop: 75,
    backgroundColor: '#fff',
    height: 'auto',
    width: Dimensions.get('window').width,
  },
  Name1: {
    marginTop: 15,
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
    position: 'absolute',
    zIndex: 2,
  },
  backButtonStyle: {
    margin: 10,
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
