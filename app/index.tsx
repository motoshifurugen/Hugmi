import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View } from 'react-native';
import { determineInitialRoute } from '@/constants/utils';
import { projectColors } from '@/constants/Colors';
import Logger from '@/utils/logger';
import { AppRoute } from '@/types/routeTypes';

// アプリの初期画面
export default function Index() {
  const [initialRoute, setInitialRoute] = useState<AppRoute | null>(null);

  // アプリ起動時に通知権限を確認し、適切なルートを決定
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
        
        // アクティブユーザーIDを取得
        const userId = await SecureStore.getItemAsync('active_user_id');
        
        if (userId) {
          // 初期ルートを決定
          const route = await determineInitialRoute(userId);
          Logger.debug('index.tsx - 初期ルート決定:', route);
          setInitialRoute(route);
        } else {
          // ユーザーIDがない場合はホーム画面へ
          setInitialRoute('/(tabs)/home');
        }
      } catch (error) {
        Logger.error('初期ルート決定エラー:', error);
        // エラー時はホーム画面へ
        setInitialRoute('/(tabs)/home');
      }
    })();
  }, []);

  // 初期ルートが決定されるまでローディング表示
  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: projectColors.white1 }}>
        <ActivityIndicator size="large" color={projectColors.primary} />
      </View>
    );
  }

  // 決定したルートへリダイレクト
  return <Redirect href={initialRoute} />;
} 