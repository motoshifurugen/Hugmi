import { addFavoriteQuote } from '@/db/utils/favorite_quotes';
import { getAllUsers } from '@/db/utils/users';
import { getPublishedQuotes } from '@/db/utils/quotes';

/**
 * サンプルのお気に入り引用データをデータベースに挿入する
 * 各ユーザーにランダムな引用をお気に入りとして追加
 */
export const seedFavoriteQuotes = async () => {
  console.log('Seeding favorite quotes...');
  
  // すべてのユーザーを取得
  const users = await getAllUsers();
  if (users.length === 0) {
    console.log('No users found. Please run user seeds first.');
    return;
  }
  
  // 公開されている引用を取得
  const quotes = await getPublishedQuotes();
  if (quotes.length === 0) {
    console.log('No quotes found. Please run quote seeds first.');
    return;
  }
  
  let count = 0;
  
  // 各ユーザーについて3〜7個のランダムな引用をお気に入りに追加
  for (const user of users) {
    // ユーザーごとにお気に入りにする引用の数をランダムに決定（3〜7個）
    const favoritesCount = Math.floor(Math.random() * 5) + 3;
    
    // 引用リストをシャッフル
    const shuffledQuotes = [...quotes].sort(() => 0.5 - Math.random());
    
    // 決定した数だけお気に入りを追加
    for (let i = 0; i < Math.min(favoritesCount, shuffledQuotes.length); i++) {
      const quote = shuffledQuotes[i];
      
      await addFavoriteQuote(user.id, quote.id);
      count++;
    }
  }
  
  console.log(`${count} favorite quotes seeded successfully!`);
}; 