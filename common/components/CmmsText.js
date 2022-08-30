
import React from "react";
import ReactNative from "react-native";
import CmmsColors from "../CmmsColors";

export function CmmsText({
  style,...props
  }:Object):ReactElement<ReactNative.Text> {
      return <ReactNative.Text style={[{fontFamily: 'sans-serif-condensed',}, style]} {...props} />;
    }
export function CmmsTextWhite({
        style,...props
        }:Object):ReactElement<ReactNative.Text> {
            return <ReactNative.Text style={[{fontFamily: 'sans-serif-condensed',color:'white'}, style]} {...props} />;
          }

export function CText({
style,...props
}:Object):ReactElement<ReactNative.Text> {
    return <ReactNative.Text style={[CmmsTextStyles.text, style]} {...props} />;
  }
  
export function CTextHint({
style,...props
}:Object):ReactElement<ReactNative.Text> {
return <ReactNative.Text style={[CmmsTextStyles.textHint, style]} {...props} />;
}
export function CTextThin({
style,...props
}:Object):ReactElement<ReactNative.Text> {
return <ReactNative.Text style={[CmmsTextStyles.textHint, style]} {...props} />;
}

export function CTextTitle({
style,...props
}:Object):ReactElement<ReactNative.Text> {
return <ReactNative.Text style={[CmmsTextStyles.textTitle, style]} {...props} />;
}

export function CTextBlack({
    style,...props
    }:Object):ReactElement<ReactNative.Text> {
        return <ReactNative.Text style={[CmmsTextStyles.text, style]} {...props} />;
      }
      
export const CmmsTextStyles = ReactNative.StyleSheet.create({
    textBlack:{
        fontFamily: 'sans-serif-condensed',
        // fontWeight: '900',
        color:'black',
    },
    // textBlackSmall:{
    //     ...CmmsTextStyles.textBlack,fontSize:10
    // },
    text:{
        fontFamily: 'sans-serif-condensed',
        // fontWeight: '900',
        color:'white',
    },
    textHint:{
        fontFamily: 'sans-serif-condensed',
        fontWeight: '900',
        color:CmmsColors.colorWithAlpha('white',0.5),
    },
    textThin:{
        fontFamily: 'sans-serif-thin',
        fontWeight: '900',
        color:'white',
    },
    textTitle:{
        fontSize:16,
        fontFamily: 'sans-serif-condensed',
        fontWeight: 'bold',
        color:'white',
    },
})