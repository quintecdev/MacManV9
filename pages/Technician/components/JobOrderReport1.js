import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Alert,
  ImageBackground,
  FlatList,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {Dropdown} from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {compareAsc, format} from 'date-fns';
import requestWithEndUrl from '../../../network/request';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import {
  actionSetLoading,
  actionSetRefreshing,
  actionSetRefreshingPage,
} from '../../../action/ActionSettings';
import {useSelector, useDispatch} from 'react-redux';
import {API_TECHNICIAN} from '../../../network/api_constants';
import CmmsColors from '../../../common/CmmsColors';
import {Dialog} from 'react-native-simple-dialogs';
import CustomerReview from './CustomerReview';
import Icon from 'react-native-vector-icons/FontAwesome';
import ic_play from '../../../assets/icons/ic_play.png';
import {
  CmmsText,
  CTextHint,
  CTextThin,
} from '../../../common/components/CmmsText';
import {actionSetJobOrderReport} from '../../../action/ActionJobOrderReport';
import {Picker} from '@react-native-picker/picker';
import CustomerDetailsTexts from './CustomerDetailsTexts';
import RadioForm from 'react-native-simple-radio-button';
import JobOrderHeader from './JobOrderHeader';

const Height = Dimensions.get('window').height;
const Width = Dimensions.get('screen').width;

export const getAssetTypeLabel = (index) =>
  ['Warranty ', 'Contract ', 'Chargeable'][index];

export const getAssetLabel = (AssetSate) =>
  AssetSate != 0 ? ` - ${getAssetTypeLabel(AssetSate - 1)}` : '';

