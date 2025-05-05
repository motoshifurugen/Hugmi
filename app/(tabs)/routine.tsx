import React, { useState, useCallback } from 'react';
import { StyleSheet, Pressable, View, Text } from 'react-native';
import { Link } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/components/common/ui/IconSymbol';

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

  // ドラッグ終了時のイベントハンドラ
  const onDragEnd = useCallback(({ data }: { data: Routine[] }) => {
    // 新しい順序で更新されたデータを設定
    const updatedRoutines = data.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    setRoutines(updatedRoutines);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">マイルーティン</ThemedText>
        <Link href="/routine-flow/edit" asChild>
          <Pressable style={styles.editButton}>
            <IconSymbol name="pencil" size={20} color="#ffffff" />
          </Pressable>
        </Link>
      </ThemedView>
      
      <ThemedView style={styles.routineListContainer}>
        {routines.length > 0 ? (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <DraggableFlatList
              data={routines}
              onDragEnd={onDragEnd}
              keyExtractor={(item) => item.id}
              renderItem={({ item, drag, isActive }) => (
                <Pressable
                  onLongPress={drag}
                  style={{
                    height: 50,
                    backgroundColor: isActive ? '#E0E0E0' : '#FFFFFF',
                    marginVertical: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#CCCCCC',
                    borderRadius: 8,
                  }}
                >
                  <Text>{item.title}</Text>
                </Pressable>
              )}
            />
          </GestureHandlerRootView>
        ) : (
          <ThemedText style={styles.emptyListText}>
            ルーティンが登録されていません
          </ThemedText>
        )}
      </ThemedView>
      
      <ThemedView style={styles.startButtonContainer}>
        <Link href="/routine-flow/edit" asChild>
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
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
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
  routineListContent: {
    paddingVertical: 8,
  },
  routineItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    backgroundColor: 'white',
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
    flex: 1,
  },
  dragHandle: {
    marginLeft: 'auto',
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