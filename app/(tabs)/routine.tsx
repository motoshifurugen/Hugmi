import React, { useState, useCallback } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { Link } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/components/common/ui/IconSymbol';
import { projectColors } from '@/constants/Colors';

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

  // ルーティンアイテムを削除する関数
  const handleDeleteRoutine = (id: string) => {
    const updatedRoutines = routines
      .filter(item => item.id !== id)
      .map((item, index) => ({
        ...item,
        order: index + 1
      }));
    setRoutines(updatedRoutines);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">マイルーティン</ThemedText>
        
        {/* 新規追加アイコン */}
        <View style={styles.headerActions}>
          <Link href="/routine-flow/edit" asChild>
            <Pressable style={styles.addButton}>
              <IconSymbol name="plus" size={22} color={projectColors.white1} />
            </Pressable>
          </Link>
        </View>
      </ThemedView>
      
      <ThemedView style={styles.routineListContainer}>
        {routines.length > 0 ? (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <DraggableFlatList
              data={routines}
              onDragEnd={onDragEnd}
              keyExtractor={(item) => item.id}
              renderItem={({ item, drag, isActive }) => (
                <View
                  style={[
                    styles.routineItem,
                    { backgroundColor: isActive ? projectColors.secondary : projectColors.white1 }
                  ]}
                >
                  <View style={styles.routineRow}>
                    {/* 左側に番号を表示 */}
                    <View style={styles.orderContainer}>
                      <ThemedText style={styles.orderText}>{item.order}</ThemedText>
                    </View>
                    
                    {/* タイトル */}
                    <ThemedText style={styles.routineTitle}>{item.title}</ThemedText>
                    
                    {/* ドラッグハンドル - 触れた瞬間ドラッグ開始 */}
                    <Pressable 
                      onPressIn={drag}  // 触れた瞬間ドラッグ開始
                      onPress={drag}    // タップでもドラッグ開始（念のため）
                      onLongPress={drag} // 長押しでもドラッグ開始（念のため）
                      style={({ pressed }) => [
                        styles.iconButton,
                        pressed && styles.iconButtonPressed
                      ]}
                    >
                      <ThemedText style={styles.dragHandle}>≡</ThemedText>
                    </Pressable>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.listContentContainer}
            />
          </GestureHandlerRootView>
        ) : (
          <ThemedText style={styles.emptyListText}>
            ルーティンが登録されていません
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: projectColors.white1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: projectColors.success,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  routineListContainer: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  routineItem: {
    padding: 14,
    borderRadius: 12,
    marginVertical: 8,
    
    // ニューモーフィズム効果
    backgroundColor: projectColors.white1,
    shadowColor: projectColors.black1,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    
    // 内側の光の効果
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: projectColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    // 番号表示にもニューモーフィズム効果
    shadowColor: projectColors.black1,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  orderText: {
    color: projectColors.black1,
    fontSize: 14,
    fontWeight: 'bold',
  },
  routineTitle: {
    fontSize: 16,
    flex: 1,
  },
  iconButton: {
    padding: 8,
    marginLeft: 5,
    borderRadius: 20,
  },
  iconButtonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  dragHandle: {
    fontSize: 30,
    color: '#888888',
    paddingTop: 12,
  }
}); 