import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { APP_SPACING, COLORS } from "../theme/colors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function friendlyError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "That email address is already registered. Try signing in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return null;
  }
}

export default function SignUpScreen({ navigation }) {
  const { signUpWithEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!EMAIL_RE.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    try {
      setBusy(true);
      await signUpWithEmail(email, password);
      // AuthContext → onAuthStateChanged will update user state,
      // which causes AppNavigation to switch to the authenticated stack.
    } catch (e) {
      const msg = friendlyError(e?.code) ?? e?.message ?? String(e);
      Alert.alert("Sign up failed", msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start planning meals and budget in pesos.</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={COLORS.mutedText}
            style={[styles.input, errors.email && styles.inputError]}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
            secureTextEntry
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            placeholderTextColor={COLORS.mutedText}
            style={[styles.input, errors.password && styles.inputError]}
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={(v) => { setConfirmPassword(v); setErrors((e) => ({ ...e, confirmPassword: undefined })); }}
            secureTextEntry
            placeholder="Re-enter your password"
            placeholderTextColor={COLORS.mutedText}
            style={[styles.input, errors.confirmPassword && styles.inputError]}
          />
          {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

          {busy ? (
            <ActivityIndicator color={COLORS.primary} style={styles.loader} />
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp}>
              <Text style={styles.primaryButtonText}>Create account</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <Text style={[styles.linkText, styles.linkBold]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: APP_SPACING.screenPadding,
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
    letterSpacing: 0.3,
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
    marginBottom: 4,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginBottom: 8,
  },
  loader: {
    marginVertical: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 14,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
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
