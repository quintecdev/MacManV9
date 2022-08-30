import React from 'react';
import { Text, View } from 'react-native';
import DatePicker from 'react-native-datepicker'
import CmmsColors from '../../common/CmmsColors';
import {CText, CTextTitle,CmmsTextStyles} from '../../common/components/CmmsText';

export default DatePickerCmms = ({...props})=>{
    return(
        <View
          style={{
            alignSelf: 'center',
            flexDirection: 'row',
                backgroundColor:CmmsColors.logoBottomGreen,
            borderRadius: 20,
            paddingHorizontal:8,
            justifyContent:'space-around',
            alignItems:'center'

          }}
        >
          <DatePicker
            date={props.selectedDate}
            mode="date"
            placeholder="select date"
            format="DD/MM/YYYY"
            iconSource={require('../../assets/icons/ic_calendar_fi_512_vi.png')}
            // minDate="2016-05-01"
            // maxDate="2016-06-01"
           
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            customStyles={{
              dateIcon: {
                position: 'absolute',
                left: -15,
                top: -20,
                marginLeft: 5,
                height: 46, width: 46,
                
              },
              dateInput: {
                marginLeft: 28,
                borderWidth: 0
              },
              dateText: CmmsTextStyles.textTitle
              // ... You can check the source to find the other keys.
            }}
            onDateChange={(date) => { props.onDateChange(date) }}
          />
          <CTextTitle
          >{props.text}
              {/* Todays Job Oders (6) (30 M Hrs) */}
          </CTextTitle>
        </View>
    )
}