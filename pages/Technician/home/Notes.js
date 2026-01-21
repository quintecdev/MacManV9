import React, {useRef, useState, useEffect, useLayoutEffect} from 'react';
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
  TextInput,
  BackHandler,
  PermissionsAndroid,
} from 'react-native';
import {CmmsText, CText} from '../../../common/components/CmmsText';
import {useSelector, useDispatch} from 'react-redux';
import CmmsColors from '../../../common/CmmsColors';
import Icon from 'react-native-vector-icons/FontAwesome';
import requestWithEndUrl from '../../../network/request';
import {API_APKJOIMAGE, API_TECHNICIAN} from '../../../network/api_constants';
import {actionSetLoading} from '../../../action/ActionSettings';
import {
  actionSetAlertPopUp,
  actionSetAlertPopUpTwo,
} from '../../../action/ActionAlertPopUp';
// import PhotoEditor from 'react-native-photo-editor';
import RNFS from 'react-native-fs';
import RNGRP from 'react-native-get-real-path';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Alerts from '../../components/Alert/Alerts';

export default Notes = ({navigation, route: {params}}) => {
  const [isNotesAsText, setIsNotesAsText] = useState(true);
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const dispatch = useDispatch();
  // const noteArea = useRef(null)
  console.log('Notes', {params});
  const [isAdd, setIsAdd] = useState(true); // handle both add and sumbit in single button
  const [newNote, setNewNote] = useState('');
  const [existingNotes, setExistingNotes] = useState([]);
  const {
    loggedUser: {TechnicianID, TechnicianName},
  } = useSelector((state) => state.LoginReducer);
  const {AlertPopUp, AlertPopUpTwo} = useSelector((state) => {
    return state.AlertPopUpReducer;
  });
  const [imageURI, setImage] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [selectedImg, setSelectedImg] = useState('');

  const checkForCameraRollPermission = async () => {
    console.log('CAMERA', 'start');
    try {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'App Camera Permission',
        message: 'App needs access to your camera ',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });
launchCamera(
          {
            quality: 0.5,
            maxHeight: 800,
            maxWidth: 600,
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
                setImage(uri);
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

    } catch (err) {
      console.error('camera_error: ', err);
    }
    // if (status !== 'granted') {
    //   alert("Please grant camera roll permissions inside your system's settings");
    // }else{
    //   console.log('Media Permissions are granted')
    // }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (props) => {
        console.log('home_props', props);
        return (
          <View
            style={{
              flexDirection: 'row',
              marginEnd: 8,
              alignItems: 'center',
            }}>
            <TouchableOpacity
              style={{
                padding: 4,
                margin: 5,
                borderWidth: isNotesAsText ? 1 : 0,
                borderColor: CmmsColors.selectionColor,
              }}
              onPress={() => {
                setIsNotesAsText(true);
              }}>
              <Icon name="commenting" size={24} color="grey" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                margin: 5,
                padding: 4,
                borderWidth: !isNotesAsText ? 1 : 0,
                borderColor: CmmsColors.selectionColor,
              }}
              onPress={() => {
                setIsNotesAsText(false);
              }}>
              <Icon name="file-image-o" size={24} color="grey" />
            </TouchableOpacity>
          </View>
          // <Image
          //   style={{height:48,width:48,}}
          //   source={require('../assets/icons/')}
          //   />
        );
      },
    });
  }, [navigation, isNotesAsText]);

  useEffect(() => {
    if (!isNotesAsText) {
      getImageList();

      // checkForCameraRollPermission()
    }
  }, [isNotesAsText]);

  async function getImageList() {
    dispatch(actionSetLoading(true));
    requestWithEndUrl(`${API_TECHNICIAN}GetImageOfJOBySE`, {
      JOID: params.JOID,
      SEID: params?.IsSuperVisor == 1 ? params?.SEID : TechnicianID,
    })
      .then((res) => {
        console.log('GetImageOfJOBySE', {res});

        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        setImageList(data);
        data.length > 0 && setSelectedImg(data[data.length - 1].ImageUrl);
          dispatch(actionSetLoading(false));
      })
      .catch((err) => {
        dispatch(actionSetLoading(false));

        console.log('GetImageOfJOBySE', err);
      });
  }

  useEffect(() => {
    console.log('photo:', {imageURI});
    if (imageURI != null  ) {
      var imagePath=imageURI;
      // console.log('photo:', imageURI.assets[0].uri);
      // dispatch(actionSetLoading(true));
      // RNGRP.getRealPathFromURI(imageURI.assets[0].uri).then((imagePath) => {
        // dispatch(actionSetLoading(false));
        // PhotoEditor.Edit({
        //   path: path,
          // RNFS.readFile(path, 'base64').then(imageBase64 =>
          //   this.props.actions.sendImageAsBase64(imageBase64)
          // )
          // onDone: (imagePath) => {
            // console.log('photoedit_ondone: ', {imagePath});

            dispatch(actionSetLoading(true));
            let bodyFormData = new FormData();
            // let newImageFile = new File([ imgFile.encoded ], JobOrderReportData.Custodian + '.png', {
            // 	type: 'image/*'
            // });
            bodyFormData.append(
              'JODetails',
              JSON.stringify({JOID: params.JOID, SEID: TechnicianID}),
            );
            // let imgUri =
            //   Platform.OS === 'android' ? `file://${imagePath}` : imagePath;
            console.log('image uri==>>', imagePath);
            var photo = {
              uri: imagePath, //this.state.uri[0].uri, == image path file:///storage/emulated/0/Pictures/1511787860629.jpg
              type: 'image/jpg',
              name: 'photo.jpg',
              // size: newImageFile.size
            };
            console.log('image var==>>>', photo);
            bodyFormData.append('JOImage', photo);
            console.log('body form data after append===>>', bodyFormData);
            //http://213.136.84.57:1818/api/ApkTechnician/SaveImageOfJO
            requestWithEndUrl(
              `${API_TECHNICIAN}SaveImageOfJO`,
              bodyFormData,
              'POST',
              {'Content-Type': 'multipart/form-data'},
              //   { "contentType": "false" }
            )
              .then((res) => {
                console.log('SaveImageOfJO', {res});
                if (res.status != 200) {
                  throw Error(res.data);
                }
                return res.data;
              })
              .then(async (data) => {
                console.log({data});
                // dispatch(actionSetLoading(false));
                if (data.isSucess) {
                  // setImageList(imageList=>[...imageList,{}])
                 await getImageList();
                  //   alert(data.Message); //vvvv
                  dispatch(
                    actionSetAlertPopUpTwo({
                      title: AppTextData.txt_Alert,
                      body: AppTextData.txt_Saved_successfully,
                      visible: true,
                      type: 'ok',
                    }),
                  );
                } else throw Error(data.Message);
              })
              .catch((err) => {
                dispatch(actionSetLoading(false));
                console.log({err});
                // alert(AppTextData.txt_somthing_wrong_try_again);
                dispatch(
                  actionSetAlertPopUpTwo({
                    title: AppTextData.txt_Alert,
                    body: AppTextData.txt_somthing_wrong_try_again,
                    visible: true,
                    type: 'ok',
                  }),
                );
              });
        //   },
        //   hiddenControls: ['save'],
        // });
      // });
    }
  }, [imageURI]);

  useEffect(() => {
    // addImage()

    //http://213.136.84.57:1818/api/ApkTechnician/GetNoteInJobTime
    //{"JOID":4134,"SEID":52}
    dispatch(actionSetLoading(true));
    requestWithEndUrl(`${API_TECHNICIAN}GetNoteInJobTime`, {
      JOID: params.JOID,
      SEID: params?.IsSuperVisor == 1 ? params?.SEID : TechnicianID,
    })
      .then((res) => {
        // console.log('SaveNoteInJobTime', {res});

        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        dispatch(actionSetLoading(false));
        setExistingNotes(data);
      })
      .catch((err) => {
        dispatch(actionSetLoading(false));
        // alert(AppTextData.txt_Something_went_wrong);
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: AppTextData.txt_somthing_wrong_try_again,
            visible: true,
            type: 'ok',
          }),
        );
      });
  }, []);

  return (
    <SafeAreaView style={{flex: 1, padding: 8}}>
      {/* <Alerts
        title={AlertPopUpTwo?.title}
        body={AlertPopUpTwo?.body}
        visible={AlertPopUpTwo?.visible}
        onOk={() => {
          dispatch(actionSetAlertPopUpTwo({visible: false})),
            console.log('current value==>>', AlertPopUpTwo);
        }}
        type={AlertPopUpTwo.type}
      /> */}
      {isNotesAsText ? getNotePageAsText() : getNotePageAsAttachments()}

      {/* </View> */}
    </SafeAreaView>
  );

  function getNotePageAsText() {
    return (
      <View style={{flex: 1}}>
        <FlatList
          style={{marginBottom: 10}}
          showsVerticalScrollIndicator={true}
          data={existingNotes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => (
            <CmmsText style={{marginVertical: 4, color: 'black'}}>
              {index + 1}. {item.Notes}
            </CmmsText>
          )}
        />

        {/* <View
  
    >
     */}
        <TextInput
          // ref={noteArea.current}
          // selectTextOnFocus
          style={{
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            alignContent: 'flex-start',
            textAlignVertical: 'top',
            borderWidth: 1,
            minHeight: 100,
            maxHeight: '25%',
            borderColor: 'grey',
          }}
          multiline={true}
          // numberOfLines={4}
          placeholder={AppTextData.txt_Please_enter_your_notes}
          onChangeText={(text) => setNewNote(text)}
          value={newNote}
        />
        <TouchableOpacity
          style={{
            alignSelf: 'flex-end',
            marginTop: 10,
            borderRadius: 25,
            borderColor: 'rgba(0,0,0,0.2)',
            backgroundColor: CmmsColors.logoBottomGreen,
            height: 50,
            width: 50,
            justifyContent: 'center',
            alignItems: 'center',
            // paddingHorizontal:8,paddingVertical:4
          }}
          onPress={() => {
            if (newNote !== '') {
              dispatch(actionSetLoading(true));
              requestWithEndUrl(
                `${API_TECHNICIAN}SaveNoteInJobTime`,
                {
                  JOID: params.JOID,
                  SEID: TechnicianID,
                  Note: newNote,
                },
                'POST',
              )
                .then((res) => {
                  // console.log('SaveNoteInJobTime', {res});

                  if (res.status != 200) {
                    throw Error(res.statusText);
                  }
                  return res.data;
                })
                .then((data) => {
                  console.log({data});
                  dispatch(actionSetLoading(false));
                  if (data.isSucess) {
                    setExistingNotes((existingNotes) => [
                      ...existingNotes,
                      {Notes: newNote},
                    ]);
                    setIsAdd(true);
                    setNewNote('');
                  }
                  // alert(data.Message)
                })
                .catch((err) => {
                  console.log({err});
                  dispatch(actionSetLoading(false));
                  //   alert(AppTextData.txt_somthing_wrong_try_again);
                  dispatch(
                    actionSetAlertPopUpTwo({
                      title: AppTextData.txt_Alert,
                      body: AppTextData.txt_somthing_wrong_try_again,
                      visible: true,
                      type: 'ok',
                    }),
                  );
                });
            } else {
              //   alert(AppTextData.txt_Please_enter_your_notes);
              dispatch(
                actionSetAlertPopUpTwo({
                  title: AppTextData.txt_Alert,
                  body: AppTextData.txt_Please_enter_your_notes,
                  visible: true,
                  type: 'ok',
                }),
              );
            }
          }}>
          {/* <CText>{isAdd? 'Add otes':'Submit'}</CText> */}
          <Icon name="paper-plane" size={18} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  function getNotePageAsAttachments() {
    console.log('getNotePageAsAttachments: ', 'imuri: ', imageURI);
    return (
      <View style={{flex: 1}}>
        {imageList.length > 0 && (
          <View
            style={{
              // marginVertical: 10,
              alignItems: 'center',
              flex: 1,
            }}>
            <Image
              resizeMode="cover"
              resizeMethod="scale"
              style={{width: '100%', height: '80%'}}
              source={{uri: `${API_APKJOIMAGE}${selectedImg}`}}
            />

            {/* <View style={{ height: '20%', width: '100%',borderWidth:1 }}> */}
            <FlatList
              style={{marginTop: 5}}
              data={imageList}
              // ListFooterComponent={()=><View
              // style={{backgroundColor:'red',width:100}}
              // ></View>}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={{marginEnd: 5}}
                  onPress={() => {
                    // setVisibleImagePopUp(true)
                    setSelectedImg(item.ImageUrl);
                  }}>
                  <Image
                    style={{height: 150, width: 120}}
                    resizeMode="cover"
                    resizeMethod="scale"
                    source={{uri: `${API_APKJOIMAGE}${item.ImageUrl}`}}
                  />
                </TouchableOpacity>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
            {/* </View> */}
          </View>
        )}

<View 
 style={{
  position: 'absolute',
  bottom: 8,
  end: 8,
  marginTop: 10,}}
>
        <TouchableOpacity
         style={{
            borderRadius: 25,
            borderColor: 'rgba(0,0,0,0.2)',
            backgroundColor: CmmsColors.logoBottomGreen,
            height: 50,
            width: 50,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom:8
            // paddingHorizontal:8,paddingVertical:4
          }}
          onPress={() => {
            checkForCameraRollPermission();
          }}>
          <Icon name="camera" size={18} color="white" />
        </TouchableOpacity>
        {params?.isPmJob != 0 && 
        <TouchableOpacity
         style={{
            borderRadius: 25,
            borderColor: 'rgba(0,0,0,0.2)',
            backgroundColor: CmmsColors.logoBottomGreen,
            height: 50,
            width: 50,
            justifyContent: 'center',
            alignItems: 'center',
            // paddingHorizontal:8,paddingVertical:4
          }}
          onPress={() => {
             launchImageLibrary(
                    {
                      selectionLimit: 1,
                    },
                   setImage
                  )
          }}>
          <Icon name="paperclip" size={18} color="white" />
        </TouchableOpacity>}
        </View>
      </View>
    );
  }
};
