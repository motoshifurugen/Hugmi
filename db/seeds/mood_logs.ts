import { createMoodLog, MoodType } from '@/db/utils/mood_logs';
import { getAllUsers } from '@/db/utils/users';
import { getPublishedQuotes } from '@/db/utils/quotes';

/**
 * 気分ログデータをデータベースに挿入する
 * 単一ユーザー向けに過去30日間の気分ログを作成
 */
export const seedMoodLogs = async () => {
  console.log('気分ログデータの投入を開始します...');
  
  // ユーザーを取得（常に1人のみ）
  const users = await getAllUsers();
  if (users.length === 0) {
    console.error('ユーザーが見つかりません。先にユーザーシードを実行してください。');
    return;
  }
  
  const user = users[0]; // 唯一のユーザーを使用
  
  // 引用を取得
  console.log('[DEBUG] 公開済み名言を取得開始...');
  const quotes = await getPublishedQuotes();
  if (quotes.length === 0) {
    console.error('名言が見つかりません。先に名言シードを実行してください。');
    return;
  }
  console.log(`[DEBUG] 公開済み名言を${quotes.length}件取得`);
  
  // 過去30日間の日付を生成
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    // 'YYYY-MM-DD' 形式に変換
    const dateString = date.toISOString().split('T')[0];
    dates.push(dateString);
  }
  
  // 気分の種類 - MoodTypeの定義に合わせる
  const moods: MoodType[] = ['happy', 'tired', 'sad', 'anxious'];
  
  // 気分の分布（より自然な分布に）
  // happy: 35%, tired: 30%, sad: 20%, anxious: 15%
  const moodDistribution = [
    { mood: 'happy', probability: 0.35 },
    { mood: 'tired', probability: 0.3 },
    { mood: 'sad', probability: 0.2 },
    { mood: 'anxious', probability: 0.15 }
  ];
  
  // 日付ごとの気分を決定する関数
  function selectMoodForDate(date: string): MoodType {
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    
    // 曜日要素を追加（週末はhappyになりやすい）
    let adjustedDistribution = [...moodDistribution];
    
    if (isWeekend) {
      // 週末は良い気分が増える
      adjustedDistribution = adjustedDistribution.map(item => {
        if (item.mood === 'happy') {
          return { ...item, probability: item.probability * 1.5 };
        } else {
          return { ...item, probability: item.probability * 0.7 };
        }
      });
    }
    
    // 確率の合計が1になるように正規化
    const totalProbability = adjustedDistribution.reduce((sum, item) => sum + item.probability, 0);
    adjustedDistribution = adjustedDistribution.map(item => ({
      ...item,
      probability: item.probability / totalProbability
    }));
    
    // 累積確率で選択
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const item of adjustedDistribution) {
      cumulativeProbability += item.probability;
      if (random < cumulativeProbability) {
        return item.mood as MoodType;
      }
    }
    
    // デフォルト（万が一の場合）
    return 'happy';
  }
  
  let count = 0;
  
  // ユーザーについて過去30日間の気分ログを作成
  for (const date of dates) {
    // その日の気分を選択
    const mood = selectMoodForDate(date);
    
    // 気分に合った名言を選ぶ（ランダム）
    // 実際のアプリでは気分に合った名言を選ぶロジックがあるかもしれないが、ここではランダム
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    await createMoodLog({
      userId: user.id,
      date,
      mood,
      quoteId: quote.id
    });
    
    count++;
  }
  
  console.log(`${count}件の気分ログが正常に作成されました！`);
}; 