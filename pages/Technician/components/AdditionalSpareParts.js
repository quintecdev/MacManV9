import React, { Component, useState, useEffect,useRef } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import {
	SafeAreaView,
	View,
	ImageBackground,
	FlatList,
	StyleSheet,
	Animated,
	TouchableOpacity,
	TextInput,
	Alert,
	KeyboardAvoidingView
} from 'react-native';
import { API_TECHNICIAN } from '../../../network/api_constants';
import CmmsColors from '../../../common/CmmsColors';
import requestWithEndUrl from '../../../network/request';
import { Picker } from '@react-native-picker/picker';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import { CmmsText, CTextTitle } from '../../../common/components/CmmsText';
import { actionSetJobOrderReport } from '../../../action/ActionJobOrderReport';
import { actionSetLoading } from '../../../action/ActionSettings';
import AssetInfoPopUp from '../../components/AssetInfoPopUp';
import PickerSparePartsCategory from './PickerSparePartsCategory';
import AdditionalSparePartsItem from './AdditionalSparePartsItem';

export default ({ navigation, route: { params } }) => {
	const codeRef = useRef(null)
	const addSpLstRef = useRef(null)
	console.log('AdditionalSpareParts', params);
	const { AppTextData } = useSelector((state) => state.AppTextViewReducer);
	var JobOrderReportData;
	if (params.isCheckList) {
		JobOrderReportData = { AdditionalSparePartsDtls: params.SparePartsList || [] };
	} else {
		JobOrderReportData = useSelector((state) => {
			console.log({ JobOrderReportReducer_state: state.JobOrderReportReducer });
			return state.JobOrderReportReducer.JobOrderReportData;
		});
	}
	const dispatch = useDispatch();
	const [ SparePartsCategory, setSparePartsCategory ] = useState([]);
	const [ SpareParts, setSpareParts ] = useState([]);
	const [ additionalSparePartsDtls, setAdditionalSparePartsDtls ] = useState(
		JobOrderReportData.AdditionalSparePartsDtls || []
	);
	// const [SelectedSpareParts, setSelectedSpareParts] = useState([]);
	const [ DefaultSparePartsCat, setDefaultSparePartsCat ] = useState(0);
	const [ DefaultSpareParts, setDefaultSpareParts ] = useState(0);
	const [ newNote, setNewNote ] = useState(JobOrderReportData.AdditionalSparepartsNote);
	const [ visibleAssetInfoPopUp, setVisibleAssetInfoPopUp ] = useState(false);

	useEffect(() => {
		addSpLstRef.current.scrollToEnd();
	}, [additionalSparePartsDtls.length]);
	useEffect(() => {
		console.log('params', params);

		requestWithEndUrl(`${API_TECHNICIAN}GetSparePartsCategory`)
			.then((res) => {
				if (res.status != 200) {
					throw Error(res.statusText);
				}
				return res.data;
			})
			.then((data) => {
				console.log('All SparePartsCategory', data);
				setSparePartsCategory(data);
			})
			.catch(function(error) {
				console.log('Activity Detals Erro: ', error);
			});
	}, []);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<KeyboardAvoidingView
      style={{ flex: 1, }}
      behavior="height"
    >
			{visibleAssetInfoPopUp && (
				<AssetInfoPopUp
					dispatch={dispatch}
					AssetRegID={params.AssetRegID}
					onTouchOutSide={() => setVisibleAssetInfoPopUp(false)}
				/>
			)}
			{/* <ImageBackground
                style={{
                    flex: 1,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                }}
                source={require('../../../assets/bg/bg_cmms.webp')}
            /> */}
			
			<View style={{ flex: 1, padding: 8 }}>
				
				{/* <CmmsText
                    style={styles.MainHead}>{AppTextData.txt_Additional_Spare_Parts_Issued}</CmmsText> */}

				{/* <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <View style={{ flex: 1 }} >
                        <CmmsText style={styles.SubHead}>{AppTextData.txt_Code}</CmmsText>
                    </View>
                    <View style={{ flex: 1, textAlign: 'center' }} > */}
				<View style={{ flexDirection: 'row' }}>
					<TextInput
					ref={codeRef}
						style={{
							flex: 1,
							color: 'black',
							backgroundColor: '#FFFFFF',
							
							height: 40
						}}
						placeholder="Code"
						placeholderTextColor="grey"
						returnKeyType="search"
						onSubmitEditing={(e) => {
							console.log('onSubmitcode search', { e });
							// add spare parts based on the code
							// requestWithEndUrl()
							dispatch(actionSetLoading(true));
							requestWithEndUrl(`${API_TECHNICIAN}GetAdditionalSparePartsByCode`, {
								Code: e.nativeEvent.text
							})
								.then((res) => {
									if (res.status != 200) {
										throw Error(res.statusText);
									}
									return res.data;
								})
								.then((data) => {
									dispatch(actionSetLoading(false));
									console.log('GetAdditionalSparePartsByCode', data);
									if (data) {
										Alert.alert("Add additional spare parts", `${data.SpareParts}.`, [
											// {
											//   text: 'Ask me later',
											//   onPress: () => console.log('Ask me later pressed')
											// },
											{
												text: 'Cancel',
												onPress: () => console.log('Cancel Pressed'),
												style: 'cancel'
											},
											{
												text: 'OK',
												onPress: () => {
													addAddtionalSpareParts(data,2);
													// if(codeRef.current)codeRef.current.value = "";
												}
											}
										]);
									} else {
										alert('Invalid data');
									}
									// setSparePartsCategory(data);
								})
								.catch(function(error) {
									dispatch(actionSetLoading(false));
									console.log('GetAdditionalSparePartsByCode: ', error);
									alert(AppTextData.txt_somthing_wrong_try_again);
								});
						}}
					/>
					<TouchableOpacity
						style={{ padding: 4, marginStart: 2, 
							backgroundColor: 'white', justifyContent: 'center' }}
						onPress={() => setVisibleAssetInfoPopUp(true)}
					>
						<Icon name="paperclip" size={24} color="black" />
					</TouchableOpacity>
				</View>
				{/* </View>
                </View> */}

				{/* <PickerSparePartsCategory SparePartsCategory={[
						{ Name: AppTextData.txt_Spare_Parts_Category, ID: -1 },
						...SparePartsCategory
					]} 
					selectedSparePartsCat={DefaultSparePartsCat}
					/> */}

				{/* <CmmsText style={styles.SubHead}>{AppTextData.txt_Spare_Parts_Category}</CmmsText> */}
				<View
				style={{backgroundColor:'white',marginTop:5}}
				>
				<Picker
					// style={{backgroundColor:'white',marginTop:5}}
					dropdownIconColor={CmmsColors.logoBottomGreen}
					mode={'dropdown'}
					selectedValue={DefaultSparePartsCat}
					onValueChange={(item, index) => {
						if (index != 0) {
							fetchSpareParts(item);
							setDefaultSparePartsCat(item);
						}
					}}
				>
					{[
						{ Name: AppTextData.txt_Spare_Parts_Category, ID: -1 },
						...SparePartsCategory
					].map((item, index) => {
						return <Picker.Item key={index} label={`${item.Name}`} value={`${item.ID}`}  />;
					})}
				</Picker>
				</View>
				{/* <View style={{ flex: 1 }} >
                        <CmmsText style={styles.SubHead}>{AppTextData.txt_Spare_Parts}:</CmmsText>
                    </View> */}
				{/* <View style={{ flex: 1, textAlign: 'center' }} > */}
				<View
				style={{backgroundColor:'white',marginTop:5}}
				>
				<Picker
					
					dropdownIconColor={CmmsColors.logoBottomGreen}
					mode={'dropdown'}
					onValueChange={(item, index) => addAddtionalSpareParts(item, index)}
				>
					{[
						{
							SpareParts:
								SpareParts.length > 0
									? AppTextData.txt_Select_to_add_Spare_Parts
									: AppTextData.txt_Spare_Parts_not_found,
							ActivityID: -1
						},
						...SpareParts
					].map((item, index) => {
						
						return (
							<Picker.Item
								color={index == 0 ? CmmsColors.logoBottomGreen : 'black'}
								key={index}
								label={`${item.SpareParts}`}
								value={item}
							/>
						);
					})}
				</Picker>
				</View>
				{/* </View> */}
				<View
					style={{
						flexDirection: 'row',
						backgroundColor: CmmsColors.logoTopGreen,
						paddingVertical: 8,
						paddingHorizontal: 7,
						marginTop: 10
					}}
				>
					<CTextTitle style={{ flex: 1 }}>Additional Spare Parts</CTextTitle>
					<CTextTitle
						style={{
							width: 40,
							height: 25,
							padding: 2,
							marginHorizontal: 8
						}}
					>
						Req
					</CTextTitle>
					<CTextTitle
						style={{
							width: 40,
							height: 25,
							padding: 2,
							marginStart: 8,
							marginEnd: 40
						}}
					>
						Used
					</CTextTitle>
				</View>

				{/* <View
                    style={{}}> */}
					
				<FlatList
				style={{marginBottom:8}}
					ref={addSpLstRef}
					removeClippedSubviews={false} 
					showsVerticalScrollIndicator={false}
					keyExtractor={(item, index) => index.toString()}
					data={additionalSparePartsDtls}
					renderItem={({ item, index }) => (
						<AdditionalSparePartsItem
						index={index}
						item={item}
    					updateReqQty={(input)=>{
							let newArr = [ ...additionalSparePartsDtls ];
							newArr[index].RQty = input;
							setAdditionalSparePartsDtls(newArr);
						}} 
						updateUsedQty={(input)=>{
							let newArr = [ ...additionalSparePartsDtls ];
							newArr[index].Qty = input;
							setAdditionalSparePartsDtls(newArr);
						}} 
						deleteItem = {()=>{
							console.log("delete item");
							let newArr = [ ...additionalSparePartsDtls ];
							newArr.splice(index, 1);
							setAdditionalSparePartsDtls(newArr);
						}}
						/>
						// <View
						// 	style={{
						// 		flexDirection: 'row',
						// 		justifyContent: 'space-between',
						// 		alignItems: 'center',
						// 		paddingVertical: 8,
						// 	}}
						// >
						// 	<CmmsText
						// 		numberOfLines={1}
						// 		style={{
						// 			flex: 1
						// 		}}
						// 	>
						// 		{index + 1}. {item.SpareParts}({item.UOM})
						// 	</CmmsText>
						// 	<TextInput
						// 		style={{
						// 			color: 'black',
						// 			borderWidth: 1,
						// 			textAlign: 'center',
						// 			width: 40,
						// 			height: 25,
						// 			padding: 2,
						// 			marginHorizontal: 8,
						// 			fontFamily: 'sans-serif-condensed',
						// 			fontSize: 10
						// 		}}
						// 		placeholder=""
						// 		keyboardType="numeric"
						// 		onChangeText={(input) => {
						// 			console.log('onChangeText', { item });
						// 			let newArr = [ ...additionalSparePartsDtls ];
						// 			newArr[index].RQty = input;
						// 			setAdditionalSparePartsDtls(newArr);
						// 			// item.AQty = input
						// 			// item.Qty = input
						// 			// let newArr = [ ...JobOrderReportData.AdditionalSparePartsDtls ];
						// 			// newArr[index] = { ...item, Qty: input };
						// 			// // setSelectedSpareParts(newArr);
						// 			// dispatch(
						// 			// 	actionSetJobOrderReport({
						// 			// 		...JobOrderReportData,
						// 			// 		AdditionalSparePartsDtls: newArr
						// 			// 	})
						// 			// );
						// 			// console.log(JobOrderReportData.AdditionalSparePartsDtls)
						// 		}}
						// 		selectTextOnFocus
						// 		placeholderTextColor="grey"
						// 		returnKeyType="next"
						// 		value={`${item.RQty}`}
						// 	/>
						// 	<TextInput
						// 		style={{
						// 			color: 'black',
						// 			borderWidth: 1,
						// 			textAlign: 'center',
						// 			width: 40,
						// 			height: 25,
						// 			padding: 2,
						// 			marginHorizontal: 8,
						// 			fontFamily: 'sans-serif-condensed',
						// 			fontSize: 10
						// 		}}
						// 		placeholder=""
						// 		keyboardType="numeric"
						// 		onChangeText={(input) => {
						// 			console.log('onChangeText', { item });
						// 			let newArr = [ ...additionalSparePartsDtls ];
						// 			newArr[index].Qty = input;
						// 			setAdditionalSparePartsDtls(newArr);
						// 			// item.AQty = input
						// 			// item.Qty = input
						// 			// let newArr = [ ...JobOrderReportData.AdditionalSparePartsDtls ];
						// 			// newArr[index] = { ...item, RQty: input};
						// 			// // setSelectedSpareParts(newArr);
						// 			// dispatch(
						// 			// 	actionSetJobOrderReport({
						// 			// 		...JobOrderReportData,
						// 			// 		AdditionalSparePartsDtls: newArr
						// 			// 	})
						// 			// );
						// 			// console.log(JobOrderReportData.AdditionalSparePartsDtls)
						// 		}}
						// 		selectTextOnFocus
						// 		placeholderTextColor="grey"
						// 		returnKeyType="next"
						// 		value={`${item.Qty}`}
						// 	/>
						// 	<TouchableOpacity
						// 		style={{
						// 			justifyContent: 'center',
						// 			paddingHorizontal: 8
						// 		}}
						// 		onPress={() => {
						// 			let newArr = [ ...additionalSparePartsDtls ];
						// 			newArr.splice(index, 1);
						// 			setAdditionalSparePartsDtls(newArr);
						// 			// dispatch(actionSetJobOrderReport({ ...JobOrderReportData }));
						// 			//JobOrderReportData.AdditionalSparePartsDtls.filter(addSp=>addSp.SparePartsID==item.SparePartsID&&addSp.UOMID==item.UOMID)
						// 			// setSelectedSpareParts(SelectedSpareParts=>SelectedSpareParts.filter(filterItem=>(filterItem.SparePartsID!=item.SparePartsID)))
						// 		}}
						// 	>
						// 		<Icon name="trash" size={18} color="grey" />
						// 	</TouchableOpacity>
						// </View>
					)}
				/>
				
				{!params.isCheckList && (
					<TextInput
						// ref={noteArea.current}
						selectTextOnFocus
						style={{

							justifyContent: 'flex-start',
							alignItems: 'flex-start',
							alignContent: 'flex-start',
							textAlignVertical: 'top',
							// borderWidth: 1,
							minHeight: 100,
							maxHeight: '25%',
							// borderColor: 'grey',
							backgroundColor:'white'
						}}
						multiline={true}
						// numberOfLines={4}
						placeholder={AppTextData.txt_Please_enter_your_notes}
						onChangeText={(text) => setNewNote(text)}
						value={newNote}
					/>
				)}
				<TouchableOpacity
					style={{
						backgroundColor: CmmsColors.logoBottomGreen,
						borderRadius: 8,
						// marginVertical: 8,
						marginTop: 8,
						padding: 8,
						justifyContent: 'center',
						alignItems: 'center'
					}}
					onPress={() => {
						// console.log('SelectedSpareParts', SelectedSpareParts)
						// // console.log('SelectedSpareParts', { "SelectedSpareParts": SelectedSpareParts.filter(obj => obj.AQty != NaN) })
						// navigation.navigate("JobOrderReport", { "SelectedSpareParts": SelectedSpareParts.filter(obj => obj.Qty != 0 || obj.Qty != ""), IsSuperVisor: 0 })
						// navigation.goBack();
						if (additionalSparePartsDtls.length > 0) {
							if (params.isCheckList) params.updateSpareParts(additionalSparePartsDtls);
							else {
								dispatch(
									actionSetJobOrderReport({
										...JobOrderReportData,
										AdditionalSparepartsNote: newNote,
										AdditionalSparePartsDtls: additionalSparePartsDtls
									})
								);
							}
							navigation.goBack();
						} else {
							alert('Invalid Data');
						}
					}}
				>
					<CmmsText style={{ color: 'white', fontWeight: '900', textAlign: 'center' }}>
						{AppTextData.txt_OK}
					</CmmsText>
				</TouchableOpacity>
				
				{/* </View> */}
			{/* </KeyboardAvoidingView> */}

			</View>
			</KeyboardAvoidingView>

		</SafeAreaView>
	);

	function addAddtionalSpareParts(item, index = 0) {
		console.log('addAddtionalSpareParts', { item });
		if (
			index != 0 &&
			additionalSparePartsDtls.filter(
				(addSp) => addSp.SparePartsID == item.SparePartsID && addSp.UOMID == item.UOMID
			).length == 0
		) {
			setAdditionalSparePartsDtls((additionalSparePartsDtls) => [
				...additionalSparePartsDtls,
				{ ...item, Qty: 0, RQty: 1 }
			]);
			
		} else {
			alert(`${item.SpareParts} already added`);
		}
	}
	function fetchSpareParts(id) {
		console.log('Category id:', id);
		console.log(`${API_TECHNICIAN}GetAdditionalSpareParts?SEID=${params.SeId}&JOID=${params.JoId}&SCATID=${id}`);

		dispatch(actionSetLoading(true));
		requestWithEndUrl(`${API_TECHNICIAN}GetAdditionalSpareParts`, {
			SEID: params.SeId,
			JOID: params.JoId,
			SCATID: id
		})
			.then((res) => {
				if (res.status != 200) {
					throw Error(res.statusText);
				}
				return res.data;
			})
			.then((data) => {
				console.log('SpareParts', data);
				setSpareParts(data);
				dispatch(actionSetLoading(false));
			})
			.catch(function(error) {
				dispatch(actionSetLoading(false));
				console.log('SpareParts Error: ', error);
			});
	}
};

