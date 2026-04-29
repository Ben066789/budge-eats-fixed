import React, { useMemo, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { firebase } from "../firebase";
import { APP_SPACING, COLORS } from "../theme/colors";

export default function MealsScreen({ navigation }) {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    });

    return () => ref.off("value", listener);
  }, [user.uid]);

  const groupedMeals = useMemo(() => {
    const groups = { Breakfast: [], Lunch: [], Dinner: [] };
    meals.forEach((meal) => {
      if (groups[meal.category]) groups[meal.category].push(meal);
    });
    return groups;
  }, [meals]);

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
          <Text style={styles.title}>Fetched Encoded Meals</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.panel}>
          {loading ? (
            <ActivityIndicator color={COLORS.secondary} />
          ) : meals.length === 0 ? (
            <Text style={styles.emptyText}>No meals saved yet. Create one first.</Text>
          ) : (
            ["Breakfast", "Lunch", "Dinner"].map((category) => (
              <View key={category} style={styles.groupBlock}>
                <Text style={styles.groupTitle}>{category}</Text>
                {groupedMeals[category].length === 0 ? (
                  <Text style={styles.emptyGroup}>No {category.toLowerCase()} meals.</Text>
                ) : (
                  groupedMeals[category].map((meal) => (
                    <View key={meal.id} style={styles.mealRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.mealName}>{decodeMealName(meal.encodedName)}</Text>
                        <Text style={styles.encodedLabel}>Encoded: {meal.encodedName}</Text>
                        <Text style={styles.encodedLabel}>Ingredients: {meal.ingredients.length}</Text>
                      </View>
                      <View style={styles.mealActions}>
                        <Text style={styles.mealPrice}>PHP {meal.price.toFixed(2)}</Text>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => navigation.navigate("CreateMeal", { meal })}
                        >
                          <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            ))
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
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "900",
  },
  backButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backButtonText: {
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
  mealPrice: {
    color: COLORS.accent,
    fontWeight: "800",
    fontSize: 14,
  },
  mealActions: {
    alignItems: "flex-end",
    gap: 6,
  },
  editButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  encodedLabel: {
    color: COLORS.mutedText,
    fontSize: 11,
    marginTop: 4,
  },
  emptyText: {
    color: COLORS.mutedText,
  },
  groupBlock: {
    marginTop: 10,
  },
  groupTitle: {
    color: COLORS.secondary,
    fontWeight: "800",
    fontSize: 13,
  },
  emptyGroup: {
    color: COLORS.mutedText,
    marginTop: 6,
    fontSize: 12,
  },
});
