import React, { useEffect, useRef, useState, useLayoutEffect, useMemo } from 'react';
import {
	SafeAreaView,
	TextInput,
	Text,
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
	TouchableHighlight
} from 'react-native';
import CmmsColors from '../../common/CmmsColors';
import { CmmsText, CText, CTextTitle } from '../../common/components/CmmsText';
import SearchBar from '../components/SearchBar';
import Icon from 'react-native-vector-icons/FontAwesome';
import requestWithEndUrl from '../../network/request';
import { useSelector, useDispatch } from 'react-redux';
import { API_ASSET_PATH, API_TECHNICIAN, BASE_IP } from '../../network/api_constants';
import { Autocomplete, withKeyboardAwareScrollView } from 'react-native-dropdown-autocomplete';
import SearchComponent from '../../common/components/SearchComponent';
import { Dialog } from 'react-native-simple-dialogs';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import FromToTimePicker from '../supervisor/job_oder/components/FromToTimePicker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { actionSetLoading } from '../../action/ActionSettings';
import FromToDatePicker from '../supervisor/job_oder/components/FromToDatePicker';//'../components/FromToDatePicker'
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import DynamicSearchBar from './components/DynamicSearchBar';
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import AssetInfoPopUp from '../components/AssetInfoPopUp';
import PhotoEditor from 'react-native-photo-editor';
import RNGRP from 'react-native-get-real-path';

export const deviceWidth = Dimensions.get('window').width;

