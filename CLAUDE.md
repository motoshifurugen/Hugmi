# CLAUDE.md

This file provides guidance for Claude Code when working with the Hugmi project.

## Project Overview

Hugmi is a cross-platform mobile app (iOS/Android) built with React Native and Expo. It's a morning routine and daily wisdom companion app focused on gentle, sustainable habit-building through inspirational quotes.

**Japanese Name:** ハグミー
**Tagline:** 名言で始める、やさしいモーニングルーティン

## Tech Stack

- **Framework:** React Native 0.76.9 + Expo 52.0.0
- **Language:** TypeScript 5.3.3
- **Routing:** Expo Router (file-based routing)
- **Database:** SQLite via expo-sqlite (local, offline-first)
- **State:** React Hooks + SecureStore
- **UI:** Neomorphic design system with Zen Maru Gothic fonts
- **Build:** EAS (Expo Application Services)

## Project Structure

```
app/                 # Expo Router pages (file-based routing)
  (tabs)/           # Tab navigation screens (home, routine, quotes, settings)
  quotes/           # Quote-related routes
  routine-flow/     # Morning routine workflow
  settings/         # Settings screens
components/          # React components
  common/           # Shared UI components
  quotes/           # Quote-related components
  routine/          # Routine-related components
  celebration/      # Achievement animations
  tutorial/         # Onboarding components
db/                  # SQLite database layer
  schema/           # SQL schema definitions
  seeds/            # Seed data (quotes, routines, etc.)
  utils/            # Database CRUD operations
hooks/               # Custom React hooks
constants/           # App constants (colors, styles, fonts)
utils/               # Utility functions
types/               # TypeScript type definitions
assets/              # Static assets (images, fonts)
android/             # Android native code
ios/                 # iOS native code
```

## Common Commands

```bash
# Development
npm start            # Start Expo development server
npm run android      # Run on Android
npm run ios          # Run on iOS

# Testing
npm test             # Run Jest tests

# Linting
npm run lint         # Run Expo linter

# Building
eas build --platform android --profile development   # Development APK
eas build --platform android --profile production    # Production build
eas build --platform ios --profile production        # iOS production
```

## Key Files

- `app/_layout.tsx` - Root layout, app initialization
- `db/index.ts` - Database singleton and initialization
- `db/seeds/quotes.ts` - Quote seed data (100+ quotes)
- `constants/Colors.ts` - Neomorphic color palette
- `hooks/useNotifications.ts` - Notification scheduling

## Database

SQLite database with these tables:
- `users` - User profiles and settings
- `quotes` - Inspirational quotes (Japanese/English)
- `routines` - User's morning routines
- `routine_logs` - Routine completion tracking
- `mood_logs` - Daily mood tracking
- `favorite_quotes` - Saved quotes
- `viewed_quotes` - Quote viewing history

Database operations are in `db/utils/`. Schema definitions in `db/schema/`.

## Code Style

- Primary language in code comments: Japanese
- Path aliases: Use `@/` for project root imports
- Component naming: PascalCase
- File naming: kebab-case for routes, PascalCase for components
- Follow existing Neomorphic design patterns in `constants/NeuomorphicStyles.ts`

## Important Notes

1. **Offline-first:** No backend server - all data is local SQLite
2. **Japanese-first:** Primary localization is Japanese, English is secondary
3. **Notifications:** Local scheduling via expo-notifications, not server push
4. **Development seeding:** Use `resetDb` flag in `db/index.ts` for dev reset
5. **Haptic feedback:** Most touchable components use haptic feedback

## Testing Changes

When modifying the app:
1. Test on both iOS and Android if possible
2. Test offline functionality
3. Verify database migrations if schema changes
4. Check notification scheduling after time-related changes

## Common Patterns

### Database Access
```typescript
import { Database } from '@/db';
const db = await Database.getInstance();
// Use db/utils/ functions for CRUD operations
```

### Navigation
```typescript
import { router } from 'expo-router';
router.push('/quotes/detail');
router.replace('/(tabs)/home');
```

### Theme Colors
```typescript
import { Colors } from '@/constants/Colors';
const colors = Colors.light; // or Colors.dark
```
