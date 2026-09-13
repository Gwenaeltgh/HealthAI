import { Platform } from 'react-native';

function hexToRgb(hex: string): [number, number, number] {
  if (hex.startsWith('#') && hex.length >= 7) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
  }
  return [0, 0, 0];
}

export function shadow(
  color: string,
  opacity: number,
  radius: number,
  elevation: number,
  offsetY = 2,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (Platform.OS !== 'web') {
    return {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
      elevation,
    };
  }
  const [r, g, b] = hexToRgb(color);
  return { boxShadow: `0 ${offsetY}px ${radius}px rgba(${r},${g},${b},${opacity})` };
}
