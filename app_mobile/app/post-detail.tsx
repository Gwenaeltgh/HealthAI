import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Image, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';
import { feedService } from '@/services/feed.service';
import { useAuthStore } from '@/stores/auth.store';
import { useFeedStore } from '@/stores/feed.store';
import type { Comment } from '@/types';

const AVATAR_COLORS = ['#2EC4B6', '#5A627B', '#9A4520', '#4C9AFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function avatarColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function CommentRow({ comment }: { comment: Comment }) {
  const colors = useColors();
  const isLocal = comment.authorId === 'me';
  const color = comment.authorAvatarColor ?? avatarColor(comment.authorName);
  const styles = StyleSheet.create({
    comment: { flexDirection: 'row', gap: 12 },
    commentAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    commentAvatarTxt: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
    commentBody: { flex: 1, gap: 5 },
    commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    commentName: { fontSize: 13, fontWeight: '600', color: colors.text },
    youBadge: { fontSize: 12, fontWeight: '400', color: colors.primary },
    commentTime: { fontSize: 11, color: colors.textSecondary },
    commentTxt: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
    commentLike: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    commentLikeTxt: { fontSize: 12, color: colors.textSecondary },
  });
  return (
    <View style={styles.comment}>
      <View style={[styles.commentAvatar, { backgroundColor: color }]}>
        <Text style={styles.commentAvatarTxt}>{comment.authorInitials}</Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>
            {comment.authorName}
            {isLocal && <Text style={styles.youBadge}> · vous</Text>}
          </Text>
          <Text style={styles.commentTime}>{comment.timeAgo}</Text>
        </View>
        <Text style={styles.commentTxt}>{comment.body}</Text>
        <View style={styles.commentLike}>
          <Ionicons name="heart-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.commentLikeTxt}>{comment.likes}</Text>
        </View>
      </View>
    </View>
  );
}

export default function PostDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { posts, localComments, addComment, toggleLike, toggleSave } = useFeedStore();
  const { user } = useAuthStore();

  const post = posts.find(p => p.id === postId);
  const [redditComments, setRedditComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!postId) return;
    feedService.getComments(postId)
      .then(setRedditComments)
      .finally(() => setLoadingComments(false));
  }, [postId]);

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.headerBg,
      paddingHorizontal: 4, paddingVertical: 10,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text, fontFamily: 'serif' },

    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    errorTxt: { fontSize: 15, color: colors.textSecondary },

    scroll: { padding: 16, gap: 16, paddingBottom: 24 },

    postCard: {
      backgroundColor: colors.surface,
      borderRadius: 16, borderWidth: 1, borderColor: colors.border,
      padding: 20, gap: 14,
    },
    postHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    postHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    avatarTxt: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
    authorName: { fontSize: 14, fontWeight: '600', color: colors.text },
    timeAgo: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },

    postBody: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
    postImage: { borderRadius: 14, height: 200 },

    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: `${colors.primary}18` },
    tagTxt: { fontSize: 12, fontWeight: '500', color: colors.primaryDark },

    actionsRow: {
      flexDirection: 'row', alignItems: 'center', gap: 20,
      paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border,
    },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionTxt: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },

    commentsTitle: { fontSize: 16, fontWeight: '700', color: colors.text },

    emptyComments: { alignItems: 'center', paddingVertical: 32 },
    emptyTxt: { fontSize: 14, color: colors.textSecondary },

    inputBar: {
      flexDirection: 'row', alignItems: 'flex-end', gap: 10,
      padding: 12, backgroundColor: colors.surface,
      borderTopWidth: 1, borderTopColor: colors.border,
    },
    inputAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
    inputAvatarTxt: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
    input: {
      flex: 1, fontSize: 14, color: colors.text,
      backgroundColor: colors.surfaceContainer,
      borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
      maxHeight: 100,
    },
    sendBtn: { padding: 8, paddingBottom: 10 },
  });

  if (!post) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorTxt}>Publication introuvable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const myComments = localComments[postId] ?? [];
  const allComments = [...myComments, ...redditComments];
  const totalComments = allComments.length;

  const authorInitials = user ? `${user.firstName[0]}${user.lastName[0] ?? ''}`.toUpperCase() : 'M';
  const authorName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Moi';

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    addComment(postId!, trimmed, {
      name: authorName,
      initials: authorInitials,
      color: colors.primary,
    });
    setText('');
    inputRef.current?.blur();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publication</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <TouchableOpacity
                style={styles.postHeaderLeft}
                onPress={() => router.push({
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
                })}
              >
                {post.authorAvatar ? (
                  <Image source={{ uri: post.authorAvatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: post.authorAvatarColor }]}>
                    <Text style={styles.avatarTxt}>{post.authorInitials}</Text>
                  </View>
                )}
                <View>
                  <Text style={styles.authorName}>{post.authorName}</Text>
                  <Text style={styles.timeAgo}>{post.timeAgo}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.postBody}>{post.body}</Text>

            {post.imageUrl && (
              <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
            )}

            <View style={styles.tagsRow}>
              {post.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagTxt}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(post.id)}>
                <Ionicons
                  name={post.liked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={post.liked ? colors.error : colors.textSecondary}
                />
                <Text style={[styles.actionTxt, post.liked && { color: colors.error }]}>{post.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => inputRef.current?.focus()}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.actionTxt}>{post.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleSave(post.id)} style={{ marginLeft: 'auto' }}>
                <Ionicons
                  name={post.saved ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={post.saved ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.commentsTitle}>
            {loadingComments ? 'Commentaires…' : `Commentaires (${totalComments})`}
          </Text>

          {loadingComments ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
          ) : allComments.length === 0 ? (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyTxt}>Soyez le premier à commenter !</Text>
            </View>
          ) : (
            allComments.map(c => <CommentRow key={c.id} comment={c} />)
          )}

        </ScrollView>

        <View style={styles.inputBar}>
          <View style={[styles.inputAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.inputAvatarTxt}>{authorInitials}</Text>
          </View>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Ajouter un commentaire…"
            placeholderTextColor={colors.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={!text.trim()}>
            <Ionicons name="send" size={18} color={text.trim() ? colors.primary : colors.outlineVariant} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
