import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '../store/userStore';
import { initDatabase, getDb } from '../services/database';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const login = useUserStore((state) => state.login);

  useEffect(() => {
    // Database initialization occurs at startup
    const setup = async () => {
      try {
        await initDatabase();
        setLoading(false);
      } catch (e) {
        Alert.alert('Initialization Error', 'Failed to load database.');
        setLoading(false);
      }
    };
    setup();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password.');
      return;
    }
    
    try {
      const db = await getDb();
      const user = await db.getFirstAsync<{id: number, username: string, role: string}>(
        'SELECT * FROM users WHERE username = ? AND password_hash = ?',
        username, password
      );
      
      if (user) {
        login(user.username, user.role as any);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Invalid credentials.');
      }
    } catch (e) {
      Alert.alert('Error', 'Login failed.');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-navy-900 justify-center items-center">
        <Text className="text-brand-blue text-2xl font-bold">SITOX Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-navy-900 justify-center px-8">
      <View className="mb-12">
        <Text className="text-white text-5xl font-extrabold tracking-widest text-center mb-2">SITOX</Text>
        <Text className="text-gray-400 text-center text-lg">System Dashboard</Text>
      </View>
      
      <View className="bg-navy-800 p-6 rounded-2xl border border-blue-900/30">
        <Text className="text-white mb-2 font-semibold">Username</Text>
        <TextInput 
          className="bg-navy-900 text-white p-4 rounded-xl mb-4 border border-blue-900/50"
          placeholder="admin"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        
        <Text className="text-white mb-2 font-semibold">Password</Text>
        <TextInput 
          className="bg-navy-900 text-white p-4 rounded-xl mb-8 border border-blue-900/50"
          placeholder="••••••••"
          placeholderTextColor="#64748b"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity 
          className="bg-brand-blue p-4 rounded-xl items-center shadow-lg"
          onPress={handleLogin}
        >
          <Text className="text-white font-bold text-lg">Access System</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
