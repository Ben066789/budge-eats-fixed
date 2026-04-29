import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { firebase } from "../firebase";

// webClientId comes from Firebase Console → Authentication → Sign-in method → Google → Web SDK configuration
GoogleSignin.configure({
  webClientId: "615442835271-YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
});

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Complete redirect sign-in if redirect was used
  useEffect(() => {
    firebase
      .auth()
      .getRedirectResult()
      .then((res) => {
        if (res?.user) console.log("getRedirectResult user:", res.user.email);
      })
      .catch((e) => console.log("getRedirectResult error:", e?.code, e?.message));
  }, []);

  useEffect(() => {
    const unsub = firebase.auth().onAuthStateChanged((u) => {
      console.log("onAuthStateChanged:", u ? { uid: u.uid, email: u.email } : null);
      setUser(u ?? null);
      setInitializing(false);
    });
    return unsub;
  }, []);

  const signInWithEmail = (email, password) =>
    firebase.auth().signInWithEmailAndPassword(email.trim(), password);

  const signUpWithEmail = (email, password) =>
    firebase.auth().createUserWithEmailAndPassword(email.trim(), password);

  const signOut = () => firebase.auth().signOut();

  const signInWithGoogle = async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();

      if (Platform.OS === "web") {
        const res = await firebase.auth().signInWithPopup(provider);
        console.log("Google popup success:", res?.user?.email);
        return res;
      }

      // Native (Android / iOS): use the native Google Sign-In SDK to obtain an
      // ID token, then exchange it for a Firebase credential.
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      // Support both v13+ (signInResult.data.idToken) and older (signInResult.idToken)
      const idToken = signInResult?.data?.idToken ?? signInResult?.idToken;
      const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
      const res = await firebase.auth().signInWithCredential(credential);
      console.log("Google native sign-in success:", res?.user?.email);
      return res;
    } catch (e) {
      console.log("Google sign-in error:", e);
      alert(e?.code ? `${e.code}: ${e.message}` : (e?.message ?? String(e)));
      throw e;
    }
  };

  const value = useMemo(
    () => ({
      user,
      initializing,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}