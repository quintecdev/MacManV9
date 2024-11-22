import {actionSetJobListCnt} from '../action/ActionRealTimeData';
import {API_SUPERVISOR, API_TECHNICIAN} from '../network/api_constants';
import requestWithEndUrl from '../network/request';

export default (dispatch, selectedTimemillies, SEID) => {
  // http://213.136.84.57:4545/api/ApkSupervisor/EmergencyJobListCount?Date=1614537000000
  requestWithEndUrl(
    `${!SEID ? API_SUPERVISOR : API_TECHNICIAN}${
      !SEID ? 'EmergencyJobListCount' : 'TechEmergencyJobListCount'
    }`,
    {Date: selectedTimemillies, SEID},
  )
    .then((res) => {
      console.log('EmergencyJobListCount*****', res);
      if (res.status != 200) {
        throw Error(res.statusText);
      }
      return res.data;
    })
    .then((data) => {
      console.log('EmergencyJobListCount', data);
      dispatch(actionSetJobListCnt(10));
    })
    .catch((err) => {
      console.log('EmergencyJobListCount', err);
    });
};
