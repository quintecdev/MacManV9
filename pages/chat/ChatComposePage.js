import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CmmsColors, {
  chatIconGreyColor,
  colorWithAlpha,
} from '../../common/CmmsColors';
import {chat_ip_container_height} from '../../constants/dimensions';
import {SvgCss, SvgFromXml, SvgXml} from 'react-native-svg';
import {
  chatdetailpageBg,
  svgMicroPhone,
  svgXmlIcWPSend,
} from '../../common/SvgIcons';
import {CText, CTextHint, CTextTitle} from '../../common/components/CmmsText';
import requestWithEndUrl from '../../network/request';
import {API_SUPERVISOR, API_TECHNICIAN} from '../../network/api_constants';
import {getIconColor, getIconName} from './ChatHistoryPage';
import {useDispatch, useSelector} from 'react-redux';
import messaging, {firebase} from '@react-native-firebase/messaging';
import ic_logo from '../../assets/logo/ic_logo.png';
import {actionSetLoading} from '../../action/ActionSettings';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import RNGRP from 'react-native-get-real-path';
import PhotoEditor from 'react-native-photo-editor';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
// let audioPath = AudioUtils.DocumentDirectoryPath + '/test.aac';

var hasImage = false;

export default ({route, navigation}) => {
  const {AppTextData} = useSelector((state) => {
    return state.AppTextViewReducer;
  });
  const dispatch = useDispatch();
  const [audioData, setAudioData] = useState({
    currentTime: 0.0,
    recording: false,
    paused: false,
    stoppedRecording: false,
    finished: false,
    audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
    hasPermission: undefined,
  });

  function prepareRecordingPath(audioPath) {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: 'Low',
      AudioEncoding: 'aac',
      AudioEncodingBitRate: 32000,
    });
  }

  const {
    chatReciever,
    isInitialChat,
    //upDateSelectedChatRoom
  } = route.params;
  //    {
  //       "chatReciever": {
  //           "ToId": 1,
  //           "ChatRoomId": 0,
  //           "Name": "Francis Supervisor",
  //           "DP": "1646931807876202105270330503050.jpg",
  //           "LastMsg": "",
  //           "LastMsgDate": 0,
  //           "LastMsgStatus": 0
  //       }
  //   }
  // const[chatReciever,setChatReciever] = useState(route.params)

  console.log({chatReciever});
  const {loggedUser} = useSelector((state) => state.LoginReducer);

  const msgIpRef = useRef(null);
  const [chatList, setchatList] = useState([
    // {
    //   "ChatId": 1,
    //   "FileName": "",
    //   "FromId": 1,
    //   "Message": "Hai sip, it's alex",
    //   "SeenDate": 0,
    //   "Status": 1,
    //   "ToId": 2
    // },
  ]);

  const [txtMsg, settxtMsg] = useState('');
  const [imageURI, setImage] = useState(null);
  const [EdittedImg, setEdittedImg] = useState(null);

  console.log({imageURI});

  // const [newChat, setnewChat] = useState({});

  useEffect(() => {
    AudioRecorder.requestAuthorization().then((isAuthorised) => {
      this.setState({hasPermission: isAuthorised});

      setAudioData({...audioData, hasPermission: isAuthorised});

      if (!isAuthorised) return;

      prepareRecordingPath(audioData.audioPath);

      AudioRecorder.onProgress = (data) => {
        //   this.setState({currentTime: });
        setAudioData({...audioData, currentTime: Math.floor(data.currentTime)});
      };

      AudioRecorder.onFinished = (data) => {
        // Android callback comes in the form of a promise instead.
        if (Platform.OS === 'ios') {
          _finishRecording(
            data.status === 'OK',
            data.audioFileURL,
            data.audioFileSize,
          );
        }
      };
    });
  }, []);

  function _finishRecording(didSucceed, filePath, fileSize) {
    // this.setState({ finished: didSucceed });
    setAudioData({...audioData, finished: didSucceed});
    console.log(
      `Finished recording of duration ${
        this.state.currentTime
      } seconds at path: ${filePath} and size of ${fileSize || 0} bytes`,
    );
  }

  async function _record() {
    if (audioData.recording) {
      console.warn('Already recording!');
      return;
    }

    if (audioData.hasPermission) {
      console.warn("Can't record, no permission granted!");
      return;
    }

    if (audioData.stoppedRecording) {
      this.prepareRecordingPath(audioData.audioPath);
    }

    setAudioData({...audioData, recording: true, paused: false});

    try {
      const filePath = await AudioRecorder.startRecording();
      console.log('startRecording', 'filePath', filePath);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    console.log('chatlist updated', chatList);
  }, [chatList]);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.clear();
      console.log(
        'A new FCM message arrived!',
        {remoteMessage, loggedUser},
        chatList,
      );
      let newChat = JSON.parse(remoteMessage.data.chat);
      console.log('ChatComposePage', 'onMessage: ', {
        newChat,
        ToId: newChat.ToId,
        TechnicianID: loggedUser?.TechnicianID,
      });
      if (
        remoteMessage.data.type == 'TYPE_CHAT' &&
        loggedUser?.TechnicianID == newChat.ToId &&
        newChat.FromId == chatReciever.ToId
      ) {
        getChatList();

        //{"ChatId": 11, "ChatRoomId": 1,
        // "FromId": 1, "IsFireBaseSucess": false, "IsSucess": true,
        // "Status": 1, "TempChatId": 1651554566305, "ToId": 2}}

        //   let tempChatlist = [...chatList,{...newChat,

        //    //   "FileName": "",
        //    //   "FromId": newChat.ToId,
        //      "Message": remoteMessage.notification.body,
        //    //   "SeenDate": 0,
        //    //   "Status": 1,
        //    //   "ToId": newChat.FromId
        // }]
        // console.log("TYPE_CHAT",{tempChatlist})
        //   setchatList(tempChatlist)
        //   updateChatListStatus([newChat.ChatId])
      }
    });

    getChatList();

    return unsubscribe;
  }, []);

  useEffect(() => {
    console.log('photo:', {imageURI});
    if (imageURI && imageURI.assets) {
      console.log('photo:', imageURI.assets[0].uri);
      dispatch(actionSetLoading(true));
      RNGRP.getRealPathFromURI(imageURI.assets[0].uri).then((path) => {
        dispatch(actionSetLoading(false));
        PhotoEditor.Edit({
          path: path,
          // RNFS.readFile(path, 'base64').then(imageBase64 =>
          //   this.props.actions.sendImageAsBase64(imageBase64)
          // )
          onDone: (imagePath) => {
            console.log('photoedit_ondone: ', {imagePath});
            setEdittedImg(
              Platform.OS === 'android' ? `file://${imagePath}` : imagePath,
            );
          },
          hiddenControls: [
            // 'clear',
            // 'crop', 'draw',
            'save',
            // 'share',
            'sticker',
            // 'text'
          ],
        });
      });
    }
  }, [imageURI]);

  const checkForCameraRollPermission = async () => {
    console.log('CAMERA', 'start');
    try {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'App Camera Permission',
        message: 'App needs access to your camera ',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });
      const result = await launchCamera(
        {
          saveToPhotos: true,
          mediaType: 'photo',
          includeBase64: false,
        },
        setImage,
      );
      console.log('CAMERA', result);
    } catch (err) {
      console.error('camera_error: ', err);
    }
  };

  const checkForGalleryPermission = async () => {
    console.log('Gallery', 'start');
    try {
      const result = await launchImageLibrary(
        {
          selectionLimit: 1,
        },
        setImage,
      );
      console.log('gallery', result);
    } catch (err) {
      console.error('gallery_error: ', err);
    }
    //    // if (status !== 'granted') {
    //    //   alert("Please grant camera roll permissions inside your system's settings");
    //    // }else{
    //    //   console.log('Media Permissions are granted')
    //    // }
  };

  function getChatList() {
    //http://213.136.84.57:2256/api/ApkSupervisor/GetChatHistory?RoomId=1
    dispatch(actionSetLoading(true));
    requestWithEndUrl(`${API_SUPERVISOR}GetChatHistory`, {
      RoomId: chatReciever.ChatRoomId,
    })
      .then((res) => {
        console.log('GetChatHistory', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        console.log('GetChatHistory', {data});
        dispatch(actionSetLoading(false));
        // actionSetRefreshing(true)
        setchatList(
          data,
          // [{"ChatId": 1, "FileName": "", "FromId": 1, "Message": "Hai sip, it's alex", "SeenDate": 0, "Status": 1, "ToId": 2}, ]
        );
        updateChatListStatus(data.map((chat) => chat.ChatId));
      })
      .catch((err) => {
        dispatch(actionSetLoading(false));
        console.error({err});
      });
  }

  /**
   * set to seen Status->3
   */
  function updateChatListStatus(chatIds) {
    //http://213.136.84.57:2256/api/ApkSupervisor/UpdateStatus?ChatId=[1,2,3]&Status=3
    requestWithEndUrl(
      `${API_SUPERVISOR}UpdateStatus`,
      {ChatId: chatIds, Status: 3},
      'POST',
      {'content-type': 'text/json'},
    )
      .then((res) => {
        console.log('UpdateStatus', {res});
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {})
      .catch((err) => {
        console.error('UpdateStatus', err);
      });
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 8,
        backgroundColor: CmmsColors.chatsContainerBg,
      }}>
      {/* chat message container */}
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <View>
          <FlatList
            data={chatList}
            renderItem={({item, index}) => (
              <View
                style={{
                  borderRadius: 10,
                  paddingVertical: 2,
                  paddingHorizontal: 7,
                  flexDirection: 'row',
                  // minWidth:100,
                  backgroundColor:
                    item.FromId == loggedUser?.TechnicianID
                      ? CmmsColors.chatBg
                      : 'white',
                  marginHorizontal: 4,
                  marginBottom: 4,
                  alignSelf:
                    item.FromId == loggedUser?.TechnicianID
                      ? 'flex-end'
                      : 'flex-start',
                }}>
                <CText style={{color: 'black'}}>{item.Message}</CText>
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 8,
                    //   position:"absolute",
                    //   bottom:4,
                    //   end:4,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <CText
                    style={{
                      fontSize: 12,

                      marginStart: 8,
                      color: colorWithAlpha('black', 0.5),
                    }}>
                    11:14 am
                  </CText>
                  {/* <FontAwesomeIcon icon="fal fa-check" /> */}
                  {item.FromId == loggedUser?.TechnicianID && (
                    <Icon
                      style={{marginStart: 4}}
                      name={getIconName(item.Status)}
                      size={12}
                      color={getIconColor(item.Status)}
                    />
                  )}
                </View>
              </View>
            )}
          />
        </View>
        {/* //chatIPsComponent */}

        <View
          style={{
            flexDirection: 'row',
            height: chat_ip_container_height,
            //  position:'absolute',bottom:0,end:0,start:0
          }}>
          <View
            style={{
              flex: 1,
              paddingHorizontal: 4,
              flexDirection: 'row',
              height: chat_ip_container_height,
              borderRadius: chat_ip_container_height,
              backgroundColor: CmmsColors.white,
            }}>
            <TouchableOpacity
            
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 8,
              }}
              onPress={() => {
                checkForGalleryPermission();
              }}>
              <Icon
                name="picture-o"
                size={24}
                color={CmmsColors.chatIconGreyColor}
              />
            </TouchableOpacity>
            <TextInput
              ref={msgIpRef}
              value={txtMsg}
              style={{flex: 1}}
              //vbn lang placeholder="Message"
              placeholder={AppTextData.txt_Message}
              onChangeText={(msg) => {
                console.log('bbj');
                console.log('onChange_MSG: ' + msg);
                settxtMsg(msg);
              }}
            />
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 8,
              }}
              onPress={() => {
                checkForCameraRollPermission();
              }}>
              <Icon
                name="camera"
                size={20}
                color={CmmsColors.chatIconGreyColor}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              height: chat_ip_container_height,
              width: chat_ip_container_height,
              borderRadius: chat_ip_container_height / 2,
              justifyContent: 'center',
              alignItems: 'center',
              marginStart: 4,
              // alignContent:'center',
              backgroundColor: CmmsColors.logoBottomGreen,
            }}
            onPress={async () => {
              console.log('CHat Send', txtMsg, {
                ChatRoomId: chatReciever.ChatRoomId,
              });
              if (txtMsg === '') {
                //voice meesage
                // alert("Feature is not available.")
                await _record();
              } else {
                const tempMsgId = Date.now();
                const tempChatlist = [
                  ...chatList,
                  {
                    Message: txtMsg,
                    Status: 0,
                    TempChatId: tempMsgId,
                    FromId: loggedUser?.TechnicianID,
                    ToId: chatReciever.ToId,
                  },
                ];
                setchatList(tempChatlist);
                isInitialChat
                  ? sendInitialChat(tempChatlist, tempMsgId)
                  : sendChat(tempChatlist, tempMsgId);
                settxtMsg('');
                // navigation.setParams({chatReciever:{...chatReciever,LastMsg:txtMsg,LastMsgDate:tempMsgId,LastMsgStatus:0}})
                //upDateSelectedChatRoom({...chatReciever,LastMsg:txtMsg,LastMsgDate:tempMsgId,LastMsgStatus:0})
              }
            }}>
            <SvgXml
              xml={txtMsg === '' ? svgMicroPhone : svgXmlIcWPSend}
              width={24}
              height={22}
              color="white"
            />
            {/* <Icon name={txtMsg===""?"microphone":"paper-plane"} size={24} color="white" /> */}
          </TouchableOpacity>
          {/* <Text>{txtMsg}</Text> */}
        </View>
        {EdittedImg && (
          <Image
            style={{
              position: 'absolute',
              start: 20,
              bottom: chat_ip_container_height,
              width: 70,
              height: 70,
            }}
            source={{
              uri: EdittedImg,
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );

  function sendInitialChat(tempChatlist = [], tempMsgId) {
    // var bodyFormData = {"FromId":loggedUser?.TechnicianID,"ToId":chatReciever.ToId,"Message":txtMsg,"TempChatId":tempMsgId}
    var bodyFormData = new FormData();
    bodyFormData.append(
      'Chat',
      JSON.stringify({
        FromId: loggedUser?.TechnicianID,
        ToId: chatReciever.ToId,
        Message: txtMsg,
        TempChatId: tempMsgId,
      }),
    );

    if (EdittedImg) {
      bodyFormData.append('', {
        uri: EdittedImg, //this.state.uri[0].uri, == image path file:///storage/emulated/0/Pictures/1511787860629.jpg
        type: 'image/jpg',
        name: 'chat_img.jpg',
      });
    }
    setEdittedImg(null);
    // bodyFormData.append("FromId",loggedUser?.TechnicianID)
    // bodyFormData.append("ToId",chatReciever.ToId)
    // bodyFormData.append("Message",txtMsg)
    // bodyFormData.append("TempChatId",tempMsgId)

    // bodyFormData.append(file,)
    // http://213.136.84.57:2256/api/ApkSupervisor/InitialChat
    requestWithEndUrl(`${API_SUPERVISOR}InitialChat`, bodyFormData, 'POST', {
      'Content-Type': 'multipart/form-data',
    })
      .then((res) => {
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        console.log('InitialChat: ', {data});

        let chatToUpdate = tempChatlist.find(
          (chat) => chat.TempChatId === data.TempChatId,
        );
        if (data.IsSucess) {
          console.log({chatToUpdate});
          chatToUpdate['Status'] = 1;
          setchatList([...tempChatlist]);
          navigation.setParams({
            chatReciever: {
              ...chatReciever,
              LastMsg: txtMsg,
              LastMsgDate: tempMsgId,
              LastMsgStatus: 1,
              ChatRoomId: data.ChatRoomId,
            },
          });

          //upDateSelectedChatRoom({...chatReciever,LastMsg:txtMsg,LastMsgDate:tempMsgId,LastMsgStatus:1,ChatRoomId:data.ChatRoomId})
        } else {
          chatToUpdate['Status'] = 4;
          setchatList(tempChatlist);
          navigation.setParams({
            chatReciever: {...chatReciever, ChatRoomId: 0},
          });

          //upDateSelectedChatRoom({...chatReciever,ChatRoomId:0})
        }
      })
      .catch((err) => {
        console.error('InitialChat', err);
        let chatToUpdate = tempChatlist.find(
          (chat) => chat.TempChatId === tempMsgId,
        );
        chatToUpdate['Status'] = 4;
        setchatList(tempChatlist);
        navigation.setParams({chatReciever: {...chatReciever, ChatRoomId: 0}});

        //upDateSelectedChatRoom({...chatReciever,ChatRoomId:0})
      });
  }

  function sendChat(tempChatlist = [], tempMsgId) {
    // var bodyFormData = {"ChatRoomId":chatReciever.ChatRoomId,"Message":txtMsg,"TempChatId":tempMsgId}
    var bodyFormData = new FormData();
    bodyFormData.append(
      'Chat',
      JSON.stringify({
        ChatRoomId: chatReciever.ChatRoomId,
        FromId: loggedUser?.TechnicianID,
        ToId: chatReciever.ToId,
        Message: txtMsg,
        TempChatId: tempMsgId,
      }),
    );

    if (EdittedImg) {
      bodyFormData.append('', {
        uri: EdittedImg, //this.state.uri[0].uri, == image path file:///storage/emulated/0/Pictures/1511787860629.jpg
        type: 'image/jpg',
        name: 'chat_img.jpg',
      });
    }
    setEdittedImg(null);
    // bodyFormData.append("ChatRoomId",chatReciever.ChatRoomId)
    // bodyFormData.append("Message",txtMsg)
    // bodyFormData.append("TempChatId",tempMsgId)
    // bodyFormData.append(file,)
    // bodyFormData.append("image",)
    // }
    // http://localhost:29189/api/ApkTechnician/Chat
    requestWithEndUrl(`${API_SUPERVISOR}Chat`, bodyFormData, 'POST', {
      'Content-Type': 'multipart/form-data',
    })
      .then((res) => {
        if (res.status != 200) {
          throw Error(res.statusText);
        }
        return res.data;
      })
      .then((data) => {
        console.log('Chat: ', {data});

        let chatToUpdate = tempChatlist.find(
          (chat) => chat.TempChatId === data.TempChatId,
        );
        if (data.IsSucess) {
          console.log({chatToUpdate});
          chatToUpdate['Status'] = 1;
          setchatList([...tempChatlist]);
          navigation.setParams({
            chatReciever: {
              ...chatReciever,
              LastMsg: txtMsg,
              LastMsgDate: tempMsgId,
              LastMsgStatus: 1,
            },
          });

          //upDateSelectedChatRoom({...chatReciever,LastMsg:txtMsg,LastMsgDate:tempMsgId,LastMsgStatus:1})
        } else {
          chatToUpdate['Status'] = 4;
          setchatList(tempChatlist);
          // navigation.setParams({chatReciever:{...chatReciever,LastMsg:txtMsg,LastMsgDate:tempMsgId,LastMsgStatus:4}})
          // upDateSelectedChatRoom({...chatReciever,LastMsg:txtMsg,LastMsgDate:tempMsgId,LastMsgStatus:4})
        }
      })
      .catch((err) => {
        console.error('Chat', err);
        let chatToUpdate = tempChatlist.find(
          (chat) => chat.TempChatId === tempMsgId,
        );
        chatToUpdate['Status'] = 4;
        setchatList(tempChatlist);
        // navigation.setParams({chatReciever:{...chatReciever,LastMsg:txtMsg,LastMsgDate:tempMsgId,LastMsgStatus:4}})

        // upDateSelectedChatRoom({...chatReciever,LastMsg:txtMsg,LastMsgDate:tempMsgId,LastMsgStatus:4})
      });
  }
};
