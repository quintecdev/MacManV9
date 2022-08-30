import React,{useEffect,useState,useRef} from 'react';
import { View,FlatList,Text,
    Image,SafeAreaView,ImageBackground,
    AppState,BackHandler,
    TouchableOpacity,ScrollView } from 'react-native';
import {useSelector,useDispatch} from 'react-redux';
import CmmsColors from '../common/CmmsColors';

export default ({navigation,props})=>{
  const {AppTextData,selectedLng} = useSelector(state =>state.AppTextViewReducer)
    console.log("NetworkErrorPage",{navigation,props})
    const dispatch = useDispatch()

    useEffect(() => {
        
        return () => {
            console.log("NetworkErrorPage","unmount")
           
        }
    }, [])
    // const getPage
    return(
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ImageBackground
                style={{
                    flex: 1,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    // justifyContent: 'center',
                }}
                source={require('../assets/bg/bg_cmms.webp')}
            />
        <View
        //colors={['#c8e2e3', '#239461']}
        style={{
            flex: 1,
            justifyContent: 'center', alignItems: 'center',
        }}>
        <Image
            source={require('../assets/icons/connection-error.png')}
            style={{ resizeMode: 'center', width: 100, height: 100, marginBottom: 15 }}
        />
        <Text style={{ fontWeight: 'bold', fontSize: 18,textAlign:'center' }}>{AppTextData.txt_somthing_wrong_try_again}</Text>
             {/* <Text style={{textAlign: 'center',marginTop:10 }}>{AppTextData.</Text> */}
        <TouchableOpacity

        style={{backgroundColor:CmmsColors.blueBayoux,marginTop:10,padding:8,borderRadius:5}}
        onPress={()=>{
            // dispatch(actionSetReload(true))
           navigation && navigation.canGoBack() ?navigation.goBack():BackHandler.exitApp()
        
        }
        }
        >
            <Text
            style={{color:'white'}}
            >Go Back</Text>
        </TouchableOpacity>
    </View>
    </SafeAreaView>
    )
}