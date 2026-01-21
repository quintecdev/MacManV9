import React, {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useMemo,
} from 'react';
import {
  SafeAreaView,
  TextInput,
  Text,
  Keyboard,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Switch,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  Linking,
  PermissionsAndroid,
  Alert,
  TouchableHighlight,
} from 'react-native';
import CmmsColors from '../../common/CmmsColors';
import {CmmsText, CText, CTextTitle} from '../../common/components/CmmsText';
import SearchBar from '../components/SearchBar';
import Icon from 'react-native-vector-icons/FontAwesome';
import requestWithEndUrl from '../../network/request';
import {useSelector, useDispatch} from 'react-redux';
import {
  API_ASSET_PATH,
  API_TECHNICIAN,
  BASE_IP,
} from '../../network/api_constants';
import {
  Autocomplete,
  withKeyboardAwareScrollView,
} from 'react-native-dropdown-autocomplete';
import SearchComponent from '../../common/components/SearchComponent';
import {Dialog} from 'react-native-simple-dialogs';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import FromToTimePicker from '../supervisor/job_oder/components/FromToTimePicker';
import DateTimePicker from '@react-native-community/datetimepicker';

import {actionSetLoading} from '../../action/ActionSettings';
import {
  actionSetAlertPopUp,
  actionSetAlertPopUpTwo,
} from '../../action/ActionAlertPopUp';
import FromToDatePicker from '../supervisor/job_oder/components/FromToDatePicker'; //'../components/FromToDatePicker'
import {format, parse} from 'date-fns';
import {el} from 'date-fns/locale';
import DynamicSearchBar from './components/DynamicSearchBar';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import AssetInfoPopUp from '../components/AssetInfoPopUp';
// import PhotoEditor from 'react-native-photo-editor';
import RNGRP from 'react-native-get-real-path';
import Alerts from '../components/Alert/Alerts';

export const deviceWidth = Dimensions.get('window').width;

