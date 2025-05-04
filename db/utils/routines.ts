import { db } from '@/db';

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
 * ユーザーIDに紐づくすべてのルーティンを取得
 */
export const getRoutinesByUserId = async (userId: string) => {
  try {
    const routines = await db.getRoutinesByUserId(userId);
    return routines.map(routine => ({
      id: routine.id,
      userId: routine.user_id,
      order: routine.order,
      title: routine.title,
      isActive: routine.is_active,
      createdAt: routine.created_at
    }));
  } catch (error) {
    console.error('Error fetching routines by user id:', error);
    return [];
  }
};

/**
 * 有効なルーティンのみ取得
 */
export const getActiveRoutinesByUserId = async (userId: string) => {
  try {
    const routines = await db.getActiveRoutinesByUserId(userId);
    return routines.map(routine => ({
      id: routine.id,
      userId: routine.user_id,
      order: routine.order,
      title: routine.title,
      isActive: routine.is_active,
      createdAt: routine.created_at
    }));
  } catch (error) {
    console.error('Error fetching active routines:', error);
    return [];
  }
};

/**
 * IDでルーティンを取得
 */
export const getRoutineById = async (id: string) => {
  try {
    const routine = await db.getRoutineById(id);
    if (!routine) return null;
    
    return {
      id: routine.id,
      userId: routine.user_id,
      order: routine.order,
      title: routine.title,
      isActive: routine.is_active,
      createdAt: routine.created_at
    };
  } catch (error) {
    console.error('Error fetching routine by id:', error);
    return null;
  }
};

/**
 * 新しいルーティンを作成
 */
export const createRoutine = async (routineData: {
  userId: string;
  order: number;
  title: string;
  isActive?: boolean;
}) => {
  try {
    // UUIDパッケージを使わず、独自のID生成関数を使用
    const id = generateId();
    const routine = await db.createRoutine({
      id,
      userId: routineData.userId,
      order: routineData.order,
      title: routineData.title,
      isActive: routineData.isActive
    });
    
    if (!routine) return null;
    
    return {
      id: routine.id,
      userId: routine.user_id,
      order: routine.order,
      title: routine.title,
      isActive: routine.is_active,
      createdAt: routine.created_at
    };
  } catch (error) {
    console.error('Error creating routine:', error);
    return null;
  }
};

/**
 * ルーティン情報を更新
 */
export const updateRoutine = async (
  id: string,
  routineData: {
    order?: number;
    title?: string;
    isActive?: boolean;
  }
) => {
  try {
    const routine = await db.updateRoutine(id, routineData);
    if (!routine) return null;
    
    return {
      id: routine.id,
      userId: routine.user_id,
      order: routine.order,
      title: routine.title,
      isActive: routine.is_active,
      createdAt: routine.created_at
    };
  } catch (error) {
    console.error('Error updating routine:', error);
    return null;
  }
};

/**
 * ルーティンを削除
 */
export const deleteRoutine = async (id: string) => {
  try {
    return await db.deleteRoutine(id);
  } catch (error) {
    console.error('Error deleting routine:', error);
    return false;
  }
};

/**
 * ユーザーのルーティンの順序を一括更新
 */
export const reorderRoutines = async (
  userId: string,
  routineOrders: { id: string; order: number }[]
) => {
  try {
    return await db.reorderRoutines(userId, routineOrders);
  } catch (error) {
    console.error('Error reordering routines:', error);
    return false;
  }
}; 