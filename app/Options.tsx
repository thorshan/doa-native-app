import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { userApi } from "@/api/userApi";
import { ROUTES } from "@/constants/routes";
import { useTheme } from "@/theme/ThemeProvider";

const Options = () => {
  const { colors } = useTheme();
  const [userData, setUserData] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await userApi.getUserData();
        setUserData(res.data);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    fetchUserData();
  }, []);

  const handleChoice = async (level: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!userData?._id) return;

    try {
      setUpdating(true);
      await userApi.updateUserLevel(userData._id, { level });
      router.replace(ROUTES.HOME); // Using replace so they can't go back to this screen
    } catch (error) {
      console.error(error);
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Choose Your Level
          </Text>
          <Text style={[styles.subtitle, { color: colors.text + "60" }]}>
            Pick a starting point that fits your current Japanese knowledge.
          </Text>
        </View>

        {/* Option Cards */}
        <View style={styles.optionsWrapper}>
          <OptionCard
            title="Absolute Beginner"
            description="I'm new to Japanese. Start from Hiragana and Katakana."
            icon="school-outline"
            onPress={() => handleChoice("Beginner")}
            colors={colors}
            disabled={updating}
          />

          <OptionCard
            title="Know Basics"
            description="I know Kana and basic grammar. Start from N5 patterns."
            icon="book-outline"
            onPress={() => handleChoice("Basic")}
            colors={colors}
            disabled={updating}
          />
        </View>

        {updating && (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        )}
      </View>
    </SafeAreaView>
  );
};

/* ================= HELPER COMPONENT ================= */
const OptionCard = ({
  title,
  description,
  icon,
  onPress,
  colors,
  disabled,
}: any) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.card,
      {
        backgroundColor: colors.surface,
        borderColor: pressed ? colors.primary : colors.text + "10",
        opacity: disabled ? 0.6 : 1,
      },
    ]}
  >
    <View style={[styles.iconBox, { backgroundColor: colors.primary + "10" }]}>
      <Ionicons name={icon} size={28} color={colors.primary} />
    </View>
    <View style={styles.cardText}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.cardDesc, { color: colors.text + "50" }]}>
        {description}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.text + "20"} />
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  header: { marginBottom: 40, alignItems: "center" },
  title: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  optionsWrapper: { gap: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  cardDesc: { fontSize: 13, fontWeight: "500", lineHeight: 18 },
});

export default Options;
