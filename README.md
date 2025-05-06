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
