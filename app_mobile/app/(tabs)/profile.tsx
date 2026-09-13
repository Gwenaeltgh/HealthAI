import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';
import { useAuthStore } from '@/stores/auth.store';
import { shadow } from '@/utils/shadow';
import { useFeedStore } from '@/stores/feed.store';

const SCREEN_W = Dimensions.get('window').width;
const BANNER_H = 150;
const AVATAR_SIZE = 84;

const GOAL_LABELS: Record<string, string> = {
  perte: 'Perte de poids',
  gain: 'Prise de masse',
  maintien: 'Maintien',
};

const MY_POSTS = [
  { emoji: '🥗', bg: '#D4EDDA' },
  { emoji: '🏃', bg: '#D6EAF8' },
  { emoji: '🍎', bg: '#FDECEA' },
  { emoji: '🥑', bg: '#D4EDDA' },
  { emoji: '💧', bg: '#D6EAF8' },
  { emoji: '🧘', bg: '#EDE8D8' },
];

type Tab = 'publications' | 'medias' | 'likes';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<Tab>('publications');
  const { user } = useAuthStore();
  const { likedPosts } = useFeedStore();

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
  const initials = user
    ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
    : '?';

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.headerBg,
      paddingHorizontal: 20, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text, fontFamily: 'serif' },
    headerActions: { flexDirection: 'row', gap: 4 },
    headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

    banner: {
      width: SCREEN_W, height: BANNER_H,
      backgroundColor: `${colors.primary}30`,
      alignItems: 'center', justifyContent: 'center',
    },
    bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(46,196,182,0.08)' },
    bannerEmoji: { fontSize: 44, opacity: 0.45 },

    avatarWrap: { position: 'absolute', bottom: -(AVATAR_SIZE / 2), left: 20 },
    avatarCircle: {
      width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 3, borderColor: colors.background,
      ...shadow('#000', 0.1, 8, 3),
    },
    avatarInitials: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },

    tabBar: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderBottomWidth: 1, borderBottomColor: colors.border,
      marginTop: AVATAR_SIZE / 2,
    },
    tab: {
      flex: 1, paddingVertical: 13, alignItems: 'center',
      borderBottomWidth: 2, borderBottomColor: 'transparent',
    },
    tabActive: { borderBottomColor: colors.primary },
    tabTxt: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    tabTxtActive: { color: colors.primary },

    profileInfo: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, gap: 12 },

    nameRow: { gap: 6 },
    name: { fontSize: 22, fontWeight: '700', color: colors.text },
    goalBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
      backgroundColor: `${colors.primary}18`,
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
    },
    goalTxt: { fontSize: 12, fontWeight: '600', color: colors.primaryDark },

    bio: { fontSize: 13, color: colors.textSecondary },

    statsRow: { flexDirection: 'row', gap: 28 },
    statItem: { alignItems: 'flex-start', gap: 2 },
    statVal: { fontSize: 18, fontWeight: '700', color: colors.text },
    statLbl: { fontSize: 11, color: colors.textSecondary },

    actionsRow: { flexDirection: 'row', gap: 10 },
    editBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      borderWidth: 1.5, borderColor: colors.primary, borderRadius: 999,
      paddingVertical: 11,
    },
    editTxt: { fontSize: 13, fontWeight: '700', color: colors.primary },
    progressBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      borderWidth: 1.5, borderColor: colors.border, borderRadius: 999,
      paddingVertical: 11,
    },
    progressTxt: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },

    healthCard: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 14, padding: 16,
      borderWidth: 1, borderColor: colors.border,
    },
    healthStat: { alignItems: 'center', gap: 2 },
    healthVal: { fontSize: 16, fontWeight: '700', color: colors.text },
    healthLbl: { fontSize: 11, color: colors.textSecondary },

    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    gridCell: {
      width: SCREEN_W / 3, height: SCREEN_W / 3,
      alignItems: 'center', justifyContent: 'center',
    },
    gridEmoji: { fontSize: 40 },

    emptyState: { alignItems: 'center', paddingTop: 56, paddingBottom: 40, gap: 12 },
    emptyTxt: { fontSize: 14, color: colors.textSecondary },
    createBtn: {
      backgroundColor: colors.primary, borderRadius: 999,
      paddingHorizontal: 24, paddingVertical: 10, marginTop: 4,
    },
    createTxt: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon profil</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        <View>
          <View style={styles.banner}>
            <View style={styles.bannerOverlay} />
            <Text style={styles.bannerEmoji}>🌿🥗💪</Text>
          </View>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabBar}>
          {(['publications', 'medias', 'likes'] as Tab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabTxt, activeTab === tab && styles.tabTxtActive]}>
                {tab === 'publications' ? 'Publications' : tab === 'medias' ? 'Médias' : 'Likes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{fullName}</Text>
            {user?.goal && (
              <View style={styles.goalBadge}>
                <Ionicons name="flag" size={11} color={colors.primaryDark} />
                <Text style={styles.goalTxt}>{GOAL_LABELS[user.goal] ?? user.goal}</Text>
              </View>
            )}
          </View>

          <Text style={styles.bio}>
            {user?.bio ?? 'Membre HealthAI'} • {user?.currentWeight} kg → {user?.targetWeight} kg
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{MY_POSTS.length}</Text>
              <Text style={styles.statLbl}>Publications</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>0</Text>
              <Text style={styles.statLbl}>Abonnés</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>0</Text>
              <Text style={styles.statLbl}>Abonnements</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
              <Ionicons name="pencil-outline" size={15} color={colors.primary} />
              <Text style={styles.editTxt}>Modifier le profil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.progressBtn} onPress={() => router.push('/progress')}>
              <Ionicons name="trending-up-outline" size={15} color={colors.textSecondary} />
              <Text style={styles.progressTxt}>Ma progression</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.healthCard}>
            <View style={styles.healthStat}>
              <Text style={styles.healthVal}>{user?.startWeight ?? '—'} kg</Text>
              <Text style={styles.healthLbl}>Départ</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.outlineVariant} />
            <View style={styles.healthStat}>
              <Text style={[styles.healthVal, { color: colors.primary }]}>{user?.currentWeight ?? '—'} kg</Text>
              <Text style={styles.healthLbl}>Actuel</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.outlineVariant} />
            <View style={styles.healthStat}>
              <Text style={styles.healthVal}>{user?.targetWeight ?? '—'} kg</Text>
              <Text style={styles.healthLbl}>Objectif</Text>
            </View>
          </View>
        </View>

        {activeTab === 'publications' && (
          MY_POSTS.length > 0 ? (
            <View style={styles.grid}>
              {MY_POSTS.map((item, i) => (
                <View key={i} style={[styles.gridCell, { backgroundColor: item.bg }]}>
                  <Text style={styles.gridEmoji}>{item.emoji}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="image-outline" size={48} color={colors.outlineVariant} />
              <Text style={styles.emptyTxt}>Aucune publication</Text>
              <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/create-post')}>
                <Text style={styles.createTxt}>Créer un post</Text>
              </TouchableOpacity>
            </View>
          )
        )}

        {activeTab === 'medias' && (
          <View style={styles.emptyState}>
            <Ionicons name="videocam-outline" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyTxt}>Aucun média</Text>
          </View>
        )}

        {activeTab === 'likes' && (
  likedPosts.length > 0 ? (
    <View style={styles.grid}>
      {likedPosts.map((post, i) => (
        <TouchableOpacity
          key={post.id}
          style={[
            styles.gridCell,
            {
              backgroundColor: i % 2 === 0 ? '#FDECEA' : '#D6EAF8'
            }
          ]}
        >
          <Ionicons name="heart" size={32} color={colors.primary} />

          <Text
            style={{
              fontSize: 12,
              marginTop: 8,
              color: colors.text,
              textAlign: 'center',
              paddingHorizontal: 6,
            }}
            numberOfLines={3}
          >
            {post.body}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  ) : (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={48} color={colors.outlineVariant} />
      <Text style={styles.emptyTxt}>Aucun like</Text>
    </View>
  )
)}

      </ScrollView>
    </SafeAreaView>
  );
}
