import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  Image,
  Dimensions,
} from 'react-native';
import React from 'react';
import {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {actionSetLoginData} from '../../action/ActionLogin';
import ASK from '../../constants/ASK';
import {actionSetEmergencyJoblistNotificationCount} from '../../action/ActionCurrentPage';
import { removeValueFromStorage } from '../../common/AsyncStorage';

const VersionCheck = ({route: {params}}) => {
  const deviceHeight = Dimensions.get('screen').height;
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const {appVersion} = useSelector((state) => state.VersionReducer);
  console.log('app version from redux==>>', appVersion);
console.log('params is here->>>>',params.error)
  const dispatch = useDispatch();
  useEffect(() => {
    removeValueFromStorage(ASK.ASK_USER)
    removeValueFromStorage(ASK.ASK_NOTIFICATION_TIMER)
    // AsyncStorage.removeItem(ASK.ASK_USER);
    // AsyncStorage.removeItem(ASK.ASK_NOTIFICATION_TIMER);
    dispatch(actionSetLoginData({}));
    dispatch(actionSetEmergencyJoblistNotificationCount(0));
  }, []);
  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: 'white', paddingHorizontal: 5}}>
      <View
        style={{
          backgroundColor: 'white',
          justifyContent: 'center',
          alignItems: 'center',
          height: deviceHeight / 2,
        }}>
        <Image
          style={{
            width: '100%',
            resizeMode: 'stretch',
          }}
          source={require('../../assets/icons/macmanIcon.png')}
        />
      </View>
      <View style={{paddingBottom: 40}}>
        <Text
          style={{
            fontSize: 26,
            alignSelf: 'center',
            color: 'green',
            fontWeight: 'bold',
          }}>
         {params.error==true?AppTextData.no_server_connection: AppTextData.txt_Update_Available}
        </Text>
        <Text style={{alignSelf: 'center', color: 'silver'}}>
        {params.error==true ?'':`Mac-Man (${appVersion})`}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 20,
          textAlign: 'center',
          paddingHorizontal: 5,
          lineHeight: 28,
        }}>
        {params.error==true ? AppTextData.cannot_connect_to_the_server:
        `${AppTextData.txt_New_Version_is_available_upgrade_to_the_latest_version}`}
      </Text>
    </SafeAreaView>
  );
};

export default VersionCheck;
