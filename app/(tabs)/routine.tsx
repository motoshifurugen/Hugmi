import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Pressable, View, Modal, TextInput, ActivityIndicator, Animated, ViewStyle, TextStyle } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/components/common/ui/IconSymbol';
import { projectColors } from '@/constants/Colors';
import { fonts } from '@/constants/fonts';
import { getAllUsers } from '@/db/utils/users';
import { 
  getRoutinesByUserId, 
  createRoutine, 
  updateRoutine as updateRoutineDB, 
  deleteRoutine as deleteRoutineDB,
  reorderRoutines 
} from '@/db/utils/routines';
import { 
  createNeomorphicStyle,
  createNeomorphicButtonStyle,
  createNeomorphicButtonPressedStyle
} from '@/constants/NeuomorphicStyles';

// ニューモーフィズムスタイルの定義
const cardNeomorphStyle = {
  ...createNeomorphicStyle(0, 4, 4, 1, false),
  width: undefined,
  height: undefined,
  backgroundColor: projectColors.white1,
  borderRadius: 16,
  borderColor: 'rgba(255, 255, 255, 0.5)',
};

// アクションボタン用のニューモーフィズムスタイル
const actionButtonNeomorphStyle = {
  ...createNeomorphicButtonStyle(undefined, 16),
  backgroundColor: projectColors.primary + '40',
  paddingVertical: 16,
  paddingHorizontal: 24,
  width: '100%',
  alignSelf: 'stretch',
  shadowOpacity: 0.08,
  shadowRadius: 3,
  elevation: 2,
  borderColor: projectColors.primary + '30',
};

