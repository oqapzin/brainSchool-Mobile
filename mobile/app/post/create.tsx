import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';

export default function CreatePostScreen() {
  const { isTeacher, user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(user?.username || '');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isTeacher) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSave = async () => {
    if (!title.trim() || !author.trim() || !content.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha título, autor e conteúdo.');
      return;
    }

    try {
      setSaving(true);
      await api.post('/posts', {
        title: title.trim(),
        author: author.trim(),
        content: content.trim(),
      });
      Alert.alert('Sucesso', 'Postagem publicada com sucesso!');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Erro ao publicar',
        error.response?.data?.message?.toString() ||
          'Não foi possível criar a postagem.'
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
          placeholder="Ex: Introdução à Física Moderna"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Autor</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do autor"
          value={author}
          onChangeText={setAuthor}
        />

        <Text style={styles.label}>Conteúdo Completo</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Escreva o conteúdo didático do post..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Publicando...' : 'Publicar Postagem'}
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
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
