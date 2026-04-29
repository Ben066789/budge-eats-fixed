import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { firebase } from "../firebase";
import { APP_SPACING, COLORS } from "../theme/colors";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [budget, setBudget] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  React.useEffect(() => {
    const ref = firebase.database().ref(`users/${user.uid}/meals`);
    const listener = ref.on("value", (snapshot) => {
      const data = snapshot.val() ?? {};
      const list = Object.entries(data).map(([id, value]) => ({
        id,
        encodedName: value.encodedName ?? "",
        category: value.category ?? "Uncategorized",
        price: Number(value.price) || 0,
        ingredients: Array.isArray(value.ingredients) ? value.ingredients : [],
        createdAt: value.createdAt ?? 0,
      }));
      list.sort((a, b) => b.createdAt - a.createdAt);
      setMeals(list);
    });

    return () => ref.off("value", listener);
  }, [user.uid]);

  const parsedBudget = Number.parseFloat(budget);

  const filteredMeals = useMemo(() => {
    if (filterCategory === "All") return meals;
    return meals.filter((meal) => meal.category === filterCategory);
  }, [filterCategory, meals]);

  const bestMatch = useMemo(() => {
    if (!Number.isFinite(parsedBudget)) return null;
    const candidates = filteredMeals
      .filter((meal) => meal.price < parsedBudget)
      .sort((a, b) => a.price - b.price);
    return candidates[0] ?? null;
  }, [filteredMeals, parsedBudget]);

  const decodeMealName = (value) => {
    try {
      return decodeURIComponent(value);
    } catch (_error) {
      return value;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appTitle}>BudgeEats</Text>
            <Text style={styles.subtitle}>Your meals, your budget.</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate("Profile")}>
            <Text style={styles.profileButtonText}>Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Meal Budget</Text>
          <TextInput
            value={budget}
            onChangeText={setBudget}
            keyboardType="decimal-pad"
            placeholder="Enter budget here"
            placeholderTextColor={COLORS.mutedText}
            style={styles.input}
          />
          <View style={styles.categoryRow}>
            {["All", "Breakfast", "Lunch", "Dinner"].map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryChip, filterCategory === category && styles.categoryChipActive]}
                onPress={() => setFilterCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    filterCategory === category && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate("CreateMeal")}>
          <Text style={styles.createButtonText}>Add Meal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryActionButton} onPress={() => navigation.navigate("Meals")}>
          <Text style={styles.secondaryActionButtonText}>Your Meals</Text>
        </TouchableOpacity>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Meal Suggestions</Text>
          {!Number.isFinite(parsedBudget) ? (
            <Text style={styles.emptyText}>Enter your budget to find the best match.</Text>
          ) : bestMatch ? (
            <View style={styles.bestMatchCard}>
              <Text style={styles.mealName}>{decodeMealName(bestMatch.encodedName)}</Text>
              <Text style={styles.mealMeta}>{bestMatch.category}</Text>
              <Text style={styles.mealPrice}>PHP {bestMatch.price.toFixed(2)}</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No meal found with price greater than your budget.</Text>
          )}
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
  container: {
    padding: APP_SPACING.screenPadding,
    gap: 14,
    paddingBottom: 26,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  appTitle: {
    color: COLORS.text,
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  subtitle: {
    color: COLORS.mutedText,
    marginTop: 4,
    maxWidth: 240,
  },
  profileButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  profileButtonText: {
    color: COLORS.text,
    fontWeight: "700",
  },
  panel: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  panelTitle: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.mutedText,
    fontWeight: "700",
    fontSize: 12,
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  createButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13,
  },
  createButtonText: {
    color: "#231A06",
    fontWeight: "800",
    fontSize: 15,
  },
  secondaryActionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryActionButtonText: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 14,
  },
  bestMatchCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  mealRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 8,
  },
  mealName: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 14,
  },
  mealMeta: {
    color: COLORS.secondary,
    marginTop: 4,
    fontWeight: "700",
    fontSize: 12,
  },
  mealPrice: {
    color: COLORS.accent,
    fontWeight: "800",
    fontSize: 14,
  },
  emptyText: {
    color: COLORS.mutedText,
  },
});