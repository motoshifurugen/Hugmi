import React, { useState, useCallback } from 'react';
import { StyleSheet, Pressable, View, Modal, TextInput } from 'react-native';
import { Link } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/components/common/ui/IconSymbol';
import { projectColors } from '@/constants/Colors';

// 色の上書き（少し濃い緑に）
const customColors = {
  ...projectColors,
  success: '#4CAF50' // 薄めの緑色に変更
};

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
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [newRoutineTitle, setNewRoutineTitle] = useState<string>('');

  // モーダルを開く
  const openModal = () => {
    setNewRoutineTitle(''); // 入力フィールドをリセット
    setIsModalVisible(true);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalVisible(false);
  };

  // 新しいルーティンを追加
  const addNewRoutine = () => {
    if (newRoutineTitle.trim() === '') return;

    const newRoutine: Routine = {
      id: Date.now().toString(), // 一意のID
      title: newRoutineTitle.trim(),
      completed: false,
      order: routines.length + 1
    };

    setRoutines([...routines, newRoutine]);
    setNewRoutineTitle('');
    setIsModalVisible(false);
  };

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
          <Pressable 
            style={styles.addButton} 
            onPress={openModal}
          >
            <IconSymbol name="plus" size={22} color={projectColors.white1} />
          </Pressable>
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

      {/* 新規ルーティン追加モーダル */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>新しいルーティンを追加</ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="ルーティンのタイトル"
              value={newRoutineTitle}
              onChangeText={setNewRoutineTitle}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={closeModal}
              >
                <ThemedText style={styles.cancelButtonText}>キャンセル</ThemedText>
              </Pressable>
              
              <Pressable 
                style={[styles.modalButton, styles.addRoutineButton]} 
                onPress={addNewRoutine}
              >
                <ThemedText style={styles.addButtonText}>追加</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: customColors.success,  // より濃い緑色を使用
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
  },
  // モーダルスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start', // 上寄せに変更
    alignItems: 'center',
    paddingTop: 150, // 上からの余白を追加
  },
  modalContent: {
    width: '90%', // 幅を広げる
    backgroundColor: projectColors.white1,
    borderRadius: 16,
    padding: 20,
    // ニューモーフィズム効果をモーダルにも
    shadowColor: projectColors.black1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  addRoutineButton: {
    backgroundColor: customColors.success,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
}); 