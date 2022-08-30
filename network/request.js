import axios from 'axios';
import {API_BASE} from './api_constants';
import qs from 'qs';

const client = axios.create({
    baseURL:API_BASE,
});

const request = (options)=>{
    const onSuccess = (response)=>{
        console.log('Request successful',response);
        return response;
    };

    const onError = (error) => {
        console.log('Request Failed:', error.config);
        if (error.response) {
          console.log('Status:', error.response.status);
          console.log('Data:', error.response.data);
          console.log('Headers:', error.response.headers);
        } else {
          console.log('Error Message:', error.message);
        }
        return Promise.reject(error.response || error.message);
      };
      return client(options)
      .then(onSuccess)
      .catch(onError);
}

const requestWithEndUrl = (URL,params={},METHOD='GET',header={
  'Content-Type': 'application/json',
},)=>{
  if(METHOD=='POST'){
    return request({
      url:URL,
      method:'POST',
      headers: header,
      data: params,

    })
  }
    return request({
        url:URL,
        method:METHOD,
        params:params,
        paramsSerializer: params => {
          return qs.stringify(params,{arrayFormat: 'brackets'})
        },
        header:header
    })
};

export default requestWithEndUrl;