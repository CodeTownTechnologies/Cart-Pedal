import AsyncStorage from '@react-native-community/async-storage';

export const saveFileInCache = async (uri, localPath) => {
  try {
    let list = await AsyncStorage.getItem('FILES');
    if (!list) {
      await AsyncStorage.setItem('FILES', JSON.stringify([{uri, localPath}]));
    } else {
      list = JSON.parse(list);
      list = [...list, {uri, localPath}];
      await AsyncStorage.setItem('FILES', JSON.stringify(list));
    }
  } catch (error) {
    console.log('some error ocurred');
  }
};

export const ListFiles = async () => {
  try {
    let list = await AsyncStorage.getItem('FILES');
    if (!list) {
      return [];
    } else {
      return JSON.parse(list);
    }
  } catch (error) {
    console.log('some error ocurred');
    return [];
  }
};

export const IsFileExist = (list = [], uri) => {
  const index = list.findIndex((item) => item.uri === uri);
  if (index > -1) {
    return list[index];
  } else {
    return null;
  }
};
