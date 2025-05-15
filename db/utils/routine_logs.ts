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

/**
 * 今日のルーティン進捗を取得する関数
 */
export async function getTodayRoutineProgress(userId: string) {
  try {
    console.log(`[DEBUG] getTodayRoutineProgress - ユーザーID: ${userId}`);
    
    // 日付の取得
    const { getCurrentDate } = await import('@/constants/utils');
    const today = getCurrentDate(); // YYYY-MM-DD形式（午前0時〜午前2:59は前日の日付を返す）
    console.log(`[DEBUG] 対象日付: ${today}`);
    
    // ユーザーのアクティブなルーティン総数を取得
    const routines = await db.getActiveRoutinesByUserId(userId);
    const total = routines.length;
    console.log(`[DEBUG] アクティブなルーティン総数: ${total}`);
    
    if (total > 0) {
      routines.forEach((routine, index) => {
        console.log(`[DEBUG] ルーティン[${index}]: id=${routine.id}, title=${routine.title}`);
      });
    }
    
    // 完了したルーティンの数を直接カウント（より効率的なクエリ）
    const database = db.getDatabase();
    const completedResult = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM routine_logs 
       WHERE user_id = ? AND date = ? AND status = 'checked'`,
      [userId, today]
    );
    
    const completed = completedResult ? completedResult.count : 0;
    console.log(`[DEBUG] 完了済みルーティン数: ${completed}/${total} (SQLカウント使用)`);
    
    // デバッグのために全ログのサマリーを表示
    const logSummary = await database.getAllAsync<{
      status: string;
      count: number;
    }>(
      `SELECT status, COUNT(*) as count 
       FROM routine_logs 
       WHERE user_id = ? AND date = ? 
       GROUP BY status`,
      [userId, today]
    );
    
    if (logSummary.length > 0) {
      logSummary.forEach(summary => {
        console.log(`[DEBUG] ルーティンログサマリー - ステータス: ${summary.status}, 数: ${summary.count}`);
      });
    } else {
      console.log(`[DEBUG] 本日(${today})のログはありません`);
    }
    
    return { completed, total };
  } catch (error) {
    console.error('ルーティン進捗の取得に失敗しました:', error);
    return { completed: 0, total: 0 };
  }
}

// 今日のルーティンが完了しているかチェックする関数
export async function isTodayRoutineCompleted(userId: string) {
  try {
    console.log(`[DEBUG] isTodayRoutineCompleted - ユーザーID: ${userId}`);
    const progress = await getTodayRoutineProgress(userId);
    const isCompleted = progress.total > 0 && progress.completed === progress.total;
    console.log(`[DEBUG] ルーティン完了チェック結果: ${isCompleted}`);
    return isCompleted;
  } catch (error) {
    console.error('ルーティン完了状態のチェックに失敗しました:', error);
    return false;
  }
}

// 今日のルーティンが開始されているかチェックする関数
export async function isTodayRoutineStarted(userId: string) {
  try {
    console.log(`[DEBUG] isTodayRoutineStarted - ユーザーID: ${userId}`);
    
    // 日付の取得
    const { getCurrentDate } = await import('@/constants/utils');
    const today = getCurrentDate(); // YYYY-MM-DD形式（午前0時〜午前2:59は前日の日付を返す）
    console.log(`[DEBUG] 対象日付: ${today}`);
    
    // ログが1件でもあるかを効率的にチェック
    const database = db.getDatabase();
    const result = await database.getFirstAsync<{ exists: number }>(
      `SELECT 1 AS "exists" 
       FROM routine_logs 
       WHERE user_id = ? AND date = ? 
       LIMIT 1`,
      [userId, today]
    );
    
    const isStarted = !!result;
    console.log(`[DEBUG] ルーティン開始チェック結果: ${isStarted}`);
    
    return isStarted;
  } catch (error) {
    console.error('ルーティン開始状態のチェックに失敗しました:', error);
    return false;
  }
} 