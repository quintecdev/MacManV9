import React, { memo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Image
} from 'react-native';
import CmmsColors from '../../../common/CmmsColors';

import { formatTime } from '../utils';

const Timer = (props)=>{
    return(
        <View
        style={{borderWidth:1,alignSelf:'center',paddingHorizontal:8,marginTop:8,borderColor:CmmsColors.lightGray}}
        
        >
            <Text>{formatTime(props.timer)}</Text>
           
        </View>
    )
}

export default memo(Timer)