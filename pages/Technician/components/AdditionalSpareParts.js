import React, {Component, useState, useEffect, useRef} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import {
  SafeAreaView,
  View,
  Text,
  Dimensions,
  ScrollView,
  ImageBackground,
  FlatList,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Pressable,
} from 'react-native';
import {API_TECHNICIAN} from '../../../network/api_constants';
import CmmsColors from '../../../common/CmmsColors';
import requestWithEndUrl from '../../../network/request';
import {Picker} from '@react-native-picker/picker';
import {useSelector, useDispatch} from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import {CmmsText, CTextTitle} from '../../../common/components/CmmsText';
import {actionSetJobOrderReport} from '../../../action/ActionJobOrderReport';
import {
  actionSetAlertPopUp,
  actionSetAlertPopUpTwo,
} from '../../../action/ActionAlertPopUp';
import Alerts from '../../components/Alert/Alerts';
import {actionSetLoading} from '../../../action/ActionSettings';
import AssetInfoPopUp from '../../components/AssetInfoPopUp';
import PickerSparePartsCategory from './PickerSparePartsCategory';
import AdditionalSparePartsItem from './AdditionalSparePartsItem';

export default ({navigation, route: {params}}) => {
  const codeRef = useRef(null);
  const addSpLstRef = useRef(null);
  console.log('AdditionalSpareParts', params);
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const {AlertPopUp, AlertPopUpTwo} = useSelector((state) => {
    return state.AlertPopUpReducer;
  });
  var JobOrderReportData;
  if (params.isCheckList) {
    JobOrderReportData = {
      AdditionalSparePartsDtls: params.SparePartsList || [],
    };
  } else {
    JobOrderReportData = useSelector((state) => {
      console.log({JobOrderReportReducer_state: state.JobOrderReportReducer});
      return state.JobOrderReportReducer.JobOrderReportData;
    });
  }
  const dispatch = useDispatch();
  const [SparePartsCategory, setSparePartsCategory] = useState([]);
  const [SpareParts, setSpareParts] = useState([]);
  const [additionalSparePartsDtls, setAdditionalSparePartsDtls] = useState(
    JobOrderReportData.AdditionalSparePartsDtls || [],
  );
  // const [SelectedSpareParts, setSelectedSpareParts] = useState([]);
  const [DefaultSparePartsCat, setDefaultSparePartsCat] = useState(0);
  const [DefaultSpareParts, setDefaultSpareParts] = useState(0);
  const [newNote, setNewNote] = useState(
    JobOrderReportData.AdditionalSparepartsNote,
  );
  const [visibleAssetInfoPopUp, setVisibleAssetInfoPopUp] = useState(false);
  // added by vbn
  const [searchSpareParts, setSearchSpareParts] = useState([]);
  console.log(
    'spare parts list from the searchSpareparts State====>>>',
    searchSpareParts,
  );
  const [ShowModal, setShowModal] = useState(false);
  const [stock, setStock] = useState([]);
  const [textBox, setTextbox] = useState('');
  const [UpdateWHId, setUpdateWHId] = useState(null);
  const [WHstockChecking, setWHStockChecking] = useState(false);

  //
  const height = Dimensions.get('window').height;
  const width = Dimensions.get('window').width;
  useEffect(() => {
    addSpLstRef.current.scrollToEnd();
  }, [additionalSparePartsDtls.length]);
  useEffect(() => {
    console.log('params', params);

    requestWithEndUrl(`${API_TECHNICIAN}GetSparePartsCategory`)
      .then((res) => {
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        console.log('All SparePartsCategory', data);
        setSparePartsCategory(data);
      })
      .catch(function (error) {
        console.log('Activity Detals Erro: ', error);
      });
  }, []);
  const StockChecking = (e, index) => {
    console.log('inside the Stock checking function===', e, 'index==>>', index);
    requestWithEndUrl(`${API_TECHNICIAN}GetSingleSparePartsStock`, {
      SparePartsID: e.SparePartsID,
    })
      .then((res) => {
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res?.data;
      })
      .then((data) => {
        // if (data.length == 1) {
        setStock(data);
        console.log('Stock Api call', data);

        if (index != 1) {
          addAddtionalSpareParts(e, 2, data);
          setUpdateWHId(null);
          setWHStockChecking(false);
        } else if (index == 1) {
          setWHStockChecking(true);
        }
        // } else {
        //   setStock(data);
        // }
      })
      .catch((error) => {
        console.log('Stock api catch ', error);
      });
    console.log('state value--->>>>', stock);
  };
  //Current Stock from each WH
  // const SpareSpartsStock = () => {
  //   return (
  //     <View
  //       style={{
  //         flexDirection: 'row',
  //         backgroundColor: '#fff',
  //         paddingVertical: 8,
  //         paddingHorizontal: 8,
  //         marginTop: 12,
  //       }}>
  //       <View
  //         style={{
  //           flexDirection: 'row',
  //           justifyContent: 'space-around',
  //           marginLeft: 5,
  //           flex: 1,
  //         }}>
  //         <FlatList
  //           style={{marginBottom: 8}}
  //           // ref={addSpLstRef}
  //           // removeClippedSubviews={false}
  //           showsVerticalScrollIndicator={false}
  //           keyExtractor={(item, index) => index.toString()}
  //           data={stock}
  //           renderItem={({item, index}) => (
  //             <Pressable
  //               style={{
  //                 borderLeftWidth: 0.2,
  //                 borderRightWidth: 0.2,
  //                 borderColor: 'silver',
  //                 paddingHorizontal: 3,
  //               }}
  //               onPress={() => {
  //                 console.log(
  //                   'warehoue index for updation==>>',
  //                   UpdateWHId,
  //                   'WH checking=>',
  //                   WHstockChecking,
  //                 );

  //                 if (item.Stock > 0) {
  //                   if (UpdateWHId == null && WHstockChecking == false) {
  //                     dispatch(
  //                       actionSetAlertPopUpTwo({
  //                         title: AppTextData.txt_Alert,
  //                         body: AppTextData.txt_Please_Select_desired_SpareParts_from_the_Selected_List,
  //                         visible: true,
  //                         type: 'ok',
  //                       }),
  //                     );
  //                   } else if (UpdateWHId != null && WHstockChecking == true) {
  //                     setWHStockChecking(false);
  //                     console.error('warehouse ID==>>', item);
  //                     let newArr = [...additionalSparePartsDtls];
  //                     newArr[UpdateWHId].WareHouseID = item?.WareHouseID;
  //                     newArr[UpdateWHId].WareHouseName = item?.Title;
  //                     setAdditionalSparePartsDtls(newArr);
  //                     console.log('WH name updated==>>', newArr);
  //                     dispatch(
  //                       actionSetAlertPopUpTwo({
  //                         title: AppTextData.txt_Alert,
  //                         body: AppTextData.txt_WareHouse_Selected_Successfully,
  //                         visible: true,
  //                         type: 'ok',
  //                       }),
  //                     );
  //                     setUpdateWHId(null);
  //                   }
  //                 } else {
  //                   dispatch(
  //                     actionSetAlertPopUpTwo({
  //                       title: AppTextData.txt_Alert,
  //                       body: AppTextData.txt_No_Stock_Available,
  //                       visible: true,
  //                       type: 'ok',
  //                     }),
  //                   );
  //                   setUpdateWHId(null);
  //                   setWHStockChecking(false);
  //                 }
  //               }}>
  //               <CTextTitle
  //                 style={{
  //                   color: CmmsColors.logoBottomGreen,
  //                   height: 25,
  //                   padding: 2,
  //                   alignSelf: 'center',
  //                 }}>
  //                 {item.Title}
  //               </CTextTitle>
  //               <CTextTitle
  //                 style={{
  //                   color: 'black',
  //                   height: 25,
  //                   padding: 2,
  //                   alignSelf: 'center',
  //                 }}>
  //                 {item.Stock}
  //               </CTextTitle>
  //             </Pressable>
  //           )}
  //         />
  //       </View>
  //     </View>
  //   );
  // };
  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView style={{flex: 1}} behavior="height">
        <ScrollView style={{flex: 1}}>
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
          <Modal
            style={{backgroundColor: 'black'}}
            animationType="fade"
            visible={ShowModal}
            transparent={true}
            avoidKeyboard
            //onRequestClose={console.log('back button pressed')}
            coverScreen={true}>
            <SafeAreaView
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  height: height / 1.4,
                  width: width - 28,
                  paddingTop: 20,
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: 'black',
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginBottom: 8,
                  }}>
                  {/* //vbn lang*/}
                  {AppTextData.txt_Spare_parts_Search_Result}
                  {/* Spare parts Search Result */}
                </Text>
                <Text
                  style={{
                    textAlign: 'center',
                    color: 'silver',
                    fontSize: 13,
                    fontWeight: '400',
                    marginBottom: 10,
                  }}>
                  {/* //vbn lang*/}
                  {AppTextData.txt_Please_choose_prefered_Spare_part}
                  {/* Please choose prefered Spare part */}
                </Text>
                <FlatList
                  contentContainerStyle={{
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  data={searchSpareParts}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => (
                    <TouchableOpacity
                      onPress={() => {
                        StockChecking(item);
                        // Promise.resolve(StockChecking(item)).then(() => {
                        //   addAddtionalSpareParts(item, 2);
                        // });
                        // addAddtionalSpareParts(item, 2),
                        //   StockChecking(item.SparePartsID),
                        setShowModal(false);
                      }}
                      style={{
                        borderRadius: 6,
                        minHeight: 50,
                        width: width - 80,
                        backgroundColor: CmmsColors.logoTopGreen,
                        marginVertical: 5,
                        padding: 8,
                      }}>
                      <Text style={{color: 'white', fontSize: 15}}>
                        {item.SpareParts}
                      </Text>
                      {/* </View> */}
                    </TouchableOpacity>
                  )}></FlatList>
                <View style={{paddingVertical: 20}}>
                  <TouchableOpacity
                    onPress={() => setShowModal(false)}
                    style={{
                      borderRadius: 8,
                      borderColor: 'black',
                      borderWidth: 0.3,
                      justifyContent: 'center',
                      height: 30,
                      width: 60,
                      alignSelf: 'center',
                      elevation: 20,
                      backgroundColor: '#fff',
                      paddingVertical: 15,
                    }}>
                    <Text
                      style={{
                        color: 'black',
                        fontSize: 15,
                        textAlign: 'center',
                      }}>
                      {AppTextData.txt_Cancel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </Modal>
          {visibleAssetInfoPopUp && (
            <AssetInfoPopUp
              dispatch={dispatch}
              AssetRegID={params.AssetRegID}
              onTouchOutSide={() => setVisibleAssetInfoPopUp(false)}
            />
          )}
          {/* <ImageBackground
                style={{
                    flex: 1,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                }}
                source={require('../../../assets/bg/bg_cmms.webp')}
            /> */}

          <View style={{flex: 1, padding: 8}}>
            {/* <CmmsText
                    style={styles.MainHead}>{AppTextData.txt_Additional_Spare_Parts_Issued}</CmmsText> */}

            {/* <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <View style={{ flex: 1 }} >
                        <CmmsText style={styles.SubHead}>{AppTextData.txt_Code}</CmmsText>
                    </View>
                    <View style={{ flex: 1, textAlign: 'center' }} > */}
            <View style={{flexDirection: 'row'}}>
              <TextInput
                ref={codeRef}
                style={{
                  flex: 1,
                  color: 'black',
                  backgroundColor: '#FFFFFF',

                  height: 40,
                }}
                value={textBox}
                //vbn lang
                placeholder={AppTextData.txt_Search_Spare_Parts}
                placeholderTextColor="grey"
                returnKeyType="search"
                onChangeText={(e) => setTextbox(e)}
                onSubmitEditing={(e) => {
                  console.log('onSubmitcode search', {e});
                  console.log(
                    'what is the exact search code===>>>',
                    e.nativeEvent.text,
                  );
                  // add spare parts based on the code
                  // requestWithEndUrl()
                  // if (
                  //   additionalSparePartsDtls.filter(
                  //     (addSp) => addSp.WareHouseID != 0,
                  //   ).length == 0
                  // ) {
                  dispatch(actionSetLoading(true));
                  requestWithEndUrl(
                    `${API_TECHNICIAN}GetAdditionalSparePartsByCode`,
                    {
                      Code: e.nativeEvent.text,
                    },
                  )
                    .then((res) => {
                      // console.log('search result response===>>', res);
                      if (res.status != 200) {
                        throw Error(res.statusText);
                      }
                      return res.data;
                    })
                    .then((data) => {
                      dispatch(actionSetLoading(false));
                      // console.log('GetAdditionalSparePartsByCode====>>', data);
                      if (data.length > 0) {
                        setShowModal(true);
                        setSearchSpareParts(data);
                      } else {
                        // alert(AppTextData.txt_Type_valid_Search_Data);
                        dispatch(
                          actionSetAlertPopUpTwo({
                            title: AppTextData.txt_Alert,
                            body: AppTextData.txt_Type_valid_Search_Data,
                            visible: true,
                            type: 'ok',
                          }),
                        );
                      }
                      // setSparePartsCategory(data);
                    })
                    .catch(function (error) {
                      dispatch(actionSetLoading(false));
                      console.log('GetAdditionalSparePartsByCode: ', error);
                      // alert(AppTextData.txt_somthing_wrong_try_again);
                      dispatch(
                        actionSetAlertPopUpTwo({
                          title: AppTextData.txt_Alert,
                          body: AppTextData.txt_somthing_wrong_try_again,
                          visible: true,
                          type: 'ok',
                        }),
                      );
                    });
                  // } else {
                  //   alert('Please Add Previous Wearhouse details');
                  // }
                }}
              />
              <TouchableOpacity
                style={{
                  padding: 4,
                  marginStart: 2,
                  backgroundColor: 'white',
                  justifyContent: 'center',
                }}
                onPress={() => setVisibleAssetInfoPopUp(true)}>
                <Icon name="paperclip" size={24} color="black" />
              </TouchableOpacity>
            </View>
            {/* </View>
                </View> */}

            {/* <PickerSparePartsCategory SparePartsCategory={[
						{ Name: AppTextData.txt_Spare_Parts_Category, ID: -1 },
						...SparePartsCategory
					]} 
					selectedSparePartsCat={DefaultSparePartsCat}
					/> */}

            {/* <CmmsText style={styles.SubHead}>{AppTextData.txt_Spare_Parts_Category}</CmmsText> */}
            <View style={{backgroundColor: 'white', marginTop: 12}}>
              <Picker
                // style={{backgroundColor:'white',marginTop:5}}
                dropdownIconColor={CmmsColors.logoBottomGreen}
                mode={'dropdown'}
                selectedValue={DefaultSparePartsCat}
                onValueChange={(item, index) => {
                  if (index != 0) {
                    fetchSpareParts(item);
                    setDefaultSparePartsCat(item);
                  }
                }}>
                {[
                  {Name: AppTextData.txt_Spare_Parts_Category, ID: -1},
                  ...SparePartsCategory,
                ].map((item, index) => {
                  return (
                    <Picker.Item
                      key={index}
                      label={`${item.Name}`}
                      value={`${item.ID}`}
                    />
                  );
                })}
              </Picker>
            </View>
            {/* <View style={{ flex: 1 }} >
                        <CmmsText style={styles.SubHead}>{AppTextData.txt_Spare_Parts}:</CmmsText>
                    </View> */}
            {/* <View style={{ flex: 1, textAlign: 'center' }} > */}
            <View style={{backgroundColor: 'white', marginTop: 12}}>
              <Picker
                dropdownIconColor={CmmsColors.logoBottomGreen}
                mode={'dropdown'}
                onValueChange={
                  (item, index) => StockChecking(item)
                  // addAddtionalSpareParts(item, index)//COMMENTED BY VBN
                }>
                {[
                  {
                    SpareParts:
                      SpareParts.length > 0
                        ? AppTextData.txt_Select_to_add_Spare_Parts
                        : AppTextData.txt_Spare_Parts_not_found,
                    ActivityID: -1,
                  },
                  ...SpareParts,
                ].map((item, index) => {
                  return (
                    <Picker.Item
                      color={index == 0 ? CmmsColors.logoBottomGreen : 'black'}
                      key={index}
                      label={`${item.SpareParts}`}
                      value={item}
                    />
                  );
                })}
              </Picker>
            </View>
            {/* </View> */}
            {/*vbn SpareSparts Stock  */}
            {/* <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#fff',
              paddingVertical: 8,
              paddingHorizontal: 8,
              marginTop: 12,
            }}>
            <CTextTitle style={{color: CmmsColors.logoBottomGreen}}>
              Spare Parts Stock
            </CTextTitle>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                marginLeft: 5,
                flex: 1,
              }}>
              <View
                style={{
                  borderLeftWidth: 0.2,
                  borderColor: 'silver',
                  paddingLeft: 3,
                }}>
                <CTextTitle
                  style={{
                    color: CmmsColors.logoBottomGreen,
                    height: 25,
                    padding: 2,
                    alignSelf: 'center',
                  }}>
                  Stock 1
                </CTextTitle>
                <CTextTitle
                  style={{
                    color: 'black',
                    height: 25,
                    padding: 2,
                    alignSelf: 'center',
                  }}>
                  40
                </CTextTitle>
              </View>
              <View
                style={{
                  borderLeftWidth: 0.2,
                  borderColor: 'silver',
                  paddingLeft: 3,
                }}>
                <CTextTitle
                  style={{
                    color: CmmsColors.logoBottomGreen,
                    height: 25,
                    padding: 2,
                    alignSelf: 'center',
                  }}>
                  Stock 2
                </CTextTitle>
                <CTextTitle
                  style={{
                    color: 'black',
                    height: 25,
                    padding: 2,
                    alignSelf: 'center',
                  }}>
                  40
                </CTextTitle>
              </View>
              <View
                style={{
                  borderLeftWidth: 0.2,
                  borderColor: 'silver',
                  paddingLeft: 3,
                }}>
                <CTextTitle
                  style={{
                    color: CmmsColors.logoBottomGreen,
                    height: 25,
                    padding: 2,
                    alignSelf: 'center',
                  }}>
                  Stock 3
                </CTextTitle>
                <CTextTitle
                  style={{
                    color: 'black',
                    height: 25,
                    padding: 2,
                    alignSelf: 'center',
                  }}>
                  40
                </CTextTitle>
              </View>
            </View>
          </View> */}
            {/* {SpareSpartsStock} */}

            {stock.length > 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#fff',
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  marginTop: 12,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    marginLeft: 5,
                    flex: 1,
                  }}>
                  <FlatList
                    // ref={addSpLstRef}
                    // removeClippedSubviews={false}

                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    data={stock}
                    renderItem={({item, index}) => (
                      <Pressable
                        style={{
                          borderLeftWidth: 0.2,
                          borderRightWidth: 0.2,
                          borderColor: 'silver',
                          paddingHorizontal: 3,
                        }}
                        onPress={() => {
                          console.log(
                            'warehoue index for updation==>>',
                            UpdateWHId,
                            'WH checking=>',
                            WHstockChecking,
                          );

                          if (item.Stock > 0) {
                            if (
                              UpdateWHId == null &&
                              WHstockChecking == false
                            ) {
                              dispatch(
                                actionSetAlertPopUpTwo({
                                  title: AppTextData.txt_Alert,
                                  body: AppTextData.txt_Please_Select_desired_SpareParts_from_the_Selected_List,
                                  visible: true,
                                  type: 'ok',
                                }),
                              );
                            } else if (
                              UpdateWHId != null &&
                              WHstockChecking == true
                            ) {
                              setWHStockChecking(false);
                              console.error('warehouse ID==>>', item);
                              let newArr = [...additionalSparePartsDtls];
                              newArr[UpdateWHId].WareHouseID =
                                item?.WareHouseID;
                              newArr[UpdateWHId].WareHouseName = item.Title;
                              setAdditionalSparePartsDtls(newArr);
                              console.log('WH name updated==>>', newArr);
                              dispatch(
                                actionSetAlertPopUpTwo({
                                  title: AppTextData.txt_Alert,
                                  body: AppTextData.txt_WareHouse_Selected_Successfully,
                                  visible: true,
                                  type: 'ok',
                                }),
                              );
                              setUpdateWHId(null);
                            }
                          } else {
                            dispatch(
                              actionSetAlertPopUpTwo({
                                title: AppTextData.txt_Alert,
                                body: AppTextData.txt_No_Stock_Available,
                                visible: true,
                                type: 'ok',
                              }),
                            );
                            setUpdateWHId(null);
                            setWHStockChecking(false);
                          }
                        }}>
                        <CTextTitle
                          style={{
                            color: CmmsColors.logoBottomGreen,
                            height: 25,
                            padding: 2,
                            alignSelf: 'center',
                          }}>
                          {item.Title}
                        </CTextTitle>
                        <CTextTitle
                          style={{
                            color: 'black',
                            height: 25,
                            padding: 2,
                            alignSelf: 'center',
                          }}>
                          {item.Stock}
                        </CTextTitle>
                      </Pressable>
                      // </View>
                    )}
                  />
                </View>
              </View>
            ) : null}
            {/* dfjdhfjhd */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: CmmsColors.logoTopGreen,
                paddingVertical: 8,
                paddingHorizontal: 7,
                marginTop: 12,
                alignItems: 'center',
              }}>
              {/* vbn lang */}
              <CTextTitle style={{flex: 1}}>
                {AppTextData.txt_Additional_Spare_Parts}
              </CTextTitle>
              <CTextTitle
                style={{
                  width: 40,
                  height: 25,
                  padding: 2,
                  marginHorizontal: 8,
                }}>
                {/* //vbvn lang*/}
                {AppTextData.txt_Req}
                {/* Req */}
              </CTextTitle>
              <CTextTitle
                style={{
                  width: 40,
                  height: 25,
                  marginHorizontal: 8,
                  padding: 2,
                }}>
                {/* //vbvn lang*/}
                {AppTextData.txt_Used}
                {/* Used */}
              </CTextTitle>
              <CTextTitle
                style={{
                  width: 40,
                  height: 25,
                  padding: 2,
                  marginStart: 8,
                  marginEnd: 30,
                }}>
                {/* //vbvn lang*/}
                W.H{/* Used */}
              </CTextTitle>
            </View>

            {/* <View
                    style={{}}> */}
            <FlatList
              style={{marginBottom: 8}}
              ref={addSpLstRef}
              removeClippedSubviews={false}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              data={additionalSparePartsDtls}
              renderItem={({item, index}) => (
                <AdditionalSparePartsItem
                  SparePartsID={(e) => {
                    // setWHStockChecking(true);
                    console.error(
                      // 'sparepats Id from the Add.Sp. Page--->>>>>',
                      // e,
                      // 'index==>',
                      // index,
                      'full item=>>',
                      additionalSparePartsDtls,
                    );
                    Promise.resolve(setUpdateWHId(index)).then(() => {
                      StockChecking(e, 1);
                    });
                  }}
                  index={index}
                  StockChecking={UpdateWHId}
                  item={item}
                  updateReqQty={(input) => {
                    let newArr = [...additionalSparePartsDtls];
                    newArr[index].RQty = input;
                    setAdditionalSparePartsDtls(newArr);
                  }}
                  updateUsedQty={(input) => {
                    let newArr = [...additionalSparePartsDtls];
                    newArr[index].Qty = input;
                    setAdditionalSparePartsDtls(newArr);
                  }}
                  deleteItem={() => {
                    console.log('Total item', additionalSparePartsDtls);
                    setStock([]);
                    let newArr = [...additionalSparePartsDtls];
                    // const eee = newArr.filter((e, Index) => Index != index);
                    newArr.splice(index, 1);
                    console.error(
                      'deleted Item===>>e index==>',
                      index,
                      ' - ',
                      // additionalSparePartsDtls.filter(
                      //   (e, Index) => Index != index,
                      // ),
                      newArr,
                    );
                    setAdditionalSparePartsDtls(newArr);
                  }}
                />
                // <View
                // 	style={{
                // 		flexDirection: 'row',
                // 		justifyContent: 'space-between',
                // 		alignItems: 'center',
                // 		paddingVertical: 8,
                // 	}}
                // >
                // 	<CmmsText
                // 		numberOfLines={1}
                // 		style={{
                // 			flex: 1
                // 		}}
                // 	>
                // 		{index + 1}. {item.SpareParts}({item.UOM})
                // 	</CmmsText>
                // 	<TextInput
                // 		style={{
                // 			color: 'black',
                // 			borderWidth: 1,
                // 			textAlign: 'center',
                // 			width: 40,
                // 			height: 25,
                // 			padding: 2,
                // 			marginHorizontal: 8,
                // 			fontFamily: 'sans-serif-condensed',
                // 			fontSize: 10
                // 		}}
                // 		placeholder=""
                // 		keyboardType="numeric"
                // 		onChangeText={(input) => {
                // 			console.log('onChangeText', { item });
                // 			let newArr = [ ...additionalSparePartsDtls ];
                // 			newArr[index].RQty = input;
                // 			setAdditionalSparePartsDtls(newArr);
                // 			// item.AQty = input
                // 			// item.Qty = input
                // 			// let newArr = [ ...JobOrderReportData.AdditionalSparePartsDtls ];
                // 			// newArr[index] = { ...item, Qty: input };
                // 			// // setSelectedSpareParts(newArr);
                // 			// dispatch(
                // 			// 	actionSetJobOrderReport({
                // 			// 		...JobOrderReportData,
                // 			// 		AdditionalSparePartsDtls: newArr
                // 			// 	})
                // 			// );
                // 			// console.log(JobOrderReportData.AdditionalSparePartsDtls)
                // 		}}
                // 		selectTextOnFocus
                // 		placeholderTextColor="grey"
                // 		returnKeyType="next"
                // 		value={`${item.RQty}`}
                // 	/>
                // 	<TextInput
                // 		style={{
                // 			color: 'black',
                // 			borderWidth: 1,
                // 			textAlign: 'center',
                // 			width: 40,
                // 			height: 25,
                // 			padding: 2,
                // 			marginHorizontal: 8,
                // 			fontFamily: 'sans-serif-condensed',
                // 			fontSize: 10
                // 		}}
                // 		placeholder=""
                // 		keyboardType="numeric"
                // 		onChangeText={(input) => {
                // 			console.log('onChangeText', { item });
                // 			let newArr = [ ...additionalSparePartsDtls ];
                // 			newArr[index].Qty = input;
                // 			setAdditionalSparePartsDtls(newArr);
                // 			// item.AQty = input
                // 			// item.Qty = input
                // 			// let newArr = [ ...JobOrderReportData.AdditionalSparePartsDtls ];
                // 			// newArr[index] = { ...item, RQty: input};
                // 			// // setSelectedSpareParts(newArr);
                // 			// dispatch(
                // 			// 	actionSetJobOrderReport({
                // 			// 		...JobOrderReportData,
                // 			// 		AdditionalSparePartsDtls: newArr
                // 			// 	})
                // 			// );
                // 			// console.log(JobOrderReportData.AdditionalSparePartsDtls)
                // 		}}
                // 		selectTextOnFocus
                // 		placeholderTextColor="grey"
                // 		returnKeyType="next"
                // 		value={`${item.Qty}`}
                // 	/>
                // 	<TouchableOpacity
                // 		style={{
                // 			justifyContent: 'center',
                // 			paddingHorizontal: 8
                // 		}}
                // 		onPress={() => {
                // 			let newArr = [ ...additionalSparePartsDtls ];
                // 			newArr.splice(index, 1);
                // 			setAdditionalSparePartsDtls(newArr);
                // 			// dispatch(actionSetJobOrderReport({ ...JobOrderReportData }));
                // 			//JobOrderReportData.AdditionalSparePartsDtls.filter(addSp=>addSp.SparePartsID==item.SparePartsID&&addSp.UOMID==item.UOMID)
                // 			// setSelectedSpareParts(SelectedSpareParts=>SelectedSpareParts.filter(filterItem=>(filterItem.SparePartsID!=item.SparePartsID)))
                // 		}}
                // 	>
                // 		<Icon name="trash" size={18} color="grey" />
                // 	</TouchableOpacity>
                // </View>
              )}
            />
            <View style={{height: 120}}></View>
            {!params.isCheckList && (
              <TextInput
                // ref={noteArea.current}
                selectTextOnFocus
                style={{
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  alignContent: 'flex-start',
                  textAlignVertical: 'top',
                  // borderWidth: 1,
                  minHeight: 100,
                  maxHeight: '25%',
                  // borderColor: 'grey',
                  backgroundColor: 'white',
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
                // marginVertical: 8,
                marginTop: 8,
                padding: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                setStock([]);
                setUpdateWHId(null);
                setWHStockChecking(false);
                // console.log('SelectedSpareParts', SelectedSpareParts)
                // // console.log('SelectedSpareParts', { "SelectedSpareParts": SelectedSpareParts.filter(obj => obj.AQty != NaN) })
                // navigation.navigate("JobOrderReport", { "SelectedSpareParts": SelectedSpareParts.filter(obj => obj.Qty != 0 || obj.Qty != ""), IsSuperVisor: 0 })
                // navigation.goBack();
                console.log(
                  'addition spareparts==>>',
                  additionalSparePartsDtls,
                );
                console.log(
                  'qty==0 count>>',
                  additionalSparePartsDtls.filter((addSp) => addSp.Qty > 0),
                );
                console.log(
                  'WH==0 count>>',
                  additionalSparePartsDtls.filter(
                    (addSp) => addSp.WareHouseID == 0,
                  ),
                );
                if (additionalSparePartsDtls.length > 0) {
                  console.log('if condtion a');
                  // "is there any additional spareparts added or not?"
                  if (
                    additionalSparePartsDtls.filter((addSp) => addSp.Qty > 0)
                      .length > 0
                  ) {
                    console.log('if condtion b');
                    //is there are more than one used spareparts count, then check is WH empty or not?
                    if (
                      additionalSparePartsDtls.filter(
                        (addSp) => addSp.WareHouseID == 0,
                      ).length > 0
                      //checking the WH ID is added or not
                    ) {
                      console.log('if condtion c');
                      dispatch(
                        actionSetAlertPopUpTwo({
                          title: AppTextData.txt_Alert,
                          body: AppTextData.txt_Please_Update_WareHouse_Name,
                          visible: true,
                          type: 'ok',
                        }),
                      );
                    } else {
                      console.log('if condtion d');
                      if (params.isCheckList) {
                        console.log('if condtion e');
                        params.updateSpareParts(additionalSparePartsDtls);
                      } else {
                        console.log('if condtion f');
                        dispatch(
                          actionSetJobOrderReport({
                            ...JobOrderReportData,
                            AdditionalSparepartsNote: newNote,
                            AdditionalSparePartsDtls: additionalSparePartsDtls,
                          }),
                        );
                        dispatch(
                          actionSetAlertPopUpTwo({
                            title: AppTextData.txt_Alert,
                            body: AppTextData.txt_Spare_Parts_Added_Successfully,
                            visible: true,
                            type: 'ok',
                          }),
                        );
                        navigation.goBack();
                      }
                    }
                  } else if (
                    //if users add spreparts and set count zero in both used and requited spareparts number
                    additionalSparePartsDtls.filter(
                      (addSp) => addSp.Qty == 0 && addSp.RQty == 0,
                    ).length > 0
                  ) {
                    console.log('if condtion g');
                    dispatch(
                      actionSetAlertPopUpTwo({
                        title: AppTextData.txt_Alert,
                        body: AppTextData.txt_please_set_SpareParts_Count,
                        visible: true,
                        type: 'ok',
                      }),
                    );
                  } else {
                    console.log('if condtion h');
                    if (params.isCheckList) {
                      console.log('if condtion i');
                      params.updateSpareParts(additionalSparePartsDtls);
                    } else {
                      console.log('if condtion j');
                      dispatch(
                        actionSetJobOrderReport({
                          ...JobOrderReportData,
                          AdditionalSparepartsNote: newNote,
                          AdditionalSparePartsDtls: additionalSparePartsDtls,
                        }),
                      );
                      dispatch(
                        actionSetAlertPopUpTwo({
                          title: AppTextData.txt_Alert,
                          body: AppTextData.txt_Spare_Parts_Added_Successfully,
                          visible: true,
                          type: 'ok',
                        }),
                      );
                      navigation.goBack();
                    }
                  }
                } else {
                  console.log('if condtion k');
                  console.error(
                    'additional spareparts==>>>',
                    additionalSparePartsDtls,
                  );
                  console.log('if condtion 6');
                  dispatch(
                    actionSetJobOrderReport({
                      ...JobOrderReportData,
                      AdditionalSparepartsNote: newNote,
                      AdditionalSparePartsDtls: additionalSparePartsDtls,
                    }),
                  );
                  navigation.goBack();
                }
              }}>
              <CmmsText
                style={{
                  color: 'white',
                  fontWeight: '900',
                  textAlign: 'center',
                }}>
                {AppTextData.txt_OK}
              </CmmsText>
            </TouchableOpacity>

            {/* </View> */}
            {/* </KeyboardAvoidingView> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  function addAddtionalSpareParts(item, index = 0, Stock) {
    console.log('inside the addAddtionalSpareParts function==>>>');
    console.log('stock==>>>', stock, ' stock.length', Stock?.length);
    console.log('stock parameter==>.', Stock);
    console.log('addAddtionalSpareParts', {item});
    if (
      index != 0 &&
      additionalSparePartsDtls.filter(
        (addSp) =>
          addSp.SparePartsID == item.SparePartsID && addSp.UOMID == item.UOMID,
      ).length == 0
    ) {
      setTextbox('');
      //adding new data to the Additional spareparts details
      setAdditionalSparePartsDtls((additionalSparePartsDtls) => [
        ...additionalSparePartsDtls,
        {
          ...item,
          Qty: 0, //used spareparts
          RQty: 0, //required spareparts
          WareHouseID:
            Stock?.length == 1 && Stock[0].WareHouseID != 0
              ? Stock[0].WareHouseID
              : 0,
          WareHouseName:
            Stock?.length == 1 && Stock[0].WareHouseID != 0
              ? Stock[0].Title
              : '-',
        },
      ]);
    } else {
      // alert(item.SpareParts + AppTextData.txt_already_added);
      dispatch(
        actionSetAlertPopUpTwo({
          title: AppTextData.txt_Alert,
          body: item.SpareParts + ', ' + AppTextData.txt_already_added,
          visible: true,
          type: 'ok',
        }),
      );
    }
  }
  function fetchSpareParts(id) {
    console.log('Category id:', id);
    console.log(
      `${API_TECHNICIAN}GetAdditionalSpareParts?SEID=${params.SeId}&JOID=${params.JoId}&SCATID=${id}`,
    );

    dispatch(actionSetLoading(true));
    requestWithEndUrl(`${API_TECHNICIAN}GetAdditionalSpareParts`, {
      SEID: params.SeId,
      JOID: params.JoId,
      SCATID: id,
    })
      .then((res) => {
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        console.log('SpareParts', data);
        setSpareParts(data);
        dispatch(actionSetLoading(false));
      })
      .catch(function (error) {
        dispatch(actionSetLoading(false));
        console.log('SpareParts Error: ', error);
      });
  }
};

const styles = StyleSheet.create({
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
    fontWeight: 'bold',
  },
  SubHeadDetTitle: {
    marginTop: 10,
    padding: 2,
    paddingHorizontal: 8,
    backgroundColor: CmmsColors.logoTopGreen,
  },

  row: {
    flex: 1,
    flexDirection: 'row',
  },
});

{
  /* <DropDownPicker
                            items={[
                                { label: 'USA', value: 'usa' },
                                { label: 'UK', value: 'uk' },
                                { label: 'France', value: 'france' },
                            ]}
                            defaultValue={country}
                            Value={country}
                            containerStyle={{ height: 40 }}
                            style={{
                                backgroundColor: '#fafafa'
                            }}
                            itemStyle={{
                                justifyContent: 'flex-start'
                            }}
                            dropDownStyle={{
                                backgroundColor: '#fafafa',

                            }}
                            onChangeItem={handleChange}
                        /> */
}
