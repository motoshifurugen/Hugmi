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
 * 本日の朝の名言ページで表示した名言を取得する（最新の表示記録から）
 */
export const getTodayViewedQuote = async (userId: string) => {
  try {
    console.log('[DEBUG] 本日表示した名言を取得開始...');
    
    // 名言の表示履歴を新しい順に取得
    const viewedQuotes = await db.getViewedQuotesByUserId(userId);
    
    // 表示履歴がない場合
    if (!viewedQuotes || viewedQuotes.length === 0) {
      console.log('[DEBUG] 表示履歴が見つかりませんでした');
      return null;
    }
    
    // 最新の表示記録を取得
    const latestViewedQuote = viewedQuotes[0];
    console.log(`[DEBUG] 最新の表示記録: quoteId=${latestViewedQuote.quote_id}, 時刻=${latestViewedQuote.viewed_at}`);
    
    // 対応する名言データを取得
    const database = db.getDatabase();
    const quoteData = await database.getFirstAsync<{
      id: string;
      text_ja: string;
      text_en: string;
      author_ja: string;
      author_en: string;
      era: string;
      is_published: number;
      image_path: string;
    }>('SELECT * FROM quotes WHERE id = ?', [latestViewedQuote.quote_id]);
    
    if (!quoteData) {
      console.log(`[DEBUG] 名言データが見つかりません: id=${latestViewedQuote.quote_id}`);
      return null;
    }
    
    console.log(`[DEBUG] 最新表示の名言データを取得: id=${quoteData.id}, text=${quoteData.text_ja?.substring(0, 20)}...`);
    
    return {
      id: quoteData.id,
      textJa: quoteData.text_ja,
      textEn: quoteData.text_en,
      authorJa: quoteData.author_ja,
      authorEn: quoteData.author_en,
      era: quoteData.era,
      isPublished: !!quoteData.is_published,
      imagePath: quoteData.image_path,
      viewedAt: latestViewedQuote.viewed_at
    };
  } catch (error) {
    console.error('[DEBUG] 本日の名言取得エラー:', error);
    return null;
  }
};

/**
 * ユーザーIDが存在するか確認
 */
async function userExists(userId: string): Promise<boolean> {
  try {
    const database = db.getDatabase();
    const result = await database.getFirstAsync(`SELECT id FROM users WHERE id = ?`, [userId]);
    return !!result;
  } catch (error) {
    console.error('[DEBUG] ユーザー存在確認エラー:', error);
    return false;
  }
}

/**
 * 名言IDが存在するか確認
 */
async function quoteExists(quoteId: string): Promise<boolean> {
  try {
    const database = db.getDatabase();
    const result = await database.getFirstAsync(`SELECT id FROM quotes WHERE id = ?`, [quoteId]);
    return !!result;
  } catch (error) {
    console.error('[DEBUG] 名言存在確認エラー:', error);
    return false;
  }
}

/**
 * 名言を表示済みとして記録
 */
export const recordViewedQuote = async (userId: string, quoteId: string) => {
  try {
    console.log(`[DEBUG] 名言の表示を記録しようとしています: userId=${userId}, quoteId=${quoteId}`);
    
    // 入力値の検証
    if (!userId || !quoteId) {
      console.error('[DEBUG] 無効なパラメータ: userIdまたはquoteIdが空です');
      return false;
    }
    
    // ユーザーの存在確認
    const isUserExist = await userExists(userId);
    if (!isUserExist) {
      console.error(`[DEBUG] 存在しないユーザー: ${userId} - 表示記録をスキップします`);
      return false;
    }
    
    // 名言の存在確認
    const isQuoteExist = await quoteExists(quoteId);
    if (!isQuoteExist) {
      console.error(`[DEBUG] 存在しない名言: ${quoteId} - 表示記録をスキップします`);
      return false;
    }
    
    const id = generateId();
    
    // 既に記録されていないか確認（重複防止）
    try {
      const existing = await db.getViewedQuotesByUserId(userId);
      const alreadyViewed = existing.some(item => item.quote_id === quoteId);
      
      if (alreadyViewed) {
        console.log(`[DEBUG] この名言は既に表示記録されています: ${quoteId}`);
        return true;
      }
    } catch (checkError) {
      // 確認に失敗しても続行（重複があっても大きな問題にはならない）
      console.warn(`[DEBUG] 表示済み確認中のエラー（無視して続行）:`, checkError);
    }
    
    // 表示記録を登録
    try {
      await db.recordViewedQuote({
        id,
        userId,
        quoteId
      });
      console.log('[DEBUG] 名言の表示を記録しました');
      return true;
    } catch (dbError: any) {
      // SQLエラーの詳細をログに記録
      console.error('[DEBUG] データベース登録エラー:', dbError);
      if (dbError.message && dbError.message.includes('FOREIGN KEY constraint failed')) {
        console.error('[DEBUG] 外部キー制約エラー: userIdまたはquoteIdが存在しません');
      }
      return false;
    }
  } catch (error) {
    console.error('[DEBUG] 表示記録エラー:', error);
    // エラーでもアプリは継続できるようにする
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