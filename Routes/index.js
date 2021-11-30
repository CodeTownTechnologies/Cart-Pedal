import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from '../Component/Screens/SplashScreen';
import LoginScreen from '../Component/Screens/LoginScreen';
import ForgotPasswordScreen from '../Component/Screens/ForgotPasswordScreen';
import SignUPScreen from '../Component/Screens/SignUPScreen';
import ResetPasswordScreen from '../Component/Screens/ResetPasswordScreen';
import SignUPWithOtpScreen from '../Component/Screens/SignUPWithOtpScreen';
import PhoneScreen from '../Component/Screens/PhoneScreen';
import ForgetOtpScreen from '../Component/Screens/ForgetOtpScreen';
import DashBoardScreen from '../Component/Screens/DashBoardScreen';
import StoryViewScreen from '../Component/Screens/StoryViewScreen';
import ProfileScreen from '../Component/Screens/ProfileScreen';
import UserStoryPage from '../Component/Screens/UserOwnStoryPage';
import ForwardLinkScreen from '../Component/Screens/ForwardLinkScreen';
import UploadCoverPhotoScreen from '../Component/Screens/UploadCoverPhotoScreen';
import CartScreen from '../Component/Screens/CartScreen';
import OpenForPublicScreen from '../Component/Screens/OpenForPublicScreen';
import AddProductScreen from '../Component/Screens/AddProductScreen';
import EditProductScreen from '../Component/Screens/EditProductScreen';
import ProductDetailScreen from '../Component/Screens/ProductDetailScreen';
import ShareWithScreen from '../Component/Screens/ShareWithScreen';
import CartViewScreen from '../Component/Screens/CartViewScreen';
import OderPlacedViewScreen from '../Component/Screens/OderPlacedViewScreen';
import AccountScreen from '../Component/Screens/AccountScreen';
import BackUpChats from '../Component/Screens/BackUpChats';
import HelpScreen from '../Component/Screens/HelpScreen';
import NotificationsScreen from '../Component/Screens/NotificationsScreen';
import OpenForProfileScreen from '../Component/Screens/OpenForProfileScreen';
import OpenForPublicDetail from '../Component/Screens/OpenForPublicDetail';
import FliterScreen from '../Component/Screens/FliterScreen';
import UpdateProductScreen from '../Component/Screens/UpdateProductScreen';
import FullViewProfileScreen from '../Component/Screens/fullViewProfileScreen';
import AddGroupMember from '../Component/Screens/AddGroupMember';
import ImageHome from '../Component/Screens/ImageHome';
import ProductDetailImageFullView from '../Component/Screens/ProductDetailImageFullView';
import ChatDetailScreen from '../Component/Screens/ChatDetailScreen';
import ProfileStory from '../Component/Screens/ProfileStory';
import ViewProfileScreen from '../Component/Screens/ViewProfileScreen';
import ProductListScreen from '../Component/Screens/ProductListScreen';
import AddMoreShare from '../Component/Screens/addMoreShare';
import MyWebComponent from '../Component/Screens/webViewReactnative';
import FaqWebPanel from '../Component/Screens/faqWebPanel';
import AppInfo from '../Component/Screens/AppInfo';
import Contactus from '../Component/Screens/Contactus';
import CartDetailsScreen from '../Component/Screens/CartDetailsScreen';
import OrderRecievedViewScreen from '../Component/Screens/OrderReceviedViewScreen';
import SettingScreen from '../Component/Screens/SettingScreen';
import SettingFullView from '../Component/Screens/SettingFullView';
import {VideoProcessScreen} from '../Component/Screens/VideoProcessScreen';
import ContactsListScreen from '../Component/Screens/ContactsListScreen';
import ProductMasterUpdate from '../Component/Screens/ProductMaster';
import NewContactListScreen from '../Component/Screens/NewContactListScreen';
import ForwardMessageScreen from '../Component/Screens/ForwardMessageScreen';
import ProductMasterImage from '../Component/Screens/ProductMasterImageSharingPage';
import ChatScreen from '../Component/Screens/ChatScreen';
import ChatProfile from '../Component/Screens/chatProfile';
import ChatGroupListScreen from '../Component/Screens/ChatGroupList';
import ProvideGroupName from '../Component/Screens/ProvideGroupName';
import GroupProfile from '../Component/Screens/GroupProfile';
import ChangePassword from '../Component/Screens/ChangePassword';
import AdminReport from '../Component/Screens/AdminReport';
import ReportIssue from '../Component/Screens/ReportIssue';
import ProductMasterSaveScreen from '../Component/Screens/ProductMatserSaveScreen';
import ViewContact from '../Component/Screens/ViewContact';
import {ViewAll} from '../Component/Screens/ViewAll';
import EditImageUpdateProduct from '../Component/Screens/EditImageUpdateProduct';
import VideoCall from '../Component/Screens/VideoCall';
import VoiceCall from '../Component/Screens/voiceCall';
import BlockedUsers from '../Component/Screens/BlockedUsers';
import ProductListScreen2 from '../Component/Screens/ProductListScreen2';
import GroupSettingsScreen from '../Component/Screens/GroupSettingsScreen';
import MessageInfoScreen from '../Component/Screens/MessageInfoScreen';
import PostScreen from '../Component/Screens/PostScreen';
const Stack = createStackNavigator();

