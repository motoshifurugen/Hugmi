import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, FlatList, Pressable, ScrollView, Animated, Alert, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import Constants from 'expo-constants';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/components/common/ui/IconSymbol';
import { projectColors } from '@/constants/Colors';
import { fonts } from '@/constants/fonts';
import { subscribeFavoriteChange, emitFavoriteChange, subscribeQuoteViewed } from '@/utils/events'; // イベント購読のインポート

// 名言データベース関連のインポート
import { getAllQuotes } from '@/db/utils/quotes';
import { getViewedQuotesByUserId } from '@/db/utils/viewed_quotes';
import { getFavoriteQuotesByUserId, addFavoriteQuote, removeFavoriteQuote } from '@/db/utils/favorite_quotes';

// グローバル状態管理
import { useActiveUserIdSimple } from '@/hooks/useActiveUser';

// 画像のベースディレクトリ
const IMAGES_DIR = 'great_person';

// ローカル画像ソースを取得するヘルパー関数
const getLocalImageSource = (fileName: string) => {
  if (!fileName) return null;
  
  try {
    // 画像名に基づいて条件分岐
    switch (fileName) {
      case 'confucius.png':
        return require('../../assets/images/great_person/confucius.png');
      case 'socrates.png':
        return require('../../assets/images/great_person/socrates.png');
      case 'plato.png':
        return require('../../assets/images/great_person/plato.png');
      case 'aristotle.png':
        return require('../../assets/images/great_person/aristotle.png');
      case 'mencius.png':
        return require('../../assets/images/great_person/mencius.png');
      case 'seneca.png':
        return require('../../assets/images/great_person/seneca.png');
      case 'marcus_aurelius.png':
        return require('../../assets/images/great_person/marcus_aurelius.png');
      case 'augustine.png':
        return require('../../assets/images/great_person/augustine.png');
      case 'thomas_aquinas.png':
        return require('../../assets/images/great_person/thomas_aquinas.png');
      case 'george_herbert.png':
        return require('../../assets/images/great_person/george_herbert.png');
      case 'rene_descartes.png':
        return require('../../assets/images/great_person/rene_descartes.png');
      case 'john_milton.png':
        return require('../../assets/images/great_person/john_milton.png');
      case 'baruch_spinoza.png':
        return require('../../assets/images/great_person/baruch_spinoza.png');
      case 'voltaire.png':
        return require('../../assets/images/great_person/voltaire.png');
      case 'benjamin_franklin.png':
        return require('../../assets/images/great_person/benjamin_franklin.png');
      case 'samuel_johnson.png':
        return require('../../assets/images/great_person/samuel_johnson.png');
      case 'oliver_goldsmith.png':
        return require('../../assets/images/great_person/oliver_goldsmith.png');
      case 'johann_wolfgang_von_goethe.png':
        return require('../../assets/images/great_person/johann_wolfgang_von_goethe.png');
      case 'jane_austen.png':
        return require('../../assets/images/great_person/jane_austen.png');
      case 'charles_lamb.png':
        return require('../../assets/images/great_person/charles_lamb.png');
      case 'arthur_schopenhauer.png':
        return require('../../assets/images/great_person/arthur_schopenhauer.png');
      case 'ralph_waldo_emerson.png':
        return require('../../assets/images/great_person/ralph_waldo_emerson.png');
      case 'hans_christian_andersen.png':
        return require('../../assets/images/great_person/hans_christian_andersen.png');
      case 'charles_dickens.png':
        return require('../../assets/images/great_person/charles_dickens.png');
      case 'samuel_smiles.png':
        return require('../../assets/images/great_person/samuel_smiles.png');
      case 'frederick_douglass.png':
        return require('../../assets/images/great_person/frederick_douglass.png');
      case 'george_eliot.png':
        return require('../../assets/images/great_person/george_eliot.png');
      case 'john_ruskin.png':
        return require('../../assets/images/great_person/john_ruskin.png');
      case 'mark_twain.png':
        return require('../../assets/images/great_person/mark_twain.png');
      case 'william_james.png':
        return require('../../assets/images/great_person/william_james.png');
      case 'thomas_edison.png':
        return require('../../assets/images/great_person/thomas_edison.png');
      case 'robert_louis_stevenson.png':
        return require('../../assets/images/great_person/robert_louis_stevenson.png');
      case 'soseki_natsume.png':
        return require('../../assets/images/great_person/soseki_natsume.png');
      case 'marcel_proust.png':
        return require('../../assets/images/great_person/marcel_proust.png');
      default:
        return null;
    }
  } catch (error) {
    return null;
  }
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

// 最大コレクション数
const MAX_QUOTES = 50;

// ProgressDisplayコンポーネントをメインコンポーネント外に抽出
const ProgressDisplay = ({ current, total }: { current: number, total: number }) => (
  <ThemedView style={styles.progressContainer}>
    <ThemedText style={styles.progressText}>
      <ThemedText style={styles.progressNumber}>{current}</ThemedText>
      {" / "}
      <ThemedText style={styles.progressTotal}>{total}</ThemedText>
      {"\n"}
      {"コンプリートまであと "}
      <ThemedText style={styles.progressNumber}>{total - current}</ThemedText>
      {" 個"}
    </ThemedText>
  </ThemedView>
);

// EmptyListComponentを分離
const EmptyListComponent = ({ isFavoriteFilter }: { isFavoriteFilter: boolean }) => (
  <ThemedView style={styles.emptyContainer}>
    <ThemedText style={styles.emptyText}>
      {isFavoriteFilter 
        ? 'お気に入りに追加された名言はありません。' 
        : 'アンロックされた名言はありません。'}
    </ThemedText>
  </ThemedView>
);

export default function QuotesScreen() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [displayMode, setDisplayMode] = useState<'card' | 'icon'>('card'); // 'card' または 'icon'
  const fadeAnim = useState(new Animated.Value(1))[0];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  
  // グローバルに保存されているアクティブユーザーIDを取得
  const activeUserId = useActiveUserIdSimple();
  
  // データベースからデータを取得する - コンソールログの整理
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // すべての名言を取得
      const allQuotes = await getAllQuotes();
      
      // 表示済み名言のIDリストを取得
      const viewedQuotesRecords = await getViewedQuotesByUserId(activeUserId);
      const viewedQuoteIds = new Set(viewedQuotesRecords.map(record => record.quoteId));
      
      // お気に入り名言のIDリストを取得
      const favoriteQuotes = await getFavoriteQuotesByUserId(activeUserId);
      const favoriteQuoteIds = new Set(favoriteQuotes.map(fav => fav.quoteId));
      
      // 名言データを画面用の形式に変換
      const formattedQuotes: Quote[] = allQuotes.map(quote => {
        return {
          id: quote.id,
          textJa: quote.textJa,
          textEn: quote.textEn,
          authorJa: quote.authorJa,
          authorEn: quote.authorEn,
          era: quote.era,
          isFavorite: favoriteQuoteIds.has(quote.id), // お気に入り状態を設定
          unlocked: viewedQuoteIds.has(quote.id), // 表示済みのみアンロック
          imagePath: quote.imagePath
        };
      });
      
      setQuotes(formattedQuotes);
      setError(null);
    } catch (err) {
      setError('データの読み込みに失敗しました。後でもう一度お試しください。');
      // バックアップとしてサンプルデータを使用
      setQuotes(SAMPLE_QUOTES);
    } finally {
      setLoading(false);
    }
  }, [activeUserId]);
  
  // コンポーネントのマウント時またはアクティブユーザーIDが変更されたときにデータを取得
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // お気に入り変更イベントを購読
  useEffect(() => {
    // お気に入り変更イベントのコールバック
    const handleFavoriteChange = ({ quoteId, isFavorite }: { quoteId: string, isFavorite: boolean }) => {
      console.log(`[QUOTES] お気に入り変更イベント受信: ID=${quoteId}, 状態=${isFavorite}`);
      
      // 即座に状態を更新（データベースから再取得せずに）
      setQuotes(prevQuotes => {
        return prevQuotes.map(quote => 
          quote.id === quoteId ? { ...quote, isFavorite } : quote
        );
      });
    };
    
    // イベントを購読
    const unsubscribe = subscribeFavoriteChange(handleFavoriteChange);
    
    // クリーンアップ関数でイベント購読を解除
    return () => {
      unsubscribe();
    };
  }, []);
  
  // 名言表示イベントを購読
  useEffect(() => {
    // 名言表示イベントのコールバック
    const handleQuoteViewed = ({ quoteId }: { quoteId: string }) => {
      console.log(`[QUOTES] 名言表示イベント受信: ID=${quoteId}`);
      
      // 即座に状態を更新（データベースから再取得せずに）
      setQuotes(prevQuotes => {
        return prevQuotes.map(quote => 
          quote.id === quoteId ? { ...quote, unlocked: true } : quote
        );
      });
    };
    
    // イベントを購読
    const unsubscribe = subscribeQuoteViewed(handleQuoteViewed);
    
    // クリーンアップ関数でイベント購読を解除
    return () => {
      unsubscribe();
    };
  }, []);
  
  // 表示モードが変更されたときに画像読み込みエラーの状態をリセット
  useEffect(() => {
    setImageLoadErrors({});
  }, [displayMode]);
  
  // お気に入り状態の更新
  const updateFavorite = async (id: string, isFavorite: boolean) => {
    try {
      // データベースを更新
      let success = false;
      if (isFavorite) {
        // お気に入りに追加
        success = await addFavoriteQuote(activeUserId, id);
      } else {
        // お気に入りから削除
        success = await removeFavoriteQuote(activeUserId, id);
      }
      
      if (!success) {
        Alert.alert(
          'エラー',
          `お気に入り${isFavorite ? '登録' : '解除'}に失敗しました。もう一度お試しください。`
        );
        return false;
      }
      
      // ローカルの状態を更新
      setQuotes(quotes.map(quote => 
        quote.id === id ? {...quote, isFavorite} : quote
      ));
      
      // お気に入り変更イベントを発行
      // グローバルに変更を通知（他の画面でも同期するため）
      emitFavoriteChange(id, isFavorite);
      
      return true;
    } catch (err) {
      Alert.alert(
        'エラー',
        'お気に入り状態の更新に失敗しました。'
      );
      return false;
    }
  };
  
  // アンロック済み名言数の計算をuseMemoで最適化
  const unlockedCount = useMemo(() => quotes.filter(quote => quote.unlocked).length, [quotes]);
  
  // お気に入りフィルタリングをuseMemoで最適化
  const displayedQuotes = useMemo(() => 
    filterFavorites 
      ? quotes.filter(quote => quote.isFavorite && quote.unlocked) 
      : quotes
  , [quotes, filterFavorites]);

  // 表示モード切替時のアニメーション - 表示の問題を修正
  const toggleDisplayMode = useCallback((mode: 'card' | 'icon') => {
    // フェードアウト完了まで完全に不透明度を0にする
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      // フェードアウト完了後にモードを変更
      // このタイミングでコンテンツが変わる
      setDisplayMode(mode);
      
      // 少し遅延を入れてからフェードインを開始
      // これによりフェードアウト→モード変更→フェードインの遷移をよりクリアにする
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start();
      }, 50);
    });
  }, [fadeAnim]);

  // 名言カードの表示用アイテム
  const renderCardItem = ({ item }: { item: Quote }) => {
    if (!item.unlocked) return null;
    
    return (
      <Link href={`/quotes/detail?id=${item.id}`} asChild>
        <Pressable>
          <ThemedView style={styles.quoteItem}>
            <ThemedText style={styles.quoteText}>{item.textJa}</ThemedText>
            <ThemedView style={styles.quoteFooter}>
              <ThemedText style={styles.quoteAuthor}>- {item.authorJa}</ThemedText>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
              >
                <IconSymbol 
                  name={item.isFavorite ? "heart.fill" : "heart"} 
                  size={20} 
                  color={item.isFavorite ? projectColors.red1 : projectColors.black2} 
                />
              </Pressable>
            </ThemedView>
          </ThemedView>
        </Pressable>
      </Link>
    );
  };

  // アイコン表示用アイテム - エラー処理を改善
  const renderIconItem = useCallback(({ item }: { item: Quote }) => {
    // 画像ソースを取得
    const imageSource = item.imagePath ? getLocalImageSource(item.imagePath) : null;
    
    // 名言がロックされていたらLinkを使わない
    if (!item.unlocked) {
      return (
        <Pressable
          style={styles.iconItem}
        >
          <ThemedView 
            style={[
              styles.iconContainer,
              styles.lockedIconContainer
            ]}
          >
            <IconSymbol
              name="lock.fill"
              size={22}
              color={projectColors.black2}
            />
          </ThemedView>
        </Pressable>
      );
    }
    
    // アンロック済みの場合はLinkを使用
    return (
      <Link href={`/quotes/detail?id=${item.id}`} asChild>
        <Pressable 
          style={styles.iconItem}
        >
          <ThemedView style={styles.iconContainer}>
            {imageSource && !imageLoadErrors[item.id] ? (
              <Image 
                source={imageSource}
                style={styles.iconImage}
                contentFit="cover"
                transition={300}
                onError={() => {
                  setImageLoadErrors(prev => ({ ...prev, [item.id]: true }));
                }}
              />
            ) : (
              <ThemedView style={styles.fallbackContainer}>
                <ThemedText style={styles.iconText}>{getIconText(item)}</ThemedText>
              </ThemedView>
            )}
            {item.isFavorite && (
              <IconSymbol 
                name="heart.fill" 
                size={12} 
                color={projectColors.red1} 
                style={styles.iconFavorite}
              />
            )}
          </ThemedView>
        </Pressable>
      </Link>
    );
  }, [imageLoadErrors]);

  // アイコン表示のテキストを取得（名前のイニシャルなど）
  const getIconText = (item: Quote) => {
    if (item.authorJa && item.authorJa.length > 0) {
      // 著者名の最初の文字を使用
      return item.authorJa.charAt(0);
    }
    // 代替としてIDの番号部分を使用
    return item.id.replace(/[^\d]/g, '').charAt(0) || '?';
  };

  // toggleFavoriteをuseCallbackで最適化
  const toggleFavorite = useCallback((id: string) => {
    // 該当の名言を探す
    const quote = quotes.find(q => q.id === id);
    if (!quote) return;
    
    // 新しいお気に入り状態
    const newFavoriteStatus = !quote.isFavorite;
    
    // データベース更新
    updateFavorite(id, newFavoriteStatus);
  }, [quotes, updateFavorite]);

  // 名言のアンロック（デモ用）
  const unlockQuote = (id: string) => {
    const quoteToUnlock = quotes.find(q => q.id === id);
    
    if (quoteToUnlock && !quoteToUnlock.unlocked) {
      // ローカル状態の更新
      setQuotes(quotes.map(quote => 
        quote.id === id ? {...quote, unlocked: true} : quote
      ));
      
      // 祝福メッセージを表示
      Alert.alert(
        "新しい名言をアンロックしました！",
        `${quoteToUnlock.textJa}\n- ${quoteToUnlock.authorJa || ''}`,
        [{ text: "OK" }]
      );
    }
  };

  // ローディング中の表示
  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <ThemedText style={styles.loadingText}>名言データを読み込み中...</ThemedText>
      </ThemedView>
    );
  }

  // エラー時の表示
  if (error && quotes.length === 0) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={50} color="#E91E63" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <Pressable
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            // 再度データを取得
            fetchData();
          }}
        >
          <ThemedText style={styles.retryButtonText}>再試行</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">名言コレクション</ThemedText>
        <ProgressDisplay current={unlockedCount} total={MAX_QUOTES} />
      </ThemedView>
      
      <ThemedView style={styles.controlsContainer}>
        {/* 表示モード切替 */}
        <ThemedView style={styles.toggleContainer}>
          <Pressable 
            style={[
              styles.toggleButton, 
              displayMode === 'icon' && styles.toggleButtonActive
            ]}
            onPress={() => toggleDisplayMode('icon')}
          >
            <IconSymbol 
              name="person.fill" 
              size={20} 
              color={displayMode === 'icon' ? "#FFFFFF" : projectColors.softOrange} 
            />
            <ThemedText style={[styles.toggleText, displayMode === 'icon' && styles.toggleTextActive]}>
              アイコン表示
            </ThemedText>
          </Pressable>
          
          <Pressable 
            style={[
              styles.toggleButton, 
              displayMode === 'card' && styles.toggleButtonActive
            ]}
            onPress={() => toggleDisplayMode('card')}
          >
            <IconSymbol 
              name="text.bubble" 
              size={20} 
              color={displayMode === 'card' ? "#FFFFFF" : projectColors.softOrange} 
            />
            <ThemedText style={[styles.toggleText, displayMode === 'card' && styles.toggleTextActive]}>
              カード表示
            </ThemedText>
          </Pressable>
        </ThemedView>
        
        {/* カード表示時のみフィルターを表示 */}
        {displayMode === 'card' && (
          <Pressable 
            style={[styles.filterButton, filterFavorites && styles.filterButtonActive]}
            onPress={() => setFilterFavorites(!filterFavorites)}
          >
            <IconSymbol 
              name={filterFavorites ? "heart.fill" : "heart"} 
              size={20} 
              color={filterFavorites ? "#FFFFFF" : projectColors.red1} 
            />
          </Pressable>
        )}
      </ThemedView>
      
      <Animated.View style={[styles.quoteListContainer, { opacity: fadeAnim }]}>
        {displayMode === 'card' ? (
          <FlatList
            key="card-list"
            data={displayedQuotes.filter(q => q.unlocked)}
            renderItem={renderCardItem}
            keyExtractor={item => item.id}
            style={styles.quoteList}
            ListEmptyComponent={<EmptyListComponent isFavoriteFilter={filterFavorites} />}
          />
        ) : (
          <FlatList
            key="icon-grid"
            data={displayedQuotes}
            renderItem={renderIconItem}
            keyExtractor={item => item.id}
            numColumns={5}
            style={styles.iconList}
            columnWrapperStyle={styles.iconRow}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={3}
            removeClippedSubviews={true}
          />
        )}
      </Animated.View>
    </ThemedView>
  );
}

