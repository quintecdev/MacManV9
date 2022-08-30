import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
export default ({ visibleLogoutPopUp=false }) => {
    const [visible, setvisible] = useState(visibleLogoutPopUp);
useEffect(() => {
}, []);
return (
<Dialog
				title={'Logout'}
				visible={visibleAssetInfoPopUp}
				onTouchOutside={()=>{setVisibleAssetInfoPopUp(false)
                onTouchOutSide()
                }}
			>

</Dialog>
);
}