import { format } from 'date-fns';
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
    ImageBackground,
    processColor,
    ScrollView,
    Animated,
    BackHandler
  } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import { SvgXml } from 'react-native-svg';
import Icon from 'react-native-vector-icons/FontAwesome';

import { useSelector, useDispatch } from 'react-redux';
import { actionSetLoading } from '../../../action/ActionSettings';
import CmmsColors from '../../../common/CmmsColors';
import { CmmsText, CText, CTextThin, CTextTitle } from '../../../common/components/CmmsText';
import { ic_picture_attachment } from '../../../common/SvgIcons';
import { API_TECHNICIAN } from '../../../network/api_constants';
import requestWithEndUrl from '../../../network/request';

const screenWidth = Math.floor(Dimensions.get("window").width);

  export default MHistory = ({ navigation,route:{params,name} })=>{
      const [sixMonthMH,setSixMonthMH] = useState({})
      // const [visibleImages,setVisibleImages] = useState(false)
      // const [visibleImagePopUp,setVisibleImagePopUp] = useState(false)
      const {AppTextData} = useSelector(state => state.AppTextViewReducer)
      const dispatch = useDispatch()
      // const [selectedJoid,setSelectedJoid] = useState(-1)
      // const [imageList,setImageList] = useState([])
      const [pageIndex,setPageIndex] = useState(1)
      const [noMoreData,setNoMoreData] = useState(true)

      useEffect(()=>{
        // console.log('MHistory','useEffect','visibleImagePopUp: ',{visibleImagePopUp,pageIndex})
        dispatch(actionSetLoading(true))
        //http://localhost:29189/api/ApkTechnician/GetSixMonthMachineHistory?AssetID=1&PageIndex=1
        requestWithEndUrl(`${API_TECHNICIAN}GetSixMonthMachineHistory`,{AssetID:params.AssetID,PageIndex:pageIndex})
        .then(res=>{
          console.log('GetSixMonthMachineHistory',{res})
    
          if (res.status != 200) {
            throw Error(res.statusText);
          }
          return res.data;
        })
        .then(data=>{
          dispatch(actionSetLoading(false))
          if(data.APKMachineHistoryJOList){
            setSixMonthMH(data)
            setNoMoreData(false)
          }
          else {
            alert("No data found")
            setNoMoreData(true)
          }
        })
        .catch(err=>{
          dispatch(actionSetLoading(false))
          console.error('GetSixMonthMachineHistory',err)
          alert(AppTextData.txt_Something_went_wrong)

        })
  },[pageIndex])

      // useEffect(()=>{
      //   if(selectedJoid!=-1){
      //     console.log('MHistory','useEffect','selectedJoid: ',selectedJoid)
      //     dispatch(actionSetLoading(true))
      //     //http://localhost:29189/api/ApkTechnician/GetImageOfJOBySE?JOID=1&SEID=0
      //     requestWithEndUrl(`${API_TECHNICIAN}GetImageOfJOBySE`,{JOID:selectedJoid,SEID:params.TechnicianID })
      //       .then(res=>{
      //         console.log('GetImageOfJOBySE',{res})
        
      //         if (res.status != 200) {
      //           throw Error(res.statusText);
      //         }
      //         return res.data;
      //       })
      //       .then(data=>{
      //         dispatch(actionSetLoading(false))
      //         setImageList(data)
      //         // if(data.length==0) alert
      //       })
      //       .catch(err=>{
      //         dispatch(actionSetLoading(false))
      //         console.log('GetImageOfJOBySE',err)
      //       })

      //   }

      // },[selectedJoid])

     
      return(
          <SafeAreaView
          style={{flex:1,}}
          >
              <View
              style={{flex:1,paddingHorizontal:8,paddingVertical:8}}
              >
                <View style={{flexDirection:'row',marginBottom:10,justifyContent:'space-around',
                }}>
                  <TouchableOpacity
                  disabled={pageIndex<2}
                  style={{height:36,width:36,borderRadius:18,marginHorizontal:4,
                    justifyContent:'center',alignItems:'center'}}
                    onPress={()=>{
                      if(pageIndex > 1){
                        let newPageIdx = pageIndex
                        newPageIdx--
                        setPageIndex(newPageIdx)
                      }
                      }}
                  >
                <Icon name='chevron-up' size={22} color={pageIndex>1?'grey':'transparent'}/>
                </TouchableOpacity>
                <CTextTitle
                style={{flex:1,color:'black',textAlign:'center',fontSize:18,}} 
                >
                  {params.AssetCode} - {params.Asset}
                  {/* kllmlbv bfcxklmlmlb jjknknxc vbcvbkl fhfhfghdfj fgfdhdfhdf fdhfdhdhf */}
                  {/* {params.Asset} */}
                </CTextTitle>
                {!noMoreData&&<TouchableOpacity
                  style={{height:36,width:36,borderRadius:18,marginHorizontal:4,
                    justifyContent:'center',alignItems:'center'}}
                    onPress={()=>{
                      let newPageIdx = pageIndex
                      newPageIdx++
                      setPageIndex(newPageIdx)
                    }}
                  >
                <Icon name='chevron-down' size={22} color='grey'/>
                </TouchableOpacity>}
                </View>
                <FlatList
                  data={sixMonthMH.APKMachineHistoryJOList}
                  showsVerticalScrollIndicator={false}
                  renderItem={({item})=><View
                  style={{marginBottom:8,
                    borderRadius:4,
                    boxShadow: "10px 10px 17px -12px rgba(0,0,0,0.75)",backgroundColor:'white',
                    padding:8}}
                  >
                    <View
                    style={{flexDirection:'row',justifyContent:'space-between',height:30}}
                    >
                    <CTextTitle
                style={{color:'black',fontSize:15}}
                >{item.JONO} ({item.MaintenanceType}) {item.FromDate} - {item.ToDate}
                {/* {format(new Date(item.FromDate), 'dd/MM/yyyy') }{item.ToDate!=0 && ` - ${format(new Date(item.ToDate), 'dd/MM/yyyy') }`} */}
                </CTextTitle>
                {/* <TouchableOpacity
                onPress={()=>{
                  setSelectedJoid(item.JOID)
                  setVisibleImages(true)}
                }
                >
                <SvgXml
                 
                  xml={
                    ic_picture_attachment(item.JOID==selectedJoid?CmmsColors.selectionColor:'black')
                  } width={24} height={24} 
                  color={'red'}
                  />
                  </TouchableOpacity> */}
                  </View>
                <CmmsText style={{marginStart:5}}>{item.SE.join('/')}</CmmsText>
                <View
                style={{marginStart:5}}
                >
                <CmmsText
                style={{color:'black',marginTop:8}}
                >
                  <CmmsText
                style={{color:'black',fontWeight:'bold'}}
                >{AppTextData.txt_Activities}:- </CmmsText>{item.Activities.join('/')}
                </CmmsText>
                <CmmsText
                style={{color:'black',marginTop:8}}
                >
                  {item.SpareParts&&(<CmmsText
                style={{color:'black',fontWeight:'bold'}}
                >{AppTextData.txt_Spare_Parts}:- </CmmsText>)}{item.SpareParts.join('/')}
                </CmmsText>
                <CmmsText
                style={{color:'black',marginTop:8}}
                >
                  {item.Remarks&&(<CmmsText
                style={{color:'black',fontWeight:'bold'}}
                >Remarks:- </CmmsText>)}{item.Remarks}
                </CmmsText>
                </View>
                    
                    </View>
                    }
                />
                  

              </View>
              {/* {(visibleImages&&imageList.length>0)&&<View
              style={{height:120,}}
              >
              <FlatList
            //   style={{backgroundColor:'blue'}}
              
              data={imageList}
              renderItem={({item})=><TouchableOpacity
              style={{marginEnd:5}}
              onPress={()=>{
                    setVisibleImagePopUp(true)
                }}
              >
                  <Image
                    style={{height:120,width:120,}}
                    source={require('../../../assets/placeholders/no_image.png')}
                  />
                  </TouchableOpacity>
              }
              horizontal
              showsHorizontalScrollIndicator={false}
              />
              </View>} */}

              {/* <Dialog
              title={null}
              visible={visibleImagePopUp}
              onTouchOutside={()=>setVisibleImagePopUp(false)}
              animationType='fade'
              >
                  
              <Image
                    style={{height:screenWidth,width:'100%',}}
                    source={require('../../../assets/placeholders/no_image.png')}
                  />
                 
              </Dialog> */}
              
          </SafeAreaView>
      )
  }