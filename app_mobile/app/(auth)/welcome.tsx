import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoMark } from '@/components/logo-mark';

const { width: W } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    emoji: '🥑',
    bg: '#D6EDD6',
    title: 'Bienvenue chez\nHealthAI Coach',
    subtitle: 'Suivi nutrition, communauté bienveillante et coach IA. Tout pour ta santé au quotidien.',
  },
  {
    key: '2',
    emoji: '📊',
    bg: '#D6E8F0',
    title: 'Suis ta\nnutrition',
    subtitle: 'Journalise tes repas, visualise tes macros et atteins tes objectifs caloriques au quotidien.',
  },
  {
    key: '3',
    emoji: '🤖',
    bg: '#E8D6F0',
    title: 'Ton coach IA\npersonnel',
    subtitle: 'Des recommandations adaptées à tes données de sommeil, d\'activité et de nutrition.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [splash, setSplash] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;
  const flatRef = useRef<FlatList>(null);

  // Splash → carousel
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() =>
        setSplash(false)
      );
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  if (splash) {
    return (
      <Animated.View style={[styles.splash, { opacity }]}>
        <LogoMark size={120} />
        <Text style={styles.splashTitle}>HealthAI Coach</Text>
        <Text style={styles.splashSub}>Ton coach santé au quotidien</Text>
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={i => i.key}
        onMomentumScrollEnd={e =>
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / W))
        }
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={[styles.illustrationWrap, { backgroundColor: item.bg }]}>
              {item.key === '1'
                ? <LogoMark size={160} />
                : <Text style={styles.slideEmoji}>{item.emoji}</Text>
              }
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSub}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, activeIndex === i && styles.dotActive]} />
        ))}
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(auth)/register' as any)}
        >
          <Text style={styles.primaryTxt}>Créer un compte</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
          <Text style={styles.secondaryTxt}>J'ai déjà un compte</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1, backgroundColor: '#EFF5F3',
    alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  splashTitle: { fontSize: 32, fontWeight: '800', color: '#162032', fontFamily: 'serif' },
  splashSub: { fontSize: 16, color: '#4A6560' },

  safe: { flex: 1, backgroundColor: '#FDF6EE' },

  slide: {
    width: W, paddingHorizontal: 32,
    alignItems: 'center', justifyContent: 'center',
    paddingBottom: 40, gap: 20,
  },
  illustrationWrap: {
    width: W * 0.7, height: W * 0.7, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  slideEmoji: { fontSize: 100 },
  slideTitle: {
    fontSize: 30, fontWeight: '800', color: '#162032',
    fontFamily: 'serif', textAlign: 'center', lineHeight: 38,
  },
  slideSub: { fontSize: 16, color: '#4A6560', textAlign: 'center', lineHeight: 24 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C8D8D4' },
  dotActive: { width: 24, backgroundColor: '#2EC4B6' },

  cta: { paddingHorizontal: 24, paddingBottom: 32, gap: 16 },
  primaryBtn: {
    backgroundColor: '#162032', borderRadius: 999,
    paddingVertical: 18, alignItems: 'center',
  },
  primaryTxt: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  secondaryTxt: { fontSize: 15, fontWeight: '600', color: '#2EC4B6', textAlign: 'center' },
});
