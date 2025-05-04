import React from 'react';
import { Image, StyleSheet, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">おはようございます！</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">今日のルーティン</ThemedText>
        <ThemedText>
          今日の朝のルーティンを始める準備はできていますか？
        </ThemedText>
        {/* ここにルーティン開始ボタンを追加する予定 */}
      </ThemedView>
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">今日の一言</ThemedText>
        <ThemedText style={styles.quoteText}>
          「一日の始まりは、あなたの心の在り方で決まる」
        </ThemedText>
        <ThemedText style={styles.quoteAuthor}>- 心の達人</ThemedText>
      </ThemedView>
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">ルーティン達成状況</ThemedText>
        <ThemedText>
          今週のルーティン達成率: 85%
        </ThemedText>
        {/* ここにルーティン達成グラフを追加する予定 */}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionContainer: {
    gap: 8,
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  quoteText: {
    fontStyle: 'italic',
    fontSize: 16,
    marginVertical: 8,
  },
  quoteAuthor: {
    textAlign: 'right',
    fontSize: 14,
  },
}); 