import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import { getAllUsers, createUser, updateUser, deleteUser } from '@/db/utils/users';

// ユーザー型定義
type User = {
  id: string;
  name: string;
  routineStartTime: string | null;
  nightNotifyTime: string | null;
  createdAt: string;
};

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [routineStartTime, setRoutineStartTime] = useState('');
  const [nightNotifyTime, setNightNotifyTime] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // ユーザー一覧を取得
  const fetchUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
  };

  // 初回読み込み時にユーザー一覧を取得
  useEffect(() => {
    fetchUsers();
  }, []);

  // 入力フォームをリセット
  const resetForm = () => {
    setName('');
    setRoutineStartTime('');
    setNightNotifyTime('');
    setSelectedUserId(null);
    setIsEditing(false);
  };

  // ユーザーを選択（編集用）
  const selectUser = (user: User) => {
    setSelectedUserId(user.id);
    setName(user.name);
    setRoutineStartTime(user.routineStartTime || '');
    setNightNotifyTime(user.nightNotifyTime || '');
    setIsEditing(true);
  };

  // ユーザーを作成/更新
  const saveUser = async () => {
    if (!name.trim()) {
      Alert.alert('エラー', '名前を入力してください');
      return;
    }

    try {
      if (isEditing && selectedUserId) {
        await updateUser(selectedUserId, {
          name,
          routineStartTime,
          nightNotifyTime,
        });
        Alert.alert('成功', 'ユーザーを更新しました');
      } else {
        await createUser({
          name,
          routineStartTime,
          nightNotifyTime,
        });
        Alert.alert('成功', 'ユーザーを作成しました');
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      Alert.alert('エラー', 'ユーザーの保存に失敗しました');
    }
  };

  // ユーザーを削除
  const removeUser = async (id: string) => {
    try {
      await deleteUser(id);
      Alert.alert('成功', 'ユーザーを削除しました');
      fetchUsers();
      if (selectedUserId === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('エラー', 'ユーザーの削除に失敗しました');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>{isEditing ? 'ユーザー編集' : 'ユーザー作成'}</Text>
        
        <Text style={styles.label}>名前</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="名前を入力"
        />
        
        <Text style={styles.label}>ルーティン開始時間</Text>
        <TextInput
          style={styles.input}
          value={routineStartTime}
          onChangeText={setRoutineStartTime}
          placeholder="例: 07:00"
        />
        
        <Text style={styles.label}>ナイトモード通知時間</Text>
        <TextInput
          style={styles.input}
          value={nightNotifyTime}
          onChangeText={setNightNotifyTime}
          placeholder="例: 22:00"
        />
        
        <View style={styles.buttonContainer}>
          <Button title={isEditing ? "更新" : "作成"} onPress={saveUser} />
          {isEditing && (
            <Button title="キャンセル" onPress={resetForm} color="gray" />
          )}
        </View>
      </View>

      <Text style={styles.listTitle}>ユーザー一覧</Text>
      {users.length === 0 ? (
        <Text style={styles.emptyMessage}>ユーザーがいません</Text>
      ) : (
        users.map(user => (
          <View key={user.id} style={styles.userItem}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userDetail}>
                ルーティン開始: {user.routineStartTime || '未設定'}
              </Text>
              <Text style={styles.userDetail}>
                ナイトモード通知: {user.nightNotifyTime || '未設定'}
              </Text>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity
                onPress={() => selectUser(user)}
                style={[styles.actionButton, styles.editButton]}
              >
                <Text style={styles.actionButtonText}>編集</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removeUser(user.id)}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Text style={styles.actionButtonText}>削除</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  userItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userDetail: {
    color: '#666',
    marginBottom: 2,
  },
  userActions: {
    justifyContent: 'center',
  },
  actionButton: {
    padding: 6,
    borderRadius: 4,
    marginBottom: 6,
    width: 60,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4e9af1',
  },
  deleteButton: {
    backgroundColor: '#f15e5e',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
}); 