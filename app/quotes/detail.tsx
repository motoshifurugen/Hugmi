import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Pressable, Animated, Dimensions, View, FlatList, ImageSourcePropType, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { GestureHandlerRootView, Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/components/common/ui/IconSymbol';
import CornerDecoration from '@/components/common/ui/CornerDecoration';
import { HapticPressable } from '@/components/common/HapticPressable';
import { projectColors } from '@/constants/Colors';
import { emitFavoriteChange } from '@/utils/events';

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
  // 追加の著者画像
  'rene_descartes.png': require('@/assets/images/great_person/rene_descartes.png'),
  'john_milton.png': require('@/assets/images/great_person/john_milton.png'),
  'baruch_spinoza.png': require('@/assets/images/great_person/baruch_spinoza.png'),
  'voltaire.png': require('@/assets/images/great_person/voltaire.png'),
  'benjamin_franklin.png': require('@/assets/images/great_person/benjamin_franklin.png'),
  'samuel_johnson.png': require('@/assets/images/great_person/samuel_johnson.png'),
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
  // ファイル名が空の場合はデフォルト画像を返す
  if (!fileName || fileName.trim() === '') {
    return AUTHOR_IMAGES['seneca.png'];
  }
  
  // マッピングから画像を取得
  const image = AUTHOR_IMAGES[fileName];
  
  // 見つからない場合はデフォルト画像を返す
  if (!image) {
    return AUTHOR_IMAGES['seneca.png'];
  }
  
  return image;
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
  const params = useLocalSearchParams();
  const quoteId = typeof params.id === 'string' ? params.id : '';
  
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialScrollComplete, setInitialScrollComplete] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false); // お気に入り操作中のローディング状態
  const [favoriteError, setFavoriteError] = useState<string | null>(null); // お気に入り操作のエラー状態
  
  // アニメーション用の参照
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef(null); // ScrollView用の参照を追加
  
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
        setInitialScrollComplete(false);
        
        console.log(`[DEBUG] 名言詳細を読み込み中: ID=${quoteId}`);
        
        if (!quoteId) {
          console.error('URLパラメータからquoteIdを取得できませんでした');
          setLoading(false);
          return;
        }
        
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
            
            // imagePathを確認し、未設定の場合はデフォルト値を設定
            let imagePath = quote.imagePath;
            if (!imagePath || imagePath.trim() === '') {
              imagePath = 'seneca.png'; // デフォルト画像を設定
            }
            
            return {
              ...quote,
              imagePath: imagePath, // 確実にimagePathが設定されていることを保証
              isFavorite: isFav,
              unlocked: true
            };
          })
        );
        
        if (formattedQuotes.length === 0) {
          console.error('名言データが見つかりませんでした');
          // デフォルトの名言を作成
          const defaultQuote: Quote = {
            id: 'default',
            textJa: 'これはデフォルトの名言です。',
            textEn: 'This is a default quote.',
            authorJa: '不明',
            authorEn: 'Unknown',
            era: '',
            isFavorite: false,
            unlocked: true,
            imagePath: 'seneca.png' // デフォルト画像を明示的に設定
          };
          setQuotes([defaultQuote]);
          setCurrentIndex(0);
        } else {
          console.log(`[DEBUG] 名言が見つかりました: インデックス=${targetQuoteIndex}, ID=${formattedQuotes[targetQuoteIndex]?.id}`);
          // インデックスが有効範囲内かチェック
          const validIndex = targetQuoteIndex >= 0 && targetQuoteIndex < formattedQuotes.length 
            ? targetQuoteIndex 
            : 0;
          // 先にインデックスを設定してから、データを設定
          setCurrentIndex(validIndex);
          // 少し遅延させてデータを設定（順序を保証するため）
          setTimeout(() => {
            setQuotes(formattedQuotes);
          }, 0);
        }
        
        // フェードインアニメーション
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
        
        // ローディング状態を解除
        setTimeout(() => {
          setLoading(false);
        }, 100);
        
      } catch (err) {
        console.error('名言詳細の読み込み中にエラーが発生しました:', err);
        // エラー処理
        setLoading(false);
      }
    };
    
    fetchData();
  }, [quoteId, activeUserId]);
  
  // お気に入り状態の切り替え
  const toggleFavorite = async (id: string) => {
    try {
      // お気に入り処理中のローディング状態をセット
      setFavoriteLoading(true);
      setFavoriteError(null);

      // 現在の名言を取得
      const currentQuote = quotes[currentIndex];
      if (!currentQuote) return;
      
      // お気に入り状態を反転
      const newFavoriteStatus = !currentQuote.isFavorite;
      
      // データベースを更新
      let success = false;
      if (newFavoriteStatus) {
        success = await addFavoriteQuote(activeUserId, id);
      } else {
        success = await removeFavoriteQuote(activeUserId, id);
      }
      
      if (!success) {
        setFavoriteError(`お気に入り${newFavoriteStatus ? '登録' : '解除'}に失敗しました`);
        return;
      }
      
      // UI状態を更新
      setQuotes(prevQuotes => {
        return prevQuotes.map(quote => 
          quote.id === id ? { ...quote, isFavorite: newFavoriteStatus } : quote
        );
      });
      
      // お気に入り変更イベントを発行（名言コレクション画面で購読）
      emitFavoriteChange(id, newFavoriteStatus);
    } catch (err) {
      setFavoriteError('お気に入り状態の更新に失敗しました');
    } finally {
      setFavoriteLoading(false);
    }
  };
  
  // スワイプジェスチャーの処理
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // 横方向の移動のみを処理（Y軸は無視）
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
    })
    // 横方向のみにジェスチャーを制限
    .activeOffsetX([-20, 20]) // 小さな横移動は無視
    .shouldCancelWhenOutside(true) // ジェスチャー領域外に出た場合はキャンセル
    .enabled(true); // 明示的に有効化
  
  // ローディング中の表示
  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>読み込み中...</ThemedText>
      </ThemedView>
    );
  }
  
  // 表示用の名言配列（初回スクロール完了後はすべて表示、それまでは現在のインデックスのみ）
  const visibleQuotes = initialScrollComplete ? quotes : (
    quotes.length > 0 && currentIndex >= 0 && currentIndex < quotes.length 
      ? [quotes[currentIndex]] 
      : quotes.length > 0 ? [quotes[0]] : []
  );

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
    
    // 著者画像のパスを取得
    const authorImagePath = item.imagePath || 'seneca.png';
    
    // 著者画像を取得
    const authorImage = getAuthorImage(authorImagePath);
    
    return (
      <View 
        key={`quote-card-${item.id}`} 
        style={{ 
          width: width, 
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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
                ref={scrollViewRef}
                style={styles.quoteScrollContainer}
                contentContainerStyle={styles.quoteScrollContent}
                showsVerticalScrollIndicator={false}
                // 縦スクロールとスワイプの競合を防ぐための設定
                nestedScrollEnabled={true}
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
                    key={`author-image-${item.id}`}
                    source={authorImage}
                    style={styles.authorImage}
                    contentFit="cover"
                    cachePolicy="none" // キャッシュを無効化
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

              {/* お気に入り操作エラーメッセージ */}
              {favoriteError && currentIndex === index && (
                <View style={styles.errorMessage}>
                  <ThemedText style={styles.errorText}>{favoriteError}</ThemedText>
                </View>
              )}
            </ThemedView>
          </Animated.View>
          
          {/* お気に入りボタン - カードの外側（下部）に配置 */}
          <HapticPressable
            style={styles.favoriteButtonOutside}
            onPress={() => toggleFavorite(item.id)}
            disabled={favoriteLoading} // 処理中はボタンを無効化
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
          >
            <View style={styles.favoriteButtonContainer}>
              {favoriteLoading && currentIndex === index ? (
                // ローディング中はインジケーターを表示
                <ActivityIndicator size="small" color={projectColors.red1} />
              ) : (
                <IconSymbol 
                  name={item.isFavorite ? "heart.fill" : "heart"} 
                  size={28} 
                  color={item.isFavorite ? projectColors.red1 : "#888888"} 
                />
              )}
            </View>
          </HapticPressable>
        </View>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemedView style={styles.header}>
        <HapticPressable 
          style={styles.backButton} 
          onPress={() => router.back()}
          hapticStyle={Haptics.ImpactFeedbackStyle.Light}
        >
          <IconSymbol name="chevron.left" size={24} color={projectColors.accent} />
        </HapticPressable>
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
              data={visibleQuotes}
              renderItem={renderQuoteCard}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled={true}
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={initialScrollComplete ? currentIndex : 0}
              windowSize={5}
              maxToRenderPerBatch={quotes.length}
              initialNumToRender={1}
              getItemLayout={(data, index) => ({
                length: FULL_ITEM_WIDTH,
                offset: index * FULL_ITEM_WIDTH,
                index,
              })}
              decelerationRate="fast"
              onScrollToIndexFailed={(info) => {
                console.error(`[ERROR] スクロール失敗: index=${info.index}, averageItemLength=${info.averageItemLength}, highestMeasuredFrameIndex=${info.highestMeasuredFrameIndex}`);
                // スクロール失敗時の代替処理
                const wait = new Promise(resolve => setTimeout(resolve, 100));
                wait.then(() => {
                  if (flatListRef.current) {
                    // 有効な範囲内のインデックスにスクロール
                    const safeIndex = Math.min(info.index, visibleQuotes.length - 1);
                    if (safeIndex >= 0) {
                      flatListRef.current.scrollToIndex({
                        index: safeIndex,
                        animated: false,
                        viewPosition: 0.5
                      });
                    } else {
                      // データがない場合や無効なインデックスの場合は先頭にスクロール
                      flatListRef.current.scrollToOffset({ offset: 0, animated: false });
                    }
                  }
                });
              }}
              onMomentumScrollEnd={(e) => {
                if (!initialScrollComplete) {
                  // 初期スクロールが完了したらすべての名言を表示
                  setInitialScrollComplete(true);
                  return;
                }
                
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
              // 縦方向のスクロールを防止する追加設定
              scrollEventThrottle={16}
              directionalLockEnabled={true}
              disableIntervalMomentum={true}
              removeClippedSubviews={false} // クリッピングによる問題を回避
              extraData={[currentIndex, initialScrollComplete]} // 現在のインデックスとスクロール完了状態が変わったときに再レンダリングを強制
              // メモリ内のビューを再利用しないように設定
              disableVirtualization={true}
              onScroll={(e) => {
                // スクロールイベントを抑制し、予期しない動作を防止
                e.persist();
              }}
              onLayout={() => {
                // レイアウト完了時に正しいインデックスにスクロール
                if (!initialScrollComplete && visibleQuotes.length > 0) {
                  setTimeout(() => {
                    if (flatListRef.current && currentIndex > 0 && currentIndex < quotes.length) {
                      // visibleQuotesが1つの場合は初期表示のみなので、スクロールしない
                      if (visibleQuotes.length > 1) {
                        flatListRef.current.scrollToIndex({
                          index: currentIndex,
                          animated: false,
                          viewPosition: 0.5
                        });
                      }
                    }
                    // 少し遅延させてからデータ表示を切り替え
                    setTimeout(() => {
                      setInitialScrollComplete(true);
                    }, 200);
                  }, 100);
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
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: projectColors.white1, // 背景色を白に変更
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: projectColors.white1, // 背景色を白に変更
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
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
    height: '85%',
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
    marginBottom: 24
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
  errorMessage: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 5,
    borderRadius: 4,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: projectColors.red1,
    fontSize: 12,
    textAlign: 'center',
  },
});