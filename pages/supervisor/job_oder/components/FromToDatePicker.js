import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { parse, format } from 'date-fns';
import { useSelector } from 'react-redux';
import { CmmsText } from '../../../../common/components/CmmsText';

const formatStr = (mode) => (mode === 'date' ? 'dd/MM/yyyy' : 'HH:mm');
const parseDate = (str, mode) => {
	try {
		return parse(str, formatStr(mode), new Date());
	} catch {
		return new Date();
	}
};

export default FromToDatePicker = ({ ...props }) => {
	const { AppTextData } = useSelector((state) => state.AppTextViewReducer);

	const [selectedFromDate, setSelectedFromDate] = useState(
		format(props.fromDate, formatStr(props.mode))
	);
	const [selectedToDate, setSelectedToDate] = useState(
		format(props.toDate, formatStr(props.mode))
	);
	const [showFromPicker, setShowFromPicker] = useState(false);
	const [showToPicker, setShowToPicker] = useState(false);

	useEffect(() => {
		setSelectedFromDate(format(props.fromDate, formatStr(props.mode)));
		setSelectedToDate(format(props.toDate, formatStr(props.mode)));
	}, [props]);

	const handleFromConfirm = (date) => {
		setShowFromPicker(false);
		const formatted = format(date, formatStr(props.mode));
		setSelectedFromDate(formatted);
		props.onDateChange(formatted, selectedToDate);
	};

	const handleToConfirm = (date) => {
		setShowToPicker(false);
		const formatted = format(date, formatStr(props.mode));
		setSelectedToDate(formatted);
		props.onDateChange(selectedFromDate, formatted);
	};

	return (
		<View style={{ ...{ flexDirection: 'row', flex: 1, alignItems: 'center' }, ...props.style }}>
			<View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
				{props.hasFromTxt && <CmmsText style={{ fontWeight: 'bold' }}>{AppTextData.txt_From} </CmmsText>}
				<TouchableOpacity
					onPress={() => setShowFromPicker(true)}
					style={{
						flex: 1,
						borderWidth: 0.5,
						borderColor: '#777',
						borderRadius: 10,
						elevation: 10,
						backgroundColor: '#fff',
						paddingVertical: 8,
						alignItems: 'center',
					}}
				>
					<CmmsText style={{ fontWeight: 'bold', color: 'black' }}>{selectedFromDate}</CmmsText>
				</TouchableOpacity>
				<DateTimePickerModal
					isVisible={showFromPicker}
					mode={props.mode}
					date={parseDate(selectedFromDate, props.mode)}
					minimumDate={props.isAssignDate ? new Date() : undefined}
					maximumDate={parseDate(selectedToDate, props.mode)}
					onConfirm={handleFromConfirm}
					onCancel={() => setShowFromPicker(false)}
				/>
			</View>
			<View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', marginStart: 8 }}>
				<CmmsText style={{ fontWeight: 'bold', marginHorizontal: 8 }}>{AppTextData.txt_To} </CmmsText>
				<TouchableOpacity
					onPress={() => setShowToPicker(true)}
					style={{
						flex: 1,
						borderWidth: 0.5,
						borderColor: '#777',
						borderRadius: 10,
						elevation: 10,
						backgroundColor: '#fff',
						paddingVertical: 8,
						alignItems: 'center',
						marginRight: 10,
					}}
				>
					<CmmsText style={{ fontWeight: 'bold', color: 'black' }}>{selectedToDate}</CmmsText>
				</TouchableOpacity>
				<DateTimePickerModal
					isVisible={showToPicker}
					mode={props.mode}
					date={parseDate(selectedToDate, props.mode)}
					minimumDate={parseDate(selectedFromDate, props.mode)}
					onConfirm={handleToConfirm}
					onCancel={() => setShowToPicker(false)}
				/>
			</View>
		</View>
	);
};
FromToDatePicker.defaultProps = {
	hasFromTxt: true,
	mode: 'date',
	fromDate: new Date(),
	toDate: new Date(),
};
