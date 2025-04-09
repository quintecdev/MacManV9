import React, { useEffect, useState } from "react";
import { SafeAreaView,TouchableOpacity,Text,View, TextInput, StyleSheet, Image, PermissionsAndroid, KeyboardAvoidingView } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import CmmsColors from "../../common/CmmsColors";
import { FlatList } from "react-native-gesture-handler";
import { CmmsText, CText } from "../../common/components/CmmsText";
import { useDispatch, useSelector } from "react-redux";
import { launchCamera } from "react-native-image-picker";
import { actionSetAlertPopUpTwo } from "../../action/ActionAlertPopUp";
import { actionSetLoading } from "../../action/ActionSettings";
import { API_TECHNICIAN } from "../../network/api_constants";
import requestWithEndUrl from "../../network/request";

const CheckListSafetyRegulationPage = ({navigation,route:{params}}) =>{
  console.log("CheckListSafetyRegulationPage",{params})
  const [safetyRegulatoncheckList,setSafetyRegulationCheckList] = useState()
      const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
      const {
          loggedUser: {TechnicianID, TechnicianName},
        } = useSelector((state) => state.LoginReducer);
        console.log("CheckListSafetyRegulationPage",{TechnicianID})
    const dispatch = useDispatch();

    useEffect(()=>{
      getSafetyRegulationCheckList();
    },[])

    const getSafetyRegulationCheckList = () =>{
      //getsafetyregulationchecklist?JOID=0&WorkNatureID=1,2&SEID=132
      dispatch(actionSetLoading(true));
      requestWithEndUrl(`${API_TECHNICIAN}getsafetyregulationchecklist`,
        {JOID:params.JOID,WorkNatureID:params.WorkNatureID,SEID:TechnicianID})
      .then((res) => {
        console.log('getsafetyregulationchecklist', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
      //  setInternalWorkOrder({...defaultInternalWO,RefNo:data}) const point = data.InspectionPoint;
      const point = data.InspectionPoint;

      if (
        !point ||
        (Array.isArray(point) && point.length === 0) ||
        (typeof point === "object" && !Array.isArray(point) && Object.keys(point).length === 0)
      ) {
        return;
      }
      setSafetyRegulationCheckList(data)
      })
      .catch((err) => {
        console.log('getsafetyregulationchecklist error', err);
      })
      .finally(()=>{
      dispatch(actionSetLoading(false));

      });
    }

       const checkForCameraRollPermission = async () => {
          console.log('CAMERA', 'start');
          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.CAMERA,
              {
                title: 'App Camera Permission',
                message: 'App needs access to your camera ',
                buttonNeutral: 'Ask Me Later',  
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
      
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              console.log('Camera permission given');
              launchCamera(
                {
                  saveToPhotos: false,
                  mediaType: 'photo', //'photo' | 'video' | 'mixed'
                  includeBase64: false,
                  //  durationLimit:
                },
                ({assets, errorCode, didCancel}) => {
                  console.log('checkForCameraRollPermission', {errorCode, didCancel,AssetUri:assets[0].uri});
      
                  if (!didCancel && !errorCode) {
                    setSafetyRegulationCheckList(safetyRegulatoncheckList=>({...safetyRegulatoncheckList,Images:[...safetyRegulatoncheckList.Images,{Images:`file://${assets[0].uri}`}]}))
      
                    // RNGRP.getRealPathFromURI(assets[0].uri).then((path) => {
                    //   console.log({path})
                    //   PhotoEditor.Edit({
                    //     path: path,
                    //     // RNFS.readFile(path, 'base64').then(imageBase64 =>
                    //     //   this.props.actions.sendImageAsBase64(imageBase64)
                    //     // )
                    //     onDone: (imagePath) => {
                    //       console.log({imagePath})
                    //       setInternalWorkOrder(internalWorkOrder=>({...internalWorkOrder,Images:[...internalWorkOrder.Images,`file://${imagePath}`]}))
                    //       // setImagesToUpload(imagesToUpload=>[...imagesToUpload,assets])
                    //     },
                    //     hiddenControls: ['save'],
                    //   });
                    // });
                  }
                },
              );
            } else {
              console.log('Camera permission denied');
              // alert(AppTextData.txt_Camera_permission_denied);
              dispatch(
                actionSetAlertPopUpTwo({
                  title: AppTextData.txt_Alert,
                  body: AppTextData.txt_Camera_permission_denied,
                  visible: true,
                  type: 'ok',
                }),
              );
            }
          } catch (err) {
            console.error('camera_error: ', err);
          }
        };
const updateCheckBoxStatus=(statusFor,itemId)=>{
  setSafetyRegulationCheckList(safetyRegulatoncheckList=>({...safetyRegulatoncheckList,InspectionPoint:safetyRegulatoncheckList.InspectionPoint.map((inspectionPoint) =>
    inspectionPoint.ID === itemId ? { ...inspectionPoint, 
      Status: inspectionPoint.Status === statusFor
        ? 0 // If Status is 1, set it to 0
        : inspectionPoint.Status !== statusFor
        ? statusFor// If Status is NOT 1, set it to 1
        : inspectionPoint.Status
                                    } : inspectionPoint
  )}))
}

const onSave = ()=>{
  //http://localhost:29189/api/ApkTechnician/SaveSafetyregulationchecklist
  // if(safetyRegulatoncheckList.InspectionPoint.some(point=>point.Status === 0)){
  //   alert("Invalid data");
  //   return;
  // }
  
  dispatch(actionSetLoading(true))
    let bodyFormData = new FormData();
    bodyFormData.append('',JSON.stringify( {...safetyRegulatoncheckList,Images:[],SEID:TechnicianID}));
    safetyRegulatoncheckList.Images.forEach((imageData) => {
      let imageName = `${safetyRegulatoncheckList.JOID}_${Date.now()}.jpg`
      let imageUri = imageData.Images
      console.log('submitInternalWorkOrder', {imageUri:imageData.Images});
      if(/^file:\/\/.+\.\w{1,5}$/.test(imageUri)){
        console.log("fileUri",imageUri,{imageName})
        bodyFormData.append('', {uri:imageUri,type: 'image/jpg',name:imageName});
      }
    });
    console.log('SaveSafetyregulationchecklist',{safetyRegulatoncheckList})
    requestWithEndUrl(
      `${API_TECHNICIAN}SaveSafetyregulationchecklist`,
      bodyFormData,
      'POST',
      {'Content-Type': 'multipart/form-data'},
    )
      .then((res) => {
        console.log('SaveSafetyregulationchecklist', {res});
        if (res.status != 200) {
          throw Error(res.data);
        }
        return res.data;
      })
      .then((data) => {
        console.log("SaveSafetyregulationchecklist",{data});
        if(data.isSucess)navigation.goBack();
        // if (data) {
        //   setInternalWorkOrder({...defaultInternalWO,RefNo:data.RefNo})
        //   dispatch(
        //     actionSetAlertPopUpTwo({
        //       title: AppTextData.txt_Alert,
        //       body: data.Message,
        //       visible: true,
        //       type: 'ok',
        //     }),
        //   );
         
        // } else {
        //  throw Error();
        // }
      })
      .catch((err) => {
        console.error({err})
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body:
              AppTextData.txt_Something_went_wrong ,
            visible: true,
            type: 'ok',
          }),
        );
      })
      .finally(()=>{
        dispatch(actionSetLoading(false))
      })
      ;

}
    return(
<SafeAreaView style={{flex:1,}}>
    {safetyRegulatoncheckList&&<>
    <KeyboardAvoidingView 
       behavior={'height'}
      style={{flex:1,padding:8}}>
        <Text style={{backgroundColor:'white',
            
            height:50,textAlignVertical:'center'}}>
            {AppTextData.txt_JO_Number}:{safetyRegulatoncheckList.JONO}
        </Text>
        <View style={{flex:1,backgroundColor:'white',marginVertical:5,padding:8}}>
            {safetyRegulatoncheckList.InspectionPoint.length>0&&<View style={{flexDirection:'row',
                width:'40%',
                position:'absolute',end:8,top:8,
                justifyContent:'space-around'}}>
                <Text numberOfLines={2} style={styles.textCheckBoxHeader}>Not Relevant</Text>
                <Text numberOfLines={2} style={styles.textCheckBoxHeader}>Correct</Text>
                <Text numberOfLines={2} style={styles.textCheckBoxHeader}>Incorrect</Text>

            </View>}
            {safetyRegulatoncheckList.InspectionPoint.length>0&&<View style={{flex:2,}}>
            <FlatList
            style={{borderWidth:0,flexGrow:0,marginTop:30}}
            data={safetyRegulatoncheckList.InspectionPoint}
            renderItem={({item,index})=>(
                                <View
                                  style={{
                                    minHeight: 100,
                                    padding: 4,
                                    marginTop: 1,
                                  }}>
                                  <CText style={{color: 'black'}}>
                                    {index + 1}. {item.InspectionPoints}
                                  </CText>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      marginVertical: 6,
                                    }}>
                                    <TextInput
                                      style={{
                                        borderWidth: 1,
                                        minHeight: 30,
                                        padding: 8,
                                        textAlignVertical: 'top',
                                        borderRadius: 5,
                                        marginTop: 5,
                                        textAlign: 'justify',
                                        flex:1
                                      }}
                                      // multiline={true}
                                    //   keyboardType={item.IsReading ? 'numeric':'default'}
                                      value={item.Remarks}
                                      onChangeText={(text) =>setSafetyRegulationCheckList(safetyRegulatoncheckList=>({...safetyRegulatoncheckList,InspectionPoint:safetyRegulatoncheckList.InspectionPoint.map((inspectionPoint) =>
                                        inspectionPoint.ID === item.ID ? { ...inspectionPoint, Remarks: text } : inspectionPoint
                                      )}))}
                                      //vbn lang
                                      // placeholder="Remarks"
                                      placeholder={AppTextData.txt_Remarks}
                                    />
                                <View style={{flexDirection:'row',
                                    width:'40%',justifyContent:'space-around'}}>
                                    <TouchableOpacity
                                      style={{
                                        flexDirection: 'row',
                                        padding: 4,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginStart: 10,
                                      }}
                                      onPress={() => {
                                        updateCheckBoxStatus(1,item.ID)
                                      }}>
                                      <Icon
                                        name={
                                          (item.Status!==0 && item.Status===1)  ? 'check-square-o' : 'square-o'
                                        }
                                        size={24}
                                        color="black"
                                      />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      style={{
                                        flexDirection: 'row',
                                        padding: 4,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginStart: 10,

                                      }}
                                      onPress={() => {
                                        updateCheckBoxStatus(2,item.ID)
                                      }}>
                                      <Icon
                                        name={
                                          (item.Status!==0 && item.Status===2) ? 'check-square-o' : 'square-o'
                                        }
                                        size={24}
                                        color="black"
                                      />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      style={{
                                        flexDirection: 'row',
                                        padding: 4,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: 4,
                                      }}
                                      onPress={() => {
                                        updateCheckBoxStatus(3,item.ID)
                                      }}>
                                      <Icon
                                        name={
                                          (item.Status!==0 && item.Status===3)  ? 'check-square-o' : 'square-o'
                                        }
                                        size={24}
                                        color="black"
                                      />
                                    </TouchableOpacity>
                                    </View>
                                  </View>
                                </View>
                              )}
            />
            </View>}
                          <View style={{flex:1}}>
                                <TextInput
                                multiline
                                      style={{
                                        borderWidth: 1,
                                        minHeight: 30,
                                        maxHeight:150,
                                        padding: 8,
                                        textAlignVertical: 'top',
                                        borderRadius: 5,
                                        marginTop: 5,
                                        textAlign: 'justify',
                                        
                                        flex:1
                                      }}
                                      // multiline={true}
                                    //   keyboardType={item.IsReading ? 'numeric':'default'}
                                      value={safetyRegulatoncheckList.Comments}
                                      onChangeText={(text) => setSafetyRegulationCheckList(safetyRegulatoncheckList=>({...safetyRegulatoncheckList,Comments:text}))}
                                      //vbn lang
                                      // placeholder="Remarks"
                                      placeholder={"Comments"}
                                    />
                                    <FlatList
                                    style={{marginTop:20,flexGrow:0,}}
                                    horizontal
                                    data={safetyRegulatoncheckList.Images}
                                    renderItem={({item})=><Image
                                              source={{ uri: item.Images }} 
                                              style={{marginStart:5,width:100,height:100,}}
                                              resizeMode='stretch'
                                              />
                                            }
                                    />
                                    </View>
        </View>
        
    </KeyboardAvoidingView>
        <View style={{backgroundColor:CmmsColors.logoBottomGreen,height:50,justifyContent:'space-around',flexDirection:'row'}}>
             <TouchableOpacity
                style={{justifyContent:'center',alignItems:'center'}}
                onPress={()=>onSave()}
             >
              <CText>{AppTextData.txt_Save}</CText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{justifyContent:'center',alignItems:'center'}}
                onPress={()=>checkForCameraRollPermission()}
             >
              <Icon name="camera" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{justifyContent:'center',alignItems:'center'}}
                onPress={()=>
                  getSafetyRegulationCheckList()
                }
             >
              <Icon name="refresh" size={24} color="white" />
              </TouchableOpacity>
            </View> 
            </>}
</SafeAreaView>
    );
};
const styles = StyleSheet.create({
    textCheckBoxHeader:{
        fontSize:10,
        marginHorizontal:2,
        fontWeight:'900',
        color:'black',
        flex:1
    }
})
export default CheckListSafetyRegulationPage;