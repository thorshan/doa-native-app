import { ROUTES } from "@/constants/routes";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const PADDING = 16;

const HubCard = ({ item, onPress }: any) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], width: "100%", marginBottom: 16 }}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress(item.path);
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardContainer}
      >
        <LinearGradient
          colors={item.gradient}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.bgChar}>{item.char}</Text>

          <View style={styles.cardContentRow}>
            <View style={styles.iconTitleGroup}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon as any} size={24} color="white" />
              </View>
              <View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubTitle}>{item.description}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const DoaHub = () => {
  const { colors } = useTheme();
  const router = useRouter();

  const categories = useMemo(
    () => [
      {
        title: "Grammar",
        description: "Structure & Patterns",
        char: "文",
        path: ROUTES.GRAMMAR,
        gradient: ["#FF9A8B", "#FF6A88"],
        icon: "extension-puzzle-outline",
      },
      {
        title: "Moji-Goi",
        description: "Vocabulary & Kanji",
        char: "字",
        path: ROUTES.MOJI_GOI,
        gradient: ["#A18CD1", "#FBC2EB"],
        icon: "language-outline",
      },
      {
        title: "Reading",
        description: "Comprehension",
        char: "読",
        path: "/reading",
        gradient: ["#84FAB0", "#8FD3F4"],
        icon: "book-outline",
      },
      {
        title: "Speaking",
        description: "Pronunciation & Oral",
        char: "話", 
        path: "/speaking",
        gradient: ["#FA709A", "#FEE140"],
        icon: "mic-outline",
      },
    ],
    []
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Doa Hub</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.title}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: PADDING, paddingTop: 10 }}
        renderItem={({ item }) => (
          <HubCard item={item} onPress={(path: string) => router.push(path)} />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  cardContainer: {
    height: 110,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    justifyContent: "center",
    overflow: "hidden",
  },
  bgChar: {
    position: "absolute",
    right: -10,
    bottom: -20,
    fontSize: 120,
    fontWeight: "900",
    color: "rgba(255, 255, 255, 0.18)",
  },
  cardContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconTitleGroup: { flexDirection: "row", alignItems: "center", gap: 16 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { color: "white", fontSize: 20, fontWeight: "800" },
  cardSubTitle: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "500", marginTop: 2 },
});

export default DoaHub;