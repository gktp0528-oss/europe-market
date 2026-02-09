# europe-market-app (Expo)

React Native + Expo 기반의 유럽 중고거래 앱 프로젝트입니다.

## 실행

```bash
npm install
npm run start
```

앱 실행 단축 명령:

```bash
npm run android
npm run ios
npm run web
```

## 환경 변수

`.env.local` 파일에서 아래 값을 설정합니다.

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_PHOTON_API_URL=https://photon.komoot.io/api
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=...
```

기존 웹 마이그레이션 호환을 위해 `VITE_*` 변수도 함께 읽지만, 신규 설정은 `EXPO_PUBLIC_*` 사용을 권장합니다.

## 핵심 스택

- Expo SDK 54
- React Native 0.81
- React Navigation (Bottom Tabs + Native Stack)
- Supabase (Auth, DB, Realtime, Storage)
