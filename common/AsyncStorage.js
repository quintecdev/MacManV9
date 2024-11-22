import AsyncStorage from '@react-native-async-storage/async-storage';
export const setValueToStorage = async (key, data) => {
  let value = '';
  try {
    value = await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {
    return false;
  }
  return true;
};

export const getValueFromStorage = async key => {
  let value = '';
  try {
    value = await AsyncStorage.getItem(key);
  } catch {
    return false;
  }
  return JSON.parse(value);
};

 export const removeValueFromStorage=async key=>{
    console.log('inside the remove async store value function')
    try{
        AsyncStorage.removeItem(key);
    }catch{
        console.log('catch removeValueFromStorage')
        return false
    }
    console.log('item removed successfully from the storage')
    return true
 }