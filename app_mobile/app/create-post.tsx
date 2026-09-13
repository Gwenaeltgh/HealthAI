import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';
import { useAuthStore } from '@/stores/auth.store';

const PRE_TAGS = ['#nutrition', '#équilibre'];
const MORE_TAGS = ['#recette', '#sport', '#bienêtre', '#repas'];

export default function CreatePostScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const canPublish = text.trim().length > 0 || imageUri !== null;

  const initials = user
    ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
    : '?';
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Utilisateur';

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Autorisez l\'accès à la galerie dans les réglages.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Autorisez l\'accès à la caméra dans les réglages.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface },

    header: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.headerBg,
      paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    cancelBtn: { width: 72, alignItems: 'flex-start' },
    cancelTxt: { fontSize: 16, color: colors.textSecondary },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: colors.text, fontFamily: 'serif' },
    publishBtn: { width: 72, alignItems: 'flex-end' },
    publishBtnDisabled: {},
    publishTxt: { fontSize: 16, fontWeight: '700', color: colors.primary },
    publishTxtDisabled: { color: colors.outlineVariant },

    scroll: { padding: 20, gap: 20, paddingBottom: 80 },

    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    avatarTxt: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
    authorInfo: { gap: 6 },
    authorName: { fontSize: 15, fontWeight: '600', color: colors.text },
    audiencePill: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: `${colors.primary}18`,
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start',
    },
    audienceTxt: { fontSize: 12, fontWeight: '600', color: colors.primaryDark },

    bodyInput: {
      fontSize: 16, color: colors.text, lineHeight: 24,
      minHeight: 160,
    },

    tagsSection: { gap: 10 },
    tagsLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tagChip: {
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
      backgroundColor: `${colors.primary}20`,
    },
    tagChipTxt: { fontSize: 13, fontWeight: '600', color: colors.primaryDark },
    tagChipOutline: {
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
      borderWidth: 1, borderColor: colors.border,
    },
    tagChipOutlineTxt: { fontSize: 13, color: colors.textSecondary },

    imagePreviewWrap: { borderRadius: 14, overflow: 'hidden', position: 'relative' },
    imagePreview: { width: '100%', height: 220, borderRadius: 14 },
    imageRemoveBtn: {
      position: 'absolute', top: 8, right: 8,
      backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 13,
    },

    toolbar: {
      flexDirection: 'row', gap: 8,
      padding: 12,
      backgroundColor: colors.surface,
      borderTopWidth: 1, borderTopColor: colors.border,
    },
    toolBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelTxt}>Annuler</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau post</Text>
        <TouchableOpacity style={[styles.publishBtn, !canPublish && styles.publishBtnDisabled]} disabled={!canPublish}>
          <Text style={[styles.publishTxt, !canPublish && styles.publishTxtDisabled]}>Publier</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.authorRow}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarTxt}>{initials}</Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{fullName}</Text>
            <TouchableOpacity style={styles.audiencePill}>
              <Ionicons name="earth-outline" size={12} color={colors.primaryDark} />
              <Text style={styles.audienceTxt}>Public</Text>
              <Ionicons name="chevron-down" size={12} color={colors.primaryDark} />
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={styles.bodyInput}
          multiline
          placeholder="Exprimez-vous sur votre parcours santé..."
          placeholderTextColor={colors.textSecondary}
          value={text}
          onChangeText={setText}
          textAlignVertical="top"
        />

        {imageUri && (
          <View style={styles.imagePreviewWrap}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
            <TouchableOpacity style={styles.imageRemoveBtn} onPress={() => setImageUri(null)}>
              <Ionicons name="close-circle" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tagsSection}>
          <Text style={styles.tagsLabel}>Tags</Text>
          <View style={styles.tagsRow}>
            {PRE_TAGS.map(tag => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipTxt}>{tag}</Text>
              </View>
            ))}
            {MORE_TAGS.map(tag => (
              <TouchableOpacity key={tag} style={styles.tagChipOutline}>
                <Text style={styles.tagChipOutlineTxt}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn} onPress={takePhoto}>
          <Ionicons name="camera-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={pickFromGallery}>
          <Ionicons name="image-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn}>
          <Ionicons name="pricetag-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn}>
          <Ionicons name="happy-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
