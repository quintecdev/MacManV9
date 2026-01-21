import { Platform, Alert, Linking, PermissionsAndroid } from 'react-native';

export const checkAndRequestNotificationPermission = async (AppTextData = {}) => {
  if (Platform.OS !== 'android') return true;

  try {
    const androidVersion = Platform.constants?.Release
      ? parseInt(Platform.constants.Release, 10)
      : 0;

    if (androidVersion >= 13) {
      const granted = await PermissionsAndroid.request(
        'android.permission.POST_NOTIFICATIONS'
      );

      console.debug('Notification permission status:', granted);

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          AppTextData.permission_required || 'Permission Required',
          AppTextData.please_enable_notification_permission_in_app_settings ||
            'Please enable notification permission in app settings.',
          [
            {
              text: AppTextData.txt_Cancel || 'Cancel',
              onPress: () => Linking.openSettings(),
              style: 'cancel',
            },
            {
              text: AppTextData.txt_Yes || 'Yes',
              onPress: () => {
                console.log('Yes Pressed');
              },
            },
          ],
          { cancelable: false },
        );
        return false;
      }
    } else {
      const authStatus = await messaging().hasPermission?.();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        await messaging().requestPermission();
      }

      return enabled;
    }
  } catch (error) {
    console.debug('Permission failed:', error);
    return true;
  }
};