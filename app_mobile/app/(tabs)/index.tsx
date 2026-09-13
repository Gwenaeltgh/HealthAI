import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { LogoMark } from '@/components/logo-mark';
import { useColors } from '@/hooks/use-colors';
import { useAuthStore } from '@/stores/auth.store';
import { useJournalStore } from '@/stores/journal.store';
import { useThemeStore } from '@/stores/theme.store';
import { shadow } from '@/utils/shadow';

const RING = 180;
const STROKE = 10;
const R = (RING - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function CalorieRing({ consumed, target }: { consumed: number; target: number }) {
  const colors = useColors();
  const progress = Math.min(consumed / target, 1);
  const remaining = Math.max(target - consumed, 0);
  const offset = CIRC * (1 - progress);

  const styles = StyleSheet.create({
    ringWrap: { alignItems: 'center', justifyContent: 'center' },
    ringInner: { position: 'absolute', alignItems: 'center' },
    ringValue: { fontSize: 38, fontWeight: '700', color: colors.text, letterSpacing: -1 },
    ringLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  });

  return (
    <View style={styles.ringWrap}>
      <Svg width={RING} height={RING}>
        <Circle
          cx={RING / 2} cy={RING / 2} r={R}
          stroke={colors.surfaceContainer}
          strokeWidth={STROKE} fill="transparent"
        />
        <Circle
          cx={RING / 2} cy={RING / 2} r={R}
          stroke={colors.primary}
          strokeWidth={STROKE} fill="transparent"
          strokeDasharray={`${CIRC} ${CIRC}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90, ${RING / 2}, ${RING / 2})`}
        />
      </Svg>
      <View style={styles.ringInner}>
        <Text style={styles.ringValue}>{remaining.toLocaleString('fr-FR')}</Text>
        <Text style={styles.ringLabel}>kcal Restantes</Text>
      </View>
    </View>
  );
}

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const colors = useColors();
  const pct = Math.min((value / target) * 100, 100);
  const styles = StyleSheet.create({
    macroCol: { flex: 1, gap: 4 },
    macroMeta: { flexDirection: 'row', justifyContent: 'space-between' },
    macroLabel: { fontSize: 9, color: colors.textSecondary },
    macroNums: { fontSize: 9, color: colors.textSecondary },
    macroTrack: { height: 6, backgroundColor: colors.surfaceContainer, borderRadius: 999, overflow: 'hidden' },
    macroFill: { height: 6, borderRadius: 999 },
  });
  return (
    <View style={styles.macroCol}>
      <View style={styles.macroMeta}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroNums}>{value}/{target}g</Text>
      </View>
      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const MEAL_META: Record<string, { emoji: string; label: string }> = {
  breakfast: { emoji: '🌅', label: 'Petit-déjeuner' },
  lunch:     { emoji: '☀️', label: 'Déjeuner' },
  dinner:    { emoji: '🌙', label: 'Dîner' },
  snack:     { emoji: '🍎', label: 'Collation' },
};

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const system = useColorScheme();
  const { toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { daily, isLoading, loadDaily } = useJournalStore();
  const isDark = colors.background === '#0D1514';
  const [offset, setOffset] = useState(0);

  const dateStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  })();

  const dateLabel = offset === 0
    ? "Aujourd'hui"
    : new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  useEffect(() => {
    loadDaily(dateStr);
  }, [dateStr, loadDaily]);

  const macros = daily ? [
    { label: 'Protéines', value: daily.macros.protein.value, target: daily.macros.protein.target, color: colors.protein ?? '#F17070' },
    { label: 'Glucides',  value: daily.macros.carbs.value,   target: daily.macros.carbs.target,   color: colors.primary },
    { label: 'Lipides',   value: daily.macros.fat.value,     target: daily.macros.fat.target,     color: colors.textSecondary },
  ] : [];

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.headerBg,
      paddingHorizontal: 24, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    brand: { fontSize: 17, fontWeight: '700', color: colors.text, fontFamily: 'serif' },
    bell: { padding: 8 },

    scroll: { padding: 20, gap: 20, paddingBottom: 110 },

    dateRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
      borderWidth: 1, borderColor: colors.border,
    },
    dateLabel: { fontSize: 14, fontWeight: '600', color: colors.text },

    metricCard: {
      backgroundColor: colors.surface,
      borderRadius: 24, padding: 24,
      alignItems: 'center', gap: 20,
      borderWidth: 1, borderColor: colors.border,
    },
    metricRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    metricNum: { fontSize: 22, fontWeight: '700', color: colors.text },
    metricSub: { fontSize: 11, color: colors.textSecondary, marginTop: 3 },
    burnRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },

    macrosRow: { flexDirection: 'row', gap: 10, width: '100%' },

    section: { gap: 10 },
    mealCard: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 14, padding: 16,
      borderWidth: 1, borderColor: colors.border,
    },
    mealLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    mealIcon: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.surfaceContainer,
      alignItems: 'center', justifyContent: 'center',
    },
    mealEmoji: { fontSize: 20 },
    mealName: { fontSize: 14, fontWeight: '600', color: colors.text },
    mealKcal: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    addBtn: {
      width: 32, height: 32, borderRadius: 16,
      borderWidth: 1.5, borderColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },

    promoCard: {
      backgroundColor: colors.secondaryContainer,
      borderRadius: 24, padding: 24,
      flexDirection: 'row', gap: 16,
      alignItems: 'flex-start', overflow: 'hidden',
      position: 'relative',
    },
    promoIconWrap: {
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: colors.surface,
      alignItems: 'center', justifyContent: 'center',
      ...shadow('#000', 0.06, 4, 2),
      flexShrink: 0,
    },
    promoTitle: { fontSize: 20, fontWeight: '600', color: colors.text, fontFamily: 'serif' },
    promoSub: { fontSize: 13, color: colors.onSecondaryContainer, lineHeight: 19 },
    promoCta: {
      marginTop: 6, alignSelf: 'flex-start',
      backgroundColor: colors.primaryDark,
      borderRadius: 999, paddingHorizontal: 18, paddingVertical: 9,
    },
    promoCtaTxt: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
    promoMascot: {
      position: 'absolute', right: -14, bottom: -10,
      opacity: 0.7,
    },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LogoMark size={44} />
          <Text style={styles.brand}>Bonjour{user?.firstName ? `, ${user.firstName}` : ''} 👋</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <TouchableOpacity style={styles.bell} onPress={() => toggleTheme(system)}>
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bell} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.dateRow}>
          <TouchableOpacity onPress={() => setOffset(o => o - 1)} hitSlop={8}>
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <TouchableOpacity onPress={() => setOffset(o => o + 1)} hitSlop={8}>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {isLoading || !daily ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.metricCard}>
              <View style={styles.metricRow}>
                <View>
                  <Text style={styles.metricNum}>{daily.consumed.toLocaleString('fr-FR')}</Text>
                  <Text style={styles.metricSub}>Consommées</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={styles.burnRow}>
                    <Ionicons name="flame" size={14} color={colors.tertiary ?? colors.error} />
                    <Text style={[styles.metricNum, { color: colors.tertiary ?? colors.error }]}>
                      {daily.burned}
                    </Text>
                  </View>
                  <Text style={styles.metricSub}>Dépensées</Text>
                </View>
              </View>

              <CalorieRing consumed={daily.consumed} target={daily.target} />

              <View style={styles.macrosRow}>
                {macros.map(m => (
                  <MacroBar key={m.label} {...m} />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              {daily.meals.map(meal => {
                const meta = MEAL_META[meal.type] ?? { emoji: '🍽️', label: meal.type };
                return (
                  <TouchableOpacity
                    key={meal.id}
                    style={styles.mealCard}
                    activeOpacity={0.75}
                    onPress={() => router.push('/meal-detail')}
                  >
                    <View style={styles.mealLeft}>
                      <View style={styles.mealIcon}>
                        <Text style={styles.mealEmoji}>{meta.emoji}</Text>
                      </View>
                      <View>
                        <Text style={styles.mealName}>{meta.label}</Text>
                        <Text style={styles.mealKcal}>
                          {meal.totalCalories} / {daily.target / 4} kcal
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-food')}>
                      <Ionicons name="add" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        <View style={styles.promoCard}>
          <View style={styles.promoIconWrap}>
            <Ionicons name="time-outline" size={24} color={colors.primary} />
          </View>
          <View style={{ gap: 6, flex: 1 }}>
            <Text style={styles.promoTitle}>Analyse hebdomadaire</Text>
            <Text style={styles.promoSub}>
              Tes données de la semaine sont prêtes. Consulte ton bilan nutritionnel.
            </Text>
            <TouchableOpacity style={styles.promoCta} onPress={() => router.push('/progress')}>
              <Text style={styles.promoCtaTxt}>Voir le bilan</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.promoMascot}>
            <LogoMark size={56} />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
