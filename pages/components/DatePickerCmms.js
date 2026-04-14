import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CmmsColors from '../../common/CmmsColors';
import { CTextTitle, CmmsTextStyles } from '../../common/components/CmmsText';
import { format, parse } from 'date-fns';

export default DatePickerCmms = ({ ...props }) => {
    const [isPickerVisible, setPickerVisible] = useState(false);

    const handleConfirm = (date) => {
        setPickerVisible(false);
        const formatted = format(date, 'dd/MM/yyyy');
        props.onDateChange(formatted);
    };

    const getDateValue = () => {
        if (!props.selectedDate) return new Date();
        try {
            return parse(props.selectedDate, 'dd/MM/yyyy', new Date());
        } catch {
            return new Date();
        }
    };

    return (
        <View
            style={{
                alignSelf: 'center',
                flexDirection: 'row',
                backgroundColor: CmmsColors.logoBottomGreen,
                borderRadius: 20,
                paddingHorizontal: 8,
                justifyContent: 'space-around',
                alignItems: 'center',
            }}
        >
            <TouchableOpacity
                onPress={() => setPickerVisible(true)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
            >
                <CTextTitle style={CmmsTextStyles.textTitle}>
                    {props.selectedDate || 'Select date'}
                </CTextTitle>
            </TouchableOpacity>
            <CTextTitle>{props.text}</CTextTitle>
            <DateTimePickerModal
                isVisible={isPickerVisible}
                mode="date"
                date={getDateValue()}
                onConfirm={handleConfirm}
                onCancel={() => setPickerVisible(false)}
            />
        </View>
    );
};