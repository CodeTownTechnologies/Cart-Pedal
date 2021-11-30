/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import {
  moreIcon,
  searchIcon,
  contactIcon,
  tickIcon,
  untickIcon,
  submitIcon,
} from '../Component/Images';
import Menu from 'react-native-material-menu';
import AsyncStorage from '@react-native-community/async-storage';
import Toast from 'react-native-simple-toast';
import resp from 'rn-responsive-font';
import Spinner from 'react-native-loading-spinner-overlay';
import {BASE_URL} from '../Component/ApiClient';
const screenWidth = Dimensions.get('screen').width;

export default class ShareWithScreen extends React.Component {
  constructor(props) {
    super(props);
    (this.ContactListall = this.ContactListall.bind(this)),
      (this.state = {
        isAllContactSelect: true,
        userAccessToken: '',
        userId: '',
        currentUserMobile: '',
        contactList: '',
        isAllPublicGrpSelect: true,
        selectAll: '',
        boxname: false,
        nameBox: '',
        data: [],
        AllContact: '',
        selectednumber: [],
        phoneNumber: '',
        ServercontactList: [],
        numberArr: [],
        product_id: '',
        appContacts: '',
        fcmtoken: '',
        nameArrState: [],
        nameDisplayBox: '',
        nameAppcontacts: '',
        showSearch: true,
        masterlist: '',
        groupData: [],
      });
  }

  showLoading() {
    this.setState({spinner: true});
  }

