import * as SQLite from 'expo-sqlite';

// データベース名
const DATABASE_NAME = 'hugmi.db';

class Database {
  private db: SQLite.SQLiteDatabase;
  private static instance: Database;

  private constructor() {
    this.db = SQLite.openDatabaseSync(DATABASE_NAME);
  }

  /**
   * シングルトンパターンでデータベースインスタンスを取得
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * データベースを取得
   */
  public getDatabase() {
    return this.db;
  }

  /**
   * データベースの初期化処理
   * テーブルの作成など
   */
  public async initialize(): Promise<void> {
    try {
      // ユーザーテーブルの作成
      this.db.execAsync(
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          routine_start_time TEXT,
          night_notify_time TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`
      );
      console.log('Database initialized successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('Error initializing database:', error);
      return Promise.reject(error);
    }
  }

  /**
   * すべてのユーザーを取得
   */
  public async getAllUsers() {
    const result = await this.db.getAllAsync<{
      id: string;
      name: string;
      routine_start_time: string;
      night_notify_time: string;
      created_at: string;
    }>("SELECT * FROM users");
    return result;
  }

  /**
   * IDでユーザーを取得
   */
  public async getUserById(id: string) {
    const result = await this.db.getAllAsync<{
      id: string;
      name: string;
      routine_start_time: string;
      night_notify_time: string;
      created_at: string;
    }>("SELECT * FROM users WHERE id = ?", [id]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * 新しいユーザーを作成
   */
  public async createUser(userData: {
    id: string;
    name: string;
    routineStartTime?: string;
    nightNotifyTime?: string;
  }) {
    await this.db.runAsync(
      `INSERT INTO users (id, name, routine_start_time, night_notify_time) 
       VALUES (?, ?, ?, ?)`,
      [
        userData.id,
        userData.name,
        userData.routineStartTime || null,
        userData.nightNotifyTime || null
      ]
    );
    return await this.getUserById(userData.id);
  }

  /**
   * ユーザー情報を更新
   */
  public async updateUser(
    id: string,
    userData: {
      name?: string;
      routineStartTime?: string;
      nightNotifyTime?: string;
    }
  ) {
    const sets = [];
    const values = [];

    if (userData.name !== undefined) {
      sets.push("name = ?");
      values.push(userData.name);
    }

    if (userData.routineStartTime !== undefined) {
      sets.push("routine_start_time = ?");
      values.push(userData.routineStartTime);
    }

    if (userData.nightNotifyTime !== undefined) {
      sets.push("night_notify_time = ?");
      values.push(userData.nightNotifyTime);
    }

    if (sets.length === 0) {
      return await this.getUserById(id);
    }

    values.push(id);
    
    await this.db.runAsync(
      `UPDATE users SET ${sets.join(", ")} WHERE id = ?`,
      values
    );
    
    return await this.getUserById(id);
  }

  /**
   * ユーザーを削除
   */
  public async deleteUser(id: string) {
    await this.db.runAsync("DELETE FROM users WHERE id = ?", [id]);
    return true;
  }
}

// データベースインスタンスをエクスポート
export const db = Database.getInstance(); 