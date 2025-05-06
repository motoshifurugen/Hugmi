import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { db } from '@/db/index';
import TutorialScreen from './TutorialScreen';
import { seedQuotes } from '@/db/seeds/quotes';
import { router } from 'expo-router';
import { generateUuid } from '@/db/utils/uuid';

interface TutorialControllerProps {
  children: React.ReactNode;
}

export default function TutorialController({ children }: TutorialControllerProps) {
  const [showTutorial, setShowTutorial] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

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
          // ユーザーがいない場合は初回ユーザーとみなし、必ずチュートリアルを表示
          console.log('[DEBUG] ユーザーが存在しません。チュートリアルを表示します');
          
          // 古いフラグが残っていればリセット
          if (tutorialCompleted === 'true') {
            await SecureStore.deleteItemAsync('tutorial_completed');
            console.log('[DEBUG] 不整合のためチュートリアルフラグをリセットしました');
          }
          
          // チュートリアル表示を設定
          setShowTutorial(true);
        } else if (tutorialCompleted === 'true') {
          // チュートリアルが完了している場合
          console.log('[DEBUG] チュートリアルはすでに完了しています');
          setShowTutorial(false);
        } else {
          // ユーザーが存在するがフラグがない場合は新規にチュートリアルを表示
          console.log('[DEBUG] ユーザーは存在するがチュートリアルフラグがありません。チュートリアルを表示します');
          setShowTutorial(true);
        }
      } catch (error) {
        console.error('チュートリアル表示判定中にエラーが発生しました:', error);
        // エラー時はデフォルトでチュートリアルを表示
        setShowTutorial(true);
      } finally {
        setLoading(false);
      }
    };

    checkFirstTimeUser();
  }, []);

  // チュートリアル完了時の処理
  const handleTutorialComplete = async () => {
    console.log('[DEBUG] チュートリアルが完了しました');
    
    try {
      // チュートリアル完了フラグを保存
      await SecureStore.setItemAsync('tutorial_completed', 'true');
      console.log('[DEBUG] チュートリアル完了フラグを保存しました');
      
      // ユーザーデータを確認（確実にユーザーが作成されているか確認）
      const users = await db.getAllUsers();
      if (users.length === 0) {
        console.error('[ERROR] チュートリアル完了後もユーザーが存在しません。データに問題がある可能性があります。');
      } else {
        console.log(`[DEBUG] チュートリアル完了後のユーザー: ${users[0].name}`);
      }
    } catch (error) {
      console.error('チュートリアル完了処理中にエラーが発生しました:', error);
    }
    
    // チュートリアル表示を終了
    setShowTutorial(false);
    
    // 名言画面に遷移（通常のログインフロー同様）
    console.log('[DEBUG] 名言画面に遷移します');
    router.replace('/daily-quote');
  };

  // まだローディング中の場合は何も表示しない
  if (loading || showTutorial === null) {
    return null;
  }

  return (
    <>
      {showTutorial ? (
        <TutorialScreen
          visible={true}
          onComplete={async () => {
            try {
              console.log('[DEBUG] チュートリアル完了コールバックが呼び出されました');
              
              // チュートリアル完了フラグをSecureStoreに保存
              await SecureStore.setItemAsync('tutorial_completed', 'true');
              console.log('[DEBUG] チュートリアル完了フラグをSecureStoreに保存しました');
              
              // 再度ユーザーが存在するか確認
              const users = await db.getAllUsers();
              const userCount = users.length;
              console.log(`[DEBUG] チュートリアル完了後の実際のユーザー数: ${userCount}`);
              
              if (userCount === 0) {
                console.error('チュートリアル後もユーザーが存在しません。緊急回復を試みます。');
                try {
                  // 緊急ユーザー作成
                  const emergencyUserId = generateUuid();
                  await db.createUser({
                    id: emergencyUserId,
                    name: 'ゲスト（緊急）'
                  });
                  setActiveUserId(emergencyUserId);
                  await SecureStore.setItemAsync('active_user_id', emergencyUserId);
                  console.log('[DEBUG] 緊急ユーザーを作成しました');
                } catch (emergencyError) {
                  console.error('緊急ユーザー作成にも失敗:', emergencyError);
                }
              }
              
              // チュートリアル表示フラグをオフに
              setShowTutorial(false);
              console.log('[DEBUG] チュートリアル表示をオフにしました');
              
              // 時間帯に関わらず、常に名言画面に遷移する
              console.log('[DEBUG] 名言画面に遷移します');
              router.replace('/daily-quote');
            } catch (error) {
              console.error('チュートリアル完了フラグの保存に失敗:', error);
              setShowTutorial(false);
              
              // エラー時も名言画面に遷移を行う
              console.log('[DEBUG] エラー発生後も名言画面に遷移します');
              router.replace('/daily-quote');
            }
          }}
        />
      ) : (
        children
      )}
    </>
  );
} 