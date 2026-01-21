import React, {Component, useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  ImageBackground,
  FlatList,
  StyleSheet,
  Animated,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import requestWithEndUrl from '../../../network/request';
import {API_TECHNICIAN} from '../../../network/api_constants';
import {useSelector, useDispatch} from 'react-redux';
import {Picker} from '@react-native-picker/picker';
import CmmsColors from '../../../common/CmmsColors';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  CmmsText,
  CmmsTextStyles,
  CTextTitle,
} from '../../../common/components/CmmsText';
import {actionSetJobOrderReport} from '../../../action/ActionJobOrderReport';
import {actionSetAlertPopUpTwo} from '../../../action/ActionAlertPopUp';

export default ActivityDetails = ({navigation, route: {params}}) => {
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const [activityCategoryList, setactivityCategoryList] = useState([]);
  const [activityDetails, setActivityDetails] = useState([]);
  const [count, setCount] = useState(0);
  var JobOrderReportData;
  if (params.isCheckList) {
    JobOrderReportData = {AdditionalActivityDtls: params.ActivityList || []};
  } else {
    JobOrderReportData = useSelector((state) => {
      // console.log({JobOrderReportReducer_state: state.JobOrderReportReducer});
      return state.JobOrderReportReducer.JobOrderReportData;
    });
  }
  const dispatch = useDispatch();
  // const [selectedActivityDetails, setSelectedActivityDetails] = useState([]);
  const [DefaultActivityCat, setDefaultActivityCat] = useState(0);
  const [DefaultActivityDetails, setDefaultActivityDetails] = useState(0);
  const [additionalActivityDtls, setAdditionalActivityDtls] = useState(
    JobOrderReportData.AdditionalActivityDtls || [],
  );
  const [newNote, setNewNote] = useState(
    JobOrderReportData.AdditionalActivityNote,
  );

  // const [TempVar, setTempVar] = useState(0);

  useEffect(() => {
    console.log('params', params);
    requestWithEndUrl(`${API_TECHNICIAN}GetActivityCategory`, {
      SEID: params.SeId,
    })
      .then((res) => {
        console.log(res);
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        console.log('All ActivityCategory`', data);
        //setTempVar(0)
        setactivityCategoryList(data);
      })
      .catch(function (error) {
        console.log('Activity Details Erro: ', error);
      });
  }, []);

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      {/* <ImageBackground
				style={{
					flex: 1,
					position: 'absolute',
					width: '100%',
					height: '100%'
				}}
				source={require('../../../assets/bg/bg_cmms.webp')}
			/> */}
      <View style={{flex: 1, padding: 8}}>
        {/* <Text style={styles.MainHead}>{AppTextData.txt_Additional_Activity_Details}</Text> */}

        <Picker
          style={[CmmsTextStyles.textTitle, {color: 'black'}]}
          dropdownIconColor={CmmsColors.logoBottomGreen}
          mode={'dropdown'}
          selectedValue={DefaultActivityCat}
          onValueChange={(item, index) => {
            console.log('activityCategoryList_change', item);
            setDefaultActivityCat(item);
            fetchActivityDetails(item);
          }}>
          {activityCategoryList.map((item, index) => {
            return (
              <Picker.Item
                key={index}
                label={`${item.Name}`}
                value={`${item.ID}`}
              />
            );
          })}
        </Picker>

        <Picker
          style={[
            CmmsTextStyles.textTitle,
            {color: '', fontFamily: 'sans-serif-condensed', fontSize: 16},
          ]}
          // selectedValue={DefaultActivityDetails}
          dropdownIconColor={CmmsColors.logoBottomGreen}
          mode={'dropdown'}
          onValueChange={(item, index) => {
            if (
              index != 0 &&
              additionalActivityDtls.filter(
                (addAct) => addAct.ActivityID == item.ActivityID,
              ).length == 0
            ) {
              setAdditionalActivityDtls((additionalActivityDtls) => [
                ...additionalActivityDtls,
                {...item, Status: 0},
              ]);
            }
          }}>
          {[
            {
              //vbn lang
              Activity:
                activityDetails.length > 0
                  ? AppTextData.txt_Select_to_add_activity //'Select to add activity'
                  : AppTextData.txt_Activity_not_found, //'Activity not found',
              ActivityID: -1,
            },
            ...activityDetails,
          ].map((item, index) => {
            return (
              <Picker.Item
                color={index == 0 ? CmmsColors.logoBottomGreen : ''}
                key={index}
                label={`${item.Activity}`}
                value={item}
              />
            );
          })}
        </Picker>

        <CTextTitle
          style={{
            backgroundColor: CmmsColors.logoTopGreen,
            paddingVertical: 8,
            paddingHorizontal: 7,
            marginTop: 10,
          }}>
          {AppTextData.txt_Additional_Activities}
        </CTextTitle>
        <FlatList
          style={{marginTop: 10, marginHorizontal: 4}}
          showsVerticalScrollIndicator={false}
          extraData={count}
          data={additionalActivityDtls}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => {
            console.log({item});
            return (
              <GestureRecognizer
                // style={{}}
                onSwipeLeft={(state) => {
                  let tempAdditionalActDtls = [...additionalActivityDtls];
                  tempAdditionalActDtls[index] = {
                    ...item,
                    Status: item.Status == 2 ? 0 : 2,
                  };
                  setAdditionalActivityDtls(tempAdditionalActDtls);
                  // dispatch(actionSetJobOrderReport({...JobOrderReportData}))
                }}
                onSwipeRight={(state) => {
                  let tempAdditionalActDtls = [...additionalActivityDtls];
                  tempAdditionalActDtls[index] = {
                    ...item,
                    Status: item.Status == 1 ? 2 : 1,
                  };
                  setAdditionalActivityDtls(tempAdditionalActDtls);
                }}
                config={config}
                style={{
                  flex: 1,
                }}>
                <View
                  style={
                    {
                      marginBottom: 8,
                      paddingHorizontal: 4,
                      flexDirection: 'row',
                    }
                    // item.Status == 0
                    //   ? styles.ActivityPending
                    //   : item.Status == 2
                    //   ? styles.ActivityWIP
                    //   : styles.ActivityClosed,
                  }>
                  <TouchableOpacity
                    onPress={() => {
                      if (additionalActivityDtls[index].Status == 0) {
                        additionalActivityDtls[index].Status = 2;
                        setCount(count + 1);
                      } else if (additionalActivityDtls[index].Status == 2) {
                        additionalActivityDtls[index].Status = 1;
                        setCount(count + 1);
                      } else if (additionalActivityDtls[index].Status == 1) {
                        additionalActivityDtls[index].Status = 0;
                        setCount(count + 1);
                      }
                    }}
                    style={{
                      flexDirection: 'row',
                      flex: 5,
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        height: 30,
                        width: 30,
                        borderRadius: 20,
                        backgroundColor:
                          item.Status == 1
                            ? CmmsColors.joDone
                            : item.Status == 2
                            ? CmmsColors.joWip
                            : CmmsColors.joPending,
                      }}></View>
                    <CmmsText
                      numberOfLines={2}
                      style={{
                        // flex: 1,
                        color: 'black',
                        marginLeft: 10,
                      }}>
                      {index + 1}. {item.Activity}
                    </CmmsText>
                  </TouchableOpacity>
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
                      style={{justifyContent: 'center', paddingHorizontal: 8}}
                      onPress={() => {
                        // console.log({selectedActivityDetails})
                        // setSelectedActivityDetails(selectedActivityDetails=>selectedActivityDetails.filter(sele=>sele.ActivityID!=item.ActivityID))
                        let tempAdditionalActDtls = [...additionalActivityDtls];
                        tempAdditionalActDtls.splice(index, 1);
                        setAdditionalActivityDtls(tempAdditionalActDtls);

                        // console.log({SelectedSpareParts})
                        // setSelectedSpareParts(SelectedSpareParts=>SelectedSpareParts.filter(filterItem=>(filterItem.SparePartsID!=item.SparePartsID)))
                      }}>
                      <Icon name="trash" size={24} color="green" />
                    </TouchableOpacity>
                  </View>

                  {/* <CmmsText
                    numberOfLines={2}
                    style={{
                      flex: 1,
                      color: 'white',
                    }}>
                    {index + 1}. {item.Activity}
                  </CmmsText> */}
                </View>
              </GestureRecognizer>
            );
          }}
        />
        {!params.isCheckList && (
          <TextInput
            // ref={noteArea.current}
            selectTextOnFocus
            style={{
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              alignContent: 'flex-start',
              textAlignVertical: 'top',
              borderWidth: 0.5,
              minHeight: 100,
              maxHeight: '25%',
              width: '100%',
              paddingLeft: 15,
              borderRadius: 10,
              elevation: 1,
              marginBottom: '5%',
              borderColor: 'grey',
              backgroundColor: '#fff',
            }}
            multiline={true}
            // numberOfLines={4}
            placeholder={AppTextData.txt_Please_enter_your_notes}
            onChangeText={(text) => setNewNote(text)}
            value={newNote}
          />
        )}
        <TouchableOpacity
          style={{
            backgroundColor: CmmsColors.logoBottomGreen,
            borderRadius: 8,
            marginTop: 8,
            padding: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            if (additionalActivityDtls.length > 0) {
              if (params.isCheckList)
                params.updateActList(additionalActivityDtls);
              else {
                dispatch(
                  actionSetJobOrderReport({
                    ...JobOrderReportData,
                    AdditionalActivityNote: newNote,
                    AdditionalActivityDtls: additionalActivityDtls,
                  }),
                );
              }
              navigation.goBack();
            } else {
              // dispatch(
              //   actionSetAlertPopUpTwo({
              //     title: AppTextData.txt_Alert,
              //     body: AppTextData.txt_Invalid_Data,
              //     visible: true,
              //     type: 'ok',
              //   }),
              // );
              dispatch(
                actionSetJobOrderReport({
                  ...JobOrderReportData,
                  AdditionalActivityNote: newNote,
                  AdditionalActivityDtls: additionalActivityDtls,
                }),
              );
              navigation.goBack();
            }
            // console.log("add")
            // console.log('All list:', selectedActivityDetails)
            // console.log('Status Changes:', selectedActivityDetails.filter(obj => obj.Status != 0))
            // navigation.navigate("JobOrderReport", { "selectedActivityDetails": selectedActivityDetails.filter(obj => obj.Status != 0), IsSuperVisor: 0 })
          }}>
          <CmmsText style={{color: 'white', fontWeight: '900'}}>
            {AppTextData.txt_OK}
          </CmmsText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  function fetchActivityDetails(id) {
    console.log(
      'params for getAdditionalActivity api call==>>',
      'SEID:',
      params.SeId,
      'JOID: ',
      params.JoId,
      'ACATID:',
      id,
    );
    requestWithEndUrl(`${API_TECHNICIAN}GetAdditionalActivity`, {
      SEID: params.SeId,
      JOID: params.JoId,
      ACATID: id,
    })
      .then((res) => {
        setActivityDetails([]);
        console.log('URL_GetAdditionalActivity', res);
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        setActivityDetails(data);
        //setTempVar(0)
        // console.log('Activity details:', data)
        // if (data.length == 1) {
        // 	const Ids = selectedActivityDetails.map((item) => item.ActivityID);
        // 	if (!Ids.includes(Number(data[0].ActivityID))) {
        // 		setSelectedActivityDetails((selectedActivityDetails) => [
        // 			...selectedActivityDetails,
        // 			{ ...data[0] }
        // 		]);
        // 	}
        // 	else {
        // 		alert(AppTextData.txt_item_alrd_exist);
        // 	}
        // 	//setTempVar(1)
        // }
      })
      .catch((err) => {
        console.error({err});
      });
  }
};

