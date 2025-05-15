/**
 * ロギングユーティリティ
 * 
 * 環境に応じてログ出力をコントロールし、デバッグ情報の管理を容易にします。
 * 本番環境ではデバッグログは出力されません。
 */

// ログレベルの定義
export enum LogLevel {
  NONE = 0,   // ログを出力しない
  ERROR = 1,  // エラーのみ出力
  WARN = 2,   // 警告とエラーを出力
  INFO = 3,   // 情報、警告、エラーを出力
  DEBUG = 4,  // デバッグ情報を含めすべて出力
}

// 現在の環境を判断する（実際のプロジェクト設定に合わせて調整）
const isDevelopment = process.env.NODE_ENV !== 'production';

// デフォルトのログレベル設定
// 開発環境ではDEBUGレベル、本番環境ではERRORレベルをデフォルトとする
const DEFAULT_LOG_LEVEL = isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;

// 環境変数からログレベルを取得（設定されていない場合はデフォルト値を使用）
let currentLogLevel = DEFAULT_LOG_LEVEL;

/**
 * ロギングユーティリティ
 */
export const Logger = {
  /**
   * ログレベルを設定する
   * @param level 設定するログレベル
   */
  setLogLevel(level: LogLevel): void {
    currentLogLevel = level;
  },

  /**
   * 現在のログレベルを取得する
   * @returns 現在のログレベル
   */
  getLogLevel(): LogLevel {
    return currentLogLevel;
  },

  /**
   * デバッグログを出力する（開発環境のみ）
   * @param message ログメッセージ
   * @param args 追加の引数
   */
  debug(message: string, ...args: any[]): void {
    if (currentLogLevel >= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  /**
   * 情報ログを出力する
   * @param message ログメッセージ
   * @param args 追加の引数
   */
  info(message: string, ...args: any[]): void {
    if (currentLogLevel >= LogLevel.INFO) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  /**
   * 警告ログを出力する
   * @param message ログメッセージ
   * @param args 追加の引数
   */
  warn(message: string, ...args: any[]): void {
    if (currentLogLevel >= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  /**
   * エラーログを出力する
   * @param message ログメッセージ
   * @param args 追加の引数
   */
  error(message: string, ...args: any[]): void {
    if (currentLogLevel >= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
};

// デフォルトエクスポート
export default Logger; 