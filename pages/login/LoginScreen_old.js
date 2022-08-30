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
    processColor
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CmmsColors from '../../common/CmmsColors';
import { API_TECHNICIAN } from '../../network/api_constants';
import requestWithEndUrl from '../../network/request';
import { useSelector, useDispatch } from 'react-redux';
import { actionSetLoading } from '../../action/ActionSettings';
import { actionSetTech, actionShowTechnicianPopUp } from '../../action/ActionTechnician';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from "react-native-localize";
import { Dialog } from 'react-native-simple-dialogs';
import { actionSetSelectedLng } from '../../action/ActionAppText';

export default LoginScreen = ({ navigation,route:{params} }) => {
    const [User, setUser] = useState({})
    const [visibleLngDlg,setVisibleLngDlg] = useState(false)
    // const [selectedLng,setSelectedLng] = useState(params?.selectedLng)
    const [lngList,setLngList] = useState([])
    const dispatch = useDispatch()
    const {AppTextData,selectedLng} = useSelector(state => state.AppTextViewReducer)
    
    useEffect(()=>{
        //http://213.136.84.57:4545/api/ApkTechnician/GetLanguage
        requestWithEndUrl(`${API_TECHNICIAN}GetLanguage`)
        .then(res=>{
            console.log({ res })
            if (res.status != 200) {
                throw Error(res.statusText);
            }
            return res.data;
        })
        .then(data=>{
            console.log({selectedLng})
            const lselectedLng = data.find(item=>selectedLng.Languagevalue===item.Languagevalue)
            // const lselectedLng = data[indx!=-1?indx:0]
            lselectedLng.selected = true
            setLngList(data)
            selectedLng.Languagevalue!=lselectedLng.Languagevalue && dispatch(actionSetSelectedLng(lselectedLng))
            // setSelectedLng(lselectedLng)
        })
        .catch(err=>{

        })
    },[selectedLng])

    return (
        <SafeAreaView style={{ flex: 1, }}>
            {/* <ImageBackground
                style={{
                    flex: 1,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    // justifyContent: 'center',
                }}
                source={require('../../assets/bg/bg_cmms.webp')}
            /> */}
            {/* <View
         style={{flex:1}}
         > */}
            <View
                style={{ flex: 2, padding: 8, justifyContent: 'center', marginTop: 50, paddingHorizontal: 20, }}
            >
                <Icon
                    style={{ alignSelf: 'center' }}
                    name="user-circle" size={72} color={CmmsColors.lightBlue} />
                {/* <Image
              style={{height:125,width:175,
                alignSelf:'center',
                resizeMode:'center',
                marginTop:100,
              borderWidth:1}}
              source={require('../../assets/logo/ic_logo.png')}
              /> */}
                {/* sfds */}
                <Text
                    style={{ fontSize: 22, alignSelf: 'center', fontWeight: '900', marginTop: 16, marginBottom: 5 }}
                >{AppTextData.txtUser_Log_In}</Text>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        // borderWidth:1,borderColor: CmmsColors.blue,
                        backgroundColor: '#ffffff90',
                        borderRadius: 5,
                        paddingHorizontal: 8
                    }}
                >
                    <Icon name="user" size={18} color={CmmsColors.coolGray} />
                    <TextInput
                        style={{ flex: 1, color: 'black', marginStart: 5 }}
                        placeholder={AppTextData.txtUser_ID}
                        placeholderTextColor="grey"

                        maxLength={10}
                        returnKeyType="next"
                        onChangeText={(text) => { setUser({ ...User, Username: text }) }}

                    // onSubmitEditing={() => this.passwordInput.focus()}
                    // onSubmitEditing={this.smsPermission.bind(this)}
                    // onChangeText={val => this.onChangeText('mobile', val)}
                    // onChangeText={(text) => { setUser({...User,Password:text}) }}
                    />
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#ffffff90',
                        borderRadius: 5,
                        marginTop: 15,
                        paddingHorizontal: 8
                    }}
                >
                    <Icon name="key" size={18} color={CmmsColors.coolGray} />
                    <TextInput
                        style={{ flex: 1, color: 'black', marginStart: 5 }}
                        placeholder={AppTextData.txtpassword}
                        placeholderTextColor="grey"
                        secureTextEntry={true}
                        maxLength={10}
                        returnKeyType="done"
                        onChangeText={(text) => { setUser({ ...User, Password: text }) }}

                    // onSubmitEditing={() => this.passwordInput.focus()}
                    // onSubmitEditing={this.smsPermission.bind(this)}
                    // onChangeText={val => this.onChangeText('mobile', val)}
                    // onChangeText={(text) => { setUser({...User,Password:text}) }}
                    />
                </View>
                <TouchableOpacity
                    style={{
                        backgroundColor: CmmsColors.lightBlue,
                        marginTop: 20,
                        alignItems: 'center',
                        borderRadius: 5,
                        justifyContent: 'center', height: 50
                    }}
                    onPress={() => //alert("multi langnpm ")
                        doLogin()
                    }
                >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{AppTextData.txtLogin}</Text>
                </TouchableOpacity>

                

                <TouchableOpacity
                    style={{ alignSelf: 'center', marginTop: 5 }}
                >
                    <Text>{AppTextData.txtForgot_Password}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ alignSelf: 'center', marginTop: 5 }}
                    onPress={()=>setVisibleLngDlg(true)}
                >
                    <Text style={{color:'#778899',fontSize:12,fontWeight:'900'}}>{selectedLng?.Language}</Text>
                </TouchableOpacity>
            </View>
            <View
                style={{ flex: 1, marginTop:16}}
            >
                <Image
                    style={{
                        width: '100%', height: '100%',
                        position: 'absolute',
                        resizeMode: 'center',
                        bottom: 8,
                        start: 0,
                        end: 0,
                        borderWidth: 1
                    }}
                    source={require('./images/img_maintanance.png')}
                />
            </View>
            {/* </View> */}
            <Dialog
                // contentStyle={{maxHeight:screenHeight/2}}
                visible={visibleLngDlg}
                title={AppTextData.txt_Change_Langauge}
                onTouchOutside={()=>{
                    setVisibleLngDlg(false)
                }}
                // onTouchOutside={() => dispatch(actionVisibleFilterView())} 
                // buttons={<View style={{ flexDirection: 'row', 
                // justifyContent: 'flex-end' }}>
                // <Button style={{ flex: 1, padding: 10 }} title="Cancel"
                //     onPress={() => setVisibleLngDlg(false)}
                // />
                // <View style={{ width: 2 }} />
                // <Button style={{ flex: 1 }} title="   Apply    "
                //     color='black'
                //     onPress={() => {
                //         var selectedLng = lngList.find(lng=>lng.selected)
                //         console.log({selectedLng})
                //         setSelectedLng(selectedLng)
                //         dispatch(actionSetSelectedLng())
                //         setVisibleLngDlg(false)
                //     }
                //     }
                // />
                // </View>}
            >
                <FlatList
                data={lngList}
                renderItem={({item,index})=><TouchableOpacity
                style={{flexDirection:'row',padding:4,alignItems:'center',}}
                onPress={()=>{
                    var newLngList = [...lngList]
                    newLngList.forEach((item,index)=>{
                        console.log({item,index})
                        item.selected=false
                    })
                    const lselectedLng = newLngList[index]
                    lselectedLng.selected = true
                    // newLngList[index]['selected'] = true
                    console.log({newLngList})
                    // setSelectedLng(lselectedLng)
                    setLngList(newLngList)
                    setVisibleLngDlg(false)
                    dispatch(actionSetSelectedLng(lselectedLng))

                }}
                
                >
                    <Icon name={item.selected?"dot-circle-o":"circle-thin"} 
                    size={18} color='black' /> 
                    <Text style={{marginStart:4}}>{item.Language}</Text>
                    </TouchableOpacity>}

                
                />

            </Dialog>
        </SafeAreaView>
    )

    function doLogin() {

        dispatch(actionSetLoading(true))

        // http://213.136.84.57:4545/api/ApkTechnician/Login?UserName=Admin&Password=123
        // navigation.navigate('TechHome')
        requestWithEndUrl(`${API_TECHNICIAN}Login`, User, 'POST')
            .then(res => {
                console.log("URL_LOGIN", res)
                if (res.status != 200) {
                    throw Error(res.statusText);
                }
                return res.data;
            })
            .then(data => {
                dispatch(actionSetLoading(false))
                if (data.isSucess) {
                    console.log("login_success date: ", { data })
                    const TechnicianID = data.TechnicianID
                    const TechnicianName = data.TechnicianName
                    const UserType = data.UserType
                    const Technician = JSON.stringify({ TechnicianID, TechnicianName,UserType })
                    console.log("login_success: ", { Technician })
                    dispatch(actionSetTech({ TechnicianID, TechnicianName,UserType }))
                    AsyncStorage.setItem("key_user", Technician)
                    if (UserType == 1) {
                        navigation.replace('TechHome')//SupHome
                    }
                    else if (UserType == 2) {
                        
                        navigation.replace('SupHome')//SupHome
                    }
                    else
                        alert(AppTextData.txt_Invalid_User_Details)
                    dispatch(actionSetLoading(false))

                    //  navigation.dispatch(
                    //     CommonActions.reset({
                    //       index: 0,
                    //       routes: [
                    //         {
                    //           name: 'TechHome',
                    //           params: {TechnicianID,TechnicianName}
                    //         },
                    //       ],
                    //     })
                    //   );
                } else
                    alert(data.Message)
            })
            .catch(err => {
                console.error({ err })
                dispatch(actionSetLoading(false))
                alert(AppTextData.txt_somthing_wrong_try_again)

            })

    }
}