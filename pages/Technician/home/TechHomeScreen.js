import React, {useRef, useState, useEffect, useLayoutEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  Button,
  processColor,
  Animated,
  BackHandler,
  Alert,
  Text,
  Modal,
  ImageBackground,
  ScrollView,
  Pressable,
} from 'react-native';
// import DatePicker from 'react-native-datepicker'
// import DatePicker from '@react-native-community/datetimepicker'
import BottomSheet from 'react-native-simple-bottom-sheet';
import Icon from 'react-native-vector-icons/FontAwesome';
import Timer from '../components/Timer';
import useTimer from '../hook/useTimer';
import {Dialog} from 'react-native-simple-dialogs';
const screenWidth = Dimensions.get('window').width;
import {PieChart} from 'react-native-charts-wrapper';
import CmmsColors from '../../../common/CmmsColors';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import requestWithEndUrl from '../../../network/request';
import {
  API_TECHNICIAN,
  URL_GETWORKSTATUSPIEGRAPHBYDATE,
  API_SUPERVISOR,
  API_COMMON,
} from '../../../network/api_constants';
import {parse, format} from 'date-fns';
import {useSelector, useDispatch} from 'react-redux';
import ButtonQtyModifyWithLabel from '../components/ButtonQtyModifyWithLabel';
import {
  actionSetLoading, //vbn for the Loading screen
  actionSetRefreshing,
  actionSetRefreshingPage,
} from '../../../action/ActionSettings';

import {actionSetEmergencyJoblistNotificationCount} from '../../../action/ActionCurrentPage';
import {
  actionSetJobDate,
  actionSetIsStandByPermission,
} from '../../../action/ActionVersion';
import {actionSetInternetConnection} from '../../../action/ActionInternetConnection';
import {
  actionSetAlertPopUp,
  actionSetAlertPopUpTwo,
} from '../../../action/ActionAlertPopUp';
import {actionSetDrawer} from '../../../action/ActionBottomDrawer';
const screenHeight = Dimensions.get('window').height;
console.log({screenHeight});
import {RNCamera} from 'react-native-camera';
import {description, HomeStyles, legend} from '../../supervisor/HomeScreen';
import StatusLabelView from '../../components/StatusLabelView';
import DatePickerCmms from '../../components/DatePickerCmms';
import JobOrderView from '../../components/JobOrderView';
import {CmmsText} from '../../../common/components/CmmsText';
import resetNavigation from '../../../navigation/resetNavigation';
import {useRoute} from '@react-navigation/native';
import messaging, {firebase} from '@react-native-firebase/messaging';
import {actionSetLoginData} from '../../../action/ActionLogin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SvgXml} from 'react-native-svg';
import {xml_pause_btn_red, xml_power_btn_green} from '../../../common/SvgIcons';
import JobStartingPopUp from './components/JobStartingPopUp';
import getJobListCnt from '../../getJobListCnt';
import QRCodeScanner from 'react-native-qrcode-scanner';
import QrCodeScanner from '../../QrCodeScanner/QrCodeScanner';
import ASK from '../../../constants/ASK';
import {useIsFocused} from '@react-navigation/native';
const TAG = 'TechHome';
const iconSize = 32;
import {actionSetJobOrderReport} from '../../../action/ActionJobOrderReport';
import {actionSetJobOrderReportVisit} from '../../../action/ActionCurrentPage';
import {actionSetEmergencyJoblistNotificationCountUpdate} from '../../../action/ActionNotificationJob';
import {showAlert} from '../../../common/utils';
import Alerts from '../../components/Alert/Alerts';
import {useNetInfo} from '@react-native-community/netinfo';
import EmergencyJobListModal from '../components/EmergencyJobListModal';
import FadeView from '../../components/fadeView/FadeView';

const Height = Dimensions.get('window').height;
const Width = Dimensions.get('window').width;

