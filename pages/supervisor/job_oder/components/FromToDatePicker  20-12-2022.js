import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import DatePicker from 'react-native-datepicker';
import { parse, format } from 'date-fns';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector, useDispatch } from 'react-redux';
import { CmmsText } from '../../../../common/components/CmmsText';

export default FromToDatePicker = ({ ...props }) => {
	// const appData = useSelector(state => state.AppTextViewReducer)
	const { AppTextData } = useSelector((state) => state.AppTextViewReducer);

	const [ selectedFromDate, setSelectedFromDate ] = useState(
		format(props.fromDate, `${props.mode == 'date' ? 'dd/MM/yyyy' : 'hh:mm'}`)
	); //format(new Date(), 'dd/MM/yyyy')
	const [ selectedToDate, setSelectedToDate ] = useState(
		format(props.toDate, `${props.mode == 'date' ? 'dd/MM/yyyy' : 'hh:mm'}`)
	); //format(new Date(), 'dd/MM/yyyy')
	console.log('FromToDatePicker', { props, selectedToDate, selectedFromDate });

	useEffect(()=>{
		setSelectedFromDate(format(props.fromDate, `${props.mode == 'date' ? 'dd/MM/yyyy' : 'hh:mm'}`))
		setSelectedToDate(format(props.toDate, `${props.mode == 'date' ? 'dd/MM/yyyy' : 'hh:mm'}`))
	},[props])

	return (
		<View style={{ ...{ flexDirection: 'row',flex:1,alignItems: 'center',}, ...props.style }}>
			<View style={{ flexDirection: 'row',flex:1, alignItems: 'center' }}>
				{props.hasFromTxt && <CmmsText style={{ fontWeight: 'bold' }}>{AppTextData.txt_From} </CmmsText>}
				{props.isAssignDate?<DatePicker
					style={{ flex: 1 }}
					date={selectedFromDate}
					mode={props.mode}
					placeholder="select date"
					format={props.mode == 'date' ? 'DD/MM/YYYY' : 'hh:mm'}
					// iconSource={require('../../../../assets/icons/ic_calendar.png')}
					minDate={format(new Date(), `${props.mode == 'date' ? 'dd/MM/yyyy' : 'hh:mm'}`)}
					maxDate={selectedToDate}
					showIcon={false}
					confirmBtnText="Confirm"
					cancelBtnText="Cancel"
					customStyles={{
						// dateIcon: {
						//   position: 'absolute',
						//   left: -15,
						//   top: -15,
						//   marginLeft: 5,
						//   height: 48, width: 56,

						// },
						dateInput: {
							borderWidth: 1
						},
						dateText: {
							fontWeight: 'bold',
							color: 'black'
						}
						// ... You can check the source to find the other keys.
					}}
					onDateChange={(date, dateobj) => {
						console.log('ondate_change', date, { dateobj });
						setSelectedFromDate(date);
						props.onDateChange(date, selectedToDate);
					}}
				/>:<DatePicker
				style={{ flex: 1 }}
				date={selectedFromDate}
				mode={props.mode}
				placeholder="select date"
				format={props.mode == 'date' ? 'DD/MM/YYYY' : 'hh:mm'}
				// iconSource={require('../../../../assets/icons/ic_calendar.png')}
				// minDate={format(new Date(), `${props.mode == 'date' ? 'dd/MM/yyyy' : 'hh:mm'}`)}
				maxDate={selectedToDate}
				showIcon={false}
				confirmBtnText="Confirm"
				cancelBtnText="Cancel"
				customStyles={{
					// dateIcon: {
					//   position: 'absolute',
					//   left: -15,
					//   top: -15,
					//   marginLeft: 5,
					//   height: 48, width: 56,

					// },
					dateInput: {
						borderWidth: 1
					},
					dateText: {
						fontWeight: 'bold',
						color: 'black'
					}
					// ... You can check the source to find the other keys.
				}}
				onDateChange={(date, dateobj) => {
					console.log('ondate_change', date, { dateobj });
					setSelectedFromDate(date);
					props.onDateChange(date, selectedToDate);
				}}
			/>}
			</View>
			<View style={{ flexDirection: 'row',flex:1, alignItems: 'center', marginStart: 8 ,backgroundColor:'#000'}}>
				<CmmsText style={{ fontWeight: 'bold', marginHorizontal: 8 }}>{AppTextData.txt_To} </CmmsText>
				<DatePicker
					style={{ flex: 1 }}
					date={selectedToDate}
					mode={props.mode}
					placeholder="select date"
					format={props.mode == 'date' ? 'DD/MM/YYYY' : 'hh:mm'}
					// iconSource={require('../../../../assets/icons/ic_calendar.png')}
					minDate={selectedFromDate}
					// maxDate="2016-06-01"
					showIcon={false}
					confirmBtnText="Confirm"
					cancelBtnText="Cancel"
					customStyles={{
						// dateIcon: {
						//   position: 'absolute',
						//   left: -15,
						//   top: -15,
						//   marginLeft: 5,
						//   height: 48, width: 56,

						// },
						dateInput: {
							padding: 0,
							margin: 0,
							borderWidth: 1
						},

						dateText: {
							fontWeight: 'bold',
							color: 'black',
							padding: 0,
							margin: 0
						}
						// ... You can check the source to find the other keys.
					}}
					onDateChange={(date, dateobj) => {
						console.log('ondate_change', date, { dateobj });
						setSelectedToDate(date);
						props.onDateChange(selectedFromDate, date);
					}}
				/>
			</View>
		</View>
	);
};
FromToDatePicker.defaultProps = {
	hasFromTxt: true,
	mode: 'date',
	fromDate: new Date(),
	toDate: new Date()
};
