import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback, useRef } from 'react';
import 'react-native-reanimated';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts as useCustomFonts, ZenMaruGothic_400Regular, ZenMaruGothic_500Medium, ZenMaruGothic_700Bold } from '@expo-google-fonts/zen-maru-gothic';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/db';
import { runAllSeeds } from '@/db/seeds';
import { migrateToNewSchema } from '@/db/utils/migration';
import CustomSplashScreen from '@/components/SplashScreen';
import { projectColors } from '@/constants/Colors';
import { setDbInitializedGlobal, setActiveUserId } from '@/components/quotes/DailyQuoteScreen';
import TutorialController from '@/components/common/TutorialController';
import FeedbackBanner from '@/components/common/FeedbackBanner';
import { determineInitialRoute } from '@/constants/utils';
import { scheduleRoutineNotification, setupNotifications } from '@/hooks/notificationService';

// スプラッシュスクリーンを手動で制御するために自動非表示を防ぐ
SplashScreen.preventAutoHideAsync().catch(() => {
  /* 自動非表示防止に失敗しても続行 */
});

// アニメーション状態の更新を監視するイベント
const ANIMATION_EVENTS = {
  COMPLETE: false
};

// ユーザーIDが設定されたときに通知を設定する共通関数
const setupUserNotifications = async (userId: string) => {
  try {
    await setupNotifications(userId);
  } catch (error) {
    // 通知設定中のエラーは無視
  }
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [dbInitialized, setDbInitialized] = useState(false); // データベース初期化状態を追跡
  const [forceNavigate, setForceNavigate] = useState(false); // 強制ナビゲーション用フラグ
  
  // システムフォントを読み込む
  const [systemFontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  
  // カスタムフォントを読み込む
  const [customFontsLoaded] = useCustomFonts({
    ZenMaruGothic_400Regular,
    ZenMaruGothic_500Medium,
    ZenMaruGothic_700Bold,
  });
  
  // すべてのフォントがロードされたかチェック
  const fontsLoaded = systemFontsLoaded && customFontsLoaded;
  
  // データベース初期化処理
  const initializeDatabase = useCallback(async (resetDb = true) => {
    try {
      // データベースからデータを読み込む前にスキーマの初期化を実行
      await db.initialize();
      
      // 名言データが存在するか確認
      const { getAllQuotes } = await import('@/db/utils/quotes');
      const quotes = await getAllQuotes();
      
      if (quotes.length === 0) {
        // 名言データが存在しない場合は、シードデータだけを実行
        const { seedQuotes } = await import('@/db/seeds/quotes');
        await seedQuotes();
      }
      
      if (resetDb) {
        // 開発モードでシードを実行（データクリア付き）
        await runAllSeeds(true);
        
        // ユーザーデータを取得してアクティブユーザーIDを設定
        try {
          const { getAllUsers } = await import('@/db/utils/users');
          const users = await getAllUsers();
          if (users.length > 0) {
            const userId = users[0].id;
            setActiveUserId(userId);
            
            // 通知を設定
            await setupUserNotifications(userId);
            
            // SecureStoreにも保存する
            try {
              await SecureStore.setItemAsync('active_user_id', userId);
            } catch (error) {
              // エラー時は無視
            }
          }
        } catch (error) {
          // エラー時は無視
        }
      } else {
        // シードデータが必要か確認する
        try {
          // ユーザーデータが正しく作成されているか確認
          const { getAllUsers } = await import('@/db/utils/users');
          const users = await getAllUsers();
          
          if (users.length === 0) {
            // ユーザーが存在しない場合、チュートリアルで作成するのでシードは実行しない
          } else {
            // アクティブユーザーIDをグローバル設定（最初のユーザー）
            const userId = users[0].id;
            setActiveUserId(userId);
            
            // 通知を設定
            await setupUserNotifications(userId);
            
            // SecureStoreにも保存する
            try {
              await SecureStore.setItemAsync('active_user_id', userId);
            } catch (error) {
              // エラー時は無視
            }
            
            // スキーマのマイグレーション（必要であれば）
            const migrationResult = await migrateToNewSchema();
          }
          
          // もう一度ユーザーデータを確認し、確実にアクティブユーザーIDを設定
          const allUsers = await getAllUsers();
          if (allUsers.length > 0) {
            const userId = allUsers[0].id;
            setActiveUserId(userId);
            
            // 朝の時間帯とルーティン状況に基づいて初期ルートを決定
            // ここで初回ログインかどうかを判定して渡す
            const tutorialCompleted = await SecureStore.getItemAsync('tutorial_completed');
            const isFirstLogin = tutorialCompleted === 'true' && await SecureStore.getItemAsync('first_route_after_tutorial') !== 'done';
            
            if (isFirstLogin) {
              // 初回ログイン後は名言画面に遷移するようフラグを渡す
              const route = await determineInitialRoute(userId, true);
              setInitialRoute(route);
              
              // 初回ルート設定後にフラグを立てる
              await SecureStore.setItemAsync('first_route_after_tutorial', 'done');
            } else {
              // 通常のルート決定
              const route = await determineInitialRoute(userId);
              setInitialRoute(route);
            }
          } else {
            // ユーザーが存在しない場合はデフォルトでホーム画面へ（具体的なパスを指定）
            setInitialRoute('(tabs)/home');
          }
        } catch (error) {
          // エラーが発生した場合はデフォルトでホーム画面へ
          setInitialRoute('(tabs)/home');
        }
      }
      
      // データベース初期化完了を記録
      setDbInitialized(true);
      // DailyQuoteScreenコンポーネント用にグローバル状態を更新
      setDbInitializedGlobal(true);
    } catch (error) {
      // エラー時もルートを設定して進める
      setInitialRoute('(tabs)/home'); // エラー時はホーム画面へ
      setDbInitialized(true); // エラー時も初期化完了とみなす
      setDbInitializedGlobal(true); // DailyQuoteScreen用の状態も更新
    }
  }, []);
  
  // フォントロード完了後、Expoのデフォルトスプラッシュスクリーンを非表示にしてカスタムスプラッシュスクリーンを表示
  useEffect(() => {
    if (fontsLoaded) {
      // フォントロード完了後、すぐにデータベース初期化を開始
      const hideDefaultSplashAndInitDb = async () => {
        try {
          // Expoデフォルトスプラッシュスクリーンを非表示にする
          await SplashScreen.hideAsync();
          
          // データベース初期化を非同期で開始（待機あり）
          await initializeDatabase(false);
          
          if (showSplash) {
            setShowSplash(false);
            setForceNavigate(true);
          }
        } catch (e) {
          // エラー時もデータベース初期化を実行（待機あり）
          await initializeDatabase(false);
        }
      };
      
      hideDefaultSplashAndInitDb();
    }
  }, [fontsLoaded, initializeDatabase]);

  // useEffectでデータベース初期化完了時とアニメーション完了時の両方をチェック
  useEffect(() => {
    // アニメーション完了かつデータベース初期化完了のときスプラッシュを非表示
    if (ANIMATION_EVENTS.COMPLETE && dbInitialized) {
      // フラグをリセット（不要だが念のため）
      ANIMATION_EVENTS.COMPLETE = false;
      setShowSplash(false);
    }
  }, [dbInitialized]);

  // アニメーション完了時のコールバック
  const onAnimationComplete = useCallback(() => {
    // イベント発行
    ANIMATION_EVENTS.COMPLETE = true;
  }, []);

  // まだフォントがロードされていない場合
  if (!fontsLoaded) {
    return null;
  }

  // 初期ルートがまだ設定されていない場合（データベース初期化中）
  if (!initialRoute) {
    // カスタムスプラッシュスクリーンを表示
    return (
      <CustomSplashScreen 
        onFinish={onAnimationComplete} 
        extendAnimation={!dbInitialized}
      />
    );
  }

  // スプラッシュ画面表示中
  if (showSplash) {
    // カスタムスプラッシュスクリーンを表示
    return (
      <CustomSplashScreen 
        onFinish={onAnimationComplete} 
        extendAnimation={!dbInitialized}
      />
    );
  }

  // メインアプリを表示
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider 
        value={{
          // ベースのテーマを拡張して背景色を設定
          ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
          colors: {
            ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
            // 背景色を projectColors.white1 に設定
            background: projectColors.white1,
            card: projectColors.white1,
          },
        }}
      >
        {/* <FeedbackBanner /> */}
        <TutorialController>
          <Stack 
            screenOptions={{ 
              headerShown: false, 
              animation: 'fade',
              animationDuration: 300,
              // 画面背景色を統一
              contentStyle: { backgroundColor: projectColors.white1 }
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen 
              name="daily-quote" 
              options={{ 
                headerShown: false, 
                animation: 'fade',
                contentStyle: { backgroundColor: projectColors.white1 }
              }} 
            />
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                headerShown: false,
                animation: 'fade_from_bottom',
                contentStyle: { backgroundColor: projectColors.white1 }
              }} 
            />
            <Stack.Screen 
              name="quotes/daily" 
              options={{ 
                headerShown: false,
                animation: 'fade',
                contentStyle: { backgroundColor: projectColors.white1 }
              }} 
            />
            <Stack.Screen 
              name="quotes/detail" 
              options={{ 
                title: '名言詳細', 
                headerTintColor: projectColors.text,
                animation: 'fade',
                contentStyle: { backgroundColor: projectColors.white1 }
              }} 
            />
            <Stack.Screen 
              name="routine-flow/routine" 
              options={{ 
                headerShown: false,
                animation: 'fade',
                contentStyle: { backgroundColor: projectColors.white1 }
              }} 
            />
            <Stack.Screen 
              name="routine-flow/morning-complete" 
              options={{ 
                headerShown: false, 
                animation: 'fade',
                contentStyle: { backgroundColor: projectColors.white1 }
              }} 
            />
            <Stack.Screen 
              name="settings/privacy-policy" 
              options={{ 
                title: 'プライバシーポリシー', 
                headerTintColor: projectColors.text,
                animation: 'fade',
                contentStyle: { backgroundColor: projectColors.white1 }
              }} 
            />
          </Stack>
        </TutorialController>
        {/* StatusBar設定 */}
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: projectColors.white1,
  }
});
