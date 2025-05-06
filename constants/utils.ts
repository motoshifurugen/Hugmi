/**
 * 時間帯に応じた挨拶を返すユーティリティ関数
 */
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'おはよう';
  } else if (hour >= 12 && hour < 18) {
    return 'こんにちは';
  } else {
    return 'こんばんは';
  }
};

/**
 * 現在の日付を YYYY-MM-DD 形式で返す
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 現在が朝の時間帯（5:00〜11:00）かどうかをチェックする関数
export function isMorningTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 5 && hour < 11;
}

// ユーティリティ関数：アプリの初期ルートを決定
export async function determineInitialRoute(userId: string) {
  try {
    // 必要な関数をインポート
    const { isTodayRoutineCompleted, isTodayRoutineStarted } = await import('@/db/utils/routine_logs');
    
    // 朝の時間帯かどうか
    const isMorning = isMorningTime();
    
    // 今日のルーティンが開始済みかどうか
    const routineStarted = await isTodayRoutineStarted(userId);
    
    // 今日のルーティンが完了済みかどうか
    const routineCompleted = await isTodayRoutineCompleted(userId);
    
    console.log(`[DEBUG] ルート決定: 朝の時間帯=${isMorning}, ルーティン開始済み=${routineStarted}, ルーティン完了=${routineCompleted}`);
    
    // 朝の時間帯かつルーティン未実施の場合は朝フローへ
    if (isMorning && !routineStarted && !routineCompleted) {
      return 'daily-quote'; // 名言画面から朝のフローを開始
    }
    
    // それ以外の場合はホーム画面へ - ここを確実なタブパスへ変更
    return '(tabs)/home';
  } catch (error) {
    console.error('初期ルートの決定中にエラーが発生しました:', error);
    // エラー時はデフォルトでホーム画面に遷移（こちらも確実なパスに）
    return '(tabs)/home';
  }
} 