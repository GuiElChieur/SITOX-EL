import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { searchCables, getTableData } from '../../services/database';

export default function CablesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const data = await getTableData('Cables_Z34', 50);
      setResults(data);
    } catch (e) {
      console.log('Error loading initial cables');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return loadInitialData();
    try {
      setLoading(true);
      const matches = await searchCables(searchQuery.trim());
      setResults(matches);
    } catch (e) {
      console.log('Error searching cables');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    let parsedData = {};
    try {
       parsedData = JSON.parse(item.data);
    } catch (e) {}
    
    return (
      <TouchableOpacity 
        className="bg-navy-800 p-4 rounded-xl mb-3 border border-blue-900/30 flex-row items-center justify-between"
        onPress={() => router.push(`/record/Cables_Z34/${item.id}`)}
      >
        <View className="flex-1">
          <Text className="text-white font-bold text-lg mb-1">{item.key_index || (parsedData as any).CBL || 'Unknown CBL'}</Text>
          <Text className="text-gray-400 text-sm" numberOfLines={1}>Type: {(parsedData as any).Type || 'N/A'} - Longueur: {(parsedData as any).Longueur || 'N/A'}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#64748b" />
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-navy-900 pt-16 px-6">
      <View className="mb-6">
        <Text className="text-white text-3xl font-extrabold tracking-wider">Câbles (Z34)</Text>
        <Text className="text-gray-400">Recherche et consultation</Text>
      </View>

      <View className="flex-row items-center bg-navy-800 rounded-xl mb-6 border border-blue-900/50 px-4">
        <MaterialCommunityIcons name="magnify" size={24} color="#64748b" />
        <TextInput 
          className="flex-1 text-white p-3 ml-2"
          placeholder="Search by CBL..."
          placeholderTextColor="#475569"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); loadInitialData(); }}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00a2ff" />
        </View>
      ) : (
        <FlatList 
          data={results}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <MaterialCommunityIcons name="database-remove" size={48} color="#334155" />
              <Text className="text-gray-400 mt-4 text-center">Aucun câble trouvé.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}
