import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { shadow } from '@/utils/shadow';

const PRIMARY = '#2EC4B6';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function PillIcon({ icon, focused }: { icon: IoniconName; focused: boolean }) {
  const styles = StyleSheet.create({
    iconWrap: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 },
    iconWrapActive: { backgroundColor: PRIMARY, paddingHorizontal: 20 },
  });
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={icon} size={22} color={focused ? '#FFFFFF' : '#6B7280'} />
    </View>
  );
}

export default function TabsLayout() {
  const colors = useColors();

  const tabBarStyle = {
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 80 : 68,
    paddingVertical: 8,
    ...shadow('#1A2238', 0.06, 16, 12, -4),
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(107,114,128,0.8)',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <PillIcon icon="fitness-outline" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen name="journal" options={{ href: null }} />

      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ focused }) => (
            <PillIcon icon="chatbubbles-outline" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="coach"
        options={{
          tabBarIcon: ({ focused }) => (
            <PillIcon icon="hardware-chip-outline" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <PillIcon icon="person-outline" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen name="progress" options={{ href: null }} />
    </Tabs>
  );
}
