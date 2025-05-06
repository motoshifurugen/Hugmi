import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  SafeAreaView, 
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { projectColors } from '@/constants/Colors';
import { ZenMaruGothic_700Bold, ZenMaruGothic_500Medium, ZenMaruGothic_400Regular } from '@expo-google-fonts/zen-maru-gothic';
import { AntDesign } from '@expo/vector-icons';
import { db } from '@/db';
import { generateUuid } from '@/db/utils/uuid';
import { setActiveUserId } from '@/components/quotes/DailyQuoteScreen';
import * as SecureStore from 'expo-secure-store';

interface TutorialScreenProps {
  visible: boolean;
  onComplete: () => void;
}

// サンプルルーティン
const SAMPLE_ROUTINES = [
  "白湯を飲む",
  "顔を洗う",
  "窓を開けて深呼吸",
  "メールをチェックする",
  "ストレッチする",
  "日記を書く",
  "朝食を食べる",
];

export default function TutorialScreen({ visible, onComplete }: TutorialScreenProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedRoutines, setSelectedRoutines] = useState<string[]>([]);
  const [customRoutine, setCustomRoutine] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(100));
  const [randomQuote, setRandomQuote] = useState('');

  // ステップが変わったときのアニメーション
  useEffect(() => {
    // リセット
    fadeAnim.setValue(0);
    slideAnim.setValue(100);
    
    // フェードインとスライドアップアニメーション
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  // ルーティンの選択/選択解除を切り替える
  const toggleRoutine = (routine: string) => {
    if (selectedRoutines.includes(routine)) {
      setSelectedRoutines(selectedRoutines.filter(r => r !== routine));
    } else {
      setSelectedRoutines([...selectedRoutines, routine]);
    }
  };

  // カスタムルーティンを追加
  const addCustomRoutine = () => {
    if (customRoutine.trim() !== '') {
      setSelectedRoutines([...selectedRoutines, customRoutine.trim()]);
      setCustomRoutine('');
    }
  };

  // チュートリアル完了時の処理
  const completeTutorial = async () => {
    try {
      // 新しいユーザーを作成
      const userId = generateUuid();
      const userData = { id: userId, name: name || 'ゲスト' };
      
      await db.createUser(userData);
      
      // ルーティンの保存
      if (selectedRoutines.length > 0) {
        // ルーティンをデータベースに追加
        for (let i = 0; i < selectedRoutines.length; i++) {
          await db.createRoutine({
            id: generateUuid(),
            userId: userId,
            order: i,
            title: selectedRoutines[i],
            isActive: true
          });
        }
      }
      
      // ユーザーIDをグローバル状態とSecureStoreに保存
      setActiveUserId(userId);
      await SecureStore.setItemAsync('active_user_id', userId);
      
      // チュートリアル完了フラグを保存
      await SecureStore.setItemAsync('tutorial_completed', 'true');
      
      // 完了コールバックを呼び出す
      onComplete();
    } catch (error) {
      console.error('チュートリアル完了処理でエラーが発生しました:', error);
      // エラー時も完了としてコールバックを呼び出す
      onComplete();
    }
  };
  
  // 次のステップに進む
  const goToNextStep = () => {
    if (step === 5) {  // 最終ステップ
      completeTutorial();
    } else {
      setStep(step + 1);
    }
  };
  
  // 前のステップに戻る
  const goToPreviousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  // 特定のステップに移動
  const goToStep = (targetStep: number) => {
    setStep(targetStep);
  };

  // ステップごとの内容をレンダリング
  const renderStepContent = () => {
    const animatedStyle = {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
    };

    switch (step) {
      case 0:
        return (
          <Animated.View style={[styles.stepContent, animatedStyle]}>
            <Text style={styles.quoteText}>
              すべての習慣は、{'\n'}最初の一歩からはじまります。
            </Text>
            <Text style={styles.stepDescription}>
              少し深呼吸して、ここからはじめましょう
            </Text>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={goToNextStep}
            >
              <Text style={styles.buttonText}>はじめる</Text>
            </TouchableOpacity>
          </Animated.View>
        );
        
      case 1:
        return (
          <Animated.View style={[styles.stepContent, animatedStyle]}>
            <Text style={styles.stepTitle}>Hugmiへようこそ</Text>
            <Text style={styles.stepDescription}>
              Hugmi（ハグミー）は、あなたの小さな習慣をサポートします。
              朝のルーティンを作り、一日を整えていきましょう。
            </Text>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={goToNextStep}
            >
              <Text style={styles.buttonText}>次へ</Text>
            </TouchableOpacity>
          </Animated.View>
        );
        
      case 2:
        return (
          <Animated.View style={[styles.stepContent, animatedStyle]}>
            <Text style={styles.stepTitle}>あなたのお名前は？</Text>
            <Text style={styles.stepDescription}>
              Hugmiであなたをどう呼べばいいですか？{'\n'}
              （後から変更できます）
            </Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="例：まい"
              placeholderTextColor="#aaa"
              maxLength={20}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (name.trim() !== '') {
                  goToNextStep();
                }
              }}
            />
            <TouchableOpacity 
              style={[
                styles.primaryButton,
                name.trim() === '' && styles.disabledButton
              ]}
              onPress={goToNextStep}
              disabled={name.trim() === ''}
            >
              <Text style={styles.buttonText}>次へ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                setName('ゲスト');
                goToNextStep();
              }}
            >
            </TouchableOpacity>
          </Animated.View>
        );
        
      case 3:
        return (
          <Animated.View style={[styles.stepContent, animatedStyle]}>
            <Text style={styles.stepTitle}>朝のルーティンを選びましょう</Text>
            <Text style={styles.stepDescription}>
              朝に取り組みたい習慣を選んでください。{'\n'}
              （後から変更できます）
            </Text>
            
            <View style={styles.customRoutineContainer}>
              <TextInput
                style={styles.customRoutineInput}
                value={customRoutine}
                onChangeText={setCustomRoutine}
                placeholder="自分で入力する"
                placeholderTextColor="#aaa"
                returnKeyType="done"
                onSubmitEditing={addCustomRoutine}
              />
              <TouchableOpacity
                style={[styles.addButton, customRoutine.trim() === '' && styles.disabledButton]}
                onPress={addCustomRoutine}
                disabled={customRoutine.trim() === ''}
              >
                <Text style={styles.addButtonText}>追加</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.routineListContainer}>
              <ScrollView 
                style={styles.routineScrollView}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                {/* 自分で追加したカスタムルーティンを先に表示 */}
                {selectedRoutines.filter(r => !SAMPLE_ROUTINES.includes(r)).map((routine, index) => (
                  <TouchableOpacity
                    key={`custom-${index}`}
                    style={[styles.routineItem, styles.selectedRoutineItem]}
                    onPress={() => toggleRoutine(routine)}
                  >
                    <Text style={styles.routineText}>{routine}</Text>
                    <AntDesign name="check" size={20} color={projectColors.softOrange} />
                  </TouchableOpacity>
                ))}
                
                {/* サンプルルーティンを後に表示 */}
                {SAMPLE_ROUTINES.map((routine, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.routineItem,
                      selectedRoutines.includes(routine) && styles.selectedRoutineItem
                    ]}
                    onPress={() => toggleRoutine(routine)}
                  >
                    <Text style={styles.routineText}>{routine}</Text>
                    {selectedRoutines.includes(routine) && (
                      <AntDesign name="check" size={20} color={projectColors.softOrange} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.primaryButton,
                selectedRoutines.length === 0 && styles.disabledButton
              ]}
              onPress={goToNextStep}
              disabled={selectedRoutines.length === 0}
            >
              <Text style={styles.buttonText}>次へ</Text>
            </TouchableOpacity>
          </Animated.View>
        );
        
      case 4:
        return (
          <Animated.View style={[styles.stepContent, animatedStyle]}>
            <Text style={styles.stepTitle}>Hugmiの使い方</Text>
            <Text style={styles.stepDescription}>
              1. 朝起きたら、アプリを開きます
            </Text>
            <Text style={styles.stepDescription}>
              2. 今日の名言に出会います
            </Text>
            <Text style={styles.stepDescription}>
              3. 朝のルーティンを実行していきます
            </Text>
            <Text style={styles.stepDescription}>
              4. ホーム画面から、ルーティンの編集ができます
            </Text>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={goToNextStep}
            >
              <Text style={styles.buttonText}>次へ</Text>
            </TouchableOpacity>
          </Animated.View>
        );
        
      case 5:
        return (
          <Animated.View style={[styles.stepContent, animatedStyle]}>
            <Text style={styles.stepTitle}>準備完了！</Text>
            <Text style={styles.stepDescription}>
              {name ? `${name}さん、` : ''}Hugmiへようこそ！
            </Text>
            <Text style={styles.stepDescription}>
              これからのあなたの朝をサポートします。{'\n'}
              明日がすこし楽しみになりますように。
            </Text>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={goToNextStep}
            >
              <Text style={styles.buttonText}>始める</Text>
            </TouchableOpacity>
          </Animated.View>
        );
        
      default:
        return null;
    }
  };

  // ステップインジケーターを表示
  const renderStepIndicator = () => {
    const totalSteps = 6; // 0～5の6ステップ
    
    return (
      <View style={styles.stepIndicatorContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View 
            key={index}
            style={[
              styles.stepDot,
              (index === step || index < step) && styles.activeStepDot
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={visible}
      onRequestClose={onComplete}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.container}>
            {/* ステップインジケーター */}
            {renderStepIndicator()}
            
            {/* ステップ内容 */}
            {renderStepContent()}
            
            {/* 戻るボタン（最初のステップ以外で表示） */}
            {step > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={goToPreviousStep}
              >
                <AntDesign name="arrowleft" size={24} color={projectColors.text} />
              </TouchableOpacity>
            )}
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: projectColors.background,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D8D8D8',
    marginHorizontal: 5,
  },
  activeStepDot: {
    backgroundColor: projectColors.softOrange,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  stepTitle: {
    fontFamily: 'ZenMaruGothic_700Bold',
    fontSize: 24,
    color: projectColors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  quoteText: {
    fontFamily: 'ZenMaruGothic_500Medium',
    fontSize: 22,
    color: projectColors.softOrange,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 32,
  },
  stepDescription: {
    fontFamily: 'ZenMaruGothic_400Regular',
    fontSize: 16,
    color: projectColors.text,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  textInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: projectColors.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 30,
    fontFamily: 'ZenMaruGothic_400Regular',
    fontSize: 16,
    color: projectColors.text,
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: projectColors.softOrange,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'ZenMaruGothic_500Medium',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
  },
  skipButton: {
    marginTop: 15,
    padding: 10,
  },
  skipButtonText: {
    color: projectColors.secondaryText,
    fontSize: 14,
    fontFamily: 'ZenMaruGothic_400Regular',
  },
  routineListContainer: {
    width: '100%',
    height: 220,
    marginBottom: 10,
  },
  routineScrollView: {
    width: '100%',
    height: '100%',
  },
  routineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: projectColors.border,
  },
  selectedRoutineItem: {
    borderColor: projectColors.softOrange,
    borderWidth: 1,
    backgroundColor: projectColors.secondary,
  },
  routineText: {
    fontFamily: 'ZenMaruGothic_400Regular',
    fontSize: 16,
    color: projectColors.text,
  },
  customRoutineContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 15,
    marginTop: 5,
  },
  customRoutineInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: projectColors.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontFamily: 'ZenMaruGothic_400Regular',
    fontSize: 16,
    color: projectColors.text,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: projectColors.success,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'ZenMaruGothic_500Medium',
  },
}); 