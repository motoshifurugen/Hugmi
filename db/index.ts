import * as SQLite from 'expo-sqlite';
import { RoutineStatus } from './utils/routine_logs';
import { MoodType } from './utils/mood_logs';

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
          author_ja TEXT,
          author_en TEXT,
          era TEXT,
          is_published BOOLEAN DEFAULT 1,
          image_path TEXT
        );`
      );
      
      // ルーティンテーブルの作成
      this.db.execAsync(
        `CREATE TABLE IF NOT EXISTS routines (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          "order" INTEGER NOT NULL,
          title TEXT NOT NULL,
          is_active BOOLEAN DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );`
      );
      
      // ルーティンログテーブルの作成
      this.db.execAsync(
        `CREATE TABLE IF NOT EXISTS routine_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          date TEXT NOT NULL,
          routine_id TEXT NOT NULL,
          status TEXT CHECK(status IN ('checked', 'skipped')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (routine_id) REFERENCES routines(id)
        );`
      );
      
      // 気分ログテーブルの作成
      this.db.execAsync(
        `CREATE TABLE IF NOT EXISTS mood_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          date TEXT NOT NULL,
          mood TEXT CHECK(mood IN ('happy', 'tired', 'sad', 'anxious')),
          quote_id TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (quote_id) REFERENCES quotes(id)
        );`
      );
      
      // お気に入り引用テーブルの作成
      this.db.execAsync(
        `CREATE TABLE IF NOT EXISTS favorite_quotes (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          quote_id TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (quote_id) REFERENCES quotes(id)
        );`
      );
      
      // 表示済み引用テーブルの作成
      this.db.execAsync(
        `CREATE TABLE IF NOT EXISTS viewed_quotes (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          quote_id TEXT NOT NULL,
          viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (quote_id) REFERENCES quotes(id)
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
      author_ja: string;
      author_en: string;
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
      author_ja: string;
      author_en: string;
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
      author_ja: string;
      author_en: string;
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
      author_ja: string;
      author_en: string;
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
    authorJa?: string;
    authorEn?: string;
    era?: string;
    isPublished?: boolean;
    imagePath?: string;
  }) {
    await this.db.runAsync(
      `INSERT INTO quotes (id, text_ja, text_en, author_ja, author_en, era, is_published, image_path) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quoteData.id,
        quoteData.textJa,
        quoteData.textEn || null,
        quoteData.authorJa || null,
        quoteData.authorEn || null,
        quoteData.era || null,
        quoteData.isPublished === false ? 0 : 1,
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
      authorJa?: string;
      authorEn?: string;
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

    if (quoteData.authorJa !== undefined) {
      sets.push("author_ja = ?");
      values.push(quoteData.authorJa);
    }

    if (quoteData.authorEn !== undefined) {
      sets.push("author_en = ?");
      values.push(quoteData.authorEn);
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

  /**
   * ユーザーIDに紐づくすべてのルーティンを取得
   */
  public async getRoutinesByUserId(userId: string) {
    const result = await this.db.getAllAsync<{
      id: string;
      user_id: string;
      order: number;
      title: string;
      is_active: number;
      created_at: string;
    }>("SELECT * FROM routines WHERE user_id = ? ORDER BY \"order\" ASC", [userId]);
    return result;
  }

  /**
   * ユーザーIDに紐づく有効なルーティンのみ取得
   */
  public async getActiveRoutinesByUserId(userId: string) {
    const result = await this.db.getAllAsync<{
      id: string;
      user_id: string;
      order: number;
      title: string;
      is_active: number;
      created_at: string;
    }>("SELECT * FROM routines WHERE user_id = ? AND is_active = 1 ORDER BY \"order\" ASC", [userId]);
    return result;
  }

  /**
   * IDでルーティンを取得
   */
  public async getRoutineById(id: string) {
    const result = await this.db.getAllAsync<{
      id: string;
      user_id: string;
      order: number;
      title: string;
      is_active: number;
      created_at: string;
    }>("SELECT * FROM routines WHERE id = ?", [id]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * 新しいルーティンを作成
   */
  public async createRoutine(routineData: {
    id: string;
    userId: string;
    order: number;
    title: string;
    isActive?: boolean;
  }) {
    await this.db.runAsync(
      `INSERT INTO routines (id, user_id, "order", title, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        routineData.id,
        routineData.userId,
        routineData.order,
        routineData.title,
        routineData.isActive !== undefined ? (routineData.isActive ? 1 : 0) : 1
      ]
    );
    return await this.getRoutineById(routineData.id);
  }

  /**
   * ルーティン情報を更新
   */
  public async updateRoutine(
    id: string,
    routineData: {
      order?: number;
      title?: string;
      isActive?: boolean;
    }
  ) {
    const sets: string[] = [];
    const values: any[] = [];

    if (routineData.order !== undefined) {
      sets.push("\"order\" = ?");
      values.push(routineData.order);
    }

    if (routineData.title !== undefined) {
      sets.push("title = ?");
      values.push(routineData.title);
    }

    if (routineData.isActive !== undefined) {
      sets.push("is_active = ?");
      values.push(routineData.isActive ? 1 : 0);
    }

    if (sets.length === 0) {
      return await this.getRoutineById(id);
    }

    values.push(id);
    
    await this.db.runAsync(
      `UPDATE routines SET ${sets.join(", ")} WHERE id = ?`,
      values
    );
    
    return await this.getRoutineById(id);
  }

  /**
   * ルーティンを削除
   */
  public async deleteRoutine(id: string) {
    await this.db.runAsync("DELETE FROM routines WHERE id = ?", [id]);
    return true;
  }

  /**
   * ユーザーのルーティンの順序を一括更新
   */
  public async reorderRoutines(
    userId: string,
    routineOrders: { id: string; order: number }[]
  ) {
    // トランザクションを開始
    await this.db.runAsync("BEGIN TRANSACTION");
    
    try {
      for (const item of routineOrders) {
        await this.db.runAsync(
          "UPDATE routines SET \"order\" = ? WHERE id = ? AND user_id = ?",
          [item.order, item.id, userId]
        );
      }
      
      // トランザクションをコミット
      await this.db.runAsync("COMMIT");
      return true;
    } catch (error) {
      // エラー時はロールバック
      await this.db.runAsync("ROLLBACK");
      console.error("Error reordering routines:", error);
      return false;
    }
  }

  /**
   * 特定の日付のユーザーのルーティンログを取得
   */
  public async getRoutineLogsByDate(userId: string, date: string) {
    const result = await this.db.getAllAsync<{
      id: string;
      user_id: string;
      date: string;
      routine_id: string;
      status: string;
      created_at: string;
    }>("SELECT * FROM routine_logs WHERE user_id = ? AND date = ?", [userId, date]);
    return result;
  }

  /**
   * 特定のルーティンの特定日付のログを取得
   */
  public async getRoutineLogByRoutineAndDate(routineId: string, date: string) {
    const result = await this.db.getAllAsync<{
      id: string;
      user_id: string;
      date: string;
      routine_id: string;
      status: string;
      created_at: string;
    }>("SELECT * FROM routine_logs WHERE routine_id = ? AND date = ?", [routineId, date]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * 特定の期間のユーザーのルーティンログを取得
   */
  public async getRoutineLogsByDateRange(userId: string, startDate: string, endDate: string) {
    const result = await this.db.getAllAsync<{
      id: string;
      user_id: string;
      date: string;
      routine_id: string;
      status: string;
      created_at: string;
    }>("SELECT * FROM routine_logs WHERE user_id = ? AND date >= ? AND date <= ?", 
      [userId, startDate, endDate]);
    return result;
  }

  /**
   * 新しいルーティンログを作成
   */
  public async createRoutineLog(logData: {
    id: string;
    userId: string;
    date: string;
    routineId: string;
    status: RoutineStatus;
  }) {
    await this.db.runAsync(
      `INSERT INTO routine_logs (id, user_id, date, routine_id, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        logData.id,
        logData.userId,
        logData.date,
        logData.routineId,
        logData.status
      ]
    );
    return await this.getRoutineLogById(logData.id);
  }

  /**
   * IDでルーティンログを取得
   */
  public async getRoutineLogById(id: string) {
    const result = await this.db.getAllAsync<{
      id: string;
      user_id: string;
      date: string;
      routine_id: string;
      status: string;
      created_at: string;
    }>("SELECT * FROM routine_logs WHERE id = ?", [id]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * ルーティンログを更新
   */
  public async updateRoutineLog(
    id: string,
    logData: {
      status: RoutineStatus;
    }
  ) {
    await this.db.runAsync(
      "UPDATE routine_logs SET status = ? WHERE id = ?",
      [logData.status, id]
    );
    return await this.getRoutineLogById(id);
  }

  /**
   * ルーティンログを削除
   */
  public async deleteRoutineLog(id: string) {
    await this.db.runAsync("DELETE FROM routine_logs WHERE id = ?", [id]);
    return true;
  }

  /**
   * 特定ルーティンの統計情報を取得（指定した期間内）
   */
  public async getRoutineStats(routineId: string, startDate: string, endDate: string) {
    // 日付の総数を計算（開始日から終了日までの日数）
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 は両端の日を含める
    
    // チェック済みと省略の件数を取得
    const checkedResult = await this.db.getAllAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM routine_logs WHERE routine_id = ? AND date >= ? AND date <= ? AND status = 'checked'",
      [routineId, startDate, endDate]
    );
    
    const skippedResult = await this.db.getAllAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM routine_logs WHERE routine_id = ? AND date >= ? AND date <= ? AND status = 'skipped'",
      [routineId, startDate, endDate]
    );
    
    return {
      total: diffDays,
      checked: checkedResult[0].count,
      skipped: skippedResult[0].count
    };
  }

  /**
   * 特定の日付のユーザーの気分ログを取得
   */
  public async getMoodLogByDate(userId: string, date: string) {
    const result = await this.db.getAllAsync<{
      id: string;
      user_id: string;
      date: string;
      mood: string;
      quote_id: string;
      created_at: string;
    }>("SELECT * FROM mood_logs WHERE user_id = ? AND date = ?", [userId, date]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * 特定の期間のユーザーの気分ログを取得
   */
  public async getMoodLogsByDateRange(userId: string, startDate: string, endDate: string) {
    const result = await this.db.getAllAsync<{
      id: string;
      user_id: string;
      date: string;
      mood: string;
      quote_id: string;
      created_at: string;
    }>("SELECT * FROM mood_logs WHERE user_id = ? AND date >= ? AND date <= ?", 
      [userId, startDate, endDate]);
    return result;
  }

  /**
   * 新しい気分ログを作成
   */
  public async createMoodLog(logData: {
    id: string;
    userId: string;
    date: string;
    mood: MoodType;
    quoteId?: string;
  }) {
    await this.db.runAsync(
      `INSERT INTO mood_logs (id, user_id, date, mood, quote_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        logData.id,
        logData.userId,
        logData.date,
        logData.mood,
        logData.quoteId || null
      ]
    );
    return await this.getMoodLogById(logData.id);
  }

  /**
   * IDで気分ログを取得
   */
  public async getMoodLogById(id: string) {
    const result = await this.db.getAllAsync<{
      id: string;
      user_id: string;
      date: string;
      mood: string;
      quote_id: string;
      created_at: string;
    }>("SELECT * FROM mood_logs WHERE id = ?", [id]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * 気分ログを更新
   */
  public async updateMoodLog(
    id: string,
    logData: {
      mood?: MoodType;
      quoteId?: string;
    }
  ) {
    const sets: string[] = [];
    const values: any[] = [];

    if (logData.mood !== undefined) {
      sets.push("mood = ?");
      values.push(logData.mood);
    }

    if (logData.quoteId !== undefined) {
      sets.push("quote_id = ?");
      values.push(logData.quoteId);
    }

    if (sets.length === 0) {
      return await this.getMoodLogById(id);
    }

    values.push(id);
    
    await this.db.runAsync(
      `UPDATE mood_logs SET ${sets.join(", ")} WHERE id = ?`,
      values
    );
    
    return await this.getMoodLogById(id);
  }

  /**
   * 気分ログを削除
   */
  public async deleteMoodLog(id: string) {
    await this.db.runAsync("DELETE FROM mood_logs WHERE id = ?", [id]);
    return true;
  }

  /**
   * ユーザーの気分の統計情報を取得（指定した期間内）
   */
  public async getMoodStats(userId: string, startDate: string, endDate: string) {
    // 全ての記録数
    const totalResult = await this.db.getAllAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM mood_logs WHERE user_id = ? AND date >= ? AND date <= ?",
      [userId, startDate, endDate]
    );
    
    // 各気分の記録数
    const happyResult = await this.db.getAllAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM mood_logs WHERE user_id = ? AND date >= ? AND date <= ? AND mood = 'happy'",
      [userId, startDate, endDate]
    );
    
    const tiredResult = await this.db.getAllAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM mood_logs WHERE user_id = ? AND date >= ? AND date <= ? AND mood = 'tired'",
      [userId, startDate, endDate]
    );
    
    const sadResult = await this.db.getAllAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM mood_logs WHERE user_id = ? AND date >= ? AND date <= ? AND mood = 'sad'",
      [userId, startDate, endDate]
    );
    
    const anxiousResult = await this.db.getAllAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM mood_logs WHERE user_id = ? AND date >= ? AND date <= ? AND mood = 'anxious'",
      [userId, startDate, endDate]
    );
    
    return {
      total: totalResult[0].count,
      happy: happyResult[0].count,
      tired: tiredResult[0].count,
      sad: sadResult[0].count,
      anxious: anxiousResult[0].count
    };
  }

  /**
   * ユーザーのお気に入り引用を全て取得
   */
  public async getFavoriteQuotesByUserId(userId: string) {
    const result = await this.db.getAllAsync<{
      id: string;
      user_id: string;
      quote_id: string;
      created_at: string;
    }>("SELECT * FROM favorite_quotes WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    return result;
  }

  /**
   * ユーザーのお気に入り引用に関連する引用情報も合わせて取得
   */
  public async getFavoriteQuotesWithDetailsByUserId(userId: string) {
    const result = await this.db.getAllAsync<{
      id: string;
      user_id: string;
      quote_id: string;
      created_at: string;
      text_ja: string;
      text_en: string;
      author_ja: string;
      author_en: string;
      era: string;
      image_path: string;
    }>(`
      SELECT fq.*, q.text_ja, q.text_en, q.author_ja, q.author_en, q.era, q.image_path 
      FROM favorite_quotes fq
      JOIN quotes q ON fq.quote_id = q.id
      WHERE fq.user_id = ?
      ORDER BY fq.created_at DESC
    `, [userId]);
    return result;
  }

  /**
   * 引用がユーザーのお気に入りに入っているか確認
   */
  public async isFavoriteQuote(userId: string, quoteId: string) {
    const result = await this.db.getAllAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM favorite_quotes WHERE user_id = ? AND quote_id = ?",
      [userId, quoteId]
    );
    return result[0].count > 0;
  }

  /**
   * お気に入り引用を追加
   */
  public async addFavoriteQuote(favoriteData: {
    id: string;
    userId: string;
    quoteId: string;
  }) {
    await this.db.runAsync(
      "INSERT INTO favorite_quotes (id, user_id, quote_id) VALUES (?, ?, ?)",
      [favoriteData.id, favoriteData.userId, favoriteData.quoteId]
    );
    
    const result = await this.db.getAllAsync<{
      id: string;
      user_id: string;
      quote_id: string;
      created_at: string;
    }>("SELECT * FROM favorite_quotes WHERE id = ?", [favoriteData.id]);
    
    return result.length > 0 ? result[0] : null;
  }

  /**
   * お気に入り引用を削除（ユーザーIDと引用IDによる指定）
   */
  public async removeFavoriteQuote(userId: string, quoteId: string) {
    await this.db.runAsync(
      "DELETE FROM favorite_quotes WHERE user_id = ? AND quote_id = ?",
      [userId, quoteId]
    );
    return true;
  }

  /**
   * お気に入り引用を削除（IDによる指定）
   */
  public async deleteFavoriteQuoteById(id: string) {
    await this.db.runAsync(
      "DELETE FROM favorite_quotes WHERE id = ?",
      [id]
    );
    return true;
  }

  /**
   * ユーザーがまだ表示していない名言をランダムに1件取得
   */
  public async getUnviewedRandomQuote(userId: string) {
    // ユーザーがすでに表示した名言のIDを取得
    const viewedQuoteIds = await this.db.getAllAsync<{quote_id: string}>(
      "SELECT quote_id FROM viewed_quotes WHERE user_id = ?", 
      [userId]
    );
    
    let query = "SELECT * FROM quotes WHERE is_published = 1";
    const params: any[] = [];
    
    // 表示済みの名言がある場合、それらを除外
    if (viewedQuoteIds.length > 0) {
      const excludeIds = viewedQuoteIds.map(item => `'${item.quote_id}'`).join(', ');
      query += ` AND id NOT IN (${excludeIds})`;
    }
    
    // ランダムに1件取得
    query += " ORDER BY RANDOM() LIMIT 1";
    
    const result = await this.db.getAllAsync<{
      id: string;
      text_ja: string;
      text_en: string;
      author_ja: string;
      author_en: string;
      era: string;
      is_published: number;
      image_path: string;
    }>(query, params);
    
    // 表示されていない名言がない場合（すべて表示済みの場合）は、すべての名言からランダムに1件取得
    if (result.length === 0) {
      return await this.getRandomQuote();
    }
    
    return result[0];
  }

  /**
   * 名言を表示済みとして記録
   */
  public async recordViewedQuote(viewedData: {
    id: string;
    userId: string;
    quoteId: string;
  }) {
    await this.db.runAsync(
      "INSERT INTO viewed_quotes (id, user_id, quote_id) VALUES (?, ?, ?)",
      [viewedData.id, viewedData.userId, viewedData.quoteId]
    );
    
    return true;
  }

  /**
   * ユーザーの表示済み名言をすべて取得
   */
  public async getViewedQuotesByUserId(userId: string) {
    const result = await this.db.getAllAsync<{
      id: string;
      user_id: string;
      quote_id: string;
      viewed_at: string;
    }>("SELECT * FROM viewed_quotes WHERE user_id = ? ORDER BY viewed_at DESC", [userId]);
    
    return result;
  }
}

// データベースインスタンスをエクスポート
export const db = Database.getInstance(); 