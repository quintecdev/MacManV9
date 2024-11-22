/**
 * @format
 */

 import 'react-native';
 import React from 'react';
 
 
 // Note: test renderer must be required after react-native.
 import renderer,{create,act} from 'react-test-renderer';
import JobStartingPopUp from '../JobStartingPopUp';
 
 it('renders correctly', () => {
   renderer.create(<JobStartingPopUp />);
 });
 