const styles = StyleSheet.create({
	pickerStyle: {
		height: 150,
		width: '80%',
		color: '#344953',
		justifyContent: 'center'
	},
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
	},
	MainHead: {
		fontSize: 25,
		fontStyle: 'normal',
		paddingVertical: 6,
		textAlign: 'center',
		fontWeight: 'bold'
	},
	SubHead: {
		fontSize: 15,
		textAlign: 'left',
		paddingVertical: 2,
		marginLeft: 10,
		fontWeight: 'bold'
	},
	SubHeadMain: {
		fontSize: 18,
		textAlign: 'center',
		paddingVertical: 2,
		fontWeight: 'bold'
	},
	SubHeadBottom: {
		fontSize: 18,
		textAlign: 'center',
		paddingVertical: 2,
		fontWeight: 'bold',
		marginBottom: 20
	},
	SubheadDet: {
		fontSize: 18,
		color: '#FFF',
		textAlign: 'left',
		fontWeight: 'bold'
	},
	SubHeadDetTitle: {
		marginTop: 10,
		padding: 2,
		paddingHorizontal: 8,
		backgroundColor: CmmsColors.logoTopGreen
	},

	row: {
		flex: 1,
		flexDirection: 'row'
	}
});

{
	/* <DropDownPicker
                            items={[
                                { label: 'USA', value: 'usa' },
                                { label: 'UK', value: 'uk' },
                                { label: 'France', value: 'france' },
                            ]}
                            defaultValue={country}
                            Value={country}
                            containerStyle={{ height: 40 }}
                            style={{
                                backgroundColor: '#fafafa'
                            }}
                            itemStyle={{
                                justifyContent: 'flex-start'
                            }}
                            dropDownStyle={{
                                backgroundColor: '#fafafa',

                            }}
                            onChangeItem={handleChange}
                        /> */
}
