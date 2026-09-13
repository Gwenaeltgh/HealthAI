import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';

function SubHeader({ title }: { title: string }) {
  const router = useRouter();
  const colors = useColors();
  const sh = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.headerBg, paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '600', color: colors.text, fontFamily: 'serif' },
    right: { width: 44, height: 44 },
  });
  return (
    <View style={sh.header}>
      <TouchableOpacity onPress={() => router.back()} style={sh.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={sh.title}>{title}</Text>
      <View style={sh.right} />
    </View>
  );
}

function SettingsRow({ label, value, onPress, last }: { label: string; value?: string; onPress?: () => void; last?: boolean }) {
  const colors = useColors();
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingVertical: 14,
    },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    rowLabel: { fontSize: 15, color: colors.text },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    rowValue: { fontSize: 13, color: colors.textSecondary },
  });
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {onPress && <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />}
      </View>
    </TouchableOpacity>
  );
}

function ToggleRow({ label, value, onChange, last }: { label: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  const colors = useColors();
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingVertical: 14,
    },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    rowLabel: { fontSize: 15, color: colors.text },
  });
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.outlineVariant, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { logout } = useAuthStore();
  const [appleHealth, setAppleHealth] = useState(false);
  const [googleFit, setGoogleFit] = useState(false);
  const [mealReminders, setMealReminders] = useState(true);
  const [communityActivity, setCommunityActivity] = useState(true);
  const [aiTips, setAiTips] = useState(true);

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: 16, gap: 8, paddingBottom: 40 },

    sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1, marginTop: 8, paddingHorizontal: 4 },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 16, borderWidth: 1, borderColor: colors.border,
      overflow: 'hidden',
    },
    proCard: {
      backgroundColor: `${colors.primary}10`,
      borderColor: `${colors.primary}40`,
      padding: 20, gap: 6,
    },
    proTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
    proSub: { fontSize: 13, color: colors.textSecondary },
    proManage: { fontSize: 14, fontWeight: '600', color: colors.primary, marginTop: 4 },

    logoutBtn: { alignItems: 'center', marginTop: 16, paddingVertical: 16 },
    logoutTxt: { fontSize: 16, fontWeight: '600', color: colors.error },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SubHeader title="Paramètres" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionLabel}>COMPTE</Text>
        <View style={styles.card}>
          <SettingsRow label="Modifier mon profil" onPress={() => router.push('/edit-profile')} />
          <SettingsRow label="Objectifs et santé" onPress={() => {}} last />
        </View>

        <Text style={styles.sectionLabel}>PRÉFÉRENCES</Text>
        <View style={styles.card}>
          <SettingsRow label="Unités" value="Métriques (kg, cm)" onPress={() => {}} />
          <SettingsRow label="Langue" value="Français" onPress={() => {}} />
          <SettingsRow label="Thème" value="Clair" onPress={() => {}} last />
        </View>

        <Text style={styles.sectionLabel}>CONNEXIONS</Text>
        <View style={styles.card}>
          <ToggleRow label="Apple Santé" value={appleHealth} onChange={setAppleHealth} />
          <ToggleRow label="Google Fit" value={googleFit} onChange={setGoogleFit} last />
        </View>

        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <ToggleRow label="Rappels repas" value={mealReminders} onChange={setMealReminders} />
          <ToggleRow label="Activité communautaire" value={communityActivity} onChange={setCommunityActivity} />
          <ToggleRow label="Conseils IA" value={aiTips} onChange={setAiTips} last />
        </View>

        <Text style={styles.sectionLabel}>ABONNEMENT</Text>
        <View style={[styles.card, styles.proCard]}>
          <Text style={styles.proTitle}>HealthAI Pro</Text>
          <Text style={styles.proSub}>Actif jusqu'au 15 jan 2026</Text>
          <TouchableOpacity>
            <Text style={styles.proManage}>Gérer l'abonnement</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>AIDE & SUPPORT</Text>
        <View style={styles.card}>
          <SettingsRow label="FAQ" onPress={() => {}} />
          <SettingsRow label="Contacter le support" onPress={() => {}} />
          <SettingsRow label="À propos" onPress={() => {}} last />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/(auth)/welcome' as any); }}>
          <Text style={styles.logoutTxt}>Se déconnecter</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
