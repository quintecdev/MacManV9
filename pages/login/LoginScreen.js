import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Dimensions,
  FlatList,
  Image,
  Alert,
  TouchableOpacity,
  TextInput,
  Button,
  ReactText,
  ImageBackground,
  processColor,
  KeyboardAvoidingView,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { CText, CTextHint } from '../../common/components/CmmsText';
import Icon from 'react-native-vector-icons/FontAwesome';
import CmmsColors from '../../common/CmmsColors';
import { API_TECHNICIAN } from '../../network/api_constants';
import requestWithEndUrl from '../../network/request';
import { useSelector, useDispatch } from 'react-redux';
import { actionSetLoading } from '../../action/ActionSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { actionSetSelectedLng } from '../../action/ActionAppText';
import { SvgXml } from 'react-native-svg';
import { actionSetLoginData } from '../../action/ActionLogin';
import { actionSetLoginStatus } from '../../action/ActionLogin';
import ASK from '../../constants/ASK';
import { Dialog } from 'react-native-simple-dialogs';
import DeviceInfo from 'react-native-device-info';
import { actionSetEmergencyJoblistNotificationCount, actionSetInternalWorkOrderJobNotificationCount } from '../../action/ActionCurrentPage';
import {
  actionSetAlertPopUp,
  actionSetAlertPopUpTwo,
} from '../../action/ActionAlertPopUp';
import { actionSetJobDate } from '../../action/ActionVersion';
// import { actionSetLoginData } from '../../action/ActionLogin';
import Alerts from '../components/Alert/Alerts';
import { Colors } from 'react-native/Libraries/NewAppScreen';
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
import AlertSound from '../utils/commonService/alertSound';
// console.log('Login',{screenWidth,screenHeight})

const xmlUserIcon = `<svg width="123pt" height="115pt" viewBox="0 0 123 115" version="1.1" xmlns="http://www.w3.org/2000/svg">
<g id="#ffffffff">
<path fill="#ffffff" opacity="1.00" d=" M 58.14 5.13 C 69.71 4.34 81.54 7.53 91.08 14.14 C 103.68 22.67 112.29 36.90 113.71 52.09 C 114.87 63.09 112.45 74.44 106.84 83.99 C 100.39 94.97 89.89 103.56 77.73 107.44 C 63.70 112.04 47.74 110.36 35.02 102.84 C 24.23 96.51 15.74 86.26 11.78 74.37 C 6.58 59.24 8.78 41.73 17.77 28.47 C 26.63 14.99 41.98 5.98 58.14 5.13 M 52.50 15.81 C 43.12 17.69 34.66 23.23 28.75 30.69 C 16.96 45.14 16.96 67.88 28.76 82.33 C 35.17 90.41 44.60 96.23 54.89 97.59 C 62.37 98.51 70.17 98.05 77.20 95.18 C 90.12 89.94 100.24 77.87 102.46 64.01 C 103.25 58.56 103.23 52.97 102.20 47.55 C 99.68 34.98 90.68 24.11 79.16 18.67 C 70.91 14.78 61.39 14.21 52.50 15.81 Z" />
<path fill="#ffffff" opacity="1.00" d=" M 35.56 30.56 C 42.47 24.21 51.65 20.27 61.07 20.06 C 70.79 20.03 80.33 24.02 87.46 30.57 C 94.67 38.46 98.89 49.38 97.72 60.12 C 96.96 68.46 92.86 75.99 87.75 82.45 C 86.63 74.26 81.59 66.86 74.66 62.46 C 73.14 61.78 72.12 63.39 70.95 64.06 C 64.71 68.81 55.15 67.81 49.76 62.19 C 48.62 60.61 46.94 62.09 45.82 62.82 C 39.84 66.79 35.37 72.97 33.71 79.97 C 28.41 73.97 25.64 65.97 25.10 58.05 C 24.70 47.96 28.78 37.95 35.56 30.56 M 56.61 32.77 C 49.48 34.97 44.83 42.78 46.25 50.10 C 47.34 58.35 55.99 64.40 64.13 62.75 C 72.36 61.63 78.40 52.99 76.75 44.87 C 75.56 35.75 65.21 29.69 56.61 32.77 Z" />
</g>
<g id="#3f983cff">
<path fill="#3f983c" opacity="1.00" d=" M 52.50 15.81 C 61.39 14.21 70.91 14.78 79.16 18.67 C 90.68 24.11 99.68 34.98 102.20 47.55 C 103.23 52.97 103.25 58.56 102.46 64.01 C 100.24 77.87 90.12 89.94 77.20 95.18 C 70.17 98.05 62.37 98.51 54.89 97.59 C 44.60 96.23 35.17 90.41 28.76 82.33 C 16.96 67.88 16.96 45.14 28.75 30.69 C 34.66 23.23 43.12 17.69 52.50 15.81 M 35.56 30.56 C 28.78 37.95 24.70 47.96 25.10 58.05 C 25.64 65.97 28.41 73.97 33.71 79.97 C 35.37 72.97 39.84 66.79 45.82 62.82 C 46.94 62.09 48.62 60.61 49.76 62.19 C 55.15 67.81 64.71 68.81 70.95 64.06 C 72.12 63.39 73.14 61.78 74.66 62.46 C 81.59 66.86 86.63 74.26 87.75 82.45 C 92.86 75.99 96.96 68.46 97.72 60.12 C 98.89 49.38 94.67 38.46 87.46 30.57 C 80.33 24.02 70.79 20.03 61.07 20.06 C 51.65 20.27 42.47 24.21 35.56 30.56 Z" />
<path fill="#3f983c" opacity="1.00" d=" M 56.61 32.77 C 65.21 29.69 75.56 35.75 76.75 44.87 C 78.40 52.99 72.36 61.63 64.13 62.75 C 55.99 64.40 47.34 58.35 46.25 50.10 C 44.83 42.78 49.48 34.97 56.61 32.77 Z" />
</g>
</svg>`;

