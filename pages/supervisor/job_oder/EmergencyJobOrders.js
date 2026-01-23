import React, {useCallback, useEffect, useState} from 'react';
import {
  TextInput,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Pressable,KeyboardAvoidingView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CmmsColors from '../../../common/CmmsColors';
import {CmmsText} from '../../../common/components/CmmsText';
import {
  API_COMMON,
  API_IMAGEPATH,
  API_SUPERVISOR,
} from '../../../network/api_constants';
import requestWithEndUrl from '../../../network/request';
import {useSelector, useDispatch} from 'react-redux';
import {format, parse} from 'date-fns';
import {
  actionSetLoading,
  actionSetRefreshing,
} from '../../../action/ActionSettings';
import {actionSetAlertPopUpTwo} from '../../../action/ActionAlertPopUp';
import {CText, CTextThin} from '../../../common/components/CmmsText';
import ViewMoreText from 'react-native-view-more-text';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import PopUp from '../../components/PopUp/PopUp';
import Alerts from '../../components/Alert/Alerts';
import RefreshButton from '../Components/RefreshButton';
import GetSpartsAndActivities from './job_assignment/component/GetSpartsAndActivities';
import { ScrollView } from 'react-native';
import { actionSetEmergencyJobListShow } from '../../../action/ActionCurrentPage';
//coming from the Supr page(bell button in the header section)
export default EmergencyJobOrders = ({navigation, route: {params}}) => {
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  console.log('EmergencyJobOrders', {params});
  const {TechList} = useSelector((state) => state.TechnicianReducer);
  const {refresh} = useSelector((state) => state.SettingsReducer);
  const {loggedUser} = useSelector((state) => state.LoginReducer);
  const {AlertPopUp, AlertPopUpTwo} = useSelector((state) => {
    return state.AlertPopUpReducer;
  });
  const {jobDate, IsStandbyPermission} = useSelector(
    (state) => state.VersionReducer,
  );
const {EmergencyJobListToShow} = useSelector(
    (state) => state.CurrentPageReducer,
  );
  console.log('EmergencyJobOrders', {TechList});
  const [eligibleTechList, setEligibleTechList] = useState(TechList);
  const width = Dimensions.get('window').width;
  const Height = Dimensions.get('window').height;
  const [emgJoList, setEmgJoList] = useState([]);
  // const[emgJoList,setEmgJoList] = useState([])

  const [selectedJobId, setSelectedJobId] = useState(0);
  const [selectedTechId, setSelectedTechId] = useState(0);
  const [assignModal, setAssignModal] = useState(false);
  const [WorkCenter, setWorkCenter] = useState([]);
  const [RightSwipedWork, setRightSwipedWork] = useState({});
  const [LeftSwipe, setLeftSwipe] = useState(false);
  const [LeftSwipData, setLeftSwipData] = useState({});
  const [time, setTime] = useState(1);

  const dateTime = Date.now();
  const dispatch = useDispatch();

  const onTextLayout = useCallback((e, item) => {
    console.log('onTextlayout', e.nativeEvent, item);
  }, []);
  useEffect(() => {
    dispatch(actionSetLoading(true));
    console.log('EmergencyJobOrders params' + JSON.stringify(params));

    console.log('params for the emergeny job list-->>',    {dateTime}, loggedUser.TechnicianID,);
    // const selectedTimemillies = parse(
    //   jobDate,
    //   'dd/MM/yyyy',
    //   new Date(),
    // ).getTime();
    
    // EmergencyJobList api call updatated with JobList by Riaz on 22-06-2024
    requestWithEndUrl(`${API_SUPERVISOR}JobList`, {
      Date: dateTime,
      SEID: loggedUser.TechnicianID,
      TransMode:params.breakdown? 'BREAKDOWN':'WOINTERNAL'
    })
      .then((res) => {
        // console.log('EmergencyJobList', {res});
        dispatch(actionSetLoading(false));

        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        // console.log('EmergencyJobList from the breakdown page->>', {data});
        data.forEach((emgJo) => {
          emgJo.noLines = 1;
        });

        // console.log('EmergencyJobList', {data});
        setEmgJoList(data);
        // setSeenBy();
      })
      .catch((err) => {
        console.log('EmergencyJobList in catch-->>', err);
        dispatch(actionSetLoading(false));
      });
  }, [refresh]);

  useEffect(() => {
    console.log('useEffect_selectedJobId: ', selectedJobId);

    // const selectedTimemillies = parse(
    //   jobDate,
    //   'dd/MM/yyyy',
    //   new Date(),
    // ).getTime();
    console.log(
      'params for GetAllTechnicians api call==>',
      'Date:',
      dateTime,
      'WorkID:',
      selectedJobId,
    );
    requestWithEndUrl(`${API_SUPERVISOR}GetAllTechnicians`, {
      Date: dateTime,
      WorkID: selectedJobId,
      SEID: loggedUser.TechnicianID,
    })
      .then((res) => {
        // console.log('GetAllTechnicians', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        // console.log('GetAllTechnicians', data);
        setEligibleTechList(data.SEList);
      })
      .catch((err) => {
        console.error('GetAllTechnicians', err);
      });
  }, [selectedJobId, refresh]);


  useEffect(()=>{
    dispatch(actionSetEmergencyJobListShow(true));
    return ()=>{
    dispatch(actionSetEmergencyJobListShow(false));
    }
  },[EmergencyJobListToShow])
  const GetGetMaster = () => {
    requestWithEndUrl(`${API_COMMON}GetMaster`, {
      FormID: 'Department',
      BranchID: 0,
      PeriodID: 0,
      OL: '',
    })
      .then((res) => {
        // console.log('GetMaster', {res});

        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        if (data.length > 0) {
          setAssignModal(true);
          // console.log('GetMaster', {data});
          setWorkCenter(data);
          // setEmgJoList(data);
        } else {
          dispatch(
            actionSetAlertPopUpTwo({
              title: AppTextData.txt_Alert,
              body: AppTextData.txt_No_WorkCenter_Details_Available,
              visible: true,
              type: 'ok',
            }),
          );
        }
      })
      .catch((err) => {
        console.log('GetMaster error', err);
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: AppTextData.txt_somthing_wrong_try_again,
            visible: true,
            type: 'ok',
          }),
        );
      });
  };
  function setSeenBy() {
    requestWithEndUrl(`${API_SUPERVISOR}SetSeenBy`, {}, 'POST').then((res) => {
      // console.log('SetSeenBy', {res});
      if (res.status == 200) {
        dispatch(actionSetRefreshing(true));
      }
    });
  }
  const WorkCenterRenderItem = ({item}) => {
    console.log('workcenter Workcenter flatlist data--->>', item);
    return (
      <Pressable
        style={{
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
        }}
        onPress={() => {
          console.log('selected item is==>>', item);
          Alert.alert(
            AppTextData.txt_Assign,
            AppTextData.txt_Are_you_sure_want_to_Update_the_Department,
            [
              {
                text: AppTextData.txt_No,
                onPress: () => {
                  console.log('No Pressed');
                },
                style: 'cancel',
              },
              {
                text: AppTextData.txt_Yes,
                onPress: () => {
                  // console.log('Yes Pressed');
                  ChangeWorkCenter(item);
                },
              },
            ],
            {cancelable: false},
          );
        }}>
        {/* <View style={{height: 50, backgroundColor: 'red', marginBottom: 2}}>
          <Text>{item.Name}</Text>
        </View> */}
        {/* <View style={{alignItems: 'center', flexDirection: 'row', flex: 1}}> */}
        <View style={{flex: 2, justifyContent: 'center', paddingLeft: '2%'}}>
          <CmmsText style={{fontSize: 11, fontWeight: 'bold', color: '#000'}}>
            {item.Name}
          </CmmsText>
          {/* </View> */}
        </View>
      </Pressable>
    );
  };
  const ChangeWorkCenter = (e) => {
    console.log('work center details from the modal button press==>>', e);
    parameter = {
      WorkID: RightSwipedWork.WorkID,
      WorkType: RightSwipedWork.WorkType,
      DepartmentID: e.ID,
      SEID: loggedUser.TechnicianID,
    };
    console.log('params for CustodianJobsUpdation api call==>>', parameter);
    requestWithEndUrl(`${API_SUPERVISOR}CustodianJobsUpdation`, parameter, 'PUT')
      .then((res) => {
        console.log('GetMaster', {res});

        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        console.log('CustodianJobsUpdation api call  res==>>', data);
        setRightSwipedWork({});
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: AppTextData.txt_Department_updated_successfully,
            visible: true,
            type: 'ok',
          }),
        );
        setAssignModal(false);
        dispatch(actionSetRefreshing());
      })
      .catch((err) => {
        console.log('GetMaster error', err);
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: AppTextData.txt_somthing_wrong_try_again,
            visible: true,
            type: 'ok',
          }),
        );
      });
  };
  return (
  
    <KeyboardAvoidingView
    keyboardVerticalOffset={90}
    style={{flex: 1}}
    behavior="height">
      {LeftSwipe && (
        <GetSpartsAndActivities
          visible={LeftSwipe}
          params={LeftSwipData}
          buttonpress={() => {
            setLeftSwipe(false);
            setLeftSwipData({});
          }}
        />
      )}
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
      <ScrollView >
      <PopUp
        visible={assignModal}
        height={Height / 1.1}
        width={'95%'}
        paddingVertical={15}
        paddingHorizontal={10}>
        <Text
          style={{
            color: 'gray',
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 5,
            paddingLeft: 15,
          }}>
          {AppTextData.txt_Select_One_Department}
        </Text>
        <FlatList
          contentContainerStyle={{paddingHorizontal: 10}}
          data={WorkCenter}
          scrollEventThrottle={1}
          useNativeDriver={true}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.ID}
          renderItem={WorkCenterRenderItem}></FlatList>
        <RefreshButton
          style={{marginTop: 5}}
          title={'✕'}
          color={'white'}
          backgroundColor={'#2F5A0C'}
          fontWeight={'600'}
          fontSize={38}
          height={50}
          width={50}
          borderRadius={25}
          onPress={() => {
            setAssignModal(false);
          }}
        />
      </PopUp>
      <FlatList
        useNativeDriver={true}
        maxToRenderPerBatch={20}
        // scrollEventThrottle={1}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
        style={{marginBottom: Height/7}}
        // style={{marginBottom: 15}}
        showsVerticalScrollIndicator={false}
        data={emgJoList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => {
          return (
            <GestureRecognizer
              onSwipeRight={(state) => {
                console.log('swiped in the right side', item);
                GetGetMaster();
                setRightSwipedWork(item);
              }}
              onSwipeLeft={() => {
                setLeftSwipe(true);
                setLeftSwipData(item);
              }}>
              <Pressable
                style={{
                  minHeight: Height / 10,
                  width: width - 30,
                  backgroundColor: CmmsColors.logoTopGreen,
                  borderRadius: 10,
                  paddingVertical: 12,
                  marginVertical: 5,
                  paddingHorizontal: 15,
                }}
                onLongPress={() => {
                  console.log('EmergencyJobOrder LongPress');
                  setSelectedJobId(item.WorkID);
                  setTime(1);
                }}
                onPress={() => {
                  console.log('EmergencyJobOrder onpress');
                  if (selectedJobId == item.WorkID) {
                    setSelectedJobId(0);
                    setSelectedTechId(0);
                  }
                }}>
                <CmmsText
                  style={{
                    fontWeight: '900',
                    fontFamily: 'sans-serif-condensed',
                    color: 'white',
                    marginEnd: 5,
                  }}>
                  <Text style={{fontWeight: 'bold', color: 'white'}}>
                    {item.Code}
                  </Text>
                  /{item.Asset}
                </CmmsText>
                <View
                  style={{flex: 1, flexDirection: 'row', paddingVertical: 5}}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      paddingLeft: '5%',
                    }}>
                    <CmmsText
                      style={{
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: 'blue',
                        fontFamily: 'sans-serif-light',
                      }}>
                      {
                        (AppTextData.txt_Schedule_Date + ' ',
                        format(
                          new Date(item.ScheduledDate),
                          'dd/MM/yyyy hh:mm:ss',
                        ))
                      }
                    </CmmsText>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                    }}>
                    <View
                      style={{
                        backgroundColor: '#9FBD32',
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        elevation: 13,
                        paddingHorizontal: 5,
                        paddingVertical: 6,
                      }}>
                      <Text
                        style={{
                          color: '#5B5B5B',
                          fontSize: 13,
                          fontFamily: 'sans-serif-condensed',
                        }}>
                        {item.ProblemType}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Text
                    style={{
                      fontWeight: '900',
                      fontFamily: 'sans-serif-condensed',
                      color: 'white',
                      fontSize: 13,
                    }}>
                    <Text style={{fontWeight: 'bold'}}>
                      {AppTextData.txt_Problem_Description}:{' '}
                    </Text>
                    {item.ProblemDescription}
                  </Text>
                </View>

                {selectedJobId == item.WorkID && (
                  <TextInput
                    style={{
                      height: 20,
                      paddingHorizontal: 4,
                      paddingVertical: 4,
                      fontSize: 10,
                      borderRadius: 4,
                      textAlign: 'center',
                      backgroundColor: 'white',
                      position: 'absolute',
                      end: 8,
                      bottom: 2,
                    }}
                    placeholder="time"
                    keyboardType="numeric"
                    // selectTextOnFocus
                    value={`${time}`}
                    onChangeText={(text) => {
                      setTime(text.replace(/[^1-9]/g, '1'));
                    }}
                  />
                )}
              </Pressable>
            </GestureRecognizer>
            // <TouchableOpacity
            //   onPress={() => {
            //     console.log('onpress');
            //   }}
            //   onLongPress={() => {
            //     console.log('onpress');
            //   }}>
            //   <Text>hfhfdhff</Text>
            // </TouchableOpacity>
          );
        }}
      />
    
