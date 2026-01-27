import { progressApi } from "@/api/progressApi";
import { renshuuBApi, RenshuuBData } from "@/api/renshuuBApi";
import RenderFurigana from "@/app/components/RenderFurigana";
import { translations } from "@/constants/translations";
import { useAuth } from "@/contexts/AuthContext"; // FIXED: Added useAuth
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RenshuuB() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useAuth(); 
  const { language } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [contentBlocks, setContentBlocks] = useState<RenshuuBData[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});

  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const levelTag = user?.level?.current?.code || "N5";

        const [res, progressRes] = await Promise.all([
          renshuuBApi.getExercisesByChapter(id as string),
          progressApi.getCourseProgress(levelTag), 
        ]);

        if (res.data.success) setContentBlocks(res.data.data);

        // FIXED: Find chapter in nested array structure
        const allChapters = progressRes?.data?.data?.completedChapter || [];
        const specificProgress = allChapters.find(
          (ch: any) => ch.chapterId.toString() === id
        );

        if (specificProgress?.completedSection?.renshuuB === true) {
          setIsCompleted(true);
          // Pre-fill answers if completed
          const prefilledAnswers: { [key: string]: string } = {};
          res.data.data.forEach((block: any, bIdx: number) => {
            block.exercises.forEach((ex: any, eIdx: number) => {
              prefilledAnswers[`${bIdx}-${eIdx}`] = ex.correctAnswer;
            });
          });
          setUserAnswers(prefilledAnswers);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, user?.level?.current]);

  const handleSelectAnswer = (questionKey: string, answer: string) => {
    if (isCompleted) return;
    if (showErrors) {
      setShowErrors(false);
      setHasErrors(false);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUserAnswers((prev) => ({ ...prev, [questionKey]: answer }));
  };

  const onComplete = async () => {
    const totalQuestions = contentBlocks.reduce(
      (acc, b) => acc + b.exercises.length,
      0
    );
    if (Object.keys(userAnswers).length < totalQuestions) {
      Alert.alert("Incomplete", "Please answer all questions first.");
      return;
    }

    let errorFound = false;
    contentBlocks.forEach((block, bIdx) => {
      block.exercises.forEach((ex, eIdx) => {
        if (userAnswers[`${bIdx}-${eIdx}`] !== ex.correctAnswer)
          errorFound = true;
      });
    });

    if (errorFound) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setHasErrors(true);
      setShowErrors(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const levelTag = user?.level?.current?.code || "N5";
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // FIXED: Sending levelTag, id, and moduleKey
      await progressApi.updateModuleStatus(levelTag, id as string, "renshuuB");
      
      setIsCompleted(true);
      setTimeout(() => router.back(), 1000);
    } catch (err) {
      console.error("Update error:", err);
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {translations[language].renshuub}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {contentBlocks.map((block, bIdx) => (
          <View key={bIdx}>
            {block.exercises.map((item, eIdx) => {
              const key = `${bIdx}-${eIdx}`;
              const selected = userAnswers[key];

              const isWrong = showErrors && selected !== item.correctAnswer;
              const isFinishedHighlight = isCompleted;

              return (
                <View
                  key={key}
                  style={[
                    styles.exerciseCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isWrong
                        ? colors.error
                        : isFinishedHighlight
                        ? "#047e4b"
                        : colors.text + "0A",
                      borderWidth: isWrong || isFinishedHighlight ? 2 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.refBox,
                      {
                        backgroundColor: isWrong
                          ? colors.error + "15"
                          : isFinishedHighlight
                          ? "#4CD96420"
                          : colors.primary + "10",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.refText,
                        {
                          color: isWrong
                            ? colors.error
                            : isFinishedHighlight
                            ? "#047e4b"
                            : colors.primary,
                        },
                      ]}
                    >
                      {item.questionRef}
                    </Text>
                  </View>

                  <View style={styles.questionContainer}>
                    {item.question.split("＿＿＿＿＿").map((part, i, arr) => (
                      <React.Fragment key={i}>
                        {part.length > 0 && (
                          <RenderFurigana
                            text={part}
                            relatedKanji={block.relatedKanji}
                            textColor={colors.text}
                            furiganaColor={
                              isWrong
                                ? colors.error
                                : isFinishedHighlight
                                ? "#047e4b"
                                : colors.primary
                            }
                          />
                        )}
                        {i !== arr.length - 1 && (
                          <Text
                            style={[
                              styles.inlineBlank,
                              {
                                color: isFinishedHighlight
                                  ? "#047e4b"
                                  : selected
                                  ? isWrong
                                    ? colors.error
                                    : colors.primary
                                  : colors.text + "20",
                              },
                            ]}
                          >
                            {isFinishedHighlight
                              ? ` ${item.correctAnswer} `
                              : selected
                              ? ` ${selected} `
                              : " ＿＿＿＿ "}
                          </Text>
                        )}
                      </React.Fragment>
                    ))}
                  </View>

                  <View style={styles.answerGrid}>
                    {item.answer.map((ans, aIdx) => {
                      const isCorrectChoice = ans === item.correctAnswer;
                      const isUserSelection = selected === ans;

                      const showAsCorrect = isFinishedHighlight && isCorrectChoice;
                      const showAsWrong = isWrong && isUserSelection;

                      const vocabInfo = block.relatedVocab?.find((v) => v.word === ans);

                      return (
                        <Pressable
                          key={aIdx}
                          onPress={() => handleSelectAnswer(key, ans)}
                          style={[
                            styles.answerOption,
                            {
                              borderColor: showAsCorrect
                                ? "#047e4b"
                                : showAsWrong
                                ? colors.error
                                : isUserSelection
                                ? colors.primary
                                : colors.text + "10",
                              backgroundColor: showAsCorrect
                                ? "#047e4b10"
                                : showAsWrong
                                ? colors.error + "10"
                                : isUserSelection
                                ? colors.primary + "10"
                                : colors.surface,
                              width: "48%",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.answerText,
                              {
                                color: showAsCorrect
                                  ? "#047e4b"
                                  : showAsWrong
                                  ? colors.error
                                  : isUserSelection
                                  ? colors.primary
                                  : colors.text,
                                fontWeight: "800",
                              },
                            ]}
                          >
                            {ans}
                          </Text>
                          {vocabInfo?.meaning && (
                            <Text
                              style={[
                                styles.meaningText,
                                {
                                  color: showAsCorrect
                                    ? "#047e4b80"
                                    : showAsWrong
                                    ? colors.error + "80"
                                    : colors.text + "50",
                                },
                              ]}
                            >
                              {vocabInfo.meaning}
                            </Text>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        ))}
        <View style={{ height: 150 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        {hasErrors ? (
          <Pressable
            style={[styles.mainBtn, { backgroundColor: colors.error }]}
            onPress={() => {
              setHasErrors(false);
              setShowErrors(false);
            }}
          >
            <Text style={styles.btnText}>{translations[language].try_again}</Text>
            <Ionicons name="refresh" size={22} color="white" />
          </Pressable>
        ) : (
          <Pressable
            style={[
              styles.mainBtn,
              { backgroundColor: isCompleted ? colors.error : colors.primary },
            ]}
            onPress={onComplete}
            disabled={isSubmitting || isCompleted}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.btnText}>
                  {isCompleted ? translations[language].completed : translations[language].submit}
                </Text>
                <Ionicons
                  name={isCompleted ? "checkmark-circle" : "send"}
                  size={20}
                  color="white"
                />
              </>
            )}
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

// ... Styles (Stay the same as your input)
const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 60,
  },
  headerTitle: { fontSize: 20, fontWeight: "900" },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { padding: 20 },
  exerciseCard: { padding: 20, borderRadius: 30, marginBottom: 16 },
  refBox: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 30,
    marginBottom: 15,
  },
  refText: { fontSize: 12, fontWeight: "800" },
  questionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    marginBottom: 5,
    minHeight: 50,
  },
  inlineBlank: { fontSize: 19, fontWeight: "900", paddingHorizontal: 5 },
  answerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  answerOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: "center",
  },
  answerText: { fontSize: 15, textAlign: "center" },
  meaningText: { fontSize: 10, marginTop: 2, textAlign: "center" },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: "#00000005",
  },
  mainBtn: {
    width: "100%",
    height: 64,
    borderRadius: 32,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  btnText: { color: "white", fontWeight: "900", fontSize: 18 },
});