const styles = StyleSheet.create({
  titleText: {
    fontSize: 8,
    fontWeight: 'normal',
    textAlign: 'center',
    color: '#ffffff',
  },
  pickerStyle: {
    height: 150,
    width: '80%',
    color: '#344953',
    justifyContent: 'center',
  },
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
  },
  MainHead: {
    fontSize: 25,
    fontStyle: 'normal',
    paddingVertical: 6,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'black',
  },
  SubHead: {
    fontSize: 15,
    textAlign: 'left',
    paddingVertical: 2,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  SubHeadMain: {
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 2,
    fontWeight: 'bold',
  },
  SubHeadBottom: {
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 2,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  SubheadDet: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'left',
    paddingLeft: 10,
    fontWeight: 'bold',
  },
  SubHeadDetTitle: {
    padding: 2,
    height: 30,
    paddingHorizontal: 20,
    backgroundColor: '#800000',
    textAlign: 'center',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  ActivityPending: {
    backgroundColor: CmmsColors.joPending,
    flexDirection: 'row',
    // borderRadius: 20,
    paddingVertical: 8,
  },
  ActivityClosed: {
    backgroundColor: CmmsColors.joDone,
    flexDirection: 'row',
    // borderRadius: 20,
    paddingVertical: 8,
  },
  ActivityWIP: {
    backgroundColor: CmmsColors.joWip,
    flexDirection: 'row',
    // borderRadius: 20,
    paddingVertical: 8,
  },
});
