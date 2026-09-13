import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoMark } from '@/components/logo-mark';
import { useColors } from '@/hooks/use-colors';
import { useAuthStore } from '@/stores/auth.store';
import { useHealthStore } from '@/stores/health.store';
import type { Recommendation } from '@/types';

function RecoCard({ reco, onPress }: { reco: Recommendation; onPress?: () => void }) {
  const colors = useColors();
  const styles = StyleSheet.create({
    recoCard: {
      width: 260,
      backgroundColor: colors.surface,
      borderRadius: 14, padding: 20,
      borderWidth: 1, borderColor: colors.border,
      gap: 10, flexShrink: 0,
    },
    recoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    recoTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    recoTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
    recoTitle: { fontSize: 18, fontWeight: '600', color: colors.text, fontFamily: 'serif', lineHeight: 24 },
    recoDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
    recoCta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    recoCtaText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  });
  return (
    <View style={styles.recoCard}>
      <View style={styles.recoTop}>
        <View style={[styles.recoTag, { backgroundColor: reco.tagBg }]}>
          <Text style={[styles.recoTagText, { color: reco.tagColor }]}>
            {reco.tag.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.recoTitle}>{reco.title}</Text>
      <Text style={styles.recoDesc}>{reco.description}</Text>
      <TouchableOpacity style={styles.recoCta} onPress={onPress}>
        <Text style={styles.recoCtaText}>{reco.cta}</Text>
        <Ionicons name="arrow-forward" size={14} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

export default function CoachScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuthStore();
  const { recommendations, isLoading, loadRecommendations } = useHealthStore();

  useEffect(() => {
    loadRecommendations();
    if (typeof document !== 'undefined' && !document.getElementById('bp-inject')) {
      const hideBubble = () => {
        const host = Array.from(document.querySelectorAll('*')).find(
          (el: Element) => el.shadowRoot?.querySelector('.bpFabWrapper')
        );
        if (!host?.shadowRoot) return false;
        if (host.shadowRoot.getElementById('bp-hide-fab')) return true;
        const style = document.createElement('style');
        style.id = 'bp-hide-fab';
        style.textContent = '.bpFabWrapper { display: none !important; }';
        host.shadowRoot.appendChild(style);
        return true;
      };

      const observer = new MutationObserver(() => {
        if (hideBubble()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });

      const s1 = document.createElement('script');
      s1.id = 'bp-inject';
      s1.src = 'https://cdn.botpress.cloud/webchat/v3.6/inject.js';
      s1.onload = () => {
        const s2 = document.createElement('script');
        s2.src = 'https://files.bpcontent.cloud/2026/05/23/19/20260523194416-XFF7XLJP.js';
        document.body.appendChild(s2);
      };
      document.body.appendChild(s1);
    }
  }, []);

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    mobileHeader: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: 24, paddingTop: 20, paddingBottom: 4,
    },
    mobileHeaderTitle: { fontSize: 28, fontWeight: '600', color: colors.text, fontFamily: 'serif' },

    scroll: { padding: 20, gap: 32, paddingBottom: 110 },

    heroCard: {
      backgroundColor: colors.primary,
      borderRadius: 16, padding: 24,
      flexDirection: 'row', alignItems: 'center', gap: 20,
      overflow: 'hidden', position: 'relative',
    },
    heroCircle: {
      position: 'absolute', top: -48, right: -48,
      width: 160, height: 160, borderRadius: 80,
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    heroMascotWrap: {
      width: 96, height: 96, borderRadius: 48,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    heroText: { flex: 1, gap: 8 },
    heroTitle: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', fontFamily: 'serif', lineHeight: 28 },
    heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 19 },

    section: { gap: 16 },
    sectionTitle: { fontSize: 22, fontWeight: '600', color: colors.text, fontFamily: 'serif' },
    recoScrollWrap: { marginHorizontal: -20 },
    recoScroll: { paddingHorizontal: 20, gap: 14, paddingBottom: 4 },

    chatBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
      backgroundColor: colors.primary,
      borderRadius: 14, paddingVertical: 16,
    },
    chatBtnTxt: { fontSize: 15, fontWeight: '600', color: '#fff' },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <View style={styles.mobileHeader}>
        <Text style={styles.mobileHeaderTitle}>Ton coach IA</Text>
        <Ionicons name="sparkles" size={22} color={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.heroCard}>
          <View style={styles.heroCircle} />
          <View style={styles.heroMascotWrap}>
            <LogoMark size={52} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>
              Bonjour {user?.firstName ?? ''} 👋{'\n'}Voici tes recos du jour
            </Text>
            <Text style={styles.heroSub}>
              Basées sur tes données de sommeil, d'activité et de nutrition.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommandations</Text>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recoScroll}
              style={styles.recoScrollWrap}
            >
              {recommendations.map(r => (
                <RecoCard key={r.id} reco={r} onPress={() => router.push('/reco-detail')} />
              ))}
            </ScrollView>
          )}
        </View>

        {typeof document !== 'undefined' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pose une question</Text>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => (window as any).botpress?.open()}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
              <Text style={styles.chatBtnTxt}>Démarrer la conversation</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
