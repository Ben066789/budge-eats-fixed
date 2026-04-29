# Simple Notes App

A per-user notes app built with React Native / Expo and Firebase.

## Features

- **Email / Password auth** – sign up and sign in with Firebase Authentication, with full input validation and user-friendly error messages.
- **Per-user notes** – each user's notes are stored privately under their Firebase account.
- **CRUD** – create, read, update, and delete notes with real-time sync.
- **Offline-friendly** – data is stored in Firebase Realtime Database and syncs in real-time.

## Running the app

### Expo Snack
1. Open [Expo Snack](https://snack.expo.dev) and import or paste the project files.
2. No extra packages needed – all dependencies are listed in `package.json`.
3. The Firebase project is already configured in `firebase.js`.

### Local (Expo CLI)
```bash
npm install
npx expo start
```
Then scan the QR code with **Expo Go**, or press `i` / `a` for iOS/Android simulators.

## Authentication

### Sign In
Open the app and enter your email and password on the Sign In screen.  Tap **Sign in** or **Continue with Google**.

### Sign Up
Tap **Create one** at the bottom of the Sign In screen to open the Sign Up screen.  Fill in:
- **Email** – must be a valid email address.
- **Password** – minimum 6 characters.
- **Confirm password** – must match the password field.

Validation errors are displayed inline.  Firebase errors (e.g. *email already in use*, *weak password*, *network error*) are shown as an alert with a human-readable message.

After a successful sign-up Firebase Authentication persists the session automatically (using `AsyncStorage` on native and `localStorage` on web), so the user stays logged in across app restarts.

### Sign Out
Navigate to **Profile** (tap the avatar icon on the Home screen) and tap **Sign out**.

## Firebase configuration

The project uses the Firebase project **simpleloginsnack** and reads config from `firebase.js`.

| Service | Details |
|---|---|
| Authentication | Email / Password (enabled in Firebase console) |
| Realtime Database | `https://simpleloginsnack-default-rtdb.asia-southeast1.firebasedatabase.app` |

### Realtime Database rules (minimum for the app to work)
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```
Apply these rules in the Firebase console under **Realtime Database → Rules**.

## Data model

Each note is stored at `users/{uid}/notes/{noteId}` with the following fields:

| Field | Type | Description |
|---|---|---|
| `title` | string | Optional title |
| `body` | string | Note content |
| `createdAt` | number | Unix timestamp (ms) |
| `updatedAt` | number | Unix timestamp (ms) |

