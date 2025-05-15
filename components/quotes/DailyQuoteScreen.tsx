import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Pressable, 
  Dimensions, 
  Image,
  ImageSourcePropType,
  ActivityIndicator
} from 'react-native';

import { projectColors } from '@/constants/Colors';
import { ThemedView } from '@/components/common/ThemedView';
import { ThemedText } from '@/components/common/ThemedText';
import CornerDecoration from '@/components/common/ui/CornerDecoration';
import { router } from 'expo-router';
import { getUnviewedRandomQuote, recordViewedQuote } from '@/db/utils/viewed_quotes';
import { createNeomorphicButtonStyle, createNeomorphicButtonPressedStyle } from '@/constants/NeuomorphicStyles';
import { emitQuoteViewed } from '@/utils/events';

// データベース初期化状態のグローバル変数
let DB_INITIALIZED = false;

// アクティブユーザーID用のグローバル変数
let ACTIVE_USER_ID = 'user1'; // デフォルト値は後で上書きされる

// グローバル変数をエクスポート
export { ACTIVE_USER_ID };

// データベース初期化状態を設定するための関数
export const setDbInitializedGlobal = (value: boolean) => {
  console.log(`[DEBUG] データベース初期化状態をグローバル設定: ${value}`);
  DB_INITIALIZED = value;
};

// アクティブユーザーIDを設定するための関数
export const setActiveUserId = (userId: string) => {
  console.log(`[DEBUG] アクティブユーザーIDをグローバル設定: ${userId}`);
  ACTIVE_USER_ID = userId;
};

// 著者画像のマッピング
const AUTHOR_IMAGES: Record<string, ImageSourcePropType> = {
  'seneca.png': require('@/assets/images/great_person/seneca.png'),
  'confucius.png': require('@/assets/images/great_person/confucius.png'),
  'socrates.png': require('@/assets/images/great_person/socrates.png'),
  'plato.png': require('@/assets/images/great_person/plato.png'),
  'aristotle.png': require('@/assets/images/great_person/aristotle.png'),
  'mencius.png': require('@/assets/images/great_person/mencius.png'),
  'marcus_aurelius.png': require('@/assets/images/great_person/marcus_aurelius.png'),
  'augustine.png': require('@/assets/images/great_person/augustine.png'),
  'thomas_aquinas.png': require('@/assets/images/great_person/thomas_aquinas.png'),
  'george_herbert.png': require('@/assets/images/great_person/george_herbert.png'),
  'rene_descartes.png': require('@/assets/images/great_person/rene_descartes.png'),
  'john_milton.png': require('@/assets/images/great_person/john_milton.png'),
  'baruch_spinoza.png': require('@/assets/images/great_person/baruch_spinoza.png'),
  'voltaire.png': require('@/assets/images/great_person/voltaire.png'),
  'benjamin_franklin.png': require('@/assets/images/great_person/benjamin_franklin.png'),
  'samuel_johnson.png': require('@/assets/images/great_person/samuel_johnson.png'),
  'oliver_goldsmith.png': require('@/assets/images/great_person/oliver_goldsmith.png'),
  'johann_wolfgang_von_goethe.png': require('@/assets/images/great_person/johann_wolfgang_von_goethe.png'),
  'jane_austen.png': require('@/assets/images/great_person/jane_austen.png'),
  'charles_lamb.png': require('@/assets/images/great_person/charles_lamb.png'),
  'arthur_schopenhauer.png': require('@/assets/images/great_person/arthur_schopenhauer.png'),
  'ralph_waldo_emerson.png': require('@/assets/images/great_person/ralph_waldo_emerson.png'),
  'hans_christian_andersen.png': require('@/assets/images/great_person/hans_christian_andersen.png'),
  'charles_dickens.png': require('@/assets/images/great_person/charles_dickens.png'),
  'samuel_smiles.png': require('@/assets/images/great_person/samuel_smiles.png'),
  'frederick_douglass.png': require('@/assets/images/great_person/frederick_douglass.png'),
  'george_eliot.png': require('@/assets/images/great_person/george_eliot.png'),
  'john_ruskin.png': require('@/assets/images/great_person/john_ruskin.png'),
  'mark_twain.png': require('@/assets/images/great_person/mark_twain.png'),
  'william_james.png': require('@/assets/images/great_person/william_james.png'),
  'thomas_edison.png': require('@/assets/images/great_person/thomas_edison.png'),
  'robert_louis_stevenson.png': require('@/assets/images/great_person/robert_louis_stevenson.png'),
  'soseki_natsume.png': require('@/assets/images/great_person/soseki_natsume.png'),
  'marcel_proust.png': require('@/assets/images/great_person/marcel_proust.png'),
};

