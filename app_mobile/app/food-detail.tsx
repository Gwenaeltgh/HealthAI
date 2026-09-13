import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';
import { useJournalStore } from '@/stores/journal.store';

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'petit-déjeuner',
  lunch:     'déjeuner',
  dinner:    'dîner',
  snack:     'collation',
};

export default function FoodDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { mealId, mealType, foodName, foodCalories, foodProtein, foodCarbs, foodFat, foodFiber, foodServingSize } =
    useLocalSearchParams<{
      mealId: string;
      mealType: string;
      foodId: string;
      foodName: string;
      foodCalories: string;
      foodProtein: string;
      foodCarbs: string;
      foodFat: string;
      foodFiber: string;
      foodServingSize: string;
    }>();

  const { addEntry } = useJournalStore();
  const [portion, setPortion] = useState(100);
  const [adding, setAdding] = useState(false);

  const base = Number(foodServingSize) || 100;
  const ratio = portion / base;
  const kcal    = Math.round(Number(foodCalories) * ratio);
  const protein = Math.round(Number(foodProtein)  * ratio * 10) / 10;
  const carbs   = Math.round(Number(foodCarbs)    * ratio * 10) / 10;
  const fat     = Math.round(Number(foodFat)      * ratio * 10) / 10;
  const fiber   = Math.round(Number(foodFiber)    * ratio * 10) / 10;

  const mealLabel = MEAL_LABELS[mealType ?? ''] ?? 'repas';

  async function handleAdd() {
    if (!mealId || adding) return;
    setAdding(true);
    await addEntry(mealId, {
      foodId:   foodName ?? '',
      foodName: foodName ?? '',
      quantity: portion,
      unit:     'g',
      calories: kcal,
      protein,
      carbs,
      fat,
    });
    router.back();
    router.back();
  }

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    hero: {
      height: 220, backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 24,
    },
    backCircle: {
      position: 'absolute', top: 16, left: 16,
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.9)',
      alignItems: 'center', justifyContent: 'center',
    },
    heroEmoji: { fontSize: 72 },
    heroTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', fontFamily: 'serif', marginTop: 8 },

    scroll: { paddingBottom: 100 },

    contentCard: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 32, borderTopRightRadius: 32,
      marginTop: -32, padding: 24, gap: 20,
    },

    kcalRow: { alignItems: 'center', gap: 4 },
    kcalBig: { fontSize: 36, fontWeight: '700', color: colors.primary, letterSpacing: -1 },
    kcalSub: { fontSize: 14, color: colors.textSecondary },

    portionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
    portionBtn: {
      width: 44, height: 44, borderRadius: 22,
      borderWidth: 1.5, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    portionBtnTxt: { fontSize: 22, color: colors.text, fontWeight: '500' },
    portionVal: { fontSize: 24, fontWeight: '700', color: colors.text, minWidth: 80, textAlign: 'center' },

    divider: { height: 1, backgroundColor: colors.border },

    macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    macroCell: { width: '47%', gap: 4 },
    macroLabel: { fontSize: 10, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.8 },
    macroValue: { fontSize: 22, fontWeight: '700', color: colors.text },

    bottomBar: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: 20, backgroundColor: colors.surface,
      borderTopWidth: 1, borderTopColor: colors.border,
    },
    addBtn: {
      backgroundColor: colors.primary, borderRadius: 999,
      paddingVertical: 16, alignItems: 'center',
    },
    addBtnTxt: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <View style={styles.hero}>
        <TouchableOpacity style={styles.backCircle} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.heroEmoji}>🥗</Text>
        <Text style={styles.heroTitle}>{foodName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.contentCard}>

          <View style={styles.kcalRow}>
            <Text style={styles.kcalBig}>{kcal} kcal</Text>
            <Text style={styles.kcalSub}>pour {portion}g</Text>
          </View>

          <View style={styles.portionRow}>
            <TouchableOpacity style={styles.portionBtn} onPress={() => setPortion(p => Math.max(10, p - 10))}>
              <Text style={styles.portionBtnTxt}>−</Text>
            </TouchableOpacity>
            <Text style={styles.portionVal}>{portion}g</Text>
            <TouchableOpacity style={styles.portionBtn} onPress={() => setPortion(p => p + 10)}>
              <Text style={styles.portionBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.macroGrid}>
            {[
              { label: 'PROTÉINES', value: `${protein}g` },
              { label: 'GLUCIDES',  value: `${carbs}g`   },
              { label: 'LIPIDES',   value: `${fat}g`     },
              { label: 'FIBRES',    value: `${fiber}g`   },
            ].map(m => (
              <View key={m.label} style={styles.macroCell}>
                <Text style={styles.macroLabel}>{m.label}</Text>
                <Text style={styles.macroValue}>{m.value}</Text>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.addBtn, adding && { opacity: 0.6 }]} onPress={handleAdd} disabled={adding}>
          <Text style={styles.addBtnTxt}>
            {adding ? 'Ajout en cours…' : `Ajouter au ${mealLabel}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
