import React from 'react';
import { Text, View } from 'react-native';
import CmmsColors from '../../common/CmmsColors';
export default (StatusLabelView = ({ ...props }) => {
  const { jobOrderList } = props;
  return (
    <View
      style={{
        flexDirection: 'row',
        marginTop: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        marginBottom: 8
      }}
    >
      <Text
        style={{
          paddingVertical: 4,
          marginHorizontal: 4,
          textAlign: 'center',
          borderRadius: 15,
          color: 'white',
          fontWeight: '900',
          fontFamily: 'sans-serif-condensed',
          width: 75,
          height: 30,
          backgroundColor: CmmsColors.joPending
        }}
      >
        {jobOrderList.filter((job) => job.Status == 0).length}
      </Text>

      <Text
        style={{
          marginHorizontal: 4,
          paddingVertical: 4,
          textAlign: 'center',
          borderRadius: 15,
          color: 'white',
          fontWeight: '900',
          fontFamily: 'sans-serif-condensed',
          width: 75,
          backgroundColor: CmmsColors.joWip
        }}
      >
        {jobOrderList.filter((job) => job.Status == 2).length}
      </Text>

      <Text
        style={{
          paddingVertical: 4,
          marginHorizontal: 4,
          borderRadius: 15,
          textAlign: 'center',
          color: 'white',
          fontWeight: '900',
          fontFamily: 'sans-serif-condensed',
          width: 75,
          height: 30,
          backgroundColor: CmmsColors.joDone
        }}
      >
        {jobOrderList.filter((job) => job.Status == 1).length}
      </Text>
    </View>
  );
});
