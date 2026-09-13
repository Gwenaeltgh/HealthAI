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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cgu, setCgu] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleRegister = async () => {
    setLocalError('');
    clearError();
    if (!fullName.trim()) return setLocalError('Nom complet requis');
    if (!email.trim()) return setLocalError('Email requis');
    if (password.length < 6) return setLocalError('Mot de passe trop court (6 caractères min)');
    if (password !== confirmPassword) return setLocalError('Les mots de passe ne correspondent pas');
    if (!cgu) return setLocalError('Accepte les CGU pour continuer');

    const [firstName, ...rest] = fullName.trim().split(' ');
    await register({ firstName, lastName: rest.join(' ') || '.', email, password });
    router.replace('/(auth)/onboarding' as any);
  };

  const displayError = localError || error;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#162032" />
          </TouchableOpacity>

          <Text style={styles.title}>Créons ton compte</Text>
          <Text style={styles.subtitle}>Rejoins L'Avocat pour un accompagnement sur-mesure.</Text>

          {displayError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTxt}>{displayError}</Text>
            </View>
          )}

          {/* Fields */}
          <View style={styles.fields}>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                placeholderTextColor="#8A9BA8"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#8A9BA8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mot de passe"
                placeholderTextColor="#8A9BA8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
              />
              <TouchableOpacity onPress={() => setShowPwd(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPwd ? 'eye-outline' : 'eye-off-outline'} size={18} color="#8A9BA8" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#8A9BA8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={18} color="#8A9BA8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* CGU */}
          <TouchableOpacity style={styles.cguRow} onPress={() => setCgu(v => !v)}>
            <View style={[styles.checkbox, cgu && styles.checkboxActive]}>
              {cgu && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </View>
            <Text style={styles.cguTxt}>
              J'accepte les{' '}
              <Text style={styles.cguLink}>CGU</Text>
              {' '}et la{' '}
              <Text style={styles.cguLink}>politique de confidentialité (RGPD).</Text>
            </Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.submitTxt}>Continuer</Text>
            }
          </TouchableOpacity>

          {/* Social */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerTxt}>Ou continue avec</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialTxt}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-apple" size={20} color="#162032" />
              <Text style={styles.socialTxt}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerTxt}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login' as any)}>
              <Text style={styles.footerLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EFF5F3' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40, gap: 16 },

  backBtn: { width: 44, height: 44, justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 34, fontWeight: '800', color: '#162032', fontFamily: 'serif' },
  subtitle: { fontSize: 15, color: '#4A6560', lineHeight: 22, marginBottom: 4 },

  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 12, padding: 12 },
  errorTxt: { fontSize: 13, color: '#B91C1C' },

  fields: { gap: 12 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 16,
    paddingHorizontal: 16, height: 56,
    borderWidth: 1, borderColor: '#DDE8E4',
  },
  input: { flex: 1, fontSize: 15, color: '#162032' },
  eyeBtn: { padding: 4 },

  cguRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: '#C0CFCA',
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxActive: { backgroundColor: '#2EC4B6', borderColor: '#2EC4B6' },
  cguTxt: { flex: 1, fontSize: 13, color: '#4A6560', lineHeight: 20 },
  cguLink: { color: '#2EC4B6', fontWeight: '600' },

  submitBtn: {
    backgroundColor: '#162032', borderRadius: 999,
    paddingVertical: 18, alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitTxt: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#DDE8E4' },
  dividerTxt: { fontSize: 13, color: '#8A9BA8' },

  socialButtons: { gap: 12 },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: 16,
    paddingVertical: 16, borderWidth: 1, borderColor: '#DDE8E4',
  },
  socialIcon: { fontSize: 16, fontWeight: '800', color: '#162032' },
  socialTxt: { fontSize: 15, fontWeight: '600', color: '#162032' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  footerTxt: { fontSize: 14, color: '#4A6560' },
  footerLink: { fontSize: 14, fontWeight: '700', color: '#2EC4B6' },
});
