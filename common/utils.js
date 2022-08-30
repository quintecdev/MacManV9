import React from 'react';
import {Alert} from 'react-native';
import { useHeaderHeight } from '@react-navigation/stack';

export const  timeMinToTimeFormat=(timeInMins)=> `${Math.floor(timeInMins/60).toString().padStart(2, '0')}:${Math.floor(timeInMins%60).toString().padStart(2, '0')}`
// export const 

 /**
     * 
     * @param {title of the alert} title 
     * @param {message of the alert} message 
     * @param {callback with what(-1 - no, 1 - ok, 0 - dismiss)} callBack 
     * @returns true
     */
  export const showAlert = (title,message,callBack) =>{
    Alert.alert(
      title,
      message,
      [
        {
          text: "No",
          onPress: ()=>callBack(-1),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: ()=>callBack(1),
          style: "cancel",
        },
      ],
      {
        cancelable: true,
        onDismiss:()=>callBack(0)
          
      }
    );
    return true
  }

  export const withHeight = (Component) => { 

    const height = useHeaderHeight();
    
    return (<Component height={height} />)
    
    }