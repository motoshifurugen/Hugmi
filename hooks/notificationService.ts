import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';

// 通知の表示設定（グローバル共通設定）
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Androidのチャンネルを設定
export const setupNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('routine', {
      name: 'ルーティン通知',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF9956',
    });
  }
};

// 通知の権限を取得する関数
export const getNotificationPermissions = async () => {
  await setupNotificationChannels();
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
};

// 通知をスケジュールする関数
export const scheduleRoutineNotification = async (
  time: string,  // "HH:MM" 形式の時間
  title: string,
  body: string,
  immediate: boolean = false, // このパラメータは互換性のために残すが、常にfalseとして扱う
  force: boolean = false // 既存の通知を強制的に置き換えるフラグ（デフォルトはfalse）
) => {
  // 互換性のための処理: immediateパラメータは常に無視する
  immediate = false;
  
  try {
    // 既存の通知をチェック
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const existingNotification = scheduledNotifications.find(
      notification => notification.identifier === 'routine-notification'
    );
    
    // 既に通知がスケジュールされている場合の処理
    if (existingNotification) {
      // forceがtrueの場合のみ既存の通知を置き換える
      if (force) {
        console.log('既存の通知を強制的に置き換えます');
        await cancelRoutineNotifications();
      } else {
        // forceがfalseの場合は既存の通知をそのまま維持
        console.log('既存の通知が見つかりました。新規スケジュールをスキップします。');
        return existingNotification.identifier;
      }
    }

    // 時間をパース
    const [hours, minutes] = time.split(':').map(Number);

    // 通知トリガーの作成 - DailyTrigger（毎日同じ時間に繰り返し）
    const trigger = {
      hour: hours,
      minute: minutes,
      type: 'daily'
    } as Notifications.DailyTriggerInput;

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

    console.log(`通知が${hours}:${minutes}にスケジュールされました。ID:`, id);
    return id;
  } catch (error) {
    console.error('通知のスケジュール中にエラーが発生しました:', error);
    throw error;
  }
};

// ルーティン通知をキャンセルする関数
export const cancelRoutineNotifications = async () => {
  // スケジュールされている全ての通知を取得
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  // ルーティン通知のIDを抽出してキャンセル
  const routineNotificationIds = scheduledNotifications
    .filter(notification => 
      notification.identifier === 'routine-notification' || 
      notification.identifier === 'immediate-routine-notification' ||
      (notification.content.data && notification.content.data.type === 'routine')
    )
    .map(notification => notification.identifier);

  // 各通知をキャンセル
  for (const id of routineNotificationIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
    console.log('通知がキャンセルされました。ID:', id);
  }
};

// ユーザーの通知を設定する関数
export const setupNotifications = async (userId: string) => {
  try {
    // 通知の権限を確認
    const { status } = await Notifications.getPermissionsAsync();
    
    if (status === 'granted') {
      // ユーザー設定を取得
      const { getUserById } = await import('@/db/utils/users');
      const user = await getUserById(userId);
      
      if (user && user.routineStartTime) {
        // 現在スケジュールされている通知を確認
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        // 定期通知と即時通知の両方をチェック
        const hasAnyNotification = scheduledNotifications.some(
          notification => 
            notification.identifier === 'routine-notification' || 
            notification.identifier === 'immediate-routine-notification'
        );
        
        // すでに通知がスケジュールされている場合は再設定しない
        if (!hasAnyNotification) {
          // ユーザーが設定したルーティン開始時間に通知をスケジュール
          await scheduleRoutineNotification(
            user.routineStartTime,
            'おはようございます。',
            '今日も、Hugmiといっしょにルーティンを始めましょう✨',
            false, // 即時実行しない - 常にfalseにする
            false  // 既存の通知を強制的に置き換えない
          );
          
          console.log(`[DEBUG] ルーティン通知をスケジュールしました: ${user.routineStartTime}`);
        } else {
          console.log('[DEBUG] 通知はすでにスケジュールされています。再設定をスキップします。');
        }
      }
    }
  } catch (error) {
    console.error('通知の設定中にエラーが発生しました:', error);
  }
}; 