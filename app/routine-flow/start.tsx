import React, { useState, useEffect } from 'react';
import { StyleSheet, Pressable, Animated } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';

// 仮の名言データ
const SAMPLE_QUOTES = [
  { 
    id: '1', 
    text: '一日の始まりは、あなたの心の在り方で決まる', 
    author: '心の達人',
  },
  { 
    id: '2', 
    text: '小さな一歩の積み重ねが、大きな変化を生む', 
    author: '人生の賢者',
  },
  { 
    id: '3', 
    text: '今この瞬間に意識を向けることが、真の幸せへの道', 
    author: 'マインドフルネスの教師',
  },
];

export default function RoutineStartScreen() {
  // ランダムな名言を選択
  const [quote, setQuote] = useState(SAMPLE_QUOTES[0]);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_QUOTES.length);
    setQuote(SAMPLE_QUOTES[randomIndex]);
    
    // 名言をフェードインさせるアニメーション
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const handleStartRoutine = () => {
    router.push('/routine-flow/routine');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>今日も素晴らしい一日を</ThemedText>
        
        <Animated.View style={[styles.quoteContainer, { opacity: fadeAnim }]}>
          <ThemedText style={styles.quoteText}>「{quote.text}」</ThemedText>
          <ThemedText style={styles.quoteAuthor}>- {quote.author}</ThemedText>
        </Animated.View>
        
        <ThemedText style={styles.message}>
          朝のルーティンを始めて、今日一日を素晴らしいものにしましょう。
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.buttonContainer}>
        <Pressable style={styles.startButton} onPress={handleStartRoutine}>
          <ThemedText style={styles.startButtonText}>ルーティンを始める</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 40,
    textAlign: 'center',
  },
  quoteContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  quoteText: {
    fontSize: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  },
  quoteAuthor: {
    fontSize: 16,
    textAlign: 'right',
    alignSelf: 'stretch',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 