import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';
import { PostItem } from '../../src/types';

export default function HomeScreen() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isTeacher, user, signOut } = useAuth();
  const router = useRouter();

  const fetchPosts = async (query = '') => {
    if (!user) return;
    try {
      const endpoint = query.trim()
        ? `/posts/search?q=${encodeURIComponent(query.trim())}`
        : '/posts';
      const response = await api.get<PostItem[]>(endpoint);
      setPosts(response.data);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.warn('Falha ao buscar postagens:', error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchPosts(searchQuery);
      }
    }, [searchQuery, user])
  );

  return (
    <View style={styles.container}>
      <View style={styles.userBanner}>
        <View>
          <Text style={styles.greeting}>Olá, @{user?.username}</Text>
          <Text style={styles.roleText}>
            Perfil: {isTeacher ? 'Docente (Acesso Total)' : 'Estudante (Leitura)'}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar posts por palavra-chave..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          fetchPosts(text);
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchPosts(searchQuery);
              }}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhuma postagem encontrada.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/post/${item.id}`)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardAuthor}>
                Autor: {item.author} •{' '}
                {new Date(item.createdAt).toLocaleDateString('pt-BR')}
              </Text>
              <Text style={styles.cardDescription} numberOfLines={3}>
                {item.content}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {isTeacher && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/post/create')}
        >
          <Text style={styles.fabText}>+ Novo Post</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  userBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  greeting: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  roleText: { fontSize: 12, color: '#2563EB', marginTop: 2, fontWeight: '600' },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
  searchInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    fontSize: 15,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  cardAuthor: {
    fontSize: 12,
    color: '#2563EB',
    marginVertical: 6,
    fontWeight: '600',
  },
  cardDescription: { fontSize: 14, color: '#475569', lineHeight: 20 },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 40 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 4,
  },
  fabText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
