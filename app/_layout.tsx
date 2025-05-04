import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { View, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/db';
import { runAllSeeds } from '@/db/seeds';
import { migrateToNewSchema } from '@/db/utils/migration';
import CustomSplashScreen from '@/components/SplashScreen';
import { projectColors } from '@/constants/Colors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async (resetDb = false) => {
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
        
        // データベース初期化完了フラグを設定
        setDbInitialized(true);
        
        // 初期ルートとして名言画面を設定
        setInitialRoute('daily-quote');
      } catch (error) {
        console.error('データベースの初期化中にエラーが発生しました:', error);
        // エラー時もルートを設定して進める
        setInitialRoute('daily-quote');
      }
    };

    // データベースを初期化する - 第一引数をtrueにするとデータベースをリセットします
    // 本番環境ではfalseに設定すること
    initializeDatabase(false);
  }, []);

  useEffect(() => {
    const prepare = async () => {
      if (loaded) {
        try {
          // Expoのデフォルトスプラッシュ画面を非表示にする
          await SplashScreen.hideAsync();
          // アプリの準備完了フラグを立てる
          setAppReady(true);
        } catch (e) {
          console.warn(e);
        }
      }
    };

    prepare();
  }, [loaded]);

  const onSplashFinish = () => {
    setShowSplash(false);
  };

  if (!loaded || !appReady) {
    return null;
  }

  if (showSplash) {
    return <CustomSplashScreen onFinish={onSplashFinish} />;
  }

  // 初期ルートが決定されていなければローディング表示
  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={projectColors.primary} />
        <StatusBar style="auto" />
      </View>
    );
  }

  // 初期ルートへリダイレクト
  if (initialRoute !== 'daily-quote') {
    return <Redirect href="/daily-quote" />;
  }

  // スプラッシュ画面後は名言画面へ遷移
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
        <Stack.Screen name="daily-quote" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
