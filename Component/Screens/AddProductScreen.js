/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
console.disableYellowBox = true;

import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import resp from 'rn-responsive-font';
import ImagePicker from 'react-native-image-picker';

class AddProductScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pickedImage: null,
    };
  }

  pickImageHandler = () => {
    ImagePicker.openPicker({multiple: true}).then((images) => {
      for (let i = 0; i < images.length; i++) {
        this.state.pickedImage.push(images[i].pickedImage); //image[i].data=>base64 string
      }
    });
  };

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
            <Image
              source={require('../images/logo_cart_paddle.png')}
              style={styles.LogoIconStyle}
            />
            <TouchableOpacity
              style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={styles.TitleStyle}>Cartpedal</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.SearchContainer} />
        </View>

        <View style={styles.MainContentBox}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.ImageContainerStyle}>
              <Image
                source={this.state.pickedImage}
                style={styles.ProductImagesStyle}
              />
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{flex: 1, flexDirection: 'row'}}
              data={this.state.data1}
              keyExtractor={(item) => item.StoryImage}
              renderItem={({item}) => (
                <TouchableWithoutFeedback
                  onPress={() => this.actionOnRow(item)}>
                  <View>
                    <Item2 item={item} />
                  </View>
                </TouchableWithoutFeedback>
              )}
            />
            <View style={styles.ProductAddContainer}>
              <Image
                source={this.state.pickedImage}
                style={styles.AddProductImageStyle}
              />
              <Image
                source={require('../images/close_icon.png')}
                style={styles.CloseIconStyle}
              />

              <TouchableOpacity>
                <View style={styles.CheckMarkContainer}>
                  <Image
                    source={require('../images/check-mark_icon.png')}
                    style={styles.CheckMarkStyle}
                  />
                </View>
              </TouchableOpacity>
              <Image
                source={require('../images/flatin_action_icon.png')}
                style={styles.FloatingActionStyle}
              />
              <TouchableOpacity onPress={this.pickImageHandler}>
                <View style={styles.pulsIconContainer}>
                  <Image
                    source={require('../images/plus_icon.png')}
                    style={styles.PlusIconStyle}
                  />
                </View>
              </TouchableOpacity>
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

  MainContentBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  ImageContainerStyle: {
    width: resp(400),
    height: resp(456),
    borderColor: 'black',
  },
  ProductImagesStyle: {
    width: resp(400),
    height: resp(456),
    backgroundColor: 'red',
  },
  ProductAddContainer: {
    marginTop: resp(2),
    flexDirection: 'row',
    height: resp(130),
    width: resp(400),
  },
  AddProductImageStyle: {
    height: resp(130),
    width: resp(90),
    borderRadius: resp(5),
    backgroundColor: 'yellow',
  },
  FloatingActionStyle: {
    marginTop: 5,
    width: 20,
    height: 20,
    position: 'absolute', //Here is the trick
    bottom: 3,
    left: 65,
  },
  CloseIconStyle: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 16,
    height: 16,
    borderRadius: resp(20),
    backgroundColor: '#9da1a3',
  },
  CheckMarkContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: resp(16),
    height: resp(16),
    borderRadius: resp(20),
    backgroundColor: '#06BE7E',
  },
  CheckMarkStyle: {
    width: resp(8.83),
    height: resp(6.79),
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: resp(5),
    marginTop: resp(5),
  },
  pulsIconContainer: {
    marginTop: resp(15),
    marginLeft: resp(10),
    width: resp(86),
    height: resp(86),
    backgroundColor: '#F2BBC3',
  },
  PlusIconStyle: {
    marginTop: resp(25),
    width: resp(30.31),
    height: resp(30.18),
    alignItems: 'center',
    alignSelf: 'center',
    alignContent: 'center',
  },
});
export default AddProductScreen;
