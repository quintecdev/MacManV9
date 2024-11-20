import React from 'react';
import {TouchableWithoutFeedback, Text, Animated} from 'react-native';

export default AnimatedButton = (props) => {
  const animatedButtonScale = new Animated.Value(1);
  const animatedScaleStyle = {
    transform: [{scale: animatedButtonScale}],
  };
  const onPressIn = () => {
    Animated.spring(animatedButtonScale, {
      toValue: props.AnimationIn ? props.AnimationIn : 0.6,
      useNativeDriver: true,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(animatedButtonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPress={props.onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}>
      <Animated.View
        style={[
          animatedScaleStyle,
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
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
