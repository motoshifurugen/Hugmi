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

import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/db';
import { runAllSeeds } from '@/db/seeds';
import { migrateToNewSchema } from '@/db/utils/migration';
import CustomSplashScreen from '@/components/SplashScreen';
import { projectColors } from '@/constants/Colors';
import { setDbInitializedGlobal, setActiveUserId } from '@/components/quotes/DailyQuoteScreen';

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
      
      if (resetDb) {
        // 開発モードでシードを実行（データクリア付き）
        await runAllSeeds(true);
        console.log('シードデータの投入が完了しました');
        
        // ユーザーデータを取得してアクティブユーザーIDを設定
        try {
          const { getAllUsers } = await import('@/db/utils/users');
          const users = await getAllUsers();
          if (users.length > 0) {
            setActiveUserId(users[0].id);
            console.log(`[DEBUG] アクティブユーザーとして設定: ${users[0].id}`);
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
            // ユーザーが存在しない場合はシードを実行するが、削除はしない
            console.log('ユーザーが見つからないため、シードデータを投入します（削除なし）');
            await runAllSeeds(false);
            console.log('シードデータの投入が完了しました');
          } else {
            console.log('最初のユーザー:', users[0].name);
            
            // アクティブユーザーIDをグローバル設定（最初のユーザー）
            setActiveUserId(users[0].id);
            
            // スキーマのマイグレーション（必要であれば）
            const migrationResult = await migrateToNewSchema();
            console.log('マイグレーション結果:', migrationResult ? '成功' : '不要または失敗');
          }
          
          // もう一度ユーザーデータを確認し、確実にアクティブユーザーIDを設定
          const allUsers = await getAllUsers();
          if (allUsers.length > 0) {
            setActiveUserId(allUsers[0].id);
            console.log(`[DEBUG] アクティブユーザーとして設定: ${allUsers[0].id}`);
          }
        } catch (error) {
          console.error('データ確認中にエラーが発生しました。必要最小限の初期化を実行します:', error);
          try {
            // エラーが発生した場合でも、基本的なユーザーデータは作成しておく
            const { seedUsers } = await import('@/db/seeds/users');
            const user = await seedUsers();
            if (user) {
              // 作成したユーザーIDをグローバル設定
              setActiveUserId(user.id);
              console.log(`[DEBUG] 緊急作成したユーザーをアクティブに設定: ${user.id}`);
            }
          } catch (seedError) {
            console.error('緊急シード処理に失敗しました:', seedError);
          }
        }
      }
      
      // 初期ルートとして名言画面を設定
      setInitialRoute('daily-quote');
      // データベース初期化完了を記録
      setDbInitialized(true);
      // DailyQuoteScreenコンポーネント用にグローバル状態を更新
      setDbInitializedGlobal(true);
      console.log('[DEBUG] データベース初期化完了フラグを設定しました');
    } catch (error) {
      console.error('データベースの初期化中にエラーが発生しました:', error);
      // エラー時もルートを設定して進める
      setInitialRoute('daily-quote');
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
          
          // // タイムアウト時間を延長（安全策）
          // // データベース初期化後のアニメーション処理に十分な時間を与える
          // setTimeout(() => {
            if (showSplash) {
              // console.log('[DEBUG] データベース初期化後5秒経過 - 画面遷移を強制します');
              setShowSplash(false);
              setForceNavigate(true);
            }
          // }, 5000);
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
    // 2. または強制ナビゲーションフラグがオンの場合
    if (dbInitialized || forceNavigate) {
      console.log('[DEBUG] 条件を満たしたのでスプラッシュ画面を非表示にします');
      setShowSplash(false);
    } else {
      console.log('[DEBUG] データベース初期化待ちのため、まだスプラッシュ画面を表示します');
    }
  }, [dbInitialized, forceNavigate]);

  // データベース初期化状態の変更を監視
  useEffect(() => {
    if (dbInitialized) {
      console.log('[DEBUG] データベース初期化完了を検知しました');
      
      // アニメーションの完了状態を確認
      if (ANIMATION_EVENTS.COMPLETE) {
        console.log('[DEBUG] アニメーションも完了しているため、画面遷移を実行します');
        setShowSplash(false);
      } else {
        console.log('[DEBUG] アニメーション完了待ちです');
      }
    }
  }, [dbInitialized]);

  // アニメーション完了時のコールバック
  const onAnimationComplete = useCallback(() => {
    console.log('[DEBUG] スプラッシュアニメーション完了コールバックが呼び出されました');
    console.log('[DEBUG] データベース初期化状態:', dbInitialized ? '完了' : '進行中');
    
    // アニメーション完了フラグを設定
    ANIMATION_EVENTS.COMPLETE = true;
    
    // データベース初期化が完了している場合は、スプラッシュ画面を非表示にする準備を整える
    if (dbInitialized) {
      console.log('[DEBUG] アニメーション完了時点でデータベース初期化済み - すぐに遷移します');
      // 少し遅延を入れてUIの更新に時間を与える
      setTimeout(() => {
        setShowSplash(false);
      }, 100);
    } else {
      console.log('[DEBUG] アニメーション完了だがデータベース初期化待ち - ローディング表示に移行');
    }
  }, [dbInitialized]);

  // フォントがロードされていない場合、何も表示しない
  // (Expoのデフォルトスプラッシュスクリーンが表示されたまま)
  if (!fontsLoaded) {
    return null;
  }

  // 状態をチェックして強制的に画面遷移
  if (forceNavigate && showSplash) {
    console.log('強制ナビゲーションによりスプラッシュ画面を非表示にします');
    setShowSplash(false);
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {initialRoute || forceNavigate ? (
          <>
            <Stack 
              initialRouteName="daily-quote"
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                animationDuration: 450,
                presentation: 'transparentModal',
                contentStyle: { backgroundColor: projectColors.white1 }
              }}
            >
              <Stack.Screen name="daily-quote" options={{ headerShown: false, contentStyle: { backgroundColor: projectColors.white1 } }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false, contentStyle: { backgroundColor: projectColors.white1 } }} />
              <Stack.Screen name="+not-found" options={{ contentStyle: { backgroundColor: projectColors.white1 } }} />
            </Stack>
            
            {/* スプラッシュ画面をオーバーレイとして表示 */}
            {showSplash && (
              <View style={styles.splashOverlay}>
                <CustomSplashScreen
                  onFinish={onSplashFinish}
                  extendAnimation={!dbInitialized && !forceNavigate} // データベース初期化が完了していない場合は延長モード
                  onAnimationComplete={onAnimationComplete}
                />
              </View>
            )}
          </>
        ) : (
          // 初期ルートが設定されるまではカスタムスプラッシュスクリーンのみ表示
          <View style={styles.splashOverlay}>
            <CustomSplashScreen
              onFinish={onSplashFinish}
              extendAnimation={!dbInitialized && !forceNavigate} // データベース初期化が完了していない場合は延長モード
              onAnimationComplete={onAnimationComplete}
            />
          </View>
        )}
        
        <StatusBar style="auto" />
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
