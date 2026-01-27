import { chapterApi } from "@/api/chapterApi";
import { progressApi } from "@/api/progressApi";
import { translations } from "@/constants/translations";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function ChapterTest() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchAndAssignData = async () => {
      try {
        const res = await chapterApi.getFullChapter(id as string);
        if (res.data.success) {
          const chapter = res.data.data;
          if (chapter.exam && Array.isArray(chapter.exam.questions)) {
            setExamQuestions(chapter.exam.questions);
          } else if (Array.isArray(chapter.exam)) {
            setExamQuestions(chapter.exam);
          }
        }
      } catch (err) {
        console.error("Error loading chapter exam:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndAssignData();
  }, [id]);

  const handleSelect = (choice: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: choice }));
    if (currentIndex < examQuestions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 450);
    }
  };

  const onFinish = async () => {
    let correctCount = 0;

    examQuestions.forEach((q, idx) => {
      const selectedText = userAnswers[idx];
      const correctText = q.options[q.correctOptionIndex];

      if (selectedText === correctText) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setShowResult(true);

    if (correctCount / examQuestions.length >= 0.8) {
      const levelTag = user?.level?.current;
      try {
        const scorePercent = (correctCount / examQuestions.length) * 100;
        const payload: any = {
          levelTag: levelTag,
          chapterId: id as string,
          score: scorePercent,
        };
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await progressApi.completeChapterTest(payload);
      } catch (error) {
        console.error("Failed to update test progress:", error);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  if (loading)
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );

  if (!examQuestions.length)
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{translations[language].no_data}</Text>
      </View>
    );

  const currentQuestion = examQuestions[currentIndex];
  const progressPercent = ((currentIndex + 1) / examQuestions.length) * 100;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.barFill,
              { width: `${progressPercent}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.text }]}>
          {currentIndex + 1}/{examQuestions.length}
        </Text>
      </View>

      <View style={styles.quizArea}>
        <View style={[styles.qCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.qLabel, { color: colors.primary }]}>
            {currentQuestion.questionRef || "QUESTION"}
          </Text>
          <View style={styles.textContainer}>
            <Text style={[styles.mainQuestionText, { color: colors.text }]}>
              {currentQuestion.text.replace("＿＿＿＿＿", " ( ? ) ")}
            </Text>
          </View>
        </View>

        <View style={styles.optionsGrid}>
          {currentQuestion.options.map((option: string, i: number) => {
            const isSelected = userAnswers[currentIndex] === option;
            return (
              <Pressable
                key={i}
                onPress={() => handleSelect(option)}
                style={[
                  styles.optionItem,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.surface,
                    borderColor: isSelected
                      ? colors.primary
                      : colors.text + "15",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    { color: isSelected ? "white" : colors.text },
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.navBox}>
          <Pressable
            onPress={() => setCurrentIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            style={[styles.arrowBtn, { opacity: currentIndex === 0 ? 0 : 1 }]}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </Pressable>

          {currentIndex === examQuestions.length - 1 ? (
            <Pressable
              style={[
                styles.submitBtn,
                {
                  backgroundColor: colors.primary,
                  opacity:
                    Object.keys(userAnswers).length < examQuestions.length
                      ? 0.5
                      : 1,
                },
              ]}
              onPress={onFinish}
              disabled={Object.keys(userAnswers).length < examQuestions.length}
            >
              <Text style={styles.submitText}>Complete Exam</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setCurrentIndex(currentIndex + 1)}
              disabled={!userAnswers[currentIndex]}
              style={[
                styles.arrowBtn,
                { opacity: !userAnswers[currentIndex] ? 0.3 : 1 },
              ]}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.primary}
              />
            </Pressable>
          )}
        </View>
      </View>

      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={styles.resIcon}>
              <Ionicons
                name={
                  score / examQuestions.length >= 0.8
                    ? "checkmark-done-circle"
                    : "refresh-circle"
                }
                size={70}
                color={
                  score / examQuestions.length >= 0.8
                    ? colors.primary
                    : colors.error
                }
              />
            </View>
            <Text style={[styles.resTitle, { color: colors.text }]}>
              {translations[language].results}
            </Text>
            <Text style={[styles.resScore, { color: colors.text }]}>
              {score} / {examQuestions.length}
            </Text>

            <Text style={[styles.resDesc, { color: colors.text + "80" }]}>
              {score / examQuestions.length >= 0.8
                ? translations[language].passed_text
                : translations[language].failed_text}
            </Text>

            <Pressable
              style={[styles.exitBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.back()}
            >
              <Text style={styles.exitText}>{translations[language].close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", padding: 20, gap: 15 },
  iconBtn: { padding: 5 },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#00000008",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
  progressText: {
    fontSize: 13,
    fontWeight: "900",
    width: 45,
    textAlign: "right",
  },
  quizArea: { flex: 1, padding: 20 },
  qCard: {
    padding: 35,
    borderRadius: 35,
    marginBottom: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  qLabel: {
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 15,
    opacity: 0.5,
    letterSpacing: 1.5,
  },
  textContainer: { alignItems: "center", justifyContent: "center" },
  mainQuestionText: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 34,
  },
  optionsGrid: { gap: 12 },
  optionItem: {
    padding: 20,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: "center",
  },
  optionLabel: { fontSize: 17, fontWeight: "700" },
  footer: { padding: 20, paddingBottom: 40 },
  navBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  arrowBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000005",
  },
  submitBtn: {
    paddingHorizontal: 40,
    height: 56,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: { color: "white", fontWeight: "900", fontSize: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: width * 0.8,
    padding: 40,
    borderRadius: 40,
    alignItems: "center",
  },
  resIcon: { marginBottom: 15 },
  resTitle: { fontSize: 22, fontWeight: "900" },
  resScore: { fontSize: 50, fontWeight: "900", marginVertical: 10 },
  resDesc: { textAlign: "center", marginBottom: 20, lineHeight: 30 },
  exitBtn: {
    marginTop: 10,
    width: "100%",
    height: 54,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  exitText: { color: "white", fontWeight: "800" },
});
