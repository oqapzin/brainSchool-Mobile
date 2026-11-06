import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Redirect, useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';
import { PostItem } from '../../src/types';

export default function AdminPostsScreen() {
  const { isTeacher } = useAuth();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get<PostItem[]>('/posts');
      setPosts(response.data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as postagens.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isTeacher) {
        fetchPosts();
      }
    }, [isTeacher])
  );

  if (!isTeacher) {
    return <Redirect href="/(tabs)" />;
  }

  const handleDelete = (item: PostItem) => {
    Alert.alert(
      'Excluir Postagem',
      `Confirma a exclusão da postagem "${item.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/posts/${item.id}`);
              fetchPosts();
            } catch (error: any) {
              Alert.alert(
                'Erro ao excluir',
                error.response?.data?.message?.toString() ||
                  'Apenas o autor original pode alterar ou excluir esta postagem.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Administração de Posts</Text>
          <Text style={styles.subtitle}>Total: {posts.length} publicações</Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push('/post/create')}
        >
          <Text style={styles.createBtnText}>+ Criar Post</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma postagem cadastrada.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postMeta}>
                  Autor: {item.author} •{' '}
                  {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => router.push(`/post/edit/${item.id}`)}
                >
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.actionText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  createBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  card: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: { flex: 1, marginRight: 10 },
  postTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  postMeta: { fontSize: 12, color: '#64748B', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionText: { color: '#FFF', fontWeight: '600', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 40 },
});
