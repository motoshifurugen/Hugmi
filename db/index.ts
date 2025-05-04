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
      
      // 引用テーブルの作成
      this.db.execAsync(
        `CREATE TABLE IF NOT EXISTS quotes (
          id TEXT PRIMARY KEY,
          text_ja TEXT NOT NULL,
          text_en TEXT,
          author_name TEXT,
          era TEXT,
          is_published BOOLEAN DEFAULT 1,
          image_path TEXT
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
    const sets: string[] = [];
    const values: any[] = [];

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

  /**
   * すべての引用を取得
   */
  public async getAllQuotes() {
    const result = await this.db.getAllAsync<{
      id: string;
      text_ja: string;
      text_en: string;
      author_name: string;
      era: string;
      is_published: number;
      image_path: string;
    }>("SELECT * FROM quotes");
    return result;
  }

  /**
   * 公開されている引用のみ取得
   */
  public async getPublishedQuotes() {
    const result = await this.db.getAllAsync<{
      id: string;
      text_ja: string;
      text_en: string;
      author_name: string;
      era: string;
      is_published: number;
      image_path: string;
    }>("SELECT * FROM quotes WHERE is_published = 1");
    return result;
  }

  /**
   * IDで引用を取得
   */
  public async getQuoteById(id: string) {
    const result = await this.db.getAllAsync<{
      id: string;
      text_ja: string;
      text_en: string;
      author_name: string;
      era: string;
      is_published: number;
      image_path: string;
    }>("SELECT * FROM quotes WHERE id = ?", [id]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * ランダムな引用を1つ取得
   */
  public async getRandomQuote() {
    const result = await this.db.getAllAsync<{
      id: string;
      text_ja: string;
      text_en: string;
      author_name: string;
      era: string;
      is_published: number;
      image_path: string;
    }>("SELECT * FROM quotes WHERE is_published = 1 ORDER BY RANDOM() LIMIT 1");
    return result.length > 0 ? result[0] : null;
  }

  /**
   * 新しい引用を作成
   */
  public async createQuote(quoteData: {
    id: string;
    textJa: string;
    textEn?: string;
    authorName?: string;
    era?: string;
    isPublished?: boolean;
    imagePath?: string;
  }) {
    await this.db.runAsync(
      `INSERT INTO quotes (id, text_ja, text_en, author_name, era, is_published, image_path) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        quoteData.id,
        quoteData.textJa,
        quoteData.textEn || null,
        quoteData.authorName || null,
        quoteData.era || null,
        quoteData.isPublished !== undefined ? (quoteData.isPublished ? 1 : 0) : 1,
        quoteData.imagePath || null
      ]
    );
    return await this.getQuoteById(quoteData.id);
  }

  /**
   * 引用情報を更新
   */
  public async updateQuote(
    id: string,
    quoteData: {
      textJa?: string;
      textEn?: string;
      authorName?: string;
      era?: string;
      isPublished?: boolean;
      imagePath?: string;
    }
  ) {
    const sets: string[] = [];
    const values: any[] = [];

    if (quoteData.textJa !== undefined) {
      sets.push("text_ja = ?");
      values.push(quoteData.textJa);
    }

    if (quoteData.textEn !== undefined) {
      sets.push("text_en = ?");
      values.push(quoteData.textEn);
    }

    if (quoteData.authorName !== undefined) {
      sets.push("author_name = ?");
      values.push(quoteData.authorName);
    }

    if (quoteData.era !== undefined) {
      sets.push("era = ?");
      values.push(quoteData.era);
    }

    if (quoteData.isPublished !== undefined) {
      sets.push("is_published = ?");
      values.push(quoteData.isPublished ? 1 : 0);
    }

    if (quoteData.imagePath !== undefined) {
      sets.push("image_path = ?");
      values.push(quoteData.imagePath);
    }

    if (sets.length === 0) {
      return await this.getQuoteById(id);
    }

    values.push(id);
    
    await this.db.runAsync(
      `UPDATE quotes SET ${sets.join(", ")} WHERE id = ?`,
      values
    );
    
    return await this.getQuoteById(id);
  }

  /**
   * 引用を削除
   */
  public async deleteQuote(id: string) {
    await this.db.runAsync("DELETE FROM quotes WHERE id = ?", [id]);
    return true;
  }
}

// データベースインスタンスをエクスポート
export const db = Database.getInstance(); 