import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoMark } from '@/components/logo-mark';
import { useColors } from '@/hooks/use-colors';
import { useFeedStore } from '@/stores/feed.store';
import type { Post } from '@/types';
import { shadow } from '@/utils/shadow';

const FILTERS = ['Pour toi', 'Suivi'];

function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const colors = useColors();
  const { toggleLike, toggleSave } = useFeedStore();
  const likeCount = post.likes;

  const styles = StyleSheet.create({
    postCard: {
      backgroundColor: colors.surface,
      borderRadius: 16, padding: 20,
      borderWidth: 1, borderColor: colors.border,
      gap: 14,
      ...shadow('#1A2238', 0.02, 8, 1),
    },
    postHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    postHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: {
      width: 44, height: 44, borderRadius: 22,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
    avatarImg: { width: 44, height: 44, borderRadius: 22 },
    authorName: { fontSize: 14, fontWeight: '600', color: colors.text },
    timeAgo: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
    postBody: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
    postImage: { borderRadius: 14, height: 180, alignItems: 'center', justifyContent: 'center' },
    postImagePlaceholder: { borderRadius: 14, height: 180, alignItems: 'center', justifyContent: 'center' },
    postImageEmoji: { fontSize: 64 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: `${colors.primary}18` },
    tagText: { fontSize: 12, fontWeight: '500', color: colors.primaryDark },
    actions: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border,
    },
    actionsLeft: { flexDirection: 'row', gap: 20 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionCount: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  });

  const goToProfile = () => router.push({
    pathname: '/user-profile' as any,
    params: {
      authorId:          post.authorId,
      authorName:        post.authorName,
      authorInitials:    post.authorInitials,
      authorAvatarColor: post.authorAvatarColor,
      authorAvatar:      post.authorAvatar ?? '',
      authorFollowers:   post.authorFollowers ?? 0,
      authorFollowing:   post.authorFollowing ?? 0,
    },
  });

  return (
    <TouchableOpacity style={styles.postCard} activeOpacity={0.92} onPress={() => router.push({ pathname: '/post-detail' as any, params: { postId: post.id } })}>
      <View style={styles.postHeader}>
        <View style={styles.postHeaderLeft}>
          <TouchableOpacity onPress={goToProfile}>
            {post.authorAvatar ? (
              <Image source={{ uri: post.authorAvatar }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: post.authorAvatarColor }]}>
                <Text style={styles.avatarText}>{post.authorInitials}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={goToProfile}>
            <Text style={styles.authorName}>{post.authorName}</Text>
            <Text style={styles.timeAgo}>{post.timeAgo}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.postBody}>{post.body}</Text>

      {post.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
      ) : post.imageBg ? (
        <View style={[styles.postImagePlaceholder, { backgroundColor: post.imageBg }]}>
          <Text style={styles.postImageEmoji}>{post.imageEmoji}</Text>
        </View>
      ) : null}

      <View style={styles.tagsRow}>
        {post.tags.map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(post.id)}>
            <Ionicons
              name={post.liked ? 'heart' : 'heart-outline'}
              size={20}
              color={post.liked ? colors.error : colors.textSecondary}
            />
            <Text style={[styles.actionCount, post.liked && { color: colors.error }]}>
              {likeCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionCount}>{post.comments}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => toggleSave(post.id)}>
          <Ionicons
            name={post.saved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={post.saved ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function FeedScreen() {
  const router = useRouter();
  const colors = useColors();
  const { posts, isLoading, activeFilter, loadPosts, setFilter } = useFeedStore();

  useEffect(() => {
    loadPosts();
  }, []);

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
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    bell: { padding: 8 },
    addBtnHeader: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
      ...shadow(colors.primary, 0.3, 6, 4),
    },

    scroll: { paddingBottom: 110 },

    filtersWrap: { marginBottom: 4 },
    filtersScroll: { paddingHorizontal: 20, paddingVertical: 16, gap: 10 },
    chip: {
      paddingHorizontal: 16, paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.surfaceContainer,
      borderWidth: 1, borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    chipTextActive: { color: '#FFFFFF' },

    posts: { paddingHorizontal: 16, gap: 20, paddingTop: 4 },

    emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40, gap: 12 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },
    emptyBody: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 21 },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LogoMark size={44} />
          <Text style={styles.brand}>HealthAI Coach</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bell} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtnHeader} onPress={() => router.push('/create-post')}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
          style={styles.filtersWrap}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => { setFilter(f); loadPosts(f); }}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeFilter === 'Suivi' ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyTitle}>Personne à suivre pour l'instant</Text>
            <Text style={styles.emptyBody}>
              Visite le profil d'un membre et appuie sur « Suivre » pour voir ses publications ici.
            </Text>
          </View>
        ) : isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.posts}>
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
