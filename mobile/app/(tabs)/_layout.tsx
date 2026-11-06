import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';

export default function TabsLayout() {
  const { user, isTeacher, loading } = useAuth();

  if (!loading && !user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#1E293B' },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Postagens',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={String(color)} />
          ),
        }}
      />

      <Tabs.Screen
        name="admin-posts"
        options={{
          title: 'Gestão Posts',
          href: isTeacher ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={String(color)} />
          ),
        }}
      />

      <Tabs.Screen
        name="teachers"
        options={{
          title: 'Professores',
          href: isTeacher ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={String(color)} />
          ),
        }}
      />

      <Tabs.Screen
        name="students"
        options={{
          title: 'Estudantes',
          href: isTeacher ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}
