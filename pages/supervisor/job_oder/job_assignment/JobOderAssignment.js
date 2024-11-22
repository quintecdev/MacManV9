import React, {useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ImageBackground,
  Dimensions,
  Image,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ScrollView,
  TextInput,
  Button,
  BackHandler,
  Alert,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import FromToDatePicker from '../components/FromToDatePicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import CmmsColors, {green} from '../../../../common/CmmsColors';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import BottomSheet from 'react-native-simple-bottom-sheet';
import ButtonQtyModify from '../../../Technician/components/ButtonQtyModify';
import requestWithEndUrl from '../../../../network/request';
import {
  API_SUPERVISOR,
  API_TECHNICIAN,
  BASE_IP,
} from '../../../../network/api_constants';
import {parse, format} from 'date-fns';
import {useSelector, useDispatch} from 'react-redux';
import {
  actionSetLoading,
  actionSetRefreshing,
} from '../../../../action/ActionSettings';

import {actionSetActivityListPageVisit} from '../../../../action/ActionPageVisit';
import {
  actionSetAlertPopUp,
  actionSetAlertPopUpTwo,
} from '../../../../action/ActionAlertPopUp';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import FromToTimePicker from '../components/FromToTimePicker';
import TimeField from '../components/TimeField';
// import { formatTime, formatTimeHhmm } from '../../../Technician/utils';
import {Dialog} from 'react-native-simple-dialogs';
import {showAlert, timeMinToTimeFormat} from '../../../../common/utils';
// import JobOrderView, { statusDetails } from '../../../components/JobOrderView';
import {
  CmmsText,
  CmmsTextWhite,
  CTextTitle,
} from '../../../../common/components/CmmsText';
import JobOrderView, {statusDetails} from './component/JobOrderView';
import {useHeaderHeight} from '@react-navigation/stack';
import {Picker} from '@react-native-picker/picker';
import Alerts from '../../../components/Alert/Alerts';
import GetSpartsAndActivities from './component/GetSpartsAndActivities';
import ImageList from '../../../../common/ImageList';
import RefreshButton from '../../Components/RefreshButton';
import CommonButton from '../../../components/CommonButton/CommonButton';
import {Colors} from 'react-native/Libraries/NewAppScreen';
const Height = Dimensions.get('window').height;

const screenHeight = Math.floor(Dimensions.get('window').height);

export default JobOderAssignment = ({navigation}) => {
  const headerHeight = useHeaderHeight();
  const currentDateInMillies = new Date().getTime(); //parse(new Date(), "dd/MM/yyyy", new Date()).getTime();
  // console.log({headerHeight});
  const {loggedUser} = useSelector((state) => state.LoginReducer);
  // console.log("JobOderAssignment","SUID_TechId: ",loggedUser.TechnicianID)
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const {AlertPopUp, AlertPopUpTwo} = useSelector((state) => {
    return state.AlertPopUpReducer;
  });
  const {refresh} = useSelector((state) => state.SettingsReducer);
  const [fromNToDate, setFromNToDate] = useState({
    selectedFromDate: currentDateInMillies,
    selectedToDate: currentDateInMillies,
  });
  const dispatch = useDispatch();
  const panelRef = useRef(null);
  const timeFiledRef = useRef(null);
  const [maintananceTypes, setMaintananceTypes] = useState([]);
  const [checkedMaintananceTypeIds, setCheckedMaintananceTypeIds] = useState(
    [],
  );
  const [jobOrderList, setJobOrderList] = useState([]);
  const [visibleActivities, setVisibleActivities] = useState(false);
  const [visibleFilterWindow, setVisibleFilterWindow] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false); //vbn
  const [selectedJoIds, setSelectedJoIds] = useState([]);

  const [overDueChecked, setOverDueChecked] = useState(false);
  const [backLogChecked, setBackLogChecked] = useState(false);
  const [assignChecked, setAssignChecked] = useState(false);
  const [notAssignChecked, setNotAssignChecked] = useState(true);
  const [pendingChecked, setPendingChecked] = useState(false);

  const [tempOverDueChecked, setTempOverDueChecked] = useState(overDueChecked);
  const [tempBackLogChecked, setTempBackLogChecked] = useState(backLogChecked);
  const [tempAssignChecked, setTempAssignChecked] = useState(assignChecked);
  const [tempNotAssignChecked, setTempNotAssignChecked] =
    useState(notAssignChecked);
  const [tempPendingChecked, setTempPendingChecked] = useState(pendingChecked);

  const [selectedJoDetails, setselectedJoDetails] = useState({});
  const [IndvdlJoDetails, setIndvdlJoDetails] = useState({});
  const [isPanelOpen, setIsPanelOpen] = useState(false); //vbn
  const [asignmentJoMarginBottom, setAssignmentJoMarginBottom] = useState(130);
  const [time, setTime] = useState('12:35');
  const [joOutOfStockList, setJoOutOfStockList] = useState([]);
  const [manHourList, setManHourList] = useState([]);
  const [visibleCancelRsnDlg, setVisibleCancelRsnDlg] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  // const [filterCountData, setFilterCountData] = useState(null);
  const [assignFromNTo, setAssignFromNTo] = useState({
    selectedAssignFromDate: currentDateInMillies,
    selectedAssignToDate: currentDateInMillies,
  });
  const refreshFromSeenBy = useRef(false);
  const [reasonList, setReasonList] = useState([]);
  const [selectedDefaultReason, setSelectedDefaultReason] = useState(0);
  const [selectTechie, setSelectTechie] = useState('');
  const [TechieList, setTechieList] = useState([]);
  const {CheckActivityListVisit} = useSelector(
    (state) => state.PageVisitReducer,
  );
  const [AddTechnician, setAddTechnician] = useState(false);
  const [TechnicianID, setTechnicianID] = useState([]);
  const [BottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [JoID, setJoID] = useState(0); //using for Add Techn's button Enable and disable property.
  const [LeftSwipe, setLeftSwipe] = useState(false);

  let IDList = [];
  const Styles = StyleSheet.create({
    techTouch: {
      height: Height / 12,
      width: '43%',
      borderColor: '#20A908',
      flexDirection: 'row',
      // alignItems: 'center',
      borderRadius: 10,
      paddingLeft: '2%',
      elevation: 10,
      marginVertical: '3%',
      marginLeft: '5%',
      backgroundColor: '#fff',
    },
  });
  //FLAST LIST RENDER DATA FOR FILTER BUTTON POPUP
  const renderItemNew = ({item}) => {
    return (
      <>
        <TouchableOpacity
          style={[
            Styles.techTouch,
            selectTechie == item?.ID ? {borderWidth: 1} : {borderWidth: 0},
          ]}
          onPress={() => {
            if (item?.ID == selectTechie) {
              setSelectTechie('');
            } else {
              setSelectTechie(item?.ID);
            }
          }}>
          <View style={{flex: 1}}>
            <Image
              style={{height: '60%', width: '90%', borderRadius: 5}}
              source={{uri: `${BASE_IP}/Images/Employee/` + item?.ImagePath}}
              resizeMode="cover"></Image>
          </View>
          <View style={{flex: 2, justifyContent: 'center', paddingLeft: '2%'}}>
            <Text style={{fontSize: 11, fontWeight: '800', color: '#000'}}>
              {item?.Name}
            </Text>
            {/* <CmmsText style={{fontSize: 11}}>{item?.Code}</CmmsText> */}
          </View>
        </TouchableOpacity>
      </>
    );
  };
  //tech cards in filter button press popup
  const what = ({item}) => {
    return (
      <>
        <Pressable
          style={[
            Styles.techTouch,
            selectTechie == item.ID ? {borderWidth: 1} : {borderWidth: 0},
          ]}
          onPress={() => {
            if (TechnicianID?.includes(item.ID)) {
              console.log('nn', item.ID);
              const ee = TechnicianID?.filter((el) => el != item?.ID);
              setTechnicianID(ee);
            } else {
              setTechnicianID((prev) => [...prev, item?.ID]);
            }
          }}>
          {TechnicianID.find((e) => e == item?.ID) ? (
            <View
              style={{
                borderRadius: 50,
                backgroundColor: 'green',
                padding: 5,
                right: 0,
                position: 'absolute',
                margin: 5,
              }}
            />
          ) : null}
          <View style={{alignItems: 'center', flexDirection: 'row', flex: 1}}>
            <View style={{flex: 1}}>
              <Image
                style={{height: '60%', width: '90%', borderRadius: 5}}
                source={{uri: `${BASE_IP}/Images/Employee/` + item?.ImagePath}}
                resizeMode="cover"></Image>
            </View>
            <View
              style={{flex: 2, justifyContent: 'center', paddingLeft: '2%'}}>
              <Text style={{fontSize: 11, fontWeight: '800', color: '#000'}}>
                {item?.Name}
              </Text>
            </View>
          </View>
        </Pressable>
      </>
    );
  };

  useEffect(() => {
    if (CheckActivityListVisit == true) {
      refreshPage();
    }
    const unsubscribe = navigation.addListener('focus', () => {
      if (CheckActivityListVisit == true) {
        dispatch(actionSetActivityListPageVisit(false));
        // refreshPage();
        getJobOrderAssignment();
      }
    });
    return unsubscribe;
  }, [navigation, CheckActivityListVisit]);

  useEffect(() => {
    console.log('useEffect', {isSelectionMode: isSelectionMode});

    setAssignmentJoMarginBottom(isSelectionMode ? 320 : 225);
  }, [isSelectionMode]);

  useEffect(() => {
    if (selectedJoIds.length > 0) {
      console.log('useEffect', {selectedJoIds: selectedJoIds});
      console.log('useEffect_4_selectedJoIds.length!=0:', {selectedJoIds});
      // setSelectedJoidData();
    }
  }, [selectedJoIds]);

  const setSelectedJoidData = async () => {
    // await getManHours();
    await getSparePartsNActivities();
  };
  useEffect(() => {
    // getTechies();//commented by vbn to make this page optimised
    console.log('useEffect', {
      assignChecked,
      notAssignChecked,
      backLogChecked,
      overDueChecked,
      pendingChecked,
    });

    console.log('JobOderAssignment_useefect_with_filters', {
      assignChecked,
      notAssignChecked,
      backLogChecked,
      overDueChecked,
      fromNToDate,
    });
    // refreshFetch()
    getJobOrderAssignment(); //call 1
  }, [
    assignChecked,
    notAssignChecked,
    backLogChecked,
    overDueChecked,
    pendingChecked,
    checkedMaintananceTypeIds, //vbn
  ]);

  function getReasonList() {
    //http://213.136.84.57:4545/api/ApkTechnician/GetReasons
    requestWithEndUrl(`${API_TECHNICIAN}GetReasons`)
      .then((res) => {
        console.log('GetReasons', {res});
        if (res?.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        if (data?.length > 0) {
          setReasonList(data);
          // setSelectedReasonId(data[0].ID)
        }
      })
      .catch((err) => {
        console.error('URL_GetReasons', {err});
      });
  }

  async function getSparePartsNActivities() {
    if (selectedJoIds.length > 0) {
      console.error('function=> GetSParepartsAndActivities');
      console.log('selected job order id==>>', selectedJoIds);
      dispatch(actionSetLoading(true));
      console.log('useEffect_4_GetSParepartsAndActivities:', {selectedJoIds});
      //{"AFromDate":assignFromNTo.selectedAssignFromDate,"AToDate":assignFromNTo.selectedAssignToDate, "Work":}
      // http://localhost:29189/api/ApkSupervisor/GetSParepartsAndActivities
      //[{"WorkID":861,"WorkType":0,"JOID":0},{"WorkID":873,"WorkType":0,"JOID":0}]
      try {
        const spareNactRes = await requestWithEndUrl(
          `${API_SUPERVISOR}GetSParepartsAndActivities`,
          selectedJoIds,
          'POST',
        );
        // console.warn('lalalala' + spareNactRes);
        setselectedJoDetails(spareNactRes.data);
        // setBottomSheetOpen(true);
        setBottomSheetOpen(true);
        setIsSelectionMode(true);
        dispatch(actionSetLoading(false));
      } catch (error) {
        console.error('Error GetSParepartsAndActivities', error);
        // alert(AppTextData.txt_Something_went_wrong);
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: AppTextData.txt_Something_went_wrong,
            visible: true,
            type: 'ok',
          }),
        );
        dispatch(actionSetLoading(false));
      }
    }
  }

  async function fetchDataBasedOnSelectedJoids() {
    console.log('fetchDataBasedOnSelectedJoids', {selectedJoIds});

    if (isSelectionMode == true) {
      await getManHours();
    }

    // dispatch(actionSetLoading(false));
  }

  const onDateChange = (fromDate, toDate, isAssignDate = false) => {
    //issue  onDateChange {"fromDate": 2021-02-06T04:35:01.407Z, "toDate": "13/02/2021"}
    //onDateChange {"selectedFromDate": NaN, "selectedToDate": 1613154600000}
    let selectedFromDate = parse(fromDate, 'dd/MM/yyyy', new Date()).getTime();
    let selectedToDate = parse(toDate, 'dd/MM/yyyy', new Date()).getTime();
    console.log('onDateChange', {
      selectedFromDate,
      selectedToDate,
      fromDate,
      toDate,
    });

    isAssignDate
      ? setAssignFromNTo({
          selectedAssignFromDate: selectedFromDate,
          selectedAssignToDate: selectedToDate,
        })
      : setFromNToDate({selectedFromDate, selectedToDate});
  };

  /**
   * date change maintanance types in filter
   * @param {} fromTo
   */
  const getMaintananceTypes = () => {
    console.error('function=> GetMaintenanceJobType');
    // console.log('getMaintananceTypes',{fromNToDate?.selectedFromDate,selectedToDate})
    //http://213.136.84.57:4545/api/ApkSupervisor/GetMaintenanceJobType?FromDate=0&ToDate=0
    requestWithEndUrl(`${API_SUPERVISOR}GetMaintenanceJobType`, {
      FromDate: fromNToDate ? fromNToDate?.selectedFromDate : 0,
      ToDate: fromNToDate ? fromNToDate?.selectedToDate : 0,
      SEID: loggedUser?.TechnicianID,
    })
      .then((res) => {
        console.log('GetMaintenanceJobType', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        if (checkedMaintananceTypeIds.length > 0) {
          checkedMaintananceTypeIds.forEach((id) => {
            console.log('checkedMaintananceTypeId', id);
            data.filter((maintananceType) => {
              if (maintananceType.ID == id) {
                maintananceType.checked = true;
              }
            });
          });
        }
        setMaintananceTypes(data);
      })
      .catch((err) => {
        console.error('Error GetMaintenanceJobType', err);
      });
  };

  const getJobOrderAssignment = (
    isOverDueChecked = overDueChecked,
    IsBacklogChecked = backLogChecked,
    IsNotAssignChecked = notAssignChecked,
    IsAssignChecked = assignChecked,
    fromTo = fromNToDate,
    IsPendingChecked = pendingChecked,
  ) => {
    console.error('function=> GetJobOrderAssignment');

    dispatch(actionSetLoading(true));
    console.log('getJobOrderAssignment', {
      assignChecked,
      overDueChecked,
      backLogChecked,
    });
    //http://213.136.84.57:4545/api/ApkSupervisor/GetJobOrderAssignment?FromDate=1577817000000&ToDate=1577817000000&IsOverDue=false
    const maintananceTypeLngArray = maintananceTypes
      .filter((maintananceType) => maintananceType.checked)
      .map((newmain) => newmain.ID);
    // console.log("getJobOrderAssignment",{selectedFromDate,selectedToDate,overDueChecked,maintananceTypeLngArray})
    //  axios.post
    const params = {
      FromDate: fromTo ? fromTo.selectedFromDate : 0,
      ToDate: fromTo ? fromTo.selectedToDate : 0,
      IsOverDue: isOverDueChecked,
      MJT: maintananceTypeLngArray,
      IsBacklog: IsBacklogChecked,
      IsAssigned: IsAssignChecked,
      IsNotAssigned: IsNotAssignChecked,
      IsPending: IsPendingChecked,
      SEID: selectTechie,
      UserID: loggedUser?.TechnicianID,
    };
    console.log('params for GetJOA api call===>>>', params);
    requestWithEndUrl(
      `${API_SUPERVISOR}GetJobOrderAssignment`,
      {
        FromDate: fromTo ? fromTo?.selectedFromDate : 0,
        ToDate: fromTo ? fromTo?.selectedToDate : 0,
        IsOverDue: isOverDueChecked,
        MJT: maintananceTypeLngArray,
        IsBacklog: IsBacklogChecked,
        IsAssigned: IsAssignChecked,
        IsNotAssigned: IsNotAssignChecked,
        IsPending: IsPendingChecked,
        SEID: selectTechie,
        UserID: loggedUser?.TechnicianID,
      },
      'POST',
    )
      .then((res) => {
        dispatch(actionSetLoading(false));
        console.log('GetJobOrderAssignment', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        console.log(
          'GetJobOrderAssignment api response from the Supervisor page===>>>',
          data,
        );
        setIsSelectionMode(false); //vbn
        setSelectedJoIds([]);
        setJobOrderList(data);
        // setSelectTechie('');
        refreshFromSeenBy.current = false;
      })
      .catch((err) => {
        dispatch(actionSetLoading(false));
        console.error('Error GetJobOrderAssignment', err);
      });
  };

  function setSeenBy() {
    console.error('function=> SetSeenBy');
    //http://213.136.84.57:4545/api/ApkSupervisor/SetSeenBy
    requestWithEndUrl(`${API_SUPERVISOR}SetSeenBy`, {}, 'POST')
      .then((res) => {
        console.log('SetSeenBy', {res});
        if (res.status == 200) {
          refreshFromSeenBy.current = true;
          dispatch(actionSetRefreshing());
        } else throw Error(res.statusText);
      })
      .catch((err) => {
        console.log('Error SetSeenBy', {err});
      });
  }
  const ListView = () => {
    console.warn('555');
    return (
      <View
        style={{
          height: !assignChecked ? Height / 1.8 : Height / 1.3,
          width: '100%',
          marginTop: !assignChecked ? 0 : '5%',
        }}>
        <FlatList
          ListFooterComponent={() => <View style={{height: 285}}></View>}
          showsVerticalScrollIndicator={false}
          data={jobOrderList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => {
            const statusDetail = statusDetails(item.AllotmentStatus);
            let overDueTime = getOverDueTime(item.OverDueBy);

            const indx = joOutOfStockList.findIndex(
              (joOutOfStock) =>
                joOutOfStock.WorkID == item.WorkID &&
                joOutOfStock.WorkType == item.WorkType,
            );
            var outOfStock = false;
            if (indx != -1) {
              outOfStock = joOutOfStockList[indx].OutOfStock;
            }
            // console.log({outOfStock, indx}, item.WorkID);
            return (
              <GestureRecognizer
                onSwipeLeft={(state) => {
                  if (state.dx < -70) {
                    setIndvdlJoDetails(item);
                    setLeftSwipe(true);
                  }
                }}
                onSwipeRight={(state) => {
                  console.log('jobid: ', item);
                  if (state.dx > 70 && item.JOID != 0)
                    navigation.navigate('TodayJobOrderIssued', {
                      id: item.JOID,
                      SEID: 0,
                    });
                }}>
                <TouchableOpacity
                  style={{marginBottom: 8}}
                  // delayLongPress={100}
                  onPress={() => {
                    // console.log('onpressJob: ', {item, isSelectionMode});
                    if (isSelectionMode && item.WorkStatus == 0) {
                      console.warn('job card if---1');
                      setBottomSheetOpen(false);
                      console.log('onpressJob: ', item);
                      const indxOf = selectedJoIds.findIndex(
                        (selecteJoid) => selecteJoid.WorkID == item.WorkID,
                      );
                      if (indxOf != -1) {
                        console.warn('job card if---2');
                        selectedJoIds.splice(indxOf, 1);
                        if (selectedJoIds.length == 0) {
                          outOfStock = false;
                          setIsSelectionMode(false);
                          setBottomSheetOpen(false);
                        }
                        //  else if (selectedJoIds.length > 0) {
                        //   setBottomSheetOpen(false);
                        // }
                        setSelectedJoIds([...selectedJoIds]);
                      } else {
                        console.warn('job card if---3');
                        setSelectedJoIds((selectedJoIds) => [
                          ...selectedJoIds,
                          {
                            WorkID: item.WorkID,
                            WorkType: item.WorkType,
                            JOID: item.JOID,
                          },
                        ]);
                      }
                    }
                  }}
                  onLongPress={() => {
                    console.log('longpress pressed==>', selectedJoIds);
                    console.log('is there any error?-->>', notAssignChecked);
                    console.log(
                      'what is the is secletion mode-->>',
                      isSelectionMode,
                    );
                    if (selectedJoIds.length == 0 && item.WorkStatus == 0) {
                      setJoID(item.JOID);
                      // console.warn(
                      //   item.MaintenanceJobTypeID,
                      //   'jhdabsbjqjwbjc2jqxabjhxb',
                      // );
                      setTechnicianID([]);
                      setSelectedJoIds([
                        {
                          WorkID: item.WorkID,
                          WorkType: item.WorkType,
                          JOID: item.JOID,
                        },
                      ]);
                      setIsSelectionMode(true);
                    }
                  }}>
                  {/* job list */}
                  {notAssignChecked ? (
                    <View
                      style={{
                        height: Dimensions.get('screen').height / 10,
                        width: '100%',
                        backgroundColor: item.OutOfStock
                          ? '#ff4d4d'
                          : statusDetail?.color,
                        borderRadius: 10,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          // backgroundColor: 'transparent',
                          alignItems: 'flex-start',
                          paddingLeft: '5%',
                          justifyContent: 'flex-end',
                        }}>
                        <Text
                          style={{
                            fontWeight: '900',
                            fontFamily: 'sans-serif-condensed',
                            color: 'white',
                            marginEnd: isSelectionMode ? 20 : 5,
                          }}>
                          {`${item.Code}/${item.AssetName}/${item.Location}`.replace(
                            /^\/+|\/+$/g,
                            '',
                          )}
                        </Text>
                        {isSelectionMode && (
                          <Image
                            style={{
                              position: 'absolute',
                              alignSelf: 'flex-end',
                              end: 5,
                              top: 4,
                              height: 20,
                              width: 20,
                              tintColor: CmmsColors.white,
                            }}
                            resizeMode="contain"
                            source={
                              selectedJoIds.findIndex(
                                (selectedJoId) =>
                                  selectedJoId.WorkID == item.WorkID,
                              ) != -1
                                ? ImageList.checked
                                : ImageList.unChecked
                            }

                            // source={ImageList.checked}
                          ></Image>
                        )}
                      </View>
                      <View style={{flex: 1, flexDirection: 'row'}}>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            paddingLeft: '5%',
                          }}>
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: '900',
                              color: 'blue',
                              fontFamily: 'sans-serif-light',
                            }}>
                            {/* {item.MaintenanceJobTypeID == 17 */}
                            {item.WorkType == 3
                              ? 'Reported Date '
                              : AppTextData.txt_Schedule_Date + ' '}
                            {format(item.ScheduleDate, 'dd/MM/yyyy')}
                          </Text>
                          {overDueTime && (
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: '900',
                                color: CmmsColors.darkRed,
                                fontFamily: 'sans-serif-light',
                              }}>
                              {AppTextData.txt_OverDue_By}
                              {overDueTime}
                            </Text>
                          )}
                        </View>
                        <View
                          style={{
                            flex: 1,
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            paddingRight: '3%',
                          }}>
                          <View
                            style={{
                              height: '60%',
                              // width: '60%',
                              backgroundColor: '#9FBD32',
                              borderRadius: 10,
                              alignItems: 'center',
                              justifyContent: 'center',
                              elevation: 13,
                              paddingHorizontal: 5,
                            }}>
                            <Text
                              style={{
                                color: '#5B5B5B',
                                fontSize: 13,
                                fontFamily: 'sans-serif-condensed',
                              }}>
                              {item.MaintenanceJobType}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <JobOrderView
                      item={item}
                      isSelectionMode={isSelectionMode}
                      IsAssignChecked={assignChecked}
                      selectedJoIds={selectedJoIds}
                      notAssignChecked={notAssignChecked}
                    />
                  )}
                </TouchableOpacity>
              </GestureRecognizer>
            );
          }}
        />
      </View>
    );
  };
  return (
    <SafeAreaView style={{flex: 1, padding: '3%'}}>
      {LeftSwipe && (
        <GetSpartsAndActivities
          params={IndvdlJoDetails}
          visible={LeftSwipe}
          buttonpress={() => {
            setLeftSwipe(false);
            setIndvdlJoDetails({});
          }}
        />
      )}
      <View
        style={{
          marginBottom: !assignChecked
            ? asignmentJoMarginBottom
            : asignmentJoMarginBottom - 190,
        }}>
        <View style={{paddingBottom: 15}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 20,
              paddingHorizontal: '1%',
            }}>
            <FromToDatePicker
              fromDate={new Date(fromNToDate.selectedFromDate)}
              toDate={new Date(fromNToDate.selectedToDate)}
              onDateChange={(fromDate, toDate) =>
                onDateChange(fromDate, toDate)
              }
            />

            <TouchableOpacity
              style={{marginStart: 4, padding: 4}}
              onPress={() => {
                // refreshFetch();
                // ***vvvvv
                refreshPage();
                getJobOrderAssignment();
                // getManHours();
                //  *****
                // getFilterCount()
                // getMaintananceTypes();//commented by vbn to optimise the code
              }}>
              <Icon name="refresh" size={24} color="black" />
            </TouchableOpacity>
          </View>
          {/* {!assignChecked && ( */}
          <View
            style={{
              paddingTop: 8,
              marginBottom: 4,
              borderRadius: 2,
            }}>
            <Text
              style={{
                color: 'black',
                marginBottom: 5,
                fontWeight: 'bold',
                marginLeft: '1%',
                marginTop: '4%',
              }}>
              {/*vbn lang Expected Assign Dates */}
              {AppTextData.txt_Expected_Assign_Dates}
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <FromToDatePicker
                isAssignDate
                style={{marginStart: 5, marginVertical: 30}}
                fromDate={new Date(assignFromNTo.selectedAssignFromDate)}
                toDate={new Date(assignFromNTo.selectedAssignToDate)}
                onDateChange={(fromDate, toDate) =>
                  onDateChange(fromDate, toDate, true)
                }
              />
              <TouchableOpacity
                style={{marginStart: 4, marginRight: 4, padding: 4}}
                onPress={() => {
                  //below code is using for filter popupvisibility, to avoid the filterapi initil call, i placed this code to inside the filterVisibility call
                  // setVisibleFilterWindow(!visibleFilterWindow);
                  // getFilterCount(true);

                  {
                    BottomSheetOpen & isSelectionMode
                      ? Alert.alert(
                          AppTextData.txt_Alert,
                          'Do you want to reset the Jobs?',
                          [
                            {
                              text: AppTextData.txt_No,
                              onPress: () => console.log('Cancel Pressed'),
                              style: 'cancel',
                            },
                            {
                              text: AppTextData.txt_Yes,
                              onPress: () => {
                                setBottomSheetOpen(false);
                                setIsSelectionMode(false);
                                OpenFilterPopUp(true);
                              },
                            },
                          ],
                        )
                      : OpenFilterPopUp(true);
                  }

                  // OpenFilterPopUp(true);
                }}>
                <Icon name="sliders" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {manHourList.length > 0 && (
              //1
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 8,
                  // backgroundColor:'red'
                  // borderWidth: 0.5,
                  // borderRadius: 10,
                  // elevation: 20,
                  // paddingVertical: '3%',
                  // paddingLeft: '5%',
                  // borderColor: 'grey',
                  // backgroundColor: '#fff',
                }}>
                <FlatList
                  //2
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={manHourList}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => {
                    const newEMH = getEstimatedMh(item.TAID);
                    console.log('mahourlist_reder', {newEMH});
                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                        }}>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            color: 'black',
                            padding: 2,
                          }}>
                          {AppTextData.txt_Man_Hour}
                        </Text>
                        <Text
                          style={{
                            fontWeight: '900',
                            color: 'green',
                            padding: 2,
                          }}>
                          {'    '}
                          {AppTextData.txt_Estimated}
                        </Text>
                        <Text
                          style={{
                            textAlign: 'center',
                            fontWeight: '900',
                            padding: 2,
                          }}>
                          {timeMinToTimeFormat(
                            isSelectionMode ? newEMH : item.EMH,
                          )}
                        </Text>
                        <Text
                          style={{fontWeight: '900', color: 'red', padding: 2}}>
                          {'  '}
                          {AppTextData.txt_Available}
                        </Text>
                        <Text
                          style={{
                            textAlign: 'center',
                            fontWeight: '900',
                            padding: 2,
                          }}>
                          {timeMinToTimeFormat(
                            !isSelectionMode ? item.AMH : item.AMH - newEMH,
                          )}
                        </Text>
                      </View>
                    );
                  }}
                />
              </View>
            )}
          </View>
          {/* )} */}
          {/* {!assignChecked && ( */}
          {selectedJoIds.length > 0 && !BottomSheetOpen? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingVertical:5
            }}>
            <RefreshButton
              title={'Ok'}
              width={75}
              color={'white'}
              backgroundColor={'#2F5A0C'}
              fontWeight={'bold'}
              fontSize={15}
              onPress={() => {
                console.log('button pressed');
                setSelectedJoidData();
              }}
            />
          </View>
        ) : null}
        </View>

        {jobOrderList.length > 0 && ListView()}
      </View>
      {AddTechnician && AssignTechnician()}
      {BottomSheetOpen && getBottomSheet()}
      {/* {getIndvdlItemDetailPopUp()} */}
      {visibleFilterWindow && getFilterDlg()}
      {visibleCancelRsnDlg && getCancelRsnDlg()}
    </SafeAreaView>
  );
  //Filter PopUp
  function getFilterDlg() {
    console.warn('111');
    return (
      <Dialog
        title={AppTextData.txt_txt_Filter} //vbn lang {'Filter'}
        visible={visibleFilterWindow}>
        <View style={{flexDirection: 'row', paddingLeft: '10%'}}>
          <View style={{flex: 1}}>
            <FlatList
              data={maintananceTypes}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 30,
                    marginEnd: 5,
                  }}
                  onPress={() => {
                    item.checked = !item.checked;
                    setMaintananceTypes((maintananceTypes) => [
                      ...maintananceTypes,
                    ]);
                  }}>
                  <Icon
                    name={item.checked ? 'check-square-o' : 'square-o'}
                    size={18}
                    color={item.IsScheduled ? 'green' : 'black'}
                  />

                  <Text
                    style={{
                      fontWeight: 'bold',
                      textDecorationLine: 'underline',
                      marginStart: 4,
                      color: item.IsScheduled ? 'green' : 'black',
                    }}>
                    {/* {item.Code}({item.Count}) */}
                    {item.Name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
          <View style={{flexDirection: 'column', marginTop: 16, flex: 1}}>
            <TouchableOpacity
              disabled={tempPendingChecked}
              style={{flexDirection: 'row', alignItems: 'center'}}
              onPress={() => {
                if (tempNotAssignChecked) setTempNotAssignChecked(false);
                setTempAssignChecked((tempAssignChecked) => !tempAssignChecked);
                GetFilteredTechnicians();
              }}>
              <Icon
                name={tempAssignChecked ? 'check-square-o' : 'square-o'}
                size={18}
                color="black"
              />
              <Text style={{fontWeight: 'bold', marginStart: 4}}>
                {AppTextData.txt_Assigned}
                {/* {filterCountData ? ` (${filterCountData.Assigned})` : ''} */}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={tempPendingChecked}
              style={{
                flexDirection: 'row',
                marginTop: 10,
                alignItems: 'center',
              }}
              onPress={() => {
                if (tempAssignChecked) setTempAssignChecked(false);
                setTempNotAssignChecked(
                  (tempNotAssignChecked) => !tempNotAssignChecked,
                );
              }}>
              <Icon
                name={tempNotAssignChecked ? 'check-square-o' : 'square-o'}
                size={18}
                color="black"
              />
              <Text style={{fontWeight: 'bold', marginStart: 4}}>
                {AppTextData.txt_Not_Assigned}
                {/* {filterCountData ? ` (${filterCountData.NotAssigned})` : ''} */}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <SafeAreaView
          style={{
            height: Height / 2,
            width: '100%',
            backgroundColor: '#fff',
            marginVertical: '5%',
          }}>
          {tempAssignChecked ? (
            <FlatList
              data={TechieList}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              renderItem={renderItemNew}
              keyExtractor={(item) => item.ID}></FlatList>
          ) : null}
        </SafeAreaView>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: '10%',
          }}>
          <TouchableOpacity
            style={{
              height: Height / 30,
              width: '20%',
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20,
              elevation: 10,
              borderWidth: 0.1,
              borderColor: '#000',
            }}
            onPress={() => {
              // setJobOrderList([]);
              setCheckedMaintananceTypeIds(
                maintananceTypes
                  .filter((maintananceType) => maintananceType.checked)
                  .map((maintananceType) => maintananceType.ID),
              );
              setAssignChecked(tempAssignChecked);
              setNotAssignChecked(tempNotAssignChecked);
              setBackLogChecked(tempBackLogChecked);
              setOverDueChecked(tempOverDueChecked);
              setPendingChecked(tempPendingChecked);
              console.log('onPress ok Filter', {
                assignChecked,
                notAssignChecked,
                overDueChecked,
                backLogChecked,
                pendingChecked,
              });

              setVisibleFilterWindow(false);
              // getJobOrderAssignment();
            }}>
            <Text style={{fontWeight: '800', color: '#000'}}>
              {AppTextData.txt_OK}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              height: Height / 30,
              width: '20%',
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20,
              marginLeft: '5%',
              elevation: 20,
              borderWidth: 0.1,
              borderColor: '#000',
            }}
            onPress={() => {
              setVisibleFilterWindow(false);
              setTempPendingChecked(pendingChecked);
              setTempAssignChecked(assignChecked);
              setTempNotAssignChecked(notAssignChecked);
              setTempBackLogChecked(backLogChecked);
              setTempOverDueChecked(overDueChecked);
              setSelectedJoIds([]);
            }}>
            <Text style={{fontWeight: '800', color: '#000'}}>
              {AppTextData.txt_Cancel}
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog>
    );
  }

  function AssignTechnician() {
    console.warn('444');
    return (
      <Dialog
        title={AppTextData.txt_Select_Technicians}
        titleStyle={{fontWeight: 'bold', color: 'gray'}} //vbn lang {'Filter'}
        visible={AddTechnician}
        dialogStyle={{borderRadius: 8}}
        animationType="fade">
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{color: 'silver', fontWeight: 'bold', fontSize: 12}}>
            {AppTextData.txt_No_of_Technicians} :{' '}
          </Text>
          <Text style={{color: 'green', fontWeight: 'bold', fontSize: 20}}>
            {TechnicianID.length}
          </Text>
        </View>
        <SafeAreaView
          style={{
            height: Height / 2,
            width: '100%',
            backgroundColor: '#fff',
            marginVertical: '5%',
          }}>
          <FlatList
            data={TechieList}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            renderItem={what}
            keyExtractor={(item) => item.ID}></FlatList>
        </SafeAreaView>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: '10%',
          }}>
          <TouchableOpacity
            style={{
              height: Height / 30,
              width: '20%',
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20,
              elevation: 10,
              borderWidth: 0.1,
              borderColor: '#000',
            }}
            onPress={() => {
              if (TechnicianID.length == 0) {
                dispatch(
                  actionSetAlertPopUpTwo({
                    title: AppTextData.txt_Alert,
                    body: AppTextData.txt_Please_Select_Alteast_one_Technician,
                    visible: true,
                    type: 'ok',
                  }),
                );
              } else {
                setAddTechnician(false);
              }
              // getJobOrderAssignment();
            }}>
            <Text style={{fontWeight: '800', color: '#000'}}>
              {AppTextData.txt_OK}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              height: Height / 30,
              width: '20%',
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20,
              marginLeft: '5%',
              elevation: 20,
              borderWidth: 0.1,
              borderColor: '#000',
            }}
            onPress={() => {
              setAddTechnician(false);
              // setTempPendingChecked(pendingChecked);
              // setTempAssignChecked(assignChecked);
              // setTempNotAssignChecked(notAssignChecked);
              // setTempBackLogChecked(backLogChecked);
              // setTempOverDueChecked(overDueChecked);
            }}>
            <Text style={{fontWeight: '800', color: '#000'}}>
              {AppTextData.txt_Cancel}
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog>
    );
  }
  /**
   * bottomsheet to assign the job
   */

  function getBottomSheet() {
    console.warn('333');
    return (
      <BottomSheet
        isOpen={isPanelOpen}
        sliderMinHeight={isSelectionMode ? 85 : 0}
        sliderMaxHeight={
          screenHeight - (headerHeight + StatusBar.currentHeight + 10)
        }
        ref={(ref) => (panelRef.current = ref)}
        onOpen={() => {
          console.log('onOpen');
          setIsPanelOpen(true);
        }}
        onClose={() => {
          console.log('onClose');
          setIsPanelOpen(false);
        }}>
        <ScrollView
          style={{marginBottom: 50}}
          showsVerticalScrollIndicator={false}>
          <View>
            {!assignChecked ? (
              <View style={{marginBottom: 8, borderRadius: 2}}>
                <Text
                  style={{color: 'black', marginBottom: 5, fontWeight: 'bold'}}>
                  {AppTextData.txt_Expected_Assign_Dates}
                </Text>
                <FromToDatePicker
                  isAssignDate
                  style={{marginStart: 5}}
                  fromDate={new Date(assignFromNTo.selectedAssignFromDate)}
                  toDate={new Date(assignFromNTo.selectedAssignToDate)}
                  onDateChange={(fromDate, toDate) =>
                    onDateChange(fromDate, toDate, true)
                  }
                />
              </View>
            ) : null}

            {/* newly added by vbn */}
            {/* {JoID == 0 ? ( */}
            <View
              style={{
                padding: 8,
                marginTop: 8,
                borderWidth: 1,
                borderColor: '#778899',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                }}>
                <Text style={{justifyContent: 'flex-start'}}>
                  {AppTextData.txt_Assigned_Technicians} ({TechnicianID.length})
                </Text>

                <TouchableOpacity
                  style={{justifyContent: 'flex-end'}}
                  onPress={() => {
                    Promise.resolve(GetFilteredTechnicians()).then(() => {
                      setAddTechnician(true);
                    });
                  }}>
                  <Text style={{color: 'green', fontWeight: 'bold'}}>ADD</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* ) : null} */}
            <View>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  alignSelf: 'center',
                  color: 'black',
                }}>
                {AppTextData.txt_Activities}
              </Text>
              <FlatList
                nestedScrollEnabled
                data={selectedJoDetails['ESC']} //{selectedJoDetails['Activities']}
                renderItem={({item}) => (
                  <View
                    style={{
                      padding: 8,
                      marginTop: 8,
                      borderWidth: 1,
                      borderColor: '#778899',
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: 'black',
                      }}>
                      {item.Asset}/{item.Code}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 5,
                        padding: 4,
                        borderColor: '#778899',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={{fontWeight: 'bold'}}>{item.ESC} </Text>

                      <Text style={{fontWeight: 'bold'}}>
                        {
                          // `${Math.floor((item.Activities.map(activity=>activity.Ehrs)).reduce((acc,val)=>acc+val,0)/60)}:${(item.Activities.map(activity=>activity.Ehrs)).reduce((acc,val)=>acc+val,0)%60} `
                          timeMinToTimeFormat(
                            item.Activities.map(
                              (activity) => activity.Ehrs,
                            ).reduce((acc, val) => acc + val, 0),
                          )
                        }
                      </Text>
                    </View>
                    {item.Activities.map((act) => (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 5,
                        }}>
                        <Text style={{flex: 1}}>{act?.Activity}</Text>
                        <TimeField
                          Ehrs={act?.Ehrs}
                          onChangeTime={(newEhrs) => {
                            console.log('onChangeTime', newEhrs);
                            act.Ehrs = newEhrs;
                            console.log('selectedjo', item.Activities);
                            setselectedJoDetails({...selectedJoDetails});
                          }}
                        />
                      </View>
                    ))}
                  </View>
                )}
              />
            </View>
            {selectedJoDetails['Spareparts']?.length > 0 ? (
              <View>
                <Text
                  style={{
                    marginVertical: 8,
                    fontWeight: 'bold',
                    fontSize: 16,
                    alignSelf: 'center',
                    color: 'black',
                  }}>
                  {AppTextData.txt_Spare_Parts}
                </Text>
                <TouchableOpacity
                  style={{alignSelf: 'center'}}
                  onPress={() => {
                    setVisibleActivities(!visibleActivities);
                  }}>
                  {/* <Text>APPLY</Text> */}
                  <Icon
                    name={visibleActivities ? 'angle-up' : 'angle-down'}
                    size={32}
                    color="black"
                  />
                </TouchableOpacity>
                {selectedJoDetails['Spareparts']?.length > 0 &&
                visibleActivities ? (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#778899',
                      height: 30,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        marginHorizontal: 4,
                        width: 70,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: 'black',
                      }}>
                      {AppTextData.txt_RQty}
                    </Text>
                    <Text
                      style={{
                        marginHorizontal: 4,
                        width: 70,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: 'black',
                      }}>
                      {AppTextData.AQty}
                    </Text>
                    <Text
                      style={{
                        marginHorizontal: 4,
                        width: 70,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: 'black',
                      }}>
                      {AppTextData.ES}
                    </Text>
                  </View>
                ) : null}
                {visibleActivities ? (
                  <FlatList
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    style={{
                      maxHeight: screenHeight / 2,
                      minHeight: 50,
                      // borderWidth:1,
                      // borderColor:'grey',
                      // marginBottom:10
                      // borderRightWidth:1,borderLeftWidth:1,borderLeftColor:'#778899',
                      // borderRightColor:'#778899'
                    }}
                    data={selectedJoDetails['Spareparts']}
                    renderItem={({item, index}) => (
                      <View
                        style={{
                          borderBottomWidth: 1,
                          borderLeftWidth: 1,
                          borderRightWidth: 1,
                          paddingVertical: 4,
                          borderBottomColor: 'grey',
                          backgroundColor: `${
                            item.RQTY > item.AQTY ? 'red' : 'white'
                          }`,
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                          }}>
                          <Text
                            style={{
                              marginHorizontal: 4,
                              flex: 1,
                              textAlign: 'center',
                              fontSize: 12,
                            }}>
                            {index + 1}
                          </Text>
                          <Text
                            style={{
                              marginHorizontal: 4,
                              flex: 2,
                              textAlign: 'center',
                              fontSize: 12,
                            }}>
                            {item?.Code}
                          </Text>
                          <Text
                            style={{
                              flex: 3,
                              textAlign: 'center',
                              fontSize: 12,
                            }}>
                            {item?.SpareParts}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            marginTop: 5,
                          }}>
                          <Text
                            style={{
                              marginHorizontal: 4,
                              width: 70,
                              textAlign: 'center',
                              fontWeight: 'bold',
                            }}>
                            {item?.RQTY}
                          </Text>
                          <Text
                            style={{
                              marginHorizontal: 4,
                              width: 70,
                              textAlign: 'center',
                              fontWeight: 'bold',
                            }}>
                            {item?.AQTY}
                          </Text>
                          <Text
                            style={{
                              marginHorizontal: 4,
                              width: 70,
                              textAlign: 'center',
                              fontWeight: 'bold',
                            }}>
                            {item?.ES}
                          </Text>
                        </View>
                      </View>
                    )}
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View
          style={{
            flexDirection: 'row',
            position: 'absolute',
            height: 40,
            bottom: 4,
            start: 0,
            end: 0,
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: CmmsColors.black,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              console.log('Tech--->>', TechnicianID);
              const ESC = selectedJoDetails['ESC'];
              console.log('Activities: ', ESC);
              // if (JoID != 0) {
              //   if (TechnicianID.length > 0) {
              //     if (ESC.length > 0) {
              //       if (
              //         ESC.map((esc) => esc.Activities).filter(
              //           (actList) =>
              //             actList.filter((act) => act.Ehrs == 0).length > 0,
              //         ).length == 0
              //       ) {
              //         navigation.navigate('ActivityListPage', {
              //           assignFromNTo,
              //           ESC,
              //           TechnicianID,
              //           //   updateAssignedJoids:(selectedJoids)=>{
              //           //   console.log("update_seleJOIDS: ",{selectedJoids})
              //           //   setSelectedJoIds(selectedJoids)
              //           // }
              //         });
              //         // getJobOrderAssignment()
              //       } else {
              //         // alert(AppTextData.txt_invalid_time);
              //         dispatch(
              //           actionSetAlertPopUpTwo({
              //             title: AppTextData.txt_Alert,
              //             body: AppTextData.txt_invalid_time,
              //             visible: true,
              //             type: 'ok',
              //           }),
              //         );
              //       }
              //     }
              //   } else {
              //     dispatch(
              //       actionSetAlertPopUpTwo({
              //         title: AppTextData.txt_Alert,
              //         body: AppTextData.txt_Please_Select_Alteast_one_Technician,
              //         visible: true,
              //         type: 'ok',
              //       }),
              //     );
              //   }
              // } else {
              //   if (TechnicianID.length > 0) {
              //     if (ESC.length > 0) {
              //       if (
              //         ESC.map((esc) => esc.Activities).filter(
              //           (actList) =>
              //             actList.filter((act) => act.Ehrs == 0).length > 0,
              //         ).length == 0
              //       ) {
              //         navigation.navigate('ActivityListPage', {
              //           assignFromNTo,
              //           ESC,
              //           TechnicianID,
              //         });
              //       } else {
              //         dispatch(
              //           actionSetAlertPopUpTwo({
              //             title: AppTextData.txt_Alert,
              //             body: AppTextData.txt_invalid_time,
              //             visible: true,
              //             type: 'ok',
              //           }),
              //         );
              //       }
              //     }
              //   } else {
              //     dispatch(
              //       actionSetAlertPopUpTwo({
              //         title: AppTextData.txt_Alert,
              //         body: AppTextData.txt_Please_Select_Alteast_one_Technician,
              //         visible: true,
              //         type: 'ok',
              //       }),
              //     );
              //   }
              // }
              if (TechnicianID?.length > 0 && ESC?.length > 0) {
                const invalidTime = ESC?.map((esc) => esc?.Activities).some(
                  (actList) => actList?.some((act) => act?.Ehrs === 0),
                );
                
console.error('the time is here->>',invalidTime)
                if (invalidTime!=null && !invalidTime) {
                  navigation.navigate('ActivityListPage', {
                    assignFromNTo,
                    ESC,
                    TechnicianID,
                  });
                } else {
                  dispatch(
                    actionSetAlertPopUpTwo({
                      title: AppTextData.txt_Alert,
                      body: AppTextData.txt_invalid_time,
                      visible: true,
                      type: 'ok',
                    }),
                  );
                }
              } else {
                dispatch(
                  actionSetAlertPopUpTwo({
                    title: AppTextData.txt_Alert,
                    body: AppTextData.txt_Please_Select_Alteast_one_Technician,
                    visible: true,
                    type: 'ok',
                  }),
                );
              }
            }}>
            <CmmsTextWhite>{AppTextData.txt_ASSIGN}</CmmsTextWhite>
          </TouchableOpacity>

          {pendingChecked ? (
            <>
              <TouchableOpacity
                style={{
                  backgroundColor: CmmsColors.logoTopGreen,
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setVisibleCancelRsnDlg(true);
                }}>
                <CmmsTextWhite style={{textTransform: 'uppercase'}}>
                  {AppTextData.txt_Cancel}
                </CmmsTextWhite>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  backgroundColor: CmmsColors.darkRed,
                  justifyContent: 'center',
                }}
                onPress={() => {
                  console.error('function=> DeleteAssignedWork');
                  console.log({selectedJoIds});
                  dispatch(actionSetLoading(true));
                  requestWithEndUrl(
                    `${API_SUPERVISOR}DeleteAssignedWork`,
                    selectedJoIds.map((seleJoid) => seleJoid.JOID),
                    'POST',
                  )
                    .then((res) => {
                      console.log('DeleteAssignedWork', {res});
                      dispatch(actionSetLoading(false));

                      if (res.status != 200) {
                        throw Error(res.statusText);
                      }
                      return res.data;
                    })
                    .then((data) => {
                      if (data.isSucess) {
                        // refreshPage()
                        dispatch(actionSetRefreshing());
                      }
                      // alert(data.Message);
                      dispatch(
                        actionSetAlertPopUpTwo({
                          title: AppTextData.txt_Alert,
                          body: AppTextData.txt_Success,
                          visible: true,
                          type: 'ok',
                        }),
                      );
                    })
                    .catch((err) => {
                      dispatch(actionSetLoading(false));

                      console.error('Error DeleteAssignedWork', err);
                    });
                }}>
                <CmmsTextWhite>{AppTextData.txt_DELETE}</CmmsTextWhite>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </BottomSheet>
    );
  }

  function refreshPage() {
    console.log('refreshPage', {refresh});
    setIsSelectionMode(false);
    setIsPanelOpen(false);
    setBottomSheetOpen(false);
    // panelRef.current.togglePanel()
    // setSelectedJoIds([])
    setselectedJoDetails({});
    // refreshFetch();
    //getJobOrderAssignment(); //getJobOrderAssignment() added by vbn , because refreshFetch function don't need getFilterCount() call
  }

  function getCancelRsnDlg() {
    console.warn('222');
    return (
      <Dialog
        title={'Cancel Backlogs'}
        visible={visibleCancelRsnDlg}

        // onTouchOutside={()=>setVisibleFilterWindow(false)}
      >
        <View>
          <Picker
            dropdownIconColor={CmmsColors.logoBottomGreen}
            mode={'dropdown'}
            selectedValue={selectedDefaultReason}
            onValueChange={(item, index) => {
              if (index != 0) {
                setSelectedDefaultReason(item);
              }
            }}>
            {[{Name: AppTextData.txt_Select_Reason, ID: -1}, ...reasonList].map(
              (item, index) => {
                return (
                  <Picker.Item
                    key={index}
                    label={`${item.Name}`}
                    value={`${item.ID}`}
                  />
                );
              },
            )}
          </Picker>
          <TextInput
            selectTextOnFocus
            style={{
              marginHorizontal: 8,
              paddingHorizontal: 8,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              alignContent: 'flex-start',
              textAlignVertical: 'top',
              borderWidth: 1,
              height: 100,
              borderColor: 'grey',
            }}
            multiline={true}
            numberOfLines={4}
            placeholder="Please enter your reason to cancel backlogs"
            onChangeText={(text) => setCancelReason(text)}
            value={cancelReason}
          />
          <View
            style={{
              marginTop: 16,
              flexDirection: 'row',
              alignSelf: 'flex-end',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
              onPress={() => {
                setVisibleCancelRsnDlg(false);
              }}>
              <Text>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                // backgroundColor:CmmsColors.logoBottomGreen,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 8,
                // paddingVertical:2
              }}
              onPress={() => {
                postCancelBackLogs();
              }}>
              <Text style={{color: CmmsColors.logoBottomGreen}}>SUBMIT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Dialog>
    );
  }

  //FILTER POPUP
  async function OpenFilterPopUp(e) {
    console.error('function->OpenFilterPopUp');
    console.log(
      'params for GetFilterCount api call==>>',
      'FromDate:',
      fromNToDate ? fromNToDate.selectedFromDate : 0,
      'ToDate:',
      fromNToDate ? fromNToDate.selectedToDate : 0,
      'SEID:',
      loggedUser.TechnicianID,
    );
    dispatch(actionSetLoading(true));
    try {
      const params = {
        FromDate: fromNToDate ? fromNToDate.selectedFromDate : 0,
        ToDate: fromNToDate ? fromNToDate.selectedToDate : 0,
        SEID: loggedUser.TechnicianID,
      };

      tempNotAssignChecked == false ||
        (tempAssignChecked && GetFilteredTechnicians());
      getMaintananceTypes();
      // setFilterCountData(GetFilterCount?.data);
      // console.log('FILTER DATA 1--->>', GetFilterCount?.data);
      dispatch(actionSetLoading(false));
    } catch (err) {
      console.error('error OpenFilterPopUp function', err);
      dispatch(
        actionSetAlertPopUpTwo({
          title: AppTextData.txt_Alert,
          body: AppTextData.txt_somthing_wrong_contact_admin,
          visible: true,
          type: 'ok',
        }),
      );
      // setFilterCountData(null);
      dispatch(actionSetLoading(false));
    }
    if (e == true) {
      setVisibleFilterWindow(!visibleFilterWindow);
    }
  }
  async function GetFilteredTechnicians() {
    try {
      const GetFilteredTechnicians = await requestWithEndUrl(
        `${API_SUPERVISOR}GetFilteredTechnicians`,
        {
          SEID: loggedUser.TechnicianID,
        },
      );
      setTechieList(GetFilteredTechnicians?.data);
      console.log('FILTER DATA 3--->>', GetFilteredTechnicians?.data);
    } catch (err) {
      console.error('error OpenFilterPopUp function', err);
      // alert(AppTextData.txt_somthing_wrong_contact_admin);
      dispatch(
        actionSetAlertPopUpTwo({
          title: AppTextData.txt_Alert,
          body: AppTextData.txt_somthing_wrong_contact_admin,
          visible: true,
          type: 'ok',
        }),
      );
    }
  }
  function postCancelBackLogs() {
    dispatch(actionSetLoading(true));
    console.error('function=> CancellBacklogs');
    requestWithEndUrl(
      `${API_SUPERVISOR}CancellBacklogs`,
      {
        Works: selectedJoIds,
        Notes: cancelReason,
        Date: new Date().getTime(),
        ReasonID: selectedDefaultReason,
        SEID: loggedUser.TechnicianID,
      },
      'POST',
    )
      .then((res) => {
        console.log('CancellBacklogs', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        dispatch(actionSetLoading(false));
        if (data.isSucess) {
          setVisibleCancelRsnDlg(false);
          dispatch(actionSetRefreshing());
          setCancelReason('');
        }
        // alert(data.Message);
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: AppTextData.txt_Success,
            visible: true,
            type: 'ok',
          }),
        );
      })
      .catch((err) => {
        console.log(' error CancellBacklogs', {err});
        // alert(AppTextData.txt_somthing_wrong_contact_admin);
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: AppTextData.txt_somthing_wrong_contact_admin,
            visible: true,
            type: 'ok',
          }),
        );
        dispatch(actionSetLoading(false));
      });
  }

  function getEstimatedMh(TAID) {
    let totMin = 0;
    selectedJoDetails['ESC']
      ?.filter((fElement) => fElement.TypeOfActivityID == TAID)
      .forEach((element) => {
        totMin += element.Activities.map((activity) => activity.Ehrs).reduce(
          (acc, val) => acc + val,
          0,
        );
      });
    return totMin; //timeMinToTimeFormat(totMin)
  }

  async function getManHours() {
    console.error('function=> GetAvailableEMHvsAMH'); //http://213.136.84.57:4545/api/ApkSupervisor/GetAvailableEMHvsAMH
    const maintananceTypeLngArray = maintananceTypes
      .filter((maintananceType) => maintananceType.checked)
      .map((newmain) => newmain.ID);
    const params = {
      FromDate: fromNToDate ? fromNToDate.selectedFromDate : 0,
      ToDate: fromNToDate ? fromNToDate.selectedToDate : 0,
      IsOverDue: overDueChecked,
      MJT: maintananceTypeLngArray,
      IsBacklog: backLogChecked,
      IsAssigned: assignChecked,
      IsNotAssigned: notAssignChecked,
      IsPending: pendingChecked,
      WorkList: selectedJoIds,
      AFromDate: assignFromNTo.selectedAssignFromDate,
      AToDate: assignFromNTo.selectedAssignToDate,
      UserID: loggedUser.TechnicianID,
    };
    console.log('params for api call GetAvailableEMHvsAMH==>>', params);
    try {
      const manHourRes = await requestWithEndUrl(
        `${API_SUPERVISOR}GetAvailableEMHvsAMH`,
        params,
        'POST',
      );
      console.log('fetchDataBasedOnSelectedJoids', {manHourRes});
      if (manHourRes.status != 200) {
        throw Error(res.statusText);
      }
      setManHourList(manHourRes.data);
    } catch (err) {
      console.error('Error GetAvailableEMHvsAMH', err);
      // alert(AppTextData.txt_Something_went_wrong);
      dispatch(
        actionSetAlertPopUpTwo({
          title: AppTextData.txt_Alert,
          body: AppTextData.txt_txt_Something_went_wrong,
          visible: true,
          type: 'ok',
        }),
      );
    }
  }

  function getOverDueTime(min) {
    const minutesInYear = 60 * 24 * 365;
    // if(min>=60){
    //   const hour = Math.floor(min/60)
    // }
    const days = (min / 60 / 24) % 365;
    // console.log({min, minutesInYear, days});
    const floorDays = Math.floor(days);
    // console.log({floorDays});
    return floorDays > 0 ? `${floorDays} days` : null;
  }
};
