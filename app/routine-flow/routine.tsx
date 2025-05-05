import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Pressable, Animated, Alert, View, Easing } from 'react-native';
import { router, Stack } from 'expo-router';
import { 
  useFonts, 
  ZenMaruGothic_400Regular, 
  ZenMaruGothic_500Medium, 
  ZenMaruGothic_700Bold 
} from '@expo-google-fonts/zen-maru-gothic';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { projectColors } from '@/constants/Colors';
import { 
  createNeomorphicStyle, 
  createNeomorphicButtonStyle, 
  createNeomorphicButtonPressedStyle, 
  createSmallNeomorphicStyle,
  create3DCircleStyle
} from '@/constants/NeuomorphicStyles';

// 仮のルーティンデータ（説明文を削除）
const SAMPLE_ROUTINES = [
  { id: '1', title: '白湯を飲む', completed: false, skipped: false, order: 1 },
  { id: '2', title: '深呼吸', completed: false, skipped: false, order: 2 },
  { id: '3', title: 'ストレッチ', completed: false, skipped: false, order: 3 },
  { id: '4', title: '今日の目標を書く', completed: false, skipped: false, order: 4 },
  { id: '5', title: '朝食を食べる', completed: false, skipped: false, order: 5 },
];

export default function RoutineStepScreen() {
  const [routines, setRoutines] = useState(SAMPLE_ROUTINES);
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const buttonScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotScaleAnim = useRef(new Animated.Value(1)).current;
  
  const currentRoutine = routines[currentStep];
  const totalSteps = routines.length;
  
  // フォントの読み込み
  const [fontsLoaded] = useFonts({
    ZenMaruGothic_400Regular,
    ZenMaruGothic_500Medium,
    ZenMaruGothic_700Bold,
  });
  
  // パルスアニメーションを開始（よりスムーズな実装）
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        // 大きくなるアニメーション
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500, // 拡大に1.5秒
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        // 小さくなるアニメーション
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500, // 縮小にも1.5秒
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    );
    
    pulseAnimation.start();
    
    return () => {
      pulseAnimation.stop();
      pulseAnim.setValue(1);
    };
  }, []);
  
  // 現在のステップドットのアニメーション
  useEffect(() => {
    // ステップが変わるたびにドットアニメーションをリセットして再開
    dotScaleAnim.setValue(0.8);
    Animated.sequence([
      Animated.timing(dotScaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(2)),
      }),
      Animated.timing(dotScaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, [currentStep]);
  
  // ステップが変わるたびのアニメーション
  const animateTransition = (nextStep: number) => {
    // フェードアウト
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start(() => {
      // フェードアウト完了後にステップを更新
      setCurrentStep(nextStep);
      
      // フェードイン
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }).start();
    });
  };
  
  // 「できた！」ボタンのアニメーション
  const animateCompleteButton = (onComplete?: () => void) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      // アニメーション完了時にコールバックを実行
      if (onComplete) {
        onComplete();
      }
    });
  };
  
  const handleCompleteStep = () => {
    // ボタンのアニメーションを実行し、完了時に次のステップへ移行
    animateCompleteButton(() => {
      if (currentStep < totalSteps - 1) {
        // ルーティンを完了としてマーク
        const updatedRoutines = [...routines];
        updatedRoutines[currentStep] = {...currentRoutine, completed: true, skipped: false};
        setRoutines(updatedRoutines);
        
        // アニメーションを実行して次のステップへ
        animateTransition(currentStep + 1);
      } else {
        // 最後のステップを完了
        const updatedRoutines = [...routines];
        updatedRoutines[currentStep] = {...currentRoutine, completed: true, skipped: false};
        setRoutines(updatedRoutines);
        
        // 朝の完了画面へ遷移
        router.push('/routine-flow/morning-complete');
      }
    });
  };
  
  const handleSkipStep = () => {
    // スキップボタンも同様にアニメーションの完了コールバックを使用
    if (currentStep < totalSteps - 1) {
      // ルーティンをスキップとしてマーク
      const updatedRoutines = [...routines];
      updatedRoutines[currentStep] = {...currentRoutine, completed: false, skipped: true};
      setRoutines(updatedRoutines);
      
      // アニメーションを実行して次のステップへ
      animateTransition(currentStep + 1);
    } else {
      // 最後のステップをスキップとしてマーク
      const updatedRoutines = [...routines];
      updatedRoutines[currentStep] = {...currentRoutine, completed: false, skipped: true};
      setRoutines(updatedRoutines);
      
      // 朝の完了画面へ遷移
      router.push('/routine-flow/morning-complete');
    }
  };

  // ステップインジケーターをレンダリング（点で表示）
  const renderStepIndicators = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        {routines.map((routine, index) => (
          index === currentStep ? (
            <Animated.View 
              key={routine.id}
              style={[
                styles.stepDot,
                styles.currentStepDot,
                { transform: [{ scale: dotScaleAnim }] }
              ]} 
            />
          ) : (
            <View 
              key={routine.id} 
              style={[
                styles.stepDot, 
                index < currentStep && routine.completed ? styles.completedStepDot : null,
                index < currentStep && routine.skipped ? styles.skippedStepDot : null
              ]} 
            />
          )
        ))}
      </View>
    );
  };

  if (!fontsLoaded) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>読み込み中...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* ヘッダーの非表示設定 */}
      <Stack.Screen options={{ headerShown: false }} />
      
      <ThemedView style={styles.stepHeader}>
        <ThemedText style={styles.stepText}>
          ステップ {currentStep + 1}/{totalSteps}
        </ThemedText>
        
        {renderStepIndicators()}
      </ThemedView>
      
      <Animated.View 
        style={[
          styles.routineContainer, 
          { 
            opacity: fadeAnim
          }
        ]}
      >
        <View style={styles.routineCircleContainer}>
          <Animated.View style={[styles.routineCircle, {
            transform: [{ scale: pulseAnim }]
          }]} />
          <ThemedText style={styles.routineTitle} numberOfLines={2}>
            {currentRoutine.title}
          </ThemedText>
        </View>
      </Animated.View>
      
      <View style={styles.buttonContainer}>
        <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
          <Pressable 
            style={({ pressed }) => [
              styles.completeButton, 
              pressed && styles.buttonPressed
            ]} 
            onPress={handleCompleteStep}
          >
            <ThemedText style={styles.buttonText}>できた！</ThemedText>
          </Pressable>
        </Animated.View>
        
        <Pressable 
          onPress={handleSkipStep}
          style={({ pressed }) => [
            styles.skipButtonContainer,
            pressed && styles.skipButtonContainerPressed
          ]}
        >
          <ThemedText style={styles.skipButtonText}>
            今日はスキップ
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: projectColors.white1,
  },
  stepHeader: {
    marginTop: 60,
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  stepText: {
    fontSize: 18, // 16から18に拡大
    color: '#5A5050', // 濃い目のグレーに変更
    marginBottom: 12,
    fontFamily: 'ZenMaruGothic_700Bold', // Medium から Bold に変更
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    margin: 4,
  },
  currentStepDot: {
    backgroundColor: projectColors.softOrange,
    ...createSmallNeomorphicStyle(12),
    margin: 4,
  },
  completedStepDot: {
    backgroundColor: projectColors.softOrange,
  },
  skippedStepDot: {
    backgroundColor: '#E0E0E0',
  },
  routineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  routineCircleContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    width: 200,
    height: 200,
  },
  routineCircle: {
    ...create3DCircleStyle(160, 4, 8),
  },
  routineTitle: {
    fontSize: 26,
    textAlign: 'center',
    color: projectColors.black1,
    fontFamily: 'ZenMaruGothic_700Bold',
    zIndex: 10,
    paddingHorizontal: 0,
    maxWidth: 250,
    lineHeight: 34,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 60,
    marginTop: 20,
    width: '100%',
  },
  completeButton: {
    ...createNeomorphicButtonStyle('70%', 20),
  },
  buttonPressed: {
    ...createNeomorphicButtonPressedStyle(),
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: projectColors.black1,
    textAlign: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: projectColors.black2,
    fontFamily: 'ZenMaruGothic_400Regular',
  },
  skipButtonContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 30,
  },
  skipButtonContainerPressed: {
    opacity: 0.7,
  },
}); 