export function MainStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="MessageInfoScreen" component={MessageInfoScreen} />

      <Stack.Screen name="ViewContact" component={ViewContact} />
      <Stack.Screen name="ViewAll" component={ViewAll} />
      <Stack.Screen name="BlockedUsers" component={BlockedUsers} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <Stack.Screen name="SignUPScreen" component={SignUPScreen} />
      <Stack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
      />
      <Stack.Screen
        name="SignUPWithOtpScreen"
        component={SignUPWithOtpScreen}
      />
      <Stack.Screen name="PhoneScreen" component={PhoneScreen} />
      <Stack.Screen name="ForgetOtpScreen" component={ForgetOtpScreen} />
      <Stack.Screen name="DashBoardScreen" component={DashBoardScreen} />
      <Stack.Screen name="StoryViewScreen" component={StoryViewScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="UserStoryPage" component={UserStoryPage} />
      <Stack.Screen
        name="FullViewProfileScreen"
        component={FullViewProfileScreen}
      />
      <Stack.Screen name="ImageHome" component={ImageHome} />
      <Stack.Screen name="EditProductScreen" component={EditProductScreen} />
      <Stack.Screen name="ForwardLinkScreen" component={ForwardLinkScreen} />
      <Stack.Screen
        name="UploadCoverPhotoScreen"
        component={UploadCoverPhotoScreen}
      />
      <Stack.Screen
        name="OpenForPublicScreen"
        component={OpenForPublicScreen}
      />
      <Stack.Screen name="AddProductScreen" component={AddProductScreen} />
      <Stack.Screen name="ProfileStory" component={ProfileStory} />
      <Stack.Screen name="UpdateProduct" component={UpdateProductScreen} />
      <Stack.Screen name="ShareWithScreen" component={ShareWithScreen} />
      <Stack.Screen
        name="OpenForProfileScreen"
        component={OpenForProfileScreen}
      />
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
      <Stack.Screen
        name="OpenForPublicDetail"
        component={OpenForPublicDetail}
      />
      <Stack.Screen
        name="ProductDetailScreen"
        component={ProductDetailScreen}
      />
      <Stack.Screen
        name="ProductDetailImageFullView"
        component={ProductDetailImageFullView}
      />
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen
        name="OderPlacedViewScreen"
        component={OderPlacedViewScreen}
      />
      <Stack.Screen
        name="OrderRecievedViewScreen"
        component={OrderRecievedViewScreen}
      />
      <Stack.Screen name="CartViewScreen" component={CartViewScreen} />
      <Stack.Screen name="CartDetailsScreen" component={CartDetailsScreen} />
      <Stack.Screen name="SettingFullView" component={SettingFullView} />
      <Stack.Screen name="AccountScreen" component={AccountScreen} />
      <Stack.Screen name="ProductListScreen" component={ProductListScreen} />
      <Stack.Screen name="ProductListScreen2" component={ProductListScreen2} />
      <Stack.Screen
        name="ProductMasterUpdate"
        component={ProductMasterUpdate}
      />
      <Stack.Screen name="ProductMasterImage" component={ProductMasterImage} />
      <Stack.Screen
        name="ProductMasterSaveScreen"
        component={ProductMasterSaveScreen}
      />
      <Stack.Screen name="BackUpChats" component={BackUpChats} />
      <Stack.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
      />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="HelpScreen" component={HelpScreen} />
      <Stack.Screen name="FaqWebPanel" component={FaqWebPanel} />
      <Stack.Screen name="AppInfo" component={AppInfo} />
      <Stack.Screen name="Contactus" component={Contactus} />
      <Stack.Screen name="MyWebComponent" component={MyWebComponent} />
      <Stack.Screen name="AdminReport" component={AdminReport} />
      <Stack.Screen name="ReportIssue" component={ReportIssue} />
      <Stack.Screen name="AddMoreShare" component={AddMoreShare} />
      <Stack.Screen name="FliterScreen" component={FliterScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="ChatDetailScreen" component={ChatDetailScreen} />

      <Stack.Screen name="VoiceCallScreen" component={VoiceCall} />
      <Stack.Screen name="VideoCallScreen" component={VideoCall} />

      <Stack.Screen name="ChatProfile" component={ChatProfile} />
      <Stack.Screen
        name="ChatGroupListScreen"
        component={ChatGroupListScreen}
      />
      <Stack.Screen name="GroupProfile" component={GroupProfile} />
      <Stack.Screen
        name="GroupSettingsScreen"
        component={GroupSettingsScreen}
      />

      <Stack.Screen
        name="NewContactListScreen"
        component={NewContactListScreen}
      />
      <Stack.Screen name="VideoProcessScreen" component={VideoProcessScreen} />
      <Stack.Screen name="AddGroupMember" component={AddGroupMember} />
      <Stack.Screen name="ContactsListScreen" component={ContactsListScreen} />
      <Stack.Screen name="ViewProfileScreen" component={ViewProfileScreen} />
      <Stack.Screen
        name="ForwardMessageScreen"
        component={ForwardMessageScreen}
      />
      <Stack.Screen name="ProvideGroupName" component={ProvideGroupName} />
      <Stack.Screen
        name="EditImageUpdateProduct"
        component={EditImageUpdateProduct}
      />
      <Stack.Screen name="PostScreen" component={PostScreen} />
    </Stack.Navigator>
  );
}
