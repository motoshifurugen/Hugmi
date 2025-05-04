import React from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

import DailyQuoteScreen from '@/components/quotes/DailyQuoteScreen';
import { projectColors } from '@/constants/Colors';

export default function DailyQuotePage() {
  // 「今日の朝をはじめる」ボタンが押されたときの処理
  const handleStartDay = () => {
    // 朝のルーティンページに遷移
    router.replace('/routine-flow/morning');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <DailyQuoteScreen onStart={handleStartDay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: projectColors.white1,
  },
}); 