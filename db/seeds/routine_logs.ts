import { createRoutineLog } from '@/db/utils/routine_logs';
import { getAllUsers } from '@/db/utils/users';
import { getRoutinesByUserId } from '@/db/utils/routines';

/**
 * サンプルのルーティンログデータをデータベースに挿入する
 * 各ユーザーの過去7日間のルーティンログを作成
 */
export const seedRoutineLogs = async () => {
  console.log('Seeding routine logs...');
  
  // すべてのユーザーを取得
  const users = await getAllUsers();
  if (users.length === 0) {
    console.log('No users found. Please run user seeds first.');
    return;
  }
  
  // 過去7日間の日付を生成
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    // 'YYYY-MM-DD' 形式に変換
    const dateString = date.toISOString().split('T')[0];
    dates.push(dateString);
  }
  
  let count = 0;
  
  // 各ユーザーの各ルーティンに対して過去7日間のログを作成
  for (const user of users) {
    // ユーザーのルーティンを取得
    const routines = await getRoutinesByUserId(user.id);
    
    for (const routine of routines) {
      for (const date of dates) {
        // ランダムにステータスを決定 (75%の確率でチェック済み、25%の確率でスキップ)
        const status = Math.random() < 0.75 ? 'checked' : 'skipped';
        
        await createRoutineLog({
          userId: user.id,
          routineId: routine.id,
          date,
          status
        });
        
        count++;
      }
    }
  }
  
  console.log(`${count} routine logs seeded successfully!`);
}; 