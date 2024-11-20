import axios from 'axios';
const header = {
    'Content-Type': 'application/json',
  };
export const getData = async (url, params) => {
//   const header = {
//     'Content-Type': 'application/json',
//   };
  const param = {
    params,
    header,
  };
  try {
    const response = await axios.get(url, param);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const postData = async (url, params) => {
//   const header = {
//     'Content-Type': 'application/json',
//   };
  const param = {
    params,
    header,
  };
  try {
    const response = await axios.post(url, param);
    return response.data;
  } catch (error) {
    throw error;
  }
};