// バックアップとしてのサンプルデータ
const SAMPLE_QUOTES: Quote[] = [
  { 
    id: 'quote_1', 
    textJa: '一日の始まりは、あなたの心の在り方で決まる', 
    authorJa: '心の達人',
    isFavorite: true,
    unlocked: true
  },
  { 
    id: 'quote_2', 
    textJa: '小さな一歩の積み重ねが、大きな変化を生む', 
    authorJa: '人生の賢者',
    isFavorite: false,
    unlocked: true
  },
  { 
    id: 'quote_3', 
    textJa: '今この瞬間に意識を向けることが、真の幸せへの道', 
    authorJa: 'マインドフルネスの教師',
    isFavorite: true,
    unlocked: true
  },
  { 
    id: 'quote_4', 
    textJa: '困難に立ち向かう勇気こそが、成長への鍵', 
    authorJa: '成功者の声',
    isFavorite: false,
    unlocked: false
  },
  { 
    id: 'quote_5', 
    textJa: '感謝の心が、日々の生活に光をもたらす', 
    authorJa: '幸福の哲学者',
    isFavorite: true,
    unlocked: true
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: fonts.sizes.md,
    color: projectColors.black2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: fonts.sizes.md,
    color: projectColors.black2,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'medium',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: fonts.sizes.md,
    color: projectColors.black2,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 24,
  },
  progressContainer: {
    marginTop: 12,
    width: '100%',
  },
  progressText: {
    fontSize: fonts.sizes.md,
    color: projectColors.black1,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  progressNumber: {
    fontSize: fonts.sizes['2xl'],
    fontWeight: 'bold',
    color: projectColors.accent,
  },
  progressTotal: {
    fontSize: fonts.sizes.md,
    fontWeight: 'bold',
    color: projectColors.black1,
  },
  progressBarContainer: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    backgroundColor: projectColors.secondary,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: projectColors.softOrange,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: projectColors.softOrange,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 60,
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: projectColors.softOrange,
  },
  toggleText: {
    color: projectColors.softOrange,
    marginLeft: 4,
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
  },
  toggleTextActive: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontSize: fonts.sizes.xs,
  },
  filterButton: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: projectColors.red1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: projectColors.red1,
  },
  quoteListContainer: {
    flex: 1,
  },
  quoteList: {
    flex: 1,
  },
  iconList: {
    flex: 1,
  },
  iconRow: {
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  quoteItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: projectColors.white1,
    
    // ニューモーフィズム効果
    shadowColor: projectColors.neuDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
    
    // 光の効果
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopColor: projectColors.neuLight,
    borderLeftColor: projectColors.neuLight,
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  quoteText: {
    fontSize: fonts.sizes.md,
    fontWeight: 'medium',
    marginBottom: 8,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteAuthor: {
    fontSize: fonts.sizes.sm,
    color: projectColors.black2,
  },
  iconItem: {
    width: '19%',
    aspectRatio: 1,
    marginBottom: 12,
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    backgroundColor: projectColors.white1,
    justifyContent: 'center',
    alignItems: 'center',
    
    // ニューモーフィズム効果
    shadowColor: projectColors.neuDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    
    // 光の効果
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopColor: projectColors.neuLight,
    borderLeftColor: projectColors.neuLight,
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  lockedIconContainer: {
    backgroundColor: projectColors.white1,
    borderRadius: 14,
    
    // ロックされたアイテム用の微妙に異なる効果
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  iconText: {
    fontSize: fonts.sizes.lg,
    fontWeight: 'bold',
    color: projectColors.neuDark,
  },
  iconFavorite: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 3,
  },
  iconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    backgroundColor: projectColors.white1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 