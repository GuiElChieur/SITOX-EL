import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { useUserStore } from '../../store/userStore';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  const handleCardPress = (route: any) => {
    router.push(route);
  };

  return (
    <View className="flex-1 bg-navy-900 pt-16 px-6">
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-white text-3xl font-extrabold tracking-wider">SITOX</Text>
          <Text className="text-gray-400">Welcome, {user?.username} ({user?.role})</Text>
        </View>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <MaterialCommunityIcons name="logout" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <Text className="text-white text-xl font-bold mb-4">Operations</Text>
        
        <View className="flex-row flex-wrap justify-between">
          {/* Cable Search Card */}
          <TouchableOpacity 
            className="w-[48%] bg-navy-800 rounded-2xl p-4 mb-4 border border-blue-900/30 items-center justify-center shadow-lg"
            onPress={() => handleCardPress('/(tabs)/cables')}
            style={{ aspectRatio: 1 }}
          >
            <View className="bg-brand-blue/20 p-4 rounded-full mb-3">
              <MaterialCommunityIcons name="cable-data" size={36} color="#00a2ff" />
            </View>
            <Text className="text-white font-bold text-center">Info Câbles</Text>
          </TouchableOpacity>

          {/* Device Search Card */}
          <TouchableOpacity 
            className="w-[48%] bg-navy-800 rounded-2xl p-4 mb-4 border border-blue-900/30 items-center justify-center shadow-lg"
            onPress={() => handleCardPress('/(tabs)/appareils')}
            style={{ aspectRatio: 1 }}
          >
            <View className="bg-brand-blue/20 p-4 rounded-full mb-3">
              <MaterialCommunityIcons name="memory" size={36} color="#00a2ff" />
            </View>
            <Text className="text-white font-bold text-center">Info APP</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-white text-xl font-bold mb-4 mt-6">Administration</Text>
        
        <View className="flex-row flex-wrap justify-between">
          {/* FTP Settings Card */}
          <TouchableOpacity 
            className="w-[48%] bg-navy-800 rounded-2xl p-4 mb-4 border border-blue-900/30 items-center justify-center shadow-lg"
            onPress={() => handleCardPress('/(tabs)/admin')}
            style={{ aspectRatio: 1 }}
          >
            <View className="bg-brand-blue/20 p-4 rounded-full mb-3">
              <MaterialCommunityIcons name="cloud-sync" size={36} color="#00a2ff" />
            </View>
            <Text className="text-white font-bold text-center">FTP Sync</Text>
          </TouchableOpacity>
          
          {/* Workflow Card */}
          <TouchableOpacity 
            className="w-[48%] bg-navy-800 rounded-2xl p-4 mb-4 border border-blue-900/30 items-center justify-center shadow-lg"
            style={{ aspectRatio: 1 }}
          >
            <View className="bg-gray-800 p-4 rounded-full mb-3">
              <MaterialCommunityIcons name="sitemap" size={36} color="#9ca3af" />
            </View>
            <Text className="text-gray-400 font-bold text-center">Workflow</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
