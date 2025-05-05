import { createRoutineLog } from '@/db/utils/routine_logs';
import { getAllUsers } from '@/db/utils/users';
import { getRoutinesByUserId } from '@/db/utils/routines';

/**
 * ルーティンログデータをデータベースに挿入する
 * 単一ユーザー向けに過去14日間のルーティンログを作成
 */
export const seedRoutineLogs = async () => {
  console.log('ルーティンログデータの投入を開始します...');
  
  // ユーザーを取得（常に1人のみ）
  const users = await getAllUsers();
  if (users.length === 0) {
    console.error('ユーザーが見つかりません。先にユーザーシードを実行してください。');
    return;
  }
  
  const user = users[0]; // 唯一のユーザーを使用
  
  // ユーザーのルーティンを取得
  const routines = await getRoutinesByUserId(user.id);
  if (routines.length === 0) {
    console.error('ルーティンが見つかりません。先にルーティンシードを実行してください。');
    return;
  }
  
  console.log(`ユーザー「${user.name}」の${routines.length}個のルーティンに対するログを作成します`);
  
  // 過去14日間の日付を生成
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    // 'YYYY-MM-DD' 形式に変換
    const dateString = date.toISOString().split('T')[0];
    dates.push(dateString);
  }
  
  let count = 0;
  
  // より現実的なルーティン達成パターンを作成
  for (const routine of routines) {
    for (const date of dates) {
      const dayOfWeek = new Date(date).getDay();
      const dayNum = parseInt(date.split('-')[2], 10); // 日付の日の部分
      
      // より現実的なパターンを生成:
      // - 週末（土日）はチェック率が低い
      // - 月初めは意欲が高い
      // - ルーティンの順番が後ろのものほどスキップしやすい
      const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); // 0=日曜, 6=土曜
      const isEarlyMonth = (dayNum <= 10);
      const routineOrderFactor = 1 - (routine.order * 0.1); // ルーティン順が後ろほど小さくなる係数
      
      // 基本確率: 70%
      // 週末は-20%、月初めは+10%、ルーティン順による調整も適用
      let checkProbability = 0.7;
      if (isWeekend) checkProbability -= 0.2;
      if (isEarlyMonth) checkProbability += 0.1;
      checkProbability *= routineOrderFactor;
      
      // 生成された確率に基づいてステータスを決定
      const status = Math.random() < checkProbability ? 'checked' : 'skipped';
      
      await createRoutineLog({
        userId: user.id,
        routineId: routine.id,
        date,
        status
      });
      
      count++;
    }
  }
  
  console.log(`${count}件のルーティンログが正常に作成されました！`);
}; 