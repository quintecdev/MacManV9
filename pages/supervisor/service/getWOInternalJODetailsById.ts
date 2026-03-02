import requestWithEndUrl from '../../../network/request';
import { API_SUPERVISOR, API_TECHNICIAN } from '../../../network/api_constants';
import { WOInternalJODetailsModel } from './WOInternalJODetailsModel';

export const getWOInternalJODetailsById = (
  WorkID: number | null | undefined,
): Promise<WOInternalJODetailsModel> => {
  console.log('Fetching WOInternalJODetails for WorkID: ', WorkID);
  return requestWithEndUrl(`${API_SUPERVISOR}GetWOInternalJODetailsByID`, {
    WorkID:
     WorkID,
  })
    .then((res) => {
      console.log('Response from GetWOInternalJODetailsByID: ', res);
      if (res.status != 200) {
        throw Error(res.statusText);
      }
      return res.data;
    })
    .catch((error) => {
      console.log('GetWOInternalJODetailsByID Error: ', error);
      throw error;
    });
};
