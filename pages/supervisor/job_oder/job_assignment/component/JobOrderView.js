import React from 'react';
import {Text, View} from 'react-native';
import {SvgCss, SvgFromXml, SvgXml} from 'react-native-svg';
import Icon from 'react-native-vector-icons/FontAwesome';
import CmmsColors from '../../../../../common/CmmsColors';
import {CmmsText, CTextThin} from '../../../../../common/components/CmmsText';
import {svgXmlTech} from '../../../../../common/SvgIcons';

export function statusDetails(status) {
  switch (status) {
    case 0:
      return {
        status: 'Pending',
        color: CmmsColors.joPending,
      };
    case 1:
      return {status: 'Closed', color: CmmsColors.joDone};
    case 2:
      return {status: 'WIP', color: CmmsColors.joWip};
    case 3:
      return {status: 'Hold', color: CmmsColors.darkRed};
    case 4:
      return {status: 'Cancelled', color: CmmsColors.joPending};
    default:
      return null;
  }
}
/**
 * fromAssginment page
 */
export default JobOrderView = (props) => {
  const {
    item,
    IsAssignChecked,
    isSelectionMode,
    selectedJoIds,
    notAssignChecked,
  } = props;
  // console.log('notAssignChecked===>>', notAssignChecked);
  // const{item} = props

  // console.log('JobOrderViewAssign', {props});
  // console.log(
  //   '>>>>',
  //   selectedJoIds.findIndex(
  //     (selectedJoId) => selectedJoId.WorkID == item.WorkID,
  //   ) != -1,
  // );
  return (
    <View
      style={{
        backgroundColor: !notAssignChecked
          ? statusDetails(0).color
          : statusDetails(item.AllotmentStatus).color,
        borderRadius: 10,
        // minHeight: 70,
        // marginStart: 25,
        // paddingStart: 20,
        padding: 8,
        justifyContent: 'center',
        // marginHorizontal: 8,
        // marginBottom: 8
      }}
      // onPress={() => {
      //   setSelectedJobId(item.JOID)
      // }}
    >
      <View
        style={{
          position: 'absolute',
          flexDirection: 'row',
          start: 8,
          bottom: 4,
          justifyContent: 'space-between',
        }}>
        <View>
          <SvgXml xml={svgXmlTech} width={20} height={20} />
          <CTextThin
            style={{
              position: 'absolute',
              end: -7,
              top: -8,
              paddingTop: 2,
              paddingBottom: 1,
              paddingEnd: 1,
              justifyContent: 'center',
              alignItems: 'center',
              color: CmmsColors.white,
              fontSize: 8,
              height: 16,
              width: 16,
              backgroundColor: CmmsColors.logoBottomGreen,
              textAlign: 'center',
              borderRadius: 8,
            }}>
            {Number(item.NOOfSE)}
          </CTextThin>
        </View>
        <CmmsText
          style={{
            fontSize: 12,
            color: 'white',
            fontWeight: 'bold',
            paddingVertical: 0,
            paddingHorizontal: 4,
            marginStart: 12,
          }}>
          <Icon name="clock-o" size={12} color="white" />{' '}
          {Math.floor(item?.EHours / 60)}h
        </CmmsText>
        <CmmsText
          style={{
            fontSize: 12,
            color: 'white',
            // fontWeight:'bold',
            // paddingTop:2,
            paddingHorizontal: 2,
            // marginStart:2,
            // borderWidth:1
          }}>
          ({item?.JONO})
        </CmmsText>
      </View>
      <Text
        numberOfLines={2}
        style={{
          fontWeight: '900',
          fontFamily: 'sans-serif-condensed',
          color: 'white',
          marginBottom: 4,
          marginEnd: props.isSelectionMode ? 15 : 5,
        }}>
        {`${item.Code}/${item.AssetName}/${item.MaintenanceJobType}/${item.Location}`.replace(
          /^\/+|\/+$/g,
          '',
        )}
      </Text>
      {isSelectionMode ? (
        <Icon
          style={{
            position: 'absolute',
            alignSelf: 'flex-end',
            end: 5,
            top: 4,
          }}
          name={
            selectedJoIds.findIndex(
              (selectedJoId) => selectedJoId.WorkID == item.WorkID,
            ) != -1
              ? 'check-square-o'
              : 'square-o'
          }
          size={22}
          color="white"
        />
      ) : null}
      {item.HoldReason && item.HoldReason != '' && (
        <Text
          numberOfLines={1}
          style={{
            fontSize: 10,
            // backgroundColor: 'white',
            alignSelf: 'center',
            borderRadius: 5,
            paddingHorizontal: 5,
            marginTop: 4,
            fontFamily: 'sans-serif-light',
            color: 'blue',
            fontWeight: '700',
            marginStart: 5,
          }}>
          {item.HoldReason}
        </Text>
      )}

      {/* </View> */}
      {item.Status != 3 && (
        <Text
          numberOfLines={1}
          style={{
            alignSelf: 'center',
            fontSize: 10,
            // backgroundColor: 'white',
            borderRadius: 5,
            paddingHorizontal: 5,
            marginTop: 5,
            marginBottom: 20,
            fontFamily: 'sans-serif-light',
            color: 'blue',
            fontWeight: '700',
            marginStart: 5,
          }}>
          {item.SRDetails}
        </Text>
      )}

      {IsAssignChecked && (
        <Text
          numberOfLines={1}
          style={{
            position: 'absolute',
            end: 4,
            bottom: 4,
            fontSize: 11,
            // backgroundColor: CmmsColors.colorWithAlpha('white',0.7),
            fontFamily: 'san-serif-thin',
            borderRadius: 5,
            paddingHorizontal: 5,
            color: 'blue',
            fontWeight: '100',
            marginStart: 5,
          }}>
          {statusDetails(item.Status).status}
        </Text>
      )}
    </View>
  );
};
