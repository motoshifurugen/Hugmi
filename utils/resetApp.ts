import { db } from '@/db';
import { Logger } from '@/utils/logger';

/**
 * アプリのデータを完全にリセットする
 * テスト用途やデバッグ時に使用
 */
export const resetAppData = async (): Promise<boolean> => {
  try {
    console.log('[RESET] アプリデータの完全リセットを開始...');
    
    const database = db.getDatabase();
    
    // 外部キー制約を一時的に無効化
    await database.execAsync('PRAGMA foreign_keys = OFF;');
    
    // トランザクション開始
    await database.execAsync('BEGIN TRANSACTION;');
    
    try {
      // すべてのテーブルをクリア（依存関係順）
      console.log('[RESET] viewed_quotes テーブルをクリア...');
      await database.execAsync('DELETE FROM viewed_quotes;');
      
      console.log('[RESET] favorite_quotes テーブルをクリア...');
      await database.execAsync('DELETE FROM favorite_quotes;');
      
      console.log('[RESET] mood_logs テーブルをクリア...');
      await database.execAsync('DELETE FROM mood_logs;');
      
      console.log('[RESET] routine_logs テーブルをクリア...');
      await database.execAsync('DELETE FROM routine_logs;');
      
      console.log('[RESET] routines テーブルをクリア...');
      await database.execAsync('DELETE FROM routines;');
      
      console.log('[RESET] users テーブルをクリア...');
      await database.execAsync('DELETE FROM users;');
      
      // quotesテーブルはシードデータなので保持する場合
      // await database.execAsync('DELETE FROM quotes;');
      
      // トランザクションをコミット
      await database.execAsync('COMMIT;');
      
      console.log('[RESET] データベースクリア完了');
      
    } catch (error) {
      // エラー時はロールバック
      await database.execAsync('ROLLBACK;');
      throw error;
    } finally {
      // 外部キー制約を再度有効化
      await database.execAsync('PRAGMA foreign_keys = ON;');
    }
    
    // SecureStoreもクリア
    try {
      const SecureStore = require('expo-secure-store');
      
      // 達成状態をすべてクリア（複数のパターンに対応）
      const keysToDelete = [
        'achievement_50_user1',
        'achievement_50_user2',
        'achievement_50_user3',
        // 他に保存されている可能性のあるキー
      ];
      
      for (const key of keysToDelete) {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (err) {
          // キーが存在しない場合は無視
        }
      }
      
      console.log('[RESET] SecureStore クリア完了');
      
    } catch (secureStoreError) {
      Logger.error('[RESET] SecureStore クリア中にエラー:', secureStoreError);
      // SecureStoreのエラーは致命的ではないので続行
    }
    
    console.log('✅ アプリデータの完全リセットが完了しました');
    console.log('🆕 アプリは初期状態になりました');
    
    return true;
    
  } catch (error) {
    Logger.error('[RESET] アプリデータリセット中にエラー:', error);
    console.error('❌ アプリデータのリセットに失敗しました:', error);
    return false;
  }
};

/**
 * アプリのデータベース状態を確認する
 */
export const checkAppDataStatus = async (): Promise<{
  users: number;
  quotes: number;
  viewedQuotes: number;
  favoriteQuotes: number;
  routines: number;
  moodLogs: number;
}> => {
  try {
    const database = db.getDatabase();
    
    const users = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM users;');
    const quotes = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM quotes;');
    const viewedQuotes = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM viewed_quotes;');
    const favoriteQuotes = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM favorite_quotes;');
    const routines = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM routines;');
    const moodLogs = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM mood_logs;');
    
    const status = {
      users: users?.count || 0,
      quotes: quotes?.count || 0,
      viewedQuotes: viewedQuotes?.count || 0,
      favoriteQuotes: favoriteQuotes?.count || 0,
      routines: routines?.count || 0,
      moodLogs: moodLogs?.count || 0,
    };
    
    console.log('[STATUS] 現在のデータベース状態:', status);
    
    return status;
    
  } catch (error) {
    Logger.error('[STATUS] データベース状態確認中にエラー:', error);
    return {
      users: 0,
      quotes: 0,
      viewedQuotes: 0,
      favoriteQuotes: 0,
      routines: 0,
      moodLogs: 0,
    };
  }
};
