import React from 'react';
import {View,Text} from 'react-native';
import ButtonQtyModify from './ButtonQtyModify';

export default ButtonQtyModifyWithLabel=({...props})=>{
    return(<View
    style={[{flexDirection:'row',flex:1,justifyContent:'space-between',marginBottom:8,alignItems:'center'},props.style]}
    >
        <Text
        style={{marginHorizontal:8,fontWeight:'900',fontSize:14,flex:1}}
        >{props.label}</Text>
        <ButtonQtyModify 
        Qty={props.Qty} 
        isNormal={props.isNormal}
        onIncrease={props.onIncrease}
        onReduce={props.onReduce}/>

    </View>)
}