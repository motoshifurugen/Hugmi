import React, { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { db } from '@/db';
import TutorialScreen from './TutorialScreen';
import { seedQuotes } from '@/db/seeds/quotes';
import { router } from 'expo-router';

interface TutorialControllerProps {
  children: React.ReactNode;
}

export default function TutorialController({ children }: TutorialControllerProps) {
  const [showTutorial, setShowTutorial] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // デバッグ用：強制的にチュートリアル完了フラグをリセット
  const resetTutorialFlag = async () => {
    try {
      await SecureStore.deleteItemAsync('tutorial_completed');
      console.log('[DEBUG] チュートリアル完了フラグをリセットしました');
    } catch (error) {
      console.error('チュートリアルフラグのリセットに失敗:', error);
    }
  };

  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        // 開発環境でのテスト用にチュートリアルフラグをリセットする場合はコメント解除
        // await resetTutorialFlag();
        
        // チュートリアル完了フラグを確認
        const tutorialCompleted = await SecureStore.getItemAsync('tutorial_completed');
        console.log(`[DEBUG] チュートリアル完了フラグ: ${tutorialCompleted}`);
        
        // 名言データがあるか確認
        const quotes = await db.getAllQuotes();
        console.log(`[DEBUG] 名言データ数: ${quotes.length}`);
        
        // 名言データがない場合は、シードデータを実行
        if (quotes.length === 0) {
          console.log('[DEBUG] 名言データが見つかりません。シードデータを実行します。');
          try {
            await seedQuotes();
            console.log('[DEBUG] 名言シードデータの投入が完了しました');
          } catch (seedError) {
            console.error('名言シードデータの投入中にエラーが発生しました:', seedError);
          }
        }
        
        // ユーザーデータを確認（これを先に実行）
        const users = await db.getAllUsers();
        console.log(`[DEBUG] ユーザー数: ${users.length}`);
        
        if (users.length === 0) {
          // ユーザーがいない場合は初回ユーザーとみなす
          console.log('[DEBUG] 初回ユーザーと判断、チュートリアルを表示します');
          // 古いフラグが残っていればリセット
          if (tutorialCompleted === 'true') {
            await SecureStore.deleteItemAsync('tutorial_completed');
            console.log('[DEBUG] 不整合のためチュートリアルフラグをリセットしました');
          }
          setShowTutorial(true);
        } else if (tutorialCompleted === 'true') {
          // チュートリアルが完了している場合
          console.log('[DEBUG] チュートリアルはすでに完了しています');
          setShowTutorial(false);
        } else {
          // ユーザーが存在するがフラグがない場合はチュートリアル完了とみなす
          console.log('[DEBUG] ユーザーデータが存在します、チュートリアルをスキップします');
          // チュートリアル完了フラグを設定（念のため）
          await SecureStore.setItemAsync('tutorial_completed', 'true');
          setShowTutorial(false);
        }
      } catch (error) {
        console.error('チュートリアル表示判定中にエラーが発生しました:', error);
        // エラー時はチュートリアルをスキップ
        setShowTutorial(false);
      } finally {
        setLoading(false);
      }
    };

    checkFirstTimeUser();
  }, []);

  // チュートリアル完了時の処理
  const handleTutorialComplete = () => {
    console.log('[DEBUG] チュートリアルが完了しました');
    setShowTutorial(false);
    
    // ホーム画面に遷移
    console.log('[DEBUG] ホーム画面に遷移します');
    router.replace('/(tabs)/home');
  };

  // まだローディング中の場合は何も表示しない
  if (loading || showTutorial === null) {
    return null;
  }

  return (
    <>
      {showTutorial && (
        <TutorialScreen
          visible={showTutorial}
          onComplete={handleTutorialComplete}
        />
      )}
      {children}
    </>
  );
} 