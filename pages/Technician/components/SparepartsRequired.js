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
import DatePicker from 'react-native-datepicker';
import CmmsColors from '../../../common/CmmsColors';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import requestWithEndUrl from '../../../network/request';
import {API_TECHNICIAN} from '../../../network/api_constants';
import {useSelector, useDispatch} from 'react-redux';
import {
  actionSetLoading,
  actionSetRefreshing,
} from '../../../action/ActionSettings';
import ButtonQtyModifyWithLabel from '../components/ButtonQtyModifyWithLabel';
import {CmmsText, CTextTitle} from '../../../common/components/CmmsText';

export default SparepartsRequired = ({navigation, route: {params}}) => {
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);

  const {
    loggedUser: {TechnicianID, TechnicianName},
  } = useSelector((state) => state.LoginReducer);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'dd/MM/yyyy'),
  );
  const [ScheduleStatus, setScheduleStatus] = useState(0);
  const [SparepartsRequiredList, setSparepartsRequiredList] = useState([]);
  const [NoOfDays, setNoOfDays] = useState(0);
  var radio_props = [
    {
      label: AppTextData.txt_Scheduled, // 'Scheduled',
      value: 0,
    },
    {
      label: AppTextData.txt_Unscheduled, //'Unscheduled'
      value: 1,
    },
  ];

  const dispatch = useDispatch();

  useEffect(() => {
    setSparepartsRequiredList([]);
  }, []);

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
      <ScrollView>
        <View style={{flex: 1, padding: 8}}>
          {/* <Text
                        style={styles.MainHead}>{AppTextData.txt_txt_Spare_Parts_Required}</Text> */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <DatePicker
                date={selectedDate}
                mode="date"
                placeholder={AppTextData.txt_Select_Date}
                format="DD/MM/YYYY"
                // showIcon={false}
                iconSource={require('../../../assets/icons/ic_calendar_fi_512_vi.png')}
                confirmBtnText={AppTextData.txt_Confirm}
                cancelBtnText={AppTextData.txt_Cancel}
                customStyles={{
                  dateIcon: {
                    position: 'absolute',
                    start: 0,
                    width: 30,
                    height: 28,
                  },
                  dateInput: {
                    borderWidth: 0,
                  },
                  dateText: {
                    fontFamily: 'san-serif-condensed',
                    marginStart: 16,
                    color: 'black',
                    fontSize: 16,
                    fontWeight: '900',
                  },
                }}
                onDateChange={(date) => {
                  setSelectedDate(date);
                }}
              />

              <View
                style={{
                  alignItems: 'center',
                }}>
                <RadioForm
                  radio_props={radio_props}
                  initial={ScheduleStatus}
                  formHorizontal={false}
                  buttonSize={12}
                  buttonColor={CmmsColors.logoBottomGreen}
                  selectedButtonColor={CmmsColors.logoBottomGreen}
                  style={{marginStart: 5, padding: 4, paddingVertical: 5}}
                  labelColor={'black'}
                  labelStyle={{
                    fontFamily: 'sans-serif-condensed',
                    marginEnd: 8,
                    color: 'black',
                  }}
                  onPress={(value) => {
                    setScheduleStatus(value);
                  }}
                />
              </View>
            </View>
          </View>
          <View style={{flexDirection: 'row', marginTop: 10}}>
            <CTextTitle style={{color: 'black'}}>
              {AppTextData.txt_Spare_Parts_Required}:
            </CTextTitle>
            <ButtonQtyModifyWithLabel
              style={{flex: 0}}
              Qty={NoOfDays}
              // isNormal={NoOfDays == 0}
              onIncrease={() => {
                setNoOfDays(NoOfDays + 1);
              }}
              onReduce={() => {
                if (NoOfDays - 1 >= 0) setNoOfDays(NoOfDays - 1);
              }}
            />
            <CmmsText
              style={{
                fontSize: 10,
                textAlign: 'left',
                fontWeight: 'bold',
                margin: 5,
              }}>
              {AppTextData.txt_Days}
            </CmmsText>

            <TouchableOpacity
              style={{
                position: 'absolute',
                end: 8,
                backgroundColor: CmmsColors.logoTopGreen,
                paddingHorizontal: 16,
                paddingVertical: 4,
                borderRadius: 5,
              }}
              onPress={() => {
                fetchSparePartsList();
              }}>
              <CmmsText style={{color: 'white', fontWeight: '900'}}>
                {AppTextData.txt_LIST}
              </CmmsText>
            </TouchableOpacity>
            {/* <View style={{ flex: 1 }} >
                        </View> */}
          </View>

          {Object.keys(SparepartsRequiredList).length > 0 && (
            <View>
              <View style={{flexDirection: 'row', marginTop: 10}}>
                <View style={{flex: 1}}>
                  <CmmsText style={styles.SubHead}>#1</CmmsText>
                </View>
                <View style={{flex: 2}}>
                  <CmmsText style={styles.SubHeadLeft}>PNo</CmmsText>
                </View>
                <View style={{flex: 10}}>
                  <CmmsText style={styles.SubHeadLeft}>SpareParts</CmmsText>
                </View>
                <View style={{flex: 2}}>
                  <CmmsText style={styles.SubHeadLeft}>UOM</CmmsText>
                </View>
                <View style={{flex: 2}}>
                  <CmmsText style={styles.SubHeadRight}>IQty</CmmsText>
                </View>
                <View style={{flex: 2}}>
                  <CmmsText style={styles.SubHeadRight}>E/S</CmmsText>
                </View>
                <View style={{flex: 2}}>
                  <CmmsText style={styles.SubHeadRight}>RQty</CmmsText>
                </View>
                <View style={{flex: 2}}>
                  <CmmsText style={styles.SubHeadRight}>SOH</CmmsText>
                </View>
              </View>
              <FlatList
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                data={SparepartsRequiredList}
                renderItem={({item, index}) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      marginVertical: 3,
                      backgroundColor:
                        item.Received == 1
                          ? CmmsColors.joGreenAlpha
                          : item.Received == 2
                          ? CmmsColors.joYellowAlpha
                          : CmmsColors.joSilverAlpha,
                    }}>
                    <View style={{flex: 1}}>
                      <CmmsText style={styles.SubHead}>{item.SNO}</CmmsText>
                    </View>
                    <View style={{flex: 2}}>
                      <CmmsText style={styles.ListTextAlignLeft}>
                        {item.PartNO}
                      </CmmsText>
                    </View>
                    <View style={{flex: 10}}>
                      <CmmsText style={styles.ListTextAlignLeft}>
                        {item.Spareparts}
                      </CmmsText>
                    </View>
                    <View style={{flex: 2}}>
                      <CmmsText style={styles.ListTextAlignLeft}>
                        {item.UOM}
                      </CmmsText>
                    </View>
                    <View style={{flex: 2}}>
                      <CmmsText style={styles.ListTextAlignRight}>
                        {item.IssuedQTY}
                      </CmmsText>
                    </View>
                    <View style={{flex: 2}}>
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
                    </View>
                  </View>
                )}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: CmmsColors.logoBottomGreen,
                  paddingVertical: 4,
                  marginTop: 10,
                }}
                onPress={() => {
                  console.log(
                    'SparepartsRequiredList body:',
                    JSON.stringify(SparepartsRequiredList),
                  );
                  dispatch(actionSetLoading(true));
                  console.log(
                    `${API_TECHNICIAN}SESparepartsReceived?SEID=${TechnicianID}&IsScheduled=${
                      ScheduleStatus == 0 ? true : false
                    }&Date=${parse(
                      selectedDate,
                      'dd/MM/yyyy',
                      new Date(),
                    ).getTime()}`,
                  );

                  requestWithEndUrl(
                    `${API_TECHNICIAN}SESparepartsReceived?SEID=${TechnicianID}&IsScheduled=${
                      ScheduleStatus == 0 ? true : false
                    }&Date=${parse(
                      selectedDate,
                      'dd/MM/yyyy',
                      new Date(),
                    ).getTime()}`,
                    SparepartsRequiredList,
                    'POST',
                  )
                    .then((res) => {
                      console.log('URL_APKSESparepartsReceived', res);
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
                        setSparepartsRequiredList([]);
                      }
                    })
                    .catch((err) => {
                      console.error({err});
                      dispatch(actionSetLoading(false));
                      alert(AppTextData.txt_somthing_wrong_try_again);
                    });
                }}>
                <CmmsText
                  style={{
                    color: 'white',
                    fontWeight: '900',
                    textAlign: 'center',
                  }}>
                  {AppTextData.txt_RECEIVED}
                </CmmsText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function fetchSparePartsList() {
    console.log('TechnicianID:', TechnicianID);
    const selectedTimemillies = parse(
      selectedDate,
      'dd/MM/yyyy',
      new Date(),
    ).getTime();
    requestWithEndUrl(
      `${API_TECHNICIAN}SparepartsRequired?Date=${selectedTimemillies}&TypeOf=${ScheduleStatus}&NoOfDays=${NoOfDays}&SEID=${TechnicianID}`,
    )
      .then((res) => {
        setSparepartsRequiredList([]);
        if (res.status != 200) throw Error(res.statusText);
        else if (res.data != null) setSparepartsRequiredList(res.data);
        else setSparepartsRequiredList([]);
      })
      .catch(function (error) {
        console.log('SparepartsRequired Error: ', error);
      });
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
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  SubHeadLeft: {
    fontSize: 10,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  SubHeadRight: {
    fontSize: 10,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  ListTextAlignLeft: {
    fontSize: 9,
    textAlign: 'left',
  },
  ListTextAlignRight: {
    fontSize: 9,
    textAlign: 'right',
  },
  buttonColor: {
    backgroundColor: CmmsColors.btnColorPositive,
    borderRadius: 8,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
