import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Pressable, Animated, Alert, View } from 'react-native';
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

// 仮のルーティンデータ（説明文を削除）
const SAMPLE_ROUTINES = [
  { id: '1', title: '白湯を飲む', completed: false, order: 1 },
  { id: '2', title: '深呼吸', completed: false, order: 2 },
  { id: '3', title: 'ストレッチ', completed: false, order: 3 },
  { id: '4', title: '今日の目標を書く', completed: false, order: 4 },
  { id: '5', title: '朝食を食べる', completed: false, order: 5 },
];

export default function RoutineStepScreen() {
  const [routines, setRoutines] = useState(SAMPLE_ROUTINES);
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const buttonScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const currentRoutine = routines[currentStep];
  const totalSteps = routines.length;
  
  // フォントの読み込み
  const [fontsLoaded] = useFonts({
    ZenMaruGothic_400Regular,
    ZenMaruGothic_500Medium,
    ZenMaruGothic_700Bold,
  });
  
  // パルスアニメーションを開始
  useEffect(() => {
    const startPulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15, // アニメーションの膨張率を大きく
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ]).start(() => startPulseAnimation());
    };
    
    startPulseAnimation();
    
    return () => pulseAnim.stopAnimation();
  }, []);
  
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
  
  // 「できた！」ボタンのアニメーション
  const animateCompleteButton = () => {
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
    ]).start();
  };
  
  const handleCompleteStep = () => {
    // ボタンのアニメーションを実行
    animateCompleteButton();
    
    // 少し遅延を入れてトランジションを開始
    setTimeout(() => {
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
    }, 300);
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

  // ステップインジケーターをレンダリング（点で表示）
  const renderStepIndicators = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        {routines.map((routine, index) => (
          <View 
            key={routine.id} 
            style={[
              styles.stepDot, 
              index === currentStep ? styles.currentStepDot : null,
              index < currentStep ? styles.completedStepDot : null
            ]} 
          />
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
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 20]
            })}]
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
        
        <ThemedText 
          style={styles.skipButtonText}
          onPress={handleSkipStep}
        >
          今日はスキップ
        </ThemedText>
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
    fontSize: 16,
    color: projectColors.black2,
    marginBottom: 12,
    fontFamily: 'ZenMaruGothic_500Medium',
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
    backgroundColor: projectColors.secondary,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  completedStepDot: {
    backgroundColor: projectColors.secondary,
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
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: projectColors.secondary,
    position: 'absolute',
    zIndex: 5,
  },
  routineTitle: {
    fontSize: 26,
    textAlign: 'center',
    color: projectColors.black1,
    fontFamily: 'ZenMaruGothic_700Bold',
    zIndex: 10,
    paddingHorizontal: 10,
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
    backgroundColor: projectColors.primary,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '80%',
    alignSelf: 'center',
  },
  buttonPressed: {
    backgroundColor: projectColors.secondary,
    transform: [{ scale: 0.98 }],
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
    marginTop: 20,
    fontFamily: 'ZenMaruGothic_400Regular',
  },
}); 