export default ({navigation, route: {params}}) => {
  const assetIpRef = useRef();

  const dispatch = useDispatch();
  const [imageURI, setImage] = useState(null);
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const {AlertPopUp, AlertPopUpTwo} = useSelector((state) => {
    return state.AlertPopUpReducer;
  });

  console.log('CheckListPage params', params.Reason);
  const [searchText, setSearchText] = useState('');

  const [visibleAttachments, setVisibleAttachments] = useState(false);
  const [assetList, setAssetList] = useState([
    // {
    // 	AssetRegID: 3094,
    // 	Asset: 'S&S L-H6  PANINI',
    // 	AssetCode: 'S&S L-H6'
    // },
  ]);
  // const [ filterAssetList, setFilterAssetList ] = useState([]);
  const [checkedListData, setCheckedListData] = useState(undefined);
const [abnormatlityButtonPermission,setAbnormatlityButtonPermission]=useState([])
const [machineMinMaxValue,setMachineMinMaxValue]=useState([])
console.log('machineminmax value from the state-->>',machineMinMaxValue)
  const [visibleAssetInfoPopUp, setVisibleAssetInfoPopUp] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(undefined);
  console.log({selectedAsset});
  const [assetInfo, setAssetInfo] = useState(undefined);
  const [newAttachmentFileList, setnewAttachmentFileList] = useState([]);
  const [IsError, setIsError] = useState(false);
  const [ShowAbnormalityTextBox, setShowAbnormalityTextBox] = useState(
    checkedListData?.IsWorkingFine,
  );
  const [savebuttonEnable,setSavebuttonEnable]=useState(true)
  const {
    loggedUser: {TechnicianID, TechnicianName},
  } = useSelector((state) => state.LoginReducer);

  const [dateTimePickerData, setDateTimePickerData] = useState({
    showTimePicker: false,
    where: 'fromTime',
  });
  console.log({checkedListData});

  const updateActList = (ActivityList = []) =>
    setCheckedListData((checkedListData) => ({
      ...checkedListData,
      ActivityList,
    }));

  // const [selectedDate,setSelectedDate] = useState(new Date())

  const updateSpareParts = (SparePartsList = []) => {
    console.log('updateSpareParts', {SparePartsList});
    setCheckedListData((checkedListData) => ({
      ...checkedListData,
      SparePartsList,
    }));
  };

  const toggleSwitch = () => {
    console.log('switch button value---->>', !checkedListData.IsWorkingFine);
    setCheckedListData((checkedListData) => ({
      ...checkedListData,
      IsWorkingFine: !checkedListData.IsWorkingFine,
    }));
  };

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
            saveToPhotos: true,
            mediaType: 'photo', //'photo' | 'video' | 'mixed'
            includeBase64: false,
            //  durationLimit:
          },
          ({assets, errorCode, didCancel}) => {
            console.log('checkForCameraRollPermission', {errorCode, didCancel});

            if (!didCancel && !errorCode) {
              //setnewAttachmentBasedOnFormDataImage(assets[0],'CR')
              RNGRP.getRealPathFromURI(assets[0].uri).then((path) => {
                // PhotoEditor.Edit({
                //   path: path,
                  // RNFS.readFile(path, 'base64').then(imageBase64 =>
                  //   this.props.actions.sendImageAsBase64(imageBase64)
                  // )
                  // onDone: (imagePath) => {
                    setnewAttachmentBasedOnFormDataImage(assets[0], 'GR');
                //   },
                //   hiddenControls: ['save'],
                // });
              });
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

  const checkForGalleryPermission = async () => {
    console.log('Gallery', 'start');
    try {
      launchImageLibrary(
        {
          selectionLimit: 1,
        },
        ({assets, errorCode, didCancel}) => {
          console.log('checkForGalleryPermission', {
            assets,
            errorCode,
            didCancel,
          });
          if (!didCancel && !errorCode) {
            RNGRP.getRealPathFromURI(assets[0].uri).then((path) => {
              // PhotoEditor.Edit({
                // path: path,
                // RNFS.readFile(path, 'base64').then(imageBase64 =>
                //   this.props.actions.sendImageAsBase64(imageBase64)
                // )
                // onDone: (imagePath) => {
                  setnewAttachmentBasedOnFormDataImage(assets[0], 'GR');
                // },
                // hiddenControls: ['save'],
              // });
            });
          }
          //   setnewAttachmentFileList(newAttachmentFileList=>[...newAttachmentFileList,img.assets[0]])
        },
      );
    } catch (err) {
      console.error('gallery_error: ', err);
    }
    // if (status !== 'granted') {
    //   alert("Please grant camera roll permissions inside your system's settings");
    // }else{
    //   console.log('Media Permissions are granted')
    // }
  };

  function setnewAttachmentBasedOnFormDataImage({uri, type, fileName}, where) {
    console.log({fileName});
    setnewAttachmentFileList((newAttachmentFileList) => [
      ...newAttachmentFileList,
      {
        uri, //this.state.uri[0].uri, == image path file:///storage/emulated/0/Pictures/1511787860629.jpg
        type,
        name: `cmms_${where}_attachment_${newAttachmentFileList.length}_${
          fileName.split('_')[5]
        }`,
        // size: newImageFile.size
      },
    ]);
  }

  useEffect(() => {
    dispatch(actionSetLoading(true));
    console.log('the params for the api call ==>',params.JOID,TechnicianID)
    // http://213.136.84.57:2256/api/ApkTechnician/getchecklistassetlist?JOID=3157&SEID=3
    requestWithEndUrl(`${API_TECHNICIAN}getchecklistassetlist`, {
      JOID: params.JOID,
      SEID: TechnicianID,
    })
      .then((res) => {
        console.log('getchecklistassetlist-->>', {res});
        if (res.status != 200) throw Error(res.statusText);
        else if (res.data) {
          var assetDumList = res.data;
          // [{
          // 		AssetRegID: 3094,
          // 		Asset: 'S&S L-H6  PANINI',
          // 		AssetCode: 'S&S L-H6',
          // 		LocationName:'Edappal'
          // 	},
          // 	{
          // 		AssetRegID: 30945,
          // 		Asset: 'S&S L-H6vv  PANINI',
          // 		AssetCode: 'S&S L-H6vv',
          // 		LocationName:'Edappal'
          // 	}
          // ]
          setAssetList(assetDumList);
          // setAssetList(res.data);
          dispatch(actionSetLoading(false));
          if (assetDumList.length == 1) {
            setSelectedAsset(assetDumList[0]);
            return;
          }
        }
      })
      .catch(function (error) {
        dispatch(actionSetLoading(false));
        // alert(AppTextData.txt_Something_went_wrong);
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: AppTextData.txt_Something_went_wrong,
            visible: true,
            type: 'ok',
          }),
        );

        // console.log('SparepartsRequired Error: ', error);
      });
  }, []);

  useEffect(() => {
    if (checkedListData && newAttachmentFileList.length > 0) {
      setCheckedListData((checkedListData) => ({
        ...checkedListData,
        Attachments: [
          ...checkedListData?.Attachments,
          {
            AttachmentUrl:
              newAttachmentFileList[newAttachmentFileList.length - 1].uri,
          },
          // ...newAttachmentFileList.map(newAttachment=>{
          // 	console.log("newAttachment",{newAttachment})
          // 	return ({id:Date.now(),AttachmentUrl:newAttachment.assets[0].uri})
          // }
          // 	)
        ],
      }));
    }
  }, [newAttachmentFileList]);

  useEffect(() => {
    if (selectedAsset) {
      // setshowAssetDropdownList(false);
      setnewAttachmentFileList([]);
      setCheckedListData(undefined);
      setAssetInfo(undefined);
      setSearchText(selectedAsset.Asset);
      getchecklist(selectedAsset.AssetRegID);
    }
  }, [selectedAsset]);

  return (
    <SafeAreaView style={{flex: 1, padding: 8}}>
      <DynamicSearchBar
        searchFilterList={
          assetList
          // [
          // {
          // 		AssetRegID: 3094,
          // 		Asset: 'S&S L-H6  PANINI',
          // 		AssetCode: 'S&S L-H6'
          // 	}
          // ]
        }
        visibleSearchView={assetList.length > 1}
        visibleDrawerRightIcon={true}
        onDrawableRightPress={(selectedItem) => {
          console.log('onDrawableRightPress', selectedItem);
          setVisibleAssetInfoPopUp(true);
          // getAssetInfo(selectedItem.AssetRegID)
        }}
        isSetSearchText={true}
        onItemSelected={(item) => setSelectedAsset(item)}
        dispatch={dispatch}
      />

      {selectedAsset &&
        checkedListData &&
        checkedListData.CheckListGroups?.length > 0 &&
        showCheckListView()}

      {/* {visibleAssetInfoPopUp && (
				<AssetInfoPopUp
					dispatch={dispatch}
					AssetRegID={selectedAsset.AssetRegID}
					onTouchOutSide={() => setVisibleAssetInfoPopUp(false)}
				/>
			)} */}
      {/* {
				visibleAssetInfoPopUp&&<Dialog
				title={'Asset Information'}
				visible={visibleAssetInfoPopUp}
				onTouchOutside={()=>setVisibleAssetInfoPopUp(false)}
			>
				<View
				style={{minHeight:100}}
				>
					<Text>{assetInfo?.AssetName}</Text>
					{assetInfo?.Documents.map(doc=>
						<Text 
						style={{paddingVertical:4,bgvmarginTop:2,color:CmmsColors.palatinateBlue}} 
						numberOfLines={1} ellipsizeMode='tail' 
						onPress={()=>{
							// Linking.openURL(`${API_ASSET_PATH}${doc}`)
							const url = `${API_ASSET_PATH}${doc}`

							const localFile = `${RNFS.DocumentDirectoryPath}/${doc}`;
						RNFS.downloadFile(
							{
								fromUrl:url,
								toFile: localFile
							}
						)
						.promise.then((data) => {
							console.log("download",data);
							return FileViewer.open(localFile)})
						.then((data) => {
							console.log("Fileviewer open",data);
						  // success
						})
						.catch((error) => {
							console.error("Fileviewer open",error);
						  // error
						})

						}
						}>{doc}</Text>)}
				
				</View>
			</Dialog>
			} */}
      {dateTimePickerData.showTimePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={parse(
            dateTimePickerData.where == 'fromTime'
              ? checkedListData.FromDate
              : checkedListData.ToDate,
            'dd/MM/yyyy hh:mma',
            new Date(),
          )}
          mode="time" //{dateTimePickerData.where=='date'?'date':'time'}
          // is24Hour={true}
          minimumDate={new Date()}
          display="default"
          onChange={(e, date) => {
            // setDateTimePickerData({...dateTimePickerData,showTimePicker:false})
            dateTimePickerData.showTimePicker = false;

            console.log('CHK_ONDATE', format(date, 'dd/MM/yyyy hh:mma'));

            console.log('CHK_ONDATE', date);
            if (date) {
              switch (dateTimePickerData.where) {
                case 'date':
                  setSelectedDate(date);
                  break;
                case 'fromTime':
                  setCheckedListData({
                    ...checkedListData,
                    FromDate: format(date, 'dd/MM/yyyy hh:mma'),
                  });
                  break;
                case 'toTime':
                  setCheckedListData({
                    ...checkedListData,
                    ToDate: format(date, 'dd/MM/yyyy hh:mma'),
                  });
                  break;
                default:
                  break;
              }
            }
          }}
        />
      )}
    </SafeAreaView>
  );

  // function getDatePickerValue():Date{
  // 	switch(dateTimePickerData.where){
  // 		case 'date':
  // 			return selectedDate;
  // 			case 'fromTime':
  // 				return new Date(checkedListData?.FromDate);
  // 				case 'toTime':
  // 					return new Date(checkedListData?.ToDate)
  // 			default: return selectedDate
  // 		}
  // }

  async function getAssetInfo(AssetRegID) {
    console.log('getAssetInfo', {AssetRegID});
    //http://localhost:29189/api/ApkTechnician/getassetinformation?AssetRegID=2988
    dispatch(actionSetLoading(true));
    try {
      const assetInfoData = await requestWithEndUrl(
        `${API_TECHNICIAN}getassetinformation`,
        {AssetRegID},
      );
      console.log('getAssetInfo', {assetInfoData});

      if (assetInfoData.data && assetInfoData.data.AssetName) {
        console.log('getAssetInfo', {data: assetInfoData.data});
        // if(AssetRegID)
        setVisibleAssetInfoPopUp(true);
        setAssetInfo(assetInfoData.data);
      } else {
        // alert(AppTextData.txt_Invalid_Asset_Information);
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: AppTextData.txt_Invalid_Asset_Information,
            visible: true,
            type: 'ok',
          }),
        );
      }
      dispatch(actionSetLoading(false));
    } catch (e) {
      console.error('getAssetInfo', e);
      dispatch(actionSetLoading(false));
    }
  }

  function showCheckListView() {
    return (
      <View style={{flex: 1, marginVertical: 8}}>
        <Alerts
          title={AlertPopUpTwo?.title}
          body={AlertPopUpTwo?.body}
          visible={AlertPopUpTwo?.visible}
          onOk={() => {
            dispatch(actionSetAlertPopUpTwo({visible: false})),
              console.log('current value==>>', AlertPopUpTwo);
          }}
          type={AlertPopUpTwo.type}
        />
        {/* <View
          style={{
            height: 50,
            flexDirection: 'row',
            paddingHorizontal: 8,
            backgroundColor: 'white',
            alignItems: 'center',
          }}>
          <CmmsText
            style={{
              flex: 1,
              fontWeight: 'bold',
              height: 40,
              padding: 4,
              textAlignVertical: 'center',
            }}
            onPress={() => {
              // setDateTimePickerData({...dateTimePickerData,showTimePicker:true})
              // setshowDp(true)
            }}>
            {
              checkedListData?.ToDate
              //format(checkedListData?.ToDate!=0?new Date(checkedListData?.ToDate):new Date(), 'dd/MM/yyyy')
            }
          </CmmsText>

          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}>
            <CmmsText
              style={{
                fontWeight: 'bold',
                height: 40,
                padding: 4,
                textAlignVertical: 'center',
                marginEnd: 10,
              }}
              onPress={() => {
                setDateTimePickerData({
                  showTimePicker: true,
                  where: 'fromTime',
                });
              }}>
              From:{' '}
              {format(
                parse(
                  checkedListData?.FromDate,
                  'dd/MM/yyyy hh:mma',
                  new Date(),
                ),
                'hh:mm a',
              )}
            </CmmsText>
            <CmmsText
              style={{
                marginHorizontal: 20,
                fontWeight: 'bold',
                height: 40,
                padding: 4,
                textAlignVertical: 'center',
              }}
              onPress={() => {
                setDateTimePickerData({showTimePicker: true, where: 'toTime'});
              }}>
              To:{' '}
              {format(
                parse(checkedListData?.ToDate, 'dd/MM/yyyy hh:mma', new Date()),
                'hh:mm a',
              )}
            </CmmsText>
          </View>
        </View> */}
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none">
          {checkedListData.CheckListGroups?.map((CheckListGroup) => {
            return (
              <View
                style={{backgroundColor: 'white', marginTop: 2, padding: 8}}>
                <CTextTitle style={{color: 'black'}}>
                  {CheckListGroup.Group}
                </CTextTitle>
                <FlatList
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="none"
                  keyExtractor={(item, index) => index.toString()}
                  // ItemSeparatorComponent={({item,index})=><View style={[{ backgroundColor: 'red', flex: 1 }, index%2==0 ? { marginRight: 10 } : { marginLeft: 10 } ]}/>}
                  data={CheckListGroup.ChecklistItems}
                  renderItem={({item, index}) => (
                    <View
                      style={{
                        minHeight: 100,
                        padding: 4,
                        marginTop: 1,
                      }}>
                      <CText style={{color: 'black'}}>
                        {index + 1}. {item.Item}
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
                            width: '80%',
                          }}
                          // multiline={true}
                          keyboardType={item.IsReading ? 'numeric':'default'}
                          value={item.Remarks}
                          onChangeText={(remarks) => {
                            console.log('number or not==>>',Number(remarks))
                            if(item.IsReading)
{if(!isNaN(Number(remarks)))
                         {   
                          CheckListGroup.ChecklistItems.forEach(
                              (element, index) => {
                                if (
                                  item.GroupID == element.GroupID &&
                                  item.ItemID == element.ItemID
                                ) {
                                  {element.Remarks = remarks.replace(/[' ',]/g,'');}
                                }
                              }
                            );
                            setCheckedListData({...checkedListData});
 checklistDataAnalysing()
}
 else if(remarks[0]=='-'|| remarks[0]=='.')
 { 
  console.error('inside -ve check')
  const regex = /^-\d+(\.\d+)?$/;
  if(regex.test(remarks)|| remarks.length==1) { 
    
    CheckListGroup.ChecklistItems.forEach(
      (element, index) => {
        if (
          item.GroupID == element.GroupID &&
          item.ItemID == element.ItemID
        ) {
          {element.Remarks = remarks.replace(/[' ',]/g,'');}
        }
      }
    );
    setCheckedListData({...checkedListData});
checklistDataAnalysing()}
else {
  dispatch(
    actionSetAlertPopUpTwo({
      title: AppTextData.txt_Alert,
      body: AppTextData.txt_Please_enter_valid_input,
      visible: true,
      type: 'ok',
    }),
  );
 }
}
 else {
  dispatch(
    actionSetAlertPopUpTwo({
      title: AppTextData.txt_Alert,
      body: AppTextData.txt_Please_enter_valid_input,
      visible: true,
      type: 'ok',
    }),
  );
 }}else{
  {   CheckListGroup.ChecklistItems.forEach(
    (element, index) => {
      if (
        item.GroupID == element.GroupID &&
        item.ItemID == element.ItemID
      ) {
        element.Remarks = remarks;
      }
    }
  );
  setCheckedListData({...checkedListData});
}
 }
                            checkedListData.CheckListGroups?.filter(e=>
                               e.MaxValue==0.0
                            )
                            const aaaa= checkedListData.CheckListGroups.map(e=>e.ChecklistItems.filter(
                              (item) => item.IsReading == true && (item.Remarks>=item.MinValue||item.Remarks<=item.MaxValue)
                              )).filter(e=>e.length)
                            console.log('abcdefghij==>>',aaaa
                           )
                          }}
                          //vbn lang
                          // placeholder="Remarks"
                          placeholder={item.IsReading?AppTextData.txt_Value:AppTextData.txt_Remarks}
                        />
                        {!item.IsReading?<TouchableOpacity
                          style={{
                            flexDirection: 'row',
                            padding: 4,
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: 4,
                          }}
                          onPress={() => {
                            CheckListGroup.ChecklistItems.forEach(
                              (element, index) => {
                                if (
                                  item.GroupID == element.GroupID &&
                                  item.ItemID == element.ItemID
                                ) {
                                  element.IsComplete = !element.IsComplete;
                                  if (element.IsComplete) element.IsNA = false;
                                }
                              },
                            );
                            setCheckedListData({...checkedListData});
                          }}>
                          <Icon
                            name={
                              item.IsComplete ? 'check-square-o' : 'square-o'
                            }
                            size={18}
                            color="black"
                          />
                          <CmmsText style={{marginHorizontal: 4}}>
                            Done
                          </CmmsText>
                        </TouchableOpacity>:null}
                      </View>
                      {item.Images?<TouchableOpacity 
                                                        style={{alignSelf:"flex-end",marginStart:10,padding:4}}
                                                        onPress={()=>{
                                                          console.log("image icon")
                                                          navigation.navigate("FullScreenImageView",{imageUrl:item.Images})
                                                          }
                                                        }
                                                        >
                                                          <Icon name="picture-o" size={24} color="grey" />
                                                        </TouchableOpacity>:null}
                    </View>
                  )}
                />
              </View>
            );
          })}

          <View
            style={{
              padding: 8,
              backgroundColor: 'white',
            }}>
            {visibleAttachments && (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={checkedListData?.Attachments || []}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => {
                  //{"id":1,"AttachmentUrl":Image/JOCheckList/sample.jpg"}
                  console.log('AttachmentUrl', {item});
                  return (
                    <Image
                      style={{width: 100, height: 100, marginEnd: 5}}
                      source={{
                        uri: item.AttachmentUrl.startsWith('file')
                          ? item.AttachmentUrl
                          : `${BASE_IP}/${item.AttachmentUrl}`,
                        // 'https://lh3.googleusercontent.com/ogw/ADea4I7C4Br9kp5-3kTvGkUBpmpUmgtCTUOQdUlh5vX9=s32-c-mo'
                      }}
                      defaultSource={require('../../assets/placeholders/no_image.png')}
                    />
                  );
                }}
                onScrollAnimationEnd
                ListFooterComponent={() => (
                  <View
                    style={{
                      width: 100,
                      height: 100,
                      borderWidth: 1,
                      borderColor: CmmsColors.lightGray,
                      // justifyContent: 'space-around',
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}>
                    {/* <Icon style={{position:'absolute',end:0,top:0,start:0,bottom:0}} name="plus" size={90} color={CmmsColors.logoBottomGreen} /> */}
                    <TouchableOpacity
                      style={{position: 'absolute', start: 16, bottom: 16}}
                      onPress={() => checkForGalleryPermission()}>
                      <Icon
                        name="picture-o"
                        size={24}
                        color={CmmsColors.logoBottomGreen}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{position: 'absolute', end: 16, top: 16}}
                      onPress={() => checkForCameraRollPermission()}>
                      <Icon
                        name="camera"
                        size={24}
                        color={CmmsColors.logoBottomGreen}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
            <View
              style={{
                flexDirection: 'row',
                margin: 4,
                padding: 4,
                marginBottom:15
              }}>
              <Text style={{paddingRight: 15, color: 'black',fontWeight:'bold'}}>
                {AppTextData.txt_Abnormality}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  width: '70%',
                  height: 35,
                  justifyContent:'space-between'
                }}>
                  <View style={{flexDirection:'row'}}>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 15,
                    borderColor:
                      checkedListData?.IsWorkingFine == false
                        ? 'green'
                        : 'gray',
                    paddingVertical: 5,
                    borderRadius: 18,
                    marginRight: 5,
                    backgroundColor:
                      checkedListData?.IsWorkingFine == false
                        ? 'green'
                        : 'gray',
                    justifyContent:'center',
                    minWidth: 60,
                    elevation: 15
                  }}
                  onPress={() => {
                    console.log(
                      'switch button value---->>',
                      !checkedListData.IsWorkingFine,
                    );
                    setCheckedListData((checkedListData) => ({
                      ...checkedListData,
                      IsWorkingFine: false,
                    }));
                  }}>
                  <Text
                    style={{
                      alignSelf: 'center',
                      color:
                        checkedListData?.IsWorkingFine == false
                          ? 'white'
                          : 'black',fontWeight:'bold'
                    }}>
                    {AppTextData.txt_No}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 15,
                    borderColor:
                      checkedListData?.IsWorkingFine == true ? 'green' : 'gray',
                    paddingVertical: 5,
                    borderRadius: 18,
                    marginLeft: 5,
                    elevation: 15,
                    backgroundColor: '#fff',
                    backgroundColor:
                      checkedListData?.IsWorkingFine == true ? 'green' : 'gray',
                    minWidth: 60,
                    justifyContent:'center'
                  }}
                  onPress={() => {
                    console.log(
                      'switch button value---->>',
                      !checkedListData.IsWorkingFine,
                    );
                    setCheckedListData((checkedListData) => ({
                      ...checkedListData,
                      IsWorkingFine: true,
                    }));
                  }}>
                  <Text
                    style={{
                      alignSelf: 'center',
                      color:
                        checkedListData?.IsWorkingFine == true
                          ? 'white'
                          : 'black',fontWeight:'bold'
                    }}>
                    {AppTextData.txt_Yes}
                  </Text>
                </TouchableOpacity>
                </View>
                {checkedListData?.IsWorkingFine == true ? (
                  <TouchableOpacity
                    style={{
                      padding: 4,
                      justifyContent: 'flex-end',
                    }}
                    onPress={() =>
                      setVisibleAttachments(
                        (visibleAttachments) => !visibleAttachments,
                      )
                    }>
                    <Icon name="paperclip" size={28} color="grey" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
            {checkedListData?.IsWorkingFine == true ? (
              <>
                <TextInput
                  style={{
                    borderWidth: 1,
                    minHeight: 100,
                    padding: 8,
                    textAlignVertical: 'top',
                    borderRadius: 5,
                    marginTop: 5,
                    borderColor: IsError ? 'red' : 'black',
                    textAlign: 'justify',
                  }}
                  multiline={true}
                  //vbn lang
                  placeholder={AppTextData.txt_Abnormality_Notes}
                  // placeholder="Notes"
                  value={checkedListData.Notes}
                  onChangeText={(text) => {
                    setCheckedListData({...checkedListData, Notes: text});
                  }}
                />
                {IsError ? (
                  <Text
                    style={{color: 'red', fontWeight: '600', marginBottom: 15}}>
                    {AppTextData.txt_Please_give_Abnormality_Notes}
                    {/* Please give Abnormality Notes */}
                  </Text>
                ) : null}
              </>
            ) : null}
          </View>
        </ScrollView>

        <View
          style={{
            backgroundColor: 'white',
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            justifyContent: 'space-evenly',
          }}>
          {params.ServiceType == 2 && (
            <View
              style={{
                flex: 2,
                backgroundColor: 'white',
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  backgroundColor: CmmsColors.logoBottomGreen,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: 5,
                  marginEnd: 5,
                }}
                onPress={() =>
                  navigation.navigate('ActivityDetails', {
                    JoId: params.JOID,
                    SeId: TechnicianID,
                    updateActList,
                    isCheckList: true,
                    ActivityList: checkedListData?.ActivityList,
                  })
                }>
                <CmmsText style={{color: '#ffffff', textAlign: 'center'}}>
                  Activities{' '}
                  <CmmsText>{`(${Number(
                    checkedListData?.ActivityList?.length || 0,
                  )})`}</CmmsText>
                </CmmsText>
                {/* <CmmsText
										style={{ color: '#ffffff', textAlign: 'center',fontSize:12,fontWeight:'bold' }}
										>({JobOrderReportData.AdditionalActivityDtls.length})</CmmsText> */}
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: CmmsColors.logoBottomGreen,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: 5,
                  marginEnd: 5,
                }}
                onPress={() =>
                  navigation.navigate('AdditionalSpareParts', {
                    JoId: params.JOID,
                    SeId: TechnicianID,
                    updateSpareParts,
                    isCheckList: true,
                    SparePartsList: checkedListData.SparePartsList,
                    AssetRegID: selectedAsset.AssetRegID,
                    AssetCode: selectedAsset.AssetCode,
                  })
                }>
                <CmmsText style={{color: '#ffffff', textAlign: 'center'}}>
                  Spareparts{' '}
                  <CmmsText>{`(${Number(
                    checkedListData?.SparePartsList?.length || 0,
                  )})`}</CmmsText>
                </CmmsText>
                {/* <CmmsText
										style={{ color: '#ffffff', textAlign: 'center',fontSize:12,fontWeight:'bold' }}
										>({JobOrderReportData.AdditionalSparePartsDtls.length})</CmmsText> */}
              </TouchableOpacity>
            </View>
          )}
          {/* Save Button */}

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: CmmsColors.logoBottomGreen,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 8,
              borderRadius: 5,
            }}
            disabled={!savebuttonEnable}
            onPress={() => 
               {IsReadingTrueValueEnteredOrNot()&&
                saveCheckListData();
                IsReadingTrueValueEnteredOrNot()&&setSavebuttonEnable(false);
              }
            }>
            <CmmsText style={{color: '#ffffff', textAlign: 'center'}}>
              {savebuttonEnable? AppTextData.txt_Save:AppTextData.txt_saving+'...'}
            </CmmsText>
            {/* <CmmsText
										style={{ color: '#ffffff', textAlign: 'center',fontSize:12,fontWeight:'bold' }}
										>({JobOrderReportData.AdditionalSparePartsDtls.length})</CmmsText> */}
          </TouchableOpacity>
        </View>
      </View>
    );
  }


