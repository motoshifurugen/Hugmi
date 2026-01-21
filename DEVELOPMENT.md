# DEVELOPMENT.md

Hugmi 開発ガイド

## 開発環境セットアップ

### 必要なツール

- Node.js 18+
- npm または yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Xcode (iOS開発用)
- Android Studio (Android開発用)

### 初期セットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd Hugmi

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

### 環境別コマンド

```bash
# iOS シミュレータで実行
npm run ios

# Android エミュレータで実行
npm run android

# Web ブラウザで実行
npm run web

# テスト実行
npm test

# リント実行
npm run lint
```

## プロジェクト構成

### ディレクトリ構造

```
Hugmi/
├── app/                 # ページ（Expo Router）
├── components/          # 再利用可能なコンポーネント
├── db/                  # データベース関連
├── hooks/               # カスタムフック
├── constants/           # 定数
├── utils/               # ユーティリティ
├── types/               # TypeScript型定義
├── assets/              # 静的アセット
├── android/             # Androidネイティブコード
└── ios/                 # iOSネイティブコード
```

### 命名規則

| 種類 | 規則 | 例 |
|-----|------|-----|
| コンポーネント | PascalCase | `QuoteCard.tsx` |
| ルート | kebab-case | `daily-quote.tsx` |
| ユーティリティ | camelCase | `formatDate.ts` |
| 定数 | UPPER_SNAKE_CASE | `MAX_QUOTES` |
| フック | camelCase (use prefix) | `useActiveUser.ts` |

## データベース操作

### データベースの取得

```typescript
import { Database } from '@/db';

const db = await Database.getInstance();
```

### CRUD操作

```typescript
// 名言の取得
import { getRandomUnviewedQuote, getAllQuotes } from '@/db/utils/quotes';

const quote = await getRandomUnviewedQuote(db, userId);
const quotes = await getAllQuotes(db);

// ルーティンの操作
import { getUserRoutines, createRoutine } from '@/db/utils/routines';

const routines = await getUserRoutines(db, userId);
await createRoutine(db, userId, 'Morning stretch', 1);
```

### データベースリセット（開発時）

`db/index.ts` の初期化時に `resetDb: true` を設定：

```typescript
// 開発時のみ
await db.initialize({ resetDb: true });
```

### マイグレーション

スキーマ変更時は `db/utils/migration.ts` を更新：

```typescript
export const migrations = [
  {
    version: 1,
    up: async (db: SQLiteDatabase) => {
      await db.execAsync(`ALTER TABLE users ADD COLUMN new_field TEXT`);
    }
  }
];
```

## コンポーネント開発

### 基本的なコンポーネント構造

```typescript
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/common/ThemedView';
import { ThemedText } from '@/components/common/ThemedText';
import { Colors } from '@/constants/Colors';

interface Props {
  title: string;
  onPress?: () => void;
}

export function MyComponent({ title, onPress }: Props) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>{title}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

### Neomorphic スタイルの適用

```typescript
import { neuShadow, neuInset } from '@/constants/NeuomorphicStyles';
import { Colors } from '@/constants/Colors';

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    ...neuShadow(4),
  },
  insetCard: {
    ...neuInset(4),
  },
});
```

### ハプティックフィードバック

```typescript
import { HapticPressable } from '@/components/common/HapticPressable';

<HapticPressable onPress={handlePress}>
  <ThemedText>タップしてください</ThemedText>
</HapticPressable>
```

## ナビゲーション

### 基本的なナビゲーション

```typescript
import { router } from 'expo-router';

// プッシュ（戻れる）
router.push('/quotes/detail');

// 置換（戻れない）
router.replace('/(tabs)/home');

// 戻る
router.back();

// パラメータ付き
router.push({
  pathname: '/quotes/detail',
  params: { quoteId: '123' }
});
```

### パラメータの受け取り

```typescript
import { useLocalSearchParams } from 'expo-router';

export default function DetailScreen() {
  const { quoteId } = useLocalSearchParams<{ quoteId: string }>();
  // ...
}
```

## 通知

### 通知のスケジューリング

```typescript
import { scheduleMorningNotification } from '@/hooks/notificationService';

// 毎朝7時に通知
await scheduleMorningNotification(new Date(2024, 0, 1, 7, 0));
```

### 通知の許可確認

```typescript
import { useNotifications } from '@/hooks/useNotifications';

const { hasPermission, requestPermission } = useNotifications();

if (!hasPermission) {
  await requestPermission();
}
```

## テスト

### ユニットテスト

```typescript
// components/__tests__/QuoteCard.test.tsx
import { render } from '@testing-library/react-native';
import { QuoteCard } from '../quotes/QuoteCard';

describe('QuoteCard', () => {
  it('renders quote text', () => {
    const { getByText } = render(
      <QuoteCard quote={{ text_ja: 'テスト名言', author_ja: '著者' }} />
    );
    expect(getByText('テスト名言')).toBeTruthy();
  });
});
```

### テスト実行

```bash
# 全テスト実行
npm test

# ウォッチモード
npm test -- --watch

# カバレッジ
npm test -- --coverage
```

## ビルドとデプロイ

### 開発ビルド

```bash
# Android APK
eas build --platform android --profile development

# iOS Simulator
eas build --platform ios --profile development
```

### 本番ビルド

```bash
# Android (APK)
eas build --platform android --profile production

# Android (AAB for Play Store)
eas build --platform android --profile production-aab

# iOS
eas build --platform ios --profile production
```

### ストアへの提出

```bash
# Google Play Store
eas submit --platform android

# App Store
eas submit --platform ios
```

## デバッグ

### ログ出力

```typescript
import { logger } from '@/utils/logger';

logger.debug('デバッグメッセージ');
logger.info('情報メッセージ');
logger.warn('警告メッセージ');
logger.error('エラーメッセージ');
```

### React Native Debugger

1. 開発サーバー起動中に `d` キーを押す
2. 「Debug Remote JS」を選択
3. ブラウザの DevTools で確認

### SQLite の確認

開発中にデータベースの中身を確認：

```typescript
// 一時的にコンソール出力
const quotes = await db.getAllAsync('SELECT * FROM quotes');
console.log(JSON.stringify(quotes, null, 2));
```

## トラブルシューティング

### よくある問題

**Metro bundler のキャッシュクリア:**
```bash
npx expo start --clear
```

**node_modules の再インストール:**
```bash
rm -rf node_modules
npm install
```

**iOS Pods の再インストール:**
```bash
cd ios
pod install --repo-update
cd ..
```

**Android ビルドエラー:**
```bash
cd android
./gradlew clean
cd ..
```

### EAS ビルドエラー

- `eas.json` の設定を確認
- Node.js バージョンを確認（18+）
- `app.json` の expo SDK バージョンを確認

## コントリビューション

### ブランチ戦略

- `main` - 本番リリース
- `develop` - 開発統合ブランチ
- `feature/xxx` - 機能開発
- `fix/xxx` - バグ修正
- `release/x.x.x` - リリース準備

### コミットメッセージ

```
<type>: <subject>

例:
feat: 名言詳細画面にシェア機能を追加
fix: ルーティン完了時のアニメーションバグを修正
refactor: データベースクエリの最適化
docs: README を更新
```

### Pull Request

1. ブランチを作成
2. 変更をコミット
3. テストを実行
4. PR を作成
5. レビューを受ける
6. マージ
