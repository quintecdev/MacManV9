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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import BottomSheet from 'react-native-simple-bottom-sheet';
import requestWithEndUrl from '../../../../network/request';
import {API_SUPERVISOR} from '../../../../network/api_constants';
import {useSelector, useDispatch} from 'react-redux';
import {
  actionSetLoading,
  actionSetRefreshing,
} from '../../../../action/ActionSettings';
import DateTimePicker from '@react-native-community/datetimepicker';
import {CmmsText, CTextThin} from '../../../../common/components/CmmsText';
import {timeMinToTimeFormat} from '../../../../common/utils';
import CmmsColors from '../../../../common/CmmsColors';
import {parse, format} from 'date-fns';

const screenHeight = Dimensions.get('window').height;

export default ActivityListPage = ({navigation, route: {params}}) => {
  console.log('ActivityListPage', {ESC: params.ESC});
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const dispatch = useDispatch();
  const {isLoading} = useSelector((state) => state.SettingsReducer);
  const panelRef = useRef(null);
  const [isVisibleTechnicians, setIsVisibleTechnicians] = useState(false);
  const [activities, setActivities] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // var isPanelOpen = false
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedActivityUpdated, setSelectedActivityUpdated] = useState(false);
  const [techList, setTechList] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isFromTime, setIsFromTime] = useState(false);
  const [mode, setMode] = useState('date');
  console.log('ActivityListPage', {selectedActivity});
  console.log('ActivityListPage', {showTimePicker});
  const {
    loggedUser: {TechnicianID, TechnicianName},
  } = useSelector((state) => state.LoginReducer);
  console.log('ActivityListPage', {TechnicianID});
  useEffect(() => {
    getWorkDetailsForAssignment();
  }, []);

  useEffect(() => {
    if (selectedActivity)
      console.log('useEffect', 'se changed: ', selectedActivity?.SEID);
    //http://213.136.84.57:4545/api/ApkSupervisor/ChangeSEForAssignment?FromDate=1635425985000&SEID=6&JOID=0&EHrs=60

    // setSelectedActivity({...selectedActivity,SEID:item.ID,SE:item.Name,ImagePath:item.ImagePath})
  }, [selectedActivity?.SEID]);

  useEffect(() => {
    console.log('ActivityListPage', 'useEffect', {selectedActivity});

    //http://213.136.84.57:4545/api/ApkSupervisor/GetSEList?TypeOfActivityID=1
    if (selectedActivity) {
      requestWithEndUrl(`${API_SUPERVISOR}GetSEList`, {
        TypeOfActivityID: selectedActivity.TypeOfActivityID,
        FromDate: selectedActivity.FromDate,
        ToDate: selectedActivity.ToDate,
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
    //http://213.136.84.57:4545/api/ApkSupervisor/GetWorkDetailsForAssignment
    requestWithEndUrl(
      `${API_SUPERVISOR}GetWorkDetailsForAssignment`,
      {
        EmpID: TechnicianID,
        AFromDate: params.assignFromNTo.selectedAssignFromDate,
        AToDate: params.assignFromNTo.selectedAssignToDate,
        ESC: params.ESC,
      },
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
        dispatch(actionSetRefreshing());

        // params.updateAssignedJoids(data.map((work)=>{
        //   return {"WorkID":work.WorkID,"WorkType":work.WorkType,"JOID":work.JOID}
        // }))
      })
      .catch((err) => {
        dispatch(actionSetLoading(false));
        console.error('GetWorkDetailsForAssignment', err);
      });
  };

  const onDateChange = () => {};
  const closePanel = () => isPanelOpen && panelRef.current.togglePanel();
  const openPanel = () => !isPanelOpen && panelRef.current.togglePanel();

  const onChangeTime = ({nativeEvent}, selectedDate) => {
    const {timestamp} = nativeEvent;
    console.log('onChangeTime', {
      selectedDate,
      timestamp: timestamp,
      nativeEvent,
      selectedActivity,
    });
    const currentDate =
      timestamp ||
      (isFromTime ? selectedActivity?.FromDate : selectedActivity?.ToDate);
    setShowTimePicker(Platform.OS === 'ios');

    // setDate(currentDate);
    // let newSelectedActivity = {...selectedActivity}
    // isFromTime ? newSelectedActivity.FromDate=timestamp : newSelectedActivity.ToDate=timestamp
    // setSelectedActivity(newSelectedActivity)
    console.log('onChangeTime', {isFromTime, currentDate, timestamp});
    isFromTime
      ? setSelectedActivity({...selectedActivity, FromDate: currentDate})
      : setSelectedActivity({...selectedActivity, ToDate: currentDate});
  };

  return (
    <SafeAreaView style={{flex: 1, padding: 8}}>
      {/* <ImageBackground
                style={{
                  flex: 1,
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  // justifyContent: 'center',
                }}
                source={require('../../../../assets/bg/bg_cmms.webp')}
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
                console.log('bf4Openpanel', isPanelOpen);
                openPanel();
                setIsPanelOpen(true);
                //  panelRef.current.togglePanel()
                // if(!isPanelOpen){
                dispatch(actionSetLoading(true));
                setSelectedActivityUpdated(true);
                // }
                setSelectedActivity(item);
                // console.log("onpress",{isPanelOpen,state:panelRef?.current?.state})
              }
            }}>
            <Image
              style={{width: 72, height: 72}}
              source={{uri: item.ImagePath}}
              // defaultSource ={{uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqg2bnIx9h9oM3S52yCmANfKKGuuGXMYyCUQ&usqp=CAU'}}
              onError={() => {
                console.log('imageerror: ', item.ImagePath);
                // setIsMageError(true)
              }}
              onLoad={() => {
                console.log('onLoad_imageerror: ', item.ImagePath);
              }}
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
                <Icon name="clock-o" size={12} color="green" /> {item.FromDate}{' '}
                to {item.ToDate}
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
            onPress={() => setIsVisibleTechnicians(true)}>
            <Image
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                borderWidth: 1,
                borderColor: 'grey',
              }}
              source={{uri: selectedActivity?.ImagePath}}
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
                      dispatch(actionSetLoading(true));
                      //http://213.136.84.57:4545/api/ApkSupervisor/ChangeSEForAssignment?FromDate=1635425985000&SEID=6&JOID=0&EHrs=60
                      requestWithEndUrl(
                        `${API_SUPERVISOR}ChangeSEForAssignment`,
                        {
                          FromDate: item.NextASTime,
                          SEID: item.ID,
                          JOID: selectedActivity.JOID,
                          EHrs: selectedActivity.Ehrs,
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
                              FromDate: data.FromDate,
                              ToDate: data.ToDate,
                              SEID: item.ID,
                              SE: item.Name,
                              ImagePath: item.ImagePath,
                            });
                          }
                        })
                        .catch((err) => {
                          dispatch(actionSetLoading(false));
                          console.error('ChangeSEForAssignment', err);
                        });
                      // setSelectedActivity({...selectedActivity,})
                      // console.log("onpres",selectedActivity.FromDate)
                    }}>
                    <Image
                      style={{width: 75, height: 75, borderRadius: 37}}
                      source={{uri: item.ImagePath}}
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
                setMode('date');
                setShowTimePicker(true);
              }}>
              <Icon name="calendar" size={14} color="black" />
              <CmmsText style={{padding: 4}}>
                {format(
                  selectedActivity ? selectedActivity.FromDate : 0,
                  'dd/MM/yyyy',
                )}
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
                setMode('date');
                setShowTimePicker(true);
              }}>
              <Icon name="calendar" size={14} color="black" />
              <CmmsText style={{padding: 4}}>
                {format(
                  selectedActivity ? selectedActivity.ToDate : 0,
                  'dd/MM/yyyy',
                )}
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
                setMode('time');
                setShowTimePicker(true);
              }}>
              <Icon name="clock-o" size={14} color="black" />
              <CmmsText style={{padding: 4}}>
                {selectedActivity ? selectedActivity.FromDate : 0}
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
                setMode('time');
                setShowTimePicker(true);
              }}>
              <Icon name="clock-o" size={14} color="black" />
              <CmmsText style={{padding: 4}}>
                {selectedActivity ? selectedActivity.ToDate : 0}
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
              //http://213.136.84.57:4545/api/ApkSupervisor/UpdateWorkAssignment
              if (selectedActivity) {
                dispatch(actionSetLoading(true));
                selectedActivity.EmpID = TechnicianID;
                console.log({selectedActivity});
                requestWithEndUrl(
                  `${API_SUPERVISOR}UpdateWorkAssignment`,
                  selectedActivity,
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
                    alert(AppTextData.txt_Updated_Successfully);
                    getWorkDetailsForAssignment();
                    closePanel();
                  })
                  .catch((err) => {
                    dispatch(actionSetLoading(false));
                    console.error('UpdateWorkAssignment', err);
                    alert(AppTextData.txt_somthing_wrong_try_again);
                  });
              }
            }}>
            <CmmsText style={{color: 'white'}}>
              {AppTextData.txt_UPDATE}
            </CmmsText>
          </TouchableOpacity>
        </View>
      </BottomSheet>
      {showTimePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={
            new Date(
              isFromTime
                ? selectedActivity
                  ? selectedActivity.FromDate
                  : 0
                : selectedActivity
                ? selectedActivity.ToDate
                : 0,
            )
          }
          mode={mode}
          // is24Hour={true}
          maximumDate={isFromTime ? new Date(selectedActivity?.ToDate) : null}
          display="default"
          onChange={onChangeTime}
        />
      )}
    </SafeAreaView>
  );
};
