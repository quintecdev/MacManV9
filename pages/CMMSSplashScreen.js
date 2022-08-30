import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, ImageBackground, Image, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { actionSetTech } from '../action/ActionTechnician';
import { actionSetLoginData } from '../action/ActionLogin';
import ASK from '../constants/ASK';

export default ({ navigation }) => {
	const dispatch = useDispatch();
	// let animatedValue = new Animated.Value(0)

	// useEffect(() => {
	//     Animated.timing(animatedValue, {
	//         toValue: 1,
	//         duration: 1000,
	//         easing: Easing.ease
	//     }).start()
	// }, [animatedValue])

	useEffect(() => {
		console.log('splash_screen');
		AsyncStorage.getItem(ASK.ASK_USER)
			.then((res) => {
				console.log({ res });
				if (res != null) {
					const loggedUser = JSON.parse(res);
					dispatch(actionSetLoginData(loggedUser));
					navigation.replace(`${loggedUser.UserType == 1 ? 'TechHome' : 'SupHome'}`); //SupHome
					// setTimeout(() => {
					//     // navigation.replace(`${Technician.UserType==1?'TechHome':'SupHome'}`)//SupHome
					// }, 1000);
				} else {
					navigation.replace('Login');
					// setTimeout(() => {
					//     // navigation.replace('Login')

					// }, 1000);
				}
			})
			.catch((err) => {
				console.error({ err });
			});
	}, []);
	return (
		<SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ImageBackground
            
				style={{
					flex: 1,
					position: 'absolute',
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
                    resizeMode: 'cover'
					// justifyContent: 'center',
				}}
				source={require('../assets/bg/splash-screen-final.webp')}
			/>
			{/* <Animated.Image
                style={{
                    height: 150, width: 200, transform: [
                        {
                            scale: animatedValue.interpolate({
                                inputRange: [0, 2],
                                outputRange: [0.5, 2]
                            })
                        }
                    ]
                }}
                source={require('../assets/logo/ic_logo.png')}
            /> */}
		</SafeAreaView>
	);
};
