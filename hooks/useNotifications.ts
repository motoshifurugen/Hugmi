import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { 
  getNotificationPermissions, 
  scheduleRoutineNotification as scheduleNotification,
  scheduleNightNotification as scheduleNightNotify,
  cancelRoutineNotifications as cancelNotifications,
  cancelNightNotifications as cancelNightNotify
} from './notificationService';

/**
 * 通知関連の機能を提供するカスタムフック
 */
export const useNotifications = () => {
  const [permission, setPermission] = useState<Notifications.PermissionStatus | null>(null);

  // 通知の権限を取得する関数
  const requestPermissions = async () => {
    const status = await getNotificationPermissions();
    setPermission(status);
    return status;
  };

  // コンポーネント初期化時に権限を確認
  useEffect(() => {
    (async () => {
      const status = await Notifications.getPermissionsAsync();
      setPermission(status.status);
    })();
  }, []);

  return {
    permission,
    requestPermissions,
    scheduleRoutineNotification: scheduleNotification,
    scheduleNightNotification: scheduleNightNotify,
    cancelRoutineNotifications: cancelNotifications,
    cancelNightNotifications: cancelNightNotify
  };
};

// サービス関数をエクスポートして、コンポーネント外からも使用できるようにする
export { 
  scheduleNotification as scheduleRoutineNotification, 
  scheduleNightNotify as scheduleNightNotification,
  cancelNotifications as cancelRoutineNotifications,
  cancelNightNotify as cancelNightNotifications
}; 