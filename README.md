# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## ディレクトリ構成

```
app/
  (tabs)/               ← タブナビゲーション画面
    home.tsx            ← ホーム画面
    routine.tsx         ← 明日のルーティン画面
    quotes.tsx          ← 名言コレクション画面
    settings.tsx        ← 設定画面
    _layout.tsx         ← タブの定義

  routine-flow/         ← ルーティン進行フロー
    start.tsx           ← ルーティン開始（名言表示）
    routine.tsx         ← 1ステップずつ進む画面
    complete.tsx        ← 朝の完了画面
    edit.tsx            ← ルーティン編集

  quotes/
    detail.tsx          ← 名言詳細画面

  _layout.tsx
  +not-found.tsx

components/
  common/               ← 全画面で使うコンポーネント（ボタンなど）
  routine/              ← ルーティン系に特化したUIパーツ
  quotes/               ← 名言表示用のUIなど

constants/
  colors.ts             ← カラーパレット
  fonts.ts              ← フォント定義
  quotes.ts             ← 初期名言データ（場合による）
```

## 機能一覧

- 朝のルーティン管理
- 日々の気分記録
- 名言カード表示
- お気に入り名言の保存
- 初回ユーザー向けチュートリアル

## チュートリアル機能

初めてアプリを起動するユーザーに対して、以下のようなステップでアプリの使い方を案内します：

1. 名言表示（心をほぐす導入）
2. Hugmiアプリの紹介
3. ユーザー名の入力
4. 朝のルーティン選択
5. アプリの使い方説明
6. チュートリアル完了画面

チュートリアルでは、ユーザー情報の初期設定と初期ルーティンの設定を行います。
一度完了すると、次回以降は表示されません。

# ルーティンフロー分岐ロジック

アプリ内のルーティンフロー分岐について説明します。

## 1. アプリ起動時の分岐

アプリを起動すると、以下の条件に基づいて画面遷移が決定されます：

- **朝の時間帯（5:00〜11:00）かつ今日のルーティンが未実施の場合：**  
  スプラッシュ画面 → 朝の名言画面 → ルーティン実行画面
  
- **それ以外の場合：**  
  スプラッシュ画面 → ホーム画面

## 2. ホーム画面の状態

ホーム画面では、ルーティンの進捗状況に応じて以下の表示が変わります：

- **今日のルーティンが完了している場合：**  
  通常の進捗バー表示（100%）
  
- **ルーティンが開始されているが完了していない場合：**  
  進捗バーの横に「再開」ボタンを表示し、ルーティン実行画面へ移動できる

## 3. 朝フロー中断時の対応

朝のルーティンフロー（名言→ルーティン）を途中で中断した場合：

- 再度アプリを起動すると、ホーム画面に遷移
- ホーム画面の進捗状況の横に「再開」ボタンが表示され、中断したルーティンを再開可能

## 実装詳細

- スプラッシュ画面のロード中にデータベースから現在のルーティン状況を取得
- 時間とルーティン状態に基づいて初期ルートを決定
- ホーム画面でルーティン再開UIを表示
