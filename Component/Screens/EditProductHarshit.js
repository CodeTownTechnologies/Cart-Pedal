/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import resp from 'rn-responsive-font';
import AppConst from '../Component/AppConst';
import {backIconWhite} from '../Component/Images';

const screenWidth = Dimensions.get('screen').width;

export default class EditProductHarshit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imageList: [],
    };

    let param = this.props.route.params;
    if (param && param.images) {
      this.state.imageList = param.images;
    }
  }

  renderInnerImageList(item) {
    return (
      <TouchableOpacity activeOpacity={1} style={{flex: 1}}>
        <Image style={styles.imageView} source={item} />
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={'#fff'} />
        <View style={[styles.container, {backgroundColor: '#e3e3e3'}]}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('StoryViewScreen');
            }}>
            <Image
              style={styles.imageView}
              source={require('../images/productImage5.png')}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.container2}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('StoryViewScreen');
                }}>
                <Text
                  style={[
                    styles.saveCancelButton,
                    {borderBottomColor: 'green', color: 'green'},
                  ]}>
                  Update
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                <Text
                  style={[
                    styles.saveCancelButton,
                    {borderBottomColor: 'red', color: 'red', marginStart: 20},
                  ]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.inputTextView}
              placeholder={AppConst.inputPH_select_cat}
            />
            <TextInput
              style={styles.inputTextView}
              placeholder={AppConst.inputPH_enter_name}
            />
            <TextInput
              style={styles.inputTextView}
              placeholder={AppConst.inputPH_price}
            />
            <TextInput
              style={styles.inputTextView}
              placeholder="Discounted price"
            />
            <TextInput
              style={styles.inputTextView}
              placeholder={AppConst.inputPH_bunch}
            />
            <TextInput
              style={styles.inputTextView}
              placeholder={AppConst.inputPH_detail}
            />
            <Text style={styles.DescriptionStyle}>Description</Text>
            <Text style={styles.DescriptionStyle2}>
              Finish off your wardrobe with this high-end top from Harpa. This
              piece will look fabulously styled with a slim jean for a casual
              Friday in the office.
            </Text>
            <Text style={styles.DescriptionStyle}>Shared With</Text>

            <TouchableOpacity
              style={styles.openButtonContainer}
              onPress={() => {
                this.props.navigation.navigate('');
              }}>
              <Image
                source={require('../images/add_Icon.png')}
                style={styles.AddIconStyle}
              />
              <Text style={styles.openButtonStyle}>Add More</Text>
            </TouchableOpacity>
            <View style={styles.ShareContainer}>
              <TouchableOpacity
                style={styles.ShareButtonContainer}
                onPress={() => {
                  this.props.navigation.navigate('');
                }}>
                <Text style={styles.ShareTextStyle}>20 Public</Text>
                <Image
                  source={require('../images/close_button.png')}
                  style={styles.AddIconStyle}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ShareButtonContainer}
                onPress={() => {
                  this.props.navigation.navigate('');
                }}>
                <Text style={styles.ShareTextStyle}>Add More</Text>
                <Image
                  source={require('../images/close_button.png')}
                  style={styles.AddIconStyle}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ShareButtonContainer}
                onPress={() => {
                  this.props.navigation.navigate('');
                }}>
                <Text style={styles.ShareTextStyle}>Add More</Text>
                <Image
                  source={require('../images/close_button.png')}
                  style={styles.AddIconStyle}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.MoreTextStyle}>More</Text>
          </ScrollView>
        </View>

        <TouchableOpacity
          onPress={() => this.props.navigation.goBack()}
          style={{position: 'absolute', start: 20, top: 30}}>
          <Image source={backIconWhite} style={styles.backIcon} />
        </TouchableOpacity>
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
    flex: 1,
  },

  saveCancelButton: {
    fontSize: 17,
    borderBottomWidth: 1,
  },
  backIcon: {
    height: 35,
    width: 35,
    resizeMode: 'contain',
  },
  container2: {
    flex: 1,
    backgroundColor: 'white',
    borderTopStartRadius: 50,
    borderTopEndRadius: 50,
    marginTop: -50,
    paddingTop: 30,
    paddingStart: 30,
    paddingEnd: 30,
    height: resp(-50),
  },
  openButtonStyle: {
    color: '#06BE7E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: resp(0),
  },
  MoreTextStyle: {
    fontWeight: 'bold',
    marginLeft: resp(10),
    fontSize: resp(16),
    color: '#06BE7E',
  },

  ShareTextStyle: {
    color: '#2B2B2B',
    marginLeft: resp(15),
  },
  openButtonContainer: {
    marginTop: resp(10),
    flexDirection: 'row',
    width: resp(92),
    height: resp(24),
    borderColor: '#06BE7E',
    borderWidth: resp(2),
    borderRadius: resp(20),
    backgroundColor: '#e6f7f2',
  },
  ShareButtonContainer: {
    marginTop: resp(10),
    marginHorizontal: 5,
    flexDirection: 'row',
    width: resp(105),
    height: resp(26),
    borderColor: '#DDDDDD',
    borderWidth: resp(2),
    borderRadius: resp(20),
    backgroundColor: '#7F7F7F1A',
  },
  imageView: {
    borderRadius: 5,
    width: screenWidth,
    height: screenWidth,
  },
  inputTextView: {
    fontSize: 17,
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 1,
    marginTop: 10,
  },
  DescriptionStyle: {
    marginTop: resp(20),
    fontSize: resp(16),
    color: '#2B2B2B',
  },
  DescriptionStyle2: {
    width: resp(335),
    marginTop: resp(5),
    fontSize: resp(13),
    color: '#000000',
  },
  AddIconStyle: {
    margin: resp(5),
  },
  ShareContainer: {
    flexDirection: 'row',
    marginTop: resp(10),
    width: '90%',
    height: 50,
  },
});
