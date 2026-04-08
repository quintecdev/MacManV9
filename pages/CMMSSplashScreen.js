import React, { useEffect } from 'react';
import {
  SafeAreaView,
  ImageBackground
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { actionSetLoginData } from '../action/ActionLogin';
import { actionSetVersion } from '../action/ActionVersion';
import requestWithEndUrl from '../network/request';
import { API_SUPERVISOR } from '../network/api_constants';
import ASK from '../constants/ASK';
import DeviceInfo from 'react-native-device-info';
import {
	Text,
	View,
} from 'react-native';


export default ({ navigation }) => {
  const dispatch = useDispatch();
  const { appVersion } = useSelector((state) => state.VersionReducer);
  const { AppTextData, selectedLng } = useSelector(
    (state) => state.AppTextViewReducer,
  );

  useEffect(() => {
    setTimeout(() => {
      CheckingAppVersion();
      // moveToNextScreen();
    }, 900);
  }, []);

  async function CheckingAppVersion() {
    try {
      const data = await requestWithEndUrl(`${API_SUPERVISOR}GetApkVersion`)
        .then((res) => {
          // console.log('GetApkVersion', { res });
          if (res.status != 200) {
            throw Error(res.statusText);
          }
          return res.data;
        });

      // console.log('current app version from package=>', Object.keys(data).length);
      if (data != null
        && Object.keys(data).length > 0
      ) {
        dispatch(actionSetVersion(data.ApkVersion));
        if (DeviceInfo.getVersion() != data.ApkVersion) {
          navigation.replace('VersionCheck', { error: false });
        } else {
          AsyncStorage.getItem(ASK.ASK_USER).then((res) => {
            // console.log({ res });
            if (res != null) {
              const loggedUser = JSON.parse(res);
              dispatch(actionSetLoginData(loggedUser));
              // console.log('user login data from splashscreen>>>', loggedUser); //vbn
              navigation.replace(
                `${loggedUser.UserType == 1 ? 'TechHome' : 'SupHome'}`,
              );
            } else {
              navigation.replace('Login');
            }
          });
        }
      } else {
        // console.log('current app version from package=>>', 'data is null or empty');
        navigation.replace('VersionCheck', { error: true });
      }
    }
    catch (err) {
      navigation.replace('Login');
      console.error('URL_GetApkVersion', { err });
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
             
      <ImageBackground
        style={{
          flex: 1,
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          resizeMode: 'cover',
          // justifyContent: 'center',
        }}
        source={require('../assets/bg/splash-screen-final.webp')}
      >
    </ImageBackground>
    </SafeAreaView>
  );
};
