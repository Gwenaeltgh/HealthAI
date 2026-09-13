import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FoodIllustration } from '@/components/food-illustrations';
import { useColors } from '@/hooks/use-colors';
import { typography } from '@/constants/typography';
import { useJournalStore } from '@/stores/journal.store';
import type { Meal } from '@/types';
import { shadow } from '@/utils/shadow';

const MEAL_META: Record<string, { title: string; illustration: 'breakfast' | 'lunch' }> = {
  breakfast: { title: 'Petit-déjeuner', illustration: 'breakfast' },
  lunch:     { title: 'Déjeuner',       illustration: 'lunch' },
  dinner:    { title: 'Dîner',          illustration: 'lunch' },
  snack:     { title: 'Collation',      illustration: 'breakfast' },
};

function MacroChip({ label, value, tone }: { label: string; value: number; tone: 'neutral' | 'green' }) {
  const colors = useColors();
  const styles = StyleSheet.create({
    macroChip: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
    macroChipNeutral: { backgroundColor: colors.surfaceContainer },
    macroChipGreen: { backgroundColor: `${colors.primary}30` },
    macroChipText: { fontSize: typography.bodySM, color: colors.text },
  });
  return (
    <View style={[styles.macroChip, tone === 'green' ? styles.macroChipGreen : styles.macroChipNeutral]}>
      <Text style={styles.macroChipText}>{label}: {value}g</Text>
    </View>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  const colors = useColors();
  const meta = MEAL_META[meal.type] ?? { title: meal.type, illustration: 'breakfast' as const };
  const protein = meal.entries.reduce((s, e) => s + e.protein, 0);
  const carbs   = meal.entries.reduce((s, e) => s + e.carbs,   0);
  const fat     = meal.entries.reduce((s, e) => s + e.fat,     0);
  const name    = meal.entries.length > 0
    ? meal.entries.map(e => e.foodName).join(', ')
    : meta.title;
  const description = meal.entries.length > 0
    ? `${meal.entries.length} aliment${meal.entries.length > 1 ? 's' : ''} • ${meal.totalCalories} kcal`
    : 'Aucun aliment ajouté';

  const styles = StyleSheet.create({
    mealCard: { backgroundColor: colors.surfaceContainerLow, borderRadius: 24, overflow: 'hidden' },
    mealImageWrap: { width: '100%', height: 118 },
    mealBody: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, gap: 7 },
    mealTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    mealName: { flex: 1, fontSize: typography.bodyLG, fontWeight: '700', color: colors.text },
    mealDescription: { fontSize: typography.bodyMD, color: colors.textSecondary },
    mealMacrosRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  });

  return (
    <View style={styles.mealCard}>
      <View style={styles.mealImageWrap}>
        <FoodIllustration variant={meta.illustration} />
      </View>
      <View style={styles.mealBody}>
        <View style={styles.mealTitleRow}>
          <Text style={styles.mealName} numberOfLines={1}>{name}</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={16} color={colors.outlineVariant} />
          </TouchableOpacity>
        </View>
        <Text style={styles.mealDescription}>{description}</Text>
        <View style={styles.mealMacrosRow}>
          <MacroChip label="P" value={Math.round(protein)} tone="neutral" />
          <MacroChip label="G" value={Math.round(carbs)}   tone="green"   />
          <MacroChip label="L" value={Math.round(fat)}     tone="neutral" />
        </View>
      </View>
    </View>
  );
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export default function JournalScreen() {
  const router = useRouter();
  const colors = useColors();
  const { daily, isLoading, loadDaily } = useJournalStore();
  const [pickerVisible, setPickerVisible] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDaily(today);
  }, [today, loadDaily]);

  const currentDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(new Date());
  const summaryRatio = daily ? Math.min(daily.consumed / daily.target, 1) : 0;
  const mealOf = (type: string) => daily?.meals.find(m => m.type === type);

  const goToAddFood = (mealId: string, mealType: string) => {
    setPickerVisible(false);
    router.push({ pathname: '/add-food' as any, params: { mealId, mealType } });
  };

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 128, gap: 18 },

    headerRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 4 },
    navTitle: { fontSize: typography.titleLG, fontWeight: '700', color: colors.text },

    dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    dateTextWrap: { gap: 2 },
    dateLabel: { fontSize: typography.bodySM, letterSpacing: 1.2, color: colors.textSecondary, fontWeight: '600' },
    dateValue: { fontSize: typography.titleLG, lineHeight: 30, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
    calendarButton: {
      width: 40, height: 40, borderRadius: 13,
      backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
    },

    summaryCard: {
      backgroundColor: colors.surface, borderRadius: 24,
      paddingHorizontal: 20, paddingVertical: 18,
      borderWidth: 1, borderColor: colors.border, gap: 16,
    },
    summaryTopRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
    summaryValue: { fontSize: typography.titleLG, fontWeight: '800', color: colors.text },
    summaryTarget: { fontSize: typography.bodyMD, color: colors.textSecondary, marginBottom: 4 },
    summaryTrack: { height: 11, backgroundColor: colors.surfaceContainer, borderRadius: 999, overflow: 'hidden' },
    summaryFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 999 },
    summaryMacrosRow: { flexDirection: 'row', justifyContent: 'space-between', paddingRight: 8 },
    summaryMacroItem: { gap: 4 },
    summaryMacroValue: { fontSize: typography.bodyMD, fontWeight: '700', color: colors.text },
    summaryMacroLabelProtein: { fontSize: typography.caption, letterSpacing: 1.4, color: colors.protein },
    summaryMacroLabelCarbs: { fontSize: typography.caption, letterSpacing: 1.4, color: colors.primary },
    summaryMacroLabelFats: { fontSize: typography.caption, letterSpacing: 1.4, color: colors.textSecondary },

    sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionTitle: { fontSize: typography.bodyLG, fontWeight: '700', color: colors.text },
    sectionCalories: { fontSize: typography.bodyMD, fontWeight: '700', color: colors.primary },
    sectionStatus: { fontSize: typography.bodyMD, color: colors.textSecondary },

    planCard: {
      backgroundColor: colors.background, borderRadius: 24,
      borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
      paddingVertical: 26, paddingHorizontal: 18,
      alignItems: 'center', gap: 10,
    },
    planIconWrap: {
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center',
    },
    planQuestion: { fontSize: typography.bodyMD, color: colors.text },
    planLink: { fontSize: typography.bodyMD, fontWeight: '700', color: colors.primary },

    adviceCard: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 14,
      backgroundColor: colors.primaryLight, borderRadius: 24,
      paddingHorizontal: 18, paddingVertical: 16,
    },
    adviceIconWrap: {
      width: 36, height: 36, borderRadius: 12,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    },
    adviceTextWrap: { flex: 1, gap: 4 },
    adviceTitle: { fontSize: typography.bodyLG, fontWeight: '700', color: colors.text },
    adviceText: { fontSize: typography.bodyMD, lineHeight: 20, color: colors.textSecondary },

    fab: {
      position: 'absolute', right: 22, bottom: 26,
      width: 62, height: 62, borderRadius: 31,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
      ...shadow('#0B5C44', 0.18, 12, 6, 6),
    },

    modalOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36,
      gap: 4,
    },
    modalHandle: {
      width: 40, height: 4, borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center', marginBottom: 16,
    },
    modalTitle: {
      fontSize: 17, fontWeight: '700', color: colors.text,
      fontFamily: 'serif', marginBottom: 8,
    },
    modalRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    modalRowTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
    modalRowKcal: { fontSize: 13, color: colors.textSecondary, marginRight: 8 },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <Text style={styles.navTitle}>Alimentation</Text>
        </View>

        <View style={styles.dateRow}>
          <View style={styles.dateTextWrap}>
            <Text style={styles.dateLabel}>AUJOURD&apos;HUI</Text>
            <Text style={styles.dateValue}>{currentDate}</Text>
          </View>
          <TouchableOpacity style={styles.calendarButton}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {isLoading || !daily ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryTopRow}>
                <Text style={styles.summaryValue}>{daily.consumed.toLocaleString('fr-FR')}</Text>
                <Text style={styles.summaryTarget}>/ {daily.target.toLocaleString('fr-FR')} kcal</Text>
              </View>
              <View style={styles.summaryTrack}>
                <View style={[styles.summaryFill, { width: `${summaryRatio * 100}%` }]} />
              </View>
              <View style={styles.summaryMacrosRow}>
                <View style={styles.summaryMacroItem}>
                  <Text style={styles.summaryMacroValue}>{daily.macros.protein.value}g</Text>
                  <Text style={styles.summaryMacroLabelProtein}>PROTÉINES</Text>
                </View>
                <View style={styles.summaryMacroItem}>
                  <Text style={styles.summaryMacroValue}>{daily.macros.carbs.value}g</Text>
                  <Text style={styles.summaryMacroLabelCarbs}>GLUCIDES</Text>
                </View>
                <View style={styles.summaryMacroItem}>
                  <Text style={styles.summaryMacroValue}>{daily.macros.fat.value}g</Text>
                  <Text style={styles.summaryMacroLabelFats}>LIPIDES</Text>
                </View>
              </View>
            </View>

            {MEAL_TYPES.map(type => {
              const meal = mealOf(type);
              const meta = MEAL_META[type];
              const kcal = meal?.totalCalories ?? 0;
              return (
                <View key={type}>
                  <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>{meta.title}</Text>
                    {kcal > 0
                      ? <Text style={styles.sectionCalories}>{kcal} kcal</Text>
                      : <Text style={styles.sectionStatus}>À planifier</Text>
                    }
                  </View>
                  {meal && meal.entries.length > 0 ? (
                    <MealCard meal={meal} />
                  ) : (
                    <View style={styles.planCard}>
                      <View style={styles.planIconWrap}>
                        <MaterialCommunityIcons name="silverware-fork-knife" size={22} color={colors.primary} />
                      </View>
                      <Text style={styles.planQuestion}>
                        Qu&apos;as-tu mangé pour {meta.title.toLowerCase()} ?
                      </Text>
                      <TouchableOpacity onPress={() => meal && goToAddFood(meal.id, type)}>
                        <Text style={styles.planLink}>Ajouter des aliments</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}

            <View style={styles.adviceCard}>
              <View style={styles.adviceIconWrap}>
                <MaterialCommunityIcons name="robot-happy-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.adviceTextWrap}>
                <Text style={styles.adviceTitle}>Conseil de l&apos;IA</Text>
                <Text style={styles.adviceText}>
                  Pense à varier tes sources de protéines. Légumineuses, œufs et poissons sont excellents pour diversifier ton apport.
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setPickerVisible(true)}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPickerVisible(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Ajouter à quel repas ?</Text>
            {MEAL_TYPES.map(type => {
              const meal = mealOf(type);
              const meta = MEAL_META[type];
              return (
                <TouchableOpacity
                  key={type}
                  style={styles.modalRow}
                  onPress={() => meal && goToAddFood(meal.id, type)}
                >
                  <Text style={styles.modalRowTitle}>{meta.title}</Text>
                  <Text style={styles.modalRowKcal}>{meal?.totalCalories ?? 0} kcal</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
