import React,{useEffect} from 'react';
import {
  SafeAreaView,
  StatusBar,
} from 'react-native';
import NavigationContainerCmms from './navigation/NavigationContainerCmms';
import { Provider } from 'react-redux';
import store from './store';
import CmmsColors from './common/CmmsColors';
import SplashScreen from 'react-native-splash-screen'
import messaging, { firebase } from '@react-native-firebase/messaging';
import ErrorPage from './pages/ErrorPage';

const TAG = "CMMS_APP"
function App() {
  // console.log(TAG,'App_page');
  
  
  useEffect(()=>{
    // console.log(TAG,"useEffect")
    SplashScreen.hide()
  },[])

  // messaging().onMessage()
  
  return (
    <Provider store={store}>
      <StatusBar 
      barStyle="default"
      translucent 
      />
      <SafeAreaView
        style={{ flex: 1}}
        >
          {/* <ErrorPage/> */}
          {/* <LoginScreen/> */}
         <NavigationContainerCmms />
      </SafeAreaView>
    </Provider>
  );
};


export default App;
