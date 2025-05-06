import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Pressable, View, Modal, TextInput, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/components/common/ui/IconSymbol';
import { projectColors } from '@/constants/Colors';
import { getAllUsers } from '@/db/utils/users';
import { 
  getRoutinesByUserId, 
  createRoutine, 
  updateRoutine as updateRoutineDB, 
  deleteRoutine as deleteRoutineDB,
  reorderRoutines 
} from '@/db/utils/routines';

interface Routine {
  id: string;
  userId: string;
  title: string;
  order: number;
  isActive: boolean | number;
  createdAt: string;
  completed?: boolean;
}

export default function RoutineScreen() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [newRoutineTitle, setNewRoutineTitle] = useState<string>('');
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // データベースからルーティンを取得
  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // ユーザーを取得（アプリでは1人のみという前提）
        const users = await getAllUsers();
        if (users.length === 0) {
          setError('ユーザーが見つかりません');
          setLoading(false);
          return;
        }
        
        const currentUserId = users[0].id;
        setUserId(currentUserId);
        
        // ルーティンを取得
        const userRoutines = await getRoutinesByUserId(currentUserId);
        
        // ルーティンを順番でソート
        const sortedRoutines = userRoutines.sort((a, b) => a.order - b.order).map(routine => ({
          ...routine,
          // isActiveがnumberの場合はbooleanに変換
          isActive: routine.isActive === 1 ? true : Boolean(routine.isActive)
        }));
        
        setRoutines(sortedRoutines);
      } catch (error) {
        console.error('ルーティンの取得に失敗しました:', error);
        setError('ルーティンの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoutines();
  }, []);

  // 新規追加モーダルを開く
  const openModal = () => {
    setNewRoutineTitle(''); // 入力フィールドをリセット
    setIsModalVisible(true);
  };

  // 新規追加モーダルを閉じる
  const closeModal = () => {
    setIsModalVisible(false);
  };

  // 編集モーダルを開く
  const openEditModal = (routine: Routine) => {
    setEditingRoutine(routine);
    setIsEditModalVisible(true);
  };

  // 編集モーダルを閉じる
  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditingRoutine(null);
  };

  // 新しいルーティンを追加
  const addNewRoutine = async () => {
    if (newRoutineTitle.trim() === '' || !userId) return;
    
    try {
      setLoading(true);
      
      // 新しいルーティンの順番を設定（既存のルーティンの最大order + 1）
      const newOrder = routines.length > 0 
        ? Math.max(...routines.map(r => r.order)) + 1 
        : 1;
      
      // データベースに新しいルーティンを追加
      const newRoutine = await createRoutine({
        userId: userId,
        order: newOrder,
        title: newRoutineTitle.trim(),
        isActive: true
      });
      
      if (newRoutine) {
        // 成功したら状態を更新
        setRoutines([...routines, newRoutine]);
      }
      
      setNewRoutineTitle('');
      setIsModalVisible(false);
    } catch (error) {
      console.error('ルーティンの追加に失敗しました:', error);
      setError('ルーティンの追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ルーティンを更新
  const updateRoutine = async () => {
    if (!editingRoutine || editingRoutine.title.trim() === '') return;
    
    try {
      setLoading(true);
      
      // データベース上のルーティンを更新
      const updated = await updateRoutineDB(editingRoutine.id, {
        title: editingRoutine.title.trim(),
        // isActiveがnumberの場合はbooleanに変換して送信
        isActive: typeof editingRoutine.isActive === 'number' 
          ? Boolean(editingRoutine.isActive) 
          : editingRoutine.isActive
      });
      
      if (updated) {
        // 成功したら状態を更新
        const updatedRoutines = routines.map(item => 
          item.id === editingRoutine.id ? {
            ...updated,
            // isActiveを適切な型に変換
            isActive: updated.isActive === 1 ? true : Boolean(updated.isActive)
          } : item
        );
        setRoutines(updatedRoutines);
      }
      
      closeEditModal();
    } catch (error) {
      console.error('ルーティンの更新に失敗しました:', error);
      setError('ルーティンの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ルーティンアイテムを削除する関数
  const deleteRoutine = async () => {
    if (!editingRoutine) return;
    
    try {
      setLoading(true);
      
      // データベースからルーティンを削除
      const success = await deleteRoutineDB(editingRoutine.id);
      
      if (success) {
        // 成功したら状態を更新
        const updatedRoutines = routines.filter(item => item.id !== editingRoutine.id);
        setRoutines(updatedRoutines);
      }
      
      closeEditModal();
    } catch (error) {
      console.error('ルーティンの削除に失敗しました:', error);
      setError('ルーティンの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ドラッグ終了時のイベントハンドラ
  const onDragEnd = useCallback(async ({ data }: { data: Routine[] }) => {
    try {
      // 並び替え後のルーティンを一時的に更新（UIの即時反映のため）
      setRoutines(data);
      
      // データベースに並び替え情報を送信
      const reorderData = data.map((item, index) => ({
        id: item.id,
        order: index + 1
      }));
      
      await reorderRoutines(userId, reorderData);
      
      // 並び替え後の最新のルーティンを反映
      const updatedRoutines = data.map((item, index) => ({
        ...item,
        order: index + 1
      }));
      
      setRoutines(updatedRoutines);
    } catch (error) {
      console.error('ルーティンの並び替えに失敗しました:', error);
      setError('ルーティンの並び替えに失敗しました');
      
      // エラー時は元の状態に戻す
      const fetchRoutines = async () => {
        try {
          const userRoutines = await getRoutinesByUserId(userId);
          const sortedRoutines = userRoutines.sort((a, b) => a.order - b.order).map(routine => ({
            ...routine,
            // isActiveがnumberの場合はbooleanに変換
            isActive: routine.isActive === 1 ? true : Boolean(routine.isActive)
          }));
          setRoutines(sortedRoutines);
        } catch (fetchError) {
          console.error('ルーティンの再取得に失敗しました:', fetchError);
        }
      };
      
      fetchRoutines();
    }
  }, [userId]);

  if (loading && routines.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={projectColors.primary} />
          <ThemedText style={styles.loadingText}>読み込み中...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error && routines.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">マイルーティン</ThemedText>
        
        {/* 新規追加アイコン */}
        <View style={styles.headerActions}>
          <Pressable 
            style={styles.addButton} 
            onPress={openModal}
            disabled={loading}
          >
            <IconSymbol name="plus" size={22} color={projectColors.white1} />
          </Pressable>
        </View>
      </ThemedView>
      
      {loading && routines.length > 0 && (
        <View style={styles.overlayLoading}>
          <ActivityIndicator size="large" color={projectColors.primary} />
        </View>
      )}
      
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
                    
                    {/* タイトル - タップで編集モーダルを表示 */}
                    <Pressable 
                      style={styles.titleContainer}
                      onPress={() => openEditModal(item)}
                      disabled={loading}
                    >
                      <ThemedText style={styles.routineTitle}>{item.title}</ThemedText>
                    </Pressable>
                    
                    {/* ドラッグハンドル - 触れた瞬間ドラッグ開始 */}
                    <Pressable 
                      onPressIn={drag}  // 触れた瞬間ドラッグ開始
                      onPress={drag}    // タップでもドラッグ開始（念のため）
                      onLongPress={drag} // 長押しでもドラッグ開始（念のため）
                      style={({ pressed }) => [
                        styles.iconButton,
                        pressed && styles.iconButtonPressed
                      ]}
                      disabled={loading}
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
                disabled={loading}
              >
                <ThemedText style={styles.cancelButtonText}>キャンセル</ThemedText>
              </Pressable>
              
              <Pressable 
                style={[styles.modalButton, styles.addRoutineButton]} 
                onPress={addNewRoutine}
                disabled={loading}
              >
                <ThemedText style={styles.addButtonText}>追加</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ルーティン編集モーダル */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>ルーティンを編集</ThemedText>
            
            {editingRoutine && (
              <TextInput
                style={styles.input}
                placeholder="ルーティンのタイトル"
                value={editingRoutine.title}
                onChangeText={(text) => setEditingRoutine({...editingRoutine, title: text})}
                autoFocus
              />
            )}
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={closeEditModal}
                disabled={loading}
              >
                <ThemedText style={styles.cancelButtonText}>キャンセル</ThemedText>
              </Pressable>
              
              <Pressable 
                style={[styles.modalButton, styles.addRoutineButton]} 
                onPress={updateRoutine}
                disabled={loading}
              >
                <ThemedText style={styles.addButtonText}>更新</ThemedText>
              </Pressable>
            </View>

            {/* 削除ボタン */}
            <Pressable 
              style={styles.deleteButton} 
              onPress={deleteRoutine}
              disabled={loading}
            >
              <ThemedText style={styles.deleteButtonText}>このルーティンを削除</ThemedText>
            </Pressable>
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
    marginTop: 40,
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: projectColors.success,  // より薄い緑色を使用
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
    padding: 10, // 縦幅を縮める
    borderRadius: 12,
    marginVertical: 6, // 縦マージンも縮める
    
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
    width: 28, // サイズを少し小さく
    height: 28, // サイズを少し小さく
    borderRadius: 14,
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
    fontSize: 13, // フォントサイズも少し小さく
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    paddingVertical: 5, // タップしやすい高さを確保
  },
  routineTitle: {
    fontSize: 16,
  },
  iconButton: {
    padding: 6, // 少し小さく
    marginLeft: 5,
    borderRadius: 20,
  },
  iconButtonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  dragHandle: {
    fontSize: 28, // 少し小さく
    color: '#888888',
    paddingTop: 10, // 調整
  },
  // モーダルスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start', // 上寄せに変更
    alignItems: 'center',
    paddingTop: 130, // 上からの余白を追加
  },
  modalContent: {
    width: '90%', // 幅を広げる
    backgroundColor: projectColors.white1, // white1に変更
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
    color: projectColors.black1, // 黒色に戻す
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    color: projectColors.black1,
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
    backgroundColor: projectColors.success,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666666',
    fontWeight: 'bold',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: projectColors.white1,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: projectColors.red1,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: projectColors.black1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: projectColors.red1,
    textAlign: 'center',
  },
  overlayLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
}); 