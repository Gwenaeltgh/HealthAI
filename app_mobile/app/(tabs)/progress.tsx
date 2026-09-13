import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/auth.store';
import { useHealthStore } from '@/stores/health.store';
import { shadow } from '@/utils/shadow';

const BAR_MAX_HEIGHT = 80;
const STREAK_COLS = 7;
const STREAK_ROWS = 3;
const STREAK_TOTAL = STREAK_COLS * STREAK_ROWS;

function WeightChart({ days }: { days: { day: string; value: number }[] }) {
  const colors = useColors();
  if (days.length === 0) return null;
  const values = days.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const lastIdx = days.length - 1;

  const chartStyles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: BAR_MAX_HEIGHT + 52, marginTop: spacing.sm },
    barCol: { flex: 1, alignItems: 'center', gap: spacing.xs, justifyContent: 'flex-end' },
    bar: { width: '100%', borderRadius: 6 },
    barDefault: { backgroundColor: colors.surfaceContainer },
    barActive: { backgroundColor: colors.primary },
    label: { fontSize: typography.caption, color: colors.textSecondary, fontWeight: '500' },
    labelActive: { color: colors.primary, fontWeight: '700' },
    tooltip: { backgroundColor: colors.text, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, marginBottom: spacing.xs },
    tooltipText: { fontSize: typography.caption, color: colors.background, fontWeight: '700' },
  });

  return (
    <View style={chartStyles.container}>
      {days.map((d, idx) => {
        const isActive = idx === lastIdx;
        const norm = (d.value - minVal) / range;
        const barH = BAR_MAX_HEIGHT * (0.45 + norm * 0.55);
        return (
          <View key={`${d.day}-${idx}`} style={chartStyles.barCol}>
            {isActive && (
              <View style={chartStyles.tooltip}>
                <Text style={chartStyles.tooltipText}>{d.value}</Text>
              </View>
            )}
            <View style={[chartStyles.bar, { height: barH }, isActive ? chartStyles.barActive : chartStyles.barDefault]} />
            <Text style={[chartStyles.label, isActive && chartStyles.labelActive]}>{d.day}</Text>
          </View>
        );
      })}
    </View>
  );
}

