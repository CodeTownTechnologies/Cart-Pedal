/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-alert */
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
  Platform,
} from 'react-native';
import AppConst from '../Component/AppConst';
import AppImageSlider from '../Component/AppImageSlider';
import resp from 'rn-responsive-font';
import AsyncStorage from '@react-native-community/async-storage';
import Toast from 'react-native-simple-toast';
import {Picker} from 'native-base';
import {BASE_URL} from '../Component/ApiClient';
import Spinner from 'react-native-loading-spinner-overlay';
const screenWidth = Dimensions.get('screen').width;

export default class EditProductScreen extends React.Component {
  constructor(props) {
    super(props);
    (this.ProductCategoryCall = this.ProductCategoryCall.bind(this)),
      (this.ProductUnitCall = this.ProductUnitCall.bind(this)),
      (this.AddProductCall = this.AddProductCall.bind(this));
    this.state = {
      userId: '',
      Category: '',
      access_token: '',
      spinner: false,
      Name: '',
      language: '',
      totalPrice: '',
      price: 0,
      Unit: '',
      bunch: '',
      picker: '',
      bunchTrue: '',
      Details_1: '',
      Details_2: '',
      imageItem: '',
      Description: '',
      baseUrl: `${BASE_URL}`,
      CategoryList: [],
      ProductUnit: [],
      productid: [],
      selected1: 'key1',
      fcmToken: '',
      languages: [],
      results: {
        items: [],
      },
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('@user_id').then((userId) => {
      if (userId) {
        this.setState({userId: userId});
      }
    });
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        this.setState({fcmToken: token});
      }
    });
    if (this.props.route.params) {
      if (this.props.route.params.ScreenName == 'ImageHome') {
        this.setState({imageItem:this.props.route.params.image });
      }
    }
    AsyncStorage.getItem('@product_id').then((id) => {
      if (id) {
        this.setState({productid: JSON.parse(id)});
      }
    });
    AsyncStorage.getItem('@access_token').then((access_token) => {
      if (access_token) {
        this.setState({access_token: access_token});
        this.ProductCategoryCall();
        this.ProductUnitCall();
      }
    });
  }

  showLoading() {
    this.setState({spinner: true});
  }

  hideLoading() {
    this.setState({spinner: false});
  }

  CheckTextInput = () => {
    if (this.state.language === '') {
      alert('Please Select Category ');
    } else if (this.state.Name === '') {
      alert('Please Enter Name');
    } else if (this.state.Price === ' ') {
      alert('Please Enter Price');
    } else if (this.state.Unit === '') {
      alert('Please Select Unit');
    } else {
      console.log('add product');
      this.AddProductCall();
    }
  };

  ProductCategoryCall() {
    let urlProduct = `${BASE_URL}api-product/product-category-list`;
    fetch(urlProduct, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.access_token),
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          this.setState({CategoryList: responseData.data});
        } else {
        }
      })
      .catch((error) => {})
      .done();
  }

  ProductUnitCall() {
    var urlProductUnit = `${BASE_URL}api-product/product-unit`;
    fetch(urlProductUnit, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.access_token),
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          this.setState({ProductUnit: responseData.data});
        } else {
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .done();
  }

  AddProductCall = () => {
    this.showLoading();
    let finalPrice;
    let price = this.state.price;
    let totalPrice = this.state.totalPrice;
    if (totalPrice !== '' && this.state.Unit == 7) {
      finalPrice = totalPrice;
    } else {
      finalPrice = price;
    }
    var otpUrl = `${BASE_URL}api-product/add-product`;
    fetch(`${BASE_URL}api-product/add-product`, {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: this.state.fcmtoken,
        device_type: Platform.OS,
        Authorization: JSON.parse(this.state.access_token),
      },
      body: JSON.stringify({
        user_id: this.state.userId,
        name: this.state.Name,
        upload: this.state.imageItem,
        category: this.state.language,
        unit: this.state.Unit,
        price: finalPrice,
        description: this.state.Description,
        bunch: this.state.bunch,
        detailone: this.state.Details_1,
        detailtwo: this.state.Details_2,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          Toast.show(responseData.message);
          let productID = this.state.productid;
          productID.push(responseData.data.id);
          if (this.props.route.params) {
            if (this.props.route.params.productMaster == 'ProductImage') {
              this.hideLoading();
              AsyncStorage.setItem(
                '@productMasterSave',
                JSON.stringify(responseData.data.id),
              ).then((suc) => {
                this.props.navigation.goBack();
              });
            } else {
              this.hideLoading();
              AsyncStorage.setItem(
                '@product_id',
                JSON.stringify(productID),
              ).then((succ) => {
                this.props.navigation.goBack();
              });
            }
          } else {
            this.hideLoading();
            AsyncStorage.setItem('@product_id', JSON.stringify(productID)).then(
              (succ) => {
                this.props.navigation.goBack();
              },
            );
          }
        } else {
          this.hideLoading();
        }
        console.log('product',responseData);
      })
      .catch((error) => {
        this.hideLoading();
      })
      .done();
  };

  pricefunc = (text) => {
    this.setState({price: text});
    this.setState({totalPrice: text});
  };

  bunchFunc = (text) => {
    let price = this.state.price;
    let newPrice = price * text;
    this.setState({totalPrice: newPrice});
    this.setState({bunch: text});
  };

  async SaveProductListData(responseData) {
    await AsyncStorage.setItem('@name', responseData.data.name.toString());
    await AsyncStorage.setItem(
      '@category',
      responseData.data.category.toString(),
    );
    await AsyncStorage.setItem('@unit', responseData.data.unit.toString());
    await AsyncStorage.setItem('@price', responseData.data.price.toString());
    await AsyncStorage.setItem(
      '@description',
      responseData.data.description.toString(),
    );
    await AsyncStorage.setItem('@bunch', responseData.data.bunch.toString());
    await AsyncStorage.setItem(
      '@detailone',
      responseData.data.detailone.toString(),
    );
    await AsyncStorage.setItem(
      '@detailtwo',
      responseData.data.detailtwo.toString(),
    );
  }

  renderInnerImageList(item, index, separators) {
    return (
      <TouchableOpacity activeOpacity={1} style={{flex: 1}}>
        <Image style={styles.imageView} source={{uri: item.path}} />
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={'#fff'} />
        <Spinner
          visible={this.state.spinner}
          color="#F01738"
        />
        <View style={[styles.container, {backgroundColor: '#e3e3e3'}]}>
          <AppImageSlider
            sliderImages={this.state.imageItem}
            rendorImages={(item, index) =>
              this.renderInnerImageList(item, index)
            }
          />
        </View>

        <View style={styles.container2}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <TouchableOpacity
                onPress={() => {
                  this.CheckTextInput();
                }}>
                <Text
                  style={[
                    styles.saveCancelButton,
                    {borderBottomColor: 'green', color: 'green'},
                  ]}>
                  Save
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('ImageHome');
                }}>
                <Text
                  style={[
                    styles.saveCancelButton,
                    {borderBottomColor: 'red', color: 'red', marginStart: 20},
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerStyle}>
              <Picker
                placeholder="Please select category"
                selectedValue={this.state.language}
                style={{height: 50, width: screenWidth - 55}}
                onValueChange={(itemValue, itemIndex) => {
                  if (itemValue != '0') {
                    this.setState({language: itemValue});
                  } else {
                    alert('Please select correct category');
                  }
                }}>
                <Picker.Item label="Please select category" value="0" />
                {this.state.CategoryList.map((item, index) => {
                  return (
                    <Picker.Item
                      label={item.title}
                      value={item.id}
                      key={index}
                    />
                  );
                })}
              </Picker>
            </View>
            <TextInput
              style={styles.input1TextView}
              placeholder={AppConst.inputPH_enter_name}
              onChangeText={(text) => this.setState({Name: text})}
            />
            <TextInput
              style={styles.inputTextView}
              placeholder={AppConst.inputPH_price}
              maxLength={5}
              keyboardType="numeric"
              onChangeText={(price) => {
                this.setState({price});
              }}
              value={this.state.price}
            />
            <View style={styles.pickerStyle}>
              <Picker
                placeholder="Please select unit"
                selectedValue={this.state.Unit}
                style={{height: 50, width: screenWidth - 55}}
                onValueChange={(itemValue, itemIndex) => {
                  if (itemValue != '0') {
                    this.setState({bunchTrue: itemValue});
                    this.setState({Unit: itemValue});
                  } else {
                    alert('Please select correct unit');
                  }
                }}>
                {this.state.ProductUnit.map((item, index) => {
                  return (
                    <Picker.Item
                      label={item.title}
                      value={item.id}
                      key={index}
                    />
                  );
                })}
              </Picker>
            </View>
            {this.state.bunchTrue == 7 ? (
              <TextInput
                style={styles.inputTextView}
                keyboardType={'numeric'}
                placeholder={AppConst.inputPH_bunch}
                value={this.state.bunch}
                onChangeText={(text) => {
                  this.bunchFunc(text);
                }}
              />
            ) : null}
            {this.state.bunchTrue == 7 ? (
              <Text style={styles.TextView}>
                Total Price {this.state.totalPrice}
              </Text>
            ) : null}

            <TextInput
              style={styles.inputTextView}
              placeholder={AppConst.inputPH_detail}
              onChangeText={(text) => this.setState({Details_1: text})}
            />

            <TextInput
              style={styles.inputTextView}
              placeholder={'Details 2'}
              onChangeText={(text) => this.setState({Details_2: text})}
            />
            <Text style={styles.DescriptionStyle}>Description </Text>
            <TextInput
              style={styles.inputTextView}
              multiline={true}
              placeholder={'(Maximum 450 characters)'}
              onChangeText={(text) => this.setState({Description: text})}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  pickerStyle: {
    fontSize: 17,
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 1,
    height: 48,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  ShareTextStyle: {
    color: '#2B2B2B',
    marginLeft: resp(15),
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

  imageView: {
    borderRadius: 5,
    width: screenWidth,
    height: screenWidth,
  },
  DescriptionStyle: {
    marginTop: resp(20),
    fontSize: resp(16),
    color: '#2B2B2B',
    paddingLeft: 15,
  },
  DescriptionStyle2: {
    width: resp(335),
    marginTop: resp(5),
    fontSize: resp(13),
    color: '#000000',
  },
  inputTextView: {
    fontSize: 17,
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 1,
    height: 48,
    paddingLeft: 16,
  },
  TextView: {
    fontSize: 16,
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 1,
    marginLeft: 2,
    height: 40,
    marginTop: 15,
  },
  input1TextView: {
    fontSize: 17,
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 1,
    marginTop: 1,
    height: 48,
    paddingLeft: 16,
  },
  container2: {
    flex: 1,
    marginBottom: resp(20),
    backgroundColor: 'white',
    borderTopStartRadius: 50,
    borderTopEndRadius: 50,
    marginTop: -50,
    paddingTop: 30,
    paddingStart: 30,
    paddingEnd: 30,
    height: resp(-50),
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
  AddIconStyle: {
    margin: resp(5),
  },
  openButtonStyle: {
    color: '#06BE7E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: resp(0),
  },
  ShareContainer: {
    flexDirection: 'row',
    marginTop: resp(10),
    width: '90%',
    height: 50,
  },
  MoreTextStyle: {
    fontWeight: 'bold',
    marginLeft: resp(10),
    fontSize: resp(16),
    color: '#06BE7E',
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
});
