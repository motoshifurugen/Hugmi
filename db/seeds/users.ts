import { createUser, updateUser, getAllUsers } from '@/db/utils/users';
import { db } from '@/db';

/**
 * デフォルトのユーザーデータをデータベースに挿入または更新する
 * アプリでは常にユーザーは1人のみという前提
 */
export const seedUsers = async () => {
  try {
    console.log('users シードデータの投入を開始します');
    
    // 既存のユーザーを確認
    const existingUsers = await getAllUsers();
    
    // デフォルトユーザー情報
    const defaultUserInfo = {
      name: 'あなた',  // よりシンプルなデフォルト名に変更
      routineStartTime: '07:00',
      nightNotifyTime: '22:00'
    };
    
    if (existingUsers.length > 0) {
      // 既存のユーザーがいる場合は最初のユーザーを更新
      const userId = existingUsers[0].id;
      await updateUser(userId, defaultUserInfo);
      console.log(`既存ユーザーを更新しました: ID=${userId}, 名前=${defaultUserInfo.name}`);
      
      // 2人目以降のユーザー（存在する場合）は削除
      if (existingUsers.length > 1) {
        const database = db.getDatabase();
        for (let i = 1; i < existingUsers.length; i++) {
          try {
            // 関連データも削除される（外部キー制約によるCASCADEが設定されていると仮定）
            await database.execAsync(`DELETE FROM users WHERE id = '${existingUsers[i].id}'`);
            console.log(`余分なユーザーを削除: ID=${existingUsers[i].id}`);
          } catch (err) {
            console.error(`ユーザー削除エラー: ID=${existingUsers[i].id}`, err);
          }
        }
      }
    } else {
      // ユーザーが存在しない場合は新規作成
      const newUser = await createUser(defaultUserInfo);
      if (newUser) {
        console.log(`デフォルトユーザーを作成しました: ID=${newUser.id}, 名前=${newUser.name}`);
      } else {
        console.error('デフォルトユーザーの作成に失敗しました');
      }
    }
    
    // 最終確認
    const finalUsers = await getAllUsers();
    console.log(`確認: データベース内のユーザー数=${finalUsers.length}`);
    if (finalUsers.length > 0) {
      console.log(`アクティブユーザー: ID=${finalUsers[0].id}, 名前=${finalUsers[0].name}`);
    }
    
    console.log('users シードデータの投入が完了しました');
    return finalUsers[0]; // ユーザー情報を返す（他のシードで使用するため）
  } catch (error) {
    console.error('ユーザーシードデータの投入中にエラーが発生しました:', error);
    throw error; // エラーを上位に伝播させる
  }
}; 