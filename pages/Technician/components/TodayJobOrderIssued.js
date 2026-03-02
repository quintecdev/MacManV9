import React, { useState, useEffect } from 'react';
import { API_TECHNICIAN } from '../../../network/api_constants';
import {
  SafeAreaView,
  View,
  Text,
  ImageBackground,
  FlatList,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { compareAsc, format } from 'date-fns';
import requestWithEndUrl from '../../../network/request';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import CmmsColors, {
  joGreenAlpha,
  joSilverAlpha,
  joYellowAlpha,
} from '../../../common/CmmsColors';
import { CmmsText } from '../../../common/components/CmmsText';
import DynamicSearchBar from '../../check-list/components/DynamicSearchBar';
import { actionSetLoading } from '../../../action/ActionSettings';
import TextWithPlaceHolder from '../../../common/components/TextWithPlaceHolder';
import CustomerDetailsTexts from './CustomerDetailsTexts';
import RadioForm from 'react-native-simple-radio-button';
import { getAssetLabel, getAssetTypeLabel } from './JobOrderReport';
import JobOrderHeader from './JobOrderHeader';
import { getWOInternalJODetailsById } from '../../supervisor/service/getWOInternalJODetailsById';
import { convertToSeparatedArrays } from '../../supervisor/service/WOInternalJODetailsModel';
import ThumbnailImage from '../../components/ImageFullScreen/ThumbnailImage';
import { appStyle } from '../../utils/theme/appStyle';
export default TodayJobOrderIssued = ({ navigation, route: { params } }) => {
  console.log('TodayJobOrderIssued', { params });
  const dispatch = useDispatch();
  const { AppTextData } = useSelector((state) => state.AppTextViewReducer);
  // const { loggedUser: { TechnicianID, TechnicianName } } = useSelector((state) => state.LoginReducer);
  const [jobOrderIssued, setJobOrderIssued] = useState({});
  const convertMinsToTime = (mins) => {
    let hours = Math.floor(mins / 60);
    let minutes = mins % 60;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}.${minutes}`;
  };
  const [assetList, setAssetList] = useState([
    // {
    // 	AssetRegID: 3094,
    // 	Asset: 'S&S L-H6  PANINI',
    // 	AssetCode: 'S&S L-H6'
    // },
  ]);
  const [dataList, setDataList] = useState([]);
  const [imageList, setImageList] = useState([]);
  useEffect(() => {
    dispatch(actionSetLoading(true));
    // http://213.136.84.57:2256/api/ApkTechnician/getchecklistassetlist?JOID=3157&SEID=3
    requestWithEndUrl(`${API_TECHNICIAN}getchecklistassetlist`, {
      JOID: params.id,
      SEID: params.SEID,
    })
      .then((res) => {
        console.log('getchecklistassetlist', { res });
        if (res.status != 200) throw Error(res.statusText);
        else if (res.data) {
          var assetDumList = res.data;
          // [{
          // 		AssetRegID: 3094,
          // 		Asset: 'S&S L-H6  PANINI',
          // 		AssetCode: 'S&S L-H6',
          // 		LocationName:'Edappal'
          // 	}]
          setAssetList(assetDumList);
          dispatch(actionSetLoading(false));
          if (assetDumList.length == 1) {
            setSelectedAsset(assetDumList[0]);
            return;
          }
        }
      })
      .catch(function (error) {
        dispatch(actionSetLoading(false));
        // alert(AppTextData.)
        console.log('SparepartsRequired Error: ', error);
      });
  }, []);
  useEffect(() => {
    dispatch(actionSetLoading(true));
    console.log('Fetching job order details using api GetJobOrderDetailsByID params:->', params.id, params.SEID);
    requestWithEndUrl(`${API_TECHNICIAN}GetJobOrderDetailsByID`, {
      ID: params.id,
      SEID: params.SEID,
    })
      .then((res) => {
        dispatch(actionSetLoading(false));
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        console.log('response:', data);
        setJobOrderIssued(data);
      })
      .catch(function (error) {
        console.log('Joborder_issued Erro: ', error);
      });
  }, []);


  useEffect(() => {
    getWOInternalJODetailsById(params.workId)
      .then((response) => {
        const { data, image } = convertToSeparatedArrays(response);
        setDataList(data);
        setImageList(image);
      })
      .catch((error) => {
        console.log('Error:', error);
      });
  }, []);

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
      {Object.keys(jobOrderIssued).length > 0 && (
        <View style={{ flex: 1, padding: 8, paddingHorizontal: 8 }}>
          <JobOrderHeader
            JONo={jobOrderIssued.RefNo}
            Date={format(new Date(jobOrderIssued.IssueDate), 'dd/MM/yyyy')}
            AssetSate={jobOrderIssued.AssetSate}
            ComplaintType={jobOrderIssued.ComplaintType}
            Customer={jobOrderIssued.Customer}
            Asset={jobOrderIssued.Asset}
            styles={styles}
          // format={format}
          // StyleMainHead={styles.MainHead}
          // StyleSubHead={styles.SubHead}
          />
          {/* <CmmsText style={styles.MainHead}>JoNo : {jobOrderIssued.RefNo} - {format(new Date(jobOrderIssued.IssueDate), 'dd/MM/yyyy')}</CmmsText>
						<CmmsText style={styles.MainHead}>Jo Type : {jobOrderIssued.ComplaintType}{getAssetLabel(jobOrderIssued.AssetSate)}</CmmsText> */}
          {/* <TextWithPlaceHolder/> */}
          {/* <CmmsText style={styles.MainHead}>
						JO: {jobOrderIssued.RefNo} ID: {format(new Date(jobOrderIssued.IssueDate), 'dd/MM/yyyy')} SD:{' '}
						{format(new Date(jobOrderIssued.ScheduleDate), 'dd/MM/yyyy')}
					</CmmsText> */}
          {/* <View style={{flexDirection:'row',borderWidth:1}}>
						<CmmsText style={{...styles.SubHead,flex:1}}>
						Customer: {jobOrderIssued.Customer.Name}
					</CmmsText>
					<CmmsText style={styles.SubHead}>
						Branch: {jobOrderIssued.Customer.Branch}
					</CmmsText>
					</View> */}

          {/* <CmmsText style={styles.SubHead}>
					{jobOrderIssued.Department}, {jobOrderIssued.Location}
					</CmmsText> */}
          {/* {jobOrderIssued.Customer&&<CustomerDetailsTexts Customer={jobOrderIssued.Customer} styles={styles.SubHead}/>}
					<CmmsText style={{color:'black',textAlign:'center'}}>
							Asset : {jobOrderIssued.Asset}

						</CmmsText> */}
          {/* {JobOrderReportData.AssetCode} - {JobOrderReportData.Asset} */}

          {/* <CmmsText style={{ ...styles.SubHead, fontSize: 14 }}>
						{format(new Date(jobOrderIssued.WorkFrom), 'dd/MM/yyyy hh:mm a')} to{' '}
						{format(new Date(jobOrderIssued.WorkTo), 'dd/MM/yyyy hh:mm a')}
					</CmmsText> */}

          {jobOrderIssued.SEDtls.map((item, index) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
              }}>
              <Icon name="circle" size={12} color={getSeColor(item.SEStatus)} />
              <CmmsText style={[styles.SubHeadBottomList, { marginStart: 5 }]}>
                {item.SE} - {item.TypeOfActivity} - {item.Date}
                {item.ToDate != '' ? ` to ${item.ToDate}` : ''}
              </CmmsText>
            </View>
          ))}

          {/* <FlatList
						keyExtractor={(item, index) => index.toString()}
						data={jobOrderIssued.SEDtls}
						renderItem={({ item, index }) => (
							
						)}
					/> */}
          {/* <View
                                style={styles.SubHeadDetTitle}> */}
          {/* {jobOrderIssued.AssetSate!=0&&<RadioForm
							style={{marginTop:10}}
			radio_props={[
				
				{label: 'Warranty ',},
				{label: 'Contract ', },
				{label: 'Chargeable ',}
			]}
			initial={jobOrderIssued.AssetSate-1}
			formHorizontal={true}
			labelHorizontal={true}
			buttonColor={CmmsColors.logoBottomGreen}
			selectedButtonColor={CmmsColors.logoTopGreen}
			buttonSize={14}
							animation={true}
							/>} */}

          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}>
            <View style={{ flex: 1 }}>
              {/* <View> */}

              {/* </View> */}

              {/* </View> */}
              {jobOrderIssued.ActivityDtls.length > 0 && (
                <View>
                  <CmmsText style={styles.SubheadDet}>
                    {AppTextData.txt_Activity_Details}
                  </CmmsText>
                  {jobOrderIssued.ActivityDtls.map((item, index) => (
                    <CmmsText style={styles.item}>
                      {index + 1}. {item.Activity} ({item.TypeOfActivity}-
                      {convertMinsToTime(item.MHrs)}Hrs)
                    </CmmsText>
                  ))}
                  {/* <FlatList
								nestedScrollEnabled={true}
								keyExtractor={(item, index) => index.toString()}
								data={jobOrderIssued.ActivityDtls}
								renderItem={({ item, index }) => (
									
								)}
							/> */}
                </View>
              )}

              {jobOrderIssued.SparePartsDtls.length > 0 && (
                <View>
                  <CmmsText style={styles.SubheadDet}>
                    {/* {AppTextData.txt_Spare_Parts_Required} */}
                    {AppTextData.txt_SpareParts}
                  </CmmsText>
                  {jobOrderIssued.SparePartsDtls.map((item, index) => (
                    <Text style={styles.item}>
                      {index + 1}. {item?.SpareParts} (
                      {item?.Qty > 0
                        ? `${AppTextData?.txt_Req} : ${item?.Qty} ${item?.UOM}`
                        : ''}
                      {item?.Qty > 0 && item.AQty > 0 ? ' / ' : ""}
                      {item?.AQty > 0
                        ? `${AppTextData?.txt_Used} : ${item?.AQty} ${item?.UOM}`
                        : ''}
                      )
                    </Text>
                  ))}
                  {/* <FlatList
								nestedScrollEnabled={true}
								keyExtractor={(item, index) => index.toString()}
								data={jobOrderIssued.SparePartsDtls}
								renderItem={({ item, index }) => (
									
								)}
							/> */}
                </View>
              )}

              {jobOrderIssued.Remarks != '' && (
                <View>
                  <CmmsText style={styles.SubheadDet}>
                    {AppTextData.txt_Remark}
                  </CmmsText>

                  <CmmsText style={styles.item}>
                    {jobOrderIssued.Remarks}
                  </CmmsText>
                </View>
              )}
              {jobOrderIssued.Tools != '' && (
                <View>
                  <CmmsText style={styles.SubheadDet}>
                    {AppTextData.txt_Tools}
                  </CmmsText>
                  {jobOrderIssued.Tools.split(',').map((item, index) => (
                    <CmmsText style={styles.item}>
                      {index + 1}. {item}
                    </CmmsText>
                  ))}
                </View>
              )}
              {params.ServiceType == 2 && (
                <>
                  <CmmsText style={styles.SubheadDet}>{'Assets'}</CmmsText>
                  <DynamicSearchBar
                    searchFilterList={assetList}
                    visibleSearchView={false}
                    titleCaptionStyle={{ fontSize: 10 }}
                  />
                </>
              )}
            </View>
            {/* vbn commented this because the ImageList also showing the same */}
            {/* {jobOrderIssued.Image > 0 && (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={jobOrderIssued.Image}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                  //{"id":1,"AttachmentUrl":Image/JOCheckList/sample.jpg"}
                  console.log('jobOrderIssued-Image', { item });
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("FullScreenImageView", { imageUrl: item.ImageUrl })
                      }}
                    >
                      <Image
                        style={{ width: 100, height: 100, marginEnd: 5 }}
                        source={{
                          uri: item.ImageUrl
                        }}
                        defaultSource={require('../../../assets/placeholders/no_image.png')}
                      />
                    </TouchableOpacity>
                  );
                }} />
            )} */}
            <FlatList
              data={dataList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => <CmmsText
                style={appStyle.iwoList}>
                 {item}
              </CmmsText>}
            />
            {/* Display images */}
            {imageList.length > 0 && (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={imageList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                  //{"id":1,"AttachmentUrl":Image/JOCheckList/sample.jpg"}
                  console.log('jobOrderIssued-Image', { item });
                  return (
                    <ThumbnailImage 
                      imageUrl={item}
                      disableOnPress={false}
                    />
                  );
                }} />
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );

  function getSeColor(status) {
    switch (status) {
      case 1:
        return CmmsColors.darkRed;
      case 2:
        return CmmsColors.yellow;
      case 3:
        return 'green';
      default:
        return CmmsColors.coolGray;
    }
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22,
  },
  item: {
    padding: 5,
  },
  MainHead: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'black',
  },
  SubHead: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'black',
  },
  SubHeadBottom: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  SubHeadBottomList: {
    fontSize: 12,
  },
  SubheadDet: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
    paddingVertical: 4,
    backgroundColor: CmmsColors.logoTopGreen,
  },
  SubHeadDetTitle: {
    marginTop: 10,
    padding: 2,
    height: 25,
    paddingHorizontal: 20,
    backgroundColor: CmmsColors.logoTopGreen,
  },
  section: { flex: 1 },
});
