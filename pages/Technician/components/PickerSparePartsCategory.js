import React, { memo, useEffect } from 'react';
import { View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
// import CmmsColors from '../../../common/CmmsColors';
import {logoBottomGreen} from '../../../common/CmmsColors';
const TAG = "PickerSparePartsCategory"
function PickerSparePartsCategory({title="Select spare parts category",
SparePartsCategory=[],selectedSparePartsCat}) {
    
    useEffect(() => {

        console.log(TAG,'Category id:',);
		// console.log(`${API_TECHNICIAN}GetAdditionalSpareParts?SEID=${params.SeId}&JOID=${params.JoId}&SCATID=${id}`);

		// dispatch(actionSetLoading(true));
		// requestWithEndUrl(`${API_TECHNICIAN}GetAdditionalSpareParts`, {
		// 	SEID: params.SeId,
		// 	JOID: params.JoId,
		// 	SCATID: id
		// })
		// 	.then((res) => {
		// 		if (res.status != 200) {
		// 			throw Error(res.statusText);
		// 		}
		// 		return res.data;
		// 	})
		// 	.then((data) => {
		// 		console.log('SpareParts', data);
		// 		setSpareParts(data);
		// 		dispatch(actionSetLoading(false));
		// 	})
		// 	.catch(function(error) {
		// 		dispatch(actionSetLoading(false));
		// 		console.log('SpareParts Error: ', error);
		// 	});
        
    }, []);
    return (<View style={{backgroundColor:'white',marginTop:5}}>
            <Picker
					// style={{backgroundColor:'white',marginTop:5}}
                    
					dropdownIconColor={logoBottomGreen}
					mode={'dropdown'}
					selectedValue={selectedSparePartsCat}
					onValueChange={(item, index) => {
						if (index != 0) {
							// fetchSpareParts(item);
							// setDefaultSparePartsCat(item);
						}
					}}
				>
					{[
						{ Name: title, ID: -1 },
						...SparePartsCategory
					].map((item, index) => {
						return <Picker.Item key={index} label={`${item.Name}`} value={`${item.ID}`}  />;
					})}
				</Picker>
    </View>);
}

export default memo(PickerSparePartsCategory);