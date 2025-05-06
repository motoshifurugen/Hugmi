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

import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/db';
import { runAllSeeds } from '@/db/seeds';
import { migrateToNewSchema } from '@/db/utils/migration';
import CustomSplashScreen from '@/components/SplashScreen';
import { projectColors } from '@/constants/Colors';
import { setDbInitializedGlobal, setActiveUserId } from '@/components/quotes/DailyQuoteScreen';
import TutorialController from '@/components/common/TutorialController';
import { determineInitialRoute } from '@/constants/utils';

// スプラッシュスクリーンを手動で制御するために自動非表示を防ぐ
SplashScreen.preventAutoHideAsync().catch(() => {
  /* 自動非表示防止に失敗しても続行 */
});

// アニメーション状態の更新を監視するイベント
const ANIMATION_EVENTS = {
  COMPLETE: false
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
      console.log('[DEBUG] データベース初期化を開始...');
      
      // データベースからデータを読み込む前にスキーマの初期化を実行
      await db.initialize();
      console.log('データベースの初期化が完了しました');
      
      // 名言データが存在するか確認
      const { getAllQuotes } = await import('@/db/utils/quotes');
      const quotes = await getAllQuotes();
      console.log(`データベース内の名言数: ${quotes.length}`);
      
      if (quotes.length === 0) {
        // 名言データが存在しない場合は、シードデータだけを実行
        const { seedQuotes } = await import('@/db/seeds/quotes');
        await seedQuotes();
        console.log('名言シードデータの投入が完了しました');
      }
      
      if (resetDb) {
        // 開発モードでシードを実行（データクリア付き）
        await runAllSeeds(true);
        console.log('シードデータの投入が完了しました');
        
        // ユーザーデータを取得してアクティブユーザーIDを設定
        try {
          const { getAllUsers } = await import('@/db/utils/users');
          const users = await getAllUsers();
          if (users.length > 0) {
            const userId = users[0].id;
            setActiveUserId(userId);
            console.log(`[DEBUG] アクティブユーザーIDをグローバル設定: ${userId}`);
            
            // SecureStoreにも保存する
            try {
              await SecureStore.setItemAsync('active_user_id', userId);
              console.log(`[DEBUG] アクティブユーザーIDをSecureStoreに保存: ${userId}`);
            } catch (error) {
              console.error('アクティブユーザーIDの保存に失敗しました:', error);
            }
          }
        } catch (error) {
          console.error('ユーザーデータ取得エラー:', error);
        }
      } else {
        // シードデータが必要か確認する
        try {
          // ユーザーデータが正しく作成されているか確認
          const { getAllUsers } = await import('@/db/utils/users');
          const users = await getAllUsers();
          console.log(`データベース内のユーザー数: ${users.length}`);
          
          if (users.length === 0) {
            // ユーザーが存在しない場合、チュートリアルで作成するのでシードは実行しない
            console.log('ユーザーが見つかりません。チュートリアルで作成されるのを待ちます。');
          } else {
            console.log('最初のユーザー:', users[0].name);
            
            // アクティブユーザーIDをグローバル設定（最初のユーザー）
            const userId = users[0].id;
            setActiveUserId(userId);
            console.log(`[DEBUG] アクティブユーザーIDをグローバル設定: ${userId}`);
            
            // SecureStoreにも保存する
            try {
              await SecureStore.setItemAsync('active_user_id', userId);
              console.log(`[DEBUG] アクティブユーザーIDをSecureStoreに保存: ${userId}`);
            } catch (error) {
              console.error('アクティブユーザーIDの保存に失敗しました:', error);
            }
            
            // スキーマのマイグレーション（必要であれば）
            const migrationResult = await migrateToNewSchema();
            console.log('マイグレーション結果:', migrationResult ? '成功' : '不要または失敗');
          }
          
          // もう一度ユーザーデータを確認し、確実にアクティブユーザーIDを設定
          const allUsers = await getAllUsers();
          if (allUsers.length > 0) {
            const userId = allUsers[0].id;
            setActiveUserId(userId);
            console.log(`[DEBUG] アクティブユーザーとして設定: ${userId}`);
            
            // 朝の時間帯とルーティン状況に基づいて初期ルートを決定
            // ここで初回ログインかどうかを判定して渡す
            const tutorialCompleted = await SecureStore.getItemAsync('tutorial_completed');
            const isFirstLogin = tutorialCompleted === 'true' && await SecureStore.getItemAsync('first_route_after_tutorial') !== 'done';
            
            if (isFirstLogin) {
              // 初回ログイン後は名言画面に遷移するようフラグを渡す
              console.log('[DEBUG] チュートリアル完了後の初回ルート決定');
              const route = await determineInitialRoute(userId, true);
              setInitialRoute(route);
              
              // 初回ルート設定後にフラグを立てる
              await SecureStore.setItemAsync('first_route_after_tutorial', 'done');
            } else {
              // 通常のルート決定
              const route = await determineInitialRoute(userId);
              setInitialRoute(route);
            }
            
            console.log(`[DEBUG] 初期ルートを決定しました: ${initialRoute}`);
          } else {
            // ユーザーが存在しない場合はデフォルトでホーム画面へ（具体的なパスを指定）
            setInitialRoute('(tabs)/home');
          }
        } catch (error) {
          console.error('データ確認中にエラーが発生しました:', error);
          // エラーが発生した場合はデフォルトでホーム画面へ
          setInitialRoute('(tabs)/home');
        }
      }
      
      // データベース初期化完了を記録
      setDbInitialized(true);
      // DailyQuoteScreenコンポーネント用にグローバル状態を更新
      setDbInitializedGlobal(true);
      console.log('[DEBUG] データベース初期化完了フラグを設定しました');
    } catch (error) {
      console.error('データベースの初期化中にエラーが発生しました:', error);
      // エラー時もルートを設定して進める
      setInitialRoute('(tabs)/home'); // エラー時はホーム画面へ
      setDbInitialized(true); // エラー時も初期化完了とみなす
      setDbInitializedGlobal(true); // DailyQuoteScreen用の状態も更新
      console.log('[DEBUG] エラーが発生しましたが、データベース初期化完了フラグを設定しました');
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
          console.log('[DEBUG] Expoデフォルトスプラッシュスクリーンを非表示にしました');
          
          // データベース初期化を非同期で開始（待機あり）
          await initializeDatabase(false);
          
          if (showSplash) {
            setShowSplash(false);
            setForceNavigate(true);
          }
        } catch (e) {
          console.warn('スプラッシュスクリーンの非表示に失敗:', e);
          // エラー時もデータベース初期化を実行（待機あり）
          await initializeDatabase(false);
        }
      };
      
      hideDefaultSplashAndInitDb();
    }
  }, [fontsLoaded, initializeDatabase]);

  // カスタムスプラッシュスクリーンの完了コールバック
  const onSplashFinish = useCallback(() => {
    console.log('[DEBUG] スプラッシュ完了コールバックが呼び出されました');
    // 以下の条件で画面遷移する:
    // 1. データベース初期化が完了している場合
    if (dbInitialized) {
      console.log('[DEBUG] データベース初期化済み - スプラッシュ画面を非表示にします');
      setShowSplash(false);
    } else {
      console.log('[DEBUG] データベースがまだ初期化中です - スプラッシュ画面を継続表示します');
    }
  }, [dbInitialized]);

  // アニメーション完了時のコールバック
  const onAnimationComplete = useCallback(() => {
    console.log('[DEBUG] スプラッシュアニメーション完了イベントを発行します');
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
        onFinish={onSplashFinish} 
        extendAnimation={!dbInitialized}
        onAnimationComplete={onAnimationComplete}
      />
    );
  }

  // スプラッシュ画面表示中
  if (showSplash) {
    // カスタムスプラッシュスクリーンを表示
    return (
      <CustomSplashScreen 
        onFinish={onSplashFinish} 
        extendAnimation={!dbInitialized}
        onAnimationComplete={onAnimationComplete}
      />
    );
  }

  // メインアプリを表示
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <TutorialController>
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="daily-quote" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="quotes/daily" options={{ headerShown: false }} />
            <Stack.Screen name="quotes/detail" options={{ title: '名言詳細', headerTintColor: projectColors.text }} />
            <Stack.Screen name="routine-flow/routine" options={{ headerShown: false }} />
            <Stack.Screen name="routine-flow/morning-complete" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="settings/privacy-policy" options={{ title: 'プライバシーポリシー', headerTintColor: projectColors.text }} />
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
