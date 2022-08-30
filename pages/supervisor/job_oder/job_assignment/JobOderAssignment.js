import React,{useState,useEffect,useRef} from 'react'
import {SafeAreaView,View,
  Text,ImageBackground,Dimensions, Image, TouchableOpacity,StatusBar,
   FlatList, ScrollView, TextInput, Button, BackHandler, Alert} from 'react-native'
import FromToDatePicker from '../components/FromToDatePicker'
import Icon from 'react-native-vector-icons/FontAwesome';
import CmmsColors, { green } from '../../../../common/CmmsColors';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import BottomSheet from 'react-native-simple-bottom-sheet';
import ButtonQtyModify from '../../../Technician/components/ButtonQtyModify';
import requestWithEndUrl from '../../../../network/request';
import { API_SUPERVISOR, API_TECHNICIAN } from '../../../../network/api_constants';
import { parse, format } from 'date-fns'
import { useSelector, useDispatch } from 'react-redux';
import { actionSetLoading, actionSetRefreshing } from '../../../../action/ActionSettings';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import FromToTimePicker from '../components/FromToTimePicker';
import TimeField from '../components/TimeField';
// import { formatTime, formatTimeHhmm } from '../../../Technician/utils';
import { Dialog } from 'react-native-simple-dialogs';
import { showAlert, timeMinToTimeFormat } from '../../../../common/utils';
// import JobOrderView, { statusDetails } from '../../../components/JobOrderView';
import { CmmsText, CmmsTextWhite, CTextTitle } from '../../../../common/components/CmmsText';
import JobOrderView, { statusDetails }  from './component/JobOrderView';
import { useHeaderHeight } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';

const screenHeight = Math.floor(Dimensions.get("window").height);

