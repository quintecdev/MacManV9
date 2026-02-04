import React, { useEffect, useState } from "react";
import { SafeAreaView, TouchableOpacity, Text, View, TextInput, StyleSheet, Image, PermissionsAndroid, KeyboardAvoidingView } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import CmmsColors from "../../common/CmmsColors";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { CmmsText, CText } from "../../common/components/CmmsText";
import { useDispatch, useSelector } from "react-redux";
import { launchCamera } from "react-native-image-picker";
import { actionSetAlertPopUpTwo } from "../../action/ActionAlertPopUp";
import { actionSetLoading } from "../../action/ActionSettings";
import { API_BASE, API_TECHNICIAN,BASE_IP } from "../../network/api_constants";
import requestWithEndUrl from "../../network/request";
import { color } from "react-native-reanimated";

const CheckListSafetyRegulationPage = ({ navigation, route: { params } }) => {
  console.log("CheckListSafetyRegulationPage", { params })
  // const {AppTextData} = useSelector((state) => state.AppTextViewReducer);

  const [safetyRegulatoncheckList, setSafetyRegulationCheckList] = useState()
  const { AppTextData } = useSelector((state) => state.AppTextViewReducer);
  const {
    loggedUser: { TechnicianID, TechnicianName },
  } = useSelector((state) => state.LoginReducer);
  console.log("CheckListSafetyRegulationPage", { TechnicianID })
  const dispatch = useDispatch();

  useEffect(() => {
    getSafetyRegulationCheckList();
  }, [])

  const getSafetyRegulationCheckList = () => {
    //getsafetyregulationchecklist?JOID=0&WorkNatureID=1,2&SEID=132
    const parameter={ JOID: params.JOID, WorkNatureID: params.WorkNatureID, SEID: TechnicianID };
    console.log("getSafetyRegulationCheckList", { parameter })
    dispatch(actionSetLoading(true));
    requestWithEndUrl(`${API_TECHNICIAN}getsafetyregulationchecklist`,
      parameter)
      .then((res) => {
        console.log('getsafetyregulationchecklist', { res });
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        //  setInternalWorkOrder({...defaultInternalWO,RefNo:data}) const point = data.InspectionPoint;
        // const point = data.InspectionPoint;

        // if (
        //   !point ||
        //   (Array.isArray(point) && point.length === 0) ||
        //   (typeof point === "object" && !Array.isArray(point) && Object.keys(point).length === 0)
        // ) {
        //   return;
        // }
        
        // Add BASE_IP to image paths
        if (data.Images && Array.isArray(data.Images)) {
          data.Images = data.Images.map(img => ({
            ...img,
            Images: BASE_IP + '/' + img.Images
          }));
        }
        
        setSafetyRegulationCheckList(data)
      })
      .catch((err) => {
        console.log('getsafetyregulationchecklist error', err);
      })
      .finally(() => {
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
          ({ assets, errorCode, didCancel }) => {
            console.log('checkForCameraRollPermission', { errorCode, didCancel, AssetUri: assets?.[0]?.uri });
            const uri = assets?.[0]?.uri;

            console.log('Camera result:', uri);
            if (!didCancel && !errorCode) {
              if (uri) {
                setSafetyRegulationCheckList(safetyRegulatoncheckList => ({ ...safetyRegulatoncheckList, Images: [...safetyRegulatoncheckList.Images, { Images: uri }] }))
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
  // const updateCheckBoxStatus=(statusFor,itemId)=>{
  //   setSafetyRegulationCheckList(safetyRegulatoncheckList=>({...safetyRegulatoncheckList,InspectionPoint:safetyRegulatoncheckList.InspectionPoint.map((inspectionPoint) =>
  //     inspectionPoint.ID === itemId ? { ...inspectionPoint, 
  //       Status: inspectionPoint.Status === statusFor
  //         ? 0 // If Status is 1, set it to 0
  //         : inspectionPoint.Status !== statusFor
  //         ? statusFor// If Status is NOT 1, set it to 1
  //         : inspectionPoint.Status
  //                                     } : inspectionPoint
  //   )}))
  // }

  const updateCheckBoxStatus = (statusFor, item) => {
    setSafetyRegulationCheckList(prevList => ({
      ...prevList,
      InspectionPointGroups: prevList.InspectionPointGroups.map(group =>
        group.GroupID === item.GroupID
          ? {
            ...group,
            InspectionPoint: group.InspectionPoint.map(point =>
              point.ID === item.ID
                ? {
                  ...point,
                  Status: point.Status === statusFor ? 0 : statusFor
                }
                : point
            )
          }
          : group
      )
    }));
  };

  const onSave = () => {
    //http://localhost:29189/api/ApkTechnician/SaveSafetyregulationchecklist
    // if(safetyRegulatoncheckList.InspectionPoint.some(point=>point.Status === 0)){
    //   alert("Invalid data");
    //   return;
    // }

    dispatch(actionSetLoading(true))
    let bodyFormData = new FormData();
    bodyFormData.append('', JSON.stringify({ ...safetyRegulatoncheckList, Images: [], SEID: TechnicianID }));

    safetyRegulatoncheckList.Images.forEach((imageData) => {
      let imageName = `${safetyRegulatoncheckList.JOID}_${Date.now()}.jpg`
      let imageUri = imageData.Images
      console.log('submitInternalWorkOrder', { imageUri: imageData.Images });
      if(/^file:\/\/.+\.\w{1,5}$/.test(imageUri)){
      console.log("fileUri", imageUri, { imageName })
      bodyFormData.append('', { uri: imageUri, type: 'image/jpg', name: imageName });
      }
    });
    console.log('SaveSafetyregulationchecklist data->>', { safetyRegulatoncheckList: JSON.stringify(safetyRegulatoncheckList, "", 2) })
    console.log('SaveSafetyregulationchecklist--->>input', {bodyFormData: JSON.stringify(bodyFormData)}); 
    requestWithEndUrl(  
      `${API_TECHNICIAN}SaveSafetyregulationchecklist`,
      bodyFormData,
      'POST',
      { 'Content-Type': 'multipart/form-data' },
    )
      .then((res) => {
        console.log('SaveSafetyregulationchecklist', { res });
        if (res.status != 200) {
          throw Error(res.data);
        }
        return res.data;
      })
      .then((data) => {
        console.log("SaveSafetyregulationchecklist", { data });
        if (data.isSucess) navigation.goBack();
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
        console.error({ err })
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body:
              AppTextData.txt_Something_went_wrong,
            visible: true,
            type: 'ok',
          }),
        );
      })
      .finally(() => {
        dispatch(actionSetLoading(false))
      })
      ;

  }
  return (
    <SafeAreaView style={{ flex: 1, }}>
      {safetyRegulatoncheckList && <>
        <KeyboardAvoidingView
          behavior={'height'}
          style={{ flex: 1, paddingHorizontal: 8 }}>
          <Text style={{
            backgroundColor: 'white',

            height: 50, textAlignVertical: 'center'
          }}>
            {AppTextData.txt_JO_Number}:{safetyRegulatoncheckList.JONO}
          </Text>
          <View style={{ flex: 1, backgroundColor: 'white', marginVertical: 5, padding: 8 }}>
            <ScrollView style={{ flex: 1, marginBottom: 8 }} >
              {
                safetyRegulatoncheckList.InspectionPointGroups.map(inspectionGroup =>
                  inspectionGroup.InspectionPoint.length > 0 && <>
                    <View style={{
                      flexDirection: 'row',
                      width: '40%',
                      // alignSelf:'flex-end',
                      marginTop: 10,
                      position: 'absolute', end: 2, top: 8,
                      justifyContent: 'space-around'
                    }}>
                      <Text numberOfLines={2} style={styles.textCheckBoxHeader}>{AppTextData.txt_Not_Relevant}</Text>
                      <Text numberOfLines={2} style={styles.textCheckBoxHeader}>{AppTextData.txt_Correct}</Text>
                      <Text numberOfLines={2} style={styles.textCheckBoxHeader}>{AppTextData.txt_Incorrect}</Text>

                    </View>
                    <View style={{ flex: 2, marginTop: 20 }}>
                      <Text style={{ color: 'black', fontSize: 18 }}>{inspectionGroup.Group}</Text>

                      <FlatList
                        style={{ borderWidth: 0, flexGrow: 0, }}
                        data={inspectionGroup.InspectionPoint}
                        renderItem={({ item, index }) => (
                          <View
                            style={{
                              minHeight: 100,
                              padding: 4,
                              marginTop: 1,
                            }}>
                            <CText style={{ color: 'black' }}>
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
                                  flex: 1
                                }}
                                // multiline={true}
                                //   keyboardType={item.IsReading ? 'numeric':'default'}
                                value={item.Remarks}
                                // onChangeText={(text) =>setSafetyRegulationCheckList(safetyRegulatoncheckList=>({...safetyRegulatoncheckList,InspectionPoint:safetyRegulatoncheckList.InspectionPoint.map((inspectionPoint) =>
                                //   inspectionPoint.ID === item.ID ? { ...inspectionPoint, Remarks: text } : inspectionPoint
                                // )}))}
                                onChangeText={(text) =>
                                  setSafetyRegulationCheckList(prevList => ({
                                    ...prevList,
                                    InspectionPointGroups: prevList.InspectionPointGroups.map(group => {
                                      // Only update the group where GroupID matches
                                      if (group.GroupID === item.GroupID) {
                                        return {
                                          ...group,
                                          InspectionPoint: group.InspectionPoint.map(point =>
                                            point.ID === item.ID
                                              ? { ...point, Remarks: text }
                                              : point
                                          )
                                        };
                                      }
                                      return group;
                                    })
                                  }))
                                }
                                //vbn lang
                                // placeholder="Remarks"
                                placeholder={AppTextData.txt_Remarks}
                              />
                              <View style={{
                                flexDirection: 'row',
                                width: '40%', justifyContent: 'space-around'
                              }}>
                                <TouchableOpacity
                                  style={{
                                    flexDirection: 'row',
                                    padding: 4,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginStart: 10,
                                  }}
                                  onPress={() => {
                                    updateCheckBoxStatus(1, { ID: item.ID, GroupID: inspectionGroup.GroupID })
                                  }}>
                                  <Icon
                                    name={
                                      (item.Status !== 0 && item.Status === 1) ? 'check-square-o' : 'square-o'
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
                                    updateCheckBoxStatus(2, { ID: item.ID, GroupID: inspectionGroup.GroupID })
                                  }}>
                                  <Icon
                                    name={
                                      (item.Status !== 0 && item.Status === 2) ? 'check-square-o' : 'square-o'
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
                                    updateCheckBoxStatus(3, { ID: item.ID, GroupID: inspectionGroup.GroupID })
                                  }}>
                                  <Icon
                                    name={
                                      (item.Status !== 0 && item.Status === 3) ? 'check-square-o' : 'square-o'
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
                    </View></>)}
            </ScrollView>
            <View >
              <TextInput
                multiline
                style={{
                  borderWidth: 1,
                  minHeight: 30,
                  height: 100,
                  padding: 8,
                  textAlignVertical: 'top',
                  borderRadius: 5,
                  marginTop: 5,
                  textAlign: 'justify',

                }}
                // multiline={true}
                //   keyboardType={item.IsReading ? 'numeric':'default'}
                value={safetyRegulatoncheckList.Comments}
                onChangeText={(text) => setSafetyRegulationCheckList(safetyRegulatoncheckList => ({ ...safetyRegulatoncheckList, Comments: text }))}
                //vbn lang
                // placeholder="Remarks"
                placeholder={AppTextData.txt_comments}
              />
              <FlatList
                style={{ marginTop: 20, flexGrow: 0, }}
                horizontal
                data={safetyRegulatoncheckList.Images}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Image
                  source={{ uri: item.Images }}
                  style={{ marginStart: 5, width: 100, height: 100, }}
                  resizeMode='stretch'
                />
                }
              />
            </View>
          </View>

        </KeyboardAvoidingView>
        <View style={{ backgroundColor: CmmsColors.logoBottomGreen, height: 50, justifyContent: 'space-around', flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ justifyContent: 'center', alignItems: 'center' }}
            onPress={() => onSave()}
          >
            <CText>{AppTextData.txt_Save}</CText>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ justifyContent: 'center', alignItems: 'center' }}
            onPress={() => checkForCameraRollPermission()}
          >
            <Icon name="camera" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ justifyContent: 'center', alignItems: 'center' }}
            onPress={() =>
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
  textCheckBoxHeader: {
    fontSize: 10,
    marginHorizontal: 1,
    fontWeight: '900',
    color: 'black',
    flex: 1,
    textAlign: 'center'
  }
})
export default CheckListSafetyRegulationPage;