import { db } from '../';

/**
 * ランダムなIDを生成する関数（UUIDの代わり）
 */
function generateId(): string {
  // 現在時刻のタイムスタンプ
  const timestamp = Date.now().toString(36);
  
  // ランダムな文字列を生成
  const randomPart = Math.random().toString(36).substring(2, 15);
  
  // 文字列を結合してIDを生成
  return `${timestamp}-${randomPart}`;
}

/**
 * すべてのユーザーを取得
 */
export const getAllUsers = async () => {
  try {
    const users = await db.getAllUsers();
    return users.map(user => ({
      id: user.id,
      name: user.name,
      routineStartTime: user.routine_start_time,
      nightNotifyTime: user.night_notify_time,
      createdAt: user.created_at
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

/**
 * IDでユーザーを取得
 */
export const getUserById = async (id: string) => {
  try {
    const user = await db.getUserById(id);
    if (!user) return null;
    
    return {
      id: user.id,
      name: user.name,
      routineStartTime: user.routine_start_time,
      nightNotifyTime: user.night_notify_time,
      createdAt: user.created_at
    };
  } catch (error) {
    console.error('Error fetching user by id:', error);
    return null;
  }
};

/**
 * 新しいユーザーを作成
 */
export const createUser = async (userData: {
  name: string;
  routineStartTime?: string;
  nightNotifyTime?: string;
}) => {
  try {
    // UUIDパッケージを使わず、独自のID生成関数を使用
    const id = generateId();
    const user = await db.createUser({
      id,
      name: userData.name,
      routineStartTime: userData.routineStartTime,
      nightNotifyTime: userData.nightNotifyTime
    });
    
    if (!user) return null;
    
    return {
      id: user.id,
      name: user.name,
      routineStartTime: user.routine_start_time,
      nightNotifyTime: user.night_notify_time,
      createdAt: user.created_at
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

/**
 * ユーザー情報を更新
 */
export const updateUser = async (
  id: string,
  userData: {
    name?: string;
    routineStartTime?: string;
    nightNotifyTime?: string;
  }
) => {
  try {
    const user = await db.updateUser(id, userData);
    if (!user) return null;
    
    return {
      id: user.id,
      name: user.name,
      routineStartTime: user.routine_start_time,
      nightNotifyTime: user.night_notify_time,
      createdAt: user.created_at
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

/**
 * ユーザーを削除
 */
export const deleteUser = async (id: string) => {
  try {
    return await db.deleteUser(id);
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}; 