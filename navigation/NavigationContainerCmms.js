import React,{useEffect,useState,useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Image,
  ImageBackground,
  TouchableOpacity,
  Alert,
  AppState,
  Dimensions
} from 'react-native';
import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { NavigationContainer,useNavigation,StackActions, CommonActions, useFocusEffect,useRoute, } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TechHomeScreen from '../pages/Technician/home/TechHomeScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoginScreen from '../pages/login/LoginScreen';
import CmmsColors from '../common/CmmsColors';
import TodayJobOrderIssued from '../pages/Technician/components/TodayJobOrderIssued'
import JobOrderReport from '../pages/Technician/components/JobOrderReport'
import AdditionalSpareParts from '../pages/Technician/components/AdditionalSpareParts'
import ActivityDetails from '../pages/Technician/components/ActivityDetails'
import requestWithEndUrl from '../network/request';
import { API_SUPERVISOR, API_TECHNICIAN } from '../network/api_constants';
import Spinner from 'react-native-loading-spinner-overlay';
import { useSelector, useDispatch } from 'react-redux';
import CMMSSplashScreen from '../pages/CMMSSplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../pages/supervisor/HomeScreen';
import SparepartsRequired from '../pages/Technician/components/SparepartsRequired'
import JobOderAssignment from '../pages/supervisor/job_oder/job_assignment/JobOderAssignment';
// import TechnicianDetails from '../pages/supervisor/Technician/TechnicianDetails';
import TechnicianDetails from '../pages/supervisor/Technician/TechnicianDetails';
import TSparepartsRequired from '../pages/supervisor/Technician/TSparePartsRequired';
import ActivityListPage from '../pages/supervisor/job_oder/job_assignment/ActivityListPage';
import { actionSetTech, actionSetTechList } from '../action/ActionTechnician';
import { actionSetAppTextData, actionSetSelectedLng } from '../action/ActionAppText';
import { actionSetLoading, actionSetRefreshing } from '../action/ActionSettings';
import ErrorPage from '../pages/ErrorPage';
import EmergencyJobOrders from '../pages/supervisor/job_oder/EmergencyJobOrders';
import { SvgCss,SvgFromXml,SvgXml } from 'react-native-svg';
import { xmlLogo } from '../common/SvgIcons';
import Notes from '../pages/Technician/home/Notes';
import MHistory from '../pages/Technician/home/MHistory';
import messaging, { firebase } from '@react-native-firebase/messaging';
import { actionSetChartData, actionSetJobListCnt, actionSetJobOrderList } from '../action/ActionRealTimeData';
import { actionSetLoginData } from '../action/ActionLogin';
import ASK from '../constants/ASK';
import resetNavigation from './resetNavigation';
import { parse, format } from 'date-fns';
import SplashScreen from 'react-native-splash-screen';
import ChatComposePage from '../pages/chat/ChatComposePage';
import ChatHistoryPage from '../pages/chat/ChatHistoryPage';
import { withHeight } from '../common/utils';
import CheckListPage from '../pages/check-list/CheckListPage';

const screenWidth = Dimensions.get("window").width;
const Stack = createStackNavigator();
const TAG = "NavigationContainerCmms";

