/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  RefreshControl,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import resp from 'rn-responsive-font';
import SeeMore from 'react-native-see-more-inline';
import MenuIcon from './MenuIcon';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage';
import firebase from 'react-native-firebase';
import {BASE_URL} from '../Component/ApiClient';
import {hp, wp} from '../Component/hightWidthRatio';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob'
let width = Dimensions.get('window').width;

class FavouriteTab extends Component {
  constructor(props) {
    super(props);
    this.FavouriteListCall = this.FavouriteListCall.bind(this);
    this.AddFavourite = this.AddFavourite.bind(this);
    this.state = {
      FavouiteProduct: '',
      spinner: false,
      NoData: '',
      block_id: '',
      favourite: '',
      userAccessToken: '',
      refreshing: false,
      fcmToken: '',
      userNo: '',
      redIcon: require('../images/Heart_icon.png'),
      whiteIcon: require('../images/dislike.png'),
      avatar: '',
      pickedImage: require('../images/default_user.png'),
      defaultProfile:'https://miro.medium.com/max/790/1*reXbWdk_3cew69RuAUbVzg.png'
    };
    console.log('this props', JSON.stringify(this.props));
  }

  showLoading() {
    this.setState({spinner: true});
  }

  hideLoading() {
    this.setState({spinner: false});
  }

