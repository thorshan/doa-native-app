import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { speakingApi } from "@/api/speakingApi";
import { useTheme } from "@/theme/ThemeProvider";
import RenderFurigana from "../components/RenderFurigana";

const { width } = Dimensions.get("window");

/* --- Animated Wave Visualizer --- */
const AudioVisualizer = ({ color }: { color: string }) => {
  const anim = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1.5,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.5,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [anim]);

  return (
    <View style={styles.waveContainer}>
      {[1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.waveBar,
            {
              backgroundColor: color,
              transform: [{ scaleY: i === 2 ? anim : 0.8 }],
            },
          ]}
        />
      ))}
    </View>
  );
};

const SpeakingDetails = () => {
  const router = useRouter();
  const { speakingId } = useLocalSearchParams<{ speakingId: string }>();
  const { colors } = useTheme();

  const [speaking, setSpeaking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const isAutoPlayingRef = useRef(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<{
    type: "kanji" | "vocab" | "grammar";
    data: any;
  } | null>(null);

  const avatarMap: Record<string, any> = {
    山田一郎: require("@/assets/people/yamada-ichirou.png"),
    佐藤: require("@/assets/people/satou-keiko.png"),
    ミラー: require("@/assets/people/mike-mila.png"),
    サントス: require("@/assets/people/jos-santos.png"),
  };

  const refImageMap: Record<string, any> = {
    初めまして: require("@/assets/images/speaking-1.png"),
    これからお世話になります: require("@/assets/images/speaking-2.png"),
  };

  useEffect(() => {
    const fetchSpeaking = async () => {
      try {
        if (!speakingId) return;
        const res = await speakingApi.getSpeaking(speakingId);
        setSpeaking(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpeaking();
    return () => {
      Speech.stop();
      isAutoPlayingRef.current = false;
    };
  }, [speakingId]);

  const sortedLines = useMemo(() => {
    if (!speaking?.lines) return [];
    return [...speaking.lines].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [speaking]);

  const speakerSides = useMemo(() => {
    const sides: Record<string, "left" | "right"> = {};
    let currentSide: "left" | "right" = "left";
    sortedLines.forEach((line) => {
      const name = line.speaker.nameJa;
      if (!sides[name]) {
        sides[name] = currentSide;
        currentSide = "right";
      }
    });
    return sides;
  }, [sortedLines]);

  const playSequence = (index: number) => {
    if (index >= sortedLines.length || !isAutoPlayingRef.current) {
      setIsAutoPlaying(false);
      isAutoPlayingRef.current = false;
      setPlayingIndex(null);
      return;
    }
    setPlayingIndex(index);
    Speech.speak(sortedLines[index].textJa, {
      language: "ja-JP",
      rate: isSlowMode ? 0.55 : 0.85,
      onDone: () => {
        setTimeout(() => {
          if (isAutoPlayingRef.current) playSequence(index + 1);
        }, 800);
      },
      onError: () => {
        setIsAutoPlaying(false);
        isAutoPlayingRef.current = false;
        setPlayingIndex(null);
      },
    });
  };

  const handleTogglePlayAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isAutoPlayingRef.current) {
      Speech.stop();
      isAutoPlayingRef.current = false;
      setIsAutoPlaying(false);
      setPlayingIndex(null);
    } else {
      Speech.stop();
      isAutoPlayingRef.current = true;
      setIsAutoPlaying(true);
      playSequence(0);
    }
  };

  const handleManualSpeak = (text: string, index: number) => {
    Speech.stop();
    isAutoPlayingRef.current = false;
    setIsAutoPlaying(false);
    setPlayingIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.speak(text, {
      language: "ja-JP",
      rate: isSlowMode ? 0.55 : 0.85,
      onDone: () => setPlayingIndex(null),
    });
  };

  const handleOpenInfo = (type: "kanji" | "vocab" | "grammar", data: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedInfo({ type, data });
    setModalVisible(true);
  };

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <View style={styles.headerTextContainer}>
          <Text
            style={[styles.headerTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {speaking.title}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setIsSlowMode(!isSlowMode)}
            style={[
              styles.actionIcon,
              {
                backgroundColor: isSlowMode ? "#FF950020" : colors.text + "08",
              },
            ]}
          >
            <Ionicons
              name="speedometer-outline"
              size={20}
              color={isSlowMode ? "#FF9500" : colors.text + "60"}
            />
          </Pressable>
          <Pressable
            onPress={handleTogglePlayAll}
            style={[
              styles.actionIcon,
              {
                backgroundColor: isAutoPlaying
                  ? colors.primary
                  : colors.text + "08",
              },
            ]}
          >
            <Ionicons
              name={isAutoPlaying ? "stop" : "play"}
              size={20}
              color={isAutoPlaying ? "white" : colors.text + "60"}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP CARD */}
        <View
          style={[
            styles.topCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.text + "08",
            },
          ]}
        >
          <View
            style={[styles.badge, { backgroundColor: colors.primary + "15" }]}
          >
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              LISTENING & SPEAKING
            </Text>
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {speaking?.title}
          </Text>
          <View style={styles.cardFooter}>
            <Ionicons
              name="chatbubbles-outline"
              size={16}
              color={colors.text + "40"}
            />
            <Text style={[styles.cardSub, { color: colors.text + "40" }]}>
              {sortedLines.length} Dialogue Lines
            </Text>
          </View>
        </View>

        {/* IMAGE MAP */}
        {speaking?.title && refImageMap[speaking.title] && (
          <View style={styles.referenceSection}>
            <View
              style={[
                styles.imageCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.text + "08",
                },
              ]}
            >
              <Image
                source={refImageMap[speaking.title]}
                style={styles.fullRefImage}
                resizeMode="cover"
              />
            </View>
          </View>
        )}

        {/* CHAT */}
        <View style={styles.chatContainer}>
          {sortedLines.map((line: any, index: number) => {
            const speakerName = line.speaker.nameJa;
            const isLeft = speakerSides[speakerName] === "left";
            const isPlaying = playingIndex === index;

            return (
              <View
                key={index}
                style={[
                  styles.messageRow,
                  { flexDirection: isLeft ? "row" : "row-reverse" },
                ]}
              >
                <View style={styles.avatarWrapper}>
                  <Image
                    source={
                      avatarMap[speakerName] ??
                      require("@/assets/images/default.jpg")
                    }
                    style={styles.avatar}
                  />
                  <Text
                    style={[styles.speakerName, { color: colors.text + "60" }]}
                    numberOfLines={1}
                  >
                    {speakerName.split(" ")[0]}
                  </Text>
                </View>

                <Pressable
                  onPress={() => handleManualSpeak(line.textJa, index)}
                  style={[
                    styles.bubble,
                    isLeft ? styles.leftBubble : styles.rightBubble,
                    {
                      backgroundColor: isLeft ? colors.surface : colors.primary,
                      borderColor: isPlaying
                        ? isLeft
                          ? colors.primary
                          : "white"
                        : isLeft
                        ? colors.text + "10"
                        : "transparent",
                      borderWidth: 2,
                    },
                  ]}
                >
                  <View style={styles.bubbleHeader}>
                    <View style={{ flex: 1 }}>
                      <RenderFurigana
                        text={line.textJa}
                        relatedKanji={speaking.relatedKanji}
                        textColor={isLeft ? colors.text : "white"}
                        furiganaColor={
                          isLeft ? colors.primary : "rgba(255,255,255,0.7)"
                        }
                      />
                    </View>
                    <View style={{ marginLeft: 8, width: 20 }}>
                      {isPlaying ? (
                        <AudioVisualizer
                          color={isLeft ? colors.primary : "white"}
                        />
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.translationContainer}>
                    <View
                      style={[
                        styles.divider,
                        {
                          backgroundColor: isLeft
                            ? colors.text + "08"
                            : "rgba(255,255,255,0.2)",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.textMm,
                        {
                          color: isLeft
                            ? colors.text + "80"
                            : "rgba(255,255,255,0.9)",
                        },
                      ]}
                    >
                      {line.textMn}
                    </Text>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* RELATED CONTENT */}
        <View style={styles.relatedContainer}>
          <View style={styles.separator} />

          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Related Kanji
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {speaking?.relatedKanji?.map((k: any, idx: number) => (
              <Pressable
                key={idx}
                onPress={() => handleOpenInfo("kanji", k)}
                style={[
                  styles.kanjiChip,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.text + "10",
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 22,
                    fontWeight: "bold",
                  }}
                >
                  {k.character || "字"}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text
            style={[styles.sectionLabel, { color: colors.text, marginTop: 30 }]}
          >
            Vocabulary
          </Text>
          <View style={styles.listContainer}>
            {speaking?.relatedVocabulary?.map((v: any, idx: number) => (
              <Pressable
                key={idx}
                onPress={() => handleOpenInfo("vocab", v)}
                style={[
                  styles.listItem,
                  {
                    backgroundColor: colors.border,
                    borderColor: colors.text + "3A",
                  },
                ]}
              >
                <Ionicons
                  name="book-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={{
                    color: colors.text,
                    marginLeft: 12,
                    fontWeight: "600",
                  }}
                >
                  {v.word || "Word"}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text
            style={[styles.sectionLabel, { color: colors.text, marginTop: 30 }]}
          >
            Related Grammar
          </Text>
          <View style={styles.listContainer}>
            {speaking?.relatedGrammar?.map((g: any, idx: number) => (
              <Pressable
                key={idx}
                onPress={() => handleOpenInfo("grammar", g)}
                style={[
                  styles.listItem,
                  {
                    backgroundColor: colors.border,
                    borderColor: colors.text + "3A",
                  },
                ]}
              >
                <Ionicons
                  name="extension-puzzle-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={{
                    color: colors.text,
                    marginLeft: 12,
                    fontWeight: "600",
                  }}
                >
                  {g.title || "Grammar Point"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* SINGLE CONSOLIDATED MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.modalSub, { color: colors.text }]}>
              {selectedInfo?.type === "kanji" && "KANJI INFORMATION"}
              {selectedInfo?.type === "vocab" && "VOCABULARY"}
              {selectedInfo?.type === "grammar" && "GRAMMAR POINT"}
            </Text>

            {selectedInfo?.type === "kanji" && (
              <View style={{ width: "100%" }}>
                <Text
                  style={[
                    styles.bigChar,
                    { color: colors.primary, textAlign: "center" },
                  ]}
                >
                  {selectedInfo.data.character}
                </Text>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>
                    Onyomi
                  </Text>
                  <Text style={[styles.infoVal, { color: colors.text }]}>
                    {selectedInfo.data.onyomi?.join("・ ")}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>
                    Kunyomi
                  </Text>
                  <Text style={[styles.infoVal, { color: colors.text }]}>
                    {selectedInfo.data.kunyomi?.join("・ ")}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>
                    Meaning
                  </Text>
                  <Text style={[styles.infoVal, { color: colors.text }]}>
                    {selectedInfo.data.meaning?.join("၊ ")}
                  </Text>
                </View>
              </View>
            )}

            {selectedInfo?.type === "vocab" && (
              <View style={{ alignItems: "center" }}>
                <Text
                  style={[
                    styles.bigChar,
                    { color: colors.primary, fontSize: 40 },
                  ]}
                >
                  {selectedInfo?.data.word}
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    textAlign: "center",
                  }}
                >
                  {selectedInfo?.data.meaning}
                </Text>
              </View>
            )}

            {selectedInfo?.type === "grammar" && (
              <View style={{ width: "100%" }}>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: colors.primary,
                      textAlign: "center",
                      fontSize: 22,
                    },
                  ]}
                >
                  {selectedInfo.data.title}
                </Text>

                <View
                  style={[
                    styles.infoRow,
                    { flexDirection: "column", alignItems: "flex-start" },
                  ]}
                >
                  <Text style={[styles.infoLabel, { color: colors.text }]}>
                    Structure
                  </Text>
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: "700",
                      marginTop: 4,
                    }}
                  >
                    {selectedInfo.data.structure}
                  </Text>
                </View>

                <View
                  style={[
                    styles.infoRow,
                    { flexDirection: "column", alignItems: "flex-start" },
                  ]}
                >
                  <Text style={[styles.infoLabel, { color: colors.text }]}>
                    Meaning
                  </Text>
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: "600",
                      marginTop: 4,
                    }}
                  >
                    {selectedInfo.data.meaning}
                  </Text>
                </View>

                <View
                  style={[
                    styles.infoRow,
                    {
                      borderBottomWidth: 0,
                      flexDirection: "column",
                      alignItems: "flex-start",
                    },
                  ]}
                >
                  <Text style={[styles.infoLabel, { color: colors.text }]}>
                    Explanation
                  </Text>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 14,
                      opacity: 0.7,
                      lineHeight: 20,
                      marginTop: 4,
                    }}
                  >
                    {selectedInfo.data.explanation}
                  </Text>
                </View>
              </View>
            )}

            <Pressable
              style={[styles.closeBtn, { backgroundColor: colors.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: colors.inverted, fontWeight: "bold" }}>
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: "800", opacity: 0.6 },
  headerActions: { flexDirection: "row", gap: 10 },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { padding: 20, paddingBottom: 100 },
  topCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 12,
  },
  badgeText: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  cardTitle: {
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 45,
    marginBottom: 12,
  },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardSub: { fontSize: 13, fontWeight: "600" },
  referenceSection: { width: "100%", marginBottom: 30 },
  imageCard: {
    width: "100%",
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    padding: 6,
  },
  fullRefImage: { width: "100%", height: 200, borderRadius: 22 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  chatContainer: { gap: 24, marginBottom: 40 },
  messageRow: { width: "100%", alignItems: "flex-end", gap: 12 },
  avatarWrapper: { alignItems: "center", width: 60 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
  },
  speakerName: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 6,
    textTransform: "uppercase",
  },
  bubble: { maxWidth: width * 0.72, padding: 16, borderRadius: 24 },
  bubbleHeader: { flexDirection: "row", alignItems: "flex-start" },
  leftBubble: { borderBottomLeftRadius: 4 },
  rightBubble: { borderBottomRightRadius: 4 },
  divider: { height: 1, marginVertical: 10 },
  textMm: { fontSize: 15, fontWeight: "500", lineHeight: 26 },
  translationContainer: { width: "100%" },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 20,
  },
  waveBar: { width: 2.5, height: 12, borderRadius: 1.5 },
  relatedContainer: { marginTop: 20 },
  separator: { height: 1, backgroundColor: "#eee", marginBottom: 30 },
  horizontalScroll: { gap: 12 },
  kanjiChip: {
    width: 65,
    height: 65,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: { gap: 10 },
  listItem: {
    padding: 16,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.85,
    padding: 25,
    borderRadius: 32,
    alignItems: "center",
  },
  modalSub: {
    fontSize: 10,
    fontWeight: "900",
    opacity: 0.4,
    letterSpacing: 2,
    marginBottom: 10,
  },
  bigChar: { fontSize: 72, fontWeight: "bold", marginBottom: 20 },
  infoRow: {
    width: "100%",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontWeight: "700",
    color: "#999",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoVal: { fontWeight: "600", fontSize: 14, textAlign: "right", flex: 1 },
  closeBtn: {
    marginTop: 30,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
  },
});

export default SpeakingDetails;
