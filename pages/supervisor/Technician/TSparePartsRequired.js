import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
} from 'react-native';
import {parse, format} from 'date-fns';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CmmsColors from '../../../common/CmmsColors';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import {API_SUPERVISOR} from '../../../network/api_constants';
import {useSelector, useDispatch} from 'react-redux';
import ButtonQtyModifyWithLabel from '../../Technician/components/ButtonQtyModifyWithLabel';
import requestWithEndUrl from '../../../network/request';
import {CmmsText} from '../../../common/components/CmmsText';

export default TSparePartsRequired = ({navigation}) => {
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);

  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'dd/MM/yyyy'),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [ScheduleStatus, setScheduleStatus] = useState(0);
  const [SparepartsRequiredList, setSparepartsRequiredList] = useState([]);
  const [NoOfDays, setNoOfDays] = useState(0);
  var radio_props = [
    {
      label: AppTextData.txt_Scheduled, //'Scheduled'
      value: 0,
    },
    {label: AppTextData.txt_Unscheduled//'UnScheduled'
    , value: 1},
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
                        style={styles.MainHead}>Spare Parts Required</Text> */}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <CmmsText>{AppTextData.txt_Date}</CmmsText>

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{flexDirection: 'row', alignItems: 'center', marginStart: 8}}>
              <Image
                source={require('../../../assets/icons/ic_calendar_fi_512_vi.png')}
                style={{width: 28, height: 28}}
              />
              <Text style={{fontFamily: 'san-serif-condensed', marginStart: 16}}>
                {selectedDate}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              date={parse(selectedDate, 'dd/MM/yyyy', new Date())}
              onConfirm={(date) => {
                setShowDatePicker(false);
                setSelectedDate(format(date, 'dd/MM/yyyy'));
              }}
              onCancel={() => setShowDatePicker(false)}
            />
            <RadioForm
              radio_props={radio_props}
              initial={ScheduleStatus}
              formHorizontal={true}
              buttonSize={12}
              buttonColor={CmmsColors.logoBottomGreen}
              selectedButtonColor={CmmsColors.logoBottomGreen}
              style={{marginStart: 5, padding: 4}}
              labelStyle={{fontSize: 12, marginStart: -5, marginEnd: 5}}
              buttonStyle={{padding: 10}}
              onPress={(value) => {
                setScheduleStatus(value);
              }}
            />
          </View>

          <View style={{flexDirection: 'row', marginTop: 10}}>
            <CmmsText>{AppTextData.txt_Spare_Parts_Required}:</CmmsText>
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
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function fetchSparePartsList() {
    const selectedTimemillies = parse(
      selectedDate,
      'dd/MM/yyyy',
      new Date(),
    ).getTime();
    requestWithEndUrl(`${API_SUPERVISOR}SparepartsRequired`, {
      Date: selectedTimemillies,
      TypeOf: ScheduleStatus,
      NoOfDays: NoOfDays,
    })
      .then((res) => {
        setSparepartsRequiredList([]);
        if (res.status != 200) throw Error(res.statusText);
        return res.data;
      })
      .then((data) => {
        console.log('data', {data});
        setSparepartsRequiredList(data);
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
    fontSize: 11,
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
