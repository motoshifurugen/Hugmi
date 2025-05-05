import React, { useEffect, useRef, useState } from 'react';
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

// 仮のユーザーID（実際のアプリでは認証システムから取得）
const TEMP_USER_ID = 'user1';

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
  
  // アニメーション用の値
  const fadeTextJa = useRef(new Animated.Value(0)).current;
  const fadeTextEn = useRef(new Animated.Value(0)).current;
  const fadeAuthor = useRef(new Animated.Value(0)).current;
  const fadeButton = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 名言データを取得
    const fetchQuote = async () => {
      try {
        console.log('[DEBUG] 名言取得プロセスを開始');
        // ユーザーがまだ表示していない名言をランダムに取得
        const quote = await getUnviewedRandomQuote(TEMP_USER_ID);
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
          
          // 表示した名言を記録（有効なIDの場合のみ）
          if (quote.id && quote.id !== 'temp-id' && quote.id !== 'error-id' && quote.id !== 'fallback-id') {
            try {
              console.log('[DEBUG] 名言の表示を記録:', quote.id);
              await recordViewedQuote(TEMP_USER_ID, quote.id);
            } catch (recordError) {
              console.error('[DEBUG] 表示記録エラー:', recordError);
            }
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
    
    fetchQuote();
  }, []);

  useEffect(() => {
    if (!loading && dailyQuote) {
      // データが取得できたらアニメーションを開始
      startAnimations();
    }
  }, [loading, dailyQuote]);

  const startAnimations = () => {
    // アニメーションをシーケンスとして定義
    Animated.sequence([
      // 日本語名言をフェードイン
      Animated.timing(fadeTextJa, {
        toValue: 1,
        duration: 800,  // 1000から800msに短縮
        useNativeDriver: true,
      }),
      // 英語名言をフェードイン
      Animated.timing(fadeTextEn, {
        toValue: 1,
        duration: 600,  // 800から600msに短縮
        useNativeDriver: true,
        delay: 150,     // 200から150msに短縮
      }),
      // 著者名をフェードイン
      Animated.timing(fadeAuthor, {
        toValue: 1,
        duration: 600,  // 800から600msに短縮
        useNativeDriver: true,
        delay: 150,     // 200から150msに短縮
      }),
      // ボタンをフェードイン
      Animated.timing(fadeButton, {
        toValue: 1,
        duration: 600,  // 800から600msに短縮
        useNativeDriver: true,
        delay: 150,     // 200から150msに短縮
      }),
    ]).start();
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
            color={projectColors.secondary} 
            type="marker" 
            size={24}
          />
          <CornerDecoration 
            position="topRight" 
            color={projectColors.secondary} 
            type="marker" 
            size={24}
          />
          <CornerDecoration 
            position="bottomLeft" 
            color={projectColors.secondary} 
            type="marker" 
            size={24}
          />
          <CornerDecoration 
            position="bottomRight" 
            color={projectColors.secondary} 
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
          <ThemedText style={styles.buttonText}>
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
    backgroundColor: projectColors.primary,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    
    // ニューモーフィズムスタイル：影と光の効果
    shadowColor: projectColors.neuDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
    
    // 左上に光の効果
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopColor: projectColors.neuLight,
    borderLeftColor: projectColors.neuLight,
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    
    width: '70%',
    alignSelf: 'center',
  },
  buttonPressed: {
    backgroundColor: projectColors.primary,
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
    
    // 押された時は影を小さく
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: projectColors.black1,
    textAlign: 'center',
  },
}); 