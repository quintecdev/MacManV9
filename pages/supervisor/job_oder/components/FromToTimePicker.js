import React,{useState,useEffect} from 'react'
import {View,Text,TouchableOpacity, SafeAreaView} from 'react-native'
import { parse, format, toDate } from 'date-fns'
import DateTimePicker from '@react-native-community/datetimepicker';

export default FromToTimePicker = (props)=>{
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());


  const onChange = (event,selectedDate)=>{
    console.log("onChange",{event,selectedDate})

  }
    return(
        < >
         
      <View style={{...{marginHorizontal:8,flexDirection:'row',alignItems:'center'},...props.style}}>
      
      <View
        style={{flex:1,flexDirection:'row',alignItems:'center',}}
        >
        {props.hasFromTxt&&<Text
        style={{fontWeight:'bold',}}
        >From: </Text>}
        <DateTimePicker
          testID="dateTimePicker"
          value={fromDate}
          mode={props.mode}
          is24Hour={true}
          display="default"
          onChange={(e,date)=>{
              setToDate(date)
          }}
        />
        </View>
        <View
        style={{flex:1,flexDirection:'row',alignItems:'center',marginStart:8}}
        >
        <Text
        style={{fontWeight:'bold',}}
        >To: </Text>
          
          <DateTimePicker
          testID="dateTimePicker"
          value={toDate}
          mode={props.mode}
          is24Hour={true}
          display="default"
          onChange={(e,date)=>{
            setToDate(date)
          }}
        />
        </View>
        
      </View>
      </>
      
    )
}
FromToTimePicker.defaultProps = {
  hasFromTxt: true,
  mode:'datetime',
  fromDate:new Date(),
  toDate:new Date(),
  
}