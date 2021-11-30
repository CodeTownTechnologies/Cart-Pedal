/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {Container, TabHeading, Tab, Tabs} from 'native-base';
import CartPlaceScreen from './CartPlaceScreen';
import OderPlacedScreen from './OderPlacedScreen';
import OderReceivedScreen from './OderReceivedScreen';
console.disableYellowBox = true;

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import resp from 'rn-responsive-font';
import {connect} from 'react-redux';
import OfflineUserScreen from './OfflineUserScreen';

class CartScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onChangeRefreshTab = (value) => {
    if (value == 1) {
      this.orderPlace.CartListCall();
    }
    if (value == 0) {
      this.cartOrder.CartListCall();
    }
    if (value == 2) {
      this.orderReceived.CartListCall();
    }
  };
  render() {
    if (!this.props.isConnected) {
      return <OfflineUserScreen />;
    }
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerView}>
          <View style={styles.BackButtonContainer} />
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
              this.props.navigation.navigate('FliterScreen');
            }}>
            <Text style={styles.FLiterStyle}>Filter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.MainContentBox}>
          <Container>
            <Tabs
              tabBarUnderlineStyle={{backgroundColor: '#F01738'}}
              tabBarActiveTextColor={'red'}
              onChangeTab={(i) => {
                this.onChangeRefreshTab(i.i);
              }}
              tabBarInactiveTextColor="#7F7F7F">
              <Tab
                heading={
                  <TabHeading style={{backgroundColor: '#fff'}}>
                    <Text style={{fontWeight: 'bold', fontSize: resp(14)}}>
                      Cart{' '}
                    </Text>
                  </TabHeading>
                }>
                <CartPlaceScreen
                  ref={(ref) => (this.cartOrder = ref)}
                  navigation={this.props.navigation}
                />
              </Tab>
              <Tab
                heading={
                  <TabHeading style={{backgroundColor: '#fff'}}>
                    <Text style={{fontWeight: 'bold', fontSize: resp(14)}}>
                      Order Placed
                    </Text>
                  </TabHeading>
                }>
                <OderPlacedScreen
                  ref={(ref) => (this.orderPlace = ref)}
                  navigation={this.props.navigation}
                />
              </Tab>
              <Tab
                heading={
                  <TabHeading style={{backgroundColor: '#fff'}}>
                    <Text style={{fontWeight: 'bold', fontSize: resp(14)}}>
                      Order Received
                    </Text>
                  </TabHeading>
                }>
                <OderReceivedScreen
                  ref={(ref) => (this.orderReceived = ref)}
                  navigation={this.props.navigation}
                />
              </Tab>
            </Tabs>
          </Container>
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
                source={require('../images/cart_bag_active_icon.png')}
                style={styles.styleChartTab}
              />
              <Text style={styles.bottomActiveTextStyle}>Cart</Text>
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

  LogoIconStyle: {
    margin: 5,
    height: 30,
    width: 30,
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
  FLiterStyle: {
    color: '#2B2B2B',
    fontSize: resp(16),
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
    elevation: 0,
  },

  bottomActiveTextStyle: {
    color: '#FB3954',
    fontSize: resp(10),
    marginTop: 5,
    marginLeft: 8,
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

const mapStateToProps = (state) => {
  return {isConnected: state.network.isConnected};
};

export default connect(mapStateToProps, null)(CartScreen);
