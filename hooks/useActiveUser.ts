import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

// アクティブユーザーIDのストレージキー
const ACTIVE_USER_ID_KEY = 'active_user_id';

/**
 * グローバルに保存されているアクティブユーザーIDを取得するフック
 */
export const useActiveUserId = () => {
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SecureStoreからアクティブユーザーIDを読み込む
    const loadActiveUserId = async () => {
      try {
        const userId = await SecureStore.getItemAsync(ACTIVE_USER_ID_KEY);
        if (userId) {
          setActiveUserId(userId);
        } else {
          console.warn('アクティブユーザーIDが設定されていません');
        }
      } catch (error) {
        console.error('アクティブユーザーIDの読み込みに失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActiveUserId();
  }, []);

  // アクティブユーザーIDを設定する関数
  const setActiveUser = async (userId: string) => {
    try {
      await SecureStore.setItemAsync(ACTIVE_USER_ID_KEY, userId);
      setActiveUserId(userId);
    } catch (error) {
      console.error('アクティブユーザーIDの保存に失敗しました:', error);
    }
  };

  return { activeUserId, loading, setActiveUser };
};

/**
 * 簡易的なアクティブユーザーIDのみを返すフック
 * （Quotes画面で使いやすいように）
 */
export const useActiveUserIdSimple = (): string => {
  const { activeUserId } = useActiveUserId();
  // アプリの初期状態では仮のIDを返す
  return activeUserId || 'default_user';
}; 