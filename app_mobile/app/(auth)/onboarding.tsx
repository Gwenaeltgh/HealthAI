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
import type { OnboardingData } from '@/types';

const TOTAL_STEPS = 4;

// ─── Step 1: Goal ─────────────────────────────────────────────────────────────

type GoalKey = 'perte' | 'gain' | 'maintien';

const GOALS: { key: GoalKey; label: string; emoji: string; sub: string }[] = [
  { key: 'perte',    emoji: '🔥', label: 'Perdre du poids',     sub: 'Déficit calorique adapté' },
  { key: 'gain',     emoji: '💪', label: 'Prendre du muscle',   sub: 'Surplus et nutrition sportive' },
  { key: 'maintien', emoji: '⚖️', label: 'Maintenir ma forme',  sub: 'Équilibre et stabilité' },
  { key: 'maintien', emoji: '🥗', label: 'Mieux manger',        sub: 'Habitudes alimentaires saines' },
];

// ─── Step 3: Activity ─────────────────────────────────────────────────────────

type ActivityKey = OnboardingData['activityLevel'];

const ACTIVITIES: { key: ActivityKey; label: string; sub: string; emoji: string }[] = [
  { key: 'sedentary',   emoji: '🛋️', label: 'Sédentaire',          sub: 'Travail de bureau, peu de sport' },
  { key: 'light',       emoji: '🚶', label: 'Légèrement actif',     sub: '1–2 séances / semaine' },
  { key: 'moderate',    emoji: '🚴', label: 'Modérément actif',     sub: '3–5 séances / semaine' },
  { key: 'active',      emoji: '🏃', label: 'Très actif',           sub: '6–7 séances / semaine' },
  { key: 'very_active', emoji: '🏋️', label: 'Athlète',              sub: 'Sport quotidien intensif' },
];

// ─── Step 4: Dietary ──────────────────────────────────────────────────────────

const DIET_OPTIONS = [
  'Végétarien', 'Vegan', 'Sans gluten', 'Sans lactose',
  'Halal', 'Casher', 'Cétogène', 'Paléo',
];

