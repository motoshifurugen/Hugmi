/**
 * 時間帯に応じた挨拶を返すユーティリティ関数
 */
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'おはよう';
  } else if (hour >= 12 && hour < 17) {
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