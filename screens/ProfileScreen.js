import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { firebase } from "../firebase";
import { APP_SPACING, COLORS } from "../theme/colors";

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [mealCount, setMealCount] = useState(0);
  const [averagePrice, setAveragePrice] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  useEffect(() => {
    const ref = firebase.database().ref(`users/${user.uid}/meals`);
    const handler = ref.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const meals = Object.values(data);
        setMealCount(meals.length);
        const total = meals.reduce((sum, meal) => sum + (Number(meal.price) || 0), 0);
        setAveragePrice(meals.length ? total / meals.length : 0);
      } else {
        setMealCount(0);
        setAveragePrice(0);
      }
      setLoadingCount(false);
    });

    return () => ref.off("value", handler);
  }, [user.uid]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email ?? "No email"}</Text>

        {loadingCount ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        ) : (
          <>
            <Text style={styles.label}>Total saved meals</Text>
            <Text style={styles.value}>{mealCount}</Text>

            <Text style={styles.label}>Average meal price</Text>
            <Text style={styles.value}>PHP {averagePrice.toFixed(2)}</Text>
          </>
        )}

        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutButtonText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: APP_SPACING.screenPadding,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  backButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  backButtonText: {
    color: COLORS.text,
    fontWeight: "700",
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 16,
    alignItems: "flex-start",
  },
  label: {
    color: COLORS.mutedText,
    fontWeight: "700",
    marginTop: 8,
  },
  value: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 2,
  },
  loader: {
    marginTop: 10,
    marginBottom: 8,
  },
  signOutButton: {
    marginTop: 16,
    width: "100%",
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  signOutButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
