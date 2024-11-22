import React, {memo, useState, useEffect} from 'react';
import {TextInput, TouchableOpacity, View, Text} from 'react-native';
import {CmmsText} from '../../../common/components/CmmsText';
import Icon from 'react-native-vector-icons/FontAwesome';

function AdditionalSparePartsItem({
  StockChecking,
  index = 0,
  item,
  updateReqQty = (input) => {},
  updateUsedQty = (input) => {},
  SparePartsID = (input) => {},
  deleteItem = () => {},
}) {
  console.log('data from parent==>>', item);
  const [newItem, setnewItem] = useState({});

  useEffect(() => {
    console.log('UEF', {RQty: newItem.RQty});
  }, [newItem.RQty]);

  useEffect(() => {
    console.log('UEF', {Qty: newItem.Qty});
  }, [newItem.Qty]);
  useEffect(() => {
    setnewItem(item);
  }, [item]);
  console.log('newitem.WareHouseName==>>', newItem.WareHouseName);
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        marginTop: 5,
        backgroundColor: 'white',
      }}>
      <TouchableOpacity
        style={{flex: 1}}
        onPress={() => {
          console.log(
            'yes the stock touchable opacity is working well-->',
            newItem.SparePartsID,
          ),
            // SparePartsID(newItem.SparePartsID);
            SparePartsID(newItem);
        }}>
        <CmmsText
          // numberOfLines={1}
          style={{
            // flex: 1,
            fontSize: 12,
            color: StockChecking == index ? 'green' : 'gray',
            fontWeight: 'bold',
          }}>
          {index + 1}. {newItem.SpareParts}({newItem.UOM})
        </CmmsText>
      </TouchableOpacity>
      <TextInput
        style={{
          color: 'black',
          borderWidth: 1,
          textAlign: 'center',
          width: 40,
          height: 25,
          padding: 2,
          marginHorizontal: 8,
          fontFamily: 'sans-serif-condensed',
          fontSize: 10,
        }}
        placeholder=""
        keyboardType="numeric"
        onChangeText={(input) => {
          // console.log('onChangeText', { newItem });
          // let newArr = [ ...additionalSparePartsDtls ];
          // newArr[index].RQty = input;
          setnewItem((newItem) => ({...newItem, RQty: input}));
          updateReqQty(input);
        }}
        selectTextOnFocus
        placeholderTextColor="grey"
        returnKeyType="next"
        value={`${newItem.RQty}`}
      />
      <TextInput
        style={{
          color: 'black',
          borderWidth: 1,
          textAlign: 'center',
          width: 40,
          height: 25,
          padding: 2,
          marginHorizontal: 8,
          fontFamily: 'sans-serif-condensed',
          fontSize: 10,
        }}
        placeholder=""
        keyboardType="numeric"
        onChangeText={(input) => {
          // console.log('onChangeText', { item });
          // let newArr = [ ...additionalSparePartsDtls ];
          // newArr[index].Qty = input;
          setnewItem((newItem) => ({...newItem, Qty: input}));
          updateUsedQty(input);
        }}
        selectTextOnFocus
        placeholderTextColor="grey"
        returnKeyType="next"
        value={`${newItem.Qty}`}
      />
      <View
        style={{
          borderWidth: 1,
          textAlign: 'center',
          minHeight: 25,
          minWidth: 40,
          padding: 2,
          marginHorizontal: 8,
          fontFamily: 'sans-serif-condensed',
          fontSize: 10,
          borderColor: 'black',
        }}>
        <Text
          style={{
            color: 'green',
            fontWeight: 'bold',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
          }}>
          {item.WareHouseName}
        </Text>
      </View>
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          paddingHorizontal: 5,
        }}
        onPress={() => {
          // let newArr = [ ...additionalSparePartsDtls ];
          // newArr.splice(index, 1);
          // updateReqQty(newArr);
          deleteItem();
        }}>
        <Icon name="trash" size={18} color="grey" />
      </TouchableOpacity>
    </View>
  );
}

export default memo(AdditionalSparePartsItem);
