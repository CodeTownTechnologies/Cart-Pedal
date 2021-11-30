import AsyncStorage from '@react-native-community/async-storage';
import {createStore, applyMiddleware} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';

import thunk from 'redux-thunk';
import rootReducer from './reducers/root.reducer.js';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['ChatlistReducer', 'ConversationListReducer'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const middlewareEnhancer = applyMiddleware(thunk);

export const initStore = () =>
  createStore(persistedReducer, {}, middlewareEnhancer);
export const initPersistor = (store) => persistStore(store);

// const enhancerList = [];
// const devToolsExtension = window && window.__REDUX_DEVTOOLS_EXTENSION__;

// if (typeof devToolsExtension === 'function') {
//   enhancerList.push(devToolsExtension());
// }

// const composedEnhancer = compose(
//   middlewareEnhancer,
//   ...(window.__REDUX_DEVTOOLS_EXTENSION__
//     ? [window.__REDUX_DEVTOOLS_EXTENSION__()]
//     : []),
// );

// export const initStore = () => createStore(rootReducer, {}, composedEnhancer);
