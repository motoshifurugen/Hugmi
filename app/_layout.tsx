import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback } from 'react';
import 'react-native-reanimated';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts as useCustomFonts, ZenMaruGothic_400Regular, ZenMaruGothic_500Medium, ZenMaruGothic_700Bold } from '@expo-google-fonts/zen-maru-gothic';

import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/db';
import { runAllSeeds } from '@/db/seeds';
import { migrateToNewSchema } from '@/db/utils/migration';
import CustomSplashScreen from '@/components/SplashScreen';
import { projectColors } from '@/constants/Colors';

// スプラッシュスクリーンを手動で制御するために自動非表示を防ぐ
SplashScreen.preventAutoHideAsync().catch(() => {
  /* 自動非表示防止に失敗しても続行 */
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [dbInitialized, setDbInitialized] = useState(false); // データベース初期化状態を追跡
  
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
  const initializeDatabase = useCallback(async (resetDb = false) => {
    try {
      console.log('[DEBUG] データベース初期化を開始...');
      
      if (resetDb) {
        // データベースをリセットする（デバッグ用）
        console.log('[DEBUG] データベースのリセットを試みます');
        const sqliteDb = db.getDatabase();
        
        // 既存のテーブルを削除
        const tables = ['viewed_quotes', 'favorite_quotes', 'mood_logs', 'routine_logs', 'routines', 'quotes', 'users'];
        for (const table of tables) {
          try {
            console.log(`[DEBUG] ${table}テーブルを削除中...`);
            await sqliteDb.execAsync(`DROP TABLE IF EXISTS ${table}`);
          } catch (dropError) {
            console.error(`[DEBUG] ${table}テーブルの削除に失敗:`, dropError);
          }
        }
      }
      
      // データベースの初期化
      await db.initialize();
      console.log('データベースの初期化が完了しました');
      
      // スキーマのマイグレーション
      const migrationResult = await migrateToNewSchema();
      console.log('マイグレーション結果:', migrationResult ? '成功' : '不要または失敗');
      
      // 開発環境または必要に応じてシードデータを実行
      await runAllSeeds();
      console.log('シードデータの投入が完了しました');
      
      // 初期ルートとして名言画面を設定
      setInitialRoute('daily-quote');
      // データベース初期化完了を記録
      setDbInitialized(true);
    } catch (error) {
      console.error('データベースの初期化中にエラーが発生しました:', error);
      // エラー時もルートを設定して進める
      setInitialRoute('daily-quote');
      setDbInitialized(true); // エラー時も初期化完了とみなす
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
          // データベース初期化を非同期で開始（待機せず）
          initializeDatabase(false);
        } catch (e) {
          console.warn('スプラッシュスクリーンの非表示に失敗:', e);
          // エラー時もデータベース初期化を実行
          initializeDatabase(false);
        }
      };
      
      hideDefaultSplashAndInitDb();
    }
  }, [fontsLoaded, initializeDatabase]);

  // カスタムスプラッシュスクリーンの完了コールバック
  const onSplashFinish = useCallback(() => {
    // アニメーションとデータベース初期化の両方が完了したらスプラッシュを非表示
    if (dbInitialized) {
      setShowSplash(false);
    }
    // データベース初期化がまだ完了していない場合は、
    // CustomSplashScreenのextendAnimationにより引き続きスプラッシュ表示
  }, [dbInitialized]);

  // アニメーション完了時のコールバック
  const onAnimationComplete = useCallback(() => {
    console.log('スプラッシュアニメーション完了、データベース初期化状態:', dbInitialized ? '完了' : '進行中');
  }, [dbInitialized]);

  // フォントがロードされていない場合、何も表示しない
  // (Expoのデフォルトスプラッシュスクリーンが表示されたまま)
  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {initialRoute ? (
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
                extendAnimation={!dbInitialized} // データベース初期化が完了していない場合は延長モード
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
            extendAnimation={!dbInitialized} // データベース初期化が完了していない場合は延長モード
            onAnimationComplete={onAnimationComplete}
          />
        </View>
      )}
      
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: projectColors.white1,
  }
});
