import React from 'react';
// const { default: ASK } = require("../../../constants/ASK");
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithRedux } from '../../../test-utils';
const { default: LoginScreen } = require("../LoginScreen");
import renderer from 'react-test-renderer';

test('renders correctly', async() => {
    const { store } = renderWithRedux(<LoginScreen />);
    expect(store).toMatchSnapshot()
    // const selectedLng = await store.getState().selectedLng
    // expect(selectedLng)
    
});

// it('checks if Async Storage is used', async () => {
//     await asyncOperationOnAsyncStorage();
  
//     expect(AsyncStorage.getItem).toBeCalledWith(ASK.ASK_TOKEN);
//   })