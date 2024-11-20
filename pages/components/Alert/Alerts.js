import {View, Text, Modal, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
const Alerts = ({visible, onNo, onOk, onYes, title, body, type}) => {
  const [modal, setModal] = useState(false);
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  useEffect(() => {
    console.log('props visible value==>>', visible);
  }, [visible]);
  return (
    <View>
      <Modal
        transparent={true}
        visible={visible}
        // animationIn="slideInLeft"
        // animationOut="slideOutRight"
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
              width: '85%',
              backgroundColor: 'white',
              paddingHorizontal: 8,
              paddingVertical: 10,
              borderRadius: 8,
              borderColor: 'rgba(0, 0, 0, 0.1)',
              minHeight: 100,
            }}>
            <View style={{paddingVertical: 2}}>
              {/* title */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: 'green',
                  paddingLeft: 5,
                }}>
                {title}
              </Text>
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 20,
              }}>
              {/* body */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: 'black',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}>
                {body}
              </Text>
            </View>

            <View style={{}}>
              {type == 'ok' ? (
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: 'silver',
                    paddingVertical: 8,
                    borderRadius: 8,
                    marginLeft: 1,
                    width: '20%',
                    justifyContent: 'center',
                    alignSelf: 'center',
                  }}
                  onPress={onOk}>
                  <Text style={{alignSelf: 'center', color: 'black'}}>
                    {AppTextData.txt_OK}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: '20%',
                      borderWidth: 1,
                      borderColor: 'silver',
                      paddingVertical: 10,
                      borderRadius: 8,
                      marginRight: 1,
                    }}
                    onPress={onYes}>
                    <Text style={{fontWeight: 'bold'}}>
                      {AppTextData.txt_Yes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: '20%',
                      borderWidth: 1,
                      borderColor: 'silver',
                      paddingVertical: 10,
                      borderRadius: 8,
                      marginLeft: 1,
                    }}
                    onPress={onNo}>
                    <Text style={{fontWeight: 'bold'}}>
                      {AppTextData.txt_No}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Alerts;
