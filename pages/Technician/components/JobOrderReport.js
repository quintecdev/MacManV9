import React, { useState, useEffect } from 'react';
import {
	SafeAreaView,
	View,
	Text,
	ImageBackground,
	FlatList,
	StyleSheet,
	TextInput,
	ScrollView,
	
	TouchableOpacity,
	Platform,
	Image
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { compareAsc, format } from 'date-fns';
import requestWithEndUrl from '../../../network/request';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import { actionSetLoading, actionSetRefreshing } from '../../../action/ActionSettings';
import { useSelector, useDispatch } from 'react-redux';
import { API_TECHNICIAN } from '../../../network/api_constants';
import CmmsColors from '../../../common/CmmsColors';
import { Dialog } from 'react-native-simple-dialogs';
import CustomerReview from './CustomerReview';
import Icon from 'react-native-vector-icons/FontAwesome';
import ic_play from '../../../assets/icons/ic_play.png';
import { CmmsText, CTextHint, CTextThin } from '../../../common/components/CmmsText';
import { actionSetJobOrderReport } from '../../../action/ActionJobOrderReport';
import { Picker } from '@react-native-picker/picker';
import CustomerDetailsTexts from './CustomerDetailsTexts';
import RadioForm from 'react-native-simple-radio-button';
import { color } from 'react-native-reanimated';
import JobOrderHeader from './JobOrderHeader';

export const getAssetTypeLabel = (index) => ['Warranty ',
'Contract ',
'Chargeable'][index]

export const getAssetLabel = (AssetSate) => AssetSate!=0 ? ` - ${getAssetTypeLabel(AssetSate-1)}` : '';

export default (JobOrderReport = ({ navigation, route: { params } }) => {
	console.log('JobOrderReport_page', params);
	const { AppTextData } = useSelector((state) => state.AppTextViewReducer);
	const { JobOrderReportData } = useSelector((state) => {
		console.log({ JobOrderReportReducer_state: state.JobOrderReportReducer });
		return state.JobOrderReportReducer;
	});
	console.log({ JobOrderReportData });
	const dispatch = useDispatch();
	// const [ jobOrderReport, SetJobOrderReport ] = useState({});
	const [ visibleReviewDlg, setVisibleReviewDlg ] = useState(false);
	const [ visibleClgwDlg, setVisibleClgDlg ] = useState(false);
	const [ custodianPswd, setCustodianPswd ] = useState('');
    const [reasonList, setReasonList] = useState([])
    // const [selectedDefaultReason,setSelectedDefaultReason] = useState(`${JobOrderReportData.ReasonID}`)

	useEffect(() => {
		console.log('params:', params);
		dispatch(actionSetLoading(true))
		requestWithEndUrl(`${API_TECHNICIAN}GetServiceReportDetailsByJOID`, { SEID: params.SEID, ID: params.JOID })
			.then((response) => {
				// SetJobOrderReport(response.data)
				dispatch(actionSetLoading(false))
				dispatch(
					actionSetJobOrderReport(
						response.data
						//  {...response.data,IsRescheduled:true,ReasonID:2}
					)
				);
			getReasonList()

				// console.log('jobOrderReport ', response.data)
			})
			.catch(function(error) {
				console.log('JobOrderReport Erro: ', error);
			});
	}, []);

	// useEffect(()=>{
	// 	console.log("SUMA")
	// 	if(JobOrderReportData.ReasonID!=0){
	// 		setSelectedDefaultReason(reasonList.filter(rsn=>rsn.ID==JobOrderReportData.ReasonID)[0])
	// 	}
	// },[JobOrderReportData.ReasonID])

	const config = {
		velocityThreshold: 0.3,
		directionalOffsetThreshold: 80
	};

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
			//   if(JobOrderReportData.ReasonID!=0){
			// 			setSelectedDefaultReason(data.filter(rsn=>rsn.ID==JobOrderReportData.ReasonID)[0])
			// 		}
			  // setSelectedReasonId(data[0].ID)
			}
		  })
		  .catch(err => {
			console.error("URL_GetReasons", { err })
		  })
	  }
	return (
		<SafeAreaView style={{ flex: 1 }}>
			{/* <ImageBackground
                style={{
                    flex: 1,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                }}
                source={require('../../../assets/bg/bg_cmms.webp')}
            /> */}
			
			{Object.keys(JobOrderReportData).length > 0 && (
				<ScrollView>
					<View style={{ flex: 1, padding: 8 }}>
						<JobOrderHeader
						JONo={JobOrderReportData.JONo} 
						Date={format(new Date(JobOrderReportData.Date), 'dd/MM/yyyy')} 
						AssetSate={JobOrderReportData.AssetSate} 
						ComplaintType={JobOrderReportData.ComplaintType}
						Customer={JobOrderReportData.Customer}
						Asset={JobOrderReportData.Asset}
						// format={format}
						styles={styles}
						// StyleMainHead={styles.MainHead}
						// StyleSubHead={styles.SubHead}
						/>
						{/* {JobOrderReportData.AssetCode} - {JobOrderReportData.Asset} */}
						{/* <CmmsText style={styles.SubHead}>{AppTextData.txt_Assigned}:{format(new Date(JobOrderReportData.AssignedFrom), 'dd/MM/yyyy')} To:{format(new Date(JobOrderReportData.AssignedTo), 'dd/MM/yyyy')} EMH:{convertMinsToTime(JobOrderReportData.EMHrs)}Hrs</CmmsText> */}

						{/* <View
                                style={{ justifyContent: 'center', marginVertical: 5 }}>
                                <CmmsText style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }}>{AppTextData.txt_Technicians}: </CmmsText> */}
						<FlatList
							data={JobOrderReportData.SEDtls}
							renderItem={({ item, index }) => (
								<CmmsText style={styles.SubHeadBottomList}>
									{' '}
									{item.SE}
									{JobOrderReportData.SEDtls.length > 1 && ','}
								</CmmsText>
							)}
							keyExtractor={(item, index) => index.toString()}
						/>
						{/* </View> */}

						<View
							style={{
								flex: 1,
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'center'
							}}
						>
							<CmmsText
								style={{
									fontWeight: 'bold'
								}}
							>
								{AppTextData.txt_RefNo} :{JobOrderReportData.SRefNo}
							</CmmsText>
							<CmmsText
								style={{
									fontWeight: 'bold'
								}}
							>
								{' '}
								{AppTextData.txt_Date}
								{JobOrderReportData.Date != 0 ? (
									format(new Date(JobOrderReportData.SDate), 'dd/MM/yyyy')
								) : (
									JobOrderReportData.Date
								)}
							</CmmsText>
						</View>

						<View
							style={{
								flex: 1,
								flexDirection: 'row',
								justifyContent: 'center'
							}}
						>
							<View style={{ flex: 3 }}>
								<CmmsText
									style={{
										fontSize: 10,
										paddingVertical: 2,
										fontWeight: 'bold',
										marginTop: 6
									}}
								>
									{AppTextData.txt_From}{' '}
									{JobOrderReportData.From != 0 ? (
										format(new Date(JobOrderReportData.From), 'hh:mm:ss')
									) : (
										JobOrderReportData.From
									)}
								</CmmsText>
							</View>

							<View style={{ flex: 2 }}>
								<CmmsText
									style={{
										fontSize: 10,
										paddingVertical: 2,
										fontWeight: 'bold',
										marginTop: 6
									}}
								>
									{AppTextData.txt_To}:{' '}
									{JobOrderReportData.To != 0 ? (
										format(new Date(JobOrderReportData.To), 'hh:mm:ss')
									) : (
										JobOrderReportData.To
									)}{' '}
								</CmmsText>
							</View>

							<View style={{ flex: 3, flexDirection: 'row', alignItems: 'center' }}>
								<CheckBox disabled value={JobOrderReportData.Days} />
								<CmmsText
									style={{
										fontSize: 10,
										fontWeight: 'bold'
									}}
								>
									{' '}
									{AppTextData.txt_Next_Day}{' '}
								</CmmsText>
							</View>

							<View style={{ flex: 2 }}>
								<CmmsText
									style={{
										fontSize: 10,
										paddingVertical: 2,
										fontWeight: 'bold',
										marginTop: 6
									}}
								>
									{AppTextData.txt_Break}: {JobOrderReportData.BreakMinute} {AppTextData.txt_min}
								</CmmsText>
							</View>
							
						</View>
						{/* {JobOrderReportData.AssetSate&&<RadioForm
							style={{marginVertical:10}}
			radio_props={[
				
				{label: 'Warranty ',},
				{label: 'Contract ', },
				{label: 'Chargeable ',}
			]}
			initial={JobOrderReportData.AssetSate-1}
			formHorizontal={true}
			labelHorizontal={true}
			buttonColor={CmmsColors.logoBottomGreen}
			selectedButtonColor={CmmsColors.logoTopGreen}
			buttonSize={14}
			animation={true}
			/>} */}
						<View style={{ ...styles.SubHeadDetTitle, flexDirection: 'row', alignItems: 'center' }}>
							<CmmsText style={{ ...styles.SubheadDet, flex: 1 }}>
								{AppTextData.txt_Activity_Details}
							</CmmsText>

							<TouchableOpacity
								style={{
									backgroundColor: 'white',
									borderRadius: 5,
									elevation: 10,
									marginEnd: 8,
									paddingHorizontal: 8,
									paddingVertical: 2,
									alignSelf: 'flex-end'
								}}
								onPress={() => {
									JobOrderReportData.ActivityDtls.forEach((Activity) => {
										console.log({ Activity });
										Activity.Status = 1;
									});
									console.log({ ActivityDtls: JobOrderReportData.ActivityDtls });
									dispatch(actionSetJobOrderReport({ ...JobOrderReportData }));
								}}
							>
								<CmmsText style={{ color: CmmsColors.logoBottomGreen }}>
									{
										'Closed All'
										//AppTextData.txt_Closed_All
									}
								</CmmsText>
							</TouchableOpacity>
						</View>

						<View style={{ marginTop: 10 }}>
							<FlatList
								showsVerticalScrollIndicator={false}
								data={JobOrderReportData.ActivityDtls}
								renderItem={({ item, index }) => {
									return (
										<GestureRecognizer
											onSwipeLeft={(state) => {
												item.Status = item.Status != 2 ? 2 : 0;

												dispatch(actionSetJobOrderReport({ ...JobOrderReportData }));
											}}
											onSwipeRight={(state) => {
												item.Status = item.Status != 1 ? 1 : 0;
												dispatch(actionSetJobOrderReport({ ...JobOrderReportData }));
											}}
											config={config}
											style={{
												flex: 1
											}}
										>
											<TouchableOpacity
												style={{
													marginHorizontal: 8,
													marginBottom: 8
												}}
											>
												<View
													style={
														item.Status == 0 ? (
															styles.ActivityPending
														) : item.Status == 2 ? (
															styles.ActivityWIP
														) : (
															styles.ActivityClosed
														)
													}
												>
													<CmmsText
														numberOfLines={2}
														style={{
															color: 'white',
															marginStart: 8
														}}
													>
														{index + 1}. {item.Activity}
													</CmmsText>
												</View>
											</TouchableOpacity>
										</GestureRecognizer>
									);
								}}
								keyExtractor={(item, index) => index.toString()}
							/>
						</View>

						<View style={styles.SubHeadDetTitle}>
							<CmmsText style={styles.SubheadDet}>{AppTextData.txt_Spare_Parts_Required}</CmmsText>
						</View>
						<View style={{ paddingHorizontal: 5, marginTop: 8 }}>
							<FlatList
								data={JobOrderReportData.SparePartsDtls}
								renderItem={({ item, index }) => (
									<View
										style={{
											flex: 1,
											flexDirection: 'row',
											justifyContent: 'space-between',
											marginHorizontal: 8,
											marginBottom: 8,
											alignItems: 'center'
										}}
									>
										<View style={{ flex: 8 }}>
											<CmmsText
												style={{
													fontSize: 13,
													fontWeight: 'bold'
												}}
											>
												{index + 1}. {item.SpareParts}({item.UOM})
											</CmmsText>
										</View>
										<View style={{ flex: 1 }}>
											<TextInput
												style={{
													flex: 1,
													color: 'black',
													height: 35,
													backgroundColor: '#FFFFFF',
													fontSize: 9
												}}
												placeholder=""
												keyboardType="numeric"
												placeholderTextColor="grey"
												maxLength={5}
												returnKeyType="next"
												selectTextOnFocus
												onChangeText={(input) => {
													item.AQty = input;
													item.Qty = input;
													dispatch(actionSetJobOrderReport({ ...JobOrderReportData }));
													console.log('SparePartsDtls', JobOrderReportData.SparePartsDtls);
												}}
												value={`${item.AQty}`}
											/>
										</View>
									</View>
								)}
								keyExtractor={(item, index) => index.toString()}
							/>
						</View>
						<View style={styles.SubHeadDetTitle}>
							<CmmsText style={styles.SubheadDet}>{AppTextData.txt_Remark}</CmmsText>
						</View>
						<View style={{ padding: 8, paddingHorizontal: 5 }}>
							<TextInput
								style={{
									flex: 1,
									color: 'black',
									backgroundColor: '#FFFFFF',
									marginTop: 5
								}}
								placeholder="Remark"
								placeholderTextColor="grey"
								multiline={true}
								returnKeyType="next"
								onChangeText={(text) => {
									dispatch(actionSetJobOrderReport({ ...JobOrderReportData, Remarks: text }));
								}}
								value={JobOrderReportData.Remarks}
							/>
						</View>

						{/* <TouchableOpacity
    style={{flexDirection:'row',
    alignItems:'center',
    height:30,marginStart:5,marginEnd:5}}
    onPress={()=>{
      dispatch(actionSetJobOrderReport({...JobOrderReportData,IsRescheduled:!JobOrderReportData.IsRescheduled}))
      
    }}
    ><Icon name={JobOrderReportData.IsRescheduled?"check-square-o":"square-o"} size={18} color={JobOrderReportData.IsRescheduled?'green':'black' }/> 
  
      <CmmsText 
      style ={{fontWeight:'bold',
      textDecorationLine:'underline',
      marginStart:4,
      color:JobOrderReportData.IsRescheduled?'green':'black'}}
      >Rescheduled</CmmsText>
      </TouchableOpacity> */}

	  {JobOrderReportData.IsRescheduled&&<Picker
					dropdownIconColor={CmmsColors.logoBottomGreen}
					mode={'dropdown'}
					selectedValue={`${JobOrderReportData.ReasonID}`}
					onValueChange={(item, index) => {
						console.log("reason_change: ",item)
						// setSelectedDefaultReason(item)
						dispatch(actionSetJobOrderReport({...JobOrderReportData,ReasonID:Number(item)}))
					}}
				>
					{reasonList.map((item, index) => {
						return <Picker.Item key={index} label={`${item.Name}`} value={`${item.ID}`} />;
					})}
				</Picker>}

						{params.IsSuperVisor == 0 && (
							<View>
								<View
									style={{
										flex: 1,
										flexDirection: 'row',
										justifyContent: 'flex-end',
										// borderWidth:1,
										// alignItems:'flex-end',
									}}
								>
									{params.ServiceType != 2&& <View style={{flex: 1,
										flexDirection: 'row',}}>
									<TouchableOpacity
										style={{
											flex: 1,
											flexDirection:'column',
											backgroundColor: CmmsColors.logoBottomGreen,
											justifyContent: 'center',
											alignItems: 'center',
											padding: 8,
											borderRadius: 5,
											margin: 4
										}}
										onPress={() =>
											navigation.navigate('ActivityDetails', {
												JoId: JobOrderReportData.JOID,
												SeId: params.SEID
											})}
									>
										<CmmsText style={{ color: '#ffffff', textAlign: 'center', }}>
										Add Actvs ({JobOrderReportData.AdditionalActivityDtls?.length})
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
											margin: 4
										}}
										onPress={() =>{
											if(JobOrderReportData.AdditionalActivityDtls?.length>0)
											navigation.navigate('AdditionalSpareParts', {
												JoId: JobOrderReportData.JOID,
												SeId: params.SEID,
												AssetRegID:JobOrderReportData.AssetRegID,
												AssetCode:JobOrderReportData.AssetCode
											})
											else alert("You must enter atleast one activity to add spareparts")
										}
										}
									>
										<CmmsText style={{ color: '#ffffff', textAlign: 'center' }}>
										Add SPart ({JobOrderReportData.AdditionalSparePartsDtls.length})
										</CmmsText>
										{/* <CmmsText
										style={{ color: '#ffffff', textAlign: 'center',fontSize:12,fontWeight:'bold' }}
										>({JobOrderReportData.AdditionalSparePartsDtls.length})</CmmsText> */}
									</TouchableOpacity>
									</View>}
									<TouchableOpacity
              style={{ marginHorizontal: 8, padding: 4,}}
              onPress={()=>navigation.navigate('Notes',{JOID:JobOrderReportData.JOID,})}
            >
              <Image
                style={{ width: 48, height: 48, }}
                source={require('../../../assets/icons/ic_doc.png')}
              />
              {/* <Icon name="file-text" size={32} color='black'/> */}
            </TouchableOpacity>
								</View>
								<View
									style={{
										flex: 1,
										flexDirection: 'row',
										marginTop: 5,
										justifyContent: 'space-around'
									}}
								>
									{/* <TouchableOpacity
										// onPress={() => setVisibleClgDlg(true)}
										style={{
											flex: 1,
											backgroundColor: CmmsColors.logoBottomGreen,
											justifyContent: 'center',
											alignItems: 'center',
											padding: 8,
											borderRadius: 5,
											margin: 4
										}}
									>
										<CmmsText style={{ color: '#ffffff' }}>{'Photos'}</CmmsText>
									</TouchableOpacity> */}
									<TouchableOpacity
										onPress={() => OnSave()}
										style={{
											flex: 1,
											backgroundColor: CmmsColors.logoBottomGreen,
											justifyContent: 'center',
											alignItems: 'center',
											padding: 8,
											borderRadius: 5,
											margin: 4
										}}
									>
										<CmmsText style={{ color: '#ffffff' }}>{AppTextData.txt_Save}</CmmsText>
									</TouchableOpacity>
									{/* {JobOrderReportData.ServiceReportID != 0 && (
										<TouchableOpacity
											onPress={() => {
												if(JobOrderReportData.ID!=0)
												setVisibleClgDlg(true)
												else alert(AppTextData.txt_job_order_report_verify_alert)
											}
											}
											style={{
												flex: 1,
												backgroundColor: CmmsColors.logoBottomGreen,
												justifyContent: 'center',
												alignItems: 'center',
												padding: 8,
												borderRadius: 5,
												margin: 4
											}}
										>
											<CmmsText style={{ color: '#ffffff' }}>{AppTextData.txt_Verify}</CmmsText>
										</TouchableOpacity>
									)} */}
								</View>
							</View>
						)}
					</View>
				</ScrollView>
			)}
			<Dialog
				title={AppTextData.txt_Review}
				visible={visibleReviewDlg}
				//   onTouchOutside={()=>setVisibleReviewDlg(false)}
			>
				<CustomerReview
					isVerified={JobOrderReportData.IsVerified}
					ServiceReportID={JobOrderReportData.ID}
					CustodianID={JobOrderReportData.CustodianID}
					AppTextData={AppTextData}
					saveCustomerReview={(imgFile, score, comment) => {
						dispatch(actionSetLoading(true))
						console.log({ imgFile, score, comment });
						let bodyFormData = new FormData();
						let newImageFile = new File([ imgFile.encoded ], JobOrderReportData.Custodian + '.png', {
							type: 'image/*'
						});
						bodyFormData.append(
							'Review',
							JSON.stringify({
								Rating: score,
								ServiceReportID: JobOrderReportData.ID,
								CustodianID: JobOrderReportData.CustodianID,
								Remarks: comment,
								DateTime: new Date().getTime()
							})
						);
						let imgUri = Platform.OS === 'android' ? `file://${imgFile.pathName}` : imgFile.pathName;
						var photo = {
							uri: imgUri, //this.state.uri[0].uri, == image path file:///storage/emulated/0/Pictures/1511787860629.jpg
							type: newImageFile.type,
							name: 'signature.png',
							size: newImageFile.size
						};
						//   RNFetchBlob.fs.stat(signUri)
						//         .then((stats) => {
						//             console.log({stats})
						//             photo = stats
						//         })
						//         .catch((err) => {
						//             console.error({err})
						//         })
						// var photo ={
						//     base64: imgFile.encoded,
						//     uri: imgUri,
						//     width: newImageFile.width,
						//     height: newImageFile.height,
						//     fileSize: newImageFile.size,
						//     type: newImageFile.type,
						//     fileName: newImageFile.name,
						//     duration: newImageFile.duration,
						//   }
						bodyFormData.append(
							'Signature',
							photo
							//   {uri: signUri, name: 'signature.png', type: 'image/png',size:signUri.size}
						);
						// bodyFormData.append('Signature',Image.resolveAssetSource(ic_play).uri);
						//   bodyFormData.append('Signature',newImageFile);

						// fetch(`${API_TECHNICIAN}SaveReview`,{
						//     method: 'POST',
						//     headers: {
						//       'Accept': 'application/json',
						//       'Content-Type': 'multipart/form-data',
						//     },
						//     body: bodyFormData,
						//    })
						//    .then(res=>console.log("SAveRv",{res}))
						//    .catch(err=>console.error("SaveRv",{err}))

						requestWithEndUrl(
							`${API_TECHNICIAN}SaveReview`,
							bodyFormData,
							'POST',
							{ 'Content-Type': 'multipart/form-data' }
							//   { "contentType": "false" }
						)
							.then((res) => {
								console.log('VerifyCustodian', { res });
								if (res.status != 200) {
									throw Error(res.data);
								}
								return res.data;
							})
							.then((data) => {
								console.log({ data });
								dispatch(actionSetLoading(false))
								if (data.isSucess) {
									setVisibleReviewDlg(false);
									alert(data.Message);
								} else throw Error(data.Message);
							})
							.catch((err) => {
								dispatch(actionSetLoading(false))
								console.log({ err });
								alert(AppTextData.txt_somthing_wrong_try_again);

							});
					}}
					onCancel={() => {
						setVisibleReviewDlg(false);
					}}
				/>
			</Dialog>

			<Dialog
				title={AppTextData.txt_Custodian_Login}
				titleStyle={{ textAlign: 'center' }}
				visible={visibleClgwDlg}
				onTouchOutside={() => {
					setCustodianPswd('');
					setVisibleClgDlg(false);
				}}
				
			>	
			
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						borderWidth: 1,
						borderColor: CmmsColors.blue,
						backgroundColor: '#ffffff90',
						borderRadius: 5,
						paddingHorizontal: 8,
					}}
				>
					<Icon name="user" size={18} color={CmmsColors.coolGray} />
					<TextInput
						style={{ flex: 1, color: 'black', marginStart: 5 }}
						placeholder={AppTextData.txtUser_ID}
						placeholderTextColor="grey"
						value={JobOrderReportData.Custodian}
						returnKeyType="next"
						editable={false} 
						selectTextOnFocus={false}
						// onSubmitEditing={() => this.passwordInput.focus()}
						// onSubmitEditing={this.smsPermission.bind(this)}
						// onChangeText={val => this.onChangeText('mobile', val)}
						// onChangeText={(text) => { setUser({...User,Password:text}) }}
					/>
				</View>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						backgroundColor: '#ffffff90',
						borderWidth: 1,
						borderColor: CmmsColors.blue,
						borderRadius: 5,
						marginTop: 15,
						paddingHorizontal: 8
					}}
				>
					<Icon name="key" size={18} color={CmmsColors.coolGray} />
					<TextInput
						style={{ flex: 1, color: 'black', marginStart: 5 }}
						placeholder={AppTextData.txtpassword}
						placeholderTextColor="grey"
						secureTextEntry={true}
						maxLength={10}
						returnKeyType="done"
						value={custodianPswd}
						onChangeText={(text) => {
							setCustodianPswd(text);
						}}
					/>
				</View>
				<TouchableOpacity
					style={{
						backgroundColor: CmmsColors.lightBlue,
						marginTop: 20,
						alignItems: 'center',
						borderRadius: 5,
						justifyContent: 'center',
						height: 50
					}}
					onPress={() =>
						//alert("multi langnpm ")
						doCustdianLogin()}
				>
					<CmmsText style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
						{AppTextData.txtLogin}
					</CmmsText>
				</TouchableOpacity>
			</Dialog>
		</SafeAreaView>
	);

	function doCustdianLogin() {
		//http://213.136.84.57:4545/api/ApkTechnician/VerifyCustodian?CustodianID=6&PassWord=123
		requestWithEndUrl(`${API_TECHNICIAN}VerifyCustodian`, {
			CustodianID: JobOrderReportData.CustodianID,
			PassWord: custodianPswd
		})
			.then((res) => {
				console.log('VerifyCustodian', { res });
				if (res.status != 200) {
					throw Error(res.data);
				}
				return res.data;
			})
			.then((data) => {
				console.log({ data });
				if (data.isSucess) {
					setCustodianPswd('');
					setVisibleClgDlg(false);
					setVisibleReviewDlg(true);
				}
				else alert(data.Message)
			})
			.catch((err) => {
				console.log('VerifyCustodian', { err });
				alert(AppTextData.txt_somthing_wrong_try_again);
			});
	}

	function OnSave() {
		// const body = {
		//     "JOID": JobOrderReportData.JOID,
		//     "SRDate": JobOrderReportData.Date,
		//     "From": JobOrderReportData.From,
		//     "To": JobOrderReportData.To,
		//     "Days": JobOrderReportData.Days,
		//     "BreakMinute": JobOrderReportData.BreakMinute,
		//     "ActivityDtls": JobOrderReportData.ActivityDtls,
		//     "SparePartsDtls": JobOrderReportData.SparePartsDtls,
		//     "Remark": JobOrderReportData.Remark,
		//      "AdditionalActivityDtls":[],
		//      "AdditionalSparePartsDtls":[]
		// };
		// JobOrderReportData.AdditionalActivityDtls = params.selectedActivityDetails;
		// JobOrderReportData.AdditionalSparePartsDtls = params.SelectedSpareParts;
		JobOrderReportData.SEID = params.SEID;
		console.log(`${API_TECHNICIAN}APKSaveJobOrdeReport`);
		console.log('OnSave Items:', JSON.stringify(JobOrderReportData));
		dispatch(actionSetLoading(true));

		requestWithEndUrl(`${API_TECHNICIAN}APKSaveJobOrdeReport`, JobOrderReportData, 'POST')
			.then((res) => {
				console.log('URL_APKSaveJobOrdeReport', res);
				if (res.status != 200) {
					throw Error(res.data);
				}
				return res.data;
			})
			.then((data) => {
				dispatch(actionSetLoading(false));

				if (data.isSucess) {
					alert(data.Message);
					dispatch(actionSetRefreshing());
					navigation.goBack();
				}
			})
			.catch((err) => {
				console.error({ err });
				dispatch(actionSetLoading(false));
				alert(AppTextData.txt_somthing_wrong_try_again);
			});
	}
});
const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 20,
		alignItems: 'flex-start' // if you want to fill rows left to right
	},
	itemhead: {
		width: '50%' // is 50% of container width
	},
	item: {
		padding: 8,
		fontSize: 15
		// height: 44,
	},
	MainHead: {
		fontSize: 18,
		fontStyle: 'normal',
		textAlign: 'center',
		fontWeight: 'bold',
		color: 'black'
	},
	SubHead: {
		fontSize: 16,
		textAlign: 'center',
		fontWeight: 'bold',
		color: 'black'
	},
	SubHeadBottom: {
		fontSize: 18,
		textAlign: 'center',
		fontWeight: 'bold',
		marginBottom: 20
	},
	SubHeadBottom: {
		fontSize: 16,
		textAlign: 'center',
		paddingVertical: 2,
		fontWeight: 'bold',
		marginBottom: 20
	},
	SubheadDet: {
		fontSize: 16,
		color: '#FFF',
		textAlign: 'left',
		paddingLeft: 10,
		fontWeight: 'bold'
	},
	SubHeadDetTitle: {
		marginTop: 8,
		paddingHorizontal: 4,
		paddingVertical: 8,
		backgroundColor: CmmsColors.logoTopGreen,
		textAlign: 'center'
	},

	row: {
		flex: 1,
		flexDirection: 'row'
	},
	SubHeadBottomList: {
		fontSize: 14,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	ActivityPending: {
		backgroundColor: CmmsColors.joPending,
		flexDirection: 'row',
		// borderRadius: 20,
		paddingVertical: 8
	},
	ActivityClosed: {
		backgroundColor: CmmsColors.joDone,
		flexDirection: 'row',
		// borderRadius: 20,
		paddingVertical: 8
	},
	ActivityWIP: {
		backgroundColor: CmmsColors.joWip,
		flexDirection: 'row',
		// borderRadius: 20,
		paddingVertical: 8
	}
});
