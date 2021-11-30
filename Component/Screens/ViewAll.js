/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import resp from 'rn-responsive-font';
import Feather from 'react-native-vector-icons/Feather';
import ImageModal from 'react-native-image-modal';
import {DocumentDirectoryPath, downloadFile} from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Spinner from 'react-native-loading-spinner-overlay';
import {IsFileExist, ListFiles, saveFileInCache} from '../utils/FilesCaching';
import {Tab, Tabs} from 'native-base';

export const ViewAll = (props) => {
  const {width} = useWindowDimensions();
  const [downloading, setDownloading] = useState(false);
  const [FILES, SETFILES] = useState([]);
  const data = props.route.params.items;
  const downloadAndOpenDocument = async (uri) => {
    if (!uri.includes('http')) {
      FileViewer.open(uri, {
        showOpenWithDialog: true,
      });
    } else {
      const parts = uri.split('/');
      const fileName = parts[parts.length - 1];
      setDownloading(true);
      downloadFile({
        fromUrl: uri,
        toFile: `${DocumentDirectoryPath}/${fileName}`,
      })
        .promise.then(() => {
          saveFileInCache(uri, `${DocumentDirectoryPath}/${fileName}`);
          SETFILES((p) => [
            ...p,
            {
              uri,
              localPath: `${DocumentDirectoryPath}/${fileName}`,
            },
          ]);
          FileViewer.open(`${DocumentDirectoryPath}/${fileName}`, {
            showOpenWithDialog: true,
          });
        })
        .catch(() => alert('could not open file'))
        .finally(() => {
          setDownloading(false);
        });
    }
  };

  useEffect(() => {
    const foo = async () => {
      const FILES = await ListFiles();
      SETFILES(FILES);
    };
    foo();
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1}}>
        <Spinner
          visible={downloading}
          color="#F01738"
          textStyle={styles.spinnerTextStyle}
        />
        <View style={styles.headerView}>
          <View style={styles.BackButtonContainer}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
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
              <Text style={styles.TitleStyle}>CartPadle</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.SearchContainer} />
        </View>
        <Tabs tabBarUnderlineStyle={{backgroundColor: 'red'}}>
          <Tab
            heading="Media"
            tabStyle={{backgroundColor: 'white'}}
            activeTabStyle={{backgroundColor: 'white'}}
            activeTextStyle={{color: 'red'}}>
            <FlatList
              numColumns={3}
              data={data}
              renderItem={({item}) => {
                const isFileExist = IsFileExist(FILES, item.attachment);
                return (
                  <View style={{flexDirection: 'row'}}>
                    {item.type == 'image' ? (
                      <ImageModal
                        resizeMode="contain"
                        style={{
                          width: width / 3.2,
                          height: width / 3.2,
                          borderRadius: 8,
                          margin: '1%',
                          marginVertical: 4,
                        }}
                        imageBackgroundColor="transparent"
                        source={{uri: item.attachment}}
                      />
                    ) : item.type == 'video' ? (
                      <TouchableOpacity
                        onPress={() => {
                          if (isFileExist) {
                            downloadAndOpenDocument(isFileExist.localPath);
                          } else {
                            downloadAndOpenDocument(item.attachment);
                          }
                        }}
                        style={{
                          width: width / 3.2,
                          height: width / 3.2,
                          backgroundColor: 'red',
                          margin: '1%',
                          marginVertical: 4,
                          borderRadius: 8,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Feather name="video" color="#fff" size={18} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              }}
            />
          </Tab>
          <Tab
            heading="Document"
            tabStyle={{backgroundColor: 'white'}}
            activeTabStyle={{backgroundColor: 'white'}}
            activeTextStyle={{color: 'red'}}>
            <FlatList
              numColumns={3}
              data={data}
              renderItem={({item}) => {
                const isFileExist = IsFileExist(FILES, item.attachment);
                return (
                  <View style={{flexDirection: 'row'}}>
                    {item.type == 'file' ? (
                      <TouchableOpacity
                        style={{
                          width: width / 3.2,
                          height: width / 3.2,
                          backgroundColor: 'red',
                          margin: '1%',
                          marginVertical: 4,
                          borderRadius: 8,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        onPress={() => {
                          if (isFileExist) {
                            downloadAndOpenDocument(isFileExist.localPath);
                          } else {
                            downloadAndOpenDocument(item.attachment);
                          }
                        }}>
                        <Feather name="file" color="#fff" size={18} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              }}
            />
          </Tab>
        </Tabs>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  row: {
    color: '#000',
    width: '100%',
    height: 100,
  },
  TabBox: {
    flex: 0.1,
    color: '#000',
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
    margin: '1%',
    height: 30,
    width: 30,
  },
  SearchIconStyle: {
    margin: '1%',
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
  SearchContainer: {
    flex: 0.2,
    backgroundColor: '#fff',
  },
  headerView: {
    height: '8%',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 20,
  },

  bottomActiveTextStyle: {
    color: '#FB3954',
    fontSize: resp(10),
    marginTop: 5,
    textAlign: 'center',
  },

  bottomInactiveTextStyleChart: {
    color: '#887F82',
    fontSize: resp(10),
    marginTop: 3,
    marginLeft: 8,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  bottomInactiveTextStyle: {
    color: '#887F82',
    fontSize: resp(10),
    marginTop: 3,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  StyleHomeTab: {
    marginTop: 5,
    width: 30,
    height: 28,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  Styleimage: {
    marginTop: 0,
    width: 60,
    height: 60,
    padding: 15,
  },
  StyleOpenForPublicTab: {
    marginTop: 11,
    marginRight: 10,
    width: 38,
    height: 23,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomVideoTextStyle: {
    color: '#887F82',
    fontSize: resp(8),
    marginRight: 10,
    marginTop: 3,
    textAlign: 'center',
  },
  styleChartTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    marginLeft: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNotificationTextStyle: {
    color: '#887F82',
    fontSize: resp(8),
    marginLeft: 10,
    marginTop: 3,
    textAlign: 'center',
  },
  StyleChatTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  StyleSettingTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabStyle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 60,
    shadowColor: '#ecf6fb',
    elevation: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', //Here is the trick
    bottom: 0,
  },
  tabButtonStyle: {
    flex: 0.25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  PersonNameStyle: {
    width: resp(100),
    height: resp(20),
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  PersonNameStyle1: {
    marginTop: resp(8),
    width: resp(100),
    height: resp(20),
    color: 'grey',
    marginLeft: 10,
  },
});
