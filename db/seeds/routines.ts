import { createRoutine, getRoutinesByUserId } from '@/db/utils/routines';
import { getAllUsers } from '@/db/utils/users';

/**
 * デフォルトのルーティンデータをデータベースに挿入する
 * アプリでは常にユーザーは1人のみという前提で、そのユーザーに5つの基本ルーティンを作成
 */
export const seedRoutines = async () => {
  console.log('ルーティンデータの投入を開始します...');
  
  // 現在のユーザーを取得（常に1人のみ）
  const users = await getAllUsers();
  if (users.length === 0) {
    console.error('ユーザーが見つかりません。先にユーザーシードを実行してください。');
    return;
  }
  
  const user = users[0]; // 唯一のユーザーを使用
  console.log(`ユーザー「${user.name}」のルーティンを作成します`);
  
  // 既存のルーティンを確認
  const existingRoutines = await getRoutinesByUserId(user.id);
  if (existingRoutines.length > 0) {
    console.log(`ユーザーには既に${existingRoutines.length}件のルーティンがあります。清掃後に再作成します。`);
    // 既存のルーティンは clearAllData() ですでに削除されているはず
  }
  
  // デフォルトルーティン - 朝のシンプルな流れに合わせた基本的なもの
  const defaultRoutines = [
    { title: '朝の瞑想', order: 1 },
    { title: 'ストレッチ', order: 2 },
    { title: '朝食', order: 3 },
    { title: 'タスク整理', order: 4 },
    { title: '朝のジャーナル', order: 5 }
  ];
  
  let count = 0;
  
  // ルーティンを作成
  for (const routine of defaultRoutines) {
    await createRoutine({
      userId: user.id,
      title: routine.title,
      order: routine.order
    });
    count++;
  }
  
  console.log(`${count}件のルーティンが正常に作成されました！`);
}; 