# Capstone Project Progress Tracking System - Mobile

Native mobile application for the Capstone Project Progress Tracking System, built with React Native, Expo, and TypeScript.

## Features

Authentication/session behavior and verification: [Phase B](docs/PHASE_B_AUTH.md).

- **Authentication**: Login, Register with email/password
- **Role-based access**: STUDENT, GROUP_LEADER (mobile scope)
- **Group Management**: Create group, join group, manage members
- **Topics**: Browse capstone topics; direct selection is awaiting a Backend update
- **Consultation schedule**: Awaiting the new Backend contract
- **Progress Tracking**: Submit and view weekly progress reports
- **Document Management**: Upload and manage project documents
- **Real-time Notifications**: In-app notifications with SSE

## Tech Stack

- **Framework**: React Native with Expo SDK 57
- **Routing**: Expo Router (file-based routing)
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Secure Storage**: expo-secure-store
- **Styling**: React Native StyleSheet

## Project Structure

```
src/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Tab navigation screens
│   └── (groups)/          # Group-related screens
├── constants/             # App constants (colors, config)
├── contexts/              # React contexts (Auth)
├── hooks/                 # Custom hooks (TanStack Query)
├── services/              # API services
└── types/                 # TypeScript types

assets/                    # App icons and images
```

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Cài đặt

```bash
# 1. Tạo file .env từ mẫu
cp .env.example .env

# 2. Mở .env và điền EXPO_PUBLIC_API_URL (URL backend, ví dụ https://your-backend.up.railway.app/api/v1)

# 3. Cài dependencies
npm install

# 4. Chạy app (xoá cache để nạp biến môi trường mới)
npx expo start -c
```

> **Lưu ý:** App sẽ báo lỗi khi khởi động nếu thiếu `EXPO_PUBLIC_API_URL`.

### Build bằng EAS

File `.env` **không được commit** lên Git, nên khi build bằng EAS bạn phải khai báo
`EXPO_PUBLIC_API_URL` trong **EAS Environment Variables** (trên expo.dev hoặc bằng
`eas env:create`) cho từng môi trường (development / preview / production).

### Environment Configuration

The app connects to the backend at:
- Android Emulator: `http://10.0.2.2:8080/api/v1`
- iOS Simulator: `http://localhost:8080/api/v1`
- Physical device: Configure your computer's IP address

## API Endpoints

The mobile app connects to these backend APIs:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `GET /auth/google/config` - Google sign-in availability and Web OAuth client ID
- `POST /auth/google` - Exchange `{ idToken, campus }` for the app session

### Google sign-in (login and registration screens)

The backend must configure `GOOGLE_CLIENT_IDS` with the Web OAuth client ID used
by the app. The app loads it from `/auth/google/config`; optionally override it
with `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. No client secret belongs in the app.

- **Android:** Create an Android OAuth client in the same Google Cloud project
  for `com.fpt.capstone.mobile` and register the SHA-1 of each signing certificate
  (development and production). Install a native development/production build,
  e.g. `npx expo run:android` after installing the Android SDK.
- **iOS:** Create an iOS OAuth client for `com.fpt.capstone.mobile` and set
  `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` before building. `app.config.js` registers
  the reversed client ID URL scheme. Rebuild after changing this value.
- **Web:** Add the app origin (including the development port) to the Web OAuth
  client's Authorized JavaScript origins. The app uses Google's official sign-in button.
- **Expo Go:** The Google native SDK requires a development build; tapping the
  button in Expo Go explains this requirement. Email/password remains available.

Choose the correct campus before signing in. On the registration screen, Google
uses the selected campus and signs into an existing account. It does not submit
the registration form or create an account: the current backend requires personal
email accounts to register with a student code and receive admin approval first.
Backend role, approval, account status, and campus checks apply to both screens.

Setup references: [Expo Google authentication](https://docs.expo.dev/guides/google-authentication/)
and [Google Sign-In Expo setup](https://react-native-google-signin.github.io/docs/setting-up/expo).

### Groups
- `GET /groups` - List groups
- `POST /groups` - Create group
- `GET /groups/{id}` - Get group details
- `POST /groups/{id}/applications` - Apply to group
- `POST /groups/{id}/invites` - Invite to group

### Topics
- `GET /topics` - List topics
- `GET /topics/{id}` - Get topic details

### Consultation schedule
The previous booking flow has been removed. The replacement is awaiting the Backend contract.
See [Backend handoff](docs/BACKEND_HANDOFF.md) for pending contracts and current limitations.

### Progress
- `GET /groups/{id}/progress` - Get progress reports
- `POST /groups/{id}/progress` - Submit progress report

### Notifications
- `GET /notifications` - List notifications
- `GET /notifications/stream` - SSE stream for real-time updates

## Backend Repository

The backend API is maintained separately:
- **Location**: `../Capstone-project-progress-tracking-system-BE`
- **Technology**: Spring Boot, PostgreSQL

## Contributing

1. Create a feature branch
2. Make your changes
3. Test on Android emulator and iOS simulator
4. Submit a pull request

## License

MIT License - See LICENSE file for details.
