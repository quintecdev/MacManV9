import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView,View,Text,
    Image, 
    TouchableOpacity,TextInput,FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import CmmsColors, { chatIconGreyColor, colorWithAlpha } from '../../common/CmmsColors';
import { chat_ip_container_height } from '../../constants/dimensions';
import { SvgCss,SvgFromXml,SvgXml } from 'react-native-svg';
import { chatdetailpageBg, svgXmlIcWPSend } from '../../common/SvgIcons';
import { CText, CTextHint, CTextTitle } from '../../common/components/CmmsText';
import requestWithEndUrl from '../../network/request';
import { API_IMAGEPATH, API_SUPERVISOR, API_TECHNICIAN } from '../../network/api_constants';
import { actionSetLoading } from '../../action/ActionSettings';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';


/**
     * @param status - 0 to 4
     *  0 - pending
     *  1 - sned
     *  2 - recieved
     *  3 - seen
     *  4 - error 
     * @returns string FontAwesome5 icon name
     */
 export const getIconName = (status) =>{
  switch(status){
     case 0:
        return "clock-o";
        case 1:
           return "check"
           case 2:
              return "check-circle-o"
              case 3: return "check-circle" // color blue
              case 4:
                 return "exclamation-circle"
                 default: return"clock-o"
  }
}

/**
* @param status - 0 to 4
*  0 - pending
*  1 - sned
*  2 - recieved default - {CmmsColors.chatIconGreyColor}
*  3 - seen color - {CmmsColors.chatDone}
*  4 - error color - {CmmsColors.darkRed}
* @returns string FontAwesome5 icon name
*/
 export const getIconColor = (status) =>{
    switch(status){
       
                case 3: return CmmsColors.chatDone // color blue
                case 4:
                   return CmmsColors.darkRed
                   default: return CmmsColors.chatIconGreyColor
    }
 }

export default ({ navigation }) => {
  const { loggedUser } = useSelector(state => state.LoginReducer);
  const [ChatRoomList, setChatRoomList] = useState([]);
  const dispatch = useDispatch();

  useEffect(()=>{
    getChatRoomList()
  },[])

  const upDateSelectedChatRoom=(selectedChatRoom)=>{
    console.log("upDateSelectedChatRoom",{selectedChatRoom})
    let tempChatRoomList = [...ChatRoomList]
    // let updatedChatRoom = tempChatRoomList.find(chatRoom=>{
    //   console.log({chatRoom})
    //   return chatRoom.ChatRoomId==selectedChatRoom.ChatRoomId
    // })
    // console.log({updatedChatRoom})
    // updatedChatRoom = selectedChatRoom
    setChatRoomList(...tempChatRoomList)
    // getChatRoomList()
  }
    return(<SafeAreaView style={{flex:1,backgroundColor:'white',paddingVertical:8}}>
        <FlatList
        data={ChatRoomList}
        keyExtractor={item => item._id}
        // ItemSeparatorComponent={() => <View style={{height:1,backgroundColor:'black'}} />}
        renderItem={({ item }) => {
          let DP = `${API_IMAGEPATH}${item.DP}`
          console.log({DP})
        return (
          <TouchableOpacity
          style={{flexDirection:'row',paddingHorizontal:8,paddingVertical:4,alignItems:'center'}}
            onPress={() => {
              const itemChatRoomId = item.ChatRoomId
              console.log({DP})
              console.log({itemChatRoomId,"inichat":item.ChatRoomId==0})
              const selectedChatRoom = {...item,ChatRoomId:itemChatRoomId==0?Date.now():item.ChatRoomId}
              // upDateSelectedChatRoom(selectedChatRoom)
              navigation.navigate('ChatComposePage', 
              { chatReciever: selectedChatRoom,
                isInitialChat: item.ChatRoomId==0,
                // upDateSelectedChatRoom
              })
              }
            }
          >
              <Image
                style={{ marginStart:8,height: 48, width: 48,borderRadius:100 }}
              source={{ uri:  DP}} 

                // source={{uri:'https://lh3.googleusercontent.com/ogw/ADea4I7C4Br9kp5-3kTvGkUBpmpUmgtCTUOQdUlh5vX9=s32-c-mo'}}
                // {require('../../assets/logo/macman-logo-large-C.png')}
              />
              <View
              style={{marginStart:5,padding:8,flex:1,}}
              >
                <View
                style={{flexDirection:'row',flex:1,alignItems:'center'}}
                >
                  <CTextTitle
                  style={{color:'black',flex:1}}
                  >{item.Name}</CTextTitle>
                  {item.ChatRoomId!=0&&<CText
                  style={{color:'black',opacity:0.5,}}
                  >{format(new Date(Number(item.LastMsgDate)), 'dd/MM/yyyy')}</CText>}
                  </View>
                  {item.ChatRoomId!=0&&<CText
                  style={{color:chatIconGreyColor,marginTop:4,fontWeight: '900',}}
                  >
                  <Icon name={getIconName(1)} size={12} color={getIconColor(1)} /> {item.LastMsg}
                    </CText>}
              </View>
            
          </TouchableOpacity>
        )}}
        />
        {/* <TouchableOpacity
    style={{
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      width: 70,
      position: 'absolute',
      bottom: 10,
      right: 10,
      height: 70,
      backgroundColor: '#fff',
      borderRadius: 100,
    }}

    onPress={()=>navigation.navigate('ChatComposePage')}
  >
    <Icon name='plus' size={30} color='#01a699' />
  </TouchableOpacity> */}

    </SafeAreaView>)

    function getChatRoomList(){
      //http://localhost:29189/api/ApkSupervisor/ChatRoomList?FromId=1
      dispatch(actionSetLoading(true))
      requestWithEndUrl(`${API_SUPERVISOR}ChatRoomList`,{FromId:loggedUser?.TechnicianID})
      .then(res => {
        console.log("ChatRoomList",{res})
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then(data => {
        console.log("setChatHistory",{data})
      dispatch(actionSetLoading(false))
        // actionSetRefreshing(true)
        setChatRoomList(data)
      })
      .catch(err=>{
      dispatch(actionSetLoading(false))
        console.error({err})
      })
    }

    
}