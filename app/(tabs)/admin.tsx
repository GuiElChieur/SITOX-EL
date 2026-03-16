import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { getDb } from '../../services/database';
import { syncFromFTP } from '../../services/syncService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminScreen() {
  const user = useUserStore((state) => state.user);
  const [host, setHost] = useState('');
  const [port, setPort] = useState('21');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remotePath, setRemotePath] = useState('');
  const [filename, setFilename] = useState('Z34.zip');
  
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const db = await getDb();
      const settingsRes = await db.getAllAsync<{key: string, value: string}>('SELECT * FROM settings');
      settingsRes.forEach(s => {
        if (s.key === 'host') setHost(s.value);
        if (s.key === 'port') setPort(s.value);
        if (s.key === 'username') setUsername(s.value);
        if (s.key === 'password') setPassword(s.value);
        if (s.key === 'remotePath') setRemotePath(s.value);
        if (s.key === 'filename') setFilename(s.value);
      });
    } catch (e) {
      console.log('Error loading settings', e);
    }
  };

  const saveSettings = async () => {
    try {
      const db = await getDb();
      const stmt = await db.prepareAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
      await stmt.executeAsync(['host', host]);
      await stmt.executeAsync(['port', port]);
      await stmt.executeAsync(['username', username]);
      await stmt.executeAsync(['password', password]);
      await stmt.executeAsync(['remotePath', remotePath]);
      await stmt.executeAsync(['filename', filename]);
      await stmt.finalizeAsync();
      Alert.alert('Success', 'FTP Settings saved.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  const startSync = async () => {
    if (!user) return;
    setSyncing(true);
    setSyncStatus('Starting...');
    try {
      await syncFromFTP(user.id, (progress) => {
        setSyncStatus(progress);
      });
      Alert.alert('Success', 'Database updated from FTP.');
    } catch (e: any) {
      Alert.alert('Sync Failed', e.message);
    } finally {
      setSyncing(false);
      setSyncStatus('');
    }
  };

  if (user?.role !== 'Administrator') {
    return (
      <View className="flex-1 bg-navy-900 justify-center items-center">
        <MaterialCommunityIcons name="lock" size={64} color="#ef4444" />
        <Text className="text-white text-xl mt-4 font-bold">Access Denied</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-navy-900 pt-16">
      <View className="px-6 pb-4 border-b border-navy-800 mb-4">
        <Text className="text-white text-3xl font-extrabold tracking-wider">Administration</Text>
        <Text className="text-gray-400">FTP Configuration & Logs</Text>
      </View>

      <ScrollView className="px-6 flex-1 mb-20">
        <View className="bg-navy-800 p-6 rounded-2xl mb-6 shadow-lg border border-blue-900/30">
          <Text className="text-white font-bold text-lg mb-4 flex-row items-center">
            <MaterialCommunityIcons name="server-network" size={20} color="#00a2ff" /> FTP Settings
          </Text>
          
          <Text className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Host / IP</Text>
          <TextInput 
            className="bg-navy-900 text-white p-3 rounded-xl mb-4 border border-blue-900/50"
            value={host} onChangeText={setHost} placeholder="ftp.example.com" placeholderTextColor="#475569"
          />

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Username</Text>
              <TextInput 
                className="bg-navy-900 text-white p-3 rounded-xl border border-blue-900/50"
                value={username} onChangeText={setUsername} autoCapitalize="none"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Password</Text>
              <TextInput 
                className="bg-navy-900 text-white p-3 rounded-xl border border-blue-900/50"
                value={password} onChangeText={setPassword} secureTextEntry
              />
            </View>
          </View>

          <View className="flex-row justify-between mb-6">
            <View className="flex-1 mr-2">
              <Text className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Path</Text>
              <TextInput 
                className="bg-navy-900 text-white p-3 rounded-xl border border-blue-900/50"
                value={remotePath} onChangeText={setRemotePath} placeholder="/upload" placeholderTextColor="#475569"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Filename</Text>
              <TextInput 
                className="bg-navy-900 text-white p-3 rounded-xl border border-blue-900/50"
                value={filename} onChangeText={setFilename} placeholder="Z34.zip" placeholderTextColor="#475569"
              />
            </View>
          </View>

          <TouchableOpacity 
            className="bg-navy-900 border border-brand-blue p-3 rounded-xl items-center"
            onPress={saveSettings}
          >
            <Text className="text-brand-blue font-bold">Save Configuration</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-navy-800 p-6 rounded-2xl mb-8 shadow-lg border border-blue-900/30">
          <Text className="text-white font-bold text-lg mb-4">Data Synchronization</Text>
          
          <TouchableOpacity 
            className={`p-4 rounded-xl items-center flex-row justify-center ${syncing ? 'bg-gray-700' : 'bg-brand-blue'}`}
            onPress={startSync}
            disabled={syncing}
          >
            {syncing ? <ActivityIndicator color="#fff" className="mr-2" /> : <MaterialCommunityIcons name="cloud-download" size={24} color="#fff" className="mr-2" />}
            <Text className="text-white font-bold text-lg">{syncing ? 'Syncing...' : 'Update Database'}</Text>
          </TouchableOpacity>

          {syncStatus ? (
            <Text className="text-brand-blue mt-4 text-center font-semibold">{syncStatus}</Text>
          ) : null}
        </View>

      </ScrollView>
    </View>
  );
}
