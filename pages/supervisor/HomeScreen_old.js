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
  processColor
} from 'react-native';
import DatePicker from 'react-native-datepicker'
import BottomSheet from 'react-native-simple-bottom-sheet';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Dialog } from 'react-native-simple-dialogs';
import { PieChart } from 'react-native-charts-wrapper';
import { API_TECHNICIAN, API_SUPERVISOR, API_IMAGEPATH } from '../../network/api_constants';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import { parse, format } from 'date-fns'
import { useSelector, useDispatch } from 'react-redux';
import CmmsColors from '../../common/CmmsColors';
import requestWithEndUrl from '../../network/request';
import { actionSetTechList } from '../../action/ActionTechnician';
import { actionSetLoading } from '../../action/ActionSettings';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const legend = {
  enabled: true,
  textSize: 15,
  form: 'SQUARE',

  horizontalAlignment: "CENTER",
  verticalAlignment: "BOTTOM",
  orientation: "HORIZONTAL",
  wordWrapEnabled: false,
  maxSizePercent: 10
}

const description = {
  text: '',
  textSize: 15,
  textColor: processColor('darkgray'),

}

export default HomeScreen = ({ navigation }) => {
  // console.log("Home", TechnicianID)
  const {AppTextData} = useSelector(state => state.AppTextViewReducer)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'dd/MM/yyyy'))
  const [chartData, setChartData] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(0)
  const [jobListCnt, setJobListCnt] = useState(0)
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
        colors: chartData.length == 2 ? [processColor(chartData[0].color),
        processColor(chartData[1].color)] : [],
        valueTextSize: 12,
        valueTextColor: processColor('black'),
        sliceSpace: 0,
        selectionShift: 10,
        // valueFormatter: "#.#'%'",
        valueLineColor: processColor('black'),
        valueLinePart1Length: 0.9
      }
    }],
  }
  const [jobOrderList, setJobOrderList] = useState([])
  // const [TechnicianList, setTechnicianList] = useState([])


  console.debug('data', data)

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
        setChartData(data)
      })
      .catch(err => {
        console.error("chart", err)
      })

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
        setJobOrderList(data)

      })
      .catch(function (error) {
        console.log("GetJOScheduleByDate", 'Error: ', error);
    dispatch(actionSetLoading(false))

      });

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
        console.error("chart", err)
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
        setJobListCnt(data)
      })
      .catch(err=>{
        console.log('EmergencyJobListCount', err)
      })

  }, [selectedDate, refresh]);

  function getStatusDetails(status) {
    switch (status) {
      case 0: return { status: 'Pending', color: CmmsColors.joSilverAlpha, icon: require('../../assets/icons/ic_jo_silver.png') }
      case 1: return { status: 'Closed', color: CmmsColors.joGreenAlpha, icon: require('../../assets/icons/ic_jo_green.png') }
      case 2: return { status: 'WIP', color: CmmsColors.joYellowAlpha, icon: require('../../assets/icons/ic_jo_yellow.png') }
      case 3: return { status: 'Hold', color: CmmsColors.darkRed, icon: require('../../assets/icons/ic_jo_yellow.png') }
      default: return null
    }

  }

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80
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
        source={require('../../assets/bg/bg_cmms.webp')}
      /> */}

      {(chartData.length > 0 &&visibleGraph) &&<PieChart
        usePercentValues={false}
        style={styles.chart}
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
        // usePercentValues={true}
        // styledCenterText={{text:'Pie center text!', color: processColor('pink'), fontFamily: 'HelveticaNeue-Medium', size: 20}}
        // centerTextRadiusPercent={100}
        holeRadius={50}
        holeColor={processColor('transparent')}
        // holeColor={processColor('#fff')}
        // transparentCircleRadius={45}
        // transparentCircleColor={processColor('#f0f0f088')}
        maxAngle={600}
        // onSelect={this.handleSelect.bind(this)}
        onChange={(event) => console.log(event.nativeEvent)}
      />}
          <TouchableOpacity
          style={{alignSelf:'center',}}
          onPress={()=>{
            setVisibleGraph(!visibleGraph)
          }}
          >
            {/* <Text>APPLY</Text> */}
          <Icon name={visibleGraph?"angle-up":"angle-down"} size={32} color='black' /> 
          </TouchableOpacity>
      <View
        style={{
          // flexDirection:'row',
          // alignSelf: 'center',
          marginTop: 5,
          flexDirection: 'row',
          justifyContent: 'center',

        }}

        onPress={() => {

        }}
      >
        
        <View
          style={{
            alignSelf: 'center',
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
            iconSource={require('../../assets/icons/ic_calendar.png')}
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
            onDateChange={(date) => { setSelectedDate(date) }}
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
          >{AppTextData.txt_Job_Oders}({jobOrderList.length})
              {/* Todays Job Oders (6) (30 M Hrs) */}
          </Text>
        </View>

        <TouchableOpacity
          style={{ position: 'absolute', end: 20, bottom: 4 }}
          onPress={() => navigation.navigate('JobOderAssignment')}
        >
          <Icon name='user-plus' size={28} color="green" />
        </TouchableOpacity>
      </View>

      <View
        style={{ marginTop: 5, 
          marginBottom: 90, flex: 1 }}
      >
        <View
        style={{flexDirection:'row',
        justifyContent:'center',alignItems:'center',
        paddingHorizontal:8,
        marginBottom:5,}}
        >
          <Text
          style={{paddingVertical:4,marginHorizontal:4,
            textAlign:'center',
            width:75,height:30,backgroundColor:CmmsColors.joSilverAlpha}}
          >{jobOrderList.filter(job=>job.Status==0).length}
          </Text>
          <Text
          style={{marginHorizontal:4,paddingVertical:4,
            textAlign:'center',
            width:75,backgroundColor:CmmsColors.joYellowAlpha}}
          >{jobOrderList.filter(job=>job.Status==2).length}
          </Text>
          <Text
          style={{paddingVertical:4,marginHorizontal:4,
            textAlign:'center',
            width:75,height:30,backgroundColor:CmmsColors.joGreenAlpha}}
          >{jobOrderList.filter(job=>job.Status==1).length}
          </Text>
          <TouchableOpacity
          style={{position:'absolute',end:16,top:0,width:40,height:32,
          justifyContent:'center',
          alignItems:'center',elevation:5,
            padding:4,}}
            onPress={()=>{
              jobListCnt !=0 && navigation.navigate('EmergencyJobOrders',{selectedDate})
            }}
          >
          <Icon name='bell' size={32} color={CmmsColors.blueCharcoal}/>
          <Text
          style={{position:'absolute',color:'white',fontSize:12,fontWeight:'bold'}}
          >{jobListCnt}</Text>
          </TouchableOpacity>

        </View>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={jobOrderList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            const statusDetails = getStatusDetails(item.Status)
            return (
              <GestureRecognizer
                onSwipe={(direction, state) => console.log('direction', direction, 'state', state)}
                onSwipeUp={(state) => console.log('up', 'state', state)}
                onSwipeDown={(state) => console.log('down', 'state', state)}
                onSwipeLeft={(state) => {
                  console.log("jobid: ", item.JOID)
                  if(state.dx < -70)navigation.navigate("TodayJobOrderIssued", { id: item.JOID,SEID: 0})
                }}
                onSwipeRight={(state) => {
                  console.log('Item:', item)
                  console.log('onSwipeRight,From:', item.From, 'To:', item.To)
                if(state.dx > 70){
                  if (item.From != 0 && item.To != 0) {
                    navigation.navigate("JobOrderReport",
                      { JOID: item.JOID, SEID: item.ServiceEngrID, selectedActivityDetails: [], SelectedSpareParts: [], IsSuperVisor: 1 })
                  }
                  else
                  alert(AppTextData.txt_Job_Report_Not_Entered)
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

                    marginHorizontal: 8,
                    marginBottom: 8, 
                  }}
                  onPress={() => {
                    setSelectedJobId(item.JOID)
                  }}>
                  <View
                    style={{
                      backgroundColor: statusDetails?.color,
                      height: 70, 
                      borderRadius: 10,
                      marginStart: 25,
                      paddingStart: 20,
                      paddingHorizontal: 4,
                      justifyContent:'center'
                    }}
                  >
                    <Text
                      numberOfLines={2}
                      style={{
                        fontWeight: '900', fontFamily: 'Arial',
                        fontSize: 12, color: 'black', marginStart: 8,
                        marginBottom:5
                      }}>
                      {item.TNO}/{item.Asset}/{item.Code}/{item.Location}/{item.MaintenanceJobType}
                    </Text>
                    <View
                    style={{flexDirection:'row',marginTop:5,
                    alignItems:'center',justifyContent:'center'}}
                    >
                    {item.Status!=0&&<Text
                      numberOfLines={1}
                      style={{
                        fontSize: 10,
                        backgroundColor: 'white',
                        borderRadius: 5,
                        paddingHorizontal: 5,
                        color: 'blue', fontWeight: '900', marginStart: 5
                      }}
                    >{item.HoldReason!="" ? item.HoldReason : item.SRDetails}</Text>}
                    <Text
                      numberOfLines={1}
                      style={{
                        position:'absolute',
                        end:0,
                        fontSize: 10,
                        backgroundColor: 'white',
                        borderRadius: 5,
                        paddingHorizontal: 5,
                        color: 'blue', fontWeight: '900', marginStart: 5
                      }}
                    >{statusDetails?.status}</Text>
                    </View>
                  </View>
                  <Image
                    style={{
                      height: 48, width: 48,
                      position: 'absolute', 
                      start: 0, top: 10,
                      alignSelf: 'center', 
                      resizeMode: 'center'
                    }}
                    source={statusDetails?.icon}
                  />
                </TouchableOpacity>
              </GestureRecognizer>)
          }} />

      </View>
      
      <View
        style={{ position: 'absolute', bottom: 0 }}
      >
        {/* <Text
            style={{fontWeight:'bold',marginStart:8,marginBottom:4}}
            >Technicians</Text> */}
        <FlatList
        style={{marginBottom:2}}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={TechList}
          renderItem={({ item, index }) => <TouchableOpacity
            style={{
              width: 66,
              borderWidth: 1, 
              marginHorizontal: 2, 
              padding: 2, 
              alignItems: 'center', 
              justifyContent: 'center'
            }}
            onPress={() => {
              // const TechnicianID = item.ServiceEngrID
              // const TechnicianName = item.ServiceEngr
              // const Technician = JSON.stringify({ TechnicianID, TechnicianName })
              // dispatch(actionSetTech({ TechnicianID, TechnicianName }))
              // AsyncStorage.setItem("key_technician", Technician)
              navigation.navigate('TechnicianDetails', { SEID: item.ServiceEngrID, ServiceEngr: item.ServiceEngr })
            }}
          // ListHeaderComponent={()=><View></View>}
          >
            <Image
              style={{ width: 48, height: 40, }}
              // http://213.136.84.57:4545/Images/Employee/1608183007307e7.jpg
              source={{ uri: `${API_IMAGEPATH}${item.ImageURl}` }} 
              resizeMode={'center'}
              />
            <Text
              numberOfLines={1}
              style={{ textAlign: 'center', fontSize: 10 }}
            >{item.Code}</Text>
            <Text
              numberOfLines={1}
              style={{ width:'100%',marginTop:2,paddingHorizontal:4,
              textAlign: 'center',backgroundColor:'white', 
              fontSize: 8,color:item.SEStatus==1?'green':CmmsColors.darkRed }}          
            ><Icon name='circle' size={12} color={item.SEStatus==1?'green':CmmsColors.darkRed} /> 
             {` ${item.WorkTime!=0 ? format(new Date(item.WorkTime),'HH:mm'):''}`
            //'hh:mm a'
            }</Text> 
            <Text
              numberOfLines={1}
              
              style={{ width:'100%',marginTop:2,textAlign: 'center', fontSize: 8,paddingHorizontal:4,
              backgroundColor:getDayStatBg(item.DayStatus) }}
            >{item.DayStatus!=1?`${item.NoOfJO}/${item.TotalAssignedHrs} - ${item.CurrentJONO}`:''}</Text>
          </TouchableOpacity>}
        />
      </View>
    </SafeAreaView>

  )

  function getDayStatBg(DayStatus) {
    switch (DayStatus) {
      case 0: return CmmsColors.darkRed
      case 1: return CmmsColors.joGreenAlpha
      case 2: return CmmsColors.joYellowAlpha
      default: return 'transparent'
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chart: {
    height:Math.floor(screenHeight/3) ,
    marginTop: 10
  }
});
