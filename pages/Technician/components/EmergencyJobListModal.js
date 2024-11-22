import {
  View,
  Text,
  Modal,
  SafeAreaView,
  Pressable,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {API_SUPERVISOR, API_IMAGEPATH} from '../../../network/api_constants';
// import {useSelector} from 'react-redux';
import requestWithEndUrl from '../../../network/request';
import {parse, format} from 'date-fns';
import CmmsColors from '../../../common/CmmsColors';
import {CmmsText} from '../../../common/components/CmmsText';
import RefreshButton from '../../supervisor/Components/RefreshButton';
import GestureRecognizer from 'react-native-swipe-gestures';
import GetSpartsAndActivities from '../../supervisor/job_oder/job_assignment/component/GetSpartsAndActivities';
import Alerts from '../../components/Alert/Alerts';
import {useSelector, useDispatch} from 'react-redux';
import {actionSetAlertPopUpTwo} from '../../../action/ActionAlertPopUp';
const EmergencyJobListModal = ({visible, cancel, OutputData}) => {
  const {loggedUser} = useSelector((state) => state.LoginReducer);
  const {jobDate, IsStandbyPermission} = useSelector(
    (state) => state.VersionReducer,
  );
  const {AlertPopUp, AlertPopUpTwo} = useSelector((state) => {
    return state.AlertPopUpReducer;
  });
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const {TechList} = useSelector((state) => state.TechnicianReducer);
  const [EmergencyJoblistData, setEmergencyJoblistData] = useState([]);
  const width = Dimensions.get('window').width;
  const dispatch = useDispatch();
  const [time, setTime] = useState(1);
  const [LeftSwipe, setLeftSwipe] = useState(false);
  const [LeftSwipData, setLeftSwipData] = useState({});
  useEffect(() => {
    if (visible == true) {
      console.log('emergency joblist useEffect');
      EmergencyJoblist();
    }
  }, [visible]);

  const EmergencyJoblist = () => {
    const selectedTimemillies = parse(
      jobDate,
      'dd/MM/yyyy',
      new Date(),
    ).getTime();
    const params = {
      SEID: loggedUser?.TechnicianID,
      Date: selectedTimemillies,
    };
    console.log(
      'params for GetCheckListAbnormalityJobsCount api call==>>',
      params,
    );
    requestWithEndUrl(`${API_SUPERVISOR}EmergencyJobList`, params)
      .then((res) => {
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        console.log('EmergencyJobList=>>>', data);
        setEmergencyJoblistData(data);
      })
      .catch((err) => {
        dispatch(
          actionSetAlertPopUpTwo({
            title: AppTextData.txt_Alert,
            body: AppTextData.txt_Updation_Failed,
            visible: true,
            type: 'ok',
          }),
        );
      });
  };

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
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
      <View
        onTouchCancel={() => {}}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          backgroundColor: 'rgba(52, 52, 52, 0.8)',
        }}>
        <View
          style={{
            height: '90%',
            backgroundColor: '#EEF0EC',
            width: '98%',
            borderRadius: 8,
            padding: 10,
            borderWidth: 2,
            borderColor: '#E0E0E0',
          }}>
          <View
            style={{
              borderBottomColor: 'gray',
              borderBottomWidth: 0.3,
              marginBottom: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingBottom: 3,
            }}>
            <Text
              style={{
                color: '#8F918D',
                fontSize: 20,
                alignSelf: 'flex-start',
                fontWeight: 'bold',
                padding: 10,
              }}>
              {AppTextData.txt_BreakDown_List}
            </Text>
          </View>
          <FlatList
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
            data={EmergencyJoblistData}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => (
              <GestureRecognizer
                onSwipeLeft={() => {
                  setLeftSwipe(true);
                  setLeftSwipData(item);
                }}>
                <TouchableOpacity
                  onPress={() => {
                    OutputData(item);
                  }}
                  style={{
                    minHeight: Dimensions.get('screen').height / 10,
                    width: width - 50,
                    backgroundColor: CmmsColors.logoTopGreen,
                    borderRadius: 10,
                    paddingVertical: 12,
                    marginVertical: 5,
                    paddingHorizontal: 15,
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
                  {/* </View> */}
                </TouchableOpacity>
              </GestureRecognizer>
            )}></FlatList>

          <View
            style={{
              paddingVertical: 12,
            }}>
            <RefreshButton
              title={'✕'}
              color={'white'}
              backgroundColor={'#2F5A0C'}
              fontWeight={'600'}
              fontSize={38}
              height={50}
              width={50}
              borderRadius={25}
              onPress={() => {
                cancel();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EmergencyJobListModal;
