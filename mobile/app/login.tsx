import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      const msg = 'Preencha seu usuário e senha.';
      setErrorMessage(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Atenção', msg);
      }
      return;
    }

    try {
      setSubmitting(true);
      await signIn(username.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      const rawMsg = error.response?.data?.message;
      const formattedMsg = Array.isArray(rawMsg)
        ? rawMsg.join(' ')
        : rawMsg === 'Credenciais inválidas'
          ? 'Usuário ou senha inválidos. Verifique suas credenciais.'
          : rawMsg || 'Credenciais inválidas ou servidor indisponível.';
      setErrorMessage(String(formattedMsg));
      if (Platform.OS !== 'web') {
        Alert.alert('Erro de Autenticação', String(formattedMsg));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (roleUser: 'professor' | 'aluno') => {
    setErrorMessage(null);
    setUsername(roleUser);
    setPassword('senha123');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>BrainSchool - Blog Escolar</Text>
        <Text style={styles.subtitle}>
          Plataforma de Blog Dinâmico para Docentes e Estudantes
        </Text>

        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <Text style={styles.label}>Usuário</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu usuário"
          autoCapitalize="none"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            if (errorMessage) setErrorMessage(null);
          }}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errorMessage) setErrorMessage(null);
          }}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Acesso Rápido (Seed Padrão):</Text>
          <View style={styles.demoButtons}>
            <TouchableOpacity
              style={styles.demoChip}
              onPress={() => fillCredentials('professor')}
            >
              <Text style={styles.demoChipText}>Docente (professor)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoChip}
              onPress={() => fillCredentials('aluno')}
            >
              <Text style={styles.demoChipText}>Estudante (aluno)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0F172A',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 15,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  demoBox: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  demoTitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 10,
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  demoChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  demoChipText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '600',
  },
});
