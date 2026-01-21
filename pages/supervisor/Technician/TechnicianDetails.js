import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  processColor,
  Image,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import {PieChart} from 'react-native-charts-wrapper';
import axios from 'axios';
import {parse, format} from 'date-fns';
import CmmsColors from '../../../common/CmmsColors';
import DatePicker from 'react-native-datepicker';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import {useSelector, useDispatch} from 'react-redux';
import {
  API_TECHNICIAN,
  API_SUPERVISOR,
  API_IMAGEPATH,
} from '../../../network/api_constants';
import requestWithEndUrl from '../../../network/request';
import DatePickerCmms from '../../components/DatePickerCmms';
import {description, HomeStyles, legend} from '../HomeScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import JobOrderView from '../../components/JobOrderView';
import StatusLabelView from '../../components/StatusLabelView';
import {
  actionSetAlertPopUp,
  actionSetAlertPopUpTwo,
} from '../../../action/ActionAlertPopUp';
import Alerts from '../../components/Alert/Alerts';

export default TechnicianDetails = ({navigation, route: {params}}) => {
  console.log('TechnicianDetails', {params});
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const {AlertPopUp, AlertPopUpTwo} = useSelector((state) => {
    return state.AlertPopUpReducer;
  });
  const [chartData, setChartData] = useState([]);
  const [JobOrderList, setJobOrderList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'dd/MM/yyyy'),
  );
  const {refresh} = useSelector((state) => state.SettingsReducer);
  const [visibleGraph, setVisibleGraph] = useState(true);
  const graphColors = chartData.map((e) => {
    return processColor(e.color);
  });
  const data = {
    dataSets: [
      {
        values: chartData,
        label: '',
        config: {
          colors: graphColors?.length > 0 ? graphColors : [],
          valueTextSize: 12,
          valueTextColor: processColor('white'),
          sliceSpace: 0,
          selectionShift: 10,
          fontFamily: 'sans-serif-condensed',
          valueFormatter: "#.#'%'",
          valueLineColor: processColor('black'),
          valueLinePart1Length: 0.9,
        },
      },
    ],
  };

  useEffect(() => {
    console.log('useEffect');
    console.log('params', params);
    const dateTime = Date.now(); //1577946600000
    const selectedTimemillies = parse(
      selectedDate,
      'dd/MM/yyyy',
      new Date(),
    ).getTime();
    requestWithEndUrl(`${API_TECHNICIAN}GetWorkStatusPieGraphByDate`, {
      CurrentDate: dateTime,
      Date: selectedTimemillies,
      SEID: params.SEID,
    })
      .then((res) => {
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        console.log({data});
        setChartData(data);
      })
      .catch((err) => {
        console.error('chart', err);
      });
    requestWithEndUrl(`${API_TECHNICIAN}GetJOScheduleByDate`, {
      CurrentDate: dateTime,
      Date: selectedTimemillies,
      SEID: params.SEID,
    })
      .then((res) => {
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        // console.log('GetJOScheduleByDate from the sup account=>', data);
        setJobOrderList(data);
      })
      .catch((err) => {
        console.error('chart', err);
      });
  }, [selectedDate, refresh]);

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
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
      {/* <ImageBackground
                style={{
                    flex: 1,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    // justifyContent: 'center',
                }}
                source={require('../../../assets/bg/bg_cmms.webp')}
            /> */}

      {chartData.length > 0 && visibleGraph && (
        <PieChart
          style={HomeStyles.chart}
          logEnabled={false}
          // touchEnabled={false}
          // chartBackgroundColor={processColor('pink')}
          chartDescription={description}
          data={data}
          legend={legend}
          // highlights={highlights}

          extraOffsets={{left: 5, top: 5, right: 5, bottom: 5}}
          entryLabelColor={processColor('green')}
          entryLabelTextSize={14}
          entryLabelFontFamily={'HelveticaNeue-Medium'}
          drawEntryLabels={false}
          rotationEnabled={true}
          rotationAngle={100}
          usePercentValues={true}
          // styledCenterText={{text:'Pie center text!', color: processColor('pink'), fontFamily: 'HelveticaNeue-Medium', size: 20}}
          // centerTextRadiusPercent={100}
          holeRadius={50}
          // holeColor={processColor('#fff')}
          // transparentCircleRadius={45}
          // transparentCircleColor={processColor('#f0f0f088')}
          maxAngle={600}
          // onSelect={handleSelect()}
          onChange={(event) => console.log(event.nativeEvent)}
        />
      )}
      <TouchableOpacity
        style={{alignSelf: 'center'}}
        onPress={() => {
          setVisibleGraph(!visibleGraph);
        }}>
        {/* <Text>APPLY</Text> */}
        <Icon
          name={visibleGraph ? 'angle-up' : 'angle-down'}
          size={32}
          color="grey"
        />
      </TouchableOpacity>
      <DatePickerCmms
        selectedDate={selectedDate}
        onDateChange={(date) => setSelectedDate(date)}
        text={`${AppTextData.txt_Job_Oders}(${JobOrderList.length})`}
      />
      <StatusLabelView jobOrderList={JobOrderList} />
      {JobOrderList.length > 0 && (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={JobOrderList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => {
            // const statusDetails = getStatusDetails(item.Status)
            // const maintananceDetails = getMaintananceTypeDetails(index)
            return (
              <GestureRecognizer
                onSwipe={(direction, state) =>
                  console.log('direction', direction, 'state', state)
                }
                onSwipeUp={(state) => console.log('up', 'state', state)}
                onSwipeDown={(state) => console.log('down', 'state', state)}
                onSwipeLeft={(state) => {
                  console.log('jobid: ', item.JOID);
                  if (state.dx < -70)
                    navigation.navigate('TodayJobOrderIssued', {
                      id: item.JOID,
                      SEID: params.SEID,
                    });
                }}
                onSwipeRight={(state) => {
                  if (
                    state.dx > 70
                    // &&
                    // item.IsPMOrderNoAvaliable &&
                    // item.Status == 1
                  ) {
                    console.log('jobid: ', item);
                    // if (item.From != 0 && item.To != 0) {
                    requestWithEndUrl(
                      `${API_TECHNICIAN}GetServiceReportDetailsByJOID`,
                      {SEID: params.SEID, ID: item.JOID},
                    )
                      .then((response) => {
                        // SetJobOrderReport(response.data)
                        console.log('jobOrderReport Tech det ', response.data);
                        console.log(
                          'jobOrderReport JOID Tech det ',
                          response.data.JOID,
                        );
                        if (response.data.JOID != 0) {
                          if (item.IsPMOrderNoAvaliable && item.Status == 1) {
                            navigation.navigate('JobOrderReport', {
                              JOID: item.JOID,
                              SEID: item.ServiceEngrID,
                              selectedActivityDetails: [],
                              SelectedSpareParts: [],
                              IsSuperVisor: 1,
                              IsVerified: true,
                            });
                          } else {
                            navigation.navigate('JobOrderReport', {
                              JOID: item.JOID,
                              SEID: item.ServiceEngrID,
                              selectedActivityDetails: [],
                              SelectedSpareParts: [],
                              IsSuperVisor: 1,
                              IsVerified: false,
                            });
                          }
                        } else {
                          //   alert(AppTextData.txt_Job_Report_Not_Entered);
                          dispatch(
                            actionSetAlertPopUpTwo({
                              title: AppTextData.txt_Alert,
                              body: AppTextData.txt_Job_Report_Not_Entered,
                              visible: true,
                              type: 'ok',
                            }),
                          );
                        }
                        // console.log('Not Able to Redirect')
                        // Alert('Job Order Report does not Exist')
                      })
                      .catch(function (error) {
                        console.log('JobOrderReport Erro: ', error);
                      });
                  }
                }}
                config={config}
                style={{
                  flex: 1,
                }}>
                <JobOrderView item={item} />
              </GestureRecognizer>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chart: {
    flex: 1,
    maxHeight: 280,
    minHeight: 180,
    marginTop: 10,
  },
  item: {
    height: 60,
    width: 60,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
