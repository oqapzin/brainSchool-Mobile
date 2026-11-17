import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Redirect } from 'expo-router';
import { api } from '../../../src/services/api';
import { useAuth } from '../../../src/contexts/AuthContext';
import { PostItem } from '../../../src/types';

export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isTeacher, user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const response = await api.get<PostItem>(`/posts/${id}`);
        if (response.data.author !== user?.username) {
          Alert.alert(
            'Acesso negado',
            'Você só pode editar postagens de sua própria autoria.'
          );
          router.replace('/(tabs)');
          return;
        }
        setTitle(response.data.title);
        setAuthor(response.data.author);
        setContent(response.data.content);
      } catch {
        Alert.alert('Erro', 'Postagem não encontrada.');
        router.back();
      } finally {
        setLoading(false);
      }
    }
    if (isTeacher) {
      loadPost();
    }
  }, [id, isTeacher, user?.username]);

  if (!isTeacher) {
    return <Redirect href="/(tabs)" />;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const handleUpdate = async () => {
    if (!title.trim() || !author.trim() || !content.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha título, autor e conteúdo.');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/posts/${id}`, {
        title: title.trim(),
        author: author.trim(),
        content: content.trim(),
      });
      Alert.alert('Sucesso', 'Postagem atualizada com sucesso!');
      router.replace(`/post/${id}`);
    } catch (error: any) {
      Alert.alert(
        'Erro ao atualizar',
        error.response?.data?.message?.toString() ||
          'Somente o autor original pode alterar esta postagem.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Título da Postagem</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Autor</Text>
        <TextInput
          style={styles.input}
          value={author}
          onChangeText={setAuthor}
        />

        <Text style={styles.label}>Conteúdo Completo</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleUpdate}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Salvando alterações...' : 'Salvar Alterações'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 15,
  },
  textArea: { minHeight: 180, maxHeight: 280 },
  footer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
