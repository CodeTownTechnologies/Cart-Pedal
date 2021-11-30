/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-lone-blocks */
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
  TouchableNativeFeedback,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import resp from 'rn-responsive-font';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import {tickIcon} from '../Component/Images';
import {BASE_URL} from '../Component/ApiClient';
import CustomMenuIcon, {CustomMenuIcon2} from './CustomMenuIcon';

class ProductListScreen2 extends Component {
  constructor(props) {
    super(props);
    (this.EditProfileCall = this.EditProfileCall.bind(this)),
      (this.ProductListCall = this.ProductListCall.bind(this)),
      (this.ProfileViewCall = this.ProfileViewCall.bind(this)),
      (this.DeleteStoryCall = this.DeleteStoryCall.bind(this)),
      (this.state = {
        spinner: false,
        userName: '',
        NoData: '',
        Name: '',
        pickedImage: require('../images/default_user.png'),
        userAccessToken: '',
        userId: '',
        access_token: '',
        productName: '',
        baseUrl: `${BASE_URL}`,
        isModalVisible: false,
        isEditModalVisible: false,
        profilenameViews: false,
        productList: '',
        about: '',
        About: '',
        story_id: '',
        TotalprofileView: '',
        totalProductViews: '',
        showHeaderIcon: false,
        userProfileData: '',
        userStoryName: '',
        currentUserPhone: '',
        profilepic: null,
        ImageData: '',
        user_stories: '',
        fcmtoken: '',
        imagesCoverID: '',
        deleteStoryID: '',
        loggeduserstory_avatar: null,
        stories: '',
        loggeduser_stories: '',
        showTick: null,
        PlusIcon: false,
        productmaster: [],
        productDetailInner: [],
        id: '',
        profileImage: require('../images/default_user.png'),
        covers: [require('../images/default_user.png')],
        images: [require('../images/default_user.png')],
      });
  }

  async componentDidMount() {
    this.focusListener = this.props.navigation.addListener('focus', () => {
      AsyncStorage.getItem('@user_id').then((userId) => {
        if (userId) {
          this.setState({userId: userId});
          if (this.props.route.params) {
            if (this.props.route.params.screenPer == 'ImageHome') {
              this.setState({PlusIcon: true});
            }
          }
        }
      });
      AsyncStorage.getItem('@fcmtoken').then((token) => {
        if (token) {
          this.setState({fcmtoken: JSON.parse(token)});
        }
      });
      AsyncStorage.getItem('@access_token').then((accessToken) => {
        if (accessToken) {
          this.setState({userAccessToken: accessToken});
          this.showLoading();
          this.ProductListCall();
          setTimeout(() => {
            this.hideLoading();
          }, 1000);
        }
      });
      AsyncStorage.getItem('@user_name').then((userName) => {
        if (userName) {
          this.setState({userName: JSON.parse(userName)});
        }
      });
    });
  }

  showLoading() {
    this.setState({spinner: true});
  }

  hideLoading() {
    this.setState({spinner: false});
  }

  coverPhotogallery = () => {
    const options = {
      title: 'Select Option',
      customButtons: [{name: 'fb', title: 'View Story'}],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.showImagePicker(options, (res) => {
      if (res.didCancel) {
      } else if (res.error) {
      } else if (res.customButton) {
        this.loggedUser();
      } else {
        this.setState({
          pickedImage: {uri: res.uri},
          coverImageData: res,
        });
      }
    });
  };

  loggedUser = () => {
    if (this.state.loggeduserstory_avatar == null) {
      const itemImage1 = '';
      this.props.navigation.navigate('StoryViewScreen', {images: itemImage1});
    } else {
      const itemImage = this.state.loggeduserstory_avatar;
      this.props.navigation.navigate('StoryViewScreen', {images: itemImage});
    }
  };

  customButton = () => {
    this.props.navigation.navigate('FullViewProfileScreen', {
      images: this.state.profilepic,
    });
  };

  pickImageHandler = () => {
    const options = {
      title: 'Select Option',
      customButtons: [{name: 'fb', title: 'View Profile'}],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.showImagePicker(options, (res) => {
      if (res.didCancel) {
      } else if (res.error) {
      } else if (res.customButton) {
        this.customButton();
      } else {
        this.uploadProfilePic(res);
        this.setState({
          profileImage: {uri: res.uri},
          profilepic: '',
        });
      }
    });
  };

  OpenDeleteModalBox = (item) => {
    this.setState({deleteStoryID: item});
    this.setState({isModalVisible: !this.state.isModalVisible});
  };

  EditProfile = () => {
    this.setState({isEditModalVisible: !this.state.isEditModalVisible});
  };

  loggedUserstory = () => {
    var urlprofile = `${BASE_URL}api-user/user-stories?user_id=${this.state.userId}&type=1`;
    fetch(urlprofile, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          this.setState({loggeduser_stories: responseData.data[0]});
          this.setState({loggeduserstory_avatar: responseData.data[0].avatar});
          this.setState({stories: responseData.data[0].stories});
          this.setState({userStoryName: responseData.data[0].name});
          this.setState({story_id: responseData.data[0].stories[0].stid});
        } else {
        }
      })
      .catch((error) => {})
      .done();
  };

