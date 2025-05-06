import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Pressable, Animated, Dimensions, View, FlatList, ImageSourcePropType, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/components/common/ui/IconSymbol';
import CornerDecoration from '@/components/common/ui/CornerDecoration';
import { projectColors } from '@/constants/Colors';

// データベース関連のインポート
import { getQuoteById, getAllQuotes } from '@/db/utils/quotes';
import { isFavoriteQuote, addFavoriteQuote, removeFavoriteQuote } from '@/db/utils/favorite_quotes';
import { getViewedQuotesByUserId } from '@/db/utils/viewed_quotes';

// グローバル状態管理
import { useActiveUserIdSimple } from '@/hooks/useActiveUser';

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
  'oliver_goldsmith.png': require('@/assets/images/great_person/oliver_goldsmith.png'),
  // 他の著者画像
};

// 著者画像を取得する関数
const getAuthorImage = (fileName: string): ImageSourcePropType => {
  // デフォルト画像
  const defaultImage = AUTHOR_IMAGES['seneca.png'];
  
  // マッピングから画像を取得
  return AUTHOR_IMAGES[fileName] || defaultImage;
};

// 名言データの型定義
interface Quote {
  id: string;
  textJa: string;
  textEn?: string;
  authorJa?: string;
  authorEn?: string;
  era?: string;
  isFavorite: boolean;
  unlocked: boolean;
  imagePath?: string;
}

