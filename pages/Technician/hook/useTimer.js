import { useState, useRef, useEffect } from 'react';
import BackgroundTimer from 'react-native-background-timer';
import { API_TECHNICIAN } from '../../../network/api_constants';
import requestWithEndUrl from '../../../network/request';
import { useSelector, useDispatch } from 'react-redux';
import { actionSetLoading, actionSetRefreshing } from '../../../action/ActionSettings';

const useTimer = (initialState = 0, techId = 0, navigation, panelRef) => {
	const {AppTextData} = useSelector(state => state.AppTextViewReducer)

	const [timer, setTimer] = useState(initialState);
	const [isActive, setIsActive] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const countRef = useRef(null);
	const dispatch = useDispatch()

	useEffect(()=>{
		console.log("useTimer","mount")
		return ()=>{
			console.log("useTimer","unmount")
			clearTimer()
			// BackgroundTimer.stopBackgroundTimer()
		}
	},[])

	const handleLocalStart = ()=>{
		if(isActive){
			setTimer((timer) => timer + 1);
		} else{
		setIsActive(true);
		BackgroundTimer.runBackgroundTimer(() => {
			//code that will be called every 1 seconds
			setTimer((timer) => timer + 1);
		}, 1000);
	}
	}

	const handleStart = (JOID,assignedTechList=[],onCancel=()=>{}) => {

		//   alert("handle start")
		if (!isActive) {
			//http://213.136.84.57:4545/api/ApkTechnician/StartJO
			console.log('URL:', `${API_TECHNICIAN}StartJO`)
			console.log('Params:', techId, JOID)
			// Geolocation.getCurrentPosition(info => {
			// 	console.log('getCurrentPosition',{info})
			// });
			dispatch(actionSetLoading(true))
			requestWithEndUrl(`${API_TECHNICIAN}StartJO`, { TechnicianID: [...new Set([techId,...assignedTechList])], JOID }, 'POST')
				.then((res) => {
					console.log('URL_StartJO', { res });
					if (res.status != 200) {
						throw Error(res.statusText);
					}
					return res.data;
				})
				.then((data) => {
					dispatch(actionSetLoading(false))
					if (data.isSucess) {
						onCancel()
						panelRef.current.togglePanel()
						handleLocalStart()
						dispatch(actionSetRefreshing(true))
					} else {
						alert(data.Message)
					}
				})
				.catch((err) => {
					dispatch(actionSetLoading(false))

					console.error('URL_StartJO', { err });
					alert(AppTextData.txt_Something_went_wrong)
				});
		}
		// countRef.current = setInterval(() => {
		//   setTimer((timer) => timer + 1)
		// }, 1000)
	};

	const handlePause = (selectedReasonId, JOID) => {
		console.log("handlePause",{ selectedReasonId,isPaused });
		if (!isPaused) {
			// clearInterval(countRef.current)

			// http://213.136.84.57:4545/api/ApkTechnician/BreakJO
			dispatch(actionSetLoading(true))
			console.log('URL:', `${API_TECHNICIAN}BreakJO`)
			console.log('Params:', techId, JOID, selectedReasonId)
			requestWithEndUrl(`${API_TECHNICIAN}BreakJO`, { TechnicianID: [techId], ReasonID: selectedReasonId, JOID }, 'POST')
				.then((res) => {
					console.log('URL_BreakJO', { res });
					if (res.status != 200) {
						throw Error(res.statusText);
					}
					return res.data;
				})
				.then((data) => {
					dispatch(actionSetLoading(false))

					if (data.isSucess) {
						console.log({BackgroundTimer})
						BackgroundTimer.stopBackgroundTimer();
						setIsPaused(true);
						dispatch(actionSetRefreshing(true))
					} else {
						alert(data.Message);
					}
				})
				.catch((err) => {
					dispatch(actionSetLoading(false))

					console.error('URL_BreakJO', { err });
					alert(AppTextData.txt_Something_went_wrong);
				});
		}
	};

	const handleResume = (JOID) => {
		console.log("handleResume",{isPaused,isActive})
		if (isPaused && isActive) {
			// countRef.current = setInterval(() => {
			//   setTimer((timer) => timer + 1)
			// }, 1000)
			//http://213.136.84.57:4545/api/ApkTechnician/ContinueJO
			dispatch(actionSetLoading(true))
			console.log('URL:', `${API_TECHNICIAN}ContinueJO`)
			console.log('Params:', techId, JOID)
			requestWithEndUrl(`${API_TECHNICIAN}ContinueJO`, { TechnicianID: [techId], JOID }, 'POST')
				.then((res) => {
					console.log('URL_ContinueJO', { res });
					if (res.status != 200) {
						throw Error(res.statusText);
					}
					return res.data;
				})
				.then((data) => {
					dispatch(actionSetLoading(false))

					if (data.isSucess) {
						setIsPaused(false);
						// handleLocalStart()
						BackgroundTimer.runBackgroundTimer(() => {
							//code that will be called every 1 seconds
							setTimer((timer) => timer + 1);
						}, 1000);
						dispatch(actionSetRefreshing(true))
					} else {
						alert(data.Message);
					}
				})
				.catch((err) => {
					dispatch(actionSetLoading(false))

					console.error('URL_ContinueJO', { err });
					alert(AppTextData.txt_Something_went_wrong);
				});
		}
	};

	const handleReset = (JOID,ServiceType) => {
		// clearInterval(countRef.current)

		//http://213.136.84.57:4545/api/ApkTechnician/StopJO
		console.log('URL:', `${API_TECHNICIAN}StopJO`)
		console.log('Params:', techId, JOID)
		requestWithEndUrl(`${API_TECHNICIAN}StopJO`, { TechnicianID: [techId], JOID }, 'POST')
			.then((res) => {
				console.log('URL_StartJO', { res });
				if (res.status != 200) {
					throw Error(res.statusText);
				}
				return res.data;
			})
			.then((data) => {
				if (data.isSucess) {
					clearTimer()
					panelRef.current.togglePanel()
					dispatch(actionSetRefreshing())
					navigation.navigate("JobOrderReport",
						{ JOID, SEID: techId, selectedActivityDetails: [], SelectedSpareParts: [], IsSuperVisor: 0,ServiceType})

				} else {
					alert(data.Message);
				}
			})
			.catch((err) => {
				console.error('URL_StartJO', { err });
				alert(AppTextData.txt_Something_went_wrong);
			});
	};

	function clearTimer() {
		console.log("clear timer")
		BackgroundTimer.stopBackgroundTimer();
		setIsActive(false);
		setIsPaused(false);
		setTimer(0);
	}

	return { timer, isActive, isPaused, handleStart, handlePause, handleResume, handleReset, clearTimer,setTimer,handleLocalStart,setIsPaused,setIsActive };
};

export default useTimer;
