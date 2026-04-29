import React, { useMemo, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { firebase } from "../firebase";
import { APP_SPACING, COLORS } from "../theme/colors";

const CATEGORIES = ["Breakfast", "Lunch", "Dinner"];

export default function CreateMealScreen({ navigation, route }) {
  const { user } = useAuth();
  const mealToEdit = route?.params?.meal ?? null;
  const isEditing = Boolean(mealToEdit?.id);
  const [name, setName] = useState("");
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientPrice, setIngredientPrice] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [category, setCategory] = useState("Breakfast");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!isEditing) return;
    const decodedName = (() => {
      try {
        return decodeURIComponent(mealToEdit.encodedName ?? "");
      } catch (_error) {
        return mealToEdit.encodedName ?? "";
      }
    })();

    setName(decodedName);
    setCategory(mealToEdit.category ?? "Breakfast");
    setIngredients(
      Array.isArray(mealToEdit.ingredients)
        ? mealToEdit.ingredients.map((item, index) => ({
            id: item.id ?? `${Date.now()}-${index}`,
            name: item.name ?? "",
            price: Number(item.price) || 0,
          }))
        : []
    );
  }, [isEditing, mealToEdit]);

  const encodeMealName = (value) => encodeURIComponent(value.trim());
  const totalPrice = useMemo(
    () => ingredients.reduce((sum, item) => sum + (Number(item.price) || 0), 0),
    [ingredients]
  );

  const addIngredient = () => {
    const parsedPrice = Number.parseFloat(ingredientPrice);
    if (!ingredientName.trim()) {
      Alert.alert("Missing ingredient", "Please add an ingredient name.");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert("Invalid ingredient price", "Please enter a valid PHP amount.");
      return;
    }

    setIngredients((prev) => [
      ...prev,
      { id: Date.now().toString(), name: ingredientName.trim(), price: parsedPrice },
    ]);
    setIngredientName("");
    setIngredientPrice("");
  };

  const removeIngredient = (id) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const saveMeal = async () => {
    if (!name.trim()) {
      Alert.alert("Missing meal name", "Please add a meal name.");
      return;
    }
    if (ingredients.length === 0 || totalPrice <= 0) {
      Alert.alert("No ingredients", "Add at least one ingredient with a valid price.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        encodedName: encodeMealName(name),
        category,
        price: totalPrice,
        ingredients,
        createdAt: mealToEdit?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      };
      const refPath = isEditing
        ? `users/${user.uid}/meals/${mealToEdit.id}`
        : `users/${user.uid}/meals`;
      if (isEditing) {
        await firebase.database().ref(refPath).set(payload);
      } else {
        await firebase.database().ref(refPath).push(payload);
      }
      Alert.alert("Saved", isEditing ? "Meal was updated." : "Meal was added.");
      setName("");
      setIngredientName("");
      setIngredientPrice("");
      setIngredients([]);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Save failed", error?.message ?? String(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Meal</Text>
        {isEditing ? <Text style={styles.editingTag}>Editing existing meal</Text> : null}
        <Text style={styles.subtitle}>
          Add ingredients with prices and the app will total them in PHP.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Meal name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Meal name here"
            placeholderTextColor={COLORS.mutedText}
            style={styles.input}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.categoryChip, category === item && styles.categoryChipActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Ingredient name</Text>
          <TextInput
            value={ingredientName}
            onChangeText={setIngredientName}
            placeholder="Put ingredient name here"
            placeholderTextColor={COLORS.mutedText}
            style={styles.input}
          />

          <Text style={styles.label}>Ingredient price (PHP)</Text>
          <TextInput
            value={ingredientPrice}
            onChangeText={setIngredientPrice}
            keyboardType="decimal-pad"
            placeholder="Put ingredient price here"
            placeholderTextColor={COLORS.mutedText}
            style={styles.input}
          />

          <TouchableOpacity style={styles.addIngredientButton} onPress={addIngredient} disabled={saving}>
            <Text style={styles.addIngredientText}>Add Ingredient</Text>
          </TouchableOpacity>

          <View style={styles.ingredientsCard}>
            <Text style={styles.ingredientsTitle}>Ingredients</Text>
            {ingredients.length === 0 ? (
              <Text style={styles.emptyText}>No ingredients yet.</Text>
            ) : (
              ingredients.map((item) => (
                <View key={item.id} style={styles.ingredientRow}>
                  <View>
                    <Text style={styles.ingredientName}>{item.name}</Text>
                    <Text style={styles.ingredientPrice}>PHP {item.price.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeIngredient(item.id)}>
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
            <Text style={styles.totalText}>Total: ₱ {totalPrice.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, saving && { opacity: 0.7 }]}
            onPress={saveMeal}
            disabled={saving}
          >
            <Text style={styles.primaryButtonText}>
              {saving ? "Saving..." : isEditing ? "Update Meal" : "Save Meal"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()} disabled={saving}>
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
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
  container: {
    padding: APP_SPACING.screenPadding,
    paddingBottom: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.mutedText,
    marginTop: 4,
    marginBottom: 14,
  },
  editingTag: {
    color: COLORS.secondary,
    fontWeight: "700",
    marginTop: 4,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 14,
  },
  label: {
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  categoryChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  categoryText: {
    color: COLORS.mutedText,
    fontWeight: "700",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  addIngredientButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
  },
  addIngredientText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  ingredientsCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  ingredientsTitle: {
    color: COLORS.text,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptyText: {
    color: COLORS.mutedText,
    marginBottom: 8,
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
  },
  ingredientName: {
    color: COLORS.text,
    fontWeight: "700",
  },
  ingredientPrice: {
    color: COLORS.mutedText,
    marginTop: 2,
    fontSize: 12,
  },
  removeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  totalText: {
    color: COLORS.text,
    fontWeight: "900",
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontWeight: "700",
  },
});
