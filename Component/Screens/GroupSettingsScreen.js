/* eslint-disable react-native/no-inline-styles */
import {Body, List, ListItem, Text} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  Platform,
} from 'react-native';
import resp from 'rn-responsive-font';
import RadioForm from 'react-native-simple-radio-button';
import AsyncStorage from '@react-native-community/async-storage';
import {BASE_URL} from '../Component/ApiClient';

const radio_props = [
  {label: 'All participants', value: 0},
  {label: 'Only admins', value: 1},
];

const GroupSettingsScreen = ({
  navigation,
  route: {
    params: {
      isupdate,
      msgsend,
      groupId,
      changeMessageSettings,
      changeUpdateSettings,
    },
  },
}) => {
  const [userId, setUserId] = useState();
  const [accessToken, setAccessToken] = useState();
  const [fcmToken, setFcmToken] = useState('1234');
  const [groupInfo, setGroupInfo] = useState(false);
  const [sendMessage, setSendMessage] = useState(false);
  const [groupInfoFlag, setGroupInfoFlag] = useState(isupdate);
  const [sendMessageFlag, setSendMessageFlag] = useState(msgsend);

  const update = (type, param) => {
    let data = {user_id: userId, type, groupid: groupId};
    if (type == '8') {
      data = {...data, is_update: `${param}`, is_send: `${sendMessageFlag}`};
    }
    if (type == '9') {
      data = {...data, is_send: `${param}`, is_update: `${groupInfoFlag}`};
    }

    var url = `${BASE_URL}api-message/update-group`;
    fetch(url, {
      method: 'Post',
      headers: {
        'Content-Type': 'multipart/form-data',
        device_id: '1234',
        device_token: fcmToken,
        device_type: Platform.OS,
        Authorization: JSON.parse(accessToken),
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          if (type == '8') {
            changeUpdateSettings(param);
          }
          if (type == '9') {
            changeMessageSettings(param);
          }
        } else {
        }
      })
      .catch((error) => {})
      .done();
  };

  useEffect(() => {
    AsyncStorage.getItem('@user_id').then((userId) => {
      if (userId) {
        setUserId(userId);
      }
    });

    AsyncStorage.getItem('@fcmtoken').then((token) => {
      if (token) {
        setFcmToken(token);
      }
    });

    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        setAccessToken(accessToken);
      }
    });
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
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
            <Text style={styles.TitleStyle}>Group Settings</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.SearchContainer} />
      </View>
      <List>
        <ListItem
          onPress={() => setGroupInfo(true)}
          style={{backgroundColor: 'white', width: '100%', marginLeft: 0}}>
          <Body>
            <Text>Edit group info</Text>
            <Text note>All Participants</Text>
          </Body>
        </ListItem>
        <View style={{paddingHorizontal: '4%', paddingVertical: '2%'}}>
          <Text note>
            Choose who can change this group's subject, icon, description and
            disappearing messages setting.
          </Text>
        </View>
        <ListItem
          onPress={() => setSendMessage(true)}
          style={{
            backgroundColor: 'white',
            width: '100%',
            marginLeft: 0,
            marginTop: 8,
          }}>
          <Body>
            <Text>Send messages</Text>
            <Text note>All Participants</Text>
          </Body>
        </ListItem>
      </List>
      <Modal animationType="slide" transparent={true} visible={groupInfo}>
        <View style={styles.centeredView}>
          <View style={styles.modal}>
            <Text style={{fontWeight: 'bold'}}>Edit Group Info</Text>
            <Text style={{marginTop: 4}}>
              Choose who can change this group's subject, icon, description and
              disappearing messages setting.
            </Text>
            <View style={{marginTop: 16}}>
              <RadioForm
                animation={true}
                buttonColor="#F01738"
                selectedButtonColor="#F01738"
                radio_props={radio_props}
                initial={groupInfoFlag}
                onPress={(value) => {
                  update(8, value);
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: 136,
                alignSelf: 'flex-end',
                justifyContent: 'space-between',
                paddingHorizontal: '4%',
                marginTop: 20,
              }}>
              <Text
                onPress={() => setGroupInfo(false)}
                style={{color: '#F01738'}}>
                CANCEL
              </Text>
              <Text
                onPress={() => setGroupInfo(false)}
                style={{color: '#F01738'}}>
                OK
              </Text>
            </View>
          </View>
        </View>
      </Modal>
      <Modal animationType="slide" transparent={true} visible={sendMessage}>
        <View style={styles.centeredView}>
          <View style={styles.modal2}>
            <Text style={{fontWeight: 'bold'}}>Send Messages</Text>
            <Text style={{marginTop: 4}}>
              Choose who can send messages to this group.
            </Text>
            <View style={{marginTop: 16}}>
              <RadioForm
                animation={true}
                buttonColor="#F01738"
                selectedButtonColor="#F01738"
                radio_props={radio_props}
                initial={sendMessageFlag}
                onPress={(value) => {
                  update(9, value);
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: 136,
                alignSelf: 'flex-end',
                justifyContent: 'space-between',
                paddingHorizontal: '4%',
                marginTop: 20,
              }}>
              <Text
                onPress={() => setSendMessage(false)}
                style={{color: '#F01738'}}>
                CANCEL
              </Text>
              <Text
                onPress={() => setSendMessage(false)}
                style={{color: '#F01738'}}>
                OK
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default GroupSettingsScreen;

const styles = StyleSheet.create({
  modal: {
    height: 256,
    width: '84%',
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 16,
  },
  modal2: {
    height: 236,
    width: '84%',
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
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
