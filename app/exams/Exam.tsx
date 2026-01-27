import { ROUTES } from "@/constants/routes";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Exam = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const examCategories = [
    {
      id: "final",
      title: "Final Exam",
      desc: "Unlocked via Course Exams",
      icon: "trophy",
      color: "#FF9500",
      enabled: false,
      route: null,
    },
    {
      id: "level",
      title: "Level Test",
      desc: "Unlocked via Profile journey only",
      icon: "git-network",
      color: colors.primary,
      enabled: false,
      route: null,
    },
    {
      id: "jlpt",
      title: "JLPT Mock",
      desc: "Full-length JLPT simulation",
      icon: "school",
      color: "#5856D6",
      enabled: true,
      route: ROUTES.EXAM_MOCK,
    },
    {
      id: "old",
      title: "Old Questions",
      desc: "Previous years' exam bank",
      icon: "time",
      color: "#FF2D55",
      enabled: true,
      route: "/test/archive",
    },
  ];

  const handlePress = (route: string | null) => {
    if (route) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(route as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER SECTION */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.push("/")} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Exam Hub
          </Text>

          {/* Empty View to keep Title Centered */}
          <View style={styles.spacer} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.subHeader}>
          <Text style={[styles.subtitle, { color: colors.text + "60" }]}>
            Challenge your mastery and track progress
          </Text>
        </View>

        <View style={styles.grid}>
          {examCategories.map((item) => (
            <Pressable
              key={item.id}
              disabled={!item.enabled}
              onPress={() => handlePress(item.route)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.text + "08",
                  opacity: item.enabled ? (pressed ? 0.95 : 1) : 0.5,
                },
              ]}
            >
              <View
                style={[styles.iconBox, { backgroundColor: item.color + "15" }]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={26}
                  color={item.color}
                />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  {!item.enabled && (
                    <Ionicons
                      name="lock-closed"
                      size={14}
                      color={colors.text + "40"}
                    />
                  )}
                </View>
                <Text style={[styles.cardDesc, { color: colors.text + "60" }]}>
                  {item.desc}
                </Text>
              </View>

              {item.enabled && (
                <View style={styles.arrowBox}>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.text + "20"}
                  />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.primary + "08",
              borderColor: colors.primary + "20",
            },
          ]}
        >
          <Ionicons
            name="information-circle"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: colors.text + "80" }]}>
            Final Exams Level Tests are strictly regulated.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: {
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  spacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subHeader: {
    marginBottom: 25,
    marginTop: 5,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  grid: {
    gap: 14,
  },
  card: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardTitle: { fontSize: 17, fontWeight: "800" },
  cardDesc: { fontSize: 13, marginTop: 3, lineHeight: 18 },
  arrowBox: { marginLeft: 8 },
  infoCard: {
    marginTop: 30,
    padding: 20,
    borderRadius: 22,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  infoText: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 18 },
});

export default Exam;