export default JobOderAssignment=({navigation})=>{
const headerHeight = useHeaderHeight();
const currentDateInMillies = new Date().getTime();//parse(new Date(), "dd/MM/yyyy", new Date()).getTime();
console.log({headerHeight,})
const { loggedUser } = useSelector(state => state.LoginReducer)
// console.log("JobOderAssignment","SUID_TechId: ",loggedUser.TechnicianID)
  const {AppTextData} = useSelector(state => state.AppTextViewReducer)
  const { refresh } = useSelector(state => state.SettingsReducer)
  const [fromNToDate,setFromNToDate] = useState({selectedFromDate:currentDateInMillies,selectedToDate:currentDateInMillies})
  const dispatch = useDispatch()
  const panelRef = useRef(null);
  const timeFiledRef = useRef(null)
  const [maintananceTypes,setMaintananceTypes] = useState([])
  const [checkedMaintananceTypeIds,setCheckedMaintananceTypeIds] = useState([])
    const[jobOrderList,setJobOrderList] = useState([])
    const [visibleActivities,setVisibleActivities] = useState(false)
    const [visibleFilterWindow,setVisibleFilterWindow] = useState(false)
    const [isSelectionMode,setIsSelectionMode] = useState(false)
    const [selectedJoIds,setSelectedJoIds] = useState([])
    
    const [overDueChecked,setOverDueChecked] =useState(false)
    const [backLogChecked,setBackLogChecked] =useState(false)
    const [assignChecked,setAssignChecked] =useState(false)
    const [notAssignChecked,setNotAssignChecked] =useState(true)
    const [pendingChecked,setPendingChecked] =useState(false)

    const [tempOverDueChecked,setTempOverDueChecked] =useState(overDueChecked)
    const [tempBackLogChecked,setTempBackLogChecked] =useState(backLogChecked)
    const [tempAssignChecked,setTempAssignChecked] =useState(assignChecked)
    const [tempNotAssignChecked,setTempNotAssignChecked] =useState(notAssignChecked)
    const [tempPendingChecked,setTempPendingChecked] =useState(pendingChecked)

    const [selectedJoDetails,setselectedJoDetails] = useState({})
    const [IndvdlJoDetails,setIndvdlJoDetails] = useState({})
    const [isPanelOpen,setIsPanelOpen] = useState(false)
    const [asignmentJoMarginBottom,setAssignmentJoMarginBottom] = useState(130)
    const [time,setTime] = useState('12:35')
    const [joOutOfStockList,setJoOutOfStockList] = useState([])
    const [manHourList,setManHourList] = useState([])
    const [visibleCancelRsnDlg,setVisibleCancelRsnDlg] = useState(false)
    const [cancelReason,setCancelReason] = useState('')
    const[filterCountData,setFilterCountData] = useState(null)
    const [assignFromNTo,setAssignFromNTo] = useState({selectedAssignFromDate:currentDateInMillies,selectedAssignToDate:currentDateInMillies})
    const refreshFromSeenBy = useRef(false)
    const [reasonList, setReasonList] = useState([])
    const [selectedDefaultReason,setSelectedDefaultReason] = useState(0)


    const backButtonHandler = () =>{
      showAlert(null,"Are you sure, You want to close this form",(what)=>{
        console.log("alertcallback",what)
        // what(-1 - no, 1 - ok, 0 - dismiss)
        switch(what){
          case 1: {
            dispatch(actionSetRefreshing())
            navigation.goBack()
            // navigation.dispatch(e.data.action)

          }
          break;
          default: return true
        }
      })
      return true
    
    }

    useEffect(()=>{
      console.log('useEffect',"JobOderAssignment")
      BackHandler.addEventListener('hardwareBackPress', backButtonHandler);
      setSeenBy()
      getMaintananceTypes()
      getReasonList()
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', backButtonHandler);
      };
    },[])

    useEffect(()=>{
      console.log('useEffect',{"refresh":refresh})
      
      console.log("JobOderAssignment_refresh",{refresh,refreshFromSeenBy:refreshFromSeenBy.current})
      if(!refreshFromSeenBy.current)refreshPage()
    },[refresh])

   

    useEffect(()=>{
      console.log("useEffect",{assignFromNTo:assignFromNTo})
      getManHours()
    },[assignFromNTo])
    
    useEffect(()=>{
      console.log("useEffect",{isSelectionMode:isSelectionMode})

      setAssignmentJoMarginBottom(isSelectionMode?320:225)
    },[isSelectionMode])
  
    useEffect(()=>{
      // if(selectedJoIds.length>0){
      console.log("useEffect",{selectedJoIds:selectedJoIds})
        console.log('useEffect_4_selectedJoIds.length!=0:',{selectedJoIds})
        const setSelectedJoidData = async()=>{
          await fetchDataBasedOnSelectedJoids()
          await getSparePartsNActivities()
        }
        setSelectedJoidData()
        
    },[selectedJoIds])

    useEffect(()=>{
      console.log("useEffect",{assignChecked,notAssignChecked,backLogChecked,overDueChecked,pendingChecked})
      
      console.log("JobOderAssignment_useefect_with_filters",{assignChecked,notAssignChecked,backLogChecked,overDueChecked,fromNToDate})
      // refreshFetch()
      getJobOrderAssignment()
      
    },[assignChecked,notAssignChecked,backLogChecked,overDueChecked,pendingChecked])

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
            // setSelectedReasonId(data[0].ID)
          }
        })
        .catch(err => {
          console.error("URL_GetReasons", { err })
        })
    }

    async function getSparePartsNActivities(){
      if(selectedJoIds.length>0){
        dispatch(actionSetLoading(true))
        console.log('useEffect_4_GetSParepartsAndActivities:',{selectedJoIds})
        //{"AFromDate":assignFromNTo.selectedAssignFromDate,"AToDate":assignFromNTo.selectedAssignToDate, "Work":}
        // http://localhost:29189/api/ApkSupervisor/GetSParepartsAndActivities
        //[{"WorkID":861,"WorkType":0,"JOID":0},{"WorkID":873,"WorkType":0,"JOID":0}]
        try {
        const spareNactRes = await requestWithEndUrl(`${API_SUPERVISOR}GetSParepartsAndActivities`,selectedJoIds,'POST')
        setselectedJoDetails(spareNactRes.data)
        dispatch(actionSetLoading(false))
        } catch (error) {
          console.error("GetSParepartsAndActivities",error)
          alert(AppTextData.txt_Something_went_wrong)
          dispatch(actionSetLoading(false))
        }
        
      }
    }

    
    async function fetchDataBasedOnSelectedJoids(){
      console.log('fetchDataBasedOnSelectedJoids',{selectedJoIds})
      try{
        dispatch(actionSetLoading(true))
        const outOfStocWorkskRes = await requestWithEndUrl(`${API_SUPERVISOR}GetOutOfStockWorks`,selectedJoIds,'POST')
        console.log('fetchDataBasedOnSelectedJoids',{outOfStocWorkskRes})
        if (outOfStocWorkskRes.status != 200) {
          throw Error(res.statusText);
        }
        setJoOutOfStockList(outOfStocWorkskRes.data)
      }catch(err){
        console.error('fetchDataBasedOnSelectedJoids',{err})
        alert(AppTextData.txt_Something_went_wrong)
      }
      await getManHours()
      dispatch(actionSetLoading(false))
    }
    
    const onDateChange=(fromDate,toDate,isAssignDate=false)=>{
      //issue  onDateChange {"fromDate": 2021-02-06T04:35:01.407Z, "toDate": "13/02/2021"}
      //onDateChange {"selectedFromDate": NaN, "selectedToDate": 1613154600000}
      let selectedFromDate= parse(fromDate, "dd/MM/yyyy", new Date()).getTime()
      let selectedToDate= parse(toDate, "dd/MM/yyyy", new Date()).getTime()
      console.log("onDateChange",{selectedFromDate,selectedToDate,fromDate,toDate})
      
      isAssignDate?setAssignFromNTo({selectedAssignFromDate:selectedFromDate,selectedAssignToDate:selectedToDate}):setFromNToDate({selectedFromDate,selectedToDate})
      // if(isFirstTime){
      //   getJobOrderAssignment(overDueChecked,backLogChecked,notAssignChecked,assignChecked,{selectedFromDate,selectedToDate}) // 1- date change initial
      //   getMaintananceTypes({selectedFromDate,selectedToDate})
      //   getFilterCount({selectedFromDate,selectedToDate})
      // }
      // isFirstTime = false

    }

    /**
     * date change maintanance types in filter
     * @param {} fromTo 
     */
    const getMaintananceTypes = () =>{
      // console.log('getMaintananceTypes',{fromNToDate?.selectedFromDate,selectedToDate})
      //http://213.136.84.57:4545/api/ApkSupervisor/GetMaintenanceJobType?FromDate=0&ToDate=0
      requestWithEndUrl(`${API_SUPERVISOR}GetMaintenanceJobType`,{FromDate:fromNToDate?fromNToDate.selectedFromDate:0,ToDate:fromNToDate?fromNToDate.selectedToDate:0})
      .then(res => {
        console.log("GetMaintenanceJobType",{res})
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then(data => {
        if(checkedMaintananceTypeIds.length>0){
          checkedMaintananceTypeIds.forEach(id=>{
            console.log("checkedMaintananceTypeId",id)
            data.filter(maintananceType=>{
              if(maintananceType.ID==id){
                maintananceType.checked=true
              }
            }
            )
          })
        }
        setMaintananceTypes(data)
      })
      .catch(err=>{
        console.error("GetMaintenanceJobType",err)
      })

    }

    // const onMaintananceTypeSelectionChange =()=>{
    //   console.log("onMaintananceTypeSelectionChange",maintananceTypes.filter(maintananceType=>maintananceType.checked))
    //   getJobOrderAssignment()
    // } 

    // const onOverDueSelectionChange = (overDueChecked) =>{
    //   console.log("onOverDueSelectionChange",overDueChecked)
    //   getJobOrderAssignment(overDueChecked)
    // }

    const getJobOrderAssignment=(isOverDueChecked=overDueChecked,IsBacklogChecked=backLogChecked,
      IsNotAssignChecked=notAssignChecked,IsAssignChecked=assignChecked,fromTo=fromNToDate,IsPendingChecked=pendingChecked)=>{
      dispatch(actionSetLoading(true))
      console.log("getJobOrderAssignment",{assignChecked,overDueChecked,backLogChecked})
      //http://213.136.84.57:4545/api/ApkSupervisor/GetJobOrderAssignment?FromDate=1577817000000&ToDate=1577817000000&IsOverDue=false
      const maintananceTypeLngArray =  maintananceTypes.filter(maintananceType=>maintananceType.checked).map(newmain=>newmain.ID)
      // console.log("getJobOrderAssignment",{selectedFromDate,selectedToDate,overDueChecked,maintananceTypeLngArray})
    //  axios.post
    requestWithEndUrl(`${API_SUPERVISOR}GetJobOrderAssignment`,
    {FromDate:fromTo?fromTo.selectedFromDate:0,
      ToDate:fromTo?fromTo.selectedToDate:0,
      IsOverDue:isOverDueChecked,
      MJT:maintananceTypeLngArray,
      IsBacklog:IsBacklogChecked,
      IsAssigned:IsAssignChecked,
      IsNotAssigned:IsNotAssignChecked,
      IsPending:IsPendingChecked
    },'POST')
    .then(res => {
      dispatch(actionSetLoading(false))
      console.log("GetJobOrderAssignment",{res})
      if (res.status != 200) {
        throw Error(res.statusText);
      }
      return res.data;
    })
    .then(data => {
      setIsSelectionMode(false)
      setSelectedJoIds([])
      setJobOrderList(data)
      refreshFromSeenBy.current = false
    })
    .catch(err=>{
      dispatch(actionSetLoading(false))
      console.error("GetJobOrderAssignment",err)
    })
    }

    function setSeenBy(){
      //http://213.136.84.57:4545/api/ApkSupervisor/SetSeenBy
      requestWithEndUrl(`${API_SUPERVISOR}SetSeenBy`,{},'POST')
      .then(res=>{
        console.log('SetSeenBy',{res})
        if (res.status == 200) {
          refreshFromSeenBy.current = true
          dispatch(actionSetRefreshing())
        } else throw Error(res.statusText)
      })
      .catch(err=>{
        console.log({err})
      })
    }
    
   return(
    <SafeAreaView style={{ flex: 1, }}>
      {/* <ImageBackground
        style={{
          flex: 1,
          position: 'absolute',
          width: '100%',
          height: '100%',
          // justifyContent: 'center',
        }}
        source={require('../../../../assets/bg/bg_cmms.webp')}
      /> */}
      <View style={{padding:8,
        marginBottom:!assignChecked?asignmentJoMarginBottom:asignmentJoMarginBottom-190,}}>
      {/* <Text
        style={{fontWeight:'bold',fontSize: 16,marginVertical:4}}
        >{AppTextData.txt_Overdue_Backlogs}</Text> */}

         
        
        <View
        style={{flexDirection:'row',alignItems:'center',marginBottom:8}}
        >
          <FromToDatePicker
          fromDate={new Date(fromNToDate.selectedFromDate)}
          toDate={new Date(fromNToDate.selectedToDate)} 
          onDateChange={(fromDate,toDate)=>onDateChange(fromDate,toDate)}/>          
          
          <TouchableOpacity
          style={{marginStart:4,padding:4}}
          onPress={()=>{
            refreshFetch()
            // getFilterCount()
            getMaintananceTypes()
          }}
          >
          <Icon name="refresh" size={24} color='black' /> 
          </TouchableOpacity>
          <TouchableOpacity
          style={{marginStart:4,padding:4}}
          onPress={()=>{
            setVisibleFilterWindow(!visibleFilterWindow)
          }}
          >
          <Icon name="sliders" size={24} color='black' /> 
          </TouchableOpacity>
          </View>
          {!assignChecked&&<View 
          style={{backgroundColor:'white',paddingVertical:8,paddingHorizontal:5,
          marginBottom:8,
          borderRadius:2,}}
          >
          <CmmsText
          style={{color:'black',marginBottom:5,fontWeight:'bold'}}
          >Expected Assign Dates</CmmsText>
          <FromToDatePicker
          isAssignDate
          style={{marginStart:5,marginVertical:20}} 
          fromDate={new Date(assignFromNTo.selectedAssignFromDate)}
          toDate={new Date(assignFromNTo.selectedAssignToDate)}
          onDateChange={(fromDate,toDate)=>onDateChange(fromDate,toDate,true)}/>

          {manHourList.length>0&&<View 
          style={{flexDirection:'row',
          justifyContent:'center',alignItems:'center',
          marginTop:8,
          borderWidth:1,borderRadius:2,
          borderColor:'grey',}}>
          <View
              style={{marginEnd:5,padding:5}}
              >
                <CmmsText
                style={{fontWeight:'bold',color:'black',padding:2,}}
                >{AppTextData.txt_Man_Hour}</CmmsText>
                <CmmsText
                style={{fontWeight:'900',color:'green',padding:2}}
                >{AppTextData.txt_Estimated}</CmmsText>
                <CmmsText
                style={{fontWeight:'900',color:'red',padding:2}}
                >{AppTextData.txt_Available}</CmmsText>
              </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={manHourList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              const newEMH = getEstimatedMh(item.TAID)
              console.log('mahourlist_reder',{newEMH})
              return (<View
              style={{marginEnd:5,padding:5,backgroundColor:`${item.AMH <=0 ? CmmsColors.darkRed:'transparent'}` }}
              >
                <CmmsText
                style={{textAlign:'center',fontWeight:'bold',padding:2,color:'black',}}
                >{item.ESC}</CmmsText>
                <CmmsText
                style={{textAlign:'center',fontWeight:'900',padding:2}}
                >{timeMinToTimeFormat(isSelectionMode?newEMH:item.EMH)}
                  {/* {timeMinToTimeFormat(item.EMH)} */}
                  </CmmsText>
                <CmmsText
                style={{textAlign:'center',fontWeight:'900',padding:2}}
                >{
                timeMinToTimeFormat(!isSelectionMode ? item.AMH : item.AMH-newEMH)
                }</CmmsText>
              </View>)
            }}
            />
            </View>}
            </View>}

          <FlatList
          showsVerticalScrollIndicator={false}
          data={jobOrderList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            const statusDetail = statusDetails(item.AllotmentStatus)
            let overDueTime = getOverDueTime(item.OverDueBy)

            const indx = joOutOfStockList.findIndex(joOutOfStock=>joOutOfStock.WorkID==item.WorkID&&joOutOfStock.WorkType==item.WorkType)
            var outOfStock = false
            if(indx!=-1){
              outOfStock = joOutOfStockList[indx].OutOfStock
            }
            console.log({outOfStock,indx},item.WorkID)
            // const maintananceDetails = getMaintananceTypeDetails(index)
            return (
            <GestureRecognizer
            onSwipeLeft={(state)=>{
              if(state.dx < -70){        
                dispatch(actionSetLoading(true))
                // http://localhost:29189/api/ApkSupervisor/GetSParepartsAndActivities
                //[{"WorkID":861,"WorkType":0,"JOID":0},{"WorkID":873,"WorkType":0,"JOID":0}]
                requestWithEndUrl(`${API_SUPERVISOR}GetSParepartsAndActivities`,[{"WorkID":item.WorkID,"WorkType":item.WorkType,"JOID":item.JOID}],'POST')
                .then(res => {
                  console.log("GetSParepartsAndActivities",{res})
                  dispatch(actionSetLoading(false))

                  if (res.status != 200) {
                    throw Error(res.statusText);
                  }
                  return res.data;
                })
                .then(data => {
                  console.log("setIndvdlJoDetails",{data})
                  setIndvdlJoDetails(data)
                })
                .catch(err=>{
                  dispatch(actionSetLoading(false))
                  console.error("GetSParepartsAndActivities",err)
                  alert(AppTextData.txt_Something_went_wrong)
                  setIndvdlJoDetails({})
                })
              }
            }}

            onSwipeRight={(state) => {
              console.log("jobid: ", item)
              // if(state.dx > 70){
              if(state.dx > 70 && item.JOID!=0)
                navigation.navigate("TodayJobOrderIssued", { id: item.JOID, SEID:0})
              
            }}
            
            >
              <TouchableOpacity
                style={{
                  marginBottom: 8, 
                }}
                onPress={() => {
                  console.log('onpressJob: ',{item,isSelectionMode})

                  if(isSelectionMode && item.WorkStatus==0){
                    console.log('onpressJob: ',item)
                  const indxOf = selectedJoIds.findIndex(selecteJoid => selecteJoid.WorkID == item.WorkID)
                    if(indxOf!=-1){
                        
                        selectedJoIds.splice(indxOf,1)
                        if(selectedJoIds.length==0){
                          outOfStock = false
                           setIsSelectionMode(false)
                          //  if(panelRef.current.state.isPanelOpened) 
                        }
                        setSelectedJoIds([...selectedJoIds])
                    } else {
                      setSelectedJoIds(selectedJoIds=>[...selectedJoIds,{"WorkID":item.WorkID,"WorkType":item.WorkType,"JOID":item.JOID}])
                    }
                    // selectedJoIds.length>0&&panelRef.current.togglePanel()
                }
                }
                }
                onLongPress={()=>{
                  if(selectedJoIds.length==0 && item.WorkStatus==0){
                    setSelectedJoIds([{"WorkID":item.WorkID,"WorkType":item.WorkType,"JOID":item.JOID}])
                    setIsSelectionMode(true)
                    // setIsPanelOpen(true)
                    // if(!isPanelOpen){
                    //      panelRef.current.togglePanel()
                    // }
                  }
                }}
              >

                {/* <View
                    style={{width:15,height:16,borderRadius:8,
                        backgroundColor:statusDetails?.color,
                        
                        }}
                    /> */}
                {notAssignChecked?<View
                  style={{
                    backgroundColor: outOfStock ? "#ff4d4d": statusDetail?.color ,
                    minHeight: 60, 
                    flexDirection: 'row',
                    borderRadius: 10,
                    paddingVertical:4,
                    paddingHorizontal:8,
                    alignItems:'center',
                    // marginHorizontal: 8,
                    
                  }}
                >
                  <CmmsText
                    style={{
                      marginBottom:16,
                      fontWeight: '900', 
                      fontFamily: 'sans-serif-condensed',
                      color: 'white', marginEnd:isSelectionMode?20:5,
                      }}
                  >
                    {/* gfdhfhfdjd bfxbxcn n bxfhbfd */}
                    {/* {item.AssetName}/{item.Code}/{item.Location}/{item.MaintenanceJobType}{item.JONO!=0 ? `/JONO: ${item.JONO}`:''} */}
                    {`${item.Code}/${item.AssetName}/${item.MaintenanceJobType}/${item.Location}`.replace(/^\/+|\/+$/g, '')}
                  </CmmsText>

<View
style={{position:'absolute',bottom:4,start:8,
end:8,flexDirection:'row',justifyContent:'space-between',}}
>
  <CmmsText
  style={{fontSize:10,fontWeight:'900',color:'blue',fontFamily: 'sans-serif-light',}}
  
  >{AppTextData.txt_Schedule_Date}{format(item.ScheduleDate,'dd/MM/yyyy')}</CmmsText>
  {overDueTime&&<CmmsText
  style={{fontSize:10,fontWeight:'900',
  color:CmmsColors.darkRed,fontFamily: 'sans-serif-light',}}
  >
    {/* {item.OverDueBy} */}
    {AppTextData.txt_OverDue_By}{overDueTime}
    </CmmsText>}
</View>
                  {/* <CmmsText
                    numberOfLines={1}
                    style={{
                      position: 'absolute', bottom: 4, end: 8,
                      fontSize: 10,
                      backgroundColor: 'white',
                      borderRadius: 5,

                      paddingHorizontal: 5,

                      color: 'blue', fontWeight: '900', marginStart: 5
                    }}
                  >{statusDetails?.status}</CmmsText> */}
                </View>
                
                 :<JobOrderView item={item} isSelectionMode={isSelectionMode} IsAssignChecked={assignChecked}/>}
                {/* <Image
                  style={{
                    height: 48, width: 48,
                    position: 'absolute', start: 0,
                    top:10,
                    alignSelf: 'center',
                  }}
                  source={statusDetail?.icon}
                /> */}
                {isSelectionMode && <Icon 
                style={{position:'absolute',alignSelf:'flex-end',end:5,top:4,}}
                name={selectedJoIds.findIndex(selectedJoId=>selectedJoId.WorkID==item.WorkID)!=-1 ? "check-square-o":"square-o"} size={22} color="white" /> 
                }
              </TouchableOpacity>
              </GestureRecognizer>
              
            )
        }
        }
      />
      </View>

        {isSelectionMode && getBottomSheet() }
          {getIndvdlItemDetailPopUp()}
          {getFilterDlg()}
          {visibleCancelRsnDlg&& getCancelRsnDlg()}
      </SafeAreaView>
    )

