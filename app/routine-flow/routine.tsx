import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Pressable, Animated, Alert, View, Easing } from 'react-native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  useFonts, 
  ZenMaruGothic_400Regular, 
  ZenMaruGothic_500Medium, 
  ZenMaruGothic_700Bold 
} from '@expo-google-fonts/zen-maru-gothic';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { HapticPressable } from '@/components/common/HapticPressable';
import { projectColors } from '@/constants/Colors';
import { fonts } from '@/constants/fonts';
import { 
  createNeomorphicStyle, 
  createNeomorphicButtonStyle, 
  createNeomorphicButtonPressedStyle, 
  createSmallNeomorphicStyle,
  create3DCircleStyle
} from '@/constants/NeuomorphicStyles';
import { getActiveRoutinesByUserId } from '@/db/utils/routines';
import { createRoutineLog } from '@/db/utils/routine_logs';
import { getAllUsers } from '@/db/utils/users';

// インターフェースを定義
interface Routine {
  id: string;
  userId: string;
  order: number;
  title: string;
  isActive: boolean;
  createdAt: string;
  completed: boolean;
  skipped: boolean;
}

export default function RoutineStepScreen() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const skipButtonScale = useRef(new Animated.Value(1)).current;
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
  
  // ルーティンデータの取得
  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        setLoading(true);
        
        // ユーザーを取得（アプリでは1人のみという前提）
        const users = await getAllUsers();
        if (users.length === 0) {
          setLoading(false);
          return;
        }
        
        const userId = users[0].id;
        
        // アクティブなルーティンを取得
        const activeRoutines = await getActiveRoutinesByUserId(userId);
        
        // ルーティンを順番でソート
        const sortedRoutines = activeRoutines
          .sort((a, b) => a.order - b.order)
          .map(routine => ({
            ...routine,
            // isActiveがnumberの場合にbooleanに変換
            isActive: routine.isActive === 1 || Boolean(routine.isActive),
            completed: false,
            skipped: false
          }));
        
        setRoutines(sortedRoutines);
      } catch (error) {
        // エラー処理
        console.error('ルーティンデータの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoutines();
  }, []);
  
  // クリーンアップ関数を追加して、アニメーションリソースを解放
  useEffect(() => {
    return () => {
      // コンポーネントのアンマウント時にAnimated.Valueをリセット
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      buttonScale.setValue(1);
      skipButtonScale.setValue(1);
      pulseAnim.setValue(1);
      dotScaleAnim.setValue(1);
    };
  }, [fadeAnim, slideAnim, buttonScale, skipButtonScale, pulseAnim, dotScaleAnim]);
  
  // パルスアニメーションを開始（よりスムーズな実装）
  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation | null = null;
    
    try {
      pulseAnimation = Animated.loop(
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
    } catch (error) {
      console.error('パルスアニメーションの開始に失敗しました:', error);
      // アニメーションが失敗した場合のフォールバック
      pulseAnim.setValue(1);
    }
    
    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
      pulseAnim.setValue(1);
    };
  }, []);
  
  // 現在のステップドットのアニメーション
  useEffect(() => {
    try {
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
    } catch (error) {
      console.error('ドットアニメーションでエラーが発生しました:', error);
      // エラー時はアニメーションをスキップして通常サイズに
      dotScaleAnim.setValue(1);
    }
  }, [currentStep]);
  
  // ステップが変わるたびのアニメーション
  const animateTransition = (nextStep: number) => {
    try {
      // フェードアウト
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(() => {
        try {
          // フェードアウト完了後にステップを更新
          setCurrentStep(nextStep);
          
          // フェードイン
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }).start();
        } catch (error) {
          console.error('フェードイン処理でエラー:', error);
          // エラーが発生してもステップを更新
          setCurrentStep(nextStep);
        }
      });
    } catch (error) {
      console.error('フェードアウト処理でエラー:', error);
      // アニメーションエラー時は直接ステップを更新
      setCurrentStep(nextStep);
    }
  };
  
  // 「できた！」ボタンのアニメーション
  const animateCompleteButton = (onComplete?: () => void) => {
    try {
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.05, // 1.1から1.05に縮小して控えめに
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start(() => {
        try {
          // アニメーション完了時にコールバックを実行
          if (onComplete) {
            onComplete();
          }
        } catch (error) {
          console.error('アニメーション完了コールバックでエラー:', error);
        }
      });
    } catch (error) {
      console.error('アニメーション開始でエラー:', error);
      // エラーが発生してもコールバックを実行
      if (onComplete) {
        setTimeout(() => {
          try {
            onComplete();
          } catch (innerError) {
            console.error('遅延コールバック実行でエラー:', innerError);
          }
        }, 300);
      }
    }
  };

  // 「スキップ」ボタンのアニメーション
  const animateSkipButton = (onComplete?: () => void) => {
    try {
      Animated.sequence([
        Animated.timing(skipButtonScale, {
          toValue: 0.95, // 少し縮小するアニメーション
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(skipButtonScale, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        })
      ]).start(() => {
        try {
          // アニメーション完了時にコールバックを実行
          if (onComplete) {
            onComplete();
          }
        } catch (error) {
          console.error('スキップボタンアニメーション完了コールバックでエラー:', error);
        }
      });
    } catch (error) {
      console.error('スキップボタンアニメーション開始でエラー:', error);
      // エラーが発生してもコールバックを実行
      if (onComplete) {
        setTimeout(() => {
          try {
            onComplete();
          } catch (innerError) {
            console.error('スキップボタン遅延コールバック実行でエラー:', innerError);
          }
        }, 300);
      }
    }
  };
  
  const handleCompleteStep = async () => {
    if (!currentRoutine) return;
    
    try {
      // ボタンのアニメーションを実行し、完了時に次のステップへ移行
      animateCompleteButton(async () => {
        try {
          // ルーティンログをデータベースに保存
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          
          // ユーザーを取得
          const users = await getAllUsers();
          if (users.length === 0) {
            return;
          }
          
          const userId = users[0].id;
          
          // ルーティンログを作成
          await createRoutineLog({
            userId,
            date: today,
            routineId: currentRoutine.id,
            status: 'checked'
          });
          
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
        } catch (error) {
          console.error('ルーティンの記録に失敗しました:', error);
          // エラーが発生してもアプリがクラッシュしないよう次のステップに進む
          if (currentStep < totalSteps - 1) {
            // 次のステップへ（エラー時でも）
            animateTransition(currentStep + 1);
          } else {
            // 最後のステップ（エラー時でも完了画面へ）
            router.push('/routine-flow/morning-complete');
          }
        }
      });
    } catch (error) {
      console.error('「できた！」ボタン処理でエラーが発生しました:', error);
      // ボタンアニメーション自体がエラーになった場合でも次のステップへ
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        router.push('/routine-flow/morning-complete');
      }
    }
  };
  
  const handleSkipStep = async () => {
    if (!currentRoutine) return;
    
    try {
      animateSkipButton(async () => {
        try {
          // ルーティンログをデータベースに保存
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          
          // ユーザーを取得
          const users = await getAllUsers();
          if (users.length === 0) {
            return;
          }
          
          const userId = users[0].id;
          
          // ルーティンログを作成（スキップとして記録）
          await createRoutineLog({
            userId,
            date: today,
            routineId: currentRoutine.id,
            status: 'skipped'
          });
          
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
        } catch (error) {
          console.error('ルーティンのスキップ記録に失敗しました:', error);
          // エラーが発生してもアプリがクラッシュしないよう次のステップに進む
          if (currentStep < totalSteps - 1) {
            // 次のステップへ（エラー時でも）
            animateTransition(currentStep + 1);
          } else {
            // 最後のステップ（エラー時でも完了画面へ）
            router.push('/routine-flow/morning-complete');
          }
        }
      });
    } catch (error) {
      console.error('「スキップ」ボタン処理でエラーが発生しました:', error);
      // ボタンアニメーション自体がエラーになった場合でも次のステップへ
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        router.push('/routine-flow/morning-complete');
      }
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

  // テキストの長さに基づいて動的にフォントサイズを調整する
  const dynamicFontSize = useMemo(() => {
    if (!currentRoutine) return 24;
    
    const titleLength = currentRoutine.title.length;
    if (titleLength <= 4) return 28; // 非常に短いテキスト
    if (titleLength <= 8) return 26; // 短いテキスト
    if (titleLength <= 12) return 24; // 中程度のテキスト
    return 22; // 長いテキスト
  }, [currentRoutine]);
  
  if (!fontsLoaded || loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>読み込み中...</ThemedText>
      </ThemedView>
    );
  }

  if (routines.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>ルーティンが設定されていません</ThemedText>
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
          <ThemedText style={[
            styles.routineTitle, 
            { fontSize: dynamicFontSize }
          ]} 
          numberOfLines={currentRoutine.title.length <= 15 ? 1 : 2} 
          adjustsFontSizeToFit 
          minimumFontScale={0.8}>
            {currentRoutine.title}
          </ThemedText>
        </View>
      </Animated.View>
      
      <View style={styles.buttonContainer}>
        <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
          <HapticPressable 
            style={({ pressed }) => [
              styles.completeButton, 
              pressed && styles.buttonPressed
            ]} 
            onPress={handleCompleteStep}
            hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
          >
            <ThemedText style={styles.buttonText}>できた！</ThemedText>
          </HapticPressable>
        </Animated.View>
        
        <Animated.View style={{ transform: [{ scale: skipButtonScale }] }}>
          <HapticPressable 
            onPress={handleSkipStep}
            style={({ pressed }) => [
              styles.skipButtonContainer,
              pressed && styles.skipButtonContainerPressed
            ]}
            hapticStyle={Haptics.ImpactFeedbackStyle.Light}
          >
            <ThemedText style={styles.skipButtonText}>
              スキップ
            </ThemedText>
          </HapticPressable>
        </Animated.View>
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
    color: projectColors.black1,
    marginBottom: 12,
    fontFamily: fonts.families.primary,
    fontWeight: 'bold',
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
    width: 200, // 元のサイズに戻す
    height: 200, // 元のサイズに戻す
  },
  routineCircle: {
    ...create3DCircleStyle(160, 4, 8), // 元のサイズに戻す
  },
  routineTitle: {
    textAlign: 'center',
    color: projectColors.black1,
    fontFamily: fonts.families.primary,
    fontWeight: 'bold',
    zIndex: 10,
    paddingHorizontal: 0, 
    width: '100%',
    maxWidth: 260, // さらに幅を拡大
    lineHeight: 34, // 行間をやや広げる
    includeFontPadding: false, // フォントのパディングを削除して一貫した表示を確保
    position: 'absolute', // 絶対位置指定で円の中央に配置
    alignSelf: 'center', // 水平方向中央揃え
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
    fontFamily: fonts.families.primary,
    fontWeight: 'bold',
    color: projectColors.black1,
    textAlign: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: projectColors.black2,
    fontFamily: fonts.families.primary,
    fontWeight: 'bold',
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