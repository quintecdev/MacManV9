import React, { useEffect, useRef, useState } from 'react';
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import requestWithEndUrl from '../../network/request';
import { actionSetLoading } from '../../action/ActionSettings';
import { API_ASSET_PATH, API_TECHNICIAN } from '../../network/api_constants';
import {
	Text,
	View,
} from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import { CTextTitle } from '../../common/components/CmmsText';
import CmmsColors from '../../common/CmmsColors';

export default ({AssetRegID=0,dispatch,onTouchOutSide=()=>{}}) => {
	const [visibleAssetInfoPopUp, setVisibleAssetInfoPopUp] = useState(true);
	const [assetInfo,setAssetInfo] = useState(undefined)

useEffect(() => {
    console.log("getAssetInfo",{AssetRegID});
		//http://localhost:29189/api/ApkTechnician/getassetinformation?AssetRegID=2988
        if(AssetRegID!=0){
		getAssetInfo(AssetRegID)
    }
}, [AssetRegID]);

async function getAssetInfo(AssetRegID){
    console.log("getAssetInfo",{AssetRegID});
    //http://localhost:29189/api/ApkTechnician/getassetinformation?AssetRegID=2988
    dispatch(actionSetLoading(true))
    try{
    const assetInfoData = await requestWithEndUrl(`${API_TECHNICIAN}getassetinformation`,{AssetRegID})
    console.log("getAssetInfo",{assetInfoData})

    if(assetInfoData.data && assetInfoData.data.AssetName ){
        console.log("getAssetInfo pop up",{data:assetInfoData.data})
        // if(AssetRegID)
        // setVisibleAssetInfoPopUp(true)
        setAssetInfo(assetInfoData.data)
    } else{
        alert("Invalid Asset Information")
    }
    dispatch(actionSetLoading(false))

    } catch(e){
        console.error("getAssetInfo",e)
        dispatch(actionSetLoading(false))
    }
    
    
}

return (
<Dialog
				title={'Asset Information'}
				visible={visibleAssetInfoPopUp}
				onTouchOutside={()=>{setVisibleAssetInfoPopUp(false)
                onTouchOutSide()
                }}
			>
				<View
				style={{minHeight:100}}
				>
					<Text>{assetInfo?.AssetName}</Text>
					{assetInfo?.Documents.map(doc=>
						<Text 
						style={{paddingVertical:4,bgvmarginTop:2,color:CmmsColors.palatinateBlue}} 
						numberOfLines={1} ellipsizeMode='tail' 
						onPress={()=>{
							// Linking.openURL(`${API_ASSET_PATH}${doc}`)
							dispatch(actionSetLoading(true))
							const url = `${API_ASSET_PATH}${doc}`

							const localFile = `${RNFS.DocumentDirectoryPath}/${doc}`;
						RNFS.downloadFile(
							{
								fromUrl:url,
								toFile: localFile
							}
						)
						.promise.then((data) => {
							console.log("download");
							if (data.statusCode != 200) {
								throw Error("Error downloading file: "+data.statusCode);
							}
							return FileViewer.open(localFile)})
							
						.then(() => {
							console.log("Fileviewer open",);
							dispatch(actionSetLoading(false))
						  // success
						})
						.catch((error) => {
							console.error("Fileviewer open",error);
							dispatch(actionSetLoading(false))
							alert(error)
							// alert("There was an error opening this doccument.")
						  // error
						})

						}
						}>{doc}</Text>)}
				
				</View>
			</Dialog>
);
}