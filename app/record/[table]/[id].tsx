import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDb, updateRecordData } from '../../../services/database';
import { useUserStore } from '../../../store/userStore';

export default function RecordDetailScreen() {
  const { table, id } = useLocalSearchParams<{ table: string; id: string }>();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const hasPermission = useUserStore((state) => state.hasPermission);

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);
  const [dataPayload, setDataPayload] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRecord();
  }, [table, id]);

  const loadRecord = async () => {
    if (!table || !id) return;
    try {
      const db = await getDb();
      const res = await db.getFirstAsync(`SELECT * FROM ${table} WHERE id = ?`, Number(id));
      if (res) {
        setRecord(res);
        try {
          setDataPayload(JSON.parse((res as any).data));
        } catch (e) {}
      }
    } catch (e) {
      console.log('Error fetching detail', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!table || !id || !user) return;
    setSaving(true);
    try {
      await updateRecordData(table, Number(id), dataPayload, user.id);
      Alert.alert('Success', 'Record updated successfully.');
      setIsEditing(false);
      loadRecord();
    } catch (e) {
      Alert.alert('Error', 'Failed to update record.');
    } finally {
      setSaving(false);
    }
  };

  const canEdit = hasPermission('edit') || user?.role === 'Administrator';

  if (loading) {
    return (
      <View className="flex-1 bg-navy-900 justify-center items-center">
        <ActivityIndicator size="large" color="#00a2ff" />
      </View>
    );
  }

  if (!record) {
    return (
      <View className="flex-1 bg-navy-900 justify-center items-center">
        <Text className="text-white text-lg">Record not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 p-3 bg-brand-blue rounded-xl">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-navy-900 pt-16">
      <View className="px-6 flex-row items-center justify-between mb-4 border-b border-navy-800 pb-4">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <MaterialCommunityIcons name="arrow-left" size={28} color="#00a2ff" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-2xl font-extrabold tracking-wider" numberOfLines={1}>{table}</Text>
            <Text className="text-brand-blue text-sm">ID: {id} • Index: {record.key_index}</Text>
          </View>
        </View>
        
        {canEdit && !isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)} className="bg-navy-800 p-2 rounded-lg border border-blue-900/50">
            <MaterialCommunityIcons name="pencil" size={24} color="#00a2ff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="px-6 flex-1 mb-6">
        <View className="bg-navy-800 p-5 rounded-2xl shadow-lg border border-blue-900/30">
          <Text className="text-gray-400 mb-4 pb-2 border-b border-navy-900 font-semibold uppercase tracking-widest">
            {isEditing ? 'Edit Mode Active' : 'Record Details'}
          </Text>

          {Object.keys(dataPayload).map((key) => (
            <View key={key} className="mb-4">
              <Text className="text-gray-400 text-xs mb-1 uppercase tracking-wider">{key}</Text>
              {isEditing ? (
                <TextInput 
                  className="bg-navy-900 text-white p-3 rounded-xl border border-blue-900/50"
                  value={dataPayload[key]}
                  onChangeText={(val) => setDataPayload({...dataPayload, [key]: val})}
                  multiline={dataPayload[key]?.length > 50}
                />
              ) : (
                <Text className="text-white text-lg font-medium">{dataPayload[key] || '—'}</Text>
              )}
            </View>
          ))}
          
          <View className="mt-4 pt-4 border-t border-navy-900">
            <Text className="text-gray-500 text-xs">Last Modified: {record.last_modified_at || 'Never'}</Text>
            <Text className="text-gray-500 text-xs">Modified By: {record.modified_by || 'System'}</Text>
          </View>
        </View>

        {isEditing && (
          <View className="flex-row justify-between mt-4">
            <TouchableOpacity 
              className="flex-1 mr-2 bg-navy-800 border border-gray-600 p-4 rounded-xl items-center"
              onPress={() => { setIsEditing(false); loadRecord(); }}
              disabled={saving}
            >
              <Text className="text-gray-300 font-bold">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 ml-2 bg-brand-blue p-4 rounded-xl items-center flex-row justify-center shadow-lg shadow-blue-500/30"
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" className="mr-2" /> : <MaterialCommunityIcons name="content-save" size={20} color="#fff" className="mr-2" />}
              <Text className="text-white font-bold">{saving ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
