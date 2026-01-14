import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { examApi } from "@/api/examApi";
import { userApi } from "@/api/userApi";
import { useTheme } from "@/theme/ThemeProvider";

const LevelTest = () => {
  const { targetLevel, examId } = useLocalSearchParams<{
    targetLevel: string;
    examId: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Selection state: prevents direct skip to next question
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const flattenId = (id: any): string => {
    if (!id) return "";
    return typeof id === "object" ? id.$oid : id;
  };

  useEffect(() => {
    const loadExamData = async () => {
      try {
        setLoading(true);
        const res = await examApi.getAllExams();
        const foundExam = res.data.find(
          (e: any) => flattenId(e._id) === examId
        );

        if (!foundExam) throw new Error("Exam not found.");

        setExam(foundExam);
      } catch (err: any) {
        Alert.alert("Error", err.message);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (examId) loadExamData();
  }, [examId]);

  const handleConfirm = () => {
    if (!selectedOption) return;

    const isCorrect =
      selectedOption === exam.questions[currentStep].correctAnswer;
    let newScore = score;

    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
    }

    if (currentStep < exam.questions.length - 1) {
      setCurrentStep((c) => c + 1);
      setSelectedOption(null); // Reset for next question
    } else {
      setFinished(true);
      if (newScore / exam.questions.length >= 0.7) {
        userApi
          .updateUserLevel("", { level: targetLevel })
          .catch((err) => console.error("Update failed", err));
      }
    }
  };

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  if (!exam || !exam.questions) return null;

  if (finished)
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: colors.background, justifyContent: "center" },
        ]}
      >
        <View style={styles.resultCard}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primary + "15" },
            ]}
          >
            <Ionicons
              name={score / exam.questions.length >= 0.7 ? "trophy" : "refresh"}
              size={60}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.resultTitle, { color: colors.text }]}>
            {score / exam.questions.length >= 0.7
              ? "Level Passed!"
              : "Try Again"}
          </Text>
          <Text style={[styles.resultScore, { color: colors.text }]}>
            {score} / {exam.questions.length}
          </Text>
          <Pressable
            style={[
              styles.confirmBtn,
              { backgroundColor: colors.primary, width: "100%" },
            ]}
            onPress={() => router.replace("/user/Profile")}
          >
            <Text style={styles.confirmBtnText}>Back to Profile</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );

  const currentQuestion = exam.questions[currentStep];
  const progress = (currentStep + 1) / exam.questions.length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Sleek Progress Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.progressWrapper}>
          <View
            style={[styles.progressBg, { backgroundColor: colors.text + "10" }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>
        </View>
        <Text style={[styles.progressText, { color: colors.text }]}>
          {currentStep + 1}/{exam.questions.length}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Question Card */}
        <View style={[styles.qCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.qText, { color: colors.text }]}>
            {currentQuestion.question}
          </Text>
        </View>

        {/* Options Selection */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((opt: string) => {
            const isSelected = selectedOption === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => setSelectedOption(opt)}
                style={[
                  styles.opt,
                  {
                    backgroundColor: isSelected
                      ? colors.primary + "15"
                      : colors.surface,
                    borderColor: isSelected
                      ? colors.primary
                      : colors.text + "10",
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optText,
                    {
                      color: isSelected ? colors.primary : colors.text,
                      fontWeight: isSelected ? "700" : "400",
                    },
                  ]}
                >
                  {opt}
                </Text>
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={isSelected ? colors.primary : colors.text + "20"}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Confirmation Footer */}
      <View style={styles.footer}>
        <Pressable
          disabled={!selectedOption}
          onPress={handleConfirm}
          style={[
            styles.confirmBtn,
            {
              backgroundColor: selectedOption
                ? colors.primary
                : colors.text + "10",
            },
          ]}
        >
          <Text
            style={[
              styles.confirmBtnText,
              { color: selectedOption ? "white" : colors.text + "30" },
            ]}
          >
            {currentStep === exam.questions.length - 1
              ? "Finish"
              : "Confirm Answer"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", padding: 20, gap: 12 },
  closeBtn: { padding: 5 },
  progressWrapper: { flex: 1 },
  progressBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressText: {
    fontSize: 13,
    fontWeight: "700",
    width: 40,
    textAlign: "right",
  },
  content: { flex: 1, paddingHorizontal: 25 },
  qCard: {
    padding: 30,
    borderRadius: 25,
    marginBottom: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  qText: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 30,
  },
  optionsContainer: { gap: 10 },
  opt: {
    padding: 18,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optText: { fontSize: 17 },
  footer: { padding: 25 },
  confirmBtn: { padding: 20, borderRadius: 20, alignItems: "center" },
  confirmBtnText: { fontSize: 16, fontWeight: "800" },
  resultCard: { alignItems: "center", padding: 30 },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  resultTitle: { fontSize: 28, fontWeight: "900", marginBottom: 5 },
  resultScore: { fontSize: 20, opacity: 0.6, marginBottom: 40 },
});

export default LevelTest;
