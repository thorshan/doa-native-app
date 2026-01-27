import { chapterApi } from "@/api/chapterApi";
import { progressApi } from "@/api/progressApi";
import { ROUTES } from "@/constants/routes";
import { translations } from "@/constants/translations";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ChapterDetails = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const {language} = useLanguage();

  const [chapter, setChapter] = useState<any>(null);
  const [chapterProgress, setChapterProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const primaryGradient = ["#047e4b", "#16c47f"];

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const levelTag = user?.level?.current?.code || "N5";

        // 1. Fetch Chapter Curriculum and Course Progress
        const [chapterRes, progressRes] = await Promise.all([
          chapterApi.getFullChapter(id as string),
          progressApi.getCourseProgress(levelTag),
        ]);

        setChapter(chapterRes?.data?.data);

        // 2. RENEWED LOGIC: Find this specific chapter's progress inside the course array
        const allChapters = progressRes?.data?.data?.completedChapter || [];
        const specificProgress = allChapters.find(
          (ch: any) => ch.chapterId.toString() === id
        );

        setChapterProgress(specificProgress);
      } catch (err) {
        console.error("Failed to load chapter details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user?.level?.current]);

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#047e4b" />
      </View>
    );

  // RENEWED DATA BINDING
  const isPassed = chapterProgress?.isSectionCompleted; 
  const modules = chapterProgress?.completedSection;
  const score = chapterProgress?.score || 0;

  const handleMainAction = () => {
    if (!modules?.speaking)
      return router.push(ROUTES.CHAPTER_SPEAKING(id as string));
    if (!modules?.grammar)
      return router.push(ROUTES.CHAPTER_GRAMMAR(id as string));
    if (!modules?.renshuuA)
      return router.push(ROUTES.CHAPTER_RENSHUUA(id as string));
    if (!modules?.renshuuB)
      return router.push(ROUTES.CHAPTER_RENSHUUB(id as string));
    if (!modules?.renshuuC)
      return router.push(ROUTES.CHAPTER_RENSHUUC(id as string));

    router.push(ROUTES.CHAPTER_TEST(id as string));
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.navHeader}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {translations[language].chapter} {chapter?.index || "0"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bentoContainer}>
          <LinearGradient colors={primaryGradient} style={styles.hubCard}>
            <Text style={styles.bgChar}>文</Text>
            <View style={styles.cardContent}>
              <View style={styles.iconCircle}>
                <Ionicons name="extension-puzzle" size={20} color="white" />
              </View>
              <Text style={styles.cardTitle}>
                {chapter?.grammars?.length || 0} {translations[language].patterns}
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.sideColumn}>
            <LinearGradient colors={primaryGradient} style={styles.sideCard}>
              <Text style={styles.bgCharSmall}>話</Text>
              <Ionicons name="mic" size={18} color="white" />
              <Text style={styles.sideTitle}>
                {chapter?.speaking?.[0]?.title || "Speaking"}
              </Text>
            </LinearGradient>

            <LinearGradient
              colors={isPassed ? ["#d94c4c", "#ff7919"] : primaryGradient}
              style={styles.sideCard}
            >
              <Text style={styles.bgCharSmall}>試</Text>
              <Ionicons
                name={isPassed ? "checkmark-circle" : "trophy"}
                size={18}
                color="white"
              />
              <Text style={styles.sideTitle}>
                {isPassed ? translations[language].passed_with + ` ${score}%` : chapter?.exam?.title}
              </Text>
            </LinearGradient>
          </View>
        </View>

        <Text style={[styles.sectionHeader, { color: colors.text + "60" }]}>
          {translations[language].chapter_details}
        </Text>

        <View
          style={[styles.listContainer, { backgroundColor: colors.surface }]}
        >
          {[
            {
              key: "speaking",
              label: translations[language].s_speaking,
              icon: "mic-outline",
              route: ROUTES.CHAPTER_SPEAKING(id as string),
              sub: chapter?.speaking?.[0]?.title,
            },
            {
              key: "grammar",
              label: translations[language].s_grammar,
              icon: "extension-puzzle-outline",
              route: ROUTES.CHAPTER_GRAMMAR(id as string),
              sub: `${chapter?.grammars?.length || 0} ` + translations[language].pattern,
            },
            {
              key: "renshuuA",
              label: translations[language].renshuua,
              icon: "document-text-outline",
              route: ROUTES.CHAPTER_RENSHUUA(id as string),
              sub: translations[language].set + " A",
            },
            {
              key: "renshuuB",
              label: translations[language].renshuub,
              icon: "document-text-outline",
              route: ROUTES.CHAPTER_RENSHUUB(id as string),
              sub: translations[language].set + " B",
            },
            {
              key: "renshuuC",
              label: translations[language].renshuuc,
              icon: "document-text-outline",
              route: ROUTES.CHAPTER_RENSHUUC(id as string),
              sub: translations[language].set + " C",
            },
          ].map((item, index) => (
            <React.Fragment key={item.key}>
              <Pressable
                style={styles.listItem}
                onPress={() => router.push(item.route)}
              >
                <Ionicons
                  name={
                    modules?.[item.key]
                      ? "checkmark-circle"
                      : (item.icon as any)
                  }
                  size={22}
                  color={modules?.[item.key] ? "#047e4b" : colors.text + "30"}
                  style={styles.listIcon}
                />
                <View style={styles.textGroup}>
                  <Text style={[styles.listText, { color: colors.text }]}>
                    {item.label}
                  </Text>
                  <Text style={styles.subText}>{item.sub}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={colors.text + "20"}
                />
              </Pressable>
              {index < 4 && <View style={styles.divider} />}
            </React.Fragment>
          ))}

          <View style={styles.divider} />

          <Pressable
            style={styles.listItem}
            onPress={() => router.push(ROUTES.CHAPTER_TEST(id as string))}
          >
            <Ionicons
              name={isPassed ? "checkmark-circle" : "trophy-outline"}
              size={22}
              color={isPassed ? "#047e4b" : "#FA709A"}
              style={styles.listIcon}
            />
            <View style={styles.textGroup}>
              <Text style={[styles.listText, { color: colors.text }]}>
                {translations[language].chapter_test}
              </Text>
              <Text
                style={[
                  styles.subText,
                  { color: isPassed ? colors.primary : "#FA709A" },
                ]}
              >
                {isPassed
                  ? translations[language].passed_with + ` ${score}%`
                  : "Locked until finished"}
              </Text>
            </View>
          </Pressable>
        </View>

        <Pressable onPress={handleMainAction} style={styles.mainBtnWrapper}>
          <LinearGradient
            colors={primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.mainBtn}
          >
            <Text style={styles.mainBtnText}>
              {isPassed ? translations[language].review : translations[language].continue}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </Pressable>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles remain exactly as provided...
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "900" },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  scrollContent: { paddingHorizontal: 16 },
  bentoContainer: { flexDirection: "row", gap: 12, marginBottom: 25 },
  hubCard: {
    flex: 1,
    height: 180,
    borderRadius: 28,
    padding: 20,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  sideColumn: { flex: 1, gap: 12 },
  sideCard: {
    flex: 1,
    borderRadius: 28,
    padding: 16,
    overflow: "hidden",
    justifyContent: "center",
  },
  bgChar: {
    position: "absolute",
    right: -10,
    bottom: -20,
    fontSize: 110,
    fontWeight: "900",
    color: "rgba(255, 255, 255, 0.12)",
  },
  bgCharSmall: {
    position: "absolute",
    right: -5,
    bottom: -10,
    fontSize: 65,
    fontWeight: "900",
    color: "rgba(255, 255, 255, 0.1)",
  },
  cardContent: { gap: 8 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { color: "white", fontSize: 18, fontWeight: "800" },
  cardLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sideTitle: { color: "white", fontSize: 12, fontWeight: "800", marginTop: 6 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 12,
    marginLeft: 5,
    letterSpacing: 1.2,
  },
  listContainer: {
    borderRadius: 28,
    paddingHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 20 },
  listIcon: { marginRight: 15 },
  textGroup: { flex: 1 },
  listText: { fontSize: 16, fontWeight: "700" },
  subText: { fontSize: 12, color: "gray", marginTop: 3 },
  divider: { height: 1, backgroundColor: "rgba(0,0,0,0.04)" },
  mainBtnWrapper: { marginBottom: 20 },
  mainBtn: {
    height: 64,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    elevation: 5,
  },
  mainBtnText: { color: "white", fontSize: 18, fontWeight: "800" },
});

export default ChapterDetails;
