import React, {useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ImageBackground,
  Dimensions,
  Platform,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DatePicker from 'react-native-datepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import BottomSheet from 'react-native-simple-bottom-sheet';
import requestWithEndUrl from '../../../../network/request';
import {API_SUPERVISOR, BASE_IP} from '../../../../network/api_constants';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import {CmmsText, CTextThin} from '../../../../common/components/CmmsText';
import {showAlert, timeMinToTimeFormat} from '../../../../common/utils';
import CmmsColors from '../../../../common/CmmsColors';
import Alerts from '../../../components/Alert/Alerts';
import {getMilliseconds} from 'date-fns';
import moment from 'moment';

const screenHeight = Dimensions.get('window').height;

export default ActivityListPage = ({navigation, route: {params}}) => {
  console.log('ActivityListPage', {ESC: params.ESC});
  console.log('SeList from the Activity list page==>', params.TechnicianID);
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const dispatch = useDispatch();
  const {isLoading} = useSelector((state) => state.SettingsReducer);
  const {CheckActivityListVisit} = useSelector(
    (state) => state.PageVisitReducer,
  );
  const {AlertPopUp, AlertPopUpTwo} = useSelector((state) => {
    return state.AlertPopUpReducer;
  });
  const panelRef = useRef(null);
  const [isVisibleTechnicians, setIsVisibleTechnicians] = useState(false);
  const [activities, setActivities] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // var isPanelOpen = false
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedActivityUpdated, setSelectedActivityUpdated] = useState(false);
  const [datefrom, setdatefrom] = useState();
  const [dateTo, setDateto] = useState();
  const [timeFrom, setTimeFrom] = useState();
  const [timeTo, setTimeTo] = useState();
  const [uploadingDate, setUploadingDate] = useState({
    from: '',
    to: '',
  });
  const [techList, setTechList] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isFromTime, setIsFromTime] = useState(false);
  const [ActualDate, setActualDate] = useState({
    from: null,
    to: null,
  });
  const [ActualTime, setActualTime] = useState({
    from: null,
    to: null,
  });
  console.log(
    'act time-- from state->>',
    ActualTime,
    'act data----from state-->>',
    ActualDate,
  );
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [mode, setMode] = useState('date');
  // console.log('ActivityListPage', {selectedActivity});
  // console.log('ActivityListPage', {showTimePicker});
  console.log('activity from the state==>>', activities);
  const {
    loggedUser: {TechnicianID, TechnicianName},
  } = useSelector((state) => state.LoginReducer);
  console.log('ActivityListPage', {TechnicianID});
  useEffect(() => {
    getWorkDetailsForAssignment();
    dispatch(actionSetActivityListPageVisit(true));
  }, []);

  // useEffect(() => {
  //   console.error('state value==>>', CheckActivityListVisit);
  //   dispatch(actionSetActivityListPageVisit(true));
  //   if (selectedActivity)
  //     console.log('useEffect', 'se changed: ', selectedActivity?.SEID);
  //   //http://213.136.84.57:4545/api/ApkSupervisor/ChangeSEForAssignment?FromDate=1635425985000&SEID=6&JOID=0&EHrs=60

  //   // setSelectedActivity({...selectedActivity,SEID:item.ID,SE:item.Name,ImagePath:item.ImagePath})
  // }, [selectedActivity?.SEID]);

  useEffect(() => {
    console.log('ActivityListPage', 'useEffect', {selectedActivity});

    //http://213.136.84.57:4545/api/ApkSupervisor/GetSEList?TypeOfActivityID=1
    if (selectedActivity) {
      console.log(
        'params for the api call GetSEList',
        'TypeOfActivityID:',
        selectedActivity.TypeOfActivityID,
        'FromDate:',
        selectedActivity.ToDateInMS,
        'ToDate: ',
        selectedActivity.FromDateInMS,
      );
      requestWithEndUrl(`${API_SUPERVISOR}GetSEList`, {
        TypeOfActivityID: selectedActivity.TypeOfActivityID,
        FromDate: selectedActivity.ToDateInMS,
        ToDate: selectedActivity.FromDateInMS,
      })
        .then((res) => {
          setSelectedActivityUpdated(false);
          console.log('GetSEList', {res});
          dispatch(actionSetLoading(false));
          if (res.status != 200) {
            throw Error(res.statusText);
          }
          return res.data;
        })
        .then((data) => {
          const tempTechList = data.filter(
            (techie) => techie.ID != selectedActivity.SEID,
          );
          console.log('templist', tempTechList, 'data: ', data);
          setTechList(tempTechList);
        })
        .catch((err) => {
          setSelectedActivityUpdated(false);
          dispatch(actionSetLoading(false));
          console.error('GetSEList', err);
        });
    }
  }, [selectedActivityUpdated]);

  const getWorkDetailsForAssignment = () => {
    dispatch(actionSetLoading(true));
    const Params = {
      EmpID: TechnicianID,
      AFromDate: params.assignFromNTo.selectedAssignFromDate,
      AToDate: params.assignFromNTo.selectedAssignToDate,
      ESC: params.ESC,
      SEList: params.TechnicianID,
    };

    console.log('params for GetWorkDetailsForAssignment api call', Params);
    requestWithEndUrl(
      `${API_SUPERVISOR}GetWorkDetailsForAssignment`,
      Params,
      'POST',
    )
      .then((res) => {
        console.log('GetWorkDetailsForAssignment', {res});

        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        setActivities(data);
        dispatch(actionSetLoading(false));
        // dispatch(actionSetRefreshing());
      })
      .catch((err) => {
        dispatch(actionSetLoading(false));
        console.error('GetWorkDetailsForAssignment', err);
      });
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    console.log('date from the calander-->>', date);
    const finalDate = date;
    let tempDate = new Date(finalDate);

    if (mode == 'dateFrom') {
      setdatefrom(TimeConversion(tempDate, 'dateForParse'));
      setActualDate({
        from: TimeConversion(tempDate, 'date'),
        to: ActualDate.to,
      });
    } else if (mode == 'dateTo') {
      setDateto(TimeConversion(tempDate, 'dateForParse'));
      setActualDate({
        from: ActualDate.from,
        to: TimeConversion(tempDate, 'date'),
      });
    } else if (mode == 'timeFrom') {
      setTimeFrom(TimeConversion(tempDate, 'noAmPmtime'));
      setActualTime({
        from: TimeConversion(tempDate, 'time'),
        to: ActualTime.to,
      });
    } else if (mode == 'timeTo') {
      setTimeTo(TimeConversion(tempDate, 'noAmPmtime')),
        setActualTime({
          from: ActualTime.from,
          to: TimeConversion(tempDate, 'time'),
        });
    }
    hideDatePicker();
  };
  const onDateChange = () => {};
  const closePanel = () => isPanelOpen && panelRef.current.togglePanel();
  const openPanel = () => !isPanelOpen && panelRef.current.togglePanel();

  async function inter() {
    console.log(
      'final date is here-->>',
      datefrom + timeFrom,
      '-----',
      dateTo + timeTo,
    );
    console.error(
      'time for the final conversion==>>',
      'from date-->>',
      new Date(datefrom + timeFrom).getTime(),
      '===',
      'to date-->',
      new Date(dateTo + timeTo).getTime(),
    );
    console.error(
      'time for the final conversion using mement==>>',
      'from date-->>',
      moment(datefrom + timeFrom).valueOf(),
      '===',
      'to date-->',
      moment(dateTo + timeTo).valueOf(),
    );
    // console.warn(
    //   'normal date.parse==>',
    //   Date(datefrom + timeFrom).getTime() +
    //     ' ....... ' +
    //     Date(dateTo + timeTo).getTime(),
    //   'new date conversion -->>',

    //   // new Date().getMilliseconds(datefrom+timeFrom) +new Date().getMilliseconds(dateTo+timeTo)
    // );
    // const time=new Date(formattedDateString).getTime()
    if (selectedActivity) {
      // console.warn('ggggggggg    '+JSON.stringify(selectedActivity))
      dispatch(actionSetLoading(true));
      selectedActivity.EmpID = TechnicianID;
      console.log({selectedActivity});
      const params = {
        ID: selectedActivity.ID,
        AssetID: selectedActivity.AssetID,
        Asset: selectedActivity.Asset,
        Code: selectedActivity.Code,
        TypeOfActivityID: selectedActivity.TypeOfActivityID,
        Ehrs: selectedActivity.Ehrs,
        ESC: selectedActivity.ESC,
        WorkID: selectedActivity.WorkID,
        WorkType: selectedActivity.WorkType,
        SEID: selectedActivity.SEID,
        SE: selectedActivity.SE,
        // FromDate: Date.parse(datefrom + timeFrom),
        FromDate: moment(datefrom + timeFrom).valueOf(),
        // ToDate: Date.parse(dateTo + timeTo),
        ToDate: moment(dateTo + timeTo).valueOf(),
        ImagePath: selectedActivity.ImagePath,
        JOID: selectedActivity.JOID,
        JONo: selectedActivity.JONo,
      };
      console.log('params for update work Assignment api call==>>', params);
      requestWithEndUrl(
        `${API_SUPERVISOR}UpdateWorkAssignment`,
        {
          ID: selectedActivity.ID,
          AssetID: selectedActivity.AssetID,
          Asset: selectedActivity.Asset,
          Code: selectedActivity.Code,
          TypeOfActivityID: selectedActivity.TypeOfActivityID,
          Ehrs: selectedActivity.Ehrs,
          ESC: selectedActivity.ESC,
          WorkID: selectedActivity.WorkID,
          WorkType: selectedActivity.WorkType,
          SEID: selectedActivity.SEID,
          SE: selectedActivity.SE,
          // FromDate: Date.parse(datefrom + timeFrom),
          FromDate: moment(datefrom + timeFrom).valueOf(),
          // ToDate: Date.parse(dateTo + timeTo),
          ToDate: moment(dateTo + timeTo).valueOf(),
          ImagePath: selectedActivity.ImagePath,
          JOID: selectedActivity.JOID,
          JONo: selectedActivity.JONo,
        },
        'POST',
      )
        .then((res) => {
          console.log('UpdateWorkAssignment', {res});
          dispatch(actionSetLoading(false));

          if (res.status != 200) {
            throw Error(res.statusText);
          }
          return res.data;
        })
        .then((data) => {
          // alert(AppTextData.txt_Updated_Successfully);

          dispatch(
            actionSetAlertPopUpTwo({
              title: AppTextData.txt_Alert,
              body: AppTextData.txt_Updated_Successfully,

              visible: true,
              type: 'ok',
            }),
          );
          const IndexToUpdate = activities.findIndex((e) => e.ID == data[0].ID);
          if (IndexToUpdate != -1) {
            const NewArray = [...activities];
            console.log('inside the index update function');
            NewArray[IndexToUpdate] = data[0];
            setActivities(NewArray);
          }
          console.log(
            'updated details===>>',
            data[0],
            'previous state==>>',
            activities,
          );
          console.log(
            'is activity id there==>>',
            activities.findIndex((e) => e.ID == data[0].ID),
          );
          // getWorkDetailsForAssignment();
          closePanel();
        })
        .catch((err) => {
          dispatch(actionSetLoading(false));
          console.error('UpdateWorkAssignment', err);
          // alert(AppTextData.txt_somthing_wrong_try_again);
          // alert('Please re-enter the assigning time');
          dispatch(
            actionSetAlertPopUpTwo({
              title: AppTextData.txt_Alert,
              body: AppTextData.txt_Please_re_enter_the_assigning_time,
              visible: true,
              type: 'ok',
            }),
          );
        });
    }
  }
  const TimeConversion = (e, type) => {
    const date = moment(e).format('DD-MM-YYYY');
    const dateForConversion = moment(e).format('YYYY-MM-DD');
    const time24hr = moment(e).format('HH:mm');
    const timeAmPm = moment(e).format('hh:mm A');

    console.log('time 24 hr--->>', time24hr);
    console.log('time am pm-->>', timeAmPm);
    console.log('date-->>', date);
    console.log('date for conversion-->>', dateForConversion);
    // console.log('time conversion---->>>', new Date(e).toDateString());
    // console.log('params in TimeConversion function', e);
    // var ts = new Date(e).toTimeString();
    // console.log('time string-->>', ts);
    // var H = +ts.substr(0, 2); // hour in the 24 hr format
    // console.log('what is the time-->>', H);
    // var h = H % 12 || 12; // hour converted into the the 12 hr format
    // h = h < 10 ? '0' + h : h;
    // console.log('time 1->>>>', h);
    // var h24 = H < 10 ? '0' + H : H + ':' + h + ':00';
    // console.log('what is the date 24 hr-->>???', h24, 'type-->>', type, 'e', e); // leading 0 at the left for 1 digit hours
    // var ampm = H < 12 ? ' AM' : ' PM';
    // ts = h + ts.substr(2, 3) + ampm;
    // console.log('selected time', ts + '...........');

    // if (H > 12) {
    //   const hours = (parseInt(h + ts.substr(2, 3), 10) + 12).toString();
    //   console.log('what is time??-->>', hours);
    // }

    // hours = (parseInt(ts, 10) + 12).toString();
    // const finalDate = e;
    // let tempDate = new Date(finalDate);
    // let tempDate = new Date(e);

    // let fDate =
    //   tempDate.getDate() +
    //   '/' +
    //   (tempDate.getMonth() + 1) +
    //   '/' +
    //   tempDate.getFullYear();

    // const yyyy = tempDate.getFullYear();
    // const mm =
    //   tempDate.getMonth() < 9
    //     ? '0' + (tempDate.getMonth() + 1)
    //     : tempDate.getMonth() + 1;
    // const dd =
    //   tempDate.getDate() < 10 ? '0' + tempDate.getDate() : tempDate.getDate();
    // console.log('Return Date==>>', yyyy + '-' + mm + '-' + dd);

    if (type == 'date') {
      // console.log('date *****>', fDate);
      // return fDate;
      // return dd + '-' + mm + '-' + yyyy;
      return date;
      // return y;
    } else if (type == 'time') {
      // console.log('time****>', ts);
      // return ts;
      return timeAmPm;
    } else if (type == 'noAmPmtime') {
      // console.log('noAmPmtime ***>', 'T' + h + ts.substr(2, 3) + ':00');
      // return 'T' + h + ts.substr(2, 3) + ':00';

      // return 'T' + h24;
      return 'T' + time24hr + ':00';
    } else if (type == 'dateForParse') {
      // console.log('dateForParse****>', yyyy + '-' + mm + '-' + dd);
      // return yyyy + '-' + mm + '-' + dd;
      return dateForConversion;
    }
  };

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
      <FlatList
        showsVerticalScrollIndicator={false}
        data={activities}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              backgroundColor: 'white',
              padding: 4,
              marginVertical: 4,
              elevation: 5,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              if (!isLoading) {
                console.log('bf4Openpanel', item);
                openPanel();
                setIsPanelOpen(true);
                dispatch(actionSetLoading(true));
                setSelectedActivityUpdated(true);
                setSelectedActivity(item);

                const DateInMSFrom = new Date(item.FromDateInMS);
                const DateInMSTo = new Date(item.ToDateInMS);
                // *******
                setTimeFrom(TimeConversion(item.FromDateInMS, 'noAmPmtime'));
                setTimeTo(TimeConversion(item.ToDateInMS, 'noAmPmtime'));

                setdatefrom(TimeConversion(item.FromDateInMS, 'dateForParse'));
                setDateto(TimeConversion(item.ToDateInMS, 'dateForParse'));

                setActualDate({
                  from: TimeConversion(item.FromDateInMS, 'date'),
                  to: TimeConversion(item.ToDateInMS, 'date'),
                });
                setActualTime({
                  from: TimeConversion(item.FromDateInMS, 'time'),
                  to: TimeConversion(item.ToDateInMS, 'time'),
                });
              }
            }}>
            <Image
              style={{width: 72, height: 72}}
              source={{
                uri: `${BASE_IP}/Images/Employee/` + item.ImagePath,
              }}
              // defaultSource ={{uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqg2bnIx9h9oM3S52yCmANfKKGuuGXMYyCUQ&usqp=CAU'}}
              // onError={() => {
              //   console.log('imageerror: ', item.ImagePath);
              //   // setIsMageError(true)
              // }}
              // onLoad={() => {
              //   console.log('onLoad_imageerror: ', item.ImagePath);
              // }}
            />
            <View style={{paddingHorizontal: 8, paddingVertical: 4, flex: 1}}>
              <CmmsText
                style={{fontSize: 15, fontWeight: 'bold', color: 'black'}}>
                {/* {item.Code}/{item.Asset}/{item.MaintenanceJobType}/{item.Location} */}

                {`${item.Code}/${item.Asset}/${item.ESC}`.replace(
                  /^\/+|\/+$/g,
                  '',
                )}
              </CmmsText>
              <CmmsText style={{color: 'grey'}}>
                <Icon name="user" size={14} color="grey" /> {`${item.SE}\n`}
                <CmmsText style={{color: 'grey', fontSize: 10}}>
                  <Icon name="clock-o" size={12} color="grey" />{' '}
                  {`JO ${item.JONo} - ${timeMinToTimeFormat(item.Ehrs)}`}
                </CmmsText>
              </CmmsText>
              <CTextThin
                style={{
                  color: 'green',
                  alignSelf: 'flex-end',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  textAlign: 'center',
                  fontSize: 10,
                  marginTop: 5,
                }}>
                {/* from date and to date */}
                <Icon name="clock-o" size={12} color="green" />
                {/* {item.FromDate}{' '}
                to {item.ToDate} */}
                {/* {moment(item.FromDateInMS).format('DD/MM/YYYY') +
                  ' ' +
                  moment(item.FromDateInMS).format('hh:mm A')}{' '}
                {moment(item.ToDateInMS).format('DD/MM/YYYY') +
                  ' ' +
                  moment(item.ToDateInMS).format('hh:mm A')} */}
                {TimeConversion(item.FromDateInMS, 'date') +
                  ' ' +
                  TimeConversion(item.FromDateInMS, 'time')}{' '}
                {TimeConversion(item.ToDateInMS, 'date') +
                  ' ' +
                  TimeConversion(item.ToDateInMS, 'time')}
              </CTextThin>
            </View>
          </TouchableOpacity>
        )}
      />
      <BottomSheet
        isOpen={isPanelOpen}
        sliderMinHeight={0}
        sliderMaxHeight={screenHeight - 70}
        ref={(ref) => (panelRef.current = ref)}
        onOpen={() => {
          console.log('onOpen');
          // isPanelOpen = true
          !isPanelOpen && setIsPanelOpen(true);
        }}
        onClose={() => {
          console.log('onClose');
          // isPanelOpen = false
          isPanelOpen && setIsPanelOpen(false);
        }}>
        <View>
          <CmmsText
            style={{fontSize: 16, fontWeight: 'bold', textAlign: 'center'}}>
            {`${selectedActivity?.Code}/${selectedActivity?.Asset}/${selectedActivity?.ESC}`}
            {/* {`JO ${selectedActivity?.JONo} - ${timeMinToTimeFormat(selectedActivity?.Ehrs)}`} */}

            {/* Induction Fulka Puffer Live Counter/20013/Mechanical */}
          </CmmsText>
          <CmmsText style={{textAlign: 'center', color: 'black'}}>
            {`JO ${selectedActivity?.JONo} - ${timeMinToTimeFormat(
              selectedActivity?.Ehrs,
            )}`}
          </CmmsText>
          <TouchableOpacity
            style={{
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              marginVertical: 4,
            }}
            onPress={() => {
              setIsVisibleTechnicians(true);
              console.warn(
                'http://185.250.36.197:2021/' + selectedActivity?.ImagePath,
              );
            }}>
            <Image
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                borderWidth: 1,
                borderColor: 'grey',
              }}
              source={{
                uri:
                  `${BASE_IP}/Images/Employee/` + selectedActivity?.ImagePath,
              }}
            />
            <CmmsText style={{fontWeight: 'bold'}}>
              {selectedActivity?.SE}
            </CmmsText>
          </TouchableOpacity>

          {isVisibleTechnicians && (
            <View style={{borderWidth: 1, padding: 4, borderRadius: 5}}>
              <CmmsText
                style={{
                  position: 'absolute',
                  top: 4,
                  start: 4,
                  fontWeight: 'bold',
                  fontSize: 15,
                }}>
                {AppTextData.txt_Change_Technician}
              </CmmsText>
              <TouchableOpacity
                style={{alignSelf: 'flex-end'}}
                onPress={() => setIsVisibleTechnicians(false)}>
                <Icon name="window-close" size={24} color="black" />
              </TouchableOpacity>
              <FlatList
                style={{marginVertical: 5}}
                data={techList}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({item, index}) => (
                  <TouchableOpacity
                    style={{
                      alignSelf: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: item.ID == selectedActivity.SEID ? 1 : 0,
                      borderColor: 'blue',
                      padding: 4,
                      maxWidth: 100,
                      marginVertical: 4,
                      marginHorizontal: 4,
                    }}
                    onPress={() => {
                      console.log(
                        'params for api call ChangeSEForAssignment "Change tech from the activity list"==>',
                        'FromDate:',
                        item.NextASTimeMS,
                        ' SEID:',
                        item.ID,
                        'JOID:',
                        selectedActivity.JOID,
                        'EHrs:',
                        selectedActivity.Ehrs,
                      );

                      // console.warn('kkkkkkkkk ......'+item.ImagePath)
                      dispatch(actionSetLoading(true));
                      //http://213.136.84.57:4545/api/ApkSupervisor/ChangeSEForAssignment?FromDate=1635425985000&SEID=6&JOID=0&EHrs=60
                      requestWithEndUrl(
                        `${API_SUPERVISOR}ChangeSEForAssignment`,
                        {
                          FromDate: item.NextASTimeMS, //this key added by Seetha on GetSEList Api call (17th jan 2023)
                          SEID: item.ID,
                          EHrs: selectedActivity.Ehrs,
                          JOID: selectedActivity.JOID,
                        },
                        'POST',
                      )
                        .then((res) => {
                          console.log('ChangeSEForAssignment', {res});

                          if (res.status != 200) {
                            throw Error(res.statusText);
                          }
                          return res.data;
                        })
                        .then((data) => {
                          dispatch(actionSetLoading(false));
                          if (data) {
                            setSelectedActivity({
                              ...selectedActivity,
                              // FromDate: data.FromDate,
                              // ToDate: data.ToDate,
                              SEID: item.ID,
                              SE: item.Name,
                              ImagePath: item.ImagePath,
                            });
                            // alert('success');
                          }
                        })
                        .catch((err) => {
                          dispatch(actionSetLoading(false));
                          console.error('Error ChangeSEForAssignment', err);
                        });
                      // setSelectedActivity({...selectedActivity,})
                      // console.log("onpres",selectedActivity.FromDate)
                    }}>
                    <Image
                      style={{width: 75, height: 75, borderRadius: 37}}
                      source={{
                        uri: `${BASE_IP}/Images/Employee/` + item.ImagePath,
                      }}
                    />
                    <CmmsText
                      style={{textAlign: 'center', fontSize: 12}}
                      numberOfLines={1}>
                      {item.Name}
                    </CmmsText>
                    <CTextThin
                      style={{
                        textAlign: 'center',
                        color: 'black',
                        fontSize: 10,
                      }}
                      numberOfLines={1}>
                      ({item.MH} -{' '}
                      <CTextThin
                        style={{
                          color: CmmsColors.logoBottomGreen,
                          fontSize: 10,
                        }}>
                        {item.NextASTime}
                      </CTextThin>
                      )
                    </CTextThin>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* <FromToDatePicker 
                        style={{marginVertical:4}} 
                        fromDate = {new Date(1613388319000)}
                        toDate = {new Date(1613388319000)}//selectedActivity?selectedActivity.ToDate:0
                        onDateChange={onDateChange}/> */}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginTop: 8,
            }}>
            <CmmsText style={{fontWeight: 'bold'}}>
              {AppTextData.txt_From}:{' '}
            </CmmsText>
            <TouchableOpacity
              style={{
                flex: 4,
                borderWidth: 1,
                borderColor: 'grey',
                padding: 4,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                setIsFromTime(true);
                setMode('dateFrom');
                setShowTimePicker(true);
                showDatePicker();
              }}>
              <Icon name="calendar" size={14} color="black" />
              <CmmsText style={{padding: 4}}>
                {/* {format(
                  selectedActivity ? selectedActivity.FromDate : 0,
                  'dd/MM/yyyy',
                )} */}
                {ActualDate ? ActualDate.from : 0}
              </CmmsText>
            </TouchableOpacity>
            <CmmsText style={{flex: 1, fontWeight: 'bold', marginStart: 16}}>
              {AppTextData.txt_To}:{' '}
            </CmmsText>
            <TouchableOpacity
              style={{
                flex: 4,
                borderWidth: 1,
                borderColor: 'grey',
                padding: 4,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                setIsFromTime(false);
                setMode('dateTo');
                setShowTimePicker(true);
                showDatePicker();
              }}>
              <Icon name="calendar" size={14} color="black" />
              <CmmsText style={{padding: 4}}>
                {/* {format(
                  selectedActivity ? selectedActivity.ToDate.split(' ')[0] : 0,
                  'dd/MM/yyyy',
                )} */}
                {ActualDate ? ActualDate.to : 0}
              </CmmsText>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginTop: 8,
            }}>
            <CmmsText style={{fontWeight: 'bold'}}>
              {AppTextData.txt_From}:{' '}
            </CmmsText>
            <TouchableOpacity
              style={{
                flex: 4,
                borderWidth: 1,
                borderColor: 'grey',
                padding: 4,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                setIsFromTime(true);
                setMode('timeFrom');
                setShowTimePicker(true);
                showDatePicker();
              }}>
              <Icon name="clock-o" size={14} color="black" />
              <CmmsText style={{padding: 4}}>
                {ActualTime ? ActualTime.from : 0}
              </CmmsText>
            </TouchableOpacity>
            <CmmsText style={{flex: 1, fontWeight: 'bold', marginStart: 16}}>
              {AppTextData.txt_To}:{' '}
            </CmmsText>
            <TouchableOpacity
              style={{
                flex: 4,
                borderWidth: 1,
                borderColor: 'grey',
                padding: 4,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                setIsFromTime(false);
                setMode('timeTo');
                setShowTimePicker(true);
                showDatePicker();
                console.log('time . . . . . . . . . . ' + selectedActivity);
              }}>
              <Icon name="clock-o" size={14} color="black" />
              <CmmsText style={{padding: 4}}>
                {ActualTime ? ActualTime.to : 0}
              </CmmsText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: 'green',
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              marginVertical: 16,
            }}
            onPress={() => {
              // var myDate = +new Date("2012-02-10T13:19:11+0000");

              //http://213.136.84.57:4545/api/ApkSupervisor/UpdateWorkAssignment

              inter();
            }}>
            <CmmsText style={{color: 'white'}}>
              {AppTextData.txt_UPDATE}
            </CmmsText>
          </TouchableOpacity>
        </View>
      </BottomSheet>
      {/* {showTimePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={
            new Date(
              // isFromTime
              //   ? selectedActivity
              //     ? selectedActivity.FromDate
              //     : 0
              //   : selectedActivity
              //   ? selectedActivity.ToDate
              //   : 0,
            )
          }
          mode={mode}
          is24Hour={true}
          maximumDate={new Date()}
          // maximumDate={isFromTime ? new Date(selectedActivity?.ToDate) : null}
          display="default"
          onChange={onChangeTime}
        />
      )} */}
      {/* <DatePicker
        onOpenModal={isDatePickerVisible}
        mode={mode == 'dateFrom' || mode == 'dateTo' ? 'date' : 'time'}>
        {/* "time" | "date" | "datetime" */}
      {/* </DatePicker> */}
      <DateTimePickerModal
        is24Hour={false}
        // is24Hour={mode == 'dateFrom' || mode == 'dateTo' ? false : true}
        isVisible={isDatePickerVisible}
        mode={mode == 'dateFrom' || mode == 'dateTo' ? 'date' : 'time'}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </SafeAreaView>
  );
};
