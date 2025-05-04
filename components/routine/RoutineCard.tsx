import React from 'react';
import { StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '../common/ThemedText';
import { ThemedView } from '../common/ThemedView';
import { IconSymbol } from '../common/ui/IconSymbol';

interface RoutineCardProps {
  title: string;
  order: number;
  completed: boolean;
  onPress?: () => void;
}

export function RoutineCard({ title, order, completed, onPress }: RoutineCardProps) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.routineRow}>
          <ThemedView style={styles.orderCircle}>
            <ThemedText style={styles.orderText}>{order}</ThemedText>
          </ThemedView>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {completed && (
            <IconSymbol name="checkmark.circle.fill" size={24} color="#4CAF50" />
          )}
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
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  title: {
    fontSize: 16,
    flex: 1,
  },
}); 