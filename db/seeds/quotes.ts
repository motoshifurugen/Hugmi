import { createQuote } from '../utils/quotes';

/**
 * サンプルの引用データをデータベースに挿入する
 */
export const seedQuotes = async () => {
  console.log('Seeding quotes...');
  
  const quotes = [
    {
      textJa: '一日一日を新たな人生の始まりと考えよう',
      textEn: 'Think of each day as the beginning of a new life',
      authorName: 'マルクス・アウレリウス',
      era: '古代ローマ',
    },
    {
      textJa: '早起きは三文の徳',
      textEn: 'Early to bed and early to rise makes a man healthy, wealthy, and wise',
      authorName: 'ベンジャミン・フランクリン',
      era: '18世紀',
    },
    {
      textJa: '人生は自分が息を吸っている間だけでなく、自分が持っている時間を使う方法によって測られる',
      textEn: 'Life is measured not by the breaths we take but by the moments that take our breath away',
      authorName: '孔子',
      era: '古代中国',
    },
    {
      textJa: '朝の時間ほど貴重なものはない。一日のうちで最も静かで、集中力が高まる時間だ',
      textEn: 'No hour of life is wasted that is spent in the saddle',
      authorName: 'ウィンストン・チャーチル',
      era: '20世紀',
    },
    {
      textJa: '今日という日は、残りの人生の最初の日である',
      textEn: 'Today is the first day of the rest of your life',
      authorName: 'アメリカのことわざ',
      era: '現代',
    },
    {
      textJa: '人生は選択の連続である。正しい選択をしようと努力することが、最終的に良い人生を作る',
      textEn: 'Life is a series of choices. Try to make good ones',
      authorName: 'アン・ラモット',
      era: '現代',
    },
    {
      textJa: '今日という日を大切にしなさい、昨日は既に夢、明日はまだビジョンにすぎない',
      textEn: 'Carpe diem (Seize the day)',
      authorName: 'ホラティウス',
      era: '古代ローマ',
    },
    {
      textJa: '自分の限界を決めるのは、自分自身だけである',
      textEn: 'The only limits in our life are those we impose on ourselves',
      authorName: 'ボブ・プロクター',
      era: '現代',
    },
    {
      textJa: '成功とは、失敗から失敗へと情熱を失わずに進むことである',
      textEn: 'Success is the ability to go from failure to failure without losing your enthusiasm',
      authorName: 'ウィンストン・チャーチル',
      era: '20世紀',
    },
    {
      textJa: '人生は短い。怒りに時間を浪費するには短すぎる',
      textEn: 'Life is too short to waste time on things that don\'t matter',
      authorName: '不明',
      era: '現代',
    }
  ];
  
  // シード値を入れる前に重複確認などは行わないシンプルなバージョン
  for (const quote of quotes) {
    await createQuote(quote);
  }
  
  console.log(`${quotes.length} quotes seeded successfully!`);
}; 