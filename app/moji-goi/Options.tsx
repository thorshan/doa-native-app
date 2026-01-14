import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { translations } from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";

const { width } = Dimensions.get("window");

const SelectOption: React.FC = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { colors } = useTheme();

  // Navigation Handlers
  const handleMoji = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/moji-goi/Moji");
  };

  const handleGoi = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/moji-goi/Goi");
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Back Button Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backCircle}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {translations[language].choose}
        </Text>
        <Text style={[styles.subtitle, { color: colors.text + "60" }]}>
          {language === "mm"
            ? "လေ့လာလိုသော အမျိုးအစားကို ရွေးချယ်ပါ။"
            : "Select the category you want to study."}
        </Text>

        {/* Option Cards */}
        <View style={styles.cardContainer}>
          <Pressable
            onPress={handleMoji}
            style={({ pressed }) => [
              styles.optionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary + "30",
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: colors.primary + "10" },
              ]}
            >
              <Text style={[styles.kanjiIcon, { color: colors.primary }]}>
                字
              </Text>
            </View>
            <Text style={[styles.optionLabel, { color: colors.text }]}>
              {translations[language].moji}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleGoi}
            style={({ pressed }) => [
              styles.optionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary + "30",
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: colors.primary + "10" },
              ]}
            >
              <Ionicons
                name="chatbox-ellipses-outline"
                size={32}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.optionLabel, { color: colors.text }]}>
              {translations[language].goi}
            </Text>
          </Pressable>
        </View>

        {/* Simple Back Button at bottom as requested */}
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={styles.backButtonText}>
            {translations[language].go_back}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 40,
    fontWeight: "500",
  },
  cardContainer: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    justifyContent: "center",
    marginBottom: 40,
  },
  optionCard: {
    width: (width - 64) / 2, // Dynamic width for two columns
    height: 160,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  kanjiIcon: {
    fontSize: 32,
    fontWeight: "bold",
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: "800",
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
  },
  backButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },
});

export default SelectOption;