// ボタン押下時のスタイル
const actionButtonPressedStyle = {
  ...createNeomorphicButtonPressedStyle(projectColors.primary + '50'),
  opacity: 0.98,
};

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
  const listOpacity = useRef(new Animated.Value(1)).current; // リストの透明度アニメーション用
  const [isDragging, setIsDragging] = useState(false); // ドラッグ中かどうかを追跡
  
  // ボタンアニメーション用のAnimated Value
  const addButtonScale = useRef(new Animated.Value(1)).current;
  const cancelButtonScale = useRef(new Animated.Value(1)).current;
  const saveButtonScale = useRef(new Animated.Value(1)).current;
  const deleteButtonScale = useRef(new Animated.Value(1)).current;

  // アニメーション用の参照オブジェクト
  const orderAnimations = useRef<{[key: string]: Animated.Value}>({}).current;
  const isUpdatingList = useRef(false);

  // ボタンアニメーション関数
  const animateButton = (buttonScale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.03,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 70,
        useNativeDriver: true,
      })
    ]).start();
  };

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
    animateButton(addButtonScale);
    setNewRoutineTitle(''); // 入力フィールドをリセット
    setIsModalVisible(true);
  };

  // 新規追加モーダルを閉じる
  const closeModal = () => {
    animateButton(cancelButtonScale);
    setIsModalVisible(false);
  };

  // 編集モーダルを開く
  const openEditModal = (routine: Routine) => {
    setEditingRoutine(routine);
    setIsEditModalVisible(true);
  };

  // 編集モーダルを閉じる
  const closeEditModal = () => {
    animateButton(cancelButtonScale);
    setIsEditModalVisible(false);
    setEditingRoutine(null);
  };

  // 新しいルーティンを追加
  const addNewRoutine = async () => {
    if (newRoutineTitle.trim() === '' || !userId) return;
    
    animateButton(saveButtonScale);
    
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
    
    animateButton(saveButtonScale);
    
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
    
    animateButton(deleteButtonScale);
    
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

  // ドラッグ開始時のイベントハンドラ
  const onDragBegin = useCallback(() => {
    setIsDragging(true);
    isUpdatingList.current = false;
    
    // ドラッグ開始時にすでに少し透明にする
    Animated.timing(listOpacity, {
      toValue: 0.7,
      duration: 80,
      useNativeDriver: true,
    }).start();
  }, [listOpacity]);
  
  // ドラッグ終了時のイベントハンドラ
  const onDragEnd = useCallback(async ({ data, from, to }: { data: Routine[], from: number, to: number }) => {
    // ドロップした瞬間、更新フラグを立てて、即座に透明にする
    isUpdatingList.current = true;
    
    // 即座にフェードアウト
    listOpacity.setValue(0);  // 即時に完全透明化
    
    try {
      // データベースに並び替え情報を送信
      const reorderData = data.map((item, index) => ({
        id: item.id,
        order: index + 1
      }));
      
      // 並び替え後のルーティンを更新
      const updatedRoutines = data.map((item, index) => ({
        ...item,
        order: index + 1
      }));
      
      // UI更新（不可視状態で）
      setRoutines(updatedRoutines);
      
      // データベース更新（非同期）
      reorderRoutines(userId, reorderData)
        .catch(error => console.error('リスト保存中にエラーが発生しました:', error));
      
      // レンダリングが確実に完了するまで待機
      setTimeout(() => {
        // フェードイン
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }).start(() => {
          setIsDragging(false);
          isUpdatingList.current = false;
        });
      }, 80); // 十分な遅延を設定
    } catch (error) {
      console.error('ルーティンの並び替えに失敗しました:', error);
      setError('ルーティンの並び替えに失敗しました');
      
      // エラー時に状態をリセット
      setIsDragging(false);
      isUpdatingList.current = false;
      
      // フェードイン
      Animated.timing(listOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      // 元の状態に戻す
      const fetchRoutines = async () => {
        try {
          const userRoutines = await getRoutinesByUserId(userId);
          const sortedRoutines = userRoutines.sort((a, b) => a.order - b.order).map(routine => ({
            ...routine,
            isActive: routine.isActive === 1 ? true : Boolean(routine.isActive)
          }));
          setRoutines(sortedRoutines);
        } catch (fetchError) {
          console.error('ルーティンの再取得に失敗しました:', fetchError);
        }
      };
      
      fetchRoutines();
    }
  }, [userId, listOpacity]);

  // ルーティンアイテムのレンダリング関数
  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Routine>) => {
    return (
      <Animated.View
        style={[
          styles.routineItem,
          { 
            backgroundColor: isActive ? projectColors.secondary : projectColors.white1,
            transform: [{ scale: isActive ? 1.02 : 1 }],
            shadowOpacity: isActive ? 0.25 : 0.15,
            shadowRadius: isActive ? 8 : 6,
            elevation: isActive ? 10 : 8,
            // ドラッグ中は他のアイテムを少し薄く表示
            opacity: isDragging && !isActive ? 0.8 : 1,
          }
        ]}
      >
        <View style={styles.routineRow}>
          {/* 左側に番号を表示 */}
          <View 
            style={[
              styles.orderContainer,
              {
                backgroundColor: isActive 
                  ? projectColors.primary + '60' 
                  : projectColors.primary + '40',
                transform: [{ scale: isActive ? 1.08 : 1 }]
              }
            ]}
          >
            <ThemedText 
              style={[
                styles.orderText,
                { opacity: isActive ? 0.8 : 1 }
              ]}
            >
              {item.order}
            </ThemedText>
          </View>
          
          {/* タイトル - タップで編集モーダルを表示 */}
          <Pressable 
            style={({ pressed }) => [
              styles.titleContainer,
              pressed && styles.titleContainerPressed
            ]}
            onPress={() => openEditModal(item)}
            disabled={loading || isDragging}
            android_ripple={{ 
              color: 'rgba(0,0,0,0.05)', 
              borderless: false 
            }}
          >
            <ThemedText 
              style={[
                styles.routineTitle,
                isActive && { fontWeight: 'bold' }
              ]}
            >
              {item.title}
            </ThemedText>
          </Pressable>
          
          {/* ドラッグハンドル - 触れた瞬間ドラッグ開始 */}
          <Pressable 
            onPressIn={drag}
            onPress={drag}
            onLongPress={drag}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed
            ]}
            disabled={loading}
          >
            <ThemedText style={[styles.dragHandle, isActive && { color: '#555' }]}>≡</ThemedText>
          </Pressable>
        </View>
      </Animated.View>
    );
  }, [loading, isDragging]);

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
          <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
            <Pressable 
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.addButtonPressed
              ]} 
              onPress={openModal}
              disabled={loading}
              android_ripple={{ 
                color: 'rgba(255,255,255,0.25)', 
                borderless: false,
                foreground: true 
              }}
            >
              <IconSymbol name="plus" size={22} color={projectColors.white1} />
            </Pressable>
          </Animated.View>
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
            <Animated.View 
              style={{ 
                flex: 1, 
                opacity: listOpacity,
              }}
            >
              <DraggableFlatList
                data={routines}
                onDragBegin={onDragBegin}
                onDragEnd={onDragEnd}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContentContainer}
                animationConfig={{ 
                  damping: 30,
                  stiffness: 300,
                  mass: 0.8,
                  overshootClamping: false,
                  restDisplacementThreshold: 0.01,
                  restSpeedThreshold: 0.01,
                }}
                autoscrollSpeed={400}
                dragItemOverflow={true}
                dragHitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              />
            </Animated.View>
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
          <View style={[styles.modalContent, cardNeomorphStyle]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>新しいルーティンを追加</ThemedText>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="ルーティンのタイトル"
                value={newRoutineTitle}
                onChangeText={setNewRoutineTitle}
                autoFocus
              />
            </View>
            
            <View style={styles.modalButtons}>
              <View style={styles.buttonContainer}>
                <Pressable 
                  style={styles.cancelButton} 
                  onPress={closeModal}
                  disabled={loading}
                >
                  <ThemedText style={styles.cancelButtonText}>キャンセル</ThemedText>
                </Pressable>
              </View>
              
              <View style={styles.buttonContainer}>
                <Pressable 
                  style={styles.addRoutineButton} 
                  onPress={addNewRoutine}
                  disabled={loading}
                >
                  <ThemedText style={styles.addButtonText}>追加</ThemedText>
                </Pressable>
              </View>
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
          <View style={[styles.modalContent, cardNeomorphStyle]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>ルーティンを編集</ThemedText>
              
              {/* 削除ボタンを上部に移動 */}
              <Pressable 
                style={styles.deleteIconButton} 
                onPress={deleteRoutine}
                disabled={loading}
              >
                <IconSymbol name="trash" size={22} color={projectColors.white1} />
              </Pressable>
            </View>
            
            {editingRoutine && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="ルーティンのタイトル"
                  value={editingRoutine.title}
                  onChangeText={(text) => setEditingRoutine({...editingRoutine, title: text})}
                  autoFocus
                />
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <View style={styles.buttonContainer}>
                <Pressable 
                  style={styles.cancelButton} 
                  onPress={closeEditModal}
                  disabled={loading}
                >
                  <ThemedText style={styles.cancelButtonText}>キャンセル</ThemedText>
                </Pressable>
              </View>
              
              <View style={styles.buttonContainer}>
                <Pressable 
                  style={styles.addRoutineButton} 
                  onPress={updateRoutine}
                  disabled={loading}
                >
                  <ThemedText style={styles.addButtonText}>更新</ThemedText>
                </Pressable>
              </View>
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
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 20,
  } as ViewStyle,
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  addButton: {
    backgroundColor: projectColors.success,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: projectColors.black1,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  } as ViewStyle,
  addButtonPressed: {
    backgroundColor: projectColors.success + 'E6', // 90% opacity
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
    transform: [{ scale: 0.98 }],
  } as ViewStyle,
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
    fontFamily: fonts.families.primary,
  } as TextStyle,
  routineListContainer: {
    flex: 1,
  } as ViewStyle,
  listContentContainer: {
    paddingBottom: 20,
  } as ViewStyle,
  routineItem: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 6,
    
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
  } as ViewStyle,
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  orderContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: projectColors.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    // 番号表示にもニューモーフィズム効果
    shadowColor: projectColors.black1,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  } as ViewStyle,
  orderText: {
    color: projectColors.black1,
    fontSize: 13,
    fontWeight: fonts.weights.bold,
    fontFamily: fonts.families.primary,
  } as TextStyle,
  titleContainer: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  } as ViewStyle,
  titleContainerPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  } as ViewStyle,
  routineTitle: {
    fontSize: 16,
    fontFamily: fonts.families.primary,
    fontWeight: fonts.weights.medium,
  } as TextStyle,
  iconButton: {
    padding: 6,
    marginLeft: 5,
    borderRadius: 20,
  } as ViewStyle,
  iconButtonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  } as ViewStyle,
  dragHandle: {
    fontSize: 28,
    color: '#888888',
    paddingTop: 10,
    fontFamily: fonts.families.primary,
  } as TextStyle,
  // モーダルスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 16,
  } as ViewStyle,
  modalContent: {
    width: '100%',
    backgroundColor: projectColors.white1,
    borderRadius: 16,
    padding: 28,
    paddingTop: 24,
    paddingBottom: 32,
    maxWidth: 380,
    shadowColor: projectColors.black1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    alignItems: 'center',
  } as ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    position: 'relative',
    paddingHorizontal: 40, // 削除ボタンのスペースを確保
  } as ViewStyle,
  deleteIconButton: {
    backgroundColor: projectColors.red1,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    marginLeft: 15,
    position: 'absolute',
    right: 0,
  } as ViewStyle,
  modalTitle: {
    fontSize: 18,
    fontWeight: fonts.weights.bold,
    textAlign: 'center',
    color: projectColors.black1,
    fontFamily: fonts.families.primary,
    marginBottom: 8,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  } as TextStyle,
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 28,
    backgroundColor: 'white',
    color: projectColors.black1,
    fontFamily: fonts.families.primary,
    width: '100%',
    minHeight: 50,
    maxWidth: '100%',
    alignSelf: 'stretch',
    textAlign: 'left',
    flexShrink: 1,
  } as TextStyle,
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  } as ViewStyle,
  buttonContainer: {
    width: '48%',
  } as ViewStyle,
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  } as ViewStyle,
  addRoutineButton: {
    backgroundColor: projectColors.success,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  } as ViewStyle,
  cancelButtonText: {
    color: '#666666',
    fontWeight: fonts.weights.bold,
    fontFamily: fonts.families.primary,
    fontSize: 16,
    textAlign: 'center',
  } as TextStyle,
  addButtonText: {
    color: projectColors.white1,
    fontWeight: fonts.weights.bold,
    fontFamily: fonts.families.primary,
    fontSize: 16,
    textAlign: 'center',
  } as TextStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: projectColors.black1,
    fontFamily: fonts.families.primary,
  } as TextStyle,
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  errorText: {
    fontSize: 16,
    color: projectColors.red1,
    textAlign: 'center',
    fontFamily: fonts.families.primary,
  } as TextStyle,
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
  } as ViewStyle,
  inputContainer: {
    width: '100%',
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
}); 