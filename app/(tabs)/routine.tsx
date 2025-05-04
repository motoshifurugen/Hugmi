import React, { useState } from 'react';
import { StyleSheet, FlatList, Pressable } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// 仮のルーティンデータ
const SAMPLE_ROUTINES = [
  { id: '1', title: '水を飲む', completed: false, order: 1 },
  { id: '2', title: '深呼吸', completed: false, order: 2 },
  { id: '3', title: 'ストレッチ', completed: false, order: 3 },
  { id: '4', title: '今日の目標を書く', completed: false, order: 4 },
  { id: '5', title: '朝食を食べる', completed: false, order: 5 },
];

interface Routine {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export default function RoutineScreen() {
  const [routines, setRoutines] = useState<Routine[]>(SAMPLE_ROUTINES);

  // ルーティンの表示用アイテム
  const renderRoutineItem = ({ item }: { item: Routine }) => (
    <ThemedView style={styles.routineItem}>
      <ThemedView style={styles.routineRow}>
        <ThemedText style={styles.routineOrder}>{item.order}</ThemedText>
        <ThemedText style={styles.routineTitle}>{item.title}</ThemedText>
      </ThemedView>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">明日のルーティン</ThemedText>
        <Link href="/routine-flow/edit" asChild>
          <Pressable style={styles.editButton}>
            <IconSymbol name="pencil" size={20} color="#ffffff" />
          </Pressable>
        </Link>
      </ThemedView>
      
      <ThemedView style={styles.routineListContainer}>
        <FlatList
          data={routines}
          renderItem={renderRoutineItem}
          keyExtractor={item => item.id}
          style={styles.routineList}
        />
      </ThemedView>
      
      <ThemedView style={styles.startButtonContainer}>
        <Link href="/routine-flow/start" asChild>
          <Pressable style={styles.startButton}>
            <ThemedText style={styles.startButtonText}>ルーティンを始める</ThemedText>
          </Pressable>
        </Link>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#4A90E2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineListContainer: {
    flex: 1,
  },
  routineList: {
    flex: 1,
  },
  routineItem: {
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
  routineOrder: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4A90E2',
    color: 'white',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 30,
  },
  routineTitle: {
    fontSize: 16,
  },
  startButtonContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 