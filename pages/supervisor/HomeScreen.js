import React, {useRef, useState, useEffect, useLayoutEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  Button,
  ImageBackground,
  processColor,
  Alert,
} from 'react-native';
import BottomSheet from 'react-native-simple-bottom-sheet';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Dialog} from 'react-native-simple-dialogs';
import {PieChart} from 'react-native-charts-wrapper';
import {
  API_TECHNICIAN,
  API_SUPERVISOR,
  API_IMAGEPATH,
} from '../../network/api_constants';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import {parse, format} from 'date-fns';
import {useSelector, useDispatch} from 'react-redux';
import CmmsColors from '../../common/CmmsColors';
import requestWithEndUrl from '../../network/request';
import {actionSetTechList} from '../../action/ActionTechnician';
import {
  actionSetLoading,
  actionSetRefreshing,
} from '../../action/ActionSettings';
import {actionSetJobDate} from '../../action/ActionVersion';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePickerCmms from '../components/DatePickerCmms';
import JobOderAssignment from './job_oder/job_assignment/JobOderAssignment';
import JobOrderView from '../components/JobOrderView';
import StatusLabelView from '../components/StatusLabelView';
import {CmmsText} from '../../common/components/CmmsText';
import {
  actionSetJobListCnt,
  actionSetChartData,
  actionSetJobOrderList,
} from '../../action/ActionRealTimeData';
import {actionSetSupCheckListNotificationVisit} from '../../action/ActionPageVisit';
import {actionSetEmergencyJoblistNotificationCountUpdate} from '../../action/ActionNotificationJob';
import {actionSetEmergencyJoblistNotificationCount} from '../../action/ActionCurrentPage';
import {
  actionSetJobOrderReportVisit,
  actionSetSupCheckListNotification,
} from '../../action/ActionCurrentPage';
import ASK from '../../constants/ASK';
import {actionSetLoginData} from '../../action/ActionLogin';
import {useFocusEffect} from '@react-navigation/native';
import resetNavigation from '../../navigation/resetNavigation';
import messaging, {firebase} from '@react-native-firebase/messaging';
import getJobListCnt from '../getJobListCnt';
import RefreshButton from './Components/RefreshButton';
import EmergencyJobListModal from '../Technician/components/EmergencyJobListModal';
import {NavigationAction} from '@react-navigation/native';
import FadeView from '../components/fadeView/FadeView';
const TAG = 'HomeScreen';
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
//pie diagram
export const legend = {
  enabled: true,
  textSize: 12,
  form: 'CIRCLE',
  formSize: 12,
  fontWeight: 900,
  // textColor:'black',
  fontFamily: 'sans-serif-condensed',
  verticalAlignment: 'TOP',
  horizontalAlignment: 'RIGHT',
  orientation: 'VERTICAL',
  wordWrapEnabled: true,
  maxSizePercent: 1,
};

export const description = {
  text: '',
  textSize: 10,
  textColor: processColor('darkgray'),
  fontFamily: 'sans-serif-condensed',
};

