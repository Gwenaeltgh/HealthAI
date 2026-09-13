import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from '@/constants/colors';
import { useThemeStore } from '@/stores/theme.store';

export function useColors() {
  const system = useColorScheme();
  const { theme } = useThemeStore();
  const effective = theme === 'system' ? system : theme;
  return effective === 'dark' ? darkColors : lightColors;
}

export function useIsDark() {
  const system = useColorScheme();
  const { theme } = useThemeStore();
  const effective = theme === 'system' ? system : theme;
  return effective === 'dark';
}

export type AppColors = typeof lightColors;
