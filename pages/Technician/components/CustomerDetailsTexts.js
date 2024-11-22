import React from 'react';
import { memo } from "react";
import { View } from 'react-native';
import { CmmsText } from '../../../common/components/CmmsText';
const CustomerDetailsTexts = ({Customer,styles}) => <View style={{flexDirection:'column',alignItems:'center',}}>
{Object.keys(Customer)
.map((key,index)=>{
    if(Customer[key]) {
        return (<View style={{flexDirection:'row',}}>
            <CmmsText style={{color:'black',textAlign:'left',}}>{key != 'ContactNumber' ? key:'Cont.Person/No'}</CmmsText>
            {/* <CmmsText style={{fontColor:'black',}}> : </CmmsText> */}
            <CmmsText style={{color:'black',textAlign:'left',}}>{` : ${Customer[key]}`}</CmmsText>
            </View>)
    }
    })}
</View>
export default memo(CustomerDetailsTexts)