import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Redirect, useFocusEffect } from 'expo-router';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PaginatedUsers, UserItem, UserRole } from '../types';

interface UserCrudScreenProps {
  role: UserRole;
  singularLabel: string;
  pluralLabel: string;
}

export const UserCrudScreen: React.FC<UserCrudScreenProps> = ({
  role,
  singularLabel,
  pluralLabel,
}) => {
  const { isTeacher } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async (targetPage = page) => {
    try {
      setLoading(true);
      const response = await api.get<PaginatedUsers>(
        `/users?role=${role}&page=${targetPage}&limit=6`
      );
      setUsers(response.data.data);
      setPage(response.data.page);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.message?.toString() ||
          `Não foi possível carregar a lista de ${pluralLabel.toLowerCase()}.`
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isTeacher) {
        fetchUsers(1);
      }
    }, [isTeacher, role])
  );

  if (!isTeacher) {
    return <Redirect href="/(tabs)" />;
  }

  const openCreateModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setModalVisible(true);
  };

  const openEditModal = (item: UserItem) => {
    setEditingUser(item);
    setUsername(item.username);
    setPassword('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Validação', 'O nome de usuário é obrigatório.');
      return;
    }

    if (!editingUser && password.trim().length < 6) {
      Alert.alert('Validação', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (editingUser && password.trim().length > 0 && password.trim().length < 6) {
      Alert.alert('Validação', 'A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingUser) {
        const payload: { username: string; role: UserRole; password?: string } = {
          username: username.trim(),
          role,
        };
        if (password.trim()) {
          payload.password = password.trim();
        }
        await api.put(`/users/${editingUser.id}`, payload);
      } else {
        await api.post('/users', {
          username: username.trim(),
          password: password.trim(),
          role,
        });
      }
      setModalVisible(false);
      fetchUsers(page);
    } catch (error: any) {
      Alert.alert(
        'Erro ao salvar',
        error.response?.data?.message?.toString() || 'Não foi possível salvar o registro.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (item: UserItem) => {
    Alert.alert(
      `Excluir ${singularLabel}`,
      `Deseja realmente excluir "${item.username}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/users/${item.id}`);
              fetchUsers(page);
            } catch (error: any) {
              Alert.alert(
                'Erro',
                error.response?.data?.message?.toString() || 'Falha ao excluir.'
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
          <Text style={styles.title}>Gestão de {pluralLabel}</Text>
          <Text style={styles.subtitle}>Total cadastrado: {total}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
          <Text style={styles.addBtnText}>+ Novo {singularLabel}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhum {singularLabel.toLowerCase()} encontrado.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.username}>@{item.username}</Text>
                <Text style={styles.meta}>
                  ID #{item.id} • Criado em{' '}
                  {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => openEditModal(item)}
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

      <View style={styles.paginationBar}>
        <TouchableOpacity
          style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
          disabled={page <= 1}
          onPress={() => fetchUsers(page - 1)}
        >
          <Text style={styles.pageBtnText}>Anterior</Text>
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>
          Página {page} de {totalPages}
        </Text>

        <TouchableOpacity
          style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
          disabled={page >= totalPages}
          onPress={() => fetchUsers(page + 1)}
        >
          <Text style={styles.pageBtnText}>Próxima</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingUser
                ? `Editar ${singularLabel}`
                : `Cadastrar ${singularLabel}`}
            </Text>

            <Text style={styles.label}>Nome de Usuário</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: maria.silva"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />

            <Text style={styles.label}>
              {editingUser
                ? 'Nova Senha (deixe em branco para manter)'
                : 'Senha (mín. 6 caracteres)'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="******"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={submitting}
              >
                <Text style={styles.saveBtnText}>
                  {submitting ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
  addBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: { flex: 1, marginRight: 10 },
  username: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  meta: { fontSize: 12, color: '#64748B', marginTop: 4 },
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
  paginationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  pageBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pageBtnDisabled: { backgroundColor: '#CBD5E1' },
  pageBtnText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  pageIndicator: { fontSize: 13, fontWeight: '600', color: '#334155' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  cancelBtnText: { color: '#334155', fontWeight: '600' },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#16A34A',
  },
  saveBtnText: { color: '#FFF', fontWeight: '700' },
});
