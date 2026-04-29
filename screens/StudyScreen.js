import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { firebase } from "../firebase";
import { APP_SPACING, COLORS } from "../theme/colors";

export default function StudyScreen({ route, navigation }) {
  const { deckId, deckName, uid } = route.params;
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [showingFront, setShowingFront] = useState(true);

  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ref = firebase.database().ref(`users/${uid}/decks/${deckId}/cards`);
    ref.once("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...(val ?? {}), id }));
        list.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
        setCards(list);
      }
      setLoading(false);
    });
  }, [uid, deckId]);

  const flipCard = () => {
    const toValue = showingFront ? 1 : 0;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start(() => setShowingFront(!showingFront));
  };

  const goNext = () => {
    if (index < cards.length - 1) {
      resetFlip();
      setIndex(index + 1);
    }
  };

  const goPrev = () => {
    if (index > 0) {
      resetFlip();
      setIndex(index - 1);
    }
  };

  const resetFlip = () => {
    flipAnim.setValue(0);
    setShowingFront(true);
  };

  const frontRotation = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "90deg", "90deg"],
  });

  const backRotation = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["90deg", "90deg", "0deg"],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.5],
    outputRange: [1, 1, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0.5, 0.51, 1],
    outputRange: [0, 1, 1],
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (cards.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.emptyText}>No cards in this deck.</Text>
        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
          <Text style={styles.doneButtonText}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const card = cards[index];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundOrbOne} />
      <View style={styles.backgroundOrbTwo} />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.deckName}>{deckName}</Text>
        <Text style={styles.progress}>{index + 1} / {cards.length}</Text>
      </View>

      <Text style={styles.tapHint}>Tap the card to flip</Text>

      <TouchableOpacity activeOpacity={0.95} onPress={flipCard} style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.flashCard,
            styles.flashCardFront,
            { transform: [{ rotateY: frontRotation }], opacity: frontOpacity },
          ]}
        >
          <Text style={styles.sideLabel}>FRONT</Text>
          <Text style={styles.cardText}>{card.front}</Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.flashCard,
            styles.flashCardBack,
            { transform: [{ rotateY: backRotation }], opacity: backOpacity },
          ]}
        >
          <Text style={[styles.sideLabel, styles.sideLabelBack]}>BACK</Text>
          <Text style={[styles.cardText, styles.cardTextBack]}>{card.back}</Text>
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navButton, index === 0 && styles.navButtonDisabled]}
          onPress={goPrev}
          disabled={index === 0}
        >
          <Text style={styles.navButtonText}>◀ Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, index === cards.length - 1 && styles.navButtonDisabled]}
          onPress={goNext}
          disabled={index === cards.length - 1}
        >
          <Text style={styles.navButtonText}>Next ▶</Text>
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
  backgroundOrbOne: {
    position: "absolute",
    right: -60,
    top: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(86, 177, 180, 0.24)",
  },
  backgroundOrbTwo: {
    position: "absolute",
    left: -70,
    bottom: 100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(130, 184, 64, 0.17)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  backButtonText: {
    color: COLORS.teal,
    fontWeight: "700",
    fontSize: 15,
  },
  deckName: {
    color: COLORS.pine,
    fontWeight: "800",
    fontSize: 16,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  progress: {
    color: COLORS.mutedText,
    fontWeight: "700",
    fontSize: 14,
  },
  tapHint: {
    textAlign: "center",
    color: COLORS.mutedText,
    fontSize: 12,
    marginBottom: 16,
  },
  cardContainer: {
    flex: 1,
    marginBottom: 20,
  },
  flashCard: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  flashCardFront: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
  },
  flashCardBack: {
    backgroundColor: COLORS.pine,
    borderColor: COLORS.pine,
  },
  sideLabel: {
    position: "absolute",
    top: 16,
    left: 20,
    color: COLORS.mutedText,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  sideLabelBack: {
    color: "rgba(255,255,255,0.6)",
  },
  cardText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 30,
  },
  cardTextBack: {
    color: "#fff",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
    marginBottom: 8,
  },
  navButton: {
    flex: 1,
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  navButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  doneButton: {
    flex: 1,
    backgroundColor: COLORS.moss,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
  loadingText: {
    marginTop: 40,
    textAlign: "center",
    color: COLORS.mutedText,
  },
  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: COLORS.mutedText,
    fontSize: 16,
    marginBottom: 20,
  },
});
