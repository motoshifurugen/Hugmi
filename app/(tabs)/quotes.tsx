import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, Pressable, ScrollView, Animated, Alert, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/components/common/ui/IconSymbol';

// 名言データベース関連のインポート
import { getAllQuotes } from '@/db/utils/quotes';
import { getViewedQuotesByUserId } from '@/db/utils/viewed_quotes';

// グローバル状態管理
import { useActiveUserIdSimple } from '@/hooks/useActiveUser';

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

export default function QuotesScreen() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [displayMode, setDisplayMode] = useState<'card' | 'icon'>('card'); // 'card' または 'icon'
  const fadeAnim = useState(new Animated.Value(1))[0];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // グローバルに保存されているアクティブユーザーIDを取得
  const activeUserId = useActiveUserIdSimple();
  
  // データベースからデータを取得する
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // すべての名言を取得
      const allQuotes = await getAllQuotes();
      
      // 表示済み名言のIDリストを取得
      const viewedQuotesRecords = await getViewedQuotesByUserId(activeUserId);
      const viewedQuoteIds = new Set(viewedQuotesRecords.map(record => record.quoteId));
      
      console.log(`[DEBUG] 名言データ取得: ${allQuotes.length}件, 表示済み: ${viewedQuoteIds.size}件, ユーザーID: ${activeUserId}`);
      
      // 名言データを画面用の形式に変換
      const formattedQuotes: Quote[] = allQuotes.map(quote => ({
        id: quote.id,
        textJa: quote.textJa,
        textEn: quote.textEn,
        authorJa: quote.authorJa,
        authorEn: quote.authorEn,
        era: quote.era,
        isFavorite: false, // お気に入り状態は別のテーブルから取得する必要があるが、今回は簡略化
        unlocked: viewedQuoteIds.has(quote.id), // 表示済みのみアンロック
        imagePath: quote.imagePath
      }));
      
      setQuotes(formattedQuotes);
      setError(null);
    } catch (err) {
      console.error('名言データの取得に失敗しました:', err);
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
  
  // お気に入り状態の更新
  const updateFavorite = async (id: string, isFavorite: boolean) => {
    try {
      // 実際のアプリではここでデータベースを更新
      console.log(`[DEBUG] お気に入り更新: id=${id}, isFavorite=${isFavorite}`);
      
      // ローカルの状態だけ更新（デモ用）
      setQuotes(quotes.map(quote => 
        quote.id === id ? {...quote, isFavorite} : quote
      ));
      
      return true;
    } catch (err) {
      console.error('お気に入り状態の更新に失敗しました:', err);
      Alert.alert(
        'エラー',
        'お気に入り状態の更新に失敗しました。'
      );
      return false;
    }
  };
  
  // アンロック済み名言数の計算
  const unlockedCount = quotes.filter(quote => quote.unlocked).length;
  
  // お気に入りフィルタリング
  const displayedQuotes = filterFavorites 
    ? quotes.filter(quote => quote.isFavorite && quote.unlocked) 
    : quotes;

  // 表示モード切替時のアニメーション
  const toggleDisplayMode = (mode: 'card' | 'icon') => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    
    setDisplayMode(mode);
  };

  // 名言カードの表示用アイテム
  const renderCardItem = ({ item }: { item: Quote }) => {
    if (!item.unlocked) return null;
    
    return (
      <Link href={`/quotes/detail?id=${item.id}`} asChild>
        <Pressable>
          <ThemedView style={styles.quoteItem}>
            <ThemedText style={styles.quoteText}>「{item.textJa}」</ThemedText>
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
                  color={item.isFavorite ? "#E91E63" : "#888888"} 
                />
              </Pressable>
            </ThemedView>
          </ThemedView>
        </Pressable>
      </Link>
    );
  };

  // アイコン表示用アイテム
  const renderIconItem = ({ item }: { item: Quote }) => {
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
              size={20}
              color="rgba(150, 150, 150, 0.7)"
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
            <ThemedText style={styles.iconText}>{getIconText(item)}</ThemedText>
            {item.isFavorite && (
              <IconSymbol 
                name="heart.fill" 
                size={12} 
                color="#E91E63" 
                style={styles.iconFavorite}
              />
            )}
          </ThemedView>
        </Pressable>
      </Link>
    );
  };

  // アイコン表示のテキストを取得（名前のイニシャルなど）
  const getIconText = (item: Quote) => {
    if (item.authorJa && item.authorJa.length > 0) {
      // 著者名の最初の文字を使用
      return item.authorJa.charAt(0);
    }
    // 代替としてIDの番号部分を使用
    return item.id.replace(/[^\d]/g, '').charAt(0) || '?';
  };

  // お気に入り切り替え
  const toggleFavorite = (id: string) => {
    // 該当の名言を探す
    const quote = quotes.find(q => q.id === id);
    if (!quote) return;
    
    // 新しいお気に入り状態
    const newFavoriteStatus = !quote.isFavorite;
    
    // データベース更新
    updateFavorite(id, newFavoriteStatus);
  };

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
        `「${quoteToUnlock.textJa}」\n- ${quoteToUnlock.authorJa || ''}`,
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
        <ThemedText style={styles.progressText}>{unlockedCount} / {MAX_QUOTES}</ThemedText>
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
            <IconSymbol name="person.fill" size={16} color={displayMode === 'icon' ? "#FFF" : "#4A90E2"} />
            <ThemedText style={displayMode === 'icon' ? styles.toggleTextActive : styles.toggleText}>
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
            <IconSymbol name="text.bubble" size={16} color={displayMode === 'card' ? "#FFF" : "#4A90E2"} />
            <ThemedText style={displayMode === 'card' ? styles.toggleTextActive : styles.toggleText}>
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
            <ThemedText style={filterFavorites ? styles.filterTextActive : styles.filterText}>
              お気に入りのみ
            </ThemedText>
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
            ListEmptyComponent={
              <ThemedView style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  {filterFavorites ? 'お気に入りに追加された名言はありません。' : 'アンロックされた名言はありません。'}
                </ThemedText>
              </ThemedView>
            }
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
    fontSize: 16,
    color: '#666666',
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
    fontSize: 16,
    color: '#666666',
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
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    marginTop: 8,
    color: '#4A90E2',
    fontWeight: '600',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4A90E2',
    overflow: 'hidden',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 110,
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#4A90E2',
  },
  toggleText: {
    color: '#4A90E2',
    marginLeft: 4,
    fontSize: 12,
  },
  toggleTextActive: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontSize: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
  },
  filterText: {
    color: '#4A90E2',
  },
  filterTextActive: {
    color: '#FFFFFF',
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
    marginBottom: 16,
  },
  quoteItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteAuthor: {
    fontSize: 13,
    color: '#666666',
  },
  iconItem: {
    width: '19%',
    aspectRatio: 1,
    marginBottom: 10,
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  lockedIconContainer: {
    backgroundColor: 'rgba(240, 240, 240, 0.7)',
    borderColor: '#DDDDDD',
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconFavorite: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
}); 