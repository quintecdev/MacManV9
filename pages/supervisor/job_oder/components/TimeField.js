import React,{useEffect, useState} from 'react';
import {View,Text,TextInput} from 'react-native'
import { getHours } from '../../../Technician/utils';

export default ({...props})=>{
  console.log("TimeField",{props})
    const [Ehrs,setEhrs] = useState(props.Ehrs)
    
    var m = Ehrs % 60;
    var h = Math.floor(Ehrs / 60)
   
    useEffect(()=>{
      setEhrs(props.Ehrs)
    },[Ehrs!=props.Ehrs])
    console.log("TimeField",{m,h})
    return(<View
        style={{flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:'green',height:30,padding:4}}
        >
          
        <TextInput
        style={{padding:0,marginEnd:2,textAlign:'center'}}
        maxLength={4}
        selectTextOnFocus
        value={`${h.toString().padStart(2, '0')}`}
        keyboardType='numeric'
        onChangeText={(text)=>{
          const edtHr = Number(text)
         if(/^\d+$/.test(edtHr)){
          // let extMinute = Ehrs.split(':')[1]
          // let newTime = `${text}:${extMinute}`
          setEhrs(edtHr*60+Number(m))
          props.onChangeTime(edtHr*60+Number(m))

         }
          // setHour(/^\d+$/.test(text) ? text:'')
        }}
        />
        <Text>:</Text>
        <TextInput
        style={{padding:0,marginStart:2,textAlign:'center'}}
        maxLength={4}
        selectTextOnFocus
        keyboardType='numeric'
        value={`${m.toString().padStart(2, '0')}`}
        onChangeText={(text)=>{
          const edtMin = Number(text)
          if(/^\d+$/.test(edtMin) && edtMin<60){
            // console.log({Ehrs})
            // let extHrs = Ehrs.split(':')[0]
            // let newTime = `${extHrs}:${text}`
            setEhrs(Number(h)*60+edtMin)
            props.onChangeTime(Number(h)*60+edtMin)
           }
         
        }}
        />
        </View>)


}