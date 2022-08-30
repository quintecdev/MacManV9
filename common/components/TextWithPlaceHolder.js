import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import CmmsColors from '../CmmsColors';
import { CmmsText } from './CmmsText';
export default ({placeholder='Ref.No',mainText='325' }) => {

return (
<View
style={{ flex: 1, justifyContent: 'center',height:50, alignItems: 'center',borderWidth:1,borderColor:CmmsColors.blueBayoux }}>
    <CmmsText>{placeholder}</CmmsText>
    <CmmsText>{mainText}</CmmsText>
</View>
);
}