export default () => {

  console.log(TAG,"default",{screenWidth})
  // const usenavigation = useNavigation();
  const navigationRef = useRef();
  // const route = useRoute();
  // console.log({route})
  const appState = useRef(AppState.currentState);
  const {AppTextData,selectedLng} = useSelector(state =>{
    return state.AppTextViewReducer
  } )
  const { loggedUser } = useSelector(state => state.LoginReducer)
  console.log({loggedUser});
  const { isLoading } = useSelector(state => state.SettingsReducer)
  const [isError,setIsError] = useState(false)
  const [appStateVisible, setAppStateVisible] = useState(appState);

  const {jobOrderList} = useSelector(state => state.RealTimeDataReducer)
  const { TechList } = useSelector(state => state.TechnicianReducer)

  const dispatch = useDispatch()
  var eventListenerSubscription;
  // const resetAction = StackActions.reset({
  //   index: 0,
  //   actions: [CommonActions.navigate({ routeName: 'Login' })],
  // });
  // messaging().setBackgroundMessageHandler(async remoteMessage => {
  //   console.log('Message handled in the background!','NavigationContainer', remoteMessage);
  //   // if(remoteMessage && remoteMessage.data && remoteMessage.data.type == "TYPE_LOG_OUT"){
  //   //     console.log("setBackgroundMessageHandler",remoteMessage)
  //   //     try{
  //   //     AsyncStorage.removeItem(ASK.ASK_USER)
  //   //         // AsyncStorage.clear();
  //   //     } catch(err){
  //   //     console.log("setBackgroundMessageHandler",{err})

  //   //     }
  //   // }
  //  }
  //  );

  // useEffect(()=>{
  //   // const unsubscribe = messaging().onMessage(async remoteMessage => {
  //   //   console.log(TAG,'Message handled in the foreground!', remoteMessage);
  //   //     handleFirebaseMsgFg(remoteMessage)
  //   //   });
  //     // ()=>{
  //     //   unsubscribe;
  //     //   // backgroundMessageHandler;
  //     // }
  // },[TechList,jobOrderList])

  const _handleAppStateChange = nextAppState => {
    // console.log("_handleAppStateChange",{nextAppState,appState:appState.current,routelenght:navigationRef?.current.getRootState().index})
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!',{loggedUser});
      // messaging().noremoveAllDeliveredNotifications()
      if(!loggedUser ){
      dispatch(actionSetLoading(true))
      AsyncStorage.getItem(ASK.ASK_USER)
            .then(res => {
              console.log("_handleAppStateChange","ASK_USER",{res})
              if(res){
                const loggedUser = JSON.parse(res)
                dispatch(actionSetLoginData(loggedUser))
              dispatch(actionSetLoading(false))
              }    
              else throw Error("Login Expired")
              
            })
            .catch(err=>{
              console.log("_handleAppStateChange_err: ",{err})
              dispatch(actionSetLoading(false))
              const currentPage = navigationRef?.current?.getCurrentRoute()?.name
              console.log({currentPage})
              // navigationRef.current?.dispatch(resetAction)
              // if(currentPage!= 'Login')
              // navigationRef.current?.dispatch(
              //   CommonActions.reset({
              //     index: 0,
              //     routes: [
              //       { name: 'Login' },
                    
              //     ],
              //   })
              // );
            })
          } 
    }
    appState.current = nextAppState;
    setAppStateVisible(appState.current);
    return false;
  };

  // useFocusEffect(
  //   React.useCallback(() => {
  //     alert('Screen was focused');
  //     // Do something when the screen is focused
  //     return () => {
  //       alert('Screen was unfocused');
  //       // Do something when the screen is unfocused
  //       // Useful for cleanup functions
  //     };
  //   }, [])
  // );
  
  useEffect(() => {
    //on mount
     const eventListenerSubscription = AppState.addEventListener('change', _handleAppStateChange);
    return () => {
      // on unmount
      eventListenerSubscription?.remove();
    };
  }, []);

  useEffect(() => {
      updateToken()
       // If using other push notification providers (ie Amazon SNS, etc)
    // you may need to get the APNs token instead for iOS:
    // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }
    // Listen to whether the token changes
    messaging().onTokenRefresh(async token => {
      console.log("fcm_token: ",'onTokenRefresh',token)
    const exstAsToken = await AsyncStorage.getItem(ASK.ASK_TOKEN)
      if(exstAsToken!=token){
        AsyncStorage.setItem(ASK.ASK_TOKEN,token)   
      }
      if(loggedUser){
        updateTokenInDb(exstAsToken,token)
      }
      //update token in server db if user loggedin
      // saveTokenToDatabase(token);
    });
   

  }, []);

  useEffect(() => {
    console.log('NavigationContainer_page','useEffect',jobOrderList);
    setLangauge()
  // messaging().onNotificationOpenedApp(async remoteMessage => {
  //   console.log('onNotificationOpenedApp', remoteMessage);
  //   switch(remoteMessage.data.type){
  //     case 'TYPE_LOG_OUT':
  //       // AsyncStorage.removeItem(ASK.)
  //       AsyncStorage.removeItem(ASK.ASK_USER)
  //     // usenavigation.dispatch(StackActions.replace('splash'))
  //     navigationRef.current?.dispatch(StackActions.replace('splash'))
  //       break;
  //       default:alert("Invalid notification");break;
  //   }
  // })
   
  }, [jobOrderList,TechList,AppState]);
  
  useEffect(()=>{
    //http://213.136.84.57:4545/api/ApkTechnician/getMacManMobileAppTextData?Language=ar
    requestWithEndUrl(`${API_TECHNICIAN}getMacManMobileAppTextData`,{Language:selectedLng.Languagevalue})
    .then(res => {
      console.log("getMacManMobileAppTextData",{res})
      if (res.status != 200) {
        throw Error(res.statusText);
      }
      return res.data;
    })
    .then(data => {
      console.log("getMacManMobileAppTextData",{data})
      // actionSetRefreshing(true)
      dispatch(actionSetAppTextData(data))
    })
    .catch(err=>{
      console.error({err})
      setIsError(true)
    //   console.error("getMacManMobileAppTextData",err)
    //   alert(`${AppTextData.txt_lng_error}`)
    //   dispatch(actionSetSelectedLng({
    //     Language:"English",
    //     Languagevalue:"en"
    // }))
    })
  },[selectedLng.Languagevalue])

