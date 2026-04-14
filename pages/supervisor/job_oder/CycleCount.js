import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from 'react-native';
import {parse, format} from 'date-fns';
// DatePicker import removed (unused)
import CmmsColors from '../../../common/CmmsColors';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import requestWithEndUrl from '../../../network/request';
import {API_SUPERVISOR, API_TECHNICIAN} from '../../../network/api_constants';
import {useSelector, useDispatch} from 'react-redux';
import {
  actionSetLoading,
  actionSetRefreshing,
} from '../../../action/ActionSettings';
import ButtonQtyModifyWithLabel from '../../Technician/components/ButtonQtyModifyWithLabel';
import {CmmsText, CTextTitle} from '../../../common/components/CmmsText';
import RefreshButton from '../Components/RefreshButton';
import Alerts from '../../components/Alert/Alerts';
import {actionSetAlertPopUpTwo} from '../../../action/ActionAlertPopUp';
import { Colors } from 'react-native/Libraries/NewAppScreen';
export default CycleCount = ({navigation, route: {params}}) => {
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);

  const {
    loggedUser: {TechnicianID, TechnicianName},
  } = useSelector((state) => state.LoginReducer);
  const {AlertPopUp, AlertPopUpTwo} = useSelector((state) => {
    return state.AlertPopUpReducer;
  });
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'dd/MM/yyyy'),
  );
  const [ScheduleStatus, setScheduleStatus] = useState(0);
  const [SparepartsCycleCount, setSparepartsCycleCount] = useState();
  const [NoOfDays, setNoOfDays] = useState(0);
  const [NoNotification, setNoNotification] = useState(false);
  const [UpdatedQty, setUpdatedQty] = useState([]);
  console.log('updated Quantity==>>', UpdatedQty);
  console.log(
    'setSparepartsCycleCount==>',
    SparepartsCycleCount?.SparePartsCycleList,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    fetchSparePartsList();
    setUpdatedQty([]);
  }, []);
  const onChangeText = (qty, SparePartsID) => {
    console.log('qty input==>>', qty);
    console.log('SparePartsID==>>', SparePartsID);
    const data = {
      Qty: qty,
      SparePartsID: SparePartsID,
    };
    const QtyArray = [...UpdatedQty];
    // console.error(
    //   'checking the includes',
    //   UpdatedQty?.find((e) => e == SparePartsID),
    // );

    console.log('inside the initial filteration');
    const initialFilter = UpdatedQty.filter(
      (e) => e.SparePartsID != SparePartsID,
    );
    setUpdatedQty(initialFilter);
    console.log('after initial filter==>>', initialFilter);
    if (qty != '') {
      setUpdatedQty((prev) => [
        ...prev,
        {Qty: qty, SparePartsID: SparePartsID},
      ]);
    }
    // QtyArray.push(data);
    // // QtyArray.length == 0;
    // // if (initialFilter.length > 0) {
    // //   console.log('after initial filter==>>', initialFilter);
    // //   QtyArray.push(initialFilter);
    // // } else {
    // //   QtyArray.length == 0;
    // // }
    // // setUpdatedQty((prev) => [...prev, {Qty: qty, SparePartsID: SparePartsID}]);
    // if (qty == '') {
    //   const filteredData = QtyArray.filter(
    //     (e) => e.SparePartsID != SparePartsID,
    //   );
    //   console.log('data after filteration==>>', filteredData);
    //   setUpdatedQty(filteredData);
    // } else {
    //   setUpdatedQty(QtyArray);
    // }
  };
  return (
    <SafeAreaView style={{flex: 1}}>
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
      <View style={{flex: 1, padding: 8, paddingBottom: 15}}>
        {NoNotification == false ? (
          <>
            <View style={{flex: 1}}>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 10,
                  paddingHorizontal: 8,
                  marginBottom: 7,
                }}>
                <View style={{flex: 1}}>
                  <CmmsText style={styles.SubHead}>
                    {AppTextData.txt_Number}
                  </CmmsText>
                </View>
                <View style={{flex: 2}}>
                  <CmmsText style={styles.SubHeadLeft}>
                    {AppTextData.txt_Part_No}
                  </CmmsText>
                </View>
                <View style={{flex: 10}}>
                  <CmmsText style={styles.SubHeadLeft}>
                    {AppTextData.txt_SpareParts}
                  </CmmsText>
                </View>
                <View style={{flex: 2}}>
                  <CmmsText style={styles.QtySubHeadLeft}>
                    {AppTextData.txt_Qty}
                  </CmmsText>
                </View>
                {/* <View style={{flex: 2}}>
                <CmmsText style={styles.SubHeadRight}>IQty</CmmsText>
              </View> */}
                {/* <View style={{flex: 2}}>
                <CmmsText style={styles.SubHeadRight}>E/S</CmmsText>
              </View>
              <View style={{flex: 2}}>
                <CmmsText style={styles.SubHeadRight}>RQty</CmmsText>
              </View>
              <View style={{flex: 2}}>
                <CmmsText style={styles.SubHeadRight}>SOH</CmmsText>
              </View> */}
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <FlatList
                  showsVerticalScrollIndicator={false}
                  keyExtractor={(item, index) => index.toString()}
                  data={SparepartsCycleCount?.SparePartsCycleList}
                  contentContainerStyle={{flex: 2, padding: 8}}
                  renderItem={({item, index}) => (
                    <View
                      style={{
                        flexDirection: 'row',
                        marginVertical: 3,
                        backgroundColor: CmmsColors.lightGreen,
                      }}>
                      <View style={{flex: 1}}>
                        <CmmsText style={styles.SubHead}>{item.Sno}</CmmsText>
                      </View>
                      <View style={{flex: 2}}>
                        <CmmsText style={styles.ListTextAlignLeft}>
                          {item.PartNo}
                        </CmmsText>
                      </View>
                      <View style={{flex: 10}}>
                        <CmmsText style={styles.ListTextAlignLeft}>
                          {item.SpareParts}
                        </CmmsText>
                      </View>
                      <View style={{flex: 2}}>
                        <TextInput
                          style={{
                            fontSize: 12,
                            textAlign: 'center',
                            color: 'black',
                            fontWeight: 'bold',
                            backgroundColor: CmmsColors.darkGreen,
                          }}
                          //value={item.Qty.toString()}
                          keyboardType="numeric"
                          // keyboardType="default"
                          cursorColor={CmmsColors.white}
                          // defaultValue={item.Qty}
                          placeholder={item.Qty.toString()}
                          placeholderTextColor={CmmsColors.white}
                          onChangeText={(qty) => {
                            if (qty == '') {
                              onChangeText(qty, item.SparePartsID);
                            } else if (IsDigit(qty)) {
                              onChangeText(qty, item.SparePartsID);
                            } else {
                              // alert('please insert valid Quantity');
                              dispatch(
                                actionSetAlertPopUpTwo({
                                  title: AppTextData.txt_Alert,
                                  body: AppTextData.txt_please_insert_valid_Quantity,
                                  visible: true,
                                  type: 'ok',
                                }),
                              );
                            }
                          }}></TextInput>
                        {/* <CmmsText style={styles.ListTextAlignLeft}> */}

                        {/* </CmmsText> */}
                      </View>
                      {/* <View style={{flex: 2}}>
                    <CmmsText style={styles.ListTextAlignRight}>
                      {item.IssuedQTY}
                    </CmmsText>
                  </View> */}
                      {/* <View style={{flex: 2}}>
                    <CmmsText style={styles.ListTextAlignRight}>
                      {item.ESQTY}
                    </CmmsText>
                  </View>
                  <View style={{flex: 2}}>
                    <CmmsText style={styles.ListTextAlignRight}>
                      {item.ReqQTY}
                    </CmmsText>
                  </View>
                  <View style={{flex: 2}}>
                    <CmmsText style={styles.ListTextAlignRight}>
                      {item.StockInHand}
                    </CmmsText>
                  </View> */}
                    </View>
                  )}
                />
              </ScrollView>
            </View>
            {UpdatedQty?.length > 0 ? (
              <View style={{paddingVertical: 15}}>
                <RefreshButton
                  title={AppTextData.txt_UPDATE}
                  color={CmmsColors.white}
                  backgroundColor={CmmsColors.gray}
                  fontWeight={'bold'}
                  fontSize={15}
                  // width={75}
                  onPress={() => {
                    UpdateSparePartsCyleCount();
                  }}
                />
              </View>
            ) : null}
          </>
        ) : (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
            }}>
            <Text style={{fontSize: 19}}>
              {/* No Cycle count details are available */}
              {AppTextData.txt_No_Cycle_count_details_are_available}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
