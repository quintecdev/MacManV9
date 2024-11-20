import React from 'react';
import { TouchableOpacity, Image, Text, Alert } from 'react-native';
import { API_IMAGEPATH } from '../../../network/api_constants';
import CmmsColors from '../../../common/CmmsColors';
import Icon from 'react-native-vector-icons/FontAwesome';
const EmployeeList = ({
  item,
  index,
  borderColor,
  onPress,
}) => {
  // Function to get background color based on DayStatus
  const getDayStatBg = (DayStatus) => {
    switch (DayStatus) {
      case 0:
        return CmmsColors.darkRed;
      case 1:
        return CmmsColors.joGreenAlpha;
      case 2:
        return CmmsColors.joYellowAlpha;
      default:
        return 'transparent';
    }
  };

  return (
    <TouchableOpacity
      id={index}
      style={{
        width: 66,
        borderWidth: 1,
        height: 90,
        borderColor:borderColor,
        marginHorizontal: 2,
        padding: 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={()=>{onPress}} // Call onPress function from props
    >
      <Image
        style={{ width: 48, height: 40 }}
        source={{ uri: `${API_IMAGEPATH}${item.ImageURl}` }}
        resizeMode={'center'}
      />
      <Text numberOfLines={1} style={{ textAlign: 'center', fontSize: 10 }}>
        {item.Code}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          width: '100%',
          marginTop: 2,
          paddingHorizontal: 4,
          textAlign: 'center',
          backgroundColor: 'white',
          fontSize: 8,
          color: item.SEStatus === 1 ? 'green' : CmmsColors.darkRed,
        }}
      >
        <Icon
          name="circle"
          size={12}
          color={item.SEStatus === 1 ? 'green' : CmmsColors.darkRed}
        />
        {` ${item.WorkTime}`}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          width: '100%',
          marginTop: 2,
          textAlign: 'center',
          fontSize: 8,
          paddingHorizontal: 4,
          backgroundColor: getDayStatBg(item.DayStatus), // Use getDayStatBg function here
        }}
      >
        {item.DayStatus !== 1
          ? `${item.NoOfJO}/${item.TotalAssignedHrs} - ${item.CurrentJONO}`
          : ''}
      </Text>
    </TouchableOpacity>
  );
};

export default EmployeeList;
