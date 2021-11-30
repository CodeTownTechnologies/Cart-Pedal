/* eslint-disable react/no-did-update-set-state */
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
  TouchableNativeFeedback,
  TextInput,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import resp from 'rn-responsive-font';
import ProfileCustomMenuIcon from './ProfileCustomMenuIcon';
import Toast from 'react-native-simple-toast';
import CustomMenuIcon from './CustomMenuIcon';
import {SliderBox} from 'react-native-image-slider-box';
import ProductMenuIcon from './ProductMenuIcon';
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import SeeMore from 'react-native-see-more-inline';
import moment from 'moment';
import ImageSelectDialog from '../Component/ImageSelectDialog';
import firebase from 'react-native-firebase';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob'
import {
  profileView,
  addStoryAction,
  productlistAction,
} from '../../redux/actions';
import {connect} from 'react-redux';
import {BASE_URL} from '../Component/ApiClient';
import FastImage from 'react-native-fast-image';

let width = Dimensions.get('window').width;
let height = Dimensions.get('window').height;

class ProfileScreen extends Component {
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
        isProfileModalVisible: false,
        isModalVisible: false,
        isEditModalVisible: false,
        profilenameViews: false,
        productList: '',
        NoCover: true,
        about: '',
        About: '',
        story_id: '',
        TotalprofileView: '0',
        totalProductViews: '0',
        userProfileData: '',
        userStoryName: '',
        currentUserPhone: '',
        profilepic: null,
        ImageData: '',
        user_stories: '',
        fcmtoken: '',
        imagesCoverID: '',
        showImageSelectDialog: false,
        deleteStoryID: '',
        loggeduserstory_avatar: null,
        stories: '',
        newImageArr: '',
        isStoryModalVisible: false,
        loggeduser_stories: '',
        nameViewer: '',
        productData: this.props.productData,
        profileImage: require('../images/default_user.png'),
        covers: [require('../images/placeholder-image-2.png')],
        images: [require('../images/default_user.png')],
        defaultProfile:'https://miro.medium.com/max/790/1*reXbWdk_3cew69RuAUbVzg.png'
      });
  }
  async componentDidMount() {
    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.showLoading();
      AsyncStorage.getItem('@user_id').then((userId) => {
        if (userId) {
          this.setState({userId: userId});
        }
      });
      AsyncStorage.getItem('@fcmtoken').then((token) => {
        if (token) {
          this.setState({fcmtoken: JSON.parse(token)});
        }
      });
      AsyncStorage.getItem('@access_token').then((accessToken) => {
        if (accessToken) {
          this.setState({userAccessToken: accessToken}, () => {
            this.ProfileViewCall();
            this.loggedUserstory();
            this.ProductListCall();
          });
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

  coverPhotogallery = () => {};

  uploadCoverPhoto = (imageList) => {
    this.showLoading();
    var EditProfileUrl = `${BASE_URL}api-user/upload-image`;
    fetch(EditProfileUrl, {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1111',
        device_token: this.state.fcmtoken,
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: JSON.stringify({
        user_id: this.state.userId,
        type: 0,
        upload: imageList,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.hideLoading();
        if (responseData.code == '200') {
          Toast.show(responseData.message);
          this.props.navigation.navigate('DashBoardScreen');
        } else {
          this.setState({
            pickedImage: {uri: res.uri},
            coverImageData: res,
          });
        }
      });
  };

  uploadCoverPhoto = (imageList) => {
    this.showLoading();
    var EditProfileUrl = `${BASE_URL}api-user/upload-image`;
    fetch(EditProfileUrl, {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1111',
        device_token: this.state.fcmtoken,
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: JSON.stringify({
        user_id: this.state.userId,
        type: 0,
        upload: imageList,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.hideLoading();
        if (responseData.code == '200') {
          this.props.navigation.navigate('DashBoardScreen');
        } else {
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  };

  coverCameraphoto = () => {
    const options = {
      title: 'Select Option',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.launchCamera(options, (response) => {
      let imageArr = [];
      imageArr.push(response);
      this.uploadCoverPhoto(imageArr);
    });
  };

  coverGallery = () => {
    const options = {
      title: 'Select Option',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.launchImageLibrary(options, (response) => {
      let imageArr = [];
      imageArr.push(response);
      this.uploadCoverPhoto(imageArr);
    });
  };

  loggedUser = () => {
    if (this.state.loggeduserstory_avatar == null) {
      const itemImage1 = null;
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
    this.setState({isProfileModalVisible: !this.state.isProfileModalVisible});
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
  openImageStoryGallery = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      includeBase64: true,
      compressImageQuality: 0.4,
    }).then((image) => {
      this.setState({isStoryModalVisible: !this.state.isStoryModalVisible});
      this.onStoryPick(image);
    });
  };
  openCamaraStory() {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
      includeBase64: true,
    }).then((image) => {
      this.setState({isStoryModalVisible: !this.state.isStoryModalVisible});
      this.onStoryPick(image);
    });
  }
  onStoryPick(response) {
    let imgOjc = {
      path: response.path,
      type: response.mime,
      data: response.data,
      fileName: response.modificationDate,
    };
    let imageArray = [];
    imageArray.push(imgOjc);
    this.addStoryApi(imageArray);
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
  pickImageHandler = () => {};
  profileModal() {
    this.setState({isProfileModalVisible: !this.state.isProfileModalVisible});
  }
  OpenDeleteModalBox = (item) => {
    this.setState({deleteStoryID: item});
    this.setState({isModalVisible: !this.state.isModalVisible});
  };
  EditProfile = () => {
    this.setState({isEditModalVisible: !this.state.isEditModalVisible});
  };
  CheckTextInput = () => {
    if (this.state.Name === '') {
      alert('Please Enter Name ');
    } else if (this.state.About === '') {
      alert('Please Enter About YourSelf');
    } else {
      this.EditProfileCall();
    }
  };
  loggedUserstory = () => {
    this.showLoading();
    var urlprofile = `${BASE_URL}api-user/user-stories?user_id=${this.state.userId}&type=1`;
    fetch(urlprofile, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: 'android',
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
          console.log('logged user stories' + JSON.stringify(responseData));
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .done();
  };

  uploadProfilePic = () => {
    this.showLoading();
    var EditProfileUrl = `${BASE_URL}api-user/upload-image`;
    fetch(EditProfileUrl, {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1111',
        device_token: this.state.fcmtoken,
        device_type: 'android',
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
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),
      }),
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          Toast.show(responseData.message);
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
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),
      }),
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          Toast.show(responseData.message);
          this.ProfileViewCall();
          this.setState({isEditModalVisible: false});
          this.setState({RescentProduct: responseData.data});
          this.hideLoading();
        } else {
          this.hideLoading();
        }
      })
      .catch((error) => {
        this.hideLoading();
        console.error(error);
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
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          this.setState({userProfileData: responseData.data});
          this.setState({TotalprofileView: responseData.data.profileviews});
          this.setState({profilepic: responseData.data.avatar});
          if (responseData.data.name !== null) {
            this.setState({Name: responseData.data.name});
          }
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
          } else {
            this.setState({NoCover: false});
          }
          if (responseData.data.proviews == null) {
            this.setState({totalProductViews: 0});
          } else {
            this.setState({totalProductViews: responseData.data.proviews});
          }
          if (responseData.data.about !== null) {
            this.setState({about: responseData.data.about});
            this.setState({About: responseData.data.about});
          }
        } else {
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .done();
  };

  ProductListCall = () => {
    this.setState({callUpdate: true}, () => {
      this.props.productlistAction(
        this.state.userId,
        this.state.userAccessToken,
      );
    });
  };

  closeModal = () => {
    this.setState({isModalVisible: false});
  };

  closeProfileModal = () => {
    this.setState({isProfileModalVisible: false});
  };

  closeStoryModal = () => {
    this.setState({isStoryModalVisible: false});
  };

  closeModalbox = () => {
    this.setState({isEditModalVisible: false});
  };

  uploadfun = async () => {
    await AsyncStorage.setItem(
      '@current_usermobile',
      JSON.stringify(this.state.currentUserPhone),
    ).then(() => {
      this.props.navigation.navigate('ImageHome');
    });
  };

  storyImage = () => {
    if (this.state.loggeduserstory_avatar == null) {
      const itemImage1 = '';
      this.props.navigation.navigate('StoryViewScreen', {
        images: itemImage1,
        storyImages: this.state.stories,
        name: this.state.userStoryName,
      });
    } else {
      const itemImage = this.state.loggeduserstory_avatar;
      this.props.navigation.navigate('StoryViewScreen', {
        images: itemImage,
        storyImages: this.state.stories,
        name: this.state.userStoryName,
      });
    }
  };

  storyPhotogallery = () => {
    this.setState({isStoryModalVisible: !this.state.isStoryModalVisible});
  };

  AddViewerList = (productID) => {
    this.showLoading();
    let formData = new FormData();
    formData.append('user_id', this.state.userId);
    formData.append('product_id', productID);
    var EditProfileUrl = `${BASE_URL}api-product/viewer-list`;
    fetch(EditProfileUrl, {
      method: 'Post',
      headers: new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '1111',
        device_token: this.state.fcmtoken,
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),
      }),
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          Toast.show(responseData.message);
          this.setState({profilenameViews: true});
          let name = [];
          responseData.data.map((items) => {
            name.push(items.name);
          });
          let itemNewName = name.join(' , ');
          this.setState({nameViewer: itemNewName});
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
      .createDynamicLink(link)
      .then((url) => {
        console.log('the url', url);
        AsyncStorage.getItem('@Phonecontacts').then((NumberFormat) => {
          if (NumberFormat) {
            let numID = JSON.parse(NumberFormat);
            this.props.navigation.navigate('ForwardLinkScreen', {
              fcmToken: this.state.fcmtoken,
              PhoneNumber: numID,
              userId: this.state.userId,
              userAccessToken: this.state.userAccessToken,
              msgids: `${url}?&li=${Imagelink}`,
            });
          }
        });
      });
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

  link = async (id, name,ImageLink) => {
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
        this.base64ImageConvetor(url,ImageLink);
      });
  };
  viewFunc = () => {
    this.props.navigation.navigate('ViewProfileScreen', {
      images: this.state.covers,
      profileScren: '1',
    });
  };

  addStoryApi = (data) => {
    this.showLoading();
    fetch(`${BASE_URL}api-user/add-story`, {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: 'android',
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

  ListEmpty = () => {
    return (
      <View>
        {this.state.NoData ? (
          <View
            style={{
              width: width,
              height: height / 3,
              backgroundColor: 'white',
            }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 20,
              }}>
              <Text
                style={{textAlign: 'center', fontWeight: 'bold', fontSize: 17}}>
                No Product!!
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  profileMenu = () => {
    return (
      <ProfileCustomMenuIcon
        menustyle={{
          marginRight: 5,
          flexDirection: 'column',
          justifyContent: 'center',
          alignSelf: 'center',
        }}
        setData={this.state.NoCover}
        textStyle={{
          color: 'white',
        }}
        option1Click={() => {
          this.viewFunc();
          // Toast.show('OPTION1 CLICKED', Toast.LONG)
        }}
        option3Click={() => {
          // console.log('covers value',this.state.covers);
          this.props.navigation.navigate('UploadCoverPhotoScreen');
        }}
      />
    );
  };

  componentWillReceiveProps(nextProps) {
    // console.log('recevie props data',nextProps.productData);
    if (this.props.productData !== nextProps.productData) {
      this.setState({productData: nextProps.productData});
    }
  }

  componentDidUpdate() {
    // console.log('product error',this.props.producterror,this.props.productSuccess);
    if (this.props.producterror && this.state.callUpdate) {
      this.setState({callUpdate: false, NoData: true, productData: []}, () => {
        this.hideLoading();
      });
    }
    if (this.props.productSuccess && this.state.callUpdate) {
      this.setState(
        {callUpdate: false, productData: this.props.productData},
        () => {
          this.hideLoading();
        },
      );
    }
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
                images={this.state.covers}
                style={styles.sliderImageStyle}
              />
              <View style={styles.RiyaImageContainer}>
                <ImageSelectDialog
                  ref={(ref) => (this.imageSelectDialog = ref)}
                  style={{position: 'absolute', end: 10}}
                  onImagePick={(response) => {
                    this.onImagePick(response);
                  }}
                />
                <Image
                  source={
                    this.state.profilepic == null
                      ? this.state.profileImage
                      : {uri: this.state.profilepic}
                  }
                  style={styles.RiyaImageViewStyle}
                />
                <TouchableOpacity
                  style={styles.profileAddbtn}
                  onPress={() => this.profileModal()}>
                  <Image
                    source={require('../images/status_add_largeicon.png')}
                    style={styles.StatusAddLargeStyle}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.sliderMenuContainer}>
                {this.profileMenu()}
              </View>
            </View>
            <View style={styles.ProfileInfoContainer}>
              <Text style={styles.PersonNameStyle}>
                {this.state.userProfileData.name}
              </Text>

              <View style={styles.sliderMenuContainer2}>
                <TouchableOpacity
                  onPress={() => {
                    this.EditProfile();
                  }}>
                  <View style={styles.EditbuttonContainer}>
                    <Image
                      source={require('../images/edit-tool_icon.png')}
                      style={styles.EditButtonStyle}
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity>
                  <CustomMenuIcon
                    menutext="Menu"
                    menustyle={{
                      marginRight: 10,

                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                    }}
                    textStyle={{
                      color: 'white',
                    }}
                    option1Click={() => {
                      let name = 'OpenForProfileScreen';
                      let image;
                      this.state.profilepic == null
                      ? image=this.state.profileImage
                      : image=this.state.profilepic
                      this.link(this.state.userId, name,image);
                    }}
                    option2Click={() => {
                      let name = 'OpenForProfileScreen';
                      let image;
                      this.state.profilepic == null
                      ? image=this.state.profileImage
                      : image=this.state.profilepic
                      this.forwardlink(this.state.userId, name,image);
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.PersonInfoContainer}>
              <View style={styles.card}>
                {this.state.about ? (
                  <View style={{width: width - 20}}>
                    <SeeMore
                      numberOfLines={2}
                      style={styles.PersonDescriptionStyle}
                      linkColor="red"
                      seeMoreText="read more"
                      seeLessText="read less">
                      {this.state.about}
                    </SeeMore>
                  </View>
                ) : null}
              </View>
            </View>
            <View style={styles.TotalBox}>
              <View style={styles.TotalProfileViewContainer}>
                <Text style={styles.TotalProfileTextStyle}>
                  {this.state.TotalprofileView}
                </Text>
                <Text style={styles.TotalProfileViewTextStyle}>
                  Total Profile Views
                </Text>
              </View>
              <View style={styles.TotalProductViewContainer}>
                <Text style={styles.TotalProfileTextStyle}>
                  {this.state.totalProductViews}
                </Text>
                <Text style={styles.TotalProductViewTextStyle}>
                  Total Product Views
                </Text>
              </View>
            </View>

            <View style={styles.horizontalLine}>
              <View style={styles.hairline} />
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <TouchableOpacity
                style={styles.storyItemBox}
                onPress={() => this.storyPhotogallery()}>
                <Image
                  source={
                    this.state.profilepic == null
                      ? this.state.pickedImage
                      : {uri: this.state.profilepic}
                  }
                  style={styles.ImageViewStyle}
                />
                <Image
                  source={require('../images/status_add_icon.png')}
                  style={styles.StatusAddStyle}
                />
                <Text style={styles.storyTextView}>Your Story</Text>
              </TouchableOpacity>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{flex: 1, flexDirection: 'row'}}
                data={this.state.stories}
                keyExtractor={(item) => item.StoryImage}
                renderItem={({item}) => {
                  let time = moment(item.time * 1000)
                    .fromNow()
                    .toString();
                  return (
                    <TouchableOpacity
                      style={styles.storyItemBox}
                      onPress={() => {
                        this.props.navigation.navigate('ProfileStory', {
                          images: this.state.loggeduserstory_avatar,
                          storyImages: item.image,
                          name: this.state.userProfileData.name,
                          time: item.time,
                        });
                      }}
                      onLongPress={() => {
                        this.OpenDeleteModalBox(item.stid);
                      }}>
                      <Image
                        source={
                          item.image == null
                            ? this.state.pickedImage
                            : {uri: item.image}
                        }
                        style={styles.ImageViewStyle}
                      />
                      <Text style={styles.storyTextView}>
                        {time.length > 10 ? time.substring(0, 10) + '..' : time}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
            <Modal
              animationType="slide"
              transparent={true}
              useNativeDriver={true}
              visible={this.state.isEditModalVisible}
              onRequestClose={() => {
                this.closeModalbox();
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
                      value={this.state.Name}
                      style={styles.input}
                      onChangeText={(Name) => this.setState({Name: Name})}
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
                      value={this.state.About}
                      style={styles.input}
                      onChangeText={(About) => this.setState({About: About})}
                    />
                  </View>
                  <View style={styles.ButtonContainer}>
                    <TouchableOpacity
                      style={styles.YesButtonContainer}
                      onPress={this.CheckTextInput}>
                      <Text style={styles.YesTextStyle}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.NoButtonContainer}
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
              useNativeDriver={true}
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
                    <Image
                      source={require('../images/modal_delete.png')}
                      style={styles.DeleteButtonStyle}
                    />
                    <Text style={styles.DeleteStutsStyle}>Delete Status</Text>
                  </View>
                  <Text style={styles.DeleteStutsDiscraptionStyle}>
                    Are you sure you want to remove this status?
                  </Text>

                  <View style={styles.DeleteButtonContainer}>
                    <View style={styles.EmptyButtonCOntainer} />
                    <TouchableOpacity
                      style={styles.YesButtonContainer}
                      onPress={() => this.DeleteStoryCall()}>
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
            <Modal
              animationType="slide"
              transparent={true}
              useNativeDriver={true}
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
                      this.openCamara();
                    }}>
                    <Text style={styles.OptionsProfileModalStyle}>Camera</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      this.openImageGallery();
                    }}>
                    <Text style={styles.Options2ProfileModalStyle}>
                      Gallery{' '}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      this.customButton();
                    }}>
                    <Text style={styles.Options2ProfileModalStyle}>
                      View Profile
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.isStoryModalVisible}
              onRequestClose={() => this.closeStoryModal()}>
              <View style={styles.centeredView}>
                <View style={styles.ProfilemodalViewStyle}>
                  <TouchableOpacity
                    style={{alignSelf: 'flex-end'}}
                    onPress={() => {
                      this.closeStoryModal();
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
                      this.openCamaraStory();
                    }}>
                    <Text style={styles.OptionsProfileModalStyle}>Camera </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      this.openImageStoryGallery();
                    }}>
                    <Text style={styles.Options2ProfileModalStyle}>
                      Gallery
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={styles.horizontalLine}>
              <View style={styles.hairline} />
            </View>
            <Modal
              animationType="slide"
              transparent={true}
              useNativeDriver={true}
              visible={this.state.profilenameViews}
              onRequestClose={() => this.closeModal()}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <TouchableOpacity
                    style={{alignSelf: 'flex-end'}}
                    onPress={() => {
                      this.setState({profilenameViews: false});
                    }}>
                    <Image
                      source={require('../images/modal_close.png')}
                      style={styles.CloseButtonStyle}
                    />
                  </TouchableOpacity>
                  <View>
                    <View>
                      <Text style={{marginTop: 35}}>
                        {this.state.nameViewer}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
            <FlatList
              style={{flex: 1, backgroundColor: 'white'}}
              data={
                JSON.stringify(this.state.productData) != JSON.stringify({})
                  ? this.state.productData
                  : []
              }
              keyExtractor={(item, index) => index}
              numColumns={2}
              ListEmptyComponent={this.ListEmpty}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      this.props.navigation.navigate('UpdateProduct', {
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
                          : this.state.pickedImage
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
                    <View>
                      <Text style={styles.itemNameStyle}>{item.name}</Text>
                    </View>

                    <View style={styles.box}>
                      <View style={styles.priceContainer}>
                        <View style={styles.itemPriceContainer}>
                          <Text style={styles.itemPriceStyle}>
                            {'\u20B9'} {item.price}
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => {
                            this.AddViewerList(item.product_id);
                          }}
                          style={styles.eyeButtonContainer}>
                          <Image
                            source={require('../images/eye_icon.png')}
                            style={styles.eyeButtonStyle}
                          />
                        </TouchableOpacity>
                        <Text style={styles.viewTextStyle}>{item.view}</Text>
                        <View style={styles.ListMenuContainer}>
                          <TouchableOpacity>
                            <ProductMenuIcon
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
                                Toast.show('CLicked Unshow Link', Toast.LONG);
                              }}
                              option2Click={() => {
                                let name = 'ProductDetailScreen';
                                let image;
                                item.images[0]
                                ? image= item.images[0].file_url
                                : image=this.state.pickedImage
                                this.link(item.product_id, name,image);
                              }}
                              option3Click={() => {
                                let name = 'ProductDetailScreen';
                                let image;
                                item.images[0]
                                ? image= item.images[0].file_url
                                : image=this.state.pickedImage
                                this.forwardlink(item.product_id, name,image);
                              }}
                              option4Click={() => {
                                this.props.navigation.navigate(
                                  'UpdateProduct',
                                  {
                                    product_item: item,
                                    images: item.images,
                                    peopleListCount: item.shareto.people.length,
                                    peopleContact: item.shareto.people,
                                    sharedContactsName: item.shareto.shared,
                                  },
                                );
                              }}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </ScrollView>
          <TouchableNativeFeedback onPress={this.uploadfun}>
            <Image
              source={require('../images/flatin_action_icon.png')}
              style={styles.FloatingActionStyle}
            />
          </TouchableNativeFeedback>
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
    backgroundColor: '#F6F9FE',
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
  input: {
    color: 'black',

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
  TitleProfileModalStyle: {
    alignContent: 'flex-start',
    fontWeight: 'bold',
    color: '#000',

    width: resp(207),
    fontSize: resp(16),
  },
  OptionsProfileModalStyle: {
    alignContent: 'flex-start',
    marginTop: resp(10),
    color: '#000',
    marginBottom: 10,
    width: resp(207),
    fontSize: resp(16),
  },
  Options2ProfileModalStyle: {
    alignContent: 'flex-start',
    marginTop: resp(5),
    color: '#000',
    marginBottom: 10,
    width: resp(207),
    fontSize: resp(16),
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
    marginHorizontal: 15,
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
    // Top:25,
    marginRight: resp(10),
    marginLeft: resp(10),
    flexDirection: 'column',
    flex: 0.2,
    width: resp(80),
    height: resp(80),
    position: 'absolute', //Here is the trick
    bottom: -12,
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
  profileAddbtn: {
    bottom: 12,
    left: 0,
    position: 'absolute',
  },
  StatusAddLargeStyle: {
    marginLeft: resp(80),
    width: resp(25),
    height: resp(25),
  },
  sliderMenuContainer: {
    marginTop: resp(20),
    marginRight: resp(0),
    position: 'absolute',
    top: 0,
    right: -5,
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
    marginTop: resp(0),
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
    marginLeft: 0,
    // height: resp(90),
    // backgroundColor: 'white',
    // flexDirection: 'column',
    // shadowColor: 'black',
    // shadowOpacity: 0.2,
    // shadowOffset: {
    //   height: 1,
    //   width: 5,
    // },
    // elevation: 2,
  },

  ImageViewStyle: {
    margin: resp(6),
    width: resp(55),
    height: resp(55),
    borderWidth: 2,
    borderRadius: 5,
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
    width: resp(200),
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
function mapStateToProps(state) {
  const {isLoading, data, success} = state.signinReducer;
  const {success: addStorySuccess} = state.addStoryReducer;
  const {
    data: productData,
    success: productSuccess,
    isLoading: loadingData,
    error: producterror,
  } = state.productListReducer;
  return {
    isLoading,
    data,
    success,
    producterror,
    loadingData,
    addStorySuccess,
    productData,
    productSuccess,
  };
}

export default connect(mapStateToProps, {
  profileView,
  addStoryAction,
  productlistAction,
})(ProfileScreen);
