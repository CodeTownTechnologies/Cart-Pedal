/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {CommonActions} from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';

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
  ScrollView,
  Platform,
} from 'react-native';
import resp from 'rn-responsive-font';
import MenuIcon from './MenuIcon';
import Spinner from 'react-native-loading-spinner-overlay';
import SeeMore from 'react-native-see-more-inline';
import firebase from 'react-native-firebase';
import {hp, wp} from '../Component/hightWidthRatio';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob'
let width = Dimensions.get('window').width;
import {BASE_URL} from '../Component/ApiClient';

class GeneralTab extends Component {
  constructor(props) {
    super(props);
    this.RecentShareCall = this.RecentShareCall.bind(this);
    this.AddFavourite = this.AddFavourite.bind(this);
    this.state = {
      RescentProduct: '',
      NoData: '',
      spinner: false,
      userNo: '',
      block_id: '',
      userAccessToken: '',
      favourite: '',
      PhoneNumber: '',
      fcmToken: '',
      currentUserMobile: '',
      appContacts: '',
      redIcon: require('../images/Heart_icon.png'),
      whiteIcon: require('../images/dislike.png'),
      avatar: '',
      pickedImage: require('../images/default_user.png'),
      defaultProfile:'https://miro.medium.com/max/790/1*reXbWdk_3cew69RuAUbVzg.png'
    };
  }
  showLoading() {
    this.setState({spinner: true});
  }

  hideLoading() {
    this.setState({spinner: false});
  }

