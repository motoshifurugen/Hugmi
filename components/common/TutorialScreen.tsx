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
      console.log('[DEBUG] チュートリアル完了処理を開始します');
      
      // 入力値の検証
      const userName = name.trim() || 'ゲスト';
      console.log(`[DEBUG] ユーザー名: ${userName}`);
      
      // 新しいユーザーを作成
      const userId = generateUuid();
      const userData = { id: userId, name: userName };
      
      console.log(`[DEBUG] ユーザーを作成します: ${JSON.stringify(userData)}`);
      const createdUser = await db.createUser(userData);
      console.log(`[DEBUG] ユーザー作成結果: ${createdUser ? '成功' : '失敗'}`);
      
      // ユーザー作成が失敗した場合は再試行
      if (!createdUser) {
        console.log('[DEBUG] ユーザー作成に失敗しました。再試行します。');
        const retryResult = await db.createUser(userData);
        if (!retryResult) {
          throw new Error('ユーザー作成の再試行に失敗しました');
        }
        console.log('[DEBUG] ユーザー作成の再試行が成功しました');
      }
      
      // ルーティンの保存
      if (selectedRoutines.length > 0) {
        console.log(`[DEBUG] ${selectedRoutines.length}件のルーティンを保存します`);
        // ルーティンをデータベースに追加
        for (let i = 0; i < selectedRoutines.length; i++) {
          const routineId = generateUuid();
          const routineData = {
            id: routineId,
            userId: userId,
            order: i,
            title: selectedRoutines[i],
            isActive: true
          };
          
          console.log(`[DEBUG] ルーティンを作成: ${JSON.stringify(routineData)}`);
          await db.createRoutine(routineData);
        }
        console.log('[DEBUG] すべてのルーティンを保存しました');
      } else {
        // デフォルトのルーティンを少なくとも1つは追加
        console.log('[DEBUG] ルーティンが選択されていないため、デフォルトルーティンを追加します');
        const defaultRoutines = ['深呼吸をする', '白湯を飲む', '顔を洗う'];
        
        for (let i = 0; i < defaultRoutines.length; i++) {
          await db.createRoutine({
            id: generateUuid(),
            userId: userId,
            order: i,
            title: defaultRoutines[i],
            isActive: true
          });
        }
        console.log('[DEBUG] デフォルトルーティンを追加しました');
      }
      
      // ユーザーIDをグローバル状態とSecureStoreに保存
      console.log(`[DEBUG] アクティブユーザーIDをグローバル設定: ${userId}`);
      setActiveUserId(userId);
      
      try {
        await SecureStore.setItemAsync('active_user_id', userId);
        console.log(`[DEBUG] アクティブユーザーIDをSecureStoreに保存: ${userId}`);
      } catch (secureStoreError) {
        console.error('アクティブユーザーIDの保存に失敗しました:', secureStoreError);
      }
      
      // ユーザー作成が完了したことを確認
      const users = await db.getAllUsers();
      console.log(`[DEBUG] チュートリアル完了後のユーザー数: ${users.length}`);
      
      // 本番では初期データシードは実行しない
      
      // 完了コールバックを呼び出す
      console.log('[DEBUG] チュートリアル完了処理が正常に終了しました');
      onComplete();
    } catch (error) {
      console.error('チュートリアル完了処理でエラーが発生しました:', error);
      
      // エラー回復を試みる - 強制的にユーザー作成を試みる
      try {
        console.log('[DEBUG] エラー回復処理を開始します');
        const recoveryUserId = generateUuid();
        const recoveryName = name.trim() || 'ゲスト（回復）';
        
        // ユーザーを作成
        await db.createUser({ id: recoveryUserId, name: recoveryName });
        console.log('[DEBUG] 回復用ユーザーを作成しました');
        
        // アクティブユーザーIDを設定
        setActiveUserId(recoveryUserId);
        await SecureStore.setItemAsync('active_user_id', recoveryUserId);
        
        // デフォルトルーティンを追加
        const defaultRoutines = ['深呼吸をする', '白湯を飲む', '顔を洗う'];
        for (let i = 0; i < defaultRoutines.length; i++) {
          await db.createRoutine({
            id: generateUuid(),
            userId: recoveryUserId,
            order: i,
            title: defaultRoutines[i],
            isActive: true
          });
        }
        
        console.log('[DEBUG] 回復処理が完了しました');
      } catch (recoveryError) {
        console.error('回復処理にも失敗しました:', recoveryError);
      }
      
      // エラー時も完了としてコールバックを呼び出す
      onComplete();
    }
  };
  
  // 次のステップに進む
  const goToNextStep = () => {
    if (step === 4) {  // 最終ステップ (統合したので5から4に変更)
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
            <View style={styles.contentContainer}>
              <Text style={styles.quoteText}>
                どんな朝も、{'\n'}
                やさしく包み込むように。
              </Text>
              <Text style={[styles.stepTitle, { marginTop: 20 }]}>
                <Text style={styles.brandName}>Hugmi</Text>へようこそ。
              </Text>
              <Text style={styles.stepDescription}>
                忙しい毎朝。{'\n'}
                がんばれない日だって、ありますよね。{'\n'}
                <Text style={styles.brandNameSmall}>Hugmi</Text>は、{'\n'}
                そんなあなたの朝を、{'\n'}
                そっとハグするアプリです。
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={goToNextStep}
              >
                <Text style={styles.buttonText}>次へ</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
        
      case 1:
        return (
          <Animated.View style={[styles.stepContent, animatedStyle]}>
            <View style={styles.contentContainer}>
              <Text style={styles.stepTitle}>あなたのお名前は？</Text>
              <Text style={styles.stepDescription}>
                Hugmiであなたをどう呼べばいいですか？{'\n'}
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
            </View>
            <View style={styles.buttonContainer}>
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
            </View>
          </Animated.View>
        );
        
      case 2:
        return (
          <Animated.View style={[styles.stepContent, animatedStyle]}>
            <View style={styles.contentContainer}>
              <Text style={styles.stepTitle}>朝のルーティンを選びましょう</Text>
              <Text style={styles.stepDescription}>
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
            </View>
            
            <View style={styles.buttonContainer}>
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
            </View>
          </Animated.View>
        );
        
      case 3:
        return (
          <Animated.View style={[styles.stepContent, animatedStyle]}>
            <View style={styles.contentContainer}>
              <Text style={styles.stepTitle}>Hugmiの使い方</Text>
              <Text style={styles.stepDescription}>
                Hugmiの朝は、こんなふうに始まります。
              </Text>
              
              <View style={styles.numberedItemContainer}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>1</Text>
                </View>
                <Text style={styles.numberedItemText}>
                  朝起きたら、アプリを開きます
                </Text>
              </View>
              
              <View style={styles.numberedItemContainer}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>2</Text>
                </View>
                <Text style={styles.numberedItemText}>
                  名言と出会い、やさしく心を整えます
                </Text>
              </View>
              
              <View style={styles.numberedItemContainer}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>3</Text>
                </View>
                <Text style={styles.numberedItemText}>
                  ルーティンを、ひとつずつ
                </Text>
              </View>
              
              <View style={styles.numberedItemContainer}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>4</Text>
                </View>
                <Text style={styles.numberedItemText}>
                  編集もかんたん。あなたのペースで続けられます
                </Text>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={goToNextStep}
              >
                <Text style={styles.buttonText}>次へ</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
        
      case 4:
        return (
          <Animated.View style={[styles.stepContent, animatedStyle]}>
            <View style={styles.contentContainer}>
              <Text style={styles.stepTitle}>準備ができました！</Text>
              <Text style={styles.stepDescription}>
                これからの朝を、あなたらしく。
              </Text>
              <Text style={styles.stepDescription}>
                Hugmiと一緒に、{'\n'}
                すこしずつ整えていきましょう。
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={goToNextStep}
              >
                <Text style={styles.buttonText}>始める</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
        
      default:
        return null;
    }
  };

  // ステップインジケーターを表示
  const renderStepIndicator = () => {
    const totalSteps = 5; // 0～4の5ステップ(統合したので6から5に変更)
    
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
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 20,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 30,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  brandName: {
    color: projectColors.text,
    fontWeight: 'bold',
    fontSize: 22,
    letterSpacing: 0.5,
    paddingHorizontal: 2,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  brandNameSmall: {
    color: projectColors.text,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
    paddingHorizontal: 2,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  stepTitle: {
    fontFamily: 'ZenMaruGothic_700Bold',
    fontSize: 22,
    color: projectColors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  quoteText: {
    fontFamily: 'ZenMaruGothic_500Medium',
    fontSize: 20,
    color: projectColors.accent,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: 'bold',
  },
  stepDescription: {
    fontFamily: 'ZenMaruGothic_400Regular',
    fontSize: 14,
    color: projectColors.text,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  numberedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    paddingHorizontal: 20,
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: projectColors.softOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'ZenMaruGothic_700Bold',
  },
  numberedItemText: {
    flex: 1,
    fontFamily: 'ZenMaruGothic_400Regular',
    fontSize: 14,
    color: projectColors.text,
    lineHeight: 24,
  },
  textInput: {
    width: '100%',
    height: 46,
    borderWidth: 1,
    borderColor: projectColors.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 24,
    fontFamily: 'ZenMaruGothic_400Regular',
    fontSize: 14,
    color: projectColors.text,
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: projectColors.softOrange,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'ZenMaruGothic_500Medium',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    padding: 10,
  },
  skipButton: {
    marginTop: 12,
    padding: 10,
  },
  skipButtonText: {
    color: projectColors.secondaryText,
    fontSize: 13,
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
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
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
    fontSize: 14,
    color: projectColors.text,
  },
  customRoutineContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 12,
    marginTop: 5,
  },
  customRoutineInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: projectColors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: 'ZenMaruGothic_400Regular',
    fontSize: 14,
    color: projectColors.text,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: projectColors.success,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'ZenMaruGothic_500Medium',
  },
}); 