import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import SecureStore from '../utils/SecureStore';
import TutorialScreen from './TutorialScreen';

const TutorialController = () => {
  const router = useRouter();

  // チュートリアル完了ハンドラー
  const handleTutorialComplete = useCallback(async () => {
    console.log('[DEBUG] チュートリアルが完了しました');
    try {
      // チュートリアル完了フラグをSecureStoreに保存
      await SecureStore.setItemAsync('tutorial_completed', 'true');
      // 初回ルート用フラグは設定しない（まだ使用していない状態を維持）
      console.log('[DEBUG] チュートリアル完了フラグを保存しました');
    } catch (error) {
      console.error('チュートリアル完了ステータスの保存中にエラーが発生しました:', error);
    }
  }, []);

  return (
    <TutorialScreen
      onComplete={() => {
        console.log('[DEBUG] TutorialScreen.onComplete が呼び出されました');
        handleTutorialComplete();
        
        // 名言画面への直接遷移を追加
        console.log('[DEBUG] 名言画面に直接遷移します');
        router.replace('/daily-quote');
      }}
    />
  );
};

export default TutorialController; 