const macmanIcon = `<svg width="420pt" height="780pt" viewBox="0 0 420 780" version="1.1" xmlns="http://www.w3.org/2000/svg">
<g id="#ffffffff">
<path fill="#ffffff" opacity="1.00" d=" M 0.00 0.00 L 420.00 0.00 L 420.00 150.01 C 401.01 136.47 376.98 132.14 354.05 132.95 C 324.28 134.05 295.15 142.22 267.83 153.79 C 248.87 162.57 228.82 169.01 208.23 172.66 C 155.01 181.98 100.23 176.54 48.01 163.99 C 31.80 159.95 15.64 155.51 0.00 149.58 L 0.00 0.00 Z" />
</g>
<g id="#5e9059ff">
<path fill="#5e9059" opacity="1.00" d=" M 267.83 153.79 C 295.15 142.22 324.28 134.05 354.05 132.95 C 376.98 132.14 401.01 136.47 420.00 150.01 L 420.00 780.00 L 0.00 780.00 L 0.00 149.58 C 15.64 155.51 31.80 159.95 48.01 163.99 C 100.23 176.54 155.01 181.98 208.23 172.66 C 228.82 169.01 248.87 162.57 267.83 153.79 Z" />
</g>
</svg>`;

const xmlLoginBgGreen = `<svg 
width="420pt" 
height="100pt" viewBox="0 0 420 500" version="1.1" xmlns="http://www.w3.org/2000/svg">
<g id="#ffffffff">
<path opacity="1.00" d=" M 0.00 0.00 L 420.00 0.00 L 420.00 21.04 C 419.38 20.97 418.13 20.83 417.51 20.76 C 405.49 12.00 390.81 7.75 376.23 5.62 C 370.77 4.20 365.05 5.62 359.58 4.34 C 353.41 5.66 346.99 4.11 340.84 5.63 C 327.86 6.90 315.15 10.08 302.49 13.20 C 288.39 17.74 274.37 22.61 260.94 28.89 C 252.29 32.38 243.63 36.07 234.53 38.20 C 233.17 38.65 231.82 39.13 230.49 39.63 C 228.15 40.11 225.84 40.70 223.52 41.23 C 211.42 44.42 198.94 46.12 186.54 47.31 C 181.13 48.77 175.44 47.20 170.04 48.76 C 159.72 49.29 149.36 48.85 139.03 48.99 C 135.29 49.27 131.74 47.73 128.01 47.95 C 124.01 48.14 120.00 48.04 116.10 47.07 C 109.35 47.09 102.71 45.82 96.02 44.99 C 76.63 42.48 57.55 38.10 38.53 33.63 C 37.20 33.17 35.87 32.69 34.56 32.20 C 32.19 31.70 29.85 31.12 27.49 30.59 C 25.24 29.69 22.91 29.00 20.51 28.59 C 13.76 25.89 6.38 24.65 0.00 21.14 L 0.00 0.00 Z" />
</g>
<g id="#5e9059ff">
<path fill="#5e9059" opacity="1.00" d=" M 340.84 5.63 C 346.99 4.11 353.41 5.66 359.58 4.34 C 365.05 5.62 370.77 4.20 376.23 5.62 C 390.81 7.75 405.49 12.00 417.51 20.76 C 418.13 20.83 419.38 20.97 420.00 21.04 L 420.00 650.00 L 0.00 650.00 L 0.00 21.14 C 6.38 24.65 13.76 25.89 20.51 28.59 C 22.91 29.00 25.24 29.69 27.49 30.59 C 29.85 31.12 32.19 31.70 34.56 32.20 C 35.87 32.69 37.20 33.17 38.53 33.63 C 57.55 38.10 76.63 42.48 96.02 44.99 C 102.71 45.82 109.35 47.09 116.10 47.07 C 120.00 48.04 124.01 48.14 128.01 47.95 C 131.74 47.73 135.29 49.27 139.03 48.99 C 149.36 48.85 159.72 49.29 170.04 48.76 C 175.44 47.20 181.13 48.77 186.54 47.31 C 198.94 46.12 211.42 44.42 223.52 41.23 C 225.84 40.70 228.15 40.11 230.49 39.63 C 231.82 39.13 233.17 38.65 234.53 38.20 C 243.63 36.07 252.29 32.38 260.94 28.89 C 274.37 22.61 288.39 17.74 302.49 13.20 C 315.15 10.08 327.86 6.90 340.84 5.63 Z" />
</g>
</svg>`;

