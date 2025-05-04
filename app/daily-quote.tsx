import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import DailyQuoteScreen from '@/components/quotes/DailyQuoteScreen';

export default function DailyQuoteRoute() {
  // 朝のルーティン開始画面へ遷移
  const handleStart = () => {
    // ルーティン実行画面へ直接遷移
    router.push('/routine-flow/routine');
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