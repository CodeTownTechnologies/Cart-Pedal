import React, {Component} from 'react';
console.disableYellowBox = true;

import {
  StyleSheet,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import resp from 'rn-responsive-font';
import ImageModal from 'react-native-image-modal';
let width = Dimensions.get('window').width;

class ProductDetailImageFullView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: this.props.route.params.images,
    };
  }
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.CloseButtonContainerStyles}
          onPress={() => {
            this.props.navigation.goBack();
          }}>
          <Image
            source={require('../images/red_close_icon.png')}
            style={styles.CloseButtonViewStyles}
          />
        </TouchableOpacity>
        <View style={styles.ImageContainer}>
          <ImageModal
            resizeMode="contain"
            imageBackgroundColor="transparent"
            source={
              this.props.route.params.images
                ? {uri: this.props.route.params.images}
                : require('../images/default_user.png')
            }
            style={{width: width, height: resp(500)}}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  CloseButtonContainerStyles: {
    marginTop: resp(30),
    marginRight: resp(50),
    flex: 0.1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
  },
  CloseButtonViewStyles: {
    marginRight: resp(20),
    width: resp(36.1),
    height: resp(36.1),
  },
  ImageContainer: {
    flex: 0.75,
  },
  sliderImageStyle: {
    marginTop: resp(50),
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '99%',
    height: resp(500),
  },
});

export default ProductDetailImageFullView;
