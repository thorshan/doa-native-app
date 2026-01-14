import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

import { HIRAGANA } from "@/constants/hiragana";
import { KATAKANA } from "@/constants/katakana";
import { translations } from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";

const { width } = Dimensions.get("window");

/* ---------------- HELPERS ---------------- */
const shuffleArray = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

const pickFive = (data: Record<string, string>) =>
  shuffleArray(Object.entries(data))
    .slice(0, 5)
    .map(([romaji, kana]) => ({ romaji, kana }));

/* ---------------- STABLE SUB-COMPONENT ---------------- */
const ExamRow = memo(
  ({ q, index, value, onUpdate, colors, hasChecked, isCorrect }: any) => {
    const isRight = isCorrect[`q${index}`];

    return (
      <View style={styles.inputRow}>
        <View style={[styles.kanaCircle, { backgroundColor: colors.surface }]}>
          <Text style={[styles.kanaText, { color: colors.text }]}>
            {q.kana}
          </Text>
        </View>

        <TextInput
          value={value}
          onChangeText={(text) => onUpdate(index, text)}
          placeholder="romaji"
          placeholderTextColor={colors.text + "3A"}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          editable={!hasChecked}
          keyboardType="ascii-capable"
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: hasChecked
                ? isRight
                  ? "#4ADE80"
                  : "#F87171"
                : colors.primary + "20",
              borderWidth: hasChecked ? 2 : 1,
            },
          ]}
        />

        {hasChecked && (
          <Ionicons
            name={isRight ? "checkmark-circle" : "close-circle"}
            size={24}
            color={isRight ? "#4ADE80" : "#F87171"}
            style={{ marginLeft: 10 }}
          />
        )}
      </View>
    );
  }
);

// Explicitly set the display name
ExamRow.displayName = "ExamRow";

/* ---------------- MAIN COMPONENT ---------------- */
const BasicExam = () => {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { language } = useLanguage();

  const [checking, setChecking] = useState(true);
  const [celebrate, setCelebrate] = useState(false);
  const [finishedAll, setFinishedAll] = useState(false);

  const [mode, setMode] = useState<"hiragana" | "katakana">("hiragana");
  const [questions, setQuestions] = useState<
    { romaji: string; kana: string }[]
  >([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isCorrect, setIsCorrect] = useState<Record<string, boolean>>({});

  const loadQuestions = useCallback((type: "hiragana" | "katakana") => {
    const picked =
      type === "hiragana" ? pickFive(HIRAGANA) : pickFive(KATAKANA);
    const init: Record<string, string> = {};
    picked.forEach((_, i) => (init[`q${i}`] = ""));
    setQuestions(picked);
    setFormData(init);
    setIsCorrect({});
  }, []);

  useEffect(() => {
    loadQuestions("hiragana");
  }, [loadQuestions]);

  const handleUpdate = useCallback((index: number, text: string) => {
    setFormData((prev) => ({ ...prev, [`q${index}`]: text }));
  }, []);

  const submitForm = () => {
    const result: Record<string, boolean> = {};
    questions.forEach((q, i) => {
      result[`q${i}`] = formData[`q${i}`]?.trim().toLowerCase() === q.romaji;
    });

    setIsCorrect(result);
    const score = Object.values(result).filter(Boolean).length;

    if (score === 5) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2500);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const score = Object.values(isCorrect).filter(Boolean).length;
  const hasChecked = Object.keys(isCorrect).length > 0;
  const finished = score === 5;

  const handleContinue = () => {
    if (finished && mode === "hiragana") {
      setMode("katakana");
      loadQuestions("katakana");
    } else if (finished && mode === "katakana") {
      setFinishedAll(true);
    }
  };

  const resetExam = () => {
    loadQuestions(mode);
  };

  /* ---------------- SCREENS ---------------- */

  if (checking)
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <View style={[styles.readyCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="help-buoy-outline" size={60} color={colors.primary} />
          <Text style={[styles.readyTitle, { color: colors.text }]}>
            {language === "jp" ? "準備はいいですか？" : "Ready to test?"}
          </Text>
          <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
            <Pressable
              onPress={() => router.back()}
              style={[
                styles.btn,
                { flex: 1, backgroundColor: colors.text + "10" },
              ]}
            >
              <Text style={{ color: colors.text }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => setChecking(false)}
              style={[styles.btn, { flex: 1, backgroundColor: colors.primary }]}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>Start</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );

  if (finishedAll)
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: colors.background, padding: 20 },
        ]}
      >
        <Ionicons name="trophy" size={100} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text, marginTop: 20 }]}>
          Level Complete!
        </Text>
        <Text
          style={{
            color: colors.text,
            textAlign: "center",
            opacity: 0.6,
            marginBottom: 30,
          }}
        >
          You've mastered the basics of both Hiragana and Katakana.
        </Text>
        <Pressable
          onPress={() => router.push("/")}
          style={[styles.mainBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.mainBtnText}>Back to Dashboard</Text>
        </Pressable>
        {celebrate && (
          <ConfettiCannon count={100} origin={{ x: width / 2, y: 0 }} />
        )}
      </View>
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        <Text
          style={[
            styles.badge,
            { backgroundColor: colors.primary + "15", color: colors.primary },
          ]}
        >
          {mode.toUpperCase()}
        </Text>
        <Text style={[styles.title, { color: colors.text, textAlign: "left" }]}>
          {mode === "hiragana"
            ? translations[language].hiragana_exam
            : translations[language].katakana_exam}
        </Text>

        <View style={styles.examContainer}>
          {questions.map((q, i) => (
            <ExamRow
              key={`${mode}-${i}`} // Stable key based on mode
              q={q}
              index={i}
              value={formData[`q${i}`] || ""}
              onUpdate={handleUpdate}
              colors={colors}
              hasChecked={hasChecked}
              isCorrect={isCorrect}
            />
          ))}
        </View>

        {!hasChecked ? (
          <Pressable
            onPress={submitForm}
            style={[styles.mainBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.mainBtnText}>
              {translations[language].check}
            </Text>
          </Pressable>
        ) : (
          <View>
            <Text style={[styles.scoreText, { color: colors.text }]}>
              Score: {score} / 5
            </Text>
            <Pressable
              onPress={finished ? handleContinue : resetExam}
              style={[
                styles.mainBtn,
                { backgroundColor: finished ? colors.primary : "#F87171" },
              ]}
            >
              <Text style={styles.mainBtnText}>
                {finished ? "Continue" : "Try Again"}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
      {celebrate && (
        <ConfettiCannon count={100} origin={{ x: width / 2, y: 0 }} />
      )}
    </KeyboardAvoidingView>
  );
};

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  readyCard: {
    width: "85%",
    padding: 30,
    borderRadius: 35,
    alignItems: "center",
  },
  readyTitle: { fontSize: 20, fontWeight: "700", marginVertical: 20 },
  btn: {
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 20 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    marginBottom: 8,
  },
  examContainer: { marginVertical: 20 },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  kanaCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  kanaText: { fontSize: 28, fontWeight: "bold" },
  input: {
    flex: 1,
    height: 60,
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: "600",
  },
  mainBtn: {
    height: 65,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  mainBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 20,
  },
  scoreText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 15,
  },
});

export default BasicExam;
