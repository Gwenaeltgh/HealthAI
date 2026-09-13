import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth.store';
import { LogoMark } from '@/components/logo-mark';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleLogin = async () => {
    clearError();
    await login({ email, password });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoWrap}>
            <LogoMark size={80} />
            <Text style={styles.logoSub}>HealthAI Coach</Text>
            <Text style={styles.title}>Content de te revoir</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTxt}>{error}</Text>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#8A9BA8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="ton.adresse@email.com"
                  placeholderTextColor="#8A9BA8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#8A9BA8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#8A9BA8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPwd}
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowPwd(v => !v)} style={styles.eyeBtn}>
                  <Ionicons name={showPwd ? 'eye-outline' : 'eye-off-outline'} size={18} color="#8A9BA8" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotWrap}>
              <Text style={styles.forgotTxt}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.submitTxt}>Se connecter  →</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerTxt}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/register' as any)}>
              <Text style={styles.footerLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDF6EE' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 32, gap: 28 },

  logoWrap: { alignItems: 'center', gap: 8 },
  logoSub: { fontSize: 16, color: '#4A6560', fontWeight: '500' },
  title: { fontSize: 30, fontWeight: '800', color: '#162032', fontFamily: 'serif' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24, padding: 24,
    gap: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },

  errorBox: {
    backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12,
  },
  errorTxt: { fontSize: 13, color: '#B91C1C', textAlign: 'center' },

  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#162032' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F4F6F8', borderRadius: 14,
    paddingHorizontal: 14, height: 52,
    borderWidth: 1, borderColor: '#E8ECEF',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#162032' },
  eyeBtn: { padding: 4 },

  forgotWrap: { alignSelf: 'flex-end' },
  forgotTxt: { fontSize: 13, fontWeight: '600', color: '#2EC4B6' },

  submitBtn: {
    backgroundColor: '#162032', borderRadius: 999,
    paddingVertical: 16, alignItems: 'center', marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitTxt: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerTxt: { fontSize: 14, color: '#4A6560' },
  footerLink: { fontSize: 14, fontWeight: '700', color: '#2EC4B6' },
});