async function checklistDataAnalysing(data,userInput,index){
// console.log('all data from that index-->>>',data)
// console.log('user inserted data-->>',userInput, 'index is -->>',index)
// const NewArray=[...machineMinMaxValue]
// NewArray[0]=data
// setMachineMinMaxValue(data)
// console.log('new array after the push',NewArray)


const aboveorBelow = checkedListData.CheckListGroups.flatMap(e=>e.ChecklistItems.filter(
  (item) => {return(item.Remarks!=""&& item.IsReading == true && ((Number(item.Remarks)<item.MinValue) || (Number(item.Remarks)>item.MaxValue)))
  }))
  // const correct = checkedListData.CheckListGroups.flatMap(e=>e.ChecklistItems.filter(
  //   (item) => (item.Remarks!=""&&item.IsReading == true && ((Number(item.Remarks)>=item.MinValue) && (Number(item.Remarks)<=item.MaxValue)))
  //   )).filter(e=>e.length)
    // (Number(item.Remarks)<=item.MinValue||Number(item.Remarks)>=item.MaxValue))
    // )).filter(e=>e.length)

    console.log('aboveorBelow--->',aboveorBelow)
    // console.log('correct--->',correct)
if(aboveorBelow?.length>0){
    const text= [{String:aboveorBelow.map(item => item.Item+'('+item.MinValue.toString()+'-' + item.MaxValue.toString()+') : '+ item.Remarks).join(', ')}];
    // console.log('item is heree=>',text)
  // console.error('inside the 1st if')
    setCheckedListData((checkedListData) => ({
                              ...checkedListData,
                              IsWorkingFine: true,
                              Notes:text[0]?.String
                            }));
                            // setCheckedListData({...checkedListData, Notes: text});
}else if(aboveorBelow?.length==0){
  // console.error('inside the 2nd if')
  setCheckedListData((checkedListData) => ({
    ...checkedListData,
    IsWorkingFine: false,
    Notes:checkedListData.Notes
  }));
}

}

  function getchecklist(AssetRegID) {
    console.log(
      'getchecklist api call params--->>>?',
      params.JOID,
      TechnicianID,
      AssetRegID,
    );
    dispatch(actionSetLoading(true));
    requestWithEndUrl(
      `${API_TECHNICIAN}getchecklist?JOID=${params.JOID}&SEID=${TechnicianID}&AssetRegID=${AssetRegID}`,
    )
      .then((res) => {
        if (res.status != 200) throw Error(res.statusText);
        else if (res.data != null) {
          setCheckedListData(res.data);
          console.log(
            'what is the checklist condition--->>>',
            res?.data?.CheckListGroups.length>0,
          );
        }
        else setCheckedListData({});
        dispatch(actionSetLoading(false));
      })
      .catch(function (error) {
        console.log('SparepartsRequired Error: ', error);
        dispatch(actionSetLoading(false));
        setCheckedListData({});
      });
  }

  function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  }
