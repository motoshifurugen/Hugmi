import { createUser } from '@/db/utils/users';
import { db } from '@/db';

/**
 * サンプルのユーザーデータをデータベースに挿入する
 */
export const seedUsers = async () => {
  try {
    console.log('users シードデータの投入を開始します');
    
    // 既存のユーザー数を確認（既に存在する場合はスキップ）
    const existingUsers = await db.getAllUsers();
    if (existingUsers.length > 0) {
      console.log(`既に${existingUsers.length}人のユーザーが存在します。ユーザーシードをスキップします。`);
      return;
    }
    
    // サンプルユーザーを作成
    const sampleUser = await createUser({
      name: 'とってもながいユーザーネームさん',
      routineStartTime: '07:00',
      nightNotifyTime: '22:00'
    });
    
    if (sampleUser) {
      console.log('サンプルユーザーを作成しました:', sampleUser.name);
    } else {
      console.error('サンプルユーザーの作成に失敗しました');
    }
    
    console.log('users シードデータの投入が完了しました');
  } catch (error) {
    console.error('ユーザーシードデータの投入中にエラーが発生しました:', error);
  }
}; 