// 著者画像を取得する関数
const getAuthorImage = (fileName: string): ImageSourcePropType => {
  // デフォルト画像
  const defaultImage = AUTHOR_IMAGES['seneca.png'];
  
  // マッピングから画像を取得
  return AUTHOR_IMAGES[fileName] || defaultImage;
};

interface Quote {
  id: string;
  textJa: string;
  textEn: string;
  authorJa: string;
  authorEn: string;
  era: string;
  imagePath: string;
}

interface DailyQuoteScreenProps {
  onStart: () => void;
}

export default function DailyQuoteScreen({ onStart }: DailyQuoteScreenProps) {
  // 状態管理
  const [loading, setLoading] = useState(true);
  const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);
  const [pendingRecordQueue, setPendingRecordQueue] = useState<string[]>([]);
  const [animationReady, setAnimationReady] = useState(false);
  
  // アニメーション用の値
  const fadeTextJa = useRef(new Animated.Value(0)).current;
  const fadeTextEn = useRef(new Animated.Value(0)).current;
  const fadeAuthor = useRef(new Animated.Value(0)).current;
  const fadeButton = useRef(new Animated.Value(0)).current;

  // コンポーネントマウント時に各アニメーション値をリセット
  useEffect(() => {
    console.log('[DEBUG] DailyQuoteScreen コンポーネントがマウントされました');
    // すべてのアニメーション値を初期状態にリセット
    fadeTextJa.setValue(0);
    fadeTextEn.setValue(0);
    fadeAuthor.setValue(0);
    fadeButton.setValue(0);
    
    // ローディング状態を強制的にtrueに設定
    setLoading(true);
    setAnimationReady(false);
    
    // データ取得処理を呼び出し
    fetchQuote();
    
    // このuseEffectはコンポーネントのマウント時に1回だけ実行
  }, []);

  // データベース初期化状態が変更された場合に保留中の記録を処理
  useEffect(() => {
    const processPendingRecords = async () => {
      if (DB_INITIALIZED && pendingRecordQueue.length > 0 && ACTIVE_USER_ID !== 'user1') {
        console.log(`[DEBUG] データベース初期化完了を検知。保留中の記録を処理: ${pendingRecordQueue.length}件`);
        
        // 保留中のすべての名言記録を処理
        for (const quoteId of pendingRecordQueue) {
          try {
            console.log(`[DEBUG] 保留していた名言の表示を記録: ${quoteId}`);
            await recordViewedQuote(ACTIVE_USER_ID, quoteId);
            // 名言表示イベントを発行（コレクション画面で即時反映するため）
            console.log(`[DEBUG] 保留していた名言の表示イベントを発行: ${quoteId}`);
            emitQuoteViewed(quoteId);
          } catch (error) {
            console.error('[DEBUG] 保留中の表示記録エラー:', error);
          }
        }
        
        // 処理後にキューをクリア
        setPendingRecordQueue([]);
      }
    };
    
    processPendingRecords();
  }, [pendingRecordQueue, ACTIVE_USER_ID]);

  // データロード完了後にアニメーション準備完了フラグをセット
  useEffect(() => {
    if (!loading && dailyQuote) {
      console.log('[DEBUG] データロード完了、アニメーション準備完了');
      // ローディング完了後に少し遅延させてからアニメーション準備完了
      const timer = setTimeout(() => {
        setAnimationReady(true);
      }, 100); // 100ms遅延
      
      return () => clearTimeout(timer);
    }
  }, [loading, dailyQuote]);
  
  // アニメーション準備完了後にアニメーションを開始
  useEffect(() => {
    if (animationReady) {
      console.log('[DEBUG] アニメーション開始');
      startAnimations();
    }
  }, [animationReady]);

  // 名言データを取得する関数
  const fetchQuote = async () => {
    try {
      console.log('[DEBUG] 名言取得プロセスを開始');
      // ユーザーがまだ表示していない名言をランダムに取得
      // ユーザーがまだ存在しない場合はnullユーザーIDを使用（すべての名言から選択）
      const quoteUserId = ACTIVE_USER_ID === 'user1' ? null : ACTIVE_USER_ID;
      const quote = await getUnviewedRandomQuote(quoteUserId || '');
      console.log('[DEBUG] 処理済み名言データ:', quote);
      
      if (quote) {
        setDailyQuote({
          id: quote.id || 'temp-id',
          textJa: quote.textJa || '名言データがありません',
          textEn: quote.textEn || '',
          authorJa: quote.authorJa || '不明',
          authorEn: quote.authorEn || '',
          era: quote.era || '',
          imagePath: quote.imagePath || 'seneca.png'
        });
        
        // 表示した名言を記録（データベース初期化完了後かつアクティブユーザーIDが有効な場合のみ）
        if (quote.id && quote.id !== 'temp-id' && quote.id !== 'error-id' && quote.id !== 'fallback-id') {
          // 非同期で記録を行い、UIスレッドをブロックしない
          const recordQuoteView = async () => {
            try {
              // ユーザーIDが初期値のままの場合（チュートリアル前）は記録をスキップ
              if (ACTIVE_USER_ID === 'user1') {
                console.log('[DEBUG] ユーザーがまだ作成されていません。表示記録をスキップします。');
                return;
              }
              
              // 名言表示イベントを発行（コレクション画面で即時反映するため）
              console.log('[DEBUG] 名言表示イベントを発行:', quote.id);
              emitQuoteViewed(quote.id);
              
              // タイムゾーンを考慮した現在時刻をログに記録
              const now = new Date();
              console.log('[DEBUG] 名言表示記録 - 現在時刻:', now.toISOString());
              console.log('[DEBUG] 名言表示記録 - 日本時間:', new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString());
              
              if (DB_INITIALIZED) {
                // データベースが初期化済みの場合は直接記録
                console.log('[DEBUG] 名言の表示を記録（DB初期化済み）:', quote.id);
                
                // 確実に記録するために複数回試行
                let success = false;
                for (let i = 0; i < 3; i++) {
                  try {
                    success = await recordViewedQuote(ACTIVE_USER_ID, quote.id);
                    console.log(`[DEBUG] 名言表示記録 - 試行 ${i+1}: ${success ? '成功' : '失敗'}`);
                    if (success) break;
                  } catch (err) {
                    console.error(`[DEBUG] 表示記録エラー (試行 ${i+1}):`, err);
                  }
                  
                  // 失敗した場合は少し待ってから再試行
                  if (!success && i < 2) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                  }
                }
              } else {
                // データベース初期化待ちの場合はキューに追加
                console.log('[DEBUG] 名言の表示記録を保留（DB初期化待ち）:', quote.id);
                setPendingRecordQueue(prev => [...prev, quote.id]);
              }
            } catch (recordError) {
              console.error('[DEBUG] 表示記録リクエスト中のエラー:', recordError);
            }
          };
          
          // 記録処理を実行
          recordQuoteView();
        }
      } else {
        console.log('[DEBUG] 名言データなし。フォールバックを使用');
        // 名言がない場合のフォールバック
        setDailyQuote({
          id: 'fallback-id',
          textJa: '今日も新しい一日の始まりです',
          textEn: 'Today is the beginning of a new day',
          authorJa: 'Hugmi',
          authorEn: 'Hugmi',
          era: '',
          imagePath: 'seneca.png'
        });
      }
    } catch (error) {
      console.error('[DEBUG] 名言取得エラー:', error);
      // エラー時のフォールバック
      setDailyQuote({
        id: 'error-id',
        textJa: '新しい朝が来ました。昨日までの問題は今日解決できます。',
        textEn: 'A new morning has come. Yesterday\'s issues can be solved today.',
        authorJa: 'Hugmi',
        authorEn: 'Hugmi',
        era: '',
        imagePath: 'seneca.png'
      });
    } finally {
      setLoading(false);
    }
  };

  const startAnimations = () => {
    console.log('[DEBUG] アニメーションシーケンス開始');
    // すべてのアニメーション値を初期状態に戻す
    fadeTextJa.setValue(0);
    fadeTextEn.setValue(0);
    fadeAuthor.setValue(0);
    fadeButton.setValue(0);
    
    // アニメーションをシーケンスとして定義
    Animated.sequence([
      // 日本語名言をフェードイン
      Animated.timing(fadeTextJa, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // 英語名言をフェードイン
      Animated.timing(fadeTextEn, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        delay: 150,
      }),
      // 著者名をフェードイン
      Animated.timing(fadeAuthor, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        delay: 150,
      }),
      // ボタンをフェードイン
      Animated.timing(fadeButton, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        delay: 150,
      }),
    ]).start(({finished}) => {
      console.log(`[DEBUG] アニメーションシーケンス完了: ${finished ? '成功' : '中断'}`);
    });
  };

  // ローディング中の表示（スタイルを背景色なしに変更してスプラッシュ画面との切り替えをスムーズに）
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={projectColors.primary} />
      </ThemedView>
    );
  }

  if (!dailyQuote) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>
          名言データの取得に失敗しました。再度お試しください。
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* 名言カード */}
      <View style={styles.quoteCardWrapper}>
        <View style={styles.quoteCardContainer}>
          {/* 装飾の角飾り */}
          <CornerDecoration 
            position="topLeft" 
            color={projectColors.primary} 
            type="marker" 
            size={24}
          />
          <CornerDecoration 
            position="topRight" 
            color={projectColors.primary} 
            type="marker" 
            size={24}
          />
          <CornerDecoration 
            position="bottomLeft" 
            color={projectColors.primary} 
            type="marker" 
            size={24}
          />
          <CornerDecoration 
            position="bottomRight" 
            color={projectColors.primary} 
            type="marker" 
            size={24}
          />
          
          {/* 名言本文（日本語） */}
          <Animated.View style={{ opacity: fadeTextJa, marginTop: 12, paddingBottom: 12 }}>
            <ThemedText style={styles.quoteTextJa}>
              {dailyQuote.textJa.replace(/\\n/g, '\n')}
            </ThemedText>
          </Animated.View>
          
          {/* 名言本文（英語） */}
          <Animated.View style={{ opacity: fadeTextEn, marginTop: 12 }}>
            <ThemedText style={styles.quoteTextEn}>
              {dailyQuote.textEn}
            </ThemedText>
          </Animated.View>
          
          {/* 著者名と抽象シンボル */}
          <Animated.View 
            style={[
              styles.authorContainer, 
              { opacity: fadeAuthor }
            ]}
          >
            <ThemedText style={styles.authorText}>
              {dailyQuote.authorJa}
            </ThemedText>
            {/* 著者のシンボル画像 */}
            <View style={styles.symbolContainer}>
              <Image 
                source={getAuthorImage(dailyQuote.imagePath)}
                style={styles.authorSymbol} 
                resizeMode="cover"
              />
            </View>
          </Animated.View>
        </View>
      </View>
      
      {/* 「今日の朝をはじめる」ボタン */}
      <Animated.View 
        style={[
          styles.buttonContainer, 
          { opacity: fadeButton }
        ]}
      >
        <Pressable 
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.buttonPressed
          ]} 
          onPress={onStart}
        >
          <ThemedText style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">
            今日の朝をはじめる
          </ThemedText>
        </Pressable>
      </Animated.View>
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.9;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: projectColors.white1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: projectColors.white1,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'ZenMaruGothic_500Medium',
    color: projectColors.red1,
    textAlign: 'center',
    padding: 20,
  },
  quoteCardWrapper: {
    width: '95%',
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    maxWidth: 380,
  },
  quoteCardContainer: {
    width: '100%',
    padding: 25,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  quoteTextJa: {
    fontSize: 21,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: projectColors.black1,
    textAlign: 'left',
    lineHeight: 34,
    width: '100%',
    flexWrap: 'wrap',
  },
  quoteTextEn: {
    fontSize: 14,
    fontFamily: 'ZenMaruGothic_400Regular',
    color: projectColors.black2,
    textAlign: 'left',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  authorText: {
    fontSize: 16,
    fontFamily: 'ZenMaruGothic_500Medium',
    color: projectColors.black1,
  },
  symbolContainer: {
    marginLeft: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorSymbol: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  buttonContainer: {
    marginTop: 55,
    width: '100%',
    alignItems: 'center',
  },
  startButton: {
    ...createNeomorphicButtonStyle(240, 20),
    minWidth: 240,
    maxWidth: 240,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  buttonPressed: {
    ...createNeomorphicButtonPressedStyle(),
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: projectColors.black1,
    textAlign: 'center',
    includeFontPadding: false, // フォントのパディングを無効化して一貫した表示を確保
  },
}); 