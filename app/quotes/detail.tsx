import React, { useState, useEffect } from 'react';
import { StyleSheet, Pressable, Share, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/components/common/ui/IconSymbol';

// 仮の名言データ
const SAMPLE_QUOTES = [
  { 
    id: '1', 
    text: '一日の始まりは、あなたの心の在り方で決まる', 
    author: '心の達人',
    source: '『心の響き』より',
    category: '人生',
    isFavorite: true
  },
  { 
    id: '2', 
    text: '小さな一歩の積み重ねが、大きな変化を生む', 
    author: '人生の賢者',
    source: '『成功への道』より',
    category: '成功',
    isFavorite: false
  },
  { 
    id: '3', 
    text: '今この瞬間に意識を向けることが、真の幸せへの道', 
    author: 'マインドフルネスの教師',
    source: '『瞬間の力』より',
    category: 'マインドフルネス',
    isFavorite: true
  },
  { 
    id: '4', 
    text: '困難に立ち向かう勇気こそが、成長への鍵', 
    author: '成功者の声',
    source: '『挑戦の書』より',
    category: '困難',
    isFavorite: false
  },
  { 
    id: '5', 
    text: '感謝の心が、日々の生活に光をもたらす', 
    author: '幸福の哲学者',
    source: '『感謝の実践』より',
    category: '感謝',
    isFavorite: true
  },
];

interface Quote {
  id: string;
  text: string;
  author: string;
  source: string;
  category: string;
  isFavorite: boolean;
}

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    // 名言データの取得（実際はデータベースから取得）
    const foundQuote = SAMPLE_QUOTES.find(q => q.id === id);
    if (foundQuote) {
      setQuote(foundQuote);
      setIsFavorite(foundQuote.isFavorite);
      
      // フェードインアニメーション
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [id]);
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // 実際はデータベースを更新
  };
  
  const handleShare = async () => {
    if (!quote) return;
    
    try {
      await Share.share({
        message: `「${quote.text}」 - ${quote.author}`,
      });
    } catch (error) {
      console.error('Error sharing quote:', error);
    }
  };
  
  if (!quote) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>読み込み中...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#4A90E2" />
        </Pressable>
        <ThemedText type="title">名言詳細</ThemedText>
        <ThemedView style={styles.headerRight}>
          <Pressable style={styles.actionButton} onPress={handleShare}>
            <IconSymbol name="square.and.arrow.up" size={22} color="#4A90E2" />
          </Pressable>
        </ThemedView>
      </ThemedView>
      
      <Animated.View 
        style={[
          styles.quoteCard,
          { opacity: fadeAnim }
        ]}
      >
        <ThemedText style={styles.quoteText}>「{quote.text}」</ThemedText>
        <ThemedText style={styles.quoteAuthor}>- {quote.author}</ThemedText>
        
        {quote.source && (
          <ThemedText style={styles.quoteSource}>{quote.source}</ThemedText>
        )}
        
        <ThemedView style={styles.categoryContainer}>
          <ThemedView style={styles.categoryTag}>
            <ThemedText style={styles.categoryText}>{quote.category}</ThemedText>
          </ThemedView>
        </ThemedView>
      </Animated.View>
      
      <ThemedView style={styles.actionsContainer}>
        <Pressable 
          style={styles.favoriteButton} 
          onPress={toggleFavorite}
        >
          <IconSymbol 
            name={isFavorite ? "heart.fill" : "heart"} 
            size={24} 
            color={isFavorite ? "#E91E63" : "#888888"} 
          />
          <ThemedText style={styles.favoriteButtonText}>
            {isFavorite ? 'お気に入り済み' : 'お気に入りに追加'}
          </ThemedText>
        </Pressable>
      </ThemedView>
      
      <ThemedView style={styles.relatedContainer}>
        <ThemedText type="subtitle" style={styles.relatedTitle}>
          関連する名言
        </ThemedText>
        
        <ThemedView style={styles.relatedQuotes}>
          {SAMPLE_QUOTES.filter(q => q.id !== quote.id && q.category === quote.category).slice(0, 2).map(relatedQuote => (
            <Pressable 
              key={relatedQuote.id}
              style={styles.relatedQuoteCard}
              onPress={() => {
                router.push(`/quotes/detail?id=${relatedQuote.id}`);
              }}
            >
              <ThemedText style={styles.relatedQuoteText}>
                「{relatedQuote.text.length > 50 ? relatedQuote.text.substring(0, 50) + '...' : relatedQuote.text}」
              </ThemedText>
              <ThemedText style={styles.relatedQuoteAuthor}>- {relatedQuote.author}</ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  quoteCard: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    marginBottom: 24,
  },
  quoteText: {
    fontSize: 22,
    fontStyle: 'italic',
    lineHeight: 32,
    marginBottom: 16,
  },
  quoteAuthor: {
    fontSize: 18,
    textAlign: 'right',
    marginBottom: 8,
  },
  quoteSource: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'right',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  categoryTag: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    color: '#4A90E2',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
  },
  favoriteButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  relatedContainer: {
    flex: 1,
  },
  relatedTitle: {
    marginBottom: 16,
  },
  relatedQuotes: {
    flex: 1,
  },
  relatedQuoteCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  relatedQuoteText: {
    fontSize: 16,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  relatedQuoteAuthor: {
    fontSize: 14,
    textAlign: 'right',
  },
}); 