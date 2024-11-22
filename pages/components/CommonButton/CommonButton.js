import React from 'react';
import {TouchableWithoutFeedback, Text,View} from 'react-native';

export default CommonButton = (props) => {
  return (
    <TouchableWithoutFeedback onPress={props.onPress}>
      <View
        style={[
          props.style,
          {
            elevation: 15,
            alignSelf: 'center',
            width: props.width && props.width,
            height: props.height ? props.height : 30,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: props.backgroundColor
              ? props.backgroundColor
              : 'white',
            borderRadius: props.borderRadius ? props.borderRadius : 15,
            paddingHorizontal: 8,
          },
        ]}>
        <Text
          style={{
            color: props.color,
            fontWeight: props.fontWeight,
            fontSize: props.fontSize,
          }}>
          {props.title}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};