function IsReadingTrueValueEnteredOrNot(){
  if(checkedListData.CheckListGroups.flatMap(e=>e.ChecklistItems.filter(
    (item) => (item.Remarks=="" && item.IsReading == true)
    )).length>0)
    {
      dispatch(
        actionSetAlertPopUpTwo({
          title: AppTextData.txt_Alert,
          body: 'You must enter the values',
          visible: true,
          type: 'ok',
        }),
      );
      return false
    }
    else{
      return true
    }
}
//saving checklist

  function saveCheckListData() {
    //http://213.136.84.57:2256/api/ApkTechnician/savechecklist
    // dispatch(actionSetLoading(true));
    const fromDate = parse(
      checkedListData.FromDate,
      'dd/MM/yyyy hh:mma',
      new Date(),
    );
    const toDate = parse(
      checkedListData.ToDate,
      'dd/MM/yyyy hh:mma',
      new Date(),
    );

    let checkedListDataToSave = {
      ...checkedListData,
      Attachments: newAttachmentFileList,
      SEID: TechnicianID,
      JOID: params.JOID,
      FromDate: +fromDate,
      ToDate: +toDate,
      Notes:
        checkedListData?.IsWorkingFine == true ? checkedListData.Notes : '',
    };
    // console.log('checkedListDataToSave', {checkedListDataToSave});
    // console.log('abnormality value-->>', checkedListDataToSave?.IsWorkingFine);
    // console.log('abnormality Notes-->>', checkedListDataToSave?.Notes);
    if (
      checkedListDataToSave.IsWorkingFine == true &&
      checkedListDataToSave?.Notes == ''
    ) {
      setIsError(true);
    } else {
      setIsError(false);
      dispatch(actionSetLoading(true));
      // let checkedListDataToSaveString = JSON.stringify(checkedListDataToSave, function(key, val) {
      // 	if (val != null && typeof val == "object") {
      // 		 if (seen.indexOf(val) >= 0) {
      // 			 return;
      // 		 }
      // 		 seen.push(val);
      // 	 }
      // 	 return val;
      //  });
      // 	console.log("checkedListDataToSaveString",checkedListDataToSaveString)
      // bodyFormData.append(checkedListData,checkedListDataToSaveString)
      // console.log("saveCheckListData",{bodyFormData})

      requestWithEndUrl(
        `${API_TECHNICIAN}savechecklist`,
        checkedListDataToSave,
        'POST',
        // { 'Content-Type': 'multipart/form-data' }
        //   { "contentType": "false" }
      )
        .then((res) => {
          console.log('savechecklist', {res});
          if (res.status != 200) {
            throw Error(res.data);
          }
          return res.data;
        })
        .then((data) => {
          setSavebuttonEnable(true)
          if (data) {
            if (data.isSucess) {

              assetList.forEach((asset) => {
                if (asset.AssetRegID == selectedAsset.AssetRegID) {
                  asset.Status = 1;
                }
              });
              setCheckedListData({
                ...checkedListData,
                CheckListID: data.CheckListID,
              });
              if (newAttachmentFileList.length > 0) {
                // save attachment file list
                saveCheckListAttachments(data.CheckListID);
              } else {
                dispatch(actionSetLoading(false));
                // alert(data.Message);
                dispatch(
                  actionSetAlertPopUpTwo({
                    title: AppTextData.txt_Alert,
                    body: AppTextData.txt_Saved_successfully,
                    visible: true,
                    type: 'ok',
                  }),
                );
                Keyboard.dismiss();
                navigation.goBack();
              }
            } else {
              dispatch(actionSetLoading(false));
              // alert(data.Message);
              dispatch(
                actionSetAlertPopUpTwo({
                  title: AppTextData.txt_Alert,
                  body: AppTextData.txt_somthing_wrong_try_again,
                  visible: true,
                  type: 'ok',
                }),
              );
            }
          }
        })
        .catch((e) => {
          setSavebuttonEnable(true)
          dispatch(actionSetLoading(false));
          // alert(AppTextData.txt_somthing_wrong_try_again);
          dispatch(
            actionSetAlertPopUpTwo({
              title: AppTextData.txt_Alert,
              body: AppTextData.txt_somthing_wrong_try_again,
              visible: true,
              type: 'ok',
            }),
          );
          console.error('savechecklist', e);
        });
    }
  }

  function saveCheckListAttachments(checkListId) {
    // http://213.136.84.57:2256/api/ApkTechnician/savechecklistattachments
    let bodyFormData = new FormData();
    bodyFormData.append('', checkListId);
    newAttachmentFileList.forEach((Attachment) => {
      console.log('savechecklistattachments', {Attachment});
      bodyFormData.append('', Attachment);
    });

    requestWithEndUrl(
      `${API_TECHNICIAN}savechecklistattachments`,
      bodyFormData,
      'POST',
      {'Content-Type': 'multipart/form-data'},
    )
      .then((res) => {
        console.log('savechecklistattachments', {res});
        if (res.status != 200) {
          throw Error(res.data);
        }
        return res.data;
      })
      .then((data) => {
        console.log(data);
        if (data && data.length > 0) {
          setnewAttachmentFileList([]);
          setCheckedListData((checkedListData) => ({
            ...checkedListData,
            Attachments: data,
          }));
          // alert(
          //   AppTextData.txt_Checklist_saved_successfully,
          // );
          dispatch(
            actionSetAlertPopUpTwo({
              title: AppTextData.txt_Alert,
              body: AppTextData.txt_Checklist_saved_successfully,
              visible: true,
              type: 'ok',
            }),
          );
        } else {
          // Alert.alert(
          //   AppTextData.txt_Something_went_wrong,
          //   AppTextData.txt_technical_difficulties_contact_the_server_administarator,
          // );
          dispatch(
            actionSetAlertPopUpTwo({
              title: AppTextData.txt_Alert,
              body:
                AppTextData.txt_Something_went_wrong +
                ', ' +
                AppTextData.txt_technical_difficulties_contact_the_server_administarator,
              visible: true,
              type: 'ok',
            }),
          );
          console.error('error in updated attachments');
        }
        dispatch(actionSetLoading(false));
      })
      .catch((err) => {
        console.error('save attachments Error: ', err);
        Alert.alert(
          // 'Upload Error',
          //vbn lang
          AppTextData.txt_Upload_Error,
          AppTextData.txt_Attachments_could_not_be_uploaded,
          // 'Attachments could not be uploaded for some reason, Plase click ok to try again',
          [
            {
              text: AppTextData.txt_cancel,
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: AppTextData.txt_OK,
              onPress: () => {
                console.log('OK Pressed');
                saveCheckListAttachments(checkListId);
              },
            },
          ],
        );
      });
  }
};

const styles = StyleSheet.create({
  assetCodeSearchField: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'sans-serif-condensed',
    fontWeight: 'bold',
    marginHorizontal: 8,
    // padding: 8,
    // paddingLeft: 20,
    // paddingRight: 20,
    // borderRadius: 20,
    borderColor: '#888888',
    fontSize: 14,
    height: 50,
  },
  mainContainer: {
    position: 'relative',
    marginHorizontal: 8,
  },

  input: {
    fontSize: 16,
    marginStart: 5,
    // padding: 8
    // width: "90%",
  },

  listItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginTop: 1,
    flex: 1,
    // borderWidth: 1,
    fontSize: 16,
    padding: 8,
  },
  endContainer: {
    position: 'absolute',
  },
});
