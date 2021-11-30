import {Container, Content, Text} from 'native-base';
import React, {Component, StyleSheet} from 'react-native';

export default class myTheme extends Component {
  render() {
    return (
      <StyleProvider style={getTheme()}>
        <Container>
          {' '}
          │ │
          <Content theme={myTheme}>
            <View style={styles.headerView}>
              <View style={styles.BackButtonContainer}>
                <TouchableOpacity
                  onPress={() => {
                    this.props.navigation.navigate('SplashScreen');
                  }}>
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
                  // this.props.navigation.navigate('SearchBarScreen')
                }}></TouchableOpacity>
            </View>
          </Content>
        </Container>{' '}
        │
      </StyleProvider>
    );
  }
}
const styles = StyleSheet.create({
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
  TitleContainer: {
    flexDirection: 'row',
    flex: 0.6,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
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
});
