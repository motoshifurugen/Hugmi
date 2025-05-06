import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, Pressable, Animated, TextStyle, ViewStyle, DimensionValue } from 'react-native';
import { router } from 'expo-router';

import { HelloWave } from '@/components/common/HelloWave';
import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { projectColors } from '@/constants/Colors';
import { fonts } from '@/constants/fonts';
import { getTimeBasedGreeting } from '@/constants/utils';
import { getTodayRoutineProgress, isTodayRoutineStarted, isTodayRoutineCompleted } from '@/db/utils/routine_logs';
import { getTodayViewedQuote, getUnviewedRandomQuote } from '@/db/utils/viewed_quotes';
import { IconSymbol } from '@/components/common/ui/IconSymbol';
import { getAllUsers } from '@/db/utils/users';
import { 
  createNeomorphicStyle, 
  createNeomorphicButtonStyle,
  createNeomorphicButtonPressedStyle
} from '@/constants/NeuomorphicStyles';

// ニューモーフィズムスタイルの適用
const cardNeomorphStyle = {
  ...createNeomorphicStyle(0, 4, 4, 1, false),
  width: undefined,
  height: undefined,
  backgroundColor: projectColors.white1,
  borderRadius: 16,
  borderColor: 'rgba(255, 255, 255, 0.5)',
};

// アクションボタン用のニューモーフィズムスタイル
const actionButtonNeomorphStyle = {
  ...createNeomorphicButtonStyle(undefined, 16),
  backgroundColor: projectColors.primary,
  paddingVertical: 16,
  paddingHorizontal: 24,
  width: '100%',
  alignSelf: 'stretch',
  // 影を軽くする
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
  borderColor: projectColors.primary,
};

// ボタン押下時のスタイル - 押下前の色を渡す
const actionButtonPressedStyle = {
  ...createNeomorphicButtonPressedStyle(projectColors.primary),
  opacity: 0.95,
};

// デフォルト値の定義
const DEFAULT_QUOTE = {
  textJa: '今日も新しい一日の始まりです',
  authorJa: 'Hugmi'
};

