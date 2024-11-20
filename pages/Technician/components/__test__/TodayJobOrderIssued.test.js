import React from 'react';
import RNFS from "react-native-fs"
// const { default: ASK } = require("../../../constants/ASK");
import { screen, fireEvent } from '@testing-library/react-native';
// import { renderWithRedux } from '../../../test-utils';
const { default: TodayJobOrderIssued } = require("../TodayJobOrderIssued");
import renderer from 'react-test-renderer';
import { renderWithRedux } from '../../../../test-utils';

test('renders correctly', async() => {

    const { store } = renderWithRedux(<TodayJobOrderIssued />);
    expect(store).toMatchSnapshot()

    screen.debug("Joborder_issued")
    
});

// it('checks if Async Storage is used', async () => {
//     await asyncOperationOnAsyncStorage();
  
//     expect(AsyncStorage.getItem).toBeCalledWith(ASK.ASK_TOKEN);
//   })