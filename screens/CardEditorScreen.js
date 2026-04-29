import React, { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { firebase } from "../firebase";
import { APP_SPACING, COLORS } from "../theme/colors";

export default function CardEditorScreen({ route, navigation }) {
  const { card, deckId, uid } = route.params;
  const [front, setFront] = useState(card.front ?? "");
  const [back, setBack] = useState(card.back ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!front.trim() || !back.trim()) {
      Alert.alert("Both sides required", "Fill in both the front and back before saving.");
      return;
    }
    setSaving(true);
    try {
      await firebase
        .database()
        .ref(`users/${uid}/decks/${deckId}/cards/${card.id}`)
        .update({ front: front.trim(), back: back.trim(), updatedAt: Date.now() });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <Text style={styles.title}>Edit Card</Text>

      <Text style={styles.label}>Front</Text>
      <TextInput
        placeholder="Question or term..."
        placeholderTextColor={COLORS.mutedText}
        value={front}
        onChangeText={setFront}
        multiline
        style={styles.input}
      />

      <Text style={styles.label}>Back</Text>
      <TextInput
        placeholder="Answer or definition..."
        placeholderTextColor={COLORS.mutedText}
        value={back}
        onChangeText={setBack}
        multiline
        style={[styles.input, styles.inputFlex]}
      />

      <View style={styles.rowButtons}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, saving && styles.disabledButton]}
          onPress={save}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>{saving ? "Saving..." : "Save"}</Text>
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
  glowOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -50,
    top: -20,
    backgroundColor: "rgba(86, 177, 180, 0.24)",
  },
  glowTwo: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    left: -70,
    bottom: 100,
    backgroundColor: "rgba(130, 184, 64, 0.17)",
  },
  title: {
    fontSize: 26,
    color: COLORS.pine,
    fontWeight: "800",
    marginBottom: 16,
    letterSpacing: 0.4,
  },
  label: {
    color: COLORS.mutedText,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "#fff",
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputFlex: {
    flex: 1,
  },
  rowButtons: {
    flexDirection: "row",
    columnGap: 8,
    marginBottom: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.pine,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.65,
  },
});
