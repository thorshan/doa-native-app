import { examApi } from "@/api/examApi";
import { ROUTES } from "@/constants/routes";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function ExamScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const router = useRouter();

  // State
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [timeLeft, setTimeLeft] = useState(0);

  // Results State
  const [showResult, setShowResult] = useState(false);
  const [resultStats, setResultStats] = useState({
    score: 0,
    total: 0,
    correct: 0,
    percentage: 0,
    isPassed: false,
  });

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const res = await examApi.getExam(id as string);
        const data = res.data?.data || res.data;
        setExam(data);
        setTimeLeft((data.durationMinutes || 60) * 60);
      } catch (err) {
        Alert.alert("Error", "Could not load the exam.");
      } finally {
        setLoading(false);
      }
    };
    fetchExamDetails();
  }, [id]);

  // Calculation Logic
  const calculateResult = () => {
    let earnedPoints = 0;
    let totalPoints = 0;
    let correctCount = 0;

    exam.questions.forEach((q: any, index: number) => {
      totalPoints += q.points || 1;
      if (selectedAnswers[index] === q.correctOptionIndex) {
        earnedPoints += q.points || 1;
        correctCount++;
      }
    });

    const percent = Math.round((earnedPoints / totalPoints) * 100);
    const passed = percent >= (exam.passingScorePercentage || 80);

    setResultStats({
      score: earnedPoints,
      total: totalPoints,
      correct: correctCount,
      percentage: percent,
      isPassed: passed,
    });

    if (passed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setShowResult(true);
  };

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  // --- RESULT VIEW ---
  if (showResult) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
            padding: 30,
          },
        ]}
      >
        <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
          <Ionicons
            name={resultStats.isPassed ? "ribbon" : "alert-circle"}
            size={80}
            color={resultStats.isPassed ? "#4CD964" : "#FF3B30"}
          />
          <Text
            style={[
              styles.resultStatus,
              { color: resultStats.isPassed ? "#4CD964" : "#FF3B30" },
            ]}
          >
            {resultStats.isPassed ? "CONGRATULATIONS!" : "KEEP PRACTICING!"}
          </Text>
          <Text style={[styles.resultScore, { color: colors.text }]}>
            {resultStats.percentage}%
          </Text>
          <Text style={[styles.resultSub, { color: colors.text + "60" }]}>
            You scored {resultStats.score} out of {resultStats.total} points
          </Text>

          <View style={styles.statGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.text }]}>
                {resultStats.correct}
              </Text>
              <Text style={{ color: colors.text + "40", fontSize: 12 }}>
                Correct
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.text }]}>
                {exam.questions.length - resultStats.correct}
              </Text>
              <Text style={{ color: colors.text + "40", fontSize: 12 }}>
                Wrong
              </Text>
            </View>
          </View>

          <Pressable
            style={[styles.closeBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace(ROUTES.EXAM_MOCK)}
          >
            <Text style={styles.closeBtnText}>Return to Exams</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // --- EXAM VIEW ---
  const currentQuestion = exam?.questions[currentIndex];
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header, Progress, Question Body same as previous response... */}
      <View style={styles.headerTop}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.timerText, { color: colors.text }]}>
          {Math.floor(timeLeft / 60)}m left
        </Text>
        <Pressable onPress={calculateResult}>
          <Text style={{ color: colors.primary, fontWeight: "700" }}>
            Finish
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 25 }}>
        <Text style={[styles.qText, { color: colors.text, marginBottom: 30 }]}>
          {currentQuestion.text}
        </Text>
        {currentQuestion.options.map((opt: string, i: number) => (
          <Pressable
            key={i}
            onPress={() =>
              setSelectedAnswers({ ...selectedAnswers, [currentIndex]: i })
            }
            style={[
              styles.optionCard,
              {
                backgroundColor:
                  selectedAnswers[currentIndex] === i
                    ? colors.primary
                    : colors.surface,
                borderColor:
                  selectedAnswers[currentIndex] === i
                    ? colors.primary
                    : colors.text + "10",
                marginBottom: 12,
              },
            ]}
          >
            <Text
              style={{
                color:
                  selectedAnswers[currentIndex] === i ? "white" : colors.text,
                fontSize: 18,
              }}
            >
              {opt}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Footer Nav */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
        >
          <Text style={{ color: colors.text }}>Prev</Text>
        </Pressable>
        <Text style={{ color: colors.text }}>
          {currentIndex + 1} / {exam.questions.length}
        </Text>
        <Pressable
          onPress={() => {
            if (currentIndex < exam.questions.length - 1)
              setCurrentIndex((prev) => prev + 1);
            else calculateResult();
          }}
        >
          <Text style={{ color: colors.primary, fontWeight: "700" }}>
            {currentIndex === exam.questions.length - 1 ? "Submit" : "Next"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  timerText: { fontSize: 16, fontWeight: "700" },
  qText: { fontSize: 22, fontWeight: "700", lineHeight: 32 },
  optionCard: { padding: 18, borderRadius: 30, borderWidth: 1 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 25,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  // Result Styles
  resultCard: {
    width: "100%",
    padding: 30,
    borderRadius: 30,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  resultStatus: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 20,
    letterSpacing: 1,
  },
  resultScore: { fontSize: 64, fontWeight: "900", marginVertical: 10 },
  resultSub: { fontSize: 14, textAlign: "center", marginBottom: 20 },
  statGrid: { flexDirection: "row", gap: 40, marginBottom: 30 },
  statBox: { alignItems: "center" },
  statNum: { fontSize: 24, fontWeight: "800" },
  closeBtn: {
    width: "100%",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
  },
  closeBtnText: { color: "white", fontWeight: "800", fontSize: 16 },
});
