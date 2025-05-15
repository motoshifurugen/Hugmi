/**
 * 時間帯に応じた挨拶を返すユーティリティ関数
 */
export const getTimeBasedGreeting = (): string => {
  const now = new Date();
  const hour = now.getHours();
  
  // 午前3時〜午前10:59 => 朝
  if (hour >= 3 && hour < 11) {
    return 'おはよう';
  }
  // 午前11時〜午後5:59 => 昼
  else if (hour >= 11 && hour < 18) {
    return 'こんにちは';
  }
  // 午後6時〜午前2:59 => 夜
  else {
    return 'こんばんは';
  }
};

/**
 * 現在の日付を YYYY-MM-DD 形式で返す
 * 午前0時〜午前2:59の場合は前日の日付を返す
 */
export const getCurrentDate = (): string => {
  // 基準は日本時間
  const now = new Date();
  
  // 午前0時〜午前2:59の場合は日付を1日戻す（前日の日付とする）
  const targetDate = new Date(now);
  if (now.getHours() >= 0 && now.getHours() < 3) {
    targetDate.setDate(targetDate.getDate() - 1);
  }
  
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 時間帯を判別する関数
 * @returns 'morning' | 'daytime' | 'evening'
 */
export function getTimePeriod(): 'morning' | 'daytime' | 'evening' {
  const hour = new Date().getHours();
  
  // 午前3時〜午前10:59 => 朝
  if (hour >= 3 && hour < 11) {
    return 'morning';
  }
  // 午前11時〜午後5:59 => 昼
  else if (hour >= 11 && hour < 18) {
    return 'daytime';
  }
  // 午後6時〜午前2:59 => 夜
  else {
    return 'evening';
  }
}

// 現在が朝の時間帯（3:00〜10:59）かどうかをチェックする関数
export function isMorningTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 3 && hour < 11;
}

// 現在が昼の時間帯（11:00〜17:59）かどうかをチェックする関数
export function isDaytimeTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 11 && hour < 18;
}

// 現在が夜の時間帯（18:00〜2:59）かどうかをチェックする関数
export function isEveningTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 3;
}

// ユーティリティ関数：アプリの初期ルートを決定
export async function determineInitialRoute(userId: string, isFirstLogin: boolean = false) {
  try {
    // 初回ログイン時は時間帯に関わらず名言画面に遷移
    if (isFirstLogin) {
      console.log('[DEBUG] 初回ログイン：時間帯に関わらず名言画面へ遷移します');
      return 'daily-quote';
    }

    // 必要な関数をインポート
    const { isTodayRoutineCompleted, isTodayRoutineStarted } = await import('@/db/utils/routine_logs');
    const { hasTodayViewedQuote } = await import('@/db/utils/viewed_quotes');
    
    // 時間帯を取得
    const timePeriod = getTimePeriod();
    
    // 今日のルーティンが開始済みかどうか
    const routineStarted = await isTodayRoutineStarted(userId);
    
    // 今日のルーティンが完了済みかどうか
    const routineCompleted = await isTodayRoutineCompleted(userId);
    
    // 今日の名言を表示済みかどうか
    const quoteViewed = await hasTodayViewedQuote(userId);
    
    console.log(`[DEBUG] ルート決定: 時間帯=${timePeriod}, ルーティン開始済み=${routineStarted}, ルーティン完了=${routineCompleted}, 名言表示済み=${quoteViewed}`);
    
    // 名言をまだ表示していない場合は、時間帯に関わらず必ず名言画面へ
    if (!quoteViewed) {
      console.log('[DEBUG] 名言未表示：時間帯に関わらず名言画面へ遷移します');
      return 'daily-quote';
    }
    
    // 朝の時間帯で名言が未表示の場合のみ、名言画面に遷移
    // 名言が既に表示済みの場合は、ルーティン進行状況に応じて振り分け
    if (timePeriod === 'morning') {
      if (!quoteViewed) {
        console.log('[DEBUG] 朝の時間帯で名言未表示：名言画面へ遷移します');
        return 'daily-quote';
      } else if (!routineStarted) {
        // 朝だけど名言は表示済み、かつルーティン未開始の場合は、ルーティン画面へ
        console.log('[DEBUG] 朝の時間帯で名言表示済み、ルーティン未開始：ルーティン画面へ遷移します');
        return '/routine-flow/routine';
      }
    }
    
    // それ以外の場合はホーム画面へ
    console.log('[DEBUG] ホーム画面へ遷移します');
    return '(tabs)/home';
  } catch (error) {
    console.error('初期ルートの決定中にエラーが発生しました:', error);
    // エラー時はデフォルトでホーム画面に遷移
    return '(tabs)/home';
  }
} 