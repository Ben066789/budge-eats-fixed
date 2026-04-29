import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import {
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyDxQC4s0RhVlyQAylNNFlQnLclK3AT-4Ck",
  authDomain: "simpleloginsnack.firebaseapp.com",
  databaseURL: "https://simpleloginsnack-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "simpleloginsnack",
  storageBucket: "simpleloginsnack.firebasestorage.app",
  messagingSenderId: "615442835271",
  appId: "1:615442835271:web:24382a4a70f7c994518e62",
};

const app = firebase.apps.length
  ? firebase.apps[0]
  : firebase.initializeApp(firebaseConfig);

// Initialise auth with the right persistence layer for each platform:
//   - React Native (iOS/Android): AsyncStorage so the session survives app restarts
//   - Web: browserLocalPersistence (localStorage) so the session survives tab/window closes
//
// NOTE: `import "firebase/compat/auth"` above only *registers* the `.auth()` service;
// it does NOT call initializeAuth yet. By calling initializeAuth here (before any
// firebase.auth() usage in AuthContext), the compat firebase.auth() will find this
// already-initialized instance and return it — this is the recommended pattern for
// React Native + Firebase compat SDK.
initializeAuth(app, {
  persistence:
    Platform.OS === "web"
      ? browserLocalPersistence
      : getReactNativePersistence(AsyncStorage),
});

export { firebase };