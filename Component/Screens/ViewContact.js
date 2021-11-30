import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import resp from 'rn-responsive-font';
import Contacts from 'react-native-contacts';
import Toast from 'react-native-simple-toast';
import {Button} from 'native-base';

const ViewContact = ({
  navigation,
  route: {
    params: {contact},
  },
}) => {
  const addContact = () => {
    Contacts.openContactForm(contact)
      .then((res) => {
        Toast.show('Contact Saved');
      })
      .catch(() => {
        Toast.show('Some Error');
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerView}>
        <View style={styles.BackButtonContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
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
            <Text style={styles.TitleStyle}> View Contact</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.SearchContainer} />
      </View>
      <View style={styles.row}>
        <Image
          source={
            contact.hasThumbnail
              ? {uri: contact.thumbnailPath}
              : require('../images/default_user.png')
          }
          style={styles.Styleimage}
        />
        <Text
          numberOfLines={2}
          style={{
            width: '48%',
            fontSize: 18,
            fontWeight: 'bold',
          }}>
          {contact.givenName + ' ' + contact.familyName}
        </Text>
        <View>
          <Button
            onPress={addContact}
            style={{
              backgroundColor: 'red',
              width: 80,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
              Add
            </Text>
          </Button>
        </View>
      </View>
      {contact.phoneNumbers &&
        contact.phoneNumbers.map((i) => (
          <View style={styles.row1}>
            <View style={{width: 60}} />
            <View style={{width: '52%'}}>
              <Text style={{fontSize: 16}}>{i.number}</Text>
              <Text style={{fontSize: 16, color: 'grey'}}>{i.label}</Text>
            </View>
            <View style={{width: 80}} />
          </View>
        ))}
    </SafeAreaView>
  );
};

export default ViewContact;

const styles = StyleSheet.create({
  row: {
    backgroundColor: 'white',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '4%',
    paddingVertical: '5%',
    borderBottomColor: 'grey',
    borderBottomWidth: 0.25,
  },
  row1: {
    backgroundColor: 'white',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '8%',
    paddingVertical: '5%',
    borderBottomColor: 'grey',
    borderBottomWidth: 0.25,
  },
  Styleimage: {
    alignSelf: 'flex-start',
    marginTop: 2,
    width: 60,
    height: 60,
    padding: 15,
  },
  SearchContainer: {
    flex: 0.2,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F6F9FE',
  },
  headerView: {
    paddingVertical: '3.6%',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 20,
    borderBottomColor: 'grey',
    borderBottomWidth: 0.3,
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
});
