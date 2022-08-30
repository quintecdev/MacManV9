import React from 'react';
import { 
 TouchableOpacity,
 View,
 Text,

} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

export default ButtonQtyModify = ({...props}) => {
	const {AppTextData} = useSelector(state => state.AppTextViewReducer)

	return props.isNormal ? (
		<TouchableOpacity
			style={[props.style,{
				width: 65,
				height: 25,
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: 'white',
				borderColor: '#D2D2D2',
				borderWidth: 1
			}]}
			// title='ADD' color='transparent'

			onPress={()=>props.onIncrease()}
		>
			<Text style={{ color: 'green', fontWeight: '900', fontSize: 12 }}>{AppTextData.txt_ADD}</Text>
		</TouchableOpacity>
	) : (
		<View
			style={{
				flexDirection: 'row',
				borderWidth: 1,
				borderColor: '#D2D2D2',
				justifyContent: 'center',
				alignItems: 'center',
				height: 25,
				width: 65,
				paddingHorizontal: 2
				// paddingRight:8
			}}
		>
			<TouchableOpacity
				style={{
					backgroundColor: 'transparent',
					flex: 1
				}}
				onPress={()=>props.onReduce()
				//   console.log("onpress_Qty: "+item.Qty)
				//   item.Qty > 1 ? this.UpdateItemCount.bind(this, item, index, false) :
				//   this.deleteOrderWiseItem.bind(this, item, index)
				}
			>
				<Text
					style={{
						color: 'green',
						fontSize: 16,
						fontWeight: 'bold',
						textAlign: 'center'
					}}
				>
					-
				</Text>
			</TouchableOpacity>
			<Text
				style={{
					fontSize: 14,
					fontWeight: '900',
					textAlign: 'center',
					color: 'green'
				}}
			>
				{/* 10 */}
				{props.Qty}

				{/* {this.state.cartDetails.orderdtl[index].Qty} */}
			</Text>
			<TouchableOpacity
				style={{
					flex: 1,
					backgroundColor: 'transparent'
				}}
				onPress={()=>props.onIncrease()}
			>
				<Text
					style={{
						color: 'green',
						fontSize: 16,
						fontWeight: 'bold',
						textAlign: 'center'
					}}
				>
					+
				</Text>
			</TouchableOpacity>
		</View>
	);
}

ButtonQtyModify.defaultProps={
	onIncrease:()=>{},
	onReduce:()=>{}
}
