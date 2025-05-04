import { db } from '@/db';

/**
 * ランダムなIDを生成する関数（UUIDの代わり）
 */
function generateId(): string {
  // 現在時刻のタイムスタンプ
  const timestamp = Date.now().toString(36);
  
  // ランダムな文字列を生成
  const randomPart = Math.random().toString(36).substring(2, 15);
  
  // 文字列を結合してIDを生成
  return `${timestamp}-${randomPart}`;
}

/**
 * ユーザーのお気に入り引用を全て取得
 */
export const getFavoriteQuotesByUserId = async (userId: string) => {
  try {
    const favorites = await db.getFavoriteQuotesByUserId(userId);
    return favorites.map(fav => ({
      id: fav.id,
      userId: fav.user_id,
      quoteId: fav.quote_id,
      createdAt: fav.created_at
    }));
  } catch (error) {
    console.error('Error fetching favorite quotes:', error);
    return [];
  }
};

/**
 * 引用がユーザーのお気に入りに入っているか確認
 */
export const isFavoriteQuote = async (userId: string, quoteId: string) => {
  try {
    const result = await db.isFavoriteQuote(userId, quoteId);
    return result;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

/**
 * お気に入り引用を追加
 */
export const addFavoriteQuote = async (userId: string, quoteId: string) => {
  try {
    // 既にお気に入りに登録されているか確認
    const isAlreadyFavorite = await isFavoriteQuote(userId, quoteId);
    if (isAlreadyFavorite) {
      return true; // 既に登録済みの場合は成功とみなす
    }
    
    const id = generateId();
    const result = await db.addFavoriteQuote({
      id,
      userId,
      quoteId
    });
    
    return !!result;
  } catch (error) {
    console.error('Error adding favorite quote:', error);
    return false;
  }
};

/**
 * お気に入り引用を削除
 */
export const removeFavoriteQuote = async (userId: string, quoteId: string) => {
  try {
    return await db.removeFavoriteQuote(userId, quoteId);
  } catch (error) {
    console.error('Error removing favorite quote:', error);
    return false;
  }
};

/**
 * IDでお気に入り引用を削除
 */
export const deleteFavoriteQuoteById = async (id: string) => {
  try {
    return await db.deleteFavoriteQuoteById(id);
  } catch (error) {
    console.error('Error deleting favorite quote by id:', error);
    return false;
  }
}; 