export default function QuoteDetailScreen() {
  const { id: quoteId } = useLocalSearchParams();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // アニメーション用の参照
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  
  // グローバルに保存されているアクティブユーザーIDを取得
  const activeUserId = useActiveUserIdSimple();
  
  const { width } = Dimensions.get('window');
  
  // カード幅の設定（画面幅の85%）
  const CARD_WIDTH = width * 0.85;
  // カード全体の幅（スクロール計算用）
  const FULL_ITEM_WIDTH = width;
  // 画面の左右余白（画面中央に配置するため）
  const SCREEN_PADDING = (width - CARD_WIDTH) / 2;
  
  // データベースからデータを取得する
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // すべての名言を取得
        const allQuotes = await getAllQuotes();
        
        // 表示済み名言のIDリストを取得
        const viewedQuotesRecords = await getViewedQuotesByUserId(activeUserId);
        const viewedQuoteIds = new Set(viewedQuotesRecords.map(record => record.quoteId));
        
        // 表示対象の名言を準備（表示済み名言がなければすべての名言を表示）
        let targetQuotes = allQuotes;
        if (viewedQuoteIds.size > 0) {
          // 表示済みの名言だけをフィルタリング
          targetQuotes = allQuotes.filter(quote => viewedQuoteIds.has(quote.id));
        } else {
          console.log('表示済み名言がないため、すべての名言を表示します');
        }
        
        // 指定されたIDの名言を中心に表示するための準備
        let targetQuoteIndex = 0;
        const formattedQuotes: Quote[] = await Promise.all(
          targetQuotes.map(async (quote, index) => {
            // お気に入り状態を取得
            const isFav = await isFavoriteQuote(activeUserId, quote.id);
            
            // 指定されたIDの名言のインデックスを記録
            if (quote.id === quoteId) {
              targetQuoteIndex = index;
            }
            
            return {
              ...quote,
              isFavorite: isFav,
              unlocked: true
            };
          })
        );
        
        if (formattedQuotes.length === 0) {
          console.log('名言データが見つかりませんでした。デフォルトの名言を表示します。');
          // デフォルトの名言を作成（実際のアプリでは適切なデフォルト値に変更してください）
          const defaultQuote: Quote = {
            id: 'default',
            textJa: 'これはデフォルトの名言です。',
            textEn: 'This is a default quote.',
            authorJa: '不明',
            authorEn: 'Unknown',
            era: '',
            isFavorite: false,
            unlocked: true
          };
          setQuotes([defaultQuote]);
          setCurrentIndex(0);
        } else {
          setQuotes(formattedQuotes);
          setCurrentIndex(targetQuoteIndex);
        }
        
        // フェードインアニメーション
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
        
        // 初期位置を正確に設定
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToOffset({
              offset: targetQuoteIndex * FULL_ITEM_WIDTH,
              animated: false
            });
          }
        }, 100);
        
      } catch (err) {
        console.error('名言データの取得に失敗しました:', err);
        // エラー処理
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [quoteId, activeUserId]);
  
  // お気に入り状態の切り替え
  const toggleFavorite = async (id: string) => {
    try {
      // 現在の名言を取得
      const currentQuote = quotes[currentIndex];
      if (!currentQuote) return;
      
      // お気に入り状態を反転
      const newFavoriteStatus = !currentQuote.isFavorite;
      
      // データベースを更新
      if (newFavoriteStatus) {
        await addFavoriteQuote(activeUserId, id);
      } else {
        await removeFavoriteQuote(activeUserId, id);
      }
      
      // ローカルの状態を更新
      const newQuotes = [...quotes];
      newQuotes[currentIndex] = {
        ...currentQuote,
        isFavorite: newFavoriteStatus
      };
      setQuotes(newQuotes);
    } catch (err) {
      console.error('お気に入り状態の更新に失敗しました:', err);
    }
  };
  
  // スワイプジェスチャーの処理
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // 移動距離を少し抑制して滑らかな動きにする
      translateX.setValue(e.translationX * 0.8);
    })
    .onEnd((e) => {
      const { translationX, velocityX } = e;
      
      // しきい値（画面幅の15%）
      const threshold = width * 0.15;
      
      // 右にスワイプ
      if (translationX > threshold || velocityX > 800) {
        if (currentIndex > 0) {
          const newIndex = currentIndex - 1;
          flatListRef.current?.scrollToOffset({
            offset: newIndex * FULL_ITEM_WIDTH,
            animated: true
          });
          setCurrentIndex(newIndex);
        }
      } 
      // 左にスワイプ
      else if (translationX < -threshold || velocityX < -800) {
        if (currentIndex < quotes.length - 1) {
          const newIndex = currentIndex + 1;
          flatListRef.current?.scrollToOffset({
            offset: newIndex * FULL_ITEM_WIDTH,
            animated: true
          });
          setCurrentIndex(newIndex);
        }
      }
      
      // リセット（バネアニメーションでより自然な戻り）
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,  // 摩擦を増やして滑らかに
        tension: 60   // 張力を少し減らす
      }).start();
    });
  
  // ローディング中の表示
  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>読み込み中...</ThemedText>
      </ThemedView>
    );
  }
  
  if (quotes.length === 0) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>名言が見つかりませんでした</ThemedText>
      </ThemedView>
    );
  }
  
  const currentQuote = quotes[currentIndex];
  
  // 名言カードのレンダリング
  const renderQuoteCard = ({ item, index }: { item: Quote, index: number }) => {
    // フォントサイズを動的に計算（テキストの長さに応じて）
    const calculateFontSize = (text: string): number => {
      const baseSize = 18; // ベースサイズを少し大きくする
      const length = text.length;
      
      if (length > 100) return 15;
      if (length > 80) return 16;
      if (length > 60) return 17;
      return baseSize;
    };
    
    const jaFontSize = calculateFontSize(item.textJa);
    
    return (
      <View style={{ 
        width: width, 
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{ width: CARD_WIDTH }}>
          <Animated.View style={styles.cardContainer}>
            <ThemedView style={styles.quoteCardContent}>
              {/* 装飾の角飾り - サイズと位置を調整 */}
              <View style={styles.cornerDecorationWrapper}>
                <CornerDecoration 
                  position="topLeft" 
                  color={projectColors.primary} 
                  type="marker" 
                  size={18}
                />
                <CornerDecoration 
                  position="topRight" 
                  color={projectColors.primary} 
                  type="marker" 
                  size={18}
                />
                <CornerDecoration 
                  position="bottomLeft" 
                  color={projectColors.primary} 
                  type="marker" 
                  size={18}
                />
                <CornerDecoration 
                  position="bottomRight" 
                  color={projectColors.primary} 
                  type="marker" 
                  size={18}
                />
              </View>
              
              {/* 名言本文（スクロール可能なコンテナ） */}
              <ScrollView 
                style={styles.quoteScrollContainer}
                contentContainerStyle={styles.quoteScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.quoteTextContainer}>
                  <ThemedText style={[styles.quoteTextJa, { fontSize: jaFontSize }]}>
                    {item.textJa}
                  </ThemedText>
                  
                  {/* 英語の名言があれば表示 */}
                  {item.textEn && (
                    <ThemedText style={styles.quoteTextEn}>
                      {item.textEn}
                    </ThemedText>
                  )}
                </View>
              </ScrollView>
              
              {/* 区切り線 */}
              <View style={styles.separator} />
              
              {/* 著者情報 */}
              <View style={styles.authorContainer}>
                {/* 著者画像 - 名言に対応した画像を表示 */}
                <View style={styles.authorImageContainer}>
                  <Image
                    source={getAuthorImage(item.imagePath || 'seneca.png')}
                    style={styles.authorImage}
                    contentFit="cover"
                  />
                </View>
                
                {/* 著者情報テキスト */}
                <View style={styles.authorInfo}>
                  <ThemedText style={styles.authorName}>
                    {item.authorJa || ''}
                  </ThemedText>
                  {item.era && (
                    <ThemedText style={styles.authorEra}>
                      {item.era}
                    </ThemedText>
                  )}
                </View>
              </View>
            </ThemedView>
          </Animated.View>
          
          {/* お気に入りボタン - カードの外側（下部）に配置 */}
          <Pressable
            style={styles.favoriteButtonOutside}
            onPress={() => toggleFavorite(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.favoriteButtonContainer}>
              <IconSymbol 
                name={item.isFavorite ? "heart.fill" : "heart"} 
                size={28} 
                color={item.isFavorite ? projectColors.red1 : "#888888"} 
              />
            </View>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemedView style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={projectColors.primary} />
        </Pressable>
        <ThemedText type="title">名言カード</ThemedText>
        <View style={{ width: 40 }} />
      </ThemedView>
      
      <ThemedView style={styles.content}>
        <GestureDetector gesture={panGesture}>
          <Animated.View 
            style={[
              styles.swipeContainer,
              { 
                transform: [{ translateX }],
                opacity: fadeAnim
              }
            ]}
          >
            <FlatList
              ref={flatListRef}
              data={quotes}
              renderItem={renderQuoteCard}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled={true}
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={currentIndex}
              windowSize={5}
              maxToRenderPerBatch={quotes.length}
              initialNumToRender={quotes.length > 3 ? 3 : quotes.length}
              getItemLayout={(data, index) => ({
                length: FULL_ITEM_WIDTH,
                offset: index * FULL_ITEM_WIDTH,
                index,
              })}
              decelerationRate="fast"
              onScrollToIndexFailed={(info) => {
                const wait = new Promise(resolve => setTimeout(resolve, 100));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({ 
                    index: info.index, 
                    animated: false 
                  });
                });
              }}
              onMomentumScrollEnd={(e) => {
                const offset = e.nativeEvent.contentOffset.x;
                const newIndex = Math.round(offset / FULL_ITEM_WIDTH);
                if (newIndex !== currentIndex && newIndex >= 0 && newIndex < quotes.length) {
                  // 完全に中央に配置するために補正
                  const expectedOffset = newIndex * FULL_ITEM_WIDTH;
                  if (Math.abs(offset - expectedOffset) > 2) {
                    flatListRef.current?.scrollToOffset({
                      offset: expectedOffset,
                      animated: true
                    });
                  }
                  setCurrentIndex(newIndex);
                }
              }}
            />
          </Animated.View>
        </GestureDetector>
        
        {/* ページインジケーター */}
        <View style={styles.paginationContainer}>
          {quotes.length > 1 && quotes.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.paginationDot,
                { backgroundColor: i === currentIndex ? projectColors.primary : '#E0E0E0' }
              ]} 
            />
          ))}
        </View>
        
        {/* スワイプヒント */}
        <ThemedText style={styles.swipeHint}>
          ← スワイプで別の名言へ →
        </ThemedText>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBF0FF', // 薄い青色の背景
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DBF0FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10, // 上部の余白を少し削減
  },
  swipeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  cardContainer: {
    width: '100%',
    height: '88%',
    maxHeight: 700,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  quoteCardContent: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    padding: 20,
    position: 'relative',
    flexDirection: 'column',
  },
  quoteScrollContainer: {
    flex: 1,
    width: '100%',
    zIndex: 2,
  },
  quoteScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  quoteTextContainer: {
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingRight: 10,
    paddingVertical: 10,
  },
  quoteTextJa: {
    lineHeight: 36,
    fontWeight: '500',
    textAlign: 'left',
    marginBottom: 24,
  },
  quoteTextEn: {
    fontSize: 16,
    lineHeight: 26,
    fontStyle: 'italic',
    textAlign: 'left',
    color: '#666666',
    marginTop: 12,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 10,
    width: '100%',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    minHeight: 60,
  },
  authorImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#FFFFFF',
  },
  authorImage: {
    width: '100%',
    height: '100%',
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '500',
  },
  authorEra: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  favoriteButtonOutside: {
    position: 'absolute',
    bottom: -10, // ボタンをもう少し上に移動
    alignSelf: 'center',
    zIndex: 10,
  },
  favoriteButtonContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paginationContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  swipeHint: {
    fontSize: 12,
    color: '#888888',
    marginTop: 12,
    marginBottom: 24,
  },
  cornerDecorationWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
});