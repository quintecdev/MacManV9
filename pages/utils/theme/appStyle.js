/**
 * @module appStyle
 * @created 2024-06-01
 * @author vibin
 */

import { StyleSheet, Dimensions } from 'react-native';

export const screenHeight = Dimensions.get('window').height;

export const appStyle = StyleSheet.create({
    appIconC: { height: 40, width: 25, marginStart: 8 },
    container: {
        flex: 1,
    },
    chart: {
        height: Math.floor(screenHeight / 3),
        marginTop: 10,
        padding: 2,
    },
    iwoList: {
        marginHorizontal: 4,
        marginVertical: 8,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'black',
    }
});