import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
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
  Alert
} from 'react-native';
import BottomSheet from 'react-native-simple-bottom-sheet';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Dialog } from 'react-native-simple-dialogs';
import { PieChart } from 'react-native-charts-wrapper';
import { API_TECHNICIAN, API_SUPERVISOR, API_IMAGEPATH } from '../../network/api_constants';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import { parse, format } from 'date-fns';
import { useSelector, useDispatch } from 'react-redux';
import CmmsColors from '../../common/CmmsColors';
import requestWithEndUrl from '../../network/request';
import { actionSetTechList } from '../../action/ActionTechnician';
import { actionSetLoading, actionSetRefreshing } from '../../action/ActionSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePickerCmms from '../components/DatePickerCmms';
import JobOderAssignment from './job_oder/job_assignment/JobOderAssignment';
import JobOrderView from '../components/JobOrderView';
import StatusLabelView from '../components/StatusLabelView';
import { CmmsText } from '../../common/components/CmmsText';
import { actionSetJobListCnt,actionSetChartData, actionSetJobOrderList } from '../../action/ActionRealTimeData';
import ASK from '../../constants/ASK';
import { actionSetLoginData } from '../../action/ActionLogin';
import { useFocusEffect } from '@react-navigation/native';
import resetNavigation from '../../navigation/resetNavigation';
import messaging, { firebase } from '@react-native-firebase/messaging';
const TAG = "HomeScreen"
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export const legend = {
  enabled: true,
  textSize: 12,
  form: 'CIRCLE',
  formSize:12,
  fontWeight:900,
  // textColor:'black',
  fontFamily: 'sans-serif-condensed',
  verticalAlignment: "TOP",
  horizontalAlignment: 'RIGHT',
  orientation: "VERTICAL",
  wordWrapEnabled: true,
  maxSizePercent:1
}

export const description = {
  text: '',
  textSize: 10,
  textColor: processColor('darkgray'),
  fontFamily: 'sans-serif-condensed',

}

export default HomeScreen = ({ navigation }) => {
  const { loggedUser } = useSelector(state => state.LoginReducer)
  // console.log("Home", TechnicianID)
  const {AppTextData} = useSelector(state => state.AppTextViewReducer)
  const {jobListCnt,chartData,jobOrderList} = useSelector(state => state.RealTimeDataReducer)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'dd/MM/yyyy'))
  // const [chartData, setChartData] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(0)
  // const [jobListCnt, setJobListCnt] = useState(0)
  const { refresh } = useSelector(state => state.SettingsReducer)
  const { TechList } = useSelector(state => state.TechnicianReducer)
