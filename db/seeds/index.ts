import { seedQuotes } from './quotes';
import { seedRoutines } from './routines';

/**
 * すべてのシード処理を実行する
 */
export const runAllSeeds = async () => {
  console.log('Running all database seeds...');
  
  // 引用データのシード
  await seedQuotes();
  
  // ルーティンデータのシード
  await seedRoutines();
  
  console.log('All seeds completed successfully!');
}; 