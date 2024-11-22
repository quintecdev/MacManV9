import React, {memo} from 'react';
import {Text, View} from 'react-native';
import {CmmsText} from '../../../common/components/CmmsText';
// import { getAssetLabel } from './JobOrderReport';
import CustomerDetailsTexts from './CustomerDetailsTexts';
import CmmsColors from '../../../common/CmmsColors';
import {useSelector, useDispatch} from 'react-redux';
function JobOrderHeader({
  styles,
  JONo,
  Date,
  AssetSate,
  ComplaintType,
  Customer,
  Asset,
}) {
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  return (
    // <View>
    // <Text>Jiju</Text>
    // <CmmsText style={styles.MainHead}>JoNo : {JONo} - {format(new Date(Date), 'dd/MM/yyyy')}</CmmsText>
    // </View>
    <View>
      <CmmsText style={styles.MainHead}>
        {AppTextData.txt_JoNo}
         : {JONo} - {Date}
      </CmmsText>
      {/* <CmmsText style={styles.MainHead}>Jo Type : {ComplaintType}<CmmsText style={{...styles.MainHead,color:AssetSate!=3?"black":CmmsColors.darkRed}}>{getAssetLabel(AssetSate)}</CmmsText></CmmsText> */}
      {/* {AppTextData.txt_JoNo}  */}

      {Customer && (
        <CustomerDetailsTexts Customer={Customer} styles={styles.SubHead} />
      )}
      <CmmsText style={{color: 'black', textAlign: 'center'}}>
        {AppTextData.txt_Asset}: {Asset}
      </CmmsText>
    </View>
  );
}

export default memo(JobOrderHeader);
