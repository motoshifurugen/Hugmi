import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// アプリの初期画面として名言画面にリダイレクト
export default function Index() {
  // アプリ起動時に通知権限を確認
  useEffect(() => {
    (async () => {
      try {
        // Androidの場合は通知チャンネルを作成
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('routine', {
            name: 'ルーティン通知',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF9956',
          });
        }
        
        // 通知権限を確認（要求はしない - 設定画面から行う）
        const { status } = await Notifications.getPermissionsAsync();
      } catch (error) {
        // 通知権限の確認中のエラーは無視
      }
    })();
  }, []);

  // ルート「/」へのアクセスはルートレイアウトの初期ルート決定ロジックに任せる
  // メインルートへリダイレクト（具体的なタブパスを指定）
  return <Redirect href="/(tabs)/home" />;
} 