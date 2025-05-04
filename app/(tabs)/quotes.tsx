import React, { useState } from 'react';
import { StyleSheet, FlatList, Pressable } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// 仮の名言データ
const SAMPLE_QUOTES = [
  { 
    id: '1', 
    text: '一日の始まりは、あなたの心の在り方で決まる', 
    author: '心の達人',
    isFavorite: true
  },
  { 
    id: '2', 
    text: '小さな一歩の積み重ねが、大きな変化を生む', 
    author: '人生の賢者',
    isFavorite: false
  },
  { 
    id: '3', 
    text: '今この瞬間に意識を向けることが、真の幸せへの道', 
    author: 'マインドフルネスの教師',
    isFavorite: true
  },
  { 
    id: '4', 
    text: '困難に立ち向かう勇気こそが、成長への鍵', 
    author: '成功者の声',
    isFavorite: false
  },
  { 
    id: '5', 
    text: '感謝の心が、日々の生活に光をもたらす', 
    author: '幸福の哲学者',
    isFavorite: true
  },
];

export default function QuotesScreen() {
  const [quotes, setQuotes] = useState(SAMPLE_QUOTES);
  const [filterFavorites, setFilterFavorites] = useState(false);
  
  // お気に入りフィルタリング
  const displayedQuotes = filterFavorites 
    ? quotes.filter(quote => quote.isFavorite) 
    : quotes;

  // 名言の表示用アイテム
  const renderQuoteItem = ({ item }) => (
    <Link href={`/quotes/detail?id=${item.id}`} asChild>
      <Pressable>
        <ThemedView style={styles.quoteItem}>
          <ThemedText style={styles.quoteText}>「{item.text}」</ThemedText>
          <ThemedView style={styles.quoteFooter}>
            <ThemedText style={styles.quoteAuthor}>- {item.author}</ThemedText>
            <IconSymbol 
              name={item.isFavorite ? "heart.fill" : "heart"} 
              size={20} 
              color={item.isFavorite ? "#E91E63" : "#888888"} 
            />
          </ThemedView>
        </ThemedView>
      </Pressable>
    </Link>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">名言コレクション</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.filterContainer}>
        <Pressable 
          style={[styles.filterButton, filterFavorites && styles.filterButtonActive]}
          onPress={() => setFilterFavorites(!filterFavorites)}
        >
          <ThemedText style={filterFavorites ? styles.filterTextActive : styles.filterText}>
            お気に入りのみ
          </ThemedText>
        </Pressable>
      </ThemedView>
      
      <ThemedView style={styles.quoteListContainer}>
        <FlatList
          data={displayedQuotes}
          renderItem={renderQuoteItem}
          keyExtractor={item => item.id}
          style={styles.quoteList}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
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
    fontSize: 14,
    color: '#666666',
  },
}); 