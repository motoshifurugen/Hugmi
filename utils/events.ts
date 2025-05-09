import { EventEmitter } from 'events';

// グローバルなイベントエミッターのインスタンスを作成
const eventEmitter = new EventEmitter();

// イベントタイプを定義
const EVENT_TYPES = {
  FAVORITE_CHANGE: 'favorite_change',
  QUOTE_VIEWED: 'quote_viewed'
};

/**
 * お気に入り状態の変更イベントを発行する
 * @param quoteId 名言ID
 * @param isFavorite 新しいお気に入り状態
 */
export const emitFavoriteChange = (quoteId: string, isFavorite: boolean) => {
  eventEmitter.emit(EVENT_TYPES.FAVORITE_CHANGE, { quoteId, isFavorite });
  console.log(`[EVENT] お気に入り変更: ID=${quoteId}, 状態=${isFavorite}`);
};

/**
 * お気に入り状態の変更を購読する
 * @param callback イベント発生時のコールバック関数
 * @returns 購読解除関数
 */
export const subscribeFavoriteChange = (
  callback: (data: { quoteId: string; isFavorite: boolean }) => void
) => {
  eventEmitter.on(EVENT_TYPES.FAVORITE_CHANGE, callback);
  
  // 購読解除関数を返す
  return () => {
    eventEmitter.off(EVENT_TYPES.FAVORITE_CHANGE, callback);
  };
};

/**
 * 名言表示イベントを発行する
 * @param quoteId 表示された名言ID
 */
export const emitQuoteViewed = (quoteId: string) => {
  eventEmitter.emit(EVENT_TYPES.QUOTE_VIEWED, { quoteId });
  console.log(`[EVENT] 名言表示: ID=${quoteId}`);
};

/**
 * 名言表示イベントを購読する
 * @param callback イベント発生時のコールバック関数
 * @returns 購読解除関数
 */
export const subscribeQuoteViewed = (
  callback: (data: { quoteId: string }) => void
) => {
  eventEmitter.on(EVENT_TYPES.QUOTE_VIEWED, callback);
  
  // 購読解除関数を返す
  return () => {
    eventEmitter.off(EVENT_TYPES.QUOTE_VIEWED, callback);
  };
};

export default {
  emitFavoriteChange,
  subscribeFavoriteChange,
  emitQuoteViewed,
  subscribeQuoteViewed
}; 