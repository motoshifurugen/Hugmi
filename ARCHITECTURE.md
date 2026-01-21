# ARCHITECTURE.md

Hugmi のアーキテクチャドキュメント

## システム概要

Hugmiは、React Native + Expoで構築されたクロスプラットフォームモバイルアプリです。オフラインファーストの設計思想に基づき、すべてのデータをローカルSQLiteデータベースに保存します。

```
┌─────────────────────────────────────────────────────────────┐
│                      Hugmi App                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   UI Layer                           │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │  Home   │ │ Routine │ │ Quotes  │ │Settings │   │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │   │
│  └───────┼───────────┼───────────┼───────────┼─────────┘   │
│          │           │           │           │              │
│  ┌───────┴───────────┴───────────┴───────────┴─────────┐   │
│  │                  Expo Router                         │   │
│  │              (File-based Navigation)                 │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                                │
│  ┌─────────────────────────┴───────────────────────────┐   │
│  │              Components Layer                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │   │
│  │  │  Common  │ │  Quotes  │ │    Routine       │    │   │
│  │  │   UI     │ │Components│ │   Components     │    │   │
│  │  └──────────┘ └──────────┘ └──────────────────┘    │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                                │
│  ┌─────────────────────────┴───────────────────────────┐   │
│  │                  Hooks Layer                         │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────┐   │   │
│  │  │useActiveUser│useThemeColor│ useNotifications │   │   │
│  │  └────────────┘ └────────────┘ └────────────────┘   │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                                │
│  ┌─────────────────────────┴───────────────────────────┐   │
│  │                  Data Layer                          │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │           Database (Singleton)                │   │   │
│  │  │  ┌────────┐ ┌────────┐ ┌────────┐           │   │   │
│  │  │  │ Schema │ │ Seeds  │ │  Utils │           │   │   │
│  │  │  └────────┘ └────────┘ └────────┘           │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│  ┌─────────────────────────┴───────────────────────────┐   │
│  │              Native Layer (Expo)                     │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │ SQLite  │ │Notific- │ │ Secure  │ │ Haptics │   │   │
│  │  │         │ │ ations  │ │  Store  │ │         │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## レイヤー構成

### 1. UI Layer (app/)

Expo Routerによるファイルベースのルーティングを採用。

```
app/
├── _layout.tsx          # ルートレイアウト（初期化処理）
├── index.tsx            # エントリーポイント
├── daily-quote.tsx      # 今日の名言画面
├── (tabs)/              # タブナビゲーション
│   ├── _layout.tsx      # タブ設定
│   ├── home.tsx         # ホーム画面
│   ├── routine.tsx      # ルーティン管理
│   ├── quotes.tsx       # 名言コレクション
│   └── settings.tsx     # 設定
├── quotes/              # 名言関連ルート
├── routine-flow/        # ルーティンフロー
└── settings/            # 設定サブページ
```

### 2. Components Layer (components/)

再利用可能なUIコンポーネント群。

| ディレクトリ | 役割 |
|-------------|------|
| `common/` | 共通UIコンポーネント（ThemedText, HapticPressable等） |
| `common/ui/` | 基本UI要素（IconSymbol, CornerDecoration等） |
| `quotes/` | 名言関連コンポーネント |
| `routine/` | ルーティン関連コンポーネント |
| `celebration/` | 達成アニメーション |
| `tutorial/` | オンボーディングUI |

### 3. Hooks Layer (hooks/)

カスタムReact Hooks。

| Hook | 役割 |
|------|------|
| `useActiveUser` | アクティブユーザーの取得・管理 |
| `useColorScheme` | システムテーマ検出 |
| `useThemeColor` | テーマカラー取得 |
| `useNotifications` | 通知のスケジューリング |

### 4. Data Layer (db/)

SQLiteデータベースの管理。

```
db/
├── index.ts             # Singletonパターンのデータベースクラス
├── schema/              # SQLスキーマ定義
├── seeds/               # シードデータ
└── utils/               # CRUD操作
```

## データベース設計

### ERダイアグラム

```
┌─────────────┐       ┌─────────────┐
│   users     │       │   quotes    │
├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │
│ name        │       │ text_ja     │
│ routine_    │       │ text_en     │
│ start_time  │       │ author_ja   │
│ night_      │       │ author_en   │
│ notify_time │       │ era         │
│ created_at  │       │ is_published│
└──────┬──────┘       │ image_path  │
       │              └──────┬──────┘
       │                     │
       │    ┌────────────────┼────────────────┐
       │    │                │                │
       ▼    ▼                ▼                ▼
┌──────────────┐    ┌──────────────┐  ┌──────────────┐
│  routines    │    │viewed_quotes │  │favorite_quotes│
├──────────────┤    ├──────────────┤  ├──────────────┤
│ id (PK)      │    │ id (PK)      │  │ id (PK)      │
│ user_id (FK) │    │ user_id (FK) │  │ user_id (FK) │
│ order        │    │ quote_id(FK) │  │ quote_id(FK) │
│ title        │    │ viewed_at    │  │ saved_at     │
│ is_active    │    └──────────────┘  └──────────────┘
│ created_at   │
└──────┬───────┘
       │
       ▼
