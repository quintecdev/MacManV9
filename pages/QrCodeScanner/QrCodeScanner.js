import {
  View,
  Text,
  Modal,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import React, {useRef} from 'react';
import {Camera} from 'react-native-camera-kit';

const QrCodeScanner = ({visible, reactivate, Close, children, QrCodeData}) => {
  const height = Dimensions.get('window').height;
  const width = Dimensions.get('window').width;
  const lastScanned = useRef(null);

  const qrcodefunction = (event) => {
    const codeValue = event?.nativeEvent?.codeStringValue;
    if (!codeValue) return;
    // Prevent duplicate rapid scans unless reactivate is enabled
    if (!reactivate && lastScanned.current === codeValue) return;
    lastScanned.current = codeValue;
    console.log('qrcode event----->>>...', codeValue);
    // Normalize to same shape as old react-native-qrcode-scanner
    QrCodeData({data: codeValue});
  };

  return (
    <Modal
      animationType="fade"
      visible={visible}
      transparent={true}
      avoidKeyboard
      coverScreen={true}>
      <SafeAreaView
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
        }}>
        <View
          style={{
            backgroundColor: 'white',
            height: height,
            width: width,
            borderWidth: 2,
            borderColor: 'silver',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
          <Text style={{textAlign: 'center', padding: 12}}>
            Please Hold your Camera to Scan QR Code
          </Text>
          <View style={{flex: 1}}>
            <Camera
              style={{flex: 1}}
              scanBarcode={true}
              onReadCode={qrcodefunction}
              showFrame={true}
              frameColor="green"
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingVertical: 12,
            }}>
            <TouchableOpacity
              onPress={Close && Close}
              style={{
                padding: 8,
                borderColor: 'black',
                borderRadius: 12,
                borderWidth: 1.5,
              }}>
              <Text style={{color: 'black', fontSize: 20}}>Close</Text>
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default QrCodeScanner;
