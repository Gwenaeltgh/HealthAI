import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoMark } from '@/components/logo-mark';
import { useColors } from '@/hooks/use-colors';

function FormRow({ label, value, multiline, last }: { label: string; value: string; multiline?: boolean; last?: boolean }) {
  const colors = useColors();
  const styles = StyleSheet.create({
    formRow: { paddingHorizontal: 16, paddingVertical: 12 },
    formRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    formLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
    formInput: { fontSize: 15, color: colors.text, paddingVertical: 4 },
    formInputMulti: { minHeight: 72 },
  });
  return (
    <View style={[styles.formRow, !last && styles.formRowBorder]}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={[styles.formInput, multiline && styles.formInputMulti]}
        defaultValue={value}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
}

function SelectRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const colors = useColors();
  const styles = StyleSheet.create({
    formRow: { paddingHorizontal: 16, paddingVertical: 12 },
    formRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    rowSelect: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    formLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
    selectRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    selectValue: { fontSize: 14, color: colors.textSecondary },
  });
  return (
    <TouchableOpacity style={[styles.formRow, styles.rowSelect, !last && styles.formRowBorder]}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.selectRight}>
        <Text style={styles.selectValue}>{value}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

export default function EditProfileScreen() {
  const router = useRouter();
  const colors = useColors();

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.headerBg,
      paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    cancelBtn: { width: 80, alignItems: 'flex-start' },
    cancelTxt: { fontSize: 16, color: colors.textSecondary },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: colors.text, fontFamily: 'serif' },
    saveBtn: { width: 80, alignItems: 'flex-end' },
    saveTxt: { fontSize: 16, fontWeight: '700', color: colors.primary },

    scroll: { padding: 20, gap: 8, paddingBottom: 40 },

    avatarSection: { alignItems: 'center', gap: 10, paddingVertical: 12 },
    changePhotoTxt: { fontSize: 14, fontWeight: '600', color: colors.primary },

    sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1, marginTop: 8, paddingHorizontal: 4 },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 16, borderWidth: 1, borderColor: colors.border,
      overflow: 'hidden',
    },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelTxt}>Annuler</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={() => router.back()}>
          <Text style={styles.saveTxt}>Sauvegarder</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.avatarSection}>
          <LogoMark size={80} />
          <TouchableOpacity>
            <Text style={styles.changePhotoTxt}>Modifier la photo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>INFORMATIONS</Text>
        <View style={styles.card}>
          <FormRow label="Nom" value="Sophie Laurent" />
          <FormRow label="Prénom" value="Dr." />
          <FormRow label="Bio" value="Nutritionniste passionnée par la micronutrition et la médecine du sport." multiline last />
        </View>

        <Text style={styles.sectionLabel}>OBJECTIF SANTÉ</Text>
        <View style={styles.card}>
          <SelectRow label="Objectif" value="Perte de poids" />
          <SelectRow label="Poids cible" value="70 kg" />
          <SelectRow label="Niveau activité" value="Modérément actif" last />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
