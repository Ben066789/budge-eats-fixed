import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { APP_SPACING, COLORS } from "../theme/colors";

export default function LoginScreen({ navigation }) {
  const { signInWithEmail, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    try {
      setBusy(true);
      await fn();
    } catch (e) {
      Alert.alert("Auth error", e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <Text style={styles.title}>BudgeEats</Text>
        <Text style={styles.subtitle}>Sign in and manage meal budgets in pesos.</Text>

        <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor={COLORS.mutedText}
        style={styles.input}
      />

        <Text style={styles.label}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor={COLORS.mutedText}
        style={styles.input}
      />

      {busy ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : (
        <>
            <TouchableOpacity style={styles.primaryButton} onPress={() => run(() => signInWithEmail(email, password))}>
              <Text style={styles.primaryButtonText}>Sign in</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleButton} onPress={() => run(() => signInWithGoogle())}>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.linkText}>Don't have an account? </Text>
              <Text style={[styles.linkText, styles.linkBold]}>Create one</Text>
            </TouchableOpacity>
        </>
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: "center",
    padding: APP_SPACING.screenPadding,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 14,
    color: COLORS.mutedText,
  },
  label: {
    marginBottom: 6,
    color: COLORS.text,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 11,
    marginBottom: 12,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  loader: {
    marginVertical: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: COLORS.moss,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  googleButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  googleButtonText: {
    color: "#03211E",
    fontWeight: "700",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  linkText: {
    color: COLORS.mutedText,
    fontSize: 14,
  },
  linkBold: {
    color: COLORS.accent,
    fontWeight: "700",
  },
});