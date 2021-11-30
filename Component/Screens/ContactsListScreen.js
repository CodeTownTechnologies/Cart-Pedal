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
  Platform,
} from 'react-native';
import resp from 'rn-responsive-font';
import Spinner from 'react-native-loading-spinner-overlay';
import Contacts from 'react-native-contacts';
import {Button, Header, Icon, Input, Item} from 'native-base';

class ContactsListScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      spinner: false,
      searching: false,
      text: '',
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

  getChatList = () => {
    this.showLoading();
    Contacts.getAll().then((contacts) => {
      this.setState({list: contacts});
      this.hideLoading();
    });
  };

  render() {
    const funct = this;
    const filteredData = this.state.list.filter((i) =>
      `${i.givenName} ${i.familyName}`.includes(this.state.text),
    );
    return (
      <SafeAreaView style={styles.container}>
        <Spinner
          visible={this.state.spinner}
          color="#F01738"
          textStyle={styles.spinnerTextStyle}
        />
        {this.state.searching ? (
          <Header
            androidStatusBarColor="#F01738"
            style={{backgroundColor: '#F01738'}}
            searchBar
            rounded>
            <Item>
              <TouchableOpacity
                onPress={() => this.setState({searching: false})}>
                <Image
                  source={require('../images/back_blck_icon.png')}
                  style={styles.backButtonStyle}
                />
              </TouchableOpacity>
              <Input
                autoFocus
                onChangeText={(text) => this.setState({text})}
                value={this.state.text}
                placeholder="Search"
              />
            </Item>
            <Button transparent>
              <Text>Search</Text>
            </Button>
          </Header>
        ) : (
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
            <TouchableOpacity
              style={styles.SearchContainer}
              onPress={() => {
                this.setState({searching: true});
              }}>
              <Image
                source={require('../images/search.png')}
                style={styles.SearchIconStyle}
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.MainContentBox}>
          <ScrollView keyboardShouldPersistTaps="always">
            <View>
              {filteredData.map(function (v, i) {
                if (v.phoneNumbers.length === 0) {
                  return null;
                }
                return (
                  <TouchableOpacity
                    onPress={() => {
                      funct.props.route.params.sendContact(v);
                      funct.props.navigation.goBack();
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
                          backgroundColor: 'white',
                          width: '95%',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <View style={{padding: 10}}>
                          <Image
                            source={
                              v.hasThumbnail
                                ? {uri: v.thumbnailPath}
                                : require('../images/default_user.png')
                            }
                            style={styles.Styleimage}
                          />
                        </View>
                        <View
                          style={{
                            backgroundColor: 'white',
                            flexDirection: 'row',
                            width: '84%',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <View>
                            <Text style={styles.PersonNameStyle}>
                              {v.givenName + ' ' + v.familyName}
                            </Text>
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
    shadowColor: '#ecf6fb',
    elevation: 20,
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

export default ContactsListScreen;
