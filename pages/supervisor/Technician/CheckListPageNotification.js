import {View, Text, ScrollView, FlatList, SafeAreaView} from 'react-native';
import React from 'react';
import {deviceWidth} from '../../../common/components/LoaderComponent';
import {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useDispatch} from 'react-redux';
import {actionSetLoading} from '../../../action/ActionSettings';
import {actionSetSupCheckListNotificationVisit} from '../../../action/ActionPageVisit';
import requestWithEndUrl from '../../../network/request';
import {API_SUPERVISOR} from '../../../network/api_constants';
const CheckListPageNotification = ({route: {params}}) => {
  const dispatch = useDispatch();
  const {loggedUser} = useSelector((state) => state.LoginReducer);
  const {AppTextData} = useSelector((state) => state.AppTextViewReducer);
  const [cards, setCards] = useState([]);
  const [noNotification, setNoNotification] = useState(false);
  console.log('params from homepage===>>', params);
  console.log('user Details==>>', loggedUser.TechnicianID);
  useEffect(() => {
    CardsDetails();
  }, []);
  console.error('card details from the state===>>>', cards);
  async function CardsDetails() {
    dispatch(actionSetLoading(true));
    try {
      const GetCardDetails = await requestWithEndUrl(
        `${API_SUPERVISOR}GetCheckListAbnormalityJobList`,
        {SEID: loggedUser.TechnicianID},
      );
      if (GetCardDetails.data.length > 0) {
        setCards(GetCardDetails.data);
        setNoNotification(false);
      } else {
        setNoNotification(true);
      }
      dispatch(actionSetSupCheckListNotificationVisit(true));
      dispatch(actionSetLoading(false));
    } catch (error) {
      console.log('cardDetailfetch error', error);
      dispatch(actionSetLoading(false));
    }
  }
  return (
    <View style={{flex: 1}}>
      {noNotification == false ? (
        <FlatList
          data={cards}
          contentContainerStyle={{width: deviceWidth, paddingVertical: 15}}
          renderItem={({item}) => (
            <View style={{alignItems: 'center'}}>
              <View
                style={{
                  width: (deviceWidth / 100) * 95,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  padding: 12,
                  marginVertical: 6,
                  elevation: 10,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight: 'bold', color: 'gray'}}>
                      {AppTextData.txt_Technician}{' '}
                    </Text>
                    <Text style={{color: 'green', fontWeight: '700'}}>
                      {item.Technician}
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight: 'bold'}}>JO Number : </Text>
                    <Text style={{color: 'green', fontWeight: '700'}}>
                      {item.JONumber}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight: 'bold'}}>
                      {AppTextData.txt_Job_Type}:{' '}
                    </Text>
                    <Text style={{color: 'green', fontWeight: '700'}}>
                      {item.JobType}
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight: 'bold'}}>
                      {AppTextData.txt_JOR_Number}:{' '}
                    </Text>
                    <Text style={{color: 'green', fontWeight: '700'}}>
                      {item.JORNumber}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    marginTop: 5,
                    alignSelf: 'center',
                    fontWeight: 'bold',
                    color: 'grey',
                  }}>
                  {item.AssetName}
                </Text>
                <View
                  style={{
                    borderTopWidth: 0.8,
                    borderTopColor: 'silver',
                    marginVertical: 5,
                  }}
                />
                <Text
                  style={{
                    fontWeight: 'bold',
                    alignSelf: 'center',
                    color: 'black',
                  }}>
                  {AppTextData.txt_Abnormality_Note}
                </Text>
                <Text>{item.AbnormalityNote}</Text>
              </View>
            </View>
          )}></FlatList>
      ) : (
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <Text style={{fontSize: 18, color: 'grey'}}>
            {AppTextData.txt_No_new_notifications}
          </Text>
        </View>
      )}
    </View>
  );
};

export default CheckListPageNotification;
