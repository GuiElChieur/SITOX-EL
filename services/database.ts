import * as SQLite from 'expo-sqlite';

export const initDatabase = async () => {
  const db = await SQLite.openDatabaseAsync('sitox.db');
  
  // Users
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL
    );
  `);
  
  // Default Admin
  await db.runAsync(`INSERT OR IGNORE INTO users (username, password_hash, role) VALUES ('admin', 'admin', 'Administrator')`);

  // FTP Settings
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // We map the expected Z34 files
  const dataTables = [
    'Appareils_Z34',
    'Cables_Z34',
    'Date_MAJ_Z34',
    'Gamme_Z34',
    'Informations_Z34',
    'InfosCBLdivers_Z34',
    'Livraison_Z34',
    'Noeuds_Z34',
    'Routage_Z34',
    'Traversees_Z34',
    'Troncon_Z34'
  ];

  for (const table of dataTables) {
    // We use a dynamic structure: a JSON string payload and key indexes
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${table} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_index TEXT,
        data TEXT NOT NULL,
        last_modified_at TEXT,
        modified_by TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_${table}_key ON ${table}(key_index);
    `);
  }

  // Sync logs
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      user_id TEXT,
      status TEXT NOT NULL,
      details TEXT
    );
  `);

  return db;
};

export const getDb = async () => {
    return await SQLite.openDatabaseAsync('sitox.db');
};

export const searchCables = async (query: string) => {
    const db = await getDb();
    // Using LIKE for partial match on key_index
    return await db.getAllAsync(`SELECT * FROM Cables_Z34 WHERE key_index LIKE ? LIMIT 50`, `%${query}%`);
};

export const searchAppareils = async (query: string) => {
    const db = await getDb();
    return await db.getAllAsync(`SELECT * FROM Appareils_Z34 WHERE key_index LIKE ? LIMIT 50`, `%${query}%`);
};

export const getTableData = async (tableName: string, limit = 100, offset = 0) => {
    const db = await getDb();
    return await db.getAllAsync(`SELECT * FROM ${tableName} ORDER BY id ASC LIMIT ? OFFSET ?`, limit, offset);
};

export const updateRecordData = async (tableName: string, id: number, newData: any, userId: string) => {
    const db = await getDb();
    const now = new Date().toISOString();
    await db.runAsync(`UPDATE ${tableName} SET data = ?, last_modified_at = ?, modified_by = ? WHERE id = ?`, 
      JSON.stringify(newData), now, userId, id
    );
};
