import { getViewedQuotesByUserId } from '@/db/utils/viewed_quotes';
import { Logger } from '@/utils/logger';

/**
 * 50件コンプリート達成チェック
 * @param userId ユーザーID
 * @returns 50件達成済みかどうか
 */
export const checkFiftyQuotesAchievement = async (userId: string): Promise<boolean> => {
  try {
    const viewedQuotes = await getViewedQuotesByUserId(userId);
    const viewedCount = viewedQuotes.length;
    
    Logger.debug(`名言表示進捗確認 - ユーザーID: ${userId}, 表示済み件数: ${viewedCount}`);
    
    return viewedCount >= 50;
  } catch (error) {
    Logger.error('50件達成チェック中にエラー:', error);
    return false;
  }
};

/**
 * 進捗状況を取得
 * @param userId ユーザーID
 * @returns 現在の進捗（表示済み件数と達成率）
 */
export const getQuoteProgress = async (userId: string): Promise<{
  viewedCount: number;
  progressPercentage: number;
  isAchieved: boolean;
}> => {
  try {
    const viewedQuotes = await getViewedQuotesByUserId(userId);
    const viewedCount = viewedQuotes.length;
    const progressPercentage = Math.min((viewedCount / 50) * 100, 100);
    const isAchieved = viewedCount >= 50;
    
    return {
      viewedCount,
      progressPercentage,
      isAchieved
    };
  } catch (error) {
    Logger.error('進捗取得中にエラー:', error);
    return {
      viewedCount: 0,
      progressPercentage: 0,
      isAchieved: false
    };
  }
};

/**
 * 新規達成チェック（前回から新しく50件に到達したか）
 * LocalStorageを使用して前回の達成状態を記録
 */
export const checkNewAchievement = async (userId: string): Promise<boolean> => {
  try {
    const isCurrentlyAchieved = await checkFiftyQuotesAchievement(userId);
    
    // 前回の達成状態をローカルストレージから取得
    const storageKey = `achievement_50_${userId}`;
    const wasAchievedBefore = await getAchievementStatus(storageKey);
    
    // 現在達成済みで、前回は未達成の場合は新規達成
    const isNewAchievement = isCurrentlyAchieved && !wasAchievedBefore;
    
    // 現在の達成状態を保存
    if (isCurrentlyAchieved) {
      await setAchievementStatus(storageKey, true);
    }
    
    Logger.debug(`新規達成チェック - 現在: ${isCurrentlyAchieved}, 前回: ${wasAchievedBefore}, 新規: ${isNewAchievement}`);
    
    return isNewAchievement;
  } catch (error) {
    Logger.error('新規達成チェック中にエラー:', error);
    return false;
  }
};

/**
 * 達成状態をセキュアストレージから取得
 */
const getAchievementStatus = async (key: string): Promise<boolean> => {
  try {
    const SecureStore = require('expo-secure-store');
    const value = await SecureStore.getItemAsync(key);
    return value === 'true';
  } catch (error) {
    Logger.error('達成状態取得中にエラー:', error);
    return false;
  }
};

/**
 * 達成状態をセキュアストレージに保存
 */
const setAchievementStatus = async (key: string, achieved: boolean): Promise<void> => {
  try {
    const SecureStore = require('expo-secure-store');
    await SecureStore.setItemAsync(key, achieved.toString());
  } catch (error) {
    Logger.error('達成状態保存中にエラー:', error);
  }
};
