import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';

const TIPS = [
  'Intègre une source de protéines à chaque repas pour stabiliser ta glycémie.',
  'Privilégie les glucides complexes (quinoa, patate douce) plutôt que raffinés.',
  'Ajoute une poignée de légumes verts à chaque assiette pour les micronutriments.',
];

const BENEFITS = ['Énergie stable', 'Récupération optimale'];

export default function RecoDetailScreen() {
  const router = useRouter();
  const colors = useColors();

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    hero: { height: 260, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    backBtn: {
      position: 'absolute', top: 16, left: 16,
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.85)',
      alignItems: 'center', justifyContent: 'center',
    },
    heroEmoji: { fontSize: 64 },
    scroll: { paddingBottom: 40 },
    contentCard: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 32, borderTopRightRadius: 32,
      marginTop: -32, padding: 24, gap: 20,
    },
    tagPill: { alignSelf: 'flex-start', backgroundColor: `${colors.primary}20`, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
    tagTxt: { fontSize: 11, fontWeight: '700', color: colors.primaryDark, letterSpacing: 1 },
    title: { fontSize: 24, fontWeight: '600', color: colors.text, fontFamily: 'serif', lineHeight: 32 },
    description: { fontSize: 15, color: colors.textSecondary, lineHeight: 24 },
    section: { gap: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text, fontFamily: 'serif' },
    tipsList: { gap: 12 },
    tipRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
    tipTxt: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
    benefitsRow: { flexDirection: 'row', gap: 10 },
    benefitPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: `${colors.primary}15`, borderWidth: 1, borderColor: `${colors.primary}40` },
    benefitTxt: { fontSize: 13, fontWeight: '600', color: colors.primaryDark },
    applyBtn: { backgroundColor: colors.primary, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
    applyTxt: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
    shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 999, paddingVertical: 14 },
    shareTxt: { fontSize: 15, fontWeight: '600', color: colors.primary },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.hero}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.heroEmoji}>🥗</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.contentCard}>
          <View style={styles.tagPill}><Text style={styles.tagTxt}>REPAS</Text></View>
          <Text style={styles.title}>Optimise ton déjeuner pour plus d'énergie</Text>
          <Text style={styles.description}>
            Un déjeuner équilibré est la clé d'un après-midi productif. En associant protéines, glucides complexes et bonnes graisses, tu peux maintenir un niveau d'énergie stable tout au long de la journée sans les coups de barre habituels.
          </Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conseils pratiques</Text>
            <View style={styles.tipsList}>
              {TIPS.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={styles.checkCircle}><Ionicons name="checkmark" size={14} color="#FFFFFF" /></View>
                  <Text style={styles.tipTxt}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bénéfices</Text>
            <View style={styles.benefitsRow}>
              {BENEFITS.map(b => (
                <View key={b} style={styles.benefitPill}><Text style={styles.benefitTxt}>{b}</Text></View>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.applyBtn} onPress={() => router.back()}>
            <Text style={styles.applyTxt}>Appliquer ce conseil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-outline" size={18} color={colors.primary} />
            <Text style={styles.shareTxt}>Partager</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
