import * as SQLite from 'expo-sqlite';

let database = null;

/**
 * Get or initialize the SQLite database connection.
 * Uses WAL mode for better performance and concurrent reads.
 * Creates indexes on name and phone for faster search queries.
 */
export const getDb = async () => {
  if (database) return database;

  database = await SQLite.openDatabaseAsync('contacts.db');

  // PRAGMA WAL: Tối ưu hiệu suất đọc/ghi đồng thời
  // INDEX: Tăng tốc tìm kiếm trên cột name và phone
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS contacts (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      name  TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT DEFAULT ''
    );

    -- Indexing: tăng tốc tìm kiếm theo tên
    CREATE INDEX IF NOT EXISTS idx_contacts_name
      ON contacts (name);

    -- Indexing: tăng tốc tìm kiếm theo số điện thoại
    CREATE INDEX IF NOT EXISTS idx_contacts_phone
      ON contacts (phone);
  `);

  return database;
};

/**
 * Reset / close the database (dùng cho testing)
 */
export const closeDb = async () => {
  if (database) {
    await database.closeAsync();
    database = null;
  }
};
