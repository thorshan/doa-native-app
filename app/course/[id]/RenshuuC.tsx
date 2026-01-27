import { progressApi } from "@/api/progressApi";
import { renshuuCApi, RenshuuCData } from "@/api/renshuuCApi";
import RenderFurigana from "@/app/components/RenderFurigana";
import { translations } from "@/constants/translations";
import { useAuth } from "@/contexts/AuthContext"; // FIXED: Added useAuth
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
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

export default function RenshuuC() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<RenshuuCData[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showMeanings, setShowMeanings] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const levelTag = user?.level?.current?.code || "N5";

        const [res, progressRes] = await Promise.all([
          renshuuCApi.getDialogueByChapter(id as string),
          progressApi.getCourseProgress(levelTag), 
        ]);

        if (res.data.success) setContent(res.data.data);

        const allChapters = progressRes?.data?.data?.completedChapter || [];
        const specificProgress = allChapters.find(
          (ch: any) => ch.chapterId.toString() === id
        );

        if (specificProgress?.completedSection?.renshuuC === true) {
          setIsCompleted(true);
        }
      } catch (err) {
        console.error("Fetch error Renshuu C:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    return () => Speech.stop();
  }, [id, user?.level?.current]);

  const playVoice = (text: string, key: string) => {
    Speech.stop();
    setSpeakingId(key);
    Speech.speak(text, {
      language: "ja-JP",
      rate: 0.85,
      onDone: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const onComplete = async () => {
    if (isCompleted) return;
    try {
      const levelTag = user?.level?.current;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // FIXED: Sending levelTag, id, and specific moduleKey
      await progressApi.updateModuleStatus(levelTag, id as string, "renshuuC");

      setIsCompleted(true);
      setTimeout(() => router.back(), 800);
    } catch (err) {
      console.error("Update error:", err);
      router.back();
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
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {translations[language].renshuuc}
        </Text>
        <Pressable
          onPress={() => setShowMeanings(!showMeanings)}
          style={[
            styles.toggleBtn,
            { backgroundColor: showMeanings ? colors.primary : colors.surface },
          ]}
        >
          <Ionicons
            name="language"
            size={20}
            color={showMeanings ? "white" : colors.primary}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {content.map((block, bIdx) => (
          <View key={bIdx} style={styles.sectionCard}>
            <Text style={[styles.scenarioTitle, { color: colors.primary }]}>
              {block.title || `Scenario ${bIdx + 1}`}
            </Text>

            {block.dialogue.map((item, dIdx) => {
              const key = `${bIdx}-${dIdx}`;
              const isPlaying = speakingId === key;
              const isSpeakerA = item.speaker === "A";

              return (
                <View
                  key={key}
                  style={[
                    styles.dialogueRow,
                    isSpeakerA ? styles.rowLeft : styles.rowRight,
                  ]}
                >
                  {/* Speaker Badge */}
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: isSpeakerA
                          ? colors.primary
                          : colors.text + "10",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarText,
                        { color: isSpeakerA ? "white" : colors.text },
                      ]}
                    >
                      {item.speaker}
                    </Text>
                  </View>

                  {/* Bubble */}
                  <View
                    style={[
                      styles.bubble,
                      {
                        backgroundColor: isSpeakerA
                          ? colors.surface
                          : colors.primary + "10",
                        borderColor: isPlaying ? colors.primary : "transparent",
                      },
                    ]}
                  >
                    <Pressable onPress={() => playVoice(item.sentence, key)}>
                      <RenderFurigana
                        text={item.sentence}
                        relatedKanji={block.relatedKanji}
                        textColor={colors.text}
                        furiganaColor={colors.primary}
                      />
                    </Pressable>

                    {showMeanings && (
                      <Text
                        style={[
                          styles.meaningText,
                          { color: colors.text + "70" },
                        ]}
                      >
                        {item.meaning}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FOOTER */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Pressable
          style={[
            styles.completeBtn,
            { backgroundColor: isCompleted ? colors.error : colors.primary },
          ]}
          onPress={onComplete}
          disabled={isCompleted}
        >
          <Text style={styles.btnText}>
            {isCompleted ? translations[language].completed : translations[language].mark_as_completed}
          </Text>
          <Ionicons name="checkmark-circle" size={22} color="white" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  toggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00000010",
  },
  scrollContent: { padding: 20 },
  sectionCard: { marginBottom: 30 },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  dialogueRow: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
  },
  rowLeft: { paddingRight: 50 },
  rowRight: { flexDirection: "row-reverse", paddingLeft: 50 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  avatarText: { fontWeight: "bold", fontSize: 14 },
  bubble: {
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  meaningText: {
    marginTop: 8,
    fontSize: 13,
    borderTopWidth: 1,
    borderTopColor: "#00000005",
    paddingTop: 8,
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: "#00000005",
  },
  completeBtn: {
    height: 60,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  btnText: { color: "white", fontWeight: "900", fontSize: 16 },
});