  ContactListall() {
    AsyncStorage.getItem('@Phonecontacts').then((NumberFormat) => {
      if (NumberFormat) {
        let numID = JSON.parse(NumberFormat);
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
            contacts: numID,
          }),
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
            }
          })
          .catch((error) => {
            this.hideLoading();
          })
          .done();
      }
    });
  }

  async componentDidMount() {
    this.showLoading();

    AsyncStorage.getItem('@Phonecontacts').then((NumberFormat) => {
      if (NumberFormat) {
        let numID = JSON.parse(NumberFormat);
        this.setState({PhoneNumber: numID});
      }
    });

    AsyncStorage.getItem('@current_usermobile').then((mobile) => {
      if (mobile) {
        this.setState({currentUserMobile: JSON.parse(mobile)});
      } else {
      }
    });

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
        this.ContactListall();
      }
    });
  }
  _handleTextReady = () => {};

  ListEmpty = () => {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{marginTop: 120}}>
          {this.state.NoData ? 'No Record' : null}{' '}
        </Text>
      </View>
    );
  };
  AddFavourite(block_id) {
    this.showLoading();
    let id = this.state.userNo;
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
          this.ContactListall();
          this.setState({NoData: false}, () => {
            this.ContactListall();
          });
        } else {
          this.setState({NoData: true});
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  }

  RecentShareCall(contacts) {
    let formData = new FormData();
    formData.append('user_id', this.state.userNo);
    formData.append('type', 0);
    formData.append('public', 1);
    formData.append('contact', contacts);
    var RecentShare = `${BASE_URL}api-user/recent-share`;
    fetch(RecentShare, {
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
          if (responseData.data.length > 0) {
            if (responseData.data[0].avatar == null) {
              this.setState({avatar: ''});
            } else {
              this.setState({avatar: responseData.data[0].avatar});
            }
            this.setState({RescentProduct: responseData.data});
            this.setState({block_id: responseData.data[0].id});
            this.setState({favourite: responseData.data[0].favourite});
          } else {
            this.setState({NoData: true});
          }
        } else {
          this.setState({NoData: true});
        }
      })
      .catch((error) => {
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
          this.ContactListall();
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
  link = async (id,Imagelink) => {
    const link = new firebase.links.DynamicLink(
      'https://cartpedal.page.link?id=in.cartpedal&page=OpenForPublicDetail&profileId=' +
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
        this.base64ImageConvetor(url,Imagelink);
      });
  };
  forwardlink = async (userid,Imagelink) => {
    const link = new firebase.links.DynamicLink(
      'https://cartpedal.page.link?id=in.cartpedal&page=OpenForPublicDetail&profileId=' +
        userid,
      'https://cartpedal.page.link',
    ).android
      .setPackageName('in.cartpedal')
      .ios.setBundleId('com.ios.cartpadle')
      .ios.setAppStoreId('1539321365');

    firebase
      .links()
      .createShortDynamicLink(link)
      .then((url) => {
        this.props.navigation.navigate('ForwardLinkScreen', {
          fcmToken: this.state.fcmToken,
          PhoneNumber: this.state.PhoneNumber,
          userId: this.state.userNo,
          userAccessToken: this.state.userAccessToken,
          msgids: `${url}?&li=${Imagelink}`,
        });
      });
  };
  navigateToSettings = () => {
    this.props.navigation.dispatch(
      CommonActions.navigate({
        name: 'OpenForPublicDetail',
      }),
    );
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
      <SafeAreaView style={styles.container}>
        <Spinner
          visible={this.state.spinner}
          color="#F01738"
          textStyle={styles.spinnerTextStyle}
        />
        <ScrollView>
          <View style={styles.hairline} />

          <FlatList
            style={{flex: 1}}
            data={this.state.RescentProduct}
            keyExtractor={(item) => {
              return item.username;
            }}
            renderItem={({item}) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    this.props.navigation.navigate('OpenForPublicDetail', {
                      id: item.id,
                      name: item.name,
                    });
                  }}>
                  <View style={styles.itemBox}>
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
                            source={
                              item.products[0].image
                                ? {uri: item.products[0].image}
                                : this.state.pickedImage
                            }
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
                          <View style={styles.ImageContainer}>
                            <Image
                              source={
                                item.products[1].image
                                  ? {uri: item.products[1].image}
                                  : this.state.pickedImage
                              }
                              style={styles.ImageContainer}
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
                      </View>
                    </ScrollView>
                    <View style={styles.hairline} />
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={this.ListEmpty}
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
  PersonNameStyle: {
    marginTop: resp(10),
    width: resp(100),
    height: resp(20),
    color: '#000',
    fontWeight: 'bold',
  },
  ProfileDescription: {
    marginLeft: resp(-3),
    width: resp(100),

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
    width: wp(70),
    height: wp(70),
  },
  box: {
    marginTop: resp(5),
    width: wp(415),
    height: hp(75),
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  itemBox: {
    height: hp(375),
    width: width,
    backgroundColor: 'white',
    flexDirection: 'column',
  },
  ProfileImageViewStyle: {
    marginTop: resp(10),

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
    height: hp(190),
    margin: wp(5),
    borderRadius: resp(5),
  },

  card: {
    marginHorizontal: 0,
    borderColor: 'rgba(0,0,0,0)',
    borderWidth: 1,
  },
  spinnerTextStyle: {
    color: '#F01738',
  },
  ProfileInfoContainer: {
    margin: resp(0),
    marginTop: resp(15),
    flexDirection: 'column',
    flex: 0.6,
    backgroundColor: 'white',
    width: resp(5),
    height: resp(70),
  },
  ListMenuContainer: {
    marginTop: resp(20),
    flexDirection: 'row',
    flex: 0.6,
    width: resp(0),
    height: resp(30),
  },
  viewButtonStyle: {
    color: '#000',
    marginRight: resp(-20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: resp(4),
  },
  messageButtonContainer: {
    margin: resp(5),
    marginTop: resp(7),
    width: resp(18),
    height: resp(18),
    borderRadius: resp(50),
    backgroundColor: '#ebced7',
  },
  messageButtonStyle: {
    marginTop: resp(5),
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
    color: '#887F82',
    width: '100%',
    fontSize: resp(14),
    marginLeft: resp(10),
  },

  heartButtonStyle: {
    borderColor: '#F01738',
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

export default GeneralTab;
