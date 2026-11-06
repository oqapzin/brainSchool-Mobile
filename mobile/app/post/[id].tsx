import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';
import { CommentItem, PostItem } from '../../src/types';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<PostItem | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { isTeacher, user } = useAuth();
  const router = useRouter();

  const loadPostAndComments = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.get<PostItem>(`/posts/${id}`),
        api.get<CommentItem[]>(`/posts/${id}/comments`),
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os dados da postagem.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostAndComments();
  }, [id]);

  const handleDeletePost = () => {
    Alert.alert('Excluir Postagem', 'Deseja realmente excluir esta postagem?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/posts/${id}`);
            router.replace('/(tabs)');
          } catch (error: any) {
            Alert.alert(
              'Erro',
              error.response?.data?.message?.toString() ||
                'Somente o autor da postagem pode excluí-la.'
            );
          }
        },
      },
    ]);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.post(`/posts/${id}/comments`, { content: newComment.trim() });
      setNewComment('');
      loadPostAndComments();
    } catch {
      Alert.alert('Erro', 'Não foi possível publicar o comentário.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(`/comments/${commentId}`);
      loadPostAndComments();
    } catch {
      Alert.alert('Erro', 'Não foi possível excluir este comentário.');
    }
  };

  if (loading || !post) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.meta}>
        Por {post.author} • Publicado em{' '}
        {new Date(post.createdAt).toLocaleDateString('pt-BR')}
      </Text>

      {isTeacher && (
        <View style={styles.adminActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/post/edit/${post.id}`)}
          >
            <Text style={styles.btnText}>Editar Postagem</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeletePost}>
            <Text style={styles.btnText}>Excluir Postagem</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>Comentários ({comments.length})</Text>

        {comments.map((c) => {
          const canDeleteComment = isTeacher || c.author?.id === user?.id;
          return (
            <View key={c.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>@{c.author?.username}</Text>
                {canDeleteComment && (
                  <TouchableOpacity onPress={() => handleDeleteComment(c.id)}>
                    <Text style={styles.deleteCommentText}>Excluir</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.commentText}>{c.content}</Text>
            </View>
          );
        })}

        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentInput}
            placeholder="Escreva um comentário..."
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleAddComment}>
            <Text style={styles.btnText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  meta: { fontSize: 13, color: '#64748B', marginTop: 6, marginBottom: 16 },
  adminActions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  editBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  btnText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  content: { fontSize: 16, lineHeight: 26, color: '#1E293B', marginBottom: 32 },
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0F172A',
  },
  commentCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: { fontWeight: '700', color: '#2563EB', fontSize: 13 },
  deleteCommentText: { color: '#DC2626', fontSize: 12, fontWeight: '600' },
  commentText: { color: '#334155', fontSize: 14 },
  commentInputRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
  },
  sendBtn: {
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 8,
  },
});