</ScrollView>
      <FlatList
        style={{marginBottom: 2, bottom: 2,position:'absolute',backgroundColor:'white'}}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={eligibleTechList}
        renderItem={({item, index}) => (
          // <EmployeeList
          //   item={item}
          // index={index}
          // onPress={
          //     console.log('hehehe')
          //   }
          //   borderColor={selectedJobId !== 0 && selectedTechId === item.ServiceEngrID
          //   ? CmmsColors.green
          //   : CmmsColors.coolGray}
          // />
          <TouchableOpacity
          id={index}
            style={{
              width: 66,
              borderWidth: 1,
              height: 90,
              borderColor:
                selectedJobId != 0 && selectedTechId == item.ServiceEngrID
                  ? CmmsColors.green
                  : CmmsColors.coolGray,
              marginHorizontal: 2,
              padding: 2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              if (selectedJobId != 0) {
                setSelectedTechId(item.ServiceEngrID);
                Alert.alert(
                  AppTextData.txt_Assign,
                  AppTextData.txt_Are_you_sure_You_want_to_assign_this_job_to +
                    ' ' +
                    item.Code,
                  [
                    {
                      text: AppTextData.txt_No,
                      onPress: () => {
                        console.log('No Pressed');
                        setSelectedTechId(0);
                      },
                      style: 'cancel',
                    },
                    {
                      text: AppTextData.txt_Yes,
                      onPress: () => {
                        const parameter = {
                          WorkID: selectedJobId,
                          SEID: item.ServiceEngrID,
                          Date: dateTime,
                          Ehrs: time,
                        };
                        console.log(
                          'params for AssignEmergencyWork api cal==>>',
                          parameter,
                        );
                        dispatch(actionSetLoading(true));
                        // AssignEmergencyWork api replaced with AssignJob by Riaz on 22-06-2024
                        requestWithEndUrl(
                          `${API_SUPERVISOR}AssignJob`,
                          parameter,
                          'POST',
                        )
                          .then((res) => {
                            // console.log('AssignEmergencyWork', res);

                            if (res.status != 200) {
                              throw Error(res.statusText);
                            }
                            return res.data;
                          })
                          .then((data) => {
                            // console.log(
                            //   'AssignEmergencyWork api response==>>',
                            //   data,
                            // );
                            setEmgJoList(
                              emgJoList.filter(
                                (emgJo) => emgJo.JOID != selectedJobId,
                              ),
                            );
                            setSelectedTechId(0);
                            setSelectedJobId(0);
                            dispatch(actionSetLoading(false));
                            dispatch(actionSetRefreshing());
                            // alert(data.Message);
                            dispatch(
                              actionSetAlertPopUpTwo({
                                title: AppTextData.txt_Alert,
                                body: AppTextData.txt_Assigned,
                                visible: true,
                                type: 'ok',
                              }),
                            );
                          })
                          .catch((err) => {
                            dispatch(actionSetLoading(false));
                            setSelectedTechId(0);
                            dispatch(
                              actionSetAlertPopUpTwo({
                                title: AppTextData.txt_Alert,
                                body: AppTextData.txt_somthing_wrong_try_again,
                                visible: true,
                                type: 'ok',
                              }),
                            );
                            console.log('AssignEmergencyWork', err);
                          });
                      },
                    },
                  ],
                  {cancelable: false},
                );
              }
            }}>
            <Image
              style={{width: 48, height: 40}}
              source={{uri: `${API_IMAGEPATH}${item.ImageURl}`}}
              resizeMode={'center'}
            />
            <Text numberOfLines={1} style={{textAlign: 'center', fontSize: 10}}>
              {item.Code}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                width: '100%',
                marginTop: 2,
                paddingHorizontal: 4,
                textAlign: 'center',
                backgroundColor: 'white',
                fontSize: 8,
                color: item.SEStatus == 1 ? 'green' : CmmsColors.darkRed,
              }}>
              <Icon
                name="circle"
                size={12}
                color={item.SEStatus == 1 ? 'green' : CmmsColors.darkRed}
              />
              {` ${item.WorkTime}`}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                width: '100%',
                marginTop: 2,
                textAlign: 'center',
                fontSize: 8,
                paddingHorizontal: 4,
                backgroundColor: getDayStatBg(item.DayStatus),
              }}>
              {item.DayStatus != 1
                ? `${item.NoOfJO}/${item.TotalAssignedHrs} - ${item.CurrentJONO}`
                : ''}
            </Text>
          </TouchableOpacity>
        )}
      />
    </KeyboardAvoidingView>
    
  );

  function getDayStatBg(DayStatus) {
    switch (DayStatus) {
      case 0:
        return CmmsColors.darkRed;
      case 1:
        return CmmsColors.joGreenAlpha;
      case 2:
        return CmmsColors.joYellowAlpha;
      default:
        return 'transparent';
    }
  }
};