/**
 * Api call "GetSparepartsCycleCountList":-
 * To get the spareparts cycle count list. Data set to the state "setSparepartsCycleCount"
 */
  function fetchSparePartsList() {
    console.log('TechnicianID:', TechnicianID);
    const selectedTimemillies = parse(
      selectedDate,
      'dd/MM/yyyy',
      new Date(),
    ).getTime();
    const params = {
      // Date: selectedTimemillies,
      // TypeOf: ScheduleStatus,
      // NoOfDays: NoOfDays,
      SEID: TechnicianID,
    };
    requestWithEndUrl(`${API_SUPERVISOR}GetSparepartsCycleCountList`, params)
      .then((res) => {
        if (res.status != 200) throw Error(res.statusText);
        else if (res.data != null) {
          setSparepartsCycleCount(res.data);
          console.log(
            'GetSparepartsCycleCountList api call response==>>>',
            res.data,
          );
          if (res.data?.SparePartsCycleList?.length > 0) {
            setNoNotification(false);
          } else {
            setNoNotification(true);
          }
        } else {
        }
      })
      .catch(function (error) {
        console.log('SparepartsRequired Error: ', error);
      });
  }
  function UpdateSparePartsCyleCount() {
    const params = {
      CycleCountID: SparepartsCycleCount.CycleCountID,
      SparePartsCycleList: UpdatedQty,
    };

    requestWithEndUrl(
      `${API_SUPERVISOR}UpdateSparepartsCycleCount`,
      params,
      'POST',
    )
      .then((res) => {
        if (res.status != 200) throw Error(res.statusText);
        else if (res.data != null) {
          if (res.data.isSuccess == 1) {
            // alert(res.data.Message);txt_CycleCount_updated_sucessfully
            dispatch(
              actionSetAlertPopUpTwo({
                title: AppTextData.txt_Alert,
                body: AppTextData.txt_CycleCount_updated_sucessfully,
                visible: true,
                type: 'ok',
              }),
            );
            setUpdatedQty([]);
            // setSparepartsCycleCount();
            fetchSparePartsList();
          }
        } else {
          // alert('not success');txt_Updation_Failed
          dispatch(
            actionSetAlertPopUpTwo({
              title: AppTextData.txt_Alert,
              body: AppTextData.txt_Updation_Failed,
              visible: true,
              type: 'ok',
            }),
          );
        }
      })
      .catch(function (error) {
        console.log('SparepartsRequired Error: ', error);
      });
  }
  function IsDigit(e) {
    // var reg = /^\d+$/;
    var reg = /^-?\d+\.?\d*$/;
    // if (e == ' ') return false;
    // else
    // if (e.trim() === '') {
    //   return false;
    // } else if (!isNaN(e)) return true;
    // return !isNaN(e * 1);
    return reg.test(e);
  }
};

const styles = StyleSheet.create({
  MainHead: {
    fontSize: 20,
    fontStyle: 'normal',
    paddingVertical: 6,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  SubHeadLabel: {
    textAlign: 'left',
    fontWeight: 'bold',
    marginTop: 5,
  },
  SubHead: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    color: CmmsColors.black,
  },
  SubHeadLeft: {
    fontSize: 12,
    textAlign: 'left',
    fontWeight: 'bold',
    color: CmmsColors.black,
  },
  QtySubHeadLeft: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    color: CmmsColors.black,
  },
  SubHeadRight: {
    fontSize: 12,
    textAlign: 'right',
    fontWeight: 'bold',
    color:CmmsColors.black
  },
  ListTextAlignLeft: {
    fontSize: 13,
    textAlign: 'left',
    color:CmmsColors.black
  },
  ListTextAlignRight: {
    fontSize: 13,
    textAlign: 'right',
    color:CmmsColors.black
  },
  buttonColor: {
    backgroundColor: CmmsColors.btnColorPositive,
    borderRadius: 8,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  color_black: {
    color: 'black',
  },
});
