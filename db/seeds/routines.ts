import { createRoutine } from '@/db/utils/routines';
import { getAllUsers } from '@/db/utils/users';

/**
 * サンプルのルーティンデータをデータベースに挿入する
 * 各ユーザーに対してサンプルのルーティンを作成
 */
export const seedRoutines = async () => {
  console.log('Seeding routines...');
  
  // すべてのユーザーを取得
  const users = await getAllUsers();
  if (users.length === 0) {
    console.log('No users found. Please run user seeds first.');
    return;
  }
  
  // 各ユーザーに対するサンプルルーティン
  const sampleRoutines = [
    { title: '朝の瞑想', order: 1 },
    { title: 'ストレッチ', order: 2 },
    { title: '朝食', order: 3 },
    { title: 'タスク整理', order: 4 },
    { title: '朝のジャーナル', order: 5 }
  ];
  
  let count = 0;
  
  // 各ユーザーにルーティンを追加
  for (const user of users) {
    for (const routine of sampleRoutines) {
      await createRoutine({
        userId: user.id,
        title: routine.title,
        order: routine.order
      });
      count++;
    }
  }
  
  console.log(`${count} routines seeded successfully!`);
}; 