export default JobOrderReport = ({navigation, route: {params}}) => {
  console.log('JobOrderReport_page', params);
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const {JobOrderReportData} = useSelector((state) => {
    // console.log({JobOrderReportReducer_state: state.JobOrderReportReducer});
    return state.JobOrderReportReducer;
  });
  // console.log({JobOrderReportData});
  const dispatch = useDispatch();
  // const [ jobOrderReport, SetJobOrderReport ] = useState({});
  const [visibleReviewDlg, setVisibleReviewDlg] = useState(false);
  const [visibleClgwDlg, setVisibleClgDlg] = useState(false);
  const [custodianPswd, setCustodianPswd] = useState('');
  const [reasonList, setReasonList] = useState([]);
  const [dataObject, setDataObject] = useState([]);
  const [dataReason, setDataReason] = useState([]);
  const [dataDamage, setDataDamage] = useState([]);
  const [odrDialoge, setOdrDialoge] = useState(false);
  const [valueDamage, setValueDamage] = useState(0);
  const [valueReason, setValueReason] = useState(0);
  const [valueObject, setValueObject] = useState(0);
  const [value, setValue] = useState(null);
  const [assetRegID, setAssetRegID] = useState();
  const [isFocus, setIsFocus] = useState(false);
  const [filterType, setFilterType] = useState(0);
  const [FilterData, setFilterData] = useState('');
  const [count, setCount] = useState(1);
  // const [selectedDefaultReason,setSelectedDefaultReason] = useState(`${JobOrderReportData.ReasonID}`)

  function getObjectDameCause(AssetRegID) {
    requestWithEndUrl(
      `${API_TECHNICIAN}GetServiceReportAdditionalData?FilterData=` +
        FilterData +
        `&FilterType=` +
        filterType +
        `&AssetRegID=` +
        AssetRegID,
    ).then((response) => {
      console.warn('no way ' + JSON.stringify(response.data[0]));
      // setDataObject(response.data[0]);

      object = response.data[0].map((item) => {
        return {
          label: item.Name,
          value: item.ID,
        };
      });
      damage = response.data[1].map((item) => {
        return {
          label: item.Name,
          value: item.ID,
        };
      });
      reason = response.data[2].map((item) => {
        return {
          label: item.Name,
          value: item.ID,
        };
      });
      setDataObject(object);
      setDataDamage(damage);
      setDataReason(reason);
    });
  }
  const renderItemdrop = (item) => {
    return (
      <View style={styles.item}>
        <Text style={styles.selectedTextStyle}>{item.label}</Text>
        <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
      </View>
    );
  };
  useEffect(() => {
    console.log('params:', params);
    dispatch(actionSetLoading(true));
    requestWithEndUrl(`${API_TECHNICIAN}GetServiceReportDetailsByJOID`, {
      SEID: params.SEID,
      ID: params.JOID,
    })
      .then((response) => {
        setAssetRegID(response.data.AssetRegID);
        // SetJobOrderReport(response.data)
        dispatch(actionSetLoading(false));
        dispatch(
          actionSetJobOrderReport(
            response.data,
            //  {...response.data,IsRescheduled:true,ReasonID:2}
          ),
        );
        getReasonList();
        getObjectDameCause(response.data.AssetRegID);

        console.warn('jobOrderReport Asset RegID', response.data);
      })
      .catch(function (error) {
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
    directionalOffsetThreshold: 80,
  };

  function getReasonList() {
    //http://213.136.84.57:4545/api/ApkTechnician/GetReasons
    requestWithEndUrl(`${API_TECHNICIAN}GetReasons`)
      .then((res) => {
        console.log('GetReasons', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        if (data.length > 0) {
          setReasonList(data);
          //   if(JobOrderReportData.ReasonID!=0){
          // 			setSelectedDefaultReason(data.filter(rsn=>rsn.ID==JobOrderReportData.ReasonID)[0])
          // 		}
          // setSelectedReasonId(data[0].ID)
        }
      })
      .catch((err) => {
        console.error('URL_GetReasons', {err});
      });
  }
  // added by vbn
  const AddSparepartsCondtionCheck = () => {
    var IsWorking = JobOrderReportData.ActivityDtls.filter(function (item) {
      return item.Status == 2 || item.Status == 0;
    });
    console.log(
      'what is the filter function result--->>>',
      JobOrderReportData.AdditionalActivityDtls,
    );
    if (
      JobOrderReportData.AdditionalActivityDtls?.length > 0 ||
      IsWorking.length > 0
    )
      navigation.navigate('AdditionalSpareParts', {
        JoId: JobOrderReportData.JOID,
        SeId: params.SEID,
        AssetRegID: JobOrderReportData.AssetRegID,
        AssetCode: JobOrderReportData.AssetCode,
      });
    else alert('You must enter atleast one activity to add spareparts');
  };
  //vbn
  CloseAllJob = () => {
    var RequeredSpareBalance =
      JobOrderReportData.AdditionalSparePartsDtls.filter(function (item) {
        return item.RQty == 1;
      });
    console.log(
      'is there any required spare??????',
      RequeredSpareBalance.length,
    );
    if (RequeredSpareBalance.length > 0) {
      Alert.alert(
        'Sorry',
        'You are unable to close the job. Please use the provided spare parts.',
        [
          {
            text: 'OK',
          },
        ],
        {
          cancelable: true,
        },
      );
    } else {
      JobOrderReportData.ActivityDtls.forEach((Activity) => {
        console.log({Activity});
        Activity.Status = 1;
      });
      console.log({ActivityDtls: JobOrderReportData.ActivityDtls});
      dispatch(actionSetJobOrderReport({...JobOrderReportData}));
    }
  };
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

      {Object.keys(JobOrderReportData).length > 0 && (
        <ScrollView>
          <View
            style={{
              flex: 1,
              paddingHorizontal: '4%',
              paddingTop: '5%',
              paddingBottom: '20%',
            }}>
            <JobOrderHeader
              JONo={JobOrderReportData.JONo}
              Date={format(new Date(JobOrderReportData.Date), 'dd/MM/yyyy')}
              AssetSate={JobOrderReportData.AssetSate}
              ComplaintType={JobOrderReportData.ComplaintType}
              Customer={JobOrderReportData.Customer}
              Asset={JobOrderReportData.Asset}
              // format={format}
              styles={styles}
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
              renderItem={({item, index}) => (
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
                alignItems: 'center',
              }}>
              <CmmsText
                style={{
                  fontWeight: 'bold',
                }}>
                {AppTextData.txt_RefNo} :{JobOrderReportData.SRefNo}
              </CmmsText>
              <CmmsText
                style={{
                  fontWeight: 'bold',
                }}>
                {' '}
                {AppTextData.txt_Date}
                {JobOrderReportData.Date != 0
                  ? format(new Date(JobOrderReportData.SDate), 'dd/MM/yyyy')
                  : JobOrderReportData.Date}
              </CmmsText>
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <View style={{flex: 3}}>
                <CmmsText
                  style={{
                    fontSize: 10,
                    paddingVertical: 2,
                    fontWeight: 'bold',
                    marginTop: 6,
                  }}>
                  {AppTextData.txt_From} {JobOrderReportData.From}
                </CmmsText>
              </View>

              <View style={{flex: 2}}>
                <CmmsText
                  style={{
                    fontSize: 10,
                    paddingVertical: 2,
                    fontWeight: 'bold',
                    marginTop: 6,
                  }}>
                  {AppTextData.txt_To}: {JobOrderReportData.To}{' '}
                </CmmsText>
              </View>

              <View
                style={{flex: 3, flexDirection: 'row', alignItems: 'center'}}>
                <CheckBox disabled value={JobOrderReportData.Days} />
                <CmmsText
                  style={{
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}>
                  {' '}
                  {AppTextData.txt_Next_Day}{' '}
                </CmmsText>
              </View>

              <View style={{flex: 2}}>
                <CmmsText
                  style={{
                    fontSize: 10,
                    paddingVertical: 2,
                    fontWeight: 'bold',
                    marginTop: 6,
                  }}>
                  {AppTextData.txt_Break}: {JobOrderReportData.BreakMinute}{' '}
                  {AppTextData.txt_min}
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
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                marginVertical: '5%',
              }}>
              <View style={{flex: 1}}>
                <CmmsText
                  style={{
                    color: CmmsColors.logoBottomGreen,
                    fontWeight: '700',
                    fontSize: 15,
                  }}>
                  {AppTextData.txt_Activity_Details}
                </CmmsText>
              </View>
              <View style={{flex: 1}}>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 5,
                    elevation: 10,
                    alignSelf: 'flex-end',
                    height: Height / 30,
                    width: Width / 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    CloseAllJob(); //vbn
                    // JobOrderReportData.ActivityDtls.forEach((Activity) => {
                    //   console.log({Activity});
                    //   Activity.Status = 1;
                    // });
                    // console.log({
                    //   ActivityDtls: JobOrderReportData.ActivityDtls,
                    // });
                    // dispatch(actionSetJobOrderReport({...JobOrderReportData}));
                  }}>
                  <CmmsText
                    style={{
                      color: CmmsColors.logoBottomGreen,
                      fontWeight: '600',
                    }}>
                    {'Closed All'}
                  </CmmsText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{marginTop: '2%'}}>
              <FlatList
                showsVerticalScrollIndicator={false}
                data={JobOrderReportData.ActivityDtls}
                extraData={count}
                renderItem={({item, index}) => {
                  return (
                    <GestureRecognizer
                      onSwipeLeft={(state) => {
                        item.Status = item.Status != 2 ? 2 : 0;

                        dispatch(
                          actionSetJobOrderReport({...JobOrderReportData}),
                        );
                      }}
                      onSwipeRight={(state) => {
                        item.Status = item.Status != 1 ? 1 : 0;
                        dispatch(
                          actionSetJobOrderReport({...JobOrderReportData}),
                        );
                      }}
                      config={config}
                      style={{
                        flex: 1,
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          console.error(index);
                          if (item.Status == 0) {
                            JobOrderReportData.ActivityDtls[index].Status = 1;
                            setCount(count + 1);
                          } else if (item.Status == 1) {
                            JobOrderReportData.ActivityDtls[index].Status = 2;
                            setCount(count + 1);
                          } else if ((item.Status = 2)) {
                            JobOrderReportData.ActivityDtls[index].Status = 0;
                            setCount(count + 1);
                          }
                          // item.Status = item.Status != 2 ? 2 : 0;
                          // dispatch(
                          //   actionSetJobOrderReport({...JobOrderReportData}),
                          // );
                        }}
                        style={{
                          marginBottom: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <View
                          style={
                            item.Status == 0
                              ? styles.ActivityPending
                              : item.Status == 2
                              ? styles.ActivityWIP
                              : styles.ActivityClosed
                          }></View>
                        <View>
                          <CmmsText
                            numberOfLines={2}
                            style={{
                              color: '#000',
                              marginStart: 8,
                            }}>
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
              <CmmsText style={styles.SubheadDet}>
                {AppTextData.txt_Spare_Parts_Required}
              </CmmsText>
            </View>
            <View style={{paddingHorizontal: '3%', marginTop: '3%'}}>
              <FlatList
                data={JobOrderReportData.SparePartsDtls}
                renderItem={({item, index}) => (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                      alignItems: 'center',
                      marginVertical: '0.5%',
                      height: Height / 20,
                      width: '100%',
                      // backgroundColor:'#fff'
                    }}>
                    <View
                      style={{
                        flex: 8,
                        paddingRight: '5%',
                        borderWidth: 0.6,
                        borderColor: '#777',
                        height: '100%',
                        width: '100%',
                        paddingHorizontal: '3%',
                        justifyContent: 'center',
                        borderRadius: 5,
                        marginRight: 5,
                      }}>
                      <CmmsText
                        style={{
                          fontSize: 13,
                          fontWeight: 'bold',
                        }}>
                        {index + 1}. {item.SpareParts}({item.UOM})
                      </CmmsText>
                    </View>
                    <View style={{flex: 1, marginRight: 3}}>
                      <TextInput
                        style={{
                          flex: 1,
                          paddingLeft: '20%',
                          borderRadius: 5,
                          elevation: 3,
                          color: 'black',
                          height: 35,
                          backgroundColor: '#FFFFFF',
                          fontSize: 9,
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
                          dispatch(
                            actionSetJobOrderReport({...JobOrderReportData}),
                          );
                          console.log(
                            'SparePartsDtls',
                            JobOrderReportData.SparePartsDtls,
                          );
                        }}
                        value={`${item.AQty}`}
                      />
                    </View>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
            <View style={{marginTop: '2%'}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingLeft: '2%',
                  justifyContent: 'space-around',
                }}>
                <View style={{alignItems: 'flex-end', flex: 1}}>
                  <CmmsText style={{color: 'grey'}}>Object : </CmmsText>
                </View>
                <View style={{alignItems: 'flex-start', flex: 5}}>
                  <Dropdown
                    style={[
                      styles.dropdown,
                      isFocus && {borderColor: CmmsColors.logoTopGreen},
                    ]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={dataObject}
                    search
                    maxHeight={400}
                    labelField="label"
                    valueField="value"
                    placeholder={
                      !isFocus
                        ? JobOrderReportData?.Object == null
                          ? 'Select item'
                          : JobOrderReportData?.Object
                        : '...'
                    }
                    searchPlaceholder="Search..."
                    value={valueObject}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={(item) => {
                      setValueObject(item.ID);
                      setIsFocus(false);
                    }}
                    // renderItem={renderItemdrop}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.icon}
                        color={
                          isFocus
                            ? CmmsColors.logoBottomGreen
                            : CmmsColors.logoTopGreen
                        }
                        name="Safety"
                        size={20}
                      />
                    )}
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingLeft: '2%',
                  justifyContent: 'space-around',
                  marginTop: 5,
                }}>
                <View style={{alignItems: 'flex-end', flex: 1}}>
                  <CmmsText style={{color: 'grey'}}>Damage : </CmmsText>
                </View>
                <View style={{alignItems: 'flex-start', flex: 5}}>
                  <Dropdown
                    style={[
                      styles.dropdown,
                      isFocus && {borderColor: CmmsColors.logoTopGreen},
                    ]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={dataDamage}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    // renderItem={renderItemdrop}
                    placeholder={
                      !isFocus
                        ? JobOrderReportData?.Complaint == null
                          ? 'Select item'
                          : JobOrderReportData?.Complaint
                        : '...'
                    }
                    searchPlaceholder="Search..."
                    value={valueDamage}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={(item) => {
                      setValueDamage(item.value);
                      setIsFocus(false);
                    }}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.icon}
                        color={
                          isFocus
                            ? CmmsColors.logoBottomGreen
                            : CmmsColors.logoTopGreen
                        }
                        name="Safety"
                        size={20}
                      />
                    )}
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingLeft: '2%',
                  justifyContent: 'space-around',
                  marginTop: 5,
                }}>
                <View style={{alignItems: 'flex-end', flex: 1}}>
                  <CmmsText style={{color: 'grey'}}>Cause : </CmmsText>
                </View>

                <View style={{alignItems: 'flex-start', flex: 5}}>
                  {/* <TouchableOpacity
                    style={{
                      width: '100%',
                      height: Height / 30,
                      backgroundColor: '#fff',
                      borderRadius: 10,
                      elevation: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}>
                    <View style={{flex: 5, paddingLeft: '5%'}}>
                      <Text>hello</Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'center'}}>
                      <Image
                        source={{
                          uri: 'https://cdn-icons-png.flaticon.com/512/137/137621.png',
                        }}
                        style={{height: 20, width: 20}}></Image>
                    </View>
                  </TouchableOpacity> */}
                  <Dropdown
                    style={[
                      styles.dropdown,
                      isFocus && {borderColor: CmmsColors.logoTopGreen},
                    ]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={dataReason}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    // renderItem={renderItemdrop}
                    placeholder={
                      !isFocus
                        ? JobOrderReportData.CauseList == null
                          ? 'Select item'
                          : JobOrderReportData.CauseList
                        : '...'
                    }
                    searchPlaceholder="Search..."
                    value={valueReason}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={(item) => {
                      setValueReason(item.value);
                      setIsFocus(false);
                    }}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.icon}
                        color={
                          isFocus
                            ? CmmsColors.logoBottomGreen
                            : CmmsColors.logoTopGreen
                        }
                        name="Safety"
                        size={20}
                      />
                    )}
                  />
                </View>
              </View>
            </View>
            {/* <View style={styles.SubHeadDetTitle}>
              <CmmsText style={styles.SubheadDet}>
                {AppTextData.txt_Remark}
              </CmmsText>
            </View> */}
            <View style={{flexDirection: 'row', marginTop: '7%'}}>
              <TextInput
                style={{
                  color: 'black',
                  backgroundColor: '#FFFFFF',
                  width: '85%',
                  borderRadius: 10,
                  // elevation:5,
                  borderColor: '#777',
                  // borderWidth:0.5,
                  elevation: 2,
                  paddingLeft: '3%',
                }}
                placeholder="Remark"
                placeholderTextColor="grey"
                multiline={true}
                returnKeyType="next"
                onChangeText={(text) => {
                  dispatch(
                    actionSetJobOrderReport({
                      ...JobOrderReportData,
                      Remarks: text,
                    }),
                  );
                }}
                value={JobOrderReportData.Remarks}
              />
              <TouchableOpacity
                style={{marginLeft: '3%'}}
                onPress={() =>
                  navigation.navigate('Notes', {
                    JOID: JobOrderReportData.JOID,
                  })
                }>
                <Image
                  style={{width: 48, height: 48}}
                  source={require('../../../assets/icons/ic_doc.png')}
                />
              </TouchableOpacity>
            </View>
            {JobOrderReportData.IsRescheduled && (
              <Picker
                dropdownIconColor={CmmsColors.logoBottomGreen}
                mode={'dropdown'}
                selectedValue={`${JobOrderReportData.ReasonID}`}
                onValueChange={(item, index) => {
                  console.log('reason_change: ', item);
                  // setSelectedDefaultReason(item)
                  dispatch(
                    actionSetJobOrderReport({
                      ...JobOrderReportData,
                      ReasonID: Number(item),
                    }),
                  );
                }}>
                {reasonList.map((item, index) => {
                  return (
                    <Picker.Item
                      key={index}
                      label={`${item.Name}`}
                      value={`${item.ID}`}
                    />
                  );
                })}
              </Picker>
            )}

            {params.IsSuperVisor == 0 && (
              <View>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: '5%',
                  }}>
                  {params.ServiceType != 2 && (
                    <>
                      <TouchableOpacity
                        style={{
                          height: Height / 20,
                          width: Width / 4,
                          backgroundColor: CmmsColors.logoBottomGreen,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 5,
                        }}
                        onPress={() =>
                          navigation.navigate('ActivityDetails', {
                            JoId: JobOrderReportData.JOID,
                            SeId: params.SEID,
                          })
                        }>
                        <CmmsText
                          style={{color: '#ffffff', textAlign: 'center'}}>
                          Add Actvs (
                          {JobOrderReportData?.AdditionalActivityDtls?.length})
                        </CmmsText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          height: Height / 20,
                          width: Width / 4,
                          backgroundColor: CmmsColors.logoBottomGreen,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 5,
                        }}
                        onPress={() => {
                          AddSparepartsCondtionCheck();
                          // if (
                          //   JobOrderReportData.AdditionalActivityDtls?.length >
                          //   0
                          // )
                          //   navigation.navigate('AdditionalSpareParts', {
                          //     JoId: JobOrderReportData.JOID,
                          //     SeId: params.SEID,
                          //     AssetRegID: JobOrderReportData.AssetRegID,
                          //     AssetCode: JobOrderReportData.AssetCode,
                          //   });
                          // else
                          //   alert(
                          //     'You must enter atleast one activity to add spareparts',
                          //   );
                        }}>
                        <CmmsText
                          style={{color: '#ffffff', textAlign: 'center'}}>
                          Add SPart (
                          {JobOrderReportData?.AdditionalSparePartsDtls?.length}
                          )
                        </CmmsText>
                      </TouchableOpacity>
                    </>
                  )}
                  {/* <TouchableOpacity
                    style={{
                      height: Height / 20,
                      width: Width / 4.5,
                      backgroundColor: CmmsColors.logoBottomGreen,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 5,
                    }}>
                    <CmmsText style={{color: '#ffff'}}>Verify</CmmsText>
                  </TouchableOpacity> */}
                  <TouchableOpacity
                    onPress={() => OnSave()}
                    style={{
                      height: Height / 20,
                      width: Width / 4,
                      backgroundColor: CmmsColors.logoBottomGreen,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 5,
                    }}>
                    <CmmsText style={{color: '#ffffff'}}>
                      {AppTextData.txt_Save}
                    </CmmsText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          <View style={{height: Height / 10, width: '100%'}}></View>
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
            dispatch(actionSetLoading(true));
            console.log({imgFile, score, comment});
            let bodyFormData = new FormData();
            bodyFormData.append(
              'Review',
              JSON.stringify({
                Rating: score,
                ServiceReportID: JobOrderReportData.ID,
                CustodianID: JobOrderReportData.CustodianID,
                Remarks: comment,
                DateTime: new Date().getTime(),
              }),
            );
            var photo = {
              uri: `data:image/png;base64,${imgFile.encoded}`,
              type: 'image/png',
              name: 'signature.png',
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
              photo,
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
              {'Content-Type': 'multipart/form-data'},
              //   { "contentType": "false" }
            )
              .then((res) => {
                console.log('VerifyCustodian', {res});
                if (res.status != 200) {
                  throw Error(res.data);
                }
                return res.data;
              })
              .then((data) => {
                console.log({data});
                dispatch(actionSetLoading(false));
                if (data.isSucess) {
                  setVisibleReviewDlg(false);
                  alert(data.Message);
                } else throw Error(data.Message);
              })
              .catch((err) => {
                dispatch(actionSetLoading(false));
                console.log({err});
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
        titleStyle={{textAlign: 'center'}}
        visible={visibleClgwDlg}
        onTouchOutside={() => {
          setCustodianPswd('');
          setVisibleClgDlg(false);
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: CmmsColors.blue,
            backgroundColor: '#ffffff90',
            borderRadius: 5,
            paddingHorizontal: 8,
          }}>
          <Icon name="user" size={18} color={CmmsColors.coolGray} />
          <TextInput
            style={{flex: 1, color: 'black', marginStart: 5}}
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
            paddingHorizontal: 8,
          }}>
          <Icon name="key" size={18} color={CmmsColors.coolGray} />
          <TextInput
            style={{flex: 1, color: 'black', marginStart: 5}}
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
            height: 50,
          }}
          onPress={() =>
            //alert("multi langnpm ")
            doCustdianLogin()
          }>
          <CmmsText style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
            {AppTextData.txtLogin}
          </CmmsText>
        </TouchableOpacity>
      </Dialog>
      {/* <Dialog
        // title={AppTextData.txt_Custodian_Login}
        titleStyle={{textAlign: 'center'}}
        visible={odrDialoge}
        onTouchOutside={() => {
setOdrDialoge(false)
        }}>
          <View style ={{height:Height/1.4,width:'100%',alignItems:'center'}}>  
            <View style = {{flex:1,justifyContent:'center'}}>
              <View style = {{flexDirection:'row',width:'100%',backgroundColor:'#fff',height:Height/25,alignItems:'center',justifyContent:'flex-start',borderRadius:20,elevation:10,paddingHorizontal:'5%'}}>
                <TextInput 
                  placeholder='Search here ...'
                  placeholderTextColor={'#777'}
                  style= {{height:'100%',width:'80%',justifyContent:'center',fontSize:11}}
                  multiline={true}>

                </TextInput>
                <Image style = {{height:20,width:20}} resizeMode='contain' source={{uri:'https://cdn-icons-png.flaticon.com/512/9178/9178045.png'}}></Image>
              </View>
             
            </View>
            <View style = {{flex:7}}>
              <FlatList></FlatList>
            </View>
          </View>
      </Dialog> */}
    </SafeAreaView>
  );

  function doCustdianLogin() {
    //http://213.136.84.57:4545/api/ApkTechnician/VerifyCustodian?CustodianID=6&PassWord=123
    requestWithEndUrl(`${API_TECHNICIAN}VerifyCustodian`, {
      CustodianID: JobOrderReportData.CustodianID,
      PassWord: custodianPswd,
    })
      .then((res) => {
        console.log('VerifyCustodian', {res});
        if (res.status != 200) {
          throw Error(res.data);
        }
        return res.data;
      })
      .then((data) => {
        console.log({data});
        if (data.isSucess) {
          setCustodianPswd('');
          setVisibleClgDlg(false);
          setVisibleReviewDlg(true);
        } else alert(data.Message);
      })
      .catch((err) => {
        console.log('VerifyCustodian', {err});
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
    JobOrderReportData.From = JobOrderReportData.AssignedFrom;
    JobOrderReportData.To = JobOrderReportData.AssignedTo;
    JobOrderReportData.SEID = params.SEID;
    JobOrderReportData.ObjectID = valueObject;
    JobOrderReportData.ComplaintTypeID = valueDamage;
    JobOrderReportData.CauseListID = valueReason;
    console.log(`${API_TECHNICIAN}APKSaveJobOrdeReport`);
    console.log('valueDamage' + valueDamage);
    console.log('valueObject' + valueObject);
    console.log('valueReason' + valueReason);
    console.warn('OnSave Items:', JSON.stringify(JobOrderReportData));
    dispatch(actionSetLoading(true));

    requestWithEndUrl(
      `${API_TECHNICIAN}APKSaveJobOrdeReport`,
      JobOrderReportData,
      'POST',
    )
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
          dispatch(actionSetRefreshingPage(true)); //added by vbn
          navigation.goBack();
        }
      })
      .catch((err) => {
        console.error({err});
        dispatch(actionSetLoading(false));
        alert(AppTextData.txt_somthing_wrong_try_again);
      });
  }
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    alignItems: 'flex-start', // if you want to fill rows left to right
  },
  itemhead: {
    width: '50%', // is 50% of container width
  },
  item: {
    padding: 8,
    fontSize: 15,
    // height: 44,
  },
  MainHead: {
    fontSize: 18,
    fontStyle: 'normal',
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
  SubHeadBottom: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 2,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  SubheadDet: {
    fontSize: 16,
    color: CmmsColors.logoBottomGreen,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  SubHeadDetTitle: {
    marginVertical: '3%',
    marginTop: '3%',
  },

  row: {
    flex: 1,
    flexDirection: 'row',
  },
  SubHeadBottomList: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  ActivityPending: {
    backgroundColor: CmmsColors.joPending,
    height: 30,
    width: 30,
    flexDirection: 'row',
    borderRadius: 20,
    paddingVertical: 8,
  },
  ActivityClosed: {
    backgroundColor: CmmsColors.joDone,
    height: 30,
    width: 30,
    flexDirection: 'row',
    borderRadius: 20,
    paddingVertical: 8,
  },
  ActivityWIP: {
    backgroundColor: CmmsColors.joWip,
    height: 30,
    width: 30,
    flexDirection: 'row',
    borderRadius: 20,
    paddingVertical: 8,
  },
  dropdown: {
    height: Height / 30,
    borderColor: '#fff',
    backgroundColor: '#fff',
    elevation: 5,
    fontSize: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    width: '100%',
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 13,
  },
  placeholderStyle: {
    fontSize: 13,
  },
  selectedTextStyle: {
    fontSize: 13,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 13,
    borderColor: CmmsColors.logoBottomGreen,
    borderRadius: 10,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'white',
    shadowColor: '#000',
    marginTop: 8,
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
});
