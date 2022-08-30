import React, {Component} from 'react';
import {StyleSheet, Text, View, Alert, AsyncStorage} from 'react-native';
import firebase from 'react-native-firebase';
export default class App extends Component{
  async componentDidMount() {
    this.checkPermission();
    this.createNotificationListeners();
  }
  componentWillUnmount() {
    this.notificationListener;
    this.notificationOpenedListener;
  }
  //Check whether Push Notifications are enabled or not
  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }
  //Get Device Registration Token
  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        console.log('fcmToken:', fcmToken);
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  }
  //Request for Push Notification
  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // If user allow Push Notification
      this.getToken();
    } catch (error) {
      // If user do not allow Push Notification
      console.log('Rejected');
    }
  }
  
  async createNotificationListeners() {
    
    // If your app is in Foreground
   
    this.notificationListener = firebase.notifications().onNotification((notification) => {
        const localNotification = new firebase.notifications.Notification({
          show_in_foreground: true,
        })
        .setNotificationId(notification.notificationId)
        .setTitle(notification.title)
        .setBody(notification.body)
        firebase.notifications()
          .displayNotification(localNotification)
          .catch(err => console.error(err));
    });

    //If your app is in background
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      const { title, body } = notificationOpen.notification;
      console.log('onNotificationOpened:');
      Alert.alert(title, body)
    });

    // If your app is closed
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      console.log('getInitialNotification:');
    }
    // For data only payload in foreground
    this.messageListener = firebase.messaging().onMessage
((message) => {
      //process data message
      console.log("Message", JSON.stringify(message));
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Push Notification Demo</Text>
        <Text style={styles.instructions}>By Neova Solutions..</Text>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
 