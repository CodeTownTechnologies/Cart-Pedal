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
} from 'react-native';
import resp from 'rn-responsive-font';
import ToggleSwitch from 'toggle-switch-react-native';
class PrivacyScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOnDefaultToggleSwitch: true,
      isOnLargeToggleSwitch: false,
      isOnBlueToggleSwitch: false,
    };
  }
  onToggle(isOn) {}
  render() {
    return (
      <SafeAreaView style={styles.container}>
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
            <TouchableOpacity
              style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={styles.TitleStyle}>Privacy </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.SearchContainer} />
        </View>

        <View style={styles.MainContentBox}>
          <ScrollView>
            <TouchableOpacity style={styles.Profile2Container}>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonNameStyle}>
                  Who can see my personal info
                </Text>
                <Text style={styles.ProfileDescription}>
                  if you don't share your last seen, you won't be able to see
                  other people's Last seen
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.Profile2Container}>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonName2Style}>Last Seen</Text>
                <Text style={styles.ProfileDescription}>Everyone</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.Profile2Container}>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonName2Style}>Profile Photo</Text>
                <Text style={styles.ProfileDescription}>Everyone</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.Profile2Container}>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonName2Style}>About</Text>
                <Text style={styles.ProfileDescription}>Everyone</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.Profile2Container}>
              <View style={styles.Profile2InfoContainer}>
                <Text style={styles.PersonName2Style}>Status</Text>
                <Text style={styles.ProfileDescription}>Everyone</Text>
              </View>
            </TouchableOpacity>

            <ToggleSwitch
              label="Read Receipts"
              labelStyle={{
                marginTop: resp(20),
                width: resp(320),
                color: '#000000E6',
                fontSize: resp(16),
                fontWeight: 'bold',
                marginLeft: resp(20),
              }}
              isOn={this.state.isOnDefaultToggleSwitch}
              onToggle={(isOnDefaultToggleSwitch) => {
                this.setState({isOnDefaultToggleSwitch});
                this.onToggle(isOnDefaultToggleSwitch);
              }}
            />
            <Text style={styles.ReceiptDescription}>
              if turned off, you won't send or receive Read receipts, Read
              receive are always sent for group chat
            </Text>
          </ScrollView>
        </View>
        <View style={styles.TabBox}>
          <View style={styles.tabStyle}>
            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('DashBoardScreen');
              }}>
              <Image
                source={require('../images/home_inactive_icon.png')}
                style={styles.StyleHomeTab}
              />
              <Text style={styles.bottomInactiveTextStyle}>Home</Text>
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
              <Text style={styles.bottomInactiveTextStyle}>Cart</Text>
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
                source={require('../images/setting_active_icon.png')}
                style={styles.StyleSettingTab}
              />
              <Text style={styles.bottomActiveTextStyle}>Setting</Text>
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
  MainContentBox: {
    flex: 1,
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
  PersonNameStyle: {
    marginTop: resp(10),
    width: resp(500),
    height: resp(25),
    color: '#F01738',
    fontSize: resp(16),
  },
  PersonName2Style: {
    marginTop: resp(10),
    width: resp(500),
    height: resp(20),
    color: '#000000E6',
    fontSize: resp(16),
    fontWeight: 'bold',
  },
  ProfileDescription: {
    marginRight: resp(-2),
    width: resp(352),
    height: resp(50),
    color: '#7F7F7F',
    fontSize: resp(12),
  },
  ReceiptDescription: {
    marginLeft: resp(20),
    width: resp(352),
    height: resp(50),
    color: '#7F7F7F',
    fontSize: resp(12),
  },
  Profile2InfoContainer: {
    color: '#fff',
    marginTop: resp(15),
    alignContent: 'center',
    flexDirection: 'column',

    marginLeft: resp(20),
    width: resp(70),
    height: resp(70),
  },
  Profile2Container: {
    height: resp(70),
    color: '#fff',
    flexDirection: 'row',
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
    elevation: 5,
  },
  bottomActiveTextStyle: {
    color: '#FB3954',
    fontSize: resp(10),
    marginTop: 5,
    textAlign: 'center',
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
  StyleOpenForPublicTab: {
    marginTop: 11,
    marginRight: 10,
    width: 38,
    height: 23,
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
});
export default PrivacyScreen;
