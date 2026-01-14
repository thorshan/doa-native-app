import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { examApi } from "@/api/examApi";
import { progressApi } from "@/api/progressApi";
import { userApi } from "@/api/userApi";
import { translations } from "@/constants/translations";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";

const { width } = Dimensions.get("window");
const PASS_PERCENTAGE = 60;

// Helper to shuffle options
const shuffleArray = (array: string[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const ChapterExam: React.FC = () => {
  const { user } = useAuth();
  const { lectureId } = useLocalSearchParams<{ lectureId: string }>();
  const { colors, spacing, typography } = useTheme();
  const { language } = useLanguage();

  const [userData, setUser] = useState<any>(user);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState<any>(null);
  const [error, setError] = useState("");
  const [sessionKey, setSessionKey] = useState(0); // Used to trigger re-shuffle

  const fetchUser = async () => {
    try {
      const res = await userApi.getUserData();
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      try {
        const res = await examApi.getExamByLecture(lectureId);
        setExam(res.data);
      } catch (err) {
        setError("Failed to load exam");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
    fetchUser();
  }, [lectureId]);

  /* ================= SHUFFLE LOGIC ================= */
  // We memoize the questions so they only shuffle once per sessionKey change
  const shuffledQuestions = useMemo(() => {
    if (!exam?.questions) return [];
    return exam.questions.map((q: any) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
  }, [exam, sessionKey]);

  const totalQuestions = shuffledQuestions.length;
  const currentQuestion = shuffledQuestions[currentStep];

  const correctCount = useMemo(() => {
    return shuffledQuestions.reduce((count, q) => {
      return answers[q._id] === q.correctAnswer ? count + 1 : count;
    }, 0);
  }, [answers, shuffledQuestions]);

  const percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = percentage >= PASS_PERCENTAGE;
  const progress = totalQuestions > 0 ? (currentStep + 1) / totalQuestions : 0;

  const handlePassed = async () => {
    const data = {
      userId: userData?._id,
      lecture: lectureId,
      score: percentage,
    };
    try {
      await progressApi.passTest(data);
      fetchUser();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isFinished && passed) {
      handlePassed();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (isFinished && !passed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [isFinished, passed]);

  const handleOptionChange = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers({ ...answers, [currentQuestion._id]: value });
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep((p) => p + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentStep(0);
    setIsFinished(false);
    setSessionKey((prev) => prev + 1); // Triggers useMemo to re-shuffle
  };

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  if (!isFinished && exam) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top"]}
      >
        {/* Progress Header */}
        <View style={styles.quizHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.progressWrapper}>
            <View
              style={[
                styles.progressBase,
                { backgroundColor: colors.text + "10" },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          </View>
          <Text style={[styles.stepText, { color: colors.text + "60" }]}>
            {currentStep + 1}/{totalQuestions}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {currentQuestion.question}
          </Text>

          {currentQuestion.explanation && (
            <View
              style={[
                styles.hintBox,
                { backgroundColor: colors.primary + "10" },
              ]}
            >
              <Ionicons
                name="information-circle"
                size={18}
                color={colors.primary}
              />
              <Text style={[styles.hintText, { color: colors.primary }]}>
                {currentQuestion.explanation}
              </Text>
            </View>
          )}

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((opt: string, idx: number) => {
              const isSelected = answers[currentQuestion._id] === opt;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={[
                    styles.optionBtn,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surface,
                      borderColor: isSelected
                        ? colors.primary
                        : colors.text + "10",
                    },
                  ]}
                  onPress={() => handleOptionChange(opt)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: isSelected ? "white" : colors.text },
                    ]}
                  >
                    {opt}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.text + "05" }]}>
          <TouchableOpacity
            disabled={!answers[currentQuestion._id]}
            style={[
              styles.mainBtn,
              {
                backgroundColor: !answers[currentQuestion._id]
                  ? colors.text + "10"
                  : colors.primary,
              },
            ]}
            onPress={handleNext}
          >
            <Text
              style={[
                styles.mainBtnText,
                {
                  color: !answers[currentQuestion._id]
                    ? colors.text + "30"
                    : "white",
                },
              ]}
            >
              {currentStep === totalQuestions - 1
                ? translations[language].finish
                : translations[language].next}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // RESULT SCREEN
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: "center" }}>
        <View
          style={[
            styles.resultCircle,
            {
              backgroundColor: passed
                ? colors.primary + "15"
                : colors.error + "15",
            },
          ]}
        >
          <Ionicons
            name={passed ? "trophy" : "refresh-circle"}
            size={60}
            color={passed ? colors.primary : colors.error}
          />
        </View>

        <Text style={[styles.resultTitle, { color: colors.text }]}>
          {passed ? "Chapter Mastered!" : "Almost There!"}
        </Text>
        <Text
          style={[
            styles.resultScore,
            { color: passed ? colors.primary : colors.error },
          ]}
        >
          {percentage}% Correct
        </Text>

        <View style={styles.summaryList}>
          {shuffledQuestions.map((q: any, idx: number) => {
            const isCorrect = answers[q._id] === q.correctAnswer;
            return (
              <View
                key={q._id}
                style={[
                  styles.summaryItem,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View
                  style={[
                    styles.statusIcon,
                    {
                      backgroundColor: isCorrect
                        ? colors.primary + "15"
                        : colors.error + "15",
                    },
                  ]}
                >
                  <Ionicons
                    name={isCorrect ? "checkmark" : "close"}
                    size={16}
                    color={isCorrect ? colors.primary : colors.error}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.summaryQ, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {q.question}
                  </Text>
                  <Text
                    style={{
                      color: isCorrect ? colors.primary : colors.error,
                      fontSize: 12,
                    }}
                  >
                    Correct: {q.correctAnswer}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.mainBtn,
            { backgroundColor: colors.primary, width: "100%", marginTop: 20 },
          ]}
          onPress={() =>
            passed ? router.push("/grammar/Grammar") : handleRestart()
          }
        >
          <Text style={{ color: "white", fontWeight: "800" }}>
            {passed ? translations[language].continue : "Try Again"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  quizHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  closeBtn: { width: 40, height: 40, justifyContent: "center" },
  progressWrapper: { flex: 1, height: 8, marginHorizontal: 15 },
  progressBase: { height: "100%", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  stepText: { fontSize: 13, fontWeight: "700", width: 40, textAlign: "right" },
  questionText: {
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 32,
    marginBottom: 15,
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 30,
    gap: 8,
    marginBottom: 25,
  },
  hintText: { flex: 1, fontSize: 14, fontWeight: "600" },
  optionsContainer: { gap: 12 },
  optionBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 30,
    borderWidth: 1.5,
  },
  optionText: { fontSize: 16, fontWeight: "700" },
  footer: { padding: 24, borderTopWidth: 1 },
  mainBtn: {
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  mainBtnText: { fontSize: 18, fontWeight: "800" },
  resultCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  resultTitle: { fontSize: 28, fontWeight: "900", marginBottom: 5 },
  resultScore: { fontSize: 22, fontWeight: "800", marginBottom: 30 },
  summaryList: { width: "100%", gap: 10 },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 18,
    gap: 15,
  },
  statusIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryQ: { fontSize: 14, fontWeight: "600" },
});

export default ChapterExam;