  uploadProfilePic = (ImageData) => {
    this.showLoading();
    var EditProfileUrl = `${BASE_URL}api-user/upload-image`;
    fetch(EditProfileUrl, {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1111',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: JSON.stringify({
        user_id: this.state.userId,
        type: 1,
        upload: ImageData,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          Toast.show(responseData.message);
          this.loggedUserstory();
          this.ProfileViewCall();
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

  DeleteStoryCall = () => {
    this.showLoading();
    let formData = new FormData();
    formData.append('user_id', this.state.userId);
    formData.append('story_id', this.state.deleteStoryID);
    var DeleteStoryURL = `${BASE_URL}api-user/delete-story`;
    fetch(DeleteStoryURL, {
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
          this.loggedUserstory();
          this.setState({isModalVisible: false});
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

  EditProfileCall = () => {
    this.showLoading();
    let formData = new FormData();
    formData.append('user_id', this.state.userId);
    formData.append('name', this.state.Name);
    formData.append('about', this.state.About);

    var EditProfileUrl = `${BASE_URL}api-user/edit-profile`;
    fetch(EditProfileUrl, {
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
          this.setState({isEditModalVisible: false});
          this.setState({RescentProduct: responseData.data});
          this.ProfileViewCall();
        } else {
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  };

  _renderTruncatedFooter = (handlePress) => {
    return (
      <Text style={{color: 'red', marginTop: 5}} onPress={handlePress}>
        Read more
      </Text>
    );
  };
  _renderRevealedFooter = (handlePress) => {
    return (
      <Text style={{color: 'red', marginTop: 5}} onPress={handlePress}>
        Show less
      </Text>
    );
  };

  ProfileViewCall = () => {
    var urlprofile =
      `${BASE_URL}api-user/view-profile?user_id=` + this.state.userId;
    fetch(urlprofile, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          this.setState({userProfileData: responseData.data});
          this.setState({TotalprofileView: responseData.data.profileviews});
          this.setState({profilepic: responseData.data.avatar});
          if (responseData.data.avatar == null) {
            this.setState({profilepic: null});
          } else {
            this.setState({profilepic: responseData.data.avatar});
          }
          this.setState({currentUserPhone: responseData.data.mobile});
          if (
            responseData.data.covers !== undefined &&
            responseData.data.covers.length > 0
          ) {
            let imageArr = [];
            responseData.data.covers.map((item) => {
              imageArr.push(item.image);
            });
            this.setState({covers: imageArr});
            this.setState({imagesCoverID: responseData.data.covers});
          }
          if (responseData.data.proviews == null) {
            this.setState({totalProductViews: 0});
          } else {
            this.setState({totalProductViews: responseData.data.proviews});
          }
          if (responseData.data.about !== null) {
            this.setState({about: responseData.data.about});
          }
          Toast.show(responseData.message);
        } else {
        }
      })
      .catch((error) => {})
      .done();
  };

  ProductListCall = () => {
    var urlProduct =
      `${BASE_URL}api-product/product-list?user_id=` +
      this.state.userId +
      '&type=0';
    fetch(urlProduct, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.userAccessToken),
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          if (responseData.data !== undefined && responseData.data.length > 0) {
            this.setState({productList: responseData.data});
          } else {
            this.setState({NoData: true});
            this.setState({productList: ''});
          }
        } else {
          this.setState({NoData: true});
        }
      })
      .catch((error) => {})
      .done();
  };

  uploadfun = async () => {
    await AsyncStorage.setItem(
      '@current_usermobile',
      JSON.stringify(this.state.currentUserPhone),
    ).then(() => {
      this.props.navigation.navigate('ProductMasterSaveScreen');
    });
  };

  viewFunc = () => {
    this.props.navigation.navigate('ViewProfileScreen', {
      images: this.state.covers,
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
        device_token: this.state.fcmtoken,
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
        if (responseData.code == '200') {
          Toast.show(responseData.message);
          this.loggedUserstory();
          this.hideLoading();
        } else {
        }
      })
      .catch((error) => {
        console.error('error message', error);
      })
      .done();
  };

  tickIcon = (items, index) => {
    let image = this.state.productmaster;
    let Innerimage = this.state.productDetailInner;
    image.push(items.images[0].file_url);
    {
      items.images[1]
        ? items.images.map((item) => {
            let obj = {
              path: item.file_url,
            };
            Innerimage.push(obj);
          })
        : null;
    }

    this.setState({showHeaderIcon: true});
    this.setState({showTick: index, id: items.product_id});
    this.setState({productmaster: image});
    this.setState({productDetailInner: Innerimage});
  };

  submit = () => {
    AsyncStorage.setItem('@product_id', JSON.stringify(this.state.id)).then(
      () => {
        this.props.navigation.navigate('ProductMasterImage', {
          imageUri: this.state.productmaster,
          productInner: this.state.productDetailInner,
        });
      },
    );
  };

  ListEmpty = () => {
    return (
      <View style={{flex: 1}}>
        {this.state.NoData ? (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 30,
            }}>
            <Text
              style={{textAlign: 'center', fontWeight: 'bold', fontSize: 17}}>
              No Product!!
            </Text>
          </View>
        ) : null}
      </View>
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
        <ScrollView>
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
                if (this.state.showHeaderIcon == true) {
                  this.submit();
                }
              }}>
              <Image
                source={
                  this.state.showHeaderIcon
                    ? require('../images/rightProfileIcons.png')
                    : require('../images/search.png')
                }
                style={styles.SearchIconStyle}
              />
            </TouchableOpacity>
          </View>
          <FlatList
            style={{flex: 1}}
            data={this.state.productList}
            keyExtractor={(item) => item.product_id}
            numColumns={2}
            ListEmptyComponent={this.ListEmpty}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity
                  onLongPress={() => {
                    this.tickIcon(item, index);
                  }}
                  onPress={() => {
                    this.props.navigation.navigate('ProductMasterUpdate', {
                      product_item: item,
                      images: item.images,
                      peopleListCount: item.shareto.people.length,
                      peopleContact: item.shareto.people,
                      sharedContactsName: item.shareto.shared,
                    });
                  }}
                  style={styles.listItem}>
                  <Image
                    source={
                      item.images[0]
                        ? {uri: item.images[0].file_url}
                        : this.state.profileImage
                    }
                    style={styles.image}
                  />
                  {item.images[1] ? (
                    <TouchableOpacity style={styles.MultipleOptionContainer}>
                      <Image
                        source={require('../images/multipleImageIcon.png')}
                        style={styles.MultipleIconStyle}
                      />
                    </TouchableOpacity>
                  ) : null}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View>
                      <View>
                        <Text style={styles.itemNameStyle}>{item.name}</Text>
                      </View>
                      <View style={[styles.box]}>
                        <View style={styles.priceContainer}>
                          <View style={styles.itemPriceContainer}>
                            <Text style={styles.itemPriceStyle}>
                              {'\u20B9'} {item.price}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <CustomMenuIcon2
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
                        alert('to be implemented');
                      }}
                    />
                  </View>
                  {this.state.showTick == index ? (
                    <TouchableOpacity
                      style={[
                        styles.imageOptionIcon,
                        {position: 'absolute', top: 5, end: 5},
                      ]}>
                      <Image style={styles.imageOptionIcon} source={tickIcon} />
                    </TouchableOpacity>
                  ) : null}
                </TouchableOpacity>
              );
            }}
          />
        </ScrollView>
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  imageOptionIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  modalView: {
    margin: 10,
    width: 300,
    height: 250,
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
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  headerView: {
    width: '100%',
    height: resp(60),
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
  input: {
    color: 'black',
    width: 150,
    height: 50,
    padding: 10,
    textAlign: 'left',
  },

  inputView: {
    width: '90%',

    alignSelf: 'center',
    borderColor: '#7F7F7F',
    borderBottomWidth: 1,
  },
  TitleContainer: {
    flexDirection: 'row',
    flex: 0.6,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  EditbuttonContainer: {
    margin: resp(5),
    marginTop: resp(5),
    width: resp(15),
    height: resp(15),
    borderRadius: resp(50),
  },
  RightbuttonContainer: {
    margin: resp(5),
    marginTop: resp(5),
    width: resp(15),
    height: resp(15),
    borderRadius: resp(50),
    backgroundColor: '#e6f7f2',
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
  modal: {
    backgroundColor: '#fff',
    margin: 240, // This is the important style you need to set

    alignSelf: 'center',
    width: 300,
    height: 150,
    borderRadius: 30,
  },
  EditModal: {
    backgroundColor: '#fff',
    margin: 200, // This is the important style you need to set

    alignSelf: 'center',
    width: 300,
    height: 150,
    borderRadius: 30,
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
  CloseButtonStyle: {
    alignSelf: 'flex-end',
  },
  EditCloseButtonStyle: {
    marginTop: resp(-20),

    alignSelf: 'flex-end',
  },
  DeleteContainer: {
    marginTop: resp(10),
    margin: resp(10),
    marginRight: 55,

    flexDirection: 'row',
  },
  DeleteButtonStyle: {
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  DeleteStutsStyle: {
    fontWeight: 'bold',
    fontSize: resp(20),
    marginLeft: resp(10),
    marginBottom: 10,
    color: '#2B2B2B',
  },
  DeleteStutsDiscraptionStyle: {
    marginLeft: resp(55),
    marginTop: resp(-20),
    color: '#7F7F7F',

    width: resp(207),
    fontSize: resp(14),
  },
  spinnerTextStyle: {
    color: '#F01738',
  },
  ButtonContainer: {
    height: resp(50),
    marginTop: resp(20),

    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  DeleteButtonContainer: {
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
  card: {
    marginHorizontal: 25,
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
  EditButtonStyle: {
    marginTop: resp(0),
    color: '#F01738',
    width: resp(15),
    height: resp(15),
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
    marginTop: 0,
    width: 50,
    height: 50,
    bottom: 10,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
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
    marginBottom: resp(5),
    margin: resp(10),
    flexDirection: 'column',
    flex: 0.2,
    width: resp(80),
    height: resp(80),
    position: 'absolute', //Here is the trick
    bottom: 0,
  },
  RiyaImageViewStyle: {
    margin: resp(11),
    position: 'absolute',
    width: resp(90),
    height: resp(90),
    borderRadius: resp(10),
    bottom: 0,
    borderWidth: 2,
    borderColor: '#fff',
  },
  StatusAddLargeStyle: {
    marginLeft: resp(75),
    width: resp(25),
    height: resp(25),
    position: 'absolute', //Here is the trick
    bottom: 5,
  },
  sliderMenuContainer: {
    marginTop: resp(20),
    marginRight: resp(0),
    position: 'absolute',
    top: 0,
    right: -20,
    width: 28,
    height: 28,
    borderRadius: resp(20),
    backgroundColor: '#9da1a3',
  },
  sliderMenuContainer2: {
    flexDirection: 'row',
    flex: 0.1,

    width: resp(0),
    height: resp(30),
  },
  ProfileInfoContainer: {
    flexDirection: 'row',
    width: '100%',
    height: resp(30),

    color: '#fff',
  },
  PersonInfoContainer: {
    flexDirection: 'column',
    marginTop: resp(10),
    width: '100%',
    height: resp(40),
  },
  PersonNameStyle: {
    flex: 0.85,

    marginLeft: resp(25),
    fontSize: resp(16),
    width: resp(70),
    height: resp(25),
    color: '#2B2B2B',
    fontWeight: 'bold',
  },
  PersonDescriptionStyle: {
    marginLeft: resp(30),
    fontSize: resp(12),
    width: resp(334),
    height: resp(44),
    color: '#7F7F7F',
  },
  TotalBox: {
    flexDirection: 'row',

    width: '100%',
    marginLeft: resp(0),
    height: resp(50),
  },
  TotalProfileViewContainer: {
    flex: 0.5,
    marginLeft: resp(70),
    flexDirection: 'column',

    height: resp(80),
  },
  TotalProductViewContainer: {
    marginRight: resp(70),
    flex: 0.5,
    flexDirection: 'column',

    height: resp(100),
  },
  TotalProfileTextStyle: {
    height: resp(25),
    alignSelf: 'center',
    marginLeft: resp(50),
    width: resp(50),
    height: resp(25),
    fontSize: resp(20),
    fontWeight: 'bold',
  },
  TotalProfileViewTextStyle: {
    margin: resp(5),
    width: resp(150),
    height: resp(35),
    fontSize: resp(12),
    color: '#7F7F7F',
  },
  TotalProductViewTextStyle: {
    margin: resp(5),
    marginLeft: resp(10),
    width: resp(180),
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
    marginLeft: 10,
  },

  ImageViewStyle: {
    margin: resp(8),
    width: resp(55),
    height: resp(55),
    borderWidth: 2,
    borderColor: '#F01738',
  },
  StatusAddStyle: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute', //Here is the trick
    bottom: 20,
    left: 3,
    marginLeft: resp(45),
  },
  storyTextView: {
    color: '#887F82',
    fontSize: resp(10),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
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
    marginTop: resp(5),
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
    marginLeft: resp(18),
    fontSize: resp(14),
  },
  itemPriceStyle: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: resp(7),
    fontSize: resp(14),
  },
  itemPriceContainer: {
    flex: 0.6,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  box: {
    width: resp(100),
    height: resp(25),
    marginLeft: resp(17),
    backgroundColor: 'white',
    flexDirection: 'row',

    elevation: 0,
  },
  priceContainer: {
    flex: 1,
    marginLeft: resp(-5),
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  ListMenuContainer: {
    flexDirection: 'row',
    flex: 0.1,
    backgroundColor: 'white',
    width: resp(0),
    height: resp(50),
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
    color: '#7F7F7F',
    height: resp(24),
    backgroundColor: '#fff',
  },
});
export default ProductListScreen2;
