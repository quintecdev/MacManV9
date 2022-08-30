import React, { memo, useEffect, useRef, useState } from 'react';
import { SafeAreaView, SectionList, TouchableOpacity, View,FlatList } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import { CmmsText } from '../../../../common/components/CmmsText';
import Icon from 'react-native-vector-icons/FontAwesome';
import requestWithEndUrl from '../../../../network/request';
import { API_TECHNICIAN } from '../../../../network/api_constants';
import CmmsColors from '../../../../common/CmmsColors';

const JobStartingPopUp = ({ JOID,visible=true,assignedTechListError="No data",startJoFromPopUp=()=>{},onCancel=()=>{},techId }) => {
    console.log("JobStartingPopUp",{visible});
const [assignedTechList, setAssignedTechList] = useState(
    [
        // {
        //     "SEID": 8,
        //     "SE": "Abin",
        //     "Checked": true
        // },
        // {
        //     "SEID": 9,
        //     "SE": "Das",
        //     "Checked": false
        // },{
        //     "SEID": 10,
        //     "SE": "vvj",
        //     "Checked": true
        // },
        // {
        //     "SEID": 11,
        //     "SE": "jiju",
        //     "Checked": false
        // }
    ]);

const [defaultCheckedIds, setdefaultCheckedIds] = useState(new Set());

// useEffect(() => {
//     //cancel dialog
//     onCancel()
// }, [!isVisible]);
useEffect(() => {
    
GetAssignedJobs()
}, []);

return (
<Dialog
visible={true}
buttons={<View style={{flexDirection:'row',alignSelf:'flex-end'}}>
    <TouchableOpacity
    style={{elevation:8,paddingHorizontal:16,
        
        paddingVertical:8,alignSelf:'flex-end',
        justifyContent:'center',alignItems:'center'}}

        onPress={onCancel}
    >
      <CmmsText
      style={{fontWeight:'bold',color:CmmsColors.logoBottomGreen,}}
      >Cancel</CmmsText>
    </TouchableOpacity>
    <TouchableOpacity
    style={{elevation:8,paddingHorizontal:16,
        
        paddingVertical:8,alignSelf:'flex-end',
        justifyContent:'center',alignItems:'center'}}

        onPress={()=>{
            startJoFromPopUp(assignedTechList.filter(asTech=>asTech.Checked).map(mpAsTech=>mpAsTech.SEID))
        }}
    >
      <CmmsText
      style={{fontWeight:'bold',color:CmmsColors.logoBottomGreen,}}
      >OK</CmmsText>
    </TouchableOpacity>
    </View>
    }
    title='Assigned Technicians'
    onTouchOutside={()=>onCancel()}
    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <View>
        <FlatList
        data={assignedTechList}
        renderItem={({item,index})=><TouchableOpacity
            disabled={defaultCheckedIds.has(item.SEID)}
            style={{height:30,flexDirection:'row',marginTop:10,
            alignItems:'center',}}
            onPress={()=>{
                    item.Checked = !item.Checked
                    setAssignedTechList(assignedTechList=>[...assignedTechList])
            }
            }
            >
            <Icon name={ defaultCheckedIds.has(item.SEID) || item.Checked ? "check-square-o" : "square-o"} size={18} color="black" /> 
            <CmmsText 
            style={{fontWeight:'bold',marginStart:4}}
            >{item.SE}</CmmsText>
            
            </TouchableOpacity>}
        />
        
    </View>
</Dialog>
);

function GetAssignedJobs(){
    // http://213.136.84.57:5958/api/ApkTechnician/GetAssignedSE?JOID=4639
    requestWithEndUrl(`${API_TECHNICIAN}GetAssignedSE`,{JOID})
    .then(res => {
        console.log("GetAssignedSE", res)
        if (res.status != 200) {
            throw Error(res.statusText);
        }
        return res.data;
    })
    .then(data => {
        console.log("GetAssignedSE",data)
        if(data&&data.length>0){
            const newData = data.filter(asTech=>asTech.SEID!=techId)
            setAssignedTechList(newData)
            setdefaultCheckedIds(new Set(newData.filter(asTech=>asTech.Checked).map(mpAsTech=>mpAsTech.SEID)))
        } else throw Error(assignedTechListError)
    }).catch(e=>{
        onCancel()
        alert(assignedTechListError)
    })
}

}

export default memo(JobStartingPopUp);