import * as FileSystem from 'expo-file-system';
import JSZip from 'jszip';
import FTP from 'react-native-ftp';
import { getDb } from './database';

export const syncFromFTP = async (userId: string, onProgress: (progress: string) => void) => {
    try {
        const db = await getDb();
        
        onProgress('Fetching FTP Settings...');
        const settingsRes = await db.getAllAsync<{key: string, value: string}>('SELECT key, value FROM settings');
        const settings = settingsRes.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as any);
        
        if (!settings.host || !settings.username || !settings.password || !settings.remotePath || !settings.filename) {
            throw new Error('FTP Configuration is incomplete.');
        }

        const localZipUri = FileSystem.documentDirectory + 'sync.zip';

        onProgress('Connecting to FTP...');
        // Note: react-native-ftp API may vary. Typical usage:
        FTP.setup(settings.host, parseInt(settings.port || '21'));
        await FTP.login(settings.username, settings.password);
        
        onProgress('Downloading ZIP...');
        await FTP.downloadFile(settings.remotePath + '/' + settings.filename, localZipUri);
        
        onProgress('Disconnecting FTP...');
        await FTP.logout();

        onProgress('Reading ZIP file...');
        const zipData = await FileSystem.readAsStringAsync(localZipUri, { encoding: FileSystem.EncodingType.Base64 });
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(zipData, { base64: true });
        
        onProgress('Extracting and Parsing files...');
        
        // Ensure atomic update per file or globally.
        for (const filename of Object.keys(unzipped.files)) {
            if (filename.endsWith('.txt') && !filename.includes('__MACOSX')) {
                const tableName = filename.replace('.txt', '').trim();
                
                // Read text
                const text = await unzipped.files[filename].async('text');
                const parsed = parseTextData(text);
                
                if (parsed.length > 0) {
                    onProgress(`Updating ${tableName}...`);
                    await importToDatabase(db, tableName, parsed, userId);
                }
            }
        }

        onProgress('Finalizing sync log...');
        await logSync(db, userId, 'SUCCESS', 'Synchronization completed successfully.');

        // Clean up
        await FileSystem.deleteAsync(localZipUri, { idempotent: true });

        return true;
    } catch (error) {
        onProgress(`Error: ${error.message}`);
        const db = await getDb();
        await logSync(db, userId, 'FAILED', error.message);
        throw error;
    }
};

const parseTextData = (text: string) => {
    // Determine delimiter (tab or semicolon usually in such enterprise files)
    const delimiter = text.includes('\t') ? '\t' : (text.includes(';') ? ';' : ',');
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(delimiter).map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter);
        let row: any = {};
        for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = values[j] ? values[j].trim() : '';
        }
        data.push(row);
    }
    
    return data;
};

const importToDatabase = async (db: any, tableName: string, data: any[], userId: string) => {
    // Truncate existing data to overwrite with newest logic requested.
    await db.execAsync(`DELETE FROM ${tableName}`);
    
    // Determine the key_index field based on table
    let keyField = '';
    if (tableName === 'Cables_Z34') keyField = 'CBL';
    if (tableName === 'Appareils_Z34') keyField = 'APP';

    // Batch insert
    const stmt = await db.prepareAsync(`INSERT INTO ${tableName} (key_index, data, last_modified_at, modified_by) VALUES (?, ?, ?, ?)`);
    const now = new Date().toISOString();

    for (const row of data) {
        const keyIndex = keyField ? row[keyField] : '';
        await stmt.executeAsync([keyIndex, JSON.stringify(row), now, userId]);
    }
    await stmt.finalizeAsync();
};

const logSync = async (db: any, userId: string, status: string, details: string) => {
    await db.runAsync(`INSERT INTO sync_logs (timestamp, user_id, status, details) VALUES (?, ?, ?, ?)`, 
        new Date().toISOString(), userId, status, details
    );
};
