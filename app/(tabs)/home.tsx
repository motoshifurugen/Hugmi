import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, Pressable, Animated } from 'react-native';
import { router } from 'expo-router';

import { HelloWave } from '@/components/common/HelloWave';
import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { projectColors } from '@/constants/Colors';
import { fonts } from '@/constants/fonts';
import { getTimeBasedGreeting } from '@/constants/utils';
import { getUserById } from '@/db/utils/users';
import { getTodayRoutineProgress } from '@/db/utils/routine_logs';
import { getTodayViewedQuote, getUnviewedRandomQuote } from '@/db/utils/viewed_quotes';
import { IconSymbol } from '@/components/common/ui/IconSymbol';
import { 
  createNeomorphicStyle, 
  createNeomorphicButtonStyle,
  createNeomorphicButtonPressedStyle
} from '@/constants/NeuomorphicStyles';
import { getAllUsers } from '@/db/utils/users';
import { ACTIVE_USER_ID } from '@/components/quotes/DailyQuoteScreen';

// 仮のユーザーID（本番では認証から取得）
const TEMP_USER_ID = '1';

// ニューモーフィズム用のカードスタイル
const cardNeomorphStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 4,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.5)',
  backgroundColor: projectColors.white1,
  borderRadius: 16,
};

// アクションボタン用のニューモーフィズムスタイル（ルーティン画面と同様）
const actionButtonNeomorphStyle = {
  backgroundColor: projectColors.softOrange,
  paddingVertical: 16,
  paddingHorizontal: 16,
  borderRadius: 16,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  
  // 影効果
  shadowColor: '#000',
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 4,
  
  // 光の効果
  borderTopWidth: 1.5,
  borderLeftWidth: 1.5,
  borderBottomWidth: 0,
  borderRightWidth: 0,
  borderTopColor: 'rgba(255, 255, 255, 0.7)',
  borderLeftColor: 'rgba(255, 255, 255, 0.7)',
  borderBottomColor: 'transparent',
  borderRightColor: 'transparent',
};

