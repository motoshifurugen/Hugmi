import { createQuote } from '../utils/quotes';
import { db } from '@/db';
import { generateQuoteId } from '@/db/utils/quotes';

/**
 * サンプルの引用データをデータベースに挿入する
 */
export const seedQuotes = async () => {
  try {
    console.log('quotes シードデータの投入を開始します');
    
    // シード前にテーブルをクリア
    console.log('既存の名言データを削除します...');
    await db.getDatabase().execAsync('DELETE FROM quotes');
    console.log('テーブルをクリアしました');
    
    const quotes = [
      {
        textJa: '間違っても、\nなおせばいい。\nなおさないことが、\n本当の間違いなんだ。',
        textEn: '子曰く、過ちて改めざる、是を過ちという。',
        authorJa: '孔子',
        authorEn: 'confucius',
        era: '紀元前551年〜紀元前479年',
        imagePath: 'confucius.png'
      },
      {
        textJa: 'なりたい自分を、\n今日からすこしだけ\n生きてみよう。',
        textEn: 'The greatest way to live with honor in this world is to be what we pretend to be.',
        authorJa: 'ソクラテス',
        authorEn: 'socrates',
        era: '紀元前470年頃〜紀元前399年',
        imagePath: 'socrates.png'
      },
      {
        textJa: '世界を変えたいと\n思うなら、\nまず自分自身を\n動かしてみよう。',
        textEn: 'Let him who would move the world first move himself.',
        authorJa: 'ソクラテス',
        authorEn: 'socrates',
        era: '紀元前470年頃〜紀元前399年',
        imagePath: 'socrates.png'
      },
      {
        textJa: 'やさしくあろう。\n出会う人はみな、\n見えない戦いの中に\nいるかもしれない。',
        textEn: 'Be kind, for everyone you meet is fighting a harder battle.',
        authorJa: 'プラトン',
        authorEn: 'plato',
        era: '紀元前427年頃〜紀元前347年頃',
        imagePath: 'plato.png'
      },
      {
        textJa: 'はじめの一歩が\nいちばんたいせつ。\nそこからすべてが\n動き出す。',
        textEn: 'The beginning is the most important part of the work.',
        authorJa: 'プラトン',
        authorEn: 'plato',
        era: '紀元前427年頃〜紀元前347年頃',
        imagePath: 'plato.png'
      },
      {
        textJa: '最初にして最大の勝利は、\n自分自身を乗り越えること。',
        textEn: 'The first and greatest victory is to conquer yourself.',
        authorJa: 'プラトン',
        authorEn: 'plato',
        era: '紀元前427年頃〜紀元前347年頃',
        imagePath: 'plato.png'
      },
      {
        textJa: '希望は、\n目を開けて見る夢。\n今日という一日に、\nそっと寄り添ってくれる。',
        textEn: 'Hope is a waking dream.',
        authorJa: 'アリストテレス',
        authorEn: 'aristotle',
        era: '紀元前384年〜紀元前322年',
        imagePath: 'aristotle.png'
      },
      {
        textJa: '幸せかどうかは、\n自分しだい。\nどんな朝も、\nそこから始められる。',
        textEn: 'Happiness depends upon ourselves.',
        authorJa: 'アリストテレス',
        authorEn: 'aristotle',
        era: '紀元前384年〜紀元前322年',
        imagePath: 'aristotle.png'
      },
      {
        textJa: '質の高さは、\n特別な行いじゃなくて、\n日々の習慣から\n生まれるもの。',
        textEn: 'Quality is not an act, it is a habit.',
        authorJa: 'アリストテレス',
        authorEn: 'aristotle',
        era: '紀元前384年〜紀元前322年',
        imagePath: 'aristotle.png'
      },
      {
        textJa: 'やらないと決めたこと\nがある人だけが、\nやるべきことに、\nしっかり向かえる。',
        textEn: '人有不為也，而後可以有為也。',
        authorJa: '孟子',
        authorEn: 'mencius',
        era: '紀元前372年頃〜紀元前289年頃',
        imagePath: 'mencius.png'
      },
      {
        textJa: 'ときには、\n生きることそのものが、\n勇気のいることもある。',
        textEn: 'Sometimes even to live is an act of courage.',
        authorJa: 'セネカ',
        authorEn: 'seneca',
        era: '紀元前4年頃〜65年',
        imagePath: 'seneca.png'
      },
      {
        textJa: '幸運とは、\n準備がチャンスと\n出会ったときに\n起こるもの。',
        textEn: 'Luck is what happens when preparation meets opportunity.',
        authorJa: 'セネカ',
        authorEn: 'seneca',
        era: '紀元前4年頃〜65年',
        imagePath: 'seneca.png'
      },
      {
        textJa: 'どこに向かうかが\nわからなければ、\nどんな風も\n順風にはならない。',
        textEn: 'If a man knows not to which port he sails, no wind is favorable.',
        authorJa: 'セネカ',
        authorEn: 'seneca',
        era: '紀元前4年頃〜65年',
        imagePath: 'seneca.png'
      },
      {
        textJa: '物語と同じく、\n人生も長さではなく、\nどれだけ良いかが大切。',
        textEn: 'As is a tale, so is life: not how long it is, but how good it is, is what matters.',
        authorJa: 'セネカ',
        authorEn: 'seneca',
        era: '紀元前4年頃〜65年',
        imagePath: 'seneca.png'
      },
      {
        textJa: '朝目覚めたら、\n生きていること、\n考えられること、\n楽しめること、\n愛せることのありがたさを\n思い出してみて。',
        textEn: 'When you arise in the morning think of what a privilege it is to be alive, to think, to enjoy, to love.',
        authorJa: 'マルクス・アウレリウス',
        authorEn: 'marcus_aurelius',
        era: '121年〜180年',
        imagePath: 'marcus_aurelius.png'
      },
      {
        textJa: '過ちを認めることが、\nよい行いのはじまりになる。',
        textEn: 'The confession of evil works is the first beginning of good works.',
        authorJa: 'アウグスティヌス',
        authorEn: 'augustine',
        era: '354年〜430年',
        imagePath: 'augustine.png'
      },
      {
        textJa: '世界は、\n一冊の本みたいなもの。\n外に出ないと、\nまだ最初のページしか\n読めていないのかもしれない。',
        textEn: 'The world is a book, and those who do not travel read only one page.',
        authorJa: 'アウグスティヌス',
        authorEn: 'augustine',
        era: '354年〜430年',
        imagePath: 'augustine.png'
      },
      {
        textJa: 'ただ輝くよりも、\nまわりを照らせる\n光でありたい。',
        textEn: 'It is better to illuminate than merely to shine.',
        authorJa: 'トマス・アクィナス',
        authorEn: 'thomas_aquinas',
        era: '1225年頃〜1274年',
        imagePath: 'thomas_aquinas.png'
      },
      {
        textJa: '船を守ることだけが\n船長の目的なら、\nその船はずっと港から\n出られないままになる。',
        textEn: 'If the highest aim of a captain were to preserve his ship, he would keep it in port forever.',
        authorJa: 'トマス・アクィナス',
        authorEn: 'thomas_aquinas',
        era: '1225年頃〜1274年',
        imagePath: 'thomas_aquinas.png'
      },
      {
        textJa: 'やさしい言葉は、\nそれだけで価値がある。\nそして、その多くは、\nほんのひと手間で贈れる。',
        textEn: 'Good words are worth much, and cost little.',
        authorJa: 'ジョージ・ハーバート',
        authorEn: 'george_herbert',
        era: '1593年〜1633年',
        imagePath: 'george_herbert.png'
      },
      {
        textJa: '世界に勝つより、\nまずは自分に勝てたら、\nそれでいい。',
        textEn: 'Conquer yourself rather than the world.',
        authorJa: 'デカルト',
        authorEn: 'rene_descartes',
        era: '1596年〜1650年',
        imagePath: 'rene_descartes.png'
      },
      {
        textJa: '心はそれ自体が\nひとつの場所。\n地獄を天国に変えることも、\n天国を地獄に変えることも\nできる。',
        textEn: 'The mind is its own place, and in itself can make a heaven of hell, a hell of heaven.',
        authorJa: 'ジョン・ミルトン',
        authorEn: 'john_milton',
        era: '1608年〜1674年',
        imagePath: 'john_milton.png'
      },
      {
        textJa: '苦しみと呼ばれる感情も、\nはっきり見つめたとき、\nもう苦しみではなくなる。',
        textEn: 'Emotion, which is suffering, ceases to be suffering as soon as we form a clear and precise picture of it.',
        authorJa: 'スピノザ',
        authorEn: 'baruch_spinoza',
        era: '1632年〜1677年',
        imagePath: 'baruch_spinoza.png'
      },
      {
        textJa: '働くことは、\n退屈、悪徳、貧困という\n三大悪を遠ざけてくれる。',
        textEn: 'Work keeps at bay three great evils: boredom, vice, and need.',
        authorJa: 'ヴォルテール',
        authorEn: 'voltaire',
        era: '1694年〜1778年',
        imagePath: 'voltaire.png'
      },
      {
        textJa: '感謝とは\n素晴らしいものだ。\n他人の優れた点を\n自分のものにしてくれる。​',
        textEn: 'Appreciation is a wonderful thing. It makes what is excellent in others belong to us as well.',
        authorJa: 'ヴォルテール',
        authorEn: 'voltaire',
        era: '1694年〜1778年',
        imagePath: 'voltaire.png'
      },
      {
        textJa: '最も重要な決断は、\n自分が良い気分でいることを\n選ぶこと。',
        textEn: 'The most important decision you make is to be in a good mood.',
        authorJa: 'ヴォルテール',
        authorEn: 'voltaire',
        era: '1694年〜1778年',
        imagePath: 'voltaire.png'
      },
      {
        textJa: '準備をしないってことは、\n失敗の準備をしてる\nようなもの。',
        textEn: 'By failing to prepare, you are preparing to fail.',
        authorJa: 'ベンジャミン・フランクリン',
        authorEn: 'benjamin_franklin',
        era: '1706年〜1790年',
        imagePath: 'benjamin_franklin.png'
      },
      {
        textJa: '自分の才能を隠さないで。\nそれらは使うためにあるんだ。\n日陰の日時計に何の意味が\nあるというのだろう？',
        textEn: 'Hide not your talents. They for use were made. What\'s a sundial in the shade?',
        authorJa: 'ベンジャミン・フランクリン',
        authorEn: 'benjamin_franklin',
        era: '1706年〜1790年',
        imagePath: 'benjamin_franklin.png'
      },
      {
        textJa: '大きなことを成しとげる\nのに必要なのは、\n力じゃなくて、\nつづけること。',
        textEn: 'Great works are performed not by strength, but by perseverance.',
        authorJa: 'サミュエル・ジョンソン',
        authorEn: 'samuel_johnson',
        era: '1709年〜1784年',
        imagePath: 'samuel_johnson.png'
      },
      {
        textJa: '成功って、\n転んだ数よりも、\nほんの一度だけ\n多く立ち上がること。',
        textEn: 'Success consists of getting up just one more time than you fall.',
        authorJa: 'オリバー・ゴールドスミス',
        authorEn: 'oliver_goldsmith',
        era: '1728年頃〜1774年',
        imagePath: 'oliver_goldsmith.png'
      },
      {
        textJa: '魔法とは\n自分を信じること。\nそれができれば、\n何でも実現できるんだ。',
        textEn: 'Magic is believing in yourself. If you can do that, you can make anything happen.',
        authorJa: 'ゲーテ',
        authorEn: 'johann_wolfgang_von_goethe',
        era: '1749年〜1832年',
        imagePath: 'johann_wolfgang_von_goethe.png'
      },
      {
        textJa: '人をつくるのは、\n言葉や思いじゃなくて、\nやっぱり\n行動なんだと思う。',
        textEn: 'It isn\'t what we say or think that defines us, but what we do.',
        authorJa: 'ジェーン・オースティン',
        authorEn: 'jane_austen',
        era: '1775年〜1817年',
        imagePath: 'jane_austen.png'
      },
      {
        textJa: '思い出すなら、\nうれしかったことだけでいい。\n過去は、心が暖かくなるときだけ、\nそばにあればいい。',
        textEn: 'Think only of the past as its remembrance gives you pleasure.',
        authorJa: 'ジェーン・オースティン',
        authorEn: 'jane_austen',
        era: '1775年〜1817年',
        imagePath: 'jane_austen.png'
      },
      {
        textJa: '一度の笑いは、\nどんなため息100個よりも、\n価値がある。\n今日、少しでも笑えたなら、\nそれでいい。',
        textEn: 'A laugh is worth a hundred groans in any market.',
        authorJa: 'チャールズ・ラム',
        authorEn: 'charles_lamb',
        era: '1775年〜1834年',
        imagePath: 'charles_lamb.png'
      },
      {
        textJa: '他のどんな幸福のためであれ、\n健康を犠牲にすることは\n最大の過ちだよ。',
        textEn: 'The greatest of follies is to sacrifice health for any other kind of happiness.',
        authorJa: 'ショーペンハウアー',
        authorEn: 'arthur_schopenhauer',
        era: '1788年〜1860年',
        imagePath: 'arthur_schopenhauer.png'
      },
      {
        textJa: '毎日が\n一年でいちばんいい日だって、\n心のどこかに書いておこう。',
        textEn: 'Write it on your heart that every day is the best day in the year.',
        authorJa: 'ラルフ・ウォルドー・エマーソン',
        authorEn: 'ralph_waldo_emerson',
        era: '1803年〜1882年',
        imagePath: 'ralph_waldo_emerson.png'
      },
      {
        textJa: '世界は奇跡の連続なのに、\n見慣れてしまって当たり前だと\n呼んでしまう。',
        textEn: 'The whole world is a series of miracles, but we\'re so used to them we call them ordinary things.',
        authorJa: 'ハンス・クリスチャン・アンデルセン',
        authorEn: 'hans_christian_andersen',
        era: '1805年〜1875年',
        imagePath: 'hans_christian_andersen.png'
      },
      {
        textJa: '人生は美しいメロディー\nのようなものだけど、\n歌詞がめちゃくちゃなんだ。',
        textEn: 'Life is like a beautiful melody, only the lyrics are messed up.',
        authorJa: 'ハンス・クリスチャン・アンデルセン',
        authorEn: 'hans_christian_andersen',
        era: '1805年〜1875年',
        imagePath: 'hans_christian_andersen.png'
      },
      {
        textJa: '曲がったり、\n壊れたりもしてきたけれど。\nそのぶん、\n少しはいい形になれたと、\n思いたい。',
        textEn: 'I have been bent and broken, but - I hope - into a better shape.',
        authorJa: 'チャールズ・ディケンズ',
        authorEn: 'charles_dickens',
        era: '1812年〜1870年',
        imagePath: 'charles_dickens.png'
      },
      {
        textJa: '希望は太陽のようなもの。\nそこに向かって歩いていけば、\n背負っているものの影も、\n後ろに落ちていく。',
        textEn: 'Hope is like the sun, which, as we journey toward it, casts the shadow of our burden behind us.',
        authorJa: 'サミュエル・スマイルズ',
        authorEn: 'samuel_smiles',
        era: '1812年〜1904年',
        imagePath: 'samuel_smiles.png'
      },
      {
        textJa: 'もがいた記憶があるからこそ、\n前に進めたという\n実感が生まれる。',
        textEn: 'If there is no struggle, there is no progress.',
        authorJa: 'フレデリック・ダグラス',
        authorEn: 'frederick_douglass',
        era: '1818年〜1895年',
        imagePath: 'frederick_douglass.png'
      },
      {
        textJa: 'なりたかった自分になるのに、\n遅すぎるなんてことはない。',
        textEn: 'It is never too late to be what you might have been.',
        authorJa: 'ジョージ・エリオット',
        authorEn: 'george_eliot',
        era: '1819年〜1880年',
        imagePath: 'george_eliot.png'
      },
      {
        textJa: '陽ざしはあたたかくて、\n雨はこころを潤す。\n風は背すじを伸ばしてくれて、\n雪は気分を軽くしてくれる。\n「悪い天気」なんて、\n本当はないのかもしれないね。',
        textEn: 'Sunshine is delicious, rain is refreshing, wind braces us up, snow is exhilarating. There is really no such thing as bad weather, only different kinds of good weather.',
        authorJa: 'ジェームズ・ラスキン',
        authorEn: 'john_ruskin',
        era: '1819年〜1900年',
        imagePath: 'john_ruskin.png'
      },
      {
        textJa: '真実は小説よりも奇なり。\n小説は「可能性のあること」\nしか書けないけれど、\n真実には\nその縛りがないんだ。',
        textEn: 'Truth is stranger than fiction, but it is because Fiction is obliged to stick to possibilities; Truth isn\'t.',
        authorJa: 'マーク・トウェイン',
        authorEn: 'mark_twain',
        era: '1835年〜1910年',
        imagePath: 'mark_twain.png'
      },
      {
        textJa: 'しわは、\nかつて笑顔があった場所を\nそっと教えてくれるもの。',
        textEn: 'Wrinkles should merely indicate where the smiles have been.',
        authorJa: 'マーク・トウェイン',
        authorEn: 'mark_twain',
        era: '1835年〜1910年',
        imagePath: 'mark_twain.png'
      },
      {
        textJa: '自分の行いが、\n世界に影響を与えているつもりで\n動いてみよう。\n実際、きっとそうだから。',
        textEn: 'Act as if what you do makes a difference. It does.',
        authorJa: 'ウィリアム・ジェームズ',
        authorEn: 'william_james',
        era: '1842年〜1910年',
        imagePath: 'william_james.png'
      },
      {
        textJa: '計画通りにいかない\nからといって、\nそれが無駄だという\nわけじゃない。',
        textEn: 'Just because something doesn\'t do what you planned it to do doesn\'t mean it\'s useless.',
        authorJa: 'トーマス・エジソン',
        authorEn: 'thomas_edison',
        era: '1847年〜1931年',
        imagePath: 'thomas_edison.png'
      },
      {
        textJa: '今日を"どれだけ得られたか"で\n測るんじゃなくて、\n"どれだけ種をまけたか"で、\nそっとふり返ってみよう。',
        textEn: 'Don\'t judge each day by the harvest you reap but by the seeds that you plant.',
        authorJa: 'ロバート・ルイス・スティーヴンソン',
        authorEn: 'robert_louis_stevenson',
        era: '1850年〜1894年',
        imagePath: 'robert_louis_stevenson.png'
      },
      {
        textJa: '人間は、\n結果を得ることで\n幸福になるのではない。\n努力そのものが幸福なのだ。',
        textEn: '',
        authorJa: '夏目漱石',
        authorEn: 'soseki_natsume',
        era: '1867年〜1916年',
        imagePath: 'soseki_natsume.png'
      },
      {
        textJa: '本当の発見とは、\n新しい景色を探すことじゃない。\n同じ世界を、\n新しい目で見ることなんだ。',
        textEn: 'The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.',
        authorJa: 'マルセル・プルースト',
        authorEn: 'marcel_proust',
        era: '1871年〜1922年',
        imagePath: 'marcel_proust.png'
      }
    ];
    
    // シード値を入れる前に重複確認などは行わないシンプルなバージョン
    for (const quote of quotes) {
      await createQuote(quote);
    }
    
    console.log(`${quotes.length} quotes seeded successfully!`);
  } catch (error) {
    console.error('シードデータの投入中にエラーが発生しました:', error);
  }
}; 