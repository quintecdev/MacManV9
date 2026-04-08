import AsyncStorage from "@react-native-async-storage/async-storage";
import ASK from "../../../constants/ASK";
import requestWithEndUrl from "../../../network/request";
import { API_SUPERVISOR } from "../../../network/api_constants";
import {
  actionSetEmergencyJoblistNotificationCount,
  actionSetInternalWorkOrderJobNotificationCount,
} from '../../../action/ActionCurrentPage';
import AlertSound from './alertSound';

/**
 * Update notification count and play alert if emergency jobs exist
 * @param {Function} dispatch 
 * @returns {Promise<void>}
 */
export async function NotificationCountUpdate(dispatch) {
  const User = JSON.parse(await AsyncStorage.getItem(ASK.ASK_USER));

  console.log('Running NotificationCountUpdate for user', User);
  try {
    const params = { SEID: User.TechnicianID, Date: Date.now() };
    console.log(
      'params for api call NotificationCountUpdate function',
      params,
    );
    const EmergencyJoblistCount = await requestWithEndUrl(
      `${API_SUPERVISOR}JobListCount`,
      { SEID: User.TechnicianID, Date: Date.now() },
    );
    console.log(
      'emergency joblist count from the common service-->>',
      EmergencyJoblistCount.data,
    );
    dispatch(
      actionSetEmergencyJoblistNotificationCount(
        EmergencyJoblistCount.data.BreakDown,
      ),
    );
    dispatch(
      actionSetInternalWorkOrderJobNotificationCount(
        EmergencyJoblistCount.data.WOInternal,
      ),
    );
    // Play alert sound if there are internal breakdown jobs and user is supervisor or a breakdown job
    const isSupervisor = User?.UserType == 2;
    const playBreakdownAlert = EmergencyJoblistCount?.data?.BreakDown > 0;
    const playInternalAlert = EmergencyJoblistCount?.data?.WOInternal > 0;
    const stopBreakdownAlert = EmergencyJoblistCount?.data?.BreakDown == 0;
    const stopInternalAlert = EmergencyJoblistCount?.data?.WOInternal == 0;

    console.log('playBreakdownAlert', playBreakdownAlert, 'playInternalAlert', playInternalAlert);
    if (!AlertSound.AlertSound.isPlaying()) {
      playBreakdownAlert ? AlertSound.AlertSound.start("NotificationCountUpdate") : AlertSound.AlertSound.stop();
    } else {
      stopBreakdownAlert && AlertSound.AlertSound.stop();
    }
    if (!AlertSound.AlertSoundFirst.isPlaying()) {
      playInternalAlert && isSupervisor ? AlertSound.AlertSoundFirst.start("NotificationCountUpdate") : AlertSound.AlertSoundFirst.stop();
    } else {
      stopInternalAlert && AlertSound.AlertSoundFirst.stop();
    }
  }
  catch (error) {
    console.log('EmergencyJobListCount error', error);
  }
}