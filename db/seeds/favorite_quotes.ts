import { addFavoriteQuote } from '@/db/utils/favorite_quotes';
import { getAllUsers } from '@/db/utils/users';
import { getPublishedQuotes } from '@/db/utils/quotes';

/**
 * お気に入り名言データをデータベースに挿入する
 * 単一ユーザー向けに適切な数のお気に入り名言を設定
 */
export const seedFavoriteQuotes = async () => {
  console.log('お気に入り名言データの投入を開始します...');
  
  // ユーザーを取得（常に1人のみ）
  const users = await getAllUsers();
  if (users.length === 0) {
    console.error('ユーザーが見つかりません。先にユーザーシードを実行してください。');
    return;
  }
  
  const user = users[0]; // 唯一のユーザーを使用
  
  // 公開されている名言を取得
  console.log('[DEBUG] 公開済み名言を取得開始...');
  const quotes = await getPublishedQuotes();
  if (quotes.length === 0) {
    console.error('名言が見つかりません。先に名言シードを実行してください。');
    return;
  }
  console.log(`[DEBUG] 公開済み名言を${quotes.length}件取得`);
  
  // お気に入りにする名言の数 - 制限なし（初期データは5件）
  const favoritesCount = 5;
  
  // 引用リストをシャッフル
  const shuffledQuotes = [...quotes].sort(() => 0.5 - Math.random());
  
  let count = 0;
  
  // 決定した数だけお気に入りを追加（名言の数を超えないように）
  for (let i = 0; i < Math.min(favoritesCount, shuffledQuotes.length); i++) {
    const quote = shuffledQuotes[i];
    
    try {
      await addFavoriteQuote(user.id, quote.id);
      console.log(`お気に入り名言を追加: "${quote.textJa.substring(0, 20)}..."`);
      count++;
    } catch (error) {
      console.error(`お気に入り追加エラー: ${error}`);
    }
  }
  
  console.log(`${count}件のお気に入り名言が正常に作成されました！`);
}; 