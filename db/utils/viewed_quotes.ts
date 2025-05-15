import { db } from '../';
import { getCurrentDate } from "@/constants/utils";
import Logger from '@/utils/logger';

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
 * ユーザーIDがない場合はnullを返す
 */
export const getUnviewedRandomQuote = async (userId: string) => {
  try {
    // ユーザーIDがnullまたは空の場合（チュートリアル前など）はnullを返す
    if (!userId || userId === 'user1') {
      return null;
    }
    
    // 通常のユーザー指定の場合（未表示の名言を取得）
    const quote = await db.getUnviewedRandomQuote(userId);
    
    if (!quote) {
      return null;
    }
    
    // 名言の検証
    if (!quote.text_ja || quote.text_ja.trim() === '') {
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
    return null;
  }
};

/**
 * 本日の朝の名言ページで表示した名言を取得する（最新の表示記録から）
 */
export const getTodayViewedQuote = async (userId: string) => {
  try {
    // 名言の表示履歴を新しい順に取得
    const viewedQuotes = await db.getViewedQuotesByUserId(userId);
    
    // 表示履歴がない場合
    if (!viewedQuotes || viewedQuotes.length === 0) {
      return null;
    }
    
    // 最新の表示記録を取得
    const latestViewedQuote = viewedQuotes[0];
    
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
      return null;
    }
    
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
    return false;
  }
}

/**
 * 名言を表示済みとして記録
 */
export const recordViewedQuote = async (userId: string, quoteId: string) => {
  try {
    // 入力値の検証
    if (!userId || !quoteId) {
      Logger.error('名言表示記録失敗: ユーザーIDまたは名言IDが未指定', { userId, quoteId });
      return false;
    }
    
    Logger.debug(`名言表示記録処理開始 - ユーザーID: ${userId}, 名言ID: ${quoteId}`);
    
    // ユーザーの存在確認
    const isUserExist = await userExists(userId);
    if (!isUserExist) {
      Logger.error(`名言表示記録失敗: ユーザーが存在しません - ユーザーID: ${userId}`);
      return false;
    }
    
    // 名言の存在確認
    const isQuoteExist = await quoteExists(quoteId);
    if (!isQuoteExist) {
      Logger.error(`名言表示記録失敗: 名言が存在しません - 名言ID: ${quoteId}`);
      return false;
    }
    
    const id = generateId();
    Logger.debug(`新規表示記録ID生成: ${id}`);
    
    // 既に記録されていないか確認（重複防止）
    try {
      const existing = await db.getViewedQuotesByUserId(userId);
      Logger.debug(`既存の表示記録数: ${existing.length}件`);
      
      const alreadyViewed = existing.some(item => item.quote_id === quoteId);
      
      if (alreadyViewed) {
        Logger.debug(`この名言は既に表示済みとして記録されています: ${quoteId}`);
        return true;
      }
    } catch (checkError) {
      Logger.error('表示済み確認中にエラー:', checkError);
      // 確認に失敗しても続行（重複があっても大きな問題にはならない）
    }
    
    // 表示記録を登録
    try {
      const now = new Date();
      Logger.debug(`名言表示記録 - 現在時刻: ${now.toISOString()}`);
      Logger.debug(`名言表示記録 - 日本時間: ${new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString()}`);
      
      Logger.debug(`名言の表示を記録（DB初期化済み）: ${quoteId}`);
      await db.recordViewedQuote({
        id,
        userId,
        quoteId
      });
      return true;
    } catch (dbError: any) {
      // SQLエラーの詳細をログに記録
      Logger.error('DB記録中のエラー:', dbError);
      if (dbError.message && dbError.message.includes('FOREIGN KEY constraint failed')) {
        Logger.error('外部キー制約エラー: userIdまたはquoteIdが存在しません');
      }
      return false;
    }
  } catch (error) {
    Logger.error('名言表示記録中の予期しないエラー:', error);
    // エラーでもアプリは継続できるようにする
    return false;
  }
};

/**
 * ユーザーの表示済み名言をすべて取得
 */
export const getViewedQuotesByUserId = async (userId: string) => {
  try {
    const viewedQuotes = await db.getViewedQuotesByUserId(userId);
    return viewedQuotes.map(quote => ({
      id: quote.id,
      userId: quote.user_id,
      quoteId: quote.quote_id,
      viewedAt: quote.viewed_at
    }));
  } catch (error) {
    return [];
  }
};

/**
 * 今日の名言を表示済みかどうかを確認する
 * @param userId ユーザーID
 * @returns 今日の名言を表示済みならtrue、未表示ならfalse
 */
export async function hasTodayViewedQuote(userId: string): Promise<boolean> {
  try {
    // 現在の日付（JST、3:00AMリセット考慮済み）
    const todayJST = getCurrentDate();
    
    Logger.debug(`hasTodayViewedQuote - ユーザーID: ${userId}, 対象日付: ${todayJST}`);
    
    // データベースインスタンス
    const database = db.getDatabase();
    
    // SQL直接クエリで今日の日付のレコードがあるか確認
    // SQLiteのDATE関数を使用し、タイムゾーン調整（+9時間）して日本時間の日付を取得
    const result = await database.getFirstAsync<{ exists: number }>(
      `SELECT 1 AS "exists" 
       FROM viewed_quotes 
       WHERE user_id = ? 
       AND DATE(viewed_at, '+9 hours') = ? 
       LIMIT 1`,
      [userId, todayJST]
    );
    
    const isViewed = !!result;
    Logger.debug(`今日の名言表示確認結果: ${isViewed ? '表示済み' : '未表示'}`);
    
    // デバッグ: ログに表示済み名言リストを出力
    try {
      const recentQuotes = await database.getAllAsync<{
        quote_id: string;
        viewed_at: string;
        jst_date: string;
      }>(
        `SELECT quote_id, viewed_at, DATE(viewed_at, '+9 hours') AS jst_date
         FROM viewed_quotes 
         WHERE user_id = ? 
         ORDER BY viewed_at DESC 
         LIMIT 5`,
        [userId]
      );
      
      if (recentQuotes.length > 0) {
        Logger.debug(`最近の表示済み名言 (${recentQuotes.length}件):`);
        recentQuotes.forEach((q, i) => {
          Logger.debug(`  ${i+1}: ID=${q.quote_id}, UTC日時=${q.viewed_at}, JST日付=${q.jst_date}`);
        });
      } else {
        Logger.debug(`表示済み名言がありません`);
      }
    } catch (logError) {
      Logger.error('表示済み名言一覧取得中にエラー:', logError);
    }
    
    // 結果があればtrue、なければfalseを返す
    return isViewed;
  } catch (error) {
    Logger.error('名言表示状態確認中にエラーが発生しました:', error);
    // エラー時はデフォルトでfalseを返す
    return false;
  }
} 