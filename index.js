import 'react-native-gesture-handler'
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
const TAG = "CMMS_INDEX"
 // Register background handler
 import { Platform } from "react-native"

if (!__DEV__ && Platform.OS !== "android") {
  try {
    console = {}
    console.assert = () => {}
    console.info = () => {}
    console.log = () => {}
    console.warn = () => {}
    console.error = () => {}
    console.time = () => {}
    console.timeEnd = () => {}

    global.console = console
  } catch (err) {}
}
 const bgMsgHandler = messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log(TAG,'Message handled in the background!', remoteMessage);
   //  if(remoteMessage && remoteMessage.data && remoteMessage.data.type == "TYPE_CHAT"){

   //  }
//     // if(remoteMessage && remoteMessage.data && remoteMessage.data.type == "TYPE_LOG_OUT"){
//     //     console.log("setBackgroundMessageHandler",remoteMessage)
//     //     try{
//     //     AsyncStorage.removeItem(ASK.ASK_USER)
//     //         // AsyncStorage.clear();
//     //     } catch(err){
//     //     console.log("setBackgroundMessageHandler",{err})

//     //     }
//     // }
   }
   );
  
AppRegistry.registerComponent(appName, () => App);
// AppRegistry.registerheadlesstask('RNFirebaseBackgroundMessage',()=>
// // {
//    // bgMsgHandler,
   // notificationOpenedListener,
//    // initialNotificationListener
// // }
   // )
