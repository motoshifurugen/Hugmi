import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import DailyQuoteScreen from '@/components/quotes/DailyQuoteScreen';

export default function DailyQuoteRoute() {
  // 朝のルーティン開始または別の画面へ遷移
  const handleStart = () => {
    // 将来的には時間によって遷移先を変更する
    // 朝: ルーティン開始画面へ
    // それ以外: ホーム画面へ
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <DailyQuoteScreen onStart={handleStart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 