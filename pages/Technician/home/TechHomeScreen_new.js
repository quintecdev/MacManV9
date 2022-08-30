import React, { useRef, useState, useEffect } from 'react';
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
  ScrollView,
  Animated
} from 'react-native';
import DatePicker from 'react-native-datepicker'
// import DatePicker from '@react-native-community/datetimepicker'
import BottomSheet from 'react-native-simple-bottom-sheet';
import Icon from 'react-native-vector-icons/FontAwesome';
import Timer from '../components/Timer';
import useTimer from '../hook/useTimer';
import { Dialog } from 'react-native-simple-dialogs';
const screenWidth = Dimensions.get("window").width;
import { PieChart } from 'react-native-charts-wrapper';
import CmmsColors from '../../../common/CmmsColors';
import axios from 'axios';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import requestWithEndUrl from '../../../network/request';
import { API_TECHNICIAN, URL_GETWORKSTATUSPIEGRAPHBYDATE } from '../../../network/api_constants';
import { parse, format } from 'date-fns'
import { id, ja } from 'date-fns/locale'
import eo from 'date-fns/locale/eo'
import { useSelector, useDispatch } from 'react-redux';
import ButtonQtyModify from '../components/ButtonQtyModify';
import ButtonQtyModifyWithLabel from '../components/ButtonQtyModifyWithLabel';
import { actionSetLoading } from '../../../action/ActionSettings';
import{getCloser} from '../utils'
const screenHeight = Dimensions.get("window").height;
console.log({screenHeight})
import { RNCamera } from 'react-native-camera';

const legend = {
  enabled: true,
  textSize: 15,
  form: 'SQUARE',

  horizontalAlignment: "CENTER",
  verticalAlignment: "BOTTOM",
  orientation: "HORIZONTAL",
  wordWrapEnabled: false,
  maxSizePercent: 10
  // formToTextSpace:20
  // drawInside:false,
  // direction:'RIGHT_TO_LEFT',
  // xEntrySpace:8,
  // yEntrySpace:10
}

const description = {
  text: '',
  textSize: 15,
  textColor: processColor('darkgray'),

}
const headerHeight = screenHeight/3;


