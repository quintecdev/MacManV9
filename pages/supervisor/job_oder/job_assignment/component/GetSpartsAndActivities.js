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
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {API_SUPERVISOR} from '../../../../../network/api_constants';
import {API_IMAGEPATH} from '../../../../../network/api_constants';
import {useSelector} from 'react-redux';
import {isFormData} from 'react-native-axios/lib/utils';
import requestWithEndUrl from '../../../../../network/request';
import {parse, format} from 'date-fns';
import TimeField from '../../components/TimeField';
import Alerts from '../../../../components/Alert/Alerts';
import PopUp from '../../../../components/PopUp/PopUp';
import {CmmsText} from '../../../../../common/components/CmmsText';
import RefreshButton from '../../../Components/RefreshButton';

const GetSpartsAndActivities = ({
  visible,
  cancel,
  OutputData,
  buttonpress,
  params,
}) => {
  const {loggedUser} = useSelector((state) => state.LoginReducer);
  const {jobDate, IsStandbyPermission} = useSelector(
    (state) => state.VersionReducer,
  );
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const [IndvdlJoDetails, setIndvdlJoDetails] = useState({});
  const [Images, setImages] = useState({});
  const width = Dimensions.get('window').width;
  const Height = Dimensions.get('window').height;
  const [time, setTime] = useState(1);
  const Phtotos = [
    {
      photo:
        'https://www.google.com/url?sa=i&url=https%3A%2F%2Fmarketing.istockphoto.com%2Fblog%2Fvector-graphics%2F&psig=AOvVaw32mluRmLMSdwrt95T0kVqz&ust=1678278037306000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPC-uYTnyf0CFQAAAAAdAAAAABAE',
    },
    {
      photo:
        'https://www.google.com/url?sa=i&url=https%3A%2F%2Fmarketing.istockphoto.com%2Fblog%2Fvector-graphics%2F&psig=AOvVaw32mluRmLMSdwrt95T0kVqz&ust=1678278037306000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPC-uYTnyf0CFQAAAAAdAAAAABAE',
    },
    {
      photo:
        'https://www.google.com/url?sa=i&url=https%3A%2F%2Fmarketing.istockphoto.com%2Fblog%2Fvector-graphics%2F&psig=AOvVaw32mluRmLMSdwrt95T0kVqz&ust=1678278037306000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPC-uYTnyf0CFQAAAAAdAAAAABAE',
    },
  ];
  useEffect(() => {
    console.log('params from the compnent=>>', params);
    if (visible == true) {
      console.log('inside the useeffect===>>>');
      console.log('emergency joblist useEffect');
      GetSParepartsAndActivitiesFunction();
      // GetImages();
    }
  }, []);

  // const GetImages = () => {
  //   requestWithEndUrl(`${API_SUPERVISOR}GetAllTechnicians`, {
  //     Date: 1678127400000,
  //     SEID: 126,
  //   })
  //     .then((res) => {
  //       console.log('GetAllTechnicians', {res});
  //       if (res.status != 200) {
  //         throw Error(res.statusText);
  //       }
  //       return res.data;
  //     })
  //     .then((data) => {
  //       console.log('GetAllTechnicians==>>>', data);
  //       setImages(data.SEList);
  //     })
  //     .catch((err) => {
  //       console.error('GetAllTechnicians error', err);
  //     });
  // };
  const GetSParepartsAndActivitiesFunction = () => {
    params = [
      {
        WorkID: params.WorkID,
        WorkType: params.WorkType,
        JOID: params.JOID,
      },
    ];
    console.log(
      'params for GetCheckListAbnormalityJobsCount api call==>>',
      params,
    );
    requestWithEndUrl(
      `${API_SUPERVISOR}GetSParepartsAndActivities`,
      params,
      'POST',
    )
      .then((res) => {
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        console.log('EmergencyJobList=>>>', data);
        setIndvdlJoDetails(data);
      })
      .catch((err) => {
        setIndvdlJoDetails({});
      });
  };
  const PhotoRendering = (item) => {
    console.log('image list from the flatlist==>', item);
    return (
      <View style={{backgroundColor: 'red'}}>
        <Image
          style={{height: 50, width: 50}}
          resizeMode="stretch"
          source={{uri: `${API_IMAGEPATH}${item.ImageURl}`}}></Image>
      </View>
    );
  };
  return (
    <PopUp
      visible={visible}
      height={Height / 1.1}
      width={'96%'}
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
        {AppTextData.txt_Activities}
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <View>
            {/* <CmmsText
              style={{
                marginVertical: 8,
                fontWeight: 'bold',
                fontSize: 16,
                alignSelf: 'center',
              }}>
              {AppTextData.txt_Activities}
            </CmmsText> */}

            <FlatList
              nestedScrollEnabled
              data={IndvdlJoDetails['ESC']} //{selectedJoDetails['Activities']}
              renderItem={({item}) => (
                <View
                  style={{
                    padding: 8,
                    marginVertical: 8,
                    borderWidth: 0.3,
                    borderColor: '#778899',
                    borderRadius: 10,
                  }}>
                  <Text style={{fontWeight: 'bold', textAlign: 'center'}}>
                    {item.Asset}/
                    <Text style={{fontWeight: 'bold', color: 'green'}}>
                      {item.Code}
                    </Text>
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
                    <Text style={{fontWeight: 'bold', color: 'black'}}>
                      {item.ESC}
                      {' : '}
                    </Text>
                    <View style={{marginHorizontal: 8}}></View>
                    <CmmsText
                      style={{
                        fontWeight: 'bold',
                        color: '#777',
                      }}>{`${Math.floor(
                      item.Activities.map((activity) => activity.Ehrs).reduce(
                        (acc, val) => acc + val,
                        0,
                      ) / 60,
                    )}:${
                      item.Activities.map((activity) => activity.Ehrs).reduce(
                        (acc, val) => acc + val,
                        0,
                      ) % 60
                    } `}</CmmsText>
                  </View>
                  {item.Activities?.map((act) => (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 5,
                      }}>
                      <CmmsText
                        style={{flex: 1, fontWeight: 'bold', color: 'black'}}>
                        {act.Activity} :
                      </CmmsText>
                      <TimeField
                        Ehrs={act.Ehrs}
                        onChangeTime={(newEhrs) => {
                          console.log('onChangeTime', {newEhrs, act});
                          //       act.Ehrs = newEhrs
                          //     console.log("selectedjo",item.Activities)
                          // setselectedJoDetails({...selectedJoDetails})
                        }}
                      />
                    </View>
                  ))}
                  {item.WorkType == 3 ? (
                    <View
                      style={{
                        backgroundColor: '#000',
                        flexDirection: 'row',
                        width: '100%',
                      }}>
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: '#fff',
                          alignItems: 'flex-start',
                          borderRightWidth: 0.4,
                          borderRightColor: 'black',
                        }}>
                        <CmmsText
                          style={{
                            color: 'black',
                            marginTop: '10%',
                            fontWeight: 'bold',
                          }}>
                          {AppTextData.txt_JOR_No} :
                        </CmmsText>
                        <CmmsText
                          style={{
                            color: 'black',
                            marginTop: '10%',
                            fontWeight: 'bold',
                          }}>
                          {AppTextData.txt_Requested_By} :
                        </CmmsText>
                        <CmmsText
                          style={{
                            color: 'black',
                            marginTop: '10%',
                            fontWeight: 'bold',
                          }}>
                          {AppTextData.txt_Problem_Type} :
                        </CmmsText>
                        <CmmsText
                          style={{
                            color: 'black',
                            marginTop: '10%',
                            fontWeight: 'bold',
                          }}>
                          {AppTextData.txt_Description} :
                        </CmmsText>
                        <CmmsText
                          style={{
                            color: 'black',
                            marginTop: '10%',
                            fontWeight: 'bold',
                          }}>
                          {AppTextData.txt_Date} :
                        </CmmsText>
                        <View
                          style={{
                            height: 20,
                            width: 100,
                            backgroundColor: '#fff',
                          }}></View>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: '#fff',
                          alignItems: 'flex-end',
                          paddingRight: '3%',
                        }}>
                        <CmmsText
                          style={{
                            color: '#777',
                            marginTop: '10%',
                            fontWeight: 'bold',
                          }}>
                          {item.JORNo}
                        </CmmsText>
                        <CmmsText
                          style={{
                            color: '#777',
                            marginTop: '10%',
                            fontWeight: 'bold',
                          }}>
                          {item.RequestedBy}
                        </CmmsText>
                        <CmmsText
                          style={{
                            color: '#777',
                            marginTop: '10%',
                            fontWeight: 'bold',
                          }}>
                          {item.ProblemType}
                        </CmmsText>
                        <CmmsText
                          style={{
                            color: '#777',
                            marginTop: '10%',
                            fontWeight: 'bold',
                          }}>
                          {item.Description}
                        </CmmsText>
                        <CmmsText
                          style={{
                            color: '#777',
                            marginTop: '10%',
                            fontWeight: 'bold',
                          }}>
                          {item.Date}
                        </CmmsText>
                      </View>
                    </View>
                  ) : null}
                </View>
              )}
            />
          </View>
          {IndvdlJoDetails['Spareparts']?.length > 0 && (
            <View style={{marginBottom: 5}}>
              <Text
                style={{
                  marginVertical: 8,
                  fontWeight: 'bold',
                  fontSize: 16,
                  alignSelf: 'flex-start',
                  paddingLeft: 15,
                }}>
                {AppTextData.txt_Spare_Parts}
              </Text>
              {IndvdlJoDetails['Spareparts']?.length > 0 && (
                <View
                  style={{
                    borderWidth: 0.2,
                    borderColor: '#778899',
                    height: 30,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}>
                  <CmmsText
                    style={{
                      marginHorizontal: 4,
                      width: 70,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'black',
                    }}>
                    RQty
                  </CmmsText>
                  <CmmsText
                    style={{
                      marginHorizontal: 4,
                      width: 70,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'black',
                    }}>
                    AQty
                  </CmmsText>
                  <CmmsText
                    style={{
                      marginHorizontal: 4,
                      width: 70,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'black',
                    }}>
                    ES
                  </CmmsText>
                </View>
              )}
              <FlatList
                nestedScrollEnabled
                style={{
                  borderTopWidth: 0,
                  maxHeight: Height / 2,
                  minHeight: 50,
                  borderWidth: 0.2,
                  borderColor: '#778899',
                }}
                data={IndvdlJoDetails['Spareparts']}
                renderItem={({item, index}) => (
                  <View
                    style={{
                      // borderBottomWidth: 0.3,
                      paddingVertical: 4,
                      // backgroundColor: `${
                      //   item.RQTY > item.AQTY ? 'red' : 'white'
                      // }`,
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
                          color: 'green',
                          fontWeight: 'bold',
                        }}>
                        {index + 1}
                      </Text>
                      <CmmsText
                        style={{
                          marginHorizontal: 4,
                          flex: 2,
                          textAlign: 'center',
                          fontSize: 12,
                        }}>
                        {item.Code}
                      </CmmsText>
                      <CmmsText
                        style={{flex: 3, textAlign: 'center', fontSize: 12}}>
                        {item.SpareParts}
                      </CmmsText>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        marginTop: 5,
                      }}>
                      <CmmsText
                        style={{
                          marginHorizontal: 4,
                          width: 70,
                          textAlign: 'center',
                          fontWeight: 'bold',
                        }}>
                        {item.RQTY}
                      </CmmsText>
                      <CmmsText
                        style={{
                          marginHorizontal: 4,
                          width: 70,
                          textAlign: 'center',
                          fontWeight: 'bold',
                        }}>
                        {item.AQTY}
                      </CmmsText>
                      <CmmsText
                        style={{
                          marginHorizontal: 4,
                          width: 70,
                          textAlign: 'center',
                          fontWeight: 'bold',
                        }}>
                        {item.ES}
                      </CmmsText>
                    </View>
                  </View>
                )}
              />
            </View>
          )}
          <View>
            <FlatList
              data={IndvdlJoDetails['Attachments']}
              scrollEventThrottle={1}
              // useNativeDriver={true}
              horizontal
              showsHorizontalScrollIndicator={false}
              //   keyExtractor={(item) => item.index}
              renderItem={({item}) => (
                <View style={{backgroundColor: 'white', padding: 5}}>
                  <Image
                    style={{height: 400, width: 400}}
                    resizeMode="stretch"
                    // source={{uri: `${API_IMAGEPATH}${item.Url}`}}
                    source={{uri: item.Url}}></Image>
                </View>
              )}></FlatList>
          </View>
        </View>
      </ScrollView>
      <RefreshButton
        style={{marginVertical: 5}}
        title={'OK'}
        color={'white'}
        backgroundColor={'#2F5A0C'}
        fontWeight={'bold'}
        fontSize={15}
        width={75}
        onPress={buttonpress}
      />
    </PopUp>
  );
};

export default GetSpartsAndActivities;
