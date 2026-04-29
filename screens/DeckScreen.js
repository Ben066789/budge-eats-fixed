import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { firebase } from "../firebase";
import { APP_SPACING, COLORS } from "../theme/colors";

export default function DeckScreen({ route, navigation }) {
  const { deckId, deckName, uid } = route.params;
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    const ref = firebase.database().ref(`users/${uid}/decks/${deckId}/cards`);
    const handler = ref.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...(val ?? {}), id }));
        list.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
        setCards(list);
      } else {
        setCards([]);
      }
      setLoading(false);
    });
    return () => ref.off("value", handler);
  }, [uid, deckId]);

  const createCard = async () => {
    if (!newFront.trim() || !newBack.trim()) {
      Alert.alert("Both sides required", "Fill in the front and back of the card.");
      return;
    }
    const now = Date.now();
    try {
      await firebase
        .database()
        .ref(`users/${uid}/decks/${deckId}/cards`)
        .push({ front: newFront.trim(), back: newBack.trim(), createdAt: now, updatedAt: now });
      setNewFront("");
      setNewBack("");
      setAdding(false);
    } catch (e) {
      Alert.alert("Error", e?.message ?? String(e));
    }
  };

  const cancelAdding = () => {
    setAdding(false);
    setNewFront("");
    setNewBack("");
  };

  const removeCardById = async (id) => {
    try {
      await firebase.database().ref(`users/${uid}/decks/${deckId}/cards/${id}`).remove();
    } catch (e) {
      Alert.alert("Delete failed", e?.message ?? String(e));
    }
  };

  const deleteCard = (id) => {
    setPendingDeleteId(id);
    setConfirmVisible(true);
  };

  const confirmDelete = () => {
    setConfirmVisible(false);
    void removeCardById(pendingDeleteId);
    setPendingDeleteId(null);
  };

  const cancelDelete = () => {
    setConfirmVisible(false);
    setPendingDeleteId(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundOrbOne} />
      <View style={styles.backgroundOrbTwo} />

      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        {cards.length > 0 && (
          <TouchableOpacity
            style={styles.studyButton}
            onPress={() => navigation.navigate("Study", { deckId, deckName, uid })}
          >
            <Text style={styles.studyButtonText}>Study ▶</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.deckTitle}>{deckName}</Text>
      <Text style={styles.deckMeta}>{cards.length} {cards.length === 1 ? "card" : "cards"}</Text>

      {adding ? (
        <View style={styles.composerCard}>
          <TextInput
            placeholder="Front (question / term)..."
            placeholderTextColor={COLORS.mutedText}
            value={newFront}
            onChangeText={setNewFront}
            multiline
            style={styles.composerInput}
            autoFocus
          />
          <TextInput
            placeholder="Back (answer / definition)..."
            placeholderTextColor={COLORS.mutedText}
            value={newBack}
            onChangeText={setNewBack}
            multiline
            style={styles.composerInput}
          />
          <View style={styles.rowButtons}>
            <TouchableOpacity
              style={[styles.primaryButton, (!newFront.trim() || !newBack.trim()) && styles.disabledButton]}
              onPress={createCard}
              disabled={!newFront.trim() || !newBack.trim()}
            >
              <Text style={styles.primaryButtonText}>Add Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={cancelAdding}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.addCardButton} onPress={() => setAdding(true)}>
          <Text style={styles.addCardButtonText}>+ Add Card</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.pine} />
      ) : cards.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No cards yet</Text>
          <Text style={styles.emptyText}>Tap + Add Card to create your first flashcard.</Text>
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <View style={styles.cardItem}>
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() =>
                  navigation.navigate("CardEditor", { card: item, deckId, uid })
                }
              >
                <Text style={styles.cardIndex}>#{index + 1}</Text>
                <View style={styles.cardSides}>
                  <View style={styles.cardSide}>
                    <Text style={styles.cardSideLabel}>Front</Text>
                    <Text style={styles.cardSideText} numberOfLines={2}>{item.front}</Text>
                  </View>
                  <View style={styles.cardDivider} />
                  <View style={styles.cardSide}>
                    <Text style={styles.cardSideLabel}>Back</Text>
                    <Text style={styles.cardSideText} numberOfLines={2}>{item.back}</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteChip} onPress={() => deleteCard(item.id)}>
                <Text style={styles.deleteChipText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={cancelDelete}>
        <Pressable style={styles.modalOverlay} onPress={cancelDelete}>
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete this card?</Text>
            <Text style={styles.modalBody}>This action cannot be undone.</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={cancelDelete}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDeleteButton} onPress={confirmDelete}>
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: APP_SPACING.screenPadding,
    backgroundColor: COLORS.background,
  },
  backgroundOrbOne: {
    position: "absolute",
    right: -60,
    top: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(86, 177, 180, 0.24)",
  },
  backgroundOrbTwo: {
    position: "absolute",
    left: -70,
    bottom: 120,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(130, 184, 64, 0.17)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  backButtonText: {
    color: COLORS.teal,
    fontWeight: "700",
    fontSize: 15,
  },
  studyButton: {
    backgroundColor: COLORS.pine,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  studyButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  deckTitle: {
    fontSize: 26,
    color: COLORS.pine,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  deckMeta: {
    color: COLORS.mutedText,
    fontSize: 13,
    marginBottom: 14,
  },
  composerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 12,
  },
  composerInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    minHeight: 60,
    backgroundColor: "#fff",
    color: COLORS.text,
    textAlignVertical: "top",
  },
  rowButtons: {
    flexDirection: "row",
    columnGap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.pine,
    borderRadius: 12,
    paddingVertical: 11,
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
    paddingVertical: 11,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.5,
  },
  addCardButton: {
    marginBottom: 12,
    backgroundColor: COLORS.moss,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  addCardButtonText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingBottom: 8,
  },
  emptyCard: {
    marginTop: 40,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  emptyTitle: {
    color: COLORS.pine,
    fontWeight: "800",
    fontSize: 18,
  },
  emptyText: {
    color: COLORS.mutedText,
    textAlign: "center",
    marginTop: 8,
  },
  cardItem: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    backgroundColor: COLORS.card,
    flexDirection: "row",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  cardIndex: {
    color: COLORS.mutedText,
    fontWeight: "700",
    fontSize: 12,
    marginRight: 8,
    width: 24,
  },
  cardSides: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardSide: {
    flex: 1,
  },
  cardDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
    alignSelf: "stretch",
  },
  cardSideLabel: {
    color: COLORS.mutedText,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  cardSideText: {
    color: COLORS.text,
    fontSize: 13,
  },
  deleteChip: {
    backgroundColor: "#FFE6E6",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#F5BABA",
  },
  deleteChipText: {
    color: COLORS.danger,
    fontWeight: "700",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 40, 10, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.pine,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  modalBody: {
    color: COLORS.text,
    marginBottom: 14,
  },
  modalButtonRow: {
    flexDirection: "row",
    columnGap: 8,
  },
  modalCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  modalCancelText: {
    color: COLORS.teal,
    fontWeight: "700",
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  modalDeleteText: {
    color: "#fff",
    fontWeight: "700",
  },
});
