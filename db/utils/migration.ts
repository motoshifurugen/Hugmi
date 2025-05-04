import { db } from '../';

/**
 * データベースのスキーマを新しいバージョンに移行する
 * 新しいカラム構造を確認し、必要に応じて修正を行います
 */
export const migrateToNewSchema = async (): Promise<boolean> => {
  try {
    const database = db.getDatabase();
    
    console.log('スキーマ確認を開始します...');
    
    // author_ja カラムが既に存在するか確認
    const hasAuthorJa = await hasColumn('quotes', 'author_ja');
    if (hasAuthorJa) {
      console.log('既に新しいスキーマが適用されています。');
      return true;
    }
    
    // トランザクションを開始
    await database.runAsync('BEGIN TRANSACTION');
    
    try {
      // author_ja と author_en カラムを追加
      await database.runAsync('ALTER TABLE quotes ADD COLUMN author_ja TEXT');
      await database.runAsync('ALTER TABLE quotes ADD COLUMN author_en TEXT');
      
      console.log('スキーマの更新が完了しました。');
      
      // トランザクションをコミット
      await database.runAsync('COMMIT');
      return true;
    } catch (error) {
      // エラーが発生した場合はロールバック
      await database.runAsync('ROLLBACK');
      console.error('スキーマ更新中にエラーが発生しました:', error);
      return false;
    }
  } catch (error) {
    console.error('マイグレーション実行中にエラーが発生しました:', error);
    return false;
  }
};

/**
 * 指定されたテーブルに特定のカラムが存在するかをチェック
 */
const hasColumn = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    const database = db.getDatabase();
    const result = await database.getAllAsync<{name: string}>(
      `PRAGMA table_info(${tableName})`
    );
    return result.some(column => column.name === columnName);
  } catch (error) {
    console.error(`テーブル ${tableName} のカラム ${columnName} の確認中にエラーが発生しました:`, error);
    return false;
  }
}; 