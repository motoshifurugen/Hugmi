import { seedQuotes } from './quotes';
import { seedRoutines } from './routines';
import { seedRoutineLogs } from './routine_logs';
import { seedMoodLogs } from './mood_logs';
import { seedFavoriteQuotes } from './favorite_quotes';
import { seedUsers } from './users';

/**
 * すべてのシード処理を実行する
 */
export const runAllSeeds = async () => {
  console.log('Running all database seeds...');
  
  // ユーザーデータのシード（最初に実行する必要がある）
  await seedUsers();
  
  // 引用データのシード
  await seedQuotes();
  
  // ルーティンデータのシード
  await seedRoutines();
  
  // ルーティンログデータのシード
  await seedRoutineLogs();
  
  // 気分ログデータのシード
  await seedMoodLogs();
  
  // お気に入り引用データのシード
  await seedFavoriteQuotes();
  
  console.log('All seeds completed successfully!');
}; 