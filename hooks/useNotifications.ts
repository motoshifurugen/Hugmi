import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';

// 通知の表示設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * 通知関連の機能を提供するカスタムフック
 */
export const useNotifications = () => {
  const [permission, setPermission] = useState<Notifications.PermissionStatus | null>(null);

  // 通知の権限を取得する関数
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('routine', {
        name: 'ルーティン通知',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF9956',
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    setPermission(status);
    return status;
  };

  // 通知をスケジュールする関数
  const scheduleRoutineNotification = async (
    time: string,  // "HH:MM" 形式の時間
    title: string,
    body: string
  ) => {
    // 既存の通知をキャンセル
    await cancelRoutineNotifications();

    // 時間をパース
    const [hours, minutes] = time.split(':').map(Number);

    // 次の通知時間を計算
    const now = new Date();
    const notificationDate = new Date();
    notificationDate.setHours(hours, minutes, 0, 0);

    // 既に今日の通知時間を過ぎていたら明日に設定
    if (notificationDate <= now) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }

    // 通知トリガーの作成
    const trigger = {
      hour: hours,
      minute: minutes,
      repeats: true,
    };

    // 通知のスケジュール
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'routine' },
      },
      trigger,
      identifier: 'routine-notification',
    });

    console.log('通知がスケジュールされました。ID:', id);
    return id;
  };

  // ルーティン通知をキャンセルする関数
  const cancelRoutineNotifications = async () => {
    // スケジュールされている全ての通知を取得
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // ルーティン通知のIDを抽出してキャンセル
    const routineNotificationIds = scheduledNotifications
      .filter(notification => 
        notification.identifier === 'routine-notification' || 
        (notification.content.data && notification.content.data.type === 'routine')
      )
      .map(notification => notification.identifier);

    // 各通知をキャンセル
    for (const id of routineNotificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
      console.log('通知がキャンセルされました。ID:', id);
    }
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
    scheduleRoutineNotification,
    cancelRoutineNotifications,
  };
}; 