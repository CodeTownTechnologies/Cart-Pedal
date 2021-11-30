import React, {Component} from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import Menu, {MenuItem} from 'react-native-material-menu';
import firebase from 'react-native-firebase';
export default class ImageSelectDialogs extends Component {
  constructor(props) {
    super();
    this.state = {};
  }

  showMenu = () => {
    this._menu.show();
  };
  hideMenu = () => {
    this._menu.hide();
  };

  componentWillUnmount() {}

  openCamera() {
    ImagePicker.openCamera({
      cropping: true,
      includeBase64: true,
    })
      .then((image) => {
        this.hideMenu();
        this.onImagePick(image);
      })
      .catch((error) => {});
  }

  openCameraCoverPhoto() {
    ImagePicker.openCamera({
      width: 420,
      height: 220,
      cropping: true,
      includeBase64: true,
    })
      .then((image) => {
        this.hideMenu();
        this.onImagePick(image);
      })
      .catch((error) => {});
  }

  openGalleryCoverPhoto() {
    ImagePicker.openPicker({
      width: 420,
      height: 220,
      cropping: true,
      includeBase64: true,
      compressImageQuality: 0.4,
    })
      .then((image) => {
        this.hideMenu();
        this.onImagePick(image);
      })
      .catch((error) => {});
  }

  openGallery() {
    ImagePicker.openPicker({
      cropping: true,
      includeBase64: true,
      compressImageQuality: 0.4,
    })
      .then((image) => {
        this.hideMenu();
        this.onImagePick(image);
      })
      .catch((error) => {
        firebase.crashlytics().recordError(error);
      });
  }

  onImagePick(response) {
    if (response.didCancel) {
    } else if (response.error) {
    } else if (response.customButton) {
    } else {
      const source = {uri: response.uri};
      this.props.onImagePick(response);
      this.setState({
        avatarSource: source,
      });
    }
  }

  render() {
    return (
      <Menu ref={(ref) => (this._menu = ref)}>
        <MenuItem
          onPress={() => {
            this.openCamera();
          }}>
          {'Camera'}
        </MenuItem>
        <MenuItem
          onPress={() => {
            this.openGallery();
          }}>
          {'Gallery'}
        </MenuItem>
      </Menu>
    );
  }
}
