# Capstone Project Progress Tracking System - Mobile

Native mobile application for the Capstone Project Progress Tracking System, built with React Native, Expo, and TypeScript.

## Features

- **Authentication**: Login, Register with email/password
- **Role-based access**: STUDENT, GROUP_LEADER, INSTRUCTOR, COUNCIL, ADMIN
- **Group Management**: Create group, join group, manage members
- **Topic Selection**: Browse and select capstone topics
- **Scheduling**: View and book appointment slots
- **Progress Tracking**: Submit and view weekly progress reports
- **Document Management**: Upload and manage project documents
- **Real-time Notifications**: In-app notifications with SSE

## Tech Stack

- **Framework**: React Native with Expo SDK 52
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

### Groups
- `GET /groups` - List groups
- `POST /groups` - Create group
- `GET /groups/{id}` - Get group details
- `POST /groups/{id}/applications` - Apply to group
- `POST /groups/{id}/invites` - Invite to group

### Topics
- `GET /topics` - List topics
- `GET /topics/{id}` - Get topic details

### Schedule
- `GET /slots` - List available slots
- `POST /slots` - Create slot (Instructor)
- `POST /slots/{id}/book` - Book slot

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
