import React from 'react';
import { StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '../common/ThemedText';
import { ThemedView } from '../common/ThemedView';
import { IconSymbol } from '../common/ui/IconSymbol';

interface QuoteCardProps {
  text: string;
  author: string;
  isFavorite: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export function QuoteCard({ text, author, isFavorite, onPress, onFavoritePress }: QuoteCardProps) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.quoteText}>「{text}」</ThemedText>
        
        <ThemedView style={styles.footer}>
          <ThemedText style={styles.quoteAuthor}>- {author}</ThemedText>
          
          <Pressable onPress={onFavoritePress} style={styles.favoriteButton}>
            <IconSymbol 
              name={isFavorite ? "heart.fill" : "heart"} 
              size={20} 
              color={isFavorite ? "#E91E63" : "#888888"} 
            />
          </Pressable>
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#666666',
  },
  favoriteButton: {
    padding: 6,
  },
}); 