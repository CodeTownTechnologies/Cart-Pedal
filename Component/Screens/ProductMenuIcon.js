import React, {Component} from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import Menu, {MenuItem} from 'react-native-material-menu';

class ProductMenuIcon extends Component {
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
                style={{width: 20, height: 20, tintColor: 'black'}}
              />
            </TouchableOpacity>
          }>
          {/* <MenuItem onPress={this.option1Click}>Unshow</MenuItem> */}
          <MenuItem onPress={this.option2Click}>Share Link</MenuItem>
          <MenuItem onPress={this.option3Click}>Forward Link</MenuItem>
          <MenuItem onPress={this.option4Click}>Edit</MenuItem>
        </Menu>
      </View>
    );
  }
}

export default ProductMenuIcon;
