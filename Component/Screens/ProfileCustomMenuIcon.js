/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import Menu, {MenuItem} from 'react-native-material-menu';

class ProfileCustomMenuIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addCover: '',
    };
  }

  componentDidMount() {
    this.setState({addCover: this.props.setData});
  }

  _menu = null;
  setMenuRef = (ref) => {
    this._menu = ref;
  };

  showMenu = () => {
    this._menu.show();
  };

  hideMenu = () => {
    this._menu.hide();
  };

  option1Click = () => {
    this._menu.hide();
    this.props.option1Click();
  };

  option2Click = () => {
    this._menu.hide();
    this.props.option2Click();
  };

  option3Click = () => {
    this._menu.hide();
    this.props.option3Click();
  };

  option4Click = () => {
    this._menu.hide();
    this.props.option4Click();
  };

  render() {
    return (
      <View style={this.props.menustyle}>
        <Menu
          ref={this.setMenuRef}
          button={
            <TouchableOpacity onPress={this.showMenu}>
              <Image
                source={{
                  uri:
                    'https://raw.githubusercontent.com/AboutReact/sampleresource/master/menu_icon.png',
                }}
                style={{
                  width: 20,
                  height: 20,
                  marginLeft: 4,
                  marginTop: 4,
                }}
              />
            </TouchableOpacity>
          }>
          <MenuItem onPress={this.option1Click}>View Cover Photo</MenuItem>
          <MenuItem onPress={this.option3Click}>Edit Cover Photo</MenuItem>
        </Menu>
      </View>
    );
  }
}

export default ProfileCustomMenuIcon;
