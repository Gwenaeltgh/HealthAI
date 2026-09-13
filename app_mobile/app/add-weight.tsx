import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';

const HISTORY = [
  { date: '28 avr.', weight: 74.8 },
  { date: '25 avr.', weight: 75.1 },
  { date: '21 avr.', weight: 75.3 },
];

export default function AddWeightScreen() {
  const router = useRouter();
  const colors = useColors();
  const [weight, setWeight] = useState(74.5);

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const todayLabel = today.charAt(0).toUpperCase() + today.slice(1);

  const adjust = (delta: number) => setWeight(w => Math.round((w + delta) * 10) / 10);

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

    scroll: { padding: 24, gap: 24, paddingBottom: 40, alignItems: 'center' },

    dateLabel: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

    weightBig: { fontSize: 64, fontWeight: '700', color: colors.primary, letterSpacing: -2, textAlign: 'center' },

    incrRow: { flexDirection: 'row', gap: 24 },
    incrBtn: {
      width: 56, height: 56, borderRadius: 28,
      borderWidth: 1.5, borderColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },

    stepper: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    stepBtn: {
      paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
      backgroundColor: colors.surfaceContainer,
      borderWidth: 1, borderColor: colors.border,
    },
    stepBtnTxt: { fontSize: 14, fontWeight: '600', color: colors.text },
    stepCenter: {
      paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
      backgroundColor: `${colors.primary}20`,
      borderWidth: 1, borderColor: `${colors.primary}40`,
    },
    stepCenterVal: { fontSize: 16, fontWeight: '700', color: colors.primary },

    noteSection: { width: '100%', gap: 8 },
    noteLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    noteInput: {
      backgroundColor: colors.surface,
      borderRadius: 12, borderWidth: 1, borderColor: colors.border,
      padding: 14, fontSize: 14, color: colors.text, minHeight: 72,
    },

    historySection: { width: '100%', gap: 12 },
    historyTitle: { fontSize: 16, fontWeight: '600', color: colors.text, fontFamily: 'serif' },
    historyList: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    historyRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    historyDate: { fontSize: 13, color: colors.textSecondary, width: 80 },
    historyWeight: { fontSize: 15, fontWeight: '600', color: colors.text },
    historyDelta: { fontSize: 13, color: colors.textSecondary, width: 60, textAlign: 'right' },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelTxt}>Annuler</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle pesée</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={() => router.back()}>
          <Text style={styles.saveTxt}>Enregistrer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.dateLabel}>{todayLabel}</Text>

        <Text style={styles.weightBig}>{weight.toFixed(1)} kg</Text>

        <View style={styles.incrRow}>
          <TouchableOpacity style={styles.incrBtn} onPress={() => adjust(-1)}>
            <Ionicons name="remove" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.incrBtn} onPress={() => adjust(1)}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.stepper}>
          {([-0.5, -0.1] as const).map(d => (
            <TouchableOpacity key={d} style={styles.stepBtn} onPress={() => adjust(d)}>
              <Text style={styles.stepBtnTxt}>{d > 0 ? `+${d}` : `${d}`}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.stepCenter}>
            <Text style={styles.stepCenterVal}>{weight.toFixed(1)}</Text>
          </View>
          {([0.1, 0.5] as const).map(d => (
            <TouchableOpacity key={d} style={styles.stepBtn} onPress={() => adjust(d)}>
              <Text style={styles.stepBtnTxt}>+{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Note (optionnel)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Ex: après sport, à jeun..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Historique récent</Text>
          <View style={styles.historyList}>
            {HISTORY.map(h => (
              <View key={h.date} style={styles.historyRow}>
                <Text style={styles.historyDate}>{h.date}</Text>
                <Text style={styles.historyWeight}>{h.weight.toFixed(1)} kg</Text>
                <Text style={styles.historyDelta}>
                  {(h.weight - weight >= 0 ? '+' : '') + (h.weight - weight).toFixed(1)} kg
                </Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
