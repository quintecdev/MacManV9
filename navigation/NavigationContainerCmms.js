import React, {useEffect, useState, useRef} from 'react';
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
  Dimensions,
  Vibration,
} from 'react-native';
import {useNetInfo} from '@react-native-community/netinfo';
import NetInfo from '@react-native-community/netinfo';
import {useReducer} from 'react';
import {
  NavigationContainer,
  useNavigation,
  StackActions,
  CommonActions,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import TechHomeScreen from '../pages/Technician/home/TechHomeScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoginScreen from '../pages/login/LoginScreen';
import CmmsColors from '../common/CmmsColors';
import TodayJobOrderIssued from '../pages/Technician/components/TodayJobOrderIssued';
import JobOrderReport from '../pages/Technician/components/JobOrderReport';
import AdditionalSpareParts from '../pages/Technician/components/AdditionalSpareParts';
import ActivityDetails from '../pages/Technician/components/ActivityDetails';
import requestWithEndUrl from '../network/request';
import {API_SUPERVISOR, API_TECHNICIAN} from '../network/api_constants';
import Spinner from 'react-native-loading-spinner-overlay';
import {useSelector, useDispatch} from 'react-redux';
import CMMSSplashScreen from '../pages/CMMSSplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../pages/supervisor/HomeScreen';
import SparepartsRequired from '../pages/Technician/components/SparepartsRequired';
import JobOderAssignment from '../pages/supervisor/job_oder/job_assignment/JobOderAssignment';
// import TechnicianDetails from '../pages/supervisor/Technician/TechnicianDetails';
import TechnicianDetails from '../pages/supervisor/Technician/TechnicianDetails';
import TSparepartsRequired from '../pages/supervisor/Technician/TSparePartsRequired';
import ActivityListPage from '../pages/supervisor/job_oder/job_assignment/ActivityListPage';
import {actionSetTech, actionSetTechList} from '../action/ActionTechnician';
import {
  actionSetAppTextData,
  actionSetSelectedLng,
} from '../action/ActionAppText';
import {actionSetEmergencyJoblistNotificationCountUpdate} from '../action/ActionNotificationJob';
import {actionSetLoading, actionSetRefreshing} from '../action/ActionSettings';
import {
  actionSetSupCheckListNotification,
  actionSetEmergencyJoblistNotificationCount,
  actionSetEmergencyJoblistNotificationBgStatus,
} from '../action/ActionCurrentPage';
import ErrorPage from '../pages/ErrorPage';
import EmergencyJobOrders from '../pages/supervisor/job_oder/EmergencyJobOrders';
import {SvgCss, SvgFromXml, SvgXml} from 'react-native-svg';
import {xmlLogo} from '../common/SvgIcons';
import Notes from '../pages/Technician/home/Notes';
import MHistory from '../pages/Technician/home/MHistory';
import messaging, {firebase} from '@react-native-firebase/messaging';
import {
  actionSetChartData,
  actionSetJobListCnt,
  actionSetJobOrderList,
} from '../action/ActionRealTimeData';
import {actionSetLoginData} from '../action/ActionLogin';
import ASK from '../constants/ASK';
import resetNavigation from './resetNavigation';
import {parse, format} from 'date-fns';
import SplashScreen from 'react-native-splash-screen';
import ChatComposePage from '../pages/chat/ChatComposePage';
import ChatHistoryPage from '../pages/chat/ChatHistoryPage';
import {withHeight} from '../common/utils';
import CheckListPage from '../pages/check-list/CheckListPage';
// import QrCodeScanner from '../pages/QrCodeScanner/QrCodeScanner';
import CheckListPageNotification from '../pages/supervisor/Technician/CheckListPageNotification';
import DeviceInfo from 'react-native-device-info';
import VersionCheck from '../pages/VersionCheck/VersionCheck';

import {
  actionSetIsStandByPermission,
  actionSetJobDate,
  actionSetVersion,
} from '../action/ActionVersion';
import {actionSetAlertPopUpTwo} from '../action/ActionAlertPopUp';
import BackgroundActions from 'react-native-background-actions';
import CycleCount from '../pages/supervisor/job_oder/CycleCount';
import Alerts from '../pages/components/Alert/Alerts';
import InternalWorkOrder from '../pages/supervisor/InternalWorkOrder';
import CheckListSafetyRegulationPage from '../pages/check-list/CheckListSafetyRegulationPage';
// console.log('device model===>>>>', DeviceInfo.getBuildNumber());
import BackgroundService from 'react-native-background-actions';
import FullScreenImageView from '../pages/check-list/ImageViewPage';

const screenWidth = Dimensions.get('window').width;
const Stack = createStackNavigator();
const TAG = 'NavigationContainerCmms';
// const [TaskName, SetTaskName] = useState('Checking for Emergency Jobs');
// let Title = 'Checking for Emergency Jobs';
var Sound = require('react-native-sound');
Sound.setCategory('playback');
var NotificationSound = new Sound(
  'emergencynotification.wav',
  Sound.MAIN_BUNDLE,
  (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
    // loaded successfully
    // Play the sound with an onEnd callback
    // NotificationSound.play((success) => {
    //   if (success) {
    //     console.log('successfully finished playing');
    //   } else {
    //     console.log('playback failed due to audio decoding errors');
    //   }
    // });
  },
);
// const reducer = (TimeGap, action) => {
//   switch (action.type) {
//     case 'Increment':
//       return TimeGap + 1;
//     default:
//       return TimeGap;
//   }
// };
export default () => {
  console.log(TAG, 'default', {screenWidth});
  // const Navigtion = useNavigation();
  const navigationRef = useRef();
  // const route = useRoute();
  // console.log({route})
  const appState = useRef(AppState.currentState);
  const {AppTextData, selectedLng} = useSelector((state) => {
    return state.AppTextViewReducer;
  });
  const {loggedUser} = useSelector((state) => state.LoginReducer);
  console.log({loggedUser});
  const {isLoading} = useSelector((state) => state.SettingsReducer);
  const [isError, setIsError] = useState(false);
  const [appStateVisible, setAppStateVisible] = useState(appState);
  const [Language, SetLangauge] = useState({});
  const [intervel, setIntervel] = useState(5);
  const [taskDesc, settaskDesc] = useState('');
  const [TimeGap, setTimeGap] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const {loginStatus} = useSelector((state) => state.LoginReducer);
  
  
  // const [TimeGap, setTimeGap] = useReducer(reducer, 0);

  const {jobOrderList} = useSelector((state) => state.RealTimeDataReducer);
  const {TechList} = useSelector((state) => state.TechnicianReducer);
  const {CheckListNotificationVisit} = useSelector(
    (state) => state.PageVisitReducer,
  );
  const {EmergencyJoblistNotifactionCountUpdate} = useSelector(
    (state) => state.NotificationJobReducer,
  );
  const {
    EmergencyJoblistNotifactionCount,
    EmergencyJoblistNotifactionBgStatus,
  } = useSelector((state) => state.CurrentPageReducer);
  const {AlertPopUp, AlertPopUpTwo} = useSelector((state) => {
    return state.AlertPopUpReducer;
  });
  const InterNet = useNetInfo();
  const dispatch = useDispatch();
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
  useEffect(() => {
    if (loggedUser?.TechnicianID != undefined || null) {
      // setInterval(() => {
      CheckingAppVersion();
      // }, 10000);
    }
  }, [loggedUser]);

  useEffect(() => {
      console.log('timer update from the useeffect==>>', TimeGap);
      TimerCheck();
    }, [TimeGap]);

    async function TimerCheck() {
    // alert('one minutes');
    console.log('function TimerCheck==>>');
    const User = JSON.parse(await AsyncStorage.getItem(ASK.ASK_USER));
    console.log(
      'timer check function==>>',
      User,
      'userType==>',
      User?.UserType,
    );
    if (User?.UserType == 1 || !User) {
      console.log('Stopeddddddd');
      clearInterval(intervalId);
      setIntervalId(null);
    } else {
      console.log("TIMER-SUPERVISOR")
      if (
        EmergencyJoblistNotifactionBgStatus.BDNotification == true &&
        appState.current == 'active'
      ) {
      console.log("TIMER-SUPERVISOR",EmergencyJoblistNotifactionBgStatus.BDNotification,TimeGap)

        if (TimeGap % 60 == 0) {
          // TimerCheck(TimeGap / 60);
      console.log("TIMER-SUPERVISOR","TimeGap % 60")

          AsyncStorage.getItem(ASK.ASK_NOTIFICATION_TIMER)
            .then((res) => {
              if (res) {
                const NOTIFICATION = JSON.parse(res);
                console.log(
                  'notification in the notifcation async storage==>>',
                  NOTIFICATION,
                );
                const Time = NOTIFICATION?.Timer;
                console.log('time modulus==>>', (TimeGap / 60) % Time);
                // console.log('time for the Notification time==>>', Time);
                if (
                  NOTIFICATION.Permission == true &&
                  (TimeGap / 60) % Time == 0
                  //&& User.UserType == 1
                ) {
                  // if ((TimeGap / 60) % Time == 0) {
                  // alert('successfully completed TimerCheck function');
                  EmergencyJoblistNotificationCount();
                  // }
                }
              }
            })
            .catch((err) => {
              console.error('notification error==>>', err);
            });
        }
      }
    }
  }
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
  // fkjsfjhf

  // const sleep = () =>
  //   new Promise((resolve) => setTimeout(() => resolve(), 10000));

  // const veryIntensiveTask = async (taskDataArguments) => {
  //   // Example of an infinite loop task
  //   const {delay} = taskDataArguments;

  //   await new Promise(async (resolve) => {
  //     for (let i = 0; BackgroundActions.isRunning(); i++) {
  //       console.log(i);
  //       if (i % 8 == 0) {
  //         CheckingAppVersions();
  //       }
  //       await sleep();
  //     }
  //   });
  // };

  // old -code unused
  // const configureBackgroundAction = () => {
  //   const backgroundAction = async () => {
  //     // await apiCall();
  //     await CheckingAppVersions();
  //     return {taskId: 'myTaskId', stopOnTerminate: false};
  //   };

  //   const options = {
  //     taskName: 'My Task',
  //     taskTitle: 'My Task Title',
  //     taskDesc: 'My Task Description',
  //     taskIcon: {
  //       name: 'ic_launcher',
  //       type: 'mipmap',
  //     },
  //     color: '#ffffff',
  //     parameters: {
  //       delay: 60 * 1000, // 1 minute delay in milliseconds
  //     },
  //   };

  //   BackgroundActions.start(backgroundAction, options).then(() =>
  //     console.log('Background action started'),
  //   );
  // };

  async function CheckingAppVersions() {
    const User = JSON.parse(await AsyncStorage.getItem(ASK.ASK_USER));
    if (
      User == null ||
      User == undefined
      //  || User?.UserType == 2
    ) {
      await BackgroundActions.stop();
    } else {
      requestWithEndUrl(`${API_SUPERVISOR}GetCutOffDate`, {
        UserID: User?.TechnicianID,
      })
        .then((res) => {
          if (res.status != 200) {
            throw Error(res.statusText);
          }
          return res.data;
        })
        .then((data) => {
          // setIntervel(data.NotificationInterval);
          Checking(data.BDNotification);
        })
        .catch((err) => {
          console.error('GetCutOffDate', {err});
        });
    }
  }
  async function Checking(e) {
    // const {delay} = taskDataArguments;
    console.log('function ==>>Checking', e);
    const User = JSON.parse(await AsyncStorage.getItem(ASK.ASK_USER));
    console.error('user Details from the async storage==>>', User.TechnicianID);
    try {
      if (e == true) {
        const params = {SEID: User.TechnicianID, Date: Date.now()};
        console.log(
          'params for api call EmergencyJoblistNotificationCount function',
          params,
        );
        const EmergencyJoblistCount = await requestWithEndUrl(
          `${API_SUPERVISOR}EmergencyJobListCount`,
          params,
        );
        // dispatch(
        //   actionSetEmergencyJoblistNotificationCount(
        //     EmergencyJoblistCount.data.BreakDownCount,
        //   ),
        // );
        // alert('successfully completed Checking function');
        dispatch(
          actionSetEmergencyJoblistNotificationCount(
            EmergencyJoblistCount.data.BreakDownCount,
          ),
        );
        console.log('NotificationCount.data.Count', EmergencyJoblistCount.data);
        if (EmergencyJoblistCount.data.BreakDownCount > 0) {
          // console.log('NotificationCount.data.Count2', NotificationCount?.data);
          NotificationSound.play();
          Vibration.vibrate(1000);
          // await BackgroundActions.stop();
        }
        //    if (TimeGap % 60 == 0) {
        //   TimerCheck(TimeGap / 60);
        // }
        // if (appState.current.match(/inactive/)) {
        //   SetTimers();
        // }
      } else if (e == false) {
        console.log('else part Checking');
        await BackgroundActions.stop();
      }
    } catch (error) {
      console.log('cardDetailfetch error', error);
    }
  }

  //copy from BGTask
  const options = {
    taskName: 'Example',
    taskTitle: 'Mac-Man',
    taskDesc: 'Checking Your Jobs',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: 'white',
    linkingURI: 'MacMan://', // See Deep Linking for more info
    parameters: {
      delay: 500000,
    },
  };

  const sleep = () =>
    new Promise((resolve) => setTimeout(() => resolve(), 10000));
  
  //copy from BGTask
   const veryIntensiveTask = async (taskDataArguments) => {
    // Example of an infinite loop task
    const {delay} = taskDataArguments;
    console.log("veryIntensiveTask")
    await new Promise(async (resolve) => {
      console.log("BG-isrunning",BackgroundService.isRunning())
      for (let i = 0; BackgroundService.isRunning(); i++) {
        console.log(i);
        if (i % 8 == 0) {
          CheckingAppVersions();
        }
        await sleep();
      }
    });
  };

  //copy from BGTask
  async function _handleAppStateChange(nextAppState) {
    const User = JSON.parse(await AsyncStorage.getItem(ASK.ASK_USER));
    console.log('function name==>> NavigationContainer handleAppStateChange');

    // console.log("_handleAppStateChange",{nextAppState,appState:appState.current,routelenght:navigationRef?.current.getRootState().index})
    if (nextAppState === 'inactive' || nextAppState === 'background') {
      User.UserType == 2 &&
        (await BackgroundService.start(veryIntensiveTask, options));
      console.log('app is in background');
    } else if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      if (User.UserType == 2) {
        await BackgroundService.stop();

        dispatch(actionSetEmergencyJoblistNotificationCountUpdate());
      }
      ChecklistNotificationCount();
      console.log('App has come to the foreground!', {loggedUser});
      // messaging().noremoveAllDeliveredNotifications()
      if (!loggedUser) {
        dispatch(actionSetLoading(true));
        AsyncStorage.getItem(ASK.ASK_USER)
          .then((res) => {
            console.log('_handleAppStateChange', 'ASK_USER', {res});
            if (res) {
              console.log('login expired 1');
              const loggedUser = JSON.parse(res);
              dispatch(actionSetLoginData(loggedUser));
              dispatch(actionSetLoading(false));
            } else throw Error('Login Expired');
          })
          .catch((err) => {
            console.log('login expired 2');
            console.log('_handleAppStateChange_err: ', {err});
            dispatch(actionSetLoading(false));
            const currentPage = navigationRef?.current?.getCurrentRoute()?.name;
            console.log('current page=====>', currentPage);
          });
      }
    }
    appState.current = nextAppState;
    setAppStateVisible(appState.current);
    return false;
  }

  //old - code
  // async function _handleAppStateChange(nextAppState) {
  //   console.log('function name==>> NavigationContainer handleAppStateChange');

  //   // console.log("_handleAppStateChange",{nextAppState,appState:appState.current,routelenght:navigationRef?.current.getRootState().index})
  //   if (nextAppState === 'inactive' || nextAppState === 'background') {
  //     // await BackgroundActions.start(veryIntensiveTask, options);
  //     // configureBackgroundAction();
  //     //1
  //     console.log('app is in background');
  //   } else if (
  //     appState.current.match(/inactive|background/) &&
  //     nextAppState === 'active'
  //   ) {
  //     // await BackgroundActions.stop();
  //     //2
  //     ChecklistNotificationCount();
  //     dispatch(actionSetEmergencyJoblistNotificationCountUpdate());
  //     console.log('App has come to the foreground!', {loggedUser});
  //     // messaging().noremoveAllDeliveredNotifications()
  //     if (!loggedUser) {
  //       dispatch(actionSetLoading(true));
  //       AsyncStorage.getItem(ASK.ASK_USER)
  //         .then((res) => {
  //           console.log('_handleAppStateChange', 'ASK_USER', {res});
  //           if (res) {
  //             console.log('login expired 1');
  //             const loggedUser = JSON.parse(res);
  //             dispatch(actionSetLoginData(loggedUser));
  //             dispatch(actionSetLoading(false));
  //           } else throw Error('Login Expired');
  //         })
  //         .catch((err) => {
  //           console.log('login expired 2');
  //           console.log('_handleAppStateChange_err: ', {err});
  //           dispatch(actionSetLoading(false));
  //           const currentPage = navigationRef?.current?.getCurrentRoute()?.name;
  //           console.log('current page=====>', currentPage);
  //           // navigationRef.current?.dispatch(resetAction)
  //           // if(currentPage!= 'Login')
  //           // navigationRef.current?.dispatch(
  //           //   CommonActions.reset({
  //           //     index: 0,
  //           //     routes: [
  //           //       { name: 'Login' },

  //           //     ],
  //           //   })
  //           // );
  //         });
  //     }
  //   }
  //   appState.current = nextAppState;
  //   setAppStateVisible(appState.current);
  //   return false;
  // }

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
    console.error('Login check useEffect===>>');
    const eventListenerSubscription = AppState.addEventListener(
      'change',
      _handleAppStateChange,
    );
    return () => {
      // on unmount
      eventListenerSubscription?.remove();
    };
  }, []);
  //checking the internet connection
  useEffect(() => {
    // NetInfo.fetch().then((state) => {
    //   console.log('Connection type', state.type);
    //   console.log('Is connected?', state.isConnected);
    //   alert('internet' + state.isConnected);
    // });
    // const unsubscribe = NetInfo.addEventListener((state) => {
    //   console.log('Connection type==', state.isInternetReachable);
    //   console.log('Is connected?==', state.isConnected);
    // });
    // return () => {
    //   unsubscribe();
    // };
    // unsubscribe();
    // console.error('internet connection status==>>', InterNet.isConnected);
    // console.error(
    //   'internet connection is InternetReachable==>>',
    //   InterNet.isInternetReachable,
    // );
    // if (InterNet.isInternetReachable == false) {
    //   alert('no internet connection please check..');
    // }
    // // alert('internet connected or not?==>>  ', InterNet.isConnected);
  }, [InterNet.isInternetReachable]);
  useEffect(() => {
    // const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
    //   const offline = !state.isInternetReachable;
    //   console.error('internet status==>>>', offline);
    //   if (state.isConnected || state.isInternetReachable == false) {
    //     alert('your offline now');
    //   }
    // });
    // return () => removeNetInfoSubscription();
    // if (InterNet.isConnected || InterNet.isInternetReachable == true) {
    //   alert('your offline');
    // }
  }, [isLoading]);
  useEffect(() => {
    // CheckingAppVersion();
    updateToken();
    // If using other push notification providers (ie Amazon SNS, etc)
    // you may need to get the APNs token instead for iOS:
    // if(Platform.OS == 'ios') { messaging().getAPNSToken().then(token => { return saveTokenToDatabase(token); }); }
    // Listen to whether the token changes
    messaging().onTokenRefresh(async (token) => {
      console.log('fcm_token: ', 'onTokenRefresh', token);
      const exstAsToken = await AsyncStorage.getItem(ASK.ASK_TOKEN);
      if (exstAsToken != token) {
        AsyncStorage.setItem(ASK.ASK_TOKEN, token);
      }
      if (loggedUser) {
        updateTokenInDb(exstAsToken, token);
      }
      //update token in server db if user loggedin
      // saveTokenToDatabase(token);
    });
  }, []);
  useEffect(() => {
    // VersionCheckFunction()
    ChecklistNotificationCount();
  }, [CheckListNotificationVisit]);

 

  useEffect(() => {
    console.error('time gap from the useEffect==>>', TimeGap);
    console.log('current status of the application==>', appState);
    // console.log(
    //   'EmergencyJoblistNotifactionBgStatus>>>>',
    //   EmergencyJoblistNotifactionBgStatus,
    // );
    // if (
    //   EmergencyJoblistNotifactionBgStatus.BDNotification == true &&
    //   appState.current == 'active'
    // ) {
    EmergencyJoblistNotificationCount();
    // }
  }, [EmergencyJoblistNotifactionCountUpdate]);

  // useEffect(() => {
  //   console.log('timer update from the useeffect==>>', TimeGap);
  //   if (
  //     EmergencyJoblistNotifactionBgStatus.BDNotification == true &&
  //     appState.current == 'active'
  //   ) {
  //     if (TimeGap % 60 == 0) {
  //       TimerCheck(TimeGap / 60);
  //     }
  //   }
  // }, [TimeGap]);

  useEffect(() => {
    console.log('app appStateVisible state==>>', appStateVisible);
    console.log('app appState state==>>', appState);
    // const NOTIFICATION = JSON.parse(
    //   await AsyncStorage.getItem(ASK.ASK_NOTIFICATION_TIMER),
    // );
    // EmergencyJoblistNotifactionBgStatus?.NotificationInterval
    //***********/
    // const interval = setInterval(() => {
    //   setTimeGap((seconds) => seconds + 1);
    // }, 30000);
    // return () => clearInterval(interval);
    // if (appState.current == 'active') {
    console.log('app visible state==>>', appStateVisible);
    if (loggedUser?.TechnicianID != '') {
      // SetTimers();
      //3
    }
    // }
  }, []);

    useEffect(() => {
      SetTimers();
    }, [loginStatus == true]);

  async function SetTimers() {
    const User = JSON.parse(await AsyncStorage.getItem(ASK.ASK_USER));
    if (User.UserType == 2) {
      console.log('timer has startedddd');
      const intervals = setInterval(() => {
        console.log("setInterval")
        setTimeGap((seconds) => seconds + 1);
      }, 1000);
      setIntervalId(intervals);
      return () => clearInterval(intervals);
    }
  }

  async function ChecklistNotificationCount() {
    console.log('function ==>>ChecklistNotificationCount');
    const User = JSON.parse(await AsyncStorage.getItem(ASK.ASK_USER));
    console.error('user Details from the async storage==>>', User.TechnicianID);
    try {
      const NotificationCount = await requestWithEndUrl(
        `${API_SUPERVISOR}GetCheckListAbnormalityJobsCount`,
        {SEID: User.TechnicianID},
      );
      // const EmergencyJoblistCount = await requestWithEndUrl(
      //   `${API_SUPERVISOR}EmergencyJobListCount`,
      //   {SEID: User.TechnicianID, Date: Date.now()},
      // );
      dispatch(actionSetSupCheckListNotification(NotificationCount.data.Count));
      // console.log(
      //   'emergency joblist count-->>',
      //   EmergencyJoblistCount.data.BreakDownCount,
      // );
      // dispatch(
      //   actionSetEmergencyJoblistNotificationCount(
      //     EmergencyJoblistCount.data.BreakDownCount,
      //   ),
      // );
    } catch (error) {
      console.log('cardDetailfetch error', error);
    }
  }
  async function EmergencyJoblistNotificationCount() {
    // function to get the EmergencyJoblistNotificationCount in both Sup and Emp homepage
    console.error('function ==>>EmergencyJoblistNotificationCount');
    const User = JSON.parse(await AsyncStorage.getItem(ASK.ASK_USER));

    try {
      const params = {SEID: User.TechnicianID, Date: Date.now()};
      console.log(
        'params for api call EmergencyJoblistNotificationCount function',
        params,
      );
      const EmergencyJoblistCount = await requestWithEndUrl(
        `${API_SUPERVISOR}EmergencyJobListCount`,
        {SEID: User.TechnicianID, Date: Date.now()},
      );
      console.log(
        'emergency joblist count-->>',
        EmergencyJoblistCount.data.BreakDownCount,
      );
      dispatch(
        actionSetEmergencyJoblistNotificationCount(
          EmergencyJoblistCount.data.BreakDownCount,
        ),
      );
      if (EmergencyJoblistCount.data.BreakDownCount > 0) {
        NotificationSound.play();
        Vibration.vibrate(1000);
      }
    } catch (error) {
      console.log('EmergencyJobListCount error', error);
    }
  }
  // async function CheckingAppVersion(){
  //   try{
  //      const NewAppVersion= await requestWithEndUrl(`${API_SUPERVISOR}GetApkVersion`);
  //     dispatch(actionSetVersion(NewAppVersion.data.ApkVersion))
  //     console.log('app version api response===>>',NewAppVersion.data.ApkVersion)

  //   }catch(error){
  //     console.log('cardDetailfetch error',error)

  //   }
  // }
  async function CheckingAppVersion() {
    console.log(
      'checking GetCutOffDate from Nav',
      'params==>',
      loggedUser?.TechnicianID,
    );
    const User = JSON.parse(await AsyncStorage.getItem(ASK.ASK_USER));
    requestWithEndUrl(`${API_SUPERVISOR}GetCutOffDate`, {
      UserID: loggedUser?.TechnicianID,
    })
      .then((res) => {
        // console.log('GetReasons', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        dispatch(actionSetJobDate(data.OffsetDate));
        dispatch(actionSetIsStandByPermission(data.IsStandBy));
        dispatch(actionSetEmergencyJoblistNotificationBgStatus(data));
        AsyncStorage.setItem(
          ASK.ASK_NOTIFICATION_TIMER,
          JSON.stringify({
            Timer: data.NotificationInterval,
            Permission: data.BDNotification,
          }),
        );
      })
      .catch((err) => {
        console.error('GetCutOffDate', {err});
      });
  }

  useEffect(() => {
    console.log('appstate change');
    // console.log('NavigationContainer_page', 'useEffect', jobOrderList);
    setLangauge();
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
  }, [jobOrderList, TechList, AppState]);

  useEffect(() => {
    // AsyncStorage.getItem(ASK.ASK_LANGUAGE).then((res) => {
    //   console.log('Language Details RESPONSE===>>>', {res});
    //   if (res != null) {
    //     let SelectedLanguage = JSON.parse(res);
    //     console.log(
    //       'Language Details from the Navigation Page>>>',
    //       SelectedLanguage.Language,
    //     );
    //   }
    // });
    // const SelectedLanguage = await AsyncStorage.getItem(ASK.ASK_LANGUAGE);
    // requestWithEndUrl(`${API_TECHNICIAN}getMacManMobileAppTextData`, {
    //   Language: SelectedLanguage
    //     ? SelectedLanguage.Languagevalue
    //     : selectedLng.Languagevalue,
    // })
    //   .then((res) => {
    //     console.log('getMacManMobileAppTextData', {res});
    //     if (res.status != 200) {
    //       throw Error(res.statusText);
    //     }
    //     return res.data;
    //   })
    //   .then((data) => {
    //     console.log('getMacManMobileAppTextData', {data});
    //     // actionSetRefreshing(true)
    //     dispatch(actionSetAppTextData(data));
    //   })
    //   .catch((err) => {
    //     console.error({err});
    //     setIsError(true);
    //     //   console.error("getMacManMobileAppTextData",err)
    //     //   alert(`${AppTextData.txt_lng_error}`)
    //     //   dispatch(actionSetSelectedLng({
    //     //     Language:"English",
    //     //     Languagevalue:"en"
    //     // }))
    //   });
    GetAppTextData();
  }, [selectedLng.Languagevalue, loggedUser]);

  // *********

  async function GetAppTextData() {
    AsyncStorage.getItem(ASK.ASK_LANGUAGE).then((res) => {
      console.log('Language Details RESPONSE===>>>', {res});
      if (res != null) {
        const SelectedLanguage = JSON.parse(res);
        console.log(
          'Language Details from the AsyncStorage FROM LOGIN SCREEN>>>',
          SelectedLanguage.Language,
        );
        dispatch(actionSetSelectedLng(SelectedLanguage));
        // setLangauge(SelectedLanguage);
      } else {
        AsyncStorage.setItem(
          ASK.ASK_LANGUAGE,
          JSON.stringify({
            Language: selectedLng.Language,
            Languagevalue: selectedLng.Languagevalue,
          }),
        );
        // setLangauge(selectedLng);
      }
    });

    const SelectedLanguage = await AsyncStorage.getItem(ASK.ASK_LANGUAGE);
    console.log(
      'selected language data from the Async in nav container===>>',
      SelectedLanguage,
      'lang from the redux==>>',
      selectedLng.Languagevalue,
    );
    const params = {
      Language: selectedLng.Languagevalue,
    };
    console.log('params for apptextDatacall==>>', params);
    requestWithEndUrl(`${API_TECHNICIAN}getMacManMobileAppTextData`, params)
      .then((res) => {
        console.log('getMacManMobileAppTextData', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        console.log('getMacManMobileAppTextData', {data});
        // actionSetRefreshing(true)
        dispatch(actionSetAppTextData(data));
      })
      .catch((err) => {
        console.error({err});
        // setIsError(true);// commented by vbn
      });
  }
  function setLangauge() {
    console.log('');
    // console.log('set lang==>>>');
    // AsyncStorage.getItem('selectedLng')
    //   .then((data) => {
    //     console.log('AsyncStorage_selectedLngValue: ', {data});
    //     data && dispatch(actionSetSelectedLng(JSON.parse(data)));
    //   })
    //   .catch((err) => {
    //     console.log('AsyncStorage_selectedLngValue: ', {err});
    //   });
  }

  function updateTokenInDb(exstAsToken, token) {
    console.log('function name==>> NavigationContainer updateTokenInDb');
    requestWithEndUrl(`${API_TECHNICIAN}getExistingTokenInDb`, {
      TechnicianID: loggedUser.TechnicianID,
    })
      .then((res) => {
        console.log('getExistingTokenInDb', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        console.log('getExistingTokenInDb', {data});
        if (data == exstAsToken && token != data) {
          requestWithEndUrl(`${API_TECHNICIAN}refreshClientToken`, {
            TechnicianID: loggedUser.TechnicianID,
            Token: token,
          })
            .then((res) => {
              console.log('refreshClientToken', {res});
              if (res.status != 200) {
                throw Error(res.statusText);
              }
              return res.data;
            })
            .then((data) => {})
            .catch((err) => {
              console.log('refreshClientToken', {err});
            });
        }
      })
      .catch((err) => {
        console.log('getExistingTokenInDb', {err});
      });
  }

  const updateToken = async () => {
    console.log('function name==>> NavigationContainer updateToken');
    const loggedUser = await AsyncStorage.getItem(ASK.ASK_USER);
    const exstAsToken = await AsyncStorage.getItem(ASK.ASK_TOKEN);
    console.log('messaging', 'KEY_USER: ', loggedUser);
    var parsedLoggedUser = null;
    if (loggedUser) {
      parsedLoggedUser = JSON.parse(loggedUser);
      // console.log({parsedLoggedUser});
      // haslogin
      // if(parsedLoggedUser){
      //   if(exstAsToken){
      //     const tokenInDb ;
      //     if(tokenInDb&&exstAsToken!=tokenInDb) requestWithEndUrl(`${API_SUPERVISOR}refreshClientToken`,{TechnicianID:loggedUser.TechnicianID,Token:token})
      //   }
      // }
      dispatch(actionSetLoginData(parsedLoggedUser));
    }
    // Get the device token
    messaging()
      .getToken()
      .then(async (token) => {
        console.log('messaging', 'token: ', token);
        if (exstAsToken != token) {
          AsyncStorage.setItem(ASK.ASK_TOKEN, token);
        }
        try {
          if (loggedUser) {
            updateTokenInDb(exstAsToken, token);
            // if(tokenInDb&&exstAsToken!=tokenInDb) requestWithEndUrl(`${API_SUPERVISOR}refreshClientToken`,{TechnicianID:loggedUser.TechnicianID,Token:token})
          }
        } catch (err) {}

        // return saveTokenToDatabase(token);
      })
      .catch((err) => console.error('TOKEN: ', err));
  };

  return (
    <>
      <Spinner
        visible={isLoading}
        textContent={'Loading...'}
        textStyle={{color: 'white'}}
      />
      <Alerts
        title={AlertPopUpTwo?.title}
        body={AlertPopUpTwo?.body}
        visible={AlertPopUpTwo?.visible}
        onOk={() => {
          dispatch(actionSetAlertPopUpTwo({visible: false})),
            console.log('current value==>>', AlertPopUpTwo);
        }}
        type={AlertPopUpTwo.type}
      />
      {isError ? (
        <ErrorPage />
      ) : (
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator initialRouteName="splash">
            <Stack.Screen
              name="splash"
              component={CMMSSplashScreen}
              options={({route, navigation}) => ({
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
              })}
            />

            <Stack.Screen
              name="ActivityDetails"
              component={ActivityDetails}
              options={({route, navigation}) => ({
                title: AppTextData.txt_Activity_Details,
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
                // headerTitle: props => <Image
                //   style={{ height: 100, width: 140, alignSelf: 'center' }}
                //   source={require('../assets/logo/ic_logo.png')}
                // />,
                // headerLeft: null,
                // headerStyle: {
                //   backgroundColor: CmmsColors.darkRed,
                //   height: 130
                // },
              })}
            />
            <Stack.Screen
              name="AdditionalSpareParts"
              component={AdditionalSpareParts}
              options={({route, navigation}) => ({
                title: AppTextData.txt_Additional_Spare_Parts,
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
                // headerTitle: props => <Image
                //   style={{ height: 100, width: 140, alignSelf: 'center' }}
                //   source={require('../assets/logo/ic_logo.png')}
                // />,
                // headerLeft: null,
                // headerStyle: {
                //   backgroundColor: CmmsColors.darkRed,
                //   height: 130
                // },
              })}
            />
            <Stack.Screen
              name="TodayJobOrderIssued"
              component={TodayJobOrderIssued}
              options={({route: {params}, navigation}) => ({
                title: AppTextData.txt_Job_Oder,
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
              })}
            />

            <Stack.Screen
              name="EmergencyJobOrders"
              component={EmergencyJobOrders}
              options={({route: {params}, navigation}) => ({
                title: AppTextData.txt_BreakDown_List,
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
              })}
            />

            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={({route, navigation}) => {
                // const headerHeight = useHeaderHeight()

                return {
                  // headerTransparent:true,
                  // title:null,
                  headerBackImage: null,
                  headerTitle: (props) => (
                    <SvgXml
                      // style={{borderWidth:1}}
                      xml={xmlLogo}
                      width={screenWidth}
                      height={50}
                    />
                  ),
                  headerTitleAlign: 'center',
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
                };
              }}
            />
            <Stack.Screen
              name="TechHome"
              component={TechHomeScreen}
              options={({route: {params}, navigation}) => ({
                title: null, //loggedUser?.TechnicianName,
                // headerTintColor:CmmsColors.logoBottomGreen,
                // headerStyle: {
                //   height: 56,

                // },
                headerLeft: (props) => {
                  // console.log(props);
                  return (
                    // <Image
                    //   style={{ height: 96, width: 96, }}
                    //   source={require('../assets/logo/ic_logo_toolbar.png')}
                    // />

                    // </TouchableOpacity>

                    <SvgXml
                      style={{marginStart: 8}}
                      xml={xmlLogo}
                      width={screenWidth / 3}
                      height="100%"
                    />
                  );
                },
                // headerRight: (props) => {
                //   console.log(props)
                //   return (

                //     // <Image
                //     //   style={{height:48,width:48,}}
                //     //   source={require('../assets/icons/')}
                //     //   />
                //   )
                // }
              })}
            />

            <Stack.Screen
              name="Notes"
              component={Notes}
              options={({route: {params}, navigation}) => ({
                //vbn lang
                title: AppTextData.txt_Notes,
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="MHistory"
              component={MHistory}
              options={({route: {params}, navigation}) => ({
                //vbn lang
                title: AppTextData.txt_MHistory,
                // title: 'Notes',
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="JobOrderReport"
              component={JobOrderReport}
              options={({route: {params}, navigation}) => ({
                title: AppTextData.txt_Job_Order_Report,
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
              })}
            />

            <Stack.Screen
              name="SupHome"
              component={HomeScreen}
              options={({route: {params}, navigation}) => ({
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
                  // console.log(props);
                  return (
                    // <Image
                    //   style={{ height: 96, width: 96, }}
                    //   source={require('../assets/logo/ic_logo_toolbar.png')}
                    // />

                    // </TouchableOpacity>

                    <SvgXml
                      style={{marginStart: 8}}
                      xml={xmlLogo}
                      width={screenWidth / 3}
                      height="100%"
                    />
                  );
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
              })}
            />

            <Stack.Screen
              name="SparepartsRequired"
              component={SparepartsRequired}
              options={({route: {params}, navigation}) => ({
                title: AppTextData.txt_Spare_Parts_Required,
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="TechnicianDetails"
              component={TechnicianDetails}
              options={({route: {params}, navigation}) => ({
                title: params.ServiceEngr,
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="JobOderAssignment"
              component={JobOderAssignment}
              options={({route: {params}, navigation}) => ({
                title: AppTextData.txt_Job_Order_Assignment,
                headerTitleAllowFontScaling: true,
                headerTintColor: CmmsColors.logoBottomGreen,
                // headerLeft:
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
              })}
            />

            <Stack.Screen
              name="ActivityListPage"
              component={ActivityListPage}
              options={({route: {params}, navigation}) => ({
                title: AppTextData.txt_Activities,
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
                headerRight: (props) => {
                  return (
                    <TouchableOpacity
                      style={{paddingHorizontal: 16, paddingVertical: 4}}
                      onPress={() => {
                        navigation.goBack();
                      }}>
                      <Icon
                        name="check"
                        size={24}
                        color={CmmsColors.logoBottomGreen}
                      />
                    </TouchableOpacity>
                  );
                },
              })}
            />

            <Stack.Screen
              name="TSparePartsRequired"
              component={TSparepartsRequired}
              options={({route: {params}, navigation}) => ({
                title: AppTextData.txt_Spare_Parts_Required,
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
              })}
            />

            <Stack.Screen
              name="ChatHistoryPage"
              component={ChatHistoryPage}
              options={({route, navigation}) => ({
                //vbn lang title: 'Chats',
                title: AppTextData.txt_Chat,
                headerTintColor: CmmsColors.logoBottomGreen,
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
              })}
            />

            <Stack.Screen
              name="ChatComposePage"
              component={ChatComposePage}
              options={({route, navigation}) => ({
                title: route.params.chatReciever.Name,
                headerTintColor: CmmsColors.logoBottomGreen,
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
              })}
            />

            <Stack.Screen
              name="CheckList"
              component={CheckListPage}
              options={({route, navigation}) => ({
                //vbn lang
                // title: 'Checklist',
                title: AppTextData.Checklist,
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
                // headerTitle: props => <Image
                //   style={{ height: 100, width: 140, alignSelf: 'center' }}
                //   source={require('../assets/logo/ic_logo.png')}
                // />,
                // headerLeft: null,
                // headerStyle: {
                //   backgroundColor: CmmsColors.darkRed,
                //   height: 130
                // },
              })}
            />
            <Stack.Screen
              name="CheckListNotification"
              component={CheckListPageNotification}
              options={({route: {params}, navigation}) => ({
                //vbn lang
                title: AppTextData.txt_Checklist_Notification,
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="InternalWorkOrder"
              component={InternalWorkOrder}
              options={({route: {params}, navigation}) => ({
                
                title: AppTextData.txt_internal_workorder,
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="CheckListSafetyRegulationPage"
              component={CheckListSafetyRegulationPage}
              options={({route: {params}, navigation}) => ({
                
                title: "CheckList (Safety Regulations)",
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="VersionCheck"
              component={VersionCheck}
              options={({route, navigation}) => ({
                headerTransparent: true,
                title: null,
              })}
            />
            <Stack.Screen
              name="CycleCount"
              component={CycleCount}
              options={({route: {params}, navigation}) => ({
                title: 'Cycle Count',
                headerTintColor: CmmsColors.logoBottomGreen,
                headerBackImage: () => (
                  <Image
                    style={{height: 46, width: 28}}
                    source={require('../assets/logo/macman-logo-large-C.png')}
                  />
                ),
              })}
            />

            <Stack.Screen
              name="FullScreenImageView"
              component={FullScreenImageView}
              options={({route, navigation}) => ({
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
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </>
  );
};