function setLangauge(){
    AsyncStorage.getItem('selectedLng')
    .then(data=>{
     console.log("AsyncStorage_selectedLngValue: ",{data})
     data && dispatch(actionSetSelectedLng(JSON.parse(data)))
    }).catch(err=>{
      console.log("AsyncStorage_selectedLngValue: ",{err})
    })
  }



function updateTokenInDb(exstAsToken,token){
  requestWithEndUrl(`${API_TECHNICIAN}getExistingTokenInDb`,
  {TechnicianID:loggedUser.TechnicianID})
        .then(res => {
          console.log("getExistingTokenInDb",{res})
          if (res.status != 200) {
            throw Error(res.statusText);
          }
          return res.data;
        })
        .then(data => {
          console.log("getExistingTokenInDb",{data})
          if(data == exstAsToken && token!=data){
            requestWithEndUrl(`${API_TECHNICIAN}refreshClientToken`,{TechnicianID:loggedUser.TechnicianID,Token:token})
            .then(res => {
              console.log("refreshClientToken",{res})
              if (res.status != 200) {
                throw Error(res.statusText);
              }
              return res.data;
            })
            .then(data => {
    
            })
            .catch(err=>{
              console.log("refreshClientToken",{err})
            })
          }
        })
        .catch(err=>{
          console.log("getExistingTokenInDb",{err})

        })
        
}