  hideLoading() {
    this.setState({spinner: false});
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.showLoading();
      AsyncStorage.getItem('@fcmtoken').then((token) => {
        if (token) {
          this.setState({fcmtoken: JSON.parse(token)});
        }
      });
      AsyncStorage.getItem('@product_id').then((id) => {
        if (id) {
          this.setState({product_id: JSON.parse(id)});
        }
      });
      AsyncStorage.getItem('@groupData').then((groupData) => {
        if (groupData) {
          let groupItem = this.state.groupData;
          if (groupItem !== undefined && groupItem.length > 1) {
            groupItem.concat(JSON.parse(groupData));
            this.setState({groupData: groupItem});
          } else {
            groupItem = JSON.parse(groupData);
            this.setState({groupData: groupItem});
          }
        }
      });
      AsyncStorage.getItem('@current_usermobile').then((mobile) => {
        if (mobile) {
          this.setState({currentUserMobile: JSON.parse(mobile)});
        }
      });
      AsyncStorage.getItem('@Phonecontacts').then((phone) => {
        if (phone) {
          let phoneID = JSON.parse(phone);
          this.setState({phoneNumber: phoneID});
        }
      });
      AsyncStorage.getItem('@user_id').then((userId) => {
        if (userId) {
          this.setState({userId: userId});
        }
      });
      AsyncStorage.getItem('@access_token').then((accessToken) => {
        if (accessToken) {
          this.setState({userAccessToken: accessToken});

          this.ContactListall();
          this.sendContactToServer();
        }
      });
      setTimeout(() => {
        this.hideLoading();
      }, 3000);
    });
  }
  sendContactToServer = () => {
    var EditProfileUrl = `${BASE_URL}api-product/contact-list`;

    fetch(EditProfileUrl, {
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
        type: 0,
        lfor: 1,
        contacts: this.state.phoneNumber,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          Toast.show(responseData.message);
          let serverContacts = Object.values(responseData.data.contact);
          this.setState({ServercontactList: serverContacts});
        } else {
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .done();
  };

  ContactListall() {
    var EditProfileUrl = `${BASE_URL}api-product/contact-list`;

    fetch(EditProfileUrl, {
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
        type: 0,
        lfor: 1,
        contacts: this.state.phoneNumber,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          let appNO = responseData.data.appcontact;

          let newFormatArray = this.state.groupData.concat(appNO);
          this.setState({contactList: newFormatArray});

          this.setState({masterlist: responseData.data.appcontact});
          let cartPadleContact = [];
          let nameofCartPadle = [];
          responseData.data.appcontact.map((item) => {
            cartPadleContact.push(item.mobile);
            nameofCartPadle.push(item.name);
          });

          this.setState({appContacts: cartPadleContact});
          this.setState({nameAppcontacts: nameofCartPadle});
        } else {
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .done();
  }

  boxname = (items, newItem) => {
    let nameArr = this.state.numberArr;
    let nameArray = this.state.nameArrState;
    if (this.state.numberArr.includes(newItem)) {
      this.setState(
        {numberArr: nameArr.filter((value) => value !== newItem)},
        () => {
          this.numberUpdate();
        },
      );
    } else {
      nameArr.push(newItem);
      this.setState({numberArr: nameArr}, () => {
        this.numberUpdate();
      });
    }
    if (this.state.nameArrState.includes(items)) {
      this.setState(
        {nameArrState: nameArray.filter((item) => item !== items)},
        () => {
          this.nameUpdate();
        },
      );
    } else {
      nameArray.push(items);
      this.setState({nameArrState: nameArray}, () => {
        this.nameUpdate();
      });
    }
  };

  numberUpdate = () => {
    let nameSingle = this.state.numberArr.join(',');
    this.setState({nameBox: nameSingle});
  };

  nameUpdate = () => {
    const arr = this.state.data.map((i) => i.name);
    let nameDisplay = arr.join(',');
    this.setState({nameDisplayBox: nameDisplay});
  };

  selection = (items) => {
    if (this.state.data.length > 0) {
      if (items.mobile && items.name) {
        this.setState({boxname: true}, () => {
          this.boxname(items.name, items.mobile);
        });
      } else {
        this.setState({boxname: true}, () => {
          this.boxname(items, items);
        });
      }
    } else {
      this.setState({boxname: false, nameDisplayBox: ''}, () => {
        this.boxname(items.name, items.mobile);
      });
    }
  };

  selectItem = (value) => {
    let list = this.state.data;
    if (value.mobile) {
      if (list != null) {
        if (this.state.data.includes(value)) {
          this.setState({data: list.filter((item) => item !== value)}, () => {
            this.selection(value);
          });
        } else {
          this.setState({data: [...list, value]}, () => {
            this.selection(value);
            this.tickIcon(value);
          });
        }
      } else {
      }
    } else {
      if (this.state.data.includes(value)) {
        this.setState({data: list.filter((item) => item !== value)}, () => {
          this.selection(value);
        });
      } else {
        list.push(value);
        this.setState({data: list}, () => {
          this.selection(value);
        });
      }
    }
  };

  tickIcon = (items) => {
    let arra = this.state.data;
    let found = arra.some((item) => item == items);

    if (found) {
      return (
        <View>
          <Image source={tickIcon} style={styles.tickIcon} />
        </View>
      );
    } else {
      return (
        <View>
          <Image source={untickIcon} style={styles.tickIcon} />
        </View>
      );
    }
  };

  listItem = () => {
    let commentArr = [];
    commentArr.push(displayText);
    setNewArray(commentArr);
  };

  rendorContactItem(item) {
    return (
      <View style={{marginBottom: 10}}>
        <View style={[styles.upperRowStyle]}>
          <Image source={contactIcon} style={styles.grouptIcon} />
          <TouchableOpacity style={{flex: 1}}>
            <Text style={styles.rowTitle}>{item}</Text>
            <Text style={styles.rowDetail}>I just want to be appriciate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.selectItem(item);
            }}>
            {this.tickIcon(item)}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  rendorContactList(item, index) {
    return (
      <View style={{marginBottom: 10}} key={index}>
        <View style={[styles.upperRowStyle]}>
          <Image source={contactIcon} style={styles.grouptIcon} />
          {item.name ? (
            <TouchableOpacity style={{flex: 1}}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              {item.mobile.length == 13 ? (
                <Text style={styles.rowDetail}>{item.mobile}</Text>
              ) : null}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={{flex: 1}}>
              <Text style={styles.rowTitle}>{item}</Text>
              <Text style={styles.rowDetail}>I just want to be appriciate</Text>
            </TouchableOpacity>
          )}
          {item.name ? (
            <TouchableOpacity
              onPress={() => {
                this.selectItem(item);
              }}>
              {this.tickIcon(item)}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                this.selectItem(item);
              }}>
              {this.tickIcon(item)}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  ShareProductNotRegisteredUser = () => {
    this.showLoading();
    let formData = new FormData();
    formData.append('user_id', this.state.userId);
    formData.append('product_id', this.state.product_id);
    formData.append('contacts', this.state.nameBox);
    var EditProfileUrl = `${BASE_URL}api-product/product-share-msg`;

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
          this.props.navigation.navigate('DashBoardScreen');
        } else {
        }
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  };

  shareProduct = () => {
    let bar = new Promise((resolve, reject) => {
      this.showLoading();
      this.state.product_id.forEach((item) => {
        let formData = new FormData();
        formData.append('user_id', this.state.userId);
        formData.append('type', 0);
        formData.append('product_id', item);
        formData.append('contacts', this.state.nameBox);

        var EditProfileUrl = `${BASE_URL}api-product/product-share`;

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
              AsyncStorage.removeItem('@product_id').then((succ) => {
                console.log(succ);
              });
              resolve(responseData);
            } else {
              if (responseData.message == 'Product already shared.') {
                reject(responseData.message);
              }
              console.log(responseData.data);
            }
          })
          .catch((error) => {
            this.hideLoading();
            console.error(error);
          })
          .done();
      });
    });

    bar.then((responseData) => {
      this.hideLoading();
      Toast.show(responseData.message);
      this.props.navigation.navigate('DashBoardScreen');
    });

    bar.catch((error) => {
      this.hideLoading();
      alert(error);
    });
  };

  openForPublic = () => {
    if (!this.state.isAllContactSelect) {
      this.AllContactFun();
    }
    this.setState({isAllPublicGrpSelect: !this.state.isAllPublicGrpSelect});
    if (this.state.isAllPublicGrpSelect == true) {
      this.setState({
        data: this.state.contactList,
      });
      this.setState({numberArr: this.state.contactList});
      this.setState({boxname: true});
      this.state.contactList.forEach((items) => {
        this.boxname(items.name, items.mobile);
      });
    } else {
      let data = this.state.data;
      const filteredData = data.filter(
        (item) => this.state.contactList.indexOf(item) === -1,
      );
      this.setState({data: filteredData});
      if (filteredData.length === 0) {
        this.setState({boxname: false, nameDisplayBox: '', nameBox: ''});
      }
    }
  };

  searchFilterFunction = (text) => {
    if (text) {
      let combineArray = this.state.contactList.concat(
        this.state.ServercontactList,
      );
      const newData = combineArray.filter(function (item) {
        const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      this.setState({contactList: newData});
    } else {
      this.setState({contactList: this.state.masterlist});
    }
  };

  FlatListItemSeparator = () => {
    return <View style={styles.listItemSeparatorStyle} />;
  };

  AllContactFun = () => {
    if (!this.state.isAllPublicGrpSelect) {
      this.openForPublic();
    }
    this.showLoading();
    let newArrContacts = this.state.contactList.concat(
      this.state.ServercontactList,
    );
    this.setState({isAllContactSelect: !this.state.isAllContactSelect});
    if (this.state.isAllContactSelect == true) {
      this.setState({data: newArrContacts.concat(this.state.appContacts)});
      this.setState({numberArr: newArrContacts});
      this.setState({boxname: true});
      newArrContacts.forEach((items) => {
        if (items.name && items.mobile) {
          this.boxname(items.name, items.mobile);
        } else {
          this.boxname(items.name, items.mobile);
        }
      });
      this.hideLoading();
    } else {
      let data = newArrContacts;
      data.forEach((itemID) => {
        let filterData;
        if (itemID.mobile) {
          filterData = data.filter((value) => value.mobile === itemID.mobile);
          this.setState({data: filterData});
        } else {
          filterData = data.filter((value) => value.mobile === itemID.mobile);
          this.setState({data: filterData});
        }
        if (filterData.length > 0) {
          this.setState({data: []});
          this.setState({boxname: false, nameDisplayBox: ''});
        }
      });
      this.hideLoading();
    }
  };

  render() {
    const rigthMenu = (
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          style={styles.SearchContainer}
          onPress={() => {
            this.setState({showSearch: false});
          }}>
          <Image source={searchIcon} style={styles.SearchIconStyle} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this._menu.show();
          }}>
          <Image source={moreIcon} style={styles.moreMenuIcon} />
        </TouchableOpacity>

        <Menu ref={(ref) => (this._menu = ref)}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginStart: 10,
              marginEnd: 10,
              marginTop: 20,
              marginBottom: 10,
            }}
            onPress={() => {
              this._menu.hide();
              this.props.navigation.navigate('AddGroupMember');
            }}>
            {'Create New Group'}
          </Text>
          <Text
            style={{
              marginStart: 10,
              marginEnd: 10,
              marginBottom: 20,
              fontSize: 13,
            }}
            onPress={() => {
              this._menu.hide();
              this.props.navigation.navigate('AddGroupMember');
            }}>
            {'(for your personol use)'}
          </Text>
        </Menu>
      </View>
    );

    return (
      <SafeAreaView style={styles.mainContainer}>
        <Spinner
          visible={this.state.spinner}
          color="#F01738"
          textStyle={styles.spinnerTextStyle}
        />
        <StatusBar barStyle="dark-content" backgroundColor={'#fff'} />
        {this.state.showSearch ? (
          <View style={styles.headerView}>
            <TouchableOpacity
              style={styles.BackButtonContainer}
              onPress={() => {
                AsyncStorage.removeItem('@product_id').then(() => {
                  this.props.navigation.goBack();
                });
              }}>
              <Image
                source={require('../images/back_blck_icon.png')}
                style={styles.backButtonStyle}
              />
            </TouchableOpacity>
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
            {rigthMenu}
          </View>
        ) : (
          <View style={styles.inputViewStyle}>
            <TouchableOpacity
              style={{marginLeft: 2}}
              onPress={() => {
                this.setState({showSearch: true});
              }}>
              <Image
                source={require('../images/back_blck_icon.png')}
                style={styles.backButtonStyle1}
              />
            </TouchableOpacity>
            <View style={{backgroundColor: '#00000008'}}>
              <TextInput
                placeholder="Search"
                placeholderTextColor="#BEBEBE"
                underlineColorAndroid="transparent"
                style={styles.input}
                onChangeText={(text) => {
                  this.searchFilterFunction(text);
                }}
              />
            </View>
          </View>
        )}
        <View style={{backgroundColor: 'white', paddingTop: 50}}>
          <TouchableOpacity onPress={() => {}} style={styles.selectAllBtn}>
            <Text style={{textAlign: 'center', fontSize: 16}}>Select All</Text>
          </TouchableOpacity>

          <View style={styles.upperRowStyle}>
            <Image source={contactIcon} style={styles.contactIcon} />
            <TouchableOpacity style={{flex: 1}}>
              <Text style={styles.rowTitle}>All Contacts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.AllContactFun();
              }}>
              {this.state.isAllContactSelect ? (
                <Image source={untickIcon} style={styles.tickIcon} />
              ) : (
                <Image source={tickIcon} style={styles.tickIcon} />
              )}
            </TouchableOpacity>
          </View>

          <View
            style={[styles.upperRowStyle, {marginTop: 20, marginBottom: 20}]}>
            <Image source={contactIcon} style={styles.contactIcon} />
            <TouchableOpacity style={{flex: 1}} onPress={() => {}}>
              <Text style={styles.rowTitle}>Open for public</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.openForPublic();
              }}>
              {this.state.isAllPublicGrpSelect ? (
                <Image source={untickIcon} style={styles.tickIcon} />
              ) : (
                <Image source={tickIcon} style={styles.tickIcon} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{flex: 1}}>
          <FlatList
            data={this.state.contactList.concat(this.state.ServercontactList)}
            keyExtractor={(item) => item.StoryImage}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={7}
            renderItem={({item, index}) => this.rendorContactList(item, index)}
          />
        </View>
        {this.state.boxname == true ? (
          <View
            style={{
              backgroundColor: 'white',
              marginTop: 0,
              paddingTop: 20,
              paddingBottom: 60,
            }}>
            <View
              style={{
                position: 'absolute',
                height: 60,
                width: '100%',
                bottom: 0,
                backgroundColor: '#8a1008',
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  this.shareProduct();
                }}
                style={{
                  alignSelf: 'flex-end',
                  marginEnd: 20,
                  position: 'absolute',
                  end: 0,
                  top: -32,
                }}>
                <Image source={submitIcon} style={styles.submitIcon} />
              </TouchableOpacity>

              <Text
                style={{color: 'white', marginStart: 20, marginEnd: 20}}
                numberOfLines={1}>
                {' '}
                {'>'} {this.state.nameDisplayBox}{' '}
              </Text>
            </View>
          </View>
        ) : null}
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
    backgroundColor: '#e3e3e3',
  },
  input: {
    color: '#BEBEBE',
    width: resp(339),
    height: 50,
    fontSize: resp(14),
    alignSelf: 'flex-end',
  },
  inputViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#00000008',
    backgroundColor: '#fff',
    width: '100%',
    marginTop: resp(20),
    alignContent: 'center',
    alignSelf: 'center',
  },
  header: {
    width: '100%',
    height: 50,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  listItemSeparatorStyle: {
    height: 0.5,
    width: '100%',
    backgroundColor: '#C8C8C8',
  },
  SearchContainer: {
    flex: 0,
    backgroundColor: '#fff',
  },
  SearchIconStyle: {
    margin: 1,
    height: 25,
    width: 25,
    alignSelf: 'flex-end',
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
    backgroundColor: 'white',
  },
  backButtonStyle1: {
    margin: 15,
    height: 20,
    width: 20,
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
  TitleContainer: {
    flexDirection: 'row',
    flex: 0.75,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    height: 35,
    width: 35,
    resizeMode: 'contain',
  },

  imageView: {
    borderRadius: 5,
    width: screenWidth,
    height: screenWidth,
  },
  inputTextView: {
    fontSize: 15,
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 1,
    marginTop: 10,
  },
  searchMenuIcon: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
    marginEnd: 5,
  },
  moreMenuIcon: {
    height: 25,
    width: 30,
    resizeMode: 'contain',
    // marginLeft:55,
    // position:'absolute'
  },
  selectAllBtn: {
    backgroundColor: '#e3e3e3',
    width: 100,
    padding: 5,
    borderRadius: 30,
    alignSelf: 'flex-end',
    marginEnd: 20,
  },
  contactIcon: {
    height: 40,
    width: 40,
    resizeMode: 'contain',
    borderRadius: 5,
  },
  grouptIcon: {
    height: 45,
    width: 45,
    resizeMode: 'contain',
    borderRadius: 5,
  },
  rowTitle: {
    fontSize: 16,
    marginStart: 10,
  },
  rowDetail: {
    fontSize: 13,
    marginStart: 10,
    color: 'gray',
  },
  tickIcon: {
    height: 25,
    width: 30,
    resizeMode: 'contain',
    borderRadius: 5,
  },
  upperRowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 20,
    paddingEnd: 20,
  },
  submitIcon: {
    height: 55,
    width: 55,
    resizeMode: 'contain',
  },
});
