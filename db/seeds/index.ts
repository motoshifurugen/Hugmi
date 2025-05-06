import { seedQuotes } from './quotes';
import { seedRoutines } from './routines';
import { seedRoutineLogs } from './routine_logs';
import { seedMoodLogs } from './mood_logs';
import { seedFavoriteQuotes } from './favorite_quotes';
import { seedUsers } from './users';
import { db } from '@/db';

/**
 * データベースの既存データを削除する
 * テーブル間の依存関係を考慮して、子テーブルから順に削除
 */
export const clearAllData = async () => {
  console.log('既存データの削除を開始します...');
  
  try {
    const database = db.getDatabase();
    
    // 外部キー制約を一時的に無効化（確実に実行するために2回実行）
    await database.execAsync('PRAGMA foreign_keys = OFF;');
    
    // SQLiteのジャーナルモードを確認・設定
    console.log('SQLiteジャーナルモードを確認します...');
    const journalMode = await database.getFirstAsync('PRAGMA journal_mode;');
    console.log('現在のジャーナルモード:', journalMode);
    
    // ジャーナルモードをDELETE（最も安全なモード）に設定
    await database.execAsync('PRAGMA journal_mode = DELETE;');
    
    // トランザクション開始
    await database.execAsync('BEGIN TRANSACTION;');
    
    try {
      // すべてのテーブルの内容を削除（テーブル自体は残す）
      // 依存関係の順序で削除（子→親）
      console.log('viewed_quotesテーブルを削除中...');
      await database.execAsync('DELETE FROM viewed_quotes;');
      
      console.log('favorite_quotesテーブルを削除中...');
      await database.execAsync('DELETE FROM favorite_quotes;');
      
      console.log('mood_logsテーブルを削除中...');
      await database.execAsync('DELETE FROM mood_logs;');
      
      console.log('routine_logsテーブルを削除中...');
      await database.execAsync('DELETE FROM routine_logs;');
      
      console.log('routinesテーブルを削除中...');
      await database.execAsync('DELETE FROM routines;');
      
      console.log('quotesテーブルを削除中...');
      await database.execAsync('DELETE FROM quotes;');
      
      console.log('usersテーブルを削除中...');
      await database.execAsync('DELETE FROM users;');
      
      // トランザクションをコミット
      await database.execAsync('COMMIT;');
      console.log('トランザクションをコミットしました');
    } catch (error) {
      // エラーが発生した場合はロールバック
      console.error('データ削除中にエラーが発生したためロールバックします:', error);
      await database.execAsync('ROLLBACK;');
      throw error;
    } finally {
      // 外部キー制約を再度有効化
      await database.execAsync('PRAGMA foreign_keys = ON;');
      console.log('外部キー制約を再度有効化しました');
    }
    
    console.log('すべてのデータが正常に削除されました。');
  } catch (error) {
    console.error('データベース削除中にエラーが発生しました:', error);
    throw error;
  }
};

/**
 * すべてのシード処理を実行する
 * development = true の場合、既存データを削除してから実行
 * 
 * アプリではローカルDBを使用し、ユーザーは常に1人のみという前提です。
 * 依存関係を考慮した順序で各シードを実行します。
 */
export const runAllSeeds = async (development: boolean = false) => {
  console.log('シードデータの投入を開始します...');
  
  try {
    // 開発モードの場合、既存データを削除
    if (development) {
      await clearAllData();
    }
    
    // // 1. ユーザーデータのシード（最初に実行する必要がある）
    // const user = await seedUsers();
    // if (!user) {
    //   throw new Error('ユーザーシードに失敗しました');
    // }
    
    // 2. 名言データのシード（ユーザーに依存しない）
    await seedQuotes();
    
    // // 3. ルーティンデータのシード（ユーザーに依存）
    // await seedRoutines();
    
    // // 4. ルーティンログデータのシード（ユーザーとルーティンに依存）
    // await seedRoutineLogs();
    
    // // 5. 気分ログデータのシード（ユーザーと名言に依存）
    // await seedMoodLogs();
    
    // // 6. お気に入り名言データのシード（ユーザーと名言に依存）
    // await seedFavoriteQuotes();
    
    console.log('すべてのシードデータが正常に投入されました！');
  } catch (error) {
    console.error('シードデータ投入中にエラーが発生しました:', error);
    throw error;
  }
}; 