export default LoginScreen = ({ navigation, route }) => {
  // global.roundedScreenHeight = Math.round(screenHeight)
  const [User, setUser] = useState('');
  const [Pass, setPass] = useState('')
  const [visibleLngDlg, setVisibleLngDlg] = useState(false);
  // const [selectedLng,setSelectedLng] = useState(params?.selectedLng)
  const [lngList, setLngList] = useState([]);
  const [Security, SetSecurity] = useState(true);
  // const [language, setLangauge] = useState({});

  const dispatch = useDispatch();
  const { AppTextData, selectedLng } = useSelector(
    (state) => state.AppTextViewReducer,
  );
  const { AlertPopUp, AlertPopUpTwo } = useSelector((state) => {
    return state.AlertPopUpReducer;
  });

  const { loginStatus } = useSelector((state) => state.LoginReducer);
  console.log('login status===>>', loginStatus);
  const AppVersion = DeviceInfo.getVersion();
  const pwdIpRef = useRef(null);
  useEffect(() => {
    AsyncStorage.removeItem(ASK.ASK_USER);
    AsyncStorage.removeItem(ASK.ASK_NOTIFICATION_TIMER);
    dispatch(actionSetLoginData({}));
    dispatch(actionSetEmergencyJoblistNotificationCount(0));
    dispatch(actionSetLoginStatus(false));
    dispatch(
      actionSetInternalWorkOrderJobNotificationCount(
        0
      ),
    );
    AlertSound.AlertSound.stop();
    AlertSound.AlertSoundFirst.stop();
  }, []);

  useEffect(() => {
    dispatch(actionSetLoading(false));
    requestWithEndUrl(`${API_TECHNICIAN}GetLanguage`)
      .then((res) => {
        // console.log({ res })
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        // console.log({selectedLng})

        if (selectedLng.Languagevalue == '') {
          console.log('hiii im', data[0]?.Language)
          dispatch(actionSetSelectedLng(data[0])); //commented by vbn
          //lang vbn
          AsyncStorage.setItem(
            ASK.ASK_LANGUAGE,
            JSON.stringify({
              Language: data[0]?.Language,
              Languagevalue: data[0]?.Languagevalue,
            }),
          );
        }

        //
        const lselectedLng = data.find(
          (item) => selectedLng.Languagevalue === item.Languagevalue,
        );
        // const lselectedLng = data[indx!=-1?indx:0]
        // lselectedLng.selected = true
        setLngList(data);
        selectedLng.Languagevalue != lselectedLng.Languagevalue &&
          dispatch(actionSetSelectedLng(lselectedLng));
        // setSelectedLng(lselectedLng)
      })
      .catch((err) => {
        console.error(err);
      });
  }, [selectedLng]);
  // useEffect(() => {
  //   AsyncStorage.getItem(ASK.ASK_LANGUAGE).then((res) => {
  //     console.log('Language Details RESPONSE===>>>', {res});
  //     if (res != null) {
  //       const SelectedLanguage = JSON.parse(res);
  //       console.log(
  //         'Language Details from the AsyncStorage FROM LOGIN SCREEN>>>',
  //         SelectedLanguage.Language,
  //       );
  //       dispatch(actionSetSelectedLng(SelectedLanguage));
  //     } else {
  //       AsyncStorage.setItem(
  //         ASK.ASK_LANGUAGE,
  //         JSON.stringify({
  //           Language: selectedLng.Language,
  //           Languagevalue: selectedLng.Languagevalue,
  //         }),
  //       );
  //     }
  //   });
  // }, []);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
        {/* <SvgXml 
                style={{position:'absolute'}}
                  xml={
                    xmlLoginBgGreen
                  } 
                  width='100%'
                  height='100%'
                //   width={Math.round(screenWidth)}
                //   height={Math.round(screenHeight-130) }
                  />  */}

        {/* <View
            style={{flex:1,
            height:roundedScreenHeight,borderWidth:5,borderColor:'red',marginTop:5}}
            >

            </View>

             */}

        <ImageBackground
          style={{
            flex: 1,
            position: 'absolute',
            width: '100%',
            height: '100%',

            // justifyContent: 'center',
          }}
          resizeMode="stretch"
          source={require('../../assets/bg/bg_cmms_login.webp')}
        />
        <Alerts
          title={AlertPopUpTwo?.title}
          body={AlertPopUpTwo?.body}
          visible={AlertPopUpTwo?.visible}
          onOk={() => {
            dispatch(actionSetAlertPopUpTwo({ visible: false })),
              console.log('current value==>>', AlertPopUpTwo);
          }}
          type={AlertPopUpTwo.type}
        />

        <View style={{ flex: 1 }}>
          {/* height={Math.round(screenWidth)>450?Math.round(screenHeight):700} /> */}

          <SvgXml
            style={{
              position: 'absolute',
              top: '15%', //80,
              //  marginTop:'37%',
              start: '17%',
              //  borderWidth:1
              //   alignSelf:'center',
              //   marginBottom:170
              // position:'absolute',
              // top:100,
              // start:80,
            }}
            xml={xmlUserIcon}
            width={96}
            height={96}
          />

          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              marginHorizontal: 20,
              marginTop: '37%',
              padding: 8,
              marginBottom: 8,
              //  borderWidth:1
            }}>
            {/* <SvgXml
                style={{position:'absolute',borderWidth:1,borderColor:'white'}}
            xml={
                xmlLoginBgGreen
              } width={screenWidth} height={screenHeight} /> */}

            {/* <Icon
                    style={{ alignSelf: 'center' }}
                    name="user-circle" size={72} color='green' /> */}
            {/* <Image
              style={{height:125,width:175,
                alignSelf:'center',
                resizeMode:'center',
                marginTop:100,
              borderWidth:1}}
              source={require('../../assets/logo/ic_logo.png')}
              /> */}
            {/* sfds */}
            {/* <View
                style={{borderWidth:1,}}
                > */}

            <View style={[styles.textInputContainer, { marginTop: 20 }]}>
              <Icon
                name="user"
                size={18}
                color={CmmsColors.colorWithAlpha('white', 0.5)}
              />
              <TextInput
                style={styles.textInput}
                placeholder={AppTextData.txtUser_ID}
                placeholderTextColor={CmmsColors.colorWithAlpha('white', 0.5)}
                selectionColor="white"
                // maxLength={10}
                // onSubmitEditing={() => {
                //   pwdIpRef.current && pwdIpRef.current.focus();
                // }}
                value={User}
                returnKeyType="next"
                onChangeText={(text) => {
                  setUser(text);
                }}

              // onSubmitEditing={() => this.passwordInput.focus()}
              // onSubmitEditing={this.smsPermission.bind(this)}
              // onChangeText={val => this.onChangeText('mobile', val)}
              // onChangeText={(text) => { setUser({...User,Password:text}) }}
              />
            </View>

            <View style={{ ...styles.textInputContainer, marginTop: 20 }}>
              <Icon
                name="key"
                size={18}
                color={CmmsColors.colorWithAlpha('white', 0.5)}
              />
              <TextInput
                // ref={pwdIpRef}
                style={styles.textInput}
                placeholder={AppTextData.txtpassword}
                placeholderTextColor={CmmsColors.colorWithAlpha('white', 0.5)}
                secureTextEntry={Security}
                selectionColor="white"
                // maxLength={10}
                returnKeyType="done"
                value={Pass}
                onChangeText={(text) => {
                  setPass(text);
                  console.log('am typing->>>>', User.Username)
                }}

              // onSubmitEditing={() => this.passwordInput.focus()}
              // onSubmitEditing={this.smsPermission.bind(this)}
              // onChangeText={val => this.onChangeText('mobile', val)}
              // onChangeText={(text) => { setUser({...User,Password:text}) }}
              />
              <TouchableOpacity
                onPress={() => {
                  SetSecurity(!Security);
                }}>
                <Icon
                  name={Security ? 'eye' : 'eye-slash'}
                  size={18}
                  color={CmmsColors.colorWithAlpha('white', 0.5)}
                />
              </TouchableOpacity>
            </View>

            {/* <TouchableOpacity style={{alignSelf: 'center', marginTop: 5}}>
              <CTextHint>{AppTextData.txtForgot_Password}</CTextHint>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={{
                backgroundColor: CmmsColors.yellowButton,
                marginTop: 20,
                alignItems: 'center',
                borderRadius: 25,
                justifyContent: 'center',
                height: 50,
              }}
              testID="loginButton"
              onPress={async () => {
                //alert("multi langnpm ")
                try {
                  dispatch(actionSetLoading(true));
                  let token = await AsyncStorage.getItem(ASK.ASK_TOKEN);
                  const FcMtoken = await messaging().getToken();
                  await messaging().registerDeviceForRemoteMessages();
                  // console.log("Ext_token........",token)
                 await doLogin(FcMtoken);
                } catch (error) {
                  console.error('login asktoken error', error);
                  // doLogin()
                }
              }}>
              <Text
                style={{
                  color: CmmsColors.colorWithAlpha('white', 0.8),
                  fontSize: 16,
                  fontWeight: 'bold',
                }}>
                {AppTextData.txtLogin}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ alignSelf: 'center', marginTop: 5, marginBottom: 8 }}
              onPress={() => setVisibleLngDlg(true)}>
              <Text
                style={{
                  color: CmmsColors.colorWithAlpha('white', 0.5),
                  fontSize: 12,
                  fontWeight: '900',
                }}>
                {selectedLng?.Language}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ paddingBottom: 10 }}>
            <Text
              style={{
                color: '#A3A3A3',
                alignSelf: 'center',
                fontWeight: '100',
                fontSize: 12,
              }}>
              Mac-Man {AppVersion}
            </Text>
          </View>
        </View>

        {/* </View> */}
        <Dialog
          animationType='fade'
          title={AppTextData.txt_langauge}
          titleStyle={styles.DialogTitle}
          dialogStyle={styles.borderRadius}
          visible={visibleLngDlg}
          onTouchOutside={() => setVisibleLngDlg(false)}>
          <FlatList
            data={lngList}
            renderItem={({ item }) => {
              const selected = selectedLng.Languagevalue == item.Languagevalue;
              return (
                <TouchableOpacity
                  // testID='btn_'
                  style={{ flexDirection: 'row', padding: 5 }}
                  onPress={() => {
                    if (!selected) {
                      dispatch(actionSetSelectedLng(item)); //commented by vbn
                      //lang vbn
                      AsyncStorage.setItem(
                        ASK.ASK_LANGUAGE,
                        JSON.stringify({
                          Language: item.Language,
                          Languagevalue: item.Languagevalue,
                        }),
                      );
                    }
                  }}>
                  <Icon
                    name={selected ? 'check-square-o' : 'square-o'}
                    size={18}
                    color="black"
                  />
                  <CText style={{ color: 'black', marginStart: 5 }}>
                    {item.Language}
                  </CText>
                </TouchableOpacity>
              );
            }}
          />
        </Dialog>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  async function doLogin(token) {
    if (User && Pass) {
      const params = { "Username": User, "Password": Pass, Token: token == null ? 'nulltoken' : token };
      console.log('params for login api call==>>', params);
      requestWithEndUrl(`${API_TECHNICIAN}Login`, params, 'POST')
        .then((res) => {
          console.log('URL_LOGIN', params);
          if (res.status != 200) {
            throw Error(res.statusText);
          }
          return res.data;
        })
        .then((data) => {
          if (data.isSucess) {
            console.log('login_success date: ', { data });
            const TechnicianID = data.TechnicianID;
            const TechnicianName = data.TechnicianName;
            const UserType = data.UserType;
            const loggedUser = JSON.stringify({
              TechnicianID,
              TechnicianName,
              UserType,
            });
            // console.log("login_success: ", { loggedUser })
            dispatch(
              actionSetLoginData({ TechnicianID, TechnicianName, UserType }),
            );
            AsyncStorage.setItem(ASK.ASK_USER, loggedUser);
            if (UserType == 1 || 2) {
              setTimeout(() => {
                if (UserType == 1) {
                  navigation.replace('TechHome'); //TechHome
                } else if (UserType == 2) {
                  dispatch(actionSetLoginStatus(true));
                  navigation.replace('SupHome'); //SupHome
                }
                dispatch(actionSetLoading(false));
              }, 1000);
            } else
              dispatch(
                actionSetAlertPopUpTwo({
                  title: AppTextData.txt_Alert,
                  body: AppTextData.txt_Invalid_User_Details,
                  visible: true,
                  type: 'ok',
                }),
              );
            dispatch(actionSetLoading(false));

          } else {
            dispatch(actionSetLoading(false));
            console.log('login Failed data--->>>new', data);
            // alert(data.Message);
            dispatch(
              actionSetAlertPopUpTwo({
                title: AppTextData.txt_Alert,
                body: AppTextData.txt_Invalid_Username_and_Password,
                visible: true,
                type: 'ok',
              }),
            );
          }
        })
        .catch((err) => {
          console.error({ err });
          dispatch(actionSetLoading(false));
          // alert(AppTextData.txt_somthing_wrong_try_again);
          dispatch(
            actionSetAlertPopUpTwo({
              title: AppTextData.txt_Alert,
              body: AppTextData.txt_somthing_wrong_try_again,
              visible: true,
              type: 'ok',
            }),
          );
        });
    } else {
      dispatch(actionSetLoading(false));
      // alert(AppTextData.txt_fields_must_not_be_empty);
      dispatch(
        actionSetAlertPopUpTwo({
          title: AppTextData.txt_Alert,
          body: AppTextData.txt_fields_must_not_be_empty,
          visible: true,
          type: 'ok',
        }),
      );
    }
  }
};

const styles = StyleSheet.create({
  textInputContainer: {
    flexDirection: 'row',
    borderRadius: 25,
    borderColor: '#ffffff90',
    borderWidth: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    color: 'white',
    marginStart: 5,
  },
  borderRadius: {
    borderRadius: 12
  },
  DialogTitle: { color: CmmsColors.darkGreen, fontWeight: 'bold' }
});