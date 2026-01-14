import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { lessonApi } from "@/api/lessonApi";
import { progressApi } from "@/api/progressApi";
import { translations } from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";
import LectureList from "./LectureList";

const { width } = Dimensions.get("window");

const GrammarN5 = () => {
  const { colors, spacing, typography } = useTheme();
  const { language } = useLanguage();

  // States
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lectures, setLectures] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);

  const isMounted = useRef(true);

  const fetchData = async () => {
    try {
      const [lectureRes, progressRes] = await Promise.all([
        lessonApi.getAllLesson(),
        progressApi.getLatestProgress(),
      ]);

      if (!isMounted.current) return;

      setLectures(Array.isArray(lectureRes.data) ? lectureRes.data : []);
      setProgress(progressRes.data || null);
    } catch (err) {
      console.error("Fetch Data Error:", err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  /* ---------------- PROGRESS CALCULATIONS ---------------- */
  const progressStats = useMemo(() => {
    if (!lectures.length || !progress?.lecture?._id) {
      return { percentage: 0, statusText: "Start Course" };
    }

    const total = lectures.length;
    const currentIndex = lectures.findIndex(
      (l) => l._id === progress.lecture._id
    );

    if (currentIndex === -1)
      return { percentage: 0, statusText: "In progress" };

    const completedCount = progress.testPassed
      ? currentIndex + 1
      : currentIndex;
    const percentage = (completedCount / total) * 100;

    return {
      percentage: Math.min(percentage, 100),
      statusText: progress.testPassed ? "Chapter Completed" : "Current Lesson",
    };
  }, [lectures, progress]);

  /* ---------------- FIXED ROUTING LOGIC ---------------- */
  const handleContinue = () => {
    if (!progress?.lecture?._id || !lectures.length) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const currentIndex = lectures.findIndex(
      (l) => l._id === progress.lecture._id
    );
    if (currentIndex === -1) return;

    // Determine if we go to next or stay on current based on testPassed
    let targetLecture = lectures[currentIndex];
    if (progress.testPassed && currentIndex < lectures.length - 1) {
      targetLecture = lectures[currentIndex + 1];
    } else if (progress.testPassed && currentIndex === lectures.length - 1) {
      // Course fully completed
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    const firstPattern = targetLecture.grammarPatterns?.[0];
    if (firstPattern?._id) {
      router.push({
        pathname: "/grammar/ChapterDetails",
        params: {
          patternId: firstPattern._id,
          lectureId: targetLecture._id,
        },
      });
    } else {
      router.push("/grammar/Grammar");
    }
  };

  const progressMap = useMemo(() => {
    const map = new Map();
    if (progress?.lecture?._id) {
      map.set(progress.lecture._id, progress);
    }
    return map;
  }, [progress]);

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.push("/")} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            N5 Grammar
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Dynamic Progress Card */}
        {progress?.lecture && (
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.text + "08",
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusLabel, { color: colors.primary }]}>
                  {progressStats.statusText.toUpperCase()}
                </Text>
                <Text
                  style={[styles.lessonTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {progress.lecture.title}
                </Text>
              </View>
              <View
                style={[styles.playCircle, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="play" size={22} color="white" />
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <Text
                  style={[styles.progressText, { color: colors.text + "60" }]}
                >
                  Total Progress
                </Text>
                <Text
                  style={[
                    styles.progressText,
                    { color: colors.text, fontWeight: "800" },
                  ]}
                >
                  {Math.round(progressStats.percentage)}%
                </Text>
              </View>
              <View
                style={[
                  styles.progressContainer,
                  { backgroundColor: colors.text + "05" },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressStats.percentage}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          </Pressable>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {translations[language]?.table_content || "Curriculum"}
          </Text>
        </View>

        <LectureList lectures={lectures} progressMap={progressMap} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  card: {
    padding: 22,
    borderRadius: 28,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 30,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  lessonTitle: { fontSize: 22, fontWeight: "700" },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 3,
  },
  progressSection: { marginTop: 5 },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressText: { fontSize: 13, fontWeight: "600" },
  progressContainer: { height: 10, borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: "800" },
});

export default GrammarN5;
