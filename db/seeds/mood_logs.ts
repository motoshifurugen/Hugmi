import { createMoodLog, MoodType } from '@/db/utils/mood_logs';
import { getAllUsers } from '@/db/utils/users';
import { getPublishedQuotes } from '@/db/utils/quotes';

/**
 * サンプルの気分ログデータをデータベースに挿入する
 * 各ユーザーの過去10日間の気分ログを作成
 */
export const seedMoodLogs = async () => {
  console.log('Seeding mood logs...');
  
  // すべてのユーザーを取得
  const users = await getAllUsers();
  if (users.length === 0) {
    console.log('No users found. Please run user seeds first.');
    return;
  }
  
  // 引用を取得
  const quotes = await getPublishedQuotes();
  if (quotes.length === 0) {
    console.log('No quotes found. Please run quote seeds first.');
    return;
  }
  
  // 過去10日間の日付を生成
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    // 'YYYY-MM-DD' 形式に変換
    const dateString = date.toISOString().split('T')[0];
    dates.push(dateString);
  }
  
  // 気分の種類
  const moods: MoodType[] = ['happy', 'tired', 'sad', 'anxious'];
  
  let count = 0;
  
  // 各ユーザーについて過去10日間の気分ログを作成
  for (const user of users) {
    for (const date of dates) {
      // ランダムに気分を選択
      const mood = moods[Math.floor(Math.random() * moods.length)];
      
      // ランダムに引用を選択
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      
      await createMoodLog({
        userId: user.id,
        date,
        mood,
        quoteId: quote.id
      });
      
      count++;
    }
  }
  
  console.log(`${count} mood logs seeded successfully!`);
}; 