const  updateToken = async()=>{
  console.log("NavigationContainer","updateToken")
  const loggedUser = await AsyncStorage.getItem(ASK.ASK_USER)
  const exstAsToken = await AsyncStorage.getItem(ASK.ASK_TOKEN)
        console.log("messaging","KEY_USER: ",loggedUser)
        var parsedLoggedUser = null
        if(loggedUser){
          parsedLoggedUser = JSON.parse(loggedUser)
          console.log({parsedLoggedUser})
          // haslogin
          // if(parsedLoggedUser){
          //   if(exstAsToken){
          //     const tokenInDb ;
          //     if(tokenInDb&&exstAsToken!=tokenInDb) requestWithEndUrl(`${API_SUPERVISOR}refreshClientToken`,{TechnicianID:loggedUser.TechnicianID,Token:token})
          //   }
          // }
          dispatch(actionSetLoginData(parsedLoggedUser))
        }
  // Get the device token
    messaging()
    .getToken()
    .then(async token => {
        console.log("messaging","token: ",token)
        if(exstAsToken!=token){
          AsyncStorage.setItem(ASK.ASK_TOKEN,token)   
        }
        try{
        if(loggedUser){
          updateTokenInDb(exstAsToken,token)
          // if(tokenInDb&&exstAsToken!=tokenInDb) requestWithEndUrl(`${API_SUPERVISOR}refreshClientToken`,{TechnicianID:loggedUser.TechnicianID,Token:token})
          
        }
        
      }catch(err){

      }
      
      // return saveTokenToDatabase(token);
    })
    .catch(err=>console.error("TOKEN: ",err));
}

  return (
    <>
      <Spinner
        visible={isLoading}
        textContent={'Loading...'}
        textStyle={{ color: 'white' }}
      />
      { isError ? <ErrorPage/> : <NavigationContainer ref={navigationRef}>
        <Stack.Navigator  initialRouteName="splash">

          <Stack.Screen name="splash"
            component={CMMSSplashScreen}
            options={({ route, navigation }) => ({
              headerTransparent: true,
              title: null,
              // headerTitle: props => <Image
              //   style={{ height: 100, width: 140, alignSelf: 'center' }}
              //   source={require('../assets/logo/ic_logo.png')}
              // />,
              // headerLeft: null,
              // headerStyle: {
              //   backgroundColor: CmmsColors.darkRed,
              //   height: 130
              // },
            })
            }
          />

          <Stack.Screen name="ActivityDetails"
            component={ActivityDetails}
            options={({ route, navigation }) => ({
              title: AppTextData.txt_Activity_Details,
              headerTintColor:CmmsColors.logoBottomGreen,
              headerBackImage:()=><Image
                style={{ height: 46, width: 28, }}
                source={require('../assets/logo/macman-logo-large-C.png')}
              />
              // headerTitle: props => <Image
              //   style={{ height: 100, width: 140, alignSelf: 'center' }}
              //   source={require('../assets/logo/ic_logo.png')}
              // />,
              // headerLeft: null,
              // headerStyle: {
              //   backgroundColor: CmmsColors.darkRed,
              //   height: 130
              // },
            })
            }
          />
          <Stack.Screen name="AdditionalSpareParts"
            component={AdditionalSpareParts}
            options={({ route, navigation }) => ({
              title: AppTextData.txt_Additional_Spare_Parts,
              headerTintColor:CmmsColors.logoBottomGreen,
              headerBackImage:()=><Image
                style={{ height: 46, width: 28, }}
                source={require('../assets/logo/macman-logo-large-C.png')}
              />
              // headerTitle: props => <Image
              //   style={{ height: 100, width: 140, alignSelf: 'center' }}
              //   source={require('../assets/logo/ic_logo.png')}
              // />,
              // headerLeft: null,
              // headerStyle: {
              //   backgroundColor: CmmsColors.darkRed,
              //   height: 130
              // },
            })
            }
          />
          <Stack.Screen name="TodayJobOrderIssued"
            component={TodayJobOrderIssued}
            options={({ route: { params }, navigation }) => ({
              title: AppTextData.txt_Job_Oder,
              headerTintColor:CmmsColors.logoBottomGreen,
              headerBackImage:()=><Image
                style={{ height: 46, width: 28, }}
                source={require('../assets/logo/macman-logo-large-C.png')}
              />

            })
            }
          />

          <Stack.Screen name="EmergencyJobOrders"
            component={EmergencyJobOrders}
            options={({ route: { params }, navigation }) => ({
              title: AppTextData.txt_Job_Order_Request,
              headerTintColor:CmmsColors.logoBottomGreen,
              headerBackImage:()=><Image
                style={{ height: 46, width: 28, }}
                source={require('../assets/logo/macman-logo-large-C.png')}
              />
            })
            }
          />

          <Stack.Screen name="Login"
            component={LoginScreen}
            options={({ route, navigation }) => {
  // const headerHeight = useHeaderHeight()

              return ({
              // headerTransparent:true, 
              // title:null,
              headerBackImage:null,
              headerTitle: props=><SvgXml 
                // style={{borderWidth:1}}
                xml={
                  xmlLogo
                } width={screenWidth} height={50} />
             ,
             headerTitleAlign:'center',
              // headerTitleStyle:{ flex: 1, textAlign: 'center',margin:0,padding:0,borderWidth:5 },
              // headerLeft: null,
              // headerTitle: props => <Image
              //   style={{ height: 100, width: 140, alignSelf: 'center' }}
              //   source={require('../assets/logo/ic_logo.png')}
              // />,
              // // title: {
              // //     <Image
              // //   style={{height:96,width:96,}}
              // //   source={require('../assets/logo/ic_logo_toolbar.png')}
              // //   />
              // // },
              // headerStyle: {
              //   backgroundColor: CmmsColors.darkRed,
              //   height: 130
              // },
            })
          }
            }
          />
          <Stack.Screen name="TechHome"
            component={TechHomeScreen}
            options={({ route: { params }, navigation }) => ({
              title: null,//loggedUser?.TechnicianName,
              // headerTintColor:CmmsColors.logoBottomGreen,
              // headerStyle: {
              //   height: 56,
                
              // },
              headerLeft: (props) => {
                console.log(props)
                return (
                  // <Image
                  //   style={{ height: 96, width: 96, }}
                  //   source={require('../assets/logo/ic_logo_toolbar.png')}
                  // />

                  // </TouchableOpacity>
                 
                  <SvgXml 
                  style={{marginStart:8}}
                  xml={
                    xmlLogo
                  } width={screenWidth/3} height='100%' />
                )
              },
              headerRight: (props) => {
                console.log(props)
                return (
                  <View
                    style={{ flexDirection: 'row',marginEnd:8,alignItems:'center' }}
                  >
                    <TouchableOpacity
                      style={{ padding: 4,marginEnd:5 }}
                      onPress={() => {
                        navigation.navigate('ChatHistoryPage')
                      }}
                    >
                      <Icon name="commenting" size={24} color="grey" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ padding: 4,marginEnd:5 }}
                      onPress={() => {
                        navigation.navigate('SparepartsRequired')
                      }}
                    >
                      <Icon name="wrench" size={24} color="grey" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ padding: 4 }}
                      onPress={() => {
                        console.log('logout')
                        Alert.alert('Logout',`Hey ${loggedUser.TechnicianName}, Are you sure, You want to logout`,

                          [
                            // {
                            //   text: 'Ask me later',
                            //   onPress: () => console.log('Ask me later pressed')
                            // },
                            {
                              text: 'Cancel',
                              onPress: () => console.log('Cancel Pressed'),
                              style: 'cancel'
                            },
                            {
                              text: 'OK', onPress: () => {
                                console.log('OK Pressed')

                                // http://213.136.84.57:4545/api/ApkTechnician/LogOut
                                requestWithEndUrl(`${API_TECHNICIAN}LogOut`, { TechnicianID: loggedUser?.TechnicianID }, 'POST')
                                  .then(res => {
                                    console.log("URL_LOGIN", res)
                                    if (res.status != 200) {
                                      throw Error(res.statusText);
                                    }
                                    return res.data;
                                  })
                                  .then(data => {
                                    if (data.isSucess) {
                                      AsyncStorage.removeItem(ASK.ASK_USER)
                                      dispatch(actionSetLoginData({}))
                                      resetNavigation(navigation,'Login')
                                    }
                                    alert(data.Message)
                                  })
                                  .catch(err => {
                                    console.error({ err })
                                  })
                              }
                            }
                          ],

                          { cancelable: false }

                        )



                      }}
                    >
                      <Icon name="user-circle-o" size={24} color="grey" />
                    </TouchableOpacity>
                  </View>
                  // <Image
                  //   style={{height:48,width:48,}}
                  //   source={require('../assets/icons/')}
                  //   />
                )
              }
            })
            }

          />

          <Stack.Screen name="Notes"
            component={Notes}
            options={({ route: { params }, navigation }) => ({
              // title: 'Notes',
              headerTintColor:CmmsColors.logoBottomGreen,
              headerBackImage:()=><Image
                style={{ height: 46, width: 28, }}
                source={require('../assets/logo/macman-logo-large-C.png')}
              />
            })
            }
          />
          <Stack.Screen name="MHistory"
            component={MHistory}
            options={({ route: { params }, navigation }) => ({
              // title: 'Notes',
              headerTintColor:CmmsColors.logoBottomGreen,
              headerBackImage:()=><Image
                style={{ height: 46, width: 28, }}
                source={require('../assets/logo/macman-logo-large-C.png')}
              />
            })
            }
          />
          <Stack.Screen name="JobOrderReport"
            component={JobOrderReport}
            options={({ route: { params }, navigation }) => ({
              title: AppTextData.txt_Job_Order_Report,
              headerTintColor:CmmsColors.logoBottomGreen,
              headerBackImage:()=><Image
                style={{ height: 46, width: 28, }}
                source={require('../assets/logo/macman-logo-large-C.png')}
              />

            })
            }
          />

          <Stack.Screen name="SupHome"
            component={HomeScreen}
            options={({ route: { params }, navigation }) => ({
              title: null,
              // header:(props)=>{
              //     <Image
              //       style={{ height: 96, width: 96, }}
              //       source={require('../assets/logo/ic_logo_toolbar.png')}
              //     />
              // },
              // headerStyle: {
              //   height: 56,
                
              // },
              // headerTintColor: '#fff',
              // headerTitleStyle: {
              //   fontWeight: 'bold',
              //   fontFamily: 'Calibri',
              //   marginStart: 50
              // },
              headerLeft: (props) => {
                console.log(props)
                return (
                  // <Image
                  //   style={{ height: 96, width: 96, }}
                  //   source={require('../assets/logo/ic_logo_toolbar.png')}
                  // />

                  // </TouchableOpacity>
                 
                  <SvgXml 
                  style={{marginStart:8}}
                  xml={
                    xmlLogo
                  } width={screenWidth/3} height='100%' />
                )
              },
                
              // headerLeft: (props) => {
              //   console.log(props)
              //   return (
              //     // <Image
              //     //   style={{ height: 96, width: 96, }}
              //     //   source={require('../assets/logo/ic_logo_toolbar.png')}
              //     // />

              //     // </TouchableOpacity>
                 
              //     <SvgXml 
              //     style={{marginStart:8}}
              //     xml={
              //       xmlLogo
              //     } width={200} height='100%' />
              //   )
              // },
        //       headerRight: (props) => {
        //         console.log('home_props',props)
        //         return (
        //           <View 
        //           style={{ flexDirection: 'row',
        //           borderWidth:1,
        //           marginEnd:8,alignItems:'center' }}>
        //             <TouchableOpacity
        //   style={{ padding: 4,marginEnd:5 }}
        //   onPress={() => navigation.navigate('JobOderAssignment')}
        // >
        //   <Icon name='user-plus' size={28} color="black" />
        // </TouchableOpacity>
        //             <TouchableOpacity
        //               style={{ padding: 4,marginEnd:5 }}
        //               onPress={() => {
        //                 navigation.navigate('TSparePartsRequired')
        //               }}
        //             >
        //               <Icon name="wrench" size={28} color="black" />
        //             </TouchableOpacity>


        //             <TouchableOpacity
        //               style={{ padding: 4 }}
        //               onPress={() => {
        //                 console.log('logout')
        //                 Alert.alert('Logout', 'Are you sure, You want to logout',

        //                   [
        //                     // {
        //                     //   text: 'Ask me later',
        //                     //   onPress: () => console.log('Ask me later pressed')
        //                     // },
        //                     {
        //                       text: 'Cancel',
        //                       onPress: () => console.log('Cancel Pressed'),
        //                       style: 'cancel'
        //                     },
        //                     {
        //                       text: 'OK', onPress: () => {
        //                         console.log('OK Pressed')

        //                         // http://213.136.84.57:4545/api/ApkTechnician/LogOut
        //                         requestWithEndUrl(`${API_TECHNICIAN}LogOut`, { TechnicianID: loggedUser?.TechnicianID }, 'POST')
        //                           .then(res => {
        //                             console.log("URL_LOGIN", res)
        //                             if (res.status != 200) {
        //                               throw Error(res.statusText);
        //                             }
        //                             return res.data;
        //                           })
        //                           .then(data => {
        //                             if (data.isSucess) {
        //                               AsyncStorage.clear()
        //                               navigation.replace('Login')
        //                             }
        //                             alert(data.Message)
        //                           })
        //                           .catch(err => {
        //                             console.error({ err })
        //                           })
        //                       }
        //                     }
        //                   ],

        //                   { cancelable: false }

        //                 )



        //               }}
        //             >
        //               <Icon name="user-circle-o" size={28} color="black" />
        //             </TouchableOpacity>
        //           </View>
        //           // <Image
        //           //   style={{height:48,width:48,}}
        //           //   source={require('../assets/icons/')}
        //           //   />
        //         )
        //       }
            })
            }

          />

          <Stack.Screen name="SparepartsRequired"
            component={SparepartsRequired}
            options={({ route: { params }, navigation }) => ({
              title: AppTextData.txt_Spare_Parts_Required,
              headerTintColor:CmmsColors.logoBottomGreen,
              headerBackImage:()=><Image
                style={{ height: 46, width: 28, }}
                source={require('../assets/logo/macman-logo-large-C.png')}
              />
            })
            }
          />
          <Stack.Screen name="TechnicianDetails"
            component={TechnicianDetails}
            options={({ route: { params }, navigation }) => ({
              title: params.ServiceEngr,
              headerTintColor:CmmsColors.logoBottomGreen,
              headerBackImage:()=><Image
                style={{ height: 46, width: 28, }}
                source={require('../assets/logo/macman-logo-large-C.png')}
              />
            })
            }
          />
          <Stack.Screen name="JobOderAssignment"
            component={JobOderAssignment}
            options={({ route: { params }, navigation }) => ({
              title: AppTextData.txt_Job_Order_Assignment,
              headerTitleAllowFontScaling:true,
              headerTintColor:CmmsColors.logoBottomGreen,
              // headerLeft:
              headerBackImage:()=><Image
                style={{ height: 46, width: 28, }}
                source={require('../assets/logo/macman-logo-large-C.png')}
              />
            })}
          />

          <Stack.Screen name="ActivityListPage"
            component={ActivityListPage}
            options={({ route: { params }, navigation }) => ({
              title: AppTextData.txt_Activities,
              headerTintColor:CmmsColors.logoBottomGreen,
              headerBackImage:()=><Image
                style={{ height: 46, width: 28, }}
                source={require('../assets/logo/macman-logo-large-C.png')}
              />,
              headerRight:(props)=>{
                return(<TouchableOpacity
                      style={{ paddingHorizontal: 16,paddingVertical:4 }}
                      onPress={() => {
                        navigation.goBack()
                      }}
                    >
                      <Icon name="check" size={24} color={CmmsColors.logoBottomGreen} />
                    </TouchableOpacity>)
              }

            })
            }
          />

          <Stack.Screen name="TSparePartsRequired"
            component={TSparepartsRequired}
            options={({ route: { params }, navigation }) => ({
              title: AppTextData.txt_Spare_Parts_Required,
              headerTintColor:CmmsColors.logoBottomGreen,
              headerBackImage:()=><Image
                style={{ height: 46, width: 28, }}
                source={require('../assets/logo/macman-logo-large-C.png')}
              />

            })
            }
          />

