import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { LogoMark } from '@/components/logo-mark';
import { useColors } from '@/hooks/use-colors';

const WEBCHAT_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; width: 100%; overflow: hidden; background: #f8f9fa; }
  </style>
</head>
<body>
  <script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"></script>
  <script src="https://files.bpcontent.cloud/2026/05/23/19/20260523194416-XFF7XLJP.js" defer></script>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        if (window.botpress) {
          window.botpress.on('ready', function() {
            window.botpress.open();
          });
        }
      }, 500);
    });
  </script>
</body>
</html>
`;

export default function ChatScreen() {
  const router = useRouter();
  const colors = useColors();

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: colors.headerBg,
      paddingHorizontal: 8, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerInfo: { flex: 1 },
    headerName: { fontSize: 16, fontWeight: '700', color: colors.text },
    onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
    onlineTxt: { fontSize: 12, color: colors.textSecondary },

    webview: { flex: 1 },
  });

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <LogoMark size={32} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>Coach IA</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineTxt}>En ligne</Text>
            </View>
          </View>
        </View>
        {/* @ts-ignore — iframe est valide sur web */}
        <iframe
          srcDoc={WEBCHAT_HTML}
          style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <LogoMark size={32} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Coach IA</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineTxt}>En ligne</Text>
          </View>
        </View>
      </View>

      <WebView
        source={{ html: WEBCHAT_HTML }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />

    </SafeAreaView>
  );
}