export default HomeScreen = ({ navigation }) => {
	const {AppTextData} = useSelector(state => state.AppTextViewReducer)
  
  const { Technician: { TechnicianID, TechnicianName } } = useSelector(state => state.TechnicianReducer)
  console.log("Home", TechnicianID)
  console.log('Date', new Date().getTime())
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'dd/MM/yyyy'))//format(new Date(), 'dd/MM/yyyy')
  const [chartData, setChartData] = useState([])
  const [selectedJob, setSelectedJob] = useState({})
  const { refresh } = useSelector(state => state.SettingsReducer)
  const { isLoading } = useSelector(state => state.SettingsReducer)

  const dispatch = useDispatch()
  const {diffClamp} = Animated;
  console.log("chartData", chartData, { refresh })
  const data = {
    dataSets: [{
      values: chartData,
      label: '',
      config: {
        colors: chartData.length == 3 ? [processColor(chartData[0].color),
        processColor(chartData[1].color),
        processColor(chartData[2].color)] : [],
        valueTextSize: 12,
        valueTextColor: processColor('black'),
        sliceSpace: 0,
        selectionShift: 10,
        // xValuePosition: "OUTSIDE_SLICE",
        // yValuePosition: "OUTSIDE_SLICE",
        valueFormatter: "#.#'%'",
        valueLineColor: processColor('black'),
        valueLinePart1Length: 0.9
      }
    }],
  }

  const[IsVisibleGraph,setIsVisibleGraph]=useState(true)
  const [jobOrderList, setJobOrderList] = useState([{"TNO":"14","DateTime":1623739323000,"Code":"20006",
  "Asset":"Induction griddle plate","AssetID":7,"Location":"Factory 1",
  "ServiceEngr":"Abin K Jubin Kizhakkethil","ServiceEngrID":6,"Status":1,
  "MaintenanceJobType":"Preventive","JOID":2742,"OverdueBy":"0 Days",
  "ExpHrs":0.0,"ActHrs":0.0,"CurrentStatus":0,"From":1623740328000,
  "To":1623741212000,"LatestStartTime":0,"TypeOfActivity":"Electronics,Electrical"},{"TNO":"14","DateTime":1623739323000,"Code":"20006",
  "Asset":"Induction griddle plate","AssetID":7,"Location":"Factory 1",
  "ServiceEngr":"Abin K Jubin Kizhakkethil","ServiceEngrID":6,"Status":1,
  "MaintenanceJobType":"Preventive","JOID":2742,"OverdueBy":"0 Days",
  "ExpHrs":0.0,"ActHrs":0.0,"CurrentStatus":0,"From":1623740328000,
  "To":1623741212000,"LatestStartTime":0,"TypeOfActivity":"Electronics,Electrical"},
{"TNO":"16","DateTime":1623742561000,"Code":"20007",
"Asset":"Induction Four Zone Live Counter","AssetID":6,
"Location":"Factory 1","ServiceEngr":"Abin K Jubin Kizhakkethil",
"ServiceEngrID":6,"Status":1,"MaintenanceJobType":"Preventive",
"JOID":2744,"OverdueBy":"0 Days","ExpHrs":0.0,"ActHrs":0.0,
"CurrentStatus":0,"From":1623742643000,"To":1623742676000,
"LatestStartTime":0,"TypeOfActivity":"Electrical,Electronics"},
  {"TNO":"14","DateTime":1623739323000,"Code":"20006",
  "Asset":"Induction griddle plate","AssetID":7,"Location":"Factory 1",
  "ServiceEngr":"Abin K Jubin Kizhakkethil","ServiceEngrID":6,"Status":1,
  "MaintenanceJobType":"Preventive","JOID":2742,"OverdueBy":"0 Days",
  "ExpHrs":0.0,"ActHrs":0.0,"CurrentStatus":0,"From":1623740328000,
  "To":1623741212000,"LatestStartTime":0,"TypeOfActivity":"Electronics,Electrical"},{"TNO":"14","DateTime":1623739323000,"Code":"20006",
  "Asset":"Induction griddle plate","AssetID":7,"Location":"Factory 1",
  "ServiceEngr":"Abin K Jubin Kizhakkethil","ServiceEngrID":6,"Status":1,
  "MaintenanceJobType":"Preventive","JOID":2742,"OverdueBy":"0 Days",
  "ExpHrs":0.0,"ActHrs":0.0,"CurrentStatus":0,"From":1623740328000,
  "To":1623741212000,"LatestStartTime":0,"TypeOfActivity":"Electronics,Electrical"},
{"TNO":"16","DateTime":1623742561000,"Code":"20007",
"Asset":"Induction Four Zone Live Counter","AssetID":6,
"Location":"Factory 1","ServiceEngr":"Abin K Jubin Kizhakkethil",
"ServiceEngrID":6,"Status":1,"MaintenanceJobType":"Preventive",
"JOID":2744,"OverdueBy":"0 Days","ExpHrs":0.0,"ActHrs":0.0,
"CurrentStatus":0,"From":1623742643000,"To":1623742676000,
"LatestStartTime":0,"TypeOfActivity":"Electrical,Electronics"},
    {"TNO":"14","DateTime":1623739323000,"Code":"20006",
    "Asset":"Induction griddle plate","AssetID":7,"Location":"Factory 1",
    "ServiceEngr":"Abin K Jubin Kizhakkethil","ServiceEngrID":6,"Status":1,
    "MaintenanceJobType":"Preventive","JOID":2742,"OverdueBy":"0 Days",
    "ExpHrs":0.0,"ActHrs":0.0,"CurrentStatus":0,"From":1623740328000,
    "To":1623741212000,"LatestStartTime":0,"TypeOfActivity":"Electronics,Electrical"},{"TNO":"14","DateTime":1623739323000,"Code":"20006",
    "Asset":"Induction griddle plate","AssetID":7,"Location":"Factory 1",
    "ServiceEngr":"Abin K Jubin Kizhakkethil","ServiceEngrID":6,"Status":1,
    "MaintenanceJobType":"Preventive","JOID":2742,"OverdueBy":"0 Days",
    "ExpHrs":0.0,"ActHrs":0.0,"CurrentStatus":0,"From":1623740328000,
    "To":1623741212000,"LatestStartTime":0,"TypeOfActivity":"Electronics,Electrical"},
  {"TNO":"16","DateTime":1623742561000,"Code":"20007",
  "Asset":"Induction Four Zone Live Counter","AssetID":6,
  "Location":"Factory 1","ServiceEngr":"Abin K Jubin Kizhakkethil",
  "ServiceEngrID":6,"Status":1,"MaintenanceJobType":"Preventive",
  "JOID":2744,"OverdueBy":"0 Days","ExpHrs":0.0,"ActHrs":0.0,
  "CurrentStatus":0,"From":1623742643000,"To":1623742676000,
  "LatestStartTime":0,"TypeOfActivity":"Electrical,Electronics"},
    {"TNO":"14","DateTime":1623739323000,"Code":"20006",
    "Asset":"Induction griddle plate","AssetID":7,"Location":"Factory 1",
    "ServiceEngr":"Abin K Jubin Kizhakkethil","ServiceEngrID":6,"Status":1,
    "MaintenanceJobType":"Preventive","JOID":2742,"OverdueBy":"0 Days",
    "ExpHrs":0.0,"ActHrs":0.0,"CurrentStatus":0,"From":1623740328000,
    "To":1623741212000,"LatestStartTime":0,"TypeOfActivity":"Electronics,Electrical"},{"TNO":"14","DateTime":1623739323000,"Code":"20006",
    "Asset":"Induction griddle plate","AssetID":7,"Location":"Factory 1",
    "ServiceEngr":"Abin K Jubin Kizhakkethil","ServiceEngrID":6,"Status":1,
    "MaintenanceJobType":"Preventive","JOID":2742,"OverdueBy":"0 Days",
    "ExpHrs":0.0,"ActHrs":0.0,"CurrentStatus":0,"From":1623740328000,
    "To":1623741212000,"LatestStartTime":0,"TypeOfActivity":"Electronics,Electrical"},
  {"TNO":"16","DateTime":1623742561000,"Code":"20007",
  "Asset":"Induction Four Zone Live Counter","AssetID":6,
  "Location":"Factory 1","ServiceEngr":"Abin K Jubin Kizhakkethil",
  "ServiceEngrID":6,"Status":1,"MaintenanceJobType":"Preventive",
  "JOID":2744,"OverdueBy":"0 Days","ExpHrs":0.0,"ActHrs":0.0,
  "CurrentStatus":0,"From":1623742643000,"To":1623742676000,
  "LatestStartTime":0,"TypeOfActivity":"Electrical,Electronics"}
])
const ref = useRef(null);

  const scrollY = useRef(new Animated.Value(0));
  const scrollYClamped = diffClamp(scrollY.current, 0, headerHeight);

  const translateY = scrollYClamped.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -(headerHeight / 2)],
  });

  const translateYNumber = useRef();

  translateY.addListener(({value}) => {
    translateYNumber.current = value;
  });

  const handleScroll = Animated.event(
    [
      {
        nativeEvent: {
          contentOffset: {y: scrollY.current},
        },
      },
    ],
    {
      useNativeDriver: false,
    },
  );

  const handleSnap = ({nativeEvent}) => {
    const offsetY = nativeEvent.contentOffset.y;
    if (
      !(
        translateYNumber.current === 0 ||
        translateYNumber.current === -headerHeight / 2
      )
    ) {
      if (ref.current) {
        ref.current.scrollToOffset({
          offset:
            getCloser(translateYNumber.current, -headerHeight / 2, 0) ===
            -headerHeight / 2
              ? offsetY + headerHeight / 2
              : offsetY - headerHeight / 2,
        });
      }
    }
  };


  console.debug('data', data)
  const panelRef = useRef(null);
  const [visibleReasonDlg, setVisibleReasonDlg] = useState(false)
  const { timer, isActive, isPaused, handleStart, handlePause, handleResume, handleReset, clearTimer,setTimer,handleLocalStart,setIsPaused,setIsActive } = useTimer(0, TechnicianID, navigation,panelRef)
  const [selectedReasonId, setSelectedReasonId] = useState(1)
  const [reasonList, setReasonList] = useState([])
  const [sparePartsList, setSparePartsList] = useState([])
  const [activityList, setActivityList] = useState([])
  const [visibleBarcodeScanner, setVisibleBarcodeScanner] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  const [animattedHeight,setAnimattedHeight] = useState(new Animated.Value(screenHeight/3))

  useEffect(() => {

    async function getJobOrderNChartDetails(){
      dispatch(actionSetLoading(true))
      
      try{
        const dateTime = Date.now()//1577946600000
        const selectedTimemillies = parse(selectedDate, "dd/MM/yyyy", new Date()).getTime()
        const workPieGraphRes = await requestWithEndUrl(`${API_TECHNICIAN}GetWorkStatusPieGraphByDate`,{CurrentDate:dateTime,Date:selectedTimemillies,SEID:TechnicianID})
        const workSheduledListRes = await requestWithEndUrl(`${API_TECHNICIAN}GetJOScheduleByDate`,{CurrentDate:dateTime,Date:selectedTimemillies,SEID:TechnicianID})
        console.log({workPieGraphRes})
        console.log({workSheduledListRes})
          //  [{ value: 45, label: 'Not Done', color: 'red' },
          //   { value: 15, label: 'On Time', color: 'green' }, { value: 45, label: 'Delayed', color: 'yellow' }]
        setChartData(workPieGraphRes.data)
        // setJobOrderList(workSheduledListRes.data)
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
      console.log({alreadyWorkingRes})
      const {IsWorking,JOID,TNO,LatestStartTime} = alreadyWorkingRes.data
      if(IsWorking){
        alert(`${AppTextData.txt_alr_wrk_in_job} ${alreadyWorkingRes.data.TNO}`)
        setSelectedJob({JOID,TNO,LatestStartTime})
      }
    } catch(err){
      console.log({err})
      alert(AppTextData.txt_somthing_wrong_contact_admin)
    }
    }
    checkAlreadyWorking()
  },[selectedDate])

  useEffect(() => {

    //http://213.136.84.57:4545/api/ApkTechnician/GetReasons
    requestWithEndUrl(`${API_TECHNICIAN}GetReasons`,)
      .then(res => {
        console.log("GetReasons:",{res})
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
  }, [])

  useEffect(() => {
   
    console.log("useeffect_selectedJob: ", selectedJob,timer)
    //http://213.136.84.57:4545/api/ApkTechnician/GetWorkingTime?JOID=1333&SEID=24
    //http://localhost:29189/api/ApkTechnician/GetJOWiseSpareParts?JOID=1321&SEID=6
    //http://localhost:29189/api/ApkTechnician/GetJOWiseActivity?JOID=1321&SEID=6
    const fetchJobOrderWiseDetails = async () => {
      try {
        dispatch(actionSetLoading(true))
        const jobOrderStatusDetRes = await requestWithEndUrl(`${API_TECHNICIAN}GetWorkingTime`, { JOID: selectedJob.JOID, SEID: TechnicianID })
        console.log({jobOrderStatusDetRes})
        const sparePartsRes = await requestWithEndUrl(`${API_TECHNICIAN}GetJOWiseSpareParts`, { JOID: selectedJob.JOID, SEID: TechnicianID })
        console.log({ sparePartsRes })
        const activityRes = await requestWithEndUrl(`${API_TECHNICIAN}GetJOWiseActivity`, { JOID: selectedJob.JOID, SEID: TechnicianID })
        console.log({ activityRes })
          const jobOrderStatusDet = jobOrderStatusDetRes.data
          console.log("WORKTIME: ",jobOrderStatusDet)
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
            panelRef.current.togglePanel()
          }, 700);
      } catch (error) {
        console.error({ error })
        alert(AppTextData.txt_somthing_wrong_try_again)
      }
      dispatch(actionSetLoading(false))


    }

    Object.keys(selectedJob).length > 0 && fetchJobOrderWiseDetails()
  }, [selectedJob])

  function getStatusDetails(status) {
    switch (status) {
      case 0: return { status: 'Pending', color: CmmsColors.joSilverAlpha, icon: require('../../../assets/icons/ic_jo_silver.png') }
      case 1: return { status: 'Closed', color: CmmsColors.joGreenAlpha, icon: require('../../../assets/icons/ic_jo_green.png') }
      // case 2: return { status: 'Pending', color: CmmsColors.joSilverAlpha, icon: require('../../../assets/icons/ic_jo_silver.png') }
      case 2: return { status: 'WIP', color: CmmsColors.joYellowAlpha, icon: require('../../../assets/icons/ic_jo_yellow.png') }
      default: return null
    }

  }

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80
  };

  function setAnimation(disable) {
    Animated.timing(animattedHeight, {
      duration: 10,
      toValue: disable ? 0 : screenHeight/3,
      useNativeDriver: false
    }).start()
  };

  return (
    <SafeAreaView style={{ flex: 1, }}>
      <ImageBackground
        style={{
          flex: 1,
          position: 'absolute',
          width: '100%',
          height: '100%',
          // justifyContent: 'center',
        }}
        source={require('../../../assets/bg/bg_cmms.webp')}
      />

      {chartData.length > 0 && 
      <Animated.View
      style={[styles.chart,{backgroundColor:'blue',height:animattedHeight,transform: [{translateY}]}]}
      ></Animated.View>
      // <PieChart
      //   style={styles.chart}
      //   logEnabled={false}
      //   // touchEnabled={false}
      //   // chartBackgroundColor={processColor('pink')}
      //   chartDescription={description}
      //   data={data}
      //   legend={legend}
      //   // highlights={highlights}

      //   extraOffsets={{ left: 5, top: 5, right: 5, bottom: 5 }}

      //   entryLabelColor={processColor('green')}
      //   entryLabelTextSize={14}
      //   entryLabelFontFamily={'HelveticaNeue-Medium'}
      //   drawEntryLabels={false}

      //   rotationEnabled={true}
      //   rotationAngle={100}
      //   usePercentValues={true}
      //   // styledCenterText={{text:'Pie center text!', color: processColor('pink'), fontFamily: 'HelveticaNeue-Medium', size: 20}}
      //   // centerTextRadiusPercent={100}
      //   holeRadius={50}
      //   holeColor={processColor('transparent')}
      //   // holeColor={processColor('#fff')}
      //   // transparentCircleRadius={45}
      //   // transparentCircleColor={processColor('#f0f0f088')}
      //   maxAngle={600}
      //   // onSelect={handleSelect()}
      //   onChange={(event) => console.log(event.nativeEvent)}
      // />
      }

      <View
        style={{
          // flexDirection:'row',
          alignSelf: 'center',
          marginTop: 20,
          flexDirection: 'row'

        }}

        onPress={() => {

        }}
      >

        <View
          style={{
            flexDirection: 'row',
            backgroundColor: CmmsColors.darkRed,
            borderRadius: 20,

          }}
        >
          <DatePicker
            date={selectedDate}
            mode="date"
            placeholder="select date"
            format="DD/MM/YYYY"
            iconSource={require('../../../assets/icons/ic_calendar.png')}
            // minDate="2016-05-01"
            // maxDate="2016-06-01"
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            customStyles={{
              dateIcon: {
                position: 'absolute',
                left: -15,
                top: -15,
                marginLeft: 5,
                height: 48, width: 56,

              },
              dateInput: {
                marginLeft: 48,
                borderWidth: 0
              },
              dateText: {
                fontWeight: 'bold', color: 'white'
              }
              // ... You can check the source to find the other keys.
            }}
            onDateChange={(date, dateobj) => {
              console.log("ondate_change", date, { dateobj })
              setSelectedDate(date)
            }}
          />
          <Text
            style={{
              fontSize: 16,
              marginStart: 4,
              marginEnd: 8,
              fontWeight: '900',
              alignSelf: 'center',

              color: 'white',
              fontWeight: 'bold',
              fontFamily: 'Arial'
              // textDecorationLine: 'underline'
            }}
          >{AppTextData.txt_Job_Oders} ({jobOrderList.length})
              {/* Todays Job Oders (6) (30 M Hrs) */}
          </Text>

        </View>

        {/* <Image
          style={{
            height: 56, width: 62,
            position: 'absolute', start: 0, bottom: 0,
            alignSelf: 'center'
          }}
          source={require('../../../assets/icons/ic_calendar.png')}
        /> */}
      </View>

      {jobOrderList.length > 0 && <Animated.FlatList
      scrollEventThrottle={16}
      // contentContainerStyle={{paddingTop: headerHeight}}
      onScroll={handleScroll}
      ref={ref}
      onMomentumScrollEnd={handleSnap}
        // style={{ marginTop: 8,flexGrow:0,height:300,position:'absolute',bottom:0,end:0,start:0 }}
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
              onSwipeDown={(state) => console.log('down', 'state', state)}
              onSwipeLeft={(state) => {
                console.log("onSwipeLeft: ", {state})
                navigation.navigate("TodayJobOrderIssued", { id: item.JOID, SEID:TechnicianID})
              }}
              onSwipeRight={(state) => {
                if (item.From != 0 && item.To != 0) {
                  navigation.navigate("JobOrderReport",
                    { JOID: item.JOID, SEID: TechnicianID, selectedActivityDetails: [], SelectedSpareParts: [], IsSuperVisor: 0 })
                }
              }
              }
              config={config}
              style={{
                flex: 1,

              }}
            >
              <TouchableOpacity
                style={{
                  marginBottom: 8, 
                  marginHorizontal:8
                }}
                onPress={() => {

                  if (item.Status != 1) {
                    console.log({ item }, { selectedJob }, item != selectedJob)
                    if (item.JOID != selectedJob.JOID) {
                      if (isPaused || !isActive) {
                        if (isActive) clearTimer()
                        setSelectedJob(item)
                      }
                      else {
                        panelRef.current.togglePanel()
                        alert(AppTextData.txt_alr_wrk_in_another_job)
                      }
                    }
                    else panelRef.current.togglePanel()
                  }

                }
                }
              >

                {/* <View
                    style={{width:15,height:16,borderRadius:8,
                        backgroundColor:statusDetails?.color,
                        
                        }}
                    /> */}
                <View
                  style={{
                    backgroundColor: statusDetails?.color,
                    height: 70, flexDirection: 'row',
                    borderRadius: 10,
                    marginStart:25,
                    paddingStart:20,
                    paddingHorizontal:4,
                    alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <Text
                    numberOfLines={2}
                    style={{
                      flex: 1, fontWeight: '900', fontFamily: 'Arial',
                      fontSize: 12, color: 'black', marginStart: 8,
                    }}
                  >
                    {/* gfdhfhfdjd bfxbxcn n bxfhbfd */}
                    {item.TNO}/{item.Asset}/{item.Code}/{item.Location}/{item.MaintenanceJobType}/{item.TypeOfActivity}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      position: 'absolute', bottom: 4, end: 8,
                      fontSize: 10,
                      backgroundColor: 'white',
                      borderRadius: 5,
                      paddingHorizontal: 5,
                      color: 'blue', fontWeight: '900', marginStart: 5
                    }}
                  >{statusDetails?.status}</Text>
                </View>
                <Image
                  style={{
                    height: 48, width: 48,
                    start:0,top:10,alignSelf:'center',
                    position: 'absolute',
                    justifyContent:'center',alignItems:'center',
                    alignContent:'center',
                  }}
                  source={statusDetails?.icon}
                />
              </TouchableOpacity>
            </GestureRecognizer>)
        }
        }
      />}

      <BottomSheet
        isOpen={false}
        sliderMinHeight={0}
        sliderMaxHeight={screenHeight-70}
        ref={ref => panelRef.current = ref}
      >
        <View
            style={{marginBottom:160}}
        
        >

          <Text
            style={{ fontWeight: 'bold', fontSize: 16,alignSelf:'center' }}
          >{selectedJob.TNO}</Text>
          {selectedJob.LatestStartTime>0&&<Text
          style={{ fontWeight: 'bold',color:'green',}}
          >{AppTextData.txt_Started_at}: {format(selectedJob.LatestStartTime, "hh:mm:ss")}</Text>}
          <Timer
            timer={timer}
          />
          <View
            style={{
              padding: 8, marginVertical: 8,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <TouchableOpacity
              style={{ padding: 4, }}
              onPress={() => handleStart(selectedJob.JOID)}
            // disabled = {!isActive && !isPaused }
            >
              <Image
                style={{ width: 48, height: 48, }}
                source={require('../../../assets/icons/ic_play.png')}
              />
              {/* <Icon name="play" size={32} color="green" /> */}
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginHorizontal: 8, padding: 4 }}
              onPress={() => {

                if (isActive && !isPaused) {
                  if(reasonList.length>0)
                  setVisibleReasonDlg(true)
                  else alert(AppTextData.txt_somthing_wrong_contact_admin)
                }
              }}
            // disabled={!isPaused}

            >
              <Image
                style={{ width: 48, height: 48, }}
                source={require('../../../assets/icons/ic_pause.png')}
              />
              {/* <Icon name="pause" size={32} color="orange" /> */}
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginHorizontal: 8, padding: 4 }}
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
              style={{ marginHorizontal: 8, padding: 4 }}
              onPress={() => handleReset(selectedJob.JOID)}
            >
              <Image
                style={{ width: 48, height: 48, }}
                source={require('../../../assets/icons/ic_stop.png')}
              />
              {/* <Icon name="stop" size={32} color="red" /> */}
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginHorizontal: 8, padding: 4 }}
            >
              <Image
                style={{ width: 48, height: 48, }}
                source={require('../../../assets/icons/ic_doc.png')}
              />
              {/* <Icon name="file-text" size={32} color='black'/> */}
            </TouchableOpacity>
          </View>
          <ScrollView
          
          nestedScrollEnabled
          >
            <View
            >
          {(sparePartsList && sparePartsList.length > 0) && <Text
            style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
          >{AppTextData.txt_Spare_Parts}</Text>}
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
                        console.log("TechHome", 'Error: ', error);
                        alert(AppTextData.txt_somthing_wrong_try_again)
                      });
                  }
                } else alert(AppTextData.txt_must_start_job_to_enable_this)
              }}
            />
            }
          />

          {(activityList && activityList.length > 0) && <Text
            style={{ fontWeight: 'bold', fontSize: 16, marginTop: 8 }}
          >{AppTextData.txt_Activity_Details}</Text>}

          <FlatList
            style={{ marginTop: 5 }}
            showsVerticalScrollIndicator={false}
            data={activityList}
            renderItem={({ item }) => <GestureRecognizer
              style={{ margin: 4, padding: 8, backgroundColor: getStatusDetails(Number(item.Status))?.color }}
              onSwipeRight={() => {
                if (isActive && !isPaused) {
                  if (!isLoading) {
                    dispatch(actionSetLoading(true))
                    console.log("activity swiped")
                    // http://213.136.84.57:4545/Api/ApkTechnician/UpdateActivity
                    requestWithEndUrl(`${API_TECHNICIAN}UpdateActivity`, {
                      "ActivityID": item.ActivityID,
                      "JOID": selectedJob.JOID,
                      "SEID": TechnicianID,
                      "Date": new Date().getTime(),
                      "Status": 1 - item.Status

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
                          item.Status = 1 - item.Status
                          setActivityList((activityList) => [...activityList])
                        } else alert(data.Message)
                      })
                      .catch(err => {
                        dispatch(actionSetLoading(false))
                        console.log("TechHome", 'Error: ', err);
                        alert(AppTextData.txt_somthing_wrong_try_again)
                      })
                  }
                } else alert(AppTextData.txt_must_start_job_to_enable_this)
              }
              }
            ><Text>{item.Activity}</Text>
            </GestureRecognizer>
            }
          />
          </View>
          </ScrollView>
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
                panelRef.current.togglePanel()
              } else alert(AppTextData.txt_must_start_job_to_enable_this)
            }
            }
          >
            <Icon name="barcode" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <Dialog
        // contentStyle={{maxHeight:screenHeight/2}}
        visible={visibleReasonDlg}
        title="Select Reason"
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
              <Text
                style={{ marginStart: 4 }}
              >{item.Name}</Text>
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
              panelRef.current.togglePanel()
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
            panelRef.current.togglePanel()

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
          console.log("TechHome", 'Error: ', error);
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
});
