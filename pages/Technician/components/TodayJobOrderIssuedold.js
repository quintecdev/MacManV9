import React, {useState, useEffect} from 'react';
import {API_TECHNICIAN} from '../../../network/api_constants';
import {
  SafeAreaView,
  View,
  Text,
  ImageBackground,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import {compareAsc, format} from 'date-fns';
import requestWithEndUrl from '../../../network/request';
import {useSelector, useDispatch} from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import CmmsColors, {
  joGreenAlpha,
  joSilverAlpha,
  joYellowAlpha,
} from '../../../common/CmmsColors';
import {CmmsText} from '../../../common/components/CmmsText';
import DynamicSearchBar from '../../check-list/components/DynamicSearchBar';
import {actionSetLoading} from '../../../action/ActionSettings';
import TextWithPlaceHolder from '../../../common/components/TextWithPlaceHolder';
import CustomerDetailsTexts from './CustomerDetailsTexts';
import RadioForm from 'react-native-simple-radio-button';
import {getAssetLabel, getAssetTypeLabel} from './JobOrderReport';
import JobOrderHeader from './JobOrderHeader';

export default TodayJobOrderIssued = ({navigation, route: {params}}) => {
  console.log('TodayJobOrderIssued', {params});
  const dispatch = useDispatch();
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  // const { loggedUser: { TechnicianID, TechnicianName } } = useSelector((state) => state.LoginReducer);
  const [jobOrderIssued, setJobOrderIssued] = useState({});
  const [Tools, setTools] = useState([]);
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

  useEffect(() => {
    dispatch(actionSetLoading(true));
    // http://213.136.84.57:2256/api/ApkTechnician/getchecklistassetlist?JOID=3157&SEID=3
    requestWithEndUrl(`${API_TECHNICIAN}getchecklistassetlist`, {
      JOID: params.id,
      SEID: params.SEID,
    })
      .then((res) => {
        console.log('getchecklistassetlist', {res});
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
    console.log(
      'params for GetJobOrderDetailsById API call--->>' + 'ID:',
      params.id,
      'SEID: ',
      params.SEID,
    );
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
        if (data) {
          console.log('response:', data);

          setJobOrderIssued(data);
          if (data.Tools != '') {
            alert('inside the Tools if condition');
            setTools(data?.Tools?.split(','));
          }
        } else {
          AppTextData.txt_somthing_wrong_try_again;
        }
        //{...data,Customer:{Name:'Jiju',wife:'suma',Branch:null,Location:'null',ContactNumber:10 }}
        // setJobOrderIssued({ ID: 4506,
        // 	RefNo: '22',
        // 	WorkAllotmentID: 0,
        // 	Date: 1659073200000,
        // 	WorkFrom: 1659061800000,
        // 	WorkTo: 1659094200000,
        // 	IssueDate: 1659073200000,
        // 	BranchID: 0,
        // 	PeriodID: 0,
        // 	WorkDescription: '',
        // 	Attachment: [],
        // 	EWHours: 300,
        // 	Remarks: 'test123rstgertgeryeyheryretyh\nqwertyerygerhgrty4ey',
        // 	AssetCode: '010284',
        // 	Asset: 'GARLAND OPEN ELEMENT TOP RANGE 36ES33',
        // 	MachineFittings: 'Machine',
        // 	Department: 'General',
        // 	Location: 'MALL LEVEL',
        // 	Category: 'General',
        // 	Brand: 'GARLAND',
        // 	ComplaintType: 'Preventive',
        // 	ActivityDtls:
        // 	 [ { FromWhere: 1,
        // 		 ID: 5826,
        // 		 ActivityID: 27,
        // 		 Activity: 'Inspection',
        // 		 TypeOfActivity: 'General',
        // 		 MHrs: 300 },
        // 	   { FromWhere: 3,
        // 		 ID: 5827,
        // 		 ActivityID: 30,
        // 		 Activity: 'Cleaning',
        // 		 TypeOfActivity: 'General',
        // 		 MHrs: 120 },
        // 		 { FromWhere: 3,
        // 			ID: 5827,
        // 			ActivityID: 30,
        // 			Activity: 'Cleaning',
        // 			TypeOfActivity: 'General',
        // 			MHrs: 120 },

        // 		],
        // 	SEDtls:
        // 	 [ { chk: false,
        // 		 ID: 10,
        // 		 SE: 'Thap',
        // 		 Code: 'Thap',
        // 		 TypeOfActivity: 'General',
        // 		 SEStatus: 3,
        // 		 Date: 1659073227000,
        // 		 ToDate: 1659073236000 } ],
        // 	SparePartsDtls:
        // 	 [ { chk: false,
        // 		 ID: 4604,
        // 		 SparePartsID: 575,
        // 		 SpareParts: 'PIPE L=400mm',
        // 		 UOMID: 22,
        // 		 UOM: 'PCS',
        // 		 Qty: 2,
        // 		 AQty: 2,
        // 		 FromWhere: 1 },
        // 	   { chk: false,
        // 		 ID: 4605,
        // 		 SparePartsID: 576,
        // 		 SpareParts: 'PIPE L=800mm',
        // 		 UOMID: 22,
        // 		 UOM: 'PCS',
        // 		 Qty: 1,
        // 		 AQty: 1,
        // 		 FromWhere: 1 },
        // 	   { chk: false,
        // 		 ID: 4606,
        // 		 SparePartsID: 587,
        // 		 SpareParts: 'TOP BRACKET',
        // 		 UOMID: 22,
        // 		 UOM: 'PCS',
        // 		 Qty: 0,
        // 		 AQty: 0,
        // 		 FromWhere: 3 } ],
        // 	OverAllStatus: 1,
        // 	ScheduleDate: 1659063600000 })
      })
      .catch(function (error) {
        console.log('Joborder_issued Erro: ', error);
      });
  }, []);

  const ToolsList = Tools?.map((item, index) => (
    <CmmsText style={styles.item}>
      {index + 1}. {item}
    </CmmsText>
  ));
  // const SparePartsList = jobOrderIssued?.SparePartsDtls?.map((item, index) => (
  //   <CmmsText style={styles.item}>
  //     {index + 1}. {item.SpareParts} ({item.Qty} {item.UOM})
  //   </CmmsText>
  // ));
  // const Activilitylist = jobOrderIssued?.ActivityDtls?.map((item, index) => (
  //   <CmmsText style={styles.item}>
  //     {index + 1}. {item.Activity} ({item.TypeOfActivity}-
  //     {convertMinsToTime(item.MHrs)}Hrs)
  //   </CmmsText>
  // ));
  return (
    <SafeAreaView style={{flex: 1}}>
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
        <View style={{flex: 1, padding: 8, paddingHorizontal: 8}}>
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

          {jobOrderIssued?.SEDtls.map((item, index) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
              }}>
              <Icon name="circle" size={12} color={getSeColor(item.SEStatus)} />
              <CmmsText style={[styles.SubHeadBottomList, {marginStart: 5}]}>
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
            contentContainerStyle={{flexGrow: 1}}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}>
            <View style={{flex: 1}}>
              {/* <View> */}

              {/* </View> */}

              {/* </View> */}
              {jobOrderIssued?.ActivityDtls.length > 0 && (
                <View>
                  <CmmsText style={styles.SubheadDet}>
                    {AppTextData.txt_Activity_Details}
                  </CmmsText>
                  {/* {Activilitylist && Activilitylist} */}
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

              {jobOrderIssued?.SparePartsDtls.length > 0 && (
                <View>
                  <CmmsText style={styles.SubheadDet}>
                    {AppTextData.txt_Spare_Parts_Required}
                  </CmmsText>
                  {/* {SparePartsList && SparePartsList} */}
                  {jobOrderIssued.SparePartsDtls.map((item, index) => (
                    <CmmsText style={styles.item}>
                      {index + 1}. {item.SpareParts} ({item.Qty} {item.UOM})
                    </CmmsText>
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
              {/* added by vbn Tools*/}
              {jobOrderIssued.Tools && (
                <View>
                  <CmmsText style={styles.SubheadDet}>
                    {AppTextData.txt_Tools}
                  </CmmsText>
                  {ToolsList && ToolsList}
                  {/* {Tools?.map((item, index) => (
                    <CmmsText style={styles.item}>
                      {index + 1}. {item}
                    </CmmsText>
                  ))} */}
                  {/* <FlatList
								nestedScrollEnabled={true}
								keyExtractor={(item, index) => index.toString()}
								data={jobOrderIssued.SparePartsDtls}
								renderItem={({ item, index }) => (
									
								)}
							/> */}
                </View>
              )}
              {params.ServiceType == 2 && (
                <>
                  <CmmsText style={styles.SubheadDet}>{'Assets'}</CmmsText>
                  <DynamicSearchBar
                    searchFilterList={assetList}
                    visibleSearchView={false}
                    titleCaptionStyle={{fontSize: 10}}
                  />
                </>
              )}
            </View>
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
  section: {flex: 1},
});
