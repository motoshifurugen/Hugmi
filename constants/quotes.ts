/**
 * アプリで使用する名言（モチベーション向上の言葉）のコレクションを定義します。
 * 各名言にはID、テキスト、著者、出典、カテゴリーを含みます。
 */

export interface Quote {
  id: string;
  text: string;
  author: string;
  source?: string;
  category: QuoteCategory;
  isFavorite?: boolean;
}

export type QuoteCategory = 
  | 'motivation'    // モチベーション
  | 'morning'       // 朝の活力
  | 'perseverance'  // 忍耐・継続
  | 'goal'          // 目標達成
  | 'mindfulness'   // マインドフルネス
  | 'happiness'     // 幸福
  | 'wisdom'        // 知恵
  | 'change'        // 変化・成長
  | 'success'       // 成功
  | 'failure'       // 失敗からの学び
  | 'time';         // 時間管理

export const initialQuotes: Quote[] = [
  {
    id: '1',
    text: '一日の始まりは、あなたの心の在り方で決まる',
    author: '心の達人',
    category: 'morning',
  },
  {
    id: '2',
    text: '習慣は第二の天性である',
    author: 'アリストテレス',
    source: '古代ギリシャの哲学',
    category: 'perseverance',
  },
  {
    id: '3',
    text: '千里の道も一歩から',
    author: '老子',
    source: '道徳経',
    category: 'goal',
  },
  {
    id: '4',
    text: '今日できることを明日に延ばすな',
    author: 'ベンジャミン・フランクリン',
    category: 'time',
  },
  {
    id: '5',
    text: '失敗は成功のもと',
    author: '日本のことわざ',
    category: 'failure',
  },
  {
    id: '6',
    text: '継続は力なり',
    author: '日本のことわざ',
    category: 'perseverance',
  },
  {
    id: '7',
    text: '今この瞬間に集中することが、本当の意味での生きることである',
    author: 'ブッダ',
    category: 'mindfulness',
  },
  {
    id: '8',
    text: '目標を立てることは成功への第一歩である',
    author: 'トニー・ロビンス',
    category: 'goal',
  },
  {
    id: '9',
    text: '変化を恐れてはいけない。変化しないことを恐れよ',
    author: '孔子',
    category: 'change',
  },
  {
    id: '10',
    text: '幸せとは、他人と比べることではなく、自分自身の成長を感じることである',
    author: '心理学者',
    category: 'happiness',
  },
]; 