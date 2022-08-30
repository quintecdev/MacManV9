import React, { useCallback, useEffect, useState } from 'react'
import { TextInput,FlatList, View,Text,TouchableOpacity,Image, Alert } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome';
import CmmsColors from '../../../common/CmmsColors';
import { API_IMAGEPATH, API_SUPERVISOR } from '../../../network/api_constants';
import requestWithEndUrl from '../../../network/request';
import { useSelector, useDispatch } from 'react-redux';
import { format,parse } from 'date-fns';
import { actionSetLoading, actionSetRefreshing } from '../../../action/ActionSettings';
import { CText, CTextThin } from '../../../common/components/CmmsText';
import ViewMoreText from 'react-native-view-more-text';

export default EmergencyJobOrders = ({navigation,route:{params}}) =>{
	const {AppTextData} = useSelector(state => state.AppTextViewReducer)
  console.log('EmergencyJobOrders',{params})
  const { TechList } = useSelector(state => state.TechnicianReducer)
  const { refresh } = useSelector(state => state.SettingsReducer)

  console.log('EmergencyJobOrders',{TechList})
  const [eligibleTechList,setEligibleTechList] = useState(TechList)
  const[emgJoList,setEmgJoList] = useState([
  //   {
  //     "DATETIME": 1630648868000,
  //     "Code": "200016",
  //     "Asset": "Jackson Electric Automatic Food Processing Machinery",
  //     "AssetRegID": 27,
  //     "Location": "Factory 2",
  //     "JOID": 41,
  //     "JORefNo": "41",
  //     "IsShutDown": true,
  //     "ProblemType": "Highly Heated",
  //     "ESC": "Electrical",
  //     "ProblemDescription": "good"
  // },
  // {
  //     "DATETIME": 1631001511000,
  //     "Code": "200019",
  //     "Asset": "Jackson Electric Automatic Food Processing Machinery",
  //     "AssetRegID": 29,
  //     "Location": "Factory 2",
  //     "JOID": 42,
  //     "JORefNo": "42",
  //     "IsShutDown": false,
  //     "ProblemType": "Low Performance",
  //     "ESC": "Boiler",
  //     "ProblemDescription": "sadadas bjnkklm mmklkl jnkjnkmkmkmkm nkkm jolkkkjvd bjhbjk jbjj hjbjbhjkkhkh jbjkjhkjkjkhkhkhkhkhkh hjkjh kjh[pl[l pkpk"
  // },
  
  ])
  // const[emgJoList,setEmgJoList] = useState([])

  const[selectedJobId,setSelectedJobId] = useState(0)
  const[selectedTechId,setSelectedTechId] = useState(0)
  const[time,setTime] = useState(1)

  const dispatch = useDispatch()

  const onTextLayout = useCallback((e,item) => {
    console.log("onTextlayout",e.nativeEvent,item)
    // item.noLines=e.nativeEvent.lines.length
    // setEmgJoList(emgJoList=>[...emgJoList])
  },[])
  useEffect(()=>{
    dispatch(actionSetLoading(true))
  console.log('EmergencyJobOrders','useEffect'+params.selectedDate,{params},)
  const selectedTimemillies = parse(params.selectedDate, "dd/MM/yyyy", new Date()).getTime()
    //http://213.136.84.57:4545/api/ApkSupervisor/EmergencyJobList?Date=1614537000000
    requestWithEndUrl(`${API_SUPERVISOR}EmergencyJobList`,{Date:selectedTimemillies})
    .then(res => {
      console.log('EmergencyJobList',{res})
      dispatch(actionSetLoading(false))

      if (res.status != 200) {
        throw Error(res.statusText);
      }
      return res.data;
    })
    .then(data => {
        console.log('EmergencyJobList',{data})
        data.forEach(emgJo=>{emgJo.noLines=1})
        // const newEmgJoList = data.map(emgJo=>({...emgJo,noLines:1}))
        console.log("EmergencyJobList",{data})
        setEmgJoList(data)
        setSeenBy()
        // if()
    })
    .catch(err=>{
      // alert()
    dispatch(actionSetLoading(false))
    })
  },[])

  useEffect(()=>{
    console.log('useEffect_selectedJobId: ',selectedJobId)
    // /http://213.136.84.57:4545/api/ApkSupervisor/GetAllTechnicians?Date=1627842600000&WorkID=26
    // if(selectedJobId!=0){
  const selectedTimemillies = parse(params.selectedDate, "dd/MM/yyyy", new Date()).getTime()

    requestWithEndUrl(`${API_SUPERVISOR}GetAllTechnicians`,{Date:selectedTimemillies,WorkID:selectedJobId})
    .then(res => {
      console.log('GetAllTechnicians', {res})
      if (res.status != 200) {
        throw Error(res.statusText);
      }
      return res.data;
    })
    .then(data => {
      console.log('GetAllTechnicians', data)
      // setTechnicianList(data)
      setEligibleTechList(data.SEList)
    })
    .catch(err => {
      console.error("GetAllTechnicians", err)
    })
  // } else setEligibleTechList(TechList)

  },[selectedJobId,refresh])

  function setSeenBy(){
    //http://213.136.84.57:4545/api/ApkSupervisor/SetSeenBy
    requestWithEndUrl(`${API_SUPERVISOR}SetSeenBy`,{},'POST')
    .then(res=>{
      console.log('SetSeenBy',{res})
      if (res.status == 200) {
        dispatch(actionSetRefreshing(true))
      }
    })
  }
      return(
          <View
          style={{flex:1}}
          >
            <FlatList
            style={{marginBottom:95}}
            showsVerticalScrollIndicator={false}
            data={emgJoList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              return (
                  <TouchableOpacity
                      style={{
                        marginHorizontal: 8,
                        marginTop: 8, 
                        backgroundColor: item.IsShutDown ? CmmsColors.darkRed : CmmsColors.joPending,
                        // height: 70, 
                        borderRadius: 10,
                        // marginStart: 25,
                        // paddingStart: 20,
                        paddingHorizontal: 8,
                        paddingVertical:4,
                        justifyContent:'center',
                        borderColor:CmmsColors.green,
                        borderWidth:selectedJobId == item.JOID?1:0
                      }}
                      onLongPress={()=>{
                        setSelectedJobId(item.JOID)
                        setTime(1)
                        // setSelectedTechId(6)
                      }
                      }
                      onPress={() => {
                        if(selectedJobId == item.JOID){
                          setSelectedJobId(0)
                          setSelectedTechId(0)
                        }
                        // setSelectedJobId(item.JOID)
                      }}
                    >
                      <CText
                        // numberOfLines={2}
                        style={{fontSize:16,textAlign:'center'}}
                        >
                        {item.JORefNo}/{item.Asset}/{item.Code}/{item.Location}/{item.ESC}  
                      </CText>
                      <ViewMoreText
                      numberOfLines={1}
                      renderViewMore={(onPress)=><Text style={{color:CmmsColors.lightBlue,
                      }}onPress={onPress}>More</Text>}
                      renderViewLess={(onPress)=><Text style={{color:CmmsColors.lightBlue,
                      }}onPress={onPress}>Less</Text>}
                      style={{flexDirection:'row',
                      marginBottom:selectedJobId == item.JOID?20:0,
                      flex:1}}
                      >
                      <CText
                       style={{fontWeight:'bold',flex:1}}
                      //  onTextLayout={(e)=>{
                      //   console.log("onTextlayout",e.nativeEvent.lines.length)
                      //   item.noLines=e.nativeEvent.lines.length
                      //   setEmgJoList(emgJoList=>[...emgJoList])
                      //  }}
                       >{item.ProblemType}:-<CText
                       >{`\b${item.ProblemDescription}`}</CText></CText>
                       
                       {/* {item.noLines>1&&<TouchableOpacity
                       style={{paddingVertical:2,
                        paddingHorizontal:4,
                        alignSelf:'flex-end',
                       }}
                       onPress={()=>{
                         item.noLines=item.noLines>=1&&0
                         setEmgJoList(emgJoList=>[...emgJoList])
                       }
                       }
                       >
                         <CText
                         style={{color:CmmsColors.lightBlue,
                          }}
                         >{item.noLines==1?'More':'Less'}</CText>
                       </TouchableOpacity>} */}
                       </ViewMoreText>
                      {selectedJobId == item.JOID&&<TextInput
                        style={{
                          height:20,paddingHorizontal:4,
                          paddingVertical:4,fontSize:10,borderRadius:4,
                          textAlign:'center',
                          backgroundColor:'white',
                        position:'absolute',end:8,bottom:2}}
                        placeholder='time'
                        keyboardType="numeric"
                        selectTextOnFocus
                        value={`${time}`}
                        onChangeText={(text)=>{
                          
                          setTime(text.replace(/[^1-9]/g, '1'))
                        }}
                        
                      />}
                      </TouchableOpacity>
                  
                )
            }} />

            <FlatList
            style={{marginBottom:2,position:'absolute',bottom:2}}
            showsHorizontalScrollIndicator={false}
            horizontal
            data={eligibleTechList
          //     [ { Code: 'Abin',
          //   ServiceEngr: 'Abin K Jubin Kizhakkethil',
          //   ServiceEngrID: 6,
          //   ImageURl: '1623744409999e5.jpg',
          //   SEStatus: 1,
          //   WorkTime: 56868655,
          //   NoOfJO: 2,
          //   TotalAssignedHrs: 340,
          //   DayStatus: 1,
          //   CurrentJONO: 'jo1' },
          //] 
          }
            renderItem={({ item, index }) => <TouchableOpacity
              style={{
                width: 66,
                borderWidth: 1,
                height:90,
                borderColor:(selectedJobId!=0 && selectedTechId == item.ServiceEngrID)?CmmsColors.green : CmmsColors.coolGray, 
                marginHorizontal: 2, 
                padding: 2, 
                alignItems: 'center', 
                justifyContent: 'center'
              }}
              onPress={() => {
                if(selectedJobId!=0){
                setSelectedTechId(item.ServiceEngrID)
                Alert.alert("Assign",`Are you sure, You want to assign this job to ${item.Code}`,[
                  
                  {text: 'No', onPress: () => {
                    console.log('No Pressed')
                    setSelectedTechId(0)

                }, style: 'cancel'},
                {text: 'Yes', onPress: () => {
                  console.log('Yes Pressed')
                  // http://213.136.84.57:4545/api/ApkSupervisor/AssignEmergencyWork?WorkID=0&SEID=0
                 //http://localhost:29189/api/ApkSupervisor/AssignEmergencyWork?WorkID=0&SEID=0&Date=0&Ehrs=0
                  dispatch(actionSetLoading(true))
                  const selectedTimemillies = parse(params.selectedDate, "dd/MM/yyyy", new Date()).getTime()

                  requestWithEndUrl(`${API_SUPERVISOR}AssignEmergencyWork`,
                  {WorkID:selectedJobId,SEID:item.ServiceEngrID,Date:selectedTimemillies,Ehrs:time},'POST')
                  .then(res => {
                    console.log('AssignEmergencyWork', res)

                    if (res.status != 200) {
                      throw Error(res.statusText);
                    }
                    return res.data;
                  })
                  .then(data => {
                    console.log('AssignEmergencyWork', data)
                  setEmgJoList(emgJoList.filter(emgJo=>emgJo.JOID!=selectedJobId))
                  setSelectedTechId(0)
                  setSelectedJobId(0)
                  dispatch(actionSetLoading(false))
                  dispatch(actionSetRefreshing())
                  alert(data.Message)
                  })
                  .catch(err => {
                  dispatch(actionSetLoading(false))
                  setSelectedTechId(0)
                  alert(AppTextData.txt_somthing_wrong_try_again)
                    console.log('AssignEmergencyWork', err)
                  })

              }},
                ],
                { cancelable: false })
              }
            }
            }
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
                style={{ width:'100%',marginTop:2,paddingHorizontal:4,textAlign: 'center',backgroundColor:'white', 
                fontSize: 8,color:item.SEStatus==1?'green':CmmsColors.darkRed }}          
              ><Icon name='circle' size={12} color={item.SEStatus==1?'green':CmmsColors.darkRed} /> 
              {` ${item.WorkTime!=0?format(new Date(item.WorkTime),'HH:mm'):''}`
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