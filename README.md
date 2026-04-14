# MacManV9

MacMan for V9 — a React Native mobile app for managing Apple Mac devices across your organisation.

## Features

- **Dashboard** — real-time overview of all managed devices with status summary cards and pending update notifications
- **Devices** — searchable, filterable list of all enrolled Macs with storage, battery, and status indicators
- **Device Detail** — per-device system information, quick-action buttons (Restart, Update, Lock, Reports), storage and battery visualisation
- **Alerts** — chronological log of device warnings, info events, and resolved issues
- **Settings** — notification preferences, sync configuration, and account management

## Tech Stack

| Dependency | Version |
|---|---|
| React Native | 0.81 |
| Expo SDK | 54 |
| TypeScript | 5.9 |
| React Navigation | 7 |

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/go) installed on your iOS or Android device (for local testing)

### Installation

```bash
npm install
```

### Running the App

```bash
# Start the Expo development server
npm start

# Open on Android emulator / device
npm run android

# Open on iOS simulator / device (macOS only)
npm run ios

# Open in the browser
npm run web
```

## Project Structure

```
MacManV9/
├── App.tsx                  # Root component
├── index.ts                 # Entry point
├── app.json                 # Expo configuration
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx # Stack + bottom-tab navigator
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── DevicesScreen.tsx
│   │   ├── DeviceDetailScreen.tsx
│   │   ├── AlertsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── data/
│   │   └── mockData.ts      # Sample device/alert data
│   └── types/
│       └── index.ts         # TypeScript interfaces & param lists
└── assets/                  # App icons and splash screen
```
