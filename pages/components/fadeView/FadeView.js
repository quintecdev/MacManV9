import React, {useState, useEffect} from 'react';
import {Animated} from 'react-native';

const FadeView = (props) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        ...props.style,
        opacity: fadeAnim,
        transform: [
          {
            translateX: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-3, 0],
            }),
          },
        ],
      }}>
      {props.children}
    </Animated.View>
  );
};

export default FadeView;