// ボタン押下時のスタイル
const actionButtonPressedStyle = {
  backgroundColor: projectColors.softOrange,
  opacity: 0.95,
  transform: [{ scale: 0.98 }],
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [routineProgress, setRoutineProgress] = useState({ completed: 0, total: 0 });
  const [todayQuote, setTodayQuote] = useState({ textJa: '', authorJa: '' });
  const [userId, setUserId] = useState('');
  
  // ボタンアニメーション用のAnimated Valueを追加
  const routineButtonScale = useRef(new Animated.Value(1)).current;
  const quotesButtonScale = useRef(new Animated.Value(1)).current;

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
        } else {
          console.error('ユーザーが見つかりません');
          setUserName('ゲスト');
        }
        
        // ユーザーIDが取得できた場合はそのユーザーのデータを取得
        if (user) {
          // 今日のルーティン進捗を取得
          const progress = await getTodayRoutineProgress(user.id);
          setRoutineProgress({
            completed: progress.completed,
            total: progress.total
          });
          
          // 今日の朝に表示した名言を取得
          console.log('[DEBUG] ホーム画面: 今日の名言を取得開始');
          const todayQuote = await getTodayViewedQuote(user.id);
          
          if (todayQuote) {
            console.log('[DEBUG] ホーム画面: 今日の名言を取得成功');
            setTodayQuote({
              textJa: todayQuote.textJa,
              authorJa: todayQuote.authorJa
            });
          } else {
            // 表示履歴がない場合は、ランダムな名言を表示
            console.log('[DEBUG] ホーム画面: 表示履歴がないためランダムな名言を取得');
            const randomQuote = await getUnviewedRandomQuote(user.id);
            if (randomQuote) {
              setTodayQuote({
                textJa: randomQuote.textJa,
                authorJa: randomQuote.authorJa
              });
            } else {
              // 名言がない場合のデフォルト
              setTodayQuote({
                textJa: '今日も新しい一日の始まりです',
                authorJa: 'Hugmi'
              });
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('ホーム画面データの読み込みエラー:', error);
        setLoading(false);
        // エラー時のデフォルト
        setTodayQuote({
          textJa: '今日も新しい一日の始まりです',
          authorJa: 'Hugmi'
        });
      }
    };
    
    loadData();
  }, []);
  
  // ボタンアニメーション関数
  const animateButton = (buttonScale: Animated.Value, onComplete?: () => void) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.05, // ルーティン画面の「できた！」ボタンと同じ値
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (onComplete) {
        onComplete();
      }
    });
  };
  
  // 明日のルーティンボタンのハンドラ
  const handleRoutinePress = () => {
    animateButton(routineButtonScale, () => {
      router.push('/(tabs)/routine');
    });
  };
  
  // 名言コレクションボタンのハンドラ
  const handleQuotesPress = () => {
    animateButton(quotesButtonScale, () => {
      router.push('/(tabs)/quotes');
    });
  };
  
  // 時間帯に応じた挨拶を取得
  const greeting = getTimeBasedGreeting();
  
  // ローディング中の表示
  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={projectColors.softOrange} />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. あいさつと名前表示 */}
      <View style={styles.greetingContainer}>
        <View style={styles.greetingTextContainer}>
          <ThemedText style={styles.greeting}>
            {greeting}、
          </ThemedText>
          <ThemedText style={styles.userName}>
            {userName}さん
          </ThemedText>
        </View>
        <View style={styles.waveContainer}>
          <HelloWave />
        </View>
      </View>
      
      {/* 2. 今日のルーティン進捗 */}
      <View style={styles.progressContainer}>
        <ThemedText style={styles.progressText}>
          今日のルーティン達成度： {routineProgress.completed} / {routineProgress.total} ステップ
        </ThemedText>
        
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
        <ThemedText style={styles.quoteLabel}>今朝の名言：</ThemedText>
        <ThemedText style={styles.quoteText}>
          {todayQuote.textJa.replace(/\\n/g, '\n')}
        </ThemedText>
        <ThemedText style={styles.quoteAuthor}>
          – {todayQuote.authorJa}
        </ThemedText>
      </View>
      
      {/* アクションボタン */}
      <View style={styles.actionsContainer}>
        <Animated.View style={{ transform: [{ scale: routineButtonScale }], width: '48%' }}>
          <Pressable 
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]}
            onPress={handleRoutinePress}
          >
            <IconSymbol name="list.star" size={22} color={projectColors.black1} />
            <ThemedText style={styles.actionButtonText}>明日のルーティン</ThemedText>
          </Pressable>
        </Animated.View>
        
        <Animated.View style={{ transform: [{ scale: quotesButtonScale }], width: '48%' }}>
          <Pressable 
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]}
            onPress={handleQuotesPress}
          >
            <IconSymbol name="sparkles" size={22} color={projectColors.black1} />
            <ThemedText style={styles.actionButtonText}>名言コレクション</ThemedText>
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
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  greetingTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginRight: 8,
  },
  waveContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontFamily: fonts.families.primary,
    fontSize: 24,
    fontWeight: '600',
    marginRight: 4,
    paddingTop: 2,
  },
  userName: {
    fontFamily: fonts.families.primary,
    fontSize: 24,
    fontWeight: '600',
    paddingTop: 2,
  },
  progressContainer: {
    marginBottom: 34,
  },
  progressText: {
    fontFamily: fonts.families.primary,
    fontSize: 16,
    marginBottom: 8,
    color: projectColors.black1,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: projectColors.softOrange,
    opacity: 0.7,
  },
  quoteContainer: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'flex-start',
    backgroundColor: projectColors.white1,
  },
  quoteLabel: {
    fontFamily: fonts.families.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  quoteText: {
    fontFamily: fonts.families.primary,
    fontSize: 18,
    lineHeight: 32,
    textAlign: 'left',
    fontStyle: 'italic',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  quoteAuthor: {
    fontFamily: fonts.families.primary,
    fontSize: 14,
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    ...actionButtonNeomorphStyle,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: fonts.families.primary,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: projectColors.black1,
  },
  buttonPressed: {
    ...actionButtonPressedStyle,
  },
  button: {
    ...actionButtonNeomorphStyle,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 