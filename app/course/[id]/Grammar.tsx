import { chapterApi } from "@/api/chapterApi";
import { progressApi } from "@/api/progressApi";
import RenderFurigana from "@/app/components/RenderFurigana";
import { translations } from "@/constants/translations";
import { useAuth } from "@/contexts/AuthContext"; // FIXED: Added for levelTag
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GrammarPage() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadAllData = async () => {
      try {
        const levelTag = user?.level?.current;

        // RENEWED FETCH: Using getCourseProgress for nested module status
        const [chapterRes, progressRes] = await Promise.all([
          chapterApi.getFullChapter(id as string),
          progressApi.getCourseProgress(levelTag),
        ]);

        if (isMounted) {
          setChapter(chapterRes.data.data);

          // FIXED: Find specific chapter in nested array
          const allChapters = progressRes?.data?.data?.completedChapter || [];
          const specificProgress = allChapters.find(
            (ch: any) => ch.chapterId.toString() === id
          );

          // Check if grammar module is true in completedSection
          if (specificProgress?.completedSection?.grammar === true) {
            setIsCompleted(true);
          }
        }
      } catch (err) {
        console.error("Grammar fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllData();
    return () => {
      isMounted = false;
      Speech.stop();
    };
  }, [id, user?.level?.current]);

  const playSound = (text: string, key: string) => {
    Speech.stop();
    setSpeakingId(key);
    Speech.speak(text, {
      language: "ja-JP",
      pitch: 1.0,
      rate: 0.85,
      onDone: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const handleComplete = async () => {
    if (isCompleted) return;

    setIsSubmitting(true);
    try {
      const levelTag = user?.level?.current?.code || "N5";
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // FIXED: Sending levelTag, chapterId, and moduleKey
      await progressApi.updateModuleStatus(levelTag, id as string, "grammar");

      setIsCompleted(true);
      setTimeout(() => router.back(), 500);
    } catch (error) {
      console.error("Update grammar progress error:", error);
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  const grammarList = useMemo(() => {
    if (!chapter?.grammars) return null;

    return chapter.grammars.map((item: any, index: number) => (
      <View
        key={index}
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderRadius: 24, padding: 20 },
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[styles.badge, { backgroundColor: colors.primary + "15" }]}
          >
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {translations[language].point} {index + 1}
            </Text>
          </View>
          <Pressable
            onPress={() => playSound(item.pattern, `pattern-${index}`)}
            style={[
              styles.miniSpeaker,
              {
                backgroundColor:
                  speakingId === `pattern-${index}`
                    ? colors.primary
                    : colors.background,
              },
            ]}
          >
            <Ionicons
              name="volume-medium"
              size={18}
              color={
                speakingId === `pattern-${index}` ? "white" : colors.primary
              }
            />
          </Pressable>
        </View>

        <View style={styles.titleWrapper}>
          <RenderFurigana
            text={item.pattern}
            relatedKanji={item.relatedKanji}
            textColor={colors.text}
            furiganaColor={colors.primary}
          />
        </View>

        <Text style={[styles.explanation, { color: colors.text }]}>
          {item.meaning}
        </Text>

        <View
          style={[
            styles.exampleBox,
            {
              backgroundColor: colors.background + "50",
              borderColor: colors.text + "10",
            },
          ]}
        >
          <Text style={[styles.exampleLabel, { color: colors.primary }]}>
            {translations[language].example}
          </Text>
          {item.examples.map((eg: any, idx: number) => {
            const currentKey = `eg-${index}-${idx}`;
            return (
              <View key={idx} style={styles.exampleItem}>
                <View style={{ flex: 1 }}>
                  <RenderFurigana
                    text={eg.structure}
                    relatedKanji={item.relatedKanji}
                    furiganaColor={colors.primary}
                    textColor={colors.text}
                  />
                  <Text
                    style={[
                      styles.exampleMeaning,
                      { color: colors.text + "80" },
                    ]}
                  >
                    {eg.meaning}
                  </Text>
                </View>
                <Pressable
                  onPress={() => playSound(eg.structure, currentKey)}
                  style={[
                    styles.exampleSpeaker,
                    {
                      borderColor:
                        speakingId === currentKey
                          ? colors.primary
                          : colors.text + "15",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      speakingId === currentKey ? "mic" : "play-circle-outline"
                    }
                    size={22}
                    color={
                      speakingId === currentKey
                        ? colors.primary
                        : colors.text + "40"
                    }
                  />
                </Pressable>
              </View>
            );
          })}
        </View>

        {item.notes?.length > 0 &&
          item.notes.map((note: string, nIdx: number) => (
            <View
              key={nIdx}
              style={[
                styles.noteRow,
                { backgroundColor: colors.warning + "10" },
              ]}
            >
              <Ionicons name="bulb-outline" size={18} color={colors.warning} />
              <Text style={[styles.noteText, { color: colors.text }]}>
                {note}
              </Text>
            </View>
          ))}
      </View>
    ));
  }, [chapter, colors, speakingId]);

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {translations[language].grammar_explain}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {grammarList}

        <Pressable
          onPress={handleComplete}
          disabled={isSubmitting || isCompleted}
          style={[
            styles.completeBtn,
            { backgroundColor: isCompleted ? colors.error : colors.primary },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.completeBtnText}>
                {isCompleted
                  ? translations[language].completed
                  : translations[language].mark_as_completed}
              </Text>
              <Ionicons
                name={isCompleted ? "checkmark-circle" : "checkmark-done"}
                size={20}
                color="white"
              />
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... (Styles remain the same as your input)
const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 60,
  },
  headerTitle: { fontSize: 18, fontWeight: "900" },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { padding: 18, paddingBottom: 40 },
  card: {
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: "900", letterSpacing: 0.5 },
  miniSpeaker: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  titleWrapper: { marginBottom: 10 },
  explanation: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 30,
    marginBottom: 20,
  },
  exampleBox: { padding: 16, borderRadius: 20, borderWidth: 1 },
  exampleLabel: {
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 12,
    opacity: 0.5,
  },
  exampleItem: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
    alignItems: "center",
  },
  exampleSpeaker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderStyle: "dashed",
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  exampleMeaning: { fontSize: 13, marginTop: 4, opacity: 0.7 },
  noteRow: {
    flexDirection: "row",
    marginTop: 15,
    padding: 12,
    borderRadius: 12,
    gap: 8,
    alignItems: "center",
  },
  noteText: { flex: 1, fontSize: 12, fontWeight: "500", lineHeight: 25 },
  completeBtn: {
    height: 60,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  completeBtnText: { color: "white", fontWeight: "900", fontSize: 16 },
});
