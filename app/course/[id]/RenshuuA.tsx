import { progressApi } from "@/api/progressApi";
import { renshuuAApi } from "@/api/renshuuAApi";
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
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RenshuuA() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useAuth(); 
  const { language } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const levelTag = user?.level?.current?.code || "N5";

        // RENEWED FETCH: Using getCourseProgress for nested structure
        const [res, progressRes] = await Promise.all([
          renshuuAApi.getPatternsByChapter(id as string),
          progressApi.getCourseProgress(levelTag),
        ]);

        if (res.data.data) {
          setContent(
            Array.isArray(res.data.data) ? res.data.data : [res.data.data]
          );
        }

        // FIXED: Find chapter in nested progress array
        const allChapters = progressRes?.data?.data?.completedChapter || [];
        const specificProgress = allChapters.find(
          (ch: any) => ch.chapterId.toString() === id
        );

        if (specificProgress?.completedSection?.renshuuA === true) {
          setIsCompleted(true);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    return () => Speech.stop();
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

  const openModal = (type: string, data: any) => {
    Haptics.selectionAsync();
    setSelectedInfo({ type, data });
    setModalVisible(true);
  };

  const onComplete = async () => {
    if (isCompleted) return;
    try {
      const levelTag = user?.level?.current?.code || "N5";
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // FIXED: Sending levelTag, id, and moduleKey
      await progressApi.updateModuleStatus(levelTag, id as string, "renshuuA");

      setIsCompleted(true);
      setTimeout(() => router.back(), 500);
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
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {translations[language].renshuua}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {content.map((c: any, sectionIdx: number) => (
          <View key={sectionIdx} style={{ marginBottom: 30 }}>
            {/* PATTERNS */}
            <View style={styles.patternSection}>
              {c?.patterns?.map((item: any, pIdx: number) => {
                const currentKey = `pattern-${sectionIdx}-${pIdx}`;
                const isPlaying = speakingId === currentKey;

                return (
                  <View
                    key={pIdx}
                    style={[
                      styles.patternCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isPlaying
                          ? colors.primary
                          : colors.text + "0A",
                      },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.idxBadge}>
                        <Text style={styles.idxText}>{pIdx + 1}</Text>
                      </View>
                      <Text
                        style={[styles.meaning, { color: colors.text + "60" }]}
                      >
                        {item.meaning}
                      </Text>
                      <Pressable
                        onPress={() => playSound(item.structure, currentKey)}
                        style={[
                          styles.miniSpeaker,
                          {
                            backgroundColor: isPlaying
                              ? colors.primary
                              : colors.background,
                          },
                        ]}
                      >
                        <Ionicons
                          name="volume-medium"
                          size={18}
                          color={isPlaying ? "white" : colors.primary}
                        />
                      </Pressable>
                    </View>

                    <RenderFurigana
                      text={item.structure}
                      relatedKanji={c.relatedKanji}
                      textColor={colors.text}
                      furiganaColor={colors.primary}
                    />
                  </View>
                );
              })}
            </View>

            {/* RELATED KANJI */}
            {c?.relatedKanji?.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {translations[language].related_kanji}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                >
                  {c.relatedKanji.map((k: any, i: number) => (
                    <Pressable
                      key={i}
                      onPress={() => openModal("kanji", k)}
                      style={[
                        styles.kanjiCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.text + "1A",
                        },
                      ]}
                    >
                      <Text
                        style={[styles.kanjiChar, { color: colors.primary }]}
                      >
                        {k.character}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* RELATED VOCABULARY */}
            {c?.relatedVocab?.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {translations[language].related_kanji}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10 }}
                >
                  {c.relatedVocab.map((v: any, i: number) => (
                    <Pressable
                      key={i}
                      onPress={() => openModal("vocab", v)}
                      style={[
                        styles.vocabChip,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.primary + "30",
                        },
                      ]}
                    >
                      <Text
                        style={[styles.vocabText, { color: colors.primary }]}
                      >
                        {v.word}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FOOTER */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Pressable
          style={[
            styles.mainCompleteBtn,
            { backgroundColor: isCompleted ? colors.error : colors.primary },
          ]}
          onPress={onComplete}
          disabled={isCompleted}
        >
          <Text style={styles.completeText}>
            {isCompleted ? translations[language].completed : translations[language].mark_as_completed}
          </Text>
          <Ionicons
            name={isCompleted ? "checkmark-circle" : "checkmark-done"}
            size={20}
            color="white"
          />
        </Pressable>
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTypeLabel, { color: colors.text }]}>
              {selectedInfo?.type.toUpperCase()}
            </Text>

            {selectedInfo?.type === "kanji" && (
              <View style={{ width: "100%", alignItems: "center" }}>
                <Text style={[styles.modalBigTitle, { color: colors.primary }]}>
                  {selectedInfo.data.character}
                </Text>
                <View style={styles.infoBox}>
                  <View style={styles.infoLine}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>
                      {translations[language].onyomi}
                    </Text>
                    <Text style={[styles.infoVal, { color: colors.text }]}>
                      {selectedInfo.data.onyomi?.join("、") || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.infoLine}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>
                      {translations[language].kunyomi}
                    </Text>
                    <Text style={[styles.infoVal, { color: colors.text }]}>
                      {selectedInfo.data.kunyomi?.join("、") || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.infoLine}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>
                      {translations[language].meaning}
                    </Text>
                    <Text style={[styles.infoVal, { color: colors.text }]}>
                      {selectedInfo.data.meaning?.join(", ") || "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {selectedInfo?.type === "vocab" && (
              <View style={{ width: "100%", alignItems: "center" }}>
                <Text
                  style={[
                    styles.modalBigTitle,
                    { color: colors.primary, fontSize: 48 },
                  ]}
                >
                  {selectedInfo.data.word}
                </Text>
                <View style={styles.infoBox}>
                  <View style={styles.infoLine}>
                    <Text style={styles.infoLabel}>{translations[language].reading}</Text>
                    <Text style={[styles.infoVal, { color: colors.text }]}>
                      {selectedInfo.data.reading || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.infoLine}>
                    <Text style={styles.infoLabel}>{translations[language].meaning}</Text>
                    <Text style={[styles.infoVal, { color: colors.text }]}>
                      {selectedInfo.data.meaning || "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <Pressable
              style={[
                styles.closeModalBtn,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalText}>{translations[language].close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { padding: 20 },
  patternSection: { gap: 16 },
  patternCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  idxBadge: {
    backgroundColor: "#047e4b20",
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  idxText: { color: "#047e4b", fontWeight: "900", fontSize: 14 },
  meaning: { flex: 1, fontSize: 13, fontWeight: "600" },
  miniSpeaker: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
    opacity: 0.4,
    marginBottom: 15,
    letterSpacing: 1,
  },
  kanjiCard: {
    width: 90,
    height: 100,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  kanjiChar: { fontSize: 42, fontWeight: "bold" },
  vocabChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  vocabText: { fontSize: 15, fontWeight: "700" },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: "#00000005",
  },
  mainCompleteBtn: {
    width: "100%",
    height: 60,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  completeText: { color: "white", fontWeight: "900", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    padding: 30,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: "center",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#00000010",
    borderRadius: 2,
    marginBottom: 20,
  },
  modalTypeLabel: {
    fontSize: 10,
    fontWeight: "900",
    opacity: 0.3,
    marginBottom: 8,
  },
  modalBigTitle: {
    fontSize: 64,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  infoBox: { width: "100%", gap: 12, marginBottom: 20 },
  infoLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#00000005",
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
    opacity: 0.4,
    marginTop: 10,
  },
  infoVal: { fontSize: 14, fontWeight: "700" },
  closeModalBtn: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  closeModalText: { color: "white", fontWeight: "800" },
});
