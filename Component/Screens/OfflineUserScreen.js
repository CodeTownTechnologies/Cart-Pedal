/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/core';
import {Button, Icon} from 'native-base';
import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import resp from 'rn-responsive-font';

const OfflineUserScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.parent}>
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
            <Text style={styles.TitleStyle}>Cartpedal</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.SearchContainer} onPress={() => {}} />
      </View>
      <View
        style={{
          flex: 0.9,
          backgroundColor: '#2196F3',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Icon
          type="MaterialCommunityIcons"
          name="lightning-bolt-outline"
          style={{color: 'white', fontSize: 96}}
        />
        <Text style={{color: 'white', fontSize: 24}}>
          Looks Like You Are Offline !!
        </Text>
        <Button
          style={{
            alignSelf: 'center',
            marginTop: 24,
            borderRadius: 6,
            paddingHorizontal: 6,
            backgroundColor: 'white',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            width: '60%',
          }}
          onPress={() => navigation.navigate('ChatScreen')}>
          <Text
            style={{color: '#2196F3', paddingLeft: '8%', fontWeight: 'bold'}}>
            Move To Chat Section
          </Text>
          <Icon
            type="MaterialCommunityIcons"
            name="arrow-right"
            style={{color: '#2196F3', fontSize: 24, fontWeight: 'bold'}}
          />
        </Button>
      </View>
    </View>
  );
};

export default OfflineUserScreen;

const styles = StyleSheet.create({
  parent: {flex: 1, justifyContent: 'center', alignItems: 'center'},
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
  LogoIconStyle: {
    margin: 5,
    height: 30,
    width: 30,
  },
  SearchContainer: {
    flex: 0.2,
    backgroundColor: '#fff',
  },
  backButtonStyle: {
    margin: 10,
    height: 20,
    width: 20,
  },
});