function NutritionBar({ label, percent, barColor }: { label: string; percent: number; barColor: string }) {
  const colors = useColors();
  const nutStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    label: { width: 70, fontSize: typography.bodyMD, color: colors.text, fontWeight: '500' },
    track: { flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 999 },
    fill: { height: 8, borderRadius: 999 },
    pct: { width: 36, fontSize: typography.bodyMD, fontWeight: '700', textAlign: 'right' },
  });
  return (
    <View style={nutStyles.row}>
      <Text style={nutStyles.label}>{label}</Text>
      <View style={nutStyles.track}>
        <View style={[nutStyles.fill, { width: `${percent}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[nutStyles.pct, { color: barColor }]}>{percent}%</Text>
    </View>
  );
}

function StreakGrid({ filled, total }: { filled: number; total: number }) {
  const colors = useColors();
  const gridStyles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    square: { width: 36, height: 36, borderRadius: 8 },
    squareDark: { backgroundColor: colors.primary },
    squareMid: { backgroundColor: `${colors.primary}50` },
    squareEmpty: { backgroundColor: colors.border },
  });
  return (
    <View style={gridStyles.grid}>
      {Array.from({ length: total }, (_, i) => {
        const isFilled = i < filled;
        const isDark = i >= filled - STREAK_COLS && i < filled;
        return (
          <View
            key={i}
            style={[gridStyles.square, isFilled ? (isDark ? gridStyles.squareDark : gridStyles.squareMid) : gridStyles.squareEmpty]}
          />
        );
      })}
    </View>
  );
}

const MOTIVATIONS = [
  'La régularité bat le talent quand le talent ne travaille pas.',
  'Chaque petit progrès compte. Ne sous-estime jamais un effort.',
  'Ton seul concurrent, c\'est la version d\'hier de toi-même.',
];

export default function ProgressScreen() {
  const colors = useColors();
  const { user } = useAuthStore();
  const { weightHistory, isLoading, loadWeightHistory } = useHealthStore();
  const [period, setPeriod] = useState<'semaine' | 'mois'>('semaine');
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    loadWeightHistory();
  }, [loadWeightHistory]);

  const chartDays = weightHistory.slice(-7).map(e => ({
    day: new Date(e.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).split(' ')[0],
    value: e.weight,
  }));

  const weightChange = weightHistory.length >= 2
    ? Math.round((weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight) * 10) / 10
    : 0;

  const nutrition = { protein: 72, carbs: 58, fats: 41, advice: 'Augmente légèrement ton apport en lipides sains (avocat, noix) pour atteindre ton objectif.' };
  const streak = 14;
  const motivation = MOTIVATIONS[new Date().getDay() % MOTIVATIONS.length];

  const badges = [
    { id: 'guerrier', label: 'GUERRIER HEBDO', icon: 'trophy-outline',       bg: '#FEE2E2', color: '#EF4444' },
    { id: 'chef',     label: 'CHEF ÉQUILIBRÉ', icon: 'restaurant-outline',   bg: colors.primaryLight, color: colors.primary },
    { id: 'hydrate',  label: 'HYDRATÉ',        icon: 'water-outline',        bg: '#DBEAFE', color: '#4C9AFF' },
    { id: '30j',      label: '30 JOURS',       icon: 'lock-closed-outline',  bg: colors.border, color: colors.textSecondary, locked: true },
  ] as const;

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxxl },

    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    greeting: { fontSize: typography.titleMD, fontWeight: '700', color: colors.text },
    notifBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: colors.border,
    },

    analysisBanner: {
      flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
      backgroundColor: colors.primaryLight,
      borderRadius: 12, padding: spacing.md,
      borderWidth: 1, borderColor: 'rgba(33,182,144,0.2)',
    },
    analysisBannerLeft: { flex: 1, flexDirection: 'row', gap: spacing.sm },
    analysisIconWrap: {
      width: 28, height: 28, borderRadius: 8,
      backgroundColor: colors.surface,
      alignItems: 'center', justifyContent: 'center',
    },
    analysisLabel: { fontSize: typography.caption, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },
    analysisText: { fontSize: typography.bodySM, color: colors.text, lineHeight: 18, marginTop: 2 },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 14, borderWidth: 1, borderColor: colors.border,
      padding: spacing.lg, gap: spacing.sm,
    },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    cardTitle: { fontSize: typography.bodyLG, fontWeight: '700', color: colors.text },
    weightChange: { fontSize: typography.bodyMD, color: colors.textSecondary, marginTop: 2 },

    periodToggle: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: 8, padding: 3 },
    periodBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 6 },
    periodBtnActive: { backgroundColor: colors.surface, ...shadow('#000', 0.06, 4, 2) },
    periodBtnText: { fontSize: typography.bodySM, color: colors.textSecondary, fontWeight: '600' },
    periodBtnTextActive: { color: colors.text },

    aiAdvice: {
      flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs,
      backgroundColor: colors.primaryLight, borderRadius: 10, padding: spacing.md, marginTop: spacing.xs,
    },
    aiAdviceText: { flex: 1, fontSize: typography.bodySM, color: colors.text, lineHeight: 18 },

    streakHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    streakLabel: { fontSize: typography.bodySM, color: colors.textSecondary, fontWeight: '600', marginTop: 2 },
    streakFireWrap: {
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: colors.primaryLight,
      alignItems: 'center', justifyContent: 'center',
    },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
    sectionTitle: { fontSize: typography.bodyLG, fontWeight: '700', color: colors.text },
    seeAll: { fontSize: typography.bodyMD, color: colors.primary, fontWeight: '600' },

    badgesRow: { flexDirection: 'row', gap: spacing.sm },
    badgeWrap: { flex: 1, alignItems: 'center', gap: spacing.xs },
    badgeCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    badgeLocked: { opacity: 0.5 },
    badgeLabel: { fontSize: typography.caption, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' },
    badgeLabelLocked: { opacity: 0.5 },

    motivationCard: {
      backgroundColor: colors.primaryDark,
      borderRadius: 16,
      padding: spacing.xl, gap: spacing.sm, minHeight: 120, justifyContent: 'center',
    },
    motivationLabel: { fontSize: typography.caption, color: colors.primary, fontWeight: '700', letterSpacing: 0.5 },
    motivationQuote: { fontSize: typography.titleMD, fontWeight: '700', color: '#FFFFFF', lineHeight: 28 },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <Text style={styles.greeting}>Bonjour, {user?.firstName ?? ''}</Text>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {bannerVisible && (
          <View style={styles.analysisBanner}>
            <View style={styles.analysisBannerLeft}>
              <View style={styles.analysisIconWrap}>
                <MaterialCommunityIcons name="robot-outline" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.analysisLabel}>ANALYSE HEBDOMADAIRE</Text>
                <Text style={styles.analysisText}>
                  Votre apport en protéines est 12% plus stable que la semaine dernière. Continuez ainsi !
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setBannerVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>Poids Corporel</Text>
              <Text style={styles.weightChange}>
                {weightChange > 0 ? '+' : ''}{weightChange} kg ce mois-ci
              </Text>
            </View>
            <View style={styles.periodToggle}>
              {(['semaine', 'mois'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                  onPress={() => setPeriod(p)}
                >
                  <Text style={[styles.periodBtnText, period === p && styles.periodBtnTextActive]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {isLoading
            ? <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Chargement…</Text>
            : <WeightChart days={chartDays} />
          }
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Équilibre Nutritif</Text>
          <View style={{ gap: spacing.md, marginTop: spacing.xs }}>
            <NutritionBar label="Protéines" percent={nutrition.protein} barColor={colors.protein ?? '#F17070'} />
            <NutritionBar label="Glucides"  percent={nutrition.carbs}   barColor={colors.danger ?? '#EF4444'} />
            <NutritionBar label="Lipides"   percent={nutrition.fats}    barColor={colors.textSecondary} />
          </View>
          <View style={styles.aiAdvice}>
            <MaterialCommunityIcons name="robot-outline" size={14} color={colors.primary} />
            <Text style={styles.aiAdviceText}>
              <Text style={{ fontWeight: '700' }}>Conseil IA: </Text>
              {nutrition.advice}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.streakHeader}>
            <View>
              <Text style={styles.cardTitle}>Assiduité Calorique</Text>
              <Text style={styles.streakLabel}>{streak} JOURS CONSÉCUTIFS</Text>
            </View>
            <View style={styles.streakFireWrap}>
              <MaterialCommunityIcons name="fire" size={22} color={colors.primary} />
            </View>
          </View>
          <StreakGrid filled={streak} total={STREAK_TOTAL} />
        </View>

        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badges Récents</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.badgesRow}>
            {badges.map(b => (
              <View key={b.id} style={styles.badgeWrap}>
                <View style={[styles.badgeCircle, { backgroundColor: b.bg }, 'locked' in b && b.locked ? styles.badgeLocked : null]}>
                  <Ionicons name={b.icon as any} size={22} color={b.color} />
                </View>
                <Text style={[styles.badgeLabel, 'locked' in b && b.locked ? styles.badgeLabelLocked : null]} numberOfLines={2}>
                  {b.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.motivationCard}>
          <Text style={styles.motivationLabel}>MOTIVATION DU JOUR</Text>
          <Text style={styles.motivationQuote}>&ldquo;{motivation}&rdquo;</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
