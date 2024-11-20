import { View,FlatList } from "react-native"

export default () =>{
    return (
        <View style={{flex:1}}>
            <FlatList
            data={Array(10)}
            renderItem={()=><View style={{height:100,backgroundColor:'red'}}></View>}
            />

        </View>
        // <View
        //   style={{flex:1}}
        //   >
        //     <FlatList
        //     style={{marginBottom:95}}
        //     showsVerticalScrollIndicator={false}
        //     data={emgJoList}
        //     keyExtractor={(item, index) => index.toString()}
        //     renderItem={({ item, index }) => {
        //       return (
        //           <TouchableOpacity
        //               style={{
        //                 marginHorizontal: 8,
        //                 marginTop: 8, 
        //                 backgroundColor: item.IsShutDown ? CmmsColors.darkRed : CmmsColors.joPending,
        //                 // height: 70, 
        //                 borderRadius: 10,
        //                 // marginStart: 25,
        //                 // paddingStart: 20,
        //                 paddingHorizontal: 8,
        //                 paddingVertical:4,
        //                 justifyContent:'center',
        //                 borderColor:CmmsColors.green,
        //                 borderWidth:selectedJobId == item.JOID?1:0
        //               }}
        //               onLongPress={()=>{
        //                 setSelectedJobId(item.JOID)
        //                 setTime(1)
        //                 // setSelectedTechId(6)
        //               }
        //               }
        //               onPress={() => {
        //                 if(selectedJobId == item.JOID){
        //                   setSelectedJobId(0)
        //                   setSelectedTechId(0)
        //                 }
        //                 // setSelectedJobId(item.JOID)
        //               }}
        //             >
        //               <CText
        //                 // numberOfLines={2}
        //                 style={{fontSize:16,textAlign:'center'}}
        //                 >
        //                 {item.JORefNo}/{item.Asset}/{item.Code}/{item.Location}/{item.ESC}  
        //               </CText>
        //               <ViewMoreText
        //               numberOfLines={1}
        //               renderViewMore={(onPress)=><Text style={{color:CmmsColors.lightBlue,
        //               }}onPress={onPress}>More</Text>}
        //               renderViewLess={(onPress)=><Text style={{color:CmmsColors.lightBlue,
        //               }}onPress={onPress}>Less</Text>}
        //               style={{flexDirection:'row',
        //               marginBottom:selectedJobId == item.JOID?20:0,
        //               flex:1}}
        //               >
        //               <CText
        //                style={{fontWeight:'bold',flex:1}}
        //               //  onTextLayout={(e)=>{
        //               //   console.log("onTextlayout",e.nativeEvent.lines.length)
        //               //   item.noLines=e.nativeEvent.lines.length
        //               //   setEmgJoList(emgJoList=>[...emgJoList])
        //               //  }}
        //                >{item.ProblemType}:-<CText
        //                >{`\b${item.ProblemDescription}`}</CText></CText>
                       
        //                {/* {item.noLines>1&&<TouchableOpacity
        //                style={{paddingVertical:2,
        //                 paddingHorizontal:4,
        //                 alignSelf:'flex-end',
        //                }}
        //                onPress={()=>{
        //                  item.noLines=item.noLines>=1&&0
        //                  setEmgJoList(emgJoList=>[...emgJoList])
        //                }
        //                }
        //                >
        //                  <CText
        //                  style={{color:CmmsColors.lightBlue,
        //                   }}
        //                  >{item.noLines==1?'More':'Less'}</CText>
        //                </TouchableOpacity>} */}
        //                </ViewMoreText>
        //               {selectedJobId == item.JOID&&<TextInput
        //                 style={{
        //                   height:20,paddingHorizontal:4,
        //                   paddingVertical:4,fontSize:10,borderRadius:4,
        //                   textAlign:'center',
        //                   backgroundColor:'white',
        //                 position:'absolute',end:8,bottom:2}}
        //                 placeholder='time'
        //                 keyboardType="numeric"
        //                 selectTextOnFocus
        //                 value={`${time}`}
        //                 onChangeText={(text)=>{
                          
        //                   setTime(text.replace(/[^1-9]/g, '1'))
        //                 }}
                        
        //               />}
        //               </TouchableOpacity>
                  
        //         )
        //     }} />
        //   </View>
    )
}