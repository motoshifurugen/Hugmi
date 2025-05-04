import React, { useState, useEffect } from 'react';
import { StyleSheet, Pressable, Animated, Alert } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// 仮のルーティンデータ
const SAMPLE_ROUTINES = [
  { id: '1', title: '水を飲む', description: '一杯の水で身体を目覚めさせましょう', completed: false, order: 1 },
  { id: '2', title: '深呼吸', description: '窓を開けて、新鮮な空気で3回深呼吸しましょう', completed: false, order: 2 },
  { id: '3', title: 'ストレッチ', description: '体を伸ばして血行を促進しましょう', completed: false, order: 3 },
  { id: '4', title: '今日の目標を書く', description: '今日達成したい1つのことを書き出しましょう', completed: false, order: 4 },
  { id: '5', title: '朝食を食べる', description: '栄養のある朝食で一日をスタートしましょう', completed: false, order: 5 },
];

export default function RoutineStepScreen() {
  const [routines, setRoutines] = useState(SAMPLE_ROUTINES);
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  
  const currentRoutine = routines[currentStep];
  const totalSteps = routines.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  // ステップが変わるたびのアニメーション
  const animateTransition = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 1,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      slideAnim.setValue(0);
    });
  };
  
  const handleCompleteStep = () => {
    if (currentStep < totalSteps - 1) {
      // ルーティンを完了としてマーク
      const updatedRoutines = [...routines];
      updatedRoutines[currentStep] = {...currentRoutine, completed: true};
      setRoutines(updatedRoutines);
      
      // アニメーションを実行して次のステップへ
      animateTransition();
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    } else {
      // 最後のステップを完了
      const updatedRoutines = [...routines];
      updatedRoutines[currentStep] = {...currentRoutine, completed: true};
      setRoutines(updatedRoutines);
      
      // 完了画面へ遷移
      router.push('/routine-flow/complete');
    }
  };
  
  const handleSkipStep = () => {
    Alert.alert(
      "このステップをスキップしますか？",
      "後で完了することもできます。",
      [
        {
          text: "キャンセル",
          style: "cancel"
        },
        { 
          text: "スキップ", 
          onPress: () => {
            if (currentStep < totalSteps - 1) {
              animateTransition();
              setTimeout(() => {
                setCurrentStep(currentStep + 1);
              }, 300);
            } else {
              router.push('/routine-flow/complete');
            }
          } 
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">ステップ {currentStep + 1}/{totalSteps}</ThemedText>
        <ThemedView style={styles.progressBar}>
          <ThemedView style={[styles.progressFill, { width: `${progress}%` }]} />
        </ThemedView>
      </ThemedView>
      
      <Animated.View 
        style={[
          styles.routineContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 20]
            })}]
          }
        ]}
      >
        <ThemedText type="title" style={styles.routineTitle}>{currentRoutine.title}</ThemedText>
        <ThemedText style={styles.routineDescription}>{currentRoutine.description}</ThemedText>
        
        <ThemedView style={styles.timerContainer}>
          {/* タイマーコンポーネントを将来的に追加 */}
          <IconSymbol name="timer" size={24} color="#666666" />
          <ThemedText style={styles.timerText}>必要な時間をかけて行いましょう</ThemedText>
        </ThemedView>
      </Animated.View>
      
      <ThemedView style={styles.buttonContainer}>
        <Pressable style={styles.skipButton} onPress={handleSkipStep}>
          <ThemedText style={styles.skipButtonText}>スキップ</ThemedText>
        </Pressable>
        
        <Pressable style={styles.completeButton} onPress={handleCompleteStep}>
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
  header: {
    marginTop: 60,
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  routineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  routineTitle: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
  },
  routineDescription: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  timerText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#666666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  skipButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666666',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 2,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 