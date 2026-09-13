import { Image } from 'react-native';

const logoSrc = require('@/assets/healthAI_logo.png');

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <Image
      source={logoSrc}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
