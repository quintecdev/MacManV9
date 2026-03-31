import axios from 'axios';
import {API_BASE} from './api_constants';
import qs from 'qs';

const client = axios.create({
  baseURL: API_BASE,
});

const request = (options) => {
  const onSuccess = (response) => {
    // console.log('Request successful', response);
    return response;
  };

  const onError = (error) => {
    // Print main error details in a user-friendly way
    const apiUrl = (error.config && error.config.url) ? error.config.url : 'Unknown URL';
    if (error.response) {
      console.error('API Error!');
      console.error('URL:', apiUrl);
      console.error('Status:', error.response.status);
      if (error.response.data && typeof error.response.data === 'object') {
        console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Error Data:', error.response.data);
      }
      if (error.response.data && error.response.data.message) {
        console.error('Message:', error.response.data.message);
      }
    } else {
      console.error('Network or Unknown Error!');
      console.error('URL:', apiUrl);
      console.error('Error Message:', error.message);
    }
    return Promise.reject(error.response || error.message);
  };
  return client(options).then(onSuccess).catch(onError);
};

const requestWithEndUrl = (
  URL,
  params = {},
  METHOD = 'GET',
  header = {
    'Content-Type': 'application/json',
  },
) => {
  if (METHOD == 'POST') {
    return request({
      url: URL,
      method: 'POST',
      headers: header,
      data: params,
    });
  }
  if (METHOD == 'PUT') {
    return request({
      url: URL,
      method: 'PUT',
      headers: header,
      data: params,
    });
  }
  return request({
    url: URL,
    method: METHOD,
    params: params,
    paramsSerializer: (params) => {
      return qs.stringify(params, {arrayFormat: 'brackets'});
    },
    header: header,
  });
};

export default requestWithEndUrl;
