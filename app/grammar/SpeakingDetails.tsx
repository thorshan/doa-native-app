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
  const [showTranslation, setShowTranslation] = useState(true);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  /* Assets Mapping */
  const avatarMap: Record<string, any> = {
    "ミャ・ミャ": require("@/assets/images/myamya.png"),
    "キョー・キョー": require("@/assets/images/kyawkyaw.png"),
    "エィー・エィー": require("@/assets/images/ayeaye.png"),
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
  }, [speakingId]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const handleSpeak = async (text: string, index: number) => {
    const isAlreadySpeaking = await Speech.isSpeakingAsync();

    if (playingIndex === index && isAlreadySpeaking) {
      Speech.stop();
      setPlayingIndex(null);
      return;
    }

    Speech.stop();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlayingIndex(index);

    Speech.speak(text, {
      language: "ja-JP",
      rate: isSlowMode ? 0.55 : 0.85,
      onDone: () => setPlayingIndex(null),
      onError: () => setPlayingIndex(null),
    });
  };

  const sortedLines = useMemo(() => {
    if (!speaking?.lines) return [];
    return [...speaking.lines].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [speaking]);

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
            {speaking?.title}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              setIsSlowMode(!isSlowMode);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            style={[
              styles.actionIcon,
              {
                backgroundColor: isSlowMode ? "#FF950020" : colors.text + "05",
              },
            ]}
          >
            <Ionicons
              name="speedometer-outline"
              size={20}
              color={isSlowMode ? "#FF9500" : colors.text + "40"}
            />
          </Pressable>

          <Pressable
            onPress={() => {
              setShowTranslation(!showTranslation);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.actionIcon,
              {
                backgroundColor: showTranslation
                  ? colors.primary + "15"
                  : colors.text + "05",
              },
            ]}
          >
            <Ionicons
              name={showTranslation ? "eye" : "eye-off"}
              size={20}
              color={showTranslation ? colors.primary : colors.text + "40"}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CONTEXT CARD */}
        {speaking?.description && (
          <View
            style={[
              styles.descCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.text + "10",
              },
            ]}
          >
            <View style={styles.descBadge}>
              <Text style={styles.descBadgeText}>CONTEXT</Text>
            </View>
            <RenderFurigana
              text={speaking.description}
              relatedKanji={speaking.relatedKanji}
              textColor={colors.text}
              furiganaColor={colors.primary}
            />
          </View>
        )}

        {/* DYNAMIC REFERENCE IMAGE SECTION */}
        {speaking?.title && refImageMap[speaking.title] && (
          <View style={styles.referenceSection}>
            {/* <View
              style={[
                styles.divider,
                { backgroundColor: colors.text + "08", marginVertical: 0 },
              ]}
            /> */}
            <Text
              style={[
                styles.refTitle,
                { color: colors.text + "30", marginBottom: 20 },
              ]}
            >
              SCENE REFERENCE
            </Text>
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

        {/* CHAT BUBBLES */}
        <View style={styles.chatContainer}>
          <Text style={[styles.refTitle, { color: colors.text + "30" }]}>
            CONVERSATION
          </Text>
          {sortedLines.map((line: any, index: number) => {
            const isLeft = index % 2 === 0;
            const isPlaying = playingIndex === index;
            const speakerAvatar =
              avatarMap[line.speaker.nameJa] ??
              require("@/assets/images/default.jpg");

            return (
              <View
                key={line.orderIndex}
                style={[
                  styles.messageRow,
                  { flexDirection: isLeft ? "row" : "row-reverse" },
                ]}
              >
                <View style={styles.avatarWrapper}>
                  <Image source={speakerAvatar} style={styles.avatar} />
                  <Text
                    style={[styles.speakerName, { color: colors.text + "50" }]}
                    numberOfLines={1}
                  >
                    {line.speaker.nameJa.split("・")[0]}
                  </Text>
                </View>

                <Pressable
                  onPress={() => handleSpeak(line.textJa, index)}
                  style={[
                    styles.bubble,
                    isLeft ? styles.leftBubble : styles.rightBubble,
                    {
                      backgroundColor: isLeft ? colors.surface : colors.primary,
                      borderColor: isLeft ? colors.text + "10" : "transparent",
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

                    <View
                      style={{ marginLeft: 8, width: 24, alignItems: "center" }}
                    >
                      {isPlaying ? (
                        <AudioVisualizer
                          color={isLeft ? colors.primary : "white"}
                        />
                      ) : (
                        <Ionicons
                          name="volume-medium-outline"
                          size={18}
                          color={
                            isLeft
                              ? colors.text + "15"
                              : "rgba(255,255,255,0.4)"
                          }
                        />
                      )}
                    </View>
                  </View>

                  {showTranslation && (
                    <View style={styles.translationContainer}>
                      <View
                        style={[
                          styles.divider,
                          {
                            backgroundColor: isLeft
                              ? colors.text + "10"
                              : "rgba(255,255,255,0.2)",
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.textMm,
                          {
                            color: isLeft
                              ? colors.text + "60"
                              : "rgba(255,255,255,0.8)",
                          },
                        ]}
                      >
                        {line.textMn}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerActions: { flexDirection: "row", gap: 8 },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { padding: 20, paddingBottom: 80 },
  descCard: { padding: 16, borderRadius: 20, marginBottom: 30, borderWidth: 1 },
  descBadge: {
    backgroundColor: "#FF9500",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 10,
  },
  descBadgeText: { color: "white", fontSize: 10, fontWeight: "900" },
  chatContainer: { gap: 28 },
  messageRow: { width: "100%", alignItems: "flex-end", gap: 10 },
  avatarWrapper: { alignItems: "center", width: 55 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5f5f5",
  },
  speakerName: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 6,
    textTransform: "uppercase",
  },
  bubble: {
    maxWidth: width * 0.75,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 1,
  },
  bubbleHeader: { flexDirection: "row", alignItems: "center" },
  leftBubble: { borderBottomLeftRadius: 4 },
  rightBubble: { borderBottomRightRadius: 4 },
  divider: { height: 1, marginVertical: 12 },
  textMm: { fontSize: 16, fontWeight: "500", lineHeight: 32 },
  translationContainer: { width: "100%" },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 20,
  },
  waveBar: { width: 2.5, height: 12, borderRadius: 1.5 },
  /* Reference Image Styles */
  referenceSection: { width: "100%", marginVertical: 20 },
  refTitle: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
  },
  imageCard: {
    width: "100%",
    borderRadius: 30,
    borderWidth: 1,
    overflow: "hidden",
    padding: 8,
  },
  fullRefImage: {
    width: "100%",
    height: 250,
    borderRadius: 20,
    mixBlendMode: "normal",
    objectFit: "cover",
  },
});

export default SpeakingDetails;