export default HomeScreen = ({navigation, route: {params, name}}) => {
  // console.log('cycle count==>>', EmergencyJoblistNotifactionBgStatus);
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const {CheckInternetConnection} = useSelector(
    (state) => state.IntetnetConnectionReducer,
  );

  const {EmergencyJoblistNotifactionCountUpdate} = useSelector(
    (state) => state.NotificationJobReducer,
  );
  const {BottomDrawerOpen} = useSelector(
    (state) => state.BottomDrawerOpenReducer,
  );

  const {jobDate, IsStandbyPermission} = useSelector(
    (state) => state.VersionReducer,
  );
  const {EmergencyJoblistNotifactionBgStatus} = useSelector(
    (state) => state.CurrentPageReducer,
  );
  const uRoutes = useRoute();
  const {
    loggedUser: {
      TechnicianID = TechnicianID ? TechnicianID : null,
      TechnicianName = TechnicianName ? TechnicianName : null,
    },
  } = useSelector((state) => state.LoginReducer);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'dd/MM/yyyy'),
  ); //format(new Date(), 'dd/MM/yyyy')
  // console.error('selected date state value==>>>', selectedDate);
  const [chartData, setChartData] = useState([]);

  const [selectedJob, setSelectedJob] = useState({});

  //console.log('seleted job->>>>>', {selectedJob});
  const {refresh} = useSelector((state) => state.SettingsReducer);
  const {isLoading} = useSelector((state) => state.SettingsReducer);
  const {refreshPage} = useSelector((state) => state.SettingsReducer);
  const {EmergencyJoblistNotifactionCount} = useSelector(
    (state) => state.CurrentPageReducer,
  );
  const [showJoStartingPopUp, setshowJoStartingPopUp] = useState(false);
  const [JobStopedWithoutSave, setJobStopedWithoutSave] = useState(false);
  const [EmergencyJobList, setEmergencyJobList] = useState(false);
  const [EmergencyJobListShow, setEmergencyJobListShow] = useState(false);
  const [EmergencyJoblistSelectedJob, setEmergencyJoblistSelectedJob] =
    useState({});

  const [stopButtonPressed, setStopButtonPressed] = useState(false); //not using
  const [popUp, setpopUp] = useState(false);
  const dispatch = useDispatch();
  const InterNet = useNetInfo();
  const graphColors = chartData.map((e) => {
    return processColor(e.color);
  });

  const data = {
    dataSets: [
      {
        values: chartData,
        label: '',
        config: {
          colors: graphColors?.length > 0 ? graphColors : [],
          // colors:
          //   chartData.length == 3
          //     ? [
          //         processColor(chartData[0].color),
          //         processColor(chartData[1].color),
          //         processColor(chartData[2].color),
          //       ]
          //     : [],
          valueTextSize: 12,
          valueTextColor: processColor('white'),
          sliceSpace: 0,
          selectionShift: 10,
          fontFamily: 'sans-serif-condensed',
          // xValuePosition: "OUTSIDE_SLICE",
          // yValuePosition: "OUTSIDE_SLICE",
          valueFormatter: "#.#'%'",
          valueLineColor: processColor('black'),
          valueLinePart1Length: 0.9,
        },
      },
    ],
  };

  const [IsVisibleGraph, setIsVisibleGraph] = useState(true);
  const [jobOrderList, setJobOrderList] = useState([]);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const panelRef = useRef(null);
  const [visibleReasonDlg, setVisibleReasonDlg] = useState(false);
  const {
    timer,
    isActive,
    isPaused,
    handleStart,
    handlePause,
    handleResume,
    handleReset,
    clearTimer,
    setTimer,
    handleLocalStart,
    setIsPaused,
    setIsActive,
    StartTimer,
    PauseTimer,
    ResumeTimer,
  } = useTimer(0, TechnicianID, navigation, panelRef);
  const [selectedReasonId, setSelectedReasonId] = useState(1);
  const [reasonList, setReasonList] = useState([]);
  const [sparePartsList, setSparePartsList] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [visibleBarcodeScanner, setVisibleBarcodeScanner] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const {jobListCnt} = useSelector((state) => state.RealTimeDataReducer);
  const [action, setAction] = useState('Admin');
  const [animattedHeight, setAnimattedHeight] = useState(
    new Animated.Value(Math.floor(screenHeight / 3)),
  );
  // **** newly added states****
  const [modal, setModal] = useState(false);
  const [item, setItem] = useState([]);
  const [workId, setWorkId] = useState({});
  const [isScanfailed, setisScanfailed] = useState(false);
  const [actionData, setActionData] = useState([]);
  const [workNatureData, setWorkNatureData] = useState([]);

  const [selectionID, setSelectionID] = useState('');
  const [JOIDDDD, setJOIDDDD] = useState(0);
  // const [ReasonListStatus, setReasonListStatus] = useState(1);
  const [ReasonTypeId, setReasonTypeId] = useState(0);
  const [Reason, setReason] = useState('');
  const [PersonalBreak, setPersonalBreak] = useState(false);
  const [AssetName, SetAssetName] = useState('');
  const [AssetCode, setAssetCode] = useState('');
  const [AssetID, setAssetID] = useState('');
  const [SelectedReasonList, setSelectedReasonList] = useState('');
  const [IsBreakdown, setIsBreakdown] = useState(false);
  // const [NewBreakdownJobArived, setNewBreakdownJobArived] = useState([]);
  const [IsHeworking, setIsheWorking] = useState(true);
  const [maintananceJobType, setMaintananceJobType] = useState('');
  const [Mislenious, setMislenious] = useState(false);
  const [StandBy, setStandBy] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); //Bottom Drawer PopUp
  const [showModal, setShowModal] = useState(false); //Reason PopUp
  const [popUpcontent, setPopupContent] = useState({
    visible: false,
    title: '',
    body: '',
    type: '',
  });
  const isFocused = useIsFocused();
  const {JobOrderReportData} = useSelector((state) => {
    // console.log({JobOrderReportReducer_state: state.JobOrderReportReducer});
    return state.JobOrderReportReducer;
  });
  const {JobOrderReportVisit} = useSelector((state) => {
    return state.CurrentPageReducer;
  });
  const {AlertPopUp, AlertPopUpTwo} = useSelector((state) => {
    return state.AlertPopUpReducer;
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (props) => {
        // console.log('techhome_ule_hr: ', {props});
        return (
          <View
            style={{flexDirection: 'row', marginEnd: 8, alignItems: 'center'}}>
            {/*vbn break down */}
            <TouchableOpacity
              style={{padding: 4, marginEnd: 5}}
              onPress={() => {
                setStandBy(false);
                InitialjobCheck(1);
              }}>
              <Image
                style={{height: 24, width: 24}}
                source={require('../../../assets/icons/Break.png')}
              />
              {/* <Icon name="coffee" size={24} color="grey" /> */}
            </TouchableOpacity>
            {/*vbn mislenious */}
            {/* <TouchableOpacity
              style={{padding: 4, marginEnd: 5}}
              onPress={() => {
                //use to check the initial job check to start the Mislenious job
                // InitialjobCheck(3);
                // NotificationSound.play();
                // console.error(
                //   'internet connection status==>>',
                //   BottomDrawerOpen,
                // );
                console.log(
                  'EmergencyJoblistNotifactionCountUpdate==>>',
                  EmergencyJoblistNotifactionCountUpdate,
                );
              }}>
              <Text color="grey" style={{fontSize: 20, fontWeight: 'bold'}}>
                M
              </Text>
            </TouchableOpacity> */}
            {/*vbn StandBy */}
            <TouchableOpacity
              style={{padding: 4, marginEnd: 5}}
              onPress={() => {
                setIsBreakdown(false);
                console.error('EmergencyJobList==>', EmergencyJobList);
                if (IsStandbyPermission == true) {
                  //use to check the initial job check to start the Mislenious job
                  InitialjobCheck(4);
                  // console.error(
                  //   'internet connection status==>>',
                  //   CheckInternetConnection,
                  // );=
                } else {
                  dispatch(
                    actionSetAlertPopUpTwo({
                      title: AppTextData.txt_Alert,
                      body: AppTextData.txt_Sorry_You_have_no_Premission,
                      visible: true,
                      type: 'ok',
                    }),
                  );
                }
                // const NewArray = [];
                // NewArray.push(AppTextData);
                // Object.keys(NewArray).filter(function(key) {
                //   return key.indexOf("name") === 0; // filter keys that start with "name"
                // })
                // console.error(
                //   'searching the apptext data==>>',
                //   // [AppTextData].filter((e) => e.includes('Invalid')),
                //   // NewArray.includes((e) => e == 'invalid Qr Code'),
                //   NewArray,
                // );
              }}>
              <Text color="grey" style={{fontSize: 23, fontWeight: 'bold'}}>
                S
              </Text>
            </TouchableOpacity>
            {/* bell icon (commented by vbn) */}
            <TouchableOpacity
              style={{
                width: 40,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 5,
                padding: 4,
                marginEnd: 5,
              }}
              onPress={() => {
                if (EmergencyJoblistNotifactionCount == 0) {
                  dispatch(
                    actionSetAlertPopUpTwo({
                      title: AppTextData.txt_Alert,
                      body: AppTextData.txt_No_Notification,
                      visible: true,
                      type: 'ok',
                    }),
                  );
                } else {
                  console.log(
                    'what are the data in the JoborderReport data Redux--->>>',
                    JobOrderReportData,
                  );
                  // InitialjobCheck(5);
                  if (modalVisible == true) {
                    setModalVisible((modalVisible) => !modalVisible);
                  }
                  setEmergencyJobListShow(true);
                }
                // setVisibleBarcodeScanner(true);//commented by vbn(Qr code is already done by us)
                // if(isPaused)
                // jobListCnt !=0 && navigation.navigate('EmergencyJobOrders',{selectedDate})
                // else alert("You are already working on a job")
              }}>
              <Icon name="bell" size={24} color="grey" />
              <CmmsText
                style={{
                  position: 'absolute',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}>
                {EmergencyJoblistNotifactionCount}
              </CmmsText>
            </TouchableOpacity>
            {/* Chat */}
            {/* <TouchableOpacity
              style={{padding: 4, marginEnd: 5}}
              onPress={() => {
                navigation.navigate('ChatHistoryPage');
                
              }}>
              <Icon name="commenting" size={24} color="grey" />
            </TouchableOpacity> */}
            {/* <TouchableOpacity
              style={{padding: 4, marginEnd: 5}}
              onPress={() => {
                // navigation.navigate('SparepartsRequired');CycleCount
                navigation.navigate('CycleCount');
              }}>
              <Icon name="wrench" size={24} color="grey" />
            </TouchableOpacity> */}
            {/* logout button */}
            <TouchableOpacity
              style={{padding: 4}}
              onPress={() => {
                console.log('logout');
                //   dispatch(actionSetAlertPopUp(true));
                // }}>
                {
                  /* <Alerts
                title={AppTextData.txt_Logout}
                body={
                  TechnicianName +
                  ' ' +
                  AppTextData.txt_Are_you_sure_You_want_to_logout
                }
                visible={AlertPopUp}
                onYes={() => {
                  dispatch(actionSetAlertPopUp(false)), Logout();
                }}
                onNo={() => dispatch(actionSetAlertPopUp(false))}
              /> */
                }
                Alert.alert(
                  AppTextData.txt_Logout,
                  AppTextData.txt_Are_you_sure_You_want_to_logout,
                  [
                    {
                      text: AppTextData.txt_No,
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: AppTextData.txt_Yes,
                      onPress: () => {
                        Logout();
                      },
                    },
                  ],
                );
              }}>
              <Icon name="user-circle-o" size={24} color="grey" />
            </TouchableOpacity>
          </View>
        );
      },
    });
  });

  useEffect(() => {
    {
      AsyncStorage.getItem(ASK.ASK_LANGUAGE).then((res) => {
        console.log('Language Details RESPONSE===>>>', {res});
        if (res != null) {
          const SelectedLanguage = JSON.parse(res);
          console.log(
            'Language Details from the AsyncStorage>>>',
            SelectedLanguage.Language,
          ); //vbn
        }
      });
    }
  }, []);

  useEffect(()=>{
    //http://185.250.36.197:2021/api/Common/GetMaster?FormID=WORKNATURE&BranchID=0&PeriodID=0&OL=ol
    requestWithEndUrl(`${API_COMMON}GetMaster`,{FormID:'WORKNATURE',BranchID:0,PeriodID:0,OL:'ol'})
      .then((res) => {
        console.log('GetMaster-WORKNATURE', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        setWorkNatureData(data)
      })
      .catch(err=>{
        console.error("GetMaster-WORKNATURE",err);
      })
  },[])
  //useEffect1
  //vbn this useEffect used to Update DashBoard Data by Date and the Refresh call
  useEffect(() => {
    if (jobDate != '') {
      getJobOrderNChartDetails();
    }
  }, [jobDate, refresh]);

  useEffect(()=>{
    console.log("JIJU",{selectedJob})
  },[selectedJob])

  async function getJobOrderNChartDetails() {
    console.log('getJobOrderNChartDetails function');
    dispatch(actionSetLoading(true));

    try {
      const dateTime = Date.now(); //1577946600000
      const selectedTimemillies = parse(
        jobDate,
        'dd/MM/yyyy',
        new Date(),
      ).getTime();
      const workPieGraphRes = await requestWithEndUrl(
        `${API_TECHNICIAN}GetWorkStatusPieGraphByDate`,
        {
          CurrentDate: dateTime,
          Date: selectedTimemillies,
          SEID: TechnicianID,
        },
      );
      //vbn List of works scheduled to the worker
      const workSheduledListRes = await requestWithEndUrl(
        `${API_TECHNICIAN}GetJOScheduleByDate`,
        {
          CurrentDate: dateTime,
          Date: selectedTimemillies,
          SEID: TechnicianID,
        },
      );
      console.log(
        'params for get job schedulebydate call>>>',
        'CurrentDate:',
        dateTime,
        'Date:',
        selectedTimemillies,
        'SEID: ',
        TechnicianID,
      );
      //  [{ value: 45, label: 'Not Done', color: 'red' },
      //   { value: 15, label: 'On Time', color: 'green' }, { value: 45, label: 'Delayed', color: 'yellow' }]
      setChartData(workPieGraphRes.data);
      console.log('chart data--->>', workPieGraphRes.data);
      setJobOrderList(workSheduledListRes.data);

      console.log('job order list is>>>>>>', workSheduledListRes.data);
      dispatch(actionSetLoading(false));
    } catch (err) {
      console.error(err);
      dispatch(actionSetAlertPopUp(true));
      // alert(AppTextData.txt_somthing_wrong_contact_admin);
      dispatch(
        actionSetAlertPopUpTwo({
          title: AppTextData.txt_Alert,
          body: AppTextData.txt_somthing_wrong_contact_admin,
          visible: true,
          type: 'ok',
        }),
      );
      dispatch(actionSetLoading(false));
    }
  }
  //useEffect 2
  useEffect(() => {
    if (jobDate != '') {
      // checkAlreadyWorking(); //june 26 2023
      InitialjobCheck();
    }
  }, [jobDate]);

  const checkAlreadyWorking = async () => {
    const selectedTimemillies = parse(
      jobDate,
      'dd/MM/yyyy',
      new Date(),
    ).getTime();
    // getJobListCnt(dispatch, selectedTimemillies, TechnicianID);
    try {
      const alreadyWorkingRes = await requestWithEndUrl(
        `${API_TECHNICIAN}CheckAlreadyWorking`,
        {SEID: TechnicianID},
      );
      const {IsWorking, TNO} = alreadyWorkingRes?.data;
      // vbn initialy running work condition check
      console.log(
        'initial running work condition check---->>>1',
        alreadyWorkingRes?.data,
      );
      // console.log(
      //   'initial running work Is Working value check---->>>',
      //   alreadyWorkingRes?.data.IsWorking.IsWorking + '+' + IsWorking,
      // );
      setIsheWorking(IsWorking); //checking the working status to enable and Disable HomeScreen Breakdown Button
      if (IsWorking) {
        // alert(`${AppTextData.txt_alr_wrk_in_job} ${TNO}`);
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: `${AppTextData.txt_alr_wrk_in_job} ${TNO}`,
            visible: true,
            type: 'ok',
          }),
        );
        setReason(alreadyWorkingRes?.data?.Reason);
        setJOIDDDD(alreadyWorkingRes?.data?.JOID);
        setWorkId({
          WorkID: alreadyWorkingRes?.data?.WorkID,
          JobId: alreadyWorkingRes?.data?.JOID,
          WorkType: alreadyWorkingRes?.data?.WorkType,
        });
        setSelectedJob(alreadyWorkingRes?.data);
        SetAssetName(
          alreadyWorkingRes?.data?.JOID == 0
            ? ''
            : alreadyWorkingRes?.data?.Asset,
        );
        setAssetCode(
          alreadyWorkingRes?.data?.JOID == 0
            ? ''
            : alreadyWorkingRes?.data?.Code,
        );
        setAssetID(alreadyWorkingRes?.data?.AssetID);
        setMaintananceJobType(alreadyWorkingRes?.data?.MaintenanceJobTypeID);
      }
    } catch (err) {
      // ****15 dec****
      // console.error({err});
      // alert(AppTextData.txt_somthing_wrong_contact_admin);
      // ******
    }
  };

  // useEffect3
  useEffect(() => {
    // const data = UserData();
    // console.log(
    //   'what is the user data from a the function -->>',
    //   UserData(),
    //   'data==>',
    //   JSON.stringify(data),
    // );
    // getReasonList();

    const bgMsgHandler = messaging().setBackgroundMessageHandler(
      async (remoteMessage) => {
        console.log(TAG, 'Message handled in the background!', remoteMessage);
        handleFirebaseMsgFg(remoteMessage);
      },
    );
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log(TAG, 'Message handled in the foreground!', remoteMessage);
      handleFirebaseMsgFg(remoteMessage);
    });
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(TAG, 'onNotificationOpenedApp', {remoteMessage});
      handleFirebaseMsgFg(remoteMessage, true);
    });
    // messaging().getInitialNotification(initialNotification=>{
    //   console.log(TAG,'getInitialNotification:',initialNotification);
    //  })

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        console.log(remoteMessage); // always prints null
        if (remoteMessage) {
          handleFirebaseMsgFg(remoteMessage, true);
        }
      });

    () => {
      unsubscribe;
      bgMsgHandler;
      // backgroundMessageHandler;
    };
  }, []);

  const UserData = async () => {
    const User = JSON.parse(await AsyncStorage.getItem(ASK.ASK_USER));
    if (User.UserType == 1) {
      if (modalVisible == true) {
        setModalVisible((modalVisible) => !modalVisible);
      }
      setEmergencyJobListShow(true);
    }
  };
  //vbn firebase logout function
  function handleFirebaseMsgFg(remoteMessage, fromNotificationOpened = false) {
    console.log('remoteMessage.data.typ', remoteMessage.data.type);
    switch (('remoteMessage data type', remoteMessage.data.type)) {
      case 'TYPE_LOG_OUT':
        AsyncStorage.removeItem(ASK.ASK_USER);

        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
        break;
      case 'TYPE_EMERGENCY_JOB_LIST_CNT':
        //Firebase type to get the emergency joblist count
        console.log(
          'TYPE_EMERGENCY_JOB_LIST_CNT',
          remoteMessage.data.EmergencyJobListCnt,
        );
        const lJobListCnt = remoteMessage.data.EmergencyJobListCnt;
        // dispatch(actionSetJobListCnt(lJobListCnt));
        if (fromNotificationOpened && lJobListCnt != 0) {
          UserData();
        }

        dispatch(actionSetEmergencyJoblistNotificationCount(lJobListCnt));
        break;

      case 'TYPE_REFRESH_TECHNICIAN_ALL_DATA':
        dispatch(actionSetRefreshing());
        break;
      default:
        break;
    }
  }

  function getReasonList() {
    //http://213.136.84.57:4545/api/ApkTechnician/GetReasons
    requestWithEndUrl(`${API_TECHNICIAN}GetReasons`)
      .then((res) => {
        console.log('GetReasons', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        if (data.length > 0) {
          setReasonList(data);
          setSelectedReasonId(data[0].ID);
        }
      })
      .catch((err) => {
        console.error('URL_GetReasons', {err});
      });
  }
  //useEffect4
  useEffect(() => {
    console.log('is getting function call--->>>');
    //http://213.136.84.57:4545/api/ApkTechnician/GetWorkingTime?JOID=1333&SEID=24
    //http://localhost:29189/api/ApkTechnician/GetJOWiseSpareParts?JOID=1321&SEID=6
    //http://localhost:29189/api/ApkTechnician/GetJOWiseActivity?JOID=1321&SEID=6
    const fetchJobOrderWiseDetails = async () => {
      //vbn joid==0 has no success call from 'c' and 'GetJOWiseActivity' call
      console.log(
        'Useeffect 4 params---->>>',
        'JOID:::' + selectedJob.JOID,
        'SEID::::' + TechnicianID,
      );
      try {
        dispatch(actionSetLoading(true));
        const jobOrderStatusDetRes = await requestWithEndUrl(
          `${API_TECHNICIAN}GetWorkingTime`,
          {JOID: selectedJob.JOID, SEID: TechnicianID},
        );
        const sparePartsRes = await requestWithEndUrl(
          `${API_TECHNICIAN}GetJOWiseSpareParts`,
          {JOID: selectedJob.JOID, SEID: TechnicianID},
        );
        const activityRes = await requestWithEndUrl(
          `${API_TECHNICIAN}GetJOWiseActivity`,
          {JOID: selectedJob.JOID, SEID: TechnicianID},
        );
        const jobOrderStatusDet = jobOrderStatusDetRes.data;
        setTimer(Number(jobOrderStatusDet.WorkTime));
        // 1-start 2-break 3-continue 4-stop
        switch (jobOrderStatusDet.Status) {
          case 1:
            handleLocalStart();
            break;
          case 2:
            setIsActive(true);
            setIsPaused(true);
            break;
          case 3:
            setIsPaused(false);
            handleLocalStart();
            break;
          default:
            break;
        }
        setSparePartsList(sparePartsRes.data);
        setActivityList(activityRes.data);
        setTimeout(() => {
          //drawer poupup open
          setModalVisible(true);
        }, 1000);
      } catch (error) {
        // ******15 dec*****
        console.error({error});
        // alert(AppTextData.txt_somthing_wrong_try_again);
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: AppTextData.txt_somthing_wrong_try_again,
            visible: true,
            type: 'ok',
          }),
        );
      }
      dispatch(actionSetLoading(false));
    };

    Object.keys(selectedJob).length > 0 && fetchJobOrderWiseDetails();
  }, [selectedJob]);

  //useEffect5
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        console.log(
          'TechHomeScreen_hardwareBackPress',
          name,
          'vvj',
          uRoutes.name,
          'getstates:',
          navigation.canGoBack(),
        );
        const canGoBack = navigation.canGoBack();
        canGoBack && navigation.goBack();
        return canGoBack;
      },
    );

    return () => backHandler.remove();
  }, []);

  function getStatusDetails(status) {
    switch (status) {
      case 0:
        return {status: AppTextData.txt_Pending, color: CmmsColors.joPending};
      case 1:
        return {status: AppTextData.txt_Closed, color: CmmsColors.joDone};
      // case 2: return { status: 'Pending', color: CmmsColors.joSilverAlpha, icon: require('../../../assets/icons/ic_jo_silver.png') }
      case 2:
        return {status: AppTextData.txt_WIP, color: CmmsColors.joWip};
      default:
        return null;
    }
  }

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  function setAnimation(disable) {
    Animated.timing(animattedHeight, {
      duration: 100,
      toValue: disable ? 0 : screenHeight / 3,
      useNativeDriver: false,
    }).start();
    setIsVisibleGraph(!disable);
  }

  //UseEffect 6 Newly added by vbn

  useEffect(() => {
    //using for "Automatically check the job after Press the save button from the JOR page"
    if (refreshPage == true) {
      console.log('joborder useeffect if 1');
      // PauseTimer();
      // panelRef?.current?.togglePanel();
      setModalVisible(false);
      dispatch(actionSetRefreshingPage(false));
      RefreshCall(5);
    }
  }, [refreshPage]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('inside the page focus');
      dispatch(actionSetEmergencyJoblistNotificationCountUpdate());
      if (JobOrderReportVisit == true) {
        dispatch(actionSetJobOrderReport({}));
        dispatch(actionSetJobOrderReportVisit(false));
        InitialjobCheck();
        dispatch(actionSetRefreshing(true));
      }
    });

    return unsubscribe;
  }, [navigation, JobOrderReportVisit]);

  useEffect(() => {
    //auto close alert if the Model is open
    console.log('showmodal and ModelVisible state ');
    if (modalVisible == true) {
      dispatch(actionSetAlertPopUpTwo({visible: false}));
    }
    // if (modalVisible == false && JobStopedWithoutSave == true) {
    //   console.log('it will change the setJobStopedWithoutSave== false');
    //   setJobStopedWithoutSave(false);
    // }
  }, [modalVisible]);
  function getJoblist(Status) {
    dispatch(actionSetLoading(true));
    console.log('inside the Getjoblist status---->>>>>', Status);
    // setReasonListStatus(Status);
    requestWithEndUrl(
      `${API_TECHNICIAN}ReasonList?ReasonCondition=` + Status,
    ).then((response) => {
      console.log('heeeeeee    ', response);
      setActionData(response.data);
      // if (Status == 2) {
        dispatch(actionSetLoading(false));
      setShowModal(true);
      // }
    });
  }

  function StartJob(WorkNatureID="") {
    // function to Start a new job by by Selecting the Reasons
    console.log('<<<<===start Job function===>>>>');
    console.log('selected job ReasonTypeId------>>>>', ReasonTypeId);
    console.log('what is the selection id----->>', selectionID);
    const params = {
      SEID: TechnicianID,
      ReasonID: selectionID,
      JOID: ReasonTypeId == 1 || IsBreakdown == true ? 0 : JOIDDDD, //vbn i mistakly given selectionID==13 insted of ReasonTypeId ==1
      WorkNatureID
    };
    console.log('params for AdministrationStatus---?????', params);
    // if (EmergencyJobList == false) {
    requestWithEndUrl(`${API_TECHNICIAN}AdministrationStatus`, params, 'POST')
      .then((res) => {
        console.log('StartJob api response->>>>>>>', res.data);
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        setShowModal(false);
        console.log('Start job response---->>>>>>>>' + data.status);
        // setReason(SelectedReasonList ? SelectedReasonList : '');
        if (data.isSucess == 1) {
          clearTimer();
          if (IsBreakdown == true) {
            console.log('---St1----');
            RefreshCall(3);
            // setIsBreakdown(false);
          } else if (ReasonTypeId == 5) {
            //ok
            //"ID": 15, "Reason": "Personal Break", "ReasonTypeID": 5
            console.log('---St2----');
            setModalVisible(false);
            // panelRef?.current?.togglePanel();
            RefreshCall(1);
            //pausetimer
          } else if (item.Status == 0) {
            console.log('---St3----');
            RefreshCall();
            // } else if (
            //   item.Reason == 'Personal Break' ||
            //   Reason == 'Personal Break'
            // ) {
            //   console.log('---St4----');
            //   panelRef?.current?.togglePanel();
            //   RefreshCall(2);
          } else {
            console.log('---St5----');
            setModalVisible(false);
            // panelRef?.current?.togglePanel();
            RefreshCall();
          }
        } else if (data.isSucess == 2) {
          Alert.alert(
            AppTextData.txt_Alert,
            AppTextData.txt_Sorry_this_Job_has_reassinged_to_another_employee,
            [
              {
                text: AppTextData.txt_OK,
                onPress: () => {
                  console.log('ok button pressed');
                  dispatch(actionSetRefreshing(true));
                },
              },
            ],
          );
        } else {
          // alert(data.Message + ',');
          // setShowModal(false);
          setIsBreakdown(false);
          dispatch(
            actionSetAlertPopUpTwo({
              title: AppTextData.txt_Alert,
              body: AppTextData.txt_Plese_Enter_previous_service_report,
              visible: true,
              type: 'ok',
            }),
          );
        }
      })
      .catch((err) => {
        console.error("StartJob",err);
        setShowModal(false);
        setIsBreakdown(false);
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: AppTextData.txt_somthing_wrong_try_again,
            visible: true,
            type: 'ok',
          }),
        );
        // ****15 dec****
        // console.error('StartJob Error catch>>>>', err);
        // alert('Error in Start job, Try again');
      })
      .finally(()=>dispatch(actionSetLoading(false)));
    // } else {
    //   setEmergencyJobList(false);
    // }
  }

  async function StartEmergencyJob() {
    //Start an Emergency Job List Directly from the HomePage(bell icon)
    try {
      console.log('Home page breakdown parameter is there????');
      const params = {
        AssetCode: EmergencyJoblistSelectedJob.Code,
        SEID: TechnicianID,
        WorkID: EmergencyJoblistSelectedJob.WorkID,
        ReasonID: selectionID,
      };
      console.log('params for StartCustodianMachineCode api call==>>', params);
      const alreadyWorkingRes = await requestWithEndUrl(
        `${API_TECHNICIAN}StartCustodianMachineCode`,
        {
          AssetCode: EmergencyJoblistSelectedJob.Code,
          SEID: TechnicianID,
          WorkID: EmergencyJoblistSelectedJob.WorkID,
          ReasonID: selectionID,
        },
        'POST',
      );
      console.log('StartCustodianMachineCode');
      setShowModal(false);
      setEmergencyJobListShow(false); //disable the Emergency Joblist PopUp
      setModalVisible(false);
      setEmergencyJobList(false);
      setEmergencyJoblistSelectedJob();

      if (alreadyWorkingRes.data.isSucess == true) {
        dispatch(actionSetEmergencyJoblistNotificationCountUpdate());
        console.log('StartCustodianMachineCode is succes= true');
        RefreshCall();
      } else if (alreadyWorkingRes.data.isSucess == false) {
        console.log('StartCustodianMachineCode is succes= true');
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            // body: statusDetails(data.Message),
            body: data.Message,
            visible: true,
            type: 'ok',
          }),
        );
      }
    } catch (error) {
      setShowModal(false);
      // setTimeout(() => {
      //   console.log('timer');
      setEmergencyJobList(false);
      // }, 100);
      setEmergencyJobListShow(false);
      setModalVisible(false);
      setEmergencyJoblistSelectedJob();
      console.log('Error in StartCustodianMachineCode', error);
      dispatch(
        actionSetAlertPopUpTwo({
          title: AppTextData.txt_Alert,
          body: AppTextData.txt_somthing_wrong_try_again,
          visible: true,
          type: 'ok',
        }),
      );
    }
    dispatch(actionSetLoading(false))
  }
  async function SeriesFunction() {
    setTimeout(function () {
      console.log('inside the series functions');
      return true;
    }, 1000);
  }
  //************** */
  async function Qrcodefunction(data) {
    console.log('mislenious===>>', Mislenious, 'Stand By==>>', StandBy);
    setisScanfailed(false);
    dispatch(actionSetLoading(true));
    console.log('work id>>>', workId);
    console.log('inside QR code function data');
    // try {
    if (Mislenious == true || StandBy == true) {
      console.error('StandBy api call started==>>');
      const param = {
        AssetCode: data?.data,
        SEID: TechnicianID,
      };
      console.log('params for MIS Qrcode scanning->>>>', param);
      requestWithEndUrl(
        `${API_TECHNICIAN}ScanMachineCodeForMiscellaneous`,
        param,
        'POST',
      )
        .then((res) => {
          console.log('qr code scan api response->>>>>>>', res.data);
          if (res.status != 200) {
            throw Error(res.statusText);
          }
          return res.data;
        })
        .then((data) => {
          console.error('StandBy api cal 200==>>');
          dispatch(actionSetLoading(false));
          console.log('SMC Qr code api response data----->>>>>', data);
          if (data.isSucess == 1 || data.isSucess == true) {
            clearTimer();
            setModal(false);
            console.log('---Qr7----');
            RefreshCall(3);
          } else if (data.isSucess == 0 || data.isSucess == false) {
            setModal(false);
            setStandBy(false);
            console.log('---Qr8----');
            dispatch(
              actionSetAlertPopUpTwo({
                title: AppTextData.txt_Alert,
                body: statusDetails(data.Message),
                visible: true,
                type: 'ok',
              }),
            );
            console.log('scan issuccess==0 or false', data);
          }
        })
        .catch((err) => {
          console.error('Standby qr code scan api catch==>>', err);
          dispatch(actionSetLoading(false));
          setModal(false);
          setMislenious(false);
          setStandBy(false);
          setisScanfailed(true);
          dispatch(
            actionSetAlertPopUpTwo({
              title: AppTextData.txt_Alert,
              body: AppTextData.txt_somthing_wrong_try_again,
              visible: true,
              type: 'ok',
            }),
          );
        });
    } else {
      const params = {
        AssetCode: data?.data,
        SEID: TechnicianID,
        JOID:
          workId?.JobId == 0 || selectedJob.JOID == 0 || IsBreakdown == true
            ? 0
            : workId.JobId,
        WorkID: workId?.JobId == 0 || IsBreakdown == true ? 0 : workId?.WorkID,
        WorkType:
          workId?.JobId == 0 || IsBreakdown == true ? 0 : workId?.WorkType,
      };
      console.log('params for Qrcode scanning->>>>', params);
      requestWithEndUrl(`${API_TECHNICIAN}ScanMachineCode`, params, 'POST')
        .then((res) => {
          console.log('qr code scan api response->>>>>>>', res.data);
          if (res.status != 200) {
            throw Error(res.statusText);
          }
          return res.data;
        })
        .then((data) => {
          dispatch(actionSetLoading(false));
          console.log('Qr code api response data----->>>>>', data);
          if (data.isSucess == 1 || data.isSucess == true) {
            clearTimer();
            setModal(false);
            setShowModal(false);
            if (IsBreakdown == true) {
              console.log('---Qr1----');
              RefreshCall(3);
            } else if (item.Status == 0) {
              console.log('---Qr3----');
              RefreshCall();
            } else if (workId?.JobId == 0 || selectedJob.JOID == 0) {
              setModalVisible(false);
              RefreshCall(4);
            } else {
              console.log('---Qr4----');
              setModalVisible(false);
              RefreshCall();
            }
          } else if (data.isSucess == 0 || data.isSucess == false) {
            setModal(false);
            setShowModal(false);
            setIsBreakdown(false);
            console.log('---Qr5----');
            dispatch(
              actionSetAlertPopUpTwo({
                title: AppTextData.txt_Alert,
                // body: AppTextData.txt_somthing_wrong_try_again,
                body: statusDetails(data.Message),
                visible: true,
                type: 'ok',
              }),
            );
            console.log('scan issuccess==0 or false', data);
            setModal(false);
            setShowModal(false);
          }
        })
        .catch((err) => {
          console.error('qr code scan api catch==>>', err);
          dispatch(actionSetLoading(false));
          setModal(false);
          setIsBreakdown(false);
          setShowModal(false);
          setisScanfailed(true);
          dispatch(
            actionSetAlertPopUpTwo({
              title: AppTextData.txt_Alert,
              body: AppTextData.txt_somthing_wrong_try_again,
              visible: true,
              type: 'ok',
            }),
          );
        });
    }
  }

  async function InitialjobCheck(e) {
    console.log('----InitialjobCheck----');
    console.log('Home page breakdown parameter is there????', e);
    dispatch(actionSetLoading(true));
    const selectedTimemillies = parse(
      jobDate,
      'dd/MM/yyyy',
      new Date(),
    ).getTime();
    // getJobListCnt(dispatch, selectedTimemillies, TechnicianID);emergencyjoblistcount
    const alreadyWorkingRes = await requestWithEndUrl(
      `${API_TECHNICIAN}CheckAlreadyWorking`,
      {SEID: TechnicianID},
    )
    dispatch(actionSetLoading(false));
    console.log('222222');
    const {IsWorking, TNO} = alreadyWorkingRes?.data;
    // vbn initialy running work condition check
    console.log(
      'initial running work condition check---->>>2',
      alreadyWorkingRes?.data,
    );
    setIsheWorking(IsWorking); //checking the working status to enable and Disable HomeScreen Breakdown Button
    if (e == 5) {
      //checking Emergency job condition(EmergencyJobList)
      if (
        (IsWorking == true &&
          alreadyWorkingRes?.data?.MaintenanceJobTypeID == 16) ||
        (IsWorking == true && alreadyWorkingRes?.data?.JOID == 0)
      ) {
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: AppTextData.txt_Sorry_Please_close_previous_BreakDown_Job,
            visible: true,
            type: 'ok',
          }),
        );
      } else {
        setEmergencyJobList(true);
        getJoblist(1);
      }
    } else {
      if (IsWorking) {
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: `${AppTextData.txt_alr_wrk_in_job} ${TNO}`,
            visible: true,
            type: 'ok',
          }),
        );
        setReason(alreadyWorkingRes?.data?.Reason);
        console.log("JIJU","InitialjobCheck",{Data:alreadyWorkingRes?.data});
        setSelectedJob(alreadyWorkingRes?.data);
        setJOIDDDD(alreadyWorkingRes?.data?.JOID);
        SetAssetName(
          alreadyWorkingRes?.data?.JOID == 0
            ? ''
            : alreadyWorkingRes?.data?.Asset,
        );
        setAssetCode(
          alreadyWorkingRes?.data?.JOID == 0
            ? ''
            : alreadyWorkingRes?.data?.Code,
        );
        setAssetID(alreadyWorkingRes?.data?.AssetID);
        setWorkId({
          WorkID: alreadyWorkingRes?.data?.WorkID,
          JobId: alreadyWorkingRes?.data?.JOID,
          WorkType: alreadyWorkingRes?.data?.WorkType,
        });
        setMaintananceJobType(alreadyWorkingRes?.data?.MaintenanceJobTypeID);
      } else {
        if (e?.Work) {
          console.log(
            'we are inside e.work parameter on initial check api call',
          );
          if (e.Type == 1) {
            console.log("JIJU","InitialjobCheck-Type-1",{Data:e?.Work})
            setSelectedJob(e?.Work);
          } else if (e.Type == 2) {
            setModalVisible(true);
          }
        } else {
          switch (e) {
            case 1:
              {
                console.log(
                  'else condition to work homepage breakdon joblist call',
                ),
                  getJoblist(1);
                setIsBreakdown(true);
              }
              break;
            case 2:
              console.log(
                'else condition to work homepage breakdon joblist call',
              );
              getJoblist(1);
              break;
            case 3:
              //this conditon used to Start mislenious job
              console.log('mislenious call actived');
              setMislenious(true);
              setModal(true);
              break;
            case 4:
              //this conditon used to Start StandBy job
              console.log('StandBy call actived');
              setStandBy(true);
              setModal(true);
              break;
            default:
              break;
          }
        }
      }
    }
  }

  const RefreshCall = async (data) => {
    console.log('refresh call parameter--->>**', data);
    if (data == 4) {
      console.log('refresh call-->1');
      InitialjobCheck();
      dispatch(actionSetRefreshing(true));
    } else if (data == 5) {
      console.log('refresh call-->2');
      InitialjobCheck();
      dispatch(actionSetRefreshing(true));
    } else {
      console.log('refresh call-->3');
      InitialjobCheck();
      if (data == 1) {
        console.log('refresh call-->4');
        PauseTimer();
      } else if (data == 2) {
        console.log('refresh call-->5');
        ResumeTimer();
      } else if (data == 3) {
        console.log('refresh call-->6');
        setIsBreakdown(false);
        setMislenious(false);
        setStandBy(false);
      }
      console.log('refresh call-->7');
      dispatch(actionSetRefreshing(true));
    }
  };

  const StopJob = async () => {
    if (selectedJob.IsCheckListAvaliable && Reason == 'Job Order Performance') {
      dispatch(actionSetLoading(true));
      console.log(
        'params for get checklist functioncall--->>>',
        workId?.JobId,
        TechnicianID,
        AssetID,
      );
      await requestWithEndUrl(`${API_TECHNICIAN}getchecklist`, {
        JOID: workId?.JobId,
        SEID: TechnicianID,
        AssetRegID: AssetID,
      })
        .then((res) => {
          dispatch(actionSetLoading(false));
          console.log(
            'check list data---->>>>>',
            res?.data?.CheckListGroups?.length > 0,
          );
          if (
            res?.data?.CheckListGroups?.length > 0 &&
            res?.data?.CheckListGroups[0]?.ChecklistItems?.filter(
              (item) => item.IsComplete == false,
            ).length > 0
          ) {
            setModalVisible(false);
            Alert.alert(
              AppTextData.txt_Checklist,
              AppTextData.txt_Plese_complete_CheckList,
              [
                {
                  text: AppTextData.txt_OK,
                  onPress: () => {
                    navigation.navigate('CheckList', {
                      JOID: selectedJob.JOID,
                      ServiceType: selectedJob.ServiceType,
                    });
                  },
                },
              ],
            );
          } else {
            Alert.alert(' ', AppTextData?.txt_Are_You_sure_You_want_to_stop, [
              {
                text: AppTextData.txt_No,
                onPress: () => {
                  console.log('Cancel Pressed');
                  setModalVisible(true);
                },
                style: 'cancel',
              },
              {
                text: AppTextData.txt_Yes,
                onPress: () => {
                  setModalVisible(false);
                  handleReset(selectedJob.JOID, selectedJob.ServiceType);
                },
              },
            ]);
          }
        })
        .catch((err) => {
          console.error('URL_GetReasons', {err});
          dispatch(actionSetLoading(false));
          dispatch(
            actionSetAlertPopUpTwo({
              title: AppTextData.txt_Alert,
              body: AppTextData.txt_somthing_wrong_try_again,
              visible: true,
              type: 'ok',
            }),
          );
          // alert(AppTextData.txt_somthing_wrong_try_again);
        });
    } else {
      Alert.alert(' ', AppTextData?.txt_Are_You_sure_You_want_to_stop, [
        {
          text: AppTextData.txt_No,
          onPress: () => setModalVisible(true),
          style: 'cancel',
        },
        {
          text: AppTextData.txt_Yes,
          onPress: () => {
            setModalVisible(false);
            handleReset(selectedJob.JOID, selectedJob.ServiceType);
          },
        },
      ]);
    }
  };
  const PaueseButtonFunction = () => {
    // console.log('JobStopedWithoutSave==>>', JobStopedWithoutSave);
    if (IsHeworking == true && selectedJob.JOID == 0) {
      console.log('pause button 1=>');
      getJoblist(1);
      // } else if (JobStopedWithoutSave == true) {
      //   getJoblist(1);
    } else if (IsHeworking == false) {
      console.log('pause button 2=>');
      getJoblist(1);
    } else if (
      selectedJob.JOID != 0 &&
      maintananceJobType == 16 &&
      selectedJob.ReasonTypeID != 5
    ) {
      console.log('pause button 3=>');
      //maintananceJobType == 16 inticate that it's a breakdown child job
      getJoblist(3);
    } else if (selectedJob.IsStandBy == true) {
      console.log('pause button 4=>');
      //is StandBy true And It's a breakdown parent job(timer is in pause state)
      getJoblist(5);
    } else if (selectedJob.ReasonTypeID == 5) {
      console.log('pause button 5=>');
      //personal break
      getJoblist(1);
    } else if (selectedJob.BreakDownFrom == 1) {
      //BreakDownFrom ==1 (this job is a parent of a Breakdown Job)
      console.log('pause button 6=>');
      getJoblist(4);
      // } else if (selectedJob.IsStandBy == true) {
      //   console.log('pause button 6=>');
      //   //is StandBy true for the "Standby call from the homepage icon"
      //   getJoblist(5);
    } else {
      console.log('pause button 7=>');
      getJoblist(2);
    }
  };
  const SwipFromTray = (item, Status) => {
    console.log('parameter from the tray==>>', item);
    console.log('parameter from the tray==>>', Status);

    requestWithEndUrl(
      `${API_TECHNICIAN}UpdateActivity`,
      {
        ActivityID: item.ActivityID,
        JOID: selectedJob.JOID,
        SEID: TechnicianID,
        Date: new Date().getTime(),
        Status: Status.Status, // 1-2,0-2,2-0
      },
      'POST',
    )
      .then((res) => {
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        dispatch(actionSetLoading(false));
        if (data.isSucess) {
          item.Status = Status.Status;
          setActivityList((activityList) => [...activityList]);
        }
        // alert(data.Message);
        else
          dispatch(
            actionSetAlertPopUpTwo({
              title: AppTextData.txt_Alert,
              body: AppTextData.txt_Success,
              visible: true,
              type: 'ok',
            }),
          );
      })
      .catch((err) => {
        dispatch(actionSetLoading(false));
        console.error('TechHome', 'Error: ', err);
        // alert(AppTextData.txt_somthing_wrong_try_again);
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: AppTextData.txt_somthing_wrong_try_again,
            visible: true,
            type: 'ok',
          }),
        );
      });
  };
  async function Logout() {
    requestWithEndUrl(
      `${API_TECHNICIAN}LogOut`,
      {TechnicianID: TechnicianID},
      'POST',
    )
      .then((res) => {
        console.log('URL_LOGIN', res.status);
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        console.log('logout case->>',data)
        console.log('inside the logout -->>>>', ASK.ASK_USER);
        if (data.isSucess == true) {
          dispatch(actionSetJobDate(''));
          console.log('login expired 3'); // AsyncStorage.removeItem(ASK.ASK_USER);
          // resetNavigation(navigation, 'Login');
          navigation.replace('Login');
          // AsyncStorage.clear();

          // AsyncStorage.removeItem(ASK.ASK_USER);
          // AsyncStorage.removeItem(ASK.ASK_NOTIFICATION_TIMER);
          // dispatch(actionSetLoginData({}));
        }
      })
      .catch((err) => {
        
        console.error({err});
      });
  }
  function statusDetails(item) {
    switch (item) {
      case 'Technician is already working in same machine':
        return AppTextData.txt_Technician_is_already_working_in_same_machine;
      case 'Plese Enter  previous service report':
        return AppTextData.txt_Plese_Enter_previous_service_report;
      case 'Invalid QR Code':
        return AppTextData.txt_Invalid_QR_code;
      case 'Machine is already assigned':
        return AppTextData.txt_Machine_is_already_assigned;
      default:
        return item;
    }
  }


  return (
    <View style={{flex: 1}}>
      {/* vbn Qr code */}
      <QrCodeScanner
        visible={modal}
        Close={() => {
          setModal(false), setStandBy(false);
        }}
        QrCodeData={(data) => {
          Qrcodefunction(data);
          console.log('data from qr code to home screen>>>>', data);
        }}
        reactivate={isScanfailed}
      />

      {EmergencyJobListShow && (
        <EmergencyJobListModal
          visible={EmergencyJobListShow}
          cancel={() => {
            setEmergencyJobListShow(false);
            dispatch(actionSetEmergencyJoblistNotificationCountUpdate());
          }}
          OutputData={(e) => {
            console.log('data from EmergencyJoblist Component==>', e);

            Alert.alert(
              AppTextData.txt_Alert,
              AppTextData.txt_Do_you_want_to_start_this_Job,
              [
                {
                  text: AppTextData.txt_No,
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {
                  text: AppTextData.txt_Yes,
                  onPress: () => {
                    setEmergencyJoblistSelectedJob(e);
                    InitialjobCheck(5);
                  },
                },
              ],
            );

            // EmergencyJoblistWork(e);
          }}
        />
      )}
      {/* <ImageBackground
        style={{
          flex: 1,
          position: 'absolute',
          width: '100%',
          height: '100%',
          // justifyContent: 'center',
        }}
        source={require('../../../assets/bg/bg_cmms.webp')}
      /> */}

      {/* </View> */}
      {chartData.length > 0 && IsVisibleGraph && (
        <>
          <FadeView
            style={{
              position: 'absolute',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              paddingLeft: 10,
              paddingTop: 10,
            }}>
            <Text
              style={{
                fontWeight: '500',
                // color: InterNet.isInternetReachable == true ? 'blue' : 'red',
                color: 'gray',
                fontSize: 16,
                // position: 'absolute',
              }}>
              {AppTextData.txt_Hai},
            </Text>
            <Text
              style={{
                fontWeight: 'bold',
                color: 'black',
                fontSize: 16,
                // position: 'absolute',
              }}>
              {' ' + TechnicianName}
            </Text>
          </FadeView>

          <PieChart
            style={[styles.chart]}
            logEnabled={false}
            // touchEnabled={false}
            // chartBackgroundColor={processColor('pink')}
            chartDescription={description}
            data={data}
            legend={legend}
            // highlights={highlights}

            extraOffsets={{left: 5, top: 5, right: 5, bottom: 5}}
            entryLabelColor={processColor('green')}
            entryLabelTextSize={14}
            entryLabelFontFamily={'HelveticaNeue-Medium'}
            drawEntryLabels={false}
            rotationEnabled={true}
            rotationAngle={100}
            usePercentValues={true}
            // styledCenterText={{text:'Pie center text!', color: processColor('pink'), fontFamily: 'HelveticaNeue-Medium', size: 20}}
            // centerTextRadiusPercent={100}
            holeRadius={50}
            holeColor={processColor('transparent')}
            // holeColor={processColor('#fff')}
            // transparentCircleRadius={45}
            // transparentCircleColor={processColor('#f0f0f088')}
            maxAngle={600}
            // onSelect={handleSelect()}
            // onChange={(event) =>
            //  // console.log('pie diagram onchange-->', event.nativeEvent)
            // }
          />
        </>
      )}
      {/* Top arrow */}
      <TouchableOpacity
        style={{
          alignSelf: 'center',
          padding: 4,
          marginTop: 5,
        }}
        onPress={() => {
          console.log(IsVisibleGraph);

          setAnimation(IsVisibleGraph);
        }}>
        <Icon
          name={IsVisibleGraph ? 'angle-up' : 'angle-down'}
          size={32}
          color="grey"
        />
      </TouchableOpacity>
      <DatePickerCmms
        selectedDate={jobDate}
        // onDateChange={(date) => setSelectedDate(date)}

        onDateChange={(date) => dispatch(actionSetJobDate(date))}
        text={`${AppTextData.txt_Job_Oders}(${jobOrderList.length})`}
      />
      <StatusLabelView jobOrderList={jobOrderList} />
      {jobOrderList.length > 0 && (
        <FlatList
          scrollEventThrottle={16}
          initialScrollIndex={scrollPosition}
          showsVerticalScrollIndicator={false}
          data={jobOrderList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => {
            const statusDetails = getStatusDetails(item.Status);
            // const maintananceDetails = getMaintananceTypeDetails(index)
            return (
              <GestureRecognizer
                onSwipe={(direction, state) =>
                  console.log('direction', direction, 'state', state)
                }
                onSwipeUp={(state) => console.log('up', 'state', state)}
                onSwipeLeft={(state) => {
                  console.log('swipeleft: ', {state});
                  if (state.dx < -70 && item.JOID != 0) {
                    Promise.resolve(setModalVisible(false)).then(() => {
                      navigation.navigate('TodayJobOrderIssued', {
                        id: item.JOID,
                        SEID: TechnicianID,
                        ServiceType: item.ServiceType,
                      });
                    });
                  }
                }}
                onSwipeRight={(state) => {
                  //vbn right Swip
                  if (state.dx > 70 && !isActive) {
                    console.log('right swipe if case 1');
                    //item.JOID==0 condtion given by the suggetion of Sreeju and Aju
                    if (item.From != 0 && item.To != 0 && item.JOID != 0) {
                      console.log('right swipe if case 2');
                      Promise.resolve(setModalVisible(false)).then(() => {
                        navigation.push('JobOrderReport', {
                          JOID: item.JOID,
                          SEID: TechnicianID,
                          selectedActivityDetails: [],
                          SelectedSpareParts: [],
                          IsSuperVisor: 0,
                          ServiceType: item.ServiceType,
                        });
                      });
                    }
                  }
                }}
                config={config}
                style={{
                  flex: 1,
                }}>
                {/*vbn Activity lists */}
                <TouchableOpacity
                  onPress={() => {
                    // clearTimer(); //checking
                    // setJobStopedWithoutSave(true);
                    setIsBreakdown(false);
                    //i'm commenting the below asset because, if that drawer is not opened then next job may display that asset code
                    if (IsHeworking == false) {
                      SetAssetName(item?.Asset);
                      setAssetCode(item?.Code);
                      setAssetID(item?.AssetID);
                    }
                    console.log('current selected work data----->>', item);
                    setJOIDDDD(item?.JOID);
                    setReason(item?.Reason);
                    // setReasonListStatus(2);
                    setWorkId({
                      WorkID: item?.WorkID,
                      JobId: item?.JOID,
                      WorkType: item?.WorkType,
                    });
                    setItem(item);

                    if (item.Status != 1) {
                      if (item.Status == 2 || item.JOID == 0) {
                        if (
                          selectedJob.ReasonTypeID == 5 &&
                          item.ReasonTypeID != 5
                          // selectedJob.Reason == 'Personal Break' &&
                          // item.Reason != 'Personal Break'
                        ) {
                          console.log('****Status 2 with personal break*****');
                          InitialjobCheck();
                        } else {
                          console.log('if condition1->>>>>>');
                          if (item.JOID != selectedJob.JOID) {
                            console.log('drawer open 1');
                            if (isPaused || !isActive) {
                              console.log('drawer open 2');
                              if (isActive) {
                                clearTimer();
                              }
                              console.log('drawer open 3');
                              console.log(
                                '----inside the setSeleted job in the Joblist touchable Click-------',
                              );
                              // Promise.resolve(
                              // setJobStopedWithoutSave(true), //commented by vbn to check the new conditon for the Stop and non saved job
                              InitialjobCheck({Work: item, Type: 1});
                              // ).then(() => {
                              //   setSelectedJob(item);
                              // });
                            } else {
                              //this conditon works only when the initial job and opened jobs are different
                              console.log('drawer open 4');
                              InitialjobCheck();
                            }
                          } else {
                            // Promise.resolve(
                            // setJobStopedWithoutSave(true)//commented by vbn to check the new conditon for the Stop and non saved job
                            InitialjobCheck({Work: item, Type: 2}),
                              // ).then(() => {
                              //   setModalVisible(true);
                              // });
                              // setJobStopedWithoutSave(true);
                              // setModalVisible(true);
                              console.log('drawer open 5');
                          }
                        }
                      } else {
                        //it will give job list pop up for Status 0(pending job)

                        console.log('drawer open 6');
                        //setReasonListStatus(1);
                        // getJoblist(1);
                        InitialjobCheck(2);
                        //setShowModal(true);
                        //setSelectedJob(item);
                      }
                    }
                  }}>
                  <JobOrderView item={item} />
                </TouchableOpacity>
              </GestureRecognizer>
            );
          }}
        />
      )}
      {/*vbn Bottom Drawer */}
      {/* {true && ( */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View
          style={{
            flex: 1,
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
          }}>
          <Pressable
            style={{flex: 1.23, backgroundColor: 'white', opacity: 0}}
            onPress={() => {
              // setModalVisible(false);
            }}></Pressable>
          {/* <View
            style={{
              backgroundColor: 'yellow',
              flex: 1,
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
              paddingHorizontal:'5%',
            }}> */}
          <View
            style={{
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
              marginTop: 1,
              paddingHorizontal: '5%',
              backgroundColor: 'white',
              maxHeight: screenHeight - 70,
            }}>
            <TouchableOpacity
              style={{
                height: Height / 20,
                width: '100%',
                backgroundColor: '#FFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                setModalVisible(false);
              }}>
              <View
                style={{
                  height: 5,
                  width: '15%',
                  backgroundColor: 'green',
                  borderRadius: 10,
                  borderWidth: 0.5,
                }}></View>
            </TouchableOpacity>
            {/* job order checklist */}
            {/* {selectedJob.IsCheckListAvaliable && (
              <TouchableOpacity
                style={{position: 'absolute', end: 0, padding: 8, elevation: 5}}
                onPress={() =>
                  navigation.navigate('CheckList', {
                    JOID: selectedJob.JOID,
                    ServiceType: selectedJob.ServiceType,
                  })
                }>
                <Image
                  style={{width: 32, height: 32}}
                  source={require('../../../assets/icons/ic_check_list.png')}
                />
              </TouchableOpacity>
            )} */}
            {/*vbn job order titles */}

            <View style={{paddingVertical: 12}}>
              <CmmsText
                style={{
                  fontWeight: 'bold',
                  color: 'black',
                  fontSize: 17,
                  alignSelf: 'center',
                }}>
                {/* {Reason ? Reason : null} */}
                {/* {IsHeworking == true && selectedJob.JOID == 0
                ? 'BreakDown'
                :  */}

                {selectedJob.ReasonTypeID == 0 && selectedJob.JOID != 0
                  ? AppTextData.txt_Job_Order_Performance
                  : Reason}
                {/* } */}
              </CmmsText>
              {/*vbn Asset Name and Asset Code */}
              {IsHeworking == true && selectedJob.JOID == 0 ? null : (
                <CmmsText
                  style={{
                    fontWeight: 'bold',
                    fontSize: 16,
                    alignSelf: 'center',
                  }}>
                  {AssetName ? AssetCode + '/' + AssetName : null}
                </CmmsText>
              )}
              <CmmsText
                style={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  alignSelf: 'center',
                }}>
                {selectedJob.TNO == 0 ? null : selectedJob.TNO}
              </CmmsText>
              {/*vbn WORK DATE AND TIME */}
              {
                <CmmsText
                  style={{fontWeight: 'bold', color: 'green', fontSize: 14}}>
                  {AppTextData.txt_Started_at}: {selectedJob.LatestStartTime}
                </CmmsText>
              }
              <Timer timer={timer} />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                // marginVertical: 12,
                borderWidth: 1,
                borderColor: CmmsColors.lightGray,
                minHeight: 60,
              }}>
              {/* Pause Button */}
              <TouchableOpacity
                // style={{ marginHorizontal: 4, padding: 4 }}
                style={styles.joActionBtn}
                onPress={() => {
                  // if (isActive && !isPaused) {
                  // setModalVisible(false)
                  console.log('pause button pressed');
                  PaueseButtonFunction();
                  // if (reasonList.length > 0) {
                  // } else {
                  //   alert(AppTextData.txt_somthing_wrong_contact_admin);
                  // }
                }}
                // disabled={!isPaused}
              >
                <SvgXml
                  xml={xml_pause_btn_red}
                  // width={iconSize}
                  // height={iconSize}
                  width={38}
                  height={38}
                />
              </TouchableOpacity>

              {/*vbn Stop button */}

              {selectedJob.BreakDownFrom == 1 ||
              selectedJob.ReasonTypeID == 5 ? null : (
                <>
                  <TouchableOpacity
                    style={styles.joActionBtn}
                    onPress={() => {
                      if (isActive) {
                        StopJob();
                      } else
                        dispatch(
                          actionSetAlertPopUpTwo({
                            title: AppTextData.txt_Alert,
                            body: AppTextData.txt_must_start_job_to_enable_this,
                            visible: true,
                            type: 'ok',
                          }),
                        );
                    }}>
                    <Image
                      style={{
                        // width: iconSize,
                        // height: iconSize,
                        width: 38,
                        height: 38,
                      }}
                      source={require('../../../assets/icons/stop.png')}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.joActionBtn}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate('Notes', {JOID: selectedJob.JOID});
                    }}>
                    <Image
                      style={{width: 39, height: 39}}
                      source={require('../../../assets/icons/ic_doc.png')}
                    />
                    {/* <Icon name="file-text" size={32} color='black'/> */}
                  </TouchableOpacity>
                  {IsHeworking == true && selectedJob.JOID == 0 ? null : (
                    <>
                      {/*vbn new joborder Report direct access Button*/}
                      <TouchableOpacity
                        style={styles.joActionBtn}
                        onPress={() => {
                          // panelRef?.current?.togglePanel(),
                          Promise.resolve(setModalVisible(false)).then(
                            navigation.push('JobOrderReport', {
                              JOID: selectedJob.JOID,
                              SEID: TechnicianID,
                              selectedActivityDetails: [],
                              SelectedSpareParts: [],
                              IsSuperVisor: 0,
                              ServiceType: selectedJob.ServiceType,
                              CheckJobBeforeSave: true,
                            }),
                          );
                        }}>
                        <Image
                          style={{width: 38, height: 38}}
                          source={require('../../../assets/icons/JobOrderReport.png')}
                        />
                      </TouchableOpacity>
                      {/*vbn given this condition by Sreeju and Aju Suggetion = won't get this button access if they are in the Breakdown job(jonid=0)*/}
                      <TouchableOpacity
                        style={styles.joActionBtn}
                        onPress={() => {
                          setModalVisible(false);
                          navigation.navigate('MHistory', {
                            AssetCode: selectedJob.Code,
                            Asset: selectedJob.Asset,
                            AssetID: selectedJob.AssetID,
                            TechnicianID,
                          });
                        }}>
                        <Image
                          style={{width: 38, height: 38}}
                          source={require('../../../assets/icons/ic_m_history.png')}
                        />
                        {/* <Icon name="file-text" size={32} color='black'/> */}
                      </TouchableOpacity>
                    </>
                  )}
                  {selectedJob.WorkType==0?(selectedJob.IsCheckListAvaliable &&
                  selectedJob.ReasonTypeID == 0):selectedJob.IsSafeRegulationRequired ? (
                    // Reason == 'Job Order Performance'
                    <TouchableOpacity
                      style={styles.joActionBtn}
                      onPress={() => {
                        setModalVisible(false)
                        navigation.navigate(selectedJob.IsSafeRegulationRequired?"CheckListSafetyRegulationPage":'CheckList', {
                          JOID: selectedJob.JOID,
                          ServiceType: selectedJob.ServiceType,
                          WorkNatureID:selectedJob.WorkNatureID
                        })
                       
                      }}>
                      <Image
                        style={{width: 38, height: 38}}
                        source={require('../../../assets/icons/ic_check_list.png')}
                      />
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
            </View>
            <View style={{maxHeight: screenHeight - 300}}>
              {sparePartsList && sparePartsList.length > 0 && (
                <CmmsText
                  style={{fontWeight: 'bold', fontSize: 16, marginBottom: 5}}>
                  {AppTextData.txt_Spare_Parts}
                </CmmsText>
              )}
              <FlatList
                showsVerticalScrollIndicator={false}
                data={sparePartsList}
                renderItem={({item}) => (
                  <ButtonQtyModifyWithLabel
                    label={`${item.SparePartsName} (${item.UOM})`}
                    Qty={item.QTY}
                    isNormal={item.QTY == 0}
                    onIncrease={() => {
                      if (isActive && !isPaused) {
                        onAddSparePartsQty(item);
                      } else
                        dispatch(
                          actionSetAlertPopUpTwo({
                            title: AppTextData.txt_Alert,
                            body: AppTextData.txt_must_start_job_to_enable_this,
                            visible: true,
                            type: 'ok',
                          }),
                        );
                    }}
                    onReduce={() => {
                      if (isActive && !isPaused) {
                        if (!isLoading) {
                          dispatch(actionSetLoading(true));
                          console.log('onReduce');
                          //http://localhost:29189/api/ApkTechnician/UpdateSPQTY
                          const newQty = item.QTY - 1;
                          requestWithEndUrl(
                            `${API_TECHNICIAN}UpdateSPQTY`,
                            {
                              SparePartsID: item.SparePartsID,
                              UOMID: item.UOMID,
                              Qty: newQty,
                              JOID: selectedJob.JOID,
                              SEID: TechnicianID,
                              Date: new Date().getTime(),
                            },
                            'POST',
                          )
                            .then((res) => {
                              if (res.status != 200) {
                                throw Error(res.statusText);
                              }
                              return res.data;
                            })
                            .then((data) => {
                              if (data.isSucess) {
                                item.QTY--;
                                setSparePartsList((sparePartsList) => [
                                  ...sparePartsList,
                                ]);
                              } else
                                dispatch(
                                  actionSetAlertPopUpTwo({
                                    title: AppTextData.txt_Alert,
                                    body: AppTextData.txt_Success,
                                    visible: true,
                                    type: 'ok',
                                  }),
                                );
                              dispatch(actionSetLoading(false));
                            })
                            .catch(function (error) {
                              dispatch(actionSetLoading(false));
                              console.error('TechHome', 'Error: ', error);
                              dispatch(
                                actionSetAlertPopUpTwo({
                                  title: AppTextData.txt_Alert,
                                  body: AppTextData.txt_somthing_wrong_try_again,
                                  visible: true,
                                  type: 'ok',
                                }),
                              );
                            });
                        }
                      } else
                        dispatch(
                          actionSetAlertPopUpTwo({
                            title: AppTextData.txt_Alert,
                            body: AppTextData.txt_must_start_job_to_enable_this,
                            visible: true,
                            type: 'ok',
                          }),
                        );
                    }}
                  />
                )}
              />

              {activityList && activityList.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 5,
                    alignItems: 'center',
                    paddingVertical: 5,
                  }}>
                  <CmmsText style={{fontWeight: 'bold', fontSize: 16}}>
                    {AppTextData.txt_Activity_Details}
                  </CmmsText>
                  <TouchableOpacity
                    style={{
                      borderRadius: 5,
                      marginEnd: 8,
                      borderColor: CmmsColors.lightGray,
                      borderWidth: 1,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      alignSelf: 'flex-end',
                    }}
                    onPress={() => {
                      if (isActive) {
                        dispatch(actionSetLoading(true));
                        console.log(
                          'closed All',
                          'ActivityID: ',
                          activityList.map((act) => act.ActivityID),
                        );
                        console.log(
                          'close all activity from the bottomsheet==>>',
                          'JOID:',
                          selectedJob.JOID,
                          'SEID:',
                          TechnicianID,
                          'Date: ',
                          new Date().getTime(),
                          'Status:',
                          2,
                          'ActivityIDList: ',
                          activityList.map((act) => act.ActivityID),
                        );
                        requestWithEndUrl(
                          `${API_TECHNICIAN}ClosedAllActivity`,
                          {
                            JOID: selectedJob.JOID,
                            SEID: TechnicianID,
                            Date: new Date().getTime(),
                            Status: 2,
                            ActivityIDList: activityList.map(
                              (act) => act.ActivityID,
                            ),
                          },
                          'POST',
                        )
                          .then((res) => {
                            if (res.status != 200) {
                              throw Error(res.statusText);
                            }
                            return res.data;
                          })
                          .then((data) => {
                            console.log(
                              'close all activity from the bottomsheet API response===>',
                              data,
                            );
                            dispatch(actionSetLoading(false));
                            if (data.isSucess) {
                              activityList.forEach((item) => (item.Status = 1));
                              // item.Status = 1
                              setActivityList((activityList) => [
                                ...activityList,
                              ]);
                            } else
                              dispatch(
                                actionSetAlertPopUpTwo({
                                  title: AppTextData.txt_Alert,
                                  body: AppTextData.txt_Success,
                                  visible: true,
                                  type: 'ok',
                                }),
                              );
                          })
                          .catch((err) => {
                            dispatch(actionSetLoading(false));
                            console.error('TechHome_ClosedALl', 'Error: ', err);
                            dispatch(
                              actionSetAlertPopUpTwo({
                                title: AppTextData.txt_Alert,
                                body: AppTextData.txt_somthing_wrong_try_again,
                                visible: true,
                                type: 'ok',
                              }),
                            );
                          });
                      }
                    }}>
                    <CmmsText
                      style={{color: CmmsColors.darkRed, fontWeight: '900'}}>
                      {
                        //vbn lang
                        AppTextData.txt_Closed_All
                      }
                    </CmmsText>
                  </TouchableOpacity>
                </View>
              )}
              <FlatList
                style={{marginTop: 5, marginBottom: 10}}
                showsVerticalScrollIndicator={false}
                data={activityList}
                renderItem={({item}) => (
                  //THIS IS THE BOTTOM POUPUP TO CONTROL THE JOB
                  <TouchableOpacity
                    style={{
                      margin: 4,
                      padding: 8,
                      backgroundColor: 
                      getStatusDetails(Number(item.Status))
                        ?.color,
                      borderRadius: 8,
                    }}
                    onPress={() => {
                      if (isActive && !isPaused) {
                        if (!isLoading) {
                          dispatch(actionSetLoading(true));
                          console.log('activity swiped');
                          if (item.Status == 0) {
                            SwipFromTray(item, {Status: '2'});
                          } else if (item.Status == 1) {
                            SwipFromTray(item, {Status: '0'});
                          }
                          if (item.Status == 2) {
                            SwipFromTray(item, {Status: '1'});
                          }
                        }
                      } else
                        dispatch(
                          actionSetAlertPopUpTwo({
                            title: AppTextData.txt_Alert,
                            body: AppTextData.txt_must_start_job_to_enable_this,
                            visible: true,
                            type: 'ok',
                          }),
                        );
                    }}>
                    <CmmsText style={{color: 'white'}}>
                      {item.Activity}
                    </CmmsText>
                  </TouchableOpacity>
                )}
              />
              <View style={{height: 50, backgroundColor: 'white'}} />
            </View>
          </View>
          {/* </View> */}
          {/* <View style={{height:50,backgroundColor: 'white'}}/> */}
        </View>
      </Modal>

      {showJoStartingPopUp && (
        <JobStartingPopUp
          visible={showJoStartingPopUp}
          onCancel={() => setshowJoStartingPopUp(false)}
          techId={TechnicianID}
          JOID={selectedJob.JOID}
          startJoFromPopUp={(techList) =>
            handleStart(
              selectedJob.JOID,
              techList,
              setshowJoStartingPopUp(false),
            )
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        // onRequestClose={() => {
        //   // Alert.alert('Modal has been closed.');
        //   setShowModal(!showModal);
        // }}
      >
        <View style={styles.centeredView}>
          <ImageBackground
            style={styles.imageBack}
            source={require('../../../assets/icons/OverLay.png')}>
            <View style={styles.modalView}>
            {(item.IsSafeRegulationRequired && workNatureData.length>0 )&&<View style={styles.modalViewOne}>
                <Text
                  style={{
                    fontSize: 21,
                    color: '#000',
                    fontWeight: 'bold',
                    marginBottom: 10,
                  }}>
                  { "Work Nature" }
                </Text>
                <View >
                  {workNatureData.map((mainItem) => {
                    // console.log(
                    //   'selection id from the selection Map----->>',
                    //   item,
                    // );
                    return (
                      <View
                        style={{
                          backgroundColor: '#fff',
                          justifyContent: 'flex-start',
                      
                        }}>
                        <TouchableOpacity
                          style={{
                            height: Height / 20,
                            width: '100%',
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                          onPress={() => {
                          //   const selectedCount = workNatureData.reduce((count, item) => count + (item.selected ? 1 : 0), 0);
                          //   const isNormalSelected = workNatureData.some(item=>item.ID===1&&item.selected);

                          //  setWorkNatureData(workNatureData=>workNatureData.map(item=>item.ID === mainItem.ID ? (item.selected && selectedCount === 1 ?  item : { ...item, selected: !item.selected }) : item))

                          setWorkNatureData((prevData) => {
                            let mainItemId = mainItem.ID;
                            const selectedCount = prevData.reduce((count, item) => count + (item.selected ? 1 : 0), 0);
                            const isNormalSelected = prevData.some((item) => item.ID === 1 && item.selected);
                            const targetItem = prevData.find((item) => item.ID === mainItemId);
                        
                            if (!targetItem) return prevData; // Safety check
                        
                            return prevData.map((item) => {
                              // If selecting "Normal", unselect others and select "Normal"
                              if (targetItem.ID === 1) {
                                return { ...item, selected: item.ID === 1 };
                              }
                        
                              // If selecting others, unselect "Normal"
                              if (isNormalSelected) {
                                return item.ID === 1
                                  ? { ...item, selected: false } // Unselect "Normal"
                                  : { ...item, selected: item.ID === mainItemId }; // Select target item
                              }
                        
                              // Toggle target item if at least one will remain selected
                              if (item.ID === mainItemId) {
                                return {
                                  ...item,
                                  selected: item.selected && selectedCount === 1 ? true : !item.selected,
                                };
                              }
                        
                              return item; // Keep other items unchanged
                            });
                          });

                          }}>
                          {mainItem.selected ? (
                            <Image
                              style={{height: 20, width: 20}}
                              resizeMode="contain"
                              source={{
                                uri: 'https://cdn-icons-png.flaticon.com/128/61/61024.png',
                              }}/>
                          ) : (
                            <Image
                              style={{height: 20, width: 20}}
                              resizeMode="contain"
                              source={{
                                uri: 'https://cdn-icons-png.flaticon.com/128/25/25235.png',
                              }}/>
                          )}
                          <Text
                            style={{
                              color: '#000',
                              marginLeft: '10%',
                              fontSize: 13,
                              fontWeight: '700',
                            }}>
                            {mainItem.Name}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
            </View>}
            <View style={styles.modalViewOne}>
                <Text
                  style={{
                    fontSize: 21,
                    color: '#000',
                    fontWeight: 'bold',
                    marginBottom: 10,
                  }}>
                  {AppTextData.txt_Select_Action}
                </Text>
                <View>
                  {actionData.map((item) => {
                    // console.log(
                    //   'selection id from the selection Map----->>',
                    //   item,
                    // );
                    return (
                      <View
                        style={{
                          backgroundColor: '#fff',
                          justifyContent: 'flex-start',
                        }}>
                        <TouchableOpacity
                          style={{
                            height: Height / 20,
                            width: '100%',
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                          onPress={() => {
                            console.log(
                              'selection id from the selection list----->>',
                              item,
                            );
                            setSelectionID(item.ID);
                            setReasonTypeId(item.ReasonTypeID);
                            //setReason(item.Reason);
                            // setReason(item.Reason);
                          }}>
                          {item.ID == selectionID ? (
                            <Image
                              style={{height: 20, width: 20}}
                              resizeMode="contain"
                              source={{
                                uri: 'https://cdn-icons-png.flaticon.com/512/876/876173.png',
                              }}></Image>
                          ) : (
                            <Image
                              style={{height: 20, width: 20}}
                              resizeMode="contain"
                              source={{
                                uri: 'https://cdn-icons-png.flaticon.com/512/876/876224.png',
                              }}></Image>
                          )}
                          <Text
                            style={{
                              color: '#000',
                              marginLeft: '10%',
                              fontSize: 13,
                              fontWeight: '700',
                            }}>
                            {item.Reason}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
            </View>
            <View style={styles.modalViewTwo}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                  }}>
                  <TouchableOpacity
                    style={styles.touch}
                    onPress={() => {
                      //setReason(item.Reason);
                      // setShowModal(false);
                      // setEmergencyJobList(false);
                      // setSelectionID(item.ID);
                      // setReasonTypeId(item.ReasonTypeID);
                      dispatch(actionSetLoading(true));
                      if (selectionID != '' || ReasonTypeId != '') {
                        if (EmergencyJobList == false) {
                          StartJob(workNatureData?.filter(work=>work?.selected).map(work=>work.ID).join(","));
                        } else {
                          StartEmergencyJob();
                        }
                      } else {
                        dispatch(actionSetLoading(false));
                        dispatch(
                          actionSetAlertPopUpTwo({
                            title: AppTextData.txt_Alert,
                            body: AppTextData.txt_Please_Select_One_Reason,
                            visible: true,
                            type: 'ok',
                          }),
                        );
                      }
                      console.log('reason list---->>', Reason);
                    }}>
                    <Text style={styles.touchText}>
                      {AppTextData.txt_Start}
                    </Text>
                  </TouchableOpacity>
                  {EmergencyJobList == false ? (
                    <TouchableOpacity
                      style={styles.touch}
                      disabled={!selectedJob.NoSafeRegulationInCorrect}
                      onPress={() => {
                        setModal(true);
                      }}>
                      <Text style={styles.touchText}>
                        {AppTextData.txt_QrCode}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={styles.touch}
                    onPress={() => {
                      setShowModal(false);
                      setEmergencyJobList(false);
                      setIsBreakdown(false);
                      // setModalVisible(true)
                    }}>
                    <Text style={styles.touchText}>
                      {AppTextData.txt_Cancel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      </Modal>
    </View>
  );

  function onAddSparePartsQty(item) {
    console.log({isLoading});
    if (!isLoading) {
      dispatch(actionSetLoading(true));
      //http://localhost:29189/api/ApkTechnician/UpdateSPQTY
      const newQty = item.QTY + 1;
      console.log('onIncrease', {newQty}, {item});
      const param = {
        SparePartsID: item.SparePartsID,
        UOMID: item.UOMID,
        Qty: newQty,
        JOID: selectedJob.JOID,
        SEID: TechnicianID,
        Date: new Date().getTime(),
      };
      console.log('params for UpdateSPQRT api call==>>', param);
      requestWithEndUrl(`${API_TECHNICIAN}UpdateSPQTY`, param, 'POST')
        .then((res) => {
          //console.log({res});
          if (res.status != 200) {
            throw Error(res.statusText);
          }
          return res.data;
        })
        .then((data) => {
          if (data.isSucess) {
            //console.log({sparePartsList}, {item});
            item.QTY++;
            setSparePartsList((sparePartsList) => [...sparePartsList]);
          } else
            dispatch(
              actionSetAlertPopUpTwo({
                title: AppTextData.txt_Alert,
                body: AppTextData.txt_Success,
                visible: true,
                type: 'ok',
              }),
            );
          setTimeout(() => {
            dispatch(actionSetLoading(false));
          }, 2000);
        })
        .catch(function (error) {
          dispatch(actionSetLoading(false));
          console.error('TechHome', 'Error: ', error);
          dispatch(
            actionSetAlertPopUpTwo({
              title: AppTextData.txt_Alert,
              body: AppTextData.txt_somthing_wrong_try_again,
              visible: true,
              type: 'ok',
            }),
          );
        });
    }
  }

  const _onBackPress = () => {};
};

const styles = StyleSheet.create({
  imageBack: {
    height: '110%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '-10%',
  },
  actions: {
    flexDirection: 'row',
    height: Height / 20,
    width: '100%',
    marginTop: '5%',
    alignItems: 'center',
  },
  modalText: {
    color: 'red',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
  },
  centeredView: {
    height: Height,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    // backfaceVisibility:'hidden',
    // backgroundColor:'#000'
  },
  modalView: {
    // height: Height / 1.4,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalViewOne: {
    backgroundColor: '#fff',
    paddingHorizontal: '10%',
    paddingTop: '10%',
  },
  modalViewTwo: {
    // flexDirection:'row',
    // alignItems:'flex-start',
    // justifyContent:'space-evenly',
    marginVertical:'10%',
    backgroundColor: '#fff',
  },
  touch: {
    height: Height / 30,
    width: Width / 5,
    borderColor: '#000',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  touchText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },

  chart: {
    height: Math.floor(screenHeight / 3),
    marginTop: 10,
    // backgroundColor: 'violet',
  },
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#000',
  },
  flipButton: {
    flex: 0.3,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoFocusBox: {
    position: 'absolute',
    height: 64,
    width: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    opacity: 0.4,
  },
  flipText: {
    color: 'white',
    fontSize: 15,
  },
  zoomText: {
    position: 'absolute',
    bottom: 70,
    zIndex: 2,
    left: 2,
  },
  picButton: {
    backgroundColor: 'darkseagreen',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#FFD700',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  faceText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
  text: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#F00',
    justifyContent: 'center',
  },
  textBlock: {
    color: '#F00',
    position: 'absolute',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },

  joActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
