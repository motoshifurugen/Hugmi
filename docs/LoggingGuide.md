# ロギングガイドライン

## 概要

このプロジェクトでは、デバッグや情報収集のためのロギングを統一的に管理するため、専用のロギングユーティリティを使用します。これにより、本番環境ではデバッグログを出力せず、開発環境では詳細なログを出力するといった制御が容易になります。

## ロギングユーティリティ

`utils/logger.ts` にログユーティリティが実装されています。このユーティリティは以下の機能を提供します：

- 環境（開発/本番）に応じたログレベルの自動設定
- ログレベルによる出力制御
- 各種ログレベル（DEBUG, INFO, WARN, ERROR）に対応したメソッド

## 使用方法

### 基本的な使い方

```typescript
import Logger from '@/utils/logger';

// デバッグログ（開発環境でのみ出力）
Logger.debug('デバッグ情報です', { 追加データ });

// 情報ログ
Logger.info('情報メッセージです');

// 警告ログ
Logger.warn('警告メッセージです');

// エラーログ
Logger.error('エラーが発生しました', エラーオブジェクト);
```

### ログレベルの設定

必要に応じてログレベルを変更できます：

```typescript
import { LogLevel, Logger } from '@/utils/logger';

// エラーのみ表示
Logger.setLogLevel(LogLevel.ERROR);

// 警告とエラーを表示
Logger.setLogLevel(LogLevel.WARN);

// 情報、警告、エラーを表示
Logger.setLogLevel(LogLevel.INFO);

// すべてのログを表示
Logger.setLogLevel(LogLevel.DEBUG);

// ログを完全に無効化
Logger.setLogLevel(LogLevel.NONE);
```

## ガイドライン

1. **直接的な console.log の使用を避ける**
   - `console.log` の代わりに `Logger.debug` または `Logger.info` を使用してください
   - `console.warn` の代わりに `Logger.warn` を使用してください
   - `console.error` の代わりに `Logger.error` を使用してください

2. **適切なログレベルを選択する**
   - 一時的なデバッグ情報には `Logger.debug` を使用
   - 通常の操作情報には `Logger.info` を使用
   - 潜在的な問題の警告には `Logger.warn` を使用
   - エラー状態の記録には `Logger.error` を使用

3. **有用な情報を含める**
   - ログメッセージは具体的かつ簡潔に
   - 関連するデータを追加パラメータとして含める
   - エラーオブジェクトがある場合は必ず含める

4. **本番向けのセキュリティ考慮事項**
   - 機密情報（パスワード、トークンなど）をログに含めない
   - ユーザー識別情報は最小限に留める

## 移行ガイド

既存のコードを新しいロギングシステムに移行する際の推奨手順：

1. `console.log('[DEBUG] ...')` → `Logger.debug('...')`
2. `console.log('[INFO] ...')` または単なる `console.log('...')` → `Logger.info('...')`
3. `console.warn('...')` → `Logger.warn('...')`
4. `console.error('...')` → `Logger.error('...')`

## ベストプラクティス

- **コンテキスト情報を含める**：ログがどこから発生したかが分かるように、コンポーネント名やメソッド名を含めると良いでしょう
- **構造化されたデータ**：複雑なオブジェクトをログに含める場合は、追加引数として渡してください
- **エラー追跡**：エラーをログに記録する際は、常にエラーオブジェクトを含めてスタックトレースが保持されるようにしてください 