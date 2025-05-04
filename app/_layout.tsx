import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { View } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/db';
import { runAllSeeds } from '@/db/seeds';
import CustomSplashScreen from '@/components/SplashScreen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await db.initialize();
        console.log('Database initialized successfully');
        
        // 開発環境または必要に応じてシードデータを実行
        // 本番環境では条件分岐などで制御するとよい
        await runAllSeeds();
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initializeDatabase();
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

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
