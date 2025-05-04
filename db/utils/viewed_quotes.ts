import { db } from '../';

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
 * ユーザーがまだ表示していない名言をランダムに取得
 */
export const getUnviewedRandomQuote = async (userId: string) => {
  try {
    console.log('[DEBUG] DBから未表示名言を取得開始...');
    const quote = await db.getUnviewedRandomQuote(userId);
    
    if (!quote) {
      console.log('[DEBUG] DBから名言が取得できませんでした');
      return null;
    }
    
    console.log(`[DEBUG] DBから名言を取得: id=${quote.id}, text=${quote.text_ja?.substring(0, 20)}...`);
    
    // 名言の検証
    if (!quote.text_ja || quote.text_ja.trim() === '') {
      console.log('[DEBUG] 無効な名言データです: テキストが空です');
      return null;
    }
    
    return {
      id: quote.id,
      textJa: quote.text_ja,
      textEn: quote.text_en,
      authorJa: quote.author_ja,
      authorEn: quote.author_en,
      era: quote.era,
      isPublished: quote.is_published,
      imagePath: quote.image_path
    };
  } catch (error) {
    console.error('[DEBUG] 未表示名言取得エラー:', error);
    return null;
  }
};

/**
 * 名言を表示済みとして記録
 */
export const recordViewedQuote = async (userId: string, quoteId: string) => {
  try {
    console.log(`[DEBUG] 名言の表示を記録します: userId=${userId}, quoteId=${quoteId}`);
    const id = generateId();
    await db.recordViewedQuote({
      id,
      userId,
      quoteId
    });
    console.log('[DEBUG] 名言の表示を記録しました');
    return true;
  } catch (error) {
    console.error('[DEBUG] 表示記録エラー:', error);
    return false;
  }
};

/**
 * ユーザーの表示済み名言をすべて取得
 */
export const getViewedQuotesByUserId = async (userId: string) => {
  try {
    console.log(`[DEBUG] ユーザーの表示済み名言を取得: userId=${userId}`);
    const viewedQuotes = await db.getViewedQuotesByUserId(userId);
    console.log(`[DEBUG] 取得した表示済み名言: ${viewedQuotes.length}件`);
    return viewedQuotes.map(quote => ({
      id: quote.id,
      userId: quote.user_id,
      quoteId: quote.quote_id,
      viewedAt: quote.viewed_at
    }));
  } catch (error) {
    console.error('[DEBUG] 表示済み名言取得エラー:', error);
    return [];
  }
}; 