export default ({ navigation, route: { params } }) => {
	const assetIpRef = useRef();
	
const dispatch = useDispatch();
const [ imageURI, setImage ] = useState(null);
const { AppTextData } = useSelector((state) => state.AppTextViewReducer);

	console.log('CheckListPage', { params });
	const [ searchText, setSearchText ] = useState('');
	
	const [ visibleAttachments, setVisibleAttachments ] = useState(false);
	const [ assetList, setAssetList ] = useState([
		// {
		// 	AssetRegID: 3094,
		// 	Asset: 'S&S L-H6  PANINI',
		// 	AssetCode: 'S&S L-H6'
		// },
		
	]);
	// const [ filterAssetList, setFilterAssetList ] = useState([]);
	const [ checkedListData, setCheckedListData ] = useState(undefined);

	const [visibleAssetInfoPopUp, setVisibleAssetInfoPopUp] = useState(false);
	const [ selectedAsset, setSelectedAsset ] = useState(undefined);
	console.log({selectedAsset})
	const [assetInfo,setAssetInfo] = useState(undefined)
	const [newAttachmentFileList, setnewAttachmentFileList] = useState([]);

	const { loggedUser: { TechnicianID, TechnicianName } } = useSelector((state) => state.LoginReducer);

	const [dateTimePickerData, setDateTimePickerData] = useState({showTimePicker:false,where:'date'});
	console.log({ checkedListData });
	
	const updateActList = (ActivityList=[]) => setCheckedListData(checkedListData=>({...checkedListData,ActivityList}))

	const [selectedDate,setSelectedDate] = useState(new Date())

	const updateSpareParts = (SparePartsList=[]) =>{
		console.log("updateSpareParts",{SparePartsList})
		setCheckedListData(checkedListData=>({...checkedListData,SparePartsList}))
	}

	const toggleSwitch = () => setCheckedListData(checkedListData=>({...checkedListData,IsWorkingFine:!checkedListData.IsWorkingFine}));

	const checkForCameraRollPermission = async () => {
		console.log('CAMERA', 'start');
		try {
		   const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
			  title: 'App Camera Permission',
			  message: 'App needs access to your camera ',
			  buttonNeutral: 'Ask Me Later',
			  buttonNegative: 'Cancel',
			  buttonPositive: 'OK'
		   });

		   if (granted === PermissionsAndroid.RESULTS.GRANTED) {
			console.log("Camera permission given");
			launchCamera(
				{
				   saveToPhotos: true,
				   mediaType: 'photo',//'photo' | 'video' | 'mixed'
				   includeBase64: false,
				  //  durationLimit:
				},
				({assets,errorCode,didCancel})=>{
				  console.log("checkForCameraRollPermission",{errorCode,didCancel})
				  
				  if(!didCancel && !errorCode) //setnewAttachmentBasedOnFormDataImage(assets[0],'CR')
				  {
					RNGRP.getRealPathFromURI(assets[0].uri).then((path) => {
					PhotoEditor.Edit({
						path: path,
						// RNFS.readFile(path, 'base64').then(imageBase64 =>
						//   this.props.actions.sendImageAsBase64(imageBase64)
						// )
						onDone: (imagePath) => {
							setnewAttachmentBasedOnFormDataImage(assets[0],"GR")
						},
						hiddenControls: [ 'save' ]
					});
				}); 
			}
				}
			 );
		  } else {
			console.log("Camera permission denied");
			alert("Camera permission denied")
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
				 selectionLimit:1,
			  },
			  ({assets,errorCode,didCancel})=>{
				console.log("checkForGalleryPermission",{assets,errorCode,didCancel})
				if(!didCancel && !errorCode){
					RNGRP.getRealPathFromURI(assets[0].uri).then((path) => {
					PhotoEditor.Edit({
						path: path,
						// RNFS.readFile(path, 'base64').then(imageBase64 =>
						//   this.props.actions.sendImageAsBase64(imageBase64)
						// )
						onDone: (imagePath) => {
							setnewAttachmentBasedOnFormDataImage(assets[0],"GR")
						},
						hiddenControls: [ 'save' ]
					});
				}); 
			}
			//   setnewAttachmentFileList(newAttachmentFileList=>[...newAttachmentFileList,img.assets[0]])
			  }
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

	 function setnewAttachmentBasedOnFormDataImage({uri,type,fileName},where){
		console.log({fileName});
		setnewAttachmentFileList(newAttachmentFileList=>[...newAttachmentFileList,{
			uri, //this.state.uri[0].uri, == image path file:///storage/emulated/0/Pictures/1511787860629.jpg
			type,
			name: `cmms_${where}_attachment_${newAttachmentFileList.length}_${fileName.split('_')[5]}`
			// size: newImageFile.size
		}])
	 }
	
	useEffect(() => {
		dispatch(actionSetLoading(true))
		// http://213.136.84.57:2256/api/ApkTechnician/getchecklistassetlist?JOID=3157&SEID=3
		requestWithEndUrl(`${API_TECHNICIAN}getchecklistassetlist`,{JOID:params.JOID,SEID:TechnicianID})
			.then((res) => {
				console.log("getchecklistassetlist",{res})
				if (res.status != 200) throw Error(res.statusText);
				else if (res.data ) {
					var assetDumList = res.data
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
					dispatch(actionSetLoading(false))
					if(assetDumList.length==1){
						setSelectedAsset(assetDumList[0])
						return
					}
					
					
				}
				
			})
			.catch(function(error) {
		dispatch(actionSetLoading(false))
		// alert(AppTextData.)
				console.log('SparepartsRequired Error: ', error);
			});
	}, []);

	useEffect(() => {
		if(checkedListData&&newAttachmentFileList.length>0){
			setCheckedListData(checkedListData=>({...checkedListData,
				Attachments:[...checkedListData?.Attachments,
					{AttachmentUrl:newAttachmentFileList[newAttachmentFileList.length-1].uri}
					// ...newAttachmentFileList.map(newAttachment=>{
					// 	console.log("newAttachment",{newAttachment})
					// 	return ({id:Date.now(),AttachmentUrl:newAttachment.assets[0].uri})
					// }
					// 	)
					]}))
		}
	}, [newAttachmentFileList]);

	useEffect(() => {
		if(selectedAsset){
		// setshowAssetDropdownList(false);
		setnewAttachmentFileList([])
		setCheckedListData(undefined)
		setAssetInfo(undefined)
		setSearchText(selectedAsset.Asset)
		getchecklist(selectedAsset.AssetRegID)
		}
	}, [selectedAsset]);

	return (
		<SafeAreaView style={{ flex: 1,padding:8 }}>
			<DynamicSearchBar searchFilterList={assetList
				// [
				// {
				// 		AssetRegID: 3094,
				// 		Asset: 'S&S L-H6  PANINI',
				// 		AssetCode: 'S&S L-H6'
				// 	}
				// ]
			} 
			visibleSearchView={assetList.length>1}
			visibleDrawerRightIcon = {true} 
			onDrawableRightPress={(selectedItem)=>{
				console.log("onDrawableRightPress",selectedItem);
				setVisibleAssetInfoPopUp(true)
				// getAssetInfo(selectedItem.AssetRegID)
			}}
			isSetSearchText={true}
			onItemSelected={(item)=>setSelectedAsset(item)}
			dispatch={dispatch}
			/>
			
			{(selectedAsset && checkedListData && checkedListData.CheckListGroups?.length>0 )&& showCheckListView()}

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
          value={selectedDate}
          mode='time'//{dateTimePickerData.where=='date'?'date':'time'}
          // is24Hour={true}
          minimumDate={new Date()}
          display="default"
		  
          onChange={(e,date)=>{
			// setDateTimePickerData({...dateTimePickerData,showTimePicker:false})
			dateTimePickerData.showTimePicker = false

			console.log("CHK_ONDATE",+date)

			console.log("CHK_ONDATE",date)
			if(date){
			switch(dateTimePickerData.where){
				case 'date':
					setSelectedDate(date)
					break;
					case 'fromTime':
						setCheckedListData({...checkedListData,FromDate:+date})
						break;
						case 'toTime':
							setCheckedListData({...checkedListData,ToDate:+date})
							break;
							default: break;
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

	async function getAssetInfo(AssetRegID){
		console.log("getAssetInfo",{AssetRegID});
		//http://localhost:29189/api/ApkTechnician/getassetinformation?AssetRegID=2988
		dispatch(actionSetLoading(true))
		try{
		const assetInfoData = await requestWithEndUrl(`${API_TECHNICIAN}getassetinformation`,{AssetRegID})
		console.log("getAssetInfo",{assetInfoData})

		if(assetInfoData.data && assetInfoData.data.AssetName ){
			console.log("getAssetInfo",{data:assetInfoData.data})
			// if(AssetRegID)
			setVisibleAssetInfoPopUp(true)
			setAssetInfo(assetInfoData.data)
		} else{
			alert("Invalid Asset Information")
		}
		dispatch(actionSetLoading(false))

		} catch(e){
			console.error("getAssetInfo",e)
			dispatch(actionSetLoading(false))
		}
		
		
	}

	function showCheckListView() {
		return (
			<View style={{ flex: 1,marginVertical:8}}>
				<View
			style={{height:50,
				flexDirection:'row',
				paddingHorizontal:8,
				backgroundColor:'white',alignItems:'center'}}
			>
				<CmmsText
				style={{flex:1,fontWeight:'bold',height:40,padding:4,textAlignVertical:'center'}}
				onPress={()=>{
					// setDateTimePickerData({...dateTimePickerData,showTimePicker:true})
					// setshowDp(true)
				}}
				>{format(checkedListData?.ToDate!=0?new Date(checkedListData?.ToDate):new Date(), 'dd/MM/yyyy')}</CmmsText>
				<View
				style={{
					flex:1,
					flexDirection:'row',
					justifyContent:'space-around'}}
				>
				<CmmsText
				style={{fontWeight:'bold',height:40,padding:4,textAlignVertical:'center',marginEnd:10}}
				onPress={()=>{
					setDateTimePickerData({showTimePicker:true,where:'fromTime'})
				}}	
				>From: {format(new Date(checkedListData?.FromDate||0), 'hh:mm a')}</CmmsText>
				<CmmsText
				style={{marginHorizontal:20,fontWeight:'bold',height:40,padding:4,textAlignVertical:'center'}}
				onPress={()=>{
					setDateTimePickerData({showTimePicker:true,where:'toTime'})
				}}	
				>To: {format(new Date(checkedListData?.ToDate||0), 'hh:mm a')}</CmmsText>
				</View>

			{/* <FromToDatePicker
			mode='time'
          fromDate={new Date()}
          toDate={new Date()} 
          onDateChange={(fromDate,toDate)=>onDateChange(fromDate,toDate)}/> */}
		  </View>
				<ScrollView 
				contentContainerStyle={{flexGrow:1}}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps='handled'
				keyboardDismissMode='none'
				>
					{checkedListData.CheckListGroups?.map((CheckListGroup) => {
						return (
							<View style={{ backgroundColor: 'white', marginTop: 2, padding: 8 }}>
								<CTextTitle style={{ color: 'black' }}>{CheckListGroup.Group}</CTextTitle>
								<FlatList
									showsVerticalScrollIndicator={false}
									keyboardShouldPersistTaps='handled'
									keyboardDismissMode='none'
									keyExtractor={(item, index) => index.toString()}
									// ItemSeparatorComponent={({item,index})=><View style={[{ backgroundColor: 'red', flex: 1 }, index%2==0 ? { marginRight: 10 } : { marginLeft: 10 } ]}/>}
									data={CheckListGroup.ChecklistItems}
									renderItem={({ item, index }) => (
										<View
											style={{
												minHeight: 100,
												padding: 4,
												marginTop:1
											}}
										>
											<CText style={{ color: 'black' }}>
												{index + 1}. {item.Item}
											</CText>
											<View
												style={{
													flexDirection: 'row',
													justifyContent: 'space-evenly',
													marginTop: 5
												}}
											>
												<TouchableOpacity
													style={{
														flexDirection: 'row',
														margin: 4,
														padding: 4,
														alignItems: 'center',
														justifyContent: 'center'
													}}
													onPress={() => {
														CheckListGroup.ChecklistItems.forEach((element, index) => {
															if (
																item.GroupID == element.GroupID &&
																item.ItemID == element.ItemID
															) {
																element.IsNA = !element.IsNA;
																if (element.IsNA) element.IsComplete = false;
															}
														});
														setCheckedListData({ ...checkedListData });
													}}
												>
													<Icon
														name={item.IsNA ? 'check-square-o' : 'square-o'}
														size={18}
														color="black"
													/>
													<CmmsText style={{ marginHorizontal: 4 }}>NA</CmmsText>
												</TouchableOpacity>
												<TouchableOpacity
													style={{
														flexDirection: 'row',
														margin: 4,
														padding: 4,
														alignItems: 'center',
														justifyContent: 'center'
													}}
													onPress={() => {
														CheckListGroup.ChecklistItems.forEach((element, index) => {
															if (
																item.GroupID == element.GroupID &&
																item.ItemID == element.ItemID
															) {
																element.IsComplete = !element.IsComplete;
																if (element.IsComplete) element.IsNA = false;
															}
														});
														setCheckedListData({ ...checkedListData });
													}}
												>
													<Icon
														name={item.IsComplete ? 'check-square-o' : 'square-o'}
														size={18}
														color="black"
													/>
													<CmmsText style={{ marginHorizontal: 4 }}>Complete</CmmsText>
												</TouchableOpacity>
											</View>

											<TextInput
												style={{
													borderWidth: 1,
													minHeight: 30,
													padding: 8,
													textAlignVertical: 'top',
													borderRadius: 5,
													marginTop: 5,
													textAlign: 'justify'
												}}
												multiline={true}
												keyboardType='default'
												value={item.Remarks}
												onChangeText={(remarks) => {
													CheckListGroup.ChecklistItems.forEach((element, index) => {
														if (
															item.GroupID == element.GroupID &&
															item.ItemID == element.ItemID
														) {
															element.Remarks = remarks;
														}
													});
													setCheckedListData({ ...checkedListData });
												}}
												placeholder="Remarks"
											/>
										</View>
									)}
								/>
							</View>
						);
					})}
					
				<View
					style={{
						padding: 8,
						backgroundColor: 'white'
					}}
				>
					{visibleAttachments && (
						<FlatList
							horizontal
							showsHorizontalScrollIndicator={false}
							data={checkedListData?.Attachments||[]}
							keyExtractor={(item, index) => index.toString()}
							renderItem={({item,index}) =>{ 
								//{"id":1,"AttachmentUrl":Image/JOCheckList/sample.jpg"}
								console.log("AttachmentUrl",{item})
								return(
								<Image
									style={{ width: 100, height: 100, marginEnd: 5 }}
									source={{
										uri:item.AttachmentUrl.startsWith("file")?item.AttachmentUrl:`${BASE_IP}/${item.AttachmentUrl}` 
											// 'https://lh3.googleusercontent.com/ogw/ADea4I7C4Br9kp5-3kTvGkUBpmpUmgtCTUOQdUlh5vX9=s32-c-mo'
									}}
									defaultSource={require('../../assets/placeholders/no_image.png')}
								/>
							)
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
										flexDirection:'row'
									}}

								>
									{/* <Icon style={{position:'absolute',end:0,top:0,start:0,bottom:0}} name="plus" size={90} color={CmmsColors.logoBottomGreen} /> */}
									<TouchableOpacity
									style={{position:'absolute',start:16,bottom:16}}
									onPress={()=>checkForGalleryPermission()}
									>
									<Icon name="picture-o" size={24} color={CmmsColors.logoBottomGreen} />
									</TouchableOpacity>
									<TouchableOpacity
									style={{position:'absolute',end:16,top:16}}
									onPress={()=>checkForCameraRollPermission()}
									>
									<Icon name="camera" size={24} color={CmmsColors.logoBottomGreen} />
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
							alignItems: 'center'
						}}
					>
						<CTextTitle style={{ marginHorizontal: 4, color: 'black' }}>Problem Encountered</CTextTitle>

						<Switch
							trackColor={{ false: '#767577', true: '#81b0ff' }}
							thumbColor={checkedListData?.IsWorkingFine ? CmmsColors.logoBottomGreen : '#f4f3f4'}
							ios_backgroundColor="#3e3e3e"
							onValueChange={toggleSwitch}
							value={checkedListData?.IsWorkingFine}
						/>
						<CTextTitle style={{ marginHorizontal: 4, color: 'black' }}>Working Fine</CTextTitle>
						<TouchableOpacity
							style={{
								position: 'absolute',

								top: 0,
								end: 0,
								padding: 4
							}}
							onPress={() => setVisibleAttachments((visibleAttachments) => !visibleAttachments)}
						>
							<Icon name="paperclip" size={28} color="grey" />
						</TouchableOpacity>
					</View>

					<TextInput
						style={{
							borderWidth: 1,
							minHeight: 100,
							padding: 8,
							textAlignVertical: 'top',
							borderRadius: 5,
							marginTop: 5,
							textAlign: 'justify'
						}}
						multiline={true}
						placeholder="Notes"
						value={checkedListData.Notes}
						onChangeText={(text)=>{
							setCheckedListData({...checkedListData,Notes:text})
						}}
					/>
				</View>
				</ScrollView>

				<View
					style={{
						backgroundColor: 'white',
						flexDirection: 'row',
						alignItems: 'center',
						padding: 8,
						justifyContent: 'space-evenly'
					}}
				>
					{params.ServiceType == 2&&<View
					style={{
						flex:2,
						backgroundColor: 'white',
						flexDirection: 'row',}}
					>
					<TouchableOpacity
						style={{
							flex: 1,
							flexDirection: 'column',
							backgroundColor: CmmsColors.logoBottomGreen,
							justifyContent: 'center',
							alignItems: 'center',
							padding: 8,
							borderRadius: 5,
							marginEnd: 5
						}}
						onPress={() =>
							navigation.navigate('ActivityDetails', {
								JoId: params.JOID,
								SeId: TechnicianID,
								updateActList,
								isCheckList:true,
								ActivityList: checkedListData?.ActivityList
							})
						}
					>
						<CmmsText style={{ color: '#ffffff', textAlign: 'center' }}>Activities <CmmsText>{`(${Number(checkedListData?.ActivityList?.length || 0)})`}</CmmsText></CmmsText>
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
							marginEnd: 5
						}}
						onPress={() =>
							navigation.navigate('AdditionalSpareParts', {
								JoId: params.JOID,
								SeId: TechnicianID,
								updateSpareParts,
								isCheckList:true,
								SparePartsList:checkedListData.SparePartsList,
								AssetRegID:selectedAsset.AssetRegID,
								AssetCode:selectedAsset.AssetCode
							})}
					>
						<CmmsText style={{ color: '#ffffff', textAlign: 'center' }}>Spareparts <CmmsText>{`(${Number(checkedListData?.SparePartsList?.length || 0)})`}</CmmsText></CmmsText>
						{/* <CmmsText
										style={{ color: '#ffffff', textAlign: 'center',fontSize:12,fontWeight:'bold' }}
										>({JobOrderReportData.AdditionalSparePartsDtls.length})</CmmsText> */}
					</TouchableOpacity>
					</View>}
					<TouchableOpacity
						style={{
							flex: 1,
							backgroundColor: CmmsColors.logoBottomGreen,
							justifyContent: 'center',
							alignItems: 'center',
							padding: 8,
							borderRadius: 5
						}}
						onPress={() =>saveCheckListData()}
					>
						<CmmsText style={{ color: '#ffffff', textAlign: 'center' }}>Save</CmmsText>
						{/* <CmmsText
										style={{ color: '#ffffff', textAlign: 'center',fontSize:12,fontWeight:'bold' }}
										>({JobOrderReportData.AdditionalSparePartsDtls.length})</CmmsText> */}
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	function getchecklist(AssetRegID){
		dispatch(actionSetLoading(true))
		requestWithEndUrl(`${API_TECHNICIAN}getchecklist?JOID=${params.JOID}&SEID=${TechnicianID}&AssetRegID=${AssetRegID}`)
			.then((res) => {
				if (res.status != 200) throw Error(res.statusText);
				else if (res.data != null) setCheckedListData(res.data);
				else setCheckedListData({});
				dispatch(actionSetLoading(false))

			})
			.catch(function(error) {
				console.log('SparepartsRequired Error: ', error);
				dispatch(actionSetLoading(false))
				setCheckedListData({});
			});
	}

	 function getCircularReplacer(){
		const seen = new WeakSet();
		return (key, value) => {
		if (typeof value === "object" && value !== null) {
			if (seen.has(value)) {
				return;
			}
			seen.add(value);
		}
		return value;
		};
	};

	 function saveCheckListData(){
		//http://213.136.84.57:2256/api/ApkTechnician/savechecklist
		dispatch(actionSetLoading(true))
		
		let checkedListDataToSave = {...checkedListData,
			Attachments:newAttachmentFileList,SEID:TechnicianID,
			JOID:params.JOID}
			console.log("checkedListDataToSave",{checkedListDataToSave})
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
				console.log('savechecklist', { res });
				if (res.status != 200) {
					throw Error(res.data);
				}
				return res.data;
			})
			.then((data) => {
				
				console.log("Checklist saved",{data})
				if(data){
					if(data.isSucess){
					assetList.forEach(asset=>{
						if(asset.AssetRegID==selectedAsset.AssetRegID){
							asset.Status = 1;
						}
					})
					setCheckedListData({...checkedListData,CheckListID:data.CheckListID})
					if(newAttachmentFileList.length>0){
						// save attachment file list
						saveCheckListAttachments(data.CheckListID)
					} else{
						dispatch(actionSetLoading(false))
						alert(data.Message)
					}
				}else{
					dispatch(actionSetLoading(false))
					alert(data.Message)
				}
				}

			})
			.catch(e=>{
				dispatch(actionSetLoading(false))
				alert(AppTextData.txt_somthing_wrong_try_again)
				console.error("savechecklist",e)
			})
	 }

	 function saveCheckListAttachments(checkListId){
		// http://213.136.84.57:2256/api/ApkTechnician/savechecklistattachments
		let bodyFormData = new FormData();
		bodyFormData.append("",checkListId)
		newAttachmentFileList.forEach(Attachment=>{
			console.log("savechecklistattachments",{Attachment})
			bodyFormData.append("",Attachment)
		})

		requestWithEndUrl(`${API_TECHNICIAN}savechecklistattachments`,bodyFormData,'POST',{ 'Content-Type': 'multipart/form-data' })
		.then((res) => {
			console.log('savechecklistattachments', { res });
			if (res.status != 200) {
				throw Error(res.data);
			}
			return res.data;
		})
		.then((data) => {
			console.log(data)
			if(data && data.length>0){
				setnewAttachmentFileList([])
				setCheckedListData(checkedListData=>({...checkedListData,
				Attachments:data}))
				alert("Checklist saved successfully")
			} else{
				Alert.alert(AppTextData.txt_Something_went_wrong,"We're experiencing technical difficulties, Please contact the server administarator. ")
				console.error("error in updated attachments")
			}
			dispatch(actionSetLoading(false))
		})
		.catch(err=>{
			console.error("save attachments Error: ",err)
			Alert.alert("Upload Error","Attachments could not be uploaded for some reason, Plase click ok to try again",[
				{
					text: 'CANCEL',
					onPress: () => console.log('Cancel Pressed'),
					style: 'cancel'
				  },
				  {
					text: 'OK', onPress: () => {
					  console.log('OK Pressed')
					  saveCheckListAttachments(checkListId)
					}
					  
					}
			])

		})

	 }
	 
};

const styles = StyleSheet.create({
	assetCodeSearchField: {
		flex: 1,
		fontSize:16,
        fontFamily: 'sans-serif-condensed',
        fontWeight: 'bold',
		marginHorizontal:8,
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
		marginHorizontal: 8
	},
	

	input: {
		fontSize: 16,
		marginStart: 5
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
		padding: 8
	},
	endContainer: {
		position: 'absolute'
	}
});
