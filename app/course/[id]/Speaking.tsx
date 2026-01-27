import { chapterApi } from "@/api/chapterApi";
import { progressApi } from "@/api/progressApi";
import RenderFurigana from "@/app/components/RenderFurigana";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useEvent, useEventListener } from "expo"; // Important: use the 'expo' package for events
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
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

const { width } = Dimensions.get("window");

// --- Visualizer Component ---
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
      ]),
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

export default function SpeakingPage() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const isAutoPlayingRef = useRef(false);

  // --- Players ---
  const audioPlayer = useAudioPlayer("");
  const videoUrl = "https://vidplay.io/stream/lXUlsfD21VMuAsedEAu8Ag";
  const videoPlayer = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
  });

  // --- Reactive Events (The Fix) ---
  // These hooks listen to native changes and trigger React state updates
  const { status } = useEvent(videoPlayer, "statusChange", {
    status: videoPlayer.status,
  });
  const { isPlaying } = useEvent(videoPlayer, "playingChange", {
    isPlaying: videoPlayer.playing,
  });

  // Explicit state for Replay UI
  const [isVideoFinished, setIsVideoFinished] = useState(false);

  useEventListener(videoPlayer, "playToEnd", () => {
    setIsVideoFinished(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  });

  // --- Data Loading ---
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const levelTag = user?.level?.current;
        const [chapterRes, progressRes] = await Promise.all([
          chapterApi.getFullChapter(id as string),
          progressApi.getCourseProgress(levelTag),
        ]);
        setChapter(chapterRes.data.data);
        const allChapters = progressRes?.data?.data?.completedChapter || [];
        const specificProgress = allChapters.find(
          (ch: any) => ch.chapterId.toString() === id,
        );
        if (specificProgress?.completedSection?.speaking === true)
          setIsCompleted(true);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, [id]);

  // Audio Sequence Logic
  useEffect(() => {
    const subscription = audioPlayer.addListener(
      "playbackStatusUpdate",
      (status) => {
        if (status.didJustFinish) {
          if (isAutoPlayingRef.current && playingIndex !== null) {
            const nextIndex = playingIndex + 1;
            if (nextIndex < sortedLines.length) {
              setTimeout(() => playAudio(nextIndex, true), 600);
            } else {
              handleStopPlayback();
            }
          } else {
            setPlayingIndex(null);
          }
        }
      },
    );
    return () => subscription.remove();
  }, [playingIndex, chapter]);

  // --- Handlers ---
  const toggleVideoPlayPause = () => {
    if (isVideoFinished) {
      videoPlayer.replay(); // Modern expo-video method
      setIsVideoFinished(false);
      handleStopPlayback();
    } else if (isPlaying) {
      videoPlayer.pause();
    } else {
      handleStopPlayback();
      videoPlayer.play();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const playAudio = (index: number, auto: boolean) => {
    const line = sortedLines[index];
    if (!line?.audioUrl) return;

    videoPlayer.pause();
    setPlayingIndex(index);
    audioPlayer.replace({ uri: line.audioUrl });
    audioPlayer.playbackRate = isSlowMode ? 0.6 : 0.95;
    audioPlayer.play();
  };

  const handleStopPlayback = () => {
    audioPlayer.pause();
    isAutoPlayingRef.current = false;
    setIsAutoPlaying(false);
    setPlayingIndex(null);
  };

  const handleTogglePlayAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isAutoPlayingRef.current) {
      handleStopPlayback();
    } else {
      isAutoPlayingRef.current = true;
      setIsAutoPlaying(true);
      playAudio(0, true);
    }
  };

  const speakingSection = chapter?.speaking[0];
  const sortedLines = useMemo(() => {
    if (!speakingSection?.lines) return [];
    return [...speakingSection.lines].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );
  }, [speakingSection]);

  const speakerSides = useMemo(() => {
    const sides: Record<string, "left" | "right"> = {};
    let currentSide: "left" | "right" = "left";
    sortedLines.forEach((line) => {
      const name = line.speaker.nameJa;
      if (!sides[name]) {
        sides[name] = currentSide;
        currentSide = currentSide === "left" ? "right" : "left";
      }
    });
    return sides;
  }, [sortedLines]);

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
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {speakingSection?.title || "Speaking"}
        </Text>
        <Pressable
          onPress={() => setIsSlowMode(!isSlowMode)}
          style={[
            styles.speedBtn,
            { backgroundColor: isSlowMode ? "#FF950020" : colors.text + "08" },
          ]}
        >
          <Ionicons
            name="speedometer-outline"
            size={20}
            color={isSlowMode ? "#FF9500" : colors.text + "40"}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* VIDEO CONTAINER */}
        <View style={styles.imageContainer}>
          <View
            style={[styles.videoWrapper, { backgroundColor: colors.surface }]}
          >
            <VideoView
              player={videoPlayer}
              style={styles.fullRefImage}
              contentFit="cover"
              nativeControls={false}
            />
            {/* Overlay Logic */}
            <Pressable
              onPress={toggleVideoPlayPause}
              style={styles.videoTouchArea}
            >
              {status === "loading" ? (
                <View style={styles.pauseOverlay}>
                  <ActivityIndicator color="white" />
                </View>
              ) : isVideoFinished ? (
                <View style={styles.pauseOverlay}>
                  <Ionicons name="refresh" size={40} color="white" />
                </View>
              ) : !isPlaying ? (
                <View style={styles.pauseOverlay}>
                  <Ionicons name="play" size={40} color="white" />
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        {/* CHAT MESSAGES */}
        <View style={styles.chatContainer}>
          {sortedLines.map((line: any, index: number) => {
            const isLeft = speakerSides[line.speaker.nameJa] === "left";
            const isPlayingBubble = playingIndex === index;
            const avatarMap: Record<string, any> = {
              山田: require("@/assets/people/yamada-ichirou.png"),
              佐藤: require("@/assets/people/satou-keiko.png"),
              ミラー: require("@/assets/people/mike-mila.png"),
              サントス: require("@/assets/people/jos-santos.png"),
            };

            return (
              <View
                key={index}
                style={[
                  styles.messageRow,
                  { flexDirection: isLeft ? "row" : "row-reverse" },
                ]}
              >
                <Image
                  source={
                    avatarMap[line.speaker.nameJa] ??
                    require("@/assets/images/default.jpg")
                  }
                  style={styles.avatar}
                />
                <Pressable
                  onPress={() => {
                    isAutoPlayingRef.current = false;
                    setIsAutoPlaying(false);
                    playAudio(index, false);
                  }}
                  style={[
                    styles.bubble,
                    isLeft ? styles.leftBubble : styles.rightBubble,
                    {
                      backgroundColor: isLeft
                        ? colors.text + "0A"
                        : colors.primary,
                      borderColor: isLeft ? colors.text + "1A" : colors.primary,
                    },
                  ]}
                >
                  <View style={styles.bubbleHeader}>
                    <Text
                      style={[
                        styles.speakerName,
                        {
                          color: isLeft
                            ? colors.primary
                            : "rgba(255,255,255,0.7)",
                        },
                      ]}
                    >
                      {line.speaker.nameJa}
                    </Text>
                    {isPlayingBubble && (
                      <AudioVisualizer
                        color={isLeft ? colors.primary : "white"}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.japaneseText,
                      { color: isLeft ? colors.text : "white" },
                    ]}
                  >
                    <RenderFurigana
                      relatedKanji={speakingSection.relatedKanji}
                      text={line.textJa}
                      textColor={isLeft ? colors.text : "white"}
                    />
                  </Text>
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
                      styles.translationText,
                      {
                        color: isLeft
                          ? colors.text + "60"
                          : "rgba(255,255,255,0.8)",
                      },
                    ]}
                  >
                    {line.textMn}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Pressable
          style={[
            styles.miniPlayBtn,
            {
              backgroundColor: isAutoPlaying
                ? "#FF3B30"
                : colors.primary + "15",
            },
          ]}
          onPress={handleTogglePlayAll}
        >
          <Ionicons
            name={isAutoPlaying ? "stop" : "play"}
            size={22}
            color={isAutoPlaying ? "white" : colors.primary}
          />
        </Pressable>
        <Pressable
          style={[
            styles.mainCompleteBtn,
            { backgroundColor: isCompleted ? colors.error : colors.primary },
          ]}
          onPress={() => setIsCompleted(true)}
        >
          <Text style={styles.completeText}>
            {isCompleted ? "Completed" : "Mark as Done"}
          </Text>
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
    padding: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "900" },
  backBtn: { width: 40 },
  speedBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { padding: 20 },
  imageContainer: { marginBottom: 25 },
  videoWrapper: {
    width: "100%",
    height: 210,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  fullRefImage: { width: "100%", height: "100%" },
  videoTouchArea: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  pauseOverlay: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  chatContainer: { gap: 20, marginBottom: 120 },
  messageRow: { gap: 12, alignItems: "flex-end" },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  bubble: {
    maxWidth: width * 0.7,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  leftBubble: { borderBottomLeftRadius: 4 },
  rightBubble: { borderBottomRightRadius: 4 },
  bubbleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  speakerName: { fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
  japaneseText: { fontSize: 18, fontWeight: "700", lineHeight: 24 },
  divider: { height: 1, marginVertical: 10 },
  translationText: { fontSize: 13, opacity: 0.8 },
  waveContainer: { flexDirection: "row", gap: 2 },
  waveBar: { width: 2, height: 10, borderRadius: 1 },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    paddingBottom: 34,
    flexDirection: "row",
    gap: 12,
  },
  miniPlayBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  mainCompleteBtn: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  completeText: { color: "white", fontWeight: "900", fontSize: 16 },
});