const DEFAULT_ROUTINE_PROGRESS = { completed: 0, total: 0 };

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [routineProgress, setRoutineProgress] = useState(DEFAULT_ROUTINE_PROGRESS);
  const [todayQuote, setTodayQuote] = useState(DEFAULT_QUOTE);
  const [userId, setUserId] = useState('');
  const [routineStarted, setRoutineStarted] = useState(false);
  const [routineCompleted, setRoutineCompleted] = useState(false);
  
  // ボタンアニメーション用のAnimated Value
  const routineButtonScale = useRef(new Animated.Value(1)).current;
  const quotesButtonScale = useRef(new Animated.Value(1)).current;
  const resumeButtonScale = useRef(new Animated.Value(1)).current;

  // ボタンアニメーション関数
  const animateButton = (buttonScale: Animated.Value, onComplete?: () => void) => {
    // タッチフィードバックを迅速に行うために時間を短縮
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.03, // より控えめな拡大率
        duration: 80, // 時間を短縮 (150ms → 80ms)
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 70, // 時間を短縮 (150ms → 70ms)
        useNativeDriver: true,
      })
    ]).start(onComplete);
  };
  
  // ボタンハンドラー関数
  const createButtonHandler = (buttonScale: Animated.Value, route: string) => {
    return () => {
      // 先にルート遷移を開始することで、アニメーション完了を待たずに画面遷移の準備を始める
      const navigationTimeout = setTimeout(() => {
        router.push(route as any);
      }, 80); // アニメーション開始から80ms後に遷移を開始
      
      // アニメーションを実行（遷移は並行して行われる）
      animateButton(buttonScale, () => {
        clearTimeout(navigationTimeout); // すでに遷移が始まっていればタイムアウトをクリア
      });
    };
  };
  
  // 各ボタンのハンドラー
  const handleRoutinePress = createButtonHandler(routineButtonScale, '/(tabs)/routine');
  const handleQuotesPress = createButtonHandler(quotesButtonScale, '/(tabs)/quotes');
  const handleResumeRoutinePress = createButtonHandler(resumeButtonScale, '/routine-flow/routine');

  useEffect(() => {
    const loadData = async () => {
      try {
        // データベースから最初のユーザーを取得
        const users = await getAllUsers();
        let user = null;
        
        if (users.length > 0) {
          // 最初のユーザーを使用
          user = users[0];
          setUserId(user.id);
          setUserName(user.name);
          console.log(`[DEBUG] ホーム画面: ユーザー「${user.name}」を読み込みました`);
        } else {
          console.log('[DEBUG] ホーム画面: ユーザーが見つかりません、ゲストとして表示します');
          setUserName('ゲスト');
          
          // 最初のアクセス時にユーザーがいない場合は、一時的なルーティンデータを表示
          setRoutineProgress({
            completed: 0,
            total: 3 // 仮のルーティン数
          });
          
          setTodayQuote(DEFAULT_QUOTE);
          setLoading(false);
          return; // 以降の処理はスキップ
        }
        
        // ユーザーIDが取得できた場合はそのユーザーのデータを取得
        if (user) {
          await loadUserData(user.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('ホーム画面データの読み込みエラー:', error);
        setLoading(false);
        // エラー時のデフォルト
        setUserName('ゲスト');
        setRoutineProgress(DEFAULT_ROUTINE_PROGRESS);
        setTodayQuote(DEFAULT_QUOTE);
      }
    };
    
    loadData();
  }, []);
  
  // ユーザーデータ読み込み用の関数
  const loadUserData = async (userId: string) => {
    try {
      // 今日のルーティン進捗を取得
      await loadRoutineData(userId);
      
      // 今日の名言を取得
      await loadQuoteData(userId);
    } catch (error) {
      console.error('ユーザーデータの読み込みエラー:', error);
      // デフォルト値はすでに初期化済み
    }
  };
  
  // ルーティンデータ読み込み用の関数
  const loadRoutineData = async (userId: string) => {
    try {
      // 今日のルーティン進捗を取得
      const progress = await getTodayRoutineProgress(userId);
      setRoutineProgress({
        completed: progress.completed,
        total: progress.total
      });
      console.log(`[DEBUG] ホーム画面: ルーティン進捗を取得 (${progress.completed}/${progress.total})`);
      
      // ルーティンの状態を取得
      const started = await isTodayRoutineStarted(userId);
      const completed = await isTodayRoutineCompleted(userId);
      setRoutineStarted(started);
      setRoutineCompleted(completed);
    } catch (error) {
      console.error('ルーティンデータの取得に失敗しました:', error);
      // エラー時のデフォルト値
      setRoutineProgress(DEFAULT_ROUTINE_PROGRESS);
      setRoutineStarted(false);
      setRoutineCompleted(false);
    }
  };
  
  // 名言データ読み込み用の関数
  const loadQuoteData = async (userId: string) => {
    try {
      console.log('[DEBUG] ホーム画面: 今日の名言を取得開始');
      const todayQuote = await getTodayViewedQuote(userId);
      
      if (todayQuote) {
        console.log('[DEBUG] ホーム画面: 今日の名言を取得成功');
        setTodayQuote({
          textJa: todayQuote.textJa,
          authorJa: todayQuote.authorJa
        });
      } else {
        // 表示履歴がない場合は、ランダムな名言を表示
        console.log('[DEBUG] ホーム画面: 表示履歴がないためランダムな名言を取得');
        const randomQuote = await getUnviewedRandomQuote(userId);
        if (randomQuote) {
          setTodayQuote({
            textJa: randomQuote.textJa,
            authorJa: randomQuote.authorJa
          });
        } else {
          // 名言がない場合のデフォルト
          setTodayQuote(DEFAULT_QUOTE);
        }
      }
    } catch (error) {
      console.error('名言データの取得に失敗しました:', error);
      // エラー時のデフォルト
      setTodayQuote(DEFAULT_QUOTE);
    }
  };

  // ローディング中の表示
  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={projectColors.softOrange} />
      </ThemedView>
    );
  }

  // ルーティンが開始されているが完了していない場合に「再開する」ボタンを表示
  const showResumeButton = routineStarted && !routineCompleted;
  
  // 時間帯に応じた挨拶を取得
  const greeting = getTimeBasedGreeting();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. あいさつと名前表示 */}
      <View style={styles.greetingContainer}>
        <View style={styles.greetingTextContainer}>
          <ThemedText style={styles.greetingText}>
            {greeting}、
          </ThemedText>
          <ThemedText style={styles.greetingText}>
            {userName}さん
          </ThemedText>
        </View>
        <View style={styles.waveContainer}>
          <HelloWave />
        </View>
      </View>
      
      {/* 2. 今日のルーティン進捗 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeaderContainer}>
          <ThemedText style={styles.bodyText}>
            今日のルーティン達成度： {routineProgress.completed} / {routineProgress.total} 
          </ThemedText>
          
          {/* ルーティンが開始されているが完了していない場合 */}
          {showResumeButton && (
            <Animated.View style={{ transform: [{ scale: resumeButtonScale }] }}>
              <Pressable 
                style={({ pressed }) => [
                  styles.resumeButton,
                  pressed && styles.resumeButtonPressed
                ]}
                onPress={handleResumeRoutinePress}
                // より即時的なフィードバックのために最小の押し下げ時間を設定
                android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <ThemedText style={styles.resumeButtonText}>再開</ThemedText>
              </Pressable>
            </Animated.View>
          )}
        </View>
        
        {/* シンプルな進捗バー */}
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${routineProgress.total > 0 
                  ? (routineProgress.completed / routineProgress.total) * 100 
                  : 0}%` 
              }
            ]} 
          />
        </View>
      </View>
      
      {/* 3. 今日の名言（朝に表示したもの） */}
      <View style={[styles.quoteContainer, cardNeomorphStyle]}>
        <ThemedText style={styles.quoteText}>
          {todayQuote.textJa.replace(/\\n/g, '\n')}
        </ThemedText>
        <ThemedText style={styles.quoteAuthor}>
          – {todayQuote.authorJa}
        </ThemedText>
      </View>
      
      {/* アクションボタン */}
      <View style={styles.actionsContainer}>
        <Animated.View style={{ transform: [{ scale: routineButtonScale }], width: '100%', marginBottom: 16 }}>
          <Pressable 
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]}
            onPress={handleRoutinePress}
            // 押下時の応答性を向上
            android_ripple={{ color: 'rgba(0,0,0,0.05)', borderless: false }}
            hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
          >
            <View style={styles.iconContainer}>
              <IconSymbol name="list.star" size={24} color={projectColors.black1} />
            </View>
            <ThemedText style={styles.buttonText}>明日のルーティン</ThemedText>
          </Pressable>
        </Animated.View>
        
        <Animated.View style={{ transform: [{ scale: quotesButtonScale }], width: '100%' }}>
          <Pressable 
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]}
            onPress={handleQuotesPress}
            // 押下時の応答性を向上
            android_ripple={{ color: 'rgba(0,0,0,0.05)', borderless: false }}
            hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
          >
            <View style={styles.iconContainer}>
              <IconSymbol name="sparkles" size={24} color={projectColors.black1} />
            </View>
            <ThemedText style={styles.buttonText}>名言コレクション</ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: projectColors.white1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 120,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: projectColors.white1,
  },
  // テキストスタイル - 共通スタイル
  bodyText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.regular,
    color: projectColors.black1,
  } as TextStyle,
  buttonText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
    color: projectColors.black1,
  } as TextStyle,
  // グリーティングセクション
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  } as ViewStyle,
  greetingTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginRight: 8,
  } as ViewStyle,
  greetingText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes['2xl'],
    fontWeight: fonts.weights.bold,
    marginRight: 4,
    paddingTop: 6,
  } as TextStyle,
  waveContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  // 進捗セクション
  progressContainer: {
    marginBottom: 34,
  } as ViewStyle,
  progressHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,
  progressText: {
    flex: 1,
  } as TextStyle,
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  } as ViewStyle,
  progressBar: {
    height: '100%',
    backgroundColor: projectColors.softOrange,
    opacity: 0.7,
  } as ViewStyle,
  // 名言セクション
  quoteContainer: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'flex-start',
    backgroundColor: projectColors.white1,
  } as ViewStyle,
  quoteText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.lg,
    lineHeight: fonts.sizes.lg * fonts.lineHeights.loose,
    textAlign: 'left',
    marginBottom: 16,
    alignSelf: 'flex-start',
    fontWeight: fonts.weights.medium,
  } as TextStyle,
  quoteAuthor: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.sm,
    textAlign: 'right',
    alignSelf: 'flex-end',
  } as TextStyle,
  // アクションボタンセクション
  actionsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 24,
    width: '100%',
    marginBottom: 24,
  } as ViewStyle,
  button: {
    ...actionButtonNeomorphStyle,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  } as ViewStyle,
  iconContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  } as ViewStyle,
  buttonPressed: {
    ...actionButtonPressedStyle,
  } as ViewStyle,
  resumeButton: {
    backgroundColor: projectColors.softOrange,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginLeft: 8,
  } as ViewStyle,
  resumeButtonPressed: {
    opacity: 0.85, // より明確な押下効果
    transform: [{ scale: 0.97 }], // 軽い縮小効果を追加
  } as ViewStyle,
  resumeButtonText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
    color: projectColors.white1,
  } as TextStyle,
}); 