---
name: HealthAI Design System
colors:
  surface: '#f4fbf8'
  surface-dim: '#d5dbd9'
  surface-bright: '#f4fbf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff5f3'
  surface-container: '#e9efed'
  surface-container-high: '#e3eae7'
  surface-container-highest: '#dde4e2'
  on-surface: '#161d1c'
  on-surface-variant: '#3c4947'
  inverse-surface: '#2b3230'
  inverse-on-surface: '#ecf2f0'
  outline: '#6c7a77'
  outline-variant: '#bbcac6'
  surface-tint: '#006a62'
  primary: '#006a62'
  on-primary: '#ffffff'
  primary-container: '#2ec4b6'
  on-primary-container: '#004c46'
  inverse-primary: '#4fdbcc'
  secondary: '#565e77'
  on-secondary: '#ffffff'
  secondary-container: '#d7dffd'
  on-secondary-container: '#5a627b'
  tertiary: '#9a4520'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff9468'
  on-tertiary-container: '#762b06'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#70f8e8'
  primary-fixed-dim: '#4fdbcc'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dae2ff'
  secondary-fixed-dim: '#bec6e3'
  on-secondary-fixed: '#131b30'
  on-secondary-fixed-variant: '#3e465e'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb599'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#7b2f0a'
  background: '#f4fbf8'
  on-background: '#161d1c'
  surface-variant: '#dde4e2'
typography:
  display-metrics:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  h1-editorial:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
  h2-editorial:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  stack-gap: 16px
  section-gap: 40px
  gutter: 16px
---

## Brand & Style

This design system is defined by a "Humanist-Data" aesthetic, bridging the gap between clinical precision and lifestyle wellness. It targets a French Millennial and Gen Z demographic that values both scientific rigor and emotional well-being. The personality is "Le Coach Bienveillant"—expert yet approachable, professional yet spirited.

The visual style blends **Minimalism** with **Editorial** flourishes. It utilizes a warm, organic foundation (Soft Cream) to reduce the "cold" feeling typical of health-tech, while using high-contrast navy and vibrant teal to signal modern intelligence. The presence of a 2D avocado mascot adds a layer of playfulness and relatability, ensuring the data-heavy experience remains accessible and encouraging.

## Colors

The palette is designed to evoke health, stability, and comfort. 
- **Primary Green (#2EC4B6)**: Used for primary actions, progress indicators, and "success" states. It represents vitality.
- **Deep Navy (#1A2238)**: Used for core text and grounding elements to ensure the app feels "Data-Driven" and authoritative.
- **Soft Cream (#FFFCF7)**: The primary background color to reduce eye strain and provide a warm, premium paper-like feel.
- **Pure White (#FFFFFF)**: Reserved for card surfaces to pop against the cream background.
- **Support Colors**: Warning Amber and Error Coral are used sparingly for critical feedback, maintaining high visibility without breaking the friendly atmosphere.

## Typography

The typography strategy uses a high-contrast pairing to balance personality and utility.
- **Headings**: The use of *Newsreader* provides an editorial, sophisticated look that resonates with French design sensibilities. It feels traditional and trustworthy.
- **Body**: *Inter* ensures maximum legibility for health instructions and data descriptions.
- **Metrics**: Data points (steps, heart rate, calories) use bold, large-scale *Inter* to emphasize results and progress. 

All French copy should respect traditional typesetting rules, including non-breaking spaces before colons and exclamation marks.

## Layout & Spacing

The layout follows a **fluid grid** model optimized for mobile-first consumption. It relies on a 4-column (mobile) and 12-column (tablet/desktop) structure. 

The spacing rhythm is "Generous." We prioritize white space (or "Cream space") to prevent data density from feeling overwhelming. Containers use a standard 24px horizontal padding to give content room to breathe. Vertical stacks should favor 16px for related items and 40px for distinct sections to create a clear visual hierarchy.

## Elevation & Depth

This design system avoids heavy shadows in favor of **Tonal Layers** and **Low-contrast Outlines**. 
- **Surface Tiering**: Cards (#FFFFFF) sit on top of the background (#FFFCF7) to create natural depth without needing shadows.
- **Outlines**: Elements like input fields or secondary containers use a soft, low-opacity version of Navy (#1A2238 at 10%) or 1px strokes.
- **Mascot Interaction**: The avocado mascot remains flat (2D) but can overlap containers to create a sense of layering and engagement.
- **Focus States**: Active elements may use a subtle, diffused glow of the Primary Green to indicate interactivity.

## Shapes

The shape language is "Friendly & Encapsulated." 
- **Cards**: All main content containers use a 16px (1rem) corner radius. This provides a soft, approachable feel while remaining structured.
- **Interactive Elements**: Buttons and tags are strictly pill-shaped (999px). This distinguishes "tappable" items from "informational" cards.
- **Icons**: Icons must be 24px bounding boxes with a consistent 2px stroke weight. Avoid filled icons unless used for an active state in the bottom navigation bar.

## Components

- **Buttons**: Primary buttons are full-width pills in Primary Green with Navy or White text. Secondary buttons are outlined pills with a 2px Navy stroke.
- **Cards**: "Le Journal" (The Log) cards use the 16px radius with a white background. They should include 24px internal padding.
- **Inputs**: Text fields are pill-shaped or 16px rounded rectangles with a soft cream-to-white transition and 2px navy borders on focus.
- **Chips**: Used for health tags (e.g., "Sommeil", "Nutrition"). These are small pill-shaped elements with light teal backgrounds.
- **The Mascot (L'Avocat)**: Appears in empty states, onboarding screens, and "Félicitations" pop-ups. It should always be 2D and flat.
- **Metrics Displays**: Large-scale numbers paired with a "Label-bold" subtitle (e.g., "7 500 PAS").
- **Progress Bars**: Thick, 8px rounded tracks using Primary Green for progress and a darker cream for the remaining track.