import {View, Modal} from 'react-native';
import React, {useEffect} from 'react';

const PopUp = ({
  visible,
  children,
  height,
  width,
  paddingHorizontal,
  paddingVertical,
}) => {
  useEffect(() => {
    console.log('props visible value==>>', visible);
  }, [visible]);
  return (
    <View>
      <Modal
        transparent={true}
        visible={visible}
        animationType="fade"
        useNativeDriver={true}>
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}>
          <View
            style={{
              width: width ? width : '85%',
              backgroundColor: 'white',
              paddingHorizontal: paddingHorizontal ? paddingHorizontal : 8,
              paddingVertical: paddingVertical ? paddingVertical : 10,
              borderRadius: 8,
              borderColor: 'rgba(0, 0, 0, 0.1)',
              minHeight: 100,
              height: height && height,
            }}>
            {children}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PopUp;
