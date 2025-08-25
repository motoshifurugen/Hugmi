import { getAllUsers } from '@/db/utils/users';
import { getPublishedQuotes } from '@/db/utils/quotes';
import { recordViewedQuote } from '@/db/utils/viewed_quotes';
import { generateUuid } from '@/db/utils/uuid';
import { db } from '@/db';

/**
 * テスト用：50件の名言表示記録を作成して祝福画面をテストする
 */
export const seedTestAchievement = async () => {
  console.log('テスト用50件達成データの投入を開始します...');
  
  try {
    // ユーザーを取得（常に1人のみ）
    const users = await getAllUsers();
    if (users.length === 0) {
      console.error('ユーザーが見つかりません。先にユーザーシードを実行してください。');
      return;
    }
    
    const user = users[0]; // 唯一のユーザーを使用
    console.log(`[DEBUG] ユーザーID: ${user.id} で50件達成テストを実行`);
    
    // 公開されている名言を取得
    const quotes = await getPublishedQuotes();
    if (quotes.length === 0) {
      console.error('名言が見つかりません。先に名言シードを実行してください。');
      return;
    }
    console.log(`[DEBUG] 利用可能な名言: ${quotes.length}件`);
    
    // 既存の表示記録をクリア
    console.log('[DEBUG] 既存の表示記録をクリア中...');
    await db.getDatabase().runAsync('DELETE FROM viewed_quotes WHERE user_id = ?', [user.id]);
    
    // 50件の表示記録を作成（名言が50件未満の場合は重複を許可）
    const targetCount = 50;
    let recordedCount = 0;
    
    console.log(`[DEBUG] ${targetCount}件の表示記録を作成開始...`);
    
    for (let i = 0; i < targetCount; i++) {
      try {
        // 循環的に名言を選択（名言が50件未満でも対応）
        const quote = quotes[i % quotes.length];
        
        // ユニークなIDを生成
        const recordId = generateUuid();
        
        // 直接データベースに挿入（重複を許可するため recordViewedQuote は使わない）
        const database = db.getDatabase();
        
        // 過去の日付で記録を作成（最新の1件を除く）
        const daysAgo = targetCount - i - 1;
        const recordDate = new Date();
        recordDate.setDate(recordDate.getDate() - daysAgo);
        recordDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
        
        await database.runAsync(
          "INSERT INTO viewed_quotes (id, user_id, quote_id, viewed_at) VALUES (?, ?, ?, ?)",
          [recordId, user.id, quote.id, recordDate.toISOString()]
        );
        
        recordedCount++;
        
        if (recordedCount % 10 === 0) {
          console.log(`[DEBUG] ${recordedCount}件記録完了...`);
        }
      } catch (error) {
        console.error(`[DEBUG] 記録 ${i+1} 作成エラー:`, error);
      }
    }
    
    // 記録数を確認
    const database = db.getDatabase();
    const countResult = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM viewed_quotes WHERE user_id = ?`,
      [user.id]
    );
    
    const finalCount = countResult?.count || 0;
    console.log(`[DEBUG] 最終記録数: ${finalCount}件`);
    
    if (finalCount >= 50) {
      console.log('✅ 50件達成テストデータが正常に作成されました！');
      console.log('🎉 次回名言を表示すると祝福画面が表示される予定です');
    } else {
      console.log(`⚠️ 記録数が不足しています: ${finalCount}/50件`);
    }
    
  } catch (error) {
    console.error('テスト用達成データ投入中にエラーが発生しました:', error);
    throw error;
  }
};

/**
 * 49件の表示記録を作成（次の1件で50件達成となるテスト用）
 */
export const seed49Achievement = async () => {
  console.log('テスト用49件データの投入を開始します...');
  
  try {
    // ユーザーを取得
    const users = await getAllUsers();
    if (users.length === 0) {
      console.error('ユーザーが見つかりません。');
      return;
    }
    
    const user = users[0];
    console.log(`[DEBUG] ユーザーID: ${user.id} で49件テストを実行`);
    
    // 公開されている名言を取得
    const quotes = await getPublishedQuotes();
    if (quotes.length === 0) {
      console.error('名言が見つかりません。');
      return;
    }
    
    // 既存の表示記録をクリア
    console.log('[DEBUG] 既存の表示記録をクリア中...');
    await db.getDatabase().runAsync('DELETE FROM viewed_quotes WHERE user_id = ?', [user.id]);
    
    // 49件の表示記録を作成
    const targetCount = 49;
    let recordedCount = 0;
    
    console.log(`[DEBUG] ${targetCount}件の表示記録を作成開始...`);
    
    for (let i = 0; i < targetCount; i++) {
      try {
        const quote = quotes[i % quotes.length];
        const recordId = generateUuid();
        
        // 過去の日付で記録
        const daysAgo = targetCount - i;
        const recordDate = new Date();
        recordDate.setDate(recordDate.getDate() - daysAgo);
        recordDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
        
        const database = db.getDatabase();
        await database.runAsync(
          "INSERT INTO viewed_quotes (id, user_id, quote_id, viewed_at) VALUES (?, ?, ?, ?)",
          [recordId, user.id, quote.id, recordDate.toISOString()]
        );
        
        recordedCount++;
        
        if (recordedCount % 10 === 0) {
          console.log(`[DEBUG] ${recordedCount}件記録完了...`);
        }
      } catch (error) {
        console.error(`[DEBUG] 記録 ${i+1} 作成エラー:`, error);
      }
    }
    
    // 記録数を確認
    const database = db.getDatabase();
    const countResult = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM viewed_quotes WHERE user_id = ?`,
      [user.id]
    );
    
    const finalCount = countResult?.count || 0;
    console.log(`[DEBUG] 最終記録数: ${finalCount}件`);
    
    console.log('✅ 49件テストデータが正常に作成されました！');
    console.log('🎯 次回名言を表示すると50件達成で祝福画面が表示されます！');
    
  } catch (error) {
    console.error('テスト用49件データ投入中にエラーが発生しました:', error);
    throw error;
  }
};