function getFilterDlg (){return(<Dialog
    title={"Filter"}
    visible={visibleFilterWindow}
    // onTouchOutside={()=>setVisibleFilterWindow(false)}
    >
    <FlatList
    
    data={maintananceTypes}
    renderItem={({item})=>
    <TouchableOpacity
    style={{flexDirection:'row',
    alignItems:'center',
    height:30,marginEnd:5}}
    onPress={()=>{
      item.checked = !item.checked
      setMaintananceTypes(maintananceTypes=>[...maintananceTypes])
      // onMaintananceTypeSelectionChange()
    }}
    ><Icon name={item.checked?"check-square-o":"square-o"} size={18} color={item.IsScheduled?'green':'black' }/> 
  {/* check-square-o */}
      <CmmsText 
      style ={{fontWeight:'bold',
      textDecorationLine:'underline',
      marginStart:4,
      color:item.IsScheduled?'green':'black'}}
      >{item.Code}({item.Count})</CmmsText>
      </TouchableOpacity>
  }
    />
    {/* <ScrollView
    
    > */}
    <View
    style={{flexDirection:'column',marginTop:16}}
    >
      <TouchableOpacity
    style={{flexDirection:'row',alignItems:'center',
    }}
    onPress={()=>{
      if(!tempPendingChecked){
        setTempAssignChecked(false)
        setTempNotAssignChecked(false)
        setTempOverDueChecked(false)
        setTempBackLogChecked(false)
        }
      setTempPendingChecked(tempPendingChecked=>!tempPendingChecked)
      

    }
    }
    >
    <Icon name={tempPendingChecked ? "check-square-o":"square-o"} size={18} color="black" /> 
    <CmmsText 
    style={{fontWeight:'bold',marginStart:4}}
    >{AppTextData.txt_Pending}{filterCountData?` (${filterCountData.Pending})`:''}</CmmsText>
    </TouchableOpacity>
    <TouchableOpacity
    disabled={tempPendingChecked}
    style={{flexDirection:'row',alignItems:'center',
    }}
    onPress={()=>{
      if(tempNotAssignChecked) setTempNotAssignChecked(false)
      setTempAssignChecked(tempAssignChecked=>!tempAssignChecked)
    }
    }
    >
    <Icon name={tempAssignChecked ? "check-square-o":"square-o"} size={18} color="black" /> 
    <CmmsText 
    style={{fontWeight:'bold',marginStart:4}}
    >{AppTextData.txt_Assigned}{filterCountData?` (${filterCountData.Assigned})`:''}</CmmsText>
    </TouchableOpacity>
    <TouchableOpacity
    disabled={tempPendingChecked}
    style={{flexDirection:'row',marginTop:10,
    alignItems:'center',}}
    onPress={()=>{
      if(tempAssignChecked) setTempAssignChecked(false)
      setTempNotAssignChecked(tempNotAssignChecked=>!tempNotAssignChecked)
    }
    }
    >
    <Icon name={tempNotAssignChecked ? "check-square-o":"square-o"} size={18} color="black" /> 
    <CmmsText 
    style={{fontWeight:'bold',marginStart:4}}
    >{AppTextData.txt_Not_Assigned}{filterCountData?` (${filterCountData.NotAssigned})`:''}</CmmsText>
    </TouchableOpacity>
    <TouchableOpacity
    disabled={tempPendingChecked}
    style={{flexDirection:'row',alignItems:'center',marginTop:10}}
    onPress={()=>{
      setTempBackLogChecked(tempBackLogChecked=>!tempBackLogChecked)
    }
    }
    >
    <Icon name={tempBackLogChecked ? "check-square-o":"square-o"} size={18} color="black" /> 
    <CmmsText 
    style={{fontWeight:'bold',marginStart:4}}
    >{AppTextData.txt_Backlogs}{filterCountData?` (${filterCountData.Backlogs})`:''}</CmmsText>
    </TouchableOpacity>
    <TouchableOpacity
    disabled={tempPendingChecked}
    style={{flexDirection:'row',alignItems:'center',marginTop:10}}
    onPress={()=>{
      setTempOverDueChecked(tempOverDueChecked=>!tempOverDueChecked)
      // onOverDueSelectionChange(!overDueChecked)
    }
    }
    >
    <Icon name={tempOverDueChecked ? "check-square-o":"square-o"} size={18} color="black" /> 
    <CmmsText 
    style={{fontWeight:'bold',marginStart:4}}
    >{AppTextData.txt_Overdue}{filterCountData?` (${filterCountData.Overdue})`:''}</CmmsText>
    </TouchableOpacity>
    
    </View>
    <View
    style={{flexDirection:'row',justifyContent:'flex-end'}}
    >
    <TouchableOpacity
    style={{marginEnd:8,padding:4}}
    onPress={()=>{
      setVisibleFilterWindow(false)
      setTempPendingChecked(pendingChecked)
      setTempAssignChecked(assignChecked)
      setTempNotAssignChecked(notAssignChecked)
      setTempBackLogChecked(backLogChecked)
      setTempOverDueChecked(overDueChecked)

    }}
    >
    <CmmsText
    style={{fontWeight:'bold',color:CmmsColors.btnColorPositive}}
    >CANCEL</CmmsText>
    </TouchableOpacity>
    <TouchableOpacity
    style={{padding:4}}
    onPress={()=>{
      // setJobOrderList([])
      setCheckedMaintananceTypeIds(maintananceTypes
        .filter(maintananceType=>maintananceType.checked)
        .map(maintananceType=>maintananceType.ID))
      setAssignChecked(tempAssignChecked)
      setNotAssignChecked(tempNotAssignChecked)
      setBackLogChecked(tempBackLogChecked)
      setOverDueChecked(tempOverDueChecked)
      setPendingChecked(tempPendingChecked)
      console.log("onPress ok Filter",{assignChecked,notAssignChecked,overDueChecked,backLogChecked,pendingChecked})
      
      setVisibleFilterWindow(false)
    }}
    >
    <CmmsText
    style={{fontWeight:'bold',color:CmmsColors.btnColorPositive}}
    
    >OK</CmmsText>
    </TouchableOpacity>
    </View>
    {/* </ScrollView> */}
    </Dialog>)
}
    
    function getIndvdlItemDetailPopUp(){
      return(
        <Dialog
            visible={Object.keys(IndvdlJoDetails).length != 0}
            animationType="slide"
            contentStyle={{maxHeight:screenHeight-150}}
            onTouchOutside={()=>setIndvdlJoDetails({})}
            buttons={<TouchableOpacity
            style={{elevation:8,paddingHorizontal:16,paddingVertical:8,alignSelf:'flex-end',justifyContent:'center',alignItems:'center'}}
            onPress={()=>setIndvdlJoDetails({})}
            >
              <CmmsText
              style={{fontWeight:'bold'}}
              >{AppTextData.txt_OK}</CmmsText>
            </TouchableOpacity>}
          >
          <ScrollView
           showsVerticalScrollIndicator={false}
           >
                <View
                
                >
                  <View>
                  <CmmsText
                  style={{marginVertical:8,fontWeight:'bold',fontSize:16,alignSelf:'center'}}
                  >{AppTextData.txt_Activities}</CmmsText>
       
                  <FlatList
                  nestedScrollEnabled
                  data={IndvdlJoDetails['ESC']}//{selectedJoDetails['Activities']}
                  renderItem={({item})=>
                    <View
                    style={{padding:8,marginTop:8,borderWidth:1,borderColor:'#778899'}}
                    >
                      <CmmsText
                      style={{fontWeight:'bold',textAlign:'center'}}
                      >{item.Asset}/{item.Code}</CmmsText>
                      <View 
                      style={{flexDirection:'row',alignItems:'center',marginTop:5,padding:4,borderColor:'#778899',justifyContent:'space-between'}}
                      >
                        <CmmsText style={{fontWeight:'bold'}}>{item.ESC} </CmmsText>
                        <View
                        style={{marginHorizontal:8,}}
                        
                        >
                        {/* <ButtonQtyModify  
                          Qty={item.NoOfSE} 
                          onIncrease={()=>{
                            console.log("onIncrease",item.NoOfSE)
                            item.NoOfSE++
                            setselectedJoDetails({...selectedJoDetails})
                          }
                          }
                          onReduce={()=>{
                            if(item.NoOfSE!=1) 
                            {
                              item.NoOfSE--
                            setselectedJoDetails({...selectedJoDetails})
                            }

                          }
                          }
                          /> */}
                          </View>
                          <CmmsText style={{fontWeight:'bold'}}>{
                          `${Math.floor((item.Activities.map(activity=>activity.Ehrs)).reduce((acc,val)=>acc+val,0)/60)}:${(item.Activities.map(activity=>activity.Ehrs)).reduce((acc,val)=>acc+val,0)%60} `}</CmmsText>
                      </View>
                      { item.Activities.map(act=><View 
                      style={{flexDirection:'row',alignItems:'center',marginTop:5}}
                      >
                        <CmmsText style={{flex:1}}>{act.Activity}</CmmsText>
                        <TimeField Ehrs={act.Ehrs} 
                            onChangeTime={(newEhrs)=>{
                                console.log("onChangeTime",{newEhrs,act})
                            //       act.Ehrs = newEhrs
                            //     console.log("selectedjo",item.Activities)
                            // setselectedJoDetails({...selectedJoDetails})

                            }}/>
                      </View>
                      )}
                  </View>
                  }
                  />
                 </View>
                  {IndvdlJoDetails['Spareparts']?.length>0&&<View 
                  >
                  <CmmsText
                  style={{marginVertical:8,fontWeight:'bold',fontSize:16,alignSelf:'center'}}
                  >{AppTextData.txt_Spare_Parts}</CmmsText>
                  {/* <TouchableOpacity
                  style={{alignSelf:'center',}}
                  onPress={()=>{
                    setVisibleActivities(!visibleActivities)
                  }}
                  >
            <Text>APPLY</Text>
          <Icon name={visibleActivities?"angle-up":"angle-down"} size={32} color='black' /> 
          </TouchableOpacity> */}
          {IndvdlJoDetails['Spareparts']?.length>0&&<View
                  style={{borderWidth:1,borderColor:'#778899',
                  height:30,flexDirection:'row',
                  justifyContent:'flex-end',alignItems:'center'}}
                  >
                    <CmmsText
                    style={{marginHorizontal:4,width:70,textAlign:'center',fontWeight:'bold'}}
                    >RQty</CmmsText>
                    <CmmsText
                    style={{marginHorizontal:4,width:70,textAlign:'center',fontWeight:'bold'}}
                    >AQty</CmmsText>
                    <CmmsText
                    style={{marginHorizontal:4,width:70,textAlign:'center',fontWeight:'bold'}}
                    >ES</CmmsText>
                  </View>}
                   <FlatList
                  nestedScrollEnabled
                  style={{borderLeftWidth:1,
                    maxHeight:screenHeight/2,
                    minHeight:50,
                    borderWidth:1,borderColor:'#778899'}}
                  data={IndvdlJoDetails['Spareparts']}
                  renderItem={({item,index})=> <View
                  style={{borderBottomWidth:1,paddingVertical:4,
                    borderBottomColor:'#778899',backgroundColor:`${item.RQTY > item.AQTY ? 'red':'white'}`,
                  }}
                  >
                    <View
                    style={{
                      flexDirection:'row',
                      }}
                    >
  
                      <CmmsText
                      style={{marginHorizontal:4,flex:1,textAlign:'center',fontSize:12}}
                      >{index+1}</CmmsText>
                      <CmmsText
                      style={{marginHorizontal:4,flex:2,textAlign:'center',fontSize:12}}
                      >{item.Code}</CmmsText>
                      <CmmsText
                      style={{flex:3,textAlign:'center',fontSize:12}}
                      >{item.SpareParts}</CmmsText>
                      
                    </View>
                    <View
                    style={{
                      flexDirection:'row',justifyContent:'flex-end',marginTop:5
                      
                     }}
                    >
                      <CmmsText
                    style={{marginHorizontal:4,
                      width:70,textAlign:'center',
                      fontWeight:'bold'}}
                    >{item.RQTY}</CmmsText>
                    <CmmsText
                    style={{marginHorizontal:4,width:70,
                      textAlign:'center',fontWeight:'bold'}}
                    >{item.AQTY}</CmmsText>
                    <CmmsText
                    style={{marginHorizontal:4,width:70,
                      textAlign:'center',fontWeight:'bold'}}
                    >{item.ES}</CmmsText>
                    </View>
                    </View>
                  }
                  />

                 </View>}
                 
                    
               
                
                </View>
                
                </ScrollView>

          </Dialog>
      
      )
    }

    function getBottomSheet(){
      return(
        <BottomSheet
            isOpen={isPanelOpen}
            sliderMinHeight={isSelectionMode? 85 : 0}
            sliderMaxHeight={screenHeight - (headerHeight+StatusBar.currentHeight+10)}
            ref={ref => panelRef.current = ref}
            onOpen={()=>{
              console.log("onOpen")
              setIsPanelOpen(true)
            }}
            onClose={()=>{
              console.log("onClose")
              setIsPanelOpen(false)
            }}
            >
           <ScrollView
           style={{marginBottom:50,}}
           showsVerticalScrollIndicator={false}
           >
                <View
                >
                  {!assignChecked&&<View 
          style={{marginBottom:8,
          borderRadius:2,}}
          >
          <CmmsText
          style={{color:'black',marginBottom:5,fontWeight:'bold'}}
          >Expected Assign Dates</CmmsText>
          <FromToDatePicker
          isAssignDate
          style={{marginStart:5,}} 
          fromDate={new Date(assignFromNTo.selectedAssignFromDate)}
          toDate={new Date(assignFromNTo.selectedAssignToDate)}
          onDateChange={(fromDate,toDate)=>onDateChange(fromDate,toDate,true)}/>
                  
                  {manHourList.length>0&&<View 
          style={{flexDirection:'row',borderWidth:1
          ,borderRadius:2,marginTop:10,borderColor:'grey'}}>
          <View
              style={{marginEnd:5,padding:5}}
              >
                <CmmsText
                style={{fontWeight:'bold',padding:2,color:'black'}}
                >{AppTextData.txt_Man_Hour}</CmmsText>
                <CmmsText
                style={{fontWeight:'900',color:'green',padding:2}}
                >{AppTextData.txt_Estimated}</CmmsText>
                <CmmsText
                style={{fontWeight:'900',color:'red',padding:2}}
                >{AppTextData.txt_Available}</CmmsText>
              </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={manHourList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              const newEMH = getEstimatedMh(item.TAID)
              console.log('mahourlist_bottomsheet_reder',{newEMH})
              return (<View
              style={{marginEnd:5,padding:5,backgroundColor:`${item.AMH <=0 ? CmmsColors.darkRed:'transparent'}` }}
              >
                <CmmsText
                style={{textAlign:'center',fontWeight:'bold',padding:2,color:'black'}}
                >{item.ESC}</CmmsText>
                <CmmsText
                style={{textAlign:'center',fontWeight:'900',padding:2}}
                >{
                  timeMinToTimeFormat(newEMH)
                }</CmmsText>
                <CmmsText
                style={{textAlign:'center',fontWeight:'900',padding:2}}
                >{timeMinToTimeFormat(!isSelectionMode ? item.AMH : item.AMH-newEMH)}
                </CmmsText>
              </View>)
            }}
            />
            </View>}
            </View>}


                  <View>
                  <CmmsText
                  style={{fontWeight:'bold',fontSize:16,alignSelf:'center',color:'black'}}
                  >{AppTextData.txt_Activities}</CmmsText>
                  <FlatList
                  nestedScrollEnabled
                  data={selectedJoDetails['ESC']}//{selectedJoDetails['Activities']}
                  renderItem={({item})=>
                    <View
                    style={{padding:8,marginTop:8,borderWidth:1,borderColor:'#778899'}}
                    >
                      <CmmsText
                      style={{fontWeight:'bold',textAlign:'center',color:'black'}}
                      >{item.Asset}/{item.Code}</CmmsText>
                      <View 
                      style={{flexDirection:'row',alignItems:'center',marginTop:5,padding:4,borderColor:'#778899',justifyContent:'space-between'}}
                      >
                        <CmmsText style={{fontWeight:'bold'}}>{item.ESC} </CmmsText>
                        <View
                        style={{marginHorizontal:8,}}
                        
                        >
                        <ButtonQtyModify  
                          Qty={item.NoOfSE} 
                          onIncrease={()=>{
                            console.log("onIncrease",item.NoOfSE)
                            item.NoOfSE++
                            setselectedJoDetails({...selectedJoDetails})
                          }
                          }
                          onReduce={()=>{
                            if(item.NoOfSE!=1) 
                            {
                              item.NoOfSE--
                            setselectedJoDetails({...selectedJoDetails})
                            }

                          }
                          }
                          />
                          </View>
                          <CmmsText style={{fontWeight:'bold'}}>{
                          // `${Math.floor((item.Activities.map(activity=>activity.Ehrs)).reduce((acc,val)=>acc+val,0)/60)}:${(item.Activities.map(activity=>activity.Ehrs)).reduce((acc,val)=>acc+val,0)%60} `
                        timeMinToTimeFormat(item.Activities.map(activity=>activity.Ehrs).reduce((acc,val)=>acc+val,0))
                        }</CmmsText>
                      </View>
                      { item.Activities.map(act=><View 
                      style={{flexDirection:'row',alignItems:'center',marginTop:5}}
                      >
                        <CmmsText style={{flex:1}}>{act.Activity}</CmmsText>
                        <TimeField Ehrs={act.Ehrs} 
                            onChangeTime={(newEhrs)=>{
                                console.log("onChangeTime",newEhrs)
                                  act.Ehrs = newEhrs
                                console.log("selectedjo",item.Activities)
                            setselectedJoDetails({...selectedJoDetails})

                            }}/>
                      </View>
                      )}
                      
                      
                  </View>
                  }
                  />
                 </View>
                  {selectedJoDetails['Spareparts']?.length>0&&<View
                  >
                  <CmmsText
                  style={{marginVertical:8,fontWeight:'bold',fontSize:16,alignSelf:'center',color:'black'}}
                  >{AppTextData.txt_Spare_Parts}</CmmsText>
                  <TouchableOpacity
                  style={{alignSelf:'center',}}
                  onPress={()=>{
                    setVisibleActivities(!visibleActivities)
                  }}
                  >
            {/* <Text>APPLY</Text> */}
          <Icon name={visibleActivities?"angle-up":"angle-down"} size={32} color='black' /> 
          </TouchableOpacity>
          {(selectedJoDetails['Spareparts']?.length>0&&visibleActivities)&&<View
                  style={{borderWidth:1,borderColor:'#778899',
                  height:30,flexDirection:'row',
                  justifyContent:'flex-end',alignItems:'center'}}
                  >

                    {/* <Text
                    style={{marginHorizontal:4,flex:1,textAlign:'center',fontWeight:'bold'}}
                    >SiNo</Text>
                    <Text
                    style={{marginHorizontal:4,flex:2,textAlign:'center',fontWeight:'bold'}}
                    >Code</CmmsText>
                    <CmmsText
                    style={{flex:3,textAlign:'center',fontWeight:'bold'}}
                    >Spareparts</CmmsText> */}
                    <CmmsText
                    style={{marginHorizontal:4,width:70,textAlign:'center',fontWeight:'bold',color:'black'}}
                    >RQty</CmmsText>
                    <CmmsText
                    style={{marginHorizontal:4,width:70,textAlign:'center',fontWeight:'bold',color:'black'}}
                    >AQty</CmmsText>
                    <CmmsText
                    style={{marginHorizontal:4,width:70,textAlign:'center',fontWeight:'bold',color:'black'}}
                    >ES</CmmsText>
                  </View>}
                  {visibleActivities && <FlatList
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  style={{
                    maxHeight:screenHeight/2,
                    minHeight:50,
                    // borderWidth:1,
                    // borderColor:'grey',
                    // marginBottom:10
                    // borderRightWidth:1,borderLeftWidth:1,borderLeftColor:'#778899',
                    // borderRightColor:'#778899'
                  }}
                  data={selectedJoDetails['Spareparts']}
                  renderItem={({item,index})=> <View
                  style={{borderBottomWidth:1,borderLeftWidth:1,borderRightWidth:1,paddingVertical:4,
                    borderBottomColor:'grey',backgroundColor:`${item.RQTY > item.AQTY ? 'red':'white'}`,
                  }}
                  >
                    <View
                    style={{
                      flexDirection:'row',
                      }}
                    >
  
                      <CmmsText
                      style={{marginHorizontal:4,flex:1,textAlign:'center',fontSize:12}}
                      >{index+1}</CmmsText>
                      <CmmsText
                      style={{marginHorizontal:4,flex:2,textAlign:'center',fontSize:12}}
                      >{item.Code}</CmmsText>
                      <CmmsText
                      style={{flex:3,textAlign:'center',fontSize:12}}
                      >{item.SpareParts}</CmmsText>
                      
                    </View>
                    <View
                    style={{
                      flexDirection:'row',justifyContent:'flex-end',marginTop:5
                      
                     }}
                    >
                      <CmmsText
                    style={{marginHorizontal:4,
                      width:70,textAlign:'center',
                      fontWeight:'bold'}}
                    >{item.RQTY}</CmmsText>
                    <CmmsText
                    style={{marginHorizontal:4,width:70,
                      textAlign:'center',fontWeight:'bold'}}
                    >{item.AQTY}</CmmsText>
                    <CmmsText
                    style={{marginHorizontal:4,width:70,
                      textAlign:'center',fontWeight:'bold'}}
                    >{item.ES}</CmmsText>
                    </View>
                    </View>
                  }
                  />}

                 </View>}
                 
                    
               
                
                </View>
                
                </ScrollView>

                <View
                style={{flexDirection:'row',
                position:'absolute',height:40,
                bottom:4,start:0,end:0}}
                >
                <TouchableOpacity
                style={{
                  backgroundColor:CmmsColors.logoBottomGreen,flex:1,
                  justifyContent:'center',alignItems:'center',
                  }}
                onPress={()=>{
                  const ESC = selectedJoDetails['ESC']
                  console.log("Activities: ",ESC)
                  if(ESC.length>0 ){
                  if(ESC.map(esc=>esc.Activities).filter(actList=>actList.filter(act=>act.Ehrs==0).length>0).length==0){
                    navigation.navigate('ActivityListPage',{
                      assignFromNTo,
                      ESC,
                    //   updateAssignedJoids:(selectedJoids)=>{
                    //   console.log("update_seleJOIDS: ",{selectedJoids})
                    //   setSelectedJoIds(selectedJoids)
                    // }
                    })
                    // getJobOrderAssignment()
                  }
                    else alert(AppTextData.txt_invalid_time)
                }
                  }
                }
                >
                  <CmmsTextWhite>{AppTextData.txt_ASSIGN}</CmmsTextWhite>
                </TouchableOpacity>

                {pendingChecked&&<><TouchableOpacity
                style={{
                  backgroundColor:CmmsColors.logoTopGreen,flex:1,
                  justifyContent:'center',alignItems:'center',
                  }}
                onPress={()=>{
                  setVisibleCancelRsnDlg(true)
                  
                  }
                }
                >
                  <CmmsTextWhite style={{textTransform: 'uppercase'}}>{AppTextData.txt_Cancel}</CmmsTextWhite>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                  flex:1,alignItems:'center',
                  backgroundColor:CmmsColors.darkRed,justifyContent:'center'}}
                  onPress={()=>{
                    console.log({selectedJoIds})
                    dispatch(actionSetLoading(true))
                    requestWithEndUrl(`${API_SUPERVISOR}DeleteAssignedWork`,selectedJoIds.map(seleJoid=>seleJoid.JOID),'POST')
                    .then(res => {
                      console.log("DeleteAssignedWork",{res})
                      dispatch(actionSetLoading(false))
            
                      if (res.status != 200) {
                        throw Error(res.statusText);
                      }
                      return res.data;
                    })
                    .then(data => {
                      if(data.isSucess){
                        // refreshPage()
                        dispatch(actionSetRefreshing())
                      }
                      alert(data.Message)
                      
                    })
                    .catch(err=>{
                  dispatch(actionSetLoading(false))
            
                      console.error("DeleteAssignedWork",err)
                    })
                    
                  }}
                  >
                    <CmmsTextWhite>{AppTextData.txt_DELETE}</CmmsTextWhite>

                  </TouchableOpacity></>}
                  
                  </View>
          
          </BottomSheet>
      )
    }

    function refreshPage(){
      console.log('refreshPage',{refresh})
      setIsSelectionMode(false)
      setIsPanelOpen(false)
      // panelRef.current.togglePanel()
      // setSelectedJoIds([])
      setselectedJoDetails({})
      refreshFetch()
      // getJobOrderAssignment()
    }

    function refreshFetch(){
      console.log('refreshFetch',assignChecked,notAssignChecked,overDueChecked,backLogChecked)
            getJobOrderAssignment()
            getFilterCount()

            // getManHours()      
    }

    function getCancelRsnDlg(){
      return(<Dialog
              title={"Cancel Backlogs"}
              visible={visibleCancelRsnDlg}
              

              // onTouchOutside={()=>setVisibleFilterWindow(false)}
              
              >
                
                <View
                >
                  <Picker
                        dropdownIconColor={CmmsColors.logoBottomGreen}
                        mode={'dropdown'}
                            selectedValue={selectedDefaultReason}
                            onValueChange={(item,index) => {
                                if(index!=0){
                                
                                setSelectedDefaultReason(item)
                                }
                            }}>
                            {[{Name:AppTextData.txt_Select_Reason,ID:-1},...reasonList].map((item, index) => {
                                return <Picker.Item key={index} label={`${item.Name}`} value={`${item.ID}`} />
                            })}
                        </Picker>
                <TextInput
                selectTextOnFocus
                    style={{marginHorizontal:8,
                      paddingHorizontal:8,justifyContent:'flex-start',
                      alignItems:'flex-start',alignContent:'flex-start',
                      textAlignVertical:'top',
                      borderWidth:1,height:100,borderColor:'grey'}}
                    multiline={true}
                    numberOfLines={4}
                    placeholder='Please enter your reason to cancel backlogs'
                    onChangeText={(text) => setCancelReason(text)}
                    value={cancelReason}/>
                <View
                style={{marginTop:16,flexDirection:'row',
                alignSelf:'flex-end',justifyContent:'space-between'}}
                  
                  >
                <TouchableOpacity
                style={{
                  justifyContent:'center',alignItems:'center',
                  paddingHorizontal:8,
                  paddingVertical:4,
                  }}
                onPress={()=>{
                  setVisibleCancelRsnDlg(false)
                  }
                }
                >
                  <CmmsText>CANCEL</CmmsText>
                </TouchableOpacity>
                <TouchableOpacity
                style={{
                  // backgroundColor:CmmsColors.logoBottomGreen,
                  justifyContent:'center',alignItems:'center',
                  paddingHorizontal:8,
                  // paddingVertical:2
                  }}
                onPress={()=>{
                  postCancelBackLogs()
                  
                  }
                }
                >
                  <CmmsText style={{color:CmmsColors.logoBottomGreen,}}>SUBMIT</CmmsText>
                </TouchableOpacity>
                </View>
                </View>
                
      
      </Dialog>)
    }

    function getFilterCount(){
      // http://localhost:29189/api/ApkSupervisor/GetFilterCount?FromDate=1609871400000&ToDate=1609871400000

      requestWithEndUrl(`${API_SUPERVISOR}GetFilterCount`,{FromDate:fromNToDate?fromNToDate.selectedFromDate:0,
        ToDate:fromNToDate?fromNToDate.selectedToDate:0})
        .then(res=>{
          console.log('getFilterCount',res)
          if(res.status==200){
            return res.data
          } else throw Error(res.statusText)
        })
        .then(data=>setFilterCountData(data))
        .catch(err=>{
          console.log({err})
          setFilterCountData(null)
        })
    }

    function postCancelBackLogs(){
      // http://213.136.84.57:1818/api/ApkSupervisor/CancellBacklogs
                //   body:{
                //     "Works":[{"WorkID":109,"WorkType":0},{"WorkID":109,"WorkType":0}],"Date":1633520711728,"Reason":"SADSADASDA"
                // }
                dispatch(actionSetLoading(true))
                requestWithEndUrl(`${API_SUPERVISOR}CancellBacklogs`,{Works:selectedJoIds,
                  Notes:cancelReason,
                  Date:new Date().getTime(),ReasonID:selectedDefaultReason,SEID:loggedUser.TechnicianID},'POST')
                .then(res=>{
                  console.log('CancellBacklogs',{res})
                  if (res.status != 200) {
                    throw Error(res.statusText);
                  }
                  return res.data;
                })
                .then(data=>{
                  dispatch(actionSetLoading(false))
                  if(data.isSucess){
                    setVisibleCancelRsnDlg(false)
                    dispatch(actionSetRefreshing())
                    setCancelReason('')
                  }
                  alert(data.Message)
                })
                .catch(err=>{
                  console.log('CancellBacklogs',{err})
                  alert(AppTextData.txt_somthing_wrong_contact_admin)
                  dispatch(actionSetLoading(false))
                })
    }

    function getEstimatedMh(TAID){
      let totMin = 0
      selectedJoDetails['ESC']?.filter(fElement=>fElement.TypeOfActivityID==TAID).forEach(element => {
        totMin +=(element.Activities.map(activity=>activity.Ehrs)).reduce((acc,val)=>acc+val,0)
      }
      )
      return totMin//timeMinToTimeFormat(totMin)
    }

    async function getManHours(){
      //http://213.136.84.57:4545/api/ApkSupervisor/GetAvailableEMHvsAMH
      try{
      const maintananceTypeLngArray =  maintananceTypes.filter(maintananceType=>maintananceType.checked).map(newmain=>newmain.ID)
      const manHourRes = await requestWithEndUrl(`${API_SUPERVISOR}GetAvailableEMHvsAMH`,
                            {FromDate:fromNToDate?fromNToDate.selectedFromDate:0,
                              ToDate:fromNToDate?fromNToDate.selectedToDate:0, 
                            IsOverDue:overDueChecked,
                            MJT:maintananceTypeLngArray,
                            IsBacklog:backLogChecked,
                            IsAssigned:assignChecked,
                            IsNotAssigned:notAssignChecked,
                            IsPending:pendingChecked,
                              WorkList:selectedJoIds,
                              AFromDate:assignFromNTo.selectedAssignFromDate,
                              AToDate:assignFromNTo.selectedAssignToDate 
                            },'POST'
                            )
        console.log('fetchDataBasedOnSelectedJoids',{manHourRes})
        if (manHourRes.status != 200) {
          throw Error(res.statusText);
        }
        setManHourList(manHourRes.data)
      }catch(err){
        console.error({err})
        alert(AppTextData.txt_Something_went_wrong)
      }
    }

    function getOverDueTime(min){
      const minutesInYear = 60 * 24 * 365;
      // if(min>=60){
      //   const hour = Math.floor(min/60)
      // }
      const days = (min / 60 / 24) % 365
      console.log({min,minutesInYear,days})
      const floorDays = Math.floor(days)
      console.log({floorDays})
      return floorDays>0?`${floorDays} days`:null
    }

    // function getStatusDetails(status) {
    //     switch (status) {
    //       case 0: return { status: 'Pending', color: CmmsColors.joSilverAlpha, icon: require('../../../../assets/icons/ic_jo_silver.png') }
    //       case 1: return { status: 'Closed', color: CmmsColors.joGreenAlpha, icon: require('../../../../assets/icons/ic_jo_green.png') }
    //       // case 2: return { status: 'Pending', color: CmmsColors.joSilverAlpha, icon: require('../../../assets/icons/ic_jo_silver.png') }
    //       case 2: return { status: 'WIP', color: CmmsColors.joYellowAlpha, icon: require('../../../../assets/icons/ic_jo_yellow.png') }
    //       default: return null
    //     }
    
    //   }

}