import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';
import { useFeedStore } from '@/stores/feed.store';
import type { Post } from '@/types';

const SCREEN_W = Dimensions.get('window').width;
const BANNER_H = 160;
const AVATAR_SIZE = 80;

function MiniPostCard({ post }: { post: Post }) {
  const colors = useColors();
  const styles = StyleSheet.create({
    miniCard: {
      backgroundColor: colors.surface,
      borderRadius: 14, padding: 16,
      borderWidth: 1, borderColor: colors.border,
      gap: 10,
    },
    miniBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
    miniImage: { borderRadius: 10, height: 140 },
    miniFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    miniTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
    miniTag: {
      paddingHorizontal: 10, paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: `${colors.primary}18`,
    },
    miniTagText: { fontSize: 11, fontWeight: '500', color: colors.primaryDark },
    miniStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    miniStatText: { fontSize: 12, color: colors.textSecondary, marginRight: 6 },
  });
  return (
    <View style={styles.miniCard}>
      <Text style={styles.miniBody} numberOfLines={3}>{post.body}</Text>
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.miniImage} resizeMode="cover" />
      )}
      <View style={styles.miniFooter}>
        <View style={styles.miniTags}>
          {post.tags.slice(0, 2).map(tag => (
            <View key={tag} style={styles.miniTag}>
              <Text style={styles.miniTagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.miniStats}>
          <Ionicons name="heart-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.miniStatText}>{post.likes}</Text>
          <Ionicons name="chatbubble-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.miniStatText}>{post.comments}</Text>
        </View>
      </View>
    </View>
  );
}

export default function UserProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const { authorId, authorName, authorInitials, authorAvatarColor, authorAvatar, authorFollowers, authorFollowing } =
    useLocalSearchParams<{
      authorId: string;
      authorName: string;
      authorInitials: string;
      authorAvatarColor: string;
      authorAvatar: string;
      authorFollowers: string;
      authorFollowing: string;
    }>();

  const { posts } = useFeedStore();
  const [following, setFollowing] = useState(false);

  const displayName = authorName ?? 'Utilisateur';
  const initials = authorInitials ?? '?';
  const avatarColor = authorAvatarColor ?? colors.primary;
  const avatarUrl = authorAvatar && authorAvatar.length > 0 ? authorAvatar : null;
  const handle = '@' + displayName.toLowerCase().replace(/\s+/g, '_');

  const authorPosts = authorId ? posts.filter(p => p.authorId === authorId) : [];

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.headerBg,
      paddingHorizontal: 4, paddingVertical: 10,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerUsername: { fontSize: 16, fontWeight: '700', color: colors.text },

    banner: {
      width: SCREEN_W, height: BANNER_H,
      backgroundColor: colors.surfaceContainer,
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    },
    bannerOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(46,196,182,0.15)',
    },
    bannerEmoji: { fontSize: 48, opacity: 0.5 },

    avatarWrap: {
      position: 'absolute',
      bottom: -(AVATAR_SIZE / 2),
      left: 20,
    },
    avatarImg: {
      width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
      borderWidth: 3, borderColor: colors.background,
    },
    avatarCircle: {
      width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 3, borderColor: colors.background,
    },
    avatarInitials: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },

    profileInfo: { paddingHorizontal: 20, paddingTop: AVATAR_SIZE / 2 + 12, paddingBottom: 20, gap: 12 },
    name: { fontSize: 22, fontWeight: '700', color: colors.text },
    bio: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },

    statsRow: { flexDirection: 'row', gap: 24 },
    statItem: { alignItems: 'flex-start', gap: 2 },
    statVal: { fontSize: 18, fontWeight: '700', color: colors.text },
    statLbl: { fontSize: 12, color: colors.textSecondary },

    followBtn: {
      backgroundColor: colors.primary,
      borderRadius: 999, paddingVertical: 12,
      alignItems: 'center',
    },
    followBtnActive: {
      backgroundColor: 'transparent',
      borderWidth: 1.5, borderColor: colors.primary,
    },
    followTxt: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
    followTxtActive: { color: colors.primary },

    sectionHeader: {
      paddingHorizontal: 20, paddingVertical: 14,
      borderTopWidth: 1, borderTopColor: colors.border,
    },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },

    postsList: { paddingHorizontal: 16, gap: 12, paddingBottom: 40 },

    emptyState: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 40, gap: 10 },
    emptyTxt: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerUsername}>{handle}</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        <View>
          <View style={styles.banner}>
            <View style={styles.bannerOverlay} />
            <Text style={styles.bannerEmoji}>🍵🌿🍃</Text>
          </View>
          <View style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.bio}>Membre de la communauté HealthAI Coach. 🌱</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{authorPosts.length}</Text>
              <Text style={styles.statLbl}>Publications</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{Number(authorFollowers).toLocaleString('fr-FR')}</Text>
              <Text style={styles.statLbl}>Abonnés</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{Number(authorFollowing).toLocaleString('fr-FR')}</Text>
              <Text style={styles.statLbl}>Abonnements</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.followBtn, following && styles.followBtnActive]}
            onPress={() => setFollowing(f => !f)}
          >
            <Text style={[styles.followTxt, following && styles.followTxtActive]}>
              {following ? 'Abonné·e' : 'Suivre'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Publications</Text>
        </View>

        {authorPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={40} color={colors.outlineVariant} />
            <Text style={styles.emptyTxt}>Aucune publication visible dans le feed actuel</Text>
          </View>
        ) : (
          <View style={styles.postsList}>
            {authorPosts.map(post => (
              <MiniPostCard key={post.id} post={post} />
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
