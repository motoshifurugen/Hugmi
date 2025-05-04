import { seedQuotes } from './quotes';

/**
 * すべてのシード処理を実行する
 */
export const runAllSeeds = async () => {
  console.log('Running all database seeds...');
  
  // 引用データのシード
  await seedQuotes();
  
  console.log('All seeds completed successfully!');
}; 