┌──────────────┐    ┌──────────────┐
│ routine_logs │    │  mood_logs   │
├──────────────┤    ├──────────────┤
│ id (PK)      │    │ id (PK)      │
│ user_id (FK) │    │ user_id (FK) │
│ date         │    │ date         │
│ routine_id   │    │ mood         │
│ status       │    │ quote_id(FK) │
│ created_at   │    │ created_at   │
└──────────────┘    └──────────────┘
```

### テーブル詳細

| テーブル | 説明 |
|---------|------|
| `users` | ユーザー情報と設定 |
| `quotes` | 名言データ（日英対応） |
| `routines` | ユーザーのルーティン項目 |
| `routine_logs` | ルーティン実行記録 |
| `mood_logs` | 気分記録 |
| `viewed_quotes` | 閲覧済み名言 |
| `favorite_quotes` | お気に入り名言 |

## データフロー

### アプリ起動時

```
App Launch
    │
    ▼
_layout.tsx (Root)
    │
    ├─► Initialize Database (Singleton)
    │       │
    │       ├─► Check Migration
    │       └─► Seed Data (if needed)
    │
    ├─► Load Fonts (Zen Maru Gothic)
    │
    ├─► Setup Notifications
    │
    └─► Determine Initial Route
            │
            ├─► Has User? ──► Daily Quote / Home
            └─► No User? ──► Onboarding
```

### 名言表示フロー

```
Daily Quote Screen
    │
    ├─► Load Active User (SecureStore)
    │
    ├─► Query Unviewed Quotes
    │       │
    │       └─► SELECT * FROM quotes
    │           WHERE id NOT IN (viewed_quotes)
    │           ORDER BY RANDOM() LIMIT 1
    │
    ├─► Display Quote
    │
    └─► Record View
            │
            └─► INSERT INTO viewed_quotes
```

### ルーティンフロー

```
Routine Flow
    │
    ├─► Load User Routines
    │       │
    │       └─► SELECT * FROM routines
    │           WHERE user_id = ? AND is_active = 1
    │           ORDER BY order
    │
    ├─► Step-by-Step UI
    │       │
    │       ├─► Check ──► INSERT routine_log (status: 'checked')
    │       └─► Skip  ──► INSERT routine_log (status: 'skipped')
    │
    └─► Completion
            │
            ├─► Show Celebration Animation
            └─► Navigate to Home
```

## 設計パターン

### 1. Singleton Pattern (Database)

```typescript
// db/index.ts
export class Database {
  private static instance: Database | null = null;

  public static async getInstance(): Promise<Database> {
    if (!Database.instance) {
      Database.instance = new Database();
      await Database.instance.initialize();
    }
    return Database.instance;
  }
}
```

### 2. Repository Pattern (db/utils/)

データアクセスロジックをUIから分離。

```typescript
// db/utils/quotes.ts
export const getRandomUnviewedQuote = async (
  db: SQLiteDatabase,
  userId: string
): Promise<Quote | null> => {
  // SQL query and data transformation
};
```

### 3. File-based Routing (Expo Router)

ファイル構造がそのままルーティングになる。

```
app/(tabs)/home.tsx  →  /(tabs)/home
app/quotes/detail.tsx →  /quotes/detail
```

## Neomorphic デザインシステム

### カラーパレット

```typescript
// constants/Colors.ts
export const Colors = {
  light: {
    background: '#E8E8E8',
    text: '#333333',
    primary: '#7B8794',
    accent: '#A8D8EA',
    // ...
  },
  dark: {
    background: '#2C2C2C',
    text: '#E8E8E8',
    // ...
  }
};
```

### シャドウスタイル

```typescript
// constants/NeuomorphicStyles.ts
export const neuShadow = (elevation: number) => ({
  shadowColor: '#000',
  shadowOffset: { width: elevation, height: elevation },
  shadowOpacity: 0.15,
  shadowRadius: elevation * 2,
});
```

## 通知システム

### スケジューリング

```typescript
// hooks/notificationService.ts
export const scheduleMorningNotification = async (time: Date) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'おはようございます',
      body: '今日も素敵な一日を始めましょう',
    },
    trigger: {
      hour: time.getHours(),
      minute: time.getMinutes(),
      repeats: true,
    },
  });
};
```

## ビルドとデプロイ

### EAS Build プロファイル

| Profile | 用途 | 出力形式 |
|---------|------|----------|
| `development` | 開発テスト | APK (internal) |
| `preview` | 内部配布 | APK (internal) |
| `production` | リリース | APK |
| `production-aab` | Google Play | AAB |

### ビルドコマンド

```bash
# 開発ビルド
eas build --platform android --profile development

# 本番ビルド
eas build --platform android --profile production

# iOS ビルド
eas build --platform ios --profile production
```

## パフォーマンス考慮事項

1. **FlashList**: 大量リスト表示に `@shopify/flash-list` を使用
2. **Reanimated**: スムーズなアニメーションに `react-native-reanimated` を使用
3. **Image Optimization**: `expo-image` による最適化された画像読み込み
4. **SQLite Indexing**: よく使うクエリにはインデックスを設定

## セキュリティ

1. **SecureStore**: ユーザーIDなど機密データの安全な保存
2. **Local-only Data**: サーバーへのデータ送信なし
3. **No Analytics**: ユーザートラッキングなし
