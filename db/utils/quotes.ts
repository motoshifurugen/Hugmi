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
 * すべての引用を取得
 */
export const getAllQuotes = async () => {
  try {
    const quotes = await db.getAllQuotes();
    return quotes.map(quote => ({
      id: quote.id,
      textJa: quote.text_ja,
      textEn: quote.text_en,
      authorName: quote.author_name,
      era: quote.era,
      isPublished: quote.is_published,
      imagePath: quote.image_path
    }));
  } catch (error) {
    console.error('Error fetching all quotes:', error);
    return [];
  }
};

/**
 * 公開されている引用のみ取得
 */
export const getPublishedQuotes = async () => {
  try {
    const quotes = await db.getPublishedQuotes();
    return quotes.map(quote => ({
      id: quote.id,
      textJa: quote.text_ja,
      textEn: quote.text_en,
      authorName: quote.author_name,
      era: quote.era,
      isPublished: quote.is_published,
      imagePath: quote.image_path
    }));
  } catch (error) {
    console.error('Error fetching published quotes:', error);
    return [];
  }
};

/**
 * IDで引用を取得
 */
export const getQuoteById = async (id: string) => {
  try {
    const quote = await db.getQuoteById(id);
    if (!quote) return null;
    
    return {
      id: quote.id,
      textJa: quote.text_ja,
      textEn: quote.text_en,
      authorName: quote.author_name,
      era: quote.era,
      isPublished: quote.is_published,
      imagePath: quote.image_path
    };
  } catch (error) {
    console.error('Error fetching quote by id:', error);
    return null;
  }
};

/**
 * ランダムな引用を1つ取得
 */
export const getRandomQuote = async () => {
  try {
    const quote = await db.getRandomQuote();
    if (!quote) return null;
    
    return {
      id: quote.id,
      textJa: quote.text_ja,
      textEn: quote.text_en,
      authorName: quote.author_name,
      era: quote.era,
      isPublished: quote.is_published,
      imagePath: quote.image_path
    };
  } catch (error) {
    console.error('Error fetching random quote:', error);
    return null;
  }
};

/**
 * 新しい引用を作成
 */
export const createQuote = async (quoteData: {
  textJa: string;
  textEn?: string;
  authorName?: string;
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
      authorName: quoteData.authorName,
      era: quoteData.era,
      isPublished: quoteData.isPublished !== undefined ? quoteData.isPublished : true,
      imagePath: quoteData.imagePath
    });
    
    if (!quote) return null;
    
    return {
      id: quote.id,
      textJa: quote.text_ja,
      textEn: quote.text_en,
      authorName: quote.author_name,
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
    authorName?: string;
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
      authorName: quote.author_name,
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