  _onRefresh() {
    this.setState({refreshing: true});
    this.FavouriteListCall();
  }
  async componentDidMount() {
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

        this.FavouriteListCall();
      }
    });
  }

  ListEmpty = () => {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{marginTop: 120}}>
          {this.state.NoData ? 'No Record' : null}{' '}
        </Text>
      </View>
    );
  };

  actionOnRow(item) {
    console.log('Selected Item :', item);
  }

  _handleTextReady = () => {
    console.log('ready!');
  };

  AddFavourite(item) {
    this.showLoading();
    let id = this.state.userNo;
    let block_id = item.id;
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
          this.FavouriteListCall();
        } else {
          this.setState({NoData: true});
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .done();
  }
  ContactListall() {
    this.showLoading();
    let formData = new FormData();
    formData.append('user_id', this.state.userNo);
    formData.append('type', 0);
    formData.append('contacts', this.state.currentUserMobile);
    var EditProfileUrl = `${BASE_URL}api-product/contact-list`;
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
          this.setState({contactList: responseData.data.appcontact});
          let cartPadleContact = [];
          responseData.data.appcontact.map((item) => {
            cartPadleContact.push(item.mobile);
          });
          let commaNumber = cartPadleContact.join(',');
          this.setState({appContacts: cartPadleContact.join(',')});
          this.RecentShareCall(commaNumber);
        } else {
          this.hideLoading();
          console.log(responseData.data);
        }
      })
      .catch((error) => {
        this.hideLoading();
        console.error(error);
      })
      .done();
  }

  AddProductFav = (item, index) => {
    this.AddFavourite(item);
  };

  data = () => {
    this.setState({NoData: true});
  };

  FavouriteListCall = () => {
    let acessIDtoken;
    let fcmToken;
    let user_id;
    let phoneNumber;
    AsyncStorage.getItem('@Phonecontacts').then((mobile) => {
      if (mobile) {
        phoneNumber = JSON.parse(mobile);
        AsyncStorage.getItem('@user_id').then((userId) => {
          if (userId) {
            user_id = userId;

            AsyncStorage.getItem('@access_token').then((accessToken) => {
              if (accessToken) {
                acessIDtoken = accessToken;
                AsyncStorage.getItem('@fcmtoken').then((token) => {
                  if (token) {
                    fcmToken = token;
                    this.showLoading();
                    var EditProfileUrl = `${BASE_URL}api-product/contact-list`;
                    fetch(EditProfileUrl, {
                      method: 'Post',
                      headers: {
                        'Content-Type': 'application/json',
                        device_id: '1234',
                        device_token: this.state.fcmToken,
                        device_type: Platform.OS,
                        Authorization: JSON.parse(this.state.userAccessToken),
                      },
                      body: JSON.stringify({
                        user_id: this.state.userNo,
                        type: 0,
                        lfor: 0,
                        contacts: phoneNumber,
                      }),
                    })
                      .then((response) => response.json())
                      .then((responseData) => {
                        //   this.hideLoading();
                        if (responseData.code == '200') {
                          //  Toast.show(responseData.message);
                          this.setState({
                            contactList: responseData.data.appcontact,
                          });
                          let cartPadleContact = [];
                          responseData.data.appcontact.map((item) => {
                            cartPadleContact.push(item.mobile);
                          });
                          let commaNumber = cartPadleContact.join(',');
                          console.log('cart padle', cartPadleContact.join(','));
                          this.setState({
                            appContacts: cartPadleContact.join(','),
                          });
                          this.RecentShare(
                            user_id,
                            commaNumber,
                            fcmToken,
                            acessIDtoken,
                          );
                        } else {
                          this.hideLoading();
                        }
                      })
                      .catch((error) => {
                        this.hideLoading();
                      })
                      .done();
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  RecentShare = (user_id, contacts, fcmToken, acessIDtoken) => {
    let formData = new FormData();

    formData.append('user_id', user_id);
    formData.append('type', 1);
    formData.append('public', 1);
    formData.append('contact', contacts);

    var RecentShare = `${BASE_URL}api-user/recent-share`;

    fetch(RecentShare, {
      method: 'Post',
      headers: new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '1234',
        device_token: fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(acessIDtoken),
      }),
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        this.hideLoading();
        if (responseData.code == '200') {
          this.setState({avatar: responseData.data[0].avatar});
          this.setState({FavouiteProduct: responseData.data});
          this.setState({block_id: responseData.data[0].id});
          this.setState({favourite: responseData.data[0].favourite});
          this.setState({favourite: responseData.data[0].favourite});
        } else {
          if (responseData.code == '500') {
            this.setState({FavouiteProduct: ''});
            this.setState({NoData: true});
          }
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .done();
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

  link = async (id,Imagelink) => {
    const link = new firebase.links.DynamicLink(
      'https://cartpedal.page.link?id=in.cartpedal&page=OpenForPublicDetail&profileId=' +
        id,
      'cartpedal.page.link',
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

  forwardlink = async (userid,ImageLink) => {
    const link = new firebase.links.DynamicLink(
      'https://cartpedal.page.link?id=in.cartpedal&page=OpenForPublicDetail&profileId=' +
        userid,
      'cartpedal.page.link',
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
              msgids: `http://${url}?&li=${ImageLink}`,
            });
          }
        });
      });
  };

  SendReportIssue() {
    let formData = new FormData();
    formData.append('user_id', this.state.userNo);
    formData.append('reason', 'Report post');
    formData.append('message', 'Something went wrong with this post');
    var otpUrl = `${BASE_URL}api-user/report-problem`;
    fetch(otpUrl, {
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
          alert(responseData.data);
        } else {
          alert(responseData.message);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .done();
  }

  blockuser = (block_id) => {
    this.showLoading();
    let id = this.state.userNo;
    let formData = new FormData();

    formData.append('user_id', id);
    formData.append('block_id', block_id);
    formData.append('type', 0);

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
        if (responseData.code == '200') {
          alert('User is blocked successfully');
          this.FavouriteListCall();
          this.hideLoading();
        } else {
          this.hideLoading();
        }
        console.log('User user ID==', JSON.stringify(responseData));
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  };

  render() {
    return (
      <SafeAreaView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }>
        <Spinner
          visible={this.state.spinner}
          color="#F01738"
          textStyle={styles.spinnerTextStyle}
        />

        <View style={styles.MainContentBox}>
          <ScrollView>
            <View style={styles.hairline} />
            <FlatList
              style={{flex: 1}}
              data={this.state.FavouiteProduct}
              keyExtractor={(item) => item.personName}
              renderItem={({item, index}) => {
                return (
                  <TouchableOpacity
                    style={styles.itemBox}
                    onPress={() => {
                      this.props.navigation.navigate('OpenForPublicDetail', {
                        id: item.id,
                        name: item.name,
                      });
                    }}>
                    <View style={styles.box}>
                      <View style={styles.ProfileImageContainer}>
                        <Image
                          source={
                            item.avatar == null
                              ? this.state.pickedImage
                              : {uri: item.avatar}
                          }
                          style={styles.ProfileImageViewStyle}
                        />
                      </View>
                      <View style={styles.ProfileInfoContainer}>
                        <Text style={styles.PersonNameStyle}>{item.name}</Text>
                        <View style={{marginLeft: resp(0), width: width * 0.8}}>
                          {item.about ? (
                            <SeeMore
                              numberOfLines={4}
                              linkColor="red"
                              seeMoreText="read more"
                              seeLessText="read less">
                              {item.about.substring(0, 50) + '..'}
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
                              membersCount: 1,
                            });
                          }}>
                          <Image
                            source={require('../images/message_icon.png')}
                            style={styles.messageButtonStyle}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.messageButtonContainer}
                          onPress={() => {
                            this.AddProductFav(item, index);
                          }}>
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
                                  this.state.favourite == 1
                                    ? resp(9)
                                    : resp(20),
                                marginTop:
                                  this.state.favourite == 1 ? resp(4) : resp(0),
                              },
                            ]}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            this.props.navigation.navigate(
                              'OpenForPublicDetail',
                              {id: item.id, name: item.name},
                            );
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
                            marginTop: 3,
                          }}
                          textStyle={{
                            color: 'white',
                          }}
                          option1Click={() => {
                            this.blockuser(item.id);
                          }}
                          option2Click={() => {
                            let image;
                            item.products[0].image
                            ?image= item.products[0].image
                            : image=this.state.defaultProfile
                            this.link(item.id,image);
                          }}
                          option3Click={() => {
                            let image;
                            item.products[0].image
                            ?image= item.products[0].image
                            : image=this.state.defaultProfile
                            this.forwardlink(item.id,image);
                          }}
                          option4Click={() => {
                            this.SendReportIssue();
                          }}
                        />
                      </View>
                    </View>
                    <ScrollView
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}>
                      <View style={styles.columnView}>
                        <View style={styles.ImageContainer}>
                          <Image
                            source={{uri: item.products[0].image}}
                            style={styles.ImageContainer}
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
                          <TouchableOpacity style={styles.ImageContainer}>
                            <Image
                              source={{uri: item.products[1].image}}
                              style={styles.ImageContainer}
                            />
                            <Text style={styles.itemNameStyle}>
                              {item.products[1].name}
                            </Text>
                            <Text style={styles.itemPriceStyle}>
                              {'\u20B9'}
                              {item.products[1].price}
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>

                      {/* <View style={styles.hairline} /> */}
                    </ScrollView>

                    <View style={styles.hairline} />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={this.ListEmpty}
            />
          </ScrollView>
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
  PersonNameStyle: {
    marginTop: resp(10),
    width: resp(100),
    height: resp(20),
    color: '#000',
    fontWeight: 'bold',
  },
  ProfileDescription: {
    marginLeft: resp(-3),
    width: resp(260),
    height: resp(50),
    color: '#7F7F7F',
    fontSize: resp(12),
  },

  ProfileImageContainer: {
    // margin: resp(10),
    marginLeft: wp(5),
    marginTop: hp(10),
    flexDirection: 'column',
    flex: 0.2,
    backgroundColor: 'white',
    width: resp(70),
    height: resp(70),
  },
  box: {
    marginTop: 5,
    width: resp(415),
    height: resp(75),
    backgroundColor: 'white',
    flexDirection: 'row',

    elevation: 0,
  },
  itemBox: {
    height: hp(375),
    backgroundColor: 'white',
    flexDirection: 'column',
    shadowColor: 'black',
    shadowOpacity: resp(0.2),
    shadowOffset: {
      height: resp(1),
      width: resp(5),
    },
    elevation: 0,
  },
  ProfileImageViewStyle: {
    margin: resp(5),
    width: wp(50),
    height: hp(50),
    borderRadius: resp(8),
  },
  RecentTextStyle: {
    fontSize: resp(14),
    marginTop: resp(30),
    marginLeft: resp(10),
    height: resp(50),
    color: '#8E8E8E',
  },
  hairline: {
    backgroundColor: '#C8C7CC80',
    height: 2,
    width: '100%',
  },
  ImageContainer: {
    // marginLeft:wp(5),
    marginTop: resp(-15),
    flexDirection: 'column',
    width: wp(170),
    height: hp(180),
    margin: resp(5),
    borderRadius: resp(5),
  },

  card: {
    marginHorizontal: 0,
    borderColor: 'rgba(0,0,0,0)',
    borderWidth: 1,
  },
  ProfileInfoContainer: {
    margin: resp(0),
    marginLeft: wp(10),
    marginTop: hp(15),
    flexDirection: 'column',
    flex: 0.5,

    width: wp(70),
    height: hp(70),
  },
  ListMenuContainer: {
    marginTop: resp(20),
    flexDirection: 'row',
    flex: 0.5,
    width: resp(0),
    height: hp(30),
  },

  viewButtonStyle: {
    color: '#000',
    marginRight: resp(-20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: resp(4),
  },

  spinnerTextStyle: {
    color: '#F01738',
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
    marginTop: resp(4),
    color: '#F01738',
    width: resp(9),
    height: resp(9),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ViewButtonContainer: {
    width: resp(60),
    height: resp(24),
    backgroundColor: '#fff',
    marginTop: 4,
  },
  columnView: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemNameStyle: {
    width: '100%',
    color: '#887F82',
    fontSize: resp(14),
    marginLeft: resp(10),
  },
  heartButtonStyle: {
    color: '#F01738',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemPriceStyle: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: resp(10),
    fontSize: resp(14),
  },
});
export default FavouriteTab;
