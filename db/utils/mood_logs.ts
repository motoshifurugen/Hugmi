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

// 気分の型定義
export type MoodType = 'happy' | 'tired' | 'sad' | 'anxious';

/**
 * 特定の日付のユーザーの気分ログを取得
 */
export const getMoodLogByDate = async (userId: string, date: string) => {
  try {
    const log = await db.getMoodLogByDate(userId, date);
    if (!log) return null;
    
    return {
      id: log.id,
      userId: log.user_id,
      date: log.date,
      mood: log.mood as MoodType,
      quoteId: log.quote_id,
      createdAt: log.created_at
    };
  } catch (error) {
    console.error('Error fetching mood log by date:', error);
    return null;
  }
};

/**
 * 特定の期間のユーザーの気分ログを取得
 */
export const getMoodLogsByDateRange = async (userId: string, startDate: string, endDate: string) => {
  try {
    const logs = await db.getMoodLogsByDateRange(userId, startDate, endDate);
    return logs.map(log => ({
      id: log.id,
      userId: log.user_id,
      date: log.date,
      mood: log.mood as MoodType,
      quoteId: log.quote_id,
      createdAt: log.created_at
    }));
  } catch (error) {
    console.error('Error fetching mood logs by date range:', error);
    return [];
  }
};

/**
 * 新しい気分ログを作成
 */
export const createMoodLog = async (logData: {
  userId: string;
  date: string;
  mood: MoodType;
  quoteId?: string;
}) => {
  try {
    // 既存のログを確認（同じ日付）
    const existingLog = await getMoodLogByDate(logData.userId, logData.date);
    
    // 既存のログがある場合は更新
    if (existingLog) {
      return await updateMoodLog(existingLog.id, { 
        mood: logData.mood,
        quoteId: logData.quoteId
      });
    }
    
    // 新規作成
    const id = generateId();
    const log = await db.createMoodLog({
      id,
      userId: logData.userId,
      date: logData.date,
      mood: logData.mood,
      quoteId: logData.quoteId
    });
    
    if (!log) return null;
    
    return {
      id: log.id,
      userId: log.user_id,
      date: log.date,
      mood: log.mood as MoodType,
      quoteId: log.quote_id,
      createdAt: log.created_at
    };
  } catch (error) {
    console.error('Error creating mood log:', error);
    return null;
  }
};

/**
 * 気分ログを更新
 */
export const updateMoodLog = async (
  id: string,
  logData: {
    mood?: MoodType;
    quoteId?: string;
  }
) => {
  try {
    const log = await db.updateMoodLog(id, logData);
    if (!log) return null;
    
    return {
      id: log.id,
      userId: log.user_id,
      date: log.date,
      mood: log.mood as MoodType,
      quoteId: log.quote_id,
      createdAt: log.created_at
    };
  } catch (error) {
    console.error('Error updating mood log:', error);
    return null;
  }
};

/**
 * 気分ログを削除
 */
export const deleteMoodLog = async (id: string) => {
  try {
    return await db.deleteMoodLog(id);
  } catch (error) {
    console.error('Error deleting mood log:', error);
    return false;
  }
};

/**
 * ユーザーの気分の傾向を分析（指定した期間内）
 */
export const getMoodStats = async (userId: string, startDate: string, endDate: string) => {
  try {
    const stats = await db.getMoodStats(userId, startDate, endDate);
    return {
      total: stats.total,
      happy: stats.happy,
      tired: stats.tired,
      sad: stats.sad,
      anxious: stats.anxious,
      // 最も多い気分を計算
      dominantMood: ['happy', 'tired', 'sad', 'anxious'].reduce((a, b) => 
        stats[a as keyof typeof stats] > stats[b as keyof typeof stats] ? a : b
      )
    };
  } catch (error) {
    console.error('Error calculating mood stats:', error);
    return {
      total: 0,
      happy: 0,
      tired: 0,
      sad: 0,
      anxious: 0,
      dominantMood: null
    };
  }
}; 