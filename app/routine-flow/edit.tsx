import React, { useState } from 'react';
import { StyleSheet, FlatList, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// 仮のルーティンデータ
const INITIAL_ROUTINES = [
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

export default function RoutineEditScreen() {
  const [routines, setRoutines] = useState<Routine[]>(INITIAL_ROUTINES);
  const [newRoutineTitle, setNewRoutineTitle] = useState('');
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [editingRoutineTitle, setEditingRoutineTitle] = useState('');
  
  const handleSave = () => {
    // ルーティン保存処理（実際はデータベースに保存）
    Alert.alert(
      "保存完了",
      "ルーティンが保存されました。",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };
  
  const handleAddRoutine = () => {
    if (newRoutineTitle.trim() === '') {
      return;
    }
    
    const newRoutine = {
      id: Date.now().toString(),
      title: newRoutineTitle,
      completed: false,
      order: routines.length + 1,
    };
    
    setRoutines([...routines, newRoutine]);
    setNewRoutineTitle('');
  };
  
  const handleStartEditing = (routine: Routine) => {
    setEditingRoutineId(routine.id);
    setEditingRoutineTitle(routine.title);
  };
  
  const handleUpdateRoutine = () => {
    if (editingRoutineTitle.trim() === '') {
      return;
    }
    
    const updatedRoutines = routines.map(routine => 
      routine.id === editingRoutineId 
        ? { ...routine, title: editingRoutineTitle } 
        : routine
    );
    
    setRoutines(updatedRoutines);
    setEditingRoutineId(null);
    setEditingRoutineTitle('');
  };
  
  const handleDeleteRoutine = (id: string) => {
    Alert.alert(
      "ルーティンの削除",
      "このルーティンを削除しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        { 
          text: "削除", 
          style: "destructive",
          onPress: () => {
            const filteredRoutines = routines.filter(routine => routine.id !== id);
            // 並び順を更新
            const reorderedRoutines = filteredRoutines.map((routine, index) => ({
              ...routine,
              order: index + 1
            }));
            setRoutines(reorderedRoutines);
          }
        }
      ]
    );
  };
  
  const handleDragEnd = ({ data }: { data: Routine[] }) => {
    // ドラッグ後に順序を更新
    const reorderedRoutines = data.map((routine: Routine, index: number) => ({
      ...routine,
      order: index + 1
    }));
    setRoutines(reorderedRoutines);
  };
  
  const renderRoutineItem = ({ item, drag, isActive }: RenderItemParams<Routine>) => {
    const isEditing = item.id === editingRoutineId;
    
    return (
      <ThemedView 
        style={[
          styles.routineItem, 
          isActive && styles.routineItemActive
        ]}
      >
        <ThemedView style={styles.routineItemContent}>
          <Pressable onLongPress={drag} style={styles.dragHandle}>
            <IconSymbol name="line.3.horizontal" size={18} color="#999999" />
          </Pressable>
          
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={editingRoutineTitle}
              onChangeText={setEditingRoutineTitle}
              autoFocus
              onBlur={handleUpdateRoutine}
              onSubmitEditing={handleUpdateRoutine}
            />
          ) : (
            <ThemedText style={styles.routineTitle}>{item.title}</ThemedText>
          )}
        </ThemedView>
        
        <ThemedView style={styles.routineActions}>
          {isEditing ? (
            <Pressable style={styles.actionButton} onPress={handleUpdateRoutine}>
              <IconSymbol name="checkmark" size={18} color="#4CAF50" />
            </Pressable>
          ) : (
            <Pressable style={styles.actionButton} onPress={() => handleStartEditing(item)}>
              <IconSymbol name="pencil" size={18} color="#4A90E2" />
            </Pressable>
          )}
          
          <Pressable style={styles.actionButton} onPress={() => handleDeleteRoutine(item.id)}>
            <IconSymbol name="trash" size={18} color="#F44336" />
          </Pressable>
        </ThemedView>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#4A90E2" />
        </Pressable>
        <ThemedText type="title">ルーティン編集</ThemedText>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <ThemedText style={styles.saveButtonText}>保存</ThemedText>
        </Pressable>
      </ThemedView>
      
      <ThemedView style={styles.addContainer}>
        <TextInput
          style={styles.addInput}
          placeholder="新しいルーティンを追加"
          value={newRoutineTitle}
          onChangeText={setNewRoutineTitle}
          onSubmitEditing={handleAddRoutine}
        />
        <Pressable 
          style={[styles.addButton, !newRoutineTitle.trim() && styles.addButtonDisabled]} 
          onPress={handleAddRoutine}
          disabled={!newRoutineTitle.trim()}
        >
          <IconSymbol name="plus" size={20} color="white" />
        </Pressable>
      </ThemedView>
      
      <ThemedView style={styles.listContainer}>
        <ThemedText style={styles.listTitle}>
          ルーティンを並べ替える（長押しでドラッグ）
        </ThemedText>
        
        <DraggableFlatList
          data={routines}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderRoutineItem}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#4A90E2',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#BBBBBB',
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  routineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 10,
  },
  routineItemActive: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    elevation: 3,
  },
  routineItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandle: {
    padding: 10,
    marginRight: 8,
  },
  routineTitle: {
    fontSize: 16,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 4,
  },
  routineActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 10,
  },
}); 