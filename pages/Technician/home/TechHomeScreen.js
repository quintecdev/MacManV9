import React, { useRef, useState, useEffect } from 'react';
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
  Alert
} from 'react-native';
// import DatePicker from 'react-native-datepicker'
// import DatePicker from '@react-native-community/datetimepicker'
import BottomSheet from 'react-native-simple-bottom-sheet';
import Icon from 'react-native-vector-icons/FontAwesome';
import Timer from '../components/Timer';
import useTimer from '../hook/useTimer';
import { Dialog } from 'react-native-simple-dialogs';
const screenWidth = Dimensions.get("window").width;
import { PieChart } from 'react-native-charts-wrapper';
import CmmsColors from '../../../common/CmmsColors';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import requestWithEndUrl from '../../../network/request';
import { API_TECHNICIAN, URL_GETWORKSTATUSPIEGRAPHBYDATE } from '../../../network/api_constants';
import { parse, format } from 'date-fns'
import { useSelector, useDispatch } from 'react-redux';
import ButtonQtyModifyWithLabel from '../components/ButtonQtyModifyWithLabel';
import { actionSetLoading, actionSetRefreshing } from '../../../action/ActionSettings';
const screenHeight = Dimensions.get("window").height;
console.log({screenHeight})
import { RNCamera } from 'react-native-camera';
import { description, HomeStyles, legend } from '../../supervisor/HomeScreen';
import StatusLabelView from '../../components/StatusLabelView';
import DatePickerCmms from '../../components/DatePickerCmms';
import JobOrderView from '../../components/JobOrderView';
import { CmmsText } from '../../../common/components/CmmsText';
import {useRoute} from '@react-navigation/native';
import messaging, { firebase } from '@react-native-firebase/messaging';
import { actionSetLoginData } from '../../../action/ActionLogin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SvgXml } from 'react-native-svg';
import { xml_pause_btn_red, xml_power_btn_green } from '../../../common/SvgIcons';
import JobStartingPopUp from './components/JobStartingPopUp';
const TAG = "TechHome"
const iconSize = 42
export default HomeScreen = ({ navigation,route:{params,name} }) => {
	const {AppTextData} = useSelector(state => state.AppTextViewReducer)
  const uRoutes = useRoute()
  const { loggedUser: { TechnicianID, TechnicianName } } = useSelector(state => state.LoginReducer)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'dd/MM/yyyy'))//format(new Date(), 'dd/MM/yyyy')
  const [chartData, setChartData] = useState([])
  const [selectedJob, setSelectedJob] = useState({})
  console.log({selectedJob});
  const { refresh } = useSelector(state => state.SettingsReducer)
  const { isLoading } = useSelector(state => state.SettingsReducer)
  const [showJoStartingPopUp, setshowJoStartingPopUp] = useState(false);
  const dispatch = useDispatch()

  const data = {
    dataSets: [{
      values: chartData,
      label: '',
      config: {
        colors: chartData.length == 3 ? [processColor(chartData[0].color),
        processColor(chartData[1].color),
        processColor(chartData[2].color)] : [],
        valueTextSize: 12,
        valueTextColor: processColor('white'),
        sliceSpace: 0,
        selectionShift: 10,
        fontFamily: 'sans-serif-condensed',
        // xValuePosition: "OUTSIDE_SLICE",
        // yValuePosition: "OUTSIDE_SLICE",
        valueFormatter: "#.#'%'",
        valueLineColor: processColor('black'),
        valueLinePart1Length: 0.9
      }
    }],
  }

  const[IsVisibleGraph,setIsVisibleGraph]=useState(true)
  const [jobOrderList, setJobOrderList] = useState(
    [
      // { TNO: '4',
      //      DateTime: 1631705662000,
      //      Code: '20011',
      //      Asset: 'Weber SmartLoader Side Loading System',
      //      AssetID: 10,
      //      Location: 'Factory 1',
      //      ServiceEngr: 'Shine AS',
      //      ServiceEngrID: 54,
      //      Status: 0,
      //      MaintenanceJobType: 'Preventive',
      //      JOID: 3062,
      //      OverdueBy: '0 Days',
      //      ExpHrs: 0,
      //      ActHrs: 0,
      //      CurrentStatus: 0,
      //      From: 0,
      //      To: 0,
      //      LatestStartTime: 0,
      //      TypeOfActivity: 'Electronics',
      //      HoldReason: '',
      //      SRDetails: '09/15/2021  8:00AM To  09/16/2021 11:00AM' },
      //    { TNO: '8',
      //      DateTime: 1631792492000,
      //      Code: '20012',
      //      Asset: 'Weber SmartLoader Side Loading System',
      //      AssetID: 10,
      //      Location: 'Factory 1',
      //      ServiceEngr: 'Shine AS',
      //      ServiceEngrID: 54,
      //      Status: 0,
      //      MaintenanceJobType: 'Preventive',
      //      JOID: 3064,
      //      OverdueBy: '0 Days',
      //      ExpHrs: 0,
      //      ActHrs: 0,
      //      CurrentStatus: 0,
      //      From: 0,
      //      To: 0,
      //      LatestStartTime: 0,
      //      TypeOfActivity: 'Electrical',
      //      HoldReason: '',
      //      SRDetails: '09/16/2021  8:00AM To  09/17/2021 12:00PM' },
      //    { TNO: '10',
      //      DateTime: 1631792574000,
      //      Code: '20014',
      //      Asset: 'Induction griddle plate',
      //      AssetID: 7,
      //      Location: 'Factory 1',
      //      ServiceEngr: 'Shine AS',
      //      ServiceEngrID: 54,
      //      Status: 0,
      //      MaintenanceJobType: 'Preventive',
      //      JOID: 3065,
      //      OverdueBy: '0 Days',
      //      ExpHrs: 0,
      //      ActHrs: 0,
      //      CurrentStatus: 0,
      //      From: 0,
      //      To: 0,
      //      LatestStartTime: 0,
      //      TypeOfActivity: 'Electrical',
      //      HoldReason: '',
      //      SRDetails: '09/16/2021  8:00AM To  09/17/2021  2:00PM' },
      //    { TNO: '12',
      //      DateTime: 1631793049000,
      //      Code: '20013',
      //      Asset: 'Induction Fulka Puffer Live Counter',
      //      AssetID: 9,
      //      Location: 'Factory 1',
      //      ServiceEngr: 'Shine AS',
      //      ServiceEngrID: 54,
      //      Status: 0,
      //      MaintenanceJobType: 'Preventive',
      //      JOID: 3066,
      //      OverdueBy: '0 Days',
      //      ExpHrs: 0,
      //      ActHrs: 0,
      //      CurrentStatus: 0,
      //      From: 0,
      //      To: 0,
      //      LatestStartTime: 0,
      //      TypeOfActivity: 'Electrical',
      //      HoldReason: '',
      //      SRDetails: '09/16/2021  8:00AM To  09/16/2021 10:00AM' },
            
    ]
    )
  const [scrollPosition,setScrollPosition]=React.useState(0)
  const panelRef = useRef(null);
  const [visibleReasonDlg, setVisibleReasonDlg] = useState(false)
  const { timer, isActive, isPaused, handleStart, handlePause, handleResume, handleReset, clearTimer,setTimer,handleLocalStart,setIsPaused,setIsActive } = useTimer(0, TechnicianID, navigation,panelRef)
  const [selectedReasonId, setSelectedReasonId] = useState(1)
  const [reasonList, setReasonList] = useState([])
  const [sparePartsList, setSparePartsList] = useState([])
  const [activityList, setActivityList] = useState([])
  const [visibleBarcodeScanner, setVisibleBarcodeScanner] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  const [animattedHeight,setAnimattedHeight] = useState(new Animated.Value(Math.floor(screenHeight/3)))

  useEffect(() => {
    async function getJobOrderNChartDetails(){
      dispatch(actionSetLoading(true))
      
      try{
        const dateTime = Date.now()//1577946600000
        const selectedTimemillies = parse(selectedDate, "dd/MM/yyyy", new Date()).getTime()
        const workPieGraphRes = await requestWithEndUrl(`${API_TECHNICIAN}GetWorkStatusPieGraphByDate`,{CurrentDate:dateTime,Date:selectedTimemillies,SEID:TechnicianID})
        const workSheduledListRes = await requestWithEndUrl(`${API_TECHNICIAN}GetJOScheduleByDate`,{CurrentDate:dateTime,Date:selectedTimemillies,SEID:TechnicianID})
          //  [{ value: 45, label: 'Not Done', color: 'red' },
          //   { value: 15, label: 'On Time', color: 'green' }, { value: 45, label: 'Delayed', color: 'yellow' }]
        setChartData(workPieGraphRes.data)
        setJobOrderList(workSheduledListRes.data)
        dispatch(actionSetLoading(false))

      } catch(err){
        console.error(err)
        alert(AppTextData.txt_somthing_wrong_contact_admin)
        dispatch(actionSetLoading(false))
  
      }

    }

    getJobOrderNChartDetails()

  }, [selectedDate, refresh]);

  useEffect(()=>{
    //http://213.136.84.57:4545/api/ApkTechnician/CheckAlreadyWorking?SEID=8
    const checkAlreadyWorking = async()=>{
      try{
      const alreadyWorkingRes = await requestWithEndUrl(`${API_TECHNICIAN}CheckAlreadyWorking`,{SEID:TechnicianID})
      const {IsWorking,TNO} = alreadyWorkingRes.data

      if(IsWorking){
        alert(`${AppTextData.txt_alr_wrk_in_job} ${TNO}`)
        setSelectedJob(alreadyWorkingRes.data)
      }
    } catch(err){
      console.error({err})
      alert(AppTextData.txt_somthing_wrong_contact_admin)
    }
    }
    checkAlreadyWorking()
  },[selectedDate])

  useEffect(() => {
    getReasonList()

    const bgMsgHandler = messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log(TAG,'Message handled in the background!', remoteMessage);
      handleFirebaseMsgFg(remoteMessage)
    });
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
        console.log(remoteMessage); // always prints null
        if (remoteMessage) {
          handleFirebaseMsgFg(remoteMessage,true)
        }
      });

      ()=>{
        unsubscribe;
        bgMsgHandler
        // backgroundMessageHandler;
      }
  }, [])

  function handleFirebaseMsgFg(remoteMessage,fromNotificationOpened=false){
    switch(remoteMessage.data.type){
      case 'TYPE_LOG_OUT':
        // AsyncStorage.removeItem(ASK.)
        AsyncStorage.removeItem(ASK.ASK_USER)
        dispatch(actionSetLoginData(null))
      // usenavigation.dispatch(StackActions.replace('splash'))
      resetNavigation(navigation)
        break;
      // case 'TYPE_EMERGENCY_JOB_LIST_CNT':
      //   const lJobListCnt = remoteMessage.data.EmergencyJobListCnt
      // dispatch(actionSetJobListCnt(lJobListCnt))
      // if(fromNotificationOpened && lJobListCnt!=0)
      // navigation.navigate('EmergencyJobOrders',{selectedDate:format(new Date(), 'dd/MM/yyyy')})
      //   break;
      // case 'TYPE_SUP_CHART_DATA':
      //       dispatch(actionSetChartData(JSON.parse(remoteMessage.data.supChartDataToUpdate)))
      //   break;
      // case 'TYPE_SUP_JOB_ORDER_TO_UPDATE':
      //   console.log("NavigationContainer","onMessage","TYPE_SUP_JOB_ORDER_TO_UPDATE",{remoteMessage,jobOrderList})
      //       let remoteMessageSupJob = JSON.parse(remoteMessage.data.supJobOrderToUpdate)
      //       let jobOrderToUpdateIdx = jobOrderList.findIndex(jobOrderToUpdate=>{
      //         console.log("NavigationContainer","onMessage","findINdex",{jobOrderToUpdate,remoteMessageSupJob})

      //         return jobOrderToUpdate.JOID==remoteMessageSupJob.JOID
      //       })
      //       console.log("NavigationContainer","onMessage",{jobOrderToUpdateIdx,"supJobOrderToUpdate":remoteMessage.data.supJobOrderToUpdate,remoteMessageSupJob})
      //       if(jobOrderToUpdateIdx!=-1){
      //         console.log("NavigationContainer","onMessage","Success")
      //       let newJobOrderList = [...jobOrderList]
      //       newJobOrderList[jobOrderToUpdateIdx] = remoteMessageSupJob
      //       dispatch(actionSetJobOrderList(newJobOrderList))
      //       }
      //   break;
      //   case "TYPE_TECH_LIST_TO_UPDATE":
      //     console.log("TYPE_TECH_LIST_TO_UPDATE",{remoteMessage},"teclist size",TechList.length)
      //     let remoteSeList = JSON.parse(remoteMessage.data.SEList)
      //     if(TechList.length>0 && remoteSeList.length>0){
      //       remoteSeList.forEach(remoteSE=>{
      //         console.log({remoteSE})
      //         let idxToUpdateTechie = TechList.findIndex(Techie=>remoteSE.ServiceEngrID==Techie.ServiceEngrID)
      //         if(idxToUpdateTechie!=-1){
      //           TechList[idxToUpdateTechie] = remoteSE
      //         }
      //       })
      //       dispatch(actionSetTechList(TechList))
      //     }
      //     break;
          case "TYPE_REFRESH_TECHNICIAN_ALL_DATA":
            dispatch(actionSetRefreshing());
            break;
        default:break;
    }
  }
  
  function getReasonList(){
    //http://213.136.84.57:4545/api/ApkTechnician/GetReasons
    requestWithEndUrl(`${API_TECHNICIAN}GetReasons`,)
      .then(res => {
        console.log("GetReasons",{res})
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then(data => {
        if (data.length > 0) {
          setReasonList(data)
          setSelectedReasonId(data[0].ID)
        }
      })
      .catch(err => {
        console.error("URL_GetReasons", { err })
      })
  }

  useEffect(() => {
    //http://213.136.84.57:4545/api/ApkTechnician/GetWorkingTime?JOID=1333&SEID=24
    //http://localhost:29189/api/ApkTechnician/GetJOWiseSpareParts?JOID=1321&SEID=6
    //http://localhost:29189/api/ApkTechnician/GetJOWiseActivity?JOID=1321&SEID=6
    const fetchJobOrderWiseDetails = async () => {
      try {
        dispatch(actionSetLoading(true))
        const jobOrderStatusDetRes = await requestWithEndUrl(`${API_TECHNICIAN}GetWorkingTime`, { JOID: selectedJob.JOID, SEID: TechnicianID })
        const sparePartsRes = await requestWithEndUrl(`${API_TECHNICIAN}GetJOWiseSpareParts`, { JOID: selectedJob.JOID, SEID: TechnicianID })
        const activityRes = await requestWithEndUrl(`${API_TECHNICIAN}GetJOWiseActivity`, { JOID: selectedJob.JOID, SEID: TechnicianID })
          const jobOrderStatusDet = jobOrderStatusDetRes.data
          setTimer(Number(jobOrderStatusDet.WorkTime))
          // 1-start 2-break 3-continue 4-stop
          switch(jobOrderStatusDet.Status){
            case 1:
              handleLocalStart()
              break;
              case 2:
                setIsActive(true)
                setIsPaused(true)
                break;
                case 3:
                setIsPaused(false)
                handleLocalStart()
                break;
                  default:break;

          }
          setSparePartsList(sparePartsRes.data)
          setActivityList(activityRes.data)
          setTimeout(() => {
            panelRef?.current?.togglePanel()
          }, 700);
      } catch (error) {
        console.error({ error })
        alert(AppTextData.txt_somthing_wrong_try_again)
      }
      dispatch(actionSetLoading(false))

    }

    Object.keys(selectedJob).length > 0 && fetchJobOrderWiseDetails()
  }, [selectedJob])

  useEffect(()=>{
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      ()=>{
    console.log('TechHomeScreen_hardwareBackPress',name,'vvj',uRoutes.name,'getstates:',navigation.canGoBack());
        const canGoBack = navigation.canGoBack()
        canGoBack&&navigation.goBack()
        return canGoBack;
      }
    );

    return () => backHandler.remove();
  },[])

  function getStatusDetails(status) {
    switch (status) {
      case 0: return { status: AppTextData.txt_Pending, color: CmmsColors.joPending,}
      case 1: return { status: AppTextData.txt_Closed, color: CmmsColors.joDone,}
      // case 2: return { status: 'Pending', color: CmmsColors.joSilverAlpha, icon: require('../../../assets/icons/ic_jo_silver.png') }
      case 2: return { status: AppTextData.txt_WIP, color: CmmsColors.joWip, }
      default: return null
    }

  }

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80
  };

  function setAnimation(disable) {
    Animated.timing(animattedHeight, {
      duration:100,
      toValue: disable ? 0 : screenHeight/3,
      useNativeDriver: false
    }).start()
    setIsVisibleGraph(!disable)

  };

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
        source={require('../../../assets/bg/bg_cmms.webp')}
      /> */}

      {(chartData.length > 0 && IsVisibleGraph)&&
     <PieChart
          style={[styles.chart]}
          logEnabled={false}
          // touchEnabled={false}
          // chartBackgroundColor={processColor('pink')}
          chartDescription={description}
          data={data}
          legend={legend}
          // highlights={highlights}

          extraOffsets={{ left: 5, top: 5, right: 5, bottom: 5 }}

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
          onChange={(event) => console.log(event.nativeEvent)}
        />}
      
      <TouchableOpacity
        style={{alignSelf:'center',padding:4,marginTop:5}}
        onPress={()=>{
          console.log(IsVisibleGraph)
          
          setAnimation(IsVisibleGraph)

        }
        }
        >
        <Icon name={IsVisibleGraph?"angle-up":"angle-down"} size={32} color='grey' />
        </TouchableOpacity>
        
        <DatePickerCmms  
        selectedDate={selectedDate}
        onDateChange={(date)=>setSelectedDate(date)}
        text={`${AppTextData.txt_Job_Oders}(${jobOrderList.length})`}
        />
      <StatusLabelView jobOrderList={jobOrderList}/>
      {jobOrderList.length > 0 && <FlatList
      scrollEventThrottle={16}
      initialScrollIndex = {scrollPosition}
      // onScroll={(event)=>{
      //   console.log("onScroll",event.nativeEvent.contentOffset.y,scrollPosition)
      //   let yOffset=event.nativeEvent.contentOffset.y / 100;
      //   setScrollPosition(yOffset)
      //   console.log("onScroll",{yOffset,animattedHeight})
      //   event.nativeEvent.contentOffset.y != 0 && setAnimation(event.nativeEvent.contentOffset.y != 0) //setIsVisibleGraph(event.nativeEvent.contentOffset.y != 0)
      //   // setIsVisibleGraph(event.nativeEvent.contentOffset.y >20)
      // }}
        showsVerticalScrollIndicator={false}
        data={jobOrderList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          const statusDetails = getStatusDetails(item.Status)
          // const maintananceDetails = getMaintananceTypeDetails(index)
          return (
            <GestureRecognizer
              onSwipe={(direction, state) => console.log('direction', direction, 'state', state)}
              onSwipeUp={(state) => console.log('up', 'state', state)}
              // onSwipeDown={(state) => {
              //   console.log('down', 'state', state,IsVisibleGraph)
              //   if(!IsVisibleGraph && index==0){
              //     console.log('down_index==0',)
              //     setAnimation(false)

              //   }
              // }}
              onSwipeLeft={(state) => {
                console.log("swipeleft: ",{state})
                if(state.dx < -70 )navigation.navigate("TodayJobOrderIssued", { id: item.JOID, SEID:TechnicianID,ServiceType:item.ServiceType })
              }}
              onSwipeRight={(state) => {
                if(state.dx > 70 && !isActive){
                    if (item.From != 0 && item.To != 0) {
                      navigation.navigate("JobOrderReport",
                        { JOID: item.JOID, SEID: TechnicianID, selectedActivityDetails: [], SelectedSpareParts: [], IsSuperVisor: 0,ServiceType:item.ServiceType })
                    
                      }
                }
              }
              }
              config={config}
              style={{
                flex: 1,

              }}
            >
              <TouchableOpacity
               
                onPress={() => {

                  if (item.Status != 1) {
                    console.log({ item }, { selectedJob }, item != selectedJob)
                    if (item.JOID != selectedJob.JOID) {
                      if (isPaused || !isActive) {
                        if (isActive) clearTimer()
                        setSelectedJob(item)
                      }
                      else {
                        panelRef?.current?.togglePanel()
                        alert(AppTextData.txt_alr_wrk_in_another_job)
                      }
                    }
                    else panelRef?.current?.togglePanel()
                  } 
                  // else{
                  //   selectedJob.IsCheckListAvaliable && navigation.navigate('CheckList',{JOID:selectedJob.JOID})
                  // }

                }
                }
              >

                         <JobOrderView item={item} />
                
              </TouchableOpacity>
            </GestureRecognizer>)
        }
        }
      />}

      {true&&<BottomSheet
        isOpen={false}
        sliderMinHeight={0}
        sliderMaxHeight={screenHeight-70}
        ref={ref => panelRef.current = ref}
      >
        <View
            style={{marginTop:30,marginBottom:60,maxHeight:screenHeight-70}}
        >
          {selectedJob.IsCheckListAvaliable&&<TouchableOpacity
          style={{position:'absolute',end:0,padding:8,elevation:5}}
          onPress={()=>navigation.navigate('CheckList',{JOID:selectedJob.JOID,ServiceType:selectedJob.ServiceType})}
          >
          <Image
                style={{ width: 32, height: 32, }}
                source={require('../../../assets/icons/ic_check_list.png')}
              />
          </TouchableOpacity>}

          <CmmsText
            style={{ fontWeight: 'bold', fontSize: 16,alignSelf:'center' }}
          >{selectedJob.TNO}</CmmsText>
          {selectedJob.LatestStartTime>0&&<CmmsText
          style={{ fontWeight: 'bold',color:'green',fontSize:14}}
          >{AppTextData.txt_Started_at}: {format(selectedJob.LatestStartTime, "dd/MM/yyyy hh:mm:ss")}</CmmsText>}
          <Timer
            timer={timer}
          />
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',marginVertical:8,borderWidth:1,borderColor:CmmsColors.lightGray
            }}
          >
            <TouchableOpacity
              style={styles.joActionBtn}
              onPress={() => {
                if(selectedJob.IsMultipleTechnicians){
                panelRef?.current?.togglePanel()
                setshowJoStartingPopUp(true)
                } else handleStart(selectedJob.JOID)
               
              }
              // handleStart(selectedJob.JOID)
              
              }
            // disabled = {!isActive && !isPaused }
            >
              <SvgXml 
                  xml={
                    xml_power_btn_green
                  } width={iconSize} height={iconSize} />
              {/* <Image
                style={{ width: 48, height: 48, }}
                source={require('../../../assets/icons/power.png')}
              /> */}
              {/* <Icon name="play" size={32} color="green" /> */}
            </TouchableOpacity>
            <TouchableOpacity
              // style={{ marginHorizontal: 4, padding: 4 }}
              style={styles.joActionBtn}

              onPress={() => {
                if (isActive && !isPaused) {
                  if(reasonList.length>0)
                  setVisibleReasonDlg(true)
                  else alert(AppTextData.txt_somthing_wrong_contact_admin)
                }
              }}
            // disabled={!isPaused}

            >
              <SvgXml 
                  xml={
                    xml_pause_btn_red
                  } width={iconSize} height={iconSize} />

              {/* <Image
                style={{ width: 48, height: 48, }}
                source={require('../../../assets/icons/pause.png')}
              /> */}
              {/* <Icon name="pause" size={32} color="orange" /> */}
            </TouchableOpacity>
            <TouchableOpacity
                            style={styles.joActionBtn}

              onPress={() => handleResume(selectedJob.JOID)}
            // disabled={!isActive && !isPaused }
            >
              <Image
                style={{ width: 48, height: 48, }}
                source={require('../../../assets/icons/ic_continue.png')}
              />
              {/* <Icon name="forward" size={32} color="blue"  /> */}
            </TouchableOpacity>
            <TouchableOpacity
                            style={styles.joActionBtn}

              onPress={() => {
                if(isActive)
               { 
                Alert.alert('Stop', 'Are You sure, You want to stop',
              [
                // {
                //   text: 'Ask me later',
                //   onPress: () => console.log('Ask me later pressed')
                // },
                {
                  text: 'No',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel'
                },
                {
                  text: 'Yes', onPress: () => {
                    console.log('OK Pressed')
                    handleReset(selectedJob.JOID,selectedJob.ServiceType)
                  }
                    
                  }
              ])
            } else alert(AppTextData.txt_must_start_job_to_enable_this)
            }
              }
            >
              <Image
                style={{ width: iconSize, height: iconSize, }}
                source={require('../../../assets/icons/stop.png')}
              />
              {/* <Icon name="stop" size={32} color="red" /> */}
            </TouchableOpacity>
            <TouchableOpacity
                            style={styles.joActionBtn}

              onPress={()=>navigation.navigate('Notes',{JOID:selectedJob.JOID})}
            >
              <Image
                style={{ width: 48, height: 48, }}
                source={require('../../../assets/icons/ic_doc.png')}
              />
              {/* <Icon name="file-text" size={32} color='black'/> */}
            </TouchableOpacity>
            <TouchableOpacity
                            style={styles.joActionBtn}

              onPress={()=>navigation.navigate('MHistory',{AssetCode:selectedJob.Code,Asset:selectedJob.Asset,AssetID:selectedJob.AssetID,TechnicianID})}
            >
              <Image
                style={{ width: 42, height: 42, }}
                source={require('../../../assets/icons/ic_m_history.png')}
              />
              {/* <Icon name="file-text" size={32} color='black'/> */}
            </TouchableOpacity>
          </View>
          
          {/* <ScrollView
          > */}
            <View
            style={{maxHeight:screenHeight-320}}
            >
          {(sparePartsList && sparePartsList.length > 0) && <CmmsText
            style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
          >{AppTextData.txt_Spare_Parts}</CmmsText>}
          <FlatList
            showsVerticalScrollIndicator={false}
            data={sparePartsList}
            renderItem={({ item }) => <ButtonQtyModifyWithLabel
              label={`${item.SparePartsName} (${item.UOM})`}
              Qty={item.QTY}
              isNormal={item.QTY == 0}
              onIncrease={() => {
                if (isActive && !isPaused) {
                  onAddSparePartsQty(item)
                } else alert(AppTextData.txt_must_start_job_to_enable_this)
              }}
              onReduce={() => {
                if (isActive && !isPaused) {
                  if (!isLoading) {
                    dispatch(actionSetLoading(true))
                    console.log("onReduce")
                    //http://localhost:29189/api/ApkTechnician/UpdateSPQTY
                    const newQty = item.QTY - 1
                    requestWithEndUrl(`${API_TECHNICIAN}UpdateSPQTY`,
                      {
                        "SparePartsID": item.SparePartsID,
                        "UOMID": item.UOMID,
                        "Qty": newQty,
                        "JOID": selectedJob.JOID,
                        "SEID": TechnicianID,
                        "Date": new Date().getTime()
                      },
                      'POST'
                    )
                      .then(res => {
                        console.log({ res })
                        if (res.status != 200) {
                          throw Error(res.statusText);
                        }
                        return res.data;
                      })
                      .then(data => {
                        if (data.isSucess) {
                          console.log({ sparePartsList }, { item })
                          item.QTY--
                          setSparePartsList((sparePartsList) => [...sparePartsList])
                        } else alert(data.Message)
                        dispatch(actionSetLoading(false))

                      })
                      .catch(function (error) {
                        dispatch(actionSetLoading(false))
                        console.error("TechHome", 'Error: ', error);
                        alert(AppTextData.txt_somthing_wrong_try_again)
                      });
                  }
                } else alert(AppTextData.txt_must_start_job_to_enable_this)
              }}
            />
            }
          />

          {(activityList && activityList.length > 0) && 
          <View
          style={{flexDirection:'row',alignItems:'center',
          justifyContent:'space-between',marginTop:5,
          alignItems:'center'}}
          ><CmmsText
            style={{ fontWeight: 'bold', fontSize: 16,}}
          >{AppTextData.txt_Activity_Details}</CmmsText>
          <TouchableOpacity
          style={{
          borderRadius:5,marginEnd:8,borderColor:CmmsColors.lightGray,borderWidth:1,
          paddingHorizontal:8,paddingVertical:2,
          alignSelf:'flex-end',}}
          onPress={()=>{
            if(isActive) {
              dispatch(actionSetLoading(true))
                    console.log("closed All","ActivityID: ",activityList.map(act=>act.ActivityID))
                    // http://213.136.84.57:4545/Api/ApkTechnician/UpdateActivity
                    //status 1-closed,2-wip,0-pending
                    //http://213.136.84.57:4545/Api/ApkTechnician/ClosedAllActivity
                    requestWithEndUrl(`${API_TECHNICIAN}ClosedAllActivity`, 
                      {
                      "JOID":selectedJob.JOID,
                      "SEID":TechnicianID,
                      "Date":new Date().getTime(),
                      "Status":2,
                      "ActivityIDList":activityList.map(act=>act.ActivityID)
                      }, 'POST')
                      .then(res => {
                        console.log({ res })
                        if (res.status != 200) {
                          throw Error(res.statusText)
                        }
                        return res.data
                      })
                      .then(data => {
                        dispatch(actionSetLoading(false))
                        if (data.isSucess) {
                          activityList.forEach(item=> item.Status = 1)
                          // item.Status = 1
                          setActivityList((activityList) => [...activityList])
                        } else alert(data.Message)
                      })
                      .catch(err => {
                        dispatch(actionSetLoading(false))
                        console.error("TechHome_ClosedALl", 'Error: ', err);
                        alert(AppTextData.txt_somthing_wrong_try_again)
                      })}
          }}
          >
            <CmmsText
            style={{color:CmmsColors.darkRed,fontWeight:'900'}}
            >
              {'Closed All'
              //AppTextData.txt_Closed_All
              }
            </CmmsText>
          </TouchableOpacity>
          </View>
          }

          <FlatList
          style={{marginTop:5}}
            showsVerticalScrollIndicator={false}
            data={activityList}
            renderItem={({ item }) => <GestureRecognizer
              style={{ margin: 4, padding: 8, 
                backgroundColor: getStatusDetails(Number(item.Status))?.color }}
              onSwipeRight={(state) => {
                if(state.dx > 70){
                if (isActive && !isPaused) {
                  if (!isLoading) {
                    const newItemStatus = Math.abs(item.Status - 1)

                    dispatch(actionSetLoading(true))
                    console.log("activity swiped")
                    // http://213.136.84.57:4545/Api/ApkTechnician/UpdateActivity
                    //status 1-closed,2-wip,0-pending
                    requestWithEndUrl(`${API_TECHNICIAN}UpdateActivity`, {
                      "ActivityID": item.ActivityID,
                      "JOID": selectedJob.JOID,
                      "SEID": TechnicianID,
                      "Date": new Date().getTime(),
                      "Status": newItemStatus // 1-2,0-2,2-0

                    }, 'POST')
                      .then(res => {
                        console.log({ res })
                        if (res.status != 200) {
                          throw Error(res.statusText)
                        }
                        return res.data
                      })
                      .then(data => {
                        dispatch(actionSetLoading(false))
                        if (data.isSucess) {
                          item.Status = newItemStatus
                          setActivityList((activityList) => [...activityList])
                        } else alert(data.Message)
                      })
                      .catch(err => {
                        dispatch(actionSetLoading(false))
                        console.error("TechHome", 'Error: ', err);
                        alert(AppTextData.txt_somthing_wrong_try_again)
                      })
                  }
                } else alert(AppTextData.txt_must_start_job_to_enable_this)
              }
              }
              }
              onSwipeLeft={(state) => {
                if(state.dx < -70){
                if (isActive && !isPaused) {
                  if (!isLoading) {
                    dispatch(actionSetLoading(true))
                    console.log("activity swiped")
                    // http://213.136.84.57:4545/Api/ApkTechnician/UpdateActivity
                    //status 1-closed,2-wip,0-pending
                    const newItemStatus = item.Status != 2 ? 2 : 0
                    requestWithEndUrl(`${API_TECHNICIAN}UpdateActivity`, {
                      "ActivityID": item.ActivityID,
                      "JOID": selectedJob.JOID,
                      "SEID": TechnicianID,
                      "Date": new Date().getTime(),
                      "Status":  newItemStatus// 1-2,0-2,2-0

                    }, 'POST')
                      .then(res => {
                        console.log({ res })
                        if (res.status != 200) {
                          throw Error(res.statusText)
                        }
                        return res.data
                      })
                      .then(data => {
                        dispatch(actionSetLoading(false))
                        if (data.isSucess) {
                          item.Status = newItemStatus
                          setActivityList((activityList) => [...activityList])
                        } else alert(data.Message)
                      })
                      .catch(err => {
                        dispatch(actionSetLoading(false))
                        console.error("TechHome", 'Error: ', err);
                        alert(AppTextData.txt_somthing_wrong_try_again)
                      })
                  }
                } else alert(AppTextData.txt_must_start_job_to_enable_this)
              }
              }
              }
            >
              <CmmsText
                style={{color:'white'}}
              >{item.Activity}</CmmsText>
            </GestureRecognizer>
            }
          />
          </View>
          
          {/* </ScrollView> */}
         </View>
         <TouchableOpacity
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: CmmsColors.btnColorPositive,
              padding: 8,
              position:'absolute',
              alignItems: 'center', justifyContent: 'center',alignSelf:'flex-end',
              elevation: 5, bottom: 8,end:8
            }}
            onPress={() => {
              if (isActive && !isPaused) {
                setVisibleBarcodeScanner(true)
                panelRef?.current?.togglePanel()
              } else alert(AppTextData.txt_must_start_job_to_enable_this)
            }
            }
          >
            <Icon name="barcode" size={18} color="white" />
          </TouchableOpacity>
        
      </BottomSheet>}

      <Dialog
        // contentStyle={{maxHeight:screenHeight/2}}
        visible={visibleReasonDlg}
        title={AppTextData.txt_Select_Reason}
        // onTouchOutside={() => dispatch(actionVisibleFilterView())} 
        buttons={<View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button style={{ flex: 1, padding: 10 }} title="Cancel"
            onPress={() => setVisibleReasonDlg(false)}
          />
          <View style={{ width: 2 }} />
          <Button style={{ flex: 1 }} title="   Apply    "
            color='black'
            onPress={() => {
              if (!isPaused) {
                handlePause(selectedReasonId, selectedJob.JOID)
                setVisibleReasonDlg(false)
              }
            }
            }
          />
        </View>}
      >
        <View
          style={{ minHeight: 50 }}
        >
          <FlatList
            data={reasonList}
            renderItem={({ item, index }) => <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}
              onPress={() => setSelectedReasonId(item.ID)}
            >
              <Icon name={selectedReasonId == item.ID ? "dot-circle-o" : "circle-o"} color='black' size={18} />
              <CmmsText
                style={{ marginStart: 4 }}
              >{item.Name}</CmmsText>
            </TouchableOpacity>
            }
          />
          {/* <TextInput
            style={{ flex: 1, color: 'black' }}
            placeholder='Enter your reason to pause'
            placeholderTextColor="black"
            maxLength={10}
            returnKeyType="done"
          // onSubmitEditing={() => passwordInput.focus()}
          // onSubmitEditing={smsPermission()}
          // onChangeText={val => onChangeText('mobile', val)}
          // onChangeText={(text) => { setUser({...User,Password:text}) }}
          /> */}
        </View>
      </Dialog>
      { visibleBarcodeScanner && renderCamera()}
      {showJoStartingPopUp&&<JobStartingPopUp visible={showJoStartingPopUp} 
      onCancel={()=>setshowJoStartingPopUp(false)}
      techId={TechnicianID}
      JOID={selectedJob.JOID}
      startJoFromPopUp={(techList)=>handleStart(selectedJob.JOID,techList,setshowJoStartingPopUp(false))}/>}
    </SafeAreaView>

  )

  function renderCamera() {

    return (
      <RNCamera
        ref={ref => {
          camera = ref;
        }}
        style={{
          flex: 1,
          justifyContent: 'space-between',
        }}
        // type='front'
        autoFocusPointOfInterest={{ x: 0.5, y: 0.5 }}
        // zoom={state.zoom}
        whiteBalance='auto'
        ratio='16:9'
        // flashMode='on'
        // focusDepth={state.depth}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}

        // onGoogleVisionBarcodesDetected={canDetectBarcode ? barcodeRecognized : null}
        onBarCodeRead={(event) => {
          console.log("onBarCodeRead: ", { event })
          if (event && event.data) {
            const barcodeList = sparePartsList.map(spare => spare.Barcode)
            console.log({ barcodeList }, { data: event.data })
            const index = barcodeList.indexOf(event.data)
            if (index != -1) {
              console.log("condtionsatisfy")
              setVisibleBarcodeScanner(false)
              onAddSparePartsQty(sparePartsList[index])
              panelRef?.current?.togglePanel()
            }
          }
        }

        }
      >
        <TouchableOpacity
          style={{
            width: 40, height: 40,
            borderRadius: 20,
            backgroundColor: CmmsColors.colorWithAlpha('black', 0.5), justifyContent: 'center', alignItems: 'center', alignSelf: 'center', margin: 10
          }}
          onPress={() => {
            setVisibleBarcodeScanner(false)
            panelRef?.current?.togglePanel()

          }
          }
        >
          <Icon name="chevron-down" size={24} color="white" />
        </TouchableOpacity>
      </RNCamera>
    )
  }

  function onAddSparePartsQty(item) {

    console.log({ isLoading })
    if (!isLoading) {
      dispatch(actionSetLoading(true))
      //http://localhost:29189/api/ApkTechnician/UpdateSPQTY
      const newQty = item.QTY + 1
      console.log("onIncrease", { newQty }, { item })

      requestWithEndUrl(`${API_TECHNICIAN}UpdateSPQTY`,
        {
          "SparePartsID": item.SparePartsID,
          "UOMID": item.UOMID,
          "Qty": newQty,
          "JOID": selectedJob.JOID,
          "SEID": TechnicianID,
          "Date": new Date().getTime()
        },
        'POST'
      )
        .then(res => {
          console.log({ res })
          if (res.status != 200) {
            throw Error(res.statusText);
          }
          return res.data;
        })
        .then(data => {
          if (data.isSucess) {
            console.log({ sparePartsList }, { item })
            item.QTY++
            setSparePartsList((sparePartsList) => [...sparePartsList])
          } else alert(data.Message)
          setTimeout(() => {
            dispatch(actionSetLoading(false))

          }, 2000);

        })
        .catch(function (error) {
          dispatch(actionSetLoading(false))
          console.error("TechHome", 'Error: ', error);
          alert(AppTextData.txt_somthing_wrong_try_again)
        });
    }

  }

  const _onBackPress = () => {

  }

}

const styles = StyleSheet.create({

  chart: {
    height:Math.floor(screenHeight/3) ,
    marginTop: 10
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

  joActionBtn:{
    paddingHorizontal:8,
    paddingVertical:4,

  }
});
