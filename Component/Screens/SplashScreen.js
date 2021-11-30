import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import resp from 'rn-responsive-font';
import firebase from 'react-native-firebase';
class SplashScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialPage: '',
      deepLink: false,
      parameters: {},
    };
  }

  showLoading() {
    this.setState({loading: true});
  }

  hideLoading() {
    this.setState({loading: false});
  }

  static navigationOptions = {
    title: 'Splash',
  };

  moveToDeepLink = (url) => {
    const split1 = url.split('?');
    if (split1.length > 1) {
      const split2 = url.split('&');
      if (split2.length > 1) {
        const page = split2[1].split('=')[1];
        if (page === 'OpenForPublicDetail') {
          const id = split2[2].split('=')[1];
          this.props.navigation.navigate(page, {id});
        } else if (page === 'DashBoardScreen') {
          const id = split2[2].split('=')[1];
          this.props.navigation.navigate(page, {id});
        } else if (page === 'ProfileScreen') {
          const id = split2[2].split('=')[1];
          this.props.navigation.navigate(page, {id});
        } else if (page === 'OpenForProfileScreen') {
          const id = split2[2].split('=')[1];
          this.props.navigation.navigate(page, {id});
        } else if (page === 'CartScreen') {
          const id = split2[2].split('=')[1];
          const cartValue = split2[3].split('=')[1];
          this.props.navigation.navigate(page, {id, cartValue});
        } else if (page === 'ProductDetailScreen') {
          const id = split2[2].split('=')[1];
          console.log('UUUUU', split2);
          console.log('UUUUU', id);
          this.props.navigation.navigate(page, {id});
        } else if (page === 'OderPlacedViewScreen') {
          const id = split2[2].split('=')[1];
          const order_id = split2[3].split('=')[1];
          this.props.navigation.navigate(page, {id, order_id});
        } else if (page === 'OrderRecievedViewScreen') {
          const id = split2[2].split('=')[1];
          const order_id = split2[3].split('=')[1];
          this.props.navigation.navigate(page, {id, order_id});
        } else if (page === 'CartViewScreen') {
          const id = split2[2].split('=')[1];
          const order_id = split2[3].split('=')[1];
          this.props.navigation.navigate(page, {id, order_id});
        }
      }
    }
  };

  componentDidMount() {
    this.unsubscribe = firebase.links().onLink((link) => {
      this.moveToDeepLink(link);
    });
    firebase
      .links()
      .getInitialLink()
      .then((url) => {
        if (url) {
          const split1 = url.split('?');
          if (split1.length > 1) {
            const split2 = url.split('&');
            if (split2.length > 1) {
              const page = split2[1].split('=')[1];
              if (page === 'OpenForPublicDetail') {
                const id = split2[2].split('=')[1];
                this.setState({
                  deepLink: true,
                  initialPage: page,
                  parameters: {
                    id,
                  },
                });
              } else if (page === 'DashBoardScreen') {
                const id = split2[2].split('=')[1];
                this.setState({
                  deepLink: true,
                  initialPage: page,
                  parameters: {
                    id,
                  },
                });
              } else if (page === 'ProfileScreen') {
                const id = split2[2].split('=')[1];
                this.setState({
                  deepLink: true,
                  initialPage: page,
                  parameters: {
                    id,
                  },
                });
              } else if (page === 'OpenForProfileScreen') {
                const id = split2[2].split('=')[1];
                this.setState({
                  deepLink: true,
                  initialPage: page,
                  parameters: {
                    id,
                  },
                });
              } else if (page === 'CartScreen') {
                const id = split2[2].split('=')[1];
                const cartValue = split2[3].split('=')[1];
                this.setState({
                  deepLink: true,
                  initialPage: page,
                  parameters: {
                    id,
                    cartValue,
                  },
                });
              } else if (page === 'ProductDetailScreen') {
                const id = split2[2].split('=')[1];
                console.log('UUUUU', split2);
                console.log('UUUUU', id);
                this.setState({
                  deepLink: true,
                  initialPage: page,
                  parameters: {
                    id,
                  },
                });
              } else if (page === 'OderPlacedViewScreen') {
                const id = split2[2].split('=')[1];
                const order_id = split2[3].split('=')[1];
                this.setState({
                  deepLink: true,
                  initialPage: page,
                  parameters: {
                    id,
                    order_id,
                  },
                });
              } else if (page === 'OrderRecievedViewScreen') {
                const id = split2[2].split('=')[1];
                const order_id = split2[3].split('=')[1];
                this.setState({
                  deepLink: true,
                  initialPage: page,
                  parameters: {
                    id,
                    order_id,
                  },
                });
              } else if (page === 'CartViewScreen') {
                const id = split2[2].split('=')[1];
                const order_id = split2[3].split('=')[1];
                console.log('split', split2);
                this.setState({
                  deepLink: true,
                  initialPage: page,
                  parameters: {
                    id,
                    order_id,
                  },
                });
              }
            }
          }
        } else {
          this.props.navigation.addListener('focus', this.load);
        }
      });
    this.props.navigation.addListener('focus', this.load);
  }

  componentWillUnmount() {
    this.unsubscribe();
    clearTimeout(this.timeoutHandle); // This is just necessary in the case that the screen is closed before the timeout fires, otherwise it would cause a memory leak that would trigger the transition regardless, breaking the user experience.
  }

  load = () => {
    this.showLoading();
    this.timeoutHandle = setTimeout(() => {
      AsyncStorage.getItem('@is_login').then(async (isLogin) => {
        const {deepLink, initialPage, parameters} = this.state;
        if (isLogin == undefined || isLogin == '0') {
          if (deepLink) {
            this.setState({deepLink: false, initialPage: '', parameters: {}});
            this.props.navigation.navigate('LoginScreen', {
              initialPage,
              parameters,
            });
          } else {
            this.props.navigation.navigate('LoginScreen');
          }
        } else if (isLogin == '1') {
          if (deepLink) {
            this.setState({deepLink: false, initialPage: '', parameters: {}});
            this.props.navigation.navigate(initialPage, parameters);
          } else {
            this.props.navigation.navigate('DashBoardScreen');
          }
        }
      });
    }, 1000);
  };

  render() {
    return (
      <View style={styles.container}>
        <Image
          source={require('../images/logo_cart_paddle.png')}
          style={styles.ImageView}
        />
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.CartTextStyle}>Cartpedal</Text>
        </View>

        {this.state.loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#F01738" />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  ImageView: {
    height: 150,
    width: 150,
    backgroundColor: 'transparent',
  },
  CartTextStyle: {
    textAlign: 'center',
    marginTop: resp(3),
    fontSize: resp(40),
    color: '#000',
    fontWeight: 'bold',
    height: resp(60),
    width: resp(250),
  },
  loading: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;
