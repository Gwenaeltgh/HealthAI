import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';

function SubHeader({ title, onRight, rightIcon }: { title: string; onRight?: () => void; rightIcon?: string }) {
  const router = useRouter();
  const colors = useColors();
  const sh = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.headerBg, paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '600', color: colors.text, fontFamily: 'serif' },
    right: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  });
  return (
    <View style={sh.header}>
      <TouchableOpacity onPress={() => router.back()} style={sh.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={sh.title}>{title}</Text>
      <View style={sh.right}>
        {rightIcon && onRight && (
          <TouchableOpacity onPress={onRight}>
            <Ionicons name={rightIcon as any} size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function FoodRow({ emoji, name, desc, kcal, bg }: { emoji: string; name: string; desc: string; kcal: number; bg: string }) {
  const colors = useColors();
  const styles = StyleSheet.create({
    foodRow: {
      backgroundColor: colors.surface,
      borderRadius: 16, borderWidth: 1, borderColor: colors.border,
      flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12,
    },
    foodImg: { width: 64, height: 64, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    foodEmoji: { fontSize: 28 },
    foodInfo: { flex: 1 },
    foodName: { fontSize: 14, fontWeight: '600', color: colors.text },
    foodDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    foodKcal: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  });
  return (
    <View style={styles.foodRow}>
      <View style={[styles.foodImg, { backgroundColor: bg }]}>
        <Text style={styles.foodEmoji}>{emoji}</Text>
      </View>
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{name}</Text>
        <Text style={styles.foodDesc}>{desc}</Text>
      </View>
      <Text style={styles.foodKcal}>{kcal} kcal</Text>
    </View>
  );
}

export default function MealDetailScreen() {
  const router = useRouter();
  const colors = useColors();

  const macros = [
    { label: 'Protéines', value: 42, max: 60 },
    { label: 'Glucides', value: 48, max: 90 },
    { label: 'Lipides', value: 18, max: 40 },
  ];

  const foods = [
    { emoji: '🍗', name: 'Poulet rôti', desc: '150g', kcal: 247, bg: '#FFE8D6' },
    { emoji: '🌾', name: 'Quinoa cuit', desc: '100g', kcal: 120, bg: '#FFF3CD' },
    { emoji: '🥦', name: 'Brocoli vapeur', desc: '150g', kcal: 52, bg: '#D4EDDA' },
    { emoji: '🥑', name: 'Avocat', desc: '75g', kcal: 123, bg: '#D4EDDA' },
  ];

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: 20, gap: 20, paddingBottom: 40 },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 16, borderWidth: 1, borderColor: colors.border,
      padding: 20, gap: 14,
    },
    energyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    energyLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1 },
    energyRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
    energyBig: { fontSize: 42, fontWeight: '700', color: colors.text, letterSpacing: -1 },
    energySub: { fontSize: 16, color: colors.textSecondary, marginBottom: 8 },
    progressTrack: { height: 8, backgroundColor: colors.surfaceContainer, borderRadius: 999, overflow: 'hidden' },
    progressFill: { height: 8, backgroundColor: colors.primary, borderRadius: 999 },

    macroGrid: { flexDirection: 'row', gap: 12 },
    macroCol: { flex: 1, gap: 4 },
    macroVal: { fontSize: 18, fontWeight: '700', color: colors.text },
    macroLbl: { fontSize: 11, color: colors.textSecondary },
    miniTrack: { height: 4, backgroundColor: colors.surfaceContainer, borderRadius: 999, overflow: 'hidden' },
    miniFill: { height: 4, backgroundColor: colors.primary, borderRadius: 999 },

    section: { gap: 10 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text, fontFamily: 'serif' },

    addFoodBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      borderWidth: 1.5, borderColor: colors.primary, borderRadius: 999,
      paddingVertical: 14,
    },
    addFoodTxt: { fontSize: 14, fontWeight: '600', color: colors.primary },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SubHeader title="Déjeuner" rightIcon="ellipsis-horizontal" onRight={() => {}} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
          <View style={styles.energyHeader}>
            <Ionicons name="flame" size={20} color={colors.primary} />
            <Text style={styles.energyLabel}>ÉNERGIE</Text>
          </View>
          <View style={styles.energyRow}>
            <Text style={styles.energyBig}>542</Text>
            <Text style={styles.energySub}>/ 717 kcal</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
          <View style={styles.macroGrid}>
            {macros.map(m => (
              <View key={m.label} style={styles.macroCol}>
                <Text style={styles.macroVal}>{m.value}g</Text>
                <Text style={styles.macroLbl}>{m.label}</Text>
                <View style={styles.miniTrack}>
                  <View style={[styles.miniFill, { width: `${Math.min((m.value / m.max) * 100, 100)}%` as any }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aliments</Text>
          {foods.map(f => (
            <FoodRow key={f.name} {...f} />
          ))}
        </View>

        <TouchableOpacity style={styles.addFoodBtn} onPress={() => router.push('/add-food')}>
          <Ionicons name="add" size={18} color={colors.primary} />
          <Text style={styles.addFoodTxt}>Ajouter un aliment</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
