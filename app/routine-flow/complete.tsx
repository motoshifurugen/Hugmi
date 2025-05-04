import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable, Animated, Image } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function RoutineCompleteScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [moodRating, setMoodRating] = useState(0);
  
  useEffect(() => {
    // エントランスアニメーション
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const handleMoodSelect = (rating: number) => {
    setMoodRating(rating);
  };
  
  const handleComplete = () => {
    // 気分ログの保存などの処理
    
    // ホーム画面に戻る
    router.replace('/home');
  };

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={[
        styles.contentContainer,
        { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <ThemedView style={styles.celebrationContainer}>
          <Image 
            source={require('@/assets/images/celebration.png')} 
            style={styles.celebrationImage}
          />
        </ThemedView>
        
        <ThemedText type="title" style={styles.title}>おめでとうございます！</ThemedText>
        
        <ThemedText style={styles.subtitle}>
          今日の朝のルーティンを完了しました
        </ThemedText>
        
        <ThemedView style={styles.achievementContainer}>
          <ThemedView style={styles.achievementItem}>
            <IconSymbol name="checkmark.circle.fill" size={24} color="#4CAF50" />
            <ThemedText style={styles.achievementText}>5つのタスク完了</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.achievementItem}>
            <IconSymbol name="flame.fill" size={24} color="#FF9800" />
            <ThemedText style={styles.achievementText}>3日連続達成</ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.moodContainer}>
          <ThemedText style={styles.moodTitle}>今の気分はどうですか？</ThemedText>
          
          <ThemedView style={styles.moodRating}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <Pressable 
                key={rating}
                onPress={() => handleMoodSelect(rating)}
                style={[
                  styles.moodItem,
                  moodRating === rating && styles.moodItemSelected
                ]}
              >
                <IconSymbol 
                  name={rating <= 2 ? "face.smiling" : rating === 3 ? "face.dashed" : "face.smiling.fill"} 
                  size={30} 
                  color={moodRating === rating ? "#4A90E2" : "#BBBBBB"} 
                />
                <ThemedText 
                  style={[
                    styles.moodText,
                    moodRating === rating && styles.moodTextSelected
                  ]}
                >
                  {rating === 1 ? "最高" : 
                   rating === 2 ? "良い" : 
                   rating === 3 ? "普通" : 
                   rating === 4 ? "イマイチ" : "残念"}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        </ThemedView>
      </Animated.View>
      
      <ThemedView style={styles.buttonContainer}>
        <Pressable 
          style={[styles.completeButton, !moodRating && styles.completeButtonDisabled]} 
          onPress={handleComplete}
          disabled={!moodRating}
        >
          <ThemedText style={styles.completeButtonText}>完了</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  celebrationContainer: {
    marginBottom: 30,
  },
  celebrationImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  achievementContainer: {
    marginVertical: 20,
    width: '100%',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementText: {
    fontSize: 16,
    marginLeft: 10,
  },
  moodContainer: {
    width: '100%',
    marginTop: 20,
  },
  moodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  moodRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  moodItem: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  moodItemSelected: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  moodText: {
    marginTop: 5,
    fontSize: 12,
    color: '#888888',
  },
  moodTextSelected: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 