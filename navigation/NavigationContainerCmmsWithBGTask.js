import React, {useEffect, useState, useRef} from 'react';
import {
  Image,
  TouchableOpacity,
  AppState,
  Dimensions,
  Vibration,
} from 'react-native';
// import {useNetInfo} from '@react-native-community/netinfo';
// import NetInfo from '@react-native-community/netinfo';
import {useReducer} from 'react';
import {
  NavigationContainer,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {TotalPages} from './TotalPages';
import Icon from 'react-native-vector-icons/FontAwesome';
import CmmsColors from '../common/CmmsColors';
import requestWithEndUrl from '../network/request';
import {API_SUPERVISOR, API_TECHNICIAN} from '../network/api_constants';
import Spinner from 'react-native-loading-spinner-overlay';
import {useSelector, useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {actionSetTech, actionSetTechList} from '../action/ActionTechnician';
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
import {SvgCss, SvgFromXml, SvgXml} from 'react-native-svg';
import {xmlLogo} from '../common/SvgIcons';
import messaging, {firebase} from '@react-native-firebase/messaging';
// import {
//   actionSetChartData,
//   actionSetJobListCnt,
//   actionSetJobOrderList,
// } from '../action/ActionRealTimeData';
import {actionSetLoginData} from '../action/ActionLogin';
import ASK from '../constants/ASK';
// import resetNavigation from './resetNavigation';
// import {parse, format} from 'date-fns';
// import SplashScreen from 'react-native-splash-screen';
// import {withHeight} from '../common/utils';
// import DeviceInfo from 'react-native-device-info';

import {
  actionSetIsStandByPermission,
  actionSetJobDate,
  actionSetVersion,
} from '../action/ActionVersion';
import BackgroundService from 'react-native-background-actions';
import {actionSetAlertPopUpTwo} from '../action/ActionAlertPopUp';
import Alerts from '../pages/components/Alert/Alerts';
// console.log('device model===>>>>', DeviceInfo.getBuildNumber());

const screenWidth = Dimensions.get('window').width;
const Stack = createStackNavigator();
const TAG = 'NavigationContainerCmms';
// const [TaskName, SetTaskName] = useState('Checking for Emergency Jobs');
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
  },
);
export default () => {
  // console.log(TAG, 'default', {screenWidth});
  // const Navigtion = useNavigation();
  const navigationRef = useRef();
  // const route = useRoute();
  const appState = useRef(AppState.currentState);
  const {AlertPopUp, AlertPopUpTwo} = useSelector((state) => {
    return state.AlertPopUpReducer;
  });
  const {AppTextData, selectedLng} = useSelector((state) => {
    return state.AppTextViewReducer;
  });
  const {loggedUser} = useSelector((state) => state.LoginReducer);
  const {loginStatus} = useSelector((state) => state.LoginReducer);
  console.log({loggedUser});
  const {isLoading} = useSelector((state) => state.SettingsReducer);
  const [isError, setIsError] = useState(false);
  const [appStateVisible, setAppStateVisible] = useState(appState);
  // const [Language, SetLangauge] = useState({});
  // const [intervel, setIntervel] = useState(5);
  // const [taskDesc, settaskDesc] = useState('');
  const [TimeGap, setTimeGap] = useState(0);
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

  // const InterNet = useNetInfo();
  const dispatch = useDispatch();
  var eventListenerSubscription;
  const [intervalId, setIntervalId] = useState(null);
  useEffect(() => {
    if (loggedUser?.TechnicianID != undefined || null) {
      CheckingAppVersion();
    }
  }, [loggedUser]);
  const sleep = () =>
    new Promise((resolve) => setTimeout(() => resolve(), 10000));

  const veryIntensiveTask = async (taskDataArguments) => {
    // Example of an infinite loop task
    const {delay} = taskDataArguments;

    await new Promise(async (resolve) => {
      for (let i = 0; BackgroundService.isRunning(); i++) {
        console.log(i);
        if (i % 8 == 0) {
          CheckingAppVersions();
        }
        await sleep();
      }
    });
  };
  async function CheckingAppVersions() {
    const User = JSON.parse(await AsyncStorage.getItem(ASK.ASK_USER));
    if (
      User == null ||
      User == undefined ||
      User.UserType != 2
      //  || User?.UserType == 2
    ) {
      await BackgroundService.stop();
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
        const EmergencyJoblistCount = await requestWithEndUrl(
          `${API_SUPERVISOR}EmergencyJobListCount`,
          {SEID: User.TechnicianID, Date: Date.now()},
        );
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
        }
      } else if (e == false) {
        console.log('else part Checking');
        await BackgroundService.stop();
      }
    } catch (error) {
      console.log('cardDetailfetch error', error);
    }
  }
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


  useEffect(() => {
    //on mount
    // console.error('Login check useEffect===>>');
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
  // useEffect(() => {
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
  // }, [InterNet.isInternetReachable]);

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
    EmergencyJoblistNotificationCount();
  }, [EmergencyJoblistNotifactionCountUpdate]);

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
      if (
        EmergencyJoblistNotifactionBgStatus.BDNotification == true &&
        appState.current == 'active'
      ) {
        if (TimeGap % 60 == 0) {
          // TimerCheck(TimeGap / 60);

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
  useEffect(() => {
    console.log('app appStateVisible state==>>', appStateVisible);
    console.log('app appState state==>>', appState);
    console.log('app visible state==>>', appStateVisible);
    SetTimers();
  }, [loginStatus == true]);

  async function SetTimers() {
    const User = JSON.parse(await AsyncStorage.getItem(ASK.ASK_USER));
    if (User.UserType == 2) {
      console.log('timer has startedddd');
      const intervals = setInterval(() => {
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
      dispatch(actionSetSupCheckListNotification(NotificationCount.data.Count));
    } catch (error) {
      console.log('cardDetailfetch error', error);
    }
  }
  async function EmergencyJoblistNotificationCount() {
    // function to get the EmergencyJoblistNotificationCount in both Sup and Emp homepage
    console.error('function ==>>EmergencyJoblistNotificationCount');
    const User = JSON.parse(await AsyncStorage.getItem(ASK.ASK_USER));
    try {
      const EmergencyJoblistCount = await requestWithEndUrl(
        `${API_SUPERVISOR}EmergencyJobListCount`,
        {SEID: User?.TechnicianID, Date: Date.now()},
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
      if (User?.UserType == 2) {
        if (EmergencyJoblistCount.data.BreakDownCount > 0) {
          NotificationSound.play();
          Vibration.vibrate(1000);
        }
      }
    } catch (error) {
      console.log('EmergencyJobListCount error', error);
    }
  }

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
    setLangauge();
  }, [jobOrderList, TechList, AppState]);

  useEffect(() => {
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
    console.error(
      'selected language data from the Async in nav container===>>',
      SelectedLanguage,
      'lang from the redux==>>',
      selectedLng.Languagevalue,
    );
    const params = {
      Language: selectedLng.Languagevalue,
    };
    console.error('params for apptextDatacall==>>', params);
    requestWithEndUrl(`${API_TECHNICIAN}getMacManMobileAppTextData`, params)
      .then((res) => {
        // console.log('getMacManMobileAppTextData', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        // console.log('getMacManMobileAppTextData', {data});
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
              component={TotalPages.CMMSSplashScreen}
              options={({route, navigation}) => ({
                headerTransparent: true,
                title: null,
              })}
            />

            <Stack.Screen
              name="ActivityDetails"
              component={TotalPages.ActivityDetails}
              options={({route, navigation}) => ({
                title: AppTextData.txt_Activity_Details,
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
              name="AdditionalSpareParts"
              component={TotalPages.AdditionalSpareParts}
              options={({route, navigation}) => ({
                title: AppTextData.txt_Additional_Spare_Parts,
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
              name="TodayJobOrderIssued"
              component={TotalPages.TodayJobOrderIssued}
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
              component={TotalPages.EmergencyJobOrders}
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
              component={TotalPages.LoginScreen}
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
                };
              }}
            />
            <Stack.Screen
              name="TechHome"
              component={TotalPages.TechHomeScreen}
              options={({route: {params}, navigation}) => ({
                title: null, //loggedUser?.TechnicianName,
                headerLeft: (props) => {
                  // console.log(props);
                  return (

                    <SvgXml
                      style={{marginStart: 8}}
                      xml={xmlLogo}
                      width={screenWidth / 3}
                      height="100%"
                    />
                  );
                },
              })}
            />

            <Stack.Screen
              name="Notes"
              component={TotalPages.Notes}
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
              component={TotalPages.MHistory}
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
              component={TotalPages.JobOrderReport}
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
              component={TotalPages.HomeScreen}
              options={({route: {params}, navigation}) => ({
                title: null,
                headerLeft: (props) => {
                  // console.log(props);
                  return (

                    <SvgXml
                      style={{marginStart: 8}}
                      xml={xmlLogo}
                      width={screenWidth / 3}
                      height="100%"
                    />
                  );
                },
              })}
            />

            <Stack.Screen
              name="SparepartsRequired"
              component={TotalPages.SparepartsRequired}
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
              component={TotalPages.TechnicianDetails}
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
              component={TotalPages.JobOderAssignment}
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
              component={TotalPages.ActivityListPage}
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
              component={TotalPages.TSparepartsRequired}
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
              component={TotalPages.ChatHistoryPage}
              options={({route, navigation}) => ({
                //vbn lang title: 'Chats',
                title: AppTextData.txt_Chat,
                headerTintColor: CmmsColors.logoBottomGreen,
              })}
            />

            <Stack.Screen
              name="ChatComposePage"
              component={TotalPages.ChatComposePage}
              options={({route, navigation}) => ({
                title: route.params.chatReciever.Name,
                headerTintColor: CmmsColors.logoBottomGreen,
              })}
            />

            <Stack.Screen
              name="CheckList"
              component={TotalPages.CheckListPage}
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
              })}
            />
            <Stack.Screen
              name="CheckListNotification"
              component={TotalPages.CheckListPageNotification}
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
              name="CycleCount"
              component={TotalPages.CycleCount}
              options={({route: {params}, navigation}) => ({
                title: AppTextData.txt_Cycle_Count,
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
              component={TotalPages.VersionCheck}
              options={({route, navigation}) => ({
                headerTransparent: true,
                title: null,
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </>
  );
};
