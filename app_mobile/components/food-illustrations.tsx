import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

type FoodIllustrationProps = {
  variant: 'breakfast' | 'lunch' | 'snack';
};

function BreakfastIllustration() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 118">
      <Rect width="320" height="118" fill="#3B424C" />
      <Ellipse cx="160" cy="60" rx="116" ry="58" fill="#B9D1C9" />
      <Ellipse cx="160" cy="60" rx="98" ry="48" fill="#9AB8AF" />
      <Path d="M104 76c10-18 22-29 35-32 13-4 31 0 52 9 7 3 17 3 28-2 8-4 18-7 28-8 11-1 17 0 19 3-4 5-9 11-15 19-6 8-12 17-17 28H104c-2-6-2-12 0-17Z" fill="#84B647" />
      <Path d="M119 82c7-12 16-19 27-23 11-3 24-1 39 6l-8 9c-16-7-31-6-44 3-6 4-11 8-14 13l-10-8Z" fill="#9ED35E" />
      <Ellipse cx="184" cy="56" rx="22" ry="28" fill="#FFF9E8" />
      <Ellipse cx="214" cy="61" rx="22" ry="28" fill="#FFF9E8" />
      <Circle cx="184" cy="58" r="9" fill="#F2AF1D" />
      <Circle cx="214" cy="63" r="9" fill="#F2AF1D" />
      <Rect x="92" y="82" width="136" height="14" rx="4" fill="#6B4C33" />
    </Svg>
  );
}

function LunchIllustration() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 118">
      <Rect width="320" height="118" fill="#35506A" />
      <Ellipse cx="163" cy="67" rx="126" ry="63" fill="#E7DFBD" />
      <Ellipse cx="163" cy="67" rx="107" ry="52" fill="#D5C99B" />
      <Path d="M91 83c8-14 16-23 25-28 8-5 19-9 31-10-4 7-6 16-5 25 2 11 6 21 12 31H91v-18Z" fill="#5B893F" />
      <Path d="M102 91c4-9 8-16 12-21 7-9 16-15 28-18-2 8-2 17 0 25 2 8 5 16 8 24H102v-10Z" fill="#7AB54E" />
      <Rect x="138" y="41" width="42" height="42" rx="10" fill="#F8C85E" transform="rotate(16 138 41)" />
      <Rect x="177" y="52" width="40" height="40" rx="10" fill="#F5B84D" transform="rotate(-18 177 52)" />
      <Circle cx="82" cy="45" r="10" fill="#E6C56B" />
      <Circle cx="98" cy="60" r="10" fill="#E6C56B" />
      <Circle cx="82" cy="74" r="10" fill="#E6C56B" />
      <Circle cx="101" cy="81" r="10" fill="#E6C56B" />
      <Circle cx="112" cy="45" r="10" fill="#E6C56B" />
      <Circle cx="222" cy="44" r="8" fill="#C95B47" />
      <Circle cx="240" cy="58" r="8" fill="#D76D59" />
    </Svg>
  );
}

function SnackIllustration() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 48 48">
      <Rect width="48" height="48" rx="14" fill="#1D2328" />
      <Ellipse cx="24" cy="30" rx="15" ry="8" fill="#6D3C1D" />
      <Ellipse cx="24" cy="26" rx="15" ry="7" fill="#7D4A24" />
      <Circle cx="17" cy="21" r="4" fill="#D39B58" />
      <Circle cx="23" cy="18" r="4" fill="#C88F4E" />
      <Circle cx="29" cy="20" r="4" fill="#D39B58" />
      <Circle cx="32" cy="26" r="4" fill="#C88F4E" />
      <Circle cx="19" cy="27" r="4" fill="#C88F4E" />
      <Circle cx="25" cy="24" r="4" fill="#D39B58" />
    </Svg>
  );
}

export function FoodIllustration({ variant }: FoodIllustrationProps) {
  if (variant === 'breakfast') {
    return <BreakfastIllustration />;
  }

  if (variant === 'lunch') {
    return <LunchIllustration />;
  }

  return <SnackIllustration />;
}
