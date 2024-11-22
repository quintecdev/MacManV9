import {
  View,
  Text,
  Modal,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import React from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
const QrCodeScanner = ({visible, reactivate, Close, children, QrCodeData}) => {
  const height = Dimensions.get('window').height;
  const width = Dimensions.get('window').width;

  const qrcodefunction = (e) => {
    // alert('qrcode Details' + e?.data);
    console.log('qrcode event----->>>...', e?.data);
    QrCodeData(e);
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
          }}>
          <QRCodeScanner
            onRead={(e) => {
              qrcodefunction(e);
            }}
            reactivate={reactivate}
            // flashMode={RNCamera.Constants.FlashMode.torch}
            topContent={
              <>
                <Text style={{}}>Please Hold your Camera to Scan QR Code</Text>
              </>
            }
            bottomContent={
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  onPress={Close && Close}
                  style={{
                    padding: 8,
                    color: 'black',
                    fontSize: 18,
                    borderColor: 'black',
                    borderRadius: 12,
                    borderWidth: 1.5,
                  }}>
                  <Text style={{color: 'black', fontSize: 20}}>Close</Text>
                </TouchableOpacity>
              </View>
            }
          />
          {children}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default QrCodeScanner;
