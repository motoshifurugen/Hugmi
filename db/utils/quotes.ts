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
 * 引用のIDを生成
 */
export const generateQuoteId = () => {
  return `quote_${generateId()}`;
};

/**
 * スキーマの互換性を確保するためのヘルパー関数
 * データベースのレコードを統一されたフォーマットに変換する
 */
export const normalizeQuote = (quoteRecord: any) => {
  // 新しいスキーマか古いスキーマかを判断
  const hasNewSchema = 'author_ja' in quoteRecord;
  
  return {
    id: quoteRecord.id,
    textJa: quoteRecord.text_ja,
    textEn: quoteRecord.text_en,
    // 新しいスキーマならauthor_jaを、古いスキーマならauthor_nameを使用
    authorJa: hasNewSchema ? quoteRecord.author_ja : quoteRecord.author_name,
    // 新しいスキーマならauthor_enを、古いスキーマなら空文字を使用
    authorEn: hasNewSchema ? quoteRecord.author_en : '',
    era: quoteRecord.era,
    isPublished: Boolean(quoteRecord.is_published),
    imagePath: quoteRecord.image_path
  };
};

/**
 * クエリパラメータを準備するヘルパー関数
 * スキーマに応じて適切なフィールド名とパラメータを設定
 */
export const prepareQuoteParams = async (quote: {
  id: string;
  textJa: string;
  textEn?: string;
  authorJa?: string;
  authorEn?: string;
  era?: string;
  isPublished?: boolean;
  imagePath?: string;
}) => {
  // データベースのスキーマを確認（author_jaカラムの存在をチェック）
  const hasNewSchema = await checkNewSchemaExists();
  
  if (hasNewSchema) {
    // 新しいスキーマ用のパラメータ
    return {
      id: quote.id,
      textJa: quote.textJa,
      textEn: quote.textEn,
      authorJa: quote.authorJa,
      authorEn: quote.authorEn,
      era: quote.era,
      isPublished: quote.isPublished,
      imagePath: quote.imagePath
    };
  } else {
    // 古いスキーマ用のパラメータ
    return {
      id: quote.id,
      textJa: quote.textJa,
      textEn: quote.textEn,
      authorName: quote.authorJa, // 古いスキーマではauthor_nameにauthorJaを設定
      era: quote.era,
      isPublished: quote.isPublished,
      imagePath: quote.imagePath
    };
  }
};

/**
 * データベースが新しいスキーマを使用しているか確認
 */
export const checkNewSchemaExists = async (): Promise<boolean> => {
  try {
    const database = db.getDatabase();
    // テーブル情報を取得するSQLiteのプラグマクエリ
    const result = await database.getAllAsync<{name: string}>(
      "PRAGMA table_info(quotes)"
    );
    
    // author_jaカラムが存在するか確認
    return result.some(column => column.name === 'author_ja');
  } catch (error) {
    console.error('Error checking schema:', error);
    // エラー時はfalseを返し、安全のため古いスキーマとして扱う
    return false;
  }
};

/**
 * すべての引用を取得
 */
export const getAllQuotes = async () => {
  try {
    console.log('[DEBUG] すべての名言を取得開始...');
    const quotes = await db.getAllQuotes();
    console.log(`[DEBUG] 名言を${quotes.length}件取得`);
    
    return quotes.map(quote => ({
      id: quote.id,
      textJa: quote.text_ja,
      textEn: quote.text_en,
      authorJa: quote.author_ja, 
      authorEn: quote.author_en,
      era: quote.era,
      isPublished: !!quote.is_published,
      imagePath: quote.image_path
    }));
  } catch (error) {
    console.error('[DEBUG] 全名言取得エラー:', error);
    return [];
  }
};

/**
 * 公開されている引用のみ取得
 */
export const getPublishedQuotes = async () => {
  try {
    console.log('[DEBUG] 公開済み名言を取得開始...');
    const quotes = await db.getPublishedQuotes();
    console.log(`[DEBUG] 公開済み名言を${quotes.length}件取得`);
    
    return quotes.map(quote => ({
      id: quote.id,
      textJa: quote.text_ja,
      textEn: quote.text_en,
      authorJa: quote.author_ja,
      authorEn: quote.author_en,
      era: quote.era,
      isPublished: true,
      imagePath: quote.image_path
    }));
  } catch (error) {
    console.error('[DEBUG] 公開済み名言取得エラー:', error);
    return [];
  }
};

/**
 * IDで引用を取得
 */
export const getQuoteById = async (id: string) => {
  try {
    console.log(`[DEBUG] 名言をIDで取得: id=${id}`);
    const quote = await db.getQuoteById(id);
    
    if (!quote) {
      console.log('[DEBUG] 指定されたIDの名言が見つかりませんでした');
      return null;
    }
    
    return {
      id: quote.id,
      textJa: quote.text_ja,
      textEn: quote.text_en,
      authorJa: quote.author_ja,
      authorEn: quote.author_en,
      era: quote.era,
      isPublished: !!quote.is_published,
      imagePath: quote.image_path
    };
  } catch (error) {
    console.error('[DEBUG] ID指定名言取得エラー:', error);
    return null;
  }
};

/**
 * ランダムな引用を1つ取得
 */
export const getRandomQuote = async () => {
  try {
    console.log('[DEBUG] ランダム名言を取得開始...');
    const quote = await db.getRandomQuote();
    
    if (!quote) {
      console.log('[DEBUG] ランダム名言が取得できませんでした');
      return null;
    }
    
    return {
      id: quote.id,
      textJa: quote.text_ja,
      textEn: quote.text_en,
      authorJa: quote.author_ja,
      authorEn: quote.author_en,
      era: quote.era,
      isPublished: !!quote.is_published,
      imagePath: quote.image_path
    };
  } catch (error) {
    console.error('[DEBUG] ランダム名言取得エラー:', error);
    return null;
  }
};

/**
 * 新しい引用を作成
 */
export const createQuote = async (quoteData: {
  textJa: string;
  textEn?: string;
  authorJa?: string;
  authorEn?: string;
  era?: string;
  isPublished?: boolean;
  imagePath?: string;
}) => {
  try {
    // UUIDパッケージを使わず、独自のID生成関数を使用
    const id = generateId();
    const quote = await db.createQuote({
      id,
      textJa: quoteData.textJa,
      textEn: quoteData.textEn,
      authorJa: quoteData.authorJa,
      authorEn: quoteData.authorEn,
      era: quoteData.era,
      isPublished: quoteData.isPublished !== undefined ? quoteData.isPublished : true,
      imagePath: quoteData.imagePath
    });
    
    if (!quote) return null;
    
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
    console.error('Error creating quote:', error);
    return null;
  }
};

/**
 * 引用情報を更新
 */
export const updateQuote = async (
  id: string,
  quoteData: {
    textJa?: string;
    textEn?: string;
    authorJa?: string;
    authorEn?: string;
    era?: string;
    isPublished?: boolean;
    imagePath?: string;
  }
) => {
  try {
    const quote = await db.updateQuote(id, quoteData);
    if (!quote) return null;
    
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
    console.error('Error updating quote:', error);
    return null;
  }
};

/**
 * 引用を削除
 */
export const deleteQuote = async (id: string) => {
  try {
    return await db.deleteQuote(id);
  } catch (error) {
    console.error('Error deleting quote:', error);
    return false;
  }
}; 