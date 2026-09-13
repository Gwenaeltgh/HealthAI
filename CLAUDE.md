# CLAUDE.md — HealthAI Coach

## Vue d'ensemble

Application mobile de coaching santé IA (React Native / Expo). Le dossier de travail principal est `app_mobile/`. Un backend existe et tourne (visible sur Grafana : Backend API, API IA, Backoffice tous UP).

## Stack technique

| Besoin | Lib |
|---|---|
| Mobile | React Native + Expo SDK 54 |
| Langage | TypeScript strict |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Appels API | Axios (`services/api.ts`) |
| Cache/requêtes | TanStack Query — **à installer** (pas encore présent) |
| Auth token | expo-secure-store via `utils/storage.ts` |
| Icons | `@expo/vector-icons` — **Ionicons uniquement** (MCI cause des bugs Android) |

## Structure `app_mobile/`

```
app/
  (auth)/         # welcome, login, register, onboarding
  (tabs)/         # index (home), feed, coach, profile, journal, progress
  chat.tsx        # WebView Botpress (mobile)
  post-detail, reco-detail, edit-profile, add-weight, add-food, ...

services/
  api.ts          # axios apiClient + TOKEN_KEY/USER_KEY
  auth.service.ts # MOCK — tokens locaux
  feed.service.ts # HYBRIDE — Reddit pour posts, stubs pour like/create
  health.service.ts # MOCK — recommandations et poids hardcodés
  journal.service.ts # MOCK — 8 aliments hardcodés
  botpress.service.ts # Clé API hardcodée ⚠️ (à déplacer en backend)

stores/           # Zustand : auth.store, feed.store, health.store, journal.store
types/index.ts    # Types TS complets (AuthUser, Post, Food, WeightEntry, etc.)
constants/
  colors.ts       # Palette : primary #2EC4B6
  mockData.ts     # Données de démo — à supprimer quand backend branché
utils/
  storage.ts      # Wrapper expo-secure-store
  shadow.ts       # Helper cross-platform pour les ombres
components/
  logo-mark.tsx   # Logo SVG réutilisable
```

## Configuration API

Variable d'env à créer à la racine de `app_mobile/` :

```bash
# app_mobile/.env
EXPO_PUBLIC_API_URL=http://192.168.x.x:15002/api
```

`apiClient` dans `services/api.ts` lit cette variable. Il injecte automatiquement le Bearer token sur chaque requête.

## Contrat API (routes à brancher)

Routes définies avec le collègue back :

```
GET    /api/social/feed
POST   /api/social/posts
GET    /api/social/posts/:id
POST   /api/social/posts/:id/like
DELETE /api/social/posts/:id/like
GET    /api/social/posts/:id/comments
POST   /api/social/posts/:id/comments
GET    /api/mobile/me
PATCH  /api/mobile/profile
POST   /api/social/media/upload
```

Format de réponse feed attendu :
```json
{
  "id": "post_1",
  "author": { "id": "user_1", "displayName": "Alex", "avatarUrl": "..." },
  "content": "...",
  "mediaUrl": "...",
  "mediaType": "image",
  "likesCount": 12,
  "commentsCount": 3,
  "likedByMe": false,
  "createdAt": "2026-05-23T10:00:00Z"
}
```

## État d'intégration backend

| Service | État actuel | Action requise |
|---|---|---|
| `auth.service.ts` | Mock (tokens locaux) | Brancher `/auth/login` et `/auth/register` |
| `feed.service.ts` | Reddit + stubs | Remplacer par `/api/social/*` |
| `health.service.ts` | Mock hardcodé | Brancher `/api/health/*` (API IA) |
| `journal.service.ts` | Mock hardcodé | Brancher Open Food Facts ou endpoint backend |
| `edit-profile` | UI only | Brancher `PATCH /api/mobile/profile` |
| `add-weight` | Local only | Persister via API |
| `create-post` | Local only | Brancher `POST /api/social/posts` |

## Conventions de code

- **Pas de commentaires** sauf si le WHY est non-évident
- **Ionicons uniquement** pour les icônes (jamais MaterialCommunityIcons)
- **StyleSheet.create()** pour tous les styles — pas de styles inline complexes
- **`colors.*`** pour toutes les couleurs — jamais de valeurs hardcodées sauf blanc/noir
- **`shadow()`** de `utils/shadow.ts` pour les ombres cross-platform
- Les écrans tabs sont dans `app/(tabs)/`, les écrans modaux/push directement dans `app/`
- `Platform.OS === 'web'` pour les branches web-only (Botpress, iframe, etc.)

## Botpress (coach IA)

- Intégré via scripts injectés dynamiquement dans `app/(tabs)/coach.tsx` (web)
- `app/chat.tsx` = WebView pour mobile natif
- La bulle flottante est cachée via CSS dans le Shadow DOM — notre bouton appelle `window.botpress?.open()`
- Clé API dans `services/botpress.service.ts` ⚠️ — **ne pas committer en prod**, déplacer en Supabase Edge Function

## Lancer l'app

```bash
cd app_mobile
npm install
npx expo start          # QR code Expo Go
npx expo start --web    # Navigateur sur http://localhost:8081
npx expo start --android # Émulateur Android
```

## Ce qui reste à faire (priorité)

1. Créer `app_mobile/.env` avec l'URL du backend
2. Installer TanStack Query : `npm install @tanstack/react-query`
3. Remplacer les mocks dans les services par les vraies routes API
4. Expo Image Picker pour l'upload de médias
5. Déplacer les clés Botpress côté backend