console.log('home',{refresh})
  const[visibleGraph,setVisibleGraph] = useState(true)
  const dispatch = useDispatch()
  const data = {
    dataSets: [{
      values: chartData,
      label: '',
      config: {
        colors: chartData?.length == 2 ? [processColor(chartData[0].color),
        processColor(chartData[1].color)] : [],
        valueTextSize: 16,
        valueTextColor: processColor('white'),
        sliceSpace: 0,
        selectionShift: 5,
        fontFamily: 'sans-serif-condensed',
        valueFormatter: "#.#'%'",
      }
    }],
  }

  // const [jobOrderList, setJobOrderList] = useState(
  //   // [ { TNO: '247',
  //   //           DateTime: 1630461540000,
  //   //           Code: 'AR3',
  //   //           Asset: 'Commercial Induction Coffee & Tea Kettle ',
  //   //           AssetID: 4,
  //   //           Location: 'Factory 1',
  //   //           ServiceEngr: 'Albert, Arjun, John, Shine, ',
  //   //           ServiceEngrID: 0,
  //   //           Status: 1,
  //   //           MaintenanceJobType: 'Preventive',
  //   //           JOID: 3042,
  //   //           OverdueBy: '0 Days',
  //   //           ExpHrs: 0,
  //   //           ActHrs: 0,
  //   //           CurrentStatus: 0,
  //   //           From: 0,
  //   //           To: 0,
  //   //           SRDetails: '09/01/2021  7:38AM To  09/01/2021  3:31PM',
  //   //           HoldReason: 'sss' },
  //   //         { TNO: '248',
  //   //           DateTime: 1630461660000,
  //   //           Code: '20003',
  //   //           Asset: 'Weber SmartLoader Side Loading System',
  //   //           AssetID: 10,
  //   //           Location: 'Factory 1',
  //   //           ServiceEngr: 'Alex, Rahman, ',
  //   //           ServiceEngrID: 0,
  //   //           Status: 1,
  //   //           MaintenanceJobType: 'Preventive',
  //   //           JOID: 3043,
  //   //           OverdueBy: '0 Days',
  //   //           ExpHrs: 0,
  //   //           ActHrs: 0,
  //   //           CurrentStatus: 0,
  //   //           From: 0,
  //   //           To: 0,
  //   //           SRDetails: '09/01/2021  7:40AM To  09/01/2021  3:38PM',
  //   //           HoldReason: '' },
  //   //         { TNO: '249',
  //   //           DateTime: 1630461720000,
  //   //           Code: 'AR8',
  //   //           Asset: 'Induction roaster machine',
  //   //           AssetID: 3,
  //   //           Location: 'Factory 1',
  //   //           ServiceEngr: 'Abin, Nasar, ',
  //   //           ServiceEngrID: 0,
  //   //           Status: 1,
  //   //           MaintenanceJobType: 'Preventive',
  //   //           JOID: 3044,
  //   //           OverdueBy: '0 Days',
  //   //           ExpHrs: 0,
  //   //           ActHrs: 0,
  //   //           CurrentStatus: 0,
  //   //           From: 0,
  //   //           To: 0,
  //   //           SRDetails: '09/01/2021  7:41AM To  09/01/2021  3:42PM',
  //   //           HoldReason: '' },
  //   //         { TNO: '253',
  //   //           DateTime: 1630469042000,
  //   //           Code: '20010',
  //   //           Asset: 'Commercial Jalebi Fryer',
  //   //           AssetID: 1,
  //   //           Location: 'Packing',
  //   //           ServiceEngr: 'Shine, ',
  //   //           ServiceEngrID: 0,
  //   //           Status: 0,
  //   //           MaintenanceJobType: 'Preventive',
  //   //           JOID: 3048,
  //   //           OverdueBy: '0 Days',
  //   //           ExpHrs: 0,
  //   //           ActHrs: 0,
  //   //           CurrentStatus: 0,
  //   //           From: 0,
  //   //           To: 0,
  //   //           SRDetails: '08/31/2021 11:00AM To  09/01/2021  3:00PM',
  //   //           HoldReason: '' } ]
  //   []
  //   )

  // const [TechnicianList, setTechnicianList] = useState([])


  console.debug('data', chartData)


  useLayoutEffect(() => {
    console.log("useLayoutEffect")
    navigation.setOptions({
      
      headerRight: (props) => {
        console.log('home_props',props)
        return (
          <View 
          style={{ flexDirection: 'row',
          marginEnd:8,alignItems:'center' }}>
            <TouchableOpacity
                      style={{ padding: 4,marginEnd:5 }}
                      onPress={() => {
                        navigation.navigate('ChatHistoryPage')
                      }}
                    >
                      
                      <Icon name="commenting" size={24} color="grey" />
                    {/* </TouchableOpacity> */}
                      {/* <Icon name="envelope" size={24} color="grey" /> */}
                    </TouchableOpacity>
          <TouchableOpacity
          style={{width:40,height:32,
          justifyContent:'center',
          alignItems:'center',elevation:5,
            padding:4,marginEnd:5}}
            onPress={()=>{
              jobListCnt !=0 && navigation.navigate('EmergencyJobOrders',{selectedDate})
            }}
          >
          <Icon name='bell' size={24} color='grey'/>
          <CmmsText
          style={{position:'absolute',color:'white',fontSize:10,fontWeight:'bold'}}
          >{jobListCnt}</CmmsText>
          </TouchableOpacity>

            <TouchableOpacity
                style={{ padding: 4,marginEnd:5 }}
                onPress={() => navigation.navigate('JobOderAssignment')}
              >
  <Icon name='user-plus' size={24} color="grey" />
</TouchableOpacity>
            <TouchableOpacity
              style={{ padding: 4,marginEnd:5 }}
              onPress={() => {
                navigation.navigate('TSparePartsRequired')
              }}
            >
              <Icon name="wrench" size={24} color='grey' />
            </TouchableOpacity>


            <TouchableOpacity
              style={{ padding: 4 }}
              onPress={() => {
                console.log('logout')
                Alert.alert('Logout', 'Are you sure, You want to logout',

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
                        dispatch(actionSetLoading(true))
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
                        dispatch(actionSetLoading(false))
                            if (data.isSucess) {
                              AsyncStorage.removeItem(ASK.ASK_USER)
                              dispatch(actionSetLoginData(null))
                              resetNavigation(navigation,'Login')
                            }
                            alert(data.Message)
                          })
                          .catch(err => {
                        dispatch(actionSetLoading(false))
                        alert(AppTextData.txt_somthing_wrong_try_again)
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
    });
  }, [navigation,jobListCnt]);

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log(TAG,'Message handled in the background!', remoteMessage);
    handleFirebaseMsgFg(remoteMessage)
  });

  useEffect(()=>{
    // const bgMsgHandler = 
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log(TAG,'Message handled in the foreground!', remoteMessage);
        handleFirebaseMsgFg(remoteMessage)
      });
    messaging().onNotificationOpenedApp(remoteMessage=>{
      console.log(TAG,"onNotificationOpenedApp",{remoteMessage})
      handleFirebaseMsgFg(remoteMessage,true)
    })
    // messaging().getInitialNotification(initialNotification=>{
    //   console.log(TAG,'getInitialNotification:',initialNotification);
    //  })

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        console.log('getInitialNotification',remoteMessage); // always prints null
        if (remoteMessage) {
          handleFirebaseMsgFg(remoteMessage,true)
        }
      });
      ()=>{
        // bgMsgHandler
        unsubscribe;
        // backgroundMessageHandler;
      }
  },[TechList])

  useEffect(() => {
    dispatch(actionSetLoading(true))
    console.log('Home_useEffect', { refresh })
    const dateTime = Date.now()//1577946600000
    // requestWithEndUrl(URL_GETWORKSTATUSPIEGRAPHBYDATE,)
    const selectedTimemillies = parse(selectedDate, "dd/MM/yyyy", new Date()).getTime()
    // axios.get(`${API_SUPERVISOR}GetWorkStatusPieGraphByDate?CurrentDate=${dateTime}&Date=${selectedTimemillies}`)
    requestWithEndUrl(`${API_SUPERVISOR}GetWorkStatusPieGraphByDate`, { CurrentDate: dateTime, Date: selectedTimemillies })
      .then(res => {
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then(data => {
        console.log('Chart data:', data)
        dispatch(actionSetChartData(data))
      })
      .catch(err => {
        console.error("chart", err)
      })

  
      getJobOrders(dateTime,selectedTimemillies)

    // axios.get(`${API_SUPERVISOR}GetAllTechnicians?Date=${selectedTimemillies}`)
    requestWithEndUrl(`${API_SUPERVISOR}GetAllTechnicians`, { Date: selectedTimemillies })
      .then(res => {
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then(data => {
        console.log('GetAllTechnicians', data)
        // setTechnicianList(data)
        dispatch(actionSetTechList(data.SEList))
      })
      .catch(err => {
        console.error("GetAllTechnicians", err)
      })

      // http://213.136.84.57:4545/api/ApkSupervisor/EmergencyJobListCount?Date=1614537000000
      requestWithEndUrl(`${API_SUPERVISOR}EmergencyJobListCount`, { Date: selectedTimemillies })
      .then(res => {
        console.log('EmergencyJobListCount', res)
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then(data => {
        console.log('EmergencyJobListCount', data)
        dispatch(actionSetJobListCnt(data))
      })
      .catch(err=>{
        console.log('EmergencyJobListCount', err)
      })

  }, [selectedDate, refresh]);

  
  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80
  };


  function getJobOrders(dateTime = Date.now(),selectedTimemillies = parse(selectedDate, "dd/MM/yyyy", new Date()).getTime()){
    // const selectedTimemillies = parse(selectedDate, "dd/MM/yyyy", new Date()).getTime()

      // axios.get(`${API_SUPERVISOR}GetJOScheduleByDate?CurrentDate=${selectedTimemillies}&Date=${selectedTimemillies}`)
      requestWithEndUrl(`${API_SUPERVISOR}GetJOScheduleByDate`, { CurrentDate: dateTime, Date: selectedTimemillies })
      .then(res => {
        console.log('GetJOScheduleByDate', { res })
    dispatch(actionSetLoading(false))
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then(data => {
        dispatch(actionSetJobOrderList(data))

      })
      .catch(function (error) {
        console.log("GetJOScheduleByDate", 'Error: ', error);
    dispatch(actionSetLoading(false))

      });
  }
  function handleFirebaseMsgFg(remoteMessage,fromNotificationOpened=false){
    switch(remoteMessage.data.type){
      case 'TYPE_LOG_OUT':
        // AsyncStorage.removeItem(ASK.)
        AsyncStorage.removeItem(ASK.ASK_USER)
        dispatch(actionSetLoginData(null))
      // usenavigation.dispatch(StackActions.replace('splash'))
      resetNavigation(navigation)
        break;
      case 'TYPE_EMERGENCY_JOB_LIST_CNT':
        const lJobListCnt = remoteMessage.data.EmergencyJobListCnt
      dispatch(actionSetJobListCnt(lJobListCnt))
      if(fromNotificationOpened && lJobListCnt!=0)
      navigation.navigate('EmergencyJobOrders',{selectedDate:format(new Date(), 'dd/MM/yyyy')})
        break;
      case 'TYPE_SUP_CHART_DATA':
            dispatch(actionSetChartData(JSON.parse(remoteMessage.data.supChartDataToUpdate)))
        break;
      case 'TYPE_SUP_JOB_ORDER_TO_UPDATE':
        console.log("NavigationContainer","onMessage","TYPE_SUP_JOB_ORDER_TO_UPDATE",{remoteMessage,jobOrderList})
        
        getJobOrders()
            
        break;
        case "TYPE_TECH_LIST_TO_UPDATE":
          console.log("TYPE_TECH_LIST_TO_UPDATE",{remoteMessage},"teclist size",TechList.length)
          let remoteSeList = JSON.parse(remoteMessage.data.SEList)
          if(TechList.length>0 && remoteSeList.length>0){
            remoteSeList.forEach(remoteSE=>{
              console.log({remoteSE})
              let idxToUpdateTechie = TechList.findIndex(Techie=>remoteSE.ServiceEngrID==Techie.ServiceEngrID)
              if(idxToUpdateTechie!=-1){
                TechList[idxToUpdateTechie] = remoteSE
              }
            })
            dispatch(actionSetTechList(TechList))
          }
          break;
          case "TYPE_REFRESH_TECHNICIAN_ALL_DATA":
            dispatch(actionSetRefreshing());
            break;
        default:break;
    }
  }
  return (
    <SafeAreaView style={{ flex: 1, }}>
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

      {(chartData?.length > 0 && visibleGraph) &&<PieChart
        usePercentValues={true}
        style={HomeStyles.chart}
        logEnabled={false}
        // touchEnabled={false}
        // chartBackgroundColor={processColor('pink')}
        chartDescription={description}
        data={data}
        legend={legend}
        // highlights={highlights}

        // extraOffsets={{ left: 5, top: 5, right: 5, bottom: 5 }}

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
        maxAngle={360}
        // onSelect={this.handleSelect.bind(this)}
        onChange={(event) => console.log(event.nativeEvent)}
      />}
          <TouchableOpacity
          style={{alignSelf:'center',}}
          onPress={()=>{
            setVisibleGraph(!visibleGraph)
          }}
          >
            {/* <CmmsText>APPLY</CmmsText> */}
          <Icon name={visibleGraph?"angle-up":"angle-down"} size={32} color='grey' /> 
          </TouchableOpacity>
      
        
        <DatePickerCmms  
        selectedDate={selectedDate}
        onDateChange={(date)=>setSelectedDate(date)}
        text={`${AppTextData.txt_Job_Oders}(${jobOrderList.length})`}
        />


      <View
        style={{marginBottom: 90, flex: 1 }}
      >
        <StatusLabelView jobOrderList={jobOrderList}/>

        <FlatList
          showsVerticalScrollIndicator={false}
          data={jobOrderList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            // const statusDetails = getStatusDetails(item.Status)
            return (
              <GestureRecognizer
                onSwipe={(direction, state) => console.log('direction', direction, 'state', state)}
                onSwipeUp={(state) => console.log('up', 'state', state)}
                onSwipeDown={(state) => console.log('down', 'state', state)}
                onSwipeLeft={(state) => {
                  console.log("jobid: ", item.JOID)
                  if(state.dx < -70)navigation.navigate("TodayJobOrderIssued", { id: item.JOID,SEID: 0})
                }}
                // onSwipeRight={(state) => {
                //   console.log('Item:', item)
                //   console.log('onSwipeRight,From:', item.From, 'To:', item.To)
                // if(state.dx > 70){
                //   if (item.From != 0 && item.To != 0) {
                //     navigation.navigate("JobOrderReport",
                //       { JOID: item.JOID, SEID: item.ServiceEngrID, selectedActivityDetails: [], SelectedSpareParts: [], IsSuperVisor: 1 })
                //   }
                //   else
                //   alert(AppTextData.txt_Job_Report_Not_Entered)
                // }
                // }
                // }
                config={config}
                style={{
                  flex: 1,
                }}
              >
                <JobOrderView item={item} isSupervisor={true}/>
                {/* <TouchableOpacity
                  style={{

                    
                  }}
                  > */}
                  
                  {/* <Image
                    style={{
                      height: 48, width: 48,
                      position: 'absolute', 
                      start: 0, top: 10,
                      alignSelf: 'center', 
                      resizeMode: 'center'
                    }}
                    source={statusDetails?.icon}
                  /> */}
                {/* </TouchableOpacity> */}
              </GestureRecognizer>)
          }} />

      </View>
      
      <View
        style={{ position: 'absolute', bottom: 0 }}
      >
        {/* <CmmsText
            style={{fontWeight:'bold',marginStart:8,marginBottom:4}}
            >Technicians</CmmsText> */}
        <FlatList
        style={{marginTop:10}}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={TechList}
          renderItem={({ item, index }) => <TouchableOpacity
            style={{
              width: 66,
              borderWidth: 1,
              borderColor:CmmsColors.logoTopGreen, 
              marginHorizontal: 2, 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor:'white'
            }}
            onPress={() => {
              // const TechnicianID = item.ServiceEngrID
              // const TechnicianName = item.ServiceEngr
              // const loggedUser = JSON.stringify({ TechnicianID, TechnicianName })
              // dispatch(actionSetTech({ TechnicianID, TechnicianName }))
              // AsyncStorage.setItem("key_technician", loggedUser)
              navigation.navigate('TechnicianDetails', { SEID: item.ServiceEngrID, ServiceEngr: item.ServiceEngr })
            }}
          // ListHeaderComponent={()=><View></View>}
          >
            <Image
              style={{ width: 48, height: 48, }}
              // http://213.136.84.57:4545/Images/Employee/1608183007307e7.jpg
              source={{ uri: `${API_IMAGEPATH}${item.ImageURl}` }} 
              resizeMode={'center'}
              />
            <CmmsText
              numberOfLines={1}
              style={{ textAlign: 'center', fontSize: 10 }}
            >{item.Code}</CmmsText>
            <CmmsText
              numberOfLines={1}
              style={{ width:'100%',marginTop:2,paddingHorizontal:4,
              textAlign: 'center', 
              fontSize: 8,color:item.SEStatus==1?'green':CmmsColors.darkRed }}          
            >{Boolean(item.IsSameDay)&&<Icon style={{marginTop:5}} name='star' size={10} color={CmmsColors.logoBottomGreen} />} <Icon style={{marginTop:5}} name='circle' size={10} color={item.SEStatus==1?'green':CmmsColors.darkRed} /> 
             {` ${Number(item.WorkTime)!=0 ? format(new Date(Number(item.WorkTime)),'HH:mm'):''}`
            //'hh:mm a'
            }</CmmsText> 
            <CmmsText
              numberOfLines={1}
              
              style={{ width:'100%',marginTop:2,textAlign: 'center', 
              color:'white',
              fontSize: 8,paddingHorizontal:4,
              backgroundColor:getDayStatBg(item.DayStatus) }}
            >{`${item.NoOfJO}/${item.TotalAssignedHrs}${item.CurrentJONO ? " - " :""}${item.CurrentJONO}`}</CmmsText>
          </TouchableOpacity>}
        />
      </View>
    </SafeAreaView>
  )

  function getDayStatBg(DayStatus) {
    switch (DayStatus) {
      case 0: return CmmsColors.darkRed
      case 1: return CmmsColors.joDone
      case 2: return CmmsColors.joWip
      default: return 'transparent'
    }
  }
}

export const HomeStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chart: {
    height:Math.floor(screenHeight/3) ,
    marginTop: 10
  }
});
