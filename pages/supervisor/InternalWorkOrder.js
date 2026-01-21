

import {View, Text, ScrollView, FlatList, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Button,Image, PermissionsAndroid, Modal, Pressable} from 'react-native';
import React,{useCallback, useRef} from 'react';
import {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useDispatch} from 'react-redux';
import { deviceWidth } from '../../common/components/LoaderComponent';
import QrCodeScanner from '../QrCodeScanner/QrCodeScanner';
import Icon from 'react-native-vector-icons/FontAwesome';
import CmmsColors from '../../common/CmmsColors';
import { actionSetAlertPopUpTwo } from '../../action/ActionAlertPopUp';
import { launchCamera } from 'react-native-image-picker';
import RNGRP from 'react-native-get-real-path';
// import PhotoEditor from 'react-native-photo-editor';
import { Dialog } from 'react-native-simple-dialogs';
import {parse, format} from 'date-fns';
import { API_COMMON, API_SUPERVISOR } from '../../network/api_constants';
import requestWithEndUrl from '../../network/request';
import { actionSetLoading } from '../../action/ActionSettings';
import RNFS from 'react-native-fs';
import {debounce} from 'lodash';

const InternalWorkOrder = ({route: {params}}) => {
  const defaultInternalWO = {RefNo:0,Images:[],Damage:"Select Damage",Date:Date.now(),ID:0,WICategory:"Select IWO Category"};
  const dispatch = useDispatch();
  const {loggedUser} = useSelector((state) => state.LoginReducer);
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const [cards, setCards] = useState([]);
  const [noNotification, setNoNotification] = useState(false);
  const [internalWorkOrder,setInternalWorkOrder] = useState(defaultInternalWO)

  console.log('params from homepage===>>', params);
  console.log('user Details==>>', loggedUser.TechnicianID);
 
  const [showScanner,setShowScanner] = useState(false);
  const [showDamageList,setShowDamageList] = useState(false);
  const [damageList,setDamageList] = useState([])
  const [showSuggestion,setShowSuggestion] = useState(false)
  const [suggestionList,setSuggestionList] = useState([])
   const isPressed = useRef(false);
   const damageOrIWOCats = useRef(1);//1-damage,2-IWOCats

  const getLastRefNo = ()=>{
    dispatch(actionSetLoading(true));
    requestWithEndUrl(`${API_COMMON}GetCode`,{FormID:'WOI',TransMode:'GET',BranchID:0,PeriodID:0})
  .then((res) => {
    // console.log('GetCode', {res});
    if (res.status != 200) {
      throw Error(res.statusText);
    }
    return res.data;
  })
  .then((data) => {
   setInternalWorkOrder({...defaultInternalWO,RefNo:data})
  })
  .catch((err) => {
    // console.log('GetCode error', err);
    dispatch(
      actionSetAlertPopUpTwo({
        title: AppTextData.txt_Alert,
        body: AppTextData.txt_somthing_wrong_try_again,
        visible: true,
        type: 'ok',
      }),
    );
  })
  .finally(()=>{dispatch(actionSetLoading(false))});
}

  useEffect(()=>{
    getLastRefNo()
  },[])

  useEffect(()=>{
    console.log("useEffect-debounce-assetcode",internalWorkOrder.AssetCode)
      !isPressed.current?debouncedAssetCodeChange(internalWorkOrder.AssetCode):isPressed.current=false

  },[internalWorkOrder.AssetCode])

  useEffect(()=>{
    console.log("JIJU","suggestion list length",suggestionList.length)
    setShowSuggestion(suggestionList.length>0)
  },[suggestionList.length])

   // Debounced function to handle AssetCode change
  const debouncedAssetCodeChange = useCallback(
    debounce((code) => {
      console.log("Debounced AssetCode:", code);
      // Add your logic here, like validation or API call
      // setSuggestionList(["abc","abcd","dab","abcfdgfdgfdgfdgfdg fgfdgfgdfgfdg","abcd","dab","abc","abcd","dab"])
      // http://localhost:29189/api/ApkSupervisor/GetAssetForSearch?AssetCode=rop2030
      if(code?.length>1)
      requestWithEndUrl(`${API_SUPERVISOR}GetAssetForSearch`, {
      AssetCode:code
    })
      .then((res) => {
        console.log('GetWorkOrderInternalDetails', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        setSuggestionList(data);       
      })
      .catch(err=>{
        console.log({err})
      })
      else setSuggestionList([])
    }, 500), // 500ms debounce
    []
  );

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
            console.log('checkForCameraRollPermission', {errorCode, didCancel,AssetUri:assets?.[0]?.uri});
 const uri = assets?.[0]?.uri;

    console.log('Camera result:', uri);
            if (!didCancel && !errorCode) {
              if (uri) {
                setInternalWorkOrder(internalWorkOrder=>({...internalWorkOrder,Images:[...internalWorkOrder.Images,uri]}))
              } else {
                console.error('Camera error: URI is undefined');
                dispatch(
                  actionSetAlertPopUpTwo({
                    title: AppTextData.txt_Alert,
                    body: 'Failed to capture image. Please try again.',
                    visible: true,
                    type: 'ok',
                  }),
                );
              }

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
//http://localhost:29189/api/ApkSupervisor/GetWorkOrderInternalDetails?Action=APKWOINEXT&ID=1&UserID=0
  const getOldInternalWorkOrder = (action="APKWOINEXT")=>{
    dispatch(actionSetLoading(true))
    console.log("getOldInternalWorkOrder");
    requestWithEndUrl(`${API_SUPERVISOR}GetWorkOrderInternalDetails`, {
      Action:action,
      ID:internalWorkOrder.ID,
      UserID:loggedUser.TechnicianID
    })
      .then((res) => {
        console.log('GetWorkOrderInternalDetails', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
                  isPressed.current = true
        setInternalWorkOrder(data.ID !== 0 ? data : { ...defaultInternalWO, RefNo: data.RefNo });
        console.log("JIJU_PRVS",{data})
      })
      .catch((err) => {
        console.log('GetWorkOrderInternalDetails error', err);  
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: AppTextData.txt_somthing_wrong_try_again,
            visible: true,
            type: 'ok',
          }),
        );
      })
      .finally(()=>{dispatch(actionSetLoading(false))});
  }

  const submitInternalWorkOrder = ()=>{
    dispatch(actionSetLoading(true))
    let bodyFormData = new FormData();
    bodyFormData.append('',JSON.stringify( {...internalWorkOrder,Images:[],UserID:loggedUser.TechnicianID}));
    internalWorkOrder.Images.forEach((imageUri) => {
      let imageName = `${internalWorkOrder.ID}_${Date.now()}.jpg`
      console.log('submitInternalWorkOrder', {imageUri});
      if(/^file:\/\/.+\.\w{1,5}$/.test(imageUri)){
        console.log("fileUri",imageUri,{imageName})
        bodyFormData.append('', {uri:imageUri,type: 'image/jpg',name:imageName});
      }
    });
    console.log('submitInternalWorkOrder',{internalWorkOrder})
    requestWithEndUrl(
      `${API_SUPERVISOR}SaveWorkOrderInternal`,
      bodyFormData,
      'POST',
      {'Content-Type': 'multipart/form-data'},
    )
      .then((res) => {
        console.log('SaveWorkOrderInternal', {res});
        if (res.status != 200) {
          throw Error(res.data);
        }
        return res.data;
      })
      .then((data) => {
        console.log(data);
        if (data) {
          setInternalWorkOrder({...defaultInternalWO,RefNo:data.RefNo})
          dispatch(
            actionSetAlertPopUpTwo({
              title: AppTextData.txt_Alert,
              body: data.Message,
              visible: true,
              type: 'ok',
            }),
          );
         
        } else {
         throw Error();
        }
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

  const getAssetDetailsByCode=(AssetCode)=>{
    if(AssetCode){
      dispatch(actionSetLoading(true))
      requestWithEndUrl(`${API_SUPERVISOR}GetAssetDetailsByCode`,{AssetCode})
      .then((res) => {
        console.log('GetMaster', {res});

        if (res.status != 200) {
          
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        if (data) {
          const { AssetRegID,
            AssetCode,
            AssetDescription} = data;
          setInternalWorkOrder(internalWorkOrder=>({...internalWorkOrder,AssetCode,AssetRegID,AssetDescription}))
        } else alert("Invalid Data");
      })
      .catch(()=>{
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
    }
  }


  return (
    <SafeAreaView style={{flex:1}}>
      <ScrollView
      keyboardShouldPersistTaps={'handled'}
      >
    <View style={{flex: 1,padding:8}}>
      <View style={{flexDirection:'row',justifyContent:'space-between'}}>
        <Text>RefNo:{internalWorkOrder.RefNo}</Text>
        <Text>Date:{format(internalWorkOrder.Date,'dd/MM/yyyy')}</Text>
      </View>
     <View style={{flexDirection:'row',alignItems:'center',marginTop:8}}>
        <Text style={{fontWeight:'bold',color:'black'}}>Eq.Code: </Text>
        <View style={{flex:1}}>
        <TextInput
        style={{backgroundColor:'white',flex:1}}
        value={internalWorkOrder.AssetCode}
        onChangeText={text=>{
          console.log("JIJU","Assetcode-ontextchange",text)
          setInternalWorkOrder(internalWorkOrder=>({...internalWorkOrder,AssetCode:text}))}}

        />
        {showSuggestion && (
        <View style={{
          backgroundColor: 'white',
          borderWidth: 1,
          borderColor: '#ccc',
          borderTopWidth: 0,
          maxHeight: 250,
          position:'absolute',
          zIndex: 1,
          width:'100%',
          top:52
        }}>

          <FlatList
            data={suggestionList??[]}
            keyExtractor={(item,index) => item.AssetRegID?.toString()+index.toString()}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  isPressed.current = true
                   getAssetDetailsByCode(item.AssetCode)
                    setInternalWorkOrder(internalWorkOrder=>({...internalWorkOrder,AssetCode:item.AssetCode}))
                    setSuggestionList([])
                }}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? '#f0f0f0' : 'white'
                  }
                ]}
              >
                <Text style={{
                  padding: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                }}>{item.AssetCode} {`\n${item.AssetDescription}`}</Text>
              </Pressable>
            )}
          />
        </View>
      )}
     </View>
        <TouchableOpacity
        style={{width:48,height:48,backgroundColor:CmmsColors.logoBottomGreen,marginStart:8,justifyContent:'center',alignItems:'center'}}
        onPress={()=>{
          getAssetDetailsByCode(internalWorkOrder.AssetCode)
        }}
        >
          <Icon name="search" size={24} color="white" />
        </TouchableOpacity>
     </View>
     <View style={{flexDirection:'row',alignItems:'center',marginTop:8}}>
        <Text style={{fontWeight:'bold',color:'black'}}>Eq.Description: </Text>
        <TextInput
        style={{backgroundColor:'white',flex:1}}
        value={internalWorkOrder.AssetDescription}
        editable={false}
        onChangeText={text=>setInternalWorkOrder(internalWorkOrder=>({...internalWorkOrder,AssetDescription:text}))}
        />
      </View>
      <View style={{flexDirection:'row',alignItems:'center',marginTop:8}}>
        <Text style={{fontWeight:'bold',color:'black'}}>Damage: </Text>
        <TouchableOpacity style={{flexDirection:'row',flex:1,alignItems:'center',backgroundColor:'white',padding:8}}
        onPress={()=>{
          //http://185.250.36.197:2021/api/Common/GetMaster?FormID=Problems%20/%20Issues%20Type&BranchID=0&PeriodID=0&OL=ol
          damageOrIWOCats.current = 1
    requestWithEndUrl(`${API_COMMON}GetMaster`, {
      FormID: 'Problems / Issues Type',
      BranchID: 0,
      PeriodID: 0,
      OL: 'ol',
    })
      .then((res) => {
        console.log('GetMaster', {res});

        if (res.status != 200) {
          
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        if (data.length > 0) {
          setDamageList(data)
          setShowDamageList(showDamageList=>!showDamageList)
        } else{
          alert("No damage found")
        }
      })
      .catch((err) => {
        console.log('GetMaster error', err);
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
        >
        <Text
        style={{backgroundColor:'white',flex:1,height:30,justifyContent:'space-between',textAlignVertical:'center'}}
        >{internalWorkOrder.Damage}</Text>
         <Icon  name="chevron-down" size={18} color="grey" />
         </TouchableOpacity>
      </View>
      <View style={{flexDirection:'row',alignItems:'center',marginTop:8}}>
        <Text style={{fontWeight:'bold',color:'black'}}>Internal W/O Category: </Text>
        <TouchableOpacity style={{flexDirection:'row',flex:1,alignItems:'center',backgroundColor:'white',padding:8}}
        onPress={()=>{
          damageOrIWOCats.current = 2;
          //http://207.180.228.148:2021//api/Common/GetMaster?FormID=INTERNALWORKORDERCATEGORY&BranchID=0&PeriodID=0&OL=ol
    requestWithEndUrl(`${API_COMMON}GetMaster`, {
      FormID: 'INTERNALWORKORDERCATEGORY',
      BranchID: 0,
      PeriodID: 0,
      OL: 'ol',
    })
      .then((res) => {
        console.log('GetMaster', {res});

        if (res.status != 200) {
          
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        if (data.length > 0) {
          setDamageList(data)
          setShowDamageList(showDamageList=>!showDamageList)
        } else{
          alert("No damage found")
        }
      })
      .catch((err) => {
        console.log('GetMaster error', err);
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
        >
        <Text
        style={{backgroundColor:'white',flex:1,height:30,justifyContent:'space-between',textAlignVertical:'center'}}
        >{internalWorkOrder.WICategory}</Text>
         <Icon  name="chevron-down" size={18} color="grey" />
         </TouchableOpacity>
      </View>
      <TextInput
        style={{backgroundColor:'white',flex:1,marginTop:10,}}
        multiline
        numberOfLines={5}
        placeholder="Issue"
        value={internalWorkOrder.Issue}
        onChangeText={text=>setInternalWorkOrder(internalWorkOrder=>({...internalWorkOrder,Issue:text}))}
        />
        <View
        style={{flexDirection:'row',justifyContent:'space-evenly',marginTop:50,}}
        >
          <Button
          title='Previous'
          color={CmmsColors.logoBottomGreen}
          onPress={()=>getOldInternalWorkOrder("APKWOIPREV")}
          />
          <Button
          title='Submit'
          color={CmmsColors.logoBottomGreen}
          onPress={()=>submitInternalWorkOrder()}
          />
          <Button
          title='Next'
          color={CmmsColors.logoBottomGreen}
          // disabled={internalWorkOrder.RefNo==0}
          onPress={()=>getOldInternalWorkOrder()}
          />
        </View>
        <FlatList
        style={{marginTop:20,flexGrow:0}}
        showsHorizontalScrollIndicator={false}
        data={internalWorkOrder.Images}
        horizontal
        renderItem={({item})=>{
          console.log({item})
        return <View style={{width:150,height:150,borderWidth:1,marginStart:5}}>
          
          <Image
          source={{ uri: item }} 
          style={{width:150,height:150}}
          resizeMode='stretch'
          />
          {/* { RNFS.exists(item).then((res)=>{
            console.log({res})
            return <Pressable
          style={{position:'absolute',width:28,height:28,end:0,top:0,padding:4}}
          onPress={()=>{
            dispatch(actionSetLoading(true))
            RNFS.exists(item)
            .then(res=>{
              if(res){
                RNFS.unlink(item)
                .then(()=>{
                  setInternalWorkOrder(internalWorkOrder=>({...internalWorkOrder,Images:[...internalWorkOrder.Images.filter(imageUri=>imageUri!==item)]}))
                })
                .catch(err=>console.error(err))
              }
          })
          .catch(err=>console.error(err))
          .finally(dispatch(actionSetLoading(false)))
          }}
          >
            <Text>❌</Text>
            </Pressable>})} */}
        </View>
        }
        }
        />
    </View>
    </ScrollView>

    <View style={{backgroundColor:CmmsColors.logoBottomGreen,height:50,justifyContent:'space-around',flexDirection:'row'}}>
     <TouchableOpacity
        style={{justifyContent:'center',alignItems:'center'}}
        onPress={()=>setShowScanner(true)}
     >
      <Icon name="qrcode" size={24} color="white" />
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
          getLastRefNo()
        }
     >
      <Icon name="refresh" size={24} color="white" />
      </TouchableOpacity>
    </View>
    <QrCodeScanner
        visible={showScanner}
        Close={() => {
          setShowScanner(false)
        }}
        QrCodeData={({data}) => {
          // Qrcodefunction(data);
          console.log('Internal work order>>>>','QRcode: ', data);
          getAssetDetailsByCode(data)
          setInternalWorkOrder(internalWorkOrder=>({...internalWorkOrder,AssetCode:data}))
          setShowScanner(false)
        }}
        // reactivate={isScanfailed}
      />
      <Dialog
      visible={showDamageList}
      title={`List of ${damageOrIWOCats.current===1?'Damages':'IWO Categories' }`}
      >
        <FlatList
        style={{marginBottom:20}}
        data={damageList}
        renderItem={({item})=><TouchableOpacity style={{padding:4}}
        onPress={()=>{
          console.log({item})
          setInternalWorkOrder(internalWorkOrder=>damageOrIWOCats.current===1?{...internalWorkOrder,Damage:item.Name,DamageID:item.ID}:{...internalWorkOrder,WICategory:item.Name,WICategoryID:item.ID}) 
        setShowDamageList(false)}}
        ><Text>{item.Name}</Text></TouchableOpacity>}
        /> 
        <Button
        
        title='close'
        color={CmmsColors.logoBottomGreen}
        onPress={()=>setShowDamageList(false)}
        />
      </Dialog>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

});

export default InternalWorkOrder;