/**
 * 達成状態をリセット（再テスト用）
 */
export const resetAchievementStatus = async () => {
  console.log('達成状態をリセット中...');
  
  try {
    // ユーザーを取得
    const users = await getAllUsers();
    if (users.length === 0) {
      console.error('ユーザーが見つかりません。');
      return;
    }
    
    const user = users[0];
    
    // SecureStoreから達成状態を削除
    try {
      const SecureStore = require('expo-secure-store');
      const achievementKey = `achievement_50_${user.id}`;
      await SecureStore.deleteItemAsync(achievementKey);
      console.log('✅ 達成状態がリセットされました');
    } catch (error) {
      console.log('⚠️ 達成状態の削除に失敗（初回テスト時は正常）:', error);
    }
    
    console.log('🔄 再度祝福画面をテストできます');
    
  } catch (error) {
    console.error('達成状態リセット中にエラー:', error);
  }
};

/**
 * 表示記録をすべてクリア（完全リセット用）
 */
export const clearAllViewedQuotes = async () => {
  console.log('すべての表示記録をクリア中...');
  
  try {
    // ユーザーを取得
    const users = await getAllUsers();
    if (users.length === 0) {
      console.error('ユーザーが見つかりません。');
      return;
    }
    
    const user = users[0];
    
    // 表示記録をクリア
    await db.getDatabase().runAsync('DELETE FROM viewed_quotes WHERE user_id = ?', [user.id]);
    
    // 達成状態もリセット
    await resetAchievementStatus();
    
    console.log('✅ すべての表示記録がクリアされました');
    console.log('🆕 最初から名言体験をテストできます');
    
  } catch (error) {
    console.error('表示記録クリア中にエラー:', error);
  }
};
