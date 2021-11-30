/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {backIcon, logo} from '../Component/Images';
import AppConst from '../Component/AppConst';

export default class AppHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentWillMount() {}

  render() {
    return (
      <View
        style={[
          styles.header,
          this.props.headerStyle ? this.props.headerStyle : {},
        ]}>
        <TouchableOpacity>
          <Image source={backIcon} style={styles.backIcon} />
        </TouchableOpacity>

        <View style={styles.centerRow}>
          <Image source={logo} style={styles.headerLogo} />
          <Text style={styles.headerTitle}>{AppConst.AppName}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            position: 'absolute',
            end: 0,
            alignSelf: 'center',
          }}>
          {this.props.rigthMenu ? this.props.rigthMenu : null}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 50,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerLogo: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backIcon: {
    height: 22,
    width: 22,
    resizeMode: 'contain',
    position: 'absolute',
    start: 10,
    alignSelf: 'center',
  },
  centerRow: {
    flexDirection: 'row',
  },
});
