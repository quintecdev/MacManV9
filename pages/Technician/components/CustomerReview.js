import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, Dimensions,Image } from 'react-native';
import SignatureCapture from 'react-native-signature-capture';
import CmmsColors from '../../../common/CmmsColors';
const screenHeight = Dimensions.get('window').height;
import StarRating from 'react-native-star-rating';
import { CmmsText } from '../../../common/components/CmmsText';
import requestWithEndUrl from '../../../network/request';
import { API_APK_SIGNATURE, API_TECHNICIAN } from '../../../network/api_constants';
import { useDispatch } from 'react-redux';
import { actionSetLoading } from '../../../action/ActionSettings';

export default (CustomerReview = ({ ...props }) => {
	const signRef = useRef();
	// const [ score, setScore ] = useState(4);
	// const [ comment, setComment ] = useState('');
	const [isShowExtSign,setIsShowExtSign] = useState(props.isVerified)
	const [review,setReview] = useState({
		"Rating": 4,
		// "ServiceReportID": 3615,
		// "CustodianID": 6,
		// "SignatureUrl": "signature.png_1633079828282.png",
		"Remarks": "",
		// "DateTime": 0
	})
	// const [signImg,setSignImg] = useState('')
	const [noImage,setNoImage] = useState(true)
	const [isDragged,setIsDragged] = useState(false)
	const dispatch = useDispatch()
	useEffect(()=>{
		console.log('CustomerReview',props,)
		dispatch(actionSetLoading(true))
		// http://213.136.84.57:1818/api/ApkTechnician/GetReviewInServiceReport?ServiceReportID=3615&CustodianID=6
		requestWithEndUrl(`${API_TECHNICIAN}GetReviewInServiceReport`,
		{ServiceReportID:props.ServiceReportID,CustodianID:props.CustodianID})
		.then((res) => {
			console.log('GetReviewInServiceReport', { res });
			if (res.status != 200) {
				throw Error(res.data);
			}
			return res.data;
		})
		.then((data) => {
			dispatch(actionSetLoading(false))
			data&&setReview(data)
			setNoImage(false)
			console.log('CustomerReview',{imgUrl:`${API_APK_SIGNATURE}${review.SignatureUrl}`,data})
			// setSignImg(`${API_APK_SIGNATURE}${review.SignatureUrl}`)
		})
		.catch((err)=>{
			dispatch(actionSetLoading(false))
			console.error({err})
			alert(props.AppTextData.txt_somthing_wrong_try_again);
		})
	},[])
	return (
		<View style={{ height: screenHeight / 1.5 }}>
			<View style={{ marginTop: 5, height: 50, 
				padding: 8, justifyContent: 'center', alignItems: 'center' }}>
				<StarRating
					starStyle={{ padding: 4 }}
					disabled={false}
					fullStarColor={CmmsColors.logoBottomGreen}
					maxStars={5}
					rating={review.Rating}
					selectedStar={(rating) => setReview(review=>({...review,Rating:rating}))}
				/>
			</View>
			<TextInput
				style={{
					borderBottomWidth: 1,
					minHeight: 100,
					marginTop: 10,
					padding: 4
				}}
				multiline={true}
				placeholder="Summarize Your Experience"
				onChangeText={(text) => setReview(review=>({...review,Remarks:text}))}
				value={review.Remarks}
			/>

			<View style={{ flexDirection: 'row', marginTop: 20 }}>
				<CmmsText style={{ flex: 1, fontSize: 16, fontWeight: 'bold' }}>Signature: </CmmsText>
				<TouchableOpacity onPress={() => {
					isShowExtSign&&setIsShowExtSign(false)
					signRef?.current?.resetImage()
					setIsDragged(false)
				}
				}>
					<CmmsText
						style={{
							color: CmmsColors.btnColorPositive,
							fontWeight: 'bold'
						}}
					>
						Clear
					</CmmsText>
				</TouchableOpacity>
			</View>
			<View style={{ flex: 1, marginTop: 10, 
							borderWidth:1}}>
                
				{!isShowExtSign&&<SignatureCapture
					saveImageFileInExtStorage={true}
					ref={signRef}
					style={{ flex: 1 }}
					viewMode={'portrait'}
					showNativeButtons={false}
					minStrokeWidth={4}
					maxStrokeWidth={4}
					onSaveEvent={(imgFile) => {
						console.log('onSaveEvent', { imgFile });
						props.saveCustomerReview(imgFile, review.Rating, review.Remarks);
						// else alert("Please eneter the details")
					}}
					onDragEvent={(dragEvent=>{
						console.log('ondrag',dragEvent)
						setIsDragged(true)
					})}
					
				/>}
				{isShowExtSign&&<Image
				resizeMode='center'
					style={{ 
						position:'absolute',
						
						height:"100%",width:'100%',
						// backgroundColor:'grey',
					}}
					source={noImage?require('../../../assets/placeholders/no_image.png'):{uri:`${API_APK_SIGNATURE}${review.SignatureUrl}`}}
					onError={(err)=>{
						console.log('sign_img_error: ',err)
						setNoImage(true)
					}}
					// onLoad={(event)=>{
					// 	console.log('CustomerReview',{signImg})
					// 	console.log('sign_img_load: ',event)
					// }}
					
                />}

                
			</View>

			<View style={{ flexDirection: 'row', alignSelf: 'flex-end', marginTop: 10 }}>
				<TouchableOpacity
					style={{
						marginEnd: 5,
						paddingVertical: 4,
						paddingHorizontal: 8,
						backgroundColor: CmmsColors.darkRed,
						borderRadius: 5
					}}
					onPress={() =>{
						setIsDragged(false)
						props.onCancel() 
					} }
				>
					<CmmsText style={{ color: 'white', fontWeight: '900' }}>Cancel</CmmsText>
				</TouchableOpacity>
				<TouchableOpacity
					style={{
						marginEnd: 5,
						paddingVertical: 4,
						paddingHorizontal: 8,
						backgroundColor: '#81b900',
						borderRadius: 5
					}}
					onPress={() => {
						if(isDragged)signRef.current.saveImage();
						else alert('Signature Needed');
					}}
				>
					<CmmsText style={{ color: 'white', fontWeight: '900' }}>Submit</CmmsText>
				</TouchableOpacity>
			</View>
		</View>
	);
});
