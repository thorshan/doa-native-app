import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { chapterApi } from "@/api/chapterApi";
import {
  ChapterProgress,
  CourseProgress,
  progressApi,
} from "@/api/progressApi";
import { ROUTES } from "@/constants/routes";
import { translations } from "@/constants/translations";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";

const Course = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const {language} = useLanguage();

  const [chapters, setChapters] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefreshing = false) => {
    if (!user?.level?.current) return;

    isRefreshing ? setRefreshing(true) : setLoading(true);

    try {
      const levelKey = user?.level.current;
      const levelTag = user?.level.current; 

      const [chapterRes, progressRes] = await Promise.all([
        chapterApi.getChapters(levelKey),
        progressApi.getCourseProgress(levelTag),
      ]);

      setChapters(chapterRes?.data.data || []);
      setCourseProgress(progressRes.data.data);
    } catch (err: any) {
      console.error("Fetch Course Data Error:", err);
      Alert.alert(
        "Sync Error",
        "Could not load your progress. Pull down to refresh."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.level?.current]);

  const onRefresh = useCallback(() => fetchData(true), [user?.level?.current]);

  // LOGIC: Calculate stats and derived progress states
  const stats = useMemo(() => {
    // 1. Identify which chapters are fully completed (isSectionCompleted must be true)
    const passedChapterIds = new Set(
      courseProgress?.completedChapter
        ?.filter((ch: ChapterProgress) => ch.isSectionCompleted)
        .map((ch: ChapterProgress) => ch.chapterId.toString()) || []
    );

    const total = chapters.length;
    const completed = passedChapterIds.size;
    const percentage =
      total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0;

    // 2. Identify the next active chapter for the "Continue" card
    const nextChapter = chapters.find(
      (ch) => !passedChapterIds.has(ch._id.toString())
    );

    let currentChapterName = "Start Learning";
    if (total > 0 && completed === total) {
      currentChapterName = "Level Complete! 🎉";
    } else if (nextChapter) {
      currentChapterName = translations[language].chapter + `${nextChapter.index || ""}`;
    }

    return {
      percentage,
      total,
      completed,
      passedChapterIds,
      currentChapterName,
      nextChapterId: nextChapter?._id,
    };
  }, [chapters, courseProgress]);

  // Helper to handle locked interactions
  const handlePressChapter = (chapterId: string, isLocked: boolean) => {
    if (isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Chapter Locked",
        "Finish the previous chapter test with at least 80% to unlock this section."
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(ROUTES.CHAPTER_DETAILS(chapterId));
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* HEADER */}
      <View style={styles.navHeader}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]}>
          {user?.level?.current || "Level"} {translations[language].course}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* PROGRESS OVERVIEW */}
        <View style={styles.bentoContainer}>
          <LinearGradient
            colors={["#047e4b", "#16c47f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.courseCard}
          >
            <View>
              <Text style={styles.bentoLabel}>{translations[language].current_chapter}</Text>
              <Text style={styles.continueText} numberOfLines={1}>
                {stats.currentChapterName}
              </Text>
            </View>

            <View>
              <Text style={styles.bentoValue}>{stats.percentage}%</Text>
              <View style={styles.fullBarBg}>
                <View
                  style={[
                    styles.fullBarFill,
                    { width: `${stats.percentage}%` },
                  ]}
                />
              </View>
            </View>
          </LinearGradient>

          <View
            style={[
              styles.chapterCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.text + "1A",
              },
            ]}
          >
            <Text
              style={[styles.bentoLabelDark, { color: colors.text + "40" }]}
            >
              {translations[language].chapters}
            </Text>
            <View style={styles.chapterStatsRow}>
              <Text style={[styles.chapterCount, { color: colors.text }]}>
                {stats.completed}
              </Text>
              <Text
                style={[styles.chapterTotal, { color: colors.text + "40" }]}
              >
                /{stats.total}
              </Text>
            </View>
            <Text
              style={[styles.bentoSubTextDark, { color: colors.text + "60" }]}
            >
              {translations[language].completed}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {translations[language].table_content}
        </Text>

        {/* CHAPTER LIST WITH LOCKING LOGIC */}
        <View
          style={[
            styles.listCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.text + "1A",
            },
          ]}
        >
          {chapters.map((chapter, idx) => {
            const isPassed = stats.passedChapterIds.has(chapter._id.toString());

            // LOCK LOGIC:
            // 1. First chapter is always unlocked.
            // 2. Subsequent chapters are locked if the PREVIOUS chapter is not passed.
            const isFirstChapter = idx === 0;
            const previousChapterPassed =
              idx > 0 &&
              stats.passedChapterIds.has(chapters[idx - 1]._id.toString());
            const isLocked = !isFirstChapter && !previousChapterPassed;

            return (
              <View key={chapter._id}>
                <Pressable
                  onPress={() => handlePressChapter(chapter._id, isLocked)}
                  style={[styles.chapterRow, isLocked && { opacity: 0.5 }]}
                >
                  <View style={styles.rowLeft}>
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor: isPassed
                            ? "#4CD96415"
                            : isLocked
                            ? colors.background
                            : colors.primary + "10",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          isPassed
                            ? "checkmark-done"
                            : isLocked
                            ? "lock-closed"
                            : "play"
                        }
                        size={20}
                        color={
                          isPassed
                            ? colors.primary
                            : isLocked
                            ? colors.text + "30"
                            : colors.primary
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.chapterIdx,
                          { color: colors.text  },
                        ]}
                      >
                        {translations[language].chapter} {chapter.index || idx + 1}
                      </Text>
                    </View>
                  </View>
                  {!isLocked && (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.text + "20"}
                    />
                  )}
                </Pressable>
                {idx < chapters.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  navTitle: { fontSize: 18, fontWeight: "900" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { paddingHorizontal: 20 },
  bentoContainer: { flexDirection: "row", gap: 12, marginBottom: 30 },
  courseCard: {
    flex: 1.3,
    borderRadius: 30,
    padding: 20,
    height: 160,
    justifyContent: "space-between",
  },
  chapterCard: {
    flex: 1,
    borderRadius: 30,
    padding: 20,
    height: 160,
    borderWidth: 1,
    justifyContent: "space-between",
  },
  bentoLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  bentoLabelDark: { fontSize: 14, fontWeight: "900", letterSpacing: 1 },
  fullBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
  },
  fullBarFill: { height: "100%", backgroundColor: "white", borderRadius: 3 },
  continueText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },
  bentoValue: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 4,
  },
  chapterStatsRow: { flexDirection: "row", alignItems: "baseline" },
  chapterCount: { fontSize: 32, fontWeight: "900" },
  chapterTotal: { fontSize: 16, fontWeight: "700", marginLeft: 2 },
  bentoSubTextDark: { fontSize: 12, fontWeight: "700" },
  sectionTitle: { fontSize: 20, fontWeight: "900", marginBottom: 15 },
  listCard: { borderRadius: 30, paddingHorizontal: 20, borderWidth: 1 },
  chapterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  chapterIdx: {
    fontSize: 15,
    fontWeight: "700",
  },
  chapterTitle: { fontSize: 16, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "rgba(0,0,0,0.03)" },
});

export default Course;
