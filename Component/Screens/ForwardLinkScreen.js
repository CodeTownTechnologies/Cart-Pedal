/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
console.disableYellowBox = true;
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Platform
} from 'react-native';
import resp from 'rn-responsive-font';
import Spinner from 'react-native-loading-spinner-overlay';
import {Fab, Icon} from 'native-base';
import {BASE_URL} from '../Component/ApiClient';

class ForwardLinkScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      spinner: false,
      toids: [],
      groups: [],
      groupID: [],
    };
  }

  showLoading() {
    this.setState({spinner: true});
  }

  componentDidMount = () => {
    this.getChatList();
  };

  showLoading = () => {
    this.setState({spinner: true});
  };

  hideLoading() {
    this.setState({spinner: false});
  }

  forwardMessages = () => {
    let id = this.state.toids.map(Number);
    let grpid;
    let toid = id.join(',');
    if (this.state.groupID.length > 0) {
      let ids = this.state.groupID.map(Number);
      grpid = ids.join(',');
    } else {
      grpid = 0;
    }
    const {fcmToken, userId, userAccessToken, msgids} = this.props.route.params;

    this.showLoading();
    const data = new FormData();
    data.append('user_id', userId);
    data.append('body', msgids);
    data.append('toids', [
      {id: toid, type: '0'},
      {id: grpid, type: '1'},
    ]);
    data.append('msg_type', 'link');
    var EditProfileUrl = `${BASE_URL}api-message/share-link`;
    fetch(EditProfileUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(userAccessToken),
      },
      body: JSON.stringify({
        user_id: userId,
        body: msgids,
        toids: [
          {id: toid, type: '0'},
          {id: grpid, type: '1'},
        ],
        msg_type: 'link',
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          this.props.navigation.navigate('ChatScreen');
        }
      })
      .catch((error) => {})
      .finally(() => {
        this.hideLoading();
      });
  };

  getChatList = () => {
    const {
      fcmToken,
      PhoneNumber,
      userId,
      userAccessToken,
      msgids,
    } = this.props.route.params;

    this.showLoading();
    var EditProfileUrl = `${BASE_URL}api-product/contact-list`;
    fetch(EditProfileUrl, {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(userAccessToken),
      },
      body: JSON.stringify({
        user_id: userId,
        type: 0,
        lfor: 1,
        contacts: PhoneNumber,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          this.setState({list: responseData.data.appcontact});
          this.setState({groups: responseData.data.groups});
        } else {
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.hideLoading();
      });
  };

  render() {
    const funct = this;

    return (
      <SafeAreaView style={styles.container}>
        <Spinner
          visible={this.state.spinner}
          color="#F01738"
          textStyle={styles.spinnerTextStyle}
        />
        {this.state.toids.length !== 0 && (
          <Fab
            onPress={() => {
              this.forwardMessages();
            }}
            style={{backgroundColor: 'red'}}
            containerStyle={{marginBottom: 32, zIndex: 4}}
            position="bottomRight">
            <Icon name="chevron-forward" />
          </Fab>
        )}
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
              <Text style={styles.TitleStyle}>CartPadle</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.SearchContainer} onPress={() => {}}>
            <Image
              source={require('../images/search.png')}
              style={styles.SearchIconStyle}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.MainContentBox}>
          <ScrollView>
            <View>
              {this.state.list&&this.state.list.map((v, i) => {
                const inList = this.state.toids.indexOf(v.id) !== -1;
                return (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      if (!inList) {
                        this.setState((p) => ({
                          ...p,
                          toids: [...p.toids, v.id],
                        }));
                      } else {
                        this.setState((p) => ({
                          ...p,
                          toids: p.toids.filter((i) => i !== v.id),
                        }));
                      }
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        borderBottomWidth: 1,
                        color: 'grey',
                      }}>
                      <View
                        style={{
                          alignSelf: 'center',
                          width: '95%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: inList ? 'lightgrey' : 'white',
                        }}>
                        <View style={{padding: 10}}>
                          <Image
                            source={
                              v.image
                                ? {uri: v.image}
                                : require('../images/default_user.png')
                            }
                            style={styles.Styleimage}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            width: '84%',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <View>
                            <Text style={styles.PersonNameStyle}>{v.name}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {this.state.groups&&this.state.groups.map((v, i) => {
                const inList = this.state.toids.indexOf(v.grpid) !== -1;
                return (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      if (!inList) {
                        this.setState((p) => ({
                          ...p,
                          toids: [...p.toids, v.grpid],
                          groupID: [...p.groupID, v.grpid],
                        }));
                      } else {
                        this.setState((p) => ({
                          ...p,
                          toids: p.toids.filter((i) => i !== v.grpid),
                          groupID: p.groupID.filter((i) => i !== v.grpid),
                        }));
                      }
                    }}>
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          borderBottomWidth: 1,
                          color: 'grey',
                        }}>
                        <View
                          style={{
                            alignSelf: 'center',
                            width: '95%',
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: inList ? 'lightgrey' : 'white',
                          }}>
                          <View style={{padding: 10}}>
                            <Image
                              source={
                                v.image
                                  ? {uri: v.image}
                                  : require('../images/default_user.png')
                              }
                              style={styles.Styleimage}
                            />
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              width: '84%',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}>
                            <View>
                              <Text style={styles.PersonNameStyle}>
                                {v.name}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
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

  MainContentBox: {
    flex: 1,
  },
  row: {
    color: '#000',
    width: '100%',
    height: 100,
  },
  TabBox: {
    flex: 0.1,
    color: '#000',
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
  LogoIconStyle: {
    margin: 5,
    height: 30,
    width: 30,
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
  SearchContainer: {
    flex: 0.2,
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

  bottomActiveTextStyle: {
    color: '#FB3954',
    fontSize: resp(10),
    marginTop: 5,
    textAlign: 'center',
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
  Styleimage: {
    marginTop: 0,
    width: 60,
    height: 60,
    padding: 15,
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
  bottomVideoTextStyle: {
    color: '#887F82',
    fontSize: resp(8),
    marginRight: 10,
    marginTop: 3,
    textAlign: 'center',
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
  bottomNotificationTextStyle: {
    color: '#887F82',
    fontSize: resp(8),
    marginLeft: 10,
    marginTop: 3,
    textAlign: 'center',
  },
  StyleChatTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  StyleSettingTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabStyle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 60,
    elevation: 20,
    shadowColor: 'grey',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  tabButtonStyle: {
    flex: 0.25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  PersonNameStyle: {
    width: resp(100),
    height: resp(20),
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  PersonNameStyle1: {
    marginTop: resp(8),
    width: resp(100),
    height: resp(20),
    color: 'grey',
    marginLeft: 10,
  },
});

export default ForwardLinkScreen;
