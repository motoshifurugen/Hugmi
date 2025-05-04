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

// ルーティンのステータス型定義
export type RoutineStatus = 'checked' | 'skipped';

/**
 * 特定の日付のユーザーのルーティンログを取得
 */
export const getRoutineLogsByDate = async (userId: string, date: string) => {
  try {
    const logs = await db.getRoutineLogsByDate(userId, date);
    return logs.map(log => ({
      id: log.id,
      userId: log.user_id,
      date: log.date,
      routineId: log.routine_id,
      status: log.status as RoutineStatus,
      createdAt: log.created_at
    }));
  } catch (error) {
    console.error('Error fetching routine logs by date:', error);
    return [];
  }
};

/**
 * 特定のルーティンの特定日付のログを取得
 */
export const getRoutineLogByRoutineAndDate = async (routineId: string, date: string) => {
  try {
    const log = await db.getRoutineLogByRoutineAndDate(routineId, date);
    if (!log) return null;
    
    return {
      id: log.id,
      userId: log.user_id,
      date: log.date,
      routineId: log.routine_id,
      status: log.status as RoutineStatus,
      createdAt: log.created_at
    };
  } catch (error) {
    console.error('Error fetching routine log:', error);
    return null;
  }
};

/**
 * 特定の期間のユーザーのルーティンログを取得
 */
export const getRoutineLogsByDateRange = async (userId: string, startDate: string, endDate: string) => {
  try {
    const logs = await db.getRoutineLogsByDateRange(userId, startDate, endDate);
    return logs.map(log => ({
      id: log.id,
      userId: log.user_id,
      date: log.date,
      routineId: log.routine_id,
      status: log.status as RoutineStatus,
      createdAt: log.created_at
    }));
  } catch (error) {
    console.error('Error fetching routine logs by date range:', error);
    return [];
  }
};

/**
 * ルーティンログを作成
 */
export const createRoutineLog = async (logData: {
  userId: string;
  date: string;
  routineId: string;
  status: RoutineStatus;
}) => {
  try {
    // 既存のログを確認（同じ日付、同じルーティン）
    const existingLog = await getRoutineLogByRoutineAndDate(logData.routineId, logData.date);
    
    // 既存のログがある場合は更新
    if (existingLog) {
      return await updateRoutineLog(existingLog.id, { status: logData.status });
    }
    
    // 新規作成
    const id = generateId();
    const log = await db.createRoutineLog({
      id,
      userId: logData.userId,
      date: logData.date,
      routineId: logData.routineId,
      status: logData.status
    });
    
    if (!log) return null;
    
    return {
      id: log.id,
      userId: log.user_id,
      date: log.date,
      routineId: log.routine_id,
      status: log.status as RoutineStatus,
      createdAt: log.created_at
    };
  } catch (error) {
    console.error('Error creating routine log:', error);
    return null;
  }
};

/**
 * ルーティンログを更新
 */
export const updateRoutineLog = async (
  id: string,
  logData: {
    status: RoutineStatus;
  }
) => {
  try {
    const log = await db.updateRoutineLog(id, logData);
    if (!log) return null;
    
    return {
      id: log.id,
      userId: log.user_id,
      date: log.date,
      routineId: log.routine_id,
      status: log.status as RoutineStatus,
      createdAt: log.created_at
    };
  } catch (error) {
    console.error('Error updating routine log:', error);
    return null;
  }
};

/**
 * ルーティンログを削除
 */
export const deleteRoutineLog = async (id: string) => {
  try {
    return await db.deleteRoutineLog(id);
  } catch (error) {
    console.error('Error deleting routine log:', error);
    return false;
  }
};

/**
 * 特定ルーティンの完了率を計算（指定した期間内）
 */
export const getRoutineCompletionRate = async (
  routineId: string, 
  startDate: string, 
  endDate: string
) => {
  try {
    const stats = await db.getRoutineStats(routineId, startDate, endDate);
    return {
      total: stats.total,
      checked: stats.checked,
      skipped: stats.skipped,
      completionRate: stats.total > 0 ? (stats.checked / stats.total) * 100 : 0
    };
  } catch (error) {
    console.error('Error calculating routine completion rate:', error);
    return {
      total: 0,
      checked: 0,
      skipped: 0,
      completionRate: 0
    };
  }
}; 