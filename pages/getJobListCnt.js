import {actionSetJobListCnt} from '../action/ActionRealTimeData';
import {API_SUPERVISOR, API_TECHNICIAN} from '../network/api_constants';
import requestWithEndUrl from '../network/request';

export default (dispatch, selectedTimemillies, SEID) => {
  
  requestWithEndUrl(
    `${!SEID ? API_SUPERVISOR : API_TECHNICIAN}${
      !SEID ? 'JobListCount' : 'TechEmergencyJobListCount'
    }`,
    {Date: selectedTimemillies, SEID},
  )
    .then((res) => {
      console.log('GetJobListCnt - EmergencyJobListCount 1', res);
      if (res.status != 200) {
        throw Error(res.statusText);
      }
      return res.data;
    })
    .then((data) => {
      console.log('GetJobListCnt - EmergencyJobListCount 2', data);
      dispatch(actionSetJobListCnt(10));
    })
    .catch((err) => {
      console.log('GetJobListCnt - EmergencyJobListCount Error', err);
    });
};
