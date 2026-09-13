import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';

function SubHeader({ title, onRight, rightLabel }: { title: string; onRight?: () => void; rightLabel?: string }) {
  const router = useRouter();
  const colors = useColors();
  const sh = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.headerBg, paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '600', color: colors.text, fontFamily: 'serif' },
    right: { minWidth: 44, height: 44, alignItems: 'center', justifyContent: 'center', paddingRight: 8 },
    rightTxt: { fontSize: 12, fontWeight: '600', color: colors.primary },
  });
  return (
    <View style={sh.header}>
      <TouchableOpacity onPress={() => router.back()} style={sh.backBtn}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={sh.title}>{title}</Text>
      <View style={sh.right}>
        {rightLabel && onRight && (
          <TouchableOpacity onPress={onRight}>
            <Text style={sh.rightTxt}>{rightLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

type NotifItem = {
  id: string;
  icon?: string;
  avatarBg?: string;
  avatarInitials?: string;
  title: string;
  body?: string;
  time: string;
  unread: boolean;
  iconColor?: string;
};

function NotifRow({ item }: { item: NotifItem }) {
  const colors = useColors();
  const styles = StyleSheet.create({
    notifRow: {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      padding: 14,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    notifRowUnread: { backgroundColor: `${colors.primary}12` },
    notifIcon: {
      width: 44, height: 44, borderRadius: 22,
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    notifIconDefault: { backgroundColor: `${colors.primary}20` },
    notifInitials: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
    notifBody: { flex: 1, gap: 2 },
    notifTitle: { fontSize: 14, fontWeight: '500', color: colors.text, lineHeight: 20 },
    notifBodyTxt: { fontSize: 12, color: colors.textSecondary },
    notifTime: { fontSize: 11, color: colors.textSecondary, flexShrink: 0 },
  });
  return (
    <View style={[styles.notifRow, item.unread && styles.notifRowUnread]}>
      <View style={[styles.notifIcon, item.avatarBg ? { backgroundColor: item.avatarBg } : styles.notifIconDefault]}>
        {item.avatarInitials ? (
          <Text style={styles.notifInitials}>{item.avatarInitials}</Text>
        ) : (
          <Ionicons name={item.icon as any} size={20} color={item.iconColor ?? colors.primary} />
        )}
      </View>
      <View style={styles.notifBody}>
        <Text style={styles.notifTitle}>{item.title}</Text>
        {item.body && <Text style={styles.notifBodyTxt}>{item.body}</Text>}
      </View>
      <Text style={styles.notifTime}>{item.time}</Text>
    </View>
  );
}

export default function NotificationsScreen() {
  const colors = useColors();

  const TODAY: NotifItem[] = [
    { id: '1', avatarInitials: 'MD', avatarBg: '#7B5EA7', title: 'Marc Dupont a aimé votre publication', time: '2 min', unread: true },
    { id: '2', avatarInitials: 'CL', avatarBg: '#3A8EB5', title: 'Claire L. vous suit maintenant', time: '15 min', unread: true },
    { id: '3', icon: 'flame', iconColor: colors.primary, title: 'Rappel déjeuner', body: "N'oubliez pas de logger votre repas", time: '1h', unread: false },
  ];

  const THIS_WEEK: NotifItem[] = [
    { id: '4', icon: 'hardware-chip-outline', iconColor: colors.primary, title: 'Coach IA', body: 'Votre apport en protéines est idéal !', time: '3j', unread: false },
    { id: '5', icon: 'trophy', iconColor: colors.primary, title: 'Nouveau badge !', body: 'Guerrier Hebdo débloqué !', time: '5j', unread: false },
  ];

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: 16, gap: 12, paddingBottom: 40 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1 },
    group: { gap: 2, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SubHeader title="Notifications" rightLabel="Tout lire" onRight={() => {}} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionLabel}>AUJOURD'HUI</Text>
        <View style={styles.group}>
          {TODAY.map(item => <NotifRow key={item.id} item={item} />)}
        </View>

        <Text style={styles.sectionLabel}>CETTE SEMAINE</Text>
        <View style={styles.group}>
          {THIS_WEEK.map(item => <NotifRow key={item.id} item={item} />)}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