<Stack.Screen name="ChatHistoryPage"
            component={ChatHistoryPage}
            options={({ route, navigation }) => ({
              title: "Chats",
              headerTintColor:CmmsColors.logoBottomGreen,
              // headerBackImage:()=><Image
              //   style={{ height: 48, width: 48,overflow:'hidden' }}
              //   source={require('../assets/logo/macman-logo-large-C.png')}
              // />
              // headerTitle: props => <Image
              //   style={{ height: 100, width: 140, alignSelf: 'center' }}
              //   source={require('../assets/logo/ic_logo.png')}
              // />,
              // headerLeft: null,
              // headerStyle: {
              //   backgroundColor: CmmsColors.darkRed,
              //   height: 130
              // },
            })
            }
          />

<Stack.Screen name="ChatComposePage"
            component={ChatComposePage}
            options={({ route, navigation }) => ({
              title: route.params.chatReciever.Name,
              headerTintColor:CmmsColors.logoBottomGreen,
              // headerBackImage:()=><Image
              //   style={{ height: 48, width: 48,overflow:'hidden' }}
              //   source={require('../assets/logo/macman-logo-large-C.png')}
              // />
              // headerTitle: props => <Image
              //   style={{ height: 100, width: 140, alignSelf: 'center' }}
              //   source={require('../assets/logo/ic_logo.png')}
              // />,
              // headerLeft: null,
              // headerStyle: {
              //   backgroundColor: CmmsColors.darkRed,
              //   height: 130
              // },
            })
            }
          />

<Stack.Screen name="CheckList"
            component={CheckListPage}
            options={({ route, navigation }) => ({
              title: "Checklist",
              headerTintColor:CmmsColors.logoBottomGreen,
              headerBackImage:()=><Image
                style={{ height: 46, width: 28, }}
                source={require('../assets/logo/macman-logo-large-C.png')}
              />
              // headerTitle: props => <Image
              //   style={{ height: 100, width: 140, alignSelf: 'center' }}
              //   source={require('../assets/logo/ic_logo.png')}
              // />,
              // headerLeft: null,
              // headerStyle: {
              //   backgroundColor: CmmsColors.darkRed,
              //   height: 130
              // },
            })
            }
          />

        </Stack.Navigator>
      </NavigationContainer>}
    </>
  )

}
