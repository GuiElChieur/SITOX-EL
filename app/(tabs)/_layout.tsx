import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0b132b',
          borderTopColor: '#1c2541',
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
          }),
        },
        tabBarActiveTintColor: '#00a2ff',
        tabBarInactiveTintColor: '#64748b',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cables"
        options={{
          title: 'Cables',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cable-data" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appareils"
        options={{
          title: 'Appareils',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="memory" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cog" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
