import React, { memo, useState,useEffect } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { CmmsText } from '../../../common/components/CmmsText';
import Icon from 'react-native-vector-icons/FontAwesome';

function AdditionalSparePartsItem({
	index = 0,
	item,
	updateReqQty = (input) => {},
	updateUsedQty = (input) => {},
	deleteItem = () => {}
}) {
	const [ newItem, setnewItem ] = useState(item);

    useEffect(() => {
        console.log("UEF",{RQty: newItem.RQty});
    }, [newItem.RQty]);

    useEffect(() => {
        console.log("UEF",{Qty:newItem.Qty});
    }, [newItem.Qty]);

	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				paddingVertical: 8,
                paddingHorizontal:4,
                marginTop:5,
                backgroundColor:'white',

			}}
		>
			<CmmsText
				numberOfLines={1}
				style={{
					flex: 1,
                    fontSize:12
				}}
			>
				{index + 1}. {newItem.SpareParts}({newItem.UOM})
			</CmmsText>
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
					fontSize: 10
				}}
				placeholder=""
				keyboardType="numeric"
				onChangeText={(input) => {
					// console.log('onChangeText', { newItem });
					// let newArr = [ ...additionalSparePartsDtls ];
					// newArr[index].RQty = input;
					setnewItem((newItem) => ({ ...newItem, RQty: input }));
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
					fontSize: 10
				}}
				placeholder=""
				keyboardType="numeric"
				onChangeText={(input) => {
					// console.log('onChangeText', { item });
					// let newArr = [ ...additionalSparePartsDtls ];
					// newArr[index].Qty = input;
					setnewItem((newItem) => ({ ...newItem, Qty: input }));
					updateUsedQty(input);
				}}
				selectTextOnFocus
				placeholderTextColor="grey"
				returnKeyType="next"
				value={`${newItem.Qty}`}
			/>
			<TouchableOpacity
				style={{
					justifyContent: 'center',
					paddingHorizontal: 5
				}}
				onPress={() => {
					// let newArr = [ ...additionalSparePartsDtls ];
					// newArr.splice(index, 1);
					// updateReqQty(newArr);
					deleteItem();
				}}
			>
				<Icon name="trash" size={18} color="grey" />
			</TouchableOpacity>
		</View>
	);
}

export default memo(AdditionalSparePartsItem);