export default HomeScreen = ({navigation}) => {
  const {loggedUser} = useSelector((state) => state.LoginReducer);
  // console.log("Home", TechnicianID)
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const {jobListCnt, chartData, jobOrderList} = useSelector(
    (state) => state.RealTimeDataReducer,
  );
  const {ChecklistNotifactionCount} = useSelector(
    (state) => state.CurrentPageReducer,
  );
  const {CheckListNotificationVisit} = useSelector(
    (state) => state.PageVisitReducer,
  );
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'dd/MM/yyyy'),
  );
  // const [chartData, setChartData] = useState([])
  const [chartTitle, setChartTitle] = useState('');
  const [noti, setNoti] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState(0);
  // const [jobListCnt, setJobListCnt] = useState(0)
  const {refresh} = useSelector((state) => state.SettingsReducer);
  const {TechList} = useSelector((state) => state.TechnicianReducer);
  const {EmergencyJoblistNotifactionCount} = useSelector(
    (state) => state.CurrentPageReducer,
  );
  const {EmergencyJoblistNotifactionBgStatus} = useSelector(
    (state) => state.CurrentPageReducer,
  );
  // console.log('cycle count==>>', EmergencyJoblistNotifactionBgStatus);
  // console.log('home',{refresh})
  const [visibleGraph, setVisibleGraph] = useState(true);
  const [EmergencyJobListShow, setEmergencyJobListShow] = useState(false);
  const dispatch = useDispatch();
  const graphColors = chartData.map((e) => {
    return processColor(e.color);
  });

  // console.log(
  //   'chart color details==>>',
  //   processColor(chartData[0].color),
  //   processColor(chartData[1].color),
  // );
  /** chart data*/
  const data = {
    dataSets: [
      {
        values: chartData,
        label: '',
        config: {
          colors: graphColors?.length > 0 ? graphColors : [],
          valueTextSize: 12,
          valueTextColor: processColor('white'),
          sliceSpace: 0,
          selectionShift: 5,
          fontFamily: 'sans-serif-condensed',
          valueFormatter: "#.#'%'",
        },
      },
    ],
  };

  const {jobDate} = useSelector((state) => state.VersionReducer);
  console.debug('data', chartData);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (props) => {
        // console.log('home_props',props)
        return (
          <View
            style={{flexDirection: 'row', marginEnd: 8, alignItems: 'center'}}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 8,
                marginEnd: 6,
                borderWidth: 2,
                borderColor: 'grey',
                borderRadius: 29,
                backgroundColor: 'gray',
              }}
              onPress={() => {
                navigation.navigate('CheckListNotification');
                // console.log('checklist notification count==>>',ChecklistNotifactionCount)

                console.log(
                  'ChecklistNotifactionCount==>',
                  ChecklistNotifactionCount,
                );
              }}>
              <Text style={{color: 'white', fontSize: 12}}>
                {ChecklistNotifactionCount}
              </Text>
            </TouchableOpacity>
            {/* chat */}
            {/* <TouchableOpacity
              style={{padding: 4, marginEnd: 5}}
              onPress={() => {
                navigation.navigate('ChatHistoryPage');
              }}>
              <Icon name="commenting" size={24} color="grey" />
        
            </TouchableOpacity> */}
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
                // EmergencyJoblistNotifactionCount != 0 &&
                  navigation.navigate('EmergencyJobOrders', {jobDate});
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

            <TouchableOpacity
              style={{padding: 4, marginEnd: 5}}
              onPress={() => navigation.navigate('JobOderAssignment')}>
              <Icon name="user-plus" size={24} color="grey" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{padding: 4, marginEnd: 5}}
              onPress={() => {
                // navigation.navigate('TSparePartsRequired');
                navigation.navigate('CycleCount');
              }}>
              <Icon
                name="wrench"
                size={24}
                color={
                  EmergencyJoblistNotifactionBgStatus.IsCycleCount == true
                    ? 'green'
                    : 'grey'
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{padding: 4}}
              onPress={() => {
                // console.log('logout')
                Alert.alert(
                  AppTextData.txt_Logout,
                  AppTextData.txt_Are_you_sure_You_want_to_logout,

                  [
                    {
                      text: AppTextData.txt_Cancel,
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: AppTextData.txt_OK,
                      onPress: () => {
                        // console.log('OK Pressed')
                        dispatch(actionSetLoading(true));
                        // http://213.136.84.57:4545/api/ApkTechnician/LogOut
                        requestWithEndUrl(
                          `${API_TECHNICIAN}LogOut`,
                          {TechnicianID: loggedUser?.TechnicianID},
                          'POST',
                        )
                          .then((res) => {
                            // console.log("URL_LOGIN", res)
                            if (res.status != 200) {
                              throw Error(res.statusText);
                            }
                            return res.data;
                          })
                          .then((data) => {
                            dispatch(actionSetLoading(false));
                            if (data.isSucess) {
                              // // AsyncStorage.removeItem(ASK.ASK_USER);
                              // dispatch(actionSetJobDate(''));
                              // // dispatch(actionSetLoginData(null));
                              // resetNavigation(navigation, 'Login');
                              navigation.reset({
                                index: 0,
                                routes: [{name: 'Login'}],
                              });
                            }
                            // alert(data.Message);
                          })
                          .catch((err) => {
                            dispatch(actionSetLoading(false));
                            alert(AppTextData.txt_somthing_wrong_try_again);
                            console.error({err});
                          });
                      },
                    },
                  ],

                  {cancelable: false},
                );
              }}>
              <Icon name="user-circle-o" size={24} color="grey" />
            </TouchableOpacity>
          </View>
          // <Image
          //   style={{height:48,width:48,}}
          //   source={require('../assets/icons/')}
          //   />
        );
      },
    });
  }, [
    navigation,
    jobListCnt,
    ChecklistNotifactionCount,
    EmergencyJoblistNotifactionCount,
    EmergencyJoblistNotifactionBgStatus,
  ]);

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    // console.log(TAG,'Message handled in the background!', remoteMessage);
    handleFirebaseMsgFg(remoteMessage);
  });

  useEffect(() => {
    // const bgMsgHandler =
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      // console.log(TAG,'Message handled in the foreground!', remoteMessage);
      handleFirebaseMsgFg(remoteMessage);
    });
    messaging().onNotificationOpenedApp((remoteMessage) => {
      // console.log(TAG,"onNotificationOpenedApp",{remoteMessage})
      handleFirebaseMsgFg(remoteMessage, true);
    });
    // messaging().getInitialNotification(initialNotification=>{
    //   console.log(TAG,'getInitialNotification:',initialNotification);
    //  })

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        // console.log('getInitialNotification',remoteMessage); // always prints null
        if (remoteMessage) {
          handleFirebaseMsgFg(remoteMessage, true);
        }
      });
    () => {
      // bgMsgHandler
      unsubscribe;
      // backgroundMessageHandler;
    };
  }, [TechList]);

  useEffect(() => {
    if (jobDate != '') {
      dispatch(actionSetLoading(true));
      // console.log('Home_useEffect', { refresh })
      console.log(
        'params for the getworkstatuspiegraphby date api call==>>',
        'CurrentDate:' + dateTime,
        'Date:' + selectedTimemillies,
        ' SEID:' + loggedUser.TechnicianID,
      );
      const dateTime = Date.now(); //1577946600000
      const selectedTimemillies = parse(
        jobDate,
        'dd/MM/yyyy',
        new Date(),
      ).getTime();
      requestWithEndUrl(`${API_SUPERVISOR}GetWorkStatusPieGraphByDate`, {
        CurrentDate: dateTime,
        Date: selectedTimemillies,
        SEID: loggedUser.TechnicianID,
      })
        .then((res) => {
          if (res.status != 200) {
            throw Error(res.statusText);
          }
          return res.data;
        })
        .then((data) => {
          console.log(
            'chart data from the backend from the api call GetWorkStatusPieGraphByDate==>',
            data,
          );
          dispatch(actionSetChartData(data?.Data));
          setChartTitle(data?.Heading);
        })
        .catch((err) => {
          console.error('GetWorkStatusPieGraphByDate', err);
        });

      getJobOrders(dateTime, selectedTimemillies);
      console.log(
        'params:GetAllTechnicians==>  Date:',
        selectedTimemillies,
        'SEID: ',
        loggedUser.TechnicianID,
      );
      GetAllTechnicians(selectedTimemillies);
      // requestWithEndUrl(`${API_SUPERVISOR}GetAllTechnicians`, {
      //   Date: selectedTimemillies,
      //   SEID: loggedUser.TechnicianID,
      // })
      //   .then((res) => {
      //     if (res.status != 200) {
      //       throw Error(res.statusText);
      //     }
      //     return res.data;
      //   })
      //   .then((data) => {
      //     // console.log('GetAllTechnicians', data)
      //     // setTechnicianList(data)
      //     dispatch(actionSetTechList(data.SEList));
      //   })
      //   .catch((err) => {
      //     console.error('GetAllTechnicians', err);
      //   });

      getJobListCnt();
      dispatch(actionSetLoading(false));
    }
  }, [jobDate, refresh]);
  // useEffect(()=>{
  //   ChecklistNotificationCount()
  // },[])
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(actionSetEmergencyJoblistNotificationCountUpdate());
      if (CheckListNotificationVisit == true) {
        dispatch(actionSetSupCheckListNotificationVisit(false));
      }
    });
    return unsubscribe;
  }, [navigation, CheckListNotificationVisit]);
  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  function getJobOrders(
    dateTime = Date.now(),
    selectedTimemillies = parse(jobDate, 'dd/MM/yyyy', new Date()).getTime(),
  ) {
    // const selectedTimemillies = parse(jobDate, "dd/MM/yyyy", new Date()).getTime()
    console.log(
      'get schedul by date params====>>>',
      'CurrentDate:',
      dateTime,
      'Date:',
      selectedTimemillies,
      'SEID:',
      loggedUser?.TechnicianID,
    );
    // axios.get(`${API_SUPERVISOR}GetJOScheduleByDate?CurrentDate=${selectedTimemillies}&Date=${selectedTimemillies}`)
    requestWithEndUrl(`${API_SUPERVISOR}GetJOScheduleByDate`, {
      CurrentDate: dateTime,
      Date: selectedTimemillies,
      SEID: loggedUser?.TechnicianID,
    })
      .then((res) => {
        console.log('GetJOScheduleByDate', {res});
        dispatch(actionSetLoading(false));
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        dispatch(actionSetJobOrderList(data));
      })
      .catch(function (error) {
        // console.log("GetJOScheduleByDate", 'Error: ', error);
        dispatch(actionSetLoading(false));
      });
  }
  function GetAllTechnicians(
    selectedTimemillies = parse(jobDate, 'dd/MM/yyyy', new Date()).getTime(),
  ) {
    // const selectedTimemillies = parse(jobDate, "dd/MM/yyyy", new Date()).getTime()
    console.log(
      'get schedul by date params====>>>',
      'Date:',
      selectedTimemillies,
      'SEID:',
      loggedUser?.TechnicianID,
    );
    requestWithEndUrl(`${API_SUPERVISOR}GetAllTechnicians`, {
      Date: selectedTimemillies,
      SEID: loggedUser.TechnicianID,
    })
      .then((res) => {
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        dispatch(actionSetTechList(data.SEList));
      })
      .catch((err) => {
        console.error('GetAllTechnicians', err);
      });
  }
  const UserData = async () => {
    const User = JSON.parse(await AsyncStorage.getItem(ASK.ASK_USER));
    if (User.UserType == 2 && fromNotificationOpened) {
      navigation.navigate('EmergencyJobOrders');
    }
  };

  function handleFirebaseMsgFg(remoteMessage, fromNotificationOpened = false) {
    console.log(
      'firebase data type on sup account===>>>',
      remoteMessage.data.type,
    );
    console.log('firebase data on sup account===>>>', remoteMessage.data);

    switch (remoteMessage.data.type) {
      case 'TYPE_LOG_OUT':
        // AsyncStorage.removeItem(ASK.)
        AsyncStorage.removeItem(ASK.ASK_USER);
        // dispatch(actionSetLoginData(null));
        // resetNavigation(navigation);
        // navigation.replace('Login');
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
        break;
      // case 'TYPE_EMERGENCY_JOB_LIST_CNT':
      //   const lJobListCnt = remoteMessage.data.EmergencyJobListCnt;
      //   console.log(
      //     'firebase TYPE_EMERGENCY_JOB_LIST_CNT data data ===>>>',
      //     lJobListCnt,
      //   );
      //   dispatch(actionSetJobListCnt(lJobListCnt));
      //   if (fromNotificationOpened && lJobListCnt != 0)
      //     navigation.navigate('EmergencyJobOrders', {
      //       selectedDate: format(new Date(), 'dd/MM/yyyy'),
      //     });
      //   break;
      case 'TYPE_EMERGENCY_JOB_LIST_CNT':
        //Firebase type to get the emergency joblist count
        console.log(
          'TYPE_EMERGENCY_JOB_LIST_CNT',
          remoteMessage.data.EmergencyJobListCnt,
        );
        const lJobListCnt = remoteMessage.data.EmergencyJobListCnt;
        dispatch(actionSetEmergencyJoblistNotificationCount(lJobListCnt));
        // dispatch(actionSetJobListCnt(lJobListCnt));
        // if (fromNotificationOpened && lJobListCnt != 0) {
        //   navigation.navigate('EmergencyJobOrders');
        // }
        if (fromNotificationOpened && lJobListCnt != 0) {
          UserData();
        }
        break;
      // case 'TYPE_SUP_CHART_DATA':
      //   //using to update the chart
      //   console.log(
      //     'firebase chart data data after json parse===>>>',
      //     JSON.parse(remoteMessage.data.supChartDataToUpdate),
      //   );
      //   dispatch(
      //     actionSetChartData(
      //       JSON.parse(remoteMessage.data.supChartDataToUpdate),
      //     ),
      //   );
      //   break;
      // case 'TYPE_SUP_JOB_ORDER_TO_UPDATE':
      //   //using to Update job cards
      //   console.log(
      //     'firebase data TYPE_SUP_JOB_ORDER_TO_UPDATE after json parse===>>>',
      //     JSON.parse(remoteMessage.data.supJobOrderToUpdate),
      //   );
      //   console.log(
      //     'NavigationContainer',
      //     'onMessage',
      //     'TYPE_SUP_JOB_ORDER_TO_UPDATE',
      //     {remoteMessage, jobOrderList},
      //   );
      //   getJobOrders();
      //   GetAllTechnicians();
      //   break;
      // // case 'TYPE_TECH_LIST_TO_UPDATE':
      //   //using to update bottom cards that shows tech's details
      //   let remoteSeList = JSON.parse(remoteMessage.data.SEList);
      //   console.log('firebase data after json parse===>>>', remoteSeList);
      //   if (TechList.length > 0 && remoteSeList.length > 0) {
      //     remoteSeList.forEach((remoteSE) => {
      //       let idxToUpdateTechie = TechList.findIndex(
      //         (Techie) => remoteSE.ServiceEngrID == Techie.ServiceEngrID,
      //       );
      //       if (idxToUpdateTechie != -1) {
      //         TechList[idxToUpdateTechie] = remoteSE;
      //       }
      //     });
      //     dispatch(actionSetTechList(TechList));
      //   }
      //   break;
      case 'TYPE_REFRESH_TECHNICIAN_ALL_DATA':
        dispatch(actionSetRefreshing());
        break;
      case 'TYPE_ADNORMALITY_JOB_LIST_CNT':
        //provide the checklist update count
        console.error(
          'fire noti===>>',
          remoteMessage.data.AbnormalityJobListCnt,
        );
        dispatch(
          actionSetSupCheckListNotification(
            remoteMessage.data?.AbnormalityJobListCnt,
          ),
        );
      default:
        break;
    }
  }
  // async function ChecklistNotificationCount(){
  //   console.log('function ==>>ChecklistNotificationCount')

  //   try{
  //     const NotificationCount= await requestWithEndUrl(`${API_SUPERVISOR}GetCheckListAbnormalityJobsCount`,{SEID:loggedUser.TechnicianID});
  //     dispatch(actionSetSupCheckListNotification(NotificationCount.data.Count))

  //   }catch(error){
  //     console.log('cardDetailfetch error',error)

  //   }
  // }
  return (
    <SafeAreaView style={{flex: 1}}>
      <EmergencyJobListModal
        visible={EmergencyJobListShow}
        cancel={() => setEmergencyJobListShow(false)}
        OutputData={(e) => {
          console.log('data from EmergencyJoblist Component==>', e);
          // EmergencyJoblistWork(e);
        }}
      />
      {/* <ImageBackground
        style={{
          flex: 1,
          position: 'absolute',
          width: '100%',
          height: '100%',
          // justifyContent: 'center',
        }}
        source={require('../../assets/bg/bg_cmms.webp')}
      /> */}

      {chartData?.length > 0 && visibleGraph && (
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
                color: 'grey',
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
              {' ' + loggedUser?.TechnicianName}
            </Text>
          </FadeView>
          <PieChart
            usePercentValues={true}
            style={HomeStyles.chart}
            logEnabled={false}
            // touchEnabled={false}
            // chartBackgroundColor={processColor('pink')}
            chartDescription={description}
            data={data}
            legend={legend}
            // highlights={highlights}

            extraOffsets={{top: 5, right: 8, bottom: 5}}
            // entryLabelColor={processColor('green')}
            // entryLabelTextSize={14}
            // entryLabelFontFamily={'HelveticaNeue-Medium'}
            drawEntryLabels={false}
            rotationEnabled={true}
            rotationAngle={180}
            // usePercentValues={true}
            // styledCenterText={{text:'Pie center text!', color: processColor('pink'), fontFamily: 'HelveticaNeue-Medium', size: 20}}
            // centerTextRadiusPercent={100}
            holeRadius={50}
            holeColor={processColor('transparent')}
            // holeColor={processColor('#fff')}
            // transparentCircleRadius={30}
            // transparentCircleColor={processColor('#f0f0f088')}
            maxAngle={600}
            // onSelect={this.handleSelect.bind(this)}
            onChange={(event) => console.log(event.nativeEvent)}
          />
          <FadeView style={{backgroundColor: '#E9E9E9', paddingVertical: 4}}>
            {/* <View style={{backgroundColor: '#E9E9E9', paddingVertical: 4}}> */}
            <Text
              style={{
                alignSelf: 'center',
                color: 'black',
                fontWeight: '900',
                fontSize: 13,
              }}>
              {chartTitle}
            </Text>
            {/* </View> */}
          </FadeView>
        </>
      )}
      <TouchableOpacity
        style={{alignSelf: 'center'}}
        onPress={() => {
          setVisibleGraph(!visibleGraph);
        }}>
        {/* <CmmsText>APPLY</CmmsText> */}
        <Icon
          name={visibleGraph ? 'angle-up' : 'angle-down'}
          size={32}
          color="grey"
        />
      </TouchableOpacity>

      <DatePickerCmms
        selectedDate={jobDate}
        onDateChange={(date) => dispatch(actionSetJobDate(date))}
        text={`${AppTextData.txt_Job_Oders}(${jobOrderList.length})`}
      />
      <View style={{marginBottom: 90, flex: 1}}>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <StatusLabelView jobOrderList={jobOrderList} />
          <RefreshButton
            title={'↻'}
            width={75}
            color={'white'}
            backgroundColor={'#2F5A0C'}
            fontWeight={'bold'}
            fontSize={21}
            onPress={() => {
              getJobOrders();
              GetAllTechnicians();
              dispatch(actionSetRefreshing());
            }}
          />
        </View>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={jobOrderList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => {
            return (
              <GestureRecognizer
                onSwipe={(direction, state) =>
                  console.log('direction', direction, 'state', state)
                }
                onSwipeUp={(state) => console.log('up', 'state', state)}
                onSwipeDown={(state) => console.log('down', 'state', state)}
                onSwipeLeft={(state) => {
                  console.log('jobid: ', item.JOID);
                  if (state.dx < -70)
                    navigation.navigate('TodayJobOrderIssued', {
                      id: item.JOID,
                      SEID: 0,
                    });
                }}
                config={config}
                style={{
                  flex: 1,
                }}>
                <JobOrderView item={item} isSupervisor={true} />
              </GestureRecognizer>
            );
          }}
        />
      </View>
      {/* Workers bottom list */}
      <View style={{position: 'absolute', bottom: 0}}>
        <FlatList
          style={{marginTop: 10}}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={TechList}
          renderItem={({item, index}) => (
            <TouchableOpacity
              style={{
                width: 66,
                borderWidth: 1,
                borderColor: CmmsColors.logoTopGreen,
                marginHorizontal: 2,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
              }}
              onPress={() => {
                // const TechnicianID = item.ServiceEngrID
                // const TechnicianName = item.ServiceEngr
                // const loggedUser = JSON.stringify({ TechnicianID, TechnicianName })
                // dispatch(actionSetTech({ TechnicianID, TechnicianName }))
                // AsyncStorage.setItem("key_technician", loggedUser)
                navigation.navigate('TechnicianDetails', {
                  SEID: item.ServiceEngrID,
                  ServiceEngr: item.ServiceEngr,
                });
              }}
              // ListHeaderComponent={()=><View></View>}
            >
              <Image
                style={{width: 48, height: 48}}
                // http://213.136.84.57:4545/Images/Employee/1608183007307e7.jpg
                source={{uri: `${API_IMAGEPATH}${item.ImageURl}`}}
                resizeMode={'center'}
              />
              <CmmsText
                numberOfLines={1}
                style={{textAlign: 'center', fontSize: 10}}>
                {item.Code}
              </CmmsText>
              <CmmsText
                numberOfLines={1}
                style={{
                  width: '100%',
                  marginTop: 2,
                  paddingHorizontal: 4,
                  textAlign: 'center',
                  fontSize: 8,
                  color: item.SEStatus == 1 ? 'green' : CmmsColors.darkRed,
                }}>
                {/* start icon */}
                {/* {Boolean(item.IsSameDay) && (
                  <Icon
                    style={{marginTop: 5}}
                    name="star"
                    size={10}
                    color={CmmsColors.logoBottomGreen}
                  />
                )} */}
                {/* circle to indicate the job status */}
                <Icon
                  style={{marginTop: 5}}
                  name="circle"
                  size={10}
                  // color={item.SEStatus == 1 ? 'green' : CmmsColors.darkRed}
                  color={getDayStatBg(item.SEStatus)}
                />
                {item.IsSameDay && item.SEStatus != 3 && ` ${item.WorkTime}`}
              </CmmsText>
              <CmmsText
                numberOfLines={1}
                style={{
                  width: '100%',
                  marginTop: 2,
                  textAlign: 'center',
                  color: 'white',
                  fontSize: 8,
                  paddingHorizontal: 4,
                  backgroundColor: getDayStatBg(item.DayStatus),
                }}>{`${item.NoOfJO}/${item.TotalAssignedHrs}${
                item.CurrentJONO ? ' - ' : ''
              }${item.CurrentJONO}`}</CmmsText>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );

  function getDayStatBg(DayStatus) {
    switch (DayStatus) {
      case 0:
        return CmmsColors.darkRed;
      case 1:
        return CmmsColors.joDone;
      case 2:
        return CmmsColors.joWip;
      default:
        return 'transparent';
    }
  }
};

export const HomeStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chart: {
    height: Math.floor(screenHeight / 3),
    marginTop: 10,
    padding: 2,
  },
});
//vbn
