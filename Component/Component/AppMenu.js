import React, {Component} from 'react';
import {View, TouchableOpacity} from 'react-native';
import Menu, {MenuItem} from 'react-native-material-menu';

class AppMenu extends Component {
  constructor(props) {
    super(props);
  }

  option4Click = () => {
    this._menu.hide();
    this.props.option4Click();
  };

  showMenu = () => {
    this._menu.show();
  };
  hideMenu = () => {
    this._menu.hide();
  };

  render() {
    const menuOptions = [];
    for (let i = 0; i < this.props.menuOptions.length; i++) {
      menuOptions.push(
        <MenuItem
          onPress={() => {
            this.props.menuOptions[i].callback();
          }}>
          {this.props.menuOptions[i].title}
        </MenuItem>,
      );
    }
    return (
      <View style={this.props.menustyle}>
        <Menu
          ref={(ref) => (this._menu = ref)}
          button={
            <TouchableOpacity
              style={this.props.buttonStyle}
              activeOpacity={1}
              onPress={() => this.showMenu()}>
              {this.props.menuButton}
            </TouchableOpacity>
          }>
          {menuOptions}
        </Menu>
      </View>
    );
  }
}

export default AppMenu;