const ALLERGY_OPTIONS = [
  'Arachides', 'Fruits à coque', 'Lait', 'Œufs',
  'Poissons', 'Crustacés', 'Soja', 'Blé',
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const { saveOnboarding, isLoading } = useAuthStore();

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<GoalKey>('perte');
  const [goalIndex, setGoalIndex] = useState(0);
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [activity, setActivity] = useState<ActivityKey>('moderate');
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [error, setError] = useState('');

  const toggleSet = (
    value: string,
    current: string[],
    setter: (v: string[]) => void,
  ) => {
    setter(current.includes(value) ? current.filter(x => x !== value) : [...current, value]);
  };

  const validateStep = (): boolean => {
    setError('');
    if (step === 1) {
      if (!currentWeight || isNaN(Number(currentWeight))) return setErr('Poids actuel invalide');
      if (!targetWeight || isNaN(Number(targetWeight))) return setErr('Poids cible invalide');
      if (!height || isNaN(Number(height))) return setErr('Taille invalide');
      if (!age || isNaN(Number(age))) return setErr('Âge invalide');
    }
    return true;
  };

  const setErr = (msg: string): false => { setError(msg); return false; };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
      return;
    }
    // Final step → save
    const data: OnboardingData = {
      goal,
      currentWeight: Number(currentWeight) || 70,
      targetWeight: Number(targetWeight) || 65,
      height: Number(height) || 170,
      age: Number(age) || 25,
      activityLevel: activity,
      dietaryRestrictions: restrictions,
      allergies,
    };
    await saveOnboarding(data);
    router.replace('/(tabs)' as any);
  };

  const handleBack = () => {
    if (step === 0) { router.back(); return; }
    setError('');
    setStep(s => s - 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#162032" />
          </TouchableOpacity>
          <View style={styles.logoRow}>
            <Text style={styles.logoEmoji}>🥑</Text>
            <Text style={styles.logoName}>HealthAI Coach</Text>
          </View>
          <View style={styles.backBtn} />
        </View>

        {/* ── Progress ── */}
        <View style={styles.progress}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotActive, i === step && styles.dotCurrent]} />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTxt}>{error}</Text>
            </View>
          ) : null}

          {/* ── Step 0: Goal ── */}
          {step === 0 && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepTitle}>Quel est ton{'\n'}objectif principal ?</Text>
              <Text style={styles.stepSub}>On personnalisera ton programme en fonction de ta réponse.</Text>
              <View style={styles.goalGrid}>
                {GOALS.map((g, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.goalCard, goalIndex === i && styles.goalCardActive]}
                    onPress={() => { setGoal(g.key); setGoalIndex(i); }}
                  >
                    <Text style={styles.goalEmoji}>{g.emoji}</Text>
                    <Text style={[styles.goalLabel, goalIndex === i && styles.goalLabelActive]}>{g.label}</Text>
                    <Text style={styles.goalSub}>{g.sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── Step 1: Physical data ── */}
          {step === 1 && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepTitle}>Tes données{'\n'}physiques</Text>
              <Text style={styles.stepSub}>Pour calculer tes besoins caloriques personnalisés.</Text>

              <View style={styles.fields}>
                <PhysicField label="Poids actuel" unit="kg" value={currentWeight} onChange={setCurrentWeight} placeholder="74" />
                <PhysicField label="Poids cible" unit="kg" value={targetWeight} onChange={setTargetWeight} placeholder="70" />
                <PhysicField label="Taille" unit="cm" value={height} onChange={setHeight} placeholder="175" />
                <PhysicField label="Âge" unit="ans" value={age} onChange={setAge} placeholder="28" />
              </View>
            </View>
          )}

          {/* ── Step 2: Activity ── */}
          {step === 2 && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepTitle}>Ton niveau{'\n'}d'activité</Text>
              <Text style={styles.stepSub}>Combien de fois fais-tu du sport par semaine ?</Text>
              <View style={styles.activityList}>
                {ACTIVITIES.map(a => (
                  <TouchableOpacity
                    key={a.key}
                    style={[styles.activityRow, activity === a.key && styles.activityRowActive]}
                    onPress={() => setActivity(a.key)}
                  >
                    <Text style={styles.activityEmoji}>{a.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.activityLabel, activity === a.key && styles.activityLabelActive]}>{a.label}</Text>
                      <Text style={styles.activitySub}>{a.sub}</Text>
                    </View>
                    {activity === a.key && (
                      <Ionicons name="checkmark-circle" size={22} color="#2EC4B6" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── Step 3: Dietary ── */}
          {step === 3 && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepTitle}>Restrictions &{'\n'}allergies</Text>
              <Text style={styles.stepSub}>Optionnel — tu pourras modifier ça plus tard dans les réglages.</Text>

              <Text style={styles.chipSectionLabel}>Régimes alimentaires</Text>
              <View style={styles.chipGrid}>
                {DIET_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, restrictions.includes(opt) && styles.chipActive]}
                    onPress={() => toggleSet(opt, restrictions, setRestrictions)}
                  >
                    <Text style={[styles.chipTxt, restrictions.includes(opt) && styles.chipTxtActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.chipSectionLabel, { marginTop: 20 }]}>Allergies</Text>
              <View style={styles.chipGrid}>
                {ALLERGY_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, allergies.includes(opt) && styles.chipActive]}
                    onPress={() => toggleSet(opt, allergies, setAllergies)}
                  >
                    <Text style={[styles.chipTxt, allergies.includes(opt) && styles.chipTxtActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

        </ScrollView>

        {/* ── CTA ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, isLoading && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.nextTxt}>{step === TOTAL_STEPS - 1 ? 'Terminer  ✓' : 'Continuer  →'}</Text>
            }
          </TouchableOpacity>
          {step === 3 && (
            <TouchableOpacity onPress={() => router.replace('/(tabs)' as any)}>
              <Text style={styles.skipTxt}>Passer cette étape</Text>
            </TouchableOpacity>
          )}
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function PhysicField({ label, unit, value, onChange, placeholder }: {
  label: string; unit: string; value: string;
  onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <View style={styles.physicRow}>
      <Text style={styles.physicLabel}>{label}</Text>
      <View style={styles.physicInput}>
        <TextInput
          style={styles.physicTxt}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#8A9BA8"
          keyboardType="decimal-pad"
        />
        <Text style={styles.physicUnit}>{unit}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EFF5F3' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoEmoji: { fontSize: 20 },
  logoName: { fontSize: 15, fontWeight: '700', color: '#162032' },

  progress: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C8D8D4' },
  dotActive: { backgroundColor: '#7DD9D3' },
  dotCurrent: { width: 24, backgroundColor: '#2EC4B6' },

  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 },

  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 12, padding: 12, marginBottom: 12 },
  errorTxt: { fontSize: 13, color: '#B91C1C' },

  stepWrap: { gap: 20 },
  stepTitle: { fontSize: 30, fontWeight: '800', color: '#162032', fontFamily: 'serif', lineHeight: 38 },
  stepSub: { fontSize: 15, color: '#4A6560', lineHeight: 22, marginTop: -8 },

  // Goal grid
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  goalCard: {
    width: '47%', borderRadius: 20, padding: 16, gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 2, borderColor: '#DDE8E4',
  },
  goalCardActive: { borderColor: '#2EC4B6', backgroundColor: '#F0FAFA' },
  goalEmoji: { fontSize: 28 },
  goalLabel: { fontSize: 14, fontWeight: '700', color: '#162032', lineHeight: 20 },
  goalLabelActive: { color: '#2EC4B6' },
  goalSub: { fontSize: 12, color: '#8A9BA8', lineHeight: 16 },

  // Physical
  fields: { gap: 12 },
  physicRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: '#DDE8E4',
  },
  physicLabel: { fontSize: 15, fontWeight: '600', color: '#162032' },
  physicInput: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  physicTxt: { fontSize: 22, fontWeight: '700', color: '#2EC4B6', minWidth: 64, textAlign: 'right' },
  physicUnit: { fontSize: 14, color: '#8A9BA8', fontWeight: '500' },

  // Activity
  activityList: { gap: 10 },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    borderWidth: 2, borderColor: '#DDE8E4',
  },
  activityRowActive: { borderColor: '#2EC4B6', backgroundColor: '#F0FAFA' },
  activityEmoji: { fontSize: 26, width: 36, textAlign: 'center' },
  activityLabel: { fontSize: 15, fontWeight: '700', color: '#162032' },
  activityLabelActive: { color: '#2EC4B6' },
  activitySub: { fontSize: 12, color: '#8A9BA8', marginTop: 2 },

  // Chips
  chipSectionLabel: { fontSize: 14, fontWeight: '700', color: '#162032' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#DDE8E4',
  },
  chipActive: { backgroundColor: '#2EC4B6', borderColor: '#2EC4B6' },
  chipTxt: { fontSize: 13, fontWeight: '600', color: '#4A6560' },
  chipTxtActive: { color: '#FFFFFF' },

  // Footer
  footer: {
    paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 8 : 24,
    paddingTop: 12, gap: 12,
    borderTopWidth: 1, borderTopColor: '#DDE8E4', backgroundColor: '#EFF5F3',
  },
  nextBtn: {
    backgroundColor: '#162032', borderRadius: 999,
    paddingVertical: 18, alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.6 },
  nextTxt: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  skipTxt: { fontSize: 14, color: '#8A9BA8', textAlign: 'center